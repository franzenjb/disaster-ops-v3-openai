/**
 * Event-Driven Architecture for Disaster Operations
 * 
 * This EventBus ensures every change is tracked, reversible, and syncable.
 * Critical for multi-user collaboration and offline capability.
 */

export enum EventType {
  // Operation lifecycle
  OPERATION_CREATED = 'operation.created',
  OPERATION_UPDATED = 'operation.updated',
  OPERATION_CLOSED = 'operation.closed',
  
  // Geographic changes
  COUNTY_ADDED = 'county.added',
  COUNTY_REMOVED = 'county.removed',
  REGION_CHANGED = 'region.changed',
  
  // Service line updates
  FEEDING_DATA_ENTERED = 'feeding.entered',
  SHELTER_OPENED = 'shelter.opened',
  SHELTER_CLOSED = 'shelter.closed',
  SERVICE_LINE_UPDATED = 'service.line.updated',
  
  // IAP edits
  IAP_SECTION_EDITED = 'iap.section.edited',
  IAP_SECTION_LOCKED = 'iap.section.locked',
  IAP_SECTION_UNLOCKED = 'iap.section.unlocked',
  IAP_PUBLISHED = 'iap.published',
  
  // Collaboration
  USER_JOINED = 'user.joined',
  USER_LEFT = 'user.left',
  USER_EDITING = 'user.editing',
  
  // Sync events
  SYNC_STARTED = 'sync.started',
  SYNC_COMPLETED = 'sync.completed',
  SYNC_FAILED = 'sync.failed',
  OFFLINE_MODE = 'offline.mode',
  ONLINE_MODE = 'online.mode'
}

export interface OperationEvent<T = any> {
  id: string;
  type: EventType;
  timestamp: number;
  userId: string;
  sessionId: string;
  payload: T;
  metadata?: {
    deviceId?: string;
    location?: { lat: number; lng: number };
    networkType?: 'wifi' | '4g' | '3g' | 'offline';
  };
  reversible: boolean;
  reverseAction?: () => void;
}

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<EventType, Set<EventHandler>>;
  private eventQueue: OperationEvent[];
  private maxQueueSize = 10000;
  private isOnline = true;
  
  private constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.setupNetworkListeners();
    this.startQueueProcessor();
  }
  
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  /**
   * Emit an event - this is how all changes happen
   */
  emit<T = any>(type: EventType, payload: T, reversible = true): string {
    const event: OperationEvent<T> = {
      id: this.generateEventId(),
      type,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      payload,
      reversible,
      metadata: this.gatherMetadata()
    };
    
    // Add to queue for persistence/sync
    this.queueEvent(event);
    
    // Notify all listeners immediately (optimistic update)
    this.notifyListeners(event);
    
    // Track for undo/redo
    if (reversible) {
      this.addToHistory(event);
    }
    
    return event.id;
  }
  
  /**
   * Subscribe to events
   */
  on(type: EventType, handler: EventHandler): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(handler);
    };
  }
  
  /**
   * Subscribe to multiple events
   */
  onMany(types: EventType[], handler: EventHandler): () => void {
    const unsubscribers = types.map(type => this.on(type, handler));
    return () => unsubscribers.forEach(unsub => unsub());
  }
  
  /**
   * Unsubscribe from events (alias for removeListener functionality)
   */
  off(type: EventType, handler: EventHandler): void {
    this.listeners.get(type)?.delete(handler);
  }
  
  /**
   * Wait for an event (Promise-based)
   */
  once(type: EventType): Promise<OperationEvent> {
    return new Promise(resolve => {
      const unsubscribe = this.on(type, (event) => {
        unsubscribe();
        resolve(event);
      });
    });
  }
  
  /**
   * Get all queued events (for sync)
   */
  getQueuedEvents(): OperationEvent[] {
    return [...this.eventQueue];
  }
  
  /**
   * Clear events after successful sync
   */
  clearQueue(upToTimestamp: number): void {
    this.eventQueue = this.eventQueue.filter(e => e.timestamp > upToTimestamp);
  }
  
  private notifyListeners(event: OperationEvent): void {
    const handlers = this.listeners.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
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
      this.eventQueue.shift();
    }
    
    // Persist to localStorage immediately
    this.persistQueue();
  }
  
  private persistQueue(): void {
    try {
      localStorage.setItem('event_queue', JSON.stringify(this.eventQueue));
    } catch (e) {
      // Handle quota exceeded
      console.warn('Failed to persist event queue:', e);
      this.eventQueue = this.eventQueue.slice(-1000); // Keep last 1000
    }
  }
  
  private loadQueue(): void {
    try {
      const saved = localStorage.getItem('event_queue');
      if (saved) {
        this.eventQueue = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load event queue:', e);
      this.eventQueue = [];
    }
  }
  
  private setupNetworkListeners(): void {
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
  
  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.eventQueue.length === 0) return;
    
    // This will be implemented when we add backend
    // For now, just mark as processed
    console.log(`Processing ${this.eventQueue.length} queued events`);
  }
  
  private startQueueProcessor(): void {
    // Process queue every 30 seconds if online
    setInterval(() => {
      if (this.isOnline) {
        this.processQueue();
      }
    }, 30000);
  }
  
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getCurrentUserId(): string {
    // Will be replaced with real auth
    return localStorage.getItem('userId') || 'anonymous';
  }
  
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = this.generateEventId();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
  
  private gatherMetadata(): OperationEvent['metadata'] {
    return {
      deviceId: this.getDeviceId(),
      networkType: this.getNetworkType()
    };
  }
  
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = this.generateEventId();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }
  
  private getNetworkType(): 'wifi' | '4g' | '3g' | 'offline' {
    if (!this.isOnline) return 'offline';
    // @ts-ignore - Navigator.connection is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection?.effectiveType) {
      return connection.effectiveType as any;
    }
    return 'wifi';
  }
  
  // Undo/Redo support
  private historyStack: OperationEvent[] = [];
  private redoStack: OperationEvent[] = [];
  
  private addToHistory(event: OperationEvent): void {
    this.historyStack.push(event);
    this.redoStack = []; // Clear redo stack on new action
    
    // Limit history size
    if (this.historyStack.length > 100) {
      this.historyStack.shift();
    }
  }
  
  undo(): void {
    const event = this.historyStack.pop();
    if (event && event.reverseAction) {
      event.reverseAction();
      this.redoStack.push(event);
    }
  }
  
  redo(): void {
    const event = this.redoStack.pop();
    if (event) {
      this.emit(event.type, event.payload, event.reversible);
      this.historyStack.push(event);
    }
  }
}

export type EventHandler = (event: OperationEvent) => void;

// Singleton export
export const eventBus = EventBus.getInstance();