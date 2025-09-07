# Red Cross 215 Class Lessons Learned

## Overview
This document extracts critical lessons from the Red Cross "215 class" training material (Information & Planning roles in disaster operations) to inform the development of our Red Cross Disaster Operations Platform. The 215 role is central to Incident Action Plan (IAP) generation, resource management, and operational coordination.

---

## 1. Key Red Cross Rules & Standards

### Six-Step Planning Process (Critical Framework)
**Steps 1-3: Outside Planning "P"**
1. **Form Collaborative Planning Team** - Initial response and assessment
2. **Understand the Situation** - Incident brief and assessment  
3. **Determine Goals and Objectives** - Review/revise incident priorities

**Steps 4-6: Inside Planning "P"** 
4. **Develop Plan** - Operations tactics meeting, develop work assignments and IAP preparation
5. **Prepare, Review, and Approve Plan** - Planning meeting, IAP approval and dissemination
6. **Implement and Maintain Plan** - Operations briefing, execute plan

### Information & Planning Table of Organization
- **Disaster Assessment Unit**
- **Documentation Unit** (Critical for 215 tools)
- **Situation Unit** 
- **Planning Support Unit**

### Documentation Unit Responsibilities
- Develops operational planning reports during disaster response
- **Compiles and distributes the Incident Action Plan (IAP)**
- Responsible for Contact Center Support
- Maintains files and records developed as part of IAP and Planning Processes
- Shares information about operations with all Red Cross workers

---

## 2. 215 Tool Guidelines & Critical Requirements

### Operations Planning Worksheet (Core Tool)
**Must-Have Features:**
- Resource tracking by category (personnel types, materials, vehicles)
- Available vs. Required vs. Have calculations
- Color-coded shortage indicators (orange = shortfall)
- Integration with Work Assignment generation
- **Must open in Excel desktop application for macro functionality**
- Password protection with controlled editing capabilities

### Work Assignment Generation Process
**Critical Requirements:**
1. Automated workbook builds each table for direct IAP incorporation
2. Step-by-step workflow: Select activity → Input resources → Create work assignments
3. **Must use desktop Excel version - macros required for work assignment creation**
4. Information required for Work Assignment (ICS 204):
   - Work shift details (Day/Night leaders with contact info)
   - Reporting time and location
   - Work assignment instructions
   - Resource identifiers and addresses

### IAP Structure Requirements
**Essential Components:**
- Title (version, DRO #, name, period date)
- Photo (ARC in action, with client permission)
- Documents Included/Table of Contents
- Director's Intent
- Contact Roster & Table of Organization
- Work Assignments
- Work Sites (ARC-specific)
- General Message
- Daily Schedule

---

## 3. Critical Compliance Requirements

### Personnel Evaluation System
- **Digital-only evaluations** - paper evaluations no longer accepted
- Evaluation must be completed before responder out-processes
- 7-day grace period after out-processing for evaluation completion
- Contact DWFSupportCenter@redcross.org for evaluation extensions
- Performance ratings: Exceeds Expectations, Meets Expectations, Needs Improvement, Not Observed

### DRO Team Roster Integration
- Must integrate with Volunteer Connection system
- Include names, contact information, and assignment details
- Track work assignment start dates, job duration, travel home dates
- Enable direct email/text communication with direct reports
- Support evaluation workflows and approval processes

### Microsoft Teams Integration Requirements
**Standard Team Site Structure:**
- **Public Channels:** General, Operations, Logistics
- **Private Channels:** Planning, Workforce (restricted access)
- **Additional Channels as needed:** External, Finance, District, Disaster Health Services, Disaster Mental Health

**File Management:**
- 5266 Data Collection Tools
- Contact Roster (for IAP)
- Published IAPs
- Advance Planning documentation
- Disaster Assessment materials
- Flash Reports
- Situational Awareness documents

---

## 4. Implementation Insights for Platform Development

### Operations Planning Workflow
**Core Process Flow:**
1. **Review Objectives** → Review Daily Equipment/Supplies/Vehicle Availability
2. **Review Material Needs** → Document Available Resources on Spreadsheet
3. **Select & Define Strategies/Tactics** → Request Input → Assess Resources Available
4. **Validate Tactics** → Tactics Meeting → Approval
5. Activity Managers provide supervisors with lists of assigned workers, materials, and vehicles

### Resource Management System Requirements
**Three-Tier Resource Tracking:**
- **Required:** Resources needed for next operational period
- **Have:** Resources already assigned to specific work assignments  
- **Need:** Shortfall calculation (Required - Have = Need)
- **Visual indicators:** Orange highlighting for shortfalls

### WebEOC WorkSites Dashboard Integration
- Real-time work location mapping and display
- Updated by Documentation Unit after Tactics Meeting
- Source data from Operations Planning Worksheet
- Support both public and non-public facing work sites
- Downloadable "snapshot" for IAP Work Sites page

---

## 5. Standards & Best Practices

### IAP Style Guidelines
**Content Strategy:**
- Less vs. More Content: Focus on essential information
- One document distributed to everyone
- Laptop vs. phone vs. printed accessibility
- **Accessibility requirement:** Two forms of visual distinction for text emphasis (not just color)

**Quality Control:**
- AD of Information & Planning and Job Director must review and approve all IAP materials
- Web addresses, email addresses, and phone numbers should be active links
- Verify all links throughout document as changes are made
- Assemble photo folder for use on future IAPs

### Daily Operational Timeline
**Documentation Unit Schedule:**
- **6:00 AM:** Setup Operations Worksheet, Setup IAP document
- **1:00 PM:** Tactics Meeting attendance
- **4:00 PM:** Planning Meeting participation  
- **5:30 PM:** 5266 Inputs due
- **6:00 PM:** IAP Distribution, Operations Briefing

### Contact Center Liaison Integration
**Daily Tasks:**
- 8 AM: Ensure resources showing on Shelters map and Disaster Relief Services Map
- 10 AM: Review RC Respond call requests in four categories
- 1 PM: Review service delivery sites during Tactics meeting
- 4 PM: Attend Planning Meeting, verify client service sites
- 5 PM: Confirm public service sites viewable, close outstanding RC Respond calls

---

## 6. Lessons Learned for Platform Development

### Critical Success Factors
1. **Excel Integration Mandatory:** Operations Planning Worksheet must maintain Excel compatibility with macro support
2. **Real-time Collaboration:** Microsoft Teams integration is organizational standard
3. **Resource Calculation Automation:** Automated Required/Have/Need calculations with visual shortage indicators
4. **IAP Generation Pipeline:** Seamless flow from planning worksheets to formatted IAP documents
5. **Mobile-Responsive Design:** Support laptop, tablet, and phone access patterns

### Technical Implementation Priorities
1. **Desktop Excel Compatibility:** Maintain macro functionality for work assignment generation
2. **WebEOC Integration:** Real-time dashboard updates and data synchronization  
3. **Volunteer Connection Integration:** Personnel roster and evaluation system connectivity
4. **RC Respond Integration:** Call management and service delivery tracking
5. **OneSource Resource Access:** Operational Planning Tool and IAP templates

### Operational Compliance Requirements
1. **Digital Evaluation System:** Replace paper evaluations with integrated digital workflow
2. **Performance Tracking:** Multi-tier evaluation system with automated reminders
3. **Document Version Control:** IAP versioning and approval workflow management
4. **Accessibility Standards:** Dual visual distinction requirements for content emphasis
5. **Security Controls:** Role-based access control for sensitive planning information

### Data Flow Architecture
**Core Information Pipeline:**
- Operations Planning Worksheet → Work Assignments → IAP Document → WebEOC Dashboard → Public Service Maps
- Resource availability data must flow bidirectionally between systems
- Real-time updates during Tactics and Planning meetings
- Automated IAP distribution at 6:00 PM operational period transition

---

## 7. Platform Development Recommendations

### Immediate Priorities
1. **Excel-Compatible Operations Planning Tool:** Maintain existing macro functionality while adding web-based enhancements
2. **IAP Template System:** Automated document generation with approval workflows
3. **Resource Management Dashboard:** Visual shortage indicators and real-time resource tracking
4. **Microsoft Teams Integration:** File sharing and collaboration workspace provisioning

### Long-term Enhancements  
1. **Mobile IAP App:** Offline-capable IAP access for field personnel
2. **Predictive Resource Planning:** Historical data analysis for resource forecasting
3. **Cross-DRO Resource Sharing:** Regional resource visibility and allocation
4. **Automated Compliance Monitoring:** Evaluation completion tracking and alerts

This analysis provides the foundational requirements for building Red Cross-compliant disaster operations tools that support the critical 215 Information & Planning functions while maintaining organizational standards and operational effectiveness.