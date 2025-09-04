/**
 * Supabase Synchronization Hook
 * Automatically syncs local state with Supabase database
 */

import { useEffect, useRef } from 'react';
import { useOperationStore } from '../stores/useOperationStore';
import { DatabaseService } from '../lib/supabase';
import { eventBus, EventType } from '../core/EventBus';

export function useSupabaseSync() {
  const operation = useOperationStore(state => state.currentOperation);
  const lastSyncRef = useRef<Date>(new Date());
  const syncQueueRef = useRef<any[]>([]);
  const isSyncingRef = useRef(false);

  // Check if Supabase is configured
  const isSupabaseConfigured = () => {
    return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
  };

  // Process sync queue
  const processSync = async () => {
    if (!isSupabaseConfigured() || isSyncingRef.current || syncQueueRef.current.length === 0) {
      return;
    }

    isSyncingRef.current = true;
    const updates = [...syncQueueRef.current];
    syncQueueRef.current = [];

    try {
      for (const update of updates) {
        switch (update.type) {
          case 'operation':
            await DatabaseService.updateOperation(update.operationId, update.data);
            break;
          case 'service_line':
            await DatabaseService.recordServiceLineUpdate({
              operation_id: update.operationId,
              service_line: update.serviceLine,
              line_number: update.lineNumber,
              value: update.value,
              timestamp: new Date().toISOString(),
              user_name: update.userName,
            });
            break;
          case 'iap':
            await DatabaseService.saveIAP({
              operation_id: update.operationId,
              iap_number: update.iapNumber,
              operational_period_start: update.periodStart,
              operational_period_end: update.periodEnd,
              data: update.data,
              cover_photo: update.coverPhoto,
              status: update.status || 'draft',
            });
            break;
        }
      }
      
      lastSyncRef.current = new Date();
      eventBus.emit(EventType.DATA_SYNC_SUCCESS, { timestamp: lastSyncRef.current });
    } catch (error) {
      console.error('Sync error:', error);
      eventBus.emit(EventType.DATA_SYNC_ERROR, { error });
      // Re-add failed updates to queue
      syncQueueRef.current = [...updates, ...syncQueueRef.current];
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Setup event listeners
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured - running in offline mode');
      return;
    }

    // Listen for service line updates
    const handleServiceLineUpdate = (data: any) => {
      syncQueueRef.current.push({
        type: 'service_line',
        ...data,
      });
      processSync();
    };

    // Listen for IAP updates
    const handleIAPUpdate = (data: any) => {
      syncQueueRef.current.push({
        type: 'iap',
        ...data,
      });
      processSync();
    };

    // Listen for general operation updates
    const handleOperationUpdate = (data: any) => {
      syncQueueRef.current.push({
        type: 'operation',
        ...data,
      });
      processSync();
    };

    eventBus.on(EventType.SERVICE_LINE_UPDATE, handleServiceLineUpdate);
    eventBus.on(EventType.IAP_SECTION_UPDATE, handleIAPUpdate);
    eventBus.on(EventType.DATA_ENTRY, handleOperationUpdate);

    // Process sync queue periodically
    const syncInterval = setInterval(processSync, 5000);

    return () => {
      eventBus.off(EventType.SERVICE_LINE_UPDATE, handleServiceLineUpdate);
      eventBus.off(EventType.IAP_SECTION_UPDATE, handleIAPUpdate);
      eventBus.off(EventType.DATA_ENTRY, handleOperationUpdate);
      clearInterval(syncInterval);
    };
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!isSupabaseConfigured() || !operation) {
      return;
    }

    const channel = DatabaseService.subscribeToOperationUpdates(
      operation.id,
      (payload) => {
        console.log('Real-time update received:', payload);
        
        // Update local state with remote changes
        if (payload.eventType === 'UPDATE' && payload.table === 'operations') {
          const remoteData = payload.new.data;
          // Merge remote changes with local state
          useOperationStore.getState().updateOperation(remoteData);
        } else if (payload.table === 'service_line_updates') {
          // Emit event for UI update
          eventBus.emit(EventType.REMOTE_UPDATE, payload);
        }
      }
    );

    return () => {
      DatabaseService.unsubscribeFromOperationUpdates(operation.id);
    };
  }, [operation?.id]);

  return {
    isConfigured: isSupabaseConfigured(),
    lastSync: lastSyncRef.current,
    isSyncing: isSyncingRef.current,
    pendingUpdates: syncQueueRef.current.length,
  };
}