# Next Features Discussion

## ✅ Completed Just Now:
1. **Full Width IAP** - Removed width constraints, now uses full page

## 🎯 Items to Implement:

### 1. **Region/County Selector Tab** 
**Current Thought:** Add as a new tab called "Setup" or "Area"

**Features:**
- Interactive map for selecting counties
- Shows which chapters cover selected areas
- Populates affected counties list
- Could show demographics/resources per county

**Where it should live:**
- Option A: New tab in main operation view (Setup | IAP | Event Log)
- Option B: Enhanced "Start Operation" screen before entering main view
- **Recommendation:** Option A - Make it accessible anytime as "Area Setup" tab

### 2. **Editable IAP Headers/Footers**
**Current State:** Headers show hardcoded operation info

**What needs to be editable:**
- Operation Name (currently "DR 220-25 FLOCOM")
- IAP Number (currently "#54")
- Operational Period dates/times
- Page numbering format
- Footer information

**Where to edit:**
- Option A: Settings button on IAP control bar
- Option B: First page of IAP has all meta fields
- **Recommendation:** Settings modal from IAP control bar

### 3. **Org Chart → IAP Integration** 
**Status:** ✅ ALREADY WORKING!
- Roster entered in Org Chart tab
- Automatically flows to IAP Page 4 (Contact Roster)
- Automatically flows to IAP Page 5 (Organization Chart)

## 📋 Implementation Priority:

### Quick Wins (Do First):
1. **IAP Header/Footer Settings** - Add settings button to IAP control bar
   - Modal with fields for operation name, IAP number, dates
   - Store in `useOperationStore`

### Medium Effort:
2. **Region/County Selector** - New tab with map
   - Use existing county selection code
   - Add chapter lookup data
   - Show resources per county

### Future Enhancements:
- Print formatting optimizations
- PDF export with proper pagination
- Real-time collaboration indicators
- Change history/audit trail
- Role-based permissions

## Code Locations:
- IAP Headers: `/src/components/iap/IAPLayout.tsx`
- Operation Store: `/src/stores/useOperationStore.ts`
- County Map: `/src/components/USCountyMap.tsx` (can reuse)
- Tab Navigation: `/src/components/OperationDashboard.tsx`