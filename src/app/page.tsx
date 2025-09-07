'use client';

import React, { useState, useEffect } from 'react';
import { OperationDashboard } from '@/components/OperationDashboard';
import type { Operation } from '@/types';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Skip auth for now
  const [isLoading, setIsLoading] = useState(false); // Skip loading screen

  // Create mock operation for demo
  const mockOperation: Operation = {
    id: 'demo-op-001',
    operationNumber: 'PHASE3-DEMO',
    operationName: 'Phase 3 Advanced Features Demo',
    disasterType: 'hurricane',
    status: 'active',
    activationLevel: 'level_2',
    createdAt: new Date(),
    createdBy: 'demo-user',
    geography: { 
      regions: ['SE-001'], 
      states: ['FL'], 
      counties: ['Hillsborough', 'Pinellas'], 
      chapters: ['Tampa Bay', 'Clearwater'] 
    },
    metadata: { 
      serviceLinesActivated: ['sheltering', 'feeding', 'health_services']
    }
  };

  useEffect(() => {
    // Skip authentication for demo - go straight to dashboard
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-6">
            <div className="text-6xl mb-4">🔴</div>
            <h1 className="text-3xl font-bold mb-2">American Red Cross</h1>
            <h2 className="text-xl font-light">Disaster Operations Platform</h2>
          </div>
          
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading Phase 3 Advanced Features...</p>
          
          <div className="mt-8 text-sm opacity-75">
            <p>✅ Real-time Collaboration Engine</p>
            <p>✅ Role-based Access Control</p>
            <p>✅ Advanced Facility Management</p>
            <p>✅ Mobile Field Operations</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Phase 3 Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🚀</div>
            <div>
              <h1 className="font-bold text-lg">Phase 3 Complete: Advanced Features Demo</h1>
              <p className="text-sm opacity-90">
                Real-time Collaboration • Role-based Access • Bulk Operations • Mobile Optimization
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              ✅ Collaboration Engine
            </div>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              ✅ RBAC Security
            </div>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              ✅ Advanced Features
            </div>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              ✅ Mobile Ready
            </div>
          </div>
        </div>
      </div>

      {/* Main Application */}
      <OperationDashboard operation={mockOperation} />
    </div>
  );
}