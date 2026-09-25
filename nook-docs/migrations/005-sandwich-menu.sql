-- =====================================================================================
-- MIGRATION 005 - BUILD-YOUR-OWN SANDWICH MENU
-- =====================================================================================
-- Customers will be able to order a single sandwich to collect for lunch, built step by
-- step like Subway: bread, then fillings, then sauce, then toasted or not.
--
--   sandwich_steps   - the steps, in order, each with how many options can be picked
--   sandwich_options - the choices within a step, each with an optional extra price
--
-- The base price of a sandwich and whether sandwiches are offered on the website live in
-- order_config (sandwich_base_price, sandwiches_enabled). Sandwiches start switched off.
--
-- Also adds four starter steps (Bread, Fillings, Sauce, Toasted?) if there are none yet,
-- so staff only need to fill in the options. They can be renamed or deleted in the portal.
-- =====================================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.sandwich_steps (
    id serial PRIMARY KEY,
    name character varying(100) NOT NULL,
    description text,
    min_choices integer NOT NULL DEFAULT 0,  -- 0 = optional
    max_choices integer,                     -- NULL = no limit
    "position" integer NOT NULL DEFAULT 0,
    is_deleted boolean NOT NULL DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.sandwich_steps IS 'Steps of the build-your-own sandwich (bread, fillings, sauce...)';

CREATE TABLE IF NOT EXISTS public.sandwich_options (
    id serial PRIMARY KEY,
    step_id integer NOT NULL REFERENCES public.sandwich_steps(id),
    name character varying(100) NOT NULL,
    description text,
    extra_price numeric(8,2) NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,   -- false = out of stock
    is_deleted boolean NOT NULL DEFAULT false, -- rows are kept so future orders can reference them
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.sandwich_options IS 'Choices within a sandwich step, with any extra cost';

CREATE INDEX IF NOT EXISTS sandwich_options_step_id_idx ON public.sandwich_options (step_id);

INSERT INTO public.order_config (config_key, config_value, description)
SELECT 'sandwich_base_price', '5.00', 'Price of a sandwich before any extras'
WHERE NOT EXISTS (SELECT 1 FROM public.order_config WHERE config_key = 'sandwich_base_price');

INSERT INTO public.order_config (config_key, config_value, description)
SELECT 'sandwiches_enabled', 'false', 'Whether customers can order sandwiches on the website'
WHERE NOT EXISTS (SELECT 1 FROM public.order_config WHERE config_key = 'sandwiches_enabled');

-- Starter steps, only on a fresh install
INSERT INTO public.sandwich_steps (name, min_choices, max_choices, "position")
SELECT * FROM (VALUES
    ('Bread',    1, 1, 0),
    ('Fillings', 1, 3, 1),
    ('Sauce',    0, 2, 2),
    ('Toasted?', 1, 1, 3)
) AS s(name, min_choices, max_choices, "position")
WHERE NOT EXISTS (SELECT 1 FROM public.sandwich_steps);

INSERT INTO public.sandwich_options (step_id, name)
SELECT st.id, o.name
FROM public.sandwich_steps st
CROSS JOIN (VALUES ('Toasted'), ('Not toasted')) AS o(name)
WHERE st.name = 'Toasted?'
  AND NOT EXISTS (SELECT 1 FROM public.sandwich_options);

COMMIT;
