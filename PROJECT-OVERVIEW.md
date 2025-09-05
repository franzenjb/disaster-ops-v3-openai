# Disaster Operations IAP Management System - Project Overview

## 🎯 Mission
Replace the fragile Excel-based IAP creation system with a robust, modern platform that maintains the exact IAP format while eliminating macro failures and enabling real-time collaboration.

## 📋 Core Requirements

### Three Pillars
1. **Locations** - Facilities, sites, mobile units
2. **Personnel** - Staff, volunteers, positions, assignments
3. **Assets** - Equipment, supplies, resources

### Key Problems Solved
- ❌ Excel macros breaking at critical 6PM deadline
- ❌ Multiple people unable to edit simultaneously  
- ❌ Complex spreadsheet formulas confusing users
- ❌ Version control and data integrity issues

### Solution Architecture
- ✅ Event-sourced architecture with complete audit trail
- ✅ Discipline-specific pages feeding normalized database
- ✅ Offline-first with automatic sync when connected
- ✅ Professional IAP generation matching exact format

## 🏗️ Technical Stack

### Current Implementation (disaster-ops-v3)
- **Framework**: Next.js 15 with TypeScript
- **Architecture**: Event Sourcing with CQRS
- **Local Storage**: IndexedDB with Dexie
- **Remote Storage**: PostgreSQL/Supabase (planned)
- **Validation**: Zod schemas
- **UI**: React with Tailwind CSS

## 📁 Repository Structure

```
disaster-ops-v3/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── lib/          
│   │   ├── database/  # Database interfaces
│   │   ├── events/    # Event definitions & handlers
│   │   ├── projections/ # Event projections (IAP, facilities)
│   │   ├── store/     # State management
│   │   └── sync/      # Sync engine (offline/online)
│   ├── data/         # Static data (GAP codes, positions)
│   └── types/        # TypeScript type definitions
├── docs/
│   ├── planning/     # Requirements & design docs
│   └── iap-samples/  # Example IAP documents
└── previous-versions/ # Historical implementations
```

## 📊 Database Schema

### Core Tables
- `Incident` - Disaster relief operation
- `OperationalPeriod` - 24-hour planning periods
- `WorkSite` - Facilities and locations
- `WorkAssignment` - Tasks at each site
- `RosterAssignment` - Personnel assignments
- `AssetAllocation` - Resource allocations
- `CapabilityPlan` - Req/Have/Gap tracking

### Supporting Tables
- `Discipline` - Service lines (Shelter, Feeding, etc.)
- `PositionCatalog` - GAP position codes
- `AssetType` - Resource definitions
- `Contact` - Personnel directory
- `IAPContent` - Document sections
- `EventLog` - Complete audit trail

## 🔄 Workflow

### Daily Operations
1. **All Day**: Disciplines update their facilities/assignments
2. **5:00 PM**: Validation and review
3. **6:00 PM**: Freeze operational period and publish IAP
4. **Post-6PM**: Edits apply to next operational period

### Access Control
- **Discipline Editors**: Edit own service line data
- **I&P Team**: Edit all sections, manage shared content
- **Publishers**: Generate and distribute final IAP

## 🎯 Success Criteria

### Must Have (MVP)
- ✅ One page per facility planning
- ✅ Real-time Req/Have/Gap calculations
- ✅ Professional IAP matching exact format
- ✅ Offline operation with sync
- ✅ Multi-user collaboration

### Should Have
- 🔄 PDF generation with exact formatting
- 🔄 Historical data and reporting
- 🔄 Mobile optimization
- 🔄 Integration with Red Cross systems

## 📅 Development Status

### Completed
- ✅ Event sourcing foundation
- ✅ Database schema design
- ✅ Setup wizard (Steps 1-2)
- ✅ IAP type system
- ✅ Facility management base

### In Progress
- 🔄 Work assignment editor
- 🔄 Personnel roster management
- 🔄 Asset allocation tracking
- 🔄 IAP page generation

### Next Steps
1. Complete facility planning pages
2. Implement Req/Have/Gap tracking
3. Build IAP compilation engine
4. Add PDF generation
5. Deploy and test with real operation

## 📞 Contact
**Project Lead**: Jeff Franzen  
**Role**: GIS Lead, Board Member Tampa Bay Chapter  
**Context**: DR 220-25 FLOCOM Response

## 📚 Documentation

### Planning Documents
- [Developer Message](docs/planning/DEVELOPER-MESSAGE.md) - Complete vision and requirements
- [Comprehensive Questions](docs/planning/COMPREHENSIVE-QUESTIONS.md) - 170+ detailed questions
- [IAP Analysis](IAP-DOCUMENT-ANALYSIS.md) - Structure of 53-page document
- [Version Comparison](IAP-VERSION-COMPARISON.md) - Evolution from emergency to recovery

### Technical Documents
- [README](README.md) - Setup and development guide
- [CLAUDE.md](CLAUDE.md) - AI assistant instructions
- [Event Definitions](src/lib/events/definitions.ts) - Event sourcing schema

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:3000
```

---

**This system will revolutionize Red Cross disaster operations by replacing fragile Excel macros with a robust, modern platform while maintaining the familiar IAP format that teams trust.**