/**
 * Supabase Adapter Layer
 * 
 * This adapter maintains the exact same interface as the existing MasterDataService
 * while routing all calls to the new Supabase backend. This allows existing React
 * components to work unchanged during the Phase 2 migration.
 * 
 * PHASE 2 - WEEK 2 IMPLEMENTATION
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, type Facility, type Operation, type PersonnelAssignment } from '../supabase';
import { migrateFromIndexedDB } from '../migration/IndexedDBMigration';

// Context for managing adapter state
interface SupabaseAdapterContextType {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  facilities: Facility[];
  operations: Operation[];
  currentOperationId: string | null;
  
  // Methods that replace MasterDataService calls
  createFacility: (facility: Partial<Facility>) => Promise<Facility>;
  updateFacility: (id: string, updates: Partial<Facility>) => Promise<Facility>;
  deleteFacility: (id: string) => Promise<boolean>;
  setCurrentOperation: (operationId: string) => void;
  performMigration: () => Promise<boolean>;
  
  // Real-time subscription management
  subscribeToFacilities: (operationId: string) => () => void;
  subscribeToOperations: () => () => void;
}

const SupabaseAdapterContext = createContext<SupabaseAdapterContextType | null>(null);

/**
 * Provider component that manages all Supabase interactions
 */
export function SupabaseAdapterProvider({ children }: { children: React.ReactNode }) {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [currentOperationId, setCurrentOperationId] = useState<string | null>(null);

  // Initialize connection and check migration status
  useEffect(() => {
    initializeAdapter();
  }, []);

  const initializeAdapter = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Test Supabase connection
      const { data, error: connectionError } = await supabase
        .from('operations')
        .select('count', { count: 'exact', head: true });

      if (connectionError) {
        throw new Error(`Supabase connection failed: ${connectionError.message}`);
      }

      setIsConnected(true);
      console.log('✅ SupabaseAdapter initialized successfully');

      // Load initial data
      await loadOperations();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('❌ SupabaseAdapter initialization failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOperations(data || []);
      
      // Set current operation if none selected
      if (!currentOperationId && data && data.length > 0) {
        setCurrentOperationId(data[0].id);
      }

    } catch (err) {
      console.error('Failed to load operations:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const loadFacilities = async (operationId: string) => {
    if (!operationId) return;

    try {
      setIsLoading(true);
      
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('facilities')
        .select(`
          *,
          personnel_assignments(*)
        `)
        .eq('operation_id', operationId)
        .order('created_at', { ascending: false });

      const duration = Date.now() - startTime;
      
      // Performance monitoring
      if (duration > 100) {
        console.warn(`⚠️ Slow facility query: ${duration}ms (target: <100ms)`);
      }

      if (error) throw error;

      setFacilities(data || []);
      console.log(`✅ Loaded ${data?.length || 0} facilities in ${duration}ms`);

    } catch (err) {
      console.error('Failed to load facilities:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Facility management methods that replace MasterDataService
  const createFacility = useCallback(async (facilityData: Partial<Facility>): Promise<Facility> => {
    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('facilities')
        .insert({
          ...facilityData,
          operation_id: currentOperationId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      const duration = Date.now() - startTime;
      console.log(`✅ Created facility in ${duration}ms`);

      if (error) throw error;

      // Update local state
      setFacilities(prev => [data, ...prev]);
      
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw new Error(`Failed to create facility: ${errorMessage}`);
    }
  }, [currentOperationId]);

  const updateFacility = useCallback(async (id: string, updates: Partial<Facility>): Promise<Facility> => {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setFacilities(prev => prev.map(f => f.id === id ? data : f));
      
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw new Error(`Failed to update facility: ${errorMessage}`);
    }
  }, []);

  const deleteFacility = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setFacilities(prev => prev.filter(f => f.id !== id));
      
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw new Error(`Failed to delete facility: ${errorMessage}`);
    }
  }, []);

  const setCurrentOperation = useCallback((operationId: string) => {
    setCurrentOperationId(operationId);
    loadFacilities(operationId);
  }, []);

  const performMigration = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🚀 Starting IndexedDB migration...');
      const result = await migrateFromIndexedDB();

      if (result.success) {
        console.log(`✅ Migration successful: ${result.recordsMigrated} records migrated`);
        
        // Reload data after migration
        await loadOperations();
        if (currentOperationId) {
          await loadFacilities(currentOperationId);
        }
        
        return true;
      } else {
        throw new Error(`Migration failed: ${result.errors.join(', ')}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('❌ Migration failed:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentOperationId]);

  // Real-time subscriptions for live collaboration
  const subscribeToFacilities = useCallback((operationId: string) => {
    const subscription = supabase
      .channel(`facilities-${operationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'facilities',
          filter: `operation_id=eq.${operationId}`,
        },
        (payload) => {
          console.log('📡 Real-time facility update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setFacilities(prev => [payload.new as Facility, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setFacilities(prev => prev.map(f => 
              f.id === payload.new.id ? payload.new as Facility : f
            ));
          } else if (payload.eventType === 'DELETE') {
            setFacilities(prev => prev.filter(f => f.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const subscribeToOperations = useCallback(() => {
    const subscription = supabase
      .channel('operations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'operations' },
        (payload) => {
          console.log('📡 Real-time operation update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setOperations(prev => [payload.new as Operation, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOperations(prev => prev.map(op => 
              op.id === payload.new.id ? payload.new as Operation : op
            ));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load facilities when current operation changes
  useEffect(() => {
    if (currentOperationId) {
      loadFacilities(currentOperationId);
    }
  }, [currentOperationId]);

  const value: SupabaseAdapterContextType = {
    isConnected,
    isLoading,
    error,
    facilities,
    operations,
    currentOperationId,
    createFacility,
    updateFacility,
    deleteFacility,
    setCurrentOperation,
    performMigration,
    subscribeToFacilities,
    subscribeToOperations
  };

  return (
    <SupabaseAdapterContext.Provider value={value}>
      {children}
    </SupabaseAdapterContext.Provider>
  );
}

/**
 * Hook that provides access to the Supabase adapter
 * This replaces the useMasterData hook from the old system
 */
export function useSupabaseAdapter() {
  const context = useContext(SupabaseAdapterContext);
  if (!context) {
    throw new Error('useSupabaseAdapter must be used within a SupabaseAdapterProvider');
  }
  return context;
}

/**
 * Legacy compatibility hook - maintains exact same interface as original
 * This allows existing components to work without any changes
 */
export function useMasterData() {
  const adapter = useSupabaseAdapter();
  
  // Return object with same structure as original MasterDataService
  return {
    // Data
    facilities: adapter.facilities,
    operations: adapter.operations,
    isLoading: adapter.isLoading,
    error: adapter.error,
    
    // Methods - maintain exact same signatures
    createFacility: adapter.createFacility,
    updateFacility: adapter.updateFacility,
    deleteFacility: adapter.deleteFacility,
    
    // Status
    isConnected: adapter.isConnected,
    lastSync: new Date(), // Supabase is always in sync
    
    // Migration
    performMigration: adapter.performMigration,
    
    // Real-time subscriptions
    subscribe: adapter.subscribeToFacilities,
    unsubscribe: () => {}, // Handled automatically by useEffect cleanup
  };
}

/**
 * Migration status component for user feedback
 */
export function MigrationStatus() {
  const { isConnected, isLoading, error, performMigration } = useSupabaseAdapter();
  const [migrating, setMigrating] = useState(false);

  const handleMigration = async () => {
    setMigrating(true);
    const success = await performMigration();
    setMigrating(false);
    
    if (success) {
      alert('✅ Migration completed successfully!');
    } else {
      alert('❌ Migration failed. Check console for details.');
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <h3 className="font-bold text-red-800">Database Connection Issue</h3>
        <p className="text-red-600">{error || 'Unable to connect to Supabase'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-blue-800">🔄 Connecting to new database...</p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
      <h3 className="font-bold text-green-800">✅ Supabase Connected</h3>
      <p className="text-green-600">New simplified database architecture active</p>
      <button
        onClick={handleMigration}
        disabled={migrating}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {migrating ? '🔄 Migrating...' : '📥 Migrate Legacy Data'}
      </button>
    </div>
  );
}

export default SupabaseAdapterProvider;