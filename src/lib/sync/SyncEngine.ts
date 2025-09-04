/**
 * Sync Engine with Outbox/Inbox Pattern
 * 
 * Handles reliable event synchronization between local and remote stores
 * with idempotency, retry logic, and conflict resolution
 */

import { Event, EventType, ConflictResolution, ConflictPolicy, DefaultConflictPolicies } from '../events/types';
import { LocalStore, OutboxItem } from '../store/LocalStore';
import { EventBus } from './EventBus';

export interface SyncConfig {
  syncIntervalMs: number;
  batchSize: number;
  maxRetries: number;
  conflictPolicies: ConflictPolicy[];
  remoteEndpoint?: string;
  apiKey?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  pendingOutbox: number;
  pendingInbox: number;
  failedEvents: number;
  lastError: string | null;
}

export interface ConflictEvent {
  local: Event;
  remote: Event;
  resolution: ConflictResolution;
  resolved?: Event;
}

/**
 * Sync Engine coordinates between local and remote stores
 */
export class SyncEngine {
  private localStore: LocalStore;
  private eventBus: EventBus;
  private config: SyncConfig;
  private status: SyncStatus;
  private syncInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private conflictPolicies: Map<EventType, ConflictPolicy>;
  
  constructor(
    localStore: LocalStore,
    eventBus: EventBus,
    config: Partial<SyncConfig> = {}
  ) {
    this.localStore = localStore;
    this.eventBus = eventBus;
    
    this.config = {
      syncIntervalMs: 30000, // 30 seconds
      batchSize: 100,
      maxRetries: 5,
      conflictPolicies: DefaultConflictPolicies,
      ...config,
    };
    
    this.status = {
      isOnline: false,
      isSyncing: false,
      lastSyncAt: null,
      pendingOutbox: 0,
      pendingInbox: 0,
      failedEvents: 0,
      lastError: null,
    };
    
    // Build conflict policy map
    this.conflictPolicies = new Map();
    this.config.conflictPolicies.forEach(policy => {
      this.conflictPolicies.set(policy.eventType as EventType, policy);
    });
    
    this.setupNetworkListeners();
  }
  
  /**
   * Start the sync engine
   */
  start(): void {
    if (this.syncInterval) return;
    
    // Initial sync
    this.sync();
    
    // Schedule regular syncs
    this.syncInterval = setInterval(() => {
      if (this.status.isOnline && !this.isProcessing) {
        this.sync();
      }
    }, this.config.syncIntervalMs);
    
    console.log('SyncEngine started');
  }
  
  /**
   * Stop the sync engine
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('SyncEngine stopped');
  }
  
  /**
   * Force sync now
   */
  async sync(): Promise<void> {
    if (this.isProcessing || !this.status.isOnline) return;
    
    this.isProcessing = true;
    this.status.isSyncing = true;
    
    this.eventBus.emit(EventType.SYNC_STARTED, {
      pendingOutbox: this.status.pendingOutbox,
      pendingInbox: this.status.pendingInbox,
    });
    
    try {
      // Process outbox (local -> remote)
      await this.processOutbox();
      
      // Process inbox (remote -> local)
      await this.processInbox();
      
      // Update status
      this.status.lastSyncAt = new Date();
      this.status.lastError = null;
      
      this.eventBus.emit(EventType.SYNC_COMPLETED, {
        syncedOutbox: this.status.pendingOutbox,
        syncedInbox: this.status.pendingInbox,
      });
      
    } catch (error) {
      this.status.lastError = String(error);
      
      this.eventBus.emit(EventType.SYNC_FAILED, {
        error: String(error),
      });
      
    } finally {
      this.isProcessing = false;
      this.status.isSyncing = false;
    }
  }
  
  /**
   * Process outbox - send local events to remote
   */
  private async processOutbox(): Promise<void> {
    const items = await this.localStore.getPendingOutbox(this.config.batchSize);
    this.status.pendingOutbox = items.length;
    
    if (items.length === 0) return;
    
    // Group by idempotency key for batch sending
    const batches = this.groupByIdempotency(items);
    
    for (const batch of batches) {
      try {
        await this.sendBatch(batch);
        
        // Mark as sent
        for (const item of batch) {
          await this.localStore.updateOutboxStatus(item.eventId, 'sent');
        }
        
      } catch (error) {
        // Mark as failed with retry
        for (const item of batch) {
          await this.localStore.updateOutboxStatus(
            item.eventId, 
            'failed',
            String(error)
          );
        }
        this.status.failedEvents += batch.length;
      }
    }
  }
  
  /**
   * Process inbox - apply remote events locally
   */
  private async processInbox(): Promise<void> {
    // Fetch remote events
    const remoteEvents = await this.fetchRemoteEvents();
    
    if (remoteEvents.length === 0) return;
    
    // Add to inbox
    for (const event of remoteEvents) {
      await this.localStore.addToInbox(event);
    }
    
    // Process inbox items
    const result = await this.localStore.processInbox(async (event) => {
      await this.applyRemoteEvent(event);
    });
    
    this.status.pendingInbox = result.failed;
  }
  
  /**
   * Apply remote event with conflict detection
   */
  private async applyRemoteEvent(remoteEvent: Event): Promise<void> {
    // Check for conflicts
    const localEvents = await this.localStore.getEvents(
      remoteEvent.operationId!,
      remoteEvent.timestamp - 1000 // Check events within 1 second
    );
    
    const conflicts = localEvents.filter(local => 
      this.isConflict(local, remoteEvent)
    );
    
    if (conflicts.length > 0) {
      for (const localEvent of conflicts) {
        await this.resolveConflict(localEvent, remoteEvent);
      }
    } else {
      // No conflict, apply directly
      await this.applyEvent(remoteEvent);
    }
  }
  
  /**
   * Check if two events conflict
   */
  private isConflict(local: Event, remote: Event): boolean {
    // Same entity, different actors, overlapping time
    if (local.actorId === remote.actorId) return false;
    
    // Check by event type and entity
    if (local.type === remote.type) {
      // Check if they affect the same entity
      if (local.type.startsWith('roster.') && 
          local.payload.personId === remote.payload.personId) {
        return true;
      }
      
      if (local.type.startsWith('geography.') && 
          local.payload.countyId === remote.payload.countyId) {
        return true;
      }
      
      if (local.type.startsWith('iap.') && 
          local.payload.section === remote.payload.section) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Resolve conflict between local and remote events
   */
  private async resolveConflict(
    local: Event, 
    remote: Event
  ): Promise<void> {
    const policy = this.conflictPolicies.get(local.type as EventType);
    
    if (!policy) {
      // Default to last-write-wins
      if (remote.timestamp > local.timestamp) {
        await this.applyEvent(remote);
      }
      return;
    }
    
    let resolved: Event | null = null;
    
    switch (policy.resolution) {
      case ConflictResolution.LAST_WRITE_WINS:
        resolved = remote.timestamp > local.timestamp ? remote : local;
        break;
        
      case ConflictResolution.FIRST_WRITE_WINS:
        resolved = local.timestamp < remote.timestamp ? local : remote;
        break;
        
      case ConflictResolution.CRDT_MERGE:
        resolved = await this.mergeCRDT(local, remote);
        break;
        
      case ConflictResolution.DOMAIN_SPECIFIC:
        if (policy.mergeFunction) {
          resolved = policy.mergeFunction(local, remote);
        }
        break;
        
      case ConflictResolution.MANUAL:
        // Emit for user resolution
        this.eventBus.emit(EventType.CONFLICT_DETECTED, {
          local,
          remote,
          type: local.type,
        });
        return;
    }
    
    if (resolved) {
      await this.applyEvent(resolved);
      
      this.eventBus.emit(EventType.CONFLICT_RESOLVED, {
        local,
        remote,
        resolved,
        resolution: policy.resolution,
      });
    }
  }
  
  /**
   * Merge events using CRDT logic
   */
  private async mergeCRDT(local: Event, remote: Event): Promise<Event> {
    // Handle different CRDT types
    if (local.type === EventType.MEALS_SERVED_INCREMENT) {
      // G-Counter: sum the increments
      return {
        ...remote,
        payload: {
          ...remote.payload,
          count: local.payload.count + remote.payload.count,
        },
      };
    }
    
    if (local.type === EventType.COUNTY_ADDED || 
        local.type === EventType.COUNTY_REMOVED) {
      // OR-Set: union of additions
      return remote; // Simplified - in practice, track add/remove pairs
    }
    
    // Default to remote
    return remote;
  }
  
  /**
   * Apply event to local projections
   */
  private async applyEvent(event: Event): Promise<void> {
    // This will be handled by the projection system
    await this.localStore.appendEvent(event);
  }
  
  /**
   * Group outbox items by idempotency key
   */
  private groupByIdempotency(items: OutboxItem[]): OutboxItem[][] {
    const groups: Map<string, OutboxItem[]> = new Map();
    
    items.forEach(item => {
      // Group by correlation ID for related events
      const key = item.event.correlationId || item.event.id;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });
    
    return Array.from(groups.values());
  }
  
  /**
   * Send batch to remote (placeholder - implement with Supabase)
   */
  private async sendBatch(batch: OutboxItem[]): Promise<void> {
    if (!this.config.remoteEndpoint) {
      console.log('Would send batch:', batch.length, 'events');
      return;
    }
    
    // TODO: Implement with Supabase Edge Function
    const response = await fetch(this.config.remoteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Idempotency-Key': batch[0].event.correlationId || batch[0].event.id,
      },
      body: JSON.stringify({
        events: batch.map(item => item.event),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }
  
  /**
   * Fetch remote events (placeholder - implement with Supabase)
   */
  private async fetchRemoteEvents(): Promise<Event[]> {
    if (!this.config.remoteEndpoint) {
      return [];
    }
    
    // TODO: Implement with Supabase Realtime or polling
    const response = await fetch(
      `${this.config.remoteEndpoint}?since=${this.status.lastSyncAt?.getTime() || 0}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.events || [];
  }
  
  /**
   * Setup network listeners
   */
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;
    
    this.status.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      this.status.isOnline = true;
      console.log('SyncEngine: Online');
      this.sync();
    });
    
    window.addEventListener('offline', () => {
      this.status.isOnline = false;
      console.log('SyncEngine: Offline');
    });
  }
  
  /**
   * Get sync status
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }
}