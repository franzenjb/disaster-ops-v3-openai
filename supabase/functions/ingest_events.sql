-- RPC to ingest a batch of events idempotently
create or replace function event_store.ingest_events(_events jsonb)
returns table (id uuid, inserted boolean)
language plpgsql security definer as $$
declare
  _e jsonb;
begin
  for _e in select * from jsonb_array_elements(_events)
  loop
    insert into event_store.events (
      id, type, schema_version,
      actor_id, device_id, session_id, operation_id,
      ts_ms, occurred_at, sequence,
      payload,
      causation_id, correlation_id,
      hash, previous_hash
    ) values (
      (_e->>'id')::uuid,
      _e->>'type',
      coalesce((_e->>'schemaVersion')::int, 1),
      _e->>'actorId',
      _e->>'deviceId',
      _e->>'sessionId',
      nullif(_e->>'operationId','')::uuid,
      (_e->>'timestamp')::bigint,
      event_store.ms_to_timestamptz((_e->>'timestamp')::bigint),
      nullif(_e->>'sequence','')::int,
      _e->'payload',
      nullif(_e->>'causationId','')::uuid,
      nullif(_e->>'correlationId','')::uuid,
      _e->>'hash',
      _e->>'previousHash'
    ) on conflict (id) do nothing
    returning event_store.events.id, true
    into id, inserted;

    if not found then
      -- Already existed
      id := (_e->>'id')::uuid;
      inserted := false;
    end if;

    return next;
  end loop;
end
$$;

