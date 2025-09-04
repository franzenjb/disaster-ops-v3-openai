# Disaster Operations Platform v3

## Event-Sourced Architecture with Dual Database Design

### Quick Start
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Architecture Overview

This is Version 3 of the Red Cross Disaster Operations Platform, rebuilt from the ground up with proper event sourcing and a revolutionary dual-database architecture.

#### Core Principles
1. **Single Source of Truth = Event Log** - All changes are events, append-only
2. **Entities are Projections** - Operations, rosters, IAPs are built from events
3. **Offline-First** - Works without internet, syncs when connected
4. **Built for Conflict** - CRDT merge strategies for collaborative editing

#### Dual Database Strategy
- **Local (IndexedDB/Dexie)**: Event log + outbox queue + hot projections
- **Remote (PostgreSQL/Supabase)**: Canonical event log + analytics + compliance

### Project Structure
```
/src
  /lib
    /events       # Event types with Zod validation
    /store        # LocalStore with Dexie (IndexedDB)
    /sync         # EventBus & SyncEngine with outbox/inbox
    /projections  # Entity projectors from events
  /components
    /SetupWizard  # 5-step operation creation
  /types          # TypeScript definitions
```

### Key Innovations

#### Complete Event Structure
```typescript
Event {
  id: UUID
  type: EventType
  actorId: string
  timestamp: number
  payload: any
  causationId?: UUID  // What caused this
  correlationId?: UUID // Group related events
  hash: string        // Integrity check
  syncStatus: 'local' | 'pending' | 'synced'
}
```

#### Outbox/Inbox Pattern
- Reliable event delivery with retry logic
- Exponential backoff for failures
- Idempotency keys prevent duplicates
- Ordered processing of remote events

#### Conflict Resolution
- Last-Write-Wins for simple fields
- CRDT merge for counts (meals served, sheltered)
- Domain-specific rules for roster assignments
- Manual resolution UI for complex conflicts

### Development Status

✅ **Completed**
- Event sourcing foundation
- Local database with Dexie
- Outbox/Inbox sync pattern
- Projection system for entities
- Setup Wizard structure
- Basic UI components

🚧 **In Progress**
- Geography selection (counties/regions)
- Roster management
- IAP document system

📋 **Planned**
- Supabase integration
- Real-time collaboration
- Mapbox county selection
- Full ICS forms (202-215)

### Testing the Platform

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Create an Operation**
   - Fill in operation basics (name, type, activation level)
   - Select affected counties (coming soon)
   - Assign initial staff (coming soon)
   - Define resource needs (coming soon)
   - Review and create

3. **Check IndexedDB**
   - Open DevTools → Application → IndexedDB
   - See events in `disaster_ops_v3` database
   - Events table shows append-only log
   - Outbox shows pending sync items

### Environment Variables

Create `.env.local`:
```env
# Mapbox for county selection
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here

# Supabase (when ready)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### Key Files

- `/src/lib/events/types.ts` - Event definitions and validation
- `/src/lib/store/LocalStore.ts` - IndexedDB management with Dexie
- `/src/lib/sync/SyncEngine.ts` - Outbox/inbox synchronization
- `/src/lib/projections/Projector.ts` - Build entities from events

### Architecture Benefits

1. **Complete Audit Trail** - Every change is recorded
2. **Time Travel** - Rebuild state at any point
3. **Offline Resilient** - Works without internet
4. **Conflict Resolution** - Handles concurrent edits
5. **Scalable** - Event stream can be partitioned

### Next Steps

1. Complete geography selector with Mapbox
2. Implement roster management with drag-drop
3. Build IAP document editor with Quill
4. Connect Supabase for permanent storage
5. Add real-time collaboration

---

Built with Next.js 15, React 19, TypeScript, Dexie, and Zod