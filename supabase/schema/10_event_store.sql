-- Canonical event store schema
create schema if not exists event_store;

create table if not exists event_store.events (
  id uuid primary key,
  type text not null,
  schema_version int not null default 1,

  -- Actor & context
  actor_id text not null,
  device_id text,
  session_id text,
  operation_id uuid,

  -- Time & order
  ts_ms bigint not null,             -- client timestamp (ms since epoch)
  occurred_at timestamptz not null,  -- derived from ts_ms
  sequence int,

  -- Payload
  payload jsonb not null,

  -- Traceability
  causation_id uuid,
  correlation_id uuid,

  -- Integrity
  hash text,
  previous_hash text,

  -- Server metadata
  received_at timestamptz not null default now(),
  source text default 'client'
);

create index if not exists events_operation_time on event_store.events (operation_id, occurred_at);
create index if not exists events_type on event_store.events (type);
create index if not exists events_correlation on event_store.events (correlation_id);

-- Helper to normalize ms timestamp to timestamptz
create or replace function event_store.ms_to_timestamptz(ms bigint)
returns timestamptz language sql immutable as $$
  select to_timestamp(ms::double precision / 1000.0)
$$;

