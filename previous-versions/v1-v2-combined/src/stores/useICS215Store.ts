/**
 * ICS 215 Store - State Management for Operational Planning Worksheets
 * 
 * Manages ICS Form 215 data, including worksheets, work assignments, 
 * resource requirements, and real-time collaboration state.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  ICS215Worksheet, 
  WorkAssignment, 
  ResourceRequirement215,
  CollaborationSession,
  WorksheetStatus,
  SectionType,
  RedCrossDivision
} from '../types/ics-215-types';

interface ICS215State {
  // Current worksheet data
  currentWorksheet: ICS215Worksheet | null;
  workAssignments: WorkAssignment[];
  
  // UI state
  activeSection: SectionType | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  
  // Collaboration
  activeSessions: CollaborationSession[];
  isConnected: boolean;
  
  // Filters and search
  divisionFilter: RedCrossDivision | null;
  searchQuery: string;
}

interface ICS215Actions {
  // Worksheet management
  createWorksheet: (data: Partial<ICS215Worksheet>) => void;
  updateWorksheet: (updates: Partial<ICS215Worksheet>) => void;
  loadWorksheet: (worksheetId: string) => Promise<void>;
  setWorksheet: (worksheet: ICS215Worksheet) => void;
  
  // Work assignment management
  addAssignment: (assignment: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAssignment: (id: string, updates: Partial<WorkAssignment>) => void;
  deleteAssignment: (id: string) => void;
  duplicateAssignment: (id: string) => void;
  
  // Resource management
  addResource: (assignmentId: string, resource: Omit<ResourceRequirement215, 'id'>) => void;
  updateResource: (assignmentId: string, resourceId: string, updates: Partial<ResourceRequirement215>) => void;
  deleteResource: (assignmentId: string, resourceId: string) => void;
  
  // UI actions
  setActiveSection: (section: SectionType | null) => void;
  setDivisionFilter: (division: RedCrossDivision | null) => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setDirty: (dirty: boolean) => void;
  
  // Collaboration
  addCollaborator: (session: CollaborationSession) => void;
  removeCollaborator: (sessionId: string) => void;
  setConnectionStatus: (connected: boolean) => void;
  
  // Utility actions
  reset: () => void;
  exportData: () => { worksheet: ICS215Worksheet | null; assignments: WorkAssignment[] };
  importData: (data: { worksheet: ICS215Worksheet; assignments: WorkAssignment[] }) => void;
}

type ICS215Store = ICS215State & ICS215Actions;

const initialState: ICS215State = {
  currentWorksheet: null,
  workAssignments: [],
  activeSection: null,
  isLoading: false,
  error: null,
  isDirty: false,
  activeSessions: [],
  isConnected: false,
  divisionFilter: null,
  searchQuery: ''
};

export const useICS215Store = create<ICS215Store>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Worksheet management
        createWorksheet: (data) => {
          const now = new Date();
          const newWorksheet: ICS215Worksheet = {
            id: data.id || `worksheet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            worksheetId: data.worksheetId || `ICS-215-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${Date.now().toString().slice(-6)}`,
            operationId: data.operationId || '',
            worksheetNumber: data.worksheetNumber || 1,
            operationalPeriodStart: data.operationalPeriodStart || now,
            operationalPeriodEnd: data.operationalPeriodEnd || new Date(now.getTime() + 24 * 60 * 60 * 1000),
            incidentName: data.incidentName || '',
            incidentNumber: data.incidentNumber,
            preparedBy: data.preparedBy || '',
            preparedDate: data.preparedDate || now,
            sectionType: data.sectionType || 'Operations',
            status: data.status || 'draft',
            priorityLevel: data.priorityLevel || 3,
            versionNumber: data.versionNumber || 1,
            isCurrentVersion: true,
            createdAt: now,
            updatedAt: now,
            ...data
          };
          
          set({ 
            currentWorksheet: newWorksheet, 
            isDirty: true,
            error: null 
          });
        },
        
        updateWorksheet: (updates) => {
          const current = get().currentWorksheet;
          if (!current) return;
          
          const updatedWorksheet = {
            ...current,
            ...updates,
            updatedAt: new Date()
          };
          
          set({ 
            currentWorksheet: updatedWorksheet, 
            isDirty: true 
          });
        },
        
        loadWorksheet: async (worksheetId) => {
          set({ isLoading: true, error: null });
          
          try {
            // In a real implementation, this would make an API call
            // For now, we'll simulate loading from localStorage or return a mock
            const mockWorksheet: ICS215Worksheet = {
              id: worksheetId,
              worksheetId: `ICS-215-${worksheetId}`,
              operationId: 'DR836-23',
              worksheetNumber: 1,
              operationalPeriodStart: new Date('2022-10-26T08:00:00'),
              operationalPeriodEnd: new Date('2022-10-26T20:00:00'),
              incidentName: 'Hurricane Ian Response - DR836-23',
              incidentNumber: 'DR836-23',
              preparedBy: 'Planning Section Chief',
              preparedDate: new Date('2022-10-26T07:30:00'),
              sectionType: 'Operations',
              status: 'approved',
              priorityLevel: 1,
              versionNumber: 1,
              isCurrentVersion: true,
              missionStatement: 'Provide emergency mass care services to hurricane-affected populations in Southwest Florida',
              situationSummary: 'Hurricane Ian made landfall as Category 4 storm. Widespread power outages, flooding, and structural damage. Estimated 2.5M people affected.',
              specialInstructions: 'Coordinate with state EOC and local emergency management. All field teams use unified command structure.',
              createdAt: new Date('2022-10-26T06:00:00'),
              updatedAt: new Date('2022-10-26T07:30:00')
            };
            
            set({ 
              currentWorksheet: mockWorksheet, 
              isLoading: false,
              error: null,
              isDirty: false
            });
          } catch (error) {
            set({ 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to load worksheet'
            });
          }
        },
        
        setWorksheet: (worksheet) => {
          set({ 
            currentWorksheet: worksheet,
            isDirty: false,
            error: null
          });
        },
        
        // Work assignment management
        addAssignment: (assignmentData) => {
          const now = new Date();
          const assignments = get().workAssignments;
          
          const newAssignment: WorkAssignment = {
            ...assignmentData,
            id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            assignmentNumber: `${assignments.length + 1}`,
            createdAt: now,
            updatedAt: now
          };
          
          set({ 
            workAssignments: [...assignments, newAssignment],
            isDirty: true
          });
        },
        
        updateAssignment: (id, updates) => {
          const assignments = get().workAssignments;
          const updatedAssignments = assignments.map(assignment =>
            assignment.id === id 
              ? { ...assignment, ...updates, updatedAt: new Date() }
              : assignment
          );
          
          set({ 
            workAssignments: updatedAssignments,
            isDirty: true
          });
        },
        
        deleteAssignment: (id) => {
          const assignments = get().workAssignments;
          const filteredAssignments = assignments.filter(assignment => assignment.id !== id);
          
          set({ 
            workAssignments: filteredAssignments,
            isDirty: true
          });
        },
        
        duplicateAssignment: (id) => {
          const assignments = get().workAssignments;
          const originalAssignment = assignments.find(a => a.id === id);
          
          if (originalAssignment) {
            const now = new Date();
            const duplicatedAssignment: WorkAssignment = {
              ...originalAssignment,
              id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              assignmentNumber: `${assignments.length + 1}`,
              workAssignmentName: `${originalAssignment.workAssignmentName} (Copy)`,
              resourceRequirements: originalAssignment.resourceRequirements.map(resource => ({
                ...resource,
                id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              })),
              createdAt: now,
              updatedAt: now
            };
            
            set({ 
              workAssignments: [...assignments, duplicatedAssignment],
              isDirty: true
            });
          }
        },
        
        // Resource management
        addResource: (assignmentId, resourceData) => {
          const assignments = get().workAssignments;
          const newResource: ResourceRequirement215 = {
            ...resourceData,
            id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            assignmentId
          };
          
          const updatedAssignments = assignments.map(assignment =>
            assignment.id === assignmentId
              ? {
                  ...assignment,
                  resourceRequirements: [...assignment.resourceRequirements, newResource],
                  updatedAt: new Date()
                }
              : assignment
          );
          
          set({ 
            workAssignments: updatedAssignments,
            isDirty: true
          });
        },
        
        updateResource: (assignmentId, resourceId, updates) => {
          const assignments = get().workAssignments;
          
          const updatedAssignments = assignments.map(assignment =>
            assignment.id === assignmentId
              ? {
                  ...assignment,
                  resourceRequirements: assignment.resourceRequirements.map(resource =>
                    resource.id === resourceId
                      ? { 
                          ...resource, 
                          ...updates,
                          // Auto-calculate need = requested - have
                          quantityNeed: (updates.quantityRequested !== undefined ? updates.quantityRequested : resource.quantityRequested) - 
                                       (updates.quantityHave !== undefined ? updates.quantityHave : resource.quantityHave)
                        }
                      : resource
                  ),
                  updatedAt: new Date()
                }
              : assignment
          );
          
          set({ 
            workAssignments: updatedAssignments,
            isDirty: true
          });
        },
        
        deleteResource: (assignmentId, resourceId) => {
          const assignments = get().workAssignments;
          
          const updatedAssignments = assignments.map(assignment =>
            assignment.id === assignmentId
              ? {
                  ...assignment,
                  resourceRequirements: assignment.resourceRequirements.filter(resource => resource.id !== resourceId),
                  updatedAt: new Date()
                }
              : assignment
          );
          
          set({ 
            workAssignments: updatedAssignments,
            isDirty: true
          });
        },
        
        // UI actions
        setActiveSection: (section) => {
          set({ activeSection: section });
        },
        
        setDivisionFilter: (division) => {
          set({ divisionFilter: division });
        },
        
        setSearchQuery: (query) => {
          set({ searchQuery: query });
        },
        
        clearError: () => {
          set({ error: null });
        },
        
        setLoading: (loading) => {
          set({ isLoading: loading });
        },
        
        setDirty: (dirty) => {
          set({ isDirty: dirty });
        },
        
        // Collaboration
        addCollaborator: (session) => {
          const sessions = get().activeSessions;
          const existingSessionIndex = sessions.findIndex(s => s.sessionId === session.sessionId);
          
          if (existingSessionIndex >= 0) {
            // Update existing session
            const updatedSessions = [...sessions];
            updatedSessions[existingSessionIndex] = session;
            set({ activeSessions: updatedSessions });
          } else {
            // Add new session
            set({ activeSessions: [...sessions, session] });
          }
        },
        
        removeCollaborator: (sessionId) => {
          const sessions = get().activeSessions;
          const filteredSessions = sessions.filter(session => session.sessionId !== sessionId);
          set({ activeSessions: filteredSessions });
        },
        
        setConnectionStatus: (connected) => {
          set({ isConnected: connected });
        },
        
        // Utility actions
        reset: () => {
          set(initialState);
        },
        
        exportData: () => {
          const { currentWorksheet, workAssignments } = get();
          return {
            worksheet: currentWorksheet,
            assignments: workAssignments
          };
        },
        
        importData: (data) => {
          set({
            currentWorksheet: data.worksheet,
            workAssignments: data.assignments,
            isDirty: false,
            error: null
          });
        }
      }),
      {
        name: 'ics215-store',
        partialize: (state) => ({
          currentWorksheet: state.currentWorksheet,
          workAssignments: state.workAssignments,
          // Don't persist UI state or collaboration data
        })
      }
    ),
    {
      name: 'ICS215Store'
    }
  )
);

// Selector hooks for computed values
export const useFilteredAssignments = () => {
  return useICS215Store((state) => {
    let filtered = state.workAssignments;
    
    // Filter by division
    if (state.divisionFilter) {
      filtered = filtered.filter(assignment => assignment.divisionGroup === state.divisionFilter);
    }
    
    // Filter by search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(assignment =>
        assignment.workAssignmentName.toLowerCase().includes(query) ||
        assignment.workLocation.toLowerCase().includes(query) ||
        (assignment.specialInstructions?.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  });
};

export const useAssignmentsByDivision = () => {
  return useICS215Store((state) => {
    return state.workAssignments.reduce((acc, assignment) => {
      const division = assignment.divisionGroup;
      if (!acc[division]) {
        acc[division] = [];
      }
      acc[division].push(assignment);
      return acc;
    }, {} as Record<RedCrossDivision, WorkAssignment[]>);
  });
};

export const useWorksheetStats = () => {
  return useICS215Store((state) => {
    const totalAssignments = state.workAssignments.length;
    const completedAssignments = state.workAssignments.filter(a => a.status === 'completed').length;
    const inProgressAssignments = state.workAssignments.filter(a => a.status === 'in_progress').length;
    
    const totalResources = state.workAssignments.reduce((sum, assignment) => 
      sum + assignment.resourceRequirements.length, 0
    );
    
    const totalResourceNeed = state.workAssignments.reduce((sum, assignment) => 
      sum + assignment.resourceRequirements.reduce((resourceSum, resource) => 
        resourceSum + resource.quantityNeed, 0
      ), 0
    );
    
    return {
      totalAssignments,
      completedAssignments,
      inProgressAssignments,
      totalResources,
      totalResourceNeed,
      completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0
    };
  });
};