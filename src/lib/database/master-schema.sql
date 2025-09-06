-- CRITICAL: Single Source of Truth Database Schema
-- This is the MASTER database that ALL views read from and write to
-- NO DUPLICATE DATA - each piece of information exists in exactly ONE place

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "ltree";

-- Master schema for single source of truth
CREATE SCHEMA IF NOT EXISTS master;

-- ============================================
-- CORE MASTER TABLES - Single Source of Truth
-- ============================================

-- Operations Table - Root entity for everything
CREATE TABLE master.operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'emergency', 'training', 'drill'
  status TEXT NOT NULL DEFAULT 'active', -- 'planning', 'active', 'demobilizing', 'closed'
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  incident_commander TEXT,
  dro_director TEXT,
  geographic_scope JSONB, -- { counties: [], states: [], coordinates: {} }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Daily Schedule - THE source for all scheduling data
CREATE TABLE master.daily_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES master.operations(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  event_name TEXT NOT NULL,
  location TEXT,
  responsible_party TEXT,
  notes TEXT,
  event_type TEXT, -- 'briefing', 'operation', 'meeting', 'deadline'
  priority INTEGER DEFAULT 5, -- 1-10 scale
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in-progress', 'completed', 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  UNIQUE(operation_id, time, event_name)
);

-- Facilities - THE source for all facility data
CREATE TABLE master.facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES master.operations(id) ON DELETE CASCADE,
  facility_type TEXT NOT NULL, -- 'shelter', 'feeding', 'government', 'distribution', 'care', 'assessment'
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'FL',
  zip_code TEXT,
  county TEXT,
  coordinates JSONB, -- { lat: number, lng: number }
  status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'open', 'closed', 'standby'
  capacity JSONB, -- { maximum: number, current: number, available: number }
  contact_info JSONB, -- { manager: string, phone: string, email: string }
  hours_operation JSONB, -- { open: string, close: string, is_24hr: boolean }
  special_notes TEXT,
  amenities TEXT[], -- Array of facility features
  accessibility_features TEXT[], -- ADA compliance features
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  UNIQUE(operation_id, facility_type, name)
);

-- Personnel - THE source for all people data
CREATE TABLE master.personnel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES master.operations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  radio_call_sign TEXT,
  primary_position TEXT,
  section TEXT, -- 'command', 'operations', 'planning', 'logistics', 'finance'
  certifications TEXT[], -- Array of Red Cross certifications
  availability JSONB, -- { start_date: string, end_date: string, shifts: [] }
  emergency_contact JSONB, -- { name: string, phone: string, relationship: string }
  dietary_restrictions TEXT,
  medical_notes TEXT,
  background_check_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  UNIQUE(operation_id, email)
);

-- Personnel Assignments - THE source for staffing data
CREATE TABLE master.personnel_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES master.operations(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES master.personnel(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES master.facilities(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  shift_start TIME,
  shift_end TIME,
  shift_type TEXT, -- 'day', 'night', 'swing', 'on-call'
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'assigned', -- 'assigned', 'active', 'completed', 'cancelled'
  supervisor_id UUID REFERENCES master.personnel(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

-- Work Assignments - THE source for task assignments
CREATE TABLE master.work_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES master.operations(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES master.facilities(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL, -- 'shelter', 'feeding', 'government', 'assessment', 'distribution'
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES master.personnel(id),
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'open', -- 'open', 'assigned', 'in-progress', 'completed', 'cancelled'
  due_date TIMESTAMPTZ,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  skills_required TEXT[],
  equipment_needed TEXT[],
  safety_requirements TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  completed_at TIMESTAMPTZ,
  completed_by TEXT
);

-- Gaps Analysis - THE source for gap identification
CREATE TABLE master.gaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES master.operations(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES master.facilities(id) ON DELETE CASCADE,
  gap_type TEXT NOT NULL, -- 'personnel', 'equipment', 'supplies', 'vehicles', 'space'
  gap_category TEXT, -- 'shelter_manager', 'feeding_volunteer', 'generator', 'cots', 'ERV'
  quantity_needed INTEGER NOT NULL,
  quantity_available INTEGER DEFAULT 0,
  quantity_requested INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'open', -- 'open', 'requested', 'filled', 'cancelled'
  description TEXT,
  requirements JSONB, -- Specific requirements/qualifications
  requested_date TIMESTAMPTZ,
  needed_date TIMESTAMPTZ,
  filled_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

-- Assets/Resources - THE source for resource tracking
CREATE TABLE master.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES master.operations(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL, -- 'vehicle', 'equipment', 'supply'
  category TEXT NOT NULL, -- 'ERV', 'generator', 'cots', 'blankets'
  name TEXT NOT NULL,
  description TEXT,
  serial_number TEXT,
  condition TEXT DEFAULT 'good', -- 'excellent', 'good', 'fair', 'poor', 'inoperable'
  status TEXT DEFAULT 'available', -- 'available', 'deployed', 'maintenance', 'retired'
  current_location TEXT,
  assigned_facility_id UUID REFERENCES master.facilities(id),
  assigned_to UUID REFERENCES master.personnel(id),
  capacity JSONB, -- Type-specific capacity data
  specifications JSONB, -- Technical specifications
  maintenance_due DATE,
  last_inspection DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

-- Geographic Areas - THE source for area definitions
CREATE TABLE master.geographic_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES master.operations(id) ON DELETE CASCADE,
  area_type TEXT NOT NULL, -- 'county', 'city', 'zone', 'sector'
  name TEXT NOT NULL,
  state TEXT DEFAULT 'FL',
  fips_code TEXT,
  coordinates JSONB, -- Geographic boundaries
  population INTEGER,
  demographics JSONB, -- Population demographics data
  special_needs_population INTEGER,
  hazards TEXT[], -- Known hazards for this area
  contact_info JSONB, -- Local emergency contacts
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  UNIQUE(operation_id, area_type, name)
);

-- Contact Roster - THE source for external contacts
CREATE TABLE master.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID NOT NULL REFERENCES master.operations(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  phone TEXT,
  email TEXT,
  radio_channel TEXT,
  address TEXT,
  contact_type TEXT, -- 'government', 'volunteer_org', 'vendor', 'media', 'other'
  priority_level INTEGER DEFAULT 5, -- 1-10 importance scale
  availability JSONB, -- When they're available
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Operations indexes
CREATE INDEX idx_operations_status ON master.operations(status);
CREATE INDEX idx_operations_dates ON master.operations(start_date, end_date);

-- Daily Schedule indexes
CREATE INDEX idx_daily_schedule_operation ON master.daily_schedule(operation_id);
CREATE INDEX idx_daily_schedule_time ON master.daily_schedule(operation_id, time);
CREATE INDEX idx_daily_schedule_type ON master.daily_schedule(event_type);

-- Facilities indexes
CREATE INDEX idx_facilities_operation ON master.facilities(operation_id);
CREATE INDEX idx_facilities_type ON master.facilities(facility_type);
CREATE INDEX idx_facilities_status ON master.facilities(status);
CREATE INDEX idx_facilities_county ON master.facilities(county);
CREATE INDEX idx_facilities_location ON master.facilities(operation_id, facility_type, county);

-- Personnel indexes
CREATE INDEX idx_personnel_operation ON master.personnel(operation_id);
CREATE INDEX idx_personnel_section ON master.personnel(section);
CREATE INDEX idx_personnel_name ON master.personnel(last_name, first_name);

-- Personnel Assignments indexes
CREATE INDEX idx_assignments_operation ON master.personnel_assignments(operation_id);
CREATE INDEX idx_assignments_person ON master.personnel_assignments(person_id);
CREATE INDEX idx_assignments_facility ON master.personnel_assignments(facility_id);
CREATE INDEX idx_assignments_dates ON master.personnel_assignments(start_date, end_date);

-- Work Assignments indexes
CREATE INDEX idx_work_assignments_operation ON master.work_assignments(operation_id);
CREATE INDEX idx_work_assignments_facility ON master.work_assignments(facility_id);
CREATE INDEX idx_work_assignments_assigned ON master.work_assignments(assigned_to);
CREATE INDEX idx_work_assignments_status ON master.work_assignments(status);
CREATE INDEX idx_work_assignments_type ON master.work_assignments(assignment_type);

-- Gaps indexes
CREATE INDEX idx_gaps_operation ON master.gaps(operation_id);
CREATE INDEX idx_gaps_facility ON master.gaps(facility_id);
CREATE INDEX idx_gaps_type ON master.gaps(gap_type);
CREATE INDEX idx_gaps_status ON master.gaps(status);
CREATE INDEX idx_gaps_priority ON master.gaps(priority);

-- Assets indexes
CREATE INDEX idx_assets_operation ON master.assets(operation_id);
CREATE INDEX idx_assets_type ON master.assets(asset_type);
CREATE INDEX idx_assets_status ON master.assets(status);
CREATE INDEX idx_assets_facility ON master.assets(assigned_facility_id);

-- Contacts indexes
CREATE INDEX idx_contacts_operation ON master.contacts(operation_id);
CREATE INDEX idx_contacts_type ON master.contacts(contact_type);
CREATE INDEX idx_contacts_organization ON master.contacts(organization);

-- ============================================
-- AUDIT TRAIL - Track ALL changes
-- ============================================

-- Audit log table for ALL changes
CREATE TABLE master.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  user_id TEXT,
  correlation_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_system TEXT DEFAULT 'disaster_ops_v3'
);

-- Index for audit trail
CREATE INDEX idx_audit_log_table ON master.audit_log(table_name);
CREATE INDEX idx_audit_log_record ON master.audit_log(record_id);
CREATE INDEX idx_audit_log_timestamp ON master.audit_log(timestamp);

-- ============================================
-- TRIGGERS for Audit Trail and Updated_At
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION master.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create audit trail
CREATE OR REPLACE FUNCTION master.create_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO master.audit_log (table_name, record_id, operation, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO master.audit_log (table_name, record_id, operation, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO master.audit_log (table_name, record_id, operation, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply triggers to all master tables
DO $$
DECLARE
    table_name text;
    table_names text[] := ARRAY[
        'operations', 'daily_schedule', 'facilities', 'personnel',
        'personnel_assignments', 'work_assignments', 'gaps', 'assets',
        'geographic_areas', 'contacts'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_names LOOP
        -- Updated_at trigger
        EXECUTE format('
            CREATE TRIGGER update_%s_updated_at
            BEFORE UPDATE ON master.%s
            FOR EACH ROW
            EXECUTE FUNCTION master.update_updated_at_column();
        ', table_name, table_name);
        
        -- Audit trail trigger
        EXECUTE format('
            CREATE TRIGGER audit_%s
            AFTER INSERT OR UPDATE OR DELETE ON master.%s
            FOR EACH ROW
            EXECUTE FUNCTION master.create_audit_trail();
        ', table_name, table_name);
    END LOOP;
END $$;

-- ============================================
-- VIEWS for Common Queries
-- ============================================

-- Comprehensive facility view with all related data
CREATE VIEW master.v_facilities_complete AS
SELECT 
    f.*,
    -- Personnel counts
    COUNT(DISTINCT pa.id) FILTER (WHERE pa.status = 'assigned') as assigned_personnel_count,
    COUNT(DISTINCT pa.id) FILTER (WHERE pa.status = 'active') as active_personnel_count,
    -- Gap counts
    COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'open' AND g.gap_type = 'personnel') as personnel_gaps,
    COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'open' AND g.gap_type = 'equipment') as equipment_gaps,
    COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'open' AND g.gap_type = 'supplies') as supply_gaps,
    -- Work assignment counts
    COUNT(DISTINCT wa.id) FILTER (WHERE wa.status = 'open') as open_assignments,
    COUNT(DISTINCT wa.id) FILTER (WHERE wa.status = 'in-progress') as active_assignments,
    COUNT(DISTINCT wa.id) FILTER (WHERE wa.status = 'completed') as completed_assignments
FROM master.facilities f
LEFT JOIN master.personnel_assignments pa ON f.id = pa.facility_id
LEFT JOIN master.gaps g ON f.id = g.facility_id
LEFT JOIN master.work_assignments wa ON f.id = wa.facility_id
GROUP BY f.id;

-- Personnel with current assignments
CREATE VIEW master.v_personnel_current AS
SELECT 
    p.*,
    pa.facility_id,
    f.name as facility_name,
    pa.position as current_position,
    pa.shift_type as current_shift,
    pa.start_date as assignment_start,
    pa.end_date as assignment_end
FROM master.personnel p
LEFT JOIN master.personnel_assignments pa ON p.id = pa.person_id 
    AND pa.status IN ('assigned', 'active')
    AND (pa.end_date IS NULL OR pa.end_date >= CURRENT_DATE)
LEFT JOIN master.facilities f ON pa.facility_id = f.id;

-- Daily schedule with status rollup
CREATE VIEW master.v_daily_schedule_status AS
SELECT 
    ds.*,
    CASE 
        WHEN ds.time < CURRENT_TIME AND CURRENT_DATE = CURRENT_DATE THEN 'past'
        WHEN ds.time = CURRENT_TIME AND CURRENT_DATE = CURRENT_DATE THEN 'current'
        ELSE 'upcoming'
    END as time_status
FROM master.daily_schedule ds;

-- Critical gaps summary
CREATE VIEW master.v_critical_gaps AS
SELECT 
    g.*,
    f.name as facility_name,
    f.county as facility_county,
    (g.quantity_needed - g.quantity_available) as current_gap
FROM master.gaps g
LEFT JOIN master.facilities f ON g.facility_id = f.id
WHERE g.status = 'open' 
    AND (g.quantity_needed - g.quantity_available) > 0
    AND g.priority IN ('high', 'critical')
ORDER BY 
    CASE g.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 END,
    (g.quantity_needed - g.quantity_available) DESC;

-- ============================================
-- INITIAL DATA CONSTRAINTS
-- ============================================

-- Ensure valid statuses
ALTER TABLE master.operations ADD CONSTRAINT check_operation_status 
    CHECK (status IN ('planning', 'active', 'demobilizing', 'closed'));

ALTER TABLE master.facilities ADD CONSTRAINT check_facility_status 
    CHECK (status IN ('planned', 'open', 'closed', 'standby'));

ALTER TABLE master.facilities ADD CONSTRAINT check_facility_type 
    CHECK (facility_type IN ('shelter', 'feeding', 'government', 'distribution', 'care', 'assessment'));

ALTER TABLE master.personnel_assignments ADD CONSTRAINT check_assignment_status 
    CHECK (status IN ('assigned', 'active', 'completed', 'cancelled'));

ALTER TABLE master.work_assignments ADD CONSTRAINT check_work_status 
    CHECK (status IN ('open', 'assigned', 'in-progress', 'completed', 'cancelled'));

ALTER TABLE master.gaps ADD CONSTRAINT check_gap_status 
    CHECK (status IN ('open', 'requested', 'filled', 'cancelled'));

-- Ensure logical data
ALTER TABLE master.gaps ADD CONSTRAINT check_gap_quantities 
    CHECK (quantity_needed > 0 AND quantity_available >= 0);

ALTER TABLE master.personnel_assignments ADD CONSTRAINT check_assignment_dates
    CHECK (end_date IS NULL OR end_date >= start_date);

-- Comments for documentation
COMMENT ON SCHEMA master IS 'Single source of truth for all disaster operations data. NO DUPLICATE DATA ALLOWED.';
COMMENT ON TABLE master.operations IS 'Root entity - all other data belongs to an operation';
COMMENT ON TABLE master.daily_schedule IS 'THE source for all scheduling data - feeds Tables Hub AND IAP views';
COMMENT ON TABLE master.facilities IS 'THE source for all facility data - feeds all facility views';
COMMENT ON TABLE master.personnel_assignments IS 'THE source for staffing - feeds rosters, org charts, work assignments';
COMMENT ON TABLE master.work_assignments IS 'THE source for task assignments - feeds work assignment pages';
COMMENT ON TABLE master.gaps IS 'THE source for gap analysis - feeds all gap reports';