-- RPC to fetch events since a given time (ms since epoch) optionally scoped by operation
create or replace function event_store.fetch_events(_since_ms bigint, _operation_id uuid default null)
returns setof event_store.events
language sql stable as $$
  select * from event_store.events e
  where e.ts_ms > coalesce(_since_ms, 0)
    and (_operation_id is null or e.operation_id = _operation_id)
  order by e.occurred_at asc
$$;

