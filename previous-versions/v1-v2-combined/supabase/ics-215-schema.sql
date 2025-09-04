-- ICS Form 215 (Operational Planning Worksheet) Database Schema
-- Comprehensive schema for operational planning, work assignments, resource management
-- and real-time collaboration with versioning and audit trails

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "ltree";

-- ==============================================================================
-- CORE OPERATIONAL PLANNING TABLES
-- ==============================================================================

-- Operations Planning Worksheets (Form 215 instances)
CREATE TABLE IF NOT EXISTS ics_215_worksheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id VARCHAR(100) UNIQUE NOT NULL, -- ICS-215-DR-2025-001-OPS-001
    operation_id VARCHAR(255) NOT NULL REFERENCES operations(operation_id) ON DELETE CASCADE,
    
    -- Worksheet metadata
    worksheet_number INTEGER NOT NULL,
    operational_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    operational_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- ICS structure
    incident_name VARCHAR(255) NOT NULL,
    incident_number VARCHAR(100),
    prepared_by VARCHAR(255) NOT NULL,
    prepared_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Section assignment
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('Operations', 'Planning', 'Logistics', 'Finance', 'Command', 'Safety', 'Information')),
    branch VARCHAR(100),
    division VARCHAR(100),
    group_assignment VARCHAR(100),
    
    -- Status and workflow
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5), -- 1=Highest, 5=Lowest
    
    -- Content
    mission_statement TEXT,
    situation_summary TEXT,
    execution_summary TEXT,
    special_instructions TEXT,
    
    -- Versioning
    version_number INTEGER DEFAULT 1,
    parent_version_id UUID REFERENCES ics_215_worksheets(id),
    is_current_version BOOLEAN DEFAULT true,
    
    -- Collaboration
    locked_by UUID,
    locked_at TIMESTAMP WITH TIME ZONE,
    lock_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    UNIQUE(operation_id, worksheet_number, version_number),
    INDEX idx_215_worksheets_operation ON ics_215_worksheets(operation_id, operational_period_start DESC),
    INDEX idx_215_worksheets_section ON ics_215_worksheets(section_type, status),
    INDEX idx_215_worksheets_current ON ics_215_worksheets(is_current_version, status) WHERE is_current_version = true
);

-- ==============================================================================
-- SERVICE LINE SPECIFIC TABLES
-- ==============================================================================

-- Feeding Operations Planning
CREATE TABLE IF NOT EXISTS feeding_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    -- Assignment details
    assignment_name VARCHAR(255) NOT NULL,
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('Fixed_Site', 'Mobile_Feeding', 'Bulk_Distribution', 'Partner_Coordination')),
    
    -- Location and timing
    location_name VARCHAR(255),
    address TEXT,
    coordinates POINT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    
    -- Capacity and targets
    target_meals INTEGER,
    estimated_clients INTEGER,
    meal_types VARCHAR[] DEFAULT ARRAY['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
    
    -- Resources required
    staff_required INTEGER,
    volunteers_required INTEGER,
    erv_required BOOLEAN DEFAULT false,
    special_equipment TEXT[],
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'assigned', 'in_progress', 'completed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    
    -- Assignments
    team_leader UUID,
    assigned_staff UUID[],
    assigned_volunteers UUID[],
    
    -- Notes and updates
    notes TEXT,
    challenges TEXT,
    lessons_learned TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_feeding_worksheet ON feeding_assignments(worksheet_id, assignment_type),
    INDEX idx_feeding_status ON feeding_assignments(status, start_time)
);

-- Sheltering Operations Planning
CREATE TABLE IF NOT EXISTS sheltering_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    -- Assignment details
    assignment_name VARCHAR(255) NOT NULL,
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('Shelter_Operations', 'Site_Setup', 'Site_Closure', 'Population_Management', 'Logistics_Support')),
    
    -- Shelter information
    shelter_name VARCHAR(255),
    shelter_type VARCHAR(50) CHECK (shelter_type IN ('Congregate', 'Non_Congregate', 'Hotel_Motel', 'Dormitory')),
    address TEXT,
    coordinates POINT,
    
    -- Capacity planning
    maximum_capacity INTEGER,
    target_occupancy INTEGER,
    ada_spaces INTEGER,
    pet_spaces INTEGER,
    isolation_spaces INTEGER,
    
    -- Timing
    activation_time TIMESTAMP WITH TIME ZONE,
    deactivation_time TIMESTAMP WITH TIME ZONE,
    
    -- Staffing
    shelter_manager UUID,
    required_positions JSONB, -- {position: count}
    assigned_staff UUID[],
    
    -- Operations details
    services_provided VARCHAR[], -- ['Registration', 'Feeding', 'Health', 'Mental_Health', 'Spiritual_Care']
    special_populations VARCHAR[], -- ['Families', 'Seniors', 'Disabilities', 'Pets']
    
    -- Status
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'setup', 'operational', 'closing', 'closed')),
    occupancy_status VARCHAR(20) CHECK (occupancy_status IN ('available', 'limited', 'full', 'closed')),
    
    notes TEXT,
    safety_concerns TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_sheltering_worksheet ON sheltering_assignments(worksheet_id, assignment_type),
    INDEX idx_sheltering_capacity ON sheltering_assignments(maximum_capacity, target_occupancy)
);

-- Mass Care & Emergency Services Planning
CREATE TABLE IF NOT EXISTS mass_care_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    -- Assignment details
    assignment_name VARCHAR(255) NOT NULL,
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('Emergency_Assistance', 'Bulk_Distribution', 'Mobile_Services', 'Case_Management', 'Information_Collection')),
    
    -- Service details
    service_category VARCHAR(100), -- Emergency supplies, Comfort items, Information, etc.
    target_population INTEGER,
    geographic_area TEXT,
    
    -- Distribution specifics
    distribution_items JSONB, -- {item_type: quantity}
    distribution_method VARCHAR(50), -- Drive-through, Walk-up, Door-to-door
    
    -- Resource requirements
    site_requirements TEXT,
    equipment_needed VARCHAR[],
    staffing_requirements JSONB,
    
    -- Timing and location
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    location_details TEXT,
    coordinates POINT,
    
    -- Assignments
    team_lead UUID,
    assigned_personnel UUID[],
    
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'suspended')),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_mass_care_worksheet ON mass_care_assignments(worksheet_id, service_category)
);

-- Health Services Planning
CREATE TABLE IF NOT EXISTS health_services_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    assignment_name VARCHAR(255) NOT NULL,
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('First_Aid', 'Nursing', 'Mental_Health', 'Spiritual_Care', 'Health_Education')),
    
    -- Service scope
    service_level VARCHAR(50), -- Basic, Intermediate, Advanced
    target_clients INTEGER,
    service_hours VARCHAR(100), -- "24/7", "8am-8pm", etc.
    
    -- Staffing
    licensed_staff_required INTEGER,
    volunteer_staff_required INTEGER,
    credentials_required VARCHAR[],
    
    -- Location and setup
    service_location VARCHAR(255),
    equipment_needed VARCHAR[],
    supplies_needed JSONB,
    
    -- Special considerations
    population_served VARCHAR[], -- Shelter clients, Community, Staff/Volunteers
    special_needs TEXT,
    privacy_requirements TEXT,
    
    assigned_lead UUID,
    assigned_staff UUID[],
    
    status VARCHAR(20) DEFAULT 'planned',
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_health_worksheet ON health_services_assignments(worksheet_id, assignment_type)
);

-- Recovery Services Planning  
CREATE TABLE IF NOT EXISTS recovery_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    assignment_name VARCHAR(255) NOT NULL,
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('Casework', 'Financial_Assistance', 'Referrals', 'Recovery_Planning', 'Community_Outreach')),
    
    -- Service parameters
    target_cases INTEGER,
    service_area TEXT,
    eligibility_criteria TEXT,
    
    -- Resource allocation
    caseworkers_needed INTEGER,
    financial_assistance_budget DECIMAL(12,2),
    referral_partners VARCHAR[],
    
    -- Performance targets
    target_completion_rate DECIMAL(5,2), -- Percentage
    average_case_duration INTERVAL,
    
    assigned_supervisor UUID,
    assigned_caseworkers UUID[],
    
    status VARCHAR(20) DEFAULT 'planned',
    success_metrics JSONB,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_recovery_worksheet ON recovery_assignments(worksheet_id, assignment_type)
);

-- Logistics Planning
CREATE TABLE IF NOT EXISTS logistics_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    assignment_name VARCHAR(255) NOT NULL,
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('Transportation', 'Supply_Chain', 'Facilities', 'Communications', 'IT_Support')),
    
    -- Logistics details
    resource_type VARCHAR(100),
    quantity_required INTEGER,
    delivery_location TEXT,
    
    -- Timing
    required_by TIMESTAMP WITH TIME ZONE,
    setup_time TIMESTAMP WITH TIME ZONE,
    
    -- Specifications
    specifications JSONB,
    vendor_requirements TEXT,
    cost_estimate DECIMAL(12,2),
    
    assigned_coordinator UUID,
    vendor_contacts JSONB,
    
    status VARCHAR(20) DEFAULT 'planned',
    procurement_status VARCHAR(50),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_logistics_worksheet ON logistics_assignments(worksheet_id, assignment_type)
);

-- ==============================================================================
-- WORK ASSIGNMENTS AND RESOURCE MANAGEMENT
-- ==============================================================================

-- Work Assignments (detailed task breakdown from 215 worksheets)
CREATE TABLE IF NOT EXISTS work_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    -- Assignment identification
    assignment_number VARCHAR(20) NOT NULL, -- A-1, B-2, etc.
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    
    -- Assignment details
    assigned_to_position VARCHAR(100), -- ICS position
    assigned_to_person UUID, -- Actual person assigned
    supervisor_position VARCHAR(100),
    supervisor_person UUID,
    
    -- Location and timing
    work_location VARCHAR(255),
    report_time TIMESTAMP WITH TIME ZONE,
    expected_duration INTERVAL,
    completion_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Task specifics
    task_category VARCHAR(50),
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    
    -- Resources needed
    personnel_required INTEGER DEFAULT 1,
    equipment_required VARCHAR[],
    materials_required VARCHAR[],
    special_skills VARCHAR[],
    
    -- Safety and constraints
    safety_requirements TEXT,
    environmental_concerns TEXT,
    access_restrictions TEXT,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'delayed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    estimated_completion TIMESTAMP WITH TIME ZONE,
    actual_completion TIMESTAMP WITH TIME ZONE,
    
    -- Results and feedback
    completion_notes TEXT,
    challenges_encountered TEXT,
    time_actual INTERVAL,
    resources_actual JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_work_assignments_worksheet ON work_assignments(worksheet_id, status),
    INDEX idx_work_assignments_person ON work_assignments(assigned_to_person, status),
    INDEX idx_work_assignments_timing ON work_assignments(report_time, completion_deadline)
);

-- Resource Requirements (detailed resource planning)
CREATE TABLE IF NOT EXISTS resource_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES work_assignments(id) ON DELETE CASCADE,
    
    -- Resource identification
    resource_type VARCHAR(50) NOT NULL, -- Personnel, Equipment, Supplies, Facilities, Services
    resource_category VARCHAR(100), -- Specific category within type
    resource_name VARCHAR(255) NOT NULL,
    
    -- Quantity and specifications
    quantity_needed INTEGER NOT NULL,
    quantity_available INTEGER DEFAULT 0,
    quantity_ordered INTEGER DEFAULT 0,
    unit_of_measure VARCHAR(20),
    
    -- Specifications and requirements
    specifications JSONB,
    quality_requirements TEXT,
    performance_standards TEXT,
    
    -- Sourcing
    preferred_vendor VARCHAR(255),
    cost_per_unit DECIMAL(10,2),
    total_estimated_cost DECIMAL(12,2),
    procurement_method VARCHAR(50), -- Internal, Purchase, Rental, Donation, Mutual_Aid
    
    -- Timing requirements
    needed_by TIMESTAMP WITH TIME ZONE,
    available_from TIMESTAMP WITH TIME ZONE,
    return_by TIMESTAMP WITH TIME ZONE,
    
    -- Status
    fulfillment_status VARCHAR(20) DEFAULT 'requested' CHECK (fulfillment_status IN ('requested', 'approved', 'ordered', 'partial', 'fulfilled', 'unavailable')),
    current_location VARCHAR(255),
    
    -- Tracking
    order_number VARCHAR(100),
    tracking_info VARCHAR(255),
    received_quantity INTEGER DEFAULT 0,
    received_date TIMESTAMP WITH TIME ZONE,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_resource_requirements_worksheet ON resource_requirements(worksheet_id, resource_type),
    INDEX idx_resource_requirements_status ON resource_requirements(fulfillment_status, needed_by)
);

-- Resource Allocations (tracking actual resource deployment)
CREATE TABLE IF NOT EXISTS resource_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID NOT NULL REFERENCES resource_requirements(id) ON DELETE CASCADE,
    
    -- Allocation details
    allocated_quantity INTEGER NOT NULL,
    allocated_from VARCHAR(255), -- Source/vendor
    allocation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Assignment
    allocated_to_assignment UUID REFERENCES work_assignments(id),
    allocated_to_person UUID,
    allocated_to_location VARCHAR(255),
    
    -- Tracking
    serial_numbers VARCHAR[],
    condition_notes TEXT,
    maintenance_requirements TEXT,
    
    -- Status
    allocation_status VARCHAR(20) DEFAULT 'allocated' CHECK (allocation_status IN ('allocated', 'deployed', 'in_use', 'returned', 'lost', 'damaged')),
    return_date TIMESTAMP WITH TIME ZONE,
    return_condition VARCHAR(20),
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_resource_allocations_requirement ON resource_allocations(requirement_id, allocation_status)
);

-- ==============================================================================
-- REAL-TIME COLLABORATION SYSTEM
-- ==============================================================================

-- Collaboration Sessions (active editing sessions)
CREATE TABLE IF NOT EXISTS collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    -- Session details
    session_id VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(100),
    
    -- Session metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'idle', 'disconnected')),
    
    -- Collaboration details
    editing_section VARCHAR(100), -- Which part they're editing
    cursor_position INTEGER,
    selection_range JSONB, -- {start: x, end: y}
    
    -- Real-time data
    connection_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_collaboration_worksheet ON collaboration_sessions(worksheet_id, status),
    INDEX idx_collaboration_user ON collaboration_sessions(user_id, status)
);

-- Real-time Changes (operational transformation for concurrent editing)
CREATE TABLE IF NOT EXISTS realtime_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    -- Change details
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('insert', 'delete', 'replace', 'format', 'move')),
    field_path VARCHAR(255) NOT NULL, -- JSON path to the field being changed
    
    -- Change data
    old_value JSONB,
    new_value JSONB,
    change_position INTEGER,
    change_length INTEGER,
    
    -- Operational transformation
    operation_id VARCHAR(100) UNIQUE NOT NULL,
    parent_operation_id VARCHAR(100),
    transformation_applied BOOLEAN DEFAULT false,
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_at TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL,
    
    INDEX idx_realtime_changes_worksheet ON realtime_changes(worksheet_id, timestamp DESC),
    INDEX idx_realtime_changes_operation ON realtime_changes(operation_id, parent_operation_id)
);

-- Change Conflicts (when concurrent edits conflict)
CREATE TABLE IF NOT EXISTS change_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    -- Conflict details
    conflict_type VARCHAR(50) NOT NULL, -- 'concurrent_edit', 'version_mismatch', 'field_lock'
    field_path VARCHAR(255) NOT NULL,
    
    -- Conflicting changes
    change_a_id UUID REFERENCES realtime_changes(id),
    change_b_id UUID REFERENCES realtime_changes(id),
    user_a_id UUID NOT NULL,
    user_b_id UUID NOT NULL,
    
    -- Resolution
    resolution_status VARCHAR(20) DEFAULT 'unresolved' CHECK (resolution_status IN ('unresolved', 'auto_resolved', 'manual_resolved', 'escalated')),
    resolution_method VARCHAR(50), -- 'last_write_wins', 'manual_merge', 'escalation'
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_change_conflicts_worksheet ON change_conflicts(worksheet_id, resolution_status)
);

-- ==============================================================================
-- VERSIONING AND AUDIT SYSTEM
-- ==============================================================================

-- Enhanced audit log with detailed change tracking
CREATE TABLE IF NOT EXISTS ics_215_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    -- Audit details
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE', 'VERSION', 'PUBLISH', 'ARCHIVE')),
    
    -- Change data
    field_changes JSONB, -- Detailed field-level changes
    old_data JSONB,
    new_data JSONB,
    
    -- Context
    change_reason VARCHAR(255),
    batch_id UUID, -- For grouping related changes
    
    -- User and session
    user_id UUID,
    user_name VARCHAR(255),
    session_id UUID,
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    INDEX idx_215_audit_worksheet ON ics_215_audit_log(worksheet_id, timestamp DESC),
    INDEX idx_215_audit_table ON ics_215_audit_log(table_name, operation, timestamp DESC),
    INDEX idx_215_audit_user ON ics_215_audit_log(user_id, timestamp DESC)
);

-- Version snapshots (complete state at version points)
CREATE TABLE IF NOT EXISTS worksheet_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worksheet_id UUID NOT NULL REFERENCES ics_215_worksheets(id) ON DELETE CASCADE,
    
    -- Version info
    version_number INTEGER NOT NULL,
    snapshot_type VARCHAR(20) DEFAULT 'manual' CHECK (snapshot_type IN ('manual', 'auto', 'publish', 'backup')),
    
    -- Complete data snapshot
    worksheet_data JSONB NOT NULL,
    assignments_data JSONB,
    resources_data JSONB,
    work_assignments_data JSONB,
    
    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    
    UNIQUE(worksheet_id, version_number),
    INDEX idx_snapshots_worksheet ON worksheet_snapshots(worksheet_id, version_number DESC)
);

-- ==============================================================================
-- OFFLINE SUPPORT AND SYNC QUEUE
-- ==============================================================================

-- Sync queue for offline changes
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Operation details
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    
    -- Data
    data_payload JSONB NOT NULL,
    original_data JSONB, -- For conflict detection
    
    -- Sync metadata
    client_id UUID NOT NULL,
    client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'conflict', 'failed', 'discarded')),
    attempt_count INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Conflict resolution
    conflict_resolution VARCHAR(20) CHECK (conflict_resolution IN ('client_wins', 'server_wins', 'merge', 'manual')),
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_sync_queue_status ON sync_queue(sync_status, server_timestamp),
    INDEX idx_sync_queue_client ON sync_queue(client_id, client_timestamp DESC)
);

-- Client sync state tracking
CREATE TABLE IF NOT EXISTS client_sync_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID UNIQUE NOT NULL,
    
    -- Sync positions
    last_sync_timestamp TIMESTAMP WITH TIME ZONE,
    last_sync_version INTEGER,
    pending_changes_count INTEGER DEFAULT 0,
    
    -- Client info
    user_id UUID,
    device_info JSONB,
    app_version VARCHAR(50),
    
    -- Connection state
    is_online BOOLEAN DEFAULT true,
    last_online TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    connection_quality VARCHAR(20), -- excellent, good, poor, offline
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_client_sync_user ON client_sync_state(user_id, last_sync_timestamp)
);

-- ==============================================================================
-- PERFORMANCE INDEXES AND CONSTRAINTS
-- ==============================================================================

-- Additional performance indexes
CREATE INDEX CONCURRENTLY idx_215_worksheets_compound ON ics_215_worksheets(operation_id, section_type, status, is_current_version);
CREATE INDEX CONCURRENTLY idx_work_assignments_compound ON work_assignments(worksheet_id, assigned_to_person, status, report_time);
CREATE INDEX CONCURRENTLY idx_resource_requirements_compound ON resource_requirements(worksheet_id, resource_type, fulfillment_status, needed_by);
CREATE INDEX CONCURRENTLY idx_collaboration_active ON collaboration_sessions(worksheet_id, status, last_activity) WHERE status = 'active';

-- Partial indexes for better performance
CREATE INDEX CONCURRENTLY idx_215_current_versions ON ics_215_worksheets(operation_id, section_type) WHERE is_current_version = true;
CREATE INDEX CONCURRENTLY idx_pending_sync ON sync_queue(table_name, record_id) WHERE sync_status = 'pending';

-- ==============================================================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================================================

-- Enhanced update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Version management function
CREATE OR REPLACE FUNCTION create_worksheet_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark old version as not current
    UPDATE ics_215_worksheets 
    SET is_current_version = false 
    WHERE worksheet_id = NEW.worksheet_id AND id != NEW.id;
    
    -- Ensure new version is marked as current
    NEW.is_current_version = true;
    NEW.version_number = COALESCE((
        SELECT MAX(version_number) + 1 
        FROM ics_215_worksheets 
        WHERE worksheet_id = NEW.worksheet_id
    ), 1);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enhanced audit trigger for ICS 215
CREATE OR REPLACE FUNCTION ics_215_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    worksheet_id_val UUID;
    field_changes JSONB := '{}';
    old_json JSONB;
    new_json JSONB;
    key TEXT;
    value_old JSONB;
    value_new JSONB;
BEGIN
    -- Get worksheet_id from the record
    IF TG_TABLE_NAME = 'ics_215_worksheets' THEN
        worksheet_id_val = COALESCE(NEW.id, OLD.id);
    ELSE
        worksheet_id_val = COALESCE(NEW.worksheet_id, OLD.worksheet_id);
    END IF;
    
    -- Calculate field-level changes for UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        old_json = to_jsonb(OLD);
        new_json = to_jsonb(NEW);
        
        FOR key IN SELECT jsonb_object_keys(new_json) LOOP
            value_old = old_json -> key;
            value_new = new_json -> key;
            
            IF value_old IS DISTINCT FROM value_new THEN
                field_changes = field_changes || jsonb_build_object(
                    key, jsonb_build_object(
                        'old', value_old,
                        'new', value_new
                    )
                );
            END IF;
        END LOOP;
    END IF;
    
    -- Insert audit record
    INSERT INTO ics_215_audit_log(
        worksheet_id, table_name, record_id, operation, 
        field_changes, old_data, new_data
    ) VALUES (
        worksheet_id_val, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), TG_OP,
        CASE WHEN TG_OP = 'UPDATE' THEN field_changes ELSE NULL END,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Lock management function
CREATE OR REPLACE FUNCTION manage_worksheet_lock()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-expire locks after 30 minutes of inactivity
    IF NEW.locked_by IS NOT NULL AND NEW.lock_expires_at IS NULL THEN
        NEW.lock_expires_at = NOW() + INTERVAL '30 minutes';
    END IF;
    
    -- Clear expired locks
    IF NEW.lock_expires_at IS NOT NULL AND NEW.lock_expires_at < NOW() THEN
        NEW.locked_by = NULL;
        NEW.locked_at = NULL;
        NEW.lock_expires_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_215_worksheets_timestamp BEFORE UPDATE ON ics_215_worksheets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_assignments_timestamp BEFORE UPDATE ON work_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_requirements_timestamp BEFORE UPDATE ON resource_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER manage_215_version BEFORE INSERT ON ics_215_worksheets
    FOR EACH ROW EXECUTE FUNCTION create_worksheet_version();

CREATE TRIGGER manage_215_lock BEFORE UPDATE ON ics_215_worksheets
    FOR EACH ROW EXECUTE FUNCTION manage_worksheet_lock();

-- Apply audit triggers
CREATE TRIGGER audit_215_worksheets AFTER INSERT OR UPDATE OR DELETE ON ics_215_worksheets
    FOR EACH ROW EXECUTE FUNCTION ics_215_audit_trigger();

CREATE TRIGGER audit_work_assignments AFTER INSERT OR UPDATE OR DELETE ON work_assignments
    FOR EACH ROW EXECUTE FUNCTION ics_215_audit_trigger();

CREATE TRIGGER audit_resource_requirements AFTER INSERT OR UPDATE OR DELETE ON resource_requirements
    FOR EACH ROW EXECUTE FUNCTION ics_215_audit_trigger();

-- Apply audit triggers to service-specific tables
CREATE TRIGGER audit_feeding_assignments AFTER INSERT OR UPDATE OR DELETE ON feeding_assignments
    FOR EACH ROW EXECUTE FUNCTION ics_215_audit_trigger();

CREATE TRIGGER audit_sheltering_assignments AFTER INSERT OR UPDATE OR DELETE ON sheltering_assignments
    FOR EACH ROW EXECUTE FUNCTION ics_215_audit_trigger();

CREATE TRIGGER audit_mass_care_assignments AFTER INSERT OR UPDATE OR DELETE ON mass_care_assignments
    FOR EACH ROW EXECUTE FUNCTION ics_215_audit_trigger();

CREATE TRIGGER audit_health_services_assignments AFTER INSERT OR UPDATE OR DELETE ON health_services_assignments
    FOR EACH ROW EXECUTE FUNCTION ics_215_audit_trigger();

CREATE TRIGGER audit_recovery_assignments AFTER INSERT OR UPDATE OR DELETE ON recovery_assignments
    FOR EACH ROW EXECUTE FUNCTION ics_215_audit_trigger();

CREATE TRIGGER audit_logistics_assignments AFTER INSERT OR UPDATE OR DELETE ON logistics_assignments
    FOR EACH ROW EXECUTE FUNCTION ics_215_audit_trigger();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE ics_215_worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheltering_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mass_care_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_services_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ics_215_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies (to be customized based on authentication setup)
-- Basic policies for authenticated users - customize based on roles

CREATE POLICY "215_worksheets_access" ON ics_215_worksheets
    FOR ALL USING (
        auth.role() = 'authenticated' AND 
        (created_by = auth.uid() OR updated_by = auth.uid() OR 
         EXISTS (SELECT 1 FROM operations WHERE operation_id = ics_215_worksheets.operation_id))
    );

-- Service-specific table policies
CREATE POLICY "feeding_assignments_access" ON feeding_assignments
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM ics_215_worksheets w WHERE w.id = feeding_assignments.worksheet_id)
    );

CREATE POLICY "sheltering_assignments_access" ON sheltering_assignments
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM ics_215_worksheets w WHERE w.id = sheltering_assignments.worksheet_id)
    );

CREATE POLICY "mass_care_assignments_access" ON mass_care_assignments
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM ics_215_worksheets w WHERE w.id = mass_care_assignments.worksheet_id)
    );

CREATE POLICY "health_services_assignments_access" ON health_services_assignments
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM ics_215_worksheets w WHERE w.id = health_services_assignments.worksheet_id)
    );

CREATE POLICY "recovery_assignments_access" ON recovery_assignments
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM ics_215_worksheets w WHERE w.id = recovery_assignments.worksheet_id)
    );

CREATE POLICY "logistics_assignments_access" ON logistics_assignments
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM ics_215_worksheets w WHERE w.id = logistics_assignments.worksheet_id)
    );

-- Work assignments and resources
CREATE POLICY "work_assignments_access" ON work_assignments
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        (assigned_to_person = auth.uid() OR supervisor_person = auth.uid() OR
         EXISTS (SELECT 1 FROM ics_215_worksheets w WHERE w.id = work_assignments.worksheet_id))
    );

CREATE POLICY "resource_requirements_access" ON resource_requirements
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM ics_215_worksheets w WHERE w.id = resource_requirements.worksheet_id)
    );

-- Collaboration and audit
CREATE POLICY "collaboration_sessions_access" ON collaboration_sessions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "realtime_changes_access" ON realtime_changes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "audit_log_read" ON ics_215_audit_log
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "sync_queue_user" ON sync_queue
    FOR ALL USING (auth.uid()::text = client_id::text);

-- ==============================================================================
-- VIEWS FOR COMMON QUERIES
-- ==============================================================================

-- Active worksheets with summary data
CREATE OR REPLACE VIEW active_215_worksheets AS
SELECT 
    w.*,
    op.operation_name,
    op.state as operation_state,
    (SELECT COUNT(*) FROM work_assignments wa WHERE wa.worksheet_id = w.id) as total_assignments,
    (SELECT COUNT(*) FROM work_assignments wa WHERE wa.worksheet_id = w.id AND wa.status = 'completed') as completed_assignments,
    (SELECT COUNT(*) FROM resource_requirements rr WHERE rr.worksheet_id = w.id) as total_resources,
    (SELECT COUNT(*) FROM resource_requirements rr WHERE rr.worksheet_id = w.id AND rr.fulfillment_status = 'fulfilled') as fulfilled_resources,
    (SELECT COUNT(*) FROM collaboration_sessions cs WHERE cs.worksheet_id = w.id AND cs.status = 'active') as active_collaborators
FROM ics_215_worksheets w
JOIN operations op ON op.operation_id = w.operation_id
WHERE w.is_current_version = true
  AND w.status IN ('draft', 'review', 'approved', 'published')
ORDER BY w.operational_period_start DESC;

-- Resource summary by worksheet
CREATE OR REPLACE VIEW worksheet_resource_summary AS
SELECT 
    w.id as worksheet_id,
    w.worksheet_id as worksheet_number,
    w.section_type,
    rr.resource_type,
    SUM(rr.quantity_needed) as total_needed,
    SUM(rr.quantity_available) as total_available,
    SUM(rr.quantity_ordered) as total_ordered,
    COUNT(*) as resource_line_items,
    COUNT(*) FILTER (WHERE rr.fulfillment_status = 'fulfilled') as fulfilled_items,
    SUM(rr.total_estimated_cost) as total_estimated_cost
FROM ics_215_worksheets w
LEFT JOIN resource_requirements rr ON rr.worksheet_id = w.id
WHERE w.is_current_version = true
GROUP BY w.id, w.worksheet_id, w.section_type, rr.resource_type
ORDER BY w.worksheet_id, rr.resource_type;

-- Assignment progress dashboard
CREATE OR REPLACE VIEW assignment_progress_dashboard AS
SELECT 
    w.worksheet_id,
    w.section_type,
    w.operational_period_start,
    w.operational_period_end,
    COUNT(wa.id) as total_assignments,
    COUNT(*) FILTER (WHERE wa.status = 'assigned') as assigned_count,
    COUNT(*) FILTER (WHERE wa.status = 'in_progress') as in_progress_count,
    COUNT(*) FILTER (WHERE wa.status = 'completed') as completed_count,
    COUNT(*) FILTER (WHERE wa.status = 'delayed') as delayed_count,
    ROUND(AVG(wa.progress_percentage), 2) as avg_progress,
    COUNT(*) FILTER (WHERE wa.completion_deadline < NOW() AND wa.status != 'completed') as overdue_count
FROM ics_215_worksheets w
LEFT JOIN work_assignments wa ON wa.worksheet_id = w.id
WHERE w.is_current_version = true
GROUP BY w.id, w.worksheet_id, w.section_type, w.operational_period_start, w.operational_period_end
ORDER BY w.operational_period_start DESC;

-- Real-time collaboration status
CREATE OR REPLACE VIEW collaboration_status AS
SELECT 
    w.worksheet_id,
    w.section_type,
    COUNT(cs.id) as active_sessions,
    STRING_AGG(DISTINCT cs.user_name, ', ') as active_users,
    MAX(cs.last_activity) as last_activity,
    COUNT(rc.id) as recent_changes,
    COUNT(cc.id) as unresolved_conflicts
FROM ics_215_worksheets w
LEFT JOIN collaboration_sessions cs ON cs.worksheet_id = w.id AND cs.status = 'active'
LEFT JOIN realtime_changes rc ON rc.worksheet_id = w.id AND rc.timestamp > NOW() - INTERVAL '1 hour'
LEFT JOIN change_conflicts cc ON cc.worksheet_id = w.id AND cc.resolution_status = 'unresolved'
WHERE w.is_current_version = true
GROUP BY w.id, w.worksheet_id, w.section_type
HAVING COUNT(cs.id) > 0 OR COUNT(rc.id) > 0 OR COUNT(cc.id) > 0
ORDER BY MAX(cs.last_activity) DESC NULLS LAST;

-- ==============================================================================
-- SAMPLE DATA (Optional - for development/testing only)
-- ==============================================================================

-- Uncomment for development environment only
/*
-- Sample operation (assuming it exists from main schema)
INSERT INTO operations (operation_id, operation_name, type, state, start_date, data)
VALUES ('DR-2025-001', 'Hurricane Milton Response', 'hurricane', 'florida', NOW(), '{}')
ON CONFLICT (operation_id) DO NOTHING;

-- Sample ICS 215 worksheet
INSERT INTO ics_215_worksheets (
    worksheet_id, operation_id, worksheet_number, operational_period_start, 
    operational_period_end, incident_name, prepared_by, section_type,
    mission_statement, status
) VALUES (
    'ICS-215-DR-2025-001-OPS-001', 'DR-2025-001', 1, NOW(), NOW() + INTERVAL '12 hours',
    'Hurricane Milton Response', 'Operations Chief', 'Operations',
    'Coordinate shelter operations and mass feeding for displaced residents',
    'draft'
);
*/

-- ==============================================================================
-- MAINTENANCE AND CLEANUP FUNCTIONS
-- ==============================================================================

-- Function to clean up old collaboration sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM collaboration_sessions 
    WHERE last_activity < NOW() - INTERVAL '24 hours'
    AND status = 'disconnected';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to archive completed worksheets
CREATE OR REPLACE FUNCTION archive_completed_worksheets(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    UPDATE ics_215_worksheets 
    SET status = 'archived'
    WHERE operational_period_end < NOW() - (days_old || ' days')::INTERVAL
    AND status = 'published';
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup jobs (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_old_sessions();');
-- SELECT cron.schedule('archive-worksheets', '0 3 * * 0', 'SELECT archive_completed_worksheets(30);');

COMMENT ON SCHEMA public IS 'ICS Form 215 Operational Planning Worksheet System - Complete schema for disaster response operational planning with real-time collaboration, versioning, and comprehensive audit trails';