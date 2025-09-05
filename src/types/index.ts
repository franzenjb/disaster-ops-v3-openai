/**
 * Core type definitions for the Disaster Operations Platform
 */

// Operation Types
export interface Operation {
  id: string;
  operationNumber: string;
  operationName: string;
  disasterType: DisasterType;
  drNumber?: string; // FEMA disaster relief number
  status: OperationStatus;
  activationLevel: ActivationLevel;
  createdAt: Date;
  createdBy: string;
  closedAt?: Date;
  closedBy?: string;
  geography: OperationGeography;
  metadata: OperationMetadata;
}

export type DisasterType = 
  | 'hurricane'
  | 'tornado'
  | 'flood'
  | 'wildfire'
  | 'earthquake'
  | 'winter_storm'
  | 'pandemic'
  | 'mass_casualty'
  | 'other';

export type OperationStatus = 
  | 'planning'
  | 'active'
  | 'demobilizing'
  | 'closed'
  | 'suspended';

export type ActivationLevel = 
  | 'level_1' // Local resources only
  | 'level_2' // Regional resources
  | 'level_3' // National resources
  | 'level_4'; // International assistance

export interface OperationGeography {
  regions: string[];
  states: string[];
  counties: County[];
  chapters: Chapter[];
  headquarters?: Location;
}

export interface OperationMetadata {
  estimatedDuration?: number; // days
  estimatedPopulationAffected?: number;
  serviceLinesActivated: ServiceLine[];
  externalPartners?: string[];
  notes?: string;
}

// Geographic Types
export interface County {
  id: string;
  name: string;
  state: string;
  fips: string;
  population?: number;
  area?: number; // square miles
}

export interface Chapter {
  id: string;
  name: string;
  region: string;
  division: string;
  coverageArea: string[]; // List of county names
  headquarters: Location;
  contact: ContactInfo;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  fax?: string;
  emergencyPhone?: string;
}

// Service Lines
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

// Personnel Types
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  employeeId?: string;
  volunteerNumber?: string;
  certifications: Certification[];
  availability: Availability;
  homeChapter: string;
  deploymentHistory?: Deployment[];
}

export interface Certification {
  type: string;
  issueDate: Date;
  expirationDate?: Date;
  issuingAuthority: string;
}

export interface Availability {
  status: 'available' | 'deployed' | 'unavailable';
  availableFrom?: Date;
  availableUntil?: Date;
  restrictions?: string[];
}

export interface Deployment {
  operationId: string;
  startDate: Date;
  endDate?: Date;
  position: string;
  location: string;
}

// Roster Types
export interface RosterEntry {
  id: string;
  operationId: string;
  personId: string;
  person: Person;
  position: ICSPosition;
  customTitle?: string;
  section: ICSSection;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'pending' | 'released';
  reportingTo?: string; // ID of supervisor
  notes?: string;
}

export type ICSSection = 
  | 'command'
  | 'operations'
  | 'planning'
  | 'logistics'
  | 'finance';

export interface ICSPosition {
  code: string;
  title: string;
  section: ICSSection;
  level: number; // 1 = IC, 2 = Section Chief, etc.
  responsibilities: string[];
}

// IAP Types
export interface IAPDocument {
  id: string;
  operationId: string;
  iapNumber: number;
  operationalPeriod: {
    start: Date;
    end: Date;
  };
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  createdBy: string;
  publishedAt?: Date;
  publishedBy?: string;
  sections: IAPSections;
  attachments?: Attachment[];
  version: number;
}

export interface IAPSections {
  coverPage: IAPCoverPage;
  incidentObjectives: ICSForm202;
  organizationChart: ICSForm203;
  assignmentList: ICSForm204;
  communicationsPlan: ICSForm205;
  medicalPlan: ICSForm206;
  operationalPlanning: ICSForm215;
  directorsMessage?: RichTextContent;
  generalMessages?: RichTextContent;
  weatherForecast?: WeatherInfo;
  mapProducts?: MapProduct[];
}

export interface IAPCoverPage {
  operationName: string;
  operationNumber: string;
  iapNumber: number;
  operationalPeriodStart: Date;
  operationalPeriodEnd: Date;
  preparedBy: string;
  approvedBy: string;
  distributionList: string[];
}

export interface ICSForm202 {
  objectives: string[];
  weatherSummary?: string;
  safetyMessage?: string;
  priorities: string[];
  preparedBy: string;
  dateTime: Date;
}

export interface ICSForm203 {
  incidentCommander: string;
  deputyIC?: string;
  sections: {
    operations: OrgChartSection;
    planning: OrgChartSection;
    logistics: OrgChartSection;
    finance: OrgChartSection;
  };
  safetyOfficer?: string;
  publicInfoOfficer?: string;
  liaisonOfficer?: string;
}

export interface OrgChartSection {
  chief: string;
  deputy?: string;
  branches?: OrgChartBranch[];
  units?: string[];
}

export interface OrgChartBranch {
  name: string;
  director: string;
  divisions?: string[];
}

export interface ICSForm204 {
  branch?: string;
  division?: string;
  group?: string;
  operationsSectionChief: string;
  branchDirector?: string;
  divisionSupervisor?: string;
  resources: ResourceAssignment[];
  workAssignments: string[];
  specialInstructions?: string;
  preparedBy: string;
  dateTime: Date;
}

export interface ResourceAssignment {
  resourceType: string;
  identifier: string;
  leader: string;
  numberOfPersons: number;
  contact: string;
}

export interface ICSForm205 {
  operationalPeriod: {
    start: Date;
    end: Date;
  };
  basicRadioChannel: RadioChannel[];
  telephoneNumbers: EmergencyContact[];
  preparedBy: string;
  dateTime: Date;
}

export interface RadioChannel {
  function: string;
  channel: string;
  frequency: string;
  system: string;
  remarks?: string;
}

export interface EmergencyContact {
  position: string;
  name: string;
  phoneNumbers: string[];
}

export interface ICSForm206 {
  medicalAidStations: MedicalFacility[];
  ambulanceServices: AmbulanceService[];
  hospitals: Hospital[];
  emergencyProcedures: string;
  preparedBy: string;
  dateTime: Date;
}

export interface MedicalFacility {
  name: string;
  location: string;
  contact: string;
  paramedics: boolean;
}

export interface AmbulanceService {
  name: string;
  address: string;
  phone: string;
  paramedics: boolean;
}

export interface Hospital {
  name: string;
  address: string;
  contact: string;
  travelTime: string; // air/ground
  traumaCenter: boolean;
  burnCenter: boolean;
  helipad: boolean;
}

export interface ICSForm215 {
  objectives: string[];
  commandEmphasis: string[];
  generalSituationalAwareness: string;
  meetings: ScheduledMeeting[];
  attachments: string[];
  preparedBy: string;
  dateTime: Date;
}

export interface ScheduledMeeting {
  dateTime: Date;
  purpose: string;
  location: string;
  attendees: string[];
}

// Supporting Types
export interface RichTextContent {
  html: string;
  plainText: string;
  lastEditedBy: string;
  lastEditedAt: Date;
}

export interface WeatherInfo {
  current: WeatherCondition;
  forecast: WeatherCondition[];
  alerts?: WeatherAlert[];
  source: string;
  updatedAt: Date;
}

export interface WeatherCondition {
  dateTime: Date;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  conditions: string;
}

export interface WeatherAlert {
  type: string;
  severity: 'watch' | 'warning' | 'advisory';
  headline: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

export interface MapProduct {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'overview' | 'tactical' | 'resource' | 'hazard';
  createdAt: Date;
  createdBy: string;
}

export interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// Setup Wizard Types
export interface SetupWizardState {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  data: {
    basics?: OperationBasics;
    geography?: OperationGeography;
    staffing?: InitialStaffing;
    resources?: ResourceRequirements;
  };
  validation: {
    [step: number]: ValidationResult;
  };
}

export interface OperationBasics {
  operationName: string;
  operationNumber?: string;
  disasterType: DisasterType;
  drNumber?: string;
  activationLevel: ActivationLevel;
  estimatedDuration?: number;
  notes?: string;
  creatorName?: string;
  creatorEmail?: string;
  creatorPhone?: string;
}

export interface InitialStaffing {
  incidentCommander?: string;
  deputyIC?: string;
  operationsChief?: string;
  planningChief?: string;
  logisticsChief?: string;
  financeChief?: string;
  importFromOperation?: string;
}

export interface ResourceRequirements {
  expectedDuration: number;
  serviceLinesNeeded: ServiceLine[];
  estimatedMealsPerDay?: number;
  shelterCapacityNeeded?: number;
  vehiclesNeeded?: number;
  specialEquipment?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Red Cross Organizational Structure
export interface Division {
  name: string;
  code: string;
  headquarters: string;
  regions: Region[];
}

export interface Region {
  id: string;
  name: string;
  code: string;
  division: string;
  states: string[];
  chapters: string[];
  headquarters: Location;
}

// Service Metrics
export interface ServiceMetric {
  id: string;
  operationId: string;
  date: Date;
  serviceType: ServiceLine;
  metricType: string;
  value: number;
  unit: string;
  location?: string;
  reportedBy: string;
  reportedAt: Date;
  verified: boolean;
}

// User Types with IAP Role-Based Access
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  iapRole: IAPRole;
  permissions: Permission[];
  homeChapter?: string;
  activeOperations: string[];
  lastActive: Date;
  preferences: UserPreferences;
}

export type UserRole = 
  | 'viewer'
  | 'operator'
  | 'section_chief'
  | 'incident_commander'
  | 'admin';

export type IAPRole = 
  | 'ip_group'      // I&P Group - full IAP editing access
  | 'discipline'    // Discipline Teams - facility-specific access
  | 'field'         // Field Teams - read-only access
  | 'viewer';       // View-only access

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  defaultView: 'dashboard' | 'iap' | 'roster';
  timezone: string;
}

// IAP Facility Management Types (Core of IAP System)
export interface IAPFacility {
  id: string;
  operationId: string;
  facilityType: FacilityType;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  contact: FacilityContact;
  capacity: FacilityCapacity;
  personnel: FacilityPersonnel[];
  resources: FacilityResource[];
  status: FacilityStatus;
  workAssignments: WorkAssignment[];
  serviceLines: ServiceLine[];
  operationalPeriod: {
    start: Date;
    end: Date;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

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
  | 'other';

export interface FacilityContact {
  primaryName: string;
  primaryPhone: string;
  primaryEmail?: string;
  backupName?: string;
  backupPhone?: string;
  backupEmail?: string;
}

export interface FacilityCapacity {
  totalCapacity?: number;
  currentOccupancy?: number;
  availableSpace?: number;
  specialNeeds?: number;
  pets?: number;
  notes?: string;
}

export interface FacilityPersonnel {
  id: string;
  personId: string;
  position: string;
  section: ICSSection;
  startTime: Date;
  endTime?: Date;
  contactInfo: ContactInfo;
  certifications: string[];
  isLeader: boolean;
  reportingTo?: string;
}

export interface FacilityResource {
  id: string;
  resourceType: ResourceType;
  identifier: string;
  description: string;
  quantity: number;
  status: ResourceStatus;
  assignedTo?: string;
  location?: string;
  notes?: string;
}

export type ResourceType = 
  | 'vehicle'
  | 'equipment'
  | 'supplies'
  | 'communications'
  | 'medical'
  | 'shelter_supplies'
  | 'feeding_equipment'
  | 'other';

export type ResourceStatus = 
  | 'available'
  | 'assigned'
  | 'in_use'
  | 'maintenance'
  | 'unavailable';

export type FacilityStatus = 
  | 'planning'
  | 'setup'
  | 'operational'
  | 'closing'
  | 'closed'
  | 'standby';

export interface WorkAssignment {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string[];
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
}

// Enhanced IAP Document Structure (53-Page System)
export interface EnhancedIAPDocument extends IAPDocument {
  facilityData: IAPFacilityData;
  workSitesTable: WorkSitesTable;
  dailySchedule: DailySchedule;
  contactRoster: ContactRoster;
  organizationChart: EnhancedOrgChart;
  directorsMessage: RichTextContent;
  generalMessages: RichTextContent[];
  incidentPriorities: IncidentPriorities;
  previousPeriodStatus: PreviousPeriodStatus;
  actionTracker: ActionTracker;
  photoAttachments: PhotoAttachment[];
  ancillaryContent: AncillaryContent[];
  versionHistory: IAPVersion[];
  officialSnapshot?: IAPSnapshot;
}

export interface IAPFacilityData {
  facilities: IAPFacility[];
  totalPersonnel: number;
  totalCapacity: number;
  currentOccupancy: number;
  serviceLinesSummary: ServiceLineSummary[];
  geographicDistribution: GeographicSummary[];
}

export interface WorkSitesTable {
  sites: WorkSite[];
  totalSites: number;
  sitesByType: { [key in FacilityType]?: number };
  sitesByCounty: { [county: string]: number };
}

export interface WorkSite {
  id: string;
  county: string;
  type: FacilityType;
  facilityName: string;
  address: string;
  contact: string;
  phone: string;
  status: FacilityStatus;
  personnel: number;
  capacity?: number;
}

export interface DailySchedule {
  meetings: ScheduledMeeting[];
  briefings: Briefing[];
  deadlines: Deadline[];
  specialEvents: SpecialEvent[];
}

export interface Briefing {
  id: string;
  title: string;
  dateTime: Date;
  location: string;
  presenter: string;
  attendees: string[];
  topics: string[];
  teamsLink?: string;
}

export interface Deadline {
  id: string;
  title: string;
  dueDateTime: Date;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
}

export interface SpecialEvent {
  id: string;
  title: string;
  dateTime: Date;
  location: string;
  description: string;
  coordinator: string;
  participantsNeeded?: number;
}

export interface ContactRoster {
  commandStructure: CommandContact[];
  operationsSection: SectionContact[];
  planningSection: SectionContact[];
  logisticsSection: SectionContact[];
  financeSection: SectionContact[];
  externalRelations: ExternalContact[];
  twentyFourHourLines: EmergencyLine[];
}

export interface CommandContact {
  position: string;
  name: string;
  phone: string;
  email: string;
  alternatePhone?: string;
  section: 'command';
  isLiveLink: boolean;
}

export interface SectionContact {
  position: string;
  name: string;
  phone: string;
  email: string;
  alternatePhone?: string;
  section: ICSSection;
  unit?: string;
  isLiveLink: boolean;
}

export interface ExternalContact {
  organization: string;
  contact: string;
  phone: string;
  email?: string;
  role: string;
  availability: string;
}

export interface EmergencyLine {
  purpose: string;
  phone: string;
  availability: string;
  backup?: string;
}

export interface EnhancedOrgChart extends ICSForm203 {
  liveLinks: boolean;
  photoUrls: { [position: string]: string };
  contactMethods: { [position: string]: ContactInfo };
  reportingStructure: ReportingRelationship[];
  vacantPositions: string[];
}

export interface ReportingRelationship {
  subordinate: string;
  supervisor: string;
  directReport: boolean;
}

export interface IncidentPriorities {
  lifeSafety: Priority[];
  incidentStabilization: Priority[];
  propertyConservation: Priority[];
  customPriorities: Priority[];
}

export interface Priority {
  id: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  dueDate?: Date;
  measurableOutcome: string;
  progress: number; // 0-100
  notes?: string;
}

export interface PreviousPeriodStatus {
  completedObjectives: CompletedObjective[];
  carryForwardItems: CarryForwardItem[];
  performanceMetrics: PerformanceMetric[];
  lessonsLearned: string[];
}

export interface CompletedObjective {
  id: string;
  description: string;
  completedAt: Date;
  completedBy: string;
  outcome: string;
  resourcesUsed: string[];
}

export interface CarryForwardItem {
  id: string;
  description: string;
  originalDueDate: Date;
  newDueDate: Date;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
}

export interface PerformanceMetric {
  id: string;
  metricName: string;
  target: number;
  actual: number;
  unit: string;
  period: string;
  variance: number;
  notes?: string;
}

export interface ActionTracker {
  openActions: OpenAction[];
  completedActions: CompletedAction[];
  overdueActions: OverdueAction[];
  upcomingDeadlines: UpcomingDeadline[];
}

export interface OpenAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress';
  createdAt: Date;
  createdBy: string;
}

export interface CompletedAction {
  id: string;
  description: string;
  assignedTo: string;
  completedAt: Date;
  completedBy: string;
  outcome: string;
  originalDueDate: Date;
}

export interface OverdueAction {
  id: string;
  description: string;
  assignedTo: string;
  originalDueDate: Date;
  daysPastDue: number;
  escalatedTo?: string;
  reason?: string;
}

export interface UpcomingDeadline {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  hoursUntilDue: number;
  priority: 'high' | 'medium' | 'low';
}

export interface PhotoAttachment extends Attachment {
  caption: string;
  location?: string;
  timestamp: Date;
  photographer: string;
  isCoverPhoto: boolean;
  displayOrder: number;
}

export interface AncillaryContent {
  id: string;
  title: string;
  content: RichTextContent;
  category: AncillaryCategory;
  displayOrder: number;
  isRequired: boolean;
  createdAt: Date;
  createdBy: string;
}

export type AncillaryCategory = 
  | 'parking_instructions'
  | 'checkout_procedures'
  | 'rental_car_info'
  | 'safety_notices'
  | 'policy_updates'
  | 'general_announcements'
  | 'operational_notes'
  | 'other';

export interface IAPVersion {
  id: string;
  versionNumber: number;
  createdAt: Date;
  createdBy: string;
  changes: VersionChange[];
  isOfficial: boolean;
  snapshotId?: string;
}

export interface VersionChange {
  section: string;
  changeType: 'added' | 'modified' | 'removed';
  description: string;
  previousValue?: any;
  newValue?: any;
}

export interface IAPSnapshot {
  id: string;
  iapId: string;
  versionId: string;
  snapshotTime: Date;
  snapshotType: 'official_6pm' | 'manual' | 'scheduled';
  data: EnhancedIAPDocument;
  generatedBy: string;
  isLocked: boolean;
  distributionList: string[];
}

export interface ServiceLineSummary {
  serviceLine: ServiceLine;
  facilitiesCount: number;
  totalPersonnel: number;
  totalCapacity: number;
  currentOccupancy: number;
  utilizationRate: number;
  status: 'operational' | 'setup' | 'closing' | 'standby';
}

export interface GeographicSummary {
  county: string;
  state: string;
  facilitiesCount: number;
  totalPersonnel: number;
  serviceLines: ServiceLine[];
  primaryContact: string;
}