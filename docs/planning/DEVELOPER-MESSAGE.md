# Developer Message - Jeff Franzen
## Vision and Requirements for IAP Management System

---

**Date:** September 4, 2025  
**Project:** IAP Management System for Red Cross Disaster Relief Operations  
**Status:** Foundation Complete, Ready for Systematic Development  

---

## 💭 **My Vision & Requirements**

First and most importantly, I just want to make sure we understand the global project. Fundamentally, in the disaster, we are trying to account for:
1. Locations
2. Personnel
3. Assets

We do that within different disciplines, whether it's feeding, shelter, et cetera.

Historically, we've all used one shared spreadsheet, each discipline getting their own tab, and each discipline setting up different locations. For each location, they list their personnel and assets.

The type of personnel, the type of assets, and even the type of locations can vary. For example, some locations can be mobile or some locations might be a truck or a kitchen.

Historically, we have had a macro within that spreadsheet that both consolidated all this information and gave us a tabular layout that we would then embed into a Word document as part of the IAP.

Obviously, there are a lot of problems with that:
- The spreadsheet would break
- People didn't understand how to work it
- It was too complicated

I'm trying to give us a simpler, more solid approach where each group has their own page where they'll set up their different facilities, locations, and add their personnel and asset requirements, and that will all feed into tables on our IAP.

I've been told that in order to do this, the proper approach is to use many, many different databases and tables. Tables for locations, tables for assets, tables for gaps, et cetera.

In addition to this fundamental process, we also have what's called the IAP. The IAP has many other components ranging from a photo on the cover page to a message from the director to different priorities we set to organizational charts to just a variety of random messages about where to park, how to sign out, and how to use a rental car. So the IAP needs to be flexible to allow for a variety of additional ancillary inputs unrelated to the overall process of assets, personnel, and locations.

I think the organization is used to the IAP's look, and for me to overhaul the entire system from spreadsheets, I think it's important that the final output of an IAP looks very similar to the existing one.

I know we want to keep the IAP current throughout the day, but there is some logic to having the IAP issued at 6pm. It is a wrap up of everything that was accomplished for that day and what is the plan for tomorrow, so we can't necessarily be changing it throughout the day. We can be updating it, but the actual printout is probably still a 6pm printout.Very similar to how we do it today. So, the people who will be working on the editor and the IAP will only be those who have special access. All the other groups will only have access to their specific components, for example, feeding, sheltering, etc.

It'll be Information and Planning Group's role to update all the balances (like the photo, like all the ancillary notes throughout the day). We will also be updating the roster, the organizational chart, et cetera. And we will be making sure that the updates from all the disciplines are properly being updated and the tabular inputs into the IAP are accurate.

Below is a crisp, build-ready statement of record for the project. Use this as the north star for design, implementation, and stakeholder reviews.

Project Charter (v0.1)

Goal

Replace the fragile, multi-tab spreadsheet with a resilient system that accounts for Locations, Personnel, and Assets across disciplines (Shelter, Feeding, Logistics, etc.) and produces an IAP that looks like the current IAP.

Core Principles
	•	Three pillars: Locations, Personnel, Assets. Everything maps to these.
	•	Discipline views; one database: Each discipline works in its own page, but all data lands in a single, normalized store.
	•	Operational Periods: All edits are scoped to an Incident + OP; roll forward between OPs.
	•	Req/Have/Gap is first-class, not a spreadsheet formula.
	•	Publish once daily: Continuous edits all day; freeze & publish IAP at 18:00.
	•	Access control: IP owns IAP editing/publishing and shared elements (roster, org chart, cover, notes). Disciplines own only their pages.

⸻

Domain Model (minimum tables)

Incident(id, name, DR#, status, start/end)
OperationalPeriod(id, incident_id, number, start_ts, end_ts, approved_by)

Discipline(code, name) — e.g., MC(Feeding), SHEL, LOG, IP

WorkSite(id, incident_id, type, name, address, county, lat, lon, mobility_flag)
	•	type examples: Managed Client Shelter, Staff Shelter, Mobile Feeding Unit, Kitchen, Warehouse, POD, EOC.

WorkAssignment(id, op_id, site_id, discipline_code, task, report_time, hours, notes)

PositionCatalog(code, title, discipline_code) — the authoritative list (GAP roles)
Contact(id, name, phone, email, org)
RosterAssignment(id, work_assignment_id, contact_id, position_code, shift[Day|Night|Custom], start_ts, end_ts, status)

AssetType(code, name, unit) — cots, blankets, toilets, laptops, radios, showers, etc.
AssetAllocation(id, work_assignment_id, asset_code, req, have, gap, notes)

CapabilityPlan(id, work_assignment_id, position_code, req, have, gap) — staffing Req/Have/Gap per WA/role

Objective(id, op_id, priority, description, owner_contact_id, due_ts, status)
ActionItem(id, op_id, title, owner, due_ts, status, notes)

IAPContent(id, incident_id, op_id, section, body_html/md, sort_order) — cover message, parking notes, rental car policy, etc.
OrgChartNode(id, op_id, role_title, contact_id, parent_id, section)
ScheduleItem(id, incident_id, when_ts, product, audience, location/link)

IDs: ULIDs. All tables include created_ts, updated_ts, created_by, updated_by.

Temporary (offline) store

Mirror of the above + EventLog(event_id, ts, actor, entity, entity_id, payload_json, sync_state).
Write to temp first; sync to permanent when online (idempotent upsert).

⸻

Permissions
	•	Discipline Editors: CRUD on their WorkSites, WorkAssignments, CapabilityPlan, AssetAllocation, RosterAssignment within their discipline. No IAP publish rights.
	•	IP Editors: Full read of all; CRUD for IAPContent, OrgChartNode, ScheduleItem, Objectives/ActionItems, master roster; can fix data across disciplines when needed.
	•	Publishers (IP): Freeze OP at 18:00, generate IAP, version/tag, release.

⸻

User Experience (high level)
	1.	Discipline Console
	•	Header: Incident + OP selector (defaults to current OP).
	•	“Create Work Assignment”: pick Site (existing or new), Discipline template, Report time, Shifts.
	•	Req/Have/Gap grid for Positions and Assets (color-coded).
	•	Roster picker (autocomplete from Contact/Directory); Day/Night slots.
	•	Save = emits events (works offline); auto gap calc.
	2.	IP Console
	•	Objectives editor + “Significant actions.”
	•	Org Chart builder (drag-and-drop from Contacts).
	•	Daily Schedule editor.
	•	Ancillary Sections (cover photo + director note + parking, rental cars, signage, etc.).
	•	Roster Master view; quick fix phone numbers.
	•	IAP Preview (exact house style).
	3.	IAP Publisher
	•	Status panel: validation (missing leads, negative gaps, blank phones).
	•	Freeze OP → stamps OP, locks discipline edits for the publishing window.
	•	Generate PDF/HTML package (sections match legacy IAP).
	•	Versioning: OP N (v1, v2 if republished). Link posted to distro.

⸻

Daily Workflow
	•	All day: Disciplines update Sites, Assignments, Req/Have/Gap, Rosters. IP updates shared content.
	•	17:00: Validation run + exception list back to disciplines.
	•	18:00: IP freezes OP, renders IAP, publishes.
	•	Post-publish edits: land in next OP (or bump minor version if critical errata).

⸻

Migration Plan (from spreadsheet)
	1.	Map each tab to (Discipline, WorkSite*, WorkAssignment) rows.
	2.	Parse columns into:
	•	CapabilityPlan for staffing counts (Req/Have/Gap).
	•	AssetAllocation for material counts (Req/Have/Gap).
	•	RosterAssignment for Day/Night leaders.
	3.	Validate: unknown role names → map to PositionCatalog; unknown assets → AssetType add.
	4.	Import script writes events to temp store, then syncs permanent DB.

⸻

Reporting & Outputs
	•	IAP Pack: Cover → Director’s Message → Priorities/Objectives → Org Chart → Work Assignments (tabular) → Work Sites → Contact Roster → Daily Schedule → Action Tracker → Annexes.
	•	Discipline extracts: per-discipline gap table, roster by site/shift.
	•	Ops Dash: Top gaps, sites missing leads, assets shortfalls by county/zone.

⸻

Non-Negotiables (design guardrails)
	•	Single normalized schema; no hidden spreadsheet logic.
	•	All counts are integers; gap = req − have computed server-side.
	•	Every record tied to (incident_id, op_id) (except catalogs).
	•	Authoritative catalogs: PositionCatalog and AssetType (seeded; editable by IP only).
	•	Strict audit trail via EventLog.

⸻

MVP vs. Next

MVP (phase 1)
	•	Tables above + discipline console + IP console + freeze/publish at 18:00.
	•	IAP PDF that matches current look.
	•	Spreadsheet importer.
	•	Offline capture on web (IndexedDB) with sync.

Next (phase 2)
	•	Templates per site type (auto-seed roles/assets).
	•	Geo roll-ups by county/zone; heatmaps.
	•	Directory sync (VC export) and phone validation.
	•	SLA checks (e.g., cot/client ratios, ADA fixtures).
	•	API for dashboard/ArcGIS embedding.

⸻

Acceptance Criteria (MVP)
	•	A Shelter lead can create a Work Assignment, add staffing/asset Req/Have, assign Day/Night leads, and see Gap computed without Excel.
	•	IP can assemble Org Chart, Objectives, Notes, and publish a pixel-consistent IAP at 18:00.
	•	Import of a legacy spreadsheet yields identical tabular IAP sections.
	•	Offline edit, later online sync, results in correct permanent records (no duplicates).
	•	Role/asset names in outputs come from catalogs (no free-text drift).

⸻

    
---

**This document is your space to ensure the development stays aligned with real operational needs. Feel free to ramble, brainstorm, or capture any thoughts that will help build the right system.**
