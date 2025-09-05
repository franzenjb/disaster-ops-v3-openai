-- Enable RLS and add placeholder policies (adjust for your auth model)
alter table event_store.events enable row level security;
alter table ops.operations enable row level security;
alter table ops.operation_regions enable row level security;
alter table ops.operation_counties enable row level security;
alter table ops.persons enable row level security;
alter table ops.roster_assignments enable row level security;
alter table ops.facilities enable row level security;
alter table ops.assets enable row level security;
alter table ops.gaps enable row level security;
alter table ops.iap_documents enable row level security;

-- Example permissive policies: allow all authenticated users (replace with org scoping)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'event_store' and tablename = 'events' and policyname = 'events_read'
  ) then
    create policy events_read on event_store.events for select to authenticated using (true);
    create policy events_write on event_store.events for insert to authenticated with check (true);
  end if;
end $$;

-- Repeat for ops.* tables
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'ops' and tablename = 'operations' and policyname = 'ops_read') then
    create policy ops_read on ops.operations for select to authenticated using (true);
    create policy ops_write on ops.operations for insert to authenticated with check (true);
    create policy ops_update on ops.operations for update to authenticated using (true) with check (true);
  end if;
end $$;

-- You should scope by tenant/org and membership. This is just a starter.

