/**
 * Offline Sync Service
 * Handles offline support, sync queue management, and data synchronization
 * for ICS 215 worksheets with intelligent conflict resolution
 */

import { nanoid } from 'nanoid';
import {
  SyncQueueItem,
  ClientSyncState,
  SyncOperation,
  SyncStatus,
  ConflictResolution,
  ConnectionQuality,
  ICS215Worksheet,
  WorkAssignment,
  ResourceRequirement,
} from '../types/ics-215-types';
import { supabase } from './ics215DatabaseService';
import { conflictResolutionService } from './conflictResolutionService';

// ==============================================================================
// OFFLINE STORAGE TYPES AND INTERFACES
// ==============================================================================

export interface OfflineData {
  worksheets: Map<string, ICS215Worksheet>;
  assignments: Map<string, WorkAssignment>;
  resources: Map<string, ResourceRequirement>;
  lastSync: Date;
  syncVersion: number;
}

export interface SyncConflict {
  localItem: SyncQueueItem;
  serverData: any;
  conflictType: 'version' | 'data' | 'deleted';
  suggestedResolution: ConflictResolution;
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  conflicts: SyncConflict[];
  errors: string[];
  nextSyncVersion: number;
}

export interface NetworkStatus {
  isOnline: boolean;
  quality: ConnectionQuality;
  lastCheck: Date;
  latency?: number;
  bandwidth?: number;
}

// ==============================================================================
// OFFLINE STORAGE MANAGER
// ==============================================================================

export class OfflineStorageManager {
  private static readonly STORAGE_KEY = 'ics215_offline_data';
  private static readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB
  private data: OfflineData;

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): OfflineData {
    try {
      const stored = localStorage.getItem(OfflineStorageManager.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          worksheets: new Map(parsed.worksheets || []),
          assignments: new Map(parsed.assignments || []),
          resources: new Map(parsed.resources || []),
          lastSync: parsed.lastSync ? new Date(parsed.lastSync) : new Date(0),
          syncVersion: parsed.syncVersion || 0,
        };
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }

    return {
      worksheets: new Map(),
      assignments: new Map(),
      resources: new Map(),
      lastSync: new Date(0),
      syncVersion: 0,
    };
  }

  private saveToStorage(): void {
    try {
      const toSave = {
        worksheets: Array.from(this.data.worksheets.entries()),
        assignments: Array.from(this.data.assignments.entries()),
        resources: Array.from(this.data.resources.entries()),
        lastSync: this.data.lastSync.toISOString(),
        syncVersion: this.data.syncVersion,
      };

      const serialized = JSON.stringify(toSave);
      
      // Check storage size
      if (serialized.length > OfflineStorageManager.MAX_STORAGE_SIZE) {
        console.warn('Offline data exceeds max size, compacting...');
        this.compactData();
        return;
      }

      localStorage.setItem(OfflineStorageManager.STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Error saving offline data:', error);
      // Try to free up space
      this.compactData();
    }
  }

  private compactData(): void {
    // Remove old assignments and resources, keep worksheets
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    
    for (const [id, assignment] of this.data.assignments.entries()) {
      if (assignment.updatedAt < cutoffDate) {
        this.data.assignments.delete(id);
      }
    }

    for (const [id, resource] of this.data.resources.entries()) {
      if (resource.updatedAt < cutoffDate) {
        this.data.resources.delete(id);
      }
    }

    this.saveToStorage();
  }

  // Public methods
  getWorksheet(id: string): ICS215Worksheet | undefined {
    return this.data.worksheets.get(id);
  }

  setWorksheet(worksheet: ICS215Worksheet): void {
    this.data.worksheets.set(worksheet.id, worksheet);
    this.saveToStorage();
  }

  deleteWorksheet(id: string): void {
    this.data.worksheets.delete(id);
    // Also delete related assignments and resources
    for (const [assignmentId, assignment] of this.data.assignments.entries()) {
      if (assignment.worksheetId === id) {
        this.data.assignments.delete(assignmentId);
      }
    }
    for (const [resourceId, resource] of this.data.resources.entries()) {
      if (resource.worksheetId === id) {
        this.data.resources.delete(resourceId);
      }
    }
    this.saveToStorage();
  }

  getAssignment(id: string): WorkAssignment | undefined {
    return this.data.assignments.get(id);
  }

  setAssignment(assignment: WorkAssignment): void {
    this.data.assignments.set(assignment.id, assignment);
    this.saveToStorage();
  }

  getResource(id: string): ResourceRequirement | undefined {
    return this.data.resources.get(id);
  }

  setResource(resource: ResourceRequirement): void {
    this.data.resources.set(resource.id, resource);
    this.saveToStorage();
  }

  getLastSync(): Date {
    return this.data.lastSync;
  }

  updateSyncInfo(lastSync: Date, syncVersion: number): void {
    this.data.lastSync = lastSync;
    this.data.syncVersion = syncVersion;
    this.saveToStorage();
  }

  getSyncVersion(): number {
    return this.data.syncVersion;
  }

  getAllWorksheets(): ICS215Worksheet[] {
    return Array.from(this.data.worksheets.values());
  }

  getAllAssignments(): WorkAssignment[] {
    return Array.from(this.data.assignments.values());
  }

  getAllResources(): ResourceRequirement[] {
    return Array.from(this.data.resources.values());
  }

  clear(): void {
    this.data = {
      worksheets: new Map(),
      assignments: new Map(),
      resources: new Map(),
      lastSync: new Date(0),
      syncVersion: 0,
    };
    localStorage.removeItem(OfflineStorageManager.STORAGE_KEY);
  }
}

// ==============================================================================
// NETWORK MONITOR
// ==============================================================================

export class NetworkMonitor {
  private status: NetworkStatus = {
    isOnline: navigator.onLine,
    quality: 'excellent',
    lastCheck: new Date(),
  };

  private listeners: Array<(status: NetworkStatus) => void> = [];
  private qualityCheckInterval?: NodeJS.Timeout;

  constructor() {
    this.initializeEventListeners();
    this.startQualityMonitoring();
  }

  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      this.updateStatus({ isOnline: true });
    });

    window.addEventListener('offline', () => {
      this.updateStatus({ isOnline: false, quality: 'offline' });
    });
  }

  private startQualityMonitoring(): void {
    this.qualityCheckInterval = setInterval(async () => {
      if (this.status.isOnline) {
        await this.checkConnectionQuality();
      }
    }, 30000); // Check every 30 seconds
  }

  private async checkConnectionQuality(): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Test connection with a small request
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      });

      const endTime = performance.now();
      const latency = endTime - startTime;

      let quality: ConnectionQuality = 'excellent';
      
      if (latency > 2000) {
        quality = 'poor';
      } else if (latency > 1000) {
        quality = 'good';
      }

      this.updateStatus({
        isOnline: response.ok,
        quality,
        latency,
        lastCheck: new Date(),
      });
    } catch (error) {
      this.updateStatus({
        isOnline: false,
        quality: 'offline',
        lastCheck: new Date(),
      });
    }
  }

  private updateStatus(updates: Partial<NetworkStatus>): void {
    this.status = { ...this.status, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.status));
  }

  // Public methods
  getStatus(): NetworkStatus {
    return { ...this.status };
  }

  addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  isOnline(): boolean {
    return this.status.isOnline;
  }

  getQuality(): ConnectionQuality {
    return this.status.quality;
  }

  cleanup(): void {
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
    }
    this.listeners = [];
  }
}

// ==============================================================================
// SYNC QUEUE MANAGER
// ==============================================================================

export class SyncQueueManager {
  private queue: SyncQueueItem[] = [];
  private isProcessing = false;
  private clientId: string;
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Add an operation to the sync queue
   */
  enqueue(
    operation: SyncOperation,
    tableName: string,
    recordId: string,
    data: any,
    originalData?: any
  ): void {
    const item: SyncQueueItem = {
      id: nanoid(),
      operationType: operation,
      tableName,
      recordId,
      dataPayload: data,
      originalData,
      clientId: this.clientId,
      clientTimestamp: new Date(),
      serverTimestamp: new Date(),
      syncStatus: 'pending',
      attemptCount: 0,
      createdAt: new Date(),
    };

    this.queue.push(item);
    console.log(`Queued ${operation} operation for ${tableName}:${recordId}`);
  }

  /**
   * Process the sync queue
   */
  async processQueue(): Promise<SyncResult> {
    if (this.isProcessing) {
      return {
        success: true,
        syncedItems: 0,
        conflicts: [],
        errors: [],
        nextSyncVersion: 0,
      };
    }

    this.isProcessing = true;
    const result: SyncResult = {
      success: true,
      syncedItems: 0,
      conflicts: [],
      errors: [],
      nextSyncVersion: 0,
    };

    try {
      const pendingItems = this.queue.filter(item => item.syncStatus === 'pending');
      
      for (const item of pendingItems) {
        try {
          const syncResult = await this.processSyncItem(item);
          
          if (syncResult.success) {
            item.syncStatus = 'synced';
            result.syncedItems++;
          } else if (syncResult.conflict) {
            item.syncStatus = 'conflict';
            result.conflicts.push(syncResult.conflict);
          } else {
            item.syncStatus = 'failed';
            item.attemptCount++;
            item.errorMessage = syncResult.error;
            result.errors.push(syncResult.error || 'Unknown error');
            
            // Retry logic
            if (item.attemptCount < this.maxRetries) {
              setTimeout(() => {
                item.syncStatus = 'pending';
              }, this.retryDelay * Math.pow(2, item.attemptCount - 1)); // Exponential backoff
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          item.syncStatus = 'failed';
          item.attemptCount++;
          item.errorMessage = errorMessage;
          result.errors.push(errorMessage);
          result.success = false;
        }
      }

      // Remove synced items from queue
      this.queue = this.queue.filter(item => item.syncStatus !== 'synced');

      // Save queue state to server if online
      if (supabase && result.syncedItems > 0) {
        await this.saveQueueToServer();
      }

    } finally {
      this.isProcessing = false;
    }

    return result;
  }

  private async processSyncItem(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: SyncConflict;
    error?: string;
  }> {
    if (!supabase) {
      return { success: false, error: 'Database not available' };
    }

    try {
      switch (item.operationType) {
        case 'INSERT':
          return await this.processInsert(item);
        case 'UPDATE':
          return await this.processUpdate(item);
        case 'DELETE':
          return await this.processDelete(item);
        default:
          return { success: false, error: `Unknown operation type: ${item.operationType}` };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async processInsert(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: SyncConflict;
    error?: string;
  }> {
    if (!supabase) return { success: false, error: 'Database not available' };

    try {
      // Check if record already exists
      const { data: existing } = await supabase
        .from(item.tableName)
        .select('*')
        .eq('id', item.recordId)
        .single();

      if (existing) {
        // Conflict: record already exists
        return {
          success: false,
          conflict: {
            localItem: item,
            serverData: existing,
            conflictType: 'version',
            suggestedResolution: 'server_wins',
          },
        };
      }

      // Insert the record
      const { error } = await supabase
        .from(item.tableName)
        .insert(item.dataPayload);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async processUpdate(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: SyncConflict;
    error?: string;
  }> {
    if (!supabase) return { success: false, error: 'Database not available' };

    try {
      // Get current server data
      const { data: serverData, error: fetchError } = await supabase
        .from(item.tableName)
        .select('*')
        .eq('id', item.recordId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') { // Record not found
          return {
            success: false,
            conflict: {
              localItem: item,
              serverData: null,
              conflictType: 'deleted',
              suggestedResolution: 'client_wins', // Re-create the record
            },
          };
        }
        throw fetchError;
      }

      // Check for conflicts by comparing timestamps or versions
      const serverUpdated = new Date(serverData.updated_at);
      const clientUpdated = item.clientTimestamp;

      if (serverUpdated > clientUpdated) {
        // Server has newer data - conflict
        const hasDataConflict = this.detectDataConflict(
          item.originalData,
          serverData,
          item.dataPayload
        );

        if (hasDataConflict) {
          return {
            success: false,
            conflict: {
              localItem: item,
              serverData,
              conflictType: 'data',
              suggestedResolution: 'merge',
            },
          };
        }
      }

      // Update the record
      const { error } = await supabase
        .from(item.tableName)
        .update({
          ...item.dataPayload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.recordId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async processDelete(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: SyncConflict;
    error?: string;
  }> {
    if (!supabase) return { success: false, error: 'Database not available' };

    try {
      // Check if record still exists
      const { data: existing } = await supabase
        .from(item.tableName)
        .select('*')
        .eq('id', item.recordId)
        .single();

      if (!existing) {
        // Already deleted, consider it successful
        return { success: true };
      }

      // Check if record was modified after our last known state
      if (item.originalData) {
        const serverUpdated = new Date(existing.updated_at);
        const clientUpdated = item.clientTimestamp;

        if (serverUpdated > clientUpdated) {
          // Record was modified on server - conflict
          return {
            success: false,
            conflict: {
              localItem: item,
              serverData: existing,
              conflictType: 'data',
              suggestedResolution: 'manual',
            },
          };
        }
      }

      // Delete the record
      const { error } = await supabase
        .from(item.tableName)
        .delete()
        .eq('id', item.recordId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private detectDataConflict(
    originalData: any,
    serverData: any,
    localChanges: any
  ): boolean {
    if (!originalData || !serverData) return false;

    // Compare each field to see if both local and server made changes
    for (const key in localChanges) {
      if (key === 'updated_at' || key === 'id') continue;

      const originalValue = originalData[key];
      const serverValue = serverData[key];
      const localValue = localChanges[key];

      // If both local and server changed the same field differently
      if (originalValue !== serverValue && originalValue !== localValue && 
          serverValue !== localValue) {
        return true;
      }
    }

    return false;
  }

  private async saveQueueToServer(): Promise<void> {
    if (!supabase) return;

    const queueSnapshot = this.queue.filter(item => item.syncStatus !== 'synced');

    try {
      // Save queue items to server
      if (queueSnapshot.length > 0) {
        await supabase
          .from('sync_queue')
          .upsert(queueSnapshot.map(item => ({
            id: item.id,
            operation_type: item.operationType,
            table_name: item.tableName,
            record_id: item.recordId,
            data_payload: item.dataPayload,
            original_data: item.originalData,
            client_id: item.clientId,
            client_timestamp: item.clientTimestamp.toISOString(),
            server_timestamp: item.serverTimestamp.toISOString(),
            sync_status: item.syncStatus,
            attempt_count: item.attemptCount,
            error_message: item.errorMessage,
          })));
      }
    } catch (error) {
      console.error('Error saving queue to server:', error);
    }
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): {
    total: number;
    pending: number;
    synced: number;
    failed: number;
    conflicts: number;
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter(item => item.syncStatus === 'pending').length,
      synced: this.queue.filter(item => item.syncStatus === 'synced').length,
      failed: this.queue.filter(item => item.syncStatus === 'failed').length,
      conflicts: this.queue.filter(item => item.syncStatus === 'conflict').length,
    };
  }

  /**
   * Clear the sync queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get all queue items
   */
  getAllItems(): SyncQueueItem[] {
    return [...this.queue];
  }

  /**
   * Remove specific items from queue
   */
  removeItems(predicate: (item: SyncQueueItem) => boolean): void {
    this.queue = this.queue.filter(item => !predicate(item));
  }
}

// ==============================================================================
// MAIN OFFLINE SYNC SERVICE
// ==============================================================================

export class OfflineSyncService {
  private static instance: OfflineSyncService;
  private storageManager: OfflineStorageManager;
  private networkMonitor: NetworkMonitor;
  private syncQueue: SyncQueueManager;
  private clientId: string;
  private syncInterval?: NodeJS.Timeout;
  private isInitialized = false;

  private constructor() {
    this.clientId = nanoid();
    this.storageManager = new OfflineStorageManager();
    this.networkMonitor = new NetworkMonitor();
    this.syncQueue = new SyncQueueManager(this.clientId);
  }

  static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  /**
   * Initialize the offline sync service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Set up network monitoring
    this.networkMonitor.addListener(async (status) => {
      if (status.isOnline && status.quality !== 'poor') {
        await this.processOfflineChanges();
      }
    });

    // Start periodic sync when online
    this.startPeriodicSync();

    // Initial sync if online
    if (this.networkMonitor.isOnline()) {
      await this.processOfflineChanges();
    }

    this.isInitialized = true;
    console.log('Offline sync service initialized');
  }

  /**
   * Start periodic sync process
   */
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(async () => {
      if (this.networkMonitor.isOnline()) {
        await this.processOfflineChanges();
      }
    }, 60000); // Sync every minute when online
  }

  /**
   * Process offline changes and sync with server
   */
  async processOfflineChanges(): Promise<SyncResult> {
    if (!this.networkMonitor.isOnline()) {
      return {
        success: false,
        syncedItems: 0,
        conflicts: [],
        errors: ['Network offline'],
        nextSyncVersion: this.storageManager.getSyncVersion(),
      };
    }

    console.log('Processing offline changes...');
    const result = await this.syncQueue.processQueue();

    // Handle conflicts
    for (const conflict of result.conflicts) {
      await this.handleSyncConflict(conflict);
    }

    // Update sync state
    if (result.success && result.syncedItems > 0) {
      await this.updateClientSyncState(result.nextSyncVersion);
    }

    console.log(`Sync complete: ${result.syncedItems} items synced, ${result.conflicts.length} conflicts`);
    return result;
  }

  /**
   * Handle sync conflicts using the conflict resolution service
   */
  private async handleSyncConflict(conflict: SyncConflict): Promise<void> {
    const { localItem, serverData, conflictType, suggestedResolution } = conflict;

    switch (suggestedResolution) {
      case 'server_wins':
        // Update local data with server data
        await this.applyServerData(localItem.tableName, localItem.recordId, serverData);
        break;

      case 'client_wins':
        // Force update server with local data
        await this.forceServerUpdate(localItem);
        break;

      case 'merge':
        // Attempt intelligent merge
        const mergedData = await this.mergeConflictingData(localItem, serverData);
        if (mergedData) {
          await this.applyMergedData(localItem.tableName, localItem.recordId, mergedData);
        } else {
          // Fall back to manual resolution
          await this.escalateConflict(conflict);
        }
        break;

      case 'manual':
      default:
        // Escalate to manual resolution
        await this.escalateConflict(conflict);
        break;
    }
  }

  private async applyServerData(tableName: string, recordId: string, serverData: any): Promise<void> {
    // Update local storage with server data
    switch (tableName) {
      case 'ics_215_worksheets':
        // Convert server data to local format and update
        this.storageManager.setWorksheet(serverData);
        break;
      case 'work_assignments':
        this.storageManager.setAssignment(serverData);
        break;
      case 'resource_requirements':
        this.storageManager.setResource(serverData);
        break;
    }
  }

  private async forceServerUpdate(localItem: SyncQueueItem): Promise<void> {
    if (!supabase) return;

    try {
      await supabase
        .from(localItem.tableName)
        .upsert({
          ...localItem.dataPayload,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error forcing server update:', error);
    }
  }

  private async mergeConflictingData(localItem: SyncQueueItem, serverData: any): Promise<any | null> {
    // Simple merge strategy - can be enhanced
    const merged = { ...serverData };

    // Merge non-conflicting fields from local changes
    for (const [key, value] of Object.entries(localItem.dataPayload)) {
      if (key !== 'updated_at' && key !== 'id') {
        // Simple last-write-wins for now
        // More sophisticated merging would check field types and business logic
        merged[key] = value;
      }
    }

    return merged;
  }

  private async applyMergedData(tableName: string, recordId: string, mergedData: any): Promise<void> {
    if (!supabase) return;

    try {
      await supabase
        .from(tableName)
        .update({
          ...mergedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recordId);

      // Update local storage
      await this.applyServerData(tableName, recordId, mergedData);
    } catch (error) {
      console.error('Error applying merged data:', error);
    }
  }

  private async escalateConflict(conflict: SyncConflict): Promise<void> {
    // Store conflict for manual resolution
    console.warn('Conflict requires manual resolution:', conflict);
    
    // Could emit an event or store in a conflicts queue for UI handling
    // For now, just log the conflict
  }

  /**
   * Update client sync state on server
   */
  private async updateClientSyncState(syncVersion: number): Promise<void> {
    if (!supabase) return;

    try {
      const stats = this.syncQueue.getQueueStats();
      
      await supabase
        .from('client_sync_state')
        .upsert({
          client_id: this.clientId,
          last_sync_timestamp: new Date().toISOString(),
          last_sync_version: syncVersion,
          pending_changes_count: stats.pending,
          is_online: this.networkMonitor.isOnline(),
          last_online: new Date().toISOString(),
          connection_quality: this.networkMonitor.getQuality(),
          updated_at: new Date().toISOString(),
        });

      this.storageManager.updateSyncInfo(new Date(), syncVersion);
    } catch (error) {
      console.error('Error updating client sync state:', error);
    }
  }

  // ==============================================================================
  // PUBLIC API
  // ==============================================================================

  /**
   * Save data offline and queue for sync
   */
  async saveWorksheetOffline(worksheet: ICS215Worksheet, isUpdate = false): Promise<void> {
    // Save to local storage
    this.storageManager.setWorksheet(worksheet);

    // Queue for sync
    this.syncQueue.enqueue(
      isUpdate ? 'UPDATE' : 'INSERT',
      'ics_215_worksheets',
      worksheet.id,
      worksheet
    );

    // Try immediate sync if online
    if (this.networkMonitor.isOnline()) {
      setTimeout(() => this.processOfflineChanges(), 0);
    }
  }

  /**
   * Save assignment offline and queue for sync
   */
  async saveAssignmentOffline(assignment: WorkAssignment, isUpdate = false): Promise<void> {
    this.storageManager.setAssignment(assignment);
    
    this.syncQueue.enqueue(
      isUpdate ? 'UPDATE' : 'INSERT',
      'work_assignments',
      assignment.id,
      assignment
    );

    if (this.networkMonitor.isOnline()) {
      setTimeout(() => this.processOfflineChanges(), 0);
    }
  }

  /**
   * Save resource offline and queue for sync
   */
  async saveResourceOffline(resource: ResourceRequirement, isUpdate = false): Promise<void> {
    this.storageManager.setResource(resource);
    
    this.syncQueue.enqueue(
      isUpdate ? 'UPDATE' : 'INSERT',
      'resource_requirements',
      resource.id,
      resource
    );

    if (this.networkMonitor.isOnline()) {
      setTimeout(() => this.processOfflineChanges(), 0);
    }
  }

  /**
   * Delete data offline and queue for sync
   */
  async deleteOffline(type: 'worksheet' | 'assignment' | 'resource', id: string): Promise<void> {
    let tableName = '';
    
    switch (type) {
      case 'worksheet':
        this.storageManager.deleteWorksheet(id);
        tableName = 'ics_215_worksheets';
        break;
      case 'assignment':
        tableName = 'work_assignments';
        break;
      case 'resource':
        tableName = 'resource_requirements';
        break;
    }

    this.syncQueue.enqueue('DELETE', tableName, id, null);

    if (this.networkMonitor.isOnline()) {
      setTimeout(() => this.processOfflineChanges(), 0);
    }
  }

  /**
   * Get data from offline storage
   */
  getOfflineWorksheet(id: string): ICS215Worksheet | undefined {
    return this.storageManager.getWorksheet(id);
  }

  getOfflineAssignment(id: string): WorkAssignment | undefined {
    return this.storageManager.getAssignment(id);
  }

  getOfflineResource(id: string): ResourceRequirement | undefined {
    return this.storageManager.getResource(id);
  }

  /**
   * Get all offline data
   */
  getAllOfflineWorksheets(): ICS215Worksheet[] {
    return this.storageManager.getAllWorksheets();
  }

  getAllOfflineAssignments(): WorkAssignment[] {
    return this.storageManager.getAllAssignments();
  }

  getAllOfflineResources(): ResourceRequirement[] {
    return this.storageManager.getAllResources();
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isOnline: boolean;
    quality: ConnectionQuality;
    queueStats: ReturnType<SyncQueueManager['getQueueStats']>;
    lastSync: Date;
  } {
    return {
      isOnline: this.networkMonitor.isOnline(),
      quality: this.networkMonitor.getQuality(),
      queueStats: this.syncQueue.getQueueStats(),
      lastSync: this.storageManager.getLastSync(),
    };
  }

  /**
   * Force sync now
   */
  async forcSync(): Promise<SyncResult> {
    return await this.processOfflineChanges();
  }

  /**
   * Clear all offline data
   */
  clearOfflineData(): void {
    this.storageManager.clear();
    this.syncQueue.clear();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.networkMonitor.cleanup();
  }
}

// Export singleton instance
export const offlineSyncService = OfflineSyncService.getInstance();

// Export classes for testing
export {
  OfflineStorageManager,
  NetworkMonitor,
  SyncQueueManager,
};