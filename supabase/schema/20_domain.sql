-- Core domain and reference tables (initial cut)
create schema if not exists ops;

-- Operations
create table if not exists ops.operations (
  id uuid primary key,
  operation_number text,
  name text not null,
  status text not null default 'active',
  activation_level text not null,
  disaster_type text not null,
  dr_number text,
  created_at timestamptz not null default now(),
  created_by text
);

-- Geography associations (reference datasets can live server-side if desired)
create table if not exists ops.operation_regions (
  operation_id uuid references ops.operations(id) on delete cascade,
  region_code text not null,
  primary key (operation_id, region_code)
);

create table if not exists ops.operation_counties (
  operation_id uuid references ops.operations(id) on delete cascade,
  fips text not null,
  county_name text not null,
  state text not null,
  primary key (operation_id, fips)
);

-- Personnel and roster
create table if not exists ops.persons (
  id uuid primary key,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  home_chapter text
);

create table if not exists ops.roster_assignments (
  id uuid primary key,
  operation_id uuid references ops.operations(id) on delete cascade,
  person_id uuid references ops.persons(id) on delete set null,
  position_code text not null,
  section text not null,
  start_date timestamptz not null,
  end_date timestamptz,
  status text not null default 'active'
);

-- Facilities
create table if not exists ops.facilities (
  id uuid primary key,
  operation_id uuid references ops.operations(id) on delete cascade,
  name text not null,
  type text not null, -- shelter, warehouse, staging, etc.
  address jsonb,
  capacity int,
  contact jsonb,
  status text default 'active'
);

-- Assets (vehicles, equipment)
create table if not exists ops.assets (
  id uuid primary key,
  operation_id uuid references ops.operations(id) on delete cascade,
  asset_type text not null,
  identifier text,
  status text not null default 'available',
  location text,
  metadata jsonb
);

-- Capability/Resource gaps
create table if not exists ops.gaps (
  id uuid primary key,
  operation_id uuid references ops.operations(id) on delete cascade,
  category text not null, -- e.g., staffing, feeding, sheltering, logistics
  description text not null,
  severity text not null, -- low/med/high/critical
  identified_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- IAP (high-level; sections can be projected from events if preferred)
create table if not exists ops.iap_documents (
  id uuid primary key,
  operation_id uuid references ops.operations(id) on delete cascade,
  iap_number int not null,
  period jsonb not null, -- {start, end}
  status text not null default 'draft',
  version int not null default 1,
  created_at timestamptz not null default now(),
  created_by text
);

