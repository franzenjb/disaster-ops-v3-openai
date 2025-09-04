/**
 * Simplified EventBus for publish/subscribe
 * 
 * Focuses on event distribution, not storage (that's LocalStore's job)
 */

import { Event, EventType, createEvent } from '../events/types';
import { getLocalStore } from '../store/LocalStore';

export type EventHandler = (event: Event) => void | Promise<void>;
export type Unsubscribe = () => void;

export class EventBus {
  private static instance: EventBus;
  private handlers: Map<EventType, Set<EventHandler>>;
  private wildcardHandlers: Set<EventHandler>;
  private localStore = getLocalStore();
  
  private constructor() {
    this.handlers = new Map();
    this.wildcardHandlers = new Set();
  }
  
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  /**
   * Emit an event - creates event and stores it
   */
  async emit(
    type: EventType,
    payload: any,
    metadata: {
      operationId?: string;
      causationId?: string;
      correlationId?: string;
    } = {}
  ): Promise<string> {
    // Create the event
    const event = createEvent(type, payload, {
      actorId: this.getCurrentUserId(),
      ...metadata,
    });
    
    // Store in local event log
    await this.localStore.appendEvent(event);
    
    // Notify handlers
    await this.notify(event);
    
    return event.id;
  }
  
  /**
   * Subscribe to specific event type
   */
  on(type: EventType, handler: EventHandler): Unsubscribe {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    this.handlers.get(type)!.add(handler);
    
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }
  
  /**
   * Subscribe to all events
   */
  onAll(handler: EventHandler): Unsubscribe {
    this.wildcardHandlers.add(handler);
    
    return () => {
      this.wildcardHandlers.delete(handler);
    };
  }
  
  /**
   * Subscribe to multiple event types
   */
  onMany(types: EventType[], handler: EventHandler): Unsubscribe {
    const unsubscribes = types.map(type => this.on(type, handler));
    
    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }
  
  /**
   * Wait for next event of type
   */
  once(type: EventType): Promise<Event> {
    return new Promise(resolve => {
      const unsubscribe = this.on(type, (event) => {
        unsubscribe();
        resolve(event);
      });
    });
  }
  
  /**
   * Remove specific handler
   */
  off(type: EventType, handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }
  
  /**
   * Remove all handlers for a type
   */
  offAll(type?: EventType): void {
    if (type) {
      this.handlers.delete(type);
    } else {
      this.handlers.clear();
      this.wildcardHandlers.clear();
    }
  }
  
  /**
   * Notify handlers of an event
   */
  private async notify(event: Event): Promise<void> {
    // Notify specific handlers
    const typeHandlers = this.handlers.get(event.type as EventType);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Handler error for ${event.type}:`, error);
        }
      }
    }
    
    // Notify wildcard handlers
    for (const handler of this.wildcardHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Wildcard handler error:`, error);
      }
    }
  }
  
  /**
   * Replay events from a point in time
   */
  async replay(
    operationId: string,
    since?: number,
    handler?: EventHandler
  ): Promise<void> {
    const events = await this.localStore.getEvents(operationId, since);
    
    for (const event of events) {
      if (handler) {
        await handler(event);
      } else {
        await this.notify(event);
      }
    }
  }
  
  private getCurrentUserId(): string {
    if (typeof window === 'undefined') return 'system';
    return localStorage.getItem('disaster_ops_user_id') || 'anonymous';
  }
}

// Export singleton
export const eventBus = EventBus.getInstance();