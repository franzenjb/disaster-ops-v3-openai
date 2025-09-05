'use client';

import { OperationDashboard } from '@/components/OperationDashboard';
import type { Operation } from '@/types';

export default function Home() {
  // Create mock operation immediately
  const mockOperation: Operation = {
    id: 'demo-op',
    operationNumber: 'DEMO-001',
    operationName: 'Demo Operation',
    disasterType: 'hurricane',
    status: 'active',
    activationLevel: 'level_2',
    createdAt: new Date(),
    createdBy: 'demo-user',
    geography: { regions: [], states: [], counties: [], chapters: [] },
    metadata: { serviceLinesActivated: [] }
  };

  // Go directly to OperationDashboard which shows the IAP document
  return <OperationDashboard operation={mockOperation} />;
}