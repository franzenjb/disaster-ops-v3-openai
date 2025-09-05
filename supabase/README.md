Supabase backend schema and functions for Disaster Operations Platform v3.

How to use
- Create a new Supabase project.
- Open the SQL editor and apply the files in `schema/` in numeric order.
- Apply functions in `functions/`.
- Set env in the app (`.env.local`) with your Supabase URL and anon key.

Files
- schema/00_extensions.sql — Required extensions
- schema/10_event_store.sql — Canonical event log
- schema/20_domain.sql — Core domain/reference tables
- schema/30_rls.sql — Enable RLS and starter policies (adjust for your org)
- functions/ingest_events.sql — RPC: upsert batch of events idempotently
- functions/fetch_events.sql — RPC: fetch events since a timestamp

Notes
- Start with the event store for sync; domain tables can be populated later or via projections.
- RLS policies here are permissive placeholders; tighten to your auth model.

