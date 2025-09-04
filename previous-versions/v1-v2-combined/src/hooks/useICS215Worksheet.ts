/**
 * React Hook for ICS 215 Worksheet Management
 * Provides a comprehensive interface for worksheet operations with real-time collaboration,
 * offline support, and conflict resolution
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ICS215Worksheet,
  WorkAssignment,
  ResourceRequirement,
  ServiceLineAssignment,
  ChangeConflict,
  CollaborationSession,
  WorksheetEvent,
  UpdateWorksheetRequest,
  CreateAssignmentRequest,
} from '../types/ics-215-types';
import { ics215Service } from '../services/ics215DatabaseService';
import { conflictResolutionService } from '../services/conflictResolutionService';
import { offlineSyncService } from '../services/offlineSyncService';

export interface UseICS215WorksheetOptions {
  enableRealtime?: boolean;
  enableOffline?: boolean;
  autoSaveDelay?: number;
  conflictResolution?: 'auto' | 'manual';
}

export interface UseICS215WorksheetResult {
  // Data state
  worksheet: ICS215Worksheet | null;
  assignments: WorkAssignment[];
  resources: ResourceRequirement[];
  serviceLineAssignments: ServiceLineAssignment[];
  collaborators: CollaborationSession[];
  conflicts: ChangeConflict[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isOnline: boolean;
  
  // Error state
  error: string | null;
  
  // Worksheet operations
  updateWorksheet: (updates: UpdateWorksheetRequest) => Promise<void>;
  refreshWorksheet: () => Promise<void>;
  createVersion: (description?: string) => Promise<boolean>;
  
  // Assignment operations
  createAssignment: (assignment: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WorkAssignment | null>;
  updateAssignment: (id: string, updates: Partial<WorkAssignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  
  // Resource operations
  createResource: (resource: Omit<ResourceRequirement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ResourceRequirement | null>;
  updateResource: (id: string, updates: Partial<ResourceRequirement>) => Promise<void>;
  
  // Service line operations
  createServiceLineAssignment: (type: string, assignment: CreateAssignmentRequest) => Promise<ServiceLineAssignment | null>;
  
  // Collaboration
  startCollaboration: () => Promise<void>;
  endCollaboration: () => Promise<void>;
  
  // Conflict resolution
  resolveConflict: (conflictId: string, resolution?: 'auto' | 'manual') => Promise<void>;
  resolveAllConflicts: () => Promise<void>;
  
  // Sync operations
  forcSync: () => Promise<void>;
  clearOfflineData: () => void;
  
  // Status
  getSyncStatus: () => ReturnType<typeof offlineSyncService.getSyncStatus>;
}

export const useICS215Worksheet = (
  worksheetId: string,
  options: UseICS215WorksheetOptions = {}
): UseICS215WorksheetResult => {
  const {
    enableRealtime = true,
    enableOffline = true,
    autoSaveDelay = 2000,
    conflictResolution = 'auto',
  } = options;

  // State
  const [worksheet, setWorksheet] = useState<ICS215Worksheet | null>(null);
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [resources, setResources] = useState<ResourceRequirement[]>([]);
  const [serviceLineAssignments, setServiceLineAssignments] = useState<ServiceLineAssignment[]>([]);
  const [collaborators, setCollaborators] = useState<CollaborationSession[]>([]);
  const [conflicts, setConflicts] = useState<ChangeConflict[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for cleanup
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const collaborationSessionRef = useRef<CollaborationSession | null>(null);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get data from offline storage first
        let worksheetData: ICS215Worksheet | null = null;
        
        if (enableOffline) {
          worksheetData = offlineSyncService.getOfflineWorksheet(worksheetId);
        }

        // If not found offline, or if online, fetch from server
        if (!worksheetData || isOnline) {
          worksheetData = await ics215Service.getWorksheet(worksheetId);
          
          // Save to offline storage if available
          if (worksheetData && enableOffline) {
            await offlineSyncService.saveWorksheetOffline(worksheetData);
          }
        }

        if (!worksheetData) {
          setError('Worksheet not found');
          return;
        }

        setWorksheet(worksheetData);

        // Load related data
        const [assignmentData, conflictData] = await Promise.all([
          ics215Service.getWorksheetAssignments(worksheetId),
          conflictResolutionService.getWorksheetConflicts(worksheetId),
        ]);

        setAssignments(assignmentData);
        setConflicts(conflictData);

        // Start collaboration if enabled
        if (enableRealtime) {
          await startCollaborationSession();
          subscribeToChanges();
        }

        // Auto-resolve conflicts if enabled
        if (conflictResolution === 'auto' && conflictData.length > 0) {
          setTimeout(() => resolveAllConflictsInternal(), 1000);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load worksheet';
        setError(errorMessage);
        console.error('Error initializing worksheet data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    return () => {
      cleanup();
    };
  }, [worksheetId, enableRealtime, enableOffline]);

  // Monitor network status
  useEffect(() => {
    if (!enableOffline) return;

    const syncStatus = offlineSyncService.getSyncStatus();
    setIsOnline(syncStatus.isOnline);

    // Could add a more sophisticated network status listener here
    const interval = setInterval(() => {
      const status = offlineSyncService.getSyncStatus();
      setIsOnline(status.isOnline);
    }, 5000);

    return () => clearInterval(interval);
  }, [enableOffline]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }

    if (collaborationSessionRef.current && enableRealtime) {
      ics215Service.endCollaborationSession(worksheetId);
      collaborationSessionRef.current = null;
    }
  }, [worksheetId, enableRealtime]);

  // Start collaboration session
  const startCollaborationSession = async (): Promise<void> => {
    try {
      const session = await ics215Service.initializeCollaborationSession(worksheetId);
      collaborationSessionRef.current = session;
    } catch (err) {
      console.error('Error starting collaboration session:', err);
    }
  };

  // Subscribe to real-time changes
  const subscribeToChanges = (): void => {
    if (!enableRealtime) return;

    const handleWorksheetEvent = (event: WorksheetEvent) => {
      switch (event.type) {
        case 'worksheet_updated':
          if (event.data.id === worksheetId) {
            setWorksheet(current => current ? { ...current, ...event.data } : null);
          }
          break;

        case 'assignment_created':
          if ('worksheetId' in event.data && event.data.worksheetId === worksheetId) {
            setAssignments(current => [...current, event.data as WorkAssignment]);
          }
          break;

        case 'assignment_updated':
          if ('worksheetId' in event.data && event.data.worksheetId === worksheetId) {
            setAssignments(current =>
              current.map(a => a.id === event.data.id ? { ...a, ...event.data } : a)
            );
          }
          break;

        case 'assignment_deleted':
          setAssignments(current => current.filter(a => a.id !== event.data.id));
          break;

        case 'collaboration_started':
          setCollaborators(current => {
            const exists = current.some(c => c.sessionId === event.data.sessionId);
            return exists ? current : [...current, event.data];
          });
          break;

        case 'collaboration_ended':
          setCollaborators(current =>
            current.filter(c => c.sessionId !== event.data.sessionId)
          );
          break;

        case 'conflict_detected':
          setConflicts(current => [...current, event.data]);
          
          // Auto-resolve if enabled
          if (conflictResolution === 'auto') {
            setTimeout(() => resolveConflictInternal(event.data.id), 500);
          }
          break;

        case 'conflict_resolved':
          setConflicts(current => current.filter(c => c.id !== event.data.conflictId));
          break;
      }
    };

    ics215Service.subscribeToWorksheetChanges(worksheetId, handleWorksheetEvent);
    
    unsubscribeRef.current = () => {
      ics215Service.unsubscribeFromWorksheetChanges(worksheetId);
    };
  };

  // Worksheet operations
  const updateWorksheet = useCallback(async (updates: UpdateWorksheetRequest): Promise<void> => {
    if (!worksheet) return;

    try {
      // Optimistic update
      const updatedWorksheet = { ...worksheet, ...updates, updatedAt: new Date() };
      setWorksheet(updatedWorksheet);

      // Save offline first
      if (enableOffline) {
        await offlineSyncService.saveWorksheetOffline(updatedWorksheet, true);
      }

      // Clear existing auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Schedule auto-save
      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          await ics215Service.updateWorksheet(worksheetId, updates, false);
          setError(null);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
          setError(errorMessage);
          console.error('Error auto-saving worksheet:', err);
        } finally {
          setIsSaving(false);
        }
      }, autoSaveDelay);

    } catch (err) {
      // Revert optimistic update on error
      setWorksheet(worksheet);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update worksheet';
      setError(errorMessage);
      console.error('Error updating worksheet:', err);
    }
  }, [worksheet, worksheetId, autoSaveDelay, enableOffline]);

  const refreshWorksheet = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const refreshedWorksheet = await ics215Service.getWorksheet(worksheetId);
      
      if (refreshedWorksheet) {
        setWorksheet(refreshedWorksheet);
        
        if (enableOffline) {
          await offlineSyncService.saveWorksheetOffline(refreshedWorksheet, true);
        }
      }
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh worksheet';
      setError(errorMessage);
      console.error('Error refreshing worksheet:', err);
    } finally {
      setIsLoading(false);
    }
  }, [worksheetId, enableOffline]);

  const createVersion = useCallback(async (description?: string): Promise<boolean> => {
    try {
      const snapshot = await ics215Service.createWorksheetVersion(worksheetId, description);
      return !!snapshot;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create version';
      setError(errorMessage);
      console.error('Error creating version:', err);
      return false;
    }
  }, [worksheetId]);

  // Assignment operations
  const createAssignment = useCallback(async (
    assignment: Omit<WorkAssignment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkAssignment | null> => {
    try {
      const newAssignment = await ics215Service.createWorkAssignment(assignment);
      
      if (newAssignment) {
        setAssignments(current => [...current, newAssignment]);
        
        if (enableOffline) {
          await offlineSyncService.saveAssignmentOffline(newAssignment);
        }
      }
      
      return newAssignment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create assignment';
      setError(errorMessage);
      console.error('Error creating assignment:', err);
      return null;
    }
  }, [enableOffline]);

  const updateAssignment = useCallback(async (
    id: string,
    updates: Partial<WorkAssignment>
  ): Promise<void> => {
    try {
      // Optimistic update
      setAssignments(current =>
        current.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a)
      );

      await ics215Service.updateWorkAssignment(id, updates);
      setError(null);
    } catch (err) {
      // Revert on error - would need the original assignment
      const errorMessage = err instanceof Error ? err.message : 'Failed to update assignment';
      setError(errorMessage);
      console.error('Error updating assignment:', err);
    }
  }, []);

  const deleteAssignment = useCallback(async (id: string): Promise<void> => {
    try {
      // Optimistic update
      const assignmentToDelete = assignments.find(a => a.id === id);
      setAssignments(current => current.filter(a => a.id !== id));

      // Actual deletion would be implemented in the service
      // await ics215Service.deleteWorkAssignment(id);

      if (enableOffline) {
        await offlineSyncService.deleteOffline('assignment', id);
      }

      setError(null);
    } catch (err) {
      // Revert on error
      // Would need to restore the deleted assignment
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete assignment';
      setError(errorMessage);
      console.error('Error deleting assignment:', err);
    }
  }, [assignments, enableOffline]);

  // Resource operations
  const createResource = useCallback(async (
    resource: Omit<ResourceRequirement, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ResourceRequirement | null> => {
    try {
      // This would be implemented in the service
      const newResource: ResourceRequirement = {
        ...resource,
        id: `resource-${Date.now()}`, // Temporary ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setResources(current => [...current, newResource]);
      
      if (enableOffline) {
        await offlineSyncService.saveResourceOffline(newResource);
      }

      return newResource;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create resource';
      setError(errorMessage);
      console.error('Error creating resource:', err);
      return null;
    }
  }, [enableOffline]);

  const updateResource = useCallback(async (
    id: string,
    updates: Partial<ResourceRequirement>
  ): Promise<void> => {
    try {
      // Optimistic update
      setResources(current =>
        current.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r)
      );

      // Actual update would be implemented in the service
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update resource';
      setError(errorMessage);
      console.error('Error updating resource:', err);
    }
  }, []);

  // Service line operations
  const createServiceLineAssignment = useCallback(async (
    type: string,
    assignment: CreateAssignmentRequest
  ): Promise<ServiceLineAssignment | null> => {
    try {
      const newAssignment = await ics215Service.createServiceLineAssignment(
        type as any,
        assignment
      );
      
      if (newAssignment) {
        setServiceLineAssignments(current => [...current, newAssignment]);
      }
      
      return newAssignment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create service line assignment';
      setError(errorMessage);
      console.error('Error creating service line assignment:', err);
      return null;
    }
  }, []);

  // Collaboration operations
  const startCollaboration = useCallback(async (): Promise<void> => {
    if (!enableRealtime) return;
    
    try {
      await startCollaborationSession();
      subscribeToChanges();
    } catch (err) {
      console.error('Error starting collaboration:', err);
    }
  }, [enableRealtime, worksheetId]);

  const endCollaboration = useCallback(async (): Promise<void> => {
    try {
      await ics215Service.endCollaborationSession(worksheetId);
      cleanup();
    } catch (err) {
      console.error('Error ending collaboration:', err);
    }
  }, [worksheetId, cleanup]);

  // Conflict resolution
  const resolveConflictInternal = useCallback(async (conflictId: string): Promise<void> => {
    try {
      await conflictResolutionService.resolveConflict(conflictId);
      setConflicts(current => current.filter(c => c.id !== conflictId));
    } catch (err) {
      console.error('Error resolving conflict:', err);
    }
  }, []);

  const resolveConflict = useCallback(async (
    conflictId: string,
    resolution: 'auto' | 'manual' = 'auto'
  ): Promise<void> => {
    if (resolution === 'auto') {
      await resolveConflictInternal(conflictId);
    } else {
      // Manual resolution would show a UI dialog
      // For now, just mark as needs manual attention
      console.log('Manual conflict resolution needed for:', conflictId);
    }
  }, [resolveConflictInternal]);

  const resolveAllConflictsInternal = useCallback(async (): Promise<void> => {
    try {
      const resolvedCount = await conflictResolutionService.resolveWorksheetConflicts(worksheetId);
      console.log(`Resolved ${resolvedCount} conflicts automatically`);
      
      // Refresh conflicts list
      const remainingConflicts = await conflictResolutionService.getWorksheetConflicts(worksheetId);
      setConflicts(remainingConflicts);
    } catch (err) {
      console.error('Error resolving all conflicts:', err);
    }
  }, [worksheetId]);

  const resolveAllConflicts = useCallback(async (): Promise<void> => {
    await resolveAllConflictsInternal();
  }, [resolveAllConflictsInternal]);

  // Sync operations
  const forcSync = useCallback(async (): Promise<void> => {
    if (!enableOffline) return;
    
    try {
      await offlineSyncService.forcSync();
      await refreshWorksheet();
    } catch (err) {
      console.error('Error forcing sync:', err);
    }
  }, [enableOffline, refreshWorksheet]);

  const clearOfflineData = useCallback((): void => {
    if (!enableOffline) return;
    
    offlineSyncService.clearOfflineData();
    // Refresh from server
    refreshWorksheet();
  }, [enableOffline, refreshWorksheet]);

  const getSyncStatus = useCallback(() => {
    return enableOffline ? offlineSyncService.getSyncStatus() : {
      isOnline: true,
      quality: 'excellent' as const,
      queueStats: { total: 0, pending: 0, synced: 0, failed: 0, conflicts: 0 },
      lastSync: new Date(),
    };
  }, [enableOffline]);

  return {
    // Data state
    worksheet,
    assignments,
    resources,
    serviceLineAssignments,
    collaborators,
    conflicts,
    
    // Loading states
    isLoading,
    isSaving,
    isOnline,
    
    // Error state
    error,
    
    // Worksheet operations
    updateWorksheet,
    refreshWorksheet,
    createVersion,
    
    // Assignment operations
    createAssignment,
    updateAssignment,
    deleteAssignment,
    
    // Resource operations
    createResource,
    updateResource,
    
    // Service line operations
    createServiceLineAssignment,
    
    // Collaboration
    startCollaboration,
    endCollaboration,
    
    // Conflict resolution
    resolveConflict,
    resolveAllConflicts,
    
    // Sync operations
    forcSync,
    clearOfflineData,
    
    // Status
    getSyncStatus,
  };
};