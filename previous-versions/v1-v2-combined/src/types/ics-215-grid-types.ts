/**
 * ICS Form 215 Grid Types
 * 
 * Flexible data model that handles all service lines while keeping
 * the interface simple and Excel-like for disaster responders
 */

// Base types for all service lines
export type CellStatus = 'green' | 'yellow' | 'red' | 'white' | 'gray';
export type ServiceLineType = 'sheltering' | 'kitchen' | 'mobile-feeding' | 'disaster-aid' | 'individual-care' | 'distribution';

// Cell value can be different types depending on the service line
export type CellValue = number | string | boolean | null | {
  req?: number;
  have?: number;
  need?: number;
  status?: CellStatus;
  note?: string;
};

// Base resource that all service lines extend
export interface BaseResource {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  primaryContact?: string;
  notes?: string;
  status: CellStatus;
  lastUpdated: Date;
  updatedBy?: string;
}

// Sheltering specific resource
export interface ShelterResource extends BaseResource {
  type: 'shelter';
  capacity: number;
  currentOccupancy: number;
  adaSpaces?: number;
  petSpaces?: number;
  manager?: string;
  shelterType?: 'congregate' | 'non-congregate' | 'evacuation';
  dailyData: {
    [date: string]: {
      req: number;
      have: number;
      need: number;
      status: CellStatus;
      note?: string;
    };
  };
}

// Kitchen/Feeding specific resource
export interface KitchenResource extends BaseResource {
  type: 'kitchen';
  mealsCapacity: number;
  mealsServed: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'all';
  dailyData: {
    [date: string]: {
      breakfast?: number;
      lunch?: number;
      dinner?: number;
      total: number;
      status: CellStatus;
      note?: string;
    };
  };
}

// Mobile Feeding (ERV) specific resource
export interface MobileFeedingResource extends BaseResource {
  type: 'mobile-feeding';
  vehicleNumber: string;
  crewSize: number;
  routeName?: string;
  dailyData: {
    [date: string]: {
      mealsServed: number;
      stopsCompleted: number;
      milesDriven?: number;
      status: CellStatus;
      note?: string;
    };
  };
}

// Disaster Aid Station resource
export interface DisasterAidResource extends BaseResource {
  type: 'disaster-aid';
  stationType: 'fixed' | 'mobile';
  servicesProvided: string[];
  dailyData: {
    [date: string]: {
      clientsServed: number;
      servicesProvided: {
        [service: string]: number;
      };
      status: CellStatus;
      note?: string;
    };
  };
}

// Individual Disaster Care resource
export interface IndividualCareResource extends BaseResource {
  type: 'individual-care';
  teamNumber: string;
  teamLeader: string;
  dailyData: {
    [date: string]: {
      dayShift: {
        personnel: number;
        casesOpen: number;
        casesClosed: number;
      };
      nightShift: {
        personnel: number;
        casesOpen: number;
        casesClosed: number;
      };
      status: CellStatus;
      note?: string;
    };
  };
}

// Distribution resource
export interface DistributionResource extends BaseResource {
  type: 'distribution';
  distributionType: 'bulk' | 'individual';
  dailyData: {
    [date: string]: {
      kitsAvailable: number;
      kitsDistributed: number;
      waterCases?: number;
      blankets?: number;
      tarps?: number;
      status: CellStatus;
      note?: string;
    };
  };
}

// Union type for all resources
export type ICSResource = 
  | ShelterResource 
  | KitchenResource 
  | MobileFeedingResource 
  | DisasterAidResource 
  | IndividualCareResource 
  | DistributionResource;

// Grid configuration for each service line
export interface GridConfig {
  serviceLineType: ServiceLineType;
  displayName: string;
  columns: ColumnConfig[];
  defaultResource: Partial<ICSResource>;
  rollupCalculations: RollupConfig[];
  colorCoding: ColorCodingRule[];
}

// Column configuration
export interface ColumnConfig {
  id: string;
  header: string;
  width?: number;
  type: 'text' | 'number' | 'dropdown' | 'date' | 'time' | 'reqHaveNeed' | 'status';
  editable: boolean;
  required?: boolean;
  validation?: (value: CellValue) => boolean | string;
  options?: string[] | number[]; // For dropdowns
  formula?: string; // For calculated fields
}

// Rollup configuration
export interface RollupConfig {
  id: string;
  name: string;
  calculation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom';
  customFormula?: (resources: ICSResource[]) => number;
  displayInSummary: boolean;
}

// Color coding rules
export interface ColorCodingRule {
  condition: (value: CellValue, resource?: ICSResource) => boolean;
  color: CellStatus;
  priority: number; // Higher priority rules override lower ones
}

// Summary data that feeds into the IAP
export interface ServiceLineSummary {
  serviceLineType: ServiceLineType;
  operationalPeriod: {
    start: Date;
    end: Date;
  };
  totalResources: number;
  activeResources: number;
  criticalResources: number; // Red status
  metrics: {
    [key: string]: number | string;
  };
  trends: {
    [key: string]: 'up' | 'down' | 'stable';
  };
  issues: string[];
  recommendations: string[];
  lastUpdated: Date;
}

// User action for undo/redo
export interface GridAction {
  id: string;
  timestamp: Date;
  userId: string;
  actionType: 'edit' | 'add' | 'delete' | 'bulk-update';
  previousValue: CellValue;
  newValue: CellValue;
  resourceId: string;
  columnId: string;
  date?: string; // For date-specific cells
}

// Grid state for managing the entire grid
export interface GridState {
  serviceLineType: ServiceLineType;
  resources: ICSResource[];
  selectedCells: Set<string>; // Format: "resourceId-columnId-date"
  activeCellId: string | null;
  isEditing: boolean;
  filters: {
    status?: CellStatus[];
    counties?: string[];
    search?: string;
  };
  sort: {
    columnId: string;
    direction: 'asc' | 'desc';
  } | null;
  history: GridAction[];
  historyIndex: number; // For undo/redo
  lastSyncTime: Date;
  isDirty: boolean;
}

// Export formats
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeNotes: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  serviceLiness?: ServiceLineType[];
}