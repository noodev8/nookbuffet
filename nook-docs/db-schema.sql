--
-- PostgreSQL database dump
--

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 17.1

-- Started on 2025-11-20 11:42:23

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: nook_prod_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO nook_prod_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 21924)
-- Name: buffet_versions; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.buffet_versions (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    price_per_person numeric(8,2),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.buffet_versions OWNER TO nook_prod_user;

--
-- TOC entry 215 (class 1259 OID 21923)
-- Name: buffet_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.buffet_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buffet_versions_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3469 (class 0 OID 0)
-- Dependencies: 215
-- Name: buffet_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.buffet_versions_id_seq OWNED BY public.buffet_versions.id;


--
-- TOC entry 218 (class 1259 OID 21935)
-- Name: categories; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_required boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    buffet_version_id integer,
    "position" integer
);


ALTER TABLE public.categories OWNER TO nook_prod_user;

--
-- TOC entry 217 (class 1259 OID 21934)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3470 (class 0 OID 0)
-- Dependencies: 217
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 220 (class 1259 OID 21952)
-- Name: menu_items; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.menu_items (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    is_included_in_base boolean DEFAULT true,
    allergens text,
    dietary_info character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menu_items OWNER TO nook_prod_user;

--
-- TOC entry 219 (class 1259 OID 21951)
-- Name: menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.menu_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_items_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3471 (class 0 OID 0)
-- Dependencies: 219
-- Name: menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;


--
-- TOC entry 224 (class 1259 OID 22496)
-- Name: order_buffets; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.order_buffets (
    id integer NOT NULL,
    order_id integer NOT NULL,
    buffet_version_id integer NOT NULL,
    num_people integer NOT NULL,
    price_per_person numeric(8,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    dietary_info text,
    allergens text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_buffets OWNER TO nook_prod_user;

--
-- TOC entry 223 (class 1259 OID 22495)
-- Name: order_buffets_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.order_buffets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_buffets_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3472 (class 0 OID 0)
-- Dependencies: 223
-- Name: order_buffets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.order_buffets_id_seq OWNED BY public.order_buffets.id;


--
-- TOC entry 226 (class 1259 OID 22516)
-- Name: order_items; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_buffet_id integer NOT NULL,
    menu_item_id integer NOT NULL,
    item_name character varying(150) NOT NULL,
    category_name character varying(100) NOT NULL,
    quantity integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO nook_prod_user;

--
-- TOC entry 225 (class 1259 OID 22515)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3473 (class 0 OID 0)
-- Dependencies: 225
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 222 (class 1259 OID 22481)
-- Name: orders; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number character varying(50) NOT NULL,
    customer_email character varying(255) NOT NULL,
    customer_phone character varying(20),
    fulfillment_type character varying(20) NOT NULL,
    fulfillment_address text,
    total_price numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


ALTER TABLE public.orders OWNER TO nook_prod_user;

--
-- TOC entry 221 (class 1259 OID 22480)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3474 (class 0 OID 0)
-- Dependencies: 221
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 3276 (class 2604 OID 21927)
-- Name: buffet_versions id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_versions ALTER COLUMN id SET DEFAULT nextval('public.buffet_versions_id_seq'::regclass);


--
-- TOC entry 3279 (class 2604 OID 21938)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 3283 (class 2604 OID 21955)
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- TOC entry 3292 (class 2604 OID 22499)
-- Name: order_buffets id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets ALTER COLUMN id SET DEFAULT nextval('public.order_buffets_id_seq'::regclass);


--
-- TOC entry 3294 (class 2604 OID 22519)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 3287 (class 2604 OID 22484)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 3298 (class 2606 OID 21933)
-- Name: buffet_versions buffet_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_versions
    ADD CONSTRAINT buffet_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 3300 (class 2606 OID 21945)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3302 (class 2606 OID 21962)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3311 (class 2606 OID 22504)
-- Name: order_buffets order_buffets_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets
    ADD CONSTRAINT order_buffets_pkey PRIMARY KEY (id);


--
-- TOC entry 3314 (class 2606 OID 22523)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3306 (class 2606 OID 22494)
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 3308 (class 2606 OID 22492)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3309 (class 1259 OID 22536)
-- Name: idx_order_buffets_order_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_buffets_order_id ON public.order_buffets USING btree (order_id);


--
-- TOC entry 3312 (class 1259 OID 22537)
-- Name: idx_order_items_order_buffet_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_items_order_buffet_id ON public.order_items USING btree (order_buffet_id);


--
-- TOC entry 3303 (class 1259 OID 22534)
-- Name: idx_orders_customer_email; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_orders_customer_email ON public.orders USING btree (customer_email);


--
-- TOC entry 3304 (class 1259 OID 22535)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 3315 (class 2606 OID 21946)
-- Name: categories categories_buffet_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_buffet_version_id_fkey FOREIGN KEY (buffet_version_id) REFERENCES public.buffet_versions(id) ON DELETE CASCADE;


--
-- TOC entry 3316 (class 2606 OID 21963)
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- TOC entry 3317 (class 2606 OID 22510)
-- Name: order_buffets order_buffets_buffet_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets
    ADD CONSTRAINT order_buffets_buffet_version_id_fkey FOREIGN KEY (buffet_version_id) REFERENCES public.buffet_versions(id);


--
-- TOC entry 3318 (class 2606 OID 22505)
-- Name: order_buffets order_buffets_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets
    ADD CONSTRAINT order_buffets_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3319 (class 2606 OID 22529)
-- Name: order_items order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id);


--
-- TOC entry 3320 (class 2606 OID 22524)
-- Name: order_items order_items_order_buffet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_buffet_id_fkey FOREIGN KEY (order_buffet_id) REFERENCES public.order_buffets(id) ON DELETE CASCADE;


--
-- TOC entry 2064 (class 826 OID 19638)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO nook_prod_user;


--
-- TOC entry 2063 (class 826 OID 19637)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO nook_prod_user;


-- Completed on 2025-11-20 11:42:26

--
-- PostgreSQL database dump complete
--

