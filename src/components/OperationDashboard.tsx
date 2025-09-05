/**
 * Main Operation Dashboard
 * 
 * This is the central hub for disaster operations management.
 * Shows key metrics, active operations, and provides navigation
 * to all major system functions including IAP management.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { IAPDashboard } from './IAP/IAPDashboard';
import { FacilityManager } from './IAP/FacilityManager';
import { User, Operation } from '../types';

interface OperationDashboardProps {
  operation: Operation;
  user?: User;
}

export function OperationDashboard({ operation, user }: OperationDashboardProps) {
  const [currentView, setCurrentView] = useState<string>('dashboard');

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

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  // Render specific views
  if (currentView === 'iap') {
    return (
      <IAPDashboard
        operationId={operation.id}
        user={mockUser}
        onNavigate={handleNavigate}
      />
    );
  }

  if (currentView === 'facility-management') {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-red-600 hover:text-red-800 flex items-center"
          >
            ← Back to Dashboard
          </button>
        </div>
        <FacilityManager
          operationId={operation.id}
          user={mockUser}
        />
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {operation.operationName}
          </h1>
          <p className="text-gray-600 mt-2">
            {operation.operationNumber} • {operation.disasterType.charAt(0).toUpperCase() + operation.disasterType.slice(1)} • 
            Status: {operation.status.charAt(0).toUpperCase() + operation.status.slice(1)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Welcome, {mockUser.name} • Role: {mockUser.iapRole.replace('_', ' ').toUpperCase()}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <span className="text-red-600 text-xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Operation Status</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{operation.status}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Personnel Deployed</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <span className="text-green-600 text-xl">🏠</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">People Served</p>
                <p className="text-2xl font-bold text-gray-900">2,456</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <span className="text-yellow-600 text-xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active IAPs</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavigationCard
            title="IAP Management"
            description="Create and manage 53-page Incident Action Plans"
            icon="📋"
            onClick={() => handleNavigate('iap')}
            badge="Enhanced"
          />
          
          <NavigationCard
            title="Facility Management"
            description="Manage operational facilities and assignments"
            icon="🏢"
            onClick={() => handleNavigate('facility-management')}
            badge="New"
          />
          
          <NavigationCard
            title="Personnel Roster"
            description="Manage personnel assignments and positions"
            icon="👥"
            onClick={() => handleNavigate('roster')}
          />
          
          <NavigationCard
            title="Work Assignments"
            description="Track tasks and assignments across facilities"
            icon="👷"
            onClick={() => handleNavigate('work-assignments')}
            badge="IAP Integrated"
          />
          
          <NavigationCard
            title="Resource Tracking"
            description="Track vehicles, equipment, and supplies"
            icon="📦"
            onClick={() => handleNavigate('resources')}
          />
          
          <NavigationCard
            title="Service Metrics"
            description="Monitor meals served, shelter occupancy, etc."
            icon="📊"
            onClick={() => handleNavigate('metrics')}
          />
          
          <NavigationCard
            title="Geographic View"
            description="Map view of operations and facilities"
            icon="🗺️"
            onClick={() => handleNavigate('map')}
          />
          
          <NavigationCard
            title="Reports & Analytics"
            description="Generate reports and view analytics"
            icon="📈"
            onClick={() => handleNavigate('reports')}
          />
          
          <NavigationCard
            title="6PM Snapshots"
            description="Official IAP snapshots and distribution"
            icon="📸"
            onClick={() => handleNavigate('snapshots')}
            badge="Official"
          />
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">New IAP #3 published for {operation.operationName}</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Downtown Shelter facility created and configured</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">15 new personnel assigned to Feeding Operations</p>
                    <p className="text-xs text-gray-500">6 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Official 6PM snapshot created for IAP #2</p>
                    <p className="text-xs text-gray-500">Yesterday at 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NavigationCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  badge?: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  description,
  icon,
  onClick,
  badge
}) => {
  return (
    <button
      onClick={onClick}
      className="block w-full bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">{icon}</div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {badge && (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </button>
  );
};