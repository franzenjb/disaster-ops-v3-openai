/**
 * Main Operation Dashboard
 * 
 * This is the central hub for disaster operations management.
 * Shows the IAP document directly on load.
 */

'use client';

import React, { useState } from 'react';
import { IAPDocument } from './IAP/IAPDocument';
import { EnhancedFacilityManager } from './FacilityManagement/EnhancedFacilityManager';
import { MinimalTablesHub } from './MinimalTablesHub';
import { FacilityMapGoogle } from './FacilityMapGoogle';
import { IAPViewerDynamic } from './IAPViewerDynamic';
import { User, Operation } from '../types';
import { V27_IAP_DATA } from '../data/v27-iap-data';

interface OperationDashboardProps {
  operation: Operation;
  user?: User;
}

type ViewType = 'iap' | 'iap-viewer' | 'facility-manager' | 'tables-hub' | 'facility-map';

export function OperationDashboard({ operation, user }: OperationDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('iap');
  
  // Mock user if not provided
  const mockUser: User = user || {
    id: 'user-1',
    email: 'user@redcross.org',
    name: 'John Doe',
    role: 'incident_commander',
    iapRole: 'ip_group',
    permissions: [],
    homeChapter: 'test-chapter',
    activeOperations: [operation.id],
    lastActive: new Date(),
    preferences: {
      theme: 'light',
      notifications: { email: true, push: true, sms: false },
      defaultView: 'dashboard',
      timezone: 'America/New_York'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {V27_IAP_DATA.operation.name} - {V27_IAP_DATA.operation.events}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {V27_IAP_DATA.operation.drNumber} • {V27_IAP_DATA.operation.type} • 
                Operational Period #{V27_IAP_DATA.operation.operationalPeriod.number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {mockUser.name} • {mockUser.iapRole.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-4 flex space-x-4 border-t pt-3">
            <button
              onClick={() => setCurrentView('iap')}
              className={`px-4 py-2 rounded-md font-medium ${
                currentView === 'iap'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              IAP Editor
            </button>
            <button
              onClick={() => setCurrentView('iap-viewer')}
              className={`px-4 py-2 rounded-md font-medium ${
                currentView === 'iap-viewer'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📄 IAP Viewer
            </button>
            <button
              onClick={() => setCurrentView('facility-manager')}
              className={`px-4 py-2 rounded-md font-medium ${
                currentView === 'facility-manager'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Facility Manager (Gaps & Assets)
            </button>
            <button
              onClick={() => setCurrentView('tables-hub')}
              className={`px-4 py-2 rounded-md font-medium ${
                currentView === 'tables-hub'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Tables & Data Hub
            </button>
            <button
              onClick={() => setCurrentView('facility-map')}
              className={`px-4 py-2 rounded-md font-medium ${
                currentView === 'facility-map'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🗺️ Facility Map
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={currentView === 'tables-hub' || currentView === 'facility-map' || currentView === 'iap-viewer' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}>
        {currentView === 'iap' && <IAPDocument />}
        {currentView === 'iap-viewer' && <IAPViewerDynamic />}
        {currentView === 'facility-manager' && <EnhancedFacilityManager />}
        {currentView === 'tables-hub' && <MinimalTablesHub />}
        {currentView === 'facility-map' && <FacilityMapGoogle />}
      </div>
    </div>
  );
}