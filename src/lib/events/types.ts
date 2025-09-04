/**
 * Core Event Types for Event Sourcing
 * 
 * This is the single source of truth - all state changes happen through events
 */

import { z } from 'zod';

// Base event schema with all required fields for proper event sourcing
export const EventSchema = z.object({
  // Identity
  id: z.string().uuid(),
  type: z.string(),
  schemaVersion: z.number(),
  
  // Actor & Context
  actorId: z.string(),
  deviceId: z.string(),
  sessionId: z.string(),
  operationId: z.string().optional(),
  
  // Time & Order
  timestamp: z.number(), // Unix timestamp
  sequence: z.number().optional(), // For ordering within same timestamp
  
  // Payload
  payload: z.any(),
  
  // Traceability
  causationId: z.string().uuid().optional(), // What caused this event
  correlationId: z.string().uuid().optional(), // Group related events
  
  // Integrity
  hash: z.string().optional(), // SHA-256 of canonical event representation
  previousHash: z.string().optional(), // For hash chain
  
  // Sync metadata
  syncStatus: z.enum(['local', 'pending', 'synced', 'failed']).default('local'),
  syncAttempts: z.number().default(0),
  syncError: z.string().optional(),
  
  // Versioning & Migration
  migratedFrom: z.number().optional(), // Original schema version if migrated
});

export type Event = z.infer<typeof EventSchema>;

// Event type enum for type safety
export enum EventType {
  // Operation lifecycle
  OPERATION_CREATED = 'operation.created',
  OPERATION_UPDATED = 'operation.updated',
  OPERATION_CLOSED = 'operation.closed',
  OPERATION_ARCHIVED = 'operation.archived',
  
  // Geographic events
  REGION_SELECTED = 'geography.region_selected',
  COUNTY_ADDED = 'geography.county_added',
  COUNTY_REMOVED = 'geography.county_removed',
  CHAPTERS_CALCULATED = 'geography.chapters_calculated',
  
  // Roster events
  PERSON_ASSIGNED = 'roster.person_assigned',
  PERSON_UNASSIGNED = 'roster.person_unassigned',
  POSITION_CHANGED = 'roster.position_changed',
  PERSON_IMPORTED = 'roster.person_imported',
  
  // IAP events
  IAP_CREATED = 'iap.created',
  IAP_SECTION_UPDATED = 'iap.section_updated',
  IAP_PUBLISHED = 'iap.published',
  IAP_ARCHIVED = 'iap.archived',
  IAP_VERSION_CREATED = 'iap.version_created',
  
  // Service metrics (CRDT-friendly)
  MEALS_SERVED_INCREMENT = 'metrics.meals_served.increment',
  SHELTERED_COUNT_SET = 'metrics.sheltered_count.set',
  SUPPLIES_DISTRIBUTED_ADD = 'metrics.supplies_distributed.add',
  
  // Collaboration
  USER_JOINED_OPERATION = 'collab.user_joined',
  USER_LEFT_OPERATION = 'collab.user_left',
  USER_STARTED_EDITING = 'collab.editing_started',
  USER_STOPPED_EDITING = 'collab.editing_stopped',
  
  // Sync & System
  SYNC_STARTED = 'system.sync_started',
  SYNC_COMPLETED = 'system.sync_completed',
  SYNC_FAILED = 'system.sync_failed',
  CONFLICT_DETECTED = 'system.conflict_detected',
  CONFLICT_RESOLVED = 'system.conflict_resolved',
  
  // Data management
  SNAPSHOT_CREATED = 'data.snapshot_created',
  MIGRATION_APPLIED = 'data.migration_applied',
  REDACTION_APPLIED = 'data.redaction_applied', // For PII removal
}

// Payload schemas for each event type
export const OperationCreatedPayload = z.object({
  operationNumber: z.string(),
  operationName: z.string(),
  disasterType: z.string(),
  activationLevel: z.string(),
  drNumber: z.string().optional(),
});

export const CountyAddedPayload = z.object({
  countyId: z.string(),
  countyName: z.string(),
  state: z.string(),
  fips: z.string(),
  region: z.string(),
});

export const PersonAssignedPayload = z.object({
  personId: z.string(),
  position: z.string(),
  section: z.string(),
  startDate: z.string(),
  reportingTo: z.string().optional(),
});

export const MealsServedIncrementPayload = z.object({
  location: z.string(),
  count: z.number().positive(),
  date: z.string(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
});

// Event validation map
export const EventPayloadValidators: Record<string, z.ZodSchema> = {
  [EventType.OPERATION_CREATED]: OperationCreatedPayload,
  [EventType.COUNTY_ADDED]: CountyAddedPayload,
  [EventType.PERSON_ASSIGNED]: PersonAssignedPayload,
  [EventType.MEALS_SERVED_INCREMENT]: MealsServedIncrementPayload,
};

// Conflict resolution policies
export enum ConflictResolution {
  LAST_WRITE_WINS = 'lww',
  FIRST_WRITE_WINS = 'fww',
  CRDT_MERGE = 'crdt',
  MANUAL = 'manual',
  DOMAIN_SPECIFIC = 'domain',
}

export interface ConflictPolicy {
  eventType: EventType;
  resolution: ConflictResolution;
  mergeFunction?: (local: Event, remote: Event) => Event;
}

// Default conflict policies
export const DefaultConflictPolicies: ConflictPolicy[] = [
  // Counts and metrics use CRDTs
  { eventType: EventType.MEALS_SERVED_INCREMENT, resolution: ConflictResolution.CRDT_MERGE },
  { eventType: EventType.SHELTERED_COUNT_SET, resolution: ConflictResolution.LAST_WRITE_WINS },
  
  // Roster changes need domain logic
  { eventType: EventType.PERSON_ASSIGNED, resolution: ConflictResolution.DOMAIN_SPECIFIC },
  
  // Geography is additive
  { eventType: EventType.COUNTY_ADDED, resolution: ConflictResolution.CRDT_MERGE },
  { eventType: EventType.COUNTY_REMOVED, resolution: ConflictResolution.CRDT_MERGE },
  
  // IAP updates are last-write-wins with versioning
  { eventType: EventType.IAP_SECTION_UPDATED, resolution: ConflictResolution.LAST_WRITE_WINS },
];

// Schema version for migration tracking
export const CURRENT_SCHEMA_VERSION = 1;

// Event creation helper
export function createEvent(
  type: EventType,
  payload: any,
  metadata: {
    actorId: string;
    operationId?: string;
    causationId?: string;
    correlationId?: string;
  }
): Event {
  const event: Event = {
    id: crypto.randomUUID(),
    type,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    actorId: metadata.actorId,
    deviceId: getDeviceId(),
    sessionId: getSessionId(),
    operationId: metadata.operationId,
    timestamp: Date.now(),
    payload,
    causationId: metadata.causationId,
    correlationId: metadata.correlationId || crypto.randomUUID(),
    syncStatus: 'local',
    syncAttempts: 0,
  };
  
  // Validate payload if validator exists
  const validator = EventPayloadValidators[type];
  if (validator) {
    validator.parse(payload);
  }
  
  // Generate hash
  event.hash = generateEventHash(event);
  
  return event;
}

// Helper to generate event hash for integrity
export function generateEventHash(event: Event): string {
  const canonical = JSON.stringify({
    id: event.id,
    type: event.type,
    actorId: event.actorId,
    timestamp: event.timestamp,
    payload: event.payload,
  });
  
  // In production, use Web Crypto API
  // return await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  // For now, simple hash
  return btoa(canonical).substring(0, 32);
}

// Device and session helpers (move to utils later)
function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  let deviceId = localStorage.getItem('disaster_ops_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('disaster_ops_device_id', deviceId);
  }
  return deviceId;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  let sessionId = sessionStorage.getItem('disaster_ops_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('disaster_ops_session_id', sessionId);
  }
  return sessionId;
}