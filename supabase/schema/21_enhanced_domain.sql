-- Enhanced normalized database schema for Red Cross Disaster Operations
-- This replaces the array-based approach with proper relational structure

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- Operations (already exists, enhanced)
DROP TABLE IF EXISTS ops.operations CASCADE;
CREATE TABLE ops.operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_number text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'demobilizing', 'closed', 'suspended')),
  activation_level text NOT NULL CHECK (activation_level IN ('level_1', 'level_2', 'level_3', 'level_4')),
  disaster_type text NOT NULL,
  dr_number text,
  estimated_duration_days integer,
  estimated_population_affected integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL,
  closed_at timestamptz,
  closed_by text,
  notes text
);

-- Persons (enhanced with more fields)
DROP TABLE IF EXISTS ops.persons CASCADE;
CREATE TABLE ops.persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,
  phone text,
  alternate_phone text,
  employee_id text,
  volunteer_number text,
  home_chapter text,
  availability_status text DEFAULT 'available' CHECK (availability_status IN ('available', 'deployed', 'unavailable')),
  available_from timestamptz,
  available_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Positions reference table
CREATE TABLE ops.positions (
  code text PRIMARY KEY,
  title text NOT NULL,
  section text NOT NULL CHECK (section IN ('command', 'operations', 'planning', 'logistics', 'finance')),
  level integer NOT NULL CHECK (level >= 1 AND level <= 5),
  responsibilities text[],
  required_certifications text[],
  is_leadership boolean DEFAULT false
);

-- Personnel assignments (enhanced roster)
DROP TABLE IF EXISTS ops.roster_assignments CASCADE;
CREATE TABLE ops.personnel_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid NOT NULL REFERENCES ops.operations(id) ON DELETE CASCADE,
  person_id uuid REFERENCES ops.persons(id) ON DELETE SET NULL,
  facility_id uuid REFERENCES ops.facilities(id) ON DELETE SET NULL,
  position_code text NOT NULL REFERENCES ops.positions(code),
  custom_title text,
  section text NOT NULL CHECK (section IN ('command', 'operations', 'planning', 'logistics', 'finance')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'released')),
  reporting_to uuid REFERENCES ops.personnel_assignments(id),
  is_leader boolean DEFAULT false,
  contact_phone text,
  contact_email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- FACILITIES (Single table for ALL facility types)
-- ============================================================================

DROP TABLE IF EXISTS ops.facilities CASCADE;
CREATE TABLE ops.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid NOT NULL REFERENCES ops.operations(id) ON DELETE CASCADE,
  name text NOT NULL,
  facility_type text NOT NULL CHECK (facility_type IN (
    'shelter', 'feeding', 'distribution', 'mobile_unit', 'warehouse', 'kitchen',
    'command_post', 'staging_area', 'reception_center', 'eoc', 'other'
  )),
  address text,
  city text,
  state text,
  zip text,
  county text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  
  -- Contact Information
  primary_contact_name text,
  primary_contact_phone text,
  primary_contact_email text,
  backup_contact_name text,
  backup_contact_phone text,
  backup_contact_email text,
  
  -- Capacity Information
  total_capacity integer,
  current_occupancy integer DEFAULT 0,
  special_needs_capacity integer,
  pet_capacity integer,
  
  -- Operational Details
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'setup', 'operational', 'closing', 'closed', 'standby')),
  service_lines text[] DEFAULT '{}', -- array of service lines served
  operational_hours jsonb, -- {start: "06:00", end: "22:00", is_24_7: false}
  
  -- Metadata
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  updated_by text
);

-- ============================================================================
-- RESOURCES (Single table for ALL resource types)
-- ============================================================================

DROP TABLE IF EXISTS ops.assets CASCADE;
CREATE TABLE ops.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid NOT NULL REFERENCES ops.operations(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN (
    'vehicle', 'equipment', 'supplies', 'communications', 'medical',
    'shelter_supplies', 'feeding_equipment', 'it_equipment', 'furniture', 'other'
  )),
  sub_type text, -- specific type within category (e.g., 'bus' for vehicle)
  identifier text NOT NULL,
  description text,
  quantity integer DEFAULT 1,
  unit text DEFAULT 'each', -- unit of measurement
  
  -- Status and Assignment
  status text NOT NULL DEFAULT 'available' CHECK (status IN (
    'available', 'assigned', 'in_use', 'maintenance', 'unavailable', 'lost', 'damaged'
  )),
  assigned_to_facility uuid REFERENCES ops.facilities(id),
  assigned_to_person uuid REFERENCES ops.personnel_assignments(id),
  
  -- Location
  current_location text,
  home_location text,
  
  -- Technical Details
  specifications jsonb, -- flexible storage for resource-specific details
  maintenance_schedule jsonb, -- maintenance tracking
  acquisition_date date,
  acquisition_cost decimal(10,2),
  
  -- Metadata
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text,
  updated_by text
);

-- ============================================================================
-- GAPS ANALYSIS (Enhanced gap tracking)
-- ============================================================================

DROP TABLE IF EXISTS ops.gaps CASCADE;
CREATE TABLE ops.gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid NOT NULL REFERENCES ops.operations(id) ON DELETE CASCADE,
  
  -- Gap Classification
  gap_type text NOT NULL CHECK (gap_type IN ('personnel', 'facility', 'resource', 'capability')),
  category text NOT NULL, -- specific category (e.g., 'staffing', 'feeding', 'sheltering')
  sub_category text, -- further refinement
  
  -- Gap Description
  title text NOT NULL,
  description text NOT NULL,
  
  -- Severity and Impact
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  priority integer CHECK (priority >= 1 AND priority <= 5),
  impact_description text,
  
  -- Quantification
  quantity_needed integer,
  quantity_unit text,
  estimated_cost decimal(10,2),
  
  -- Related Entities
  related_facility_id uuid REFERENCES ops.facilities(id),
  related_person_id uuid REFERENCES ops.personnel_assignments(id),
  related_resource_id uuid REFERENCES ops.resources(id),
  
  -- Status Tracking
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'cancelled')),
  identified_at timestamptz NOT NULL DEFAULT now(),
  identified_by text,
  due_date timestamptz,
  resolved_at timestamptz,
  resolved_by text,
  resolution_notes text,
  
  -- Escalation
  escalated_to text,
  escalated_at timestamptz,
  escalation_reason text,
  
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- WORK ASSIGNMENTS
-- ============================================================================

CREATE TABLE ops.work_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid NOT NULL REFERENCES ops.operations(id) ON DELETE CASCADE,
  facility_id uuid REFERENCES ops.facilities(id),
  
  -- Assignment Details
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Timing
  start_date timestamptz,
  due_date timestamptz,
  estimated_hours decimal(5,2),
  actual_hours decimal(5,2),
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  
  -- Assignment
  assigned_to uuid[] DEFAULT '{}', -- array of personnel_assignment ids
  created_by text,
  
  -- Metadata
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- JUNCTION TABLES (Many-to-Many Relationships)
-- ============================================================================

-- Personnel Certifications
CREATE TABLE ops.personnel_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES ops.persons(id) ON DELETE CASCADE,
  certification_type text NOT NULL,
  certification_number text,
  issued_date date NOT NULL,
  expiration_date date,
  issuing_authority text NOT NULL,
  is_current boolean GENERATED ALWAYS AS (
    CASE 
      WHEN expiration_date IS NULL THEN true
      WHEN expiration_date > CURRENT_DATE THEN true
      ELSE false
    END
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Service Line Assignments for Personnel
CREATE TABLE ops.personnel_service_lines (
  personnel_assignment_id uuid NOT NULL REFERENCES ops.personnel_assignments(id) ON DELETE CASCADE,
  service_line text NOT NULL,
  PRIMARY KEY (personnel_assignment_id, service_line)
);

-- Equipment assignments to work assignments
CREATE TABLE ops.work_assignment_resources (
  work_assignment_id uuid NOT NULL REFERENCES ops.work_assignments(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES ops.resources(id) ON DELETE CASCADE,
  quantity_assigned integer DEFAULT 1,
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (work_assignment_id, resource_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Operations
CREATE INDEX idx_operations_status ON ops.operations(status);
CREATE INDEX idx_operations_disaster_type ON ops.operations(disaster_type);
CREATE INDEX idx_operations_created_at ON ops.operations(created_at);

-- Persons
CREATE INDEX idx_persons_email ON ops.persons(email);
CREATE INDEX idx_persons_home_chapter ON ops.persons(home_chapter);
CREATE INDEX idx_persons_name ON ops.persons(first_name, last_name);

-- Personnel Assignments
CREATE INDEX idx_personnel_assignments_operation ON ops.personnel_assignments(operation_id);
CREATE INDEX idx_personnel_assignments_person ON ops.personnel_assignments(person_id);
CREATE INDEX idx_personnel_assignments_facility ON ops.personnel_assignments(facility_id);
CREATE INDEX idx_personnel_assignments_position ON ops.personnel_assignments(position_code);
CREATE INDEX idx_personnel_assignments_status_dates ON ops.personnel_assignments(status, start_date, end_date);

-- Facilities
CREATE INDEX idx_facilities_operation ON ops.facilities(operation_id);
CREATE INDEX idx_facilities_type ON ops.facilities(facility_type);
CREATE INDEX idx_facilities_status ON ops.facilities(status);
CREATE INDEX idx_facilities_county ON ops.facilities(county);
CREATE INDEX idx_facilities_service_lines ON ops.facilities USING GIN(service_lines);
CREATE INDEX idx_facilities_location ON ops.facilities(latitude, longitude);

-- Resources
CREATE INDEX idx_resources_operation ON ops.resources(operation_id);
CREATE INDEX idx_resources_type ON ops.resources(resource_type, sub_type);
CREATE INDEX idx_resources_status ON ops.resources(status);
CREATE INDEX idx_resources_facility ON ops.resources(assigned_to_facility);
CREATE INDEX idx_resources_person ON ops.resources(assigned_to_person);
CREATE INDEX idx_resources_identifier ON ops.resources(identifier);

-- Gaps
CREATE INDEX idx_gaps_operation ON ops.gaps(operation_id);
CREATE INDEX idx_gaps_type_category ON ops.gaps(gap_type, category);
CREATE INDEX idx_gaps_severity_priority ON ops.gaps(severity, priority);
CREATE INDEX idx_gaps_status ON ops.gaps(status);
CREATE INDEX idx_gaps_dates ON ops.gaps(identified_at, due_date, resolved_at);
CREATE INDEX idx_gaps_related_facility ON ops.gaps(related_facility_id);

-- Work Assignments
CREATE INDEX idx_work_assignments_operation ON ops.work_assignments(operation_id);
CREATE INDEX idx_work_assignments_facility ON ops.work_assignments(facility_id);
CREATE INDEX idx_work_assignments_status ON ops.work_assignments(status);
CREATE INDEX idx_work_assignments_priority ON ops.work_assignments(priority);
CREATE INDEX idx_work_assignments_dates ON ops.work_assignments(due_date, start_date);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active personnel with their assignments
CREATE OR REPLACE VIEW ops.active_personnel AS
SELECT 
  p.*,
  pa.id as assignment_id,
  pa.operation_id,
  pa.facility_id,
  f.name as facility_name,
  f.facility_type,
  pos.title as position_title,
  pa.section,
  pa.start_date as assignment_start,
  pa.end_date as assignment_end,
  pa.contact_phone,
  pa.contact_email
FROM ops.persons p
JOIN ops.personnel_assignments pa ON p.id = pa.person_id
LEFT JOIN ops.facilities f ON pa.facility_id = f.id
LEFT JOIN ops.positions pos ON pa.position_code = pos.code
WHERE pa.status = 'active' 
  AND (pa.end_date IS NULL OR pa.end_date > now());

-- Facility summary with personnel and resource counts
CREATE OR REPLACE VIEW ops.facility_summary AS
SELECT 
  f.*,
  COALESCE(personnel_count, 0) as personnel_count,
  COALESCE(resource_count, 0) as resource_count,
  COALESCE(work_assignments_count, 0) as work_assignments_count,
  COALESCE(gaps_count, 0) as gaps_count,
  CASE 
    WHEN f.total_capacity > 0 THEN 
      ROUND((f.current_occupancy::decimal / f.total_capacity::decimal) * 100, 1)
    ELSE NULL 
  END as occupancy_percentage
FROM ops.facilities f
LEFT JOIN (
  SELECT facility_id, COUNT(*) as personnel_count 
  FROM ops.personnel_assignments 
  WHERE status = 'active'
  GROUP BY facility_id
) pc ON f.id = pc.facility_id
LEFT JOIN (
  SELECT assigned_to_facility, COUNT(*) as resource_count 
  FROM ops.resources 
  WHERE assigned_to_facility IS NOT NULL
  GROUP BY assigned_to_facility
) rc ON f.id = rc.assigned_to_facility
LEFT JOIN (
  SELECT facility_id, COUNT(*) as work_assignments_count 
  FROM ops.work_assignments 
  WHERE status IN ('pending', 'in_progress')
  GROUP BY facility_id
) wac ON f.id = wac.facility_id
LEFT JOIN (
  SELECT related_facility_id, COUNT(*) as gaps_count 
  FROM ops.gaps 
  WHERE status = 'open'
  GROUP BY related_facility_id
) gc ON f.id = gc.related_facility_id;

-- Gap analysis summary
CREATE OR REPLACE VIEW ops.gaps_summary AS
SELECT 
  operation_id,
  gap_type,
  category,
  severity,
  status,
  COUNT(*) as gap_count,
  SUM(CASE WHEN estimated_cost IS NOT NULL THEN estimated_cost ELSE 0 END) as total_estimated_cost
FROM ops.gaps
GROUP BY operation_id, gap_type, category, severity, status;