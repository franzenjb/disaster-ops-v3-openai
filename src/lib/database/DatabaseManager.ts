/**
 * Dual Database Architecture Manager
 * 
 * This is the revolutionary dual-database system that makes disaster operations
 * work both online and offline seamlessly.
 * 
 * Temporary DB: Fast, local, works offline (SQLite/IndexedDB)
 * Permanent DB: Complete historical record (PostgreSQL/Supabase)
 */

import { eventBus } from '../sync/EventBus';
import { EventType } from '../events/types';

export interface DatabaseConfig {
  permanent: {
    url?: string;
    apiKey?: string;
    enabled: boolean;
  };
  temporary: {
    dbName: string;
    version: number;
  };
}

export interface SyncStatus {
  lastSync: Date | null;
  pendingChanges: number;
  isSyncing: boolean;
  syncErrors: Error[];
}

export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  source: 'temporary' | 'permanent' | 'cache';
}

/**
 * Base interface for all database operations
 */
export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction(queries: Array<{ sql: string; params?: any[] }>): Promise<void>;
  isConnected(): boolean;
}

export interface IndexedDBDatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(storeName: string, params?: any): Promise<QueryResult<T>>;
  execute(storeName: string, operation: 'add' | 'put' | 'delete', data?: any): Promise<void>;
  transaction(operations: Array<{ store: string; operation: 'add' | 'put' | 'delete'; data?: any }>): Promise<void>;
  isConnected(): boolean;
}

/**
 * IndexedDB adapter for temporary/offline storage
 */
export class IndexedDBAdapter implements IndexedDBDatabaseAdapter {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;
  
  constructor(dbName: string, version: number) {
    this.dbName = dbName;
    this.version = version;
  }
  
  async connect(): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not available in this environment');
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for our data
        if (!db.objectStoreNames.contains('operations')) {
          const operationStore = db.createObjectStore('operations', { keyPath: 'id' });
          operationStore.createIndex('status', 'status', { unique: false });
          operationStore.createIndex('created_at', 'created_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          eventStore.createIndex('sync_status', 'sync_status', { unique: false });
          eventStore.createIndex('timestamp', 'timestamp', { unique: false });
          eventStore.createIndex('type', 'type', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('roster')) {
          const rosterStore = db.createObjectStore('roster', { keyPath: 'id' });
          rosterStore.createIndex('operation_id', 'operation_id', { unique: false });
          rosterStore.createIndex('position', 'position', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('geography')) {
          const geoStore = db.createObjectStore('geography', { keyPath: 'id' });
          geoStore.createIndex('operation_id', 'operation_id', { unique: false });
          geoStore.createIndex('county_fips', 'county_fips', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('iap')) {
          const iapStore = db.createObjectStore('iap', { keyPath: 'id' });
          iapStore.createIndex('operation_id', 'operation_id', { unique: false });
          iapStore.createIndex('iap_number', 'iap_number', { unique: false });
          iapStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('facilities')) {
          const facilityStore = db.createObjectStore('facilities', { keyPath: 'id' });
          facilityStore.createIndex('operation_id', 'operation_id', { unique: false });
          facilityStore.createIndex('facility_type', 'facility_type', { unique: false });
          facilityStore.createIndex('status', 'status', { unique: false });
          facilityStore.createIndex('county', 'county', { unique: false });
        }

        if (!db.objectStoreNames.contains('iap_snapshots')) {
          const snapshotStore = db.createObjectStore('iap_snapshots', { keyPath: 'id' });
          snapshotStore.createIndex('iap_id', 'iap_id', { unique: false });
          snapshotStore.createIndex('snapshot_type', 'snapshot_type', { unique: false });
          snapshotStore.createIndex('snapshot_time', 'snapshot_time', { unique: false });
        }

        if (!db.objectStoreNames.contains('work_assignments')) {
          const workStore = db.createObjectStore('work_assignments', { keyPath: 'id' });
          workStore.createIndex('facility_id', 'facility_id', { unique: false });
          workStore.createIndex('assigned_to', 'assigned_to', { unique: false });
          workStore.createIndex('status', 'status', { unique: false });
          workStore.createIndex('due_date', 'due_date', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expires_at', 'expires_at', { unique: false });
        }
      };
    });
  }
  
  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
  
  async query<T>(storeName: string, params?: any): Promise<QueryResult<T>> {
    if (!this.db || typeof window === 'undefined') {
      return { data: null, error: new Error('Database not connected'), source: 'temporary' };
    }
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let request: IDBRequest;
      
      if (params?.index && params?.value) {
        const index = store.index(params.index);
        request = index.getAll(params.value);
      } else if (params?.id) {
        request = store.get(params.id);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        resolve({ 
          data: request.result as T, 
          error: null, 
          source: 'temporary' 
        });
      };
      
      request.onerror = () => {
        resolve({ 
          data: null, 
          error: request.error, 
          source: 'temporary' 
        });
      };
    });
  }
  
  async execute(storeName: string, operation: 'add' | 'put' | 'delete', data?: any): Promise<void> {
    if (!this.db) {
      console.error('[TemporaryDatabase] Database not connected in execute method');
      throw new Error('Database not connected');
    }
    
    return new Promise((resolve, reject) => {
      try {
        console.log(`[TemporaryDatabase] Creating transaction for ${storeName} with operation ${operation}`);
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        let request: IDBRequest;
        
        switch (operation) {
          case 'add':
            console.log(`[TemporaryDatabase] Adding data to ${storeName}:`, data);
            request = store.add(data);
            break;
          case 'put':
            request = store.put(data);
            break;
          case 'delete':
            request = store.delete(data);
            break;
        }
        
        request.onsuccess = () => {
          console.log(`[TemporaryDatabase] ${operation} operation successful on ${storeName}`);
          resolve();
        };
        request.onerror = () => {
          console.error(`[TemporaryDatabase] ${operation} operation failed on ${storeName}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error(`[TemporaryDatabase] Error in execute method:`, error);
        reject(error);
      }
    });
  }
  
  async transaction(operations: Array<{ store: string; operation: string; data?: any }>): Promise<void> {
    if (!this.db) throw new Error('Database not connected');
    
    const storeNames = [...new Set(operations.map(op => op.store))];
    const transaction = this.db.transaction(storeNames, 'readwrite');
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      
      operations.forEach(({ store, operation, data }) => {
        const objectStore = transaction.objectStore(store);
        
        switch (operation) {
          case 'add':
            objectStore.add(data);
            break;
          case 'put':
            objectStore.put(data);
            break;
          case 'delete':
            objectStore.delete(data);
            break;
        }
      });
    });
  }
  
  isConnected(): boolean {
    return this.db !== null;
  }
}

/**
 * Main Database Manager - coordinates between temporary and permanent databases
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private temporaryDb: IndexedDBAdapter;
  private permanentDb: DatabaseAdapter | null = null;
  private syncStatus: SyncStatus = {
    lastSync: null,
    pendingChanges: 0,
    isSyncing: false,
    syncErrors: []
  };
  private syncInterval: NodeJS.Timeout | null = null;
  
  private constructor(config: DatabaseConfig) {
    this.temporaryDb = new IndexedDBAdapter(
      config.temporary.dbName,
      config.temporary.version
    );
    
    // Permanent DB will be initialized when Supabase is configured
    if (config.permanent.enabled && config.permanent.url) {
      // Will implement SupabaseAdapter later
      console.log('Permanent database will be configured with Supabase');
    }
    
    this.initialize();
  }
  
  static getInstance(config?: DatabaseConfig): DatabaseManager {
    if (!DatabaseManager.instance) {
      if (!config) {
        throw new Error('DatabaseManager must be initialized with config');
      }
      DatabaseManager.instance = new DatabaseManager(config);
    }
    return DatabaseManager.instance;
  }
  
  private async initialize(): Promise<void> {
    try {
      // Connect to temporary database
      await this.temporaryDb.connect();
      
      // Start sync process if permanent DB is available
      if (this.permanentDb) {
        this.startSync();
      }
      
      // Listen for online/offline events
      eventBus.on(EventType.ONLINE_MODE, () => this.handleOnline());
      eventBus.on(EventType.OFFLINE_MODE, () => this.handleOffline());
      
      console.log('DatabaseManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DatabaseManager:', error);
      throw error;
    }
  }
  
  /**
   * Query data - tries temporary DB first, falls back to permanent if needed
   */
  async query<T>(
    collection: string,
    params?: any,
    options?: { preferPermanent?: boolean }
  ): Promise<QueryResult<T>> {
    // Always try temporary DB first for speed
    if (!options?.preferPermanent) {
      const tempResult = await this.temporaryDb.query<T>(collection, params);
      if (tempResult.data !== null) {
        return tempResult;
      }
    }
    
    // Fall back to permanent DB if available
    if (this.permanentDb && this.permanentDb.isConnected()) {
      return await this.permanentDb.query<T>(collection, params);
    }
    
    // Return empty result if nothing found
    return {
      data: null,
      error: null,
      source: 'temporary'
    };
  }
  
  /**
   * Write data - writes to temporary DB immediately, queues for permanent sync
   */
  async write(
    collection: string,
    operation: 'add' | 'put' | 'delete',
    data: any
  ): Promise<void> {
    // Always write to temporary DB first
    await this.temporaryDb.execute(collection, operation, data);
    
    // Queue for sync to permanent DB
    this.queueForSync({
      collection,
      operation,
      data,
      timestamp: Date.now()
    });
    
    // Emit event for real-time updates
    eventBus.emit(EventType.DATA_IMPORTED, {
      collection,
      operation,
      dataId: data.id
    });
  }
  
  /**
   * Batch write operations in a transaction
   */
  async batchWrite(operations: Array<{
    collection: string;
    operation: 'add' | 'put' | 'delete';
    data: any;
  }>): Promise<void> {
    // Convert to IndexedDB format
    const dbOperations = operations.map(op => ({
      store: op.collection,
      operation: op.operation,
      data: op.data
    }));
    
    // Execute transaction
    await this.temporaryDb.transaction(dbOperations);
    
    // Queue all for sync
    operations.forEach(op => {
      this.queueForSync({
        ...op,
        timestamp: Date.now()
      });
    });
  }
  
  /**
   * Append an event to the event store
   */
  async appendEvent(event: any): Promise<void> {
    try {
      console.log('[DatabaseManager] appendEvent called with:', event);
      
      // Always ensure database is connected
      console.log('[DatabaseManager] Ensuring database connection...');
      await this.temporaryDb.connect();
      
      // Store event in IndexedDB
      console.log('[DatabaseManager] Executing add operation on events store');
      await this.temporaryDb.execute('events', 'add', event);
      console.log('[DatabaseManager] Event stored successfully');
      
      // Queue for sync
      this.queueForSync({
        collection: 'events',
        operation: 'add',
        data: event,
        timestamp: Date.now()
      });
      
      // Emit to event bus for real-time updates
      eventBus.emit(event.type, event.payload, { correlationId: event.id });
    } catch (error) {
      console.error('[DatabaseManager] Error in appendEvent:', error);
      throw error;
    }
  }
  
  /**
   * Get events by type
   */
  async getEventsByType(eventType: string): Promise<any[]> {
    const result = await this.temporaryDb.query<any[]>('events', {
      index: 'type',
      value: eventType
    });
    
    return result.data || [];
  }
  
  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }
  
  /**
   * Force sync now
   */
  async syncNow(): Promise<void> {
    if (this.syncStatus.isSyncing) {
      console.log('Sync already in progress');
      return;
    }
    
    await this.performSync();
  }
  
  private queueForSync(change: any): void {
    // Store sync queue in IndexedDB
    this.temporaryDb.execute('events', 'add', {
      ...change,
      sync_status: 'pending'
    });
    
    this.syncStatus.pendingChanges++;
  }
  
  private async performSync(): Promise<void> {
    if (!this.permanentDb || !this.permanentDb.isConnected()) {
      return;
    }
    
    this.syncStatus.isSyncing = true;
    eventBus.emit(EventType.SYNC_STARTED, {
      pendingChanges: this.syncStatus.pendingChanges
    });
    
    try {
      // Get all pending events
      const pendingEvents = await this.temporaryDb.query<any[]>('events', {
        index: 'sync_status',
        value: 'pending'
      });
      
      if (pendingEvents.data && pendingEvents.data.length > 0) {
        // Sync to permanent database
        // Implementation will depend on Supabase setup
        console.log(`Syncing ${pendingEvents.data.length} events`);
        
        // Mark as synced
        for (const event of pendingEvents.data) {
          event.sync_status = 'synced';
          await this.temporaryDb.execute('events', 'put', event);
        }
        
        this.syncStatus.pendingChanges = 0;
        this.syncStatus.lastSync = new Date();
      }
      
      eventBus.emit(EventType.SYNC_COMPLETED, {
        syncedCount: pendingEvents.data?.length || 0
      });
    } catch (error) {
      console.error('Sync failed:', error);
      this.syncStatus.syncErrors.push(error as Error);
      
      eventBus.emit(EventType.SYNC_FAILED, { error });
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }
  
  private startSync(): void {
    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, 30000);
    
    // Also sync immediately
    this.performSync();
  }
  
  private stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  private async handleOnline(): Promise<void> {
    console.log('Database going online');
    if (this.permanentDb) {
      await this.permanentDb.connect();
      this.startSync();
    }
  }
  
  private async handleOffline(): Promise<void> {
    console.log('Database going offline');
    this.stopSync();
    if (this.permanentDb) {
      await this.permanentDb.disconnect();
    }
  }
  
  /**
   * Clear all temporary data (use with caution!)
   */
  async clearTemporary(): Promise<void> {
    if (typeof window !== 'undefined') {
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name?.startsWith('disaster_ops_')) {
          indexedDB.deleteDatabase(db.name);
        }
      }
    }
  }
  
  /**
   * Export all data for backup
   */
  async exportData(): Promise<any> {
    const collections = [
      'operations', 
      'roster', 
      'geography', 
      'iap', 
      'facilities',
      'iap_snapshots',
      'work_assignments',
      'events'
    ];
    const exportData: any = {};
    
    for (const collection of collections) {
      const result = await this.temporaryDb.query(collection);
      exportData[collection] = result.data;
    }
    
    eventBus.emit(EventType.DATA_EXPORTED, {
      timestamp: Date.now(),
      collections: collections.length
    });
    
    return exportData;
  }
  
  /**
   * Import data from backup
   */
  async importData(data: any): Promise<void> {
    const operations = [];
    
    for (const [collection, items] of Object.entries(data)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          operations.push({
            collection,
            operation: 'put' as const,
            data: item
          });
        }
      }
    }
    
    await this.batchWrite(operations);
    
    eventBus.emit(EventType.DATA_IMPORTED, {
      timestamp: Date.now(),
      itemCount: operations.length
    });
  }
}

// Export a function to initialize the database
export function initializeDatabase(): DatabaseManager {
  return DatabaseManager.getInstance({
    permanent: {
      enabled: false, // Will enable when Supabase is configured
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    temporary: {
      dbName: 'disaster_ops_v3',
      version: 2
    }
  });
}
