/**
 * Projection System
 * 
 * Builds and maintains read models (entities) from the event stream
 */

import { Event, EventType } from '../events/types';
import { Operation, County, RosterEntry, IAPDocument } from '@/types';
import { getLocalStore } from '../store/LocalStore';

export type ProjectionHandler<T> = (state: T, event: Event) => T;

export interface Projection<T> {
  name: string;
  initialState: T;
  handlers: Map<EventType, ProjectionHandler<T>>;
}

/**
 * Base Projector class
 */
export abstract class Projector<T> {
  protected projection: Projection<T>;
  protected state: T;
  protected localStore = getLocalStore();
  
  constructor(projection: Projection<T>) {
    this.projection = projection;
    this.state = projection.initialState;
  }
  
  /**
   * Apply a single event to the projection
   */
  apply(event: Event): T {
    const handler = this.projection.handlers.get(event.type as EventType);
    if (handler) {
      this.state = handler(this.state, event);
    }
    return this.state;
  }
  
  /**
   * Rebuild projection from events
   */
  async rebuild(operationId: string, since?: number): Promise<T> {
    const events = await this.localStore.getEvents(operationId, since);
    
    // Start from initial state or snapshot
    const snapshot = await this.localStore.getLatestSnapshot(operationId);
    if (snapshot && (!since || snapshot.timestamp > since)) {
      this.state = snapshot.data;
      // Only replay events after snapshot
      const eventsAfterSnapshot = events.filter(e => e.timestamp > snapshot.timestamp);
      for (const event of eventsAfterSnapshot) {
        this.apply(event);
      }
    } else {
      // Rebuild from scratch
      this.state = this.projection.initialState;
      for (const event of events) {
        this.apply(event);
      }
    }
    
    return this.state;
  }
  
  /**
   * Get current state
   */
  getState(): T {
    return this.state;
  }
  
  /**
   * Create a snapshot of current state
   */
  async snapshot(operationId: string): Promise<void> {
    await this.localStore.createSnapshot(
      operationId,
      'full',
      this.state
    );
  }
}

/**
 * Operation Projection
 */
export class OperationProjector extends Projector<Operation | null> {
  constructor() {
    super({
      name: 'operation',
      initialState: null,
      handlers: new Map([
        [EventType.OPERATION_CREATED, (state, event) => {
          return {
            id: event.operationId!,
            operationNumber: event.payload.operationNumber,
            operationName: event.payload.operationName,
            disasterType: event.payload.disasterType,
            drNumber: event.payload.drNumber,
            status: 'active',
            activationLevel: event.payload.activationLevel,
            createdAt: new Date(event.timestamp),
            createdBy: event.actorId,
            geography: {
              regions: [],
              states: [],
              counties: [],
              chapters: [],
            },
            metadata: {
              serviceLinesActivated: [],
            },
          } as Operation;
        }],
        
        [EventType.OPERATION_UPDATED, (state, event) => {
          if (!state) return state;
          return {
            ...state,
            ...event.payload,
          };
        }],
        
        [EventType.OPERATION_CLOSED, (state, event) => {
          if (!state) return state;
          return {
            ...state,
            status: 'closed' as const,
            closedAt: new Date(event.timestamp),
            closedBy: event.actorId,
          };
        }],
        
        [EventType.REGION_SELECTED, (state, event) => {
          if (!state) return state;
          return {
            ...state,
            geography: {
              ...state.geography,
              regions: [...state.geography.regions, event.payload.regionName],
            },
          };
        }],
        
        [EventType.COUNTY_ADDED, (state, event) => {
          if (!state) return state;
          const county: County = {
            id: event.payload.countyId,
            name: event.payload.countyName,
            state: event.payload.state,
            fips: event.payload.fips,
          };
          return {
            ...state,
            geography: {
              ...state.geography,
              counties: [...state.geography.counties, county],
              states: [...new Set([...state.geography.states, county.state])],
            },
          };
        }],
        
        [EventType.COUNTY_REMOVED, (state, event) => {
          if (!state) return state;
          return {
            ...state,
            geography: {
              ...state.geography,
              counties: state.geography.counties.filter(c => c.id !== event.payload.countyId),
            },
          };
        }],
      ]),
    });
  }
}

/**
 * Roster Projection
 */
export class RosterProjector extends Projector<RosterEntry[]> {
  constructor() {
    super({
      name: 'roster',
      initialState: [],
      handlers: new Map([
        [EventType.PERSON_ASSIGNED, (state, event) => {
          const entry: RosterEntry = {
            id: `${event.payload.personId}-${event.timestamp}`,
            operationId: event.operationId!,
            personId: event.payload.personId,
            person: event.payload.person, // Would be fetched from person service
            position: event.payload.position,
            section: event.payload.section,
            startDate: new Date(event.payload.startDate),
            status: 'active',
            reportingTo: event.payload.reportingTo,
          };
          return [...state, entry];
        }],
        
        [EventType.PERSON_UNASSIGNED, (state, event) => {
          return state.map(entry => {
            if (entry.personId === event.payload.personId) {
              return {
                ...entry,
                status: 'released' as const,
                endDate: new Date(event.timestamp),
              };
            }
            return entry;
          });
        }],
        
        [EventType.POSITION_CHANGED, (state, event) => {
          return state.map(entry => {
            if (entry.personId === event.payload.personId) {
              return {
                ...entry,
                position: event.payload.newPosition,
                section: event.payload.newSection,
              };
            }
            return entry;
          });
        }],
      ]),
    });
  }
}

/**
 * IAP Projection
 */
export class IAPProjector extends Projector<IAPDocument | null> {
  constructor() {
    super({
      name: 'iap',
      initialState: null,
      handlers: new Map([
        [EventType.IAP_CREATED, (state, event) => {
          return {
            id: event.payload.iapId,
            operationId: event.operationId!,
            iapNumber: event.payload.iapNumber,
            operationalPeriod: event.payload.operationalPeriod,
            status: 'draft' as const,
            createdAt: new Date(event.timestamp),
            createdBy: event.actorId,
            sections: event.payload.sections || {},
            version: 1,
          } as IAPDocument;
        }],
        
        [EventType.IAP_SECTION_UPDATED, (state, event) => {
          if (!state) return state;
          return {
            ...state,
            sections: {
              ...state.sections,
              [event.payload.section]: event.payload.content,
            },
          };
        }],
        
        [EventType.IAP_PUBLISHED, (state, event) => {
          if (!state) return state;
          return {
            ...state,
            status: 'published' as const,
            publishedAt: new Date(event.timestamp),
            publishedBy: event.actorId,
          };
        }],
        
        [EventType.IAP_VERSION_CREATED, (state, event) => {
          if (!state) return state;
          return {
            ...state,
            version: state.version + 1,
          };
        }],
      ]),
    });
  }
}

/**
 * Metrics Projection with CRDT support
 */
export class MetricsProjector extends Projector<Map<string, number>> {
  constructor() {
    super({
      name: 'metrics',
      initialState: new Map(),
      handlers: new Map([
        [EventType.MEALS_SERVED_INCREMENT, (state, event) => {
          const key = `meals-${event.payload.date}-${event.payload.location}`;
          const current = state.get(key) || 0;
          state.set(key, current + event.payload.count);
          return new Map(state);
        }],
        
        [EventType.SHELTERED_COUNT_SET, (state, event) => {
          const key = `sheltered-${event.payload.date}-${event.payload.location}`;
          // LWW for set operations
          state.set(key, event.payload.count);
          return new Map(state);
        }],
        
        [EventType.SUPPLIES_DISTRIBUTED_ADD, (state, event) => {
          const key = `supplies-${event.payload.itemType}-${event.payload.date}`;
          const current = state.get(key) || 0;
          state.set(key, current + event.payload.quantity);
          return new Map(state);
        }],
      ]),
    });
  }
  
  /**
   * Get aggregated metrics
   */
  getAggregated(prefix: string): number {
    let total = 0;
    for (const [key, value] of this.state.entries()) {
      if (key.startsWith(prefix)) {
        total += value;
      }
    }
    return total;
  }
}

/**
 * Projection Manager coordinates all projections
 */
export class ProjectionManager {
  private static instance: ProjectionManager;
  private projectors: Map<string, Projector<any>>;
  
  private constructor() {
    this.projectors = new Map<string, any>();
    this.projectors.set('operation', new OperationProjector());
    this.projectors.set('roster', new RosterProjector());
    this.projectors.set('iap', new IAPProjector());
    this.projectors.set('metrics', new MetricsProjector());
  }
  
  static getInstance(): ProjectionManager {
    if (!ProjectionManager.instance) {
      ProjectionManager.instance = new ProjectionManager();
    }
    return ProjectionManager.instance;
  }
  
  /**
   * Apply event to all projections
   */
  applyEvent(event: Event): void {
    for (const projector of this.projectors.values()) {
      projector.apply(event);
    }
  }
  
  /**
   * Rebuild all projections for an operation
   */
  async rebuildAll(operationId: string): Promise<void> {
    const promises = Array.from(this.projectors.values()).map(projector =>
      projector.rebuild(operationId)
    );
    await Promise.all(promises);
  }
  
  /**
   * Get a specific projection
   */
  getProjection<T>(name: string): T | null {
    const projector = this.projectors.get(name);
    return projector ? projector.getState() : null;
  }
  
  /**
   * Get operation projection
   */
  getOperation(): Operation | null {
    return this.getProjection<Operation>('operation');
  }
  
  /**
   * Get roster projection
   */
  getRoster(): RosterEntry[] {
    return this.getProjection<RosterEntry[]>('roster') || [];
  }
  
  /**
   * Get IAP projection
   */
  getIAP(): IAPDocument | null {
    return this.getProjection<IAPDocument>('iap');
  }
  
  /**
   * Get metrics projection
   */
  getMetrics(): Map<string, number> {
    return this.getProjection<Map<string, number>>('metrics') || new Map();
  }
  
  /**
   * Create snapshots for all projections
   */
  async snapshotAll(operationId: string): Promise<void> {
    const promises = Array.from(this.projectors.values()).map(projector =>
      projector.snapshot(operationId)
    );
    await Promise.all(promises);
  }
}

// Export singleton
export const projectionManager = ProjectionManager.getInstance();