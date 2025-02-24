-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: notification_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE notification_status AS ENUM (
    'PENDING',
    'SENT',
    'FAILED'
);

--
-- Name: river_job_state; Type: TYPE; Schema: public; Owner: joshuanissenbaum
--

CREATE TYPE river_job_state AS ENUM (
    'available',
    'cancelled',
    'completed',
    'discarded',
    'pending',
    'retryable',
    'running',
    'scheduled'
);

--
-- Name: user_medication_method_schedule_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE user_medication_method_schedule_type AS ENUM (
    'DAYS',
    'INTERVALS',
    'PERIODS',
    'WHEN_NEEDED'
);

--
-- Name: user_medication_recurring_schedule_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE user_medication_recurring_schedule_type AS ENUM (
    'TIME',
    'INTERVALS',
    'PERIODS',
    'WHEN_NEEDED'
);


--
-- Name: user_medication_schedule_log_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE user_medication_schedule_log_status AS ENUM (
    'UPCOMING',
    'TAKEN',
    'MISSED'
);


--
-- Name: river_job_state_in_bitmask(bit, river_job_state); Type: FUNCTION; Schema: public; Owner: joshuanissenbaum
--

CREATE FUNCTION river_job_state_in_bitmask(bitmask bit, state river_job_state) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT CASE state
        WHEN 'available' THEN get_bit(bitmask, 7)
        WHEN 'cancelled' THEN get_bit(bitmask, 6)
        WHEN 'completed' THEN get_bit(bitmask, 5)
        WHEN 'discarded' THEN get_bit(bitmask, 4)
        WHEN 'pending' THEN get_bit(bitmask, 3)
        WHEN 'retryable' THEN get_bit(bitmask, 2)
        WHEN 'running' THEN get_bit(bitmask, 1)
        WHEN 'scheduled' THEN get_bit(bitmask, 0)
        ELSE 0
    END = 1;
$$;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: medications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE medications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    strength character varying(255),
    name text,
    brand_name text,
    active_ingredient text,
    active_ingredient_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, active_ingredient)) STORED,
    brand_name_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, brand_name)) STORED
);

--
-- Name: notification_deliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE notification_deliveries (
    user_medication_schedule_id uuid NOT NULL,
    notification_date timestamp with time zone NOT NULL,
    status notification_status NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    id uuid DEFAULT gen_random_uuid()
);

--
-- Name: river_client; Type: TABLE; Schema: public; Owner: joshuanissenbaum
--

CREATE UNLOGGED TABLE river_client (
    id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    paused_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT name_length CHECK (((char_length(id) > 0) AND (char_length(id) < 128)))
);

--
-- Name: river_client_queue; Type: TABLE; Schema: public; Owner: joshuanissenbaum
--

CREATE UNLOGGED TABLE river_client_queue (
    river_client_id text NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    max_workers bigint DEFAULT 0 NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    num_jobs_completed bigint DEFAULT 0 NOT NULL,
    num_jobs_running bigint DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT name_length CHECK (((char_length(name) > 0) AND (char_length(name) < 128))),
    CONSTRAINT num_jobs_completed_zero_or_positive CHECK ((num_jobs_completed >= 0)),
    CONSTRAINT num_jobs_running_zero_or_positive CHECK ((num_jobs_running >= 0))
);

--
-- Name: river_job; Type: TABLE; Schema: public; Owner: joshuanissenbaum
--

CREATE TABLE river_job (
    id bigint NOT NULL,
    state river_job_state DEFAULT 'available'::river_job_state NOT NULL,
    attempt smallint DEFAULT 0 NOT NULL,
    max_attempts smallint NOT NULL,
    attempted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    finalized_at timestamp with time zone,
    scheduled_at timestamp with time zone DEFAULT now() NOT NULL,
    priority smallint DEFAULT 1 NOT NULL,
    args jsonb NOT NULL,
    attempted_by text[],
    errors jsonb[],
    kind text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    queue text DEFAULT 'default'::text NOT NULL,
    tags character varying(255)[] DEFAULT '{}'::character varying[] NOT NULL,
    unique_key bytea,
    unique_states bit(8),
    CONSTRAINT finalized_or_finalized_at_null CHECK ((((finalized_at IS NULL) AND (state <> ALL (ARRAY['cancelled'::river_job_state, 'completed'::river_job_state, 'discarded'::river_job_state]))) OR ((finalized_at IS NOT NULL) AND (state = ANY (ARRAY['cancelled'::river_job_state, 'completed'::river_job_state, 'discarded'::river_job_state]))))),
    CONSTRAINT kind_length CHECK (((char_length(kind) > 0) AND (char_length(kind) < 128))),
    CONSTRAINT max_attempts_is_positive CHECK ((max_attempts > 0)),
    CONSTRAINT priority_in_range CHECK (((priority >= 1) AND (priority <= 4))),
    CONSTRAINT queue_length CHECK (((char_length(queue) > 0) AND (char_length(queue) < 128)))
);

--
-- Name: river_job_id_seq; Type: SEQUENCE; Schema: public; Owner: joshuanissenbaum
--

CREATE SEQUENCE river_job_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: river_job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: joshuanissenbaum
--

ALTER SEQUENCE river_job_id_seq OWNED BY river_job.id;


--
-- Name: river_leader; Type: TABLE; Schema: public; Owner: joshuanissenbaum
--

CREATE UNLOGGED TABLE river_leader (
    elected_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    leader_id text NOT NULL,
    name text DEFAULT 'default'::text NOT NULL,
    CONSTRAINT leader_id_length CHECK (((char_length(leader_id) > 0) AND (char_length(leader_id) < 128))),
    CONSTRAINT name_length CHECK ((name = 'default'::text))
);

--
-- Name: river_migration; Type: TABLE; Schema: public; Owner: joshuanissenbaum
--

CREATE TABLE river_migration (
    line text NOT NULL,
    version bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT line_length CHECK (((char_length(line) > 0) AND (char_length(line) < 128))),
    CONSTRAINT version_gte_1 CHECK ((version >= 1))
);


--
-- Name: river_queue; Type: TABLE; Schema: public; Owner: joshuanissenbaum
--

CREATE TABLE river_queue (
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    paused_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL
);

--
-- Name: user_fcm_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE user_fcm_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    token character varying(255),
    user_id uuid
);

--
-- Name: user_medication_consumptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE user_medication_consumptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    due_date timestamp with time zone,
    status user_medication_schedule_log_status DEFAULT 'UPCOMING'::user_medication_schedule_log_status,
    user_medication_id uuid NOT NULL,
    dose_date timestamp with time zone
);

--
-- Name: user_medication_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE user_medication_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    user_medication_id uuid NOT NULL,
    method_type user_medication_method_schedule_type NOT NULL,
    recurring_type user_medication_recurring_schedule_type NOT NULL,
    days_of_week character varying(10)[],
    time_slots time with time zone[],
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    days_interval bigint,
    hours_interval bigint,
    use_for_days bigint,
    pause_for_days bigint,
    use_for_hours bigint,
    pause_for_hours bigint,
    refills_amount bigint,
    doses_amount bigint
);

--
-- Name: user_medications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE user_medications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    user_id uuid,
    medication_id uuid,
    strength character varying(255),
    reminder_date_time timestamp with time zone,
    name character varying(255),
    tag_linked boolean DEFAULT false
);

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone,
    email character varying(255),
    password character varying(255),
    time_zone character varying(255)
);

--
-- Name: river_job id; Type: DEFAULT; Schema: public; Owner: joshuanissenbaum
--

ALTER TABLE ONLY river_job ALTER COLUMN id SET DEFAULT nextval('river_job_id_seq'::regclass);


--
-- Name: medications medications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY medications
    ADD CONSTRAINT medications_pkey PRIMARY KEY (id);


--
-- Name: river_client river_client_pkey; Type: CONSTRAINT; Schema: public; Owner: joshuanissenbaum
--

ALTER TABLE ONLY river_client
    ADD CONSTRAINT river_client_pkey PRIMARY KEY (id);


--
-- Name: river_client_queue river_client_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: joshuanissenbaum
--

ALTER TABLE ONLY river_client_queue
    ADD CONSTRAINT river_client_queue_pkey PRIMARY KEY (river_client_id, name);


--
-- Name: river_job river_job_pkey; Type: CONSTRAINT; Schema: public; Owner: joshuanissenbaum
--

ALTER TABLE ONLY river_job
    ADD CONSTRAINT river_job_pkey PRIMARY KEY (id);


--
-- Name: river_leader river_leader_pkey; Type: CONSTRAINT; Schema: public; Owner: joshuanissenbaum
--

ALTER TABLE ONLY river_leader
    ADD CONSTRAINT river_leader_pkey PRIMARY KEY (name);


--
-- Name: river_migration river_migration_pkey1; Type: CONSTRAINT; Schema: public; Owner: joshuanissenbaum
--

ALTER TABLE ONLY river_migration
    ADD CONSTRAINT river_migration_pkey1 PRIMARY KEY (line, version);


--
-- Name: river_queue river_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: joshuanissenbaum
--

ALTER TABLE ONLY river_queue
    ADD CONSTRAINT river_queue_pkey PRIMARY KEY (name);


--
-- Name: users uni_users_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users
    ADD CONSTRAINT uni_users_email UNIQUE (email);


--
-- Name: user_fcm_tokens user_fcm_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_fcm_tokens
    ADD CONSTRAINT user_fcm_tokens_pkey PRIMARY KEY (id);


--
-- Name: user_medication_consumptions user_medication_consumptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_medication_consumptions
    ADD CONSTRAINT user_medication_consumptions_pkey PRIMARY KEY (id);


--
-- Name: user_medication_schedules user_medication_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_medication_schedules
    ADD CONSTRAINT user_medication_schedules_pkey PRIMARY KEY (id);


--
-- Name: user_medications user_medications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_medications
    ADD CONSTRAINT user_medications_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_medications_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medications_deleted_at ON medications USING btree (deleted_at);


--
-- Name: idx_notification_deliveries_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_deliveries_deleted_at ON notification_deliveries USING btree (deleted_at);


--
-- Name: idx_notification_deliveries_user_medication_schedule_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_deliveries_user_medication_schedule_id ON notification_deliveries USING btree (user_medication_schedule_id);


--
-- Name: idx_user_fcm_tokens_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_fcm_tokens_deleted_at ON user_fcm_tokens USING btree (deleted_at);


--
-- Name: idx_user_medication_consumptions_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_medication_consumptions_deleted_at ON user_medication_consumptions USING btree (deleted_at);


--
-- Name: idx_user_medication_consumptions_user_medication_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_medication_consumptions_user_medication_id ON user_medication_consumptions USING btree (user_medication_id);


--
-- Name: idx_user_medication_schedules_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_medication_schedules_deleted_at ON user_medication_schedules USING btree (deleted_at);


--
-- Name: idx_user_medication_schedules_user_medication_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_medication_schedules_user_medication_id ON user_medication_schedules USING btree (user_medication_id);


--
-- Name: idx_user_medications_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_medications_deleted_at ON user_medications USING btree (deleted_at);


--
-- Name: idx_users_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_deleted_at ON users USING btree (deleted_at);


--
-- Name: medications_active_ingredient_trgm_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medications_active_ingredient_trgm_idx ON medications USING gin (active_ingredient gin_trgm_ops);


--
-- Name: medications_active_ingredient_tsv_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medications_active_ingredient_tsv_idx ON medications USING gin (active_ingredient_tsv);


--
-- Name: medications_brand_name_trgm_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medications_brand_name_trgm_idx ON medications USING gin (brand_name gin_trgm_ops);


--
-- Name: medications_brand_name_tsv_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medications_brand_name_tsv_idx ON medications USING gin (brand_name_tsv);


--
-- Name: river_job_args_index; Type: INDEX; Schema: public; Owner: joshuanissenbaum
--

CREATE INDEX river_job_args_index ON river_job USING gin (args);


--
-- Name: river_job_kind; Type: INDEX; Schema: public; Owner: joshuanissenbaum
--

CREATE INDEX river_job_kind ON river_job USING btree (kind);


--
-- Name: river_job_metadata_index; Type: INDEX; Schema: public; Owner: joshuanissenbaum
--

CREATE INDEX river_job_metadata_index ON river_job USING gin (metadata);


--
-- Name: river_job_prioritized_fetching_index; Type: INDEX; Schema: public; Owner: joshuanissenbaum
--

CREATE INDEX river_job_prioritized_fetching_index ON river_job USING btree (state, queue, priority, scheduled_at, id);


--
-- Name: river_job_state_and_finalized_at_index; Type: INDEX; Schema: public; Owner: joshuanissenbaum
--

CREATE INDEX river_job_state_and_finalized_at_index ON river_job USING btree (state, finalized_at) WHERE (finalized_at IS NOT NULL);


--
-- Name: river_job_unique_idx; Type: INDEX; Schema: public; Owner: joshuanissenbaum
--

CREATE UNIQUE INDEX river_job_unique_idx ON river_job USING btree (unique_key) WHERE ((unique_key IS NOT NULL) AND (unique_states IS NOT NULL) AND river_job_state_in_bitmask(unique_states, state));


--
-- Name: notification_deliveries fk_notification_deliveries_user_medication_schedule; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY notification_deliveries
    ADD CONSTRAINT fk_notification_deliveries_user_medication_schedule FOREIGN KEY (user_medication_schedule_id) REFERENCES user_medication_schedules(id) ON DELETE CASCADE;


--
-- Name: user_fcm_tokens fk_user_fcm_tokens_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_fcm_tokens
    ADD CONSTRAINT fk_user_fcm_tokens_user FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: user_medication_consumptions fk_user_medication_consumptions_user_medication; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_medication_consumptions
    ADD CONSTRAINT fk_user_medication_consumptions_user_medication FOREIGN KEY (user_medication_id) REFERENCES user_medications(id) ON DELETE CASCADE;


--
-- Name: notification_deliveries fk_user_medication_schedules_notification_deliveries; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY notification_deliveries
    ADD CONSTRAINT fk_user_medication_schedules_notification_deliveries FOREIGN KEY (user_medication_schedule_id) REFERENCES user_medication_schedules(id);


--
-- Name: user_medication_schedules fk_user_medication_schedules_user_medication; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_medication_schedules
    ADD CONSTRAINT fk_user_medication_schedules_user_medication FOREIGN KEY (user_medication_id) REFERENCES user_medications(id) ON DELETE CASCADE;


--
-- Name: user_medications fk_user_medications_medication; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_medications
    ADD CONSTRAINT fk_user_medications_medication FOREIGN KEY (medication_id) REFERENCES medications(id);


--
-- Name: user_medication_schedules fk_user_medications_schedule; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_medication_schedules
    ADD CONSTRAINT fk_user_medications_schedule FOREIGN KEY (user_medication_id) REFERENCES user_medications(id);


--
-- Name: user_medications fk_user_medications_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_medications
    ADD CONSTRAINT fk_user_medications_user FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: user_fcm_tokens fk_users_fcm_tokens; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY user_fcm_tokens
    ADD CONSTRAINT fk_users_fcm_tokens FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: river_client_queue river_client_queue_river_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: joshuanissenbaum
--

ALTER TABLE ONLY river_client_queue
    ADD CONSTRAINT river_client_queue_river_client_id_fkey FOREIGN KEY (river_client_id) REFERENCES river_client(id) ON DELETE CASCADE;
