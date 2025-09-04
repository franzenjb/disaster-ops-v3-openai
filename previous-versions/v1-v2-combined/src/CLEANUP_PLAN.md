# 🧹 Codebase Cleanup Plan

## Current Issues Found

### 1. **Duplicate/Unused IAP Components**
- ❌ `IAPFull.tsx` - Not used, early version
- ❌ `IAPEnhanced.tsx` - Not used, intermediate version  
- ❌ `IAPWithEditMode.tsx` - Not used, replaced by IAPDocumentComplete
- ❌ `IAPDocument.tsx` - Old version, replaced by IAPDocumentComplete
- ✅ `IAPDocumentComplete.tsx` - **KEEP** - Current production version
- ⚠️ `UnifiedIAP.tsx` - Could be simplified (just returns IAPDocumentComplete)

### 2. **Duplicate ICS215 Components**
- ❌ `ICS215GuidedEntry.tsx` - V1, not used
- ❌ `ICS215GuidedEntryV2.tsx` - V2, not used
- ✅ `ICS215GuidedEntryV3.tsx` - **KEEP** - Current version

### 3. **Code Duplication in IAPDocumentComplete**
- Contains old ContactRosterPage function (renamed to OldContactRosterPage)
- Very long file (800+ lines) with multiple page components inline

### 4. **Unclear Naming**
- `UnifiedIAP` doesn't unify anything anymore - just returns one component
- Multiple "Demo" components that are actually production

## Recommended Actions

### Immediate Cleanup (Safe to do now)
1. **Archive old IAP versions** to `src/components/iap/_archive/`
   - Move: IAPFull, IAPEnhanced, IAPWithEditMode, IAPDocument
   
2. **Archive old ICS215 versions** to `src/components/ics215/_archive/`
   - Move: ICS215GuidedEntry.tsx, ICS215GuidedEntryV2.tsx

3. **Simplify UnifiedIAP**
   - Either rename to `IAP.tsx` or merge directly into OperationDashboard

4. **Clean IAPDocumentComplete**
   - Remove OldContactRosterPage function
   - Extract inline page components to separate files

### Folder Structure Recommendation
```
src/
├── components/
│   ├── iap/
│   │   ├── IAP.tsx (main entry point)
│   │   ├── pages/
│   │   │   ├── ContactRosterPage.tsx
│   │   │   ├── OrganizationChartPage.tsx
│   │   │   ├── DirectorsMessagePage.tsx
│   │   │   ├── PrioritiesObjectivesPage.tsx
│   │   │   ├── WorkAssignmentsPage.tsx
│   │   │   ├── WorkSitesPage.tsx
│   │   │   ├── GeneralMessagesPage.tsx
│   │   │   └── DailySchedulePage.tsx
│   │   ├── shared/
│   │   │   ├── IAPLayout.tsx
│   │   │   ├── IAPCoverPage.tsx
│   │   │   ├── RichTextEditor.tsx
│   │   │   └── PhotoUploadCrop.tsx
│   │   └── _archive/ (old versions)
│   │
│   ├── ics215/
│   │   ├── ICS215.tsx (main entry point)
│   │   ├── ICS215GuidedEntry.tsx (rename V3)
│   │   ├── ICS215WorksheetView.tsx
│   │   ├── components/
│   │   ├── sections/
│   │   └── _archive/ (old versions)
│   │
│   └── org-chart/
│       └── OrgChartGenerator.tsx
│
├── stores/
│   ├── useOperationStore.ts
│   ├── useRosterStore.ts
│   ├── useICS215Store.ts
│   └── useICS215GridStore.ts
│
└── core/
    ├── EventBus.ts
    ├── DisasterOperation.ts
    └── types.ts
```

### Code Quality Improvements
1. **Add TypeScript interfaces** for all major data structures
2. **Extract constants** (like default rosters) to separate files
3. **Add JSDoc comments** to main functions and components
4. **Remove console.logs** from production code
5. **Consolidate duplicate styles** into Tailwind components

### Testing Needs
1. Ensure roster data syncs between all components
2. Test IAP page navigation
3. Verify edit/save functionality
4. Test export/import features

## Benefits of Cleanup
- 📉 Reduce bundle size by removing unused code
- 🎯 Clearer code organization
- 🚀 Faster development with better structure
- 📚 Easier onboarding for new developers
- 🐛 Fewer bugs from duplicate code

## Priority Order
1. **HIGH**: Remove unused components (quick win, no risk)
2. **HIGH**: Fix IAPDocumentComplete duplicate function
3. **MEDIUM**: Reorganize folder structure
4. **LOW**: Rename components for clarity
5. **LOW**: Extract and consolidate styles