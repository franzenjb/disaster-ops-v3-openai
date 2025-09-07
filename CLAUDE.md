# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL RULES - NEVER VIOLATE THESE

### 🔍 ALWAYS VERIFY WITH PLAYWRIGHT BEFORE CLAIMING SUCCESS
- **NEVER** tell the user something works without checking it first
- **ALWAYS** use Playwright browser tools to verify the actual application state
- **NEVER** make assumptions based only on code analysis
- **ALWAYS** test the live application at http://localhost:3000 before reporting results
- If you claim something is fixed or working, you MUST have verified it with Playwright
- The user's screenshots and feedback are authoritative - trust their observations over code analysis

### ❌ NEVER REPLACE OR REMOVE WORKING COMPONENTS WITHOUT EXPLICIT APPROVAL
- **NEVER** replace existing components that are working and functional
- **NEVER** switch from one component to another without explicit user request
- **NEVER** assume a "better" or "cleaner" solution should replace existing work
- **ALWAYS** ask permission before making any changes to core functionality
- **ALWAYS** preserve existing functionality when making improvements
- The user has spent significant time perfecting components - respect that work
- If you need to modify something, discuss it first and get explicit approval

## Common Development Commands

```bash
npm run dev               # Start Next.js dev server at http://localhost:3000
npm run build            # Build production bundle  
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking

# Testing Commands
npm run test             # Run all Jest tests
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests
npm run test:performance # Run performance tests (30s timeout)
npm run test:e2e         # Run Playwright E2E tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:critical    # Run tests marked CRITICAL
npm run test:smoke       # Run smoke tests (60s timeout)

# Single test execution
npm test -- --testNamePattern="should create facility"  # Run specific test by name
npm test -- src/lib/services/__tests__/MasterDataService.test.ts  # Run specific test file
```

## Architecture Overview

This is an event-sourced disaster operations platform with a dual-database architecture designed for offline-first operation during disasters. The platform includes comprehensive IAP (Incident Action Plan) generation capabilities that replace Excel-based systems with professional 53-page document generation.

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
- **Operation Events**: OPERATION_CREATED, OPERATION_UPDATED, OPERATION_CLOSED
- **Roster Events**: ROSTER_ENTRY_ADDED, ROSTER_ENTRY_UPDATED, ROSTER_ENTRY_REMOVED
- **IAP Events**: IAP_CREATED, IAP_SECTION_UPDATED, IAP_PUBLISHED, IAP_SNAPSHOT_CREATED, IAP_OFFICIAL_SNAPSHOT
- **Facility Events**: FACILITY_CREATED, FACILITY_UPDATED, FACILITY_PERSONNEL_ASSIGNED, FACILITY_RESOURCE_ADDED
- **Work Assignment Events**: WORK_ASSIGNMENT_CREATED, WORK_ASSIGNMENT_UPDATED, WORK_ASSIGNMENT_COMPLETED
- **IAP Content Events**: DIRECTORS_MESSAGE_UPDATED, CONTACT_ROSTER_UPDATED, ORG_CHART_UPDATED, PHOTO_ATTACHED
- **System Events**: SETUP_STARTED, SETUP_STEP_COMPLETED, SYNC_STARTED, SYNC_COMPLETED

### Setup Wizard Flow

Enhanced 6-step operation creation process:
1. **StepBasics**: Operation name, disaster type, activation level, creator info (name, email, phone)
2. **StepGeography**: Select regions and counties (divisions/states/chapters auto-derived)
3. **StepStaffing**: Initial ICS positions (in progress)
4. **StepResources**: Service lines and resource requirements (in progress)
5. **StepIAP**: IAP configuration, role assignment, initial facilities, generation preferences
6. **StepReview**: Confirm and create operation with IAP capabilities

### IndexedDB Schema (via Dexie)

Database: `disaster_ops_v3`
- **events**: Core event log
- **outbox**: Events pending sync
- **inbox**: Remote events to process
- **operations**: Operation projections
- **roster**: Roster entry projections
- **iap**: IAP document projections
- **facilities**: Facility data (shelters, feeding sites, etc.)
- **iap_snapshots**: Official IAP snapshots (6PM versions)
- **work_assignments**: Task assignments across facilities
- **geography**: County and chapter data
- **cache**: Temporary data cache

### Type System

Main types in `/src/types/index.ts`:
- **Core Operations**: Operation, DisasterType, ActivationLevel, OperationStatus
- **Personnel**: Person, RosterEntry, ICSPosition, ICSSection, User with IAPRole
- **IAP System**: EnhancedIAPDocument, IAPFacility, WorkSitesTable, ContactRoster, IAPSnapshot
- **Facilities**: FacilityType, FacilityStatus, FacilityPersonnel, FacilityResource
- **Work Management**: WorkAssignment, Priority, ActionTracker, DailySchedule
- **Geography**: County, Chapter, Region, Division
- **Service Lines**: ServiceLine (feeding, sheltering, distribution, health_services, etc.)
- **Role-Based Access**: IAPRole (ip_group, discipline, field, viewer)

### Current Implementation Status

**Working Features**
- ✅ **Event sourcing** with complete event structure and validation
- ✅ **Local database persistence** with IndexedDB and dual-database architecture
- ✅ **Setup wizard steps 1-2** (basics and geography) with ARC organizational hierarchy
- ✅ **IAP System Foundation**: Complete type system, event definitions, and projector
- ✅ **IAP Dashboard**: Professional interface with role-based access control
- ✅ **Facility Management**: Create and manage operational facilities with personnel/resources
- ✅ **IAP Projector**: Event-sourced generation of 53-page IAP documents
- ✅ **Snapshot System**: Official 6PM snapshots with version control and locking
- ✅ **Role-Based Access**: I&P Group, Discipline Team, Field Team, and Viewer roles
- ✅ **Enhanced Operation Dashboard**: Integrated IAP navigation and metrics

**In Development**
- Steps 3-6 of setup wizard (staffing, resources, IAP config, review)
- PDF generation with professional Red Cross formatting
- Director's Message rich text editor with photo embedding
- Advanced work assignment scheduling and resource allocation
- Contact roster auto-population from personnel assignments
- Supabase remote database integration and real-time sync

### IAP System Architecture

**53-Page Document Generation**
- **IAPProjector** (`/src/lib/projections/IAPProjector.ts`): Generates complete IAP documents from event streams
- **Facility-Centric Approach**: Each facility becomes a row in Work Sites Table and generates Work Assignments
- **Real-Time Updates**: IAP data updates as facilities, personnel, and resources change
- **Professional Output**: Matches exact Red Cross formatting standards

**Role-Based Access Control**
- **I&P Group**: Full editing access to all IAP components (cover page, director's message, etc.)
- **Discipline Teams**: Access to their specific facilities and assignments only
- **Field Teams**: Read-only access to their assignments and schedules
- **Viewers**: View-only access to published IAPs

**Official Snapshot System**
- **6PM Snapshots**: Create locked, official versions for distribution
- **Version Control**: Track all changes with full audit trail
- **Real-Time Working Copies**: Continue editing while maintaining official versions
- **Distribution Lists**: Manage who receives official snapshots

**Key Components**
- **IAPDashboard** (`/src/components/IAP/IAPDashboard.tsx`): Main IAP management interface
- **FacilityManager** (`/src/components/IAP/FacilityManager.tsx`): Create and manage facilities
- **StepIAP** (`/src/components/SetupWizard/StepIAP.tsx`): IAP configuration during setup

### Testing the Platform

1. Check IndexedDB state: DevTools → Application → IndexedDB → disaster_ops_v3
2. View events in the events table (append-only log)
3. Check facilities, iap, and iap_snapshots tables for IAP data
4. Check outbox for pending sync items
5. Monitor EventBus events in console (when in dev mode)
6. Test role-based access by changing user.iapRole in components

## Data Files

### Personnel and Operational Data

**Personnel Database** (`/src/data/personnel-database.ts`)
- 500+ pre-populated Red Cross responders with roles, certifications, and contact info
- Used for roster quick-fill and personnel assignments

**GAP Codes** (`/src/data/gap-codes.ts`)
- 900+ Red Cross GAP (General Accounting Practice) codes for financial tracking
- Hierarchical structure: Chapter → Activity → Project

**Assets Database** (`/src/data/assets.ts`)
- Vehicle fleet data (ERVs, Box Trucks, Staff Vehicles)
- Equipment inventory (generators, trailers, communication gear)
- Supply categories and standard configurations

**V27 IAP Sample Data** (`/src/data/v27-iap-data.ts`)
- Complete 53-page IAP example from Hurricane operation
- Used as template and testing reference

### PDF Generation System

**IAPPdfGenerator** (`/src/lib/pdf/IAPPdfGenerator.ts`)
- Generates complete 53-page IAP documents using jsPDF
- Professional Red Cross formatting and branding
- Includes all ICS forms (201-207)
- Cover photos, organizational charts, and work assignments

**PDF Export Component** (`/src/components/PDFExport.tsx`)
- UI component for generating and previewing PDFs
- Integrated with IAP Dashboard and Viewer

### Testing Infrastructure

**Test Coverage Requirements**
- Unit tests: 80% minimum coverage
- Integration tests: All API endpoints and data flows
- Performance tests: <100ms query time, <5s IAP generation
- E2E tests: Critical user workflows

**Test Organization**
- `__tests__` folders co-located with components
- Performance tests in `*.performance.test.ts` files
- Integration tests in `*.integration.test.ts` files
- Mock data uses faker.js for realistic test scenarios

### Agent Configuration

**Agent System** (`/.claude/agents.yaml`)
- 5 specialized agents for code quality:
  - UX Reviewer: Accessibility and interface design
  - API Designer: RESTful standards and documentation
  - Security Reviewer: Vulnerability audits
  - Test Runner: Coverage and CI/CD health
  - Database Admin: Schema optimization

**Activation Commands**
```bash
@ux_reviewer: Review the IAP dashboard workflow
@database_admin: Review single source of truth architecture
@security_reviewer: Audit role-based access control
@test_runner: Run tests and check coverage
@api_designer: Review API endpoints
```

## Critical Requirements

### 🚨 CRITICAL: SINGLE SOURCE OF TRUTH - NON-NEGOTIABLE
- **THIS IS THE MOST IMPORTANT REQUIREMENT OF THE ENTIRE APPLICATION**
- Tables Hub is THE ONLY authoritative data source
- ALL components MUST read from and write to Tables Hub
- 100% bidirectional sync is MANDATORY - no exceptions
- If Facility Manager creates a facility, it MUST appear in Tables Hub immediately
- If Tables Hub edits data, it MUST appear in IAP displays immediately
- MasterDataService handles ALL data operations - no direct database access elsewhere
- Real-time updates across ALL views (<100ms)
- **FAILURE TO MAINTAIN SYNC IS A CRITICAL BUG THAT BREAKS THE ENTIRE APPLICATION**

### Offline-First Design
- Full functionality without internet connection
- Local IndexedDB stores all operational data
- Sync queue manages pending updates
- Conflict resolution via event sourcing
- No data loss during disconnections

### IAP Generation
- Must match exact Red Cross formatting standards
- 53-page document with all required sections
- Real-time data from operations
- Role-based editing permissions
- 6PM official snapshot system

### Performance Targets
- Page load: <2 seconds
- Database queries: <100ms
- IAP generation: <5 seconds
- Real-time sync: <100ms
- Offline mode: Instant response