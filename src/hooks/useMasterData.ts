/**
 * CRITICAL: useMasterData Hook - Real-Time Data Synchronization
 * 
 * This is the ONLY way React components should access master data.
 * Provides automatic real-time updates when data changes anywhere.
 * 
 * Features:
 * - Automatic subscription to data changes
 * - Loading states
 * - Error handling
 * - Optimistic updates
 * - Automatic cleanup
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getMasterDataService, 
  DailyScheduleEntry, 
  Facility, 
  Personnel, 
  PersonnelAssignment,
  WorkAssignment,
  Gap,
  Operation
} from '../lib/services/MasterDataService';

// Generic hook for any table data
export function useMasterData<T>(tableName: string, operationId?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result: T[];
      
      const masterDataService = getMasterDataService();
      
      // Route to appropriate service method based on table name
      switch (tableName) {
        case 'daily_schedule':
          result = await masterDataService.getDailySchedule(operationId) as T[];
          break;
        case 'facilities':
          result = await masterDataService.getFacilities(operationId) as T[];
          break;
        case 'personnel':
          result = await masterDataService.getPersonnel(operationId) as T[];
          break;
        case 'personnel_assignments':
          result = await masterDataService.getPersonnelAssignments(operationId) as T[];
          break;
        case 'work_assignments':
          result = await masterDataService.getWorkAssignments(operationId) as T[];
          break;
        case 'gaps':
          result = await masterDataService.getGaps(operationId) as T[];
          break;
        case 'operations':
          result = await masterDataService.getOperations() as T[];
          break;
        default:
          throw new Error(`Unsupported table: ${tableName}`);
      }

      setData(result);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(`Error loading ${tableName}:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [tableName, operationId]);

  // Set up real-time subscription
  useEffect(() => {
    // Load initial data
    loadData();

    // Subscribe to changes
    const masterDataService = getMasterDataService();
    const unsubscribe = masterDataService.subscribeToTable(tableName, (newData: T[]) => {
      console.log(`[useMasterData] Received update for ${tableName}:`, newData);
      setData(newData);
      setLastUpdate(new Date());
      setError(null); // Clear any previous errors on successful update
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [tableName, operationId, loadData]);

  // Generic update function
  const updateRecord = useCallback(async (record: Partial<T> & { id: string }) => {
    try {
      setError(null);
      const masterDataService = getMasterDataService();

      // Route to appropriate update method
      switch (tableName) {
        case 'daily_schedule':
          await masterDataService.updateDailySchedule(record as DailyScheduleEntry);
          break;
        case 'facilities':
          await masterDataService.updateFacility(record as Facility);
          break;
        case 'personnel_assignments':
          await masterDataService.updatePersonnelAssignment(record as PersonnelAssignment);
          break;
        case 'work_assignments':
          await masterDataService.updateWorkAssignment(record as WorkAssignment);
          break;
        case 'gaps':
          await masterDataService.updateGap(record as Gap);
          break;
        default:
          throw new Error(`Update not supported for table: ${tableName}`);
      }

      // Note: Data will be updated automatically via subscription
      console.log(`[useMasterData] Updated record in ${tableName}:`, record.id);
    } catch (err) {
      console.error(`Error updating record in ${tableName}:`, err);
      setError(err as Error);
      throw err; // Re-throw so component can handle it
    }
  }, [tableName]);

  // Generic add function
  const addRecord = useCallback(async (record: Omit<T, 'id'>) => {
    try {
      setError(null);
      const masterDataService = getMasterDataService();

      let newId: string;

      // Route to appropriate add method
      switch (tableName) {
        case 'daily_schedule':
          newId = await masterDataService.addDailyScheduleEntry(record as Omit<DailyScheduleEntry, 'id'>);
          break;
        case 'facilities':
          newId = await masterDataService.addFacility(record as Omit<Facility, 'id'>);
          break;
        case 'work_assignments':
          newId = await masterDataService.addWorkAssignment(record as Omit<WorkAssignment, 'id'>);
          break;
        case 'gaps':
          newId = await masterDataService.addGap(record as Omit<Gap, 'id'>);
          break;
        default:
          throw new Error(`Add not supported for table: ${tableName}`);
      }

      console.log(`[useMasterData] Added record to ${tableName}:`, newId);
      return newId;
    } catch (err) {
      console.error(`Error adding record to ${tableName}:`, err);
      setError(err as Error);
      throw err;
    }
  }, [tableName]);

  // Manual refresh function
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    updateRecord,
    addRecord,
    refresh
  };
}

// ============================================
// SPECIALIZED HOOKS FOR SPECIFIC DATA TYPES
// ============================================

/**
 * Hook specifically for Daily Schedule data
 */
export function useDailySchedule(operationId?: string) {
  const {
    data: schedule,
    loading,
    error,
    lastUpdate,
    updateRecord: updateEntry,
    addRecord: addEntry,
    refresh
  } = useMasterData<DailyScheduleEntry>('daily_schedule', operationId);

  // Specialized functions for daily schedule
  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      const masterDataService = getMasterDataService();
      await masterDataService.deleteDailyScheduleEntry(entryId);
      console.log('[useDailySchedule] Deleted entry:', entryId);
    } catch (err) {
      console.error('Error deleting schedule entry:', err);
      throw err;
    }
  }, []);

  // Sort schedule by time for display
  const sortedSchedule = schedule.sort((a, b) => a.time.localeCompare(b.time));

  return {
    schedule: sortedSchedule,
    loading,
    error,
    lastUpdate,
    updateEntry,
    addEntry,
    deleteEntry,
    refresh
  };
}

/**
 * Hook specifically for Facilities data
 */
export function useFacilities(operationId?: string, facilityType?: string) {
  const {
    data: facilities,
    loading,
    error,
    lastUpdate,
    updateRecord: updateFacility,
    addRecord: addFacility,
    refresh
  } = useMasterData<Facility>('facilities', operationId);

  // Filter by facility type if specified
  const filteredFacilities = facilityType 
    ? facilities.filter(f => f.facility_type === facilityType)
    : facilities;

  // Get facilities by type
  const getFacilitiesByType = useCallback((type: string) => {
    return facilities.filter(f => f.facility_type === type);
  }, [facilities]);

  // Get facility by ID
  const getFacilityById = useCallback((id: string) => {
    return facilities.find(f => f.id === id);
  }, [facilities]);

  return {
    facilities: filteredFacilities,
    allFacilities: facilities,
    loading,
    error,
    lastUpdate,
    updateFacility,
    addFacility,
    getFacilitiesByType,
    getFacilityById,
    refresh
  };
}

/**
 * Hook specifically for Personnel data
 */
export function usePersonnel(operationId?: string) {
  const {
    data: personnel,
    loading,
    error,
    lastUpdate,
    refresh
  } = useMasterData<Personnel>('personnel', operationId);

  // Get personnel by section
  const getPersonnelBySection = useCallback((section: string) => {
    return personnel.filter(p => p.section === section);
  }, [personnel]);

  // Get personnel by position
  const getPersonnelByPosition = useCallback((position: string) => {
    return personnel.filter(p => p.primary_position === position);
  }, [personnel]);

  return {
    personnel,
    loading,
    error,
    lastUpdate,
    getPersonnelBySection,
    getPersonnelByPosition,
    refresh
  };
}

/**
 * Hook specifically for Work Assignments data
 */
export function useWorkAssignments(operationId?: string, facilityId?: string) {
  const {
    data: assignments,
    loading,
    error,
    lastUpdate,
    updateRecord: updateAssignment,
    addRecord: addAssignment,
    refresh
  } = useMasterData<WorkAssignment>('work_assignments', operationId);

  // Filter by facility if specified
  const filteredAssignments = facilityId 
    ? assignments.filter(a => a.facility_id === facilityId)
    : assignments;

  // Get assignments by status
  const getAssignmentsByStatus = useCallback((status: string) => {
    return assignments.filter(a => a.status === status);
  }, [assignments]);

  // Get assignments by type
  const getAssignmentsByType = useCallback((type: string) => {
    return assignments.filter(a => a.assignment_type === type);
  }, [assignments]);

  return {
    assignments: filteredAssignments,
    allAssignments: assignments,
    loading,
    error,
    lastUpdate,
    updateAssignment,
    addAssignment,
    getAssignmentsByStatus,
    getAssignmentsByType,
    refresh
  };
}

/**
 * Hook specifically for Gaps data
 */
export function useGaps(operationId?: string, facilityId?: string, gapType?: string) {
  const {
    data: gaps,
    loading,
    error,
    lastUpdate,
    updateRecord: updateGap,
    addRecord: addGap,
    refresh
  } = useMasterData<Gap>('gaps', operationId);

  // Apply filters
  let filteredGaps = gaps;
  if (facilityId) {
    filteredGaps = filteredGaps.filter(g => g.facility_id === facilityId);
  }
  if (gapType) {
    filteredGaps = filteredGaps.filter(g => g.gap_type === gapType);
  }

  // Get critical gaps
  const criticalGaps = gaps.filter(g => 
    g.status === 'open' && 
    g.priority === 'critical' && 
    (g.quantity_needed - (g.quantity_available || 0)) > 0
  );

  // Get gaps by priority
  const getGapsByPriority = useCallback((priority: string) => {
    return gaps.filter(g => g.priority === priority);
  }, [gaps]);

  // Calculate total gap for a type
  const getTotalGapByType = useCallback((type: string) => {
    return gaps
      .filter(g => g.gap_type === type && g.status === 'open')
      .reduce((total, gap) => total + (gap.quantity_needed - (gap.quantity_available || 0)), 0);
  }, [gaps]);

  return {
    gaps: filteredGaps,
    allGaps: gaps,
    criticalGaps,
    loading,
    error,
    lastUpdate,
    updateGap,
    addGap,
    getGapsByPriority,
    getTotalGapByType,
    refresh
  };
}

/**
 * Hook for operations data
 */
export function useOperations() {
  const {
    data: operations,
    loading,
    error,
    lastUpdate,
    refresh
  } = useMasterData<Operation>('operations');

  // Get active operations
  const activeOperations = operations.filter(op => op.status === 'active');

  // Get current operation (most recent active)
  const currentOperation = activeOperations.length > 0 
    ? activeOperations.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0]
    : null;

  return {
    operations,
    activeOperations,
    currentOperation,
    loading,
    error,
    lastUpdate,
    refresh
  };
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook to monitor specific record changes
 */
export function useRecordSubscription<T>(recordKey: string) {
  const [record, setRecord] = useState<T | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const masterDataService = getMasterDataService();
    const unsubscribe = masterDataService.subscribeToRecord(recordKey, (updatedRecord: T) => {
      console.log(`[useRecordSubscription] Record updated:`, recordKey, updatedRecord);
      setRecord(updatedRecord);
      setLastUpdate(new Date());
    });

    return unsubscribe;
  }, [recordKey]);

  return {
    record,
    lastUpdate
  };
}

/**
 * Hook for master data service status
 */
export function useMasterDataStatus() {
  const [operationId, setOperationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Get current operation
    const masterDataService = getMasterDataService();
    const currentOp = masterDataService.getCurrentOperationId();
    setOperationId(currentOp);

    // TODO: Add connection status monitoring
    // This would connect to the database connection status
    
  }, []);

  const switchOperation = useCallback(async (newOperationId: string) => {
    try {
      const masterDataService = getMasterDataService();
      await masterDataService.setCurrentOperation(newOperationId);
      setOperationId(newOperationId);
    } catch (error) {
      console.error('Error switching operation:', error);
      throw error;
    }
  }, []);

  return {
    operationId,
    isConnected,
    switchOperation
  };
}