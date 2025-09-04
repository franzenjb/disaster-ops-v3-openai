/**
 * Global State Store using Zustand
 * 
 * Single source of truth for all operation data.
 * Automatically syncs with EventBus for real-time updates.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { DisasterOperation, County, FeedingData, IAPDocument } from '../core/DisasterOperation';
import { eventBus, EventType } from '../core/EventBus';

interface OperationStore {
  // State
  currentOperation: DisasterOperation | null;
  selectedCounties: County[];
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime: Date | null;
  
  // Actions
  initOperation: (drNumber: string, operationName: string) => void;
  updateOperation: (updates: Partial<DisasterOperation>) => void;
  
  // Geography
  selectRegion: (regionId: string) => void;
  toggleCounty: (county: County) => void;
  clearCounties: () => void;
  
  // Service Lines
  addFeedingData: (data: Partial<FeedingData>) => void;
  updateShelterCount: (count: number) => void;
  updateServiceLine: (lineType: string, data: any) => void;
  
  // IAP
  updateIAPSection: (sectionId: string, content: any) => void;
  publishIAP: () => void;
  
  // Sync
  syncWithServer: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
  
  // Persistence
  saveToLocal: () => void;
  loadFromLocal: () => void;
}

export const useOperationStore = create<OperationStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      currentOperation: null,
      selectedCounties: [],
      isOnline: navigator.onLine,
      syncStatus: 'idle',
      lastSyncTime: null,
      
      // Initialize new operation
      initOperation: (drNumber, operationName) => {
        const operation: DisasterOperation = {
          id: drNumber,
          operationName,
          metadata: {
            created: new Date(),
            modified: new Date(),
            version: 1,
            status: 'active',
            visibility: 'draft'
          },
          geography: {
            regions: [],
            counties: [],
            chapters: [],
            affectedArea: {
              type: 'FeatureCollection',
              features: []
            }
          },
          command: {
            droDirector: {
              id: '',
              name: '',
              title: 'DRO Director',
              phone: '',
              email: '',
              available24x7: true
            },
            deputyDirector: {
              id: '',
              name: '',
              title: 'Deputy Director',
              phone: '',
              email: '',
              available24x7: true
            },
            sectionChiefs: {
              operations: {} as any,
              planning: {} as any,
              logistics: {} as any,
              finance: {} as any
            }
          },
          serviceLines: {
            feeding: {
              breakfastServed: 0,
              lunchServed: 0,
              dinnerServed: 0,
              snacksServed: 0,
              totalMealsToDate: 0,
              fixedFeedingSites: 0,
              mobileFeedingUnits: 0,
              feedingStaff: 0,
              feedingVolunteers: 0,
              bulkDistributionItems: 0,
              partnerMealsProvided: 0,
              meals: [],
              snacks: [],
              feedingSites: []
            } as any,
            sheltering: {
              sheltersOpen: 0,
              shelterCapacity: 0,
              currentPopulation: 0,
              newRegistrations: 0,
              overnightStays: [],
              petsSheltered: 0,
              totalClientsServed: 0,
              shelterStaff: 0,
              shelterVolunteers: 0,
              hotelsUtilized: 0,
              hotelRooms: 0,
              sheltersList: [],
              shelterSites: []
            } as any
          },
          iap: {
            id: `iap-${drNumber}-1`,
            operationId: drNumber,
            meta: {
              iapNumber: 1,
              operationalPeriod: {
                start: new Date(),
                end: new Date(Date.now() + 24 * 60 * 60 * 1000)
              },
              preparedBy: {} as any,
              approvedBy: {} as any,
              distributionList: []
            },
            sections: {
              coverPage: {} as any,
              directorsIntent: {
                content: '',
                lastModified: new Date(),
                modifiedBy: ''
              },
              priorities: { priorities: [] },
              objectives: { objectives: [] },
              previousObjectivesStatus: {} as any,
              openActionTracker: [],
              contactRoster: {} as any,
              organizationChart: {} as any,
              workAssignments: [],
              workSites: [],
              safetyMessage: {
                content: '',
                lastModified: new Date(),
                modifiedBy: ''
              },
              externalCoordination: {
                content: '',
                lastModified: new Date(),
                modifiedBy: ''
              },
              generalMessage: {
                content: '',
                lastModified: new Date(),
                modifiedBy: ''
              },
              dailySchedule: [],
              weatherForecast: {} as any,
              maps: {} as any
            },
            history: [],
            currentVersion: 1,
            isDraft: true,
            currentEditors: []
          },
          audit: [],
          collaboration: {
            activeUsers: [],
            locks: [],
            pendingChanges: []
          }
        };
        
        set(state => {
          state.currentOperation = operation;
        });
        
        // Emit event
        eventBus.emit(EventType.OPERATION_CREATED, { drNumber, operationName });
        
        // Save to local
        get().saveToLocal();
      },
      
      // Update operation
      updateOperation: (updates) => {
        set(state => {
          if (state.currentOperation) {
            Object.assign(state.currentOperation, updates);
            state.currentOperation.metadata.modified = new Date();
          }
        });
        
        eventBus.emit(EventType.OPERATION_UPDATED, updates);
        get().saveToLocal();
      },
      
      // Select region
      selectRegion: (regionId) => {
        set(state => {
          if (state.currentOperation) {
            // Clear counties when region changes
            state.selectedCounties = [];
            state.currentOperation.geography.counties = [];
          }
        });
        
        eventBus.emit(EventType.REGION_CHANGED, { regionId });
      },
      
      // Toggle county selection
      toggleCounty: (county) => {
        set(state => {
          const index = state.selectedCounties.findIndex(c => c.id === county.id);
          if (index >= 0) {
            state.selectedCounties.splice(index, 1);
            eventBus.emit(EventType.COUNTY_REMOVED, county);
          } else {
            state.selectedCounties.push(county);
            eventBus.emit(EventType.COUNTY_ADDED, county);
          }
          
          // Update operation
          if (state.currentOperation) {
            state.currentOperation.geography.counties = state.selectedCounties;
          }
        });
        
        get().saveToLocal();
      },
      
      // Clear all counties
      clearCounties: () => {
        set(state => {
          state.selectedCounties = [];
          if (state.currentOperation) {
            state.currentOperation.geography.counties = [];
          }
        });
        get().saveToLocal();
      },
      
      // Add feeding data
      addFeedingData: (data) => {
        set(state => {
          if (state.currentOperation) {
            Object.assign(state.currentOperation.serviceLines.feeding, data);
          }
        });
        
        eventBus.emit(EventType.FEEDING_DATA_ENTERED, data);
        get().saveToLocal();
      },
      
      // Update shelter count
      updateShelterCount: (count) => {
        set(state => {
          if (state.currentOperation) {
            state.currentOperation.serviceLines.sheltering.sheltersOpen = count;
          }
        });
        
        if (count > 0) {
          eventBus.emit(EventType.SHELTER_OPENED, { count });
        }
        get().saveToLocal();
      },
      
      // Update any service line
      updateServiceLine: (lineType, data) => {
        set(state => {
          if (state.currentOperation && state.currentOperation.serviceLines[lineType as keyof typeof state.currentOperation.serviceLines]) {
            (state.currentOperation.serviceLines as any)[lineType] = data;
          }
        });
        eventBus.emit(EventType.SERVICE_LINE_UPDATED, { lineType, data });
        get().saveToLocal();
      },
      
      // Update IAP section
      updateIAPSection: (sectionId, content) => {
        set(state => {
          if (state.currentOperation?.iap) {
            (state.currentOperation.iap.sections as any)[sectionId] = content;
            state.currentOperation.iap.sections.directorsIntent.lastModified = new Date();
          }
        });
        
        eventBus.emit(EventType.IAP_SECTION_EDITED, { sectionId, content });
        get().saveToLocal();
      },
      
      // Publish IAP
      publishIAP: () => {
        set(state => {
          if (state.currentOperation?.iap) {
            state.currentOperation.iap.isDraft = false;
            state.currentOperation.iap.meta.iapNumber += 1;
          }
        });
        
        eventBus.emit(EventType.IAP_PUBLISHED, { 
          iapNumber: get().currentOperation?.iap.meta.iapNumber 
        });
        get().saveToLocal();
      },
      
      // Sync with server
      syncWithServer: async () => {
        set(state => {
          state.syncStatus = 'syncing';
        });
        
        try {
          // Will implement when backend is ready
          // For now, just simulate
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => {
            state.syncStatus = 'idle';
            state.lastSyncTime = new Date();
          });
          
          eventBus.emit(EventType.SYNC_COMPLETED, { timestamp: Date.now() });
        } catch (error) {
          set(state => {
            state.syncStatus = 'error';
          });
          
          eventBus.emit(EventType.SYNC_FAILED, { error });
        }
      },
      
      // Set online status
      setOnlineStatus: (isOnline) => {
        set(state => {
          state.isOnline = isOnline;
        });
        
        if (isOnline) {
          get().syncWithServer();
        }
      },
      
      // Save to localStorage
      saveToLocal: () => {
        const state = get();
        if (state.currentOperation) {
          localStorage.setItem('current_operation', JSON.stringify(state.currentOperation));
          localStorage.setItem('selected_counties', JSON.stringify(state.selectedCounties));
        }
      },
      
      // Load from localStorage
      loadFromLocal: () => {
        try {
          const operationData = localStorage.getItem('current_operation');
          const countiesData = localStorage.getItem('selected_counties');
          
          if (operationData) {
            const operation = JSON.parse(operationData);
            set(state => {
              state.currentOperation = operation;
            });
          }
          
          if (countiesData) {
            const counties = JSON.parse(countiesData);
            set(state => {
              state.selectedCounties = counties;
            });
          }
        } catch (error) {
          console.error('Failed to load from localStorage:', error);
        }
      }
    }))
  )
);

// Subscribe to network changes
window.addEventListener('online', () => {
  useOperationStore.getState().setOnlineStatus(true);
});

window.addEventListener('offline', () => {
  useOperationStore.getState().setOnlineStatus(false);
});

// Load data on startup
useOperationStore.getState().loadFromLocal();