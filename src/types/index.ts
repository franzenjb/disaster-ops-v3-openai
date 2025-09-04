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

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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