/**
 * Main Operation Dashboard
 * 
 * This is the central hub for disaster operations management.
 * Shows the IAP document directly on load.
 */

'use client';

import React from 'react';
import { IAPDocument } from './IAP/IAPDocument';
import { User, Operation } from '../types';
import { V27_IAP_DATA } from '../data/v27-iap-data';

interface OperationDashboardProps {
  operation: Operation;
  user?: User;
}

export function OperationDashboard({ operation, user }: OperationDashboardProps) {
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

  // Go directly to IAP document view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header */}
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
        </div>
      </div>

      {/* IAP Document takes up the rest of the screen */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <IAPDocument />
      </div>
    </div>
  );
}