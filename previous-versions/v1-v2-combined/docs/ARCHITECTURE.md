# Disaster Operations Platform - Architecture

## Mission Critical Requirements
- **20-year lifespan** - Built for long-term maintainability
- **50 states + territories** - Must handle regional variations  
- **Hundreds of concurrent users** - Real-time collaboration
- **Disaster-proof** - Works offline, syncs when connected
- **Zero data loss** - Every keystroke saved

## Core Principles

### 1. Single Source of Truth
One data model drives everything. No duplicate state, no synchronization bugs.

```typescript
interface DisasterOperation {
  id: string;              // DR-2024-FL-001
  metadata: OperationMeta;
  regions: Region[];
  serviceLines: ServiceData;
  iap: IAPDocument;        // ONE unified IAP, always live, always editable
  audit: AuditTrail[];
}
```

### 2. Event-Driven Architecture
Every change is an event. This enables:
- Real-time collaboration
- Offline sync
- Complete audit trail
- Undo/redo functionality

```typescript
interface OperationEvent {
  id: string;
  timestamp: number;
  userId: string;
  type: EventType;
  payload: any;
  reversible: boolean;
}
```

### 3. IAP as Living Document
**NO SEPARATE BUILDER AND VIEWER**
- One IAP that's always live
- Edit-in-place with permissions
- Auto-saves every change
- Version history for rollback
- Print/export current state anytime

### 4. Progressive Enhancement
Start simple, enhance over time:
1. **Phase 1**: Single-user, localStorage
2. **Phase 2**: Multi-user, PostgreSQL  
3. **Phase 3**: Real-time, WebSockets
4. **Phase 4**: Offline-first, PWA

## Data Flow Architecture

```
User Input → Validation → Event Creation → State Update → Persistence → UI Update
                                              ↓
                                         Sync Queue → Server → Other Clients
```

## Technology Stack

### Core (Phase 1 - Immediate)
- **React 18** - Proven, stable, huge ecosystem
- **TypeScript** - Type safety for 20-year maintenance
- **Zustand** - Simple state management
- **Vite** - Fast builds
- **Tailwind CSS** - Consistent styling

### Enhancement (Phase 2 - 3 months)
- **Supabase** - PostgreSQL + real-time + auth
- **React Query** - Server state management
- **PWA** - Offline capability

### Scale (Phase 3 - 6 months)  
- **Redis** - Caching layer
- **S3** - File storage
- **CloudFront** - Global CDN

## File Structure
```
src/
  core/
    DisasterOperation.ts    # Main data model
    EventBus.ts            # Event system
    
  services/
    DataService.ts         # Persistence layer
    SyncService.ts         # Offline/online sync
    ValidationService.ts   # Data validation
    
  models/
    Region.ts
    ServiceLine.ts
    IAPDocument.ts
    
  components/
    iap/
      IAPEditor.tsx        # Unified IAP component
      IAPSection.tsx       # Editable sections
    maps/
      OperationsMap.tsx    # ONE map component
    forms/
      ServiceLineForm.tsx
      
  stores/
    useOperationStore.ts   # Zustand store
    
tests/
  DisasterOperation.test.ts
  IAPEditor.test.tsx
```

## Why This Architecture Wins

1. **Maintainable**: Clean separation of concerns
2. **Scalable**: Can grow from 1 to 10,000 users
3. **Reliable**: Every change tracked and reversible
4. **Fast**: Optimistic updates with background sync
5. **Flexible**: Regional customization without forking

## Migration Path from 5266-v2

1. Core data structures (Week 1)
2. Service line forms (Week 2)
3. Unified IAP editor (Week 3)
4. Import existing localStorage data (Week 4)

## Success Metrics

- Page load < 2 seconds
- Auto-save < 100ms
- Offline-to-online sync < 5 seconds
- Zero data loss in 1 million operations
- Works on 5-year-old tablets