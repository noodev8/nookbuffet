--
-- PostgreSQL database dump
--

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 17.1

-- Started on 2025-12-09 13:00:34

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
-- TOC entry 228 (class 1259 OID 22784)
-- Name: admin_users; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(150),
    role character varying(50) DEFAULT 'staff'::character varying NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    branch_id integer
);


ALTER TABLE public.admin_users OWNER TO nook_prod_user;

--
-- TOC entry 3588 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN admin_users.role; Type: COMMENT; Schema: public; Owner: nook_prod_user
--

COMMENT ON COLUMN public.admin_users.role IS 'User role: admin, manager, staff';


--
-- TOC entry 227 (class 1259 OID 22783)
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_users_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3589 (class 0 OID 0)
-- Dependencies: 227
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- TOC entry 230 (class 1259 OID 22860)
-- Name: branches; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address text NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    delivery_radius_miles integer DEFAULT 7,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.branches OWNER TO nook_prod_user;

--
-- TOC entry 229 (class 1259 OID 22859)
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branches_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3590 (class 0 OID 0)
-- Dependencies: 229
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- TOC entry 236 (class 1259 OID 22916)
-- Name: buffet_upgrades; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.buffet_upgrades (
    id integer NOT NULL,
    buffet_version_id integer NOT NULL,
    upgrade_id integer NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.buffet_upgrades OWNER TO nook_prod_user;

--
-- TOC entry 235 (class 1259 OID 22915)
-- Name: buffet_upgrades_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.buffet_upgrades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buffet_upgrades_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3591 (class 0 OID 0)
-- Dependencies: 235
-- Name: buffet_upgrades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.buffet_upgrades_id_seq OWNED BY public.buffet_upgrades.id;


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
-- TOC entry 3592 (class 0 OID 0)
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
-- TOC entry 3593 (class 0 OID 0)
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
-- TOC entry 3594 (class 0 OID 0)
-- Dependencies: 219
-- Name: menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;


--
-- TOC entry 244 (class 1259 OID 22987)
-- Name: order_buffet_upgrade_items; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.order_buffet_upgrade_items (
    id integer NOT NULL,
    order_buffet_upgrade_id integer NOT NULL,
    upgrade_item_id integer NOT NULL,
    item_name character varying(100) NOT NULL,
    category_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    order_id integer
);


ALTER TABLE public.order_buffet_upgrade_items OWNER TO nook_prod_user;

--
-- TOC entry 243 (class 1259 OID 22986)
-- Name: order_buffet_upgrade_items_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.order_buffet_upgrade_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_buffet_upgrade_items_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3595 (class 0 OID 0)
-- Dependencies: 243
-- Name: order_buffet_upgrade_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.order_buffet_upgrade_items_id_seq OWNED BY public.order_buffet_upgrade_items.id;


--
-- TOC entry 238 (class 1259 OID 22938)
-- Name: order_buffet_upgrades; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.order_buffet_upgrades (
    id integer NOT NULL,
    order_buffet_id integer NOT NULL,
    upgrade_id integer NOT NULL,
    upgrade_name character varying(100) NOT NULL,
    price_per_person numeric(8,2) NOT NULL,
    num_people integer NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_buffet_upgrades OWNER TO nook_prod_user;

--
-- TOC entry 237 (class 1259 OID 22937)
-- Name: order_buffet_upgrades_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.order_buffet_upgrades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_buffet_upgrades_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3596 (class 0 OID 0)
-- Dependencies: 237
-- Name: order_buffet_upgrades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.order_buffet_upgrades_id_seq OWNED BY public.order_buffet_upgrades.id;


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
-- TOC entry 3597 (class 0 OID 0)
-- Dependencies: 223
-- Name: order_buffets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.order_buffets_id_seq OWNED BY public.order_buffets.id;


--
-- TOC entry 232 (class 1259 OID 22892)
-- Name: order_config; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.order_config (
    id integer NOT NULL,
    config_key character varying(50) NOT NULL,
    config_value character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_config OWNER TO nook_prod_user;

--
-- TOC entry 231 (class 1259 OID 22891)
-- Name: order_config_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.order_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_config_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3598 (class 0 OID 0)
-- Dependencies: 231
-- Name: order_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.order_config_id_seq OWNED BY public.order_config.id;


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
-- TOC entry 3599 (class 0 OID 0)
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
    completed_at timestamp without time zone,
    fulfillment_date date,
    fulfillment_time character varying(10),
    branch_id integer
);


ALTER TABLE public.orders OWNER TO nook_prod_user;

--
-- TOC entry 3600 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN orders.fulfillment_date; Type: COMMENT; Schema: public; Owner: nook_prod_user
--

COMMENT ON COLUMN public.orders.fulfillment_date IS 'The date when the order should be delivered or collected';


--
-- TOC entry 3601 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN orders.fulfillment_time; Type: COMMENT; Schema: public; Owner: nook_prod_user
--

COMMENT ON COLUMN public.orders.fulfillment_time IS 'The time when the order should be delivered or collected (format: HH:MM)';


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
-- TOC entry 3602 (class 0 OID 0)
-- Dependencies: 221
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 240 (class 1259 OID 22952)
-- Name: upgrade_categories; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.upgrade_categories (
    id integer NOT NULL,
    upgrade_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    num_choices integer,
    is_required boolean DEFAULT false,
    "position" integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.upgrade_categories OWNER TO nook_prod_user;

--
-- TOC entry 239 (class 1259 OID 22951)
-- Name: upgrade_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.upgrade_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upgrade_categories_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3603 (class 0 OID 0)
-- Dependencies: 239
-- Name: upgrade_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.upgrade_categories_id_seq OWNED BY public.upgrade_categories.id;


--
-- TOC entry 242 (class 1259 OID 22970)
-- Name: upgrade_items; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.upgrade_items (
    id integer NOT NULL,
    upgrade_category_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.upgrade_items OWNER TO nook_prod_user;

--
-- TOC entry 3604 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE upgrade_items; Type: COMMENT; Schema: public; Owner: nook_prod_user
--

COMMENT ON TABLE public.upgrade_items IS 'Items within upgrade categories';


--
-- TOC entry 241 (class 1259 OID 22969)
-- Name: upgrade_items_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.upgrade_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upgrade_items_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3605 (class 0 OID 0)
-- Dependencies: 241
-- Name: upgrade_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.upgrade_items_id_seq OWNED BY public.upgrade_items.id;


--
-- TOC entry 234 (class 1259 OID 22905)
-- Name: upgrades; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.upgrades (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price_per_person numeric(8,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.upgrades OWNER TO nook_prod_user;

--
-- TOC entry 3606 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE upgrades; Type: COMMENT; Schema: public; Owner: nook_prod_user
--

COMMENT ON TABLE public.upgrades IS 'Available upgrade options that can be added to buffets';


--
-- TOC entry 3607 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN upgrades.name; Type: COMMENT; Schema: public; Owner: nook_prod_user
--

COMMENT ON COLUMN public.upgrades.name IS 'Display name of the upgrade';


--
-- TOC entry 3608 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN upgrades.price_per_person; Type: COMMENT; Schema: public; Owner: nook_prod_user
--

COMMENT ON COLUMN public.upgrades.price_per_person IS 'Additional cost per person for this upgrade';


--
-- TOC entry 233 (class 1259 OID 22904)
-- Name: upgrades_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.upgrades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upgrades_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3609 (class 0 OID 0)
-- Dependencies: 233
-- Name: upgrades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.upgrades_id_seq OWNED BY public.upgrades.id;


--
-- TOC entry 3342 (class 2604 OID 22787)
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- TOC entry 3347 (class 2604 OID 22863)
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- TOC entry 3357 (class 2604 OID 22919)
-- Name: buffet_upgrades id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_upgrades ALTER COLUMN id SET DEFAULT nextval('public.buffet_upgrades_id_seq'::regclass);


--
-- TOC entry 3321 (class 2604 OID 21927)
-- Name: buffet_versions id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_versions ALTER COLUMN id SET DEFAULT nextval('public.buffet_versions_id_seq'::regclass);


--
-- TOC entry 3324 (class 2604 OID 21938)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 3328 (class 2604 OID 21955)
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- TOC entry 3369 (class 2604 OID 22990)
-- Name: order_buffet_upgrade_items id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrade_items ALTER COLUMN id SET DEFAULT nextval('public.order_buffet_upgrade_items_id_seq'::regclass);


--
-- TOC entry 3360 (class 2604 OID 22941)
-- Name: order_buffet_upgrades id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrades ALTER COLUMN id SET DEFAULT nextval('public.order_buffet_upgrades_id_seq'::regclass);


--
-- TOC entry 3337 (class 2604 OID 22499)
-- Name: order_buffets id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets ALTER COLUMN id SET DEFAULT nextval('public.order_buffets_id_seq'::regclass);


--
-- TOC entry 3351 (class 2604 OID 22895)
-- Name: order_config id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_config ALTER COLUMN id SET DEFAULT nextval('public.order_config_id_seq'::regclass);


--
-- TOC entry 3339 (class 2604 OID 22519)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 3332 (class 2604 OID 22484)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 3362 (class 2604 OID 22955)
-- Name: upgrade_categories id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_categories ALTER COLUMN id SET DEFAULT nextval('public.upgrade_categories_id_seq'::regclass);


--
-- TOC entry 3366 (class 2604 OID 22973)
-- Name: upgrade_items id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_items ALTER COLUMN id SET DEFAULT nextval('public.upgrade_items_id_seq'::regclass);


--
-- TOC entry 3354 (class 2604 OID 22908)
-- Name: upgrades id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrades ALTER COLUMN id SET DEFAULT nextval('public.upgrades_id_seq'::regclass);


--
-- TOC entry 3391 (class 2606 OID 22799)
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- TOC entry 3393 (class 2606 OID 22795)
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 3395 (class 2606 OID 22797)
-- Name: admin_users admin_users_username_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_key UNIQUE (username);


--
-- TOC entry 3400 (class 2606 OID 22870)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 3408 (class 2606 OID 22925)
-- Name: buffet_upgrades buffet_upgrades_buffet_version_id_upgrade_id_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_upgrades
    ADD CONSTRAINT buffet_upgrades_buffet_version_id_upgrade_id_key UNIQUE (buffet_version_id, upgrade_id);


--
-- TOC entry 3410 (class 2606 OID 22923)
-- Name: buffet_upgrades buffet_upgrades_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_upgrades
    ADD CONSTRAINT buffet_upgrades_pkey PRIMARY KEY (id);


--
-- TOC entry 3372 (class 2606 OID 21933)
-- Name: buffet_versions buffet_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_versions
    ADD CONSTRAINT buffet_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 3374 (class 2606 OID 21945)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3376 (class 2606 OID 21962)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3424 (class 2606 OID 22993)
-- Name: order_buffet_upgrade_items order_buffet_upgrade_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrade_items
    ADD CONSTRAINT order_buffet_upgrade_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3414 (class 2606 OID 22944)
-- Name: order_buffet_upgrades order_buffet_upgrades_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrades
    ADD CONSTRAINT order_buffet_upgrades_pkey PRIMARY KEY (id);


--
-- TOC entry 3386 (class 2606 OID 22504)
-- Name: order_buffets order_buffets_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets
    ADD CONSTRAINT order_buffets_pkey PRIMARY KEY (id);


--
-- TOC entry 3402 (class 2606 OID 22903)
-- Name: order_config order_config_config_key_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_config
    ADD CONSTRAINT order_config_config_key_key UNIQUE (config_key);


--
-- TOC entry 3404 (class 2606 OID 22901)
-- Name: order_config order_config_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_config
    ADD CONSTRAINT order_config_pkey PRIMARY KEY (id);


--
-- TOC entry 3389 (class 2606 OID 22523)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3381 (class 2606 OID 22494)
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 3383 (class 2606 OID 22492)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3417 (class 2606 OID 22962)
-- Name: upgrade_categories upgrade_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_categories
    ADD CONSTRAINT upgrade_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3420 (class 2606 OID 22979)
-- Name: upgrade_items upgrade_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_items
    ADD CONSTRAINT upgrade_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3406 (class 2606 OID 22914)
-- Name: upgrades upgrades_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrades
    ADD CONSTRAINT upgrades_pkey PRIMARY KEY (id);


--
-- TOC entry 3396 (class 1259 OID 23011)
-- Name: idx_admin_users_branch_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_admin_users_branch_id ON public.admin_users USING btree (branch_id);


--
-- TOC entry 3397 (class 1259 OID 22800)
-- Name: idx_admin_users_email; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_admin_users_email ON public.admin_users USING btree (email);


--
-- TOC entry 3398 (class 1259 OID 22801)
-- Name: idx_admin_users_username; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_admin_users_username ON public.admin_users USING btree (username);


--
-- TOC entry 3411 (class 1259 OID 22936)
-- Name: idx_buffet_upgrades_buffet_version; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_buffet_upgrades_buffet_version ON public.buffet_upgrades USING btree (buffet_version_id);


--
-- TOC entry 3421 (class 1259 OID 23043)
-- Name: idx_order_buffet_upgrade_items_order_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_buffet_upgrade_items_order_id ON public.order_buffet_upgrade_items USING btree (order_id);


--
-- TOC entry 3422 (class 1259 OID 22999)
-- Name: idx_order_buffet_upgrade_items_upgrade; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_buffet_upgrade_items_upgrade ON public.order_buffet_upgrade_items USING btree (order_buffet_upgrade_id);


--
-- TOC entry 3412 (class 1259 OID 22950)
-- Name: idx_order_buffet_upgrades_order_buffet; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_buffet_upgrades_order_buffet ON public.order_buffet_upgrades USING btree (order_buffet_id);


--
-- TOC entry 3384 (class 1259 OID 22536)
-- Name: idx_order_buffets_order_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_buffets_order_id ON public.order_buffets USING btree (order_id);


--
-- TOC entry 3387 (class 1259 OID 22537)
-- Name: idx_order_items_order_buffet_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_items_order_buffet_id ON public.order_items USING btree (order_buffet_id);


--
-- TOC entry 3377 (class 1259 OID 22876)
-- Name: idx_orders_branch_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_orders_branch_id ON public.orders USING btree (branch_id);


--
-- TOC entry 3378 (class 1259 OID 22534)
-- Name: idx_orders_customer_email; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_orders_customer_email ON public.orders USING btree (customer_email);


--
-- TOC entry 3379 (class 1259 OID 22535)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 3415 (class 1259 OID 22968)
-- Name: idx_upgrade_categories_upgrade; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_upgrade_categories_upgrade ON public.upgrade_categories USING btree (upgrade_id);


--
-- TOC entry 3418 (class 1259 OID 22985)
-- Name: idx_upgrade_items_category; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_upgrade_items_category ON public.upgrade_items USING btree (upgrade_category_id);


--
-- TOC entry 3432 (class 2606 OID 23006)
-- Name: admin_users admin_users_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3433 (class 2606 OID 22926)
-- Name: buffet_upgrades buffet_upgrades_buffet_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_upgrades
    ADD CONSTRAINT buffet_upgrades_buffet_version_id_fkey FOREIGN KEY (buffet_version_id) REFERENCES public.buffet_versions(id) ON DELETE CASCADE;


--
-- TOC entry 3434 (class 2606 OID 22931)
-- Name: buffet_upgrades buffet_upgrades_upgrade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_upgrades
    ADD CONSTRAINT buffet_upgrades_upgrade_id_fkey FOREIGN KEY (upgrade_id) REFERENCES public.upgrades(id) ON DELETE CASCADE;


--
-- TOC entry 3425 (class 2606 OID 21946)
-- Name: categories categories_buffet_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_buffet_version_id_fkey FOREIGN KEY (buffet_version_id) REFERENCES public.buffet_versions(id) ON DELETE CASCADE;


--
-- TOC entry 3426 (class 2606 OID 21963)
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- TOC entry 3438 (class 2606 OID 22994)
-- Name: order_buffet_upgrade_items order_buffet_upgrade_items_order_buffet_upgrade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrade_items
    ADD CONSTRAINT order_buffet_upgrade_items_order_buffet_upgrade_id_fkey FOREIGN KEY (order_buffet_upgrade_id) REFERENCES public.order_buffet_upgrades(id) ON DELETE CASCADE;


--
-- TOC entry 3439 (class 2606 OID 23038)
-- Name: order_buffet_upgrade_items order_buffet_upgrade_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrade_items
    ADD CONSTRAINT order_buffet_upgrade_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3435 (class 2606 OID 22945)
-- Name: order_buffet_upgrades order_buffet_upgrades_order_buffet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrades
    ADD CONSTRAINT order_buffet_upgrades_order_buffet_id_fkey FOREIGN KEY (order_buffet_id) REFERENCES public.order_buffets(id) ON DELETE CASCADE;


--
-- TOC entry 3428 (class 2606 OID 22510)
-- Name: order_buffets order_buffets_buffet_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets
    ADD CONSTRAINT order_buffets_buffet_version_id_fkey FOREIGN KEY (buffet_version_id) REFERENCES public.buffet_versions(id);


--
-- TOC entry 3429 (class 2606 OID 22505)
-- Name: order_buffets order_buffets_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets
    ADD CONSTRAINT order_buffets_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3430 (class 2606 OID 22529)
-- Name: order_items order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id);


--
-- TOC entry 3431 (class 2606 OID 22524)
-- Name: order_items order_items_order_buffet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_buffet_id_fkey FOREIGN KEY (order_buffet_id) REFERENCES public.order_buffets(id) ON DELETE CASCADE;


--
-- TOC entry 3427 (class 2606 OID 22871)
-- Name: orders orders_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3436 (class 2606 OID 22963)
-- Name: upgrade_categories upgrade_categories_upgrade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_categories
    ADD CONSTRAINT upgrade_categories_upgrade_id_fkey FOREIGN KEY (upgrade_id) REFERENCES public.upgrades(id) ON DELETE CASCADE;


--
-- TOC entry 3437 (class 2606 OID 22980)
-- Name: upgrade_items upgrade_items_upgrade_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_items
    ADD CONSTRAINT upgrade_items_upgrade_category_id_fkey FOREIGN KEY (upgrade_category_id) REFERENCES public.upgrade_categories(id) ON DELETE CASCADE;


--
-- TOC entry 2109 (class 826 OID 19638)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO nook_prod_user;


--
-- TOC entry 2108 (class 826 OID 19637)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO nook_prod_user;


-- Completed on 2025-12-09 13:00:35

--
-- PostgreSQL database dump complete
--

