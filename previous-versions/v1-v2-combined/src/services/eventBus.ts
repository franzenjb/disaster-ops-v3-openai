/**
 * Event Bus Service
 * Central event system for cross-component communication
 */

export enum EventType {
  // Operation Events
  OPERATION_STARTED = 'operation:started',
  OPERATION_ENDED = 'operation:ended',
  
  // Service Line Events
  SERVICE_LINE_UPDATED = 'service_line:updated',
  SERVICE_LINE_SAVED = 'service_line:saved',
  
  // County Events
  COUNTY_SELECTED = 'county:selected',
  COUNTY_DESELECTED = 'county:deselected',
  
  // IAP Events
  IAP_UPDATED = 'iap:updated',
  IAP_VERSION_CREATED = 'iap:version_created',
  
  // System Events
  DATA_SAVED = 'data:saved',
  DATA_LOADED = 'data:loaded',
  ERROR_OCCURRED = 'error:occurred'
}

export interface EventPayload {
  type?: EventType;
  data?: any;
  timestamp?: number;
  userId?: string;
  [key: string]: any;
}

class EventBus {
  private events: { [key: string]: Array<(data: EventPayload) => void> } = {};
  
  emit(event: EventType | string, data?: EventPayload | any) {
    const payload: EventPayload = {
      type: event as EventType,
      data,
      timestamp: Date.now()
    };
    
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
    
    // Log significant events
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EventBus] ${event}`, payload);
    }
  }
  
  on(event: EventType | string, callback: (data: EventPayload) => void) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }
  
  off(event: EventType | string, callback: (data: EventPayload) => void) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
  
  once(event: EventType | string, callback: (data: EventPayload) => void) {
    const onceWrapper = (data: EventPayload) => {
      callback(data);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }
  
  clear(event?: EventType | string) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Export singleton instance
export const eventBus = new EventBus();