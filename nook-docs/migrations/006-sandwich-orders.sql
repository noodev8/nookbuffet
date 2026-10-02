-- =====================================================================================
-- MIGRATION 006 - SANDWICHES IN CUSTOMER ORDERS
-- =====================================================================================
-- Customers can now add build-your-own sandwiches to an order, on their own or alongside
-- buffets.
--
--   order_sandwiches        - each sandwich line in an order (quantity, price each, notes)
--   order_sandwich_options  - what was picked for that sandwich, one row per option.
--                             Step/option names and prices are copied in so the order
--                             still reads correctly if the menu changes later.
--
-- Sandwich-only orders can be collected the same day if placed before
-- sandwich_cutoff_time (default 11:00), otherwise from tomorrow.
-- =====================================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.order_sandwiches (
    id serial PRIMARY KEY,
    order_id integer NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric(8,2) NOT NULL,  -- base price + extras, for one sandwich
    subtotal numeric(10,2) NOT NULL,   -- unit_price * quantity
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.order_sandwiches IS 'Build-your-own sandwiches in an order';

CREATE INDEX IF NOT EXISTS order_sandwiches_order_id_idx ON public.order_sandwiches (order_id);

CREATE TABLE IF NOT EXISTS public.order_sandwich_options (
    id serial PRIMARY KEY,
    order_sandwich_id integer NOT NULL REFERENCES public.order_sandwiches(id) ON DELETE CASCADE,
    order_id integer NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    sandwich_option_id integer REFERENCES public.sandwich_options(id),
    step_name character varying(100) NOT NULL,
    option_name character varying(100) NOT NULL,
    extra_price numeric(8,2) NOT NULL DEFAULT 0,
    "position" integer NOT NULL DEFAULT 0  -- order the picks are shown in (by step)
);

COMMENT ON TABLE public.order_sandwich_options IS 'The options picked for a sandwich in an order';

CREATE INDEX IF NOT EXISTS order_sandwich_options_sandwich_idx ON public.order_sandwich_options (order_sandwich_id);

INSERT INTO public.order_config (config_key, config_value, description)
SELECT 'sandwich_cutoff_time', '11:00', 'Order sandwiches before this time to collect them the same day'
WHERE NOT EXISTS (SELECT 1 FROM public.order_config WHERE config_key = 'sandwich_cutoff_time');

COMMIT;
