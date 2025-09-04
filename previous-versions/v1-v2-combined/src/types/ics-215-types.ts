/**
 * ICS Form 215 (Operational Planning Worksheet) Type Definitions
 * Complete TypeScript interfaces for operational planning, work assignments,
 * resource management, and real-time collaboration
 */

// Note: Contact and Address types would normally be imported from a shared types file
interface Contact {
  name: string;
  title?: string;
  organization?: string;
  phone?: string;
  email?: string;
  radio?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: { lat: number; lng: number };
}

// ==============================================================================
// CORE OPERATIONAL PLANNING TYPES
// ==============================================================================

export type WorksheetStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type SectionType = 'Operations' | 'Planning' | 'Logistics' | 'Finance' | 'Command' | 'Safety' | 'Information';
export type PriorityLevel = 1 | 2 | 3 | 4 | 5; // 1=Highest, 5=Lowest

// Red Cross Operational Divisions
export type RedCrossDivision = 
  | 'Feeding_Food_Services'
  | 'Sheltering_Dormitory_Operations'
  | 'Mass_Care_Distribution_Emergency_Supplies'
  | 'Health_Services'
  | 'Disaster_Assessment'
  | 'Individual_Family_Services_Recovery'
  | 'Logistics_Supply_Chain'
  | 'External_Relations_Government_Operations'
  | 'Finance_Administration'
  | 'Planning_Situational_Awareness'
  | 'Staff_Services_Workforce';

// Resource Types for Work Assignments
export type ResourceKind = 
  | 'Personnel'
  | 'Equipment'
  | 'Supplies'
  | 'Vehicles'
  | 'Communications'
  | 'Facilities'
  | 'Aircraft'
  | 'Marine'
  | 'Teams'
  | 'Specialists';

export interface ICS215Worksheet {
  id: string;
  worksheetId: string; // ICS-215-DR-2025-001-OPS-001
  operationId: string;
  
  // Worksheet metadata
  worksheetNumber: number;
  operationalPeriodStart: Date;
  operationalPeriodEnd: Date;
  
  // ICS structure
  incidentName: string;
  incidentNumber?: string;
  preparedBy: string;
  preparedDate: Date;
  
  // Section assignment
  sectionType: SectionType;
  branch?: string;
  division?: string;
  groupAssignment?: string;
  
  // Status and workflow
  status: WorksheetStatus;
  priorityLevel: PriorityLevel;
  
  // Content
  missionStatement?: string;
  situationSummary?: string;
  executionSummary?: string;
  specialInstructions?: string;
  
  // Versioning
  versionNumber: number;
  parentVersionId?: string;
  isCurrentVersion: boolean;
  
  // Collaboration
  lockedBy?: string;
  lockedAt?: Date;
  lockExpiresAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// ==============================================================================
// SERVICE LINE SPECIFIC ASSIGNMENT TYPES
// ==============================================================================

export type AssignmentStatus = 'planned' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';

// Base assignment interface
export interface BaseAssignment {
  id: string;
  worksheetId: string;
  assignmentName: string;
  status: AssignmentStatus;
  progressPercentage: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Feeding Operations
export type FeedingAssignmentType = 'Fixed_Site' | 'Mobile_Feeding' | 'Bulk_Distribution' | 'Partner_Coordination';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface FeedingAssignment extends BaseAssignment {
  assignmentType: FeedingAssignmentType;
  
  // Location and timing
  locationName?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  startTime?: Date;
  endTime?: Date;
  
  // Capacity and targets
  targetMeals: number;
  estimatedClients: number;
  mealTypes: MealType[];
  
  // Resources required
  staffRequired: number;
  volunteersRequired: number;
  ervRequired: boolean;
  specialEquipment: string[];
  
  // Assignments
  teamLeader?: string;
  assignedStaff: string[];
  assignedVolunteers: string[];
  
  // Additional details
  challenges?: string;
  lessonsLearned?: string;
}

// Sheltering Operations
export type ShelteringAssignmentType = 'Shelter_Operations' | 'Site_Setup' | 'Site_Closure' | 'Population_Management' | 'Logistics_Support';
export type ShelterType = 'Congregate' | 'Non_Congregate' | 'Hotel_Motel' | 'Dormitory';
export type ShelterStatus = 'planned' | 'setup' | 'operational' | 'closing' | 'closed';
export type OccupancyStatus = 'available' | 'limited' | 'full' | 'closed';
export type ShelterService = 'Registration' | 'Feeding' | 'Health' | 'Mental_Health' | 'Spiritual_Care';
export type SpecialPopulation = 'Families' | 'Seniors' | 'Disabilities' | 'Pets';

export interface ShelteringAssignment extends BaseAssignment {
  assignmentType: ShelteringAssignmentType;
  
  // Shelter information
  shelterName?: string;
  shelterType?: ShelterType;
  address?: string;
  coordinates?: { lat: number; lng: number };
  
  // Capacity planning
  maximumCapacity: number;
  targetOccupancy: number;
  adaSpaces: number;
  petSpaces: number;
  isolationSpaces: number;
  
  // Timing
  activationTime?: Date;
  deactivationTime?: Date;
  
  // Staffing
  shelterManager?: string;
  requiredPositions: Record<string, number>; // {position: count}
  assignedStaff: string[];
  
  // Operations details
  servicesProvided: ShelterService[];
  specialPopulations: SpecialPopulation[];
  
  // Status
  occupancyStatus?: OccupancyStatus;
  safetyConcerns?: string;
}

// Mass Care & Emergency Services
export type MassCareAssignmentType = 'Emergency_Assistance' | 'Bulk_Distribution' | 'Mobile_Services' | 'Case_Management' | 'Information_Collection';
export type DistributionMethod = 'Drive_Through' | 'Walk_Up' | 'Door_To_Door';

export interface MassCareAssignment extends BaseAssignment {
  assignmentType: MassCareAssignmentType;
  
  // Service details
  serviceCategory: string;
  targetPopulation: number;
  geographicArea: string;
  
  // Distribution specifics
  distributionItems: Record<string, number>; // {item_type: quantity}
  distributionMethod: DistributionMethod;
  
  // Resource requirements
  siteRequirements: string;
  equipmentNeeded: string[];
  staffingRequirements: Record<string, number>;
  
  // Timing and location
  startTime?: Date;
  endTime?: Date;
  locationDetails: string;
  coordinates?: { lat: number; lng: number };
  
  // Assignments
  teamLead?: string;
  assignedPersonnel: string[];
}

// Health Services
export type HealthServiceType = 'First_Aid' | 'Nursing' | 'Mental_Health' | 'Spiritual_Care' | 'Health_Education';
export type ServiceLevel = 'Basic' | 'Intermediate' | 'Advanced';
export type PopulationServed = 'Shelter_Clients' | 'Community' | 'Staff_Volunteers';

export interface HealthServicesAssignment extends BaseAssignment {
  assignmentType: HealthServiceType;
  
  // Service scope
  serviceLevel: ServiceLevel;
  targetClients: number;
  serviceHours: string; // "24/7", "8am-8pm", etc.
  
  // Staffing
  licensedStaffRequired: number;
  volunteerStaffRequired: number;
  credentialsRequired: string[];
  
  // Location and setup
  serviceLocation: string;
  equipmentNeeded: string[];
  suppliesNeeded: Record<string, number>;
  
  // Special considerations
  populationServed: PopulationServed[];
  specialNeeds?: string;
  privacyRequirements?: string;
  
  assignedLead?: string;
  assignedStaff: string[];
}

// Recovery Services
export type RecoveryAssignmentType = 'Casework' | 'Financial_Assistance' | 'Referrals' | 'Recovery_Planning' | 'Community_Outreach';

export interface RecoveryAssignment extends BaseAssignment {
  assignmentType: RecoveryAssignmentType;
  
  // Service parameters
  targetCases: number;
  serviceArea: string;
  eligibilityCriteria: string;
  
  // Resource allocation
  caseworkersNeeded: number;
  financialAssistanceBudget: number;
  referralPartners: string[];
  
  // Performance targets
  targetCompletionRate: number; // Percentage
  averageCaseDuration?: string; // Duration string like "2 weeks"
  
  assignedSupervisor?: string;
  assignedCaseworkers: string[];
  successMetrics?: Record<string, any>;
}

// Logistics
export type LogisticsAssignmentType = 'Transportation' | 'Supply_Chain' | 'Facilities' | 'Communications' | 'IT_Support';

export interface LogisticsAssignment extends BaseAssignment {
  assignmentType: LogisticsAssignmentType;
  
  // Logistics details
  resourceType: string;
  quantityRequired: number;
  deliveryLocation: string;
  
  // Timing
  requiredBy?: Date;
  setupTime?: Date;
  
  // Specifications
  specifications: Record<string, any>;
  vendorRequirements?: string;
  costEstimate: number;
  
  assignedCoordinator?: string;
  vendorContacts?: Record<string, any>;
  procurementStatus?: string;
}

// Union type for all assignment types
export type ServiceLineAssignment = 
  | FeedingAssignment 
  | ShelteringAssignment 
  | MassCareAssignment 
  | HealthServicesAssignment 
  | RecoveryAssignment 
  | LogisticsAssignment;

// ==============================================================================
// WORK ASSIGNMENTS AND RESOURCE MANAGEMENT (ICS 215 Standard Format)
// ==============================================================================

export type WorkAssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';

// Standard ICS 215 Work Assignment Structure
export interface WorkAssignment {
  id: string;
  worksheetId: string;
  
  // Assignment identification (follows ICS 215 format)
  assignmentNumber: string; // A-1, B-2, etc.
  divisionGroup: RedCrossDivision; // Red Cross operational division
  workAssignmentName: string; // Main task description
  
  // Resource Requirements (ICS 215 Resource section)
  resourceRequirements: ResourceRequirement215[];
  
  // Work Assignment Details
  workLocation: string;
  reportTime: Date;
  specialInstructions?: string;
  
  // Leadership and Contact
  leader?: string; // Resource Leader
  contactInfo?: string; // Contact information (radio, phone, etc.)
  
  // Status tracking
  status: WorkAssignmentStatus;
  progressPercentage: number;
  
  // Results and feedback
  completionNotes?: string;
  challengesEncountered?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ICS 215 Resource Requirement (matches standard form layout)
export interface ResourceRequirement215 {
  id: string;
  assignmentId: string;
  
  // Resource Identification (ICS 215 columns)
  resourceKind: ResourceKind; // Kind/Type
  resourceType: string; // Specific type within kind
  resourceIdentifier?: string; // Resource identifier/call sign
  
  // Staffing
  leader?: string; // Leader name
  numberOfPersons: number; // # Persons
  contactInfo?: string; // Contact (radio frequency, phone)
  
  // Requirements vs Have vs Need calculation
  quantityRequested: number;
  quantityHave: number;
  quantityNeed: number; // Calculated: Requested - Have
  
  // Additional details
  notes?: string;
  eta?: Date; // Estimated time of arrival
  status: 'requested' | 'assigned' | 'enroute' | 'available' | 'unavailable';
}

// Resource Management
export type ResourceType = 'Personnel' | 'Equipment' | 'Supplies' | 'Facilities' | 'Services';
export type FulfillmentStatus = 'requested' | 'approved' | 'ordered' | 'partial' | 'fulfilled' | 'unavailable';
export type ProcurementMethod = 'Internal' | 'Purchase' | 'Rental' | 'Donation' | 'Mutual_Aid';

export interface ResourceRequirement {
  id: string;
  worksheetId: string;
  assignmentId?: string;
  
  // Resource identification
  resourceType: ResourceType;
  resourceCategory: string;
  resourceName: string;
  
  // Quantity and specifications
  quantityNeeded: number;
  quantityAvailable: number;
  quantityOrdered: number;
  unitOfMeasure: string;
  
  // Specifications and requirements
  specifications: Record<string, any>;
  qualityRequirements?: string;
  performanceStandards?: string;
  
  // Sourcing
  preferredVendor?: string;
  costPerUnit: number;
  totalEstimatedCost: number;
  procurementMethod: ProcurementMethod;
  
  // Timing requirements
  neededBy: Date;
  availableFrom?: Date;
  returnBy?: Date;
  
  // Status
  fulfillmentStatus: FulfillmentStatus;
  currentLocation?: string;
  
  // Tracking
  orderNumber?: string;
  trackingInfo?: string;
  receivedQuantity: number;
  receivedDate?: Date;
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AllocationStatus = 'allocated' | 'deployed' | 'in_use' | 'returned' | 'lost' | 'damaged';

export interface ResourceAllocation {
  id: string;
  requirementId: string;
  
  // Allocation details
  allocatedQuantity: number;
  allocatedFrom: string; // Source/vendor
  allocationDate: Date;
  
  // Assignment
  allocatedToAssignment?: string;
  allocatedToPerson?: string;
  allocatedToLocation: string;
  
  // Tracking
  serialNumbers: string[];
  conditionNotes?: string;
  maintenanceRequirements?: string;
  
  // Status
  allocationStatus: AllocationStatus;
  returnDate?: Date;
  returnCondition?: string;
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==============================================================================
// REAL-TIME COLLABORATION TYPES
// ==============================================================================

export type SessionStatus = 'active' | 'idle' | 'disconnected';
export type ChangeType = 'insert' | 'delete' | 'replace' | 'format' | 'move';
export type ConflictType = 'concurrent_edit' | 'version_mismatch' | 'field_lock';
export type ResolutionStatus = 'unresolved' | 'auto_resolved' | 'manual_resolved' | 'escalated';
export type ResolutionMethod = 'last_write_wins' | 'manual_merge' | 'escalation';

export interface CollaborationSession {
  id: string;
  worksheetId: string;
  
  // Session details
  sessionId: string;
  userId: string;
  userName: string;
  userRole?: string;
  
  // Session metadata
  startedAt: Date;
  lastActivity: Date;
  status: SessionStatus;
  
  // Collaboration details
  editingSection?: string; // Which part they're editing
  cursorPosition?: number;
  selectionRange?: { start: number; end: number };
  
  // Real-time data
  connectionId?: string;
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RealtimeChange {
  id: string;
  sessionId: string;
  worksheetId: string;
  
  // Change details
  changeType: ChangeType;
  fieldPath: string; // JSON path to the field being changed
  
  // Change data
  oldValue?: any;
  newValue?: any;
  changePosition?: number;
  changeLength?: number;
  
  // Operational transformation
  operationId: string;
  parentOperationId?: string;
  transformationApplied: boolean;
  
  // Metadata
  timestamp: Date;
  appliedAt?: Date;
  userId: string;
}

export interface ChangeConflict {
  id: string;
  worksheetId: string;
  
  // Conflict details
  conflictType: ConflictType;
  fieldPath: string;
  
  // Conflicting changes
  changeAId?: string;
  changeBId?: string;
  userAId: string;
  userBId: string;
  
  // Resolution
  resolutionStatus: ResolutionStatus;
  resolutionMethod?: ResolutionMethod;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  
  createdAt: Date;
}

// ==============================================================================
// VERSIONING AND AUDIT TYPES
// ==============================================================================

export type AuditOperation = 'INSERT' | 'UPDATE' | 'DELETE' | 'VERSION' | 'PUBLISH' | 'ARCHIVE';

export interface ICS215AuditEntry {
  id: string;
  worksheetId?: string;
  
  // Audit details
  tableName: string;
  recordId?: string;
  operation: AuditOperation;
  
  // Change data
  fieldChanges?: Record<string, { old: any; new: any }>;
  oldData?: any;
  newData?: any;
  
  // Context
  changeReason?: string;
  batchId?: string;
  
  // User and session
  userId?: string;
  userName?: string;
  sessionId?: string;
  
  // Metadata
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export type SnapshotType = 'manual' | 'auto' | 'publish' | 'backup';

export interface WorksheetSnapshot {
  id: string;
  worksheetId: string;
  
  // Version info
  versionNumber: number;
  snapshotType: SnapshotType;
  
  // Complete data snapshot
  worksheetData: ICS215Worksheet;
  assignmentsData?: ServiceLineAssignment[];
  resourcesData?: ResourceRequirement[];
  workAssignmentsData?: WorkAssignment[];
  
  // Metadata
  createdBy?: string;
  createdAt: Date;
  description?: string;
}

// ==============================================================================
// OFFLINE SUPPORT AND SYNC TYPES
// ==============================================================================

export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE';
export type SyncStatus = 'pending' | 'synced' | 'conflict' | 'failed' | 'discarded';
export type ConflictResolution = 'client_wins' | 'server_wins' | 'merge' | 'manual';
export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'offline';

export interface SyncQueueItem {
  id: string;
  
  // Operation details
  operationType: SyncOperation;
  tableName: string;
  recordId?: string;
  
  // Data
  dataPayload: any;
  originalData?: any; // For conflict detection
  
  // Sync metadata
  clientId: string;
  clientTimestamp: Date;
  serverTimestamp: Date;
  
  // Status
  syncStatus: SyncStatus;
  attemptCount: number;
  lastAttempt?: Date;
  errorMessage?: string;
  
  // Conflict resolution
  conflictResolution?: ConflictResolution;
  resolvedBy?: string;
  resolvedAt?: Date;
  
  createdAt: Date;
}

export interface ClientSyncState {
  id: string;
  clientId: string;
  
  // Sync positions
  lastSyncTimestamp?: Date;
  lastSyncVersion?: number;
  pendingChangesCount: number;
  
  // Client info
  userId?: string;
  deviceInfo?: Record<string, any>;
  appVersion?: string;
  
  // Connection state
  isOnline: boolean;
  lastOnline: Date;
  connectionQuality: ConnectionQuality;
  
  createdAt: Date;
  updatedAt: Date;
}

// ==============================================================================
// DASHBOARD AND REPORTING TYPES
// ==============================================================================

export interface WorksheetSummary {
  worksheetId: string;
  worksheetNumber: string;
  sectionType: SectionType;
  operationName: string;
  operationState: string;
  totalAssignments: number;
  completedAssignments: number;
  totalResources: number;
  fulfilledResources: number;
  activeCollaborators: number;
  status: WorksheetStatus;
  operationalPeriodStart: Date;
  operationalPeriodEnd: Date;
}

export interface ResourceSummary {
  worksheetId: string;
  worksheetNumber: string;
  sectionType: SectionType;
  resourceType: ResourceType;
  totalNeeded: number;
  totalAvailable: number;
  totalOrdered: number;
  resourceLineItems: number;
  fulfilledItems: number;
  totalEstimatedCost: number;
}

export interface AssignmentProgressSummary {
  worksheetId: string;
  sectionType: SectionType;
  operationalPeriodStart: Date;
  operationalPeriodEnd: Date;
  totalAssignments: number;
  assignedCount: number;
  inProgressCount: number;
  completedCount: number;
  delayedCount: number;
  avgProgress: number;
  overdueCount: number;
}

export interface CollaborationStatusSummary {
  worksheetId: string;
  sectionType: SectionType;
  activeSessions: number;
  activeUsers: string[];
  lastActivity?: Date;
  recentChanges: number;
  unresolvedConflicts: number;
}

// ==============================================================================
// API AND SERVICE TYPES
// ==============================================================================

export interface CreateWorksheetRequest {
  operationId: string;
  sectionType: SectionType;
  incidentName: string;
  preparedBy: string;
  operationalPeriodStart: Date;
  operationalPeriodEnd: Date;
  branch?: string;
  division?: string;
  groupAssignment?: string;
  missionStatement?: string;
  situationSummary?: string;
}

export interface UpdateWorksheetRequest {
  missionStatement?: string;
  situationSummary?: string;
  executionSummary?: string;
  specialInstructions?: string;
  status?: WorksheetStatus;
  priorityLevel?: PriorityLevel;
}

export interface CreateAssignmentRequest {
  worksheetId: string;
  assignmentType: string;
  assignmentName: string;
  // Additional fields specific to assignment type
  [key: string]: any;
}

export interface WorksheetFilter {
  operationId?: string;
  sectionType?: SectionType;
  status?: WorksheetStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  assignedTo?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==============================================================================
// FORM VALIDATION AND CONSTRAINTS
// ==============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Constraint definitions
export const WORKSHEET_CONSTRAINTS = {
  WORKSHEET_ID_MAX_LENGTH: 100,
  INCIDENT_NAME_MAX_LENGTH: 255,
  MISSION_STATEMENT_MAX_LENGTH: 2000,
  SITUATION_SUMMARY_MAX_LENGTH: 5000,
  EXECUTION_SUMMARY_MAX_LENGTH: 5000,
  SPECIAL_INSTRUCTIONS_MAX_LENGTH: 2000,
  MAX_OPERATIONAL_PERIOD_HOURS: 24,
  MIN_OPERATIONAL_PERIOD_HOURS: 1,
} as const;

export const ASSIGNMENT_CONSTRAINTS = {
  ASSIGNMENT_NAME_MAX_LENGTH: 255,
  TASK_DESCRIPTION_MAX_LENGTH: 2000,
  NOTES_MAX_LENGTH: 1000,
  MAX_STAFF_REQUIRED: 1000,
  MAX_VOLUNTEERS_REQUIRED: 10000,
  MAX_TARGET_CLIENTS: 100000,
} as const;

export const RESOURCE_CONSTRAINTS = {
  RESOURCE_NAME_MAX_LENGTH: 255,
  MAX_QUANTITY: 1000000,
  MAX_COST_PER_UNIT: 1000000,
  SPECIFICATIONS_MAX_SIZE: 10000, // JSON size in characters
} as const;

// ==============================================================================
// UTILITY TYPES
// ==============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};

export type WithTimestamps<T> = T & Timestamps;

export type OptionalId<T> = Omit<T, 'id'> & { id?: string };

// Database record types (snake_case versions for direct DB interaction)
export interface ICS215WorksheetRecord {
  id: string;
  worksheet_id: string;
  operation_id: string;
  worksheet_number: number;
  operational_period_start: string;
  operational_period_end: string;
  incident_name: string;
  incident_number?: string;
  prepared_by: string;
  prepared_date: string;
  section_type: string;
  branch?: string;
  division?: string;
  group_assignment?: string;
  status: string;
  priority_level: number;
  mission_statement?: string;
  situation_summary?: string;
  execution_summary?: string;
  special_instructions?: string;
  version_number: number;
  parent_version_id?: string;
  is_current_version: boolean;
  locked_by?: string;
  locked_at?: string;
  lock_expires_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// Helper functions for type conversions
export interface TypeConverters {
  worksheetFromDB: (record: ICS215WorksheetRecord) => ICS215Worksheet;
  worksheetToDB: (worksheet: Partial<ICS215Worksheet>) => Partial<ICS215WorksheetRecord>;
  dateFromDB: (dateString: string | null) => Date | undefined;
  dateToDB: (date: Date | undefined) => string | undefined;
}

// Event types for real-time updates
export type WorksheetEvent = 
  | { type: 'worksheet_created'; data: ICS215Worksheet }
  | { type: 'worksheet_updated'; data: Partial<ICS215Worksheet> & { id: string } }
  | { type: 'worksheet_deleted'; data: { id: string } }
  | { type: 'assignment_created'; data: ServiceLineAssignment }
  | { type: 'assignment_updated'; data: Partial<ServiceLineAssignment> & { id: string } }
  | { type: 'assignment_deleted'; data: { id: string } }
  | { type: 'collaboration_started'; data: CollaborationSession }
  | { type: 'collaboration_ended'; data: { sessionId: string } }
  | { type: 'conflict_detected'; data: ChangeConflict }
  | { type: 'conflict_resolved'; data: { conflictId: string; resolution: ResolutionMethod } };

// Export key type names for documentation
export const ICS215_TYPES = {
  ICS215Worksheet: 'ICS215Worksheet',
  WorkAssignment: 'WorkAssignment',
  ResourceRequirement: 'ResourceRequirement',
  ResourceAllocation: 'ResourceAllocation',
  CollaborationSession: 'CollaborationSession',
  RealtimeChange: 'RealtimeChange',
  ChangeConflict: 'ChangeConflict',
  ICS215AuditEntry: 'ICS215AuditEntry',
  WorksheetSnapshot: 'WorksheetSnapshot',
  SyncQueueItem: 'SyncQueueItem',
  ClientSyncState: 'ClientSyncState',
  WorksheetSummary: 'WorksheetSummary',
  ResourceSummary: 'ResourceSummary',
  AssignmentProgressSummary: 'AssignmentProgressSummary',
  CollaborationStatusSummary: 'CollaborationStatusSummary',
} as const;