# IAP System Analysis Report
## Disaster Operations v3 - Incident Action Plan Architecture Review

### Executive Summary

The disaster-ops-v3 IAP system exhibits significant architectural inconsistencies that create role-based access disparities and content generation issues. The primary problem is that different viewers (IP Editor vs IP Viewer) use fundamentally different approaches to section management, leading to varying section counts and content accessibility.

## 1. IAP Document Structure Analysis

### Core Components Identified

1. **IAPDocument.tsx** - Full 53-page accordion-style viewer with all sections
2. **IAPViewer.tsx** - Page-by-page viewer with fixed 53-page structure  
3. **IAPViewerDynamic.tsx** - Content-based dynamic section filtering
4. **RealIAPViewer.tsx** - Simplified 10-section view for essential content

### Document Architecture Issues

The system defines **15 complete sections** across all components:
- Cover Page & Checklist
- Director's Intent/Message
- Contact Roster DRO HQ
- Incident Organization Chart
- Incident Priorities and Objectives
- DRO - Sheltering Resources
- Work Assignments - Feeding
- Work Assignments - Government Operations
- Work Assignments - Damage Assessment
- Work Assignments - Distribution
- Work Assignments - Individual Disaster Care
- Work Sites and Facilities
- Daily Schedule
- Maps and Geographic Information
- Appendices and References

However, **IP Viewer shows only 11 sections** due to dynamic content filtering.

## 2. 53-Page Document Generation Issues

### PDF Generation Problems

The **IAPPdfGenerator.ts** attempts to create a 53-page document but has several critical flaws:

```typescript
private totalPages = 53; // Hard-coded expectation
```

**Issues Identified:**
1. **Hard-coded page expectations** don't match dynamic content reality
2. **No content validation** before PDF generation
3. **Missing page mapping** between logical sections and physical pages
4. **Inconsistent page numbering** across different viewers

### Page Structure Inconsistencies

- **IAPDocument**: Uses accordion sections (not page-based)
- **IAPViewer**: Implements true page-by-page navigation (1-53)
- **IAPViewerDynamic**: Dynamic sections with no page concept
- **RealIAPViewer**: Simplified page references

## 3. Role-Based Access Control Analysis

### IAP Role Definitions

```typescript
export type IAPRole = 
  | 'ip_group'      // I&P Group - full IAP editing access
  | 'discipline'    // Discipline Teams - facility-specific access
  | 'field'         // Field Teams - read-only assignments
  | 'viewer';       // Viewer - view-only published IAPs
```

### Access Control Implementation Problems

#### IAPProjector.ts Access Logic
```typescript
checkFacilityAccess(userId: string, userIAPRole: string, facilityId: string): boolean {
  switch (userIAPRole) {
    case 'ip_group':
      return true; // Full access
    case 'discipline':
      return facility?.personnel.some(p => p.personId === userId) || false;
    case 'field':
      return fieldFacility?.personnel.some(p => p.personId === userId) || false;
    default:
      return false;
  }
}
```

**Critical Issues:**
1. **No section-level access control** - only facility-level
2. **Missing integration** between role checking and component rendering
3. **Hard-coded role logic** in projector instead of centralized RBAC
4. **No dynamic section filtering** based on user roles

## 4. Content Management Problems

### Dynamic Content Filtering Inconsistencies

**IAPViewerDynamic.tsx** implements content filtering:
```typescript
const allSections: IAPSection[] = useMemo(() => {
  const sections = [...];
  
  // Filter to only include sections with content
  return sections
    .filter(section => section.hasContent)
    .sort((a, b) => a.priority - b.priority);
}, []);
```

**Problems:**
1. **Inconsistent `hasContent` logic** across sections
2. **Static data dependency** - doesn't check real-time content
3. **No role-based filtering** integration
4. **Missing content validation** for complex sections

### Content Population Issues

**Data Source Problems:**
- **V27_IAP_DATA** provides static sample data only
- **No real-time data integration** with operational systems
- **Missing event sourcing** connection for live updates
- **Placeholder components** for many sections

## 5. Event Sourcing Integration Gaps

### IAPProjector Implementation Analysis

The **IAPProjector.ts** defines comprehensive event handling:

```typescript
async processEvent(event: Event): Promise<void> {
  switch (event.type) {
    case EventType.IAP_CREATED:
    case EventType.FACILITY_CREATED:
    case EventType.DIRECTORS_MESSAGE_UPDATED:
    // ... many more event types
  }
}
```

**Integration Problems:**
1. **No connection** between projector and UI components
2. **Missing real-time updates** - components use static data
3. **Event handlers are placeholders** - not fully implemented
4. **No subscription mechanism** for live IAP updates

### Missing Event Flow

```
Expected: Event → Projector → Component State → UI Update
Actual: Static Data → Component → UI (no updates)
```

## 6. Key Findings

### Why IP Editor Shows All Sections but IP Viewer Shows 11

1. **IP Editor** (IAPDocument.tsx):
   - Uses **static section definition** - always shows all 15 sections
   - **No content filtering** - displays sections regardless of data
   - **No role-based restrictions** implemented

2. **IP Viewer** (IAPViewerDynamic.tsx):
   - Uses **dynamic content filtering** via `hasContent` logic
   - **Filters empty sections** - reduces 15 sections to 11
   - **Content validation fails** for sections without proper data

### Content Generation Problems

1. **Static vs Dynamic Mismatch**: Different components expect different data structures
2. **Missing Content Validation**: No consistent way to check if sections have meaningful content
3. **Role Access Not Implemented**: Role-based filtering exists in theory but not in practice
4. **Event Sourcing Disconnect**: Live data updates don't reach the UI components

## 7. Recommendations

### Immediate Fixes

1. **Standardize Section Management**
   - Create a single `IAPSectionManager` class
   - Implement consistent content validation
   - Unify section filtering logic

2. **Implement True Role-Based Access**
   ```typescript
   interface IAPSection {
     id: string;
     title: string;
     component: React.ReactNode;
     requiredRoles: IAPRole[];
     hasContent: (data: IAPData, userRole: IAPRole) => boolean;
   }
   ```

3. **Fix Event Sourcing Integration**
   - Connect IAPProjector to React components via context
   - Implement real-time subscription mechanism
   - Replace static V27_IAP_DATA with live projections

4. **Resolve PDF Generation**
   - Make page count dynamic based on actual content
   - Implement proper page mapping
   - Add content validation before PDF export

### Architectural Improvements

1. **Centralized IAP State Management**
2. **Unified Section Definition System** 
3. **Role-Based Component Rendering**
4. **Real-Time Data Integration**
5. **Comprehensive Content Validation Framework**

## Conclusion

The IAP system suffers from architectural inconsistencies that create the observed discrepancies between IP Editor and IP Viewer. The root cause is the lack of a unified approach to section management, content validation, and role-based access control. Implementing the recommended fixes will resolve the section count differences and create a more robust, maintainable IAP system.