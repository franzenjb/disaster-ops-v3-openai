'use client';

import { Operation } from '@/types';

interface OperationDashboardProps {
  operation: Operation;
}

export function OperationDashboard({ operation }: OperationDashboardProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Operation Dashboard</h2>
      <div className="card">
        <h3 className="text-lg font-semibold">{operation.operationName}</h3>
        <p>Operation Number: {operation.operationNumber}</p>
        <p>Status: {operation.status}</p>
        <p>Type: {operation.disasterType}</p>
        <p>Created: {new Date(operation.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}