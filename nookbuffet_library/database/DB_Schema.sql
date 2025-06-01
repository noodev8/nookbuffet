--
-- PostgreSQL database dump
--

-- Dumped from database version 11.18 (Debian 11.18-0+deb10u1)
-- Dumped by pg_dump version 17.4

-- Started on 2025-06-01 01:31:12

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
-- TOC entry 6 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 620 (class 1247 OID 23740)
-- Name: admin_role; Type: TYPE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TYPE public.admin_role AS ENUM (
    'admin',
    'staff',
    'manager'
);


ALTER TYPE public.admin_role OWNER TO nookbuffet_dev_user;

--
-- TOC entry 614 (class 1247 OID 23720)
-- Name: booking_status; Type: TYPE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TYPE public.booking_status AS ENUM (
    'pending',
    'confirmed',
    'rejected',
    'cancelled'
);


ALTER TYPE public.booking_status OWNER TO nookbuffet_dev_user;

--
-- TOC entry 611 (class 1247 OID 23710)
-- Name: dietary_pref; Type: TYPE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TYPE public.dietary_pref AS ENUM (
    'none',
    'vegetarian',
    'vegan',
    'mixed'
);


ALTER TYPE public.dietary_pref OWNER TO nookbuffet_dev_user;

--
-- TOC entry 608 (class 1247 OID 23699)
-- Name: menu_category; Type: TYPE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TYPE public.menu_category AS ENUM (
    'sandwich',
    'side',
    'drink',
    'dessert',
    'other'
);


ALTER TYPE public.menu_category OWNER TO nookbuffet_dev_user;

--
-- TOC entry 617 (class 1247 OID 23730)
-- Name: setting_type_enum; Type: TYPE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TYPE public.setting_type_enum AS ENUM (
    'string',
    'number',
    'boolean',
    'json'
);


ALTER TYPE public.setting_type_enum OWNER TO nookbuffet_dev_user;

SET default_tablespace = '';

--
-- TOC entry 215 (class 1259 OID 23930)
-- Name: admin_users; Type: TABLE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(200) NOT NULL,
    role public.admin_role DEFAULT 'staff'::public.admin_role,
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_users OWNER TO nookbuffet_dev_user;

--
-- TOC entry 214 (class 1259 OID 23928)
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_users_id_seq OWNER TO nookbuffet_dev_user;

--
-- TOC entry 3087 (class 0 OID 0)
-- Dependencies: 214
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nookbuffet_dev_user
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- TOC entry 197 (class 1259 OID 23749)
-- Name: app_user; Type: TABLE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TABLE public.app_user (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    password_hash character varying(255) NOT NULL,
    subscribe_newsletter boolean DEFAULT false,
    created_at timestamp with time zone,
    email_verified boolean,
    verification_token character varying(64),
    verification_expires timestamp with time zone,
    accessed timestamp with time zone
);


ALTER TABLE public.app_user OWNER TO nookbuffet_dev_user;

--
-- TOC entry 196 (class 1259 OID 23747)
-- Name: app_user_id_seq; Type: SEQUENCE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE SEQUENCE public.app_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.app_user_id_seq OWNER TO nookbuffet_dev_user;

--
-- TOC entry 3088 (class 0 OID 0)
-- Dependencies: 196
-- Name: app_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nookbuffet_dev_user
--

ALTER SEQUENCE public.app_user_id_seq OWNED BY public.app_user.id;


--
-- TOC entry 213 (class 1259 OID 23915)
-- Name: available_time_slots; Type: TABLE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TABLE public.available_time_slots (
    id integer NOT NULL,
    time_slot character varying(10) NOT NULL,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.available_time_slots OWNER TO nookbuffet_dev_user;

--
-- TOC entry 212 (class 1259 OID 23913)
-- Name: available_time_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE SEQUENCE public.available_time_slots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.available_time_slots_id_seq OWNER TO nookbuffet_dev_user;

--
-- TOC entry 3089 (class 0 OID 0)
-- Dependencies: 212
-- Name: available_time_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nookbuffet_dev_user
--

ALTER SEQUENCE public.available_time_slots_id_seq OWNED BY public.available_time_slots.id;


--
-- TOC entry 211 (class 1259 OID 23896)
-- Name: booking_status_history; Type: TABLE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TABLE public.booking_status_history (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    old_status public.booking_status,
    new_status public.booking_status NOT NULL,
    changed_by character varying(100),
    change_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.booking_status_history OWNER TO nookbuffet_dev_user;

--
-- TOC entry 210 (class 1259 OID 23894)
-- Name: booking_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE SEQUENCE public.booking_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_status_history_id_seq OWNER TO nookbuffet_dev_user;

--
-- TOC entry 3090 (class 0 OID 0)
-- Dependencies: 210
-- Name: booking_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nookbuffet_dev_user
--

ALTER SEQUENCE public.booking_status_history_id_seq OWNED BY public.booking_status_history.id;


--
-- TOC entry 207 (class 1259 OID 23847)
-- Name: bookings; Type: TABLE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    user_id integer,
    buffet_id integer NOT NULL,
    buffet_name character varying(100) NOT NULL,
    buffet_price numeric(10,2) NOT NULL,
    booking_date date NOT NULL,
    booking_time character varying(10) NOT NULL,
    number_of_people integer NOT NULL,
    dietary_preference public.dietary_pref DEFAULT 'none'::public.dietary_pref,
    special_requests text,
    status public.booking_status DEFAULT 'pending'::public.booking_status,
    total_price numeric(10,2) NOT NULL,
    customer_name character varying(200) NOT NULL,
    customer_email character varying(255) NOT NULL,
    customer_phone character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bookings OWNER TO nookbuffet_dev_user;

--
-- TOC entry 206 (class 1259 OID 23845)
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO nookbuffet_dev_user;

--
-- TOC entry 3091 (class 0 OID 0)
-- Dependencies: 206
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nookbuffet_dev_user
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- TOC entry 203 (class 1259 OID 23806)
-- Name: buffet_menu_items; Type: TABLE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TABLE public.buffet_menu_items (
    id integer NOT NULL,
    buffet_id integer NOT NULL,
    menu_item_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.buffet_menu_items OWNER TO nookbuffet_dev_user;

--
-- TOC entry 202 (class 1259 OID 23804)
-- Name: buffet_menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE SEQUENCE public.buffet_menu_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buffet_menu_items_id_seq OWNER TO nookbuffet_dev_user;

--
-- TOC entry 3092 (class 0 OID 0)
-- Dependencies: 202
-- Name: buffet_menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nookbuffet_dev_user
--

ALTER SEQUENCE public.buffet_menu_items_id_seq OWNED BY public.buffet_menu_items.id;


--
-- TOC entry 199 (class 1259 OID 23765)
-- Name: buffet_options; Type: TABLE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TABLE public.buffet_options (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    image_path character varying(255),
    is_popular boolean DEFAULT false,
    is_available boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.buffet_options OWNER TO nookbuffet_dev_user;

--
-- TOC entry 198 (class 1259 OID 23763)
-- Name: buffet_options_id_seq; Type: SEQUENCE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE SEQUENCE public.buffet_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buffet_options_id_seq OWNER TO nookbuffet_dev_user;

--
-- TOC entry 3093 (class 0 OID 0)
-- Dependencies: 198
-- Name: buffet_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nookbuffet_dev_user
--

ALTER SEQUENCE public.buffet_options_id_seq OWNED BY public.buffet_options.id;


--
-- TOC entry 209 (class 1259 OID 23878)
-- Name: business_settings; Type: TABLE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TABLE public.business_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    setting_type public.setting_type_enum DEFAULT 'string'::public.setting_type_enum,
    description text,
    is_public boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.business_settings OWNER TO nookbuffet_dev_user;

--
-- TOC entry 208 (class 1259 OID 23876)
-- Name: business_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE SEQUENCE public.business_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.business_settings_id_seq OWNER TO nookbuffet_dev_user;

--
-- TOC entry 3094 (class 0 OID 0)
-- Dependencies: 208
-- Name: business_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nookbuffet_dev_user
--

ALTER SEQUENCE public.business_settings_id_seq OWNED BY public.business_settings.id;


--
-- TOC entry 205 (class 1259 OID 23829)
-- Name: dietary_options; Type: TABLE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TABLE public.dietary_options (
    id integer NOT NULL,
    buffet_id integer NOT NULL,
    option_name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dietary_options OWNER TO nookbuffet_dev_user;

--
-- TOC entry 204 (class 1259 OID 23827)
-- Name: dietary_options_id_seq; Type: SEQUENCE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE SEQUENCE public.dietary_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dietary_options_id_seq OWNER TO nookbuffet_dev_user;

--
-- TOC entry 3095 (class 0 OID 0)
-- Dependencies: 204
-- Name: dietary_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nookbuffet_dev_user
--

ALTER SEQUENCE public.dietary_options_id_seq OWNED BY public.dietary_options.id;


--
-- TOC entry 201 (class 1259 OID 23785)
-- Name: menu_items; Type: TABLE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE TABLE public.menu_items (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    category public.menu_category NOT NULL,
    is_vegetarian boolean DEFAULT false,
    is_vegan boolean DEFAULT false,
    is_gluten_free boolean DEFAULT false,
    description text,
    allergens text,
    is_available boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menu_items OWNER TO nookbuffet_dev_user;

--
-- TOC entry 200 (class 1259 OID 23783)
-- Name: menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: nookbuffet_dev_user
--

CREATE SEQUENCE public.menu_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_items_id_seq OWNER TO nookbuffet_dev_user;

--
-- TOC entry 3096 (class 0 OID 0)
-- Dependencies: 200
-- Name: menu_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: nookbuffet_dev_user
--

ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;


--
-- TOC entry 2888 (class 2604 OID 23933)
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- TOC entry 2854 (class 2604 OID 23752)
-- Name: app_user id; Type: DEFAULT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.app_user ALTER COLUMN id SET DEFAULT nextval('public.app_user_id_seq'::regclass);


--
-- TOC entry 2884 (class 2604 OID 23918)
-- Name: available_time_slots id; Type: DEFAULT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.available_time_slots ALTER COLUMN id SET DEFAULT nextval('public.available_time_slots_id_seq'::regclass);


--
-- TOC entry 2882 (class 2604 OID 23899)
-- Name: booking_status_history id; Type: DEFAULT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.booking_status_history ALTER COLUMN id SET DEFAULT nextval('public.booking_status_history_id_seq'::regclass);


--
-- TOC entry 2873 (class 2604 OID 23850)
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- TOC entry 2869 (class 2604 OID 23809)
-- Name: buffet_menu_items id; Type: DEFAULT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.buffet_menu_items ALTER COLUMN id SET DEFAULT nextval('public.buffet_menu_items_id_seq'::regclass);


--
-- TOC entry 2856 (class 2604 OID 23768)
-- Name: buffet_options id; Type: DEFAULT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.buffet_options ALTER COLUMN id SET DEFAULT nextval('public.buffet_options_id_seq'::regclass);


--
-- TOC entry 2878 (class 2604 OID 23881)
-- Name: business_settings id; Type: DEFAULT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.business_settings ALTER COLUMN id SET DEFAULT nextval('public.business_settings_id_seq'::regclass);


--
-- TOC entry 2871 (class 2604 OID 23832)
-- Name: dietary_options id; Type: DEFAULT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.dietary_options ALTER COLUMN id SET DEFAULT nextval('public.dietary_options_id_seq'::regclass);


--
-- TOC entry 2862 (class 2604 OID 23788)
-- Name: menu_items id; Type: DEFAULT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);


--
-- TOC entry 2945 (class 2606 OID 23946)
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- TOC entry 2947 (class 2606 OID 23942)
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 2949 (class 2606 OID 23944)
-- Name: admin_users admin_users_username_key; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_key UNIQUE (username);


--
-- TOC entry 2894 (class 2606 OID 23760)
-- Name: app_user app_user_email_key; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_email_key UNIQUE (email);


--
-- TOC entry 2896 (class 2606 OID 23758)
-- Name: app_user app_user_pkey; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_pkey PRIMARY KEY (id);


--
-- TOC entry 2939 (class 2606 OID 23923)
-- Name: available_time_slots available_time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.available_time_slots
    ADD CONSTRAINT available_time_slots_pkey PRIMARY KEY (id);


--
-- TOC entry 2935 (class 2606 OID 23905)
-- Name: booking_status_history booking_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.booking_status_history
    ADD CONSTRAINT booking_status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 2921 (class 2606 OID 23859)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 2912 (class 2606 OID 23812)
-- Name: buffet_menu_items buffet_menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.buffet_menu_items
    ADD CONSTRAINT buffet_menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 2900 (class 2606 OID 23778)
-- Name: buffet_options buffet_options_pkey; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.buffet_options
    ADD CONSTRAINT buffet_options_pkey PRIMARY KEY (id);


--
-- TOC entry 2929 (class 2606 OID 23889)
-- Name: business_settings business_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 2931 (class 2606 OID 23891)
-- Name: business_settings business_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.business_settings
    ADD CONSTRAINT business_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 2918 (class 2606 OID 23838)
-- Name: dietary_options dietary_options_pkey; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.dietary_options
    ADD CONSTRAINT dietary_options_pkey PRIMARY KEY (id);


--
-- TOC entry 2910 (class 2606 OID 23799)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 2916 (class 2606 OID 23824)
-- Name: buffet_menu_items unique_buffet_item; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.buffet_menu_items
    ADD CONSTRAINT unique_buffet_item UNIQUE (buffet_id, menu_item_id);


--
-- TOC entry 2943 (class 2606 OID 23925)
-- Name: available_time_slots unique_time_slot; Type: CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.available_time_slots
    ADD CONSTRAINT unique_time_slot UNIQUE (time_slot);


--
-- TOC entry 2901 (class 1259 OID 23781)
-- Name: idx_available; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_available ON public.buffet_options USING btree (is_available);


--
-- TOC entry 2905 (class 1259 OID 23803)
-- Name: idx_available_menu; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_available_menu ON public.menu_items USING btree (is_available);


--
-- TOC entry 2922 (class 1259 OID 23872)
-- Name: idx_booking_date; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_booking_date ON public.bookings USING btree (booking_date);


--
-- TOC entry 2936 (class 1259 OID 23911)
-- Name: idx_booking_id_history; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_booking_id_history ON public.booking_status_history USING btree (booking_id);


--
-- TOC entry 2923 (class 1259 OID 23871)
-- Name: idx_buffet_id_booking; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_buffet_id_booking ON public.bookings USING btree (buffet_id);


--
-- TOC entry 2919 (class 1259 OID 23844)
-- Name: idx_buffet_id_dietary; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_buffet_id_dietary ON public.dietary_options USING btree (buffet_id);


--
-- TOC entry 2913 (class 1259 OID 23825)
-- Name: idx_buffet_id_menu; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_buffet_id_menu ON public.buffet_menu_items USING btree (buffet_id);


--
-- TOC entry 2906 (class 1259 OID 23800)
-- Name: idx_category; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_category ON public.menu_items USING btree (category);


--
-- TOC entry 2924 (class 1259 OID 23875)
-- Name: idx_created_at_booking; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_created_at_booking ON public.bookings USING btree (created_at);


--
-- TOC entry 2937 (class 1259 OID 23912)
-- Name: idx_created_at_history; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_created_at_history ON public.booking_status_history USING btree (created_at);


--
-- TOC entry 2925 (class 1259 OID 23874)
-- Name: idx_customer_email; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_customer_email ON public.bookings USING btree (customer_email);


--
-- TOC entry 2902 (class 1259 OID 23782)
-- Name: idx_display_order; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_display_order ON public.buffet_options USING btree (display_order);


--
-- TOC entry 2940 (class 1259 OID 23927)
-- Name: idx_display_order_slot; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_display_order_slot ON public.available_time_slots USING btree (display_order);


--
-- TOC entry 2897 (class 1259 OID 23761)
-- Name: idx_email; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_email ON public.app_user USING btree (email);


--
-- TOC entry 2950 (class 1259 OID 23948)
-- Name: idx_email_admin; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_email_admin ON public.admin_users USING btree (email);


--
-- TOC entry 2951 (class 1259 OID 23950)
-- Name: idx_is_active_admin; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_is_active_admin ON public.admin_users USING btree (is_active);


--
-- TOC entry 2941 (class 1259 OID 23926)
-- Name: idx_is_active_slot; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_is_active_slot ON public.available_time_slots USING btree (is_active);


--
-- TOC entry 2932 (class 1259 OID 23893)
-- Name: idx_is_public; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_is_public ON public.business_settings USING btree (is_public);


--
-- TOC entry 2914 (class 1259 OID 23826)
-- Name: idx_menu_item_id_menu; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_menu_item_id_menu ON public.buffet_menu_items USING btree (menu_item_id);


--
-- TOC entry 2898 (class 1259 OID 23762)
-- Name: idx_phone; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_phone ON public.app_user USING btree (phone);


--
-- TOC entry 2903 (class 1259 OID 23780)
-- Name: idx_popular; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_popular ON public.buffet_options USING btree (is_popular);


--
-- TOC entry 2904 (class 1259 OID 23779)
-- Name: idx_price; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_price ON public.buffet_options USING btree (price);


--
-- TOC entry 2952 (class 1259 OID 23949)
-- Name: idx_role_admin; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_role_admin ON public.admin_users USING btree (role);


--
-- TOC entry 2933 (class 1259 OID 23892)
-- Name: idx_setting_key; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_setting_key ON public.business_settings USING btree (setting_key);


--
-- TOC entry 2926 (class 1259 OID 23873)
-- Name: idx_status; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_status ON public.bookings USING btree (status);


--
-- TOC entry 2927 (class 1259 OID 23870)
-- Name: idx_user_id; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_user_id ON public.bookings USING btree (user_id);


--
-- TOC entry 2953 (class 1259 OID 23947)
-- Name: idx_username; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_username ON public.admin_users USING btree (username);


--
-- TOC entry 2907 (class 1259 OID 23802)
-- Name: idx_vegan; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_vegan ON public.menu_items USING btree (is_vegan);


--
-- TOC entry 2908 (class 1259 OID 23801)
-- Name: idx_vegetarian; Type: INDEX; Schema: public; Owner: nookbuffet_dev_user
--

CREATE INDEX idx_vegetarian ON public.menu_items USING btree (is_vegetarian);


--
-- TOC entry 2959 (class 2606 OID 23906)
-- Name: booking_status_history booking_status_history_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.booking_status_history
    ADD CONSTRAINT booking_status_history_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- TOC entry 2957 (class 2606 OID 23865)
-- Name: bookings bookings_buffet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_buffet_id_fkey FOREIGN KEY (buffet_id) REFERENCES public.buffet_options(id);


--
-- TOC entry 2958 (class 2606 OID 23860)
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_user(id) ON DELETE SET NULL;


--
-- TOC entry 2954 (class 2606 OID 23813)
-- Name: buffet_menu_items buffet_menu_items_buffet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.buffet_menu_items
    ADD CONSTRAINT buffet_menu_items_buffet_id_fkey FOREIGN KEY (buffet_id) REFERENCES public.buffet_options(id) ON DELETE CASCADE;


--
-- TOC entry 2955 (class 2606 OID 23818)
-- Name: buffet_menu_items buffet_menu_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.buffet_menu_items
    ADD CONSTRAINT buffet_menu_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- TOC entry 2956 (class 2606 OID 23839)
-- Name: dietary_options dietary_options_buffet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: nookbuffet_dev_user
--

ALTER TABLE ONLY public.dietary_options
    ADD CONSTRAINT dietary_options_buffet_id_fkey FOREIGN KEY (buffet_id) REFERENCES public.buffet_options(id) ON DELETE CASCADE;


--
-- TOC entry 3086 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2025-06-01 01:31:13

--
-- PostgreSQL database dump complete
--

