/**
 * ICS Form 215 Grid Store
 * 
 * Manages the resource grid data shared between Guided Entry, Grid View, and Standard Form
 * This complements the existing useICS215Store by handling the new grid-based resources
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ServiceLineType,
  ICSResource,
  ServiceLineSummary
} from '../types/ics-215-grid-types';

interface ICS215GridStore {
  // Core data
  resources: Record<ServiceLineType, ICSResource[]>;
  
  // UI state
  lastSaved: Date;
  hasUnsavedChanges: boolean;
  
  // Actions
  addResource: (serviceLineType: ServiceLineType, resource: ICSResource) => void;
  updateResource: (serviceLineType: ServiceLineType, resourceId: string, updates: Partial<ICSResource>) => void;
  deleteResource: (serviceLineType: ServiceLineType, resourceId: string) => void;
  
  // Bulk operations
  importResources: (serviceLineType: ServiceLineType, resources: ICSResource[]) => void;
  clearServiceLine: (serviceLineType: ServiceLineType) => void;
  
  // Save management
  saveToDatabase: () => Promise<void>;
  markAsSaved: () => void;
  
  // Computed summaries
  getServiceLineSummary: (serviceLineType: ServiceLineType) => ServiceLineSummary;
  getIAPSummary: () => {
    totalShelters: number;
    totalShelterCapacity: number;
    totalShelterOccupancy: number;
    occupancyRate: number;
    totalKitchens: number;
    totalMealsCapacity: number;
    totalERVs: number;
    totalDistributionSites: number;
    criticalResources: number;
    warningResources: number;
    operationalResources: number;
  };
}

const defaultResources: Record<ServiceLineType, ICSResource[]> = {
  'sheltering': [],
  'kitchen': [],
  'mobile-feeding': [],
  'disaster-aid': [],
  'individual-care': [],
  'distribution': []
};

export const useICS215GridStore = create<ICS215GridStore>()(
  persist(
    (set, get) => ({
      // Initial state
      resources: defaultResources,
      lastSaved: new Date(),
      hasUnsavedChanges: false,
      
      // Add a new resource
      addResource: (serviceLineType, resource) => {
        set((state) => ({
          resources: {
            ...state.resources,
            [serviceLineType]: [...state.resources[serviceLineType], resource]
          },
          hasUnsavedChanges: true
        }));
        
        // Auto-save after 2 seconds
        setTimeout(() => {
          get().saveToDatabase();
        }, 2000);
      },
      
      // Update existing resource
      updateResource: (serviceLineType, resourceId, updates) => {
        set((state) => {
          const resources = state.resources[serviceLineType];
          const index = resources.findIndex(r => r.id === resourceId);
          
          if (index === -1) return state;
          
          const updatedResource = {
            ...resources[index],
            ...updates,
            lastUpdated: new Date()
          };
          
          return {
            resources: {
              ...state.resources,
              [serviceLineType]: [
                ...resources.slice(0, index),
                updatedResource,
                ...resources.slice(index + 1)
              ]
            },
            hasUnsavedChanges: true
          };
        });
        
        // Auto-save
        setTimeout(() => {
          get().saveToDatabase();
        }, 2000);
      },
      
      // Delete resource
      deleteResource: (serviceLineType, resourceId) => {
        set((state) => ({
          resources: {
            ...state.resources,
            [serviceLineType]: state.resources[serviceLineType].filter(r => r.id !== resourceId)
          },
          hasUnsavedChanges: true
        }));
        
        setTimeout(() => {
          get().saveToDatabase();
        }, 2000);
      },
      
      // Bulk import resources
      importResources: (serviceLineType, resources) => {
        set((state) => ({
          resources: {
            ...state.resources,
            [serviceLineType]: resources
          },
          hasUnsavedChanges: true
        }));
      },
      
      // Clear all resources in a service line
      clearServiceLine: (serviceLineType) => {
        set((state) => ({
          resources: {
            ...state.resources,
            [serviceLineType]: []
          },
          hasUnsavedChanges: true
        }));
      },
      
      // Save to database (simulated)
      saveToDatabase: async () => {
        // In production, this would make an API call
        // For now, we just update the saved timestamp
        console.log('Saving ICS 215 Grid data:', get().resources);
        
        set({
          lastSaved: new Date(),
          hasUnsavedChanges: false
        });
        
        // Also trigger update in the main ICS215 store if needed
        // This ensures the IAP gets updated
        if (window) {
          window.dispatchEvent(new CustomEvent('ics215-grid-updated', {
            detail: get().getIAPSummary()
          }));
        }
      },
      
      // Mark as saved
      markAsSaved: () => {
        set({
          lastSaved: new Date(),
          hasUnsavedChanges: false
        });
      },
      
      // Get summary for a service line
      getServiceLineSummary: (serviceLineType) => {
        const resources = get().resources[serviceLineType];
        
        const summary: ServiceLineSummary = {
          serviceLineType,
          operationalPeriod: {
            start: new Date(),
            end: new Date(Date.now() + 24 * 60 * 60 * 1000)
          },
          totalResources: resources.length,
          activeResources: resources.filter(r => r.status !== 'gray').length,
          criticalResources: resources.filter(r => r.status === 'red').length,
          metrics: {},
          trends: {},
          issues: [],
          recommendations: [],
          lastUpdated: new Date()
        };
        
        // Calculate specific metrics based on service line type
        if (serviceLineType === 'sheltering') {
          const shelters = resources as any[];
          summary.metrics.totalCapacity = shelters.reduce((sum, s) => sum + (s.capacity || 0), 0);
          summary.metrics.totalOccupancy = shelters.reduce((sum, s) => sum + (s.currentOccupancy || 0), 0);
          summary.metrics.occupancyRate = summary.metrics.totalCapacity > 0 
            ? Math.round((summary.metrics.totalOccupancy / summary.metrics.totalCapacity) * 100)
            : 0;
          
          if (summary.metrics.occupancyRate > 90) {
            summary.issues.push('Shelter capacity nearing maximum');
            summary.recommendations.push('Consider opening additional shelter facilities');
          }
        } else if (serviceLineType === 'kitchen') {
          const kitchens = resources as any[];
          summary.metrics.totalMealsCapacity = kitchens.reduce((sum, k) => sum + (k.mealsCapacity || 0), 0);
          summary.metrics.totalMealsServed = kitchens.reduce((sum, k) => sum + (k.mealsServed || 0), 0);
        } else if (serviceLineType === 'mobile-feeding') {
          summary.metrics.activeERVs = resources.filter(r => r.status === 'green').length;
        }
        
        // Add issues based on critical resources
        if (summary.criticalResources > 0) {
          summary.issues.push(`${summary.criticalResources} resources in critical status`);
        }
        
        return summary;
      },
      
      // Get IAP summary for integration
      getIAPSummary: () => {
        const { resources } = get();
        
        const shelters = resources.sheltering as any[];
        const kitchens = resources.kitchen as any[];
        const ervs = resources['mobile-feeding'];
        const distribution = resources.distribution;
        
        const totalShelterCapacity = shelters.reduce((sum, s) => sum + (s.capacity || 0), 0);
        const totalShelterOccupancy = shelters.reduce((sum, s) => sum + (s.currentOccupancy || 0), 0);
        
        return {
          // Sheltering metrics
          totalShelters: shelters.length,
          totalShelterCapacity,
          totalShelterOccupancy,
          occupancyRate: totalShelterCapacity > 0 
            ? Math.round((totalShelterOccupancy / totalShelterCapacity) * 100)
            : 0,
          
          // Feeding metrics
          totalKitchens: kitchens.length,
          totalMealsCapacity: kitchens.reduce((sum, k) => sum + (k.mealsCapacity || 0), 0),
          totalERVs: ervs.length,
          
          // Distribution metrics
          totalDistributionSites: distribution.length,
          
          // Overall status
          criticalResources: Object.values(resources).flat().filter(r => r.status === 'red').length,
          warningResources: Object.values(resources).flat().filter(r => r.status === 'yellow').length,
          operationalResources: Object.values(resources).flat().filter(r => r.status === 'green').length
        };
      }
    }),
    {
      name: 'ics-215-grid-storage',
      partialize: (state) => ({
        resources: state.resources
      })
    }
  )
);