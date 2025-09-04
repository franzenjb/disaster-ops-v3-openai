/**
 * Service Line Configurations for ICS Form 215
 * 
 * Defines the columns, calculations, and behavior for each service line
 * (Sheltering, Kitchen, Mobile Feeding, etc.)
 */

import {
  ServiceLineType,
  GridConfig,
  ColumnConfig,
  RollupConfig,
  ColorCodingRule,
  CellValue
} from '../types/ics-215-grid-types';

// Sheltering configuration
const shelteringConfig: GridConfig = {
  serviceLineType: 'sheltering',
  displayName: 'Sheltering',
  columns: [
    {
      id: 'name',
      header: 'Shelter Name',
      type: 'text',
      editable: true,
      required: true,
      width: 200
    },
    {
      id: 'address',
      header: 'Address',
      type: 'text',
      editable: true,
      width: 250
    },
    {
      id: 'county',
      header: 'County',
      type: 'dropdown',
      editable: true,
      options: ['Charlotte', 'Collier', 'Lee', 'Hardee', 'Sarasota', 'Orange'],
      width: 100
    },
    {
      id: 'manager',
      header: 'Manager',
      type: 'text',
      editable: true,
      width: 150
    },
    {
      id: 'phone',
      header: 'Phone',
      type: 'text',
      editable: true,
      width: 120
    },
    {
      id: 'capacity',
      header: 'Max Capacity',
      type: 'number',
      editable: true,
      width: 100
    }
  ],
  defaultResource: {
    type: 'shelter',
    status: 'green',
    capacity: 0,
    currentOccupancy: 0
  },
  rollupCalculations: [
    {
      id: 'totalBeds',
      name: 'Total Beds Available',
      calculation: 'sum',
      displayInSummary: true
    },
    {
      id: 'totalOccupancy',
      name: 'Total Occupancy',
      calculation: 'sum',
      displayInSummary: true
    },
    {
      id: 'avgOccupancyRate',
      name: 'Average Occupancy Rate',
      calculation: 'custom',
      customFormula: (resources) => {
        const total = resources.reduce((acc, r) => {
          if (r.type === 'shelter') {
            return acc + (r.currentOccupancy / r.capacity);
          }
          return acc;
        }, 0);
        return Math.round((total / resources.length) * 100);
      },
      displayInSummary: true
    }
  ],
  colorCoding: [
    {
      condition: (value, resource) => {
        if (resource?.type === 'shelter') {
          const rate = resource.currentOccupancy / resource.capacity;
          return rate >= 0.95;
        }
        return false;
      },
      color: 'red',
      priority: 3
    },
    {
      condition: (value, resource) => {
        if (resource?.type === 'shelter') {
          const rate = resource.currentOccupancy / resource.capacity;
          return rate >= 0.8 && rate < 0.95;
        }
        return false;
      },
      color: 'yellow',
      priority: 2
    },
    {
      condition: (value, resource) => {
        if (resource?.type === 'shelter') {
          const rate = resource.currentOccupancy / resource.capacity;
          return rate < 0.8;
        }
        return false;
      },
      color: 'green',
      priority: 1
    }
  ]
};

// Kitchen/Feeding configuration
const kitchenConfig: GridConfig = {
  serviceLineType: 'kitchen',
  displayName: 'Kitchen',
  columns: [
    {
      id: 'name',
      header: 'Kitchen/Site Name',
      type: 'text',
      editable: true,
      required: true,
      width: 200
    },
    {
      id: 'address',
      header: 'Address',
      type: 'text',
      editable: true,
      width: 250
    },
    {
      id: 'county',
      header: 'County',
      type: 'dropdown',
      editable: true,
      options: ['Charlotte', 'Collier', 'Lee', 'Hardee', 'Sarasota', 'Orange'],
      width: 100
    },
    {
      id: 'mealsCapacity',
      header: 'Meal Capacity/Day',
      type: 'number',
      editable: true,
      width: 120
    },
    {
      id: 'mealType',
      header: 'Meal Type',
      type: 'dropdown',
      editable: true,
      options: ['Breakfast', 'Lunch', 'Dinner', 'All Meals'],
      width: 100
    },
    {
      id: 'primaryContact',
      header: 'Contact',
      type: 'text',
      editable: true,
      width: 150
    }
  ],
  defaultResource: {
    type: 'kitchen',
    status: 'green',
    mealsCapacity: 0,
    mealsServed: 0
  },
  rollupCalculations: [
    {
      id: 'totalMealsServed',
      name: 'Total Meals Served Today',
      calculation: 'sum',
      displayInSummary: true
    },
    {
      id: 'totalCapacity',
      name: 'Total Meal Capacity',
      calculation: 'sum',
      displayInSummary: true
    }
  ],
  colorCoding: [
    {
      condition: (value) => {
        if (typeof value === 'object' && value !== null && 'total' in value) {
          return value.total === 0;
        }
        return false;
      },
      color: 'red',
      priority: 3
    },
    {
      condition: (value, resource) => {
        if (resource?.type === 'kitchen' && typeof value === 'object' && value !== null && 'total' in value) {
          const rate = value.total / resource.mealsCapacity;
          return rate < 0.5;
        }
        return false;
      },
      color: 'yellow',
      priority: 2
    },
    {
      condition: (value, resource) => {
        if (resource?.type === 'kitchen' && typeof value === 'object' && value !== null && 'total' in value) {
          const rate = value.total / resource.mealsCapacity;
          return rate >= 0.5;
        }
        return false;
      },
      color: 'green',
      priority: 1
    }
  ]
};

// Mobile Feeding (ERV) configuration
const mobileFeedingConfig: GridConfig = {
  serviceLineType: 'mobile-feeding',
  displayName: 'Mobile Feeding',
  columns: [
    {
      id: 'vehicleNumber',
      header: 'ERV #',
      type: 'text',
      editable: true,
      required: true,
      width: 80
    },
    {
      id: 'name',
      header: 'Unit Name',
      type: 'text',
      editable: true,
      width: 150
    },
    {
      id: 'routeName',
      header: 'Route/Area',
      type: 'text',
      editable: true,
      width: 200
    },
    {
      id: 'crewSize',
      header: 'Crew Size',
      type: 'number',
      editable: true,
      width: 80
    },
    {
      id: 'primaryContact',
      header: 'Team Leader',
      type: 'text',
      editable: true,
      width: 150
    },
    {
      id: 'phone',
      header: 'Phone',
      type: 'text',
      editable: true,
      width: 120
    }
  ],
  defaultResource: {
    type: 'mobile-feeding',
    status: 'green',
    vehicleNumber: '',
    crewSize: 2
  },
  rollupCalculations: [
    {
      id: 'totalMealsServed',
      name: 'Total ERV Meals Served',
      calculation: 'sum',
      displayInSummary: true
    },
    {
      id: 'totalStops',
      name: 'Total Stops Completed',
      calculation: 'sum',
      displayInSummary: true
    },
    {
      id: 'activeERVs',
      name: 'Active ERVs',
      calculation: 'count',
      displayInSummary: true
    }
  ],
  colorCoding: [
    {
      condition: (value) => {
        if (typeof value === 'object' && value !== null && 'mealsServed' in value) {
          return value.mealsServed === 0;
        }
        return false;
      },
      color: 'red',
      priority: 3
    },
    {
      condition: (value) => {
        if (typeof value === 'object' && value !== null && 'mealsServed' in value) {
          return value.mealsServed > 0 && value.mealsServed < 100;
        }
        return false;
      },
      color: 'yellow',
      priority: 2
    },
    {
      condition: (value) => {
        if (typeof value === 'object' && value !== null && 'mealsServed' in value) {
          return value.mealsServed >= 100;
        }
        return false;
      },
      color: 'green',
      priority: 1
    }
  ]
};

// Disaster Aid Station configuration
const disasterAidConfig: GridConfig = {
  serviceLineType: 'disaster-aid',
  displayName: 'Disaster Aid Station',
  columns: [
    {
      id: 'name',
      header: 'Station Name',
      type: 'text',
      editable: true,
      required: true,
      width: 200
    },
    {
      id: 'address',
      header: 'Address',
      type: 'text',
      editable: true,
      width: 250
    },
    {
      id: 'stationType',
      header: 'Type',
      type: 'dropdown',
      editable: true,
      options: ['Fixed', 'Mobile'],
      width: 80
    },
    {
      id: 'primaryContact',
      header: 'Station Manager',
      type: 'text',
      editable: true,
      width: 150
    },
    {
      id: 'phone',
      header: 'Phone',
      type: 'text',
      editable: true,
      width: 120
    }
  ],
  defaultResource: {
    type: 'disaster-aid',
    status: 'green',
    stationType: 'fixed',
    servicesProvided: []
  },
  rollupCalculations: [
    {
      id: 'totalClientsServed',
      name: 'Total Clients Served',
      calculation: 'sum',
      displayInSummary: true
    },
    {
      id: 'activeStations',
      name: 'Active Stations',
      calculation: 'count',
      displayInSummary: true
    }
  ],
  colorCoding: [
    {
      condition: (value) => {
        if (typeof value === 'object' && value !== null && 'clientsServed' in value) {
          return value.clientsServed === 0;
        }
        return false;
      },
      color: 'gray',
      priority: 1
    }
  ]
};

// Individual Disaster Care configuration
const individualCareConfig: GridConfig = {
  serviceLineType: 'individual-care',
  displayName: 'Individual Disaster Care',
  columns: [
    {
      id: 'teamNumber',
      header: 'Team #',
      type: 'text',
      editable: true,
      required: true,
      width: 80
    },
    {
      id: 'name',
      header: 'Team Name',
      type: 'text',
      editable: true,
      width: 150
    },
    {
      id: 'teamLeader',
      header: 'Team Leader',
      type: 'text',
      editable: true,
      width: 150
    },
    {
      id: 'phone',
      header: 'Phone',
      type: 'text',
      editable: true,
      width: 120
    },
    {
      id: 'county',
      header: 'Assigned County',
      type: 'dropdown',
      editable: true,
      options: ['Charlotte', 'Collier', 'Lee', 'Hardee', 'Sarasota', 'Orange'],
      width: 120
    }
  ],
  defaultResource: {
    type: 'individual-care',
    status: 'green',
    teamNumber: '',
    teamLeader: ''
  },
  rollupCalculations: [
    {
      id: 'totalCasesOpen',
      name: 'Total Cases Open',
      calculation: 'sum',
      displayInSummary: true
    },
    {
      id: 'totalCasesClosed',
      name: 'Total Cases Closed',
      calculation: 'sum',
      displayInSummary: true
    },
    {
      id: 'totalPersonnel',
      name: 'Total IDC Personnel',
      calculation: 'sum',
      displayInSummary: true
    }
  ],
  colorCoding: []
};

// Distribution configuration
const distributionConfig: GridConfig = {
  serviceLineType: 'distribution',
  displayName: 'Distribution of Emergency Suppl',
  columns: [
    {
      id: 'name',
      header: 'Distribution Site',
      type: 'text',
      editable: true,
      required: true,
      width: 200
    },
    {
      id: 'address',
      header: 'Address',
      type: 'text',
      editable: true,
      width: 250
    },
    {
      id: 'distributionType',
      header: 'Type',
      type: 'dropdown',
      editable: true,
      options: ['Bulk', 'Individual', 'Both'],
      width: 100
    },
    {
      id: 'primaryContact',
      header: 'Site Manager',
      type: 'text',
      editable: true,
      width: 150
    },
    {
      id: 'phone',
      header: 'Phone',
      type: 'text',
      editable: true,
      width: 120
    }
  ],
  defaultResource: {
    type: 'distribution',
    status: 'green',
    distributionType: 'bulk'
  },
  rollupCalculations: [
    {
      id: 'totalKitsDistributed',
      name: 'Total Kits Distributed',
      calculation: 'sum',
      displayInSummary: true
    },
    {
      id: 'totalWaterCases',
      name: 'Total Water Cases',
      calculation: 'sum',
      displayInSummary: true
    },
    {
      id: 'totalBlankets',
      name: 'Total Blankets',
      calculation: 'sum',
      displayInSummary: true
    }
  ],
  colorCoding: [
    {
      condition: (value) => {
        if (typeof value === 'object' && value !== null && 'kitsAvailable' in value) {
          return value.kitsAvailable === 0;
        }
        return false;
      },
      color: 'red',
      priority: 3
    },
    {
      condition: (value) => {
        if (typeof value === 'object' && value !== null && 'kitsAvailable' in value) {
          return value.kitsAvailable < 50;
        }
        return false;
      },
      color: 'yellow',
      priority: 2
    },
    {
      condition: (value) => {
        if (typeof value === 'object' && value !== null && 'kitsAvailable' in value) {
          return value.kitsAvailable >= 50;
        }
        return false;
      },
      color: 'green',
      priority: 1
    }
  ]
};

// Export all configurations
export const serviceLineConfigs: Record<ServiceLineType, GridConfig> = {
  'sheltering': shelteringConfig,
  'kitchen': kitchenConfig,
  'mobile-feeding': mobileFeedingConfig,
  'disaster-aid': disasterAidConfig,
  'individual-care': individualCareConfig,
  'distribution': distributionConfig
};

// Get configuration for a specific service line
export function getServiceLineConfig(serviceLineType: ServiceLineType): GridConfig {
  return serviceLineConfigs[serviceLineType];
}

// Get all service line types
export function getAllServiceLineTypes(): ServiceLineType[] {
  return Object.keys(serviceLineConfigs) as ServiceLineType[];
}

// Get display name for a service line
export function getServiceLineDisplayName(serviceLineType: ServiceLineType): string {
  return serviceLineConfigs[serviceLineType].displayName;
}