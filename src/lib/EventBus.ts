/**
 * Event-Driven Architecture for Disaster Operations
 * 
 * This EventBus is the heart of the system - ensuring every change is tracked,
 * reversible, and syncable. Critical for multi-user collaboration and offline capability.
 */

export enum EventType {
  // Operation lifecycle
  OPERATION_CREATED = 'operation.created',
  OPERATION_UPDATED = 'operation.updated',
  OPERATION_CLOSED = 'operation.closed',
  OPERATION_SELECTED = 'operation.selected',
  
  // Setup wizard
  SETUP_STEP_COMPLETED = 'setup.step.completed',
  SETUP_COMPLETED = 'setup.completed',
  SETUP_CANCELLED = 'setup.cancelled',
  
  // Geographic changes
  REGION_SELECTED = 'region.selected',
  COUNTY_ADDED = 'county.added',
  COUNTY_REMOVED = 'county.removed',
  CHAPTERS_UPDATED = 'chapters.updated',
  
  // Roster management
  PERSON_ADDED = 'person.added',
  PERSON_UPDATED = 'person.updated',
  PERSON_REMOVED = 'person.removed',
  ASSIGNMENT_CHANGED = 'assignment.changed',
  
  // IAP edits
  IAP_CREATED = 'iap.created',
  IAP_SECTION_EDITED = 'iap.section.edited',
  IAP_PUBLISHED = 'iap.published',
  IAP_ARCHIVED = 'iap.archived',
  
  // Collaboration
  USER_JOINED = 'user.joined',
  USER_LEFT = 'user.left',
  USER_EDITING = 'user.editing',
  USER_IDLE = 'user.idle',
  
  // Sync events
  SYNC_STARTED = 'sync.started',
  SYNC_PROGRESS = 'sync.progress',
  SYNC_COMPLETED = 'sync.completed',
  SYNC_FAILED = 'sync.failed',
  SYNC_CONFLICT = 'sync.conflict',
  
  // Network status
  ONLINE_MODE = 'online.mode',
  OFFLINE_MODE = 'offline.mode',
  CONNECTION_RESTORED = 'connection.restored',
  
  // Data events
  DATA_IMPORTED = 'data.imported',
  DATA_EXPORTED = 'data.exported',
  BACKUP_CREATED = 'backup.created'
}

export interface EventMetadata {
  deviceId: string;
  location?: { lat: number; lng: number };
  networkType: 'wifi' | '4g' | '3g' | 'offline';
  userAgent: string;
  sessionDuration: number;
}

export interface OperationEvent<T = any> {
  id: string;
  type: EventType;
  timestamp: number;
  userId: string;
  userName?: string;
  sessionId: string;
  operationId?: string;
  payload: T;
  metadata: EventMetadata;
  reversible: boolean;
  reverseAction?: () => void | Promise<void>;
  syncStatus: 'pending' | 'synced' | 'failed';
  retryCount: number;
}

export type EventHandler<T = any> = (event: OperationEvent<T>) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe: () => void;
}

class EventBus {
  private static instance: EventBus;
  private listeners: Map<EventType, Set<EventHandler>>;
  private eventQueue: OperationEvent[];
  private historyStack: OperationEvent[];
  private redoStack: OperationEvent[];
  private maxQueueSize = 10000;
  private maxHistorySize = 100;
  private isOnline = true;
  private sessionId: string;
  private userId: string;
  private deviceId: string;
  private sessionStartTime: number;
  
  private constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.historyStack = [];
    this.redoStack = [];
    this.sessionId = this.generateSessionId();
    this.userId = this.getCurrentUserId();
    this.deviceId = this.getDeviceId();
    this.sessionStartTime = Date.now();
    
    this.setupNetworkListeners();
    this.loadPersistedQueue();
    this.startQueueProcessor();
  }
  
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  /**
   * Emit an event - this is how all changes happen in the system
   */
  emit<T = any>(
    type: EventType, 
    payload: T, 
    options: {
      reversible?: boolean;
      reverseAction?: () => void | Promise<void>;
      operationId?: string;
    } = {}
  ): string {
    const event: OperationEvent<T> = {
      id: this.generateEventId(),
      type,
      timestamp: Date.now(),
      userId: this.userId,
      userName: this.getUserName(),
      sessionId: this.sessionId,
      operationId: options.operationId,
      payload,
      metadata: this.gatherMetadata(),
      reversible: options.reversible ?? true,
      reverseAction: options.reverseAction,
      syncStatus: 'pending',
      retryCount: 0
    };
    
    // Add to queue for persistence/sync
    this.queueEvent(event);
    
    // Notify all listeners immediately (optimistic update)
    this.notifyListeners(event);
    
    // Track for undo/redo if reversible
    if (event.reversible) {
      this.addToHistory(event);
    }
    
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EventBus] ${type}`, payload);
    }
    
    return event.id;
  }
  
  /**
   * Subscribe to events
   */
  on<T = any>(type: EventType, handler: EventHandler<T>): EventSubscription {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)!.add(handler);
    
    // Return subscription object
    return {
      unsubscribe: () => {
        this.listeners.get(type)?.delete(handler);
      }
    };
  }
  
  /**
   * Subscribe to multiple event types
   */
  onMany<T = any>(types: EventType[], handler: EventHandler<T>): EventSubscription {
    const subscriptions = types.map(type => this.on(type, handler));
    
    return {
      unsubscribe: () => {
        subscriptions.forEach(sub => sub.unsubscribe());
      }
    };
  }
  
  /**
   * Unsubscribe from events
   */
  off<T = any>(type: EventType, handler: EventHandler<T>): void {
    this.listeners.get(type)?.delete(handler);
  }
  
  /**
   * Wait for an event (Promise-based)
   */
  once<T = any>(type: EventType): Promise<OperationEvent<T>> {
    return new Promise(resolve => {
      const subscription = this.on<T>(type, (event) => {
        subscription.unsubscribe();
        resolve(event);
      });
    });
  }
  
  /**
   * Emit and wait for response
   */
  async request<T = any, R = any>(
    type: EventType,
    payload: T,
    responseType: EventType,
    timeout = 5000
  ): Promise<R> {
    const requestId = this.emit(type, payload);
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timeout for ${type}`));
      }, timeout);
      
      const subscription = this.on(responseType, (event: OperationEvent<R>) => {
        // Check if this response is for our request
        if (event.payload && (event.payload as any).requestId === requestId) {
          clearTimeout(timer);
          subscription.unsubscribe();
          resolve(event.payload);
        }
      });
    });
  }
  
  /**
   * Get all queued events (for sync)
   */
  getQueuedEvents(): OperationEvent[] {
    return [...this.eventQueue.filter(e => e.syncStatus === 'pending')];
  }
  
  /**
   * Mark events as synced
   */
  markSynced(eventIds: string[]): void {
    this.eventQueue.forEach(event => {
      if (eventIds.includes(event.id)) {
        event.syncStatus = 'synced';
      }
    });
    this.persistQueue();
  }
  
  /**
   * Clear synced events from queue
   */
  clearSyncedEvents(): void {
    this.eventQueue = this.eventQueue.filter(e => e.syncStatus !== 'synced');
    this.persistQueue();
  }
  
  /**
   * Undo last reversible action
   */
  async undo(): Promise<void> {
    const event = this.historyStack.pop();
    if (event && event.reverseAction) {
      await event.reverseAction();
      this.redoStack.push(event);
      this.emit(EventType.OPERATION_UPDATED, {
        action: 'undo',
        eventId: event.id
      });
    }
  }
  
  /**
   * Redo previously undone action
   */
  async redo(): Promise<void> {
    const event = this.redoStack.pop();
    if (event) {
      this.emit(event.type, event.payload, {
        reversible: event.reversible,
        reverseAction: event.reverseAction
      });
    }
  }
  
  /**
   * Get undo/redo status
   */
  getUndoRedoStatus(): { canUndo: boolean; canRedo: boolean } {
    return {
      canUndo: this.historyStack.length > 0,
      canRedo: this.redoStack.length > 0
    };
  }
  
  private notifyListeners(event: OperationEvent): void {
    const handlers = this.listeners.get(event.type);
    if (handlers) {
      handlers.forEach(async handler => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Handler error for ${event.type}:`, error);
        }
      });
    }
  }
  
  private queueEvent(event: OperationEvent): void {
    this.eventQueue.push(event);
    
    // Prevent memory overflow
    if (this.eventQueue.length > this.maxQueueSize) {
      // Remove oldest synced events first
      const syncedEvents = this.eventQueue.filter(e => e.syncStatus === 'synced');
      if (syncedEvents.length > 0) {
        this.eventQueue = this.eventQueue.filter(e => e.syncStatus !== 'synced');
      } else {
        // If no synced events, remove oldest
        this.eventQueue.shift();
      }
    }
    
    this.persistQueue();
  }
  
  private persistQueue(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('disaster_ops_event_queue', JSON.stringify(this.eventQueue));
      }
    } catch (e) {
      console.warn('Failed to persist event queue:', e);
      // If quota exceeded, keep only last 1000 events
      this.eventQueue = this.eventQueue.slice(-1000);
    }
  }
  
  private loadPersistedQueue(): void {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('disaster_ops_event_queue');
        if (saved) {
          this.eventQueue = JSON.parse(saved);
        }
      }
    } catch (e) {
      console.warn('Failed to load event queue:', e);
      this.eventQueue = [];
    }
  }
  
  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.emit(EventType.ONLINE_MODE, { timestamp: Date.now() });
        this.processQueue();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.emit(EventType.OFFLINE_MODE, { timestamp: Date.now() });
      });
    }
  }
  
  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.eventQueue.length === 0) return;
    
    const pendingEvents = this.getQueuedEvents();
    if (pendingEvents.length === 0) return;
    
    this.emit(EventType.SYNC_STARTED, { 
      eventCount: pendingEvents.length 
    });
    
    // This will be implemented when we add the sync service
    console.log(`Processing ${pendingEvents.length} queued events`);
    
    // For now, mark all as synced in development
    if (process.env.NODE_ENV === 'development') {
      this.markSynced(pendingEvents.map(e => e.id));
      this.emit(EventType.SYNC_COMPLETED, {
        syncedCount: pendingEvents.length
      });
    }
  }
  
  private startQueueProcessor(): void {
    // Process queue every 30 seconds if online
    setInterval(() => {
      if (this.isOnline) {
        this.processQueue();
      }
    }, 30000);
  }
  
  private addToHistory(event: OperationEvent): void {
    this.historyStack.push(event);
    this.redoStack = []; // Clear redo stack on new action
    
    // Limit history size
    if (this.historyStack.length > this.maxHistorySize) {
      this.historyStack.shift();
    }
  }
  
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('disaster_ops_session_id');
      if (!sessionId) {
        sessionId = this.generateEventId();
        sessionStorage.setItem('disaster_ops_session_id', sessionId);
      }
      return sessionId;
    }
    return this.generateEventId();
  }
  
  private getCurrentUserId(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('disaster_ops_user_id') || 'anonymous';
    }
    return 'anonymous';
  }
  
  private getUserName(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('disaster_ops_user_name') || 'Anonymous User';
    }
    return 'Anonymous User';
  }
  
  private getDeviceId(): string {
    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem('disaster_ops_device_id');
      if (!deviceId) {
        deviceId = this.generateEventId();
        localStorage.setItem('disaster_ops_device_id', deviceId);
      }
      return deviceId;
    }
    return this.generateEventId();
  }
  
  private gatherMetadata(): EventMetadata {
    return {
      deviceId: this.deviceId,
      networkType: this.getNetworkType(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      sessionDuration: Date.now() - this.sessionStartTime
    };
  }
  
  private getNetworkType(): 'wifi' | '4g' | '3g' | 'offline' {
    if (!this.isOnline) return 'offline';
    if (typeof navigator !== 'undefined') {
      // @ts-ignore - Navigator.connection is experimental
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection?.effectiveType) {
        return connection.effectiveType as any;
      }
    }
    return 'wifi';
  }
}

// Singleton export
export const eventBus = EventBus.getInstance();