# Disaster Operations IAP Management System

[![CI](https://github.com/franzenjb/disaster-ops-v3/actions/workflows/ci.yml/badge.svg)](https://github.com/franzenjb/disaster-ops-v3/actions/workflows/ci.yml)

A comprehensive disaster response platform that combines real-time field operations with professional IAP (Incident Action Plan) generation — built specifically for Red Cross disaster relief operations.

This platform revolutionizes disaster response by providing both a fast, reliable field operations system and automated generation of professional 53-page IAP documents that match Red Cross standards exactly. No more Excel macros, no more 6PM deadlines, no more data corruption.

## Why We're Building This

### **Core Operations**
- Keep operations moving in tough conditions (poor connectivity, high tempo)
- Reduce duplicate data entry and menu‑hopping — one place to set up sites and assign what's needed
- Preserve a faithful history across all disasters for reporting, learning, and accountability

### **IAP Revolution**
- **Replace Excel-based IAP creation** with modern, reliable system that generates professional 53-page IAPs
- **Eliminate the 6PM deadline** — generate IAPs anytime with real-time data
- **End macro corruption** — bulletproof data integrity with event sourcing
- **Enable real-time collaboration** — multiple users can work simultaneously without conflicts
- **Match Red Cross standards exactly** — professional formatting that looks identical to existing IAPs

## How The System Is Organized

- Temporary database (your device): fast, lightweight, built for the current event. Think of it as your clipboard during a tornado, wildfire, or hurricane. It holds the data you need right now so you can keep working offline.
- Permanent database (cloud): durable, secure, organization‑wide. Think of it as the filing cabinet — the official archive across all operations and years.
- Logic layer (the “clerk”): the glue between the two. It writes to the clipboard first, files to the cabinet when online, keeps a clear trail of changes, and supports undo/redo when appropriate.
- Unified input screen (the “desk form”): when you set up a site (shelter, kitchen, etc.), you can immediately set the site type, positions/roles, and tie assets/collateral to that site — without bouncing between menus.

Roster integration: where possible, we will pull from authoritative directories (e.g., Red Cross personnel) to populate rosters rather than forcing manual entry.

## How It Will Be Used

### **Field Operations**
- Create an operation and its sites in one flow, selecting the type of site and what it needs
- Assign positions and assets on the same screen you used to create the site
- Work offline when needed; when you regain connectivity, your device syncs with the official record
- The same actions (create site, assign staff, allocate resource) are logged as simple "events," so collaboration, undo, and audit are reliable

### **IAP Management**
- **Role-based access**: I&P Group gets full editing access, Discipline Teams manage their facilities, Field Teams get read-only access
- **Real-time updates**: IAP data updates throughout the day as operations evolve
- **6PM Official Snapshots**: Create locked, official versions for distribution while maintaining real-time working copies
- **Professional Output**: Generate 53-page IAPs that include Cover Page, Director's Message, Organization Chart, Work Sites Table, Work Assignments, Contact Roster, Daily Schedule, and all required ICS forms
- **Facility-centric approach**: Each facility becomes a row in Work Sites Table and generates corresponding Work Assignments

## Status Snapshot

### **Core Platform**
- ✅ **Event sourcing foundation**: Complete event-driven architecture with dual database system
- ✅ **Operation setup**: Basics and Geography steps working with ARC organizational hierarchy
- ✅ **Local-first design**: IndexedDB storage with offline capability
- 🔄 **Sync system**: Cloud integration with Supabase planned

### **IAP System** 
- ✅ **IAP types and events**: Complete type system for 53-page IAP generation
- ✅ **IAP projector**: Event-sourced IAP document generation from facility and personnel data
- ✅ **Role-based access**: I&P Group, Discipline Team, and Field Team access controls
- ✅ **Facility management**: Create and manage operational facilities with personnel and resources
- ✅ **IAP dashboard**: Professional interface for managing all IAP components
- ✅ **Snapshot system**: Official 6PM snapshots with version control
- ✅ **Setup wizard integration**: IAP configuration step in operation setup

## What's Next (Near‑Term)

### **Core Platform**
- Connect the sync engine: write first to the device, then file to the cloud when online — automatically
- Complete setup wizard: finish Staffing and Resources steps
- Integrate roster lookups from authoritative directories to reduce manual typing

### **IAP Enhancements**
- **PDF Generation**: Professional PDF output matching exact Red Cross formatting
- **Director's Message Editor**: Rich text editor with templates and photo embedding
- **Advanced Work Assignments**: Personnel scheduling and resource allocation
- **Contact Roster Auto-population**: Pull from Setup Tables and personnel assignments
- **Daily Schedule Management**: Meetings, briefings, and deadlines with Teams integration
- **Photo Management**: Cover photos and operational documentation
- **Ancillary Content**: Parking instructions, checkout procedures, policy updates

## Getting Started (for pilots and demos)

Quick start
```bash
npm install
npm run dev
# Open http://localhost:3000
```

Environment
```env
# Copy the example and fill values
# cp .env.local.example .env.local

NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Quality checks (optional)
```bash
npm run type-check && npm run lint && npm run build
```

## Data Care and Privacy

- We keep a clear history of what changed, when, and by whom — to support accountability and recovery.
- Personally identifiable information (PII) is protected by access controls in the cloud. Policies will align with Red Cross standards as we turn on sync.

---

If you’d like a short briefing or a quick walkthrough of the unified site setup flow, reach out — this tool is being shaped for real‑world field use.
