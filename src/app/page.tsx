'use client';

import { useEffect, useState } from 'react';
import { SetupWizard } from '@/components/SetupWizard/SetupWizard';
import { OperationDashboard } from '@/components/OperationDashboard';
import type { Operation } from '@/types';

export default function Home() {
  const [currentOperation, setCurrentOperation] = useState<Operation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple initialization without complex dependencies
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading Disaster Operations Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">
                <span className="text-red-600">Red Cross</span>
                <span className="text-gray-900 ml-2">Disaster Operations</span>
              </h1>
              {currentOperation && (
                <div className="ml-6 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                  {currentOperation.operationNumber} - {currentOperation.operationName}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentOperation ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to build the real IAP system
            </h2>
            <p className="text-gray-600 mb-8">
              Let's start with the comprehensive questions to understand the real requirements
            </p>
            <button
              onClick={() => {
                // Mock operation for now
                const mockOp: Operation = {
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
                setCurrentOperation(mockOp);
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-md text-lg hover:bg-red-700 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <OperationDashboard operation={currentOperation} />
        )}
      </main>
    </div>
  );
}