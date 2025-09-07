-- DISASTER-OPS-V3 SUPABASE DATABASE SETUP
-- Phase 1: Emergency Foundation Setup
-- This replaces the complex event sourcing architecture with simple, reliable tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Operations table (replaces complex event-sourced operations)
CREATE TABLE operations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  disaster_type text NOT NULL,
  activation_level text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  creator_name text,
  creator_email text,
  creator_phone text,
  regions text[], -- JSON array of region names
  counties text[], -- JSON array of county names
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Facilities table (replaces complex facility projections)
CREATE TABLE facilities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id uuid REFERENCES operations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL, -- 'shelter', 'feeding', 'distribution', etc.
  discipline text NOT NULL, -- 'Sheltering', 'Feeding', 'Mass Care/DES', etc.
  address text,
  county text,
  coordinates point, -- PostGIS point for lat/lng
  status text DEFAULT 'active',
  capacity jsonb, -- Flexible capacity data (beds, meals, etc.)
  contact_info jsonb, -- Phone, email, manager details
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid -- References auth.users
);

-- Personnel assignments (replaces complex roster projections)
CREATE TABLE personnel_assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id uuid REFERENCES operations(id) ON DELETE CASCADE,
  facility_id uuid REFERENCES facilities(id) ON DELETE CASCADE,
  person_name text NOT NULL,
  person_email text,
  person_phone text,
  role text NOT NULL,
  ics_position text,
  section text, -- ICS section
  shift text, -- Day/Night/24hr
  start_date date,
  end_date date,
  status text DEFAULT 'assigned',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid -- References auth.users
);

-- IAP documents (replaces complex event-sourced IAP projections)
CREATE TABLE iap_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id uuid REFERENCES operations(id) ON DELETE CASCADE,
  version integer DEFAULT 1,
  title text NOT NULL,
  operational_period_start timestamptz,
  operational_period_end timestamptz,
  content jsonb NOT NULL, -- All IAP content as structured JSON
  status text DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_official_snapshot boolean DEFAULT false,
  snapshot_time timestamptz, -- For 6PM official snapshots
  published_at timestamptz,
  created_by uuid, -- References auth.users
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Work assignments (replaces complex work assignment events)
CREATE TABLE work_assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id uuid REFERENCES operations(id) ON DELETE CASCADE,
  facility_id uuid REFERENCES facilities(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  assigned_to text, -- Person name or team
  discipline text,
  due_date timestamptz,
  status text DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  estimated_duration interval,
  actual_duration interval,
  resources_needed jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid -- References auth.users
);

-- User roles and permissions (replaces complex IAP role system)
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_id uuid REFERENCES operations(id) ON DELETE CASCADE,
  role text NOT NULL, -- 'ip_group', 'discipline', 'field', 'viewer'
  permissions jsonb, -- Specific permissions array
  discipline text, -- For discipline-specific roles
  facilities uuid[], -- Array of facility IDs for restricted access
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, operation_id) -- One role per user per operation
);

-- Indexes for performance
CREATE INDEX idx_operations_status ON operations(status);
CREATE INDEX idx_operations_creator ON operations(creator_email);
CREATE INDEX idx_facilities_operation ON facilities(operation_id);
CREATE INDEX idx_facilities_type ON facilities(type);
CREATE INDEX idx_facilities_discipline ON facilities(discipline);
CREATE INDEX idx_facilities_status ON facilities(status);
CREATE INDEX idx_personnel_operation ON personnel_assignments(operation_id);
CREATE INDEX idx_personnel_facility ON personnel_assignments(facility_id);
CREATE INDEX idx_personnel_role ON personnel_assignments(role);
CREATE INDEX idx_iap_operation ON iap_documents(operation_id);
CREATE INDEX idx_iap_status ON iap_documents(status);
CREATE INDEX idx_iap_official ON iap_documents(is_official_snapshot);
CREATE INDEX idx_work_assignments_operation ON work_assignments(operation_id);
CREATE INDEX idx_work_assignments_facility ON work_assignments(facility_id);
CREATE INDEX idx_work_assignments_status ON work_assignments(status);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_operation ON user_roles(operation_id);

-- Row Level Security (RLS) Policies
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE iap_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be enhanced in Phase 2)

-- Operations: Users can see operations they're assigned to
CREATE POLICY "operations_access" ON operations
FOR ALL USING (
  id IN (
    SELECT operation_id FROM user_roles 
    WHERE user_id = auth.uid()
  )
);

-- Facilities: Role-based access
-- I&P Group: Full access
CREATE POLICY "facilities_ip_group" ON facilities
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND operation_id = facilities.operation_id 
    AND role = 'ip_group'
  )
);

-- Discipline Teams: Access to assigned facilities only
CREATE POLICY "facilities_discipline_access" ON facilities
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND operation_id = facilities.operation_id 
    AND role = 'discipline'
    AND (facilities.id = ANY(user_roles.facilities) OR user_roles.facilities IS NULL)
  )
);

-- Field Teams: Read-only access to assigned facilities
CREATE POLICY "facilities_field_readonly" ON facilities
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND operation_id = facilities.operation_id 
    AND role = 'field'
    AND facilities.id = ANY(user_roles.facilities)
  )
);

-- Personnel assignments: Based on facility access
CREATE POLICY "personnel_facility_access" ON personnel_assignments
FOR ALL USING (
  facility_id IN (
    SELECT f.id FROM facilities f
    WHERE EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.operation_id = f.operation_id
      AND (
        ur.role = 'ip_group' OR
        (ur.role IN ('discipline', 'field') AND f.id = ANY(ur.facilities))
      )
    )
  )
);

-- IAP documents: Operation-based access
CREATE POLICY "iap_operation_access" ON iap_documents
FOR ALL USING (
  operation_id IN (
    SELECT operation_id FROM user_roles 
    WHERE user_id = auth.uid()
  )
);

-- Work assignments: Based on facility access
CREATE POLICY "work_assignments_access" ON work_assignments
FOR ALL USING (
  facility_id IN (
    SELECT f.id FROM facilities f
    WHERE EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.operation_id = f.operation_id
      AND (
        ur.role = 'ip_group' OR
        (ur.role IN ('discipline', 'field') AND f.id = ANY(ur.facilities))
      )
    )
  )
);

-- User roles: Users can only see their own roles
CREATE POLICY "user_roles_self_access" ON user_roles
FOR ALL USING (user_id = auth.uid());

-- Updated timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON operations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personnel_updated_at BEFORE UPDATE ON personnel_assignments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_iap_updated_at BEFORE UPDATE ON iap_documents 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_assignments_updated_at BEFORE UPDATE ON work_assignments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for development (will be replaced with real data migration)
INSERT INTO operations (name, disaster_type, activation_level, creator_name, creator_email, regions, counties) 
VALUES (
  'Hurricane Milton Response', 
  'Hurricane', 
  'Level 2', 
  'John Smith', 
  'john.smith@redcross.org',
  ARRAY['Southeast Region', 'Florida Region'],
  ARRAY['Hillsborough County', 'Pinellas County', 'Pasco County']
);

-- Comment: This simplified schema eliminates the complex event sourcing architecture
-- while preserving all the functional capabilities needed for disaster operations.
-- The schema supports:
-- 1. Role-based access control matching IAP requirements
-- 2. Real-time collaboration via Supabase subscriptions  
-- 3. Audit trails via created_at/updated_at timestamps
-- 4. Performance optimization via proper indexing
-- 5. Data integrity via foreign key constraints
-- 6. Flexible JSON data for capacity, permissions, etc.