/**
 * Complete Type Definitions for Disaster Operations
 * All Form 5266 line items and data structures
 */

// Geographic Types
export interface Region {
  id: string;
  name: string;
  abbreviation: string;
  counties: County[];
  chapters: Chapter[];
}

export interface County {
  id: string;
  name: string;
  state: string;
  fipsCode: string;
  population?: number;
  chapter?: string;
  boundary?: any;
}

export interface Chapter {
  id: string;
  name: string;
  counties: string[];
}

// Contact Information
export interface Contact {
  id?: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  radio?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
}

// Service Line Data Structures
export interface FeedingData {
  // Line 6-9: Daily Meals
  breakfastServed: number;
  lunchServed: number;
  dinnerServed: number;
  snacksServed: number;
  totalMealsToDate: number; // Line 9
  
  // Line 10-13: Feeding Sites
  fixedFeedingSites: number;
  mobileFeedingUnits: number; // ERVs
  feedingStaff: number;
  feedingVolunteers: number;
  
  // Line 14-15: Distribution
  bulkDistributionItems: number;
  partnerMealsProvided: number;
  
  // Detailed tracking
  meals: DailyMetric[];
  snacks: DailyMetric[];
  feedingSites: FeedingSite[];
  notes?: string;
  feedingPhoto?: string;
}

export interface FeedingSite {
  id: string;
  name: string;
  address: Address;
  type: 'Fixed' | 'Mobile' | 'Distribution';
  capacity: number;
  mealsServed: number;
  manager: Contact;
}

export interface ShelteringData {
  // Line 38-44: Core Shelter Stats
  sheltersOpen: number; // Line 38
  shelterCapacity: number; // Line 39
  currentPopulation: number; // Line 40
  newRegistrations: number; // Line 41
  overnightStays: DailyMetric[]; // Line 42
  petsSheltered: number; // Line 43
  totalClientsServed: number; // Line 44
  
  // Line 45-48: Additional
  shelterStaff: number;
  shelterVolunteers: number;
  hotelsUtilized: number;
  hotelRooms: number;
  
  // Detailed tracking
  sheltersList: ShelterSite[];
  shelterSites: ShelterSite[]; // Alias for compatibility
  notes?: string;
}

export interface ShelterSite {
  id: string;
  name: string;
  address: string;
  type: 'Congregate' | 'Non-Congregate' | 'Hotel/Motel' | 'Dormitory' | 'Other';
  capacity: number;
  currentOccupancy: number;
  status: 'Open' | 'Full' | 'Closing' | 'Closed';
  manager: string;
  phone?: string;
  petFriendly: boolean;
  adaCompliant: boolean;
  openedDate: string;
  notes?: string;
}

export interface HealthData {
  // Line 49-56: Health Services
  firstAidContacts: number;
  nursingContacts: number;
  emergencyTransports: number;
  hospitalVisits: number;
  healthServicesStaff: number;
  mentalHealthContacts: number;
  spiritualCareContacts: number;
  healthEducationContacts: number;
}

export interface DistributionData {
  // Line 16-25: Mass Care/Distribution
  cleanupKits: number;
  comfortKits: number;
  emergencySupplies: number;
  bulkItems: number;
  distributionSites: number;
  itemsDistributed: DailyMetric[];
}

export interface RecoveryData {
  // Line 31-37: Individual Assistance
  casesOpened: number;
  casesClosed: number;
  caseworkContacts: number;
  financialAssistanceProvided: number;
  financialAssistanceAmount: number;
  referralsMade: number;
  followUpContacts: number;
}

export interface LogisticsData {
  // Line 57-65: Staffing/Logistics
  totalStaff: number;
  totalVolunteers: number;
  ervCount: number;
  vehiclesDeployed: number;
  warehousesOpen: number;
  inventoryValue: number;
}

// Daily Tracking
export interface DailyMetric {
  date: Date;
  value: number;
  location?: string;
  notes?: string;
}

// IAP Document Structure
export interface IAPDocument {
  meta: {
    iapNumber: number;
    operationalPeriod: {
      start: Date;
      end: Date;
    };
    preparedBy: Contact;
    approvedBy: Contact;
  };
  
  sections: {
    cover: IAPCoverPage;
    directorsIntent: RichTextSection;
    executiveSummary: RichTextSection;
    currentSituation: StatusSection;
    objectives: ActionItem[];
    organization: {
      contacts: ContactSection;
      chart: OrgChartSection;
    };
    assignments: WorkAssignment[];
    logistics: {
      sites: WorkSite[];
      resources: ResourceItem[];
      communications: CommsSection;
    };
    planning: {
      schedule: ScheduleItem[];
      weather: WeatherSection;
      maps: MapSection;
    };
    safety: RichTextSection;
    appendices: IAPAppendix[];
  };
  
  versions: IAPVersion[];
}

export interface IAPCoverPage {
  operationName: string;
  drNumber: string;
  preparedDate: Date;
  operationalPeriod: string;
}

export interface RichTextSection {
  title?: string;
  content: string;
  lastModified: Date;
  modifiedBy: string;
}

export interface StatusSection {
  currentStatus: string;
  challenges: string[];
  priorities: string[];
}

export interface ActionItem {
  id: string;
  objective: string;
  status: 'Not Started' | 'In Progress' | 'Complete';
  assignedTo: string;
  dueDate?: Date;
}

export interface ContactSection {
  commandStaff: Contact[];
  sectionChiefs: Contact[];
  branchDirectors: Contact[];
  external: Contact[];
}

export interface OrgChartSection {
  structure: any; // Simplified for now
}

export interface WorkAssignment {
  id: string;
  team: string;
  assignment: string;
  location: string;
  reportTime: string;
  supervisor: Contact;
}

export interface WorkSite {
  id: string;
  name: string;
  address: Address;
  type: string;
  manager: Contact;
  hours: string;
}

export interface ResourceItem {
  id: string;
  type: string;
  quantity: number;
  location: string;
  status: string;
}

export interface CommsSection {
  radioChannels: any[];
  phoneTree: any[];
}

export interface ScheduleItem {
  time: string;
  event: string;
  location: string;
  responsible: string;
}

export interface WeatherSection {
  current: any;
  forecast: any[];
}

export interface MapSection {
  operationalArea: any;
  facilities: any[];
}

export interface IAPAppendix {
  id: string;
  title: string;
  type: 'document' | 'map' | 'roster' | 'other';
  content: any;
}

export interface IAPVersion {
  versionNumber: number;
  createdDate: Date;
  createdBy: string;
  changes: string[];
}

// Audit/Change Tracking
export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  details: any;
  reversible: boolean;
}

export interface Change {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface Attachment {
  id: string;
  filename: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ResourceLock {
  resourceId: string;
  lockedBy: string;
  lockedAt: Date;
  expiresAt: Date;
}