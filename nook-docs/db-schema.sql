--
-- PostgreSQL database dump
--

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 17.1

-- Started on 2026-02-18 12:20:06

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
-- TOC entry 3641 (class 0 OID 0)
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
-- TOC entry 3642 (class 0 OID 0)
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
-- TOC entry 3643 (class 0 OID 0)
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
-- TOC entry 3644 (class 0 OID 0)
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
-- TOC entry 3645 (class 0 OID 0)
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
-- TOC entry 3646 (class 0 OID 0)
-- Dependencies: 217
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 246 (class 1259 OID 24180)
-- Name: customers; Type: TABLE; Schema: public; Owner: nook_prod_user
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(20),
    default_address text,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone
);


ALTER TABLE public.customers OWNER TO nook_prod_user;

--
-- TOC entry 245 (class 1259 OID 24179)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: nook_prod_user
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO nook_prod_user;

--
-- TOC entry 3647 (class 0 OID 0)
-- Dependencies: 245
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


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
-- TOC entry 3648 (class 0 OID 0)
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
-- TOC entry 3649 (class 0 OID 0)
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    order_id integer
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
-- TOC entry 3650 (class 0 OID 0)
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
-- TOC entry 3651 (class 0 OID 0)
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
-- TOC entry 3652 (class 0 OID 0)
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    order_id integer
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
-- TOC entry 3653 (class 0 OID 0)
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
    branch_id integer,
    stripe_payment_intent_id character varying(255),
    customer_id integer
);


ALTER TABLE public.orders OWNER TO nook_prod_user;

--
-- TOC entry 3654 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN orders.fulfillment_date; Type: COMMENT; Schema: public; Owner: nook_prod_user
--

COMMENT ON COLUMN public.orders.fulfillment_date IS 'The date when the order should be delivered or collected';


--
-- TOC entry 3655 (class 0 OID 0)
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
-- TOC entry 3656 (class 0 OID 0)
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
-- TOC entry 3657 (class 0 OID 0)
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
-- TOC entry 3658 (class 0 OID 0)
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
-- TOC entry 3659 (class 0 OID 0)
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
-- TOC entry 3660 (class 0 OID 0)
-- Dependencies: 234
-- Name: TABLE upgrades; Type: COMMENT; Schema: public; Owner: nook_prod_user
--

COMMENT ON TABLE public.upgrades IS 'Available upgrade options that can be added to buffets';


--
-- TOC entry 3661 (class 0 OID 0)
-- Dependencies: 234
-- Name: COLUMN upgrades.name; Type: COMMENT; Schema: public; Owner: nook_prod_user
--

COMMENT ON COLUMN public.upgrades.name IS 'Display name of the upgrade';


--
-- TOC entry 3662 (class 0 OID 0)
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
-- TOC entry 3663 (class 0 OID 0)
-- Dependencies: 233
-- Name: upgrades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nook_prod_user
--

ALTER SEQUENCE public.upgrades_id_seq OWNED BY public.upgrades.id;


--
-- TOC entry 3347 (class 2604 OID 22787)
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- TOC entry 3352 (class 2604 OID 22863)
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- TOC entry 3362 (class 2604 OID 22919)
-- Name: buffet_upgrades id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_upgrades ALTER COLUMN id SET DEFAULT nextval('public.buffet_upgrades_id_seq'::regclass);


--
-- TOC entry 3326 (class 2604 OID 21927)
-- Name: buffet_versions id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_versions ALTER COLUMN id SET DEFAULT nextval('public.buffet_versions_id_seq'::regclass);


--
-- TOC entry 3329 (class 2604 OID 21938)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 3376 (class 2604 OID 24183)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 3333 (class 2604 OID 21955)
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- TOC entry 3374 (class 2604 OID 22990)
-- Name: order_buffet_upgrade_items id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrade_items ALTER COLUMN id SET DEFAULT nextval('public.order_buffet_upgrade_items_id_seq'::regclass);


--
-- TOC entry 3365 (class 2604 OID 22941)
-- Name: order_buffet_upgrades id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrades ALTER COLUMN id SET DEFAULT nextval('public.order_buffet_upgrades_id_seq'::regclass);


--
-- TOC entry 3342 (class 2604 OID 22499)
-- Name: order_buffets id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets ALTER COLUMN id SET DEFAULT nextval('public.order_buffets_id_seq'::regclass);


--
-- TOC entry 3356 (class 2604 OID 22895)
-- Name: order_config id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_config ALTER COLUMN id SET DEFAULT nextval('public.order_config_id_seq'::regclass);


--
-- TOC entry 3344 (class 2604 OID 22519)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 3337 (class 2604 OID 22484)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 3367 (class 2604 OID 22955)
-- Name: upgrade_categories id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_categories ALTER COLUMN id SET DEFAULT nextval('public.upgrade_categories_id_seq'::regclass);


--
-- TOC entry 3371 (class 2604 OID 22973)
-- Name: upgrade_items id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_items ALTER COLUMN id SET DEFAULT nextval('public.upgrade_items_id_seq'::regclass);


--
-- TOC entry 3359 (class 2604 OID 22908)
-- Name: upgrades id; Type: DEFAULT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrades ALTER COLUMN id SET DEFAULT nextval('public.upgrades_id_seq'::regclass);


--
-- TOC entry 3617 (class 0 OID 22784)
-- Dependencies: 228
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.admin_users (id, username, email, password_hash, full_name, role, is_active, created_at, updated_at, last_login, branch_id) FROM stdin;
1	admin	admin@nookbuffet.com	$2b$10$gJw.JhwmcwDg2P.zV0cTqOsAAZTwd/Yb9OgKhhhbc3qw3Cbb.5uM6	Admin	admin	t	2025-11-26 11:08:39.045174	2025-11-26 11:08:39.045174	2025-12-17 11:50:20.716261	3
3	staff	staff@nookbuffet.com	$2b$10$kij7h3XPb8YdPvdSfS/y0OaI1JdO1LqfIXiakkjqhUiL4kUaYe3k6	General Staff	admin	t	2025-11-26 11:08:39.045174	2025-11-26 11:08:39.045174	2026-01-04 14:42:31.063177	1
2	manager	manager@nookbuffet.com	$2b$10$YDayY7Q178j1fLqHAMniQOpzcBhbfjg6v4zNdUciar.WsJcU4GS3y	Manager	manager	t	2025-11-26 11:08:39.045174	2025-11-26 11:08:39.045174	2026-02-18 11:32:58.847319	\N
\.


--
-- TOC entry 3619 (class 0 OID 22860)
-- Dependencies: 230
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.branches (id, name, address, latitude, longitude, delivery_radius_miles, is_active, created_at) FROM stdin;
1	Welshpool	42 High St, Welshpool SY21 7JQ	52.66083091	-3.14948846	7	t	2025-12-02 12:12:39.357246
3	Shrewsbury	29 oakfield drive, sy3	52.70488288	-2.78498265	7	t	2025-12-03 11:55:14.640455
\.


--
-- TOC entry 3625 (class 0 OID 22916)
-- Dependencies: 236
-- Data for Name: buffet_upgrades; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.buffet_upgrades (id, buffet_version_id, upgrade_id, is_active, created_at) FROM stdin;
1	1	1	t	2025-12-04 11:54:33.5949
\.


--
-- TOC entry 3605 (class 0 OID 21924)
-- Dependencies: 216
-- Data for Name: buffet_versions; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.buffet_versions (id, title, description, price_per_person, is_active, created_at) FROM stdin;
1	Standard Buffet	A delicious selection of sandwiches, wraps, and sides for all tastes.	10.90	t	2025-10-14 14:44:35.507556
2	Kids Buffet	A delicious selection of sandwiches, wraps, and sides all kids will love	5.00	t	2025-11-18 20:36:16.709732
\.


--
-- TOC entry 3607 (class 0 OID 21935)
-- Dependencies: 218
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.categories (id, name, description, is_required, is_active, created_at, buffet_version_id, "position") FROM stdin;
1	Sandwiches	Freshly made sandwiches with a variety of fillings.	t	t	2025-10-14 14:44:50.773445	1	1
2	Wraps	Tasty wraps filled with fresh ingredients.	f	t	2025-10-14 14:44:50.773445	1	3
3	Savoury	A selection of savoury snacks and bites.	t	t	2025-10-21 11:55:56.925363	1	4
4	Dips and Sticks	Fresh vegetable sticks with a variety of dips.	t	t	2025-10-21 11:55:56.925363	1	5
5	Fruit	A range of fresh seasonal fruits.	t	t	2025-10-21 11:55:56.925363	1	6
6	Cake	Assorted cakes and sweet treats.	t	t	2025-10-21 11:55:56.925363	1	7
8	Bread	\N	t	t	2025-10-29 12:50:40.437552	1	2
9	Sandwiches	Freshly made sandwiches with a variety of fillings	t	t	2025-11-26 13:01:49.225052	2	1
10	Savoury	Hot and cold savoury items	t	t	2025-11-26 13:01:49.225052	2	2
11	Vegetable Sticks & Dips	Fresh vegetables with dips	t	t	2025-11-26 13:01:49.225052	2	3
12	Biscuits & Cakes	Sweet treats	t	t	2025-11-26 13:01:49.225052	2	4
13	Fruit	Fresh fruit selection	t	t	2025-11-26 13:01:49.225052	2	5
14	Crisps	Crisps and snacks	t	t	2025-11-26 13:01:49.225052	2	6
15	Bread	\N	t	t	2025-10-29 12:50:40.437552	2	2
\.


--
-- TOC entry 3635 (class 0 OID 24180)
-- Dependencies: 246
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.customers (id, email, password_hash, first_name, last_name, phone, default_address, is_active, is_verified, created_at, updated_at, last_login) FROM stdin;
\.


--
-- TOC entry 3609 (class 0 OID 21952)
-- Dependencies: 220
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.menu_items (id, category_id, name, description, is_included_in_base, allergens, dietary_info, is_active, created_at) FROM stdin;
2	1	Tuna Mayo	Tuna with creamy mayonnaise.	t	Fish, Mustard	\N	t	2025-10-14 14:46:30.092569
4	1	Cheese & Onion	Mature cheese with sliced onion.	t	Milk	Vegetarian	t	2025-10-14 14:46:30.092569
52	9	Peanut Butter	\N	t	Peanuts, Gluten	Vegetarian, Contains nuts	t	2025-11-26 13:01:49.225052
1	1	Egg Mayo	Classic egg mayonnaise sandwich.	t	Egg, Mustard	Vegetarian	t	2025-10-14 14:46:30.092569
58	13	Selection of Fruit	Fresh seasonal fruit	t	\N	Vegan, Vegetarian	t	2025-11-26 13:01:49.225052
49	9	Tuna and Sweetcorn	\N	t	Fish, Gluten	Contains fish	t	2025-11-26 13:01:49.225052
53	10	Sausage Rolls	\N	t	Gluten	Contains meat	t	2025-11-26 13:01:49.225052
54	10	Cocktail Sausages	\N	t	\N	Contains meat	t	2025-11-26 13:01:49.225052
55	10	Chicken Nuggets	\N	t	Gluten	Contains meat	t	2025-11-26 13:01:49.225052
56	11	Vegetable Sticks with Selection of Dips	Fresh vegetable sticks with a variety of dips	t	May contain dairy	Vegetarian	t	2025-11-26 13:01:49.225052
57	12	Selection of Chocolate Biscuits and Cakes	Assorted chocolate biscuits and cakes	t	Gluten, Dairy, Eggs	Vegetarian	t	2025-11-26 13:01:49.225052
60	15	White Bread	\N	t	\N	\N	t	2025-10-29 12:51:48.925778
61	15	Brown Bread	\N	t	\N	\N	t	2025-10-29 12:52:11.235734
62	15	White and Brown Bread	\N	t	\N	\N	t	2025-10-29 12:52:11.235734
3	1	Tuna & Sweetcorn	Tuna mixed with sweetcorn and mayo.	t	Fish, Mustard	\N	t	2025-10-14 14:46:30.092569
59	14	Crisps	Selection of crisps	t	May contain gluten	Vegetarian	t	2025-11-26 13:01:49.225052
5	1	Cheese & Pickle	Cheddar cheese with tangy pickle.	t	Milk	Vegetarian	t	2025-10-14 14:46:30.092569
50	9	Ham	\N	t	Gluten	Contains meat	t	2025-11-26 13:01:49.225052
6	1	Ham & Tomato	Sliced ham with fresh tomato.	t	Milk	\N	t	2025-10-14 14:46:30.092569
7	1	Ham Salad	Ham with mixed salad leaves.	t	Milk	\N	t	2025-10-14 14:46:30.092569
51	9	Jam	\N	t	Gluten	Vegetarian	t	2025-11-26 13:01:49.225052
46	9	Egg and Cress	\N	t	Eggs, Gluten	Vegetarian	t	2025-11-26 13:01:49.225052
48	9	Cheese and Ham	\N	t	Dairy, Gluten	Contains meat	t	2025-11-26 13:01:49.225052
47	9	Cheese	\N	t	Dairy, Gluten	Vegetarian	t	2025-11-26 13:01:49.225052
8	1	Beef & Mustard	Roast beef with English mustard.	t	Mustard	\N	t	2025-10-14 14:46:30.092569
12	1	Beef Salad	Roast beef with fresh salad leaves.	t	Mustard	\N	t	2025-10-14 14:46:30.092569
9	1	Coronation Chicken	Curried chicken with creamy mayo.	t	Egg, Mustard	\N	t	2025-10-14 14:46:30.092569
10	1	Tuna & Red Onion	Tuna with red onion and mayo.	t	Fish, Mustard	\N	t	2025-10-14 14:46:30.092569
11	1	Cheese & Cucumber	Cheddar cheese with cucumber.	t	Milk	Vegetarian	t	2025-10-14 14:46:30.092569
13	1	Chicken, Bacon, Spring Onion & Mayo	Chicken and bacon mixed with spring onions and mayo.	t	Egg, Mustard	\N	t	2025-10-14 14:46:30.092569
18	2	BLT Wrap	Bacon, lettuce and tomato wrap.	f	Gluten	\N	t	2025-10-14 14:46:42.873551
15	2	Egg Mayo & Lettuce (Baby Gem) Wrap	Egg mayo with crisp baby gem lettuce.	f	Gluten, Egg, Mustard	Vegetarian	t	2025-10-14 14:46:42.873551
16	2	Tuna & Sweetcorn Wrap	Tuna and sweetcorn with mayo in a wrap.	f	Gluten, Fish, Mustard	\N	t	2025-10-14 14:46:42.873551
17	2	Tuna Mayo & Red Onion Wrap	Tuna with red onion and creamy mayo.	f	Gluten, Fish, Mustard	\N	t	2025-10-14 14:46:42.873551
19	2	Chicken Salad & Sweet Chilli Wrap	Chicken salad with a sweet chilli sauce.	f	Gluten	\N	t	2025-10-14 14:46:42.873551
20	3	Quiche	Assorted quiches with cheese, vegetable, or meat fillings.	t	Gluten, Egg, Milk	Vegetarian	t	2025-10-22 13:32:10.214683
21	3	Pork Pie	Traditional British pork pie.	t	Gluten, Egg	\N	t	2025-10-22 13:32:10.214683
22	3	Sausage Roll	Puff pastry filled with seasoned sausage meat.	t	Gluten, Sulphites	\N	t	2025-10-22 13:32:10.214683
23	3	Scotch Eggs	Boiled eggs wrapped in sausage meat and breadcrumbs.	t	Gluten, Egg	\N	t	2025-10-22 13:32:10.214683
24	3	Mini Sausages	Cocktail sausages served cold.	t	Sulphites	\N	t	2025-10-22 13:32:10.214683
25	3	Bread Sticks	Crispy bread sticks served as a savoury snack.	t	Gluten	Vegan	t	2025-10-22 13:32:10.214683
26	3	Bruschetta	Toasted bread topped with tomato, garlic, and basil.	t	Gluten	Vegan	t	2025-10-22 13:32:10.214683
27	4	Carrot Sticks	Fresh carrot sticks served with dips.	t	\N	Vegan, Gluten-free	t	2025-10-22 13:32:10.214683
28	4	Cucumber Sticks	Fresh cucumber sticks served with dips.	t	\N	Vegan, Gluten-free	t	2025-10-22 13:32:10.214683
29	4	Celery	Crunchy celery sticks for dipping.	t	\N	Vegan, Gluten-free	t	2025-10-22 13:32:10.214683
30	4	Peppers	Sliced bell peppers served with dips.	t	\N	Vegan, Gluten-free	t	2025-10-22 13:32:10.214683
31	4	Tortillas / Crisps	Assorted tortilla chips and crisps.	t	Gluten	Vegan	t	2025-10-22 13:32:10.214683
32	4	Sweet Chilli Dip	A tangy and slightly spicy sweet chilli sauce.	t	Sulphites	Vegan, Gluten-free	t	2025-10-22 13:32:10.214683
33	4	Yoghurt & Mint Dip	Refreshing yoghurt and mint dip.	t	Milk	Vegetarian, Gluten-free	t	2025-10-22 13:32:10.214683
34	4	Mayonnaise	Classic creamy mayonnaise.	t	Egg, Mustard	Vegetarian, Gluten-free	t	2025-10-22 13:32:10.214683
35	5	Blueberries	Fresh blueberries.	t	\N	Vegan, Gluten-free	t	2025-10-22 13:32:10.214683
36	5	Grapes	Mixed red and green grapes.	t	\N	Vegan, Gluten-free	t	2025-10-22 13:32:10.214683
37	5	Watermelon	Sliced watermelon.	t	\N	Vegan, Gluten-free	t	2025-10-22 13:32:10.214683
38	5	Honeydew Melon	Sweet green honeydew melon.	t	\N	Vegan, Gluten-free	t	2025-10-22 13:32:10.214683
39	5	Strawberries	Fresh strawberries.	t	\N	Vegan, Gluten-free	t	2025-10-22 13:32:10.214683
40	5	Pomegranate	Pomegranate seeds.	t	\N	Vegan, Gluten-free	t	2025-10-22 13:32:10.214683
41	6	Selection of Cakes	An assortment of cakes and sweet treats.	t	Gluten, Egg, Milk, may contain Nuts	Vegetarian	t	2025-10-22 13:32:10.214683
43	8	White Bread	\N	t	Gluten	Vegan	t	2025-10-29 12:51:48.925778
44	8	Brown Bread	\N	t	Gluten	Vegan	t	2025-10-29 12:52:11.235734
45	8	White and Brown Bread	\N	t	Gluten	Vegan	t	2025-10-29 12:52:11.235734
14	2	Coronation Chicken & Salad Wrap	Curried chicken with salad in a soft wrap.	f	Gluten, Egg, Mustard	\N	t	2025-10-14 14:46:42.873551
\.


--
-- TOC entry 3633 (class 0 OID 22987)
-- Dependencies: 244
-- Data for Name: order_buffet_upgrade_items; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.order_buffet_upgrade_items (id, order_buffet_upgrade_id, upgrade_item_id, item_name, category_name, created_at, order_id) FROM stdin;
4	1	24	Greek Salad	Salads	2025-12-04 12:02:24.621503	13
3	1	11	Halloumi	Cheeses	2025-12-04 12:02:24.621503	13
2	1	10	Gouda	Cheeses	2025-12-04 12:02:24.621503	13
1	1	9	Cheddar	Cheeses	2025-12-04 12:02:24.621503	13
5	2	7	Brie	Cheeses	2025-12-09 13:10:21.773819	20
6	2	9	Cheddar	Cheeses	2025-12-09 13:10:21.773819	20
7	2	10	Gouda	Cheeses	2025-12-09 13:10:21.773819	20
8	2	24	Greek Salad	Salads	2025-12-09 13:10:21.773819	20
9	3	9	Cheddar	Cheeses	2025-12-17 11:34:04.908711	25
10	3	13	Roule	Cheeses	2025-12-17 11:34:04.908711	25
11	3	11	Halloumi	Cheeses	2025-12-17 11:34:04.908711	25
12	3	24	Greek Salad	Salads	2025-12-17 11:34:04.908711	25
\.


--
-- TOC entry 3627 (class 0 OID 22938)
-- Dependencies: 238
-- Data for Name: order_buffet_upgrades; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.order_buffet_upgrades (id, order_buffet_id, upgrade_id, upgrade_name, price_per_person, num_people, subtotal, created_at, order_id) FROM stdin;
1	15	1	Continental	5.00	100	500.00	2025-12-04 12:02:24.621503	13
2	24	1	Continental	5.00	14	70.00	2025-12-09 13:10:21.773819	20
3	29	1	Continental	5.00	14	70.00	2025-12-17 11:34:04.908711	25
\.


--
-- TOC entry 3613 (class 0 OID 22496)
-- Dependencies: 224
-- Data for Name: order_buffets; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.order_buffets (id, order_id, buffet_version_id, num_people, price_per_person, subtotal, dietary_info, allergens, notes, created_at) FROM stdin;
3	3	1	1	10.90	10.90	\N	\N	\N	2025-11-20 12:41:19.086434
4	3	1	5	10.90	54.50	\N	test	\N	2025-11-20 12:41:19.086434
5	4	1	15	10.90	163.50	\N	\N	\N	2025-11-20 12:42:19.660284
6	5	1	1	10.90	10.90	\N	\N	\N	2025-11-20 12:43:11.482374
7	6	1	50	10.90	545.00	\N	\N	\N	2025-11-20 13:45:22.636128
8	6	1	15	10.90	163.50	\N	\N	\N	2025-11-20 13:45:22.636128
9	7	1	100	10.90	1090.00	\N	\N	\N	2025-12-02 13:29:07.422669
10	8	1	99	10.90	1079.10	\N	\N	\N	2025-12-03 11:39:58.242651
11	9	1	13	10.90	141.70	\N	\N	\N	2025-12-03 11:50:57.70706
12	10	1	14	10.90	152.60	\N	\N	\N	2025-12-03 11:56:03.076636
13	11	1	36	10.90	392.40	\N	\N	\N	2025-12-03 11:59:33.996955
14	12	1	13	10.90	141.70	\N	\N	\N	2025-12-04 10:59:33.166785
15	13	1	100	10.90	1590.00	\N	\N	\N	2025-12-04 12:02:24.621503
16	14	1	15	10.90	163.50	Veg	Nuts	Special Request	2025-12-08 00:02:42.090069
17	15	1	15	10.90	163.50	test diet	test allergen	test special	2025-12-08 00:15:55.759463
18	16	1	14	10.90	152.60	\N	\N	\N	2025-12-09 12:23:30.383636
19	16	1	4	10.90	43.60	\N	\N	\N	2025-12-09 12:23:30.383636
20	17	1	20	10.90	218.00	\N	\N	\N	2025-12-09 13:01:53.917159
21	18	1	23	10.90	250.70	\N	\N	\N	2025-12-09 13:04:37.269753
22	19	1	22	10.90	239.80	\N	\N	\N	2025-12-09 13:06:39.486578
23	19	2	16	5.00	80.00	\N	\N	\N	2025-12-09 13:06:39.486578
24	20	1	14	10.90	222.60	\N	\N	\N	2025-12-09 13:10:21.773819
25	21	2	13	5.00	65.00	\N	\N	\N	2025-12-09 13:16:40.891531
26	22	1	16	10.90	174.40	none diet	no test	special	2025-12-09 14:16:55.663178
27	23	1	5	10.90	54.50	veggie	you are not nuts	request 2	2025-12-09 14:20:01.859432
28	24	2	13	5.00	65.00	\N	\N	\N	2025-12-16 13:12:44.901934
29	25	1	14	10.90	222.60	\N	\N	\N	2025-12-17 11:34:04.908711
30	26	1	40	10.90	436.00	\N	peanuts 	\N	2025-12-30 13:55:53.548694
31	26	2	10	5.00	50.00	\N	\N	\N	2025-12-30 13:55:53.548694
32	27	1	10	10.90	109.00	\N	peanuts 	\N	2026-01-02 18:30:06.085544
33	27	2	50	5.00	250.00	\N	\N	\N	2026-01-02 18:30:06.085544
34	28	1	100	10.90	1090.00	\N	peanuts 	\N	2026-01-04 14:33:13.79064
35	28	2	10	5.00	50.00	\N	\N	\N	2026-01-04 14:33:13.79064
36	29	1	101	10.90	1100.90	\N	peanuts 	\N	2026-01-10 14:05:21.440092
37	29	2	50	5.00	250.00	\N	\N	\N	2026-01-10 14:05:21.440092
38	30	1	300	10.90	3270.00	\N	test	\N	2026-01-10 15:59:07.771655
39	30	2	50	5.00	250.00	\N	\N	\N	2026-01-10 15:59:07.771655
40	31	1	29	10.90	316.10	\N	peanuts	\N	2026-01-12 17:24:39.368016
\.


--
-- TOC entry 3621 (class 0 OID 22892)
-- Dependencies: 232
-- Data for Name: order_config; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.order_config (id, config_key, config_value, description, created_at, updated_at) FROM stdin;
1	daily_cutoff_time	16:00	Orders placed after this time will be scheduled for the day after tomorrow	2025-12-04 10:30:08.331352	2025-12-04 10:30:08.331352
\.


--
-- TOC entry 3615 (class 0 OID 22516)
-- Dependencies: 226
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.order_items (id, order_buffet_id, menu_item_id, item_name, category_name, quantity, created_at, order_id) FROM stdin;
715	20	1	Egg Mayo	Sandwiches	1	2025-12-09 13:01:53.917159	17
716	20	2	Tuna Mayo	Sandwiches	1	2025-12-09 13:01:53.917159	17
717	20	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-09 13:01:53.917159	17
718	20	4	Cheese & Onion	Sandwiches	1	2025-12-09 13:01:53.917159	17
719	20	5	Cheese & Pickle	Sandwiches	1	2025-12-09 13:01:53.917159	17
720	20	6	Ham & Tomato	Sandwiches	1	2025-12-09 13:01:53.917159	17
721	20	7	Ham Salad	Sandwiches	1	2025-12-09 13:01:53.917159	17
722	20	8	Beef & Mustard	Sandwiches	1	2025-12-09 13:01:53.917159	17
723	20	9	Coronation Chicken	Sandwiches	1	2025-12-09 13:01:53.917159	17
724	20	10	Tuna & Red Onion	Sandwiches	1	2025-12-09 13:01:53.917159	17
725	20	11	Cheese & Cucumber	Sandwiches	1	2025-12-09 13:01:53.917159	17
726	20	12	Beef Salad	Sandwiches	1	2025-12-09 13:01:53.917159	17
727	20	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-09 13:01:53.917159	17
728	20	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-09 13:01:53.917159	17
729	20	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-09 13:01:53.917159	17
730	20	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-09 13:01:53.917159	17
731	20	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-09 13:01:53.917159	17
732	20	18	BLT Wrap	Wraps	1	2025-12-09 13:01:53.917159	17
733	20	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-09 13:01:53.917159	17
734	20	20	Quiche	Savoury	1	2025-12-09 13:01:53.917159	17
735	20	21	Pork Pie	Savoury	1	2025-12-09 13:01:53.917159	17
736	20	22	Sausage Roll	Savoury	1	2025-12-09 13:01:53.917159	17
737	20	23	Scotch Eggs	Savoury	1	2025-12-09 13:01:53.917159	17
738	20	24	Mini Sausages	Savoury	1	2025-12-09 13:01:53.917159	17
739	20	25	Bread Sticks	Savoury	1	2025-12-09 13:01:53.917159	17
740	20	26	Bruschetta	Savoury	1	2025-12-09 13:01:53.917159	17
741	20	27	Carrot Sticks	Dips and Sticks	1	2025-12-09 13:01:53.917159	17
742	20	28	Cucumber Sticks	Dips and Sticks	1	2025-12-09 13:01:53.917159	17
743	20	29	Celery	Dips and Sticks	1	2025-12-09 13:01:53.917159	17
744	20	30	Peppers	Dips and Sticks	1	2025-12-09 13:01:53.917159	17
745	20	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-09 13:01:53.917159	17
746	20	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-09 13:01:53.917159	17
747	20	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-09 13:01:53.917159	17
748	20	34	Mayonnaise	Dips and Sticks	1	2025-12-09 13:01:53.917159	17
749	20	35	Blueberries	Fruit	1	2025-12-09 13:01:53.917159	17
750	20	36	Grapes	Fruit	1	2025-12-09 13:01:53.917159	17
751	20	37	Watermelon	Fruit	1	2025-12-09 13:01:53.917159	17
752	20	38	Honeydew Melon	Fruit	1	2025-12-09 13:01:53.917159	17
753	20	39	Strawberries	Fruit	1	2025-12-09 13:01:53.917159	17
754	20	40	Pomegranate	Fruit	1	2025-12-09 13:01:53.917159	17
755	20	41	Selection of Cakes	Cake	1	2025-12-09 13:01:53.917159	17
756	20	45	White and Brown Bread	Bread	1	2025-12-09 13:01:53.917159	17
1189	35	55	Chicken Nuggets	Savoury	1	2026-01-04 14:33:13.79064	28
1190	35	56	Vegetable Sticks with Selection of Dips	Vegetable Sticks & Dips	1	2026-01-04 14:33:13.79064	28
1191	35	57	Selection of Chocolate Biscuits and Cakes	Biscuits & Cakes	1	2026-01-04 14:33:13.79064	28
1192	35	58	Selection of Fruit	Fruit	1	2026-01-04 14:33:13.79064	28
1193	35	59	Crisps	Crisps	1	2026-01-04 14:33:13.79064	28
1194	35	62	White and Brown Bread	Bread	1	2026-01-04 14:33:13.79064	28
1274	38	45	White and Brown Bread	Bread	1	2026-01-10 15:59:07.771655	30
1275	39	46	Egg and Cress	Sandwiches	1	2026-01-10 15:59:07.771655	30
1276	39	47	Cheese	Sandwiches	1	2026-01-10 15:59:07.771655	30
1277	39	48	Cheese and Ham	Sandwiches	1	2026-01-10 15:59:07.771655	30
1278	39	49	Tuna and Sweetcorn	Sandwiches	1	2026-01-10 15:59:07.771655	30
1279	39	50	Ham	Sandwiches	1	2026-01-10 15:59:07.771655	30
1280	39	51	Jam	Sandwiches	1	2026-01-10 15:59:07.771655	30
1281	39	52	Peanut Butter	Sandwiches	1	2026-01-10 15:59:07.771655	30
1282	39	53	Sausage Rolls	Savoury	1	2026-01-10 15:59:07.771655	30
1283	39	54	Cocktail Sausages	Savoury	1	2026-01-10 15:59:07.771655	30
1284	39	55	Chicken Nuggets	Savoury	1	2026-01-10 15:59:07.771655	30
1285	39	56	Vegetable Sticks with Selection of Dips	Vegetable Sticks & Dips	1	2026-01-10 15:59:07.771655	30
1286	39	57	Selection of Chocolate Biscuits and Cakes	Biscuits & Cakes	1	2026-01-10 15:59:07.771655	30
1287	39	58	Selection of Fruit	Fruit	1	2026-01-10 15:59:07.771655	30
1288	39	59	Crisps	Crisps	1	2026-01-10 15:59:07.771655	30
1289	39	62	White and Brown Bread	Bread	1	2026-01-10 15:59:07.771655	30
1317	40	35	Blueberries	Fruit	1	2026-01-12 17:24:39.368016	31
1318	40	36	Grapes	Fruit	1	2026-01-12 17:24:39.368016	31
1319	40	37	Watermelon	Fruit	1	2026-01-12 17:24:39.368016	31
1320	40	38	Honeydew Melon	Fruit	1	2026-01-12 17:24:39.368016	31
1321	40	39	Strawberries	Fruit	1	2026-01-12 17:24:39.368016	31
1322	40	40	Pomegranate	Fruit	1	2026-01-12 17:24:39.368016	31
1323	40	41	Selection of Cakes	Cake	1	2026-01-12 17:24:39.368016	31
1324	40	45	White and Brown Bread	Bread	1	2026-01-12 17:24:39.368016	31
757	21	1	Egg Mayo	Sandwiches	1	2025-12-09 13:04:37.269753	18
758	21	2	Tuna Mayo	Sandwiches	1	2025-12-09 13:04:37.269753	18
759	21	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-09 13:04:37.269753	18
760	21	4	Cheese & Onion	Sandwiches	1	2025-12-09 13:04:37.269753	18
761	21	5	Cheese & Pickle	Sandwiches	1	2025-12-09 13:04:37.269753	18
762	21	6	Ham & Tomato	Sandwiches	1	2025-12-09 13:04:37.269753	18
763	21	7	Ham Salad	Sandwiches	1	2025-12-09 13:04:37.269753	18
764	21	8	Beef & Mustard	Sandwiches	1	2025-12-09 13:04:37.269753	18
765	21	9	Coronation Chicken	Sandwiches	1	2025-12-09 13:04:37.269753	18
766	21	10	Tuna & Red Onion	Sandwiches	1	2025-12-09 13:04:37.269753	18
767	21	11	Cheese & Cucumber	Sandwiches	1	2025-12-09 13:04:37.269753	18
768	21	12	Beef Salad	Sandwiches	1	2025-12-09 13:04:37.269753	18
769	21	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-09 13:04:37.269753	18
770	21	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-09 13:04:37.269753	18
771	21	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-09 13:04:37.269753	18
772	21	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-09 13:04:37.269753	18
773	21	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-09 13:04:37.269753	18
774	21	18	BLT Wrap	Wraps	1	2025-12-09 13:04:37.269753	18
775	21	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-09 13:04:37.269753	18
776	21	20	Quiche	Savoury	1	2025-12-09 13:04:37.269753	18
777	21	21	Pork Pie	Savoury	1	2025-12-09 13:04:37.269753	18
778	21	22	Sausage Roll	Savoury	1	2025-12-09 13:04:37.269753	18
779	21	23	Scotch Eggs	Savoury	1	2025-12-09 13:04:37.269753	18
780	21	24	Mini Sausages	Savoury	1	2025-12-09 13:04:37.269753	18
781	21	25	Bread Sticks	Savoury	1	2025-12-09 13:04:37.269753	18
782	21	26	Bruschetta	Savoury	1	2025-12-09 13:04:37.269753	18
783	21	27	Carrot Sticks	Dips and Sticks	1	2025-12-09 13:04:37.269753	18
784	21	28	Cucumber Sticks	Dips and Sticks	1	2025-12-09 13:04:37.269753	18
785	21	29	Celery	Dips and Sticks	1	2025-12-09 13:04:37.269753	18
786	21	30	Peppers	Dips and Sticks	1	2025-12-09 13:04:37.269753	18
787	21	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-09 13:04:37.269753	18
788	21	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-09 13:04:37.269753	18
789	21	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-09 13:04:37.269753	18
790	21	34	Mayonnaise	Dips and Sticks	1	2025-12-09 13:04:37.269753	18
791	21	35	Blueberries	Fruit	1	2025-12-09 13:04:37.269753	18
792	21	36	Grapes	Fruit	1	2025-12-09 13:04:37.269753	18
793	21	37	Watermelon	Fruit	1	2025-12-09 13:04:37.269753	18
794	21	38	Honeydew Melon	Fruit	1	2025-12-09 13:04:37.269753	18
795	21	39	Strawberries	Fruit	1	2025-12-09 13:04:37.269753	18
796	21	40	Pomegranate	Fruit	1	2025-12-09 13:04:37.269753	18
797	21	41	Selection of Cakes	Cake	1	2025-12-09 13:04:37.269753	18
798	21	45	White and Brown Bread	Bread	1	2025-12-09 13:04:37.269753	18
979	28	46	Egg and Cress	Sandwiches	1	2025-12-16 13:12:44.901934	24
980	28	47	Cheese	Sandwiches	1	2025-12-16 13:12:44.901934	24
981	28	48	Cheese and Ham	Sandwiches	1	2025-12-16 13:12:44.901934	24
982	28	49	Tuna and Sweetcorn	Sandwiches	1	2025-12-16 13:12:44.901934	24
983	28	50	Ham	Sandwiches	1	2025-12-16 13:12:44.901934	24
984	28	51	Jam	Sandwiches	1	2025-12-16 13:12:44.901934	24
985	28	52	Peanut Butter	Sandwiches	1	2025-12-16 13:12:44.901934	24
986	28	53	Sausage Rolls	Savoury	1	2025-12-16 13:12:44.901934	24
987	28	54	Cocktail Sausages	Savoury	1	2025-12-16 13:12:44.901934	24
988	28	55	Chicken Nuggets	Savoury	1	2025-12-16 13:12:44.901934	24
989	28	56	Vegetable Sticks with Selection of Dips	Vegetable Sticks & Dips	1	2025-12-16 13:12:44.901934	24
990	28	57	Selection of Chocolate Biscuits and Cakes	Biscuits & Cakes	1	2025-12-16 13:12:44.901934	24
991	28	58	Selection of Fruit	Fruit	1	2025-12-16 13:12:44.901934	24
992	28	59	Crisps	Crisps	1	2025-12-16 13:12:44.901934	24
993	28	62	White and Brown Bread	Bread	1	2025-12-16 13:12:44.901934	24
1195	36	1	Egg Mayo	Sandwiches	1	2026-01-10 14:05:21.440092	29
1196	36	3	Tuna & Sweetcorn	Sandwiches	1	2026-01-10 14:05:21.440092	29
1197	36	4	Cheese & Onion	Sandwiches	1	2026-01-10 14:05:21.440092	29
1198	36	5	Cheese & Pickle	Sandwiches	1	2026-01-10 14:05:21.440092	29
1199	36	6	Ham & Tomato	Sandwiches	1	2026-01-10 14:05:21.440092	29
1200	36	8	Beef & Mustard	Sandwiches	1	2026-01-10 14:05:21.440092	29
1201	36	9	Coronation Chicken	Sandwiches	1	2026-01-10 14:05:21.440092	29
1202	36	10	Tuna & Red Onion	Sandwiches	1	2026-01-10 14:05:21.440092	29
1203	36	11	Cheese & Cucumber	Sandwiches	1	2026-01-10 14:05:21.440092	29
1204	36	12	Beef Salad	Sandwiches	1	2026-01-10 14:05:21.440092	29
1205	36	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2026-01-10 14:05:21.440092	29
1206	36	20	Quiche	Savoury	1	2026-01-10 14:05:21.440092	29
1207	36	21	Pork Pie	Savoury	1	2026-01-10 14:05:21.440092	29
1208	36	22	Sausage Roll	Savoury	1	2026-01-10 14:05:21.440092	29
1209	36	23	Scotch Eggs	Savoury	1	2026-01-10 14:05:21.440092	29
1210	36	24	Mini Sausages	Savoury	1	2026-01-10 14:05:21.440092	29
1211	36	25	Bread Sticks	Savoury	1	2026-01-10 14:05:21.440092	29
1212	36	26	Bruschetta	Savoury	1	2026-01-10 14:05:21.440092	29
1213	36	27	Carrot Sticks	Dips and Sticks	1	2026-01-10 14:05:21.440092	29
1214	36	28	Cucumber Sticks	Dips and Sticks	1	2026-01-10 14:05:21.440092	29
1215	36	29	Celery	Dips and Sticks	1	2026-01-10 14:05:21.440092	29
1216	36	30	Peppers	Dips and Sticks	1	2026-01-10 14:05:21.440092	29
1217	36	31	Tortillas / Crisps	Dips and Sticks	1	2026-01-10 14:05:21.440092	29
1218	36	32	Sweet Chilli Dip	Dips and Sticks	1	2026-01-10 14:05:21.440092	29
1219	36	33	Yoghurt & Mint Dip	Dips and Sticks	1	2026-01-10 14:05:21.440092	29
1220	36	34	Mayonnaise	Dips and Sticks	1	2026-01-10 14:05:21.440092	29
1221	36	35	Blueberries	Fruit	1	2026-01-10 14:05:21.440092	29
1222	36	36	Grapes	Fruit	1	2026-01-10 14:05:21.440092	29
1223	36	37	Watermelon	Fruit	1	2026-01-10 14:05:21.440092	29
1224	36	38	Honeydew Melon	Fruit	1	2026-01-10 14:05:21.440092	29
1225	36	39	Strawberries	Fruit	1	2026-01-10 14:05:21.440092	29
1226	36	40	Pomegranate	Fruit	1	2026-01-10 14:05:21.440092	29
1227	36	41	Selection of Cakes	Cake	1	2026-01-10 14:05:21.440092	29
1228	36	45	White and Brown Bread	Bread	1	2026-01-10 14:05:21.440092	29
799	22	1	Egg Mayo	Sandwiches	1	2025-12-09 13:06:39.486578	19
800	22	2	Tuna Mayo	Sandwiches	1	2025-12-09 13:06:39.486578	19
801	22	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-09 13:06:39.486578	19
802	22	4	Cheese & Onion	Sandwiches	1	2025-12-09 13:06:39.486578	19
803	22	5	Cheese & Pickle	Sandwiches	1	2025-12-09 13:06:39.486578	19
804	22	6	Ham & Tomato	Sandwiches	1	2025-12-09 13:06:39.486578	19
805	22	7	Ham Salad	Sandwiches	1	2025-12-09 13:06:39.486578	19
806	22	8	Beef & Mustard	Sandwiches	1	2025-12-09 13:06:39.486578	19
807	22	9	Coronation Chicken	Sandwiches	1	2025-12-09 13:06:39.486578	19
808	22	10	Tuna & Red Onion	Sandwiches	1	2025-12-09 13:06:39.486578	19
809	22	11	Cheese & Cucumber	Sandwiches	1	2025-12-09 13:06:39.486578	19
810	22	12	Beef Salad	Sandwiches	1	2025-12-09 13:06:39.486578	19
811	22	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-09 13:06:39.486578	19
812	22	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-09 13:06:39.486578	19
813	22	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-09 13:06:39.486578	19
814	22	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-09 13:06:39.486578	19
815	22	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-09 13:06:39.486578	19
816	22	18	BLT Wrap	Wraps	1	2025-12-09 13:06:39.486578	19
817	22	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-09 13:06:39.486578	19
818	22	20	Quiche	Savoury	1	2025-12-09 13:06:39.486578	19
819	22	21	Pork Pie	Savoury	1	2025-12-09 13:06:39.486578	19
820	22	22	Sausage Roll	Savoury	1	2025-12-09 13:06:39.486578	19
821	22	23	Scotch Eggs	Savoury	1	2025-12-09 13:06:39.486578	19
822	22	24	Mini Sausages	Savoury	1	2025-12-09 13:06:39.486578	19
823	22	25	Bread Sticks	Savoury	1	2025-12-09 13:06:39.486578	19
824	22	26	Bruschetta	Savoury	1	2025-12-09 13:06:39.486578	19
825	22	27	Carrot Sticks	Dips and Sticks	1	2025-12-09 13:06:39.486578	19
826	22	28	Cucumber Sticks	Dips and Sticks	1	2025-12-09 13:06:39.486578	19
827	22	29	Celery	Dips and Sticks	1	2025-12-09 13:06:39.486578	19
828	22	30	Peppers	Dips and Sticks	1	2025-12-09 13:06:39.486578	19
829	22	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-09 13:06:39.486578	19
830	22	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-09 13:06:39.486578	19
831	22	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-09 13:06:39.486578	19
832	22	34	Mayonnaise	Dips and Sticks	1	2025-12-09 13:06:39.486578	19
833	22	35	Blueberries	Fruit	1	2025-12-09 13:06:39.486578	19
834	22	36	Grapes	Fruit	1	2025-12-09 13:06:39.486578	19
835	22	37	Watermelon	Fruit	1	2025-12-09 13:06:39.486578	19
836	22	38	Honeydew Melon	Fruit	1	2025-12-09 13:06:39.486578	19
837	22	39	Strawberries	Fruit	1	2025-12-09 13:06:39.486578	19
838	22	40	Pomegranate	Fruit	1	2025-12-09 13:06:39.486578	19
839	22	41	Selection of Cakes	Cake	1	2025-12-09 13:06:39.486578	19
840	22	45	White and Brown Bread	Bread	1	2025-12-09 13:06:39.486578	19
841	23	46	Egg and Cress	Sandwiches	1	2025-12-09 13:06:39.486578	19
842	23	47	Cheese	Sandwiches	1	2025-12-09 13:06:39.486578	19
843	23	48	Cheese and Ham	Sandwiches	1	2025-12-09 13:06:39.486578	19
844	23	49	Tuna and Sweetcorn	Sandwiches	1	2025-12-09 13:06:39.486578	19
845	23	50	Ham	Sandwiches	1	2025-12-09 13:06:39.486578	19
846	23	51	Jam	Sandwiches	1	2025-12-09 13:06:39.486578	19
847	23	52	Peanut Butter	Sandwiches	1	2025-12-09 13:06:39.486578	19
848	23	53	Sausage Rolls	Savoury	1	2025-12-09 13:06:39.486578	19
849	23	54	Cocktail Sausages	Savoury	1	2025-12-09 13:06:39.486578	19
850	23	55	Chicken Nuggets	Savoury	1	2025-12-09 13:06:39.486578	19
851	23	56	Vegetable Sticks with Selection of Dips	Vegetable Sticks & Dips	1	2025-12-09 13:06:39.486578	19
852	23	57	Selection of Chocolate Biscuits and Cakes	Biscuits & Cakes	1	2025-12-09 13:06:39.486578	19
853	23	58	Selection of Fruit	Fruit	1	2025-12-09 13:06:39.486578	19
854	23	59	Crisps	Crisps	1	2025-12-09 13:06:39.486578	19
855	23	62	White and Brown Bread	Bread	1	2025-12-09 13:06:39.486578	19
994	29	1	Egg Mayo	Sandwiches	1	2025-12-17 11:34:04.908711	25
995	29	2	Tuna Mayo	Sandwiches	1	2025-12-17 11:34:04.908711	25
996	29	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-17 11:34:04.908711	25
997	29	4	Cheese & Onion	Sandwiches	1	2025-12-17 11:34:04.908711	25
998	29	5	Cheese & Pickle	Sandwiches	1	2025-12-17 11:34:04.908711	25
999	29	6	Ham & Tomato	Sandwiches	1	2025-12-17 11:34:04.908711	25
1000	29	7	Ham Salad	Sandwiches	1	2025-12-17 11:34:04.908711	25
1001	29	8	Beef & Mustard	Sandwiches	1	2025-12-17 11:34:04.908711	25
1002	29	9	Coronation Chicken	Sandwiches	1	2025-12-17 11:34:04.908711	25
1003	29	10	Tuna & Red Onion	Sandwiches	1	2025-12-17 11:34:04.908711	25
1004	29	11	Cheese & Cucumber	Sandwiches	1	2025-12-17 11:34:04.908711	25
1005	29	12	Beef Salad	Sandwiches	1	2025-12-17 11:34:04.908711	25
1006	29	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-17 11:34:04.908711	25
1007	29	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-17 11:34:04.908711	25
1008	29	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-17 11:34:04.908711	25
1009	29	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-17 11:34:04.908711	25
1010	29	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-17 11:34:04.908711	25
1011	29	18	BLT Wrap	Wraps	1	2025-12-17 11:34:04.908711	25
1012	29	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-17 11:34:04.908711	25
1013	29	20	Quiche	Savoury	1	2025-12-17 11:34:04.908711	25
1014	29	21	Pork Pie	Savoury	1	2025-12-17 11:34:04.908711	25
1015	29	22	Sausage Roll	Savoury	1	2025-12-17 11:34:04.908711	25
1016	29	23	Scotch Eggs	Savoury	1	2025-12-17 11:34:04.908711	25
1017	29	24	Mini Sausages	Savoury	1	2025-12-17 11:34:04.908711	25
1018	29	25	Bread Sticks	Savoury	1	2025-12-17 11:34:04.908711	25
1019	29	26	Bruschetta	Savoury	1	2025-12-17 11:34:04.908711	25
1020	29	27	Carrot Sticks	Dips and Sticks	1	2025-12-17 11:34:04.908711	25
1021	29	28	Cucumber Sticks	Dips and Sticks	1	2025-12-17 11:34:04.908711	25
1022	29	29	Celery	Dips and Sticks	1	2025-12-17 11:34:04.908711	25
1023	29	30	Peppers	Dips and Sticks	1	2025-12-17 11:34:04.908711	25
1024	29	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-17 11:34:04.908711	25
1025	29	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-17 11:34:04.908711	25
1026	29	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-17 11:34:04.908711	25
856	24	1	Egg Mayo	Sandwiches	1	2025-12-09 13:10:21.773819	20
857	24	2	Tuna Mayo	Sandwiches	1	2025-12-09 13:10:21.773819	20
858	24	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-09 13:10:21.773819	20
859	24	4	Cheese & Onion	Sandwiches	1	2025-12-09 13:10:21.773819	20
860	24	5	Cheese & Pickle	Sandwiches	1	2025-12-09 13:10:21.773819	20
861	24	6	Ham & Tomato	Sandwiches	1	2025-12-09 13:10:21.773819	20
862	24	7	Ham Salad	Sandwiches	1	2025-12-09 13:10:21.773819	20
863	24	8	Beef & Mustard	Sandwiches	1	2025-12-09 13:10:21.773819	20
864	24	9	Coronation Chicken	Sandwiches	1	2025-12-09 13:10:21.773819	20
865	24	10	Tuna & Red Onion	Sandwiches	1	2025-12-09 13:10:21.773819	20
866	24	11	Cheese & Cucumber	Sandwiches	1	2025-12-09 13:10:21.773819	20
867	24	12	Beef Salad	Sandwiches	1	2025-12-09 13:10:21.773819	20
868	24	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-09 13:10:21.773819	20
869	24	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-09 13:10:21.773819	20
870	24	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-09 13:10:21.773819	20
871	24	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-09 13:10:21.773819	20
872	24	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-09 13:10:21.773819	20
873	24	18	BLT Wrap	Wraps	1	2025-12-09 13:10:21.773819	20
874	24	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-09 13:10:21.773819	20
875	24	20	Quiche	Savoury	1	2025-12-09 13:10:21.773819	20
876	24	21	Pork Pie	Savoury	1	2025-12-09 13:10:21.773819	20
877	24	22	Sausage Roll	Savoury	1	2025-12-09 13:10:21.773819	20
878	24	23	Scotch Eggs	Savoury	1	2025-12-09 13:10:21.773819	20
879	24	24	Mini Sausages	Savoury	1	2025-12-09 13:10:21.773819	20
880	24	25	Bread Sticks	Savoury	1	2025-12-09 13:10:21.773819	20
881	24	26	Bruschetta	Savoury	1	2025-12-09 13:10:21.773819	20
882	24	27	Carrot Sticks	Dips and Sticks	1	2025-12-09 13:10:21.773819	20
883	24	28	Cucumber Sticks	Dips and Sticks	1	2025-12-09 13:10:21.773819	20
884	24	29	Celery	Dips and Sticks	1	2025-12-09 13:10:21.773819	20
885	24	30	Peppers	Dips and Sticks	1	2025-12-09 13:10:21.773819	20
886	24	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-09 13:10:21.773819	20
887	24	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-09 13:10:21.773819	20
888	24	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-09 13:10:21.773819	20
889	24	34	Mayonnaise	Dips and Sticks	1	2025-12-09 13:10:21.773819	20
890	24	35	Blueberries	Fruit	1	2025-12-09 13:10:21.773819	20
891	24	36	Grapes	Fruit	1	2025-12-09 13:10:21.773819	20
892	24	37	Watermelon	Fruit	1	2025-12-09 13:10:21.773819	20
893	24	38	Honeydew Melon	Fruit	1	2025-12-09 13:10:21.773819	20
894	24	39	Strawberries	Fruit	1	2025-12-09 13:10:21.773819	20
895	24	40	Pomegranate	Fruit	1	2025-12-09 13:10:21.773819	20
896	24	41	Selection of Cakes	Cake	1	2025-12-09 13:10:21.773819	20
897	24	45	White and Brown Bread	Bread	1	2025-12-09 13:10:21.773819	20
1027	29	34	Mayonnaise	Dips and Sticks	1	2025-12-17 11:34:04.908711	25
1028	29	35	Blueberries	Fruit	1	2025-12-17 11:34:04.908711	25
1029	29	36	Grapes	Fruit	1	2025-12-17 11:34:04.908711	25
1030	29	37	Watermelon	Fruit	1	2025-12-17 11:34:04.908711	25
1031	29	38	Honeydew Melon	Fruit	1	2025-12-17 11:34:04.908711	25
1032	29	39	Strawberries	Fruit	1	2025-12-17 11:34:04.908711	25
1033	29	40	Pomegranate	Fruit	1	2025-12-17 11:34:04.908711	25
1034	29	41	Selection of Cakes	Cake	1	2025-12-17 11:34:04.908711	25
1035	29	45	White and Brown Bread	Bread	1	2025-12-17 11:34:04.908711	25
1229	37	46	Egg and Cress	Sandwiches	1	2026-01-10 14:05:21.440092	29
1230	37	47	Cheese	Sandwiches	1	2026-01-10 14:05:21.440092	29
1231	37	48	Cheese and Ham	Sandwiches	1	2026-01-10 14:05:21.440092	29
1232	37	49	Tuna and Sweetcorn	Sandwiches	1	2026-01-10 14:05:21.440092	29
1233	37	50	Ham	Sandwiches	1	2026-01-10 14:05:21.440092	29
1234	37	53	Sausage Rolls	Savoury	1	2026-01-10 14:05:21.440092	29
1235	37	54	Cocktail Sausages	Savoury	1	2026-01-10 14:05:21.440092	29
1236	37	55	Chicken Nuggets	Savoury	1	2026-01-10 14:05:21.440092	29
1237	37	56	Vegetable Sticks with Selection of Dips	Vegetable Sticks & Dips	1	2026-01-10 14:05:21.440092	29
1238	37	57	Selection of Chocolate Biscuits and Cakes	Biscuits & Cakes	1	2026-01-10 14:05:21.440092	29
1239	37	58	Selection of Fruit	Fruit	1	2026-01-10 14:05:21.440092	29
1240	37	59	Crisps	Crisps	1	2026-01-10 14:05:21.440092	29
1241	37	62	White and Brown Bread	Bread	1	2026-01-10 14:05:21.440092	29
1290	40	1	Egg Mayo	Sandwiches	1	2026-01-12 17:24:39.368016	31
1291	40	3	Tuna & Sweetcorn	Sandwiches	1	2026-01-12 17:24:39.368016	31
1292	40	4	Cheese & Onion	Sandwiches	1	2026-01-12 17:24:39.368016	31
1293	40	5	Cheese & Pickle	Sandwiches	1	2026-01-12 17:24:39.368016	31
1294	40	6	Ham & Tomato	Sandwiches	1	2026-01-12 17:24:39.368016	31
1295	40	8	Beef & Mustard	Sandwiches	1	2026-01-12 17:24:39.368016	31
1296	40	9	Coronation Chicken	Sandwiches	1	2026-01-12 17:24:39.368016	31
1297	40	10	Tuna & Red Onion	Sandwiches	1	2026-01-12 17:24:39.368016	31
1298	40	11	Cheese & Cucumber	Sandwiches	1	2026-01-12 17:24:39.368016	31
1299	40	12	Beef Salad	Sandwiches	1	2026-01-12 17:24:39.368016	31
1300	40	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2026-01-12 17:24:39.368016	31
1301	40	14	Coronation Chicken & Salad Wrap	Wraps	1	2026-01-12 17:24:39.368016	31
1302	40	20	Quiche	Savoury	1	2026-01-12 17:24:39.368016	31
1303	40	21	Pork Pie	Savoury	1	2026-01-12 17:24:39.368016	31
1304	40	22	Sausage Roll	Savoury	1	2026-01-12 17:24:39.368016	31
1305	40	23	Scotch Eggs	Savoury	1	2026-01-12 17:24:39.368016	31
1306	40	24	Mini Sausages	Savoury	1	2026-01-12 17:24:39.368016	31
1307	40	25	Bread Sticks	Savoury	1	2026-01-12 17:24:39.368016	31
1308	40	26	Bruschetta	Savoury	1	2026-01-12 17:24:39.368016	31
1309	40	27	Carrot Sticks	Dips and Sticks	1	2026-01-12 17:24:39.368016	31
1310	40	28	Cucumber Sticks	Dips and Sticks	1	2026-01-12 17:24:39.368016	31
1311	40	29	Celery	Dips and Sticks	1	2026-01-12 17:24:39.368016	31
1312	40	30	Peppers	Dips and Sticks	1	2026-01-12 17:24:39.368016	31
1313	40	31	Tortillas / Crisps	Dips and Sticks	1	2026-01-12 17:24:39.368016	31
1314	40	32	Sweet Chilli Dip	Dips and Sticks	1	2026-01-12 17:24:39.368016	31
1315	40	33	Yoghurt & Mint Dip	Dips and Sticks	1	2026-01-12 17:24:39.368016	31
1316	40	34	Mayonnaise	Dips and Sticks	1	2026-01-12 17:24:39.368016	31
898	25	46	Egg and Cress	Sandwiches	1	2025-12-09 13:16:40.891531	21
899	25	47	Cheese	Sandwiches	1	2025-12-09 13:16:40.891531	21
900	25	48	Cheese and Ham	Sandwiches	1	2025-12-09 13:16:40.891531	21
901	25	49	Tuna and Sweetcorn	Sandwiches	1	2025-12-09 13:16:40.891531	21
902	25	50	Ham	Sandwiches	1	2025-12-09 13:16:40.891531	21
903	25	51	Jam	Sandwiches	1	2025-12-09 13:16:40.891531	21
904	25	52	Peanut Butter	Sandwiches	1	2025-12-09 13:16:40.891531	21
905	25	53	Sausage Rolls	Savoury	1	2025-12-09 13:16:40.891531	21
906	25	54	Cocktail Sausages	Savoury	1	2025-12-09 13:16:40.891531	21
907	25	55	Chicken Nuggets	Savoury	1	2025-12-09 13:16:40.891531	21
908	25	56	Vegetable Sticks with Selection of Dips	Vegetable Sticks & Dips	1	2025-12-09 13:16:40.891531	21
909	25	57	Selection of Chocolate Biscuits and Cakes	Biscuits & Cakes	1	2025-12-09 13:16:40.891531	21
910	25	58	Selection of Fruit	Fruit	1	2025-12-09 13:16:40.891531	21
911	25	59	Crisps	Crisps	1	2025-12-09 13:16:40.891531	21
912	25	62	White and Brown Bread	Bread	1	2025-12-09 13:16:40.891531	21
1036	30	1	Egg Mayo	Sandwiches	1	2025-12-30 13:55:53.548694	26
1037	30	2	Tuna Mayo	Sandwiches	1	2025-12-30 13:55:53.548694	26
1038	30	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-30 13:55:53.548694	26
1039	30	4	Cheese & Onion	Sandwiches	1	2025-12-30 13:55:53.548694	26
1040	30	5	Cheese & Pickle	Sandwiches	1	2025-12-30 13:55:53.548694	26
1041	30	6	Ham & Tomato	Sandwiches	1	2025-12-30 13:55:53.548694	26
1042	30	7	Ham Salad	Sandwiches	1	2025-12-30 13:55:53.548694	26
1043	30	8	Beef & Mustard	Sandwiches	1	2025-12-30 13:55:53.548694	26
1044	30	9	Coronation Chicken	Sandwiches	1	2025-12-30 13:55:53.548694	26
1045	30	10	Tuna & Red Onion	Sandwiches	1	2025-12-30 13:55:53.548694	26
1046	30	11	Cheese & Cucumber	Sandwiches	1	2025-12-30 13:55:53.548694	26
1047	30	12	Beef Salad	Sandwiches	1	2025-12-30 13:55:53.548694	26
1048	30	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-30 13:55:53.548694	26
1049	30	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-30 13:55:53.548694	26
1050	30	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-30 13:55:53.548694	26
1051	30	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-30 13:55:53.548694	26
1052	30	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-30 13:55:53.548694	26
1053	30	18	BLT Wrap	Wraps	1	2025-12-30 13:55:53.548694	26
1054	30	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-30 13:55:53.548694	26
1055	30	20	Quiche	Savoury	1	2025-12-30 13:55:53.548694	26
1056	30	21	Pork Pie	Savoury	1	2025-12-30 13:55:53.548694	26
1057	30	22	Sausage Roll	Savoury	1	2025-12-30 13:55:53.548694	26
1058	30	23	Scotch Eggs	Savoury	1	2025-12-30 13:55:53.548694	26
1059	30	24	Mini Sausages	Savoury	1	2025-12-30 13:55:53.548694	26
1060	30	25	Bread Sticks	Savoury	1	2025-12-30 13:55:53.548694	26
1061	30	26	Bruschetta	Savoury	1	2025-12-30 13:55:53.548694	26
1062	30	27	Carrot Sticks	Dips and Sticks	1	2025-12-30 13:55:53.548694	26
1063	30	28	Cucumber Sticks	Dips and Sticks	1	2025-12-30 13:55:53.548694	26
1064	30	29	Celery	Dips and Sticks	1	2025-12-30 13:55:53.548694	26
1065	30	30	Peppers	Dips and Sticks	1	2025-12-30 13:55:53.548694	26
1066	30	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-30 13:55:53.548694	26
1067	30	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-30 13:55:53.548694	26
1068	30	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-30 13:55:53.548694	26
1069	30	34	Mayonnaise	Dips and Sticks	1	2025-12-30 13:55:53.548694	26
1070	30	35	Blueberries	Fruit	1	2025-12-30 13:55:53.548694	26
1071	30	36	Grapes	Fruit	1	2025-12-30 13:55:53.548694	26
1072	30	37	Watermelon	Fruit	1	2025-12-30 13:55:53.548694	26
1073	30	38	Honeydew Melon	Fruit	1	2025-12-30 13:55:53.548694	26
1074	30	39	Strawberries	Fruit	1	2025-12-30 13:55:53.548694	26
1075	30	40	Pomegranate	Fruit	1	2025-12-30 13:55:53.548694	26
1076	30	41	Selection of Cakes	Cake	1	2025-12-30 13:55:53.548694	26
1077	30	45	White and Brown Bread	Bread	1	2025-12-30 13:55:53.548694	26
1078	31	46	Egg and Cress	Sandwiches	1	2025-12-30 13:55:53.548694	26
1079	31	47	Cheese	Sandwiches	1	2025-12-30 13:55:53.548694	26
1080	31	48	Cheese and Ham	Sandwiches	1	2025-12-30 13:55:53.548694	26
1081	31	49	Tuna and Sweetcorn	Sandwiches	1	2025-12-30 13:55:53.548694	26
1082	31	50	Ham	Sandwiches	1	2025-12-30 13:55:53.548694	26
1083	31	51	Jam	Sandwiches	1	2025-12-30 13:55:53.548694	26
1084	31	52	Peanut Butter	Sandwiches	1	2025-12-30 13:55:53.548694	26
1085	31	53	Sausage Rolls	Savoury	1	2025-12-30 13:55:53.548694	26
1086	31	54	Cocktail Sausages	Savoury	1	2025-12-30 13:55:53.548694	26
1087	31	55	Chicken Nuggets	Savoury	1	2025-12-30 13:55:53.548694	26
1088	31	56	Vegetable Sticks with Selection of Dips	Vegetable Sticks & Dips	1	2025-12-30 13:55:53.548694	26
1089	31	57	Selection of Chocolate Biscuits and Cakes	Biscuits & Cakes	1	2025-12-30 13:55:53.548694	26
1090	31	58	Selection of Fruit	Fruit	1	2025-12-30 13:55:53.548694	26
1091	31	59	Crisps	Crisps	1	2025-12-30 13:55:53.548694	26
1092	31	62	White and Brown Bread	Bread	1	2025-12-30 13:55:53.548694	26
1242	38	1	Egg Mayo	Sandwiches	1	2026-01-10 15:59:07.771655	30
1243	38	2	Tuna Mayo	Sandwiches	1	2026-01-10 15:59:07.771655	30
1244	38	3	Tuna & Sweetcorn	Sandwiches	1	2026-01-10 15:59:07.771655	30
1245	38	4	Cheese & Onion	Sandwiches	1	2026-01-10 15:59:07.771655	30
1246	38	5	Cheese & Pickle	Sandwiches	1	2026-01-10 15:59:07.771655	30
1247	38	6	Ham & Tomato	Sandwiches	1	2026-01-10 15:59:07.771655	30
1248	38	7	Ham Salad	Sandwiches	1	2026-01-10 15:59:07.771655	30
1249	38	8	Beef & Mustard	Sandwiches	1	2026-01-10 15:59:07.771655	30
1250	38	9	Coronation Chicken	Sandwiches	1	2026-01-10 15:59:07.771655	30
1251	38	10	Tuna & Red Onion	Sandwiches	1	2026-01-10 15:59:07.771655	30
1252	38	11	Cheese & Cucumber	Sandwiches	1	2026-01-10 15:59:07.771655	30
1253	38	12	Beef Salad	Sandwiches	1	2026-01-10 15:59:07.771655	30
1254	38	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2026-01-10 15:59:07.771655	30
1255	38	20	Quiche	Savoury	1	2026-01-10 15:59:07.771655	30
1256	38	21	Pork Pie	Savoury	1	2026-01-10 15:59:07.771655	30
1257	38	23	Scotch Eggs	Savoury	1	2026-01-10 15:59:07.771655	30
1258	38	24	Mini Sausages	Savoury	1	2026-01-10 15:59:07.771655	30
1259	38	25	Bread Sticks	Savoury	1	2026-01-10 15:59:07.771655	30
1260	38	26	Bruschetta	Savoury	1	2026-01-10 15:59:07.771655	30
913	26	1	Egg Mayo	Sandwiches	1	2025-12-09 14:16:55.663178	22
914	26	2	Tuna Mayo	Sandwiches	1	2025-12-09 14:16:55.663178	22
915	26	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-09 14:16:55.663178	22
916	26	4	Cheese & Onion	Sandwiches	1	2025-12-09 14:16:55.663178	22
917	26	6	Ham & Tomato	Sandwiches	1	2025-12-09 14:16:55.663178	22
918	26	7	Ham Salad	Sandwiches	1	2025-12-09 14:16:55.663178	22
919	26	8	Beef & Mustard	Sandwiches	1	2025-12-09 14:16:55.663178	22
920	26	9	Coronation Chicken	Sandwiches	1	2025-12-09 14:16:55.663178	22
921	26	10	Tuna & Red Onion	Sandwiches	1	2025-12-09 14:16:55.663178	22
922	26	11	Cheese & Cucumber	Sandwiches	1	2025-12-09 14:16:55.663178	22
923	26	12	Beef Salad	Sandwiches	1	2025-12-09 14:16:55.663178	22
924	26	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-09 14:16:55.663178	22
925	26	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-09 14:16:55.663178	22
926	26	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-09 14:16:55.663178	22
927	26	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-09 14:16:55.663178	22
928	26	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-09 14:16:55.663178	22
929	26	18	BLT Wrap	Wraps	1	2025-12-09 14:16:55.663178	22
930	26	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-09 14:16:55.663178	22
931	26	20	Quiche	Savoury	1	2025-12-09 14:16:55.663178	22
932	26	21	Pork Pie	Savoury	1	2025-12-09 14:16:55.663178	22
933	26	22	Sausage Roll	Savoury	1	2025-12-09 14:16:55.663178	22
934	26	23	Scotch Eggs	Savoury	1	2025-12-09 14:16:55.663178	22
935	26	24	Mini Sausages	Savoury	1	2025-12-09 14:16:55.663178	22
936	26	25	Bread Sticks	Savoury	1	2025-12-09 14:16:55.663178	22
937	26	26	Bruschetta	Savoury	1	2025-12-09 14:16:55.663178	22
938	26	27	Carrot Sticks	Dips and Sticks	1	2025-12-09 14:16:55.663178	22
939	26	28	Cucumber Sticks	Dips and Sticks	1	2025-12-09 14:16:55.663178	22
940	26	29	Celery	Dips and Sticks	1	2025-12-09 14:16:55.663178	22
941	26	30	Peppers	Dips and Sticks	1	2025-12-09 14:16:55.663178	22
942	26	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-09 14:16:55.663178	22
943	26	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-09 14:16:55.663178	22
944	26	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-09 14:16:55.663178	22
945	26	34	Mayonnaise	Dips and Sticks	1	2025-12-09 14:16:55.663178	22
946	26	35	Blueberries	Fruit	1	2025-12-09 14:16:55.663178	22
947	26	36	Grapes	Fruit	1	2025-12-09 14:16:55.663178	22
948	26	37	Watermelon	Fruit	1	2025-12-09 14:16:55.663178	22
949	26	38	Honeydew Melon	Fruit	1	2025-12-09 14:16:55.663178	22
950	26	39	Strawberries	Fruit	1	2025-12-09 14:16:55.663178	22
951	26	40	Pomegranate	Fruit	1	2025-12-09 14:16:55.663178	22
952	26	41	Selection of Cakes	Cake	1	2025-12-09 14:16:55.663178	22
953	26	45	White and Brown Bread	Bread	1	2025-12-09 14:16:55.663178	22
954	27	4	Cheese & Onion	Sandwiches	1	2025-12-09 14:20:01.859432	23
955	27	6	Ham & Tomato	Sandwiches	1	2025-12-09 14:20:01.859432	23
956	27	20	Quiche	Savoury	1	2025-12-09 14:20:01.859432	23
957	27	21	Pork Pie	Savoury	1	2025-12-09 14:20:01.859432	23
958	27	22	Sausage Roll	Savoury	1	2025-12-09 14:20:01.859432	23
959	27	23	Scotch Eggs	Savoury	1	2025-12-09 14:20:01.859432	23
960	27	24	Mini Sausages	Savoury	1	2025-12-09 14:20:01.859432	23
961	27	25	Bread Sticks	Savoury	1	2025-12-09 14:20:01.859432	23
962	27	26	Bruschetta	Savoury	1	2025-12-09 14:20:01.859432	23
963	27	27	Carrot Sticks	Dips and Sticks	1	2025-12-09 14:20:01.859432	23
964	27	28	Cucumber Sticks	Dips and Sticks	1	2025-12-09 14:20:01.859432	23
965	27	29	Celery	Dips and Sticks	1	2025-12-09 14:20:01.859432	23
966	27	30	Peppers	Dips and Sticks	1	2025-12-09 14:20:01.859432	23
967	27	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-09 14:20:01.859432	23
968	27	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-09 14:20:01.859432	23
969	27	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-09 14:20:01.859432	23
970	27	34	Mayonnaise	Dips and Sticks	1	2025-12-09 14:20:01.859432	23
971	27	35	Blueberries	Fruit	1	2025-12-09 14:20:01.859432	23
972	27	36	Grapes	Fruit	1	2025-12-09 14:20:01.859432	23
973	27	37	Watermelon	Fruit	1	2025-12-09 14:20:01.859432	23
974	27	38	Honeydew Melon	Fruit	1	2025-12-09 14:20:01.859432	23
975	27	39	Strawberries	Fruit	1	2025-12-09 14:20:01.859432	23
976	27	40	Pomegranate	Fruit	1	2025-12-09 14:20:01.859432	23
977	27	41	Selection of Cakes	Cake	1	2025-12-09 14:20:01.859432	23
978	27	45	White and Brown Bread	Bread	1	2025-12-09 14:20:01.859432	23
1093	32	1	Egg Mayo	Sandwiches	1	2026-01-02 18:30:06.085544	27
1094	32	2	Tuna Mayo	Sandwiches	1	2026-01-02 18:30:06.085544	27
1095	32	6	Ham & Tomato	Sandwiches	1	2026-01-02 18:30:06.085544	27
1096	32	7	Ham Salad	Sandwiches	1	2026-01-02 18:30:06.085544	27
1097	32	8	Beef & Mustard	Sandwiches	1	2026-01-02 18:30:06.085544	27
1098	32	9	Coronation Chicken	Sandwiches	1	2026-01-02 18:30:06.085544	27
1099	32	10	Tuna & Red Onion	Sandwiches	1	2026-01-02 18:30:06.085544	27
1100	32	11	Cheese & Cucumber	Sandwiches	1	2026-01-02 18:30:06.085544	27
1101	32	12	Beef Salad	Sandwiches	1	2026-01-02 18:30:06.085544	27
1102	32	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2026-01-02 18:30:06.085544	27
1103	32	14	Coronation Chicken & Salad Wrap	Wraps	1	2026-01-02 18:30:06.085544	27
1104	32	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2026-01-02 18:30:06.085544	27
1105	32	16	Tuna & Sweetcorn Wrap	Wraps	1	2026-01-02 18:30:06.085544	27
1106	32	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2026-01-02 18:30:06.085544	27
1107	32	18	BLT Wrap	Wraps	1	2026-01-02 18:30:06.085544	27
1108	32	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2026-01-02 18:30:06.085544	27
1109	32	20	Quiche	Savoury	1	2026-01-02 18:30:06.085544	27
1110	32	21	Pork Pie	Savoury	1	2026-01-02 18:30:06.085544	27
1111	32	23	Scotch Eggs	Savoury	1	2026-01-02 18:30:06.085544	27
1112	32	24	Mini Sausages	Savoury	1	2026-01-02 18:30:06.085544	27
1113	32	25	Bread Sticks	Savoury	1	2026-01-02 18:30:06.085544	27
1114	32	26	Bruschetta	Savoury	1	2026-01-02 18:30:06.085544	27
1115	32	27	Carrot Sticks	Dips and Sticks	1	2026-01-02 18:30:06.085544	27
1116	32	28	Cucumber Sticks	Dips and Sticks	1	2026-01-02 18:30:06.085544	27
1117	32	29	Celery	Dips and Sticks	1	2026-01-02 18:30:06.085544	27
1118	32	30	Peppers	Dips and Sticks	1	2026-01-02 18:30:06.085544	27
1119	32	31	Tortillas / Crisps	Dips and Sticks	1	2026-01-02 18:30:06.085544	27
1120	32	32	Sweet Chilli Dip	Dips and Sticks	1	2026-01-02 18:30:06.085544	27
1121	32	33	Yoghurt & Mint Dip	Dips and Sticks	1	2026-01-02 18:30:06.085544	27
1122	32	34	Mayonnaise	Dips and Sticks	1	2026-01-02 18:30:06.085544	27
1123	32	35	Blueberries	Fruit	1	2026-01-02 18:30:06.085544	27
1124	32	36	Grapes	Fruit	1	2026-01-02 18:30:06.085544	27
1125	32	37	Watermelon	Fruit	1	2026-01-02 18:30:06.085544	27
1126	32	38	Honeydew Melon	Fruit	1	2026-01-02 18:30:06.085544	27
1127	32	39	Strawberries	Fruit	1	2026-01-02 18:30:06.085544	27
1128	32	40	Pomegranate	Fruit	1	2026-01-02 18:30:06.085544	27
1129	32	41	Selection of Cakes	Cake	1	2026-01-02 18:30:06.085544	27
1130	32	43	White Bread	Bread	1	2026-01-02 18:30:06.085544	27
1131	33	46	Egg and Cress	Sandwiches	1	2026-01-02 18:30:06.085544	27
1132	33	47	Cheese	Sandwiches	1	2026-01-02 18:30:06.085544	27
1133	33	48	Cheese and Ham	Sandwiches	1	2026-01-02 18:30:06.085544	27
1134	33	49	Tuna and Sweetcorn	Sandwiches	1	2026-01-02 18:30:06.085544	27
1135	33	50	Ham	Sandwiches	1	2026-01-02 18:30:06.085544	27
1136	33	51	Jam	Sandwiches	1	2026-01-02 18:30:06.085544	27
1137	33	52	Peanut Butter	Sandwiches	1	2026-01-02 18:30:06.085544	27
1138	33	53	Sausage Rolls	Savoury	1	2026-01-02 18:30:06.085544	27
1139	33	54	Cocktail Sausages	Savoury	1	2026-01-02 18:30:06.085544	27
1140	33	55	Chicken Nuggets	Savoury	1	2026-01-02 18:30:06.085544	27
1141	33	56	Vegetable Sticks with Selection of Dips	Vegetable Sticks & Dips	1	2026-01-02 18:30:06.085544	27
1142	33	57	Selection of Chocolate Biscuits and Cakes	Biscuits & Cakes	1	2026-01-02 18:30:06.085544	27
1143	33	58	Selection of Fruit	Fruit	1	2026-01-02 18:30:06.085544	27
1144	33	59	Crisps	Crisps	1	2026-01-02 18:30:06.085544	27
1145	33	62	White and Brown Bread	Bread	1	2026-01-02 18:30:06.085544	27
1261	38	28	Cucumber Sticks	Dips and Sticks	1	2026-01-10 15:59:07.771655	30
1262	38	29	Celery	Dips and Sticks	1	2026-01-10 15:59:07.771655	30
1263	38	30	Peppers	Dips and Sticks	1	2026-01-10 15:59:07.771655	30
1264	38	31	Tortillas / Crisps	Dips and Sticks	1	2026-01-10 15:59:07.771655	30
1265	38	33	Yoghurt & Mint Dip	Dips and Sticks	1	2026-01-10 15:59:07.771655	30
1266	38	34	Mayonnaise	Dips and Sticks	1	2026-01-10 15:59:07.771655	30
1267	38	35	Blueberries	Fruit	1	2026-01-10 15:59:07.771655	30
1268	38	36	Grapes	Fruit	1	2026-01-10 15:59:07.771655	30
1269	38	37	Watermelon	Fruit	1	2026-01-10 15:59:07.771655	30
1270	38	38	Honeydew Melon	Fruit	1	2026-01-10 15:59:07.771655	30
1271	38	39	Strawberries	Fruit	1	2026-01-10 15:59:07.771655	30
1272	38	40	Pomegranate	Fruit	1	2026-01-10 15:59:07.771655	30
1273	38	41	Selection of Cakes	Cake	1	2026-01-10 15:59:07.771655	30
65	3	1	Egg Mayo	Sandwiches	1	2025-11-20 12:41:19.086434	3
66	3	20	Quiche	Savoury	1	2025-11-20 12:41:19.086434	3
67	3	21	Pork Pie	Savoury	1	2025-11-20 12:41:19.086434	3
68	3	22	Sausage Roll	Savoury	1	2025-11-20 12:41:19.086434	3
69	3	23	Scotch Eggs	Savoury	1	2025-11-20 12:41:19.086434	3
70	3	24	Mini Sausages	Savoury	1	2025-11-20 12:41:19.086434	3
71	3	25	Bread Sticks	Savoury	1	2025-11-20 12:41:19.086434	3
72	3	26	Bruschetta	Savoury	1	2025-11-20 12:41:19.086434	3
73	3	27	Carrot Sticks	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
74	3	28	Cucumber Sticks	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
75	3	29	Celery	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
76	3	30	Peppers	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
77	3	31	Tortillas / Crisps	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
78	3	32	Sweet Chilli Dip	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
79	3	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
80	3	34	Mayonnaise	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
81	3	35	Blueberries	Fruit	1	2025-11-20 12:41:19.086434	3
82	3	36	Grapes	Fruit	1	2025-11-20 12:41:19.086434	3
83	3	37	Watermelon	Fruit	1	2025-11-20 12:41:19.086434	3
84	3	38	Honeydew Melon	Fruit	1	2025-11-20 12:41:19.086434	3
85	3	39	Strawberries	Fruit	1	2025-11-20 12:41:19.086434	3
86	3	40	Pomegranate	Fruit	1	2025-11-20 12:41:19.086434	3
87	3	41	Selection of Cakes	Cake	1	2025-11-20 12:41:19.086434	3
88	3	43	White Bread	Bread	1	2025-11-20 12:41:19.086434	3
89	4	2	Tuna Mayo	Sandwiches	1	2025-11-20 12:41:19.086434	3
90	4	4	Cheese & Onion	Sandwiches	1	2025-11-20 12:41:19.086434	3
91	4	7	Ham Salad	Sandwiches	1	2025-11-20 12:41:19.086434	3
92	4	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-11-20 12:41:19.086434	3
93	4	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-11-20 12:41:19.086434	3
94	4	20	Quiche	Savoury	1	2025-11-20 12:41:19.086434	3
95	4	21	Pork Pie	Savoury	1	2025-11-20 12:41:19.086434	3
96	4	22	Sausage Roll	Savoury	1	2025-11-20 12:41:19.086434	3
97	4	23	Scotch Eggs	Savoury	1	2025-11-20 12:41:19.086434	3
98	4	24	Mini Sausages	Savoury	1	2025-11-20 12:41:19.086434	3
99	4	25	Bread Sticks	Savoury	1	2025-11-20 12:41:19.086434	3
100	4	26	Bruschetta	Savoury	1	2025-11-20 12:41:19.086434	3
101	4	27	Carrot Sticks	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
102	4	28	Cucumber Sticks	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
103	4	29	Celery	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
104	4	30	Peppers	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
105	4	31	Tortillas / Crisps	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
106	4	32	Sweet Chilli Dip	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
107	4	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
108	4	34	Mayonnaise	Dips and Sticks	1	2025-11-20 12:41:19.086434	3
109	4	35	Blueberries	Fruit	1	2025-11-20 12:41:19.086434	3
110	4	36	Grapes	Fruit	1	2025-11-20 12:41:19.086434	3
111	4	37	Watermelon	Fruit	1	2025-11-20 12:41:19.086434	3
112	4	38	Honeydew Melon	Fruit	1	2025-11-20 12:41:19.086434	3
113	4	39	Strawberries	Fruit	1	2025-11-20 12:41:19.086434	3
114	4	40	Pomegranate	Fruit	1	2025-11-20 12:41:19.086434	3
115	4	41	Selection of Cakes	Cake	1	2025-11-20 12:41:19.086434	3
116	4	45	White and Brown Bread	Bread	1	2025-11-20 12:41:19.086434	3
117	5	1	Egg Mayo	Sandwiches	1	2025-11-20 12:42:19.660284	4
118	5	2	Tuna Mayo	Sandwiches	1	2025-11-20 12:42:19.660284	4
119	5	3	Tuna & Sweetcorn	Sandwiches	1	2025-11-20 12:42:19.660284	4
120	5	4	Cheese & Onion	Sandwiches	1	2025-11-20 12:42:19.660284	4
121	5	5	Cheese & Pickle	Sandwiches	1	2025-11-20 12:42:19.660284	4
122	5	6	Ham & Tomato	Sandwiches	1	2025-11-20 12:42:19.660284	4
123	5	7	Ham Salad	Sandwiches	1	2025-11-20 12:42:19.660284	4
124	5	8	Beef & Mustard	Sandwiches	1	2025-11-20 12:42:19.660284	4
125	5	9	Coronation Chicken	Sandwiches	1	2025-11-20 12:42:19.660284	4
126	5	10	Tuna & Red Onion	Sandwiches	1	2025-11-20 12:42:19.660284	4
127	5	11	Cheese & Cucumber	Sandwiches	1	2025-11-20 12:42:19.660284	4
128	5	12	Beef Salad	Sandwiches	1	2025-11-20 12:42:19.660284	4
129	5	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-11-20 12:42:19.660284	4
130	5	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-11-20 12:42:19.660284	4
131	5	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-11-20 12:42:19.660284	4
132	5	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-11-20 12:42:19.660284	4
133	5	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-11-20 12:42:19.660284	4
134	5	18	BLT Wrap	Wraps	1	2025-11-20 12:42:19.660284	4
135	5	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-11-20 12:42:19.660284	4
136	5	20	Quiche	Savoury	1	2025-11-20 12:42:19.660284	4
137	5	21	Pork Pie	Savoury	1	2025-11-20 12:42:19.660284	4
138	5	22	Sausage Roll	Savoury	1	2025-11-20 12:42:19.660284	4
139	5	23	Scotch Eggs	Savoury	1	2025-11-20 12:42:19.660284	4
140	5	24	Mini Sausages	Savoury	1	2025-11-20 12:42:19.660284	4
141	5	25	Bread Sticks	Savoury	1	2025-11-20 12:42:19.660284	4
142	5	26	Bruschetta	Savoury	1	2025-11-20 12:42:19.660284	4
143	5	27	Carrot Sticks	Dips and Sticks	1	2025-11-20 12:42:19.660284	4
144	5	28	Cucumber Sticks	Dips and Sticks	1	2025-11-20 12:42:19.660284	4
145	5	29	Celery	Dips and Sticks	1	2025-11-20 12:42:19.660284	4
146	5	30	Peppers	Dips and Sticks	1	2025-11-20 12:42:19.660284	4
147	5	31	Tortillas / Crisps	Dips and Sticks	1	2025-11-20 12:42:19.660284	4
148	5	32	Sweet Chilli Dip	Dips and Sticks	1	2025-11-20 12:42:19.660284	4
149	5	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-11-20 12:42:19.660284	4
150	5	34	Mayonnaise	Dips and Sticks	1	2025-11-20 12:42:19.660284	4
151	5	35	Blueberries	Fruit	1	2025-11-20 12:42:19.660284	4
152	5	36	Grapes	Fruit	1	2025-11-20 12:42:19.660284	4
153	5	37	Watermelon	Fruit	1	2025-11-20 12:42:19.660284	4
154	5	38	Honeydew Melon	Fruit	1	2025-11-20 12:42:19.660284	4
155	5	39	Strawberries	Fruit	1	2025-11-20 12:42:19.660284	4
156	5	40	Pomegranate	Fruit	1	2025-11-20 12:42:19.660284	4
157	5	41	Selection of Cakes	Cake	1	2025-11-20 12:42:19.660284	4
158	5	44	Brown Bread	Bread	1	2025-11-20 12:42:19.660284	4
159	6	3	Tuna & Sweetcorn	Sandwiches	1	2025-11-20 12:43:11.482374	5
160	6	20	Quiche	Savoury	1	2025-11-20 12:43:11.482374	5
161	6	21	Pork Pie	Savoury	1	2025-11-20 12:43:11.482374	5
162	6	22	Sausage Roll	Savoury	1	2025-11-20 12:43:11.482374	5
163	6	23	Scotch Eggs	Savoury	1	2025-11-20 12:43:11.482374	5
164	6	24	Mini Sausages	Savoury	1	2025-11-20 12:43:11.482374	5
165	6	25	Bread Sticks	Savoury	1	2025-11-20 12:43:11.482374	5
166	6	26	Bruschetta	Savoury	1	2025-11-20 12:43:11.482374	5
167	6	27	Carrot Sticks	Dips and Sticks	1	2025-11-20 12:43:11.482374	5
168	6	28	Cucumber Sticks	Dips and Sticks	1	2025-11-20 12:43:11.482374	5
169	6	29	Celery	Dips and Sticks	1	2025-11-20 12:43:11.482374	5
170	6	30	Peppers	Dips and Sticks	1	2025-11-20 12:43:11.482374	5
171	6	31	Tortillas / Crisps	Dips and Sticks	1	2025-11-20 12:43:11.482374	5
172	6	32	Sweet Chilli Dip	Dips and Sticks	1	2025-11-20 12:43:11.482374	5
173	6	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-11-20 12:43:11.482374	5
174	6	34	Mayonnaise	Dips and Sticks	1	2025-11-20 12:43:11.482374	5
175	6	35	Blueberries	Fruit	1	2025-11-20 12:43:11.482374	5
176	6	36	Grapes	Fruit	1	2025-11-20 12:43:11.482374	5
177	6	37	Watermelon	Fruit	1	2025-11-20 12:43:11.482374	5
178	6	38	Honeydew Melon	Fruit	1	2025-11-20 12:43:11.482374	5
179	6	39	Strawberries	Fruit	1	2025-11-20 12:43:11.482374	5
180	6	40	Pomegranate	Fruit	1	2025-11-20 12:43:11.482374	5
181	6	41	Selection of Cakes	Cake	1	2025-11-20 12:43:11.482374	5
182	6	43	White Bread	Bread	1	2025-11-20 12:43:11.482374	5
183	7	1	Egg Mayo	Sandwiches	1	2025-11-20 13:45:22.636128	6
184	7	2	Tuna Mayo	Sandwiches	1	2025-11-20 13:45:22.636128	6
185	7	3	Tuna & Sweetcorn	Sandwiches	1	2025-11-20 13:45:22.636128	6
186	7	4	Cheese & Onion	Sandwiches	1	2025-11-20 13:45:22.636128	6
187	7	5	Cheese & Pickle	Sandwiches	1	2025-11-20 13:45:22.636128	6
188	7	6	Ham & Tomato	Sandwiches	1	2025-11-20 13:45:22.636128	6
189	7	7	Ham Salad	Sandwiches	1	2025-11-20 13:45:22.636128	6
190	7	8	Beef & Mustard	Sandwiches	1	2025-11-20 13:45:22.636128	6
191	7	9	Coronation Chicken	Sandwiches	1	2025-11-20 13:45:22.636128	6
192	7	10	Tuna & Red Onion	Sandwiches	1	2025-11-20 13:45:22.636128	6
193	7	11	Cheese & Cucumber	Sandwiches	1	2025-11-20 13:45:22.636128	6
194	7	12	Beef Salad	Sandwiches	1	2025-11-20 13:45:22.636128	6
195	7	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-11-20 13:45:22.636128	6
196	7	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
197	7	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
198	7	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
199	7	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
200	7	18	BLT Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
201	7	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
202	7	20	Quiche	Savoury	1	2025-11-20 13:45:22.636128	6
203	7	21	Pork Pie	Savoury	1	2025-11-20 13:45:22.636128	6
204	7	22	Sausage Roll	Savoury	1	2025-11-20 13:45:22.636128	6
205	7	23	Scotch Eggs	Savoury	1	2025-11-20 13:45:22.636128	6
206	7	24	Mini Sausages	Savoury	1	2025-11-20 13:45:22.636128	6
207	7	25	Bread Sticks	Savoury	1	2025-11-20 13:45:22.636128	6
208	7	26	Bruschetta	Savoury	1	2025-11-20 13:45:22.636128	6
209	7	27	Carrot Sticks	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
210	7	28	Cucumber Sticks	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
211	7	29	Celery	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
212	7	30	Peppers	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
213	7	31	Tortillas / Crisps	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
214	7	32	Sweet Chilli Dip	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
215	7	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
216	7	34	Mayonnaise	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
217	7	35	Blueberries	Fruit	1	2025-11-20 13:45:22.636128	6
218	7	36	Grapes	Fruit	1	2025-11-20 13:45:22.636128	6
219	7	37	Watermelon	Fruit	1	2025-11-20 13:45:22.636128	6
220	7	38	Honeydew Melon	Fruit	1	2025-11-20 13:45:22.636128	6
221	7	39	Strawberries	Fruit	1	2025-11-20 13:45:22.636128	6
222	7	40	Pomegranate	Fruit	1	2025-11-20 13:45:22.636128	6
223	7	41	Selection of Cakes	Cake	1	2025-11-20 13:45:22.636128	6
224	7	45	White and Brown Bread	Bread	1	2025-11-20 13:45:22.636128	6
225	8	1	Egg Mayo	Sandwiches	1	2025-11-20 13:45:22.636128	6
226	8	2	Tuna Mayo	Sandwiches	1	2025-11-20 13:45:22.636128	6
227	8	3	Tuna & Sweetcorn	Sandwiches	1	2025-11-20 13:45:22.636128	6
228	8	4	Cheese & Onion	Sandwiches	1	2025-11-20 13:45:22.636128	6
229	8	5	Cheese & Pickle	Sandwiches	1	2025-11-20 13:45:22.636128	6
230	8	6	Ham & Tomato	Sandwiches	1	2025-11-20 13:45:22.636128	6
231	8	7	Ham Salad	Sandwiches	1	2025-11-20 13:45:22.636128	6
232	8	8	Beef & Mustard	Sandwiches	1	2025-11-20 13:45:22.636128	6
233	8	9	Coronation Chicken	Sandwiches	1	2025-11-20 13:45:22.636128	6
234	8	10	Tuna & Red Onion	Sandwiches	1	2025-11-20 13:45:22.636128	6
235	8	11	Cheese & Cucumber	Sandwiches	1	2025-11-20 13:45:22.636128	6
236	8	12	Beef Salad	Sandwiches	1	2025-11-20 13:45:22.636128	6
237	8	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-11-20 13:45:22.636128	6
238	8	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
239	8	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
240	8	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
241	8	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
242	8	18	BLT Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
243	8	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-11-20 13:45:22.636128	6
244	8	20	Quiche	Savoury	1	2025-11-20 13:45:22.636128	6
245	8	21	Pork Pie	Savoury	1	2025-11-20 13:45:22.636128	6
246	8	22	Sausage Roll	Savoury	1	2025-11-20 13:45:22.636128	6
247	8	23	Scotch Eggs	Savoury	1	2025-11-20 13:45:22.636128	6
248	8	24	Mini Sausages	Savoury	1	2025-11-20 13:45:22.636128	6
249	8	25	Bread Sticks	Savoury	1	2025-11-20 13:45:22.636128	6
250	8	26	Bruschetta	Savoury	1	2025-11-20 13:45:22.636128	6
251	8	27	Carrot Sticks	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
252	8	28	Cucumber Sticks	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
253	8	29	Celery	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
254	8	30	Peppers	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
255	8	31	Tortillas / Crisps	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
256	8	32	Sweet Chilli Dip	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
257	8	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
258	8	34	Mayonnaise	Dips and Sticks	1	2025-11-20 13:45:22.636128	6
259	8	35	Blueberries	Fruit	1	2025-11-20 13:45:22.636128	6
260	8	36	Grapes	Fruit	1	2025-11-20 13:45:22.636128	6
261	8	37	Watermelon	Fruit	1	2025-11-20 13:45:22.636128	6
262	8	38	Honeydew Melon	Fruit	1	2025-11-20 13:45:22.636128	6
263	8	39	Strawberries	Fruit	1	2025-11-20 13:45:22.636128	6
264	8	40	Pomegranate	Fruit	1	2025-11-20 13:45:22.636128	6
265	8	41	Selection of Cakes	Cake	1	2025-11-20 13:45:22.636128	6
266	8	44	Brown Bread	Bread	1	2025-11-20 13:45:22.636128	6
267	9	1	Egg Mayo	Sandwiches	1	2025-12-02 13:29:07.422669	7
268	9	2	Tuna Mayo	Sandwiches	1	2025-12-02 13:29:07.422669	7
269	9	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-02 13:29:07.422669	7
270	9	4	Cheese & Onion	Sandwiches	1	2025-12-02 13:29:07.422669	7
271	9	5	Cheese & Pickle	Sandwiches	1	2025-12-02 13:29:07.422669	7
272	9	6	Ham & Tomato	Sandwiches	1	2025-12-02 13:29:07.422669	7
273	9	7	Ham Salad	Sandwiches	1	2025-12-02 13:29:07.422669	7
274	9	8	Beef & Mustard	Sandwiches	1	2025-12-02 13:29:07.422669	7
275	9	9	Coronation Chicken	Sandwiches	1	2025-12-02 13:29:07.422669	7
276	9	10	Tuna & Red Onion	Sandwiches	1	2025-12-02 13:29:07.422669	7
277	9	11	Cheese & Cucumber	Sandwiches	1	2025-12-02 13:29:07.422669	7
278	9	12	Beef Salad	Sandwiches	1	2025-12-02 13:29:07.422669	7
279	9	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-02 13:29:07.422669	7
280	9	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-02 13:29:07.422669	7
281	9	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-02 13:29:07.422669	7
282	9	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-02 13:29:07.422669	7
283	9	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-02 13:29:07.422669	7
284	9	18	BLT Wrap	Wraps	1	2025-12-02 13:29:07.422669	7
285	9	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-02 13:29:07.422669	7
286	9	20	Quiche	Savoury	1	2025-12-02 13:29:07.422669	7
287	9	21	Pork Pie	Savoury	1	2025-12-02 13:29:07.422669	7
288	9	22	Sausage Roll	Savoury	1	2025-12-02 13:29:07.422669	7
289	9	23	Scotch Eggs	Savoury	1	2025-12-02 13:29:07.422669	7
290	9	24	Mini Sausages	Savoury	1	2025-12-02 13:29:07.422669	7
291	9	25	Bread Sticks	Savoury	1	2025-12-02 13:29:07.422669	7
292	9	26	Bruschetta	Savoury	1	2025-12-02 13:29:07.422669	7
293	9	27	Carrot Sticks	Dips and Sticks	1	2025-12-02 13:29:07.422669	7
294	9	28	Cucumber Sticks	Dips and Sticks	1	2025-12-02 13:29:07.422669	7
295	9	29	Celery	Dips and Sticks	1	2025-12-02 13:29:07.422669	7
296	9	30	Peppers	Dips and Sticks	1	2025-12-02 13:29:07.422669	7
297	9	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-02 13:29:07.422669	7
298	9	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-02 13:29:07.422669	7
299	9	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-02 13:29:07.422669	7
300	9	34	Mayonnaise	Dips and Sticks	1	2025-12-02 13:29:07.422669	7
301	9	35	Blueberries	Fruit	1	2025-12-02 13:29:07.422669	7
302	9	36	Grapes	Fruit	1	2025-12-02 13:29:07.422669	7
303	9	37	Watermelon	Fruit	1	2025-12-02 13:29:07.422669	7
304	9	38	Honeydew Melon	Fruit	1	2025-12-02 13:29:07.422669	7
305	9	39	Strawberries	Fruit	1	2025-12-02 13:29:07.422669	7
306	9	40	Pomegranate	Fruit	1	2025-12-02 13:29:07.422669	7
307	9	41	Selection of Cakes	Cake	1	2025-12-02 13:29:07.422669	7
308	9	43	White Bread	Bread	1	2025-12-02 13:29:07.422669	7
309	10	1	Egg Mayo	Sandwiches	1	2025-12-03 11:39:58.242651	8
310	10	2	Tuna Mayo	Sandwiches	1	2025-12-03 11:39:58.242651	8
311	10	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-03 11:39:58.242651	8
312	10	4	Cheese & Onion	Sandwiches	1	2025-12-03 11:39:58.242651	8
313	10	5	Cheese & Pickle	Sandwiches	1	2025-12-03 11:39:58.242651	8
314	10	6	Ham & Tomato	Sandwiches	1	2025-12-03 11:39:58.242651	8
315	10	7	Ham Salad	Sandwiches	1	2025-12-03 11:39:58.242651	8
316	10	8	Beef & Mustard	Sandwiches	1	2025-12-03 11:39:58.242651	8
317	10	9	Coronation Chicken	Sandwiches	1	2025-12-03 11:39:58.242651	8
318	10	10	Tuna & Red Onion	Sandwiches	1	2025-12-03 11:39:58.242651	8
319	10	11	Cheese & Cucumber	Sandwiches	1	2025-12-03 11:39:58.242651	8
320	10	12	Beef Salad	Sandwiches	1	2025-12-03 11:39:58.242651	8
321	10	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-03 11:39:58.242651	8
322	10	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-03 11:39:58.242651	8
323	10	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-03 11:39:58.242651	8
324	10	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-03 11:39:58.242651	8
325	10	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-03 11:39:58.242651	8
326	10	18	BLT Wrap	Wraps	1	2025-12-03 11:39:58.242651	8
327	10	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-03 11:39:58.242651	8
328	10	20	Quiche	Savoury	1	2025-12-03 11:39:58.242651	8
329	10	21	Pork Pie	Savoury	1	2025-12-03 11:39:58.242651	8
330	10	22	Sausage Roll	Savoury	1	2025-12-03 11:39:58.242651	8
331	10	23	Scotch Eggs	Savoury	1	2025-12-03 11:39:58.242651	8
332	10	24	Mini Sausages	Savoury	1	2025-12-03 11:39:58.242651	8
333	10	25	Bread Sticks	Savoury	1	2025-12-03 11:39:58.242651	8
334	10	26	Bruschetta	Savoury	1	2025-12-03 11:39:58.242651	8
335	10	27	Carrot Sticks	Dips and Sticks	1	2025-12-03 11:39:58.242651	8
336	10	28	Cucumber Sticks	Dips and Sticks	1	2025-12-03 11:39:58.242651	8
337	10	29	Celery	Dips and Sticks	1	2025-12-03 11:39:58.242651	8
338	10	30	Peppers	Dips and Sticks	1	2025-12-03 11:39:58.242651	8
339	10	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-03 11:39:58.242651	8
340	10	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-03 11:39:58.242651	8
341	10	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-03 11:39:58.242651	8
342	10	34	Mayonnaise	Dips and Sticks	1	2025-12-03 11:39:58.242651	8
343	10	35	Blueberries	Fruit	1	2025-12-03 11:39:58.242651	8
344	10	36	Grapes	Fruit	1	2025-12-03 11:39:58.242651	8
345	10	37	Watermelon	Fruit	1	2025-12-03 11:39:58.242651	8
346	10	38	Honeydew Melon	Fruit	1	2025-12-03 11:39:58.242651	8
347	10	39	Strawberries	Fruit	1	2025-12-03 11:39:58.242651	8
348	10	40	Pomegranate	Fruit	1	2025-12-03 11:39:58.242651	8
349	10	41	Selection of Cakes	Cake	1	2025-12-03 11:39:58.242651	8
350	10	43	White Bread	Bread	1	2025-12-03 11:39:58.242651	8
351	11	1	Egg Mayo	Sandwiches	1	2025-12-03 11:50:57.70706	9
352	11	2	Tuna Mayo	Sandwiches	1	2025-12-03 11:50:57.70706	9
353	11	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-03 11:50:57.70706	9
354	11	4	Cheese & Onion	Sandwiches	1	2025-12-03 11:50:57.70706	9
355	11	5	Cheese & Pickle	Sandwiches	1	2025-12-03 11:50:57.70706	9
356	11	6	Ham & Tomato	Sandwiches	1	2025-12-03 11:50:57.70706	9
357	11	7	Ham Salad	Sandwiches	1	2025-12-03 11:50:57.70706	9
358	11	8	Beef & Mustard	Sandwiches	1	2025-12-03 11:50:57.70706	9
359	11	9	Coronation Chicken	Sandwiches	1	2025-12-03 11:50:57.70706	9
360	11	10	Tuna & Red Onion	Sandwiches	1	2025-12-03 11:50:57.70706	9
361	11	11	Cheese & Cucumber	Sandwiches	1	2025-12-03 11:50:57.70706	9
362	11	12	Beef Salad	Sandwiches	1	2025-12-03 11:50:57.70706	9
363	11	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-03 11:50:57.70706	9
364	11	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-03 11:50:57.70706	9
365	11	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-03 11:50:57.70706	9
366	11	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-03 11:50:57.70706	9
367	11	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-03 11:50:57.70706	9
368	11	18	BLT Wrap	Wraps	1	2025-12-03 11:50:57.70706	9
369	11	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-03 11:50:57.70706	9
370	11	20	Quiche	Savoury	1	2025-12-03 11:50:57.70706	9
371	11	21	Pork Pie	Savoury	1	2025-12-03 11:50:57.70706	9
372	11	22	Sausage Roll	Savoury	1	2025-12-03 11:50:57.70706	9
373	11	23	Scotch Eggs	Savoury	1	2025-12-03 11:50:57.70706	9
374	11	24	Mini Sausages	Savoury	1	2025-12-03 11:50:57.70706	9
375	11	25	Bread Sticks	Savoury	1	2025-12-03 11:50:57.70706	9
376	11	26	Bruschetta	Savoury	1	2025-12-03 11:50:57.70706	9
377	11	27	Carrot Sticks	Dips and Sticks	1	2025-12-03 11:50:57.70706	9
378	11	28	Cucumber Sticks	Dips and Sticks	1	2025-12-03 11:50:57.70706	9
379	11	29	Celery	Dips and Sticks	1	2025-12-03 11:50:57.70706	9
380	11	30	Peppers	Dips and Sticks	1	2025-12-03 11:50:57.70706	9
381	11	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-03 11:50:57.70706	9
382	11	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-03 11:50:57.70706	9
383	11	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-03 11:50:57.70706	9
384	11	34	Mayonnaise	Dips and Sticks	1	2025-12-03 11:50:57.70706	9
385	11	35	Blueberries	Fruit	1	2025-12-03 11:50:57.70706	9
386	11	36	Grapes	Fruit	1	2025-12-03 11:50:57.70706	9
387	11	37	Watermelon	Fruit	1	2025-12-03 11:50:57.70706	9
388	11	38	Honeydew Melon	Fruit	1	2025-12-03 11:50:57.70706	9
389	11	39	Strawberries	Fruit	1	2025-12-03 11:50:57.70706	9
390	11	40	Pomegranate	Fruit	1	2025-12-03 11:50:57.70706	9
391	11	41	Selection of Cakes	Cake	1	2025-12-03 11:50:57.70706	9
392	11	43	White Bread	Bread	1	2025-12-03 11:50:57.70706	9
393	12	1	Egg Mayo	Sandwiches	1	2025-12-03 11:56:03.076636	10
394	12	2	Tuna Mayo	Sandwiches	1	2025-12-03 11:56:03.076636	10
395	12	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-03 11:56:03.076636	10
396	12	4	Cheese & Onion	Sandwiches	1	2025-12-03 11:56:03.076636	10
397	12	5	Cheese & Pickle	Sandwiches	1	2025-12-03 11:56:03.076636	10
398	12	6	Ham & Tomato	Sandwiches	1	2025-12-03 11:56:03.076636	10
399	12	7	Ham Salad	Sandwiches	1	2025-12-03 11:56:03.076636	10
400	12	8	Beef & Mustard	Sandwiches	1	2025-12-03 11:56:03.076636	10
401	12	9	Coronation Chicken	Sandwiches	1	2025-12-03 11:56:03.076636	10
402	12	10	Tuna & Red Onion	Sandwiches	1	2025-12-03 11:56:03.076636	10
403	12	11	Cheese & Cucumber	Sandwiches	1	2025-12-03 11:56:03.076636	10
404	12	12	Beef Salad	Sandwiches	1	2025-12-03 11:56:03.076636	10
405	12	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-03 11:56:03.076636	10
406	12	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-03 11:56:03.076636	10
407	12	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-03 11:56:03.076636	10
408	12	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-03 11:56:03.076636	10
409	12	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-03 11:56:03.076636	10
410	12	18	BLT Wrap	Wraps	1	2025-12-03 11:56:03.076636	10
411	12	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-03 11:56:03.076636	10
412	12	20	Quiche	Savoury	1	2025-12-03 11:56:03.076636	10
413	12	21	Pork Pie	Savoury	1	2025-12-03 11:56:03.076636	10
414	12	22	Sausage Roll	Savoury	1	2025-12-03 11:56:03.076636	10
415	12	23	Scotch Eggs	Savoury	1	2025-12-03 11:56:03.076636	10
416	12	24	Mini Sausages	Savoury	1	2025-12-03 11:56:03.076636	10
417	12	25	Bread Sticks	Savoury	1	2025-12-03 11:56:03.076636	10
418	12	26	Bruschetta	Savoury	1	2025-12-03 11:56:03.076636	10
419	12	27	Carrot Sticks	Dips and Sticks	1	2025-12-03 11:56:03.076636	10
420	12	28	Cucumber Sticks	Dips and Sticks	1	2025-12-03 11:56:03.076636	10
421	12	29	Celery	Dips and Sticks	1	2025-12-03 11:56:03.076636	10
422	12	30	Peppers	Dips and Sticks	1	2025-12-03 11:56:03.076636	10
423	12	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-03 11:56:03.076636	10
424	12	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-03 11:56:03.076636	10
425	12	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-03 11:56:03.076636	10
426	12	34	Mayonnaise	Dips and Sticks	1	2025-12-03 11:56:03.076636	10
427	12	35	Blueberries	Fruit	1	2025-12-03 11:56:03.076636	10
428	12	36	Grapes	Fruit	1	2025-12-03 11:56:03.076636	10
429	12	37	Watermelon	Fruit	1	2025-12-03 11:56:03.076636	10
430	12	38	Honeydew Melon	Fruit	1	2025-12-03 11:56:03.076636	10
431	12	39	Strawberries	Fruit	1	2025-12-03 11:56:03.076636	10
432	12	40	Pomegranate	Fruit	1	2025-12-03 11:56:03.076636	10
433	12	41	Selection of Cakes	Cake	1	2025-12-03 11:56:03.076636	10
434	12	43	White Bread	Bread	1	2025-12-03 11:56:03.076636	10
435	13	1	Egg Mayo	Sandwiches	1	2025-12-03 11:59:33.996955	11
436	13	2	Tuna Mayo	Sandwiches	1	2025-12-03 11:59:33.996955	11
437	13	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-03 11:59:33.996955	11
438	13	4	Cheese & Onion	Sandwiches	1	2025-12-03 11:59:33.996955	11
439	13	5	Cheese & Pickle	Sandwiches	1	2025-12-03 11:59:33.996955	11
440	13	6	Ham & Tomato	Sandwiches	1	2025-12-03 11:59:33.996955	11
441	13	7	Ham Salad	Sandwiches	1	2025-12-03 11:59:33.996955	11
442	13	8	Beef & Mustard	Sandwiches	1	2025-12-03 11:59:33.996955	11
443	13	9	Coronation Chicken	Sandwiches	1	2025-12-03 11:59:33.996955	11
444	13	10	Tuna & Red Onion	Sandwiches	1	2025-12-03 11:59:33.996955	11
445	13	11	Cheese & Cucumber	Sandwiches	1	2025-12-03 11:59:33.996955	11
446	13	12	Beef Salad	Sandwiches	1	2025-12-03 11:59:33.996955	11
447	13	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-03 11:59:33.996955	11
448	13	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-03 11:59:33.996955	11
449	13	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-03 11:59:33.996955	11
450	13	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-03 11:59:33.996955	11
451	13	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-03 11:59:33.996955	11
452	13	18	BLT Wrap	Wraps	1	2025-12-03 11:59:33.996955	11
453	13	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-03 11:59:33.996955	11
454	13	20	Quiche	Savoury	1	2025-12-03 11:59:33.996955	11
455	13	21	Pork Pie	Savoury	1	2025-12-03 11:59:33.996955	11
456	13	22	Sausage Roll	Savoury	1	2025-12-03 11:59:33.996955	11
457	13	23	Scotch Eggs	Savoury	1	2025-12-03 11:59:33.996955	11
458	13	24	Mini Sausages	Savoury	1	2025-12-03 11:59:33.996955	11
459	13	25	Bread Sticks	Savoury	1	2025-12-03 11:59:33.996955	11
460	13	26	Bruschetta	Savoury	1	2025-12-03 11:59:33.996955	11
461	13	27	Carrot Sticks	Dips and Sticks	1	2025-12-03 11:59:33.996955	11
462	13	28	Cucumber Sticks	Dips and Sticks	1	2025-12-03 11:59:33.996955	11
463	13	29	Celery	Dips and Sticks	1	2025-12-03 11:59:33.996955	11
464	13	30	Peppers	Dips and Sticks	1	2025-12-03 11:59:33.996955	11
465	13	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-03 11:59:33.996955	11
466	13	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-03 11:59:33.996955	11
467	13	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-03 11:59:33.996955	11
468	13	34	Mayonnaise	Dips and Sticks	1	2025-12-03 11:59:33.996955	11
469	13	35	Blueberries	Fruit	1	2025-12-03 11:59:33.996955	11
470	13	36	Grapes	Fruit	1	2025-12-03 11:59:33.996955	11
471	13	37	Watermelon	Fruit	1	2025-12-03 11:59:33.996955	11
472	13	38	Honeydew Melon	Fruit	1	2025-12-03 11:59:33.996955	11
473	13	39	Strawberries	Fruit	1	2025-12-03 11:59:33.996955	11
474	13	40	Pomegranate	Fruit	1	2025-12-03 11:59:33.996955	11
475	13	41	Selection of Cakes	Cake	1	2025-12-03 11:59:33.996955	11
476	13	43	White Bread	Bread	1	2025-12-03 11:59:33.996955	11
477	14	1	Egg Mayo	Sandwiches	1	2025-12-04 10:59:33.166785	12
478	14	2	Tuna Mayo	Sandwiches	1	2025-12-04 10:59:33.166785	12
479	14	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-04 10:59:33.166785	12
480	14	4	Cheese & Onion	Sandwiches	1	2025-12-04 10:59:33.166785	12
481	14	5	Cheese & Pickle	Sandwiches	1	2025-12-04 10:59:33.166785	12
482	14	6	Ham & Tomato	Sandwiches	1	2025-12-04 10:59:33.166785	12
483	14	7	Ham Salad	Sandwiches	1	2025-12-04 10:59:33.166785	12
484	14	8	Beef & Mustard	Sandwiches	1	2025-12-04 10:59:33.166785	12
485	14	9	Coronation Chicken	Sandwiches	1	2025-12-04 10:59:33.166785	12
486	14	10	Tuna & Red Onion	Sandwiches	1	2025-12-04 10:59:33.166785	12
487	14	11	Cheese & Cucumber	Sandwiches	1	2025-12-04 10:59:33.166785	12
488	14	12	Beef Salad	Sandwiches	1	2025-12-04 10:59:33.166785	12
489	14	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-04 10:59:33.166785	12
490	14	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-04 10:59:33.166785	12
491	14	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-04 10:59:33.166785	12
492	14	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-04 10:59:33.166785	12
493	14	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-04 10:59:33.166785	12
494	14	18	BLT Wrap	Wraps	1	2025-12-04 10:59:33.166785	12
495	14	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-04 10:59:33.166785	12
496	14	20	Quiche	Savoury	1	2025-12-04 10:59:33.166785	12
497	14	21	Pork Pie	Savoury	1	2025-12-04 10:59:33.166785	12
498	14	22	Sausage Roll	Savoury	1	2025-12-04 10:59:33.166785	12
499	14	23	Scotch Eggs	Savoury	1	2025-12-04 10:59:33.166785	12
500	14	24	Mini Sausages	Savoury	1	2025-12-04 10:59:33.166785	12
501	14	25	Bread Sticks	Savoury	1	2025-12-04 10:59:33.166785	12
502	14	26	Bruschetta	Savoury	1	2025-12-04 10:59:33.166785	12
503	14	27	Carrot Sticks	Dips and Sticks	1	2025-12-04 10:59:33.166785	12
504	14	28	Cucumber Sticks	Dips and Sticks	1	2025-12-04 10:59:33.166785	12
505	14	29	Celery	Dips and Sticks	1	2025-12-04 10:59:33.166785	12
506	14	30	Peppers	Dips and Sticks	1	2025-12-04 10:59:33.166785	12
507	14	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-04 10:59:33.166785	12
508	14	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-04 10:59:33.166785	12
509	14	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-04 10:59:33.166785	12
510	14	34	Mayonnaise	Dips and Sticks	1	2025-12-04 10:59:33.166785	12
511	14	35	Blueberries	Fruit	1	2025-12-04 10:59:33.166785	12
512	14	36	Grapes	Fruit	1	2025-12-04 10:59:33.166785	12
513	14	37	Watermelon	Fruit	1	2025-12-04 10:59:33.166785	12
514	14	38	Honeydew Melon	Fruit	1	2025-12-04 10:59:33.166785	12
515	14	39	Strawberries	Fruit	1	2025-12-04 10:59:33.166785	12
516	14	40	Pomegranate	Fruit	1	2025-12-04 10:59:33.166785	12
517	14	41	Selection of Cakes	Cake	1	2025-12-04 10:59:33.166785	12
518	14	43	White Bread	Bread	1	2025-12-04 10:59:33.166785	12
519	15	1	Egg Mayo	Sandwiches	1	2025-12-04 12:02:24.621503	13
520	15	2	Tuna Mayo	Sandwiches	1	2025-12-04 12:02:24.621503	13
521	15	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-04 12:02:24.621503	13
522	15	4	Cheese & Onion	Sandwiches	1	2025-12-04 12:02:24.621503	13
523	15	5	Cheese & Pickle	Sandwiches	1	2025-12-04 12:02:24.621503	13
524	15	6	Ham & Tomato	Sandwiches	1	2025-12-04 12:02:24.621503	13
525	15	7	Ham Salad	Sandwiches	1	2025-12-04 12:02:24.621503	13
526	15	8	Beef & Mustard	Sandwiches	1	2025-12-04 12:02:24.621503	13
527	15	9	Coronation Chicken	Sandwiches	1	2025-12-04 12:02:24.621503	13
528	15	10	Tuna & Red Onion	Sandwiches	1	2025-12-04 12:02:24.621503	13
529	15	11	Cheese & Cucumber	Sandwiches	1	2025-12-04 12:02:24.621503	13
530	15	12	Beef Salad	Sandwiches	1	2025-12-04 12:02:24.621503	13
531	15	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-04 12:02:24.621503	13
532	15	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-04 12:02:24.621503	13
533	15	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-04 12:02:24.621503	13
534	15	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-04 12:02:24.621503	13
535	15	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-04 12:02:24.621503	13
536	15	18	BLT Wrap	Wraps	1	2025-12-04 12:02:24.621503	13
537	15	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-04 12:02:24.621503	13
538	15	20	Quiche	Savoury	1	2025-12-04 12:02:24.621503	13
539	15	21	Pork Pie	Savoury	1	2025-12-04 12:02:24.621503	13
540	15	22	Sausage Roll	Savoury	1	2025-12-04 12:02:24.621503	13
541	15	23	Scotch Eggs	Savoury	1	2025-12-04 12:02:24.621503	13
542	15	24	Mini Sausages	Savoury	1	2025-12-04 12:02:24.621503	13
543	15	25	Bread Sticks	Savoury	1	2025-12-04 12:02:24.621503	13
544	15	26	Bruschetta	Savoury	1	2025-12-04 12:02:24.621503	13
545	15	27	Carrot Sticks	Dips and Sticks	1	2025-12-04 12:02:24.621503	13
546	15	28	Cucumber Sticks	Dips and Sticks	1	2025-12-04 12:02:24.621503	13
547	15	29	Celery	Dips and Sticks	1	2025-12-04 12:02:24.621503	13
548	15	30	Peppers	Dips and Sticks	1	2025-12-04 12:02:24.621503	13
549	15	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-04 12:02:24.621503	13
550	15	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-04 12:02:24.621503	13
551	15	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-04 12:02:24.621503	13
552	15	34	Mayonnaise	Dips and Sticks	1	2025-12-04 12:02:24.621503	13
553	15	35	Blueberries	Fruit	1	2025-12-04 12:02:24.621503	13
554	15	36	Grapes	Fruit	1	2025-12-04 12:02:24.621503	13
555	15	37	Watermelon	Fruit	1	2025-12-04 12:02:24.621503	13
556	15	38	Honeydew Melon	Fruit	1	2025-12-04 12:02:24.621503	13
557	15	39	Strawberries	Fruit	1	2025-12-04 12:02:24.621503	13
558	15	40	Pomegranate	Fruit	1	2025-12-04 12:02:24.621503	13
559	15	41	Selection of Cakes	Cake	1	2025-12-04 12:02:24.621503	13
560	15	43	White Bread	Bread	1	2025-12-04 12:02:24.621503	13
561	16	1	Egg Mayo	Sandwiches	1	2025-12-08 00:02:42.090069	14
562	16	2	Tuna Mayo	Sandwiches	1	2025-12-08 00:02:42.090069	14
563	16	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-08 00:02:42.090069	14
564	16	4	Cheese & Onion	Sandwiches	1	2025-12-08 00:02:42.090069	14
565	16	5	Cheese & Pickle	Sandwiches	1	2025-12-08 00:02:42.090069	14
566	16	6	Ham & Tomato	Sandwiches	1	2025-12-08 00:02:42.090069	14
567	16	7	Ham Salad	Sandwiches	1	2025-12-08 00:02:42.090069	14
568	16	8	Beef & Mustard	Sandwiches	1	2025-12-08 00:02:42.090069	14
569	16	9	Coronation Chicken	Sandwiches	1	2025-12-08 00:02:42.090069	14
570	16	10	Tuna & Red Onion	Sandwiches	1	2025-12-08 00:02:42.090069	14
571	16	11	Cheese & Cucumber	Sandwiches	1	2025-12-08 00:02:42.090069	14
572	16	12	Beef Salad	Sandwiches	1	2025-12-08 00:02:42.090069	14
573	16	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-08 00:02:42.090069	14
574	16	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-08 00:02:42.090069	14
575	16	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-08 00:02:42.090069	14
576	16	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-08 00:02:42.090069	14
577	16	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-08 00:02:42.090069	14
578	16	18	BLT Wrap	Wraps	1	2025-12-08 00:02:42.090069	14
579	16	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-08 00:02:42.090069	14
580	16	20	Quiche	Savoury	1	2025-12-08 00:02:42.090069	14
581	16	21	Pork Pie	Savoury	1	2025-12-08 00:02:42.090069	14
582	16	22	Sausage Roll	Savoury	1	2025-12-08 00:02:42.090069	14
583	16	23	Scotch Eggs	Savoury	1	2025-12-08 00:02:42.090069	14
584	16	24	Mini Sausages	Savoury	1	2025-12-08 00:02:42.090069	14
585	16	25	Bread Sticks	Savoury	1	2025-12-08 00:02:42.090069	14
586	16	26	Bruschetta	Savoury	1	2025-12-08 00:02:42.090069	14
587	16	27	Carrot Sticks	Dips and Sticks	1	2025-12-08 00:02:42.090069	14
588	16	28	Cucumber Sticks	Dips and Sticks	1	2025-12-08 00:02:42.090069	14
589	16	29	Celery	Dips and Sticks	1	2025-12-08 00:02:42.090069	14
590	16	30	Peppers	Dips and Sticks	1	2025-12-08 00:02:42.090069	14
591	16	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-08 00:02:42.090069	14
592	16	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-08 00:02:42.090069	14
593	16	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-08 00:02:42.090069	14
594	16	34	Mayonnaise	Dips and Sticks	1	2025-12-08 00:02:42.090069	14
595	16	35	Blueberries	Fruit	1	2025-12-08 00:02:42.090069	14
596	16	36	Grapes	Fruit	1	2025-12-08 00:02:42.090069	14
597	16	37	Watermelon	Fruit	1	2025-12-08 00:02:42.090069	14
598	16	38	Honeydew Melon	Fruit	1	2025-12-08 00:02:42.090069	14
599	16	39	Strawberries	Fruit	1	2025-12-08 00:02:42.090069	14
600	16	40	Pomegranate	Fruit	1	2025-12-08 00:02:42.090069	14
601	16	41	Selection of Cakes	Cake	1	2025-12-08 00:02:42.090069	14
602	16	45	White and Brown Bread	Bread	1	2025-12-08 00:02:42.090069	14
603	17	1	Egg Mayo	Sandwiches	1	2025-12-08 00:15:55.759463	15
604	17	2	Tuna Mayo	Sandwiches	1	2025-12-08 00:15:55.759463	15
605	17	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-08 00:15:55.759463	15
606	17	4	Cheese & Onion	Sandwiches	1	2025-12-08 00:15:55.759463	15
607	17	5	Cheese & Pickle	Sandwiches	1	2025-12-08 00:15:55.759463	15
608	17	6	Ham & Tomato	Sandwiches	1	2025-12-08 00:15:55.759463	15
609	17	7	Ham Salad	Sandwiches	1	2025-12-08 00:15:55.759463	15
610	17	8	Beef & Mustard	Sandwiches	1	2025-12-08 00:15:55.759463	15
611	17	9	Coronation Chicken	Sandwiches	1	2025-12-08 00:15:55.759463	15
612	17	10	Tuna & Red Onion	Sandwiches	1	2025-12-08 00:15:55.759463	15
613	17	11	Cheese & Cucumber	Sandwiches	1	2025-12-08 00:15:55.759463	15
614	17	12	Beef Salad	Sandwiches	1	2025-12-08 00:15:55.759463	15
615	17	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-08 00:15:55.759463	15
616	17	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-08 00:15:55.759463	15
617	17	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-08 00:15:55.759463	15
618	17	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-08 00:15:55.759463	15
619	17	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-08 00:15:55.759463	15
620	17	18	BLT Wrap	Wraps	1	2025-12-08 00:15:55.759463	15
621	17	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-08 00:15:55.759463	15
622	17	20	Quiche	Savoury	1	2025-12-08 00:15:55.759463	15
623	17	21	Pork Pie	Savoury	1	2025-12-08 00:15:55.759463	15
624	17	22	Sausage Roll	Savoury	1	2025-12-08 00:15:55.759463	15
625	17	23	Scotch Eggs	Savoury	1	2025-12-08 00:15:55.759463	15
626	17	24	Mini Sausages	Savoury	1	2025-12-08 00:15:55.759463	15
627	17	25	Bread Sticks	Savoury	1	2025-12-08 00:15:55.759463	15
628	17	26	Bruschetta	Savoury	1	2025-12-08 00:15:55.759463	15
629	17	27	Carrot Sticks	Dips and Sticks	1	2025-12-08 00:15:55.759463	15
630	17	28	Cucumber Sticks	Dips and Sticks	1	2025-12-08 00:15:55.759463	15
631	17	29	Celery	Dips and Sticks	1	2025-12-08 00:15:55.759463	15
632	17	30	Peppers	Dips and Sticks	1	2025-12-08 00:15:55.759463	15
633	17	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-08 00:15:55.759463	15
634	17	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-08 00:15:55.759463	15
635	17	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-08 00:15:55.759463	15
636	17	34	Mayonnaise	Dips and Sticks	1	2025-12-08 00:15:55.759463	15
637	17	35	Blueberries	Fruit	1	2025-12-08 00:15:55.759463	15
638	17	36	Grapes	Fruit	1	2025-12-08 00:15:55.759463	15
639	17	37	Watermelon	Fruit	1	2025-12-08 00:15:55.759463	15
640	17	38	Honeydew Melon	Fruit	1	2025-12-08 00:15:55.759463	15
641	17	39	Strawberries	Fruit	1	2025-12-08 00:15:55.759463	15
642	17	40	Pomegranate	Fruit	1	2025-12-08 00:15:55.759463	15
643	17	41	Selection of Cakes	Cake	1	2025-12-08 00:15:55.759463	15
644	17	45	White and Brown Bread	Bread	1	2025-12-08 00:15:55.759463	15
645	18	1	Egg Mayo	Sandwiches	1	2025-12-09 12:23:30.383636	16
646	18	2	Tuna Mayo	Sandwiches	1	2025-12-09 12:23:30.383636	16
647	18	3	Tuna & Sweetcorn	Sandwiches	1	2025-12-09 12:23:30.383636	16
648	18	4	Cheese & Onion	Sandwiches	1	2025-12-09 12:23:30.383636	16
649	18	5	Cheese & Pickle	Sandwiches	1	2025-12-09 12:23:30.383636	16
650	18	6	Ham & Tomato	Sandwiches	1	2025-12-09 12:23:30.383636	16
651	18	7	Ham Salad	Sandwiches	1	2025-12-09 12:23:30.383636	16
652	18	8	Beef & Mustard	Sandwiches	1	2025-12-09 12:23:30.383636	16
653	18	9	Coronation Chicken	Sandwiches	1	2025-12-09 12:23:30.383636	16
654	18	10	Tuna & Red Onion	Sandwiches	1	2025-12-09 12:23:30.383636	16
655	18	11	Cheese & Cucumber	Sandwiches	1	2025-12-09 12:23:30.383636	16
656	18	12	Beef Salad	Sandwiches	1	2025-12-09 12:23:30.383636	16
657	18	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2025-12-09 12:23:30.383636	16
658	18	14	Coronation Chicken & Salad Wrap	Wraps	1	2025-12-09 12:23:30.383636	16
659	18	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-09 12:23:30.383636	16
660	18	16	Tuna & Sweetcorn Wrap	Wraps	1	2025-12-09 12:23:30.383636	16
661	18	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2025-12-09 12:23:30.383636	16
662	18	18	BLT Wrap	Wraps	1	2025-12-09 12:23:30.383636	16
663	18	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2025-12-09 12:23:30.383636	16
664	18	20	Quiche	Savoury	1	2025-12-09 12:23:30.383636	16
665	18	21	Pork Pie	Savoury	1	2025-12-09 12:23:30.383636	16
666	18	22	Sausage Roll	Savoury	1	2025-12-09 12:23:30.383636	16
667	18	23	Scotch Eggs	Savoury	1	2025-12-09 12:23:30.383636	16
668	18	24	Mini Sausages	Savoury	1	2025-12-09 12:23:30.383636	16
669	18	25	Bread Sticks	Savoury	1	2025-12-09 12:23:30.383636	16
670	18	26	Bruschetta	Savoury	1	2025-12-09 12:23:30.383636	16
671	18	27	Carrot Sticks	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
672	18	28	Cucumber Sticks	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
673	18	29	Celery	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
674	18	30	Peppers	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
675	18	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
676	18	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
677	18	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
678	18	34	Mayonnaise	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
679	18	35	Blueberries	Fruit	1	2025-12-09 12:23:30.383636	16
680	18	36	Grapes	Fruit	1	2025-12-09 12:23:30.383636	16
681	18	37	Watermelon	Fruit	1	2025-12-09 12:23:30.383636	16
682	18	38	Honeydew Melon	Fruit	1	2025-12-09 12:23:30.383636	16
683	18	39	Strawberries	Fruit	1	2025-12-09 12:23:30.383636	16
684	18	40	Pomegranate	Fruit	1	2025-12-09 12:23:30.383636	16
685	18	41	Selection of Cakes	Cake	1	2025-12-09 12:23:30.383636	16
686	18	45	White and Brown Bread	Bread	1	2025-12-09 12:23:30.383636	16
687	19	2	Tuna Mayo	Sandwiches	1	2025-12-09 12:23:30.383636	16
688	19	4	Cheese & Onion	Sandwiches	1	2025-12-09 12:23:30.383636	16
689	19	6	Ham & Tomato	Sandwiches	1	2025-12-09 12:23:30.383636	16
690	19	8	Beef & Mustard	Sandwiches	1	2025-12-09 12:23:30.383636	16
691	19	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2025-12-09 12:23:30.383636	16
692	19	20	Quiche	Savoury	1	2025-12-09 12:23:30.383636	16
693	19	21	Pork Pie	Savoury	1	2025-12-09 12:23:30.383636	16
694	19	22	Sausage Roll	Savoury	1	2025-12-09 12:23:30.383636	16
695	19	23	Scotch Eggs	Savoury	1	2025-12-09 12:23:30.383636	16
696	19	24	Mini Sausages	Savoury	1	2025-12-09 12:23:30.383636	16
697	19	25	Bread Sticks	Savoury	1	2025-12-09 12:23:30.383636	16
698	19	26	Bruschetta	Savoury	1	2025-12-09 12:23:30.383636	16
699	19	27	Carrot Sticks	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
700	19	28	Cucumber Sticks	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
701	19	29	Celery	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
702	19	30	Peppers	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
703	19	31	Tortillas / Crisps	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
704	19	32	Sweet Chilli Dip	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
705	19	33	Yoghurt & Mint Dip	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
706	19	34	Mayonnaise	Dips and Sticks	1	2025-12-09 12:23:30.383636	16
707	19	35	Blueberries	Fruit	1	2025-12-09 12:23:30.383636	16
708	19	36	Grapes	Fruit	1	2025-12-09 12:23:30.383636	16
709	19	37	Watermelon	Fruit	1	2025-12-09 12:23:30.383636	16
710	19	38	Honeydew Melon	Fruit	1	2025-12-09 12:23:30.383636	16
711	19	39	Strawberries	Fruit	1	2025-12-09 12:23:30.383636	16
712	19	40	Pomegranate	Fruit	1	2025-12-09 12:23:30.383636	16
713	19	41	Selection of Cakes	Cake	1	2025-12-09 12:23:30.383636	16
714	19	45	White and Brown Bread	Bread	1	2025-12-09 12:23:30.383636	16
1146	34	1	Egg Mayo	Sandwiches	1	2026-01-04 14:33:13.79064	28
1147	34	4	Cheese & Onion	Sandwiches	1	2026-01-04 14:33:13.79064	28
1148	34	5	Cheese & Pickle	Sandwiches	1	2026-01-04 14:33:13.79064	28
1149	34	6	Ham & Tomato	Sandwiches	1	2026-01-04 14:33:13.79064	28
1150	34	7	Ham Salad	Sandwiches	1	2026-01-04 14:33:13.79064	28
1151	34	8	Beef & Mustard	Sandwiches	1	2026-01-04 14:33:13.79064	28
1152	34	9	Coronation Chicken	Sandwiches	1	2026-01-04 14:33:13.79064	28
1153	34	10	Tuna & Red Onion	Sandwiches	1	2026-01-04 14:33:13.79064	28
1154	34	11	Cheese & Cucumber	Sandwiches	1	2026-01-04 14:33:13.79064	28
1155	34	12	Beef Salad	Sandwiches	1	2026-01-04 14:33:13.79064	28
1156	34	13	Chicken, Bacon, Spring Onion & Mayo	Sandwiches	1	2026-01-04 14:33:13.79064	28
1157	34	14	Coronation Chicken & Salad Wrap	Wraps	1	2026-01-04 14:33:13.79064	28
1158	34	15	Egg Mayo & Lettuce (Baby Gem) Wrap	Wraps	1	2026-01-04 14:33:13.79064	28
1159	34	16	Tuna & Sweetcorn Wrap	Wraps	1	2026-01-04 14:33:13.79064	28
1160	34	17	Tuna Mayo & Red Onion Wrap	Wraps	1	2026-01-04 14:33:13.79064	28
1161	34	18	BLT Wrap	Wraps	1	2026-01-04 14:33:13.79064	28
1162	34	19	Chicken Salad & Sweet Chilli Wrap	Wraps	1	2026-01-04 14:33:13.79064	28
1163	34	22	Sausage Roll	Savoury	1	2026-01-04 14:33:13.79064	28
1164	34	27	Carrot Sticks	Dips and Sticks	1	2026-01-04 14:33:13.79064	28
1165	34	28	Cucumber Sticks	Dips and Sticks	1	2026-01-04 14:33:13.79064	28
1166	34	29	Celery	Dips and Sticks	1	2026-01-04 14:33:13.79064	28
1167	34	30	Peppers	Dips and Sticks	1	2026-01-04 14:33:13.79064	28
1168	34	31	Tortillas / Crisps	Dips and Sticks	1	2026-01-04 14:33:13.79064	28
1169	34	32	Sweet Chilli Dip	Dips and Sticks	1	2026-01-04 14:33:13.79064	28
1170	34	33	Yoghurt & Mint Dip	Dips and Sticks	1	2026-01-04 14:33:13.79064	28
1171	34	34	Mayonnaise	Dips and Sticks	1	2026-01-04 14:33:13.79064	28
1172	34	35	Blueberries	Fruit	1	2026-01-04 14:33:13.79064	28
1173	34	36	Grapes	Fruit	1	2026-01-04 14:33:13.79064	28
1174	34	37	Watermelon	Fruit	1	2026-01-04 14:33:13.79064	28
1175	34	38	Honeydew Melon	Fruit	1	2026-01-04 14:33:13.79064	28
1176	34	39	Strawberries	Fruit	1	2026-01-04 14:33:13.79064	28
1177	34	40	Pomegranate	Fruit	1	2026-01-04 14:33:13.79064	28
1178	34	41	Selection of Cakes	Cake	1	2026-01-04 14:33:13.79064	28
1179	34	43	White Bread	Bread	1	2026-01-04 14:33:13.79064	28
1180	35	46	Egg and Cress	Sandwiches	1	2026-01-04 14:33:13.79064	28
1181	35	47	Cheese	Sandwiches	1	2026-01-04 14:33:13.79064	28
1182	35	48	Cheese and Ham	Sandwiches	1	2026-01-04 14:33:13.79064	28
1183	35	49	Tuna and Sweetcorn	Sandwiches	1	2026-01-04 14:33:13.79064	28
1184	35	50	Ham	Sandwiches	1	2026-01-04 14:33:13.79064	28
1185	35	51	Jam	Sandwiches	1	2026-01-04 14:33:13.79064	28
1186	35	52	Peanut Butter	Sandwiches	1	2026-01-04 14:33:13.79064	28
1187	35	53	Sausage Rolls	Savoury	1	2026-01-04 14:33:13.79064	28
1188	35	54	Cocktail Sausages	Savoury	1	2026-01-04 14:33:13.79064	28
\.


--
-- TOC entry 3611 (class 0 OID 22481)
-- Dependencies: 222
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.orders (id, order_number, customer_email, customer_phone, fulfillment_type, fulfillment_address, total_price, status, payment_status, payment_method, notes, created_at, updated_at, completed_at, fulfillment_date, fulfillment_time, branch_id, stripe_payment_intent_id, customer_id) FROM stdin;
3	ORD-001	summer.louise2906@gmail.com	8888	collection	acrefield	65.40	completed	pending	card	test	2025-11-20 12:41:19.086434	2025-11-20 12:43:36.460298	\N	2025-11-22	13:41	\N	\N	\N
6	ORD-004	summer.louise2906@gmail.com	8888	collection	acrefield	708.50	completed	pending	card	test test test	2025-11-20 13:45:22.636128	2025-11-27 13:55:21.439953	\N	2025-11-30	18:45	\N	\N	\N
12	ORD-010	summer.louise2906@gmail.com	07398671815	delivery	Acrefield, sy21 7be	141.70	completed	pending	card	test	2025-12-04 10:59:33.166785	2025-12-10 10:59:23.123689	\N	2025-12-05	09:00	1	\N	\N
4	ORD-002	brookfielduser1@gmail.com	8888	delivery	acrefield	163.50	completed	pending	card	test2	2025-11-20 12:42:19.660284	2025-12-16 20:52:04.724949	\N	2025-12-02	13:42	\N	\N	\N
13	ORD-011	summer.louise2906@gmail.com	07398671815	collection	Acrefield	1590.00	completed	pending	card	test	2025-12-04 12:02:24.621503	2025-12-16 20:52:09.350991	\N	2025-12-05	16:30	1	\N	\N
25	ORD-023	summer.louise2906@gmail.com	07398671815	collection	Acrefield	222.60	completed	paid	stripe	test	2025-12-17 11:34:04.908711	2025-12-17 11:36:57.084131	\N	2025-12-18	09:00	3	\N	\N
5	ORD-003	summer.louise2906@gmail.com	8888	collection	acrefield	10.90	completed	pending	card	test2	2025-11-20 12:43:11.482374	2025-12-17 11:38:11.890362	\N	2025-12-07	17:43	\N	\N	\N
20	ORD-018	summer.louise2906@gmail.com	07398671815	collection	Acrefield, sy21 7be	222.60	completed	pending	card	test	2025-12-09 13:10:21.773819	2025-12-17 11:40:15.030296	\N	2025-12-10	15:30	1	\N	\N
9	ORD-007	summer.louise2906@gmail.com	07398671815	delivery	Acrefield, sy21 7be	141.70	completed	pending	card	test	2025-12-03 11:50:57.70706	2025-12-17 11:40:33.808276	\N	2025-12-28	16:30	1	\N	\N
7	ORD-005	summer.louise2906@gmail.com	07398671815	delivery	Acrefield, Henfaes Lane, sy21 7be	1090.00	cancelled	pending	card	test	2025-12-02 13:29:07.422669	2025-12-17 11:47:27.364279	\N	2025-12-31	14:30	\N	\N	\N
26	ORD-024	summer.louise2906@gmail.com	1	collection	LL57  	486.00	completed	paid	stripe	bangor	2025-12-30 13:55:53.548694	2025-12-30 14:02:51.856386	\N	2025-12-31	13:00	1	\N	\N
14	ORD-012	brookfieldcomfort@gmail.com	07818443886	collection	1 Cumberland Place	163.50	completed	pending	card	Brookfield Comfort	2025-12-08 00:02:42.090069	2026-01-04 14:41:12.221387	\N	2025-12-09	15:00	1	\N	\N
15	ORD-013	1	1	collection	1	163.50	completed	pending	card	1	2025-12-08 00:15:55.759463	2026-01-10 14:08:48.999708	\N	2025-12-09	12:00	3	\N	\N
21	ORD-019	summer.louise2906@gmail.com	07398671815	collection	Acrefield	65.00	cancelled	pending	card	test	2025-12-09 13:16:40.891531	2026-01-12 11:59:24.593566	\N	2025-12-10	13:00	3	\N	\N
19	ORD-017	summer.louise2906@gmail.com	07398671815	collection	Acrefield	319.80	cancelled	pending	card	test	2025-12-09 13:06:39.486578	2026-01-12 12:00:01.60354	\N	2025-12-10	15:30	3	\N	\N
16	ORD-014	summer.louise2906@gmail.com	07398671815	collection	Acrefield	196.20	cancelled	pending	card	test	2025-12-09 12:23:30.383636	2026-01-12 12:04:20.352942	\N	2025-12-10	15:30	3	\N	\N
10	ORD-008	summer.louise2906@gmail.com	07398671815	collection	Acrefield, sy21 7be	152.60	cancelled	pending	card	test	2025-12-03 11:56:03.076636	2026-01-12 12:04:28.793451	\N	2025-12-30	16:30	1	\N	\N
28	ORD-026	summer.louise2906@gmail.com	8888	collection	sy3 	1140.00	cancelled	paid	stripe	bangor university 	2026-01-04 14:33:13.79064	2026-01-12 11:58:57.997648	\N	2026-01-05	12:00	3	\N	\N
8	ORD-006	summer.louise2906@gmail.com	07398671815	delivery	Acrefield, sy21 7be	1079.10	cancelled	pending	card	test	2025-12-03 11:39:58.242651	2026-01-12 12:04:32.383344	\N	2025-12-26	16:30	\N	\N	\N
22	ORD-020	1	1	collection	sy21 7sb	174.40	cancelled	pending	card	Brookfield	2025-12-09 14:16:55.663178	2026-01-12 11:59:09.768263	\N	2025-12-10	14:00	1	\N	\N
30	ORD-028	summer.louise2906@gmail.com	111111	delivery	sy21 7sb	3520.00	cancelled	paid	stripe	bangor university 	2026-01-10 15:59:07.771655	2026-01-12 12:00:29.232939	\N	2026-01-15	15:30	1	\N	\N
27	ORD-025	summer.louise2906@gmail.com	11111	delivery	sy21 7be  	359.00	cancelled	paid	stripe	bangor university 	2026-01-02 18:30:06.085544	2026-01-12 12:04:36.00837	\N	2026-01-10	11:30	1	\N	\N
29	ORD-027	summer.louise2906@gmail.com	+44 7799 030549	delivery	sy21 7be  	1350.90	cancelled	paid	stripe	bangor university 	2026-01-10 14:05:21.440092	2026-01-12 12:04:40.178819	\N	2026-01-11	11:30	1	\N	\N
11	ORD-009	summer.louise2906@gmail.com	07398671815	collection	Acrefield, sy21 7be	392.40	cancelled	pending	card	test	2025-12-03 11:59:33.996955	2026-01-12 12:01:05.952731	\N	2025-12-18	17:30	3	\N	\N
23	ORD-021	summer.louise2906@gmail.com	1	collection	1 cumberland place, sy21 7sb	54.50	cancelled	pending	card	Brookfield	2025-12-09 14:20:01.859432	2026-01-12 12:03:46.578457	\N	2025-12-10	13:30	1	\N	\N
24	ORD-022	summer.louise2906@gmail.com	07398671815	collection	Acrefield	65.00	cancelled	paid	stripe	test	2025-12-16 13:12:44.901934	2026-01-12 12:04:09.05321	\N	2025-12-17	16:30	3	\N	\N
18	ORD-016	summer.louise2906@gmail.com	07398671815	collection	Acrefield	250.70	cancelled	pending	card	test	2025-12-09 13:04:37.269753	2026-01-12 12:04:13.093076	\N	2025-12-10	13:00	3	\N	\N
17	ORD-015	summer.louise2906@gmail.com	07398671815	collection	Acrefield	218.00	cancelled	pending	card	test	2025-12-09 13:01:53.917159	2026-01-12 12:04:16.858483	\N	2025-12-10	15:00	3	\N	\N
31	ORD-029	summer.louise2906@gmail.com	07398671815	delivery	sy21 7be	316.10	completed	paid	stripe	bangor	2026-01-12 17:24:39.368016	2026-01-12 17:28:00.985178	\N	2026-01-29	15:30	1	\N	\N
\.


--
-- TOC entry 3629 (class 0 OID 22952)
-- Dependencies: 240
-- Data for Name: upgrade_categories; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.upgrade_categories (id, upgrade_id, name, description, num_choices, is_required, "position", is_active, created_at) FROM stdin;
1	1	Pickles & Olives	All included	\N	f	1	t	2025-12-04 11:53:39.84081
2	1	Meats	3 premium meats included	\N	f	2	t	2025-12-04 11:53:39.84081
3	1	Cheeses	Choose 3 cheeses	3	t	3	t	2025-12-04 11:53:39.84081
4	1	Bread	All included	\N	f	4	t	2025-12-04 11:53:39.84081
5	1	Fruit Selection	Fresh seasonal fruits	\N	f	5	t	2025-12-04 11:53:39.84081
6	1	Cakes	Selection of cakes	\N	f	6	t	2025-12-04 11:53:39.84081
7	1	Salads	Choose 1 salad	1	t	7	t	2025-12-04 11:53:39.84081
\.


--
-- TOC entry 3631 (class 0 OID 22970)
-- Dependencies: 242
-- Data for Name: upgrade_items; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.upgrade_items (id, upgrade_category_id, name, description, is_active, created_at) FROM stdin;
1	1	Pickled Onions	\N	t	2025-12-04 11:53:39.84081
2	1	Gherkins	\N	t	2025-12-04 11:53:39.84081
3	1	Olives	\N	t	2025-12-04 11:53:39.84081
4	2	Pepperoni	\N	t	2025-12-04 11:53:39.84081
5	2	Salami	\N	t	2025-12-04 11:53:39.84081
6	2	Chorizo	\N	t	2025-12-04 11:53:39.84081
7	3	Brie	\N	t	2025-12-04 11:53:39.84081
8	3	Red Leicester	\N	t	2025-12-04 11:53:39.84081
9	3	Cheddar	\N	t	2025-12-04 11:53:39.84081
10	3	Gouda	\N	t	2025-12-04 11:53:39.84081
11	3	Halloumi	\N	t	2025-12-04 11:53:39.84081
12	3	Mozzarella	\N	t	2025-12-04 11:53:39.84081
13	3	Roule	\N	t	2025-12-04 11:53:39.84081
14	4	Breadsticks	\N	t	2025-12-04 11:53:39.84081
15	4	Bruschetta	\N	t	2025-12-04 11:53:39.84081
16	5	Kiwi	\N	t	2025-12-04 11:53:39.84081
17	5	Watermelon	\N	t	2025-12-04 11:53:39.84081
18	5	Grapes	\N	t	2025-12-04 11:53:39.84081
19	5	Strawberries	\N	t	2025-12-04 11:53:39.84081
20	5	Apricots	\N	t	2025-12-04 11:53:39.84081
21	6	Selection of Cakes	\N	t	2025-12-04 11:53:39.84081
22	7	Coleslaw	\N	t	2025-12-04 11:53:39.84081
23	7	Potato Salad	\N	t	2025-12-04 11:53:39.84081
24	7	Greek Salad	\N	t	2025-12-04 11:53:39.84081
\.


--
-- TOC entry 3623 (class 0 OID 22905)
-- Dependencies: 234
-- Data for Name: upgrades; Type: TABLE DATA; Schema: public; Owner: nook_prod_user
--

COPY public.upgrades (id, name, description, price_per_person, is_active, created_at) FROM stdin;
1	Continental	Selection of meats, cheeses, fruits, and more	5.00	t	2025-12-04 11:53:39.84081
\.


--
-- TOC entry 3664 (class 0 OID 0)
-- Dependencies: 227
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 9, true);


--
-- TOC entry 3665 (class 0 OID 0)
-- Dependencies: 229
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.branches_id_seq', 3, true);


--
-- TOC entry 3666 (class 0 OID 0)
-- Dependencies: 235
-- Name: buffet_upgrades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.buffet_upgrades_id_seq', 1, true);


--
-- TOC entry 3667 (class 0 OID 0)
-- Dependencies: 215
-- Name: buffet_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.buffet_versions_id_seq', 1, true);


--
-- TOC entry 3668 (class 0 OID 0)
-- Dependencies: 217
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.categories_id_seq', 15, true);


--
-- TOC entry 3669 (class 0 OID 0)
-- Dependencies: 245
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- TOC entry 3670 (class 0 OID 0)
-- Dependencies: 219
-- Name: menu_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.menu_items_id_seq', 62, true);


--
-- TOC entry 3671 (class 0 OID 0)
-- Dependencies: 243
-- Name: order_buffet_upgrade_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.order_buffet_upgrade_items_id_seq', 12, true);


--
-- TOC entry 3672 (class 0 OID 0)
-- Dependencies: 237
-- Name: order_buffet_upgrades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.order_buffet_upgrades_id_seq', 3, true);


--
-- TOC entry 3673 (class 0 OID 0)
-- Dependencies: 223
-- Name: order_buffets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.order_buffets_id_seq', 40, true);


--
-- TOC entry 3674 (class 0 OID 0)
-- Dependencies: 231
-- Name: order_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.order_config_id_seq', 1, true);


--
-- TOC entry 3675 (class 0 OID 0)
-- Dependencies: 225
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1324, true);


--
-- TOC entry 3676 (class 0 OID 0)
-- Dependencies: 221
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.orders_id_seq', 31, true);


--
-- TOC entry 3677 (class 0 OID 0)
-- Dependencies: 239
-- Name: upgrade_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.upgrade_categories_id_seq', 7, true);


--
-- TOC entry 3678 (class 0 OID 0)
-- Dependencies: 241
-- Name: upgrade_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.upgrade_items_id_seq', 24, true);


--
-- TOC entry 3679 (class 0 OID 0)
-- Dependencies: 233
-- Name: upgrades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nook_prod_user
--

SELECT pg_catalog.setval('public.upgrades_id_seq', 1, true);


--
-- TOC entry 3403 (class 2606 OID 22799)
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- TOC entry 3405 (class 2606 OID 22795)
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 3407 (class 2606 OID 22797)
-- Name: admin_users admin_users_username_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_key UNIQUE (username);


--
-- TOC entry 3412 (class 2606 OID 22870)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 3420 (class 2606 OID 22925)
-- Name: buffet_upgrades buffet_upgrades_buffet_version_id_upgrade_id_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_upgrades
    ADD CONSTRAINT buffet_upgrades_buffet_version_id_upgrade_id_key UNIQUE (buffet_version_id, upgrade_id);


--
-- TOC entry 3422 (class 2606 OID 22923)
-- Name: buffet_upgrades buffet_upgrades_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_upgrades
    ADD CONSTRAINT buffet_upgrades_pkey PRIMARY KEY (id);


--
-- TOC entry 3382 (class 2606 OID 21933)
-- Name: buffet_versions buffet_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_versions
    ADD CONSTRAINT buffet_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 3384 (class 2606 OID 21945)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3439 (class 2606 OID 24193)
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- TOC entry 3441 (class 2606 OID 24191)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 3386 (class 2606 OID 21962)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3437 (class 2606 OID 22993)
-- Name: order_buffet_upgrade_items order_buffet_upgrade_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrade_items
    ADD CONSTRAINT order_buffet_upgrade_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3427 (class 2606 OID 22944)
-- Name: order_buffet_upgrades order_buffet_upgrades_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrades
    ADD CONSTRAINT order_buffet_upgrades_pkey PRIMARY KEY (id);


--
-- TOC entry 3397 (class 2606 OID 22504)
-- Name: order_buffets order_buffets_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets
    ADD CONSTRAINT order_buffets_pkey PRIMARY KEY (id);


--
-- TOC entry 3414 (class 2606 OID 22903)
-- Name: order_config order_config_config_key_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_config
    ADD CONSTRAINT order_config_config_key_key UNIQUE (config_key);


--
-- TOC entry 3416 (class 2606 OID 22901)
-- Name: order_config order_config_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_config
    ADD CONSTRAINT order_config_pkey PRIMARY KEY (id);


--
-- TOC entry 3401 (class 2606 OID 22523)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3392 (class 2606 OID 22494)
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 3394 (class 2606 OID 22492)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3430 (class 2606 OID 22962)
-- Name: upgrade_categories upgrade_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_categories
    ADD CONSTRAINT upgrade_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3433 (class 2606 OID 22979)
-- Name: upgrade_items upgrade_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_items
    ADD CONSTRAINT upgrade_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3418 (class 2606 OID 22914)
-- Name: upgrades upgrades_pkey; Type: CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrades
    ADD CONSTRAINT upgrades_pkey PRIMARY KEY (id);


--
-- TOC entry 3408 (class 1259 OID 23011)
-- Name: idx_admin_users_branch_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_admin_users_branch_id ON public.admin_users USING btree (branch_id);


--
-- TOC entry 3409 (class 1259 OID 22800)
-- Name: idx_admin_users_email; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_admin_users_email ON public.admin_users USING btree (email);


--
-- TOC entry 3410 (class 1259 OID 22801)
-- Name: idx_admin_users_username; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_admin_users_username ON public.admin_users USING btree (username);


--
-- TOC entry 3423 (class 1259 OID 22936)
-- Name: idx_buffet_upgrades_buffet_version; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_buffet_upgrades_buffet_version ON public.buffet_upgrades USING btree (buffet_version_id);


--
-- TOC entry 3442 (class 1259 OID 24194)
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email);


--
-- TOC entry 3434 (class 1259 OID 23043)
-- Name: idx_order_buffet_upgrade_items_order_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_buffet_upgrade_items_order_id ON public.order_buffet_upgrade_items USING btree (order_id);


--
-- TOC entry 3435 (class 1259 OID 22999)
-- Name: idx_order_buffet_upgrade_items_upgrade; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_buffet_upgrade_items_upgrade ON public.order_buffet_upgrade_items USING btree (order_buffet_upgrade_id);


--
-- TOC entry 3424 (class 1259 OID 22950)
-- Name: idx_order_buffet_upgrades_order_buffet; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_buffet_upgrades_order_buffet ON public.order_buffet_upgrades USING btree (order_buffet_id);


--
-- TOC entry 3425 (class 1259 OID 23055)
-- Name: idx_order_buffet_upgrades_order_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_buffet_upgrades_order_id ON public.order_buffet_upgrades USING btree (order_id);


--
-- TOC entry 3395 (class 1259 OID 22536)
-- Name: idx_order_buffets_order_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_buffets_order_id ON public.order_buffets USING btree (order_id);


--
-- TOC entry 3398 (class 1259 OID 22537)
-- Name: idx_order_items_order_buffet_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_items_order_buffet_id ON public.order_items USING btree (order_buffet_id);


--
-- TOC entry 3399 (class 1259 OID 23049)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- TOC entry 3387 (class 1259 OID 22876)
-- Name: idx_orders_branch_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_orders_branch_id ON public.orders USING btree (branch_id);


--
-- TOC entry 3388 (class 1259 OID 22534)
-- Name: idx_orders_customer_email; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_orders_customer_email ON public.orders USING btree (customer_email);


--
-- TOC entry 3389 (class 1259 OID 24200)
-- Name: idx_orders_customer_id; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_orders_customer_id ON public.orders USING btree (customer_id);


--
-- TOC entry 3390 (class 1259 OID 22535)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 3428 (class 1259 OID 22968)
-- Name: idx_upgrade_categories_upgrade; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_upgrade_categories_upgrade ON public.upgrade_categories USING btree (upgrade_id);


--
-- TOC entry 3431 (class 1259 OID 22985)
-- Name: idx_upgrade_items_category; Type: INDEX; Schema: public; Owner: nook_prod_user
--

CREATE INDEX idx_upgrade_items_category ON public.upgrade_items USING btree (upgrade_category_id);


--
-- TOC entry 3452 (class 2606 OID 23006)
-- Name: admin_users admin_users_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3453 (class 2606 OID 22926)
-- Name: buffet_upgrades buffet_upgrades_buffet_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_upgrades
    ADD CONSTRAINT buffet_upgrades_buffet_version_id_fkey FOREIGN KEY (buffet_version_id) REFERENCES public.buffet_versions(id) ON DELETE CASCADE;


--
-- TOC entry 3454 (class 2606 OID 22931)
-- Name: buffet_upgrades buffet_upgrades_upgrade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.buffet_upgrades
    ADD CONSTRAINT buffet_upgrades_upgrade_id_fkey FOREIGN KEY (upgrade_id) REFERENCES public.upgrades(id) ON DELETE CASCADE;


--
-- TOC entry 3443 (class 2606 OID 21946)
-- Name: categories categories_buffet_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_buffet_version_id_fkey FOREIGN KEY (buffet_version_id) REFERENCES public.buffet_versions(id) ON DELETE CASCADE;


--
-- TOC entry 3444 (class 2606 OID 21963)
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- TOC entry 3459 (class 2606 OID 22994)
-- Name: order_buffet_upgrade_items order_buffet_upgrade_items_order_buffet_upgrade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrade_items
    ADD CONSTRAINT order_buffet_upgrade_items_order_buffet_upgrade_id_fkey FOREIGN KEY (order_buffet_upgrade_id) REFERENCES public.order_buffet_upgrades(id) ON DELETE CASCADE;


--
-- TOC entry 3460 (class 2606 OID 23038)
-- Name: order_buffet_upgrade_items order_buffet_upgrade_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrade_items
    ADD CONSTRAINT order_buffet_upgrade_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3455 (class 2606 OID 22945)
-- Name: order_buffet_upgrades order_buffet_upgrades_order_buffet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrades
    ADD CONSTRAINT order_buffet_upgrades_order_buffet_id_fkey FOREIGN KEY (order_buffet_id) REFERENCES public.order_buffets(id) ON DELETE CASCADE;


--
-- TOC entry 3456 (class 2606 OID 23050)
-- Name: order_buffet_upgrades order_buffet_upgrades_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffet_upgrades
    ADD CONSTRAINT order_buffet_upgrades_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3447 (class 2606 OID 22510)
-- Name: order_buffets order_buffets_buffet_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets
    ADD CONSTRAINT order_buffets_buffet_version_id_fkey FOREIGN KEY (buffet_version_id) REFERENCES public.buffet_versions(id);


--
-- TOC entry 3448 (class 2606 OID 22505)
-- Name: order_buffets order_buffets_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_buffets
    ADD CONSTRAINT order_buffets_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3449 (class 2606 OID 22529)
-- Name: order_items order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id);


--
-- TOC entry 3450 (class 2606 OID 22524)
-- Name: order_items order_items_order_buffet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_buffet_id_fkey FOREIGN KEY (order_buffet_id) REFERENCES public.order_buffets(id) ON DELETE CASCADE;


--
-- TOC entry 3451 (class 2606 OID 23044)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3445 (class 2606 OID 22871)
-- Name: orders orders_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- TOC entry 3446 (class 2606 OID 24195)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 3457 (class 2606 OID 22963)
-- Name: upgrade_categories upgrade_categories_upgrade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_categories
    ADD CONSTRAINT upgrade_categories_upgrade_id_fkey FOREIGN KEY (upgrade_id) REFERENCES public.upgrades(id) ON DELETE CASCADE;


--
-- TOC entry 3458 (class 2606 OID 22980)
-- Name: upgrade_items upgrade_items_upgrade_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nook_prod_user
--

ALTER TABLE ONLY public.upgrade_items
    ADD CONSTRAINT upgrade_items_upgrade_category_id_fkey FOREIGN KEY (upgrade_category_id) REFERENCES public.upgrade_categories(id) ON DELETE CASCADE;


--
-- TOC entry 2114 (class 826 OID 19638)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO nook_prod_user;


--
-- TOC entry 2113 (class 826 OID 19637)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO nook_prod_user;


-- Completed on 2026-02-18 12:20:08

--
-- PostgreSQL database dump complete
--

