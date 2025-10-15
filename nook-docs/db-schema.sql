--
-- PostgreSQL database dump
--

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 17.1

-- Started on 2025-10-15 10:59:30

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
-- TOC entry 3428 (class 0 OID 0)
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
    buffet_version_id integer
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
-- TOC entry 3429 (class 0 OID 0)
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
-- TOC entry 3430 (class 0 OID 0)
-- Dependencies: 219
-- Name: menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;


--
-- TOC entry 3261 (class 2604 OID 21927)
-- Name: buffet_versions id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_versions ALTER COLUMN id SET DEFAULT nextval('public.buffet_versions_id_seq'::regclass);


--
-- TOC entry 3264 (class 2604 OID 21938)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 3268 (class 2604 OID 21955)
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- TOC entry 3273 (class 2606 OID 21933)
-- Name: buffet_versions buffet_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_versions
    ADD CONSTRAINT buffet_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 3275 (class 2606 OID 21945)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3277 (class 2606 OID 21962)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3278 (class 2606 OID 21946)
-- Name: categories categories_buffet_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_buffet_version_id_fkey FOREIGN KEY (buffet_version_id) REFERENCES public.buffet_versions(id) ON DELETE CASCADE;


--
-- TOC entry 3279 (class 2606 OID 21963)
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- TOC entry 2049 (class 826 OID 19638)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO nook_prod_user;


--
-- TOC entry 2048 (class 826 OID 19637)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO nook_prod_user;


-- Completed on 2025-10-15 10:59:32

--
-- PostgreSQL database dump complete
--

