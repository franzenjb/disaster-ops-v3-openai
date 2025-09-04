# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
npm run dev        # Start Next.js dev server at http://localhost:3000
npm run build      # Build production bundle
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking
```

## Architecture Overview

This is an event-sourced disaster operations platform with a dual-database architecture designed for offline-first operation during disasters.

### Core Architecture Patterns

**Event Sourcing Foundation**
- Single source of truth is the event log (append-only)
- All entities (Operations, Rosters, IAPs) are projections built from events
- Events include: id, type, actorId, timestamp, payload, causationId, correlationId, hash, syncStatus
- Event validation using Zod schemas in `/src/lib/events/types.ts`

**Dual Database Strategy**
- **Local**: IndexedDB via Dexie (`/src/lib/store/LocalStore.ts`) - stores events, outbox queue, hot projections
- **Remote**: PostgreSQL/Supabase (planned) - canonical event log, analytics, compliance

**Sync Architecture** 
- Outbox/Inbox pattern in `/src/lib/sync/SyncEngine.ts`
- Reliable event delivery with retry logic and exponential backoff
- Conflict resolution using CRDT strategies for collaborative editing
- EventBus (`/src/lib/sync/EventBus.ts`) for local event distribution

**Projection System**
- `/src/lib/projections/Projector.ts` builds entities from event streams
- Supports snapshots for performance optimization

### American Red Cross Organizational Data

**Permanent Reference Database** (`/src/data/arc-organization.ts`)
- 7 Divisions with headquarters
- 51+ Regions covering all states and territories  
- All 50 states + DC + Puerto Rico
- 250+ Chapters (sample data, focusing on Florida)
- All 67 Florida counties with population data

**Geography Selection Rules**
- Users only select Regions and Counties
- System automatically derives: Divisions, States, and Chapters
- Component: `/src/components/SetupWizard/StepGeography.tsx`

### Key Event Types

Located in `/src/lib/events/types.ts`:
- OPERATION_CREATED, OPERATION_UPDATED, OPERATION_CLOSED
- ROSTER_ENTRY_ADDED, ROSTER_ENTRY_UPDATED, ROSTER_ENTRY_REMOVED
- IAP_CREATED, IAP_UPDATED, IAP_PUBLISHED
- SETUP_STARTED, SETUP_STEP_COMPLETED, SETUP_COMPLETED
- SYNC_STARTED, SYNC_COMPLETED, SYNC_FAILED

### Setup Wizard Flow

5-step operation creation process:
1. **StepBasics**: Operation name, disaster type, activation level, creator info (name, email, phone)
2. **StepGeography**: Select regions and counties (divisions/states/chapters auto-derived)
3. **StepStaffing**: Initial ICS positions (in progress)
4. **StepResources**: Service lines and resource requirements (in progress)
5. **StepReview**: Confirm and create operation

### IndexedDB Schema (via Dexie)

Database: `disaster_ops_v3`
- **events**: Core event log
- **outbox**: Events pending sync
- **inbox**: Remote events to process
- **operations**: Operation projections
- **roster**: Roster entry projections
- **iap**: IAP document projections

### Type System

Main types in `/src/types/index.ts`:
- Operation, DisasterType, ActivationLevel, OperationStatus
- Person, RosterEntry, ICSPosition, ICSSection
- IAPDocument with ICS Forms (202-215)
- County, Chapter, Region, Division
- ServiceLine (feeding, sheltering, etc.)

### Current Implementation Status

**Working Features**
- Event sourcing with complete event structure
- Local database persistence with IndexedDB
- Setup wizard steps 1-2 (basics and geography)
- ARC organizational hierarchy with auto-derivation
- Quick select presets for common geographic configurations

**In Development**
- Steps 3-5 of setup wizard (staffing, resources, review)
- Supabase remote database integration
- Real-time sync between local and remote

### Testing the Platform

1. Check IndexedDB state: DevTools → Application → IndexedDB → disaster_ops_v3
2. View events in the events table (append-only log)
3. Check outbox for pending sync items
4. Monitor EventBus events in console (when in dev mode)