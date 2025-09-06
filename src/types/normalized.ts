/**
 * Normalized database-aligned type definitions for the Disaster Operations Platform
 * These types match the relational database schema and eliminate complex nested structures
 */

// ============================================================================
// CORE ENTITIES (Database-aligned)
// ============================================================================

export interface Operation {
  id: string;
  operation_number: string;
  name: string;
  status: OperationStatus;
  activation_level: ActivationLevel;
  disaster_type: DisasterType;
  dr_number?: string;
  estimated_duration_days?: number;
  estimated_population_affected?: number;
  created_at: Date;
  created_by: string;
  closed_at?: Date;
  closed_by?: string;
  notes?: string;
}

export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  employee_id?: string;
  volunteer_number?: string;
  home_chapter?: string;
  availability_status: AvailabilityStatus;
  available_from?: Date;
  available_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Position {
  code: string;
  title: string;
  section: ICSSection;
  level: number;
  responsibilities: string[];
  required_certifications: string[];
  is_leadership: boolean;
}

export interface PersonnelAssignment {
  id: string;
  operation_id: string;
  person_id?: string;
  facility_id?: string;
  position_code: string;
  custom_title?: string;
  section: ICSSection;
  start_date: Date;
  end_date?: Date;
  status: AssignmentStatus;
  reporting_to?: string;
  is_leader: boolean;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// FACILITIES (Single table, all types)
// ============================================================================

export interface Facility {
  id: string;
  operation_id: string;
  name: string;
  facility_type: FacilityType;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  
  // Contact Information (flattened from nested objects)
  primary_contact_name?: string;
  primary_contact_phone?: string;
  primary_contact_email?: string;
  backup_contact_name?: string;
  backup_contact_phone?: string;
  backup_contact_email?: string;
  
  // Capacity Information (flattened)
  total_capacity?: number;
  current_occupancy: number;
  special_needs_capacity?: number;
  pet_capacity?: number;
  
  // Operational Details
  status: FacilityStatus;
  service_lines: ServiceLine[];
  operational_hours?: OperationalHours;
  
  // Metadata
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

// ============================================================================
// RESOURCES (Single table, all types)
// ============================================================================

export interface Resource {
  id: string;
  operation_id: string;
  resource_type: ResourceType;
  sub_type?: string;
  identifier: string;
  description?: string;
  quantity: number;
  unit: string;
  
  // Status and Assignment
  status: ResourceStatus;
  assigned_to_facility?: string;
  assigned_to_person?: string;
  
  // Location
  current_location?: string;
  home_location?: string;
  
  // Technical Details
  specifications?: Record<string, any>;
  maintenance_schedule?: Record<string, any>;
  acquisition_date?: Date;
  acquisition_cost?: number;
  
  // Metadata
  notes?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

// ============================================================================
// GAPS (Enhanced structure)
// ============================================================================

export interface Gap {
  id: string;
  operation_id: string;
  
  // Gap Classification
  gap_type: GapType;
  category: string;
  sub_category?: string;
  
  // Gap Description
  title: string;
  description: string;
  
  // Severity and Impact
  severity: GapSeverity;
  priority: number; // 1-5
  impact_description?: string;
  
  // Quantification
  quantity_needed?: number;
  quantity_unit?: string;
  estimated_cost?: number;
  
  // Related Entities (foreign key references)
  related_facility_id?: string;
  related_person_id?: string;
  related_resource_id?: string;
  
  // Status Tracking
  status: GapStatus;
  identified_at: Date;
  identified_by?: string;
  due_date?: Date;
  resolved_at?: Date;
  resolved_by?: string;
  resolution_notes?: string;
  
  // Escalation
  escalated_to?: string;
  escalated_at?: Date;
  escalation_reason?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// WORK ASSIGNMENTS
// ============================================================================

export interface WorkAssignment {
  id: string;
  operation_id: string;
  facility_id?: string;
  
  // Assignment Details
  title: string;
  description: string;
  priority: WorkPriority;
  
  // Timing
  start_date?: Date;
  due_date?: Date;
  estimated_hours?: number;
  actual_hours?: number;
  
  // Status
  status: WorkStatus;
  completion_percentage: number;
  
  // Assignment (foreign key references, not embedded objects)
  assigned_to: string[]; // array of personnel_assignment ids
  created_by?: string;
  
  // Metadata
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// JUNCTION TABLES
// ============================================================================

export interface PersonnelCertification {
  id: string;
  person_id: string;
  certification_type: string;
  certification_number?: string;
  issued_date: Date;
  expiration_date?: Date;
  issuing_authority: string;
  is_current: boolean;
  created_at: Date;
}

export interface PersonnelServiceLine {
  personnel_assignment_id: string;
  service_line: ServiceLine;
}

export interface WorkAssignmentResource {
  work_assignment_id: string;
  resource_id: string;
  quantity_assigned: number;
  assigned_at: Date;
}

// ============================================================================
// VIEW TYPES (for common database queries)
// ============================================================================

export interface ActivePersonnelView {
  // Person fields
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  home_chapter?: string;
  
  // Assignment fields
  assignment_id: string;
  operation_id: string;
  facility_id?: string;
  facility_name?: string;
  facility_type?: FacilityType;
  position_title: string;
  section: ICSSection;
  assignment_start: Date;
  assignment_end?: Date;
  contact_phone?: string;
  contact_email?: string;
}

export interface FacilitySummaryView extends Facility {
  personnel_count: number;
  resource_count: number;
  work_assignments_count: number;
  gaps_count: number;
  occupancy_percentage?: number;
}

export interface GapsSummaryView {
  operation_id: string;
  gap_type: GapType;
  category: string;
  severity: GapSeverity;
  status: GapStatus;
  gap_count: number;
  total_estimated_cost: number;
}

// ============================================================================
// ENUMS (kept from original, ensuring database compatibility)
// ============================================================================

export type OperationStatus = 'planning' | 'active' | 'demobilizing' | 'closed' | 'suspended';
export type ActivationLevel = 'level_1' | 'level_2' | 'level_3' | 'level_4';
export type DisasterType = 'hurricane' | 'tornado' | 'flood' | 'wildfire' | 'earthquake' | 'winter_storm' | 'pandemic' | 'mass_casualty' | 'other';

export type AvailabilityStatus = 'available' | 'deployed' | 'unavailable';
export type AssignmentStatus = 'active' | 'pending' | 'released';
export type ICSSection = 'command' | 'operations' | 'planning' | 'logistics' | 'finance';

export type FacilityType = 
  | 'shelter' 
  | 'feeding' 
  | 'distribution' 
  | 'mobile_unit' 
  | 'warehouse' 
  | 'kitchen' 
  | 'command_post' 
  | 'staging_area' 
  | 'reception_center' 
  | 'eoc' 
  | 'other';

export type FacilityStatus = 'planning' | 'setup' | 'operational' | 'closing' | 'closed' | 'standby';

export type ServiceLine = 
  | 'feeding'
  | 'sheltering'
  | 'distribution'
  | 'health_services'
  | 'mental_health'
  | 'spiritual_care'
  | 'reunification'
  | 'logistics'
  | 'it_telecom';

export type ResourceType = 
  | 'vehicle'
  | 'equipment'
  | 'supplies'
  | 'communications'
  | 'medical'
  | 'shelter_supplies'
  | 'feeding_equipment'
  | 'it_equipment'
  | 'furniture'
  | 'other';

export type ResourceStatus = 
  | 'available'
  | 'assigned'
  | 'in_use'
  | 'maintenance'
  | 'unavailable'
  | 'lost'
  | 'damaged';

export type GapType = 'personnel' | 'facility' | 'resource' | 'capability';
export type GapSeverity = 'low' | 'medium' | 'high' | 'critical';
export type GapStatus = 'open' | 'in_progress' | 'resolved' | 'cancelled';

export type WorkPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WorkStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface OperationalHours {
  start: string; // "06:00"
  end: string;   // "22:00"
  is_24_7: boolean;
}

// ============================================================================
// QUERY INTERFACES (for API and service layer)
// ============================================================================

export interface FacilityQuery {
  operation_id?: string;
  facility_type?: FacilityType | FacilityType[];
  status?: FacilityStatus | FacilityStatus[];
  county?: string;
  service_lines?: ServiceLine[];
  has_personnel?: boolean;
  has_gaps?: boolean;
}

export interface PersonnelQuery {
  operation_id?: string;
  facility_id?: string;
  section?: ICSSection | ICSSection[];
  status?: AssignmentStatus | AssignmentStatus[];
  position_code?: string | string[];
  is_leader?: boolean;
}

export interface ResourceQuery {
  operation_id?: string;
  resource_type?: ResourceType | ResourceType[];
  status?: ResourceStatus | ResourceStatus[];
  assigned_to_facility?: string;
  assigned_to_person?: string;
  available_only?: boolean;
}

export interface GapQuery {
  operation_id?: string;
  gap_type?: GapType | GapType[];
  category?: string;
  severity?: GapSeverity | GapSeverity[];
  status?: GapStatus | GapStatus[];
  facility_id?: string;
  open_only?: boolean;
}

// ============================================================================
// CREATE/UPDATE INTERFACES (for forms and API)
// ============================================================================

export interface CreateFacilityRequest {
  operation_id: string;
  name: string;
  facility_type: FacilityType;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  county?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
  primary_contact_email?: string;
  total_capacity?: number;
  service_lines?: ServiceLine[];
  notes?: string;
}

export interface CreatePersonnelAssignmentRequest {
  operation_id: string;
  person_id?: string;
  facility_id?: string;
  position_code: string;
  custom_title?: string;
  section: ICSSection;
  start_date: Date;
  end_date?: Date;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
}

export interface CreateResourceRequest {
  operation_id: string;
  resource_type: ResourceType;
  sub_type?: string;
  identifier: string;
  description?: string;
  quantity?: number;
  unit?: string;
  current_location?: string;
  specifications?: Record<string, any>;
  notes?: string;
}

export interface CreateGapRequest {
  operation_id: string;
  gap_type: GapType;
  category: string;
  sub_category?: string;
  title: string;
  description: string;
  severity: GapSeverity;
  priority?: number;
  quantity_needed?: number;
  quantity_unit?: string;
  estimated_cost?: number;
  related_facility_id?: string;
  related_person_id?: string;
  related_resource_id?: string;
  due_date?: Date;
}

// ============================================================================
// AGGREGATION TYPES (for dashboards and reports)
// ============================================================================

export interface OperationSummary {
  operation: Operation;
  totals: {
    facilities: number;
    personnel: number;
    resources: number;
    open_gaps: number;
    total_capacity: number;
    current_occupancy: number;
  };
  by_type: {
    facilities: Record<FacilityType, number>;
    personnel: Record<ICSSection, number>;
    resources: Record<ResourceType, number>;
    gaps: Record<GapSeverity, number>;
  };
  by_status: {
    facilities: Record<FacilityStatus, number>;
    personnel: Record<AssignmentStatus, number>;
    resources: Record<ResourceStatus, number>;
    gaps: Record<GapStatus, number>;
  };
}

export interface CountySummary {
  county: string;
  state: string;
  facilities: FacilitySummaryView[];
  totals: {
    facilities: number;
    personnel: number;
    capacity: number;
    occupancy: number;
  };
  service_lines: ServiceLine[];
  primary_contact?: ActivePersonnelView;
}