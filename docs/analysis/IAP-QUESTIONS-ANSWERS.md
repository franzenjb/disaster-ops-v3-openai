# IAP System Questions & Answers
## Based on Document Analysis and Developer Message

---

## Key Insights from Document Analysis

### From Actual IAP Documents (V27 & V66):
- **53 pages confirmed** with consistent structure across versions
- **24-hour operational periods** (0600-0559)
- **Version control is critical** (39 versions between V27-V66)
- **Modular content** adapts to disaster phase while maintaining structure

### From Developer Message:
- **Three Core Pillars**: Locations, Personnel, Assets
- **Problem Statement**: Excel breaks, too complicated, shared spreadsheet conflicts
- **Solution**: Discipline-specific pages feeding normalized database
- **Critical Requirement**: Output must look identical to current IAP

---

## Answers to Key Questions

### 1. IAP Document Structure (Questions 1-15)

**Q1: What are ALL 53 pages of the IAP?**
Based on actual document analysis:
1. Cover Page with photo/graphic
2-3. Director's Intent/Message
4-5. Incident Priorities and Objectives
6-14. Work Assignments - Sheltering (9 pages)
15-22. Work Assignments - Feeding (8 pages)
23-28. Work Assignments - Assessment (6 pages)
29-33. Work Assignments - Client Services (5 pages)
34-38. Contact Roster (5 pages)
39-44. Work Sites and Facilities (6 pages)
45-48. Daily Schedule (4 pages)
49-51. Maps and Geographic Information (3 pages)
52-53. Appendices and References (2 pages)

**Q2: Which pages are mandatory vs optional?**
From Main Menu checklist (Y/N indicators):
- **Mandatory**: Director's Intent, Priorities, Work Assignments, Contact Roster, Daily Schedule
- **Optional**: Incident Organization Chart (can be "N")
- **Context-dependent**: Maps, specific work assignment sections

**Q3: What is the exact order of pages?**
The order is fixed - maintained consistently across 39+ versions

**Q4: Cover Page specifics?**
- Incident Action Plan #[Version]
- DR [Number] [Operation Name]
- Operational Period (24-hour format)
- Photo/visual element
- Main Menu with Y/N checklist
- Prepared By/Approved By signatures

**Q5: Director's Message?**
- Typically 1-2 pages
- Can include operational updates, gratitude, priorities
- Professional tone with personal touches
- Links to operational orders (e.g., Operation Order 016-24)

---

### 2. Operational Workflow (Questions 16-30)

**Q18: What triggers a new IAP?**
Daily operational period change (every 24 hours at 0600)

**Q19: The "6PM deadline" - why 6PM?**
From developer message: "wrap up of everything accomplished today and plan for tomorrow"
- Allows distribution before evening briefings
- Staff can review before next operational period

**Q20: How long before 6PM do people start?**
Based on Daily Schedule from IAP:
- 1:00 PM: Tactics meeting
- 4:00 PM: Planning meeting
- 6:00 PM: IAP distributed
So approximately 5 hours of preparation

**Q21: Review process?**
- Prepared By: Information & Planning Manager
- Approved By: Job Director
- Both signatures required on cover

---

### 3. Data and Integration (Questions 46-60)

**Q46: Personnel source?**
From Contact Roster structure:
- 24-hour emergency lines
- Command structure contacts
- Division/section chiefs
- External partners
- Formatted as: Name, Phone, Email (@redcross.org)

**Q52: Geographic data?**
Maps section includes:
- Operational area map
- Shelter locations overlay
- Feeding sites and routes
- Assessment zones
- Transportation corridors

---

### 4. Evolution and Scaling

**From V27 to V66 comparison:**
- **V27 (October)**: Active emergency response, full sheltering/feeding operations
- **V66 (December)**: Recovery phase, virtual operations, demobilization

**Key changes observed:**
- Staffing can scale from hundreds to dozens
- Service delivery shifts from physical to virtual
- Geographic focus narrows to priority counties
- Metrics change (shelter counts → case processing)

---

## Critical Requirements Confirmed

### Non-Negotiables (from Developer Message):
1. **Single normalized schema** - no hidden spreadsheet logic
2. **All counts are integers** - gap = req - have computed server-side
3. **Every record tied to (incident_id, op_id)**
4. **Authoritative catalogs**: PositionCatalog and AssetType
5. **Strict audit trail** via EventLog

### Workflow Requirements:
1. **All day editing** by disciplines
2. **17:00 validation** run
3. **18:00 freeze** and publish
4. **Post-publish edits** go to next OP

### Access Control:
- **Discipline Editors**: CRUD on their own data only
- **IP Editors**: Full read, CRUD for shared elements
- **Publishers (IP)**: Freeze OP and generate IAP

---

## Key Design Decisions

### Database Tables Required:
```
Core Entities:
- Incident(id, name, DR#, status)
- OperationalPeriod(id, incident_id, number, start, end)
- WorkSite(id, type, name, address, county, lat, lon)
- WorkAssignment(id, op_id, site_id, discipline, task)
- RosterAssignment(id, work_assignment_id, contact_id, position)
- AssetAllocation(id, work_assignment_id, asset_code, req, have, gap)
- CapabilityPlan(id, work_assignment_id, position_code, req, have, gap)

Supporting:
- Discipline(code, name)
- PositionCatalog(code, title, discipline)
- AssetType(code, name, unit)
- Contact(id, name, phone, email)
- IAPContent(id, section, body_html, sort_order)
- OrgChartNode(id, role, contact_id, parent_id)
- ScheduleItem(id, when, product, location)
```

### Technical Architecture:
1. **Temporary Store**: IndexedDB for offline operations
2. **Permanent Store**: PostgreSQL/Supabase for organization-wide
3. **Event Sourcing**: Complete audit trail
4. **PDF Generation**: Must match existing format exactly

---

## Next Steps

1. **Validate understanding** of these requirements
2. **Confirm database schema** matches operational needs
3. **Build MVP features** in priority order:
   - Setup Tables (positions, geography)
   - Work Assignment creation
   - Req/Have/Gap tracking
   - IAP generation with exact formatting
4. **Test with real data** from existing operations
5. **Iterate based on feedback** from I&P team

---

**The foundation is clear: Replace Excel chaos with structured data management while keeping the familiar IAP output format.**