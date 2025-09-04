/**
 * Local Store using Dexie for IndexedDB
 * 
 * Handles the local event log, outbox queue, and projections
 */

import Dexie, { Table } from 'dexie';
import { Event } from '../events/types';

// Define the database schema
export class LocalDatabase extends Dexie {
  // Event log - append only
  events!: Table<Event>;
  
  // Outbox for events to sync
  outbox!: Table<OutboxItem>;
  
  // Inbox for remote events
  inbox!: Table<InboxItem>;
  
  // Projections (read models)
  operations!: Table<any>;
  roster!: Table<any>;
  geography!: Table<any>;
  iap!: Table<any>;
  metrics!: Table<any>;
  
  // Snapshots for faster loading
  snapshots!: Table<Snapshot>;
  
  // Cache for remote data
  cache!: Table<CacheItem>;

  constructor(dbName: string) {
    super(dbName);
    
    this.version(1).stores({
      // Event log with indexes for efficient queries
      events: 'id, type, operationId, timestamp, [operationId+timestamp], syncStatus, correlationId',
      
      // Outbox with retry tracking
      outbox: '++sequence, eventId, status, retryCount, nextRetryAt',
      
      // Inbox for ordering remote events
      inbox: '++sequence, eventId, operationId, timestamp, processed',
      
      // Projections
      operations: 'id, status, createdAt',
      roster: 'id, operationId, personId, [operationId+personId]',
      geography: 'id, operationId, countyId, [operationId+countyId]',
      iap: 'id, operationId, iapNumber, [operationId+iapNumber]',
      metrics: 'id, operationId, date, type, [operationId+date+type]',
      
      // Snapshots for checkpoints
      snapshots: 'id, operationId, timestamp, type',
      
      // Cache with TTL
      cache: 'key, expiresAt',
    });
  }
}

// Outbox item for reliable event delivery
export interface OutboxItem {
  sequence?: number;
  eventId: string;
  event: Event;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  retryCount: number;
  maxRetries: number;
  nextRetryAt: number;
  lastError?: string;
  createdAt: number;
  sentAt?: number;
}

// Inbox item for ordering remote events
export interface InboxItem {
  sequence?: number;
  eventId: string;
  event: Event;
  operationId?: string;
  timestamp: number;
  processed: boolean;
  processedAt?: number;
  error?: string;
}

// Snapshot for faster state reconstruction
export interface Snapshot {
  id: string;
  operationId: string;
  timestamp: number;
  eventSequence: number;
  type: 'full' | 'incremental';
  data: any;
  hash: string;
}

// Cache item with TTL
export interface CacheItem {
  key: string;
  value: any;
  expiresAt: number;
  createdAt: number;
}

/**
 * Local Store API
 */
export class LocalStore {
  private db: LocalDatabase;
  private operationId?: string;
  
  constructor(dbName: string = 'disaster_ops_v3') {
    this.db = new LocalDatabase(dbName);
  }
  
  /**
   * Set the current operation context
   */
  setOperation(operationId: string) {
    this.operationId = operationId;
  }
  
  /**
   * Append event to local log
   */
  async appendEvent(event: Event): Promise<void> {
    await this.db.transaction('rw', this.db.events, this.db.outbox, async () => {
      // Add to event log
      await this.db.events.add(event);
      
      // Add to outbox for sync
      const outboxItem: OutboxItem = {
        eventId: event.id,
        event,
        status: 'pending',
        retryCount: 0,
        maxRetries: 5,
        nextRetryAt: Date.now(),
        createdAt: Date.now(),
      };
      await this.db.outbox.add(outboxItem);
    });
  }
  
  /**
   * Get events for an operation
   */
  async getEvents(operationId: string, since?: number): Promise<Event[]> {
    if (since) {
      return await this.db.events
        .where('[operationId+timestamp]')
        .between([operationId, since], [operationId, Infinity])
        .toArray();
    }
    return await this.db.events
      .where('operationId')
      .equals(operationId)
      .toArray();
  }
  
  /**
   * Get pending outbox items
   */
  async getPendingOutbox(limit: number = 100): Promise<OutboxItem[]> {
    const now = Date.now();
    return await this.db.outbox
      .where('status')
      .equals('pending')
      .filter(item => item.nextRetryAt <= now)
      .limit(limit)
      .toArray();
  }
  
  /**
   * Update outbox item status
   */
  async updateOutboxStatus(
    eventId: string, 
    status: OutboxItem['status'],
    error?: string
  ): Promise<void> {
    const item = await this.db.outbox.where('eventId').equals(eventId).first();
    if (!item) return;
    
    const updates: Partial<OutboxItem> = { status };
    
    if (status === 'sent') {
      updates.sentAt = Date.now();
    } else if (status === 'failed') {
      updates.retryCount = item.retryCount + 1;
      updates.lastError = error;
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      updates.nextRetryAt = Date.now() + Math.pow(2, item.retryCount) * 1000;
      
      // Mark as permanently failed after max retries
      if (updates.retryCount >= item.maxRetries) {
        updates.status = 'failed';
      } else {
        updates.status = 'pending';
      }
    }
    
    await this.db.outbox.where('eventId').equals(eventId).modify(updates);
  }
  
  /**
   * Add remote event to inbox
   */
  async addToInbox(event: Event): Promise<void> {
    const inboxItem: InboxItem = {
      eventId: event.id,
      event,
      operationId: event.operationId,
      timestamp: event.timestamp,
      processed: false,
    };
    await this.db.inbox.add(inboxItem);
  }
  
  /**
   * Process inbox items in order
   */
  async processInbox(
    processor: (event: Event) => Promise<void>
  ): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;
    
    const items = await this.db.inbox
      .where('processed')
      .equals(false)
      .sortBy('timestamp');
    
    for (const item of items) {
      try {
        await processor(item.event);
        await this.db.inbox
          .where('eventId')
          .equals(item.eventId)
          .modify({ processed: true, processedAt: Date.now() });
        processed++;
      } catch (error) {
        await this.db.inbox
          .where('eventId')
          .equals(item.eventId)
          .modify({ error: String(error) });
        failed++;
      }
    }
    
    return { processed, failed };
  }
  
  /**
   * Create a snapshot
   */
  async createSnapshot(
    operationId: string,
    type: 'full' | 'incremental',
    data: any
  ): Promise<void> {
    const events = await this.getEvents(operationId);
    const snapshot: Snapshot = {
      id: crypto.randomUUID(),
      operationId,
      timestamp: Date.now(),
      eventSequence: events.length,
      type,
      data,
      hash: this.generateHash(data),
    };
    await this.db.snapshots.add(snapshot);
  }
  
  /**
   * Get latest snapshot
   */
  async getLatestSnapshot(operationId: string): Promise<Snapshot | undefined> {
    return await this.db.snapshots
      .where('operationId')
      .equals(operationId)
      .reverse()
      .sortBy('timestamp')
      .then(snapshots => snapshots[0]);
  }
  
  /**
   * Cache remote data with TTL
   */
  async cache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const item: CacheItem = {
      key,
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
      createdAt: Date.now(),
    };
    await this.db.cache.put(item);
  }
  
  /**
   * Get cached value if not expired
   */
  async getCached(key: string): Promise<any | null> {
    const item = await this.db.cache.get(key);
    if (!item) return null;
    
    if (item.expiresAt < Date.now()) {
      await this.db.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  /**
   * Clean up old data
   */
  async cleanup(olderThanDays: number = 30): Promise<void> {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    
    // Clean old sent outbox items
    await this.db.outbox
      .where('status')
      .equals('sent')
      .filter(item => item.sentAt! < cutoff)
      .delete();
    
    // Clean processed inbox items
    await this.db.inbox
      .where('processed')
      .equals(true)
      .filter(item => item.processedAt! < cutoff)
      .delete();
    
    // Clean expired cache
    await this.db.cache
      .where('expiresAt')
      .below(Date.now())
      .delete();
  }
  
  /**
   * Get active operations from projections
   */
  async getActiveOperations(): Promise<any[]> {
    return await this.db.operations
      .where('status')
      .equals('active')
      .toArray();
  }
  
  /**
   * Get operation by ID
   */
  async getOperation(id: string): Promise<any | null> {
    return await this.db.operations.get(id);
  }
  
  /**
   * Save operation projection
   */
  async saveOperation(operation: any): Promise<void> {
    await this.db.operations.put(operation);
  }
  
  /**
   * Get storage size estimate
   */
  async getStorageEstimate(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { usage: 0, quota: 0 };
  }
  
  /**
   * Clear all data (use with caution!)
   */
  async clearAll(): Promise<void> {
    await this.db.delete();
    await this.db.open();
  }
  
  private generateHash(data: any): string {
    return btoa(JSON.stringify(data)).substring(0, 32);
  }
}

// Singleton instance
let localStore: LocalStore | null = null;

export function getLocalStore(): LocalStore {
  if (!localStore) {
    localStore = new LocalStore();
  }
  return localStore;
}