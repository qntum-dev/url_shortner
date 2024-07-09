-- Create the database
CREATE DATABASE shortner;

-- Connect to the new database
\c shortner


--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clicks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clicks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clicked_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    ip_address character varying(45),
    user_agent text,
    shortened_url_code character varying(10),
    device character varying(50) NOT NULL
);


ALTER TABLE public.clicks OWNER TO postgres;

--
-- Name: shortened_urls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shortened_urls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    destination text NOT NULL,
    short_code character varying(10) NOT NULL,
    custom_code character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    click_count integer DEFAULT 0,
    prev_destination text DEFAULT 'not_set'::text NOT NULL
);


ALTER TABLE public.shortened_urls OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(50) NOT NULL,
    shortened_url_id uuid,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: shortened_urls shortened_urls_custom_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shortened_urls
    ADD CONSTRAINT shortened_urls_custom_code_key UNIQUE (custom_code);


--
-- Name: shortened_urls shortened_urls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shortened_urls
    ADD CONSTRAINT shortened_urls_pkey PRIMARY KEY (id);


--
-- Name: shortened_urls shortened_urls_short_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shortened_urls
    ADD CONSTRAINT shortened_urls_short_code_key UNIQUE (short_code);


--
-- Name: shortened_urls unique_destination; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shortened_urls
    ADD CONSTRAINT unique_destination UNIQUE (destination);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_shortened_url_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shortened_url_code ON public.clicks USING btree (shortened_url_code);


--
-- Name: idx_shortened_urls_custom_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shortened_urls_custom_code ON public.shortened_urls USING btree (custom_code);


--
-- Name: idx_shortened_urls_short_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shortened_urls_short_code ON public.shortened_urls USING btree (short_code);


--
-- Name: clicks fk_shortened_url_code; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clicks
    ADD CONSTRAINT fk_shortened_url_code FOREIGN KEY (shortened_url_code) REFERENCES public.shortened_urls(short_code);


--
-- Name: users users_shortened_url_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_shortened_url_id_fkey FOREIGN KEY (shortened_url_id) REFERENCES public.shortened_urls(id);


--
-- PostgreSQL database dump complete
--

