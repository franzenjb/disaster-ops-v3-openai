# Red Cross Disaster Operations Platform v3
## Comprehensive System Architecture & Implementation Plan

### Executive Summary

The Disaster Operations Platform v3 represents a complete digital transformation of Red Cross disaster response operations, replacing legacy Excel-based systems with a modern, scalable, real-time collaborative platform. This system manages the complete lifecycle of disaster operations from initial assessment through demobilization, supporting multi-user collaboration across chapters, regions, and national headquarters.

### Key Innovation: Dual Database Architecture

The platform employs a revolutionary dual-database strategy that solves the unique challenges of disaster operations:

1. **Permanent Database (PostgreSQL/Supabase)**: Maintains complete historical records of all operations, enabling analytics, compliance, and lessons learned
2. **Temporary Operations Database (SQLite/IndexedDB)**: Provides lightning-fast local performance during active disasters, with automatic sync when connectivity allows

This architecture ensures operations continue uninterrupted even without internet connectivity - critical during infrastructure-compromised disaster scenarios.

---

## System Architecture

### Core Design Principles

1. **Event-Driven Architecture**: Every change is an event, enabling real-time collaboration, comprehensive audit trails, and reversible actions
2. **Offline-First Design**: Full functionality without internet, with automatic sync when reconnected
3. **Progressive Enhancement**: Core functions work everywhere, advanced features activate when available
4. **Setup Wizard Pattern**: Guided resource allocation ensures nothing is forgotten during high-stress deployments

### Technical Stack

#### Frontend
- **React 19** with TypeScript for type-safe, maintainable code
- **Next.js 15** for server-side rendering, API routes, and optimal performance
- **Tailwind CSS** for consistent, responsive design
- **Zustand** for lightweight, performant state management
- **Quill Editor** for rich text editing in IAP documents
- **Mapbox GL JS** for interactive county-level mapping
- **React-PDF** for IAP document generation

#### Backend
- **Node.js** with Express for API server
- **PostgreSQL** (via Supabase) for permanent data storage
- **SQLite** for temporary operations database
- **Redis** for caching and real-time pubsub
- **WebSockets** (Socket.io) for real-time collaboration

#### Infrastructure
- **Vercel** for frontend hosting with edge functions
- **Supabase** for database, auth, and real-time sync
- **Cloudflare R2** for document/image storage
- **GitHub Actions** for CI/CD

---

## Database Design

### Permanent Database Schema (PostgreSQL)

```sql
-- Core Operations
CREATE TABLE operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_number VARCHAR(20) UNIQUE NOT NULL,
    operation_name VARCHAR(255) NOT NULL,
    disaster_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    metadata JSONB
);

-- Geographic Coverage
CREATE TABLE operation_geography (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    region_name VARCHAR(100),
    state_code CHAR(2),
    county_name VARCHAR(100),
    county_fips VARCHAR(5),
    chapter_name VARCHAR(200),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES users(id)
);

-- Personnel Roster
CREATE TABLE operation_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    person_id UUID REFERENCES personnel(id),
    position VARCHAR(100),
    ics_role VARCHAR(50),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20),
    contact_info JSONB
);

-- IAP Documents
CREATE TABLE iap_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    iap_number INTEGER,
    operational_period_start TIMESTAMPTZ,
    operational_period_end TIMESTAMPTZ,
    content JSONB, -- Structured IAP content
    published_at TIMESTAMPTZ,
    published_by UUID REFERENCES users(id),
    version INTEGER DEFAULT 1
);

-- Service Delivery Metrics
CREATE TABLE service_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    metric_date DATE,
    metric_type VARCHAR(50), -- 'feeding', 'shelter', 'health', etc.
    value NUMERIC,
    unit VARCHAR(20),
    location VARCHAR(255),
    reported_by UUID REFERENCES users(id),
    reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Stream (Audit/History)
CREATE TABLE event_stream (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_id UUID REFERENCES operations(id),
    event_type VARCHAR(50),
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES users(id),
    session_id UUID,
    payload JSONB,
    reversible BOOLEAN DEFAULT true,
    metadata JSONB
);

-- Reference Data
CREATE TABLE arc_regions (
    id SERIAL PRIMARY KEY,
    division_name VARCHAR(100),
    region_name VARCHAR(100) UNIQUE,
    region_code VARCHAR(10),
    headquarters_city VARCHAR(100),
    headquarters_state CHAR(2)
);

CREATE TABLE arc_chapters (
    id SERIAL PRIMARY KEY,
    region_id INTEGER REFERENCES arc_regions(id),
    chapter_name VARCHAR(200),
    coverage_area TEXT[],
    contact_info JSONB
);
```

### Temporary Operations Database (SQLite)

```sql
-- Lightweight schema for active operations
CREATE TABLE active_operation (
    id TEXT PRIMARY KEY,
    data TEXT, -- JSON serialized operation state
    last_modified INTEGER,
    sync_status TEXT
);

CREATE TABLE pending_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT,
    payload TEXT,
    created_at INTEGER,
    synced BOOLEAN DEFAULT 0
);

CREATE TABLE offline_cache (
    key TEXT PRIMARY KEY,
    value TEXT,
    expires_at INTEGER
);
```

---

## Component Architecture

### 1. Setup Wizard System

The Setup Wizard guides users through operation initialization:

```
┌─────────────────────────────────────────┐
│          SETUP WIZARD FLOW              │
├─────────────────────────────────────────┤
│ 1. Operation Basics                     │
│    - Operation name & number            │
│    - Disaster type & DR number          │
│    - Activation level                   │
│                                          │
│ 2. Geographic Scope                     │
│    - Select region                      │
│    - Select affected counties           │
│    - Auto-populate chapters             │
│                                          │
│ 3. Initial Staffing                     │
│    - IC/Deputy IC assignment            │
│    - Section chiefs                     │
│    - Import from previous operation     │
│                                          │
│ 4. Resource Requirements                 │
│    - Expected duration                  │
│    - Service lines to activate          │
│    - Initial supply needs               │
│                                          │
│ 5. Review & Launch                      │
│    - Confirm all settings               │
│    - Generate initial IAP               │
│    - Notify stakeholders                │
└─────────────────────────────────────────┘
```

### 2. Real-Time Collaboration Layer

```typescript
// Event Bus Architecture
interface OperationEvent {
  id: string;
  type: EventType;
  timestamp: number;
  userId: string;
  sessionId: string;
  payload: any;
  metadata: {
    deviceId?: string;
    location?: GeoPoint;
    networkType?: NetworkType;
  };
  reversible: boolean;
  reverseAction?: () => void;
}

// Real-time sync
class SyncManager {
  private localQueue: OperationEvent[] = [];
  private ws: WebSocket;
  
  async sync() {
    if (this.isOnline()) {
      await this.pushLocalEvents();
      await this.pullRemoteEvents();
    }
  }
  
  handleConflict(local: Event, remote: Event) {
    // Last-write-wins with user notification
    if (remote.timestamp > local.timestamp) {
      this.applyRemoteChange(remote);
      this.notifyUser('conflict', { local, remote });
    }
  }
}
```

### 3. IAP Document System

The Incident Action Plan (IAP) is the core operational document:

```typescript
interface IAPDocument {
  // Header Information
  operationId: string;
  iapNumber: number;
  operationalPeriod: {
    start: Date;
    end: Date;
  };
  
  // ICS-202: Response Objectives
  objectives: string[];
  
  // ICS-203: Organization Chart
  orgChart: {
    incidentCommander: Person;
    sections: {
      operations: Section;
      planning: Section;
      logistics: Section;
      finance: Section;
    };
  };
  
  // ICS-204: Assignment Lists
  assignments: Assignment[];
  
  // ICS-205: Communications Plan
  communications: CommsPlan;
  
  // ICS-206: Health & Safety Plan
  healthSafety: SafetyPlan;
  
  // ICS-215: Operational Planning
  operationalPlanning: OpPlan;
  
  // Director's Intent
  directorsMessage: RichText;
  
  // General Messages
  generalMessages: RichText;
}
```

### 4. County Selection & Mapping

```typescript
interface GeographyManager {
  // Simplified selection flow
  selectRegion(regionName: string): void;
  getRegionCounties(regionName: string): County[];
  toggleCounty(countyId: string): void;
  
  // Map visualization
  renderChoropleth(selectedCounties: County[]): void;
  highlightChapters(affectedChapters: Chapter[]): void;
  
  // Data flow to IAP
  populateIAPGeography(): IAPGeographySection;
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Set up PostgreSQL database with Supabase
- [ ] Implement authentication system
- [ ] Create EventBus for event-driven architecture
- [ ] Design component library with Tailwind

### Phase 2: Core Operations (Weeks 3-4)
- [ ] Build Setup Wizard workflow
- [ ] Implement operation creation and management
- [ ] Create roster management system
- [ ] Develop org chart generator
- [ ] Build county selection interface with map

### Phase 3: IAP System (Weeks 5-6)
- [ ] Design IAP document structure
- [ ] Implement Quill editor for rich text sections
- [ ] Create ICS forms (202-215)
- [ ] Build PDF generation system
- [ ] Add version control for IAP documents

### Phase 4: Real-Time Features (Weeks 7-8)
- [ ] Implement WebSocket connections
- [ ] Build conflict resolution system
- [ ] Create presence indicators
- [ ] Develop notification system
- [ ] Add collaborative editing

### Phase 5: Offline Capabilities (Weeks 9-10)
- [ ] Implement SQLite for local storage
- [ ] Create sync manager
- [ ] Build offline queue system
- [ ] Add network status monitoring
- [ ] Test offline/online transitions

### Phase 6: Service Integration (Weeks 11-12)
- [ ] Connect feeding/sheltering modules
- [ ] Integrate health services tracking
- [ ] Add logistics management
- [ ] Build reporting dashboards
- [ ] Create data export functions

---

## Migration Strategy from v2

### Assets to Preserve
1. **UI Components**
   - County selection interface
   - IAP layout and styling
   - Org chart visualization
   - Rich text editor configuration

2. **Data Structures**
   - Red Cross organizational hierarchy
   - County-to-chapter mappings
   - ICS position definitions

3. **Business Logic**
   - Event-driven patterns
   - County selection algorithms
   - IAP generation logic

### Migration Steps

1. **Data Migration**
   ```typescript
   // Extract from localStorage/IndexedDB
   const v2Data = await extractV2Data();
   
   // Transform to v3 schema
   const v3Data = transformDataStructure(v2Data);
   
   // Import to PostgreSQL
   await importToProduction(v3Data);
   ```

2. **Component Migration**
   - Copy React components to new codebase
   - Update import paths and dependencies
   - Refactor to use new state management
   - Add TypeScript types

3. **Testing Protocol**
   - Unit tests for all critical functions
   - Integration tests for workflows
   - End-to-end tests for complete operations
   - Performance benchmarks

---

## API Specification

### RESTful Endpoints

```typescript
// Operations
POST   /api/operations          // Create new operation
GET    /api/operations/:id      // Get operation details
PUT    /api/operations/:id      // Update operation
DELETE /api/operations/:id      // Close operation

// Geography
POST   /api/operations/:id/counties     // Add counties
DELETE /api/operations/:id/counties/:countyId  // Remove county

// Roster
GET    /api/operations/:id/roster       // Get full roster
POST   /api/operations/:id/roster       // Add person
PUT    /api/operations/:id/roster/:personId  // Update assignment

// IAP
GET    /api/operations/:id/iap/current  // Get current IAP
POST   /api/operations/:id/iap          // Create new IAP
PUT    /api/operations/:id/iap/:iapId   // Update IAP
POST   /api/operations/:id/iap/:iapId/publish  // Publish IAP

// Real-time
WS     /api/operations/:id/subscribe    // WebSocket connection
```

### GraphQL Alternative

```graphql
type Operation {
  id: ID!
  operationNumber: String!
  operationName: String!
  status: OperationStatus!
  geography: [County!]!
  roster: [RosterEntry!]!
  currentIAP: IAPDocument
  metrics: [ServiceMetric!]!
}

type Query {
  operation(id: ID!): Operation
  activeOperations: [Operation!]!
}

type Mutation {
  createOperation(input: CreateOperationInput!): Operation!
  updateOperation(id: ID!, input: UpdateOperationInput!): Operation!
  addCounty(operationId: ID!, county: CountyInput!): Operation!
  publishIAP(operationId: ID!, iapId: ID!): IAPDocument!
}

type Subscription {
  operationUpdates(operationId: ID!): OperationEvent!
}
```

---

## Security Considerations

### Authentication & Authorization

```typescript
// Role-based access control
enum Role {
  VIEWER = 'viewer',           // Read-only access
  OPERATOR = 'operator',       // Edit operational data
  SECTION_CHIEF = 'section_chief',  // Manage section
  IC = 'incident_commander',   // Full operation control
  ADMIN = 'admin'              // System administration
}

// Permission matrix
const permissions = {
  [Role.VIEWER]: ['read'],
  [Role.OPERATOR]: ['read', 'edit:data'],
  [Role.SECTION_CHIEF]: ['read', 'edit:data', 'edit:roster'],
  [Role.IC]: ['read', 'edit:data', 'edit:roster', 'publish:iap'],
  [Role.ADMIN]: ['*']
};
```

### Data Protection

1. **Encryption**
   - TLS 1.3 for all API communications
   - AES-256 for sensitive data at rest
   - End-to-end encryption for chat features

2. **Compliance**
   - HIPAA compliance for health data
   - PII protection per Red Cross guidelines
   - Audit logging for all data access

3. **Backup Strategy**
   - Continuous replication to secondary region
   - Daily snapshots with 30-day retention
   - Point-in-time recovery capability

---

## Performance Targets

### Metrics
- Initial page load: < 2 seconds
- Time to interactive: < 3 seconds
- API response time: < 200ms (p95)
- Offline-to-online sync: < 10 seconds
- PDF generation: < 5 seconds

### Optimization Strategies

1. **Frontend**
   - Code splitting by route
   - Lazy loading of heavy components
   - Virtual scrolling for large lists
   - Image optimization with next/image

2. **Backend**
   - Database query optimization
   - Redis caching layer
   - CDN for static assets
   - Edge functions for geo-distributed access

3. **Real-time**
   - WebSocket connection pooling
   - Binary protocol for event streaming
   - Debounced sync for high-frequency updates

---

## Testing Strategy

### Unit Testing
```typescript
// Example: County selection logic
describe('CountySelector', () => {
  test('filters counties by region', () => {
    const counties = getRegionCounties('Northern California');
    expect(counties).toHaveLength(48);
    expect(counties[0].state).toBe('CA');
  });
  
  test('calculates affected chapters', () => {
    const chapters = getAffectedChapters(selectedCounties);
    expect(chapters).toContain('Bay Area Chapter');
  });
});
```

### Integration Testing
```typescript
// Example: Operation creation flow
describe('Operation Creation', () => {
  test('complete setup wizard flow', async () => {
    const operation = await createOperation({
      name: 'Hurricane Response 2024',
      region: 'South Florida',
      counties: ['Miami-Dade', 'Broward']
    });
    
    expect(operation.id).toBeDefined();
    expect(operation.geography).toHaveLength(2);
    expect(operation.iap).toBeDefined();
  });
});
```

### End-to-End Testing
```typescript
// Playwright test example
test('disaster operation lifecycle', async ({ page }) => {
  // Create operation
  await page.goto('/operations/new');
  await page.fill('[name="operationName"]', 'Test Operation');
  await page.click('text=Next');
  
  // Select counties
  await page.selectOption('[name="region"]', 'Northern California');
  await page.check('text=Alameda County');
  await page.click('text=Next');
  
  // Complete setup
  await page.click('text=Create Operation');
  
  // Verify IAP generated
  await expect(page).toHaveURL(/\/operations\/\w+\/iap/);
});
```

---

## Deployment Guide

### Environment Configuration

```bash
# .env.production
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
REDIS_URL=redis://...
MAPBOX_TOKEN=...
SENTRY_DSN=...
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v3
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Monitoring & Observability

1. **Application Monitoring**
   - Sentry for error tracking
   - Vercel Analytics for performance
   - Custom dashboards in Grafana

2. **Infrastructure Monitoring**
   - Supabase dashboard for database metrics
   - CloudWatch for AWS resources
   - Uptime monitoring with Pingdom

3. **User Analytics**
   - Plausible for privacy-focused analytics
   - Custom event tracking for operations
   - Usage reports for stakeholders

---

## Support & Maintenance

### Documentation
- User guide with video tutorials
- API documentation with examples
- Administrator handbook
- Disaster response playbooks

### Training Program
1. Basic operator training (4 hours)
2. Section chief certification (8 hours)
3. System administrator course (16 hours)
4. Train-the-trainer program

### Support Channels
- 24/7 emergency hotline during disasters
- Slack workspace for operators
- Knowledge base with FAQs
- Monthly user group meetings

---

## Cost Analysis

### Infrastructure Costs (Monthly)
- Vercel Pro: $20/user
- Supabase Pro: $25/project
- Mapbox: $0-500 (usage-based)
- Cloudflare R2: $0.015/GB stored
- Total: ~$500-1000/month

### Development Investment
- Initial development: 12 weeks
- Testing & refinement: 4 weeks
- Training & documentation: 2 weeks
- Total: 18 weeks

### ROI Projection
- Time saved per operation: 40%
- Error reduction: 75%
- Multi-operation support: 10x capacity
- Payback period: 6 months

---

## Success Metrics

### Operational Metrics
- Operations managed simultaneously
- Time from activation to first IAP
- User satisfaction scores
- System uptime percentage

### Impact Metrics
- People served per operation
- Response time improvements
- Resource utilization efficiency
- Cross-chapter collaboration instances

### Technical Metrics
- Code coverage (target: 80%)
- Performance budget adherence
- Security vulnerability score
- API response times

---

## Conclusion

The Disaster Operations Platform v3 represents a transformational leap in Red Cross disaster response capability. By building on lessons learned from v2 and implementing a robust, scalable architecture from the ground up, this system will serve as the digital backbone for disaster operations nationwide.

The dual-database architecture ensures both immediate operational needs and long-term organizational learning are served. The event-driven design enables real-time collaboration while maintaining comprehensive audit trails. Most importantly, the offline-first approach ensures that when disasters strike and infrastructure fails, Red Cross operations continue without interruption.

This platform will empower Red Cross volunteers and staff to focus on what matters most - helping people in their time of greatest need - while the technology handles the complexity of coordination, documentation, and compliance.

---

## Appendices

### A. Glossary of Terms
- **IAP**: Incident Action Plan
- **ICS**: Incident Command System  
- **IC**: Incident Commander
- **DR**: Disaster Relief operation number
- **ARC**: American Red Cross
- **FIPS**: Federal Information Processing Standards (county codes)

### B. Red Cross Organizational Structure
- 7 Divisions
- 60 Regions
- 250+ Chapters
- 50 States + Territories

### C. Technology Stack Versions
- Node.js 20 LTS
- React 19
- Next.js 15
- TypeScript 5.3
- PostgreSQL 16
- SQLite 3.44

### D. Contact Information
- Technical Lead: [Position]
- Product Owner: [Position]
- Emergency Support: [24/7 Hotline]
- Documentation: [Internal Wiki URL]

---

*Document Version: 3.0.0*  
*Last Updated: December 2024*  
*Classification: Red Cross Internal*