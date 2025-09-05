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
import { RealFacilityManager } from './FacilityManagement/RealFacilityManager';
import { IAPDataViewer } from './IAP/IAPDataViewer';
import { SimpleWorkAssignmentCreator } from './WorkAssignment/SimpleWorkAssignmentCreator';
import { User, Operation } from '../types';
import { V27_IAP_DATA } from '../data/v27-iap-data';

interface OperationDashboardProps {
  operation: Operation;
  user?: User;
}

export function OperationDashboard({ operation, user }: OperationDashboardProps) {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [showWorkAssignment, setShowWorkAssignment] = useState(false);

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
    return <RealFacilityManager onNavigate={handleNavigate} />;
  }

  if (currentView === 'iap-view') {
    return <IAPDataViewer onNavigate={handleNavigate} />;
  }

  if (currentView === 'work-assignment-create' || showWorkAssignment) {
    return <SimpleWorkAssignmentCreator onClose={() => {
      setShowWorkAssignment(false);
      setCurrentView('dashboard');
    }} />;
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Real IAP Data */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {V27_IAP_DATA.operation.name} - {V27_IAP_DATA.operation.events}
          </h1>
          <p className="text-gray-600 mt-2">
            {V27_IAP_DATA.operation.drNumber} • {V27_IAP_DATA.operation.type} • 
            Operational Period #{V27_IAP_DATA.operation.operationalPeriod.number}
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
                <p className="text-sm font-medium text-gray-600">Personnel</p>
                <p className="text-2xl font-bold text-gray-900">
                  {V27_IAP_DATA.statistics.totalPersonnelDeployed}
                  <span className="text-sm text-gray-500">/{V27_IAP_DATA.statistics.totalPersonnelRequired}</span>
                </p>
                <p className="text-xs text-red-600">Gap: {V27_IAP_DATA.statistics.totalPersonnelGap}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <span className="text-green-600 text-xl">🏠</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Shelter Occupancy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {V27_IAP_DATA.statistics.shelterOccupancyTotal}
                  <span className="text-sm text-gray-500">/{V27_IAP_DATA.statistics.shelterCapacityTotal}</span>
                </p>
                <p className="text-xs text-gray-600">{V27_IAP_DATA.statistics.activeShelters} shelters active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <span className="text-yellow-600 text-xl">🍽️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Meals/Day Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {V27_IAP_DATA.statistics.mealsPerDayCapacity.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">{V27_IAP_DATA.statistics.activeFeedingSites} sites active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Cards - Only Working Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NavigationCard
            title="Facility Management"
            description="Manage facilities with Req/Have/Gap tracking for Personnel and Assets"
            icon="🏢"
            onClick={() => handleNavigate('facility-management')}
            badge="Working"
            working={true}
          />
          
          <NavigationCard
            title="View IAP Data"
            description="See the current IAP data structure and content"
            icon="📋"
            onClick={() => handleNavigate('iap-view')}
            badge="Demo"
            working={true}
          />
          
          <NavigationCard
            title="Create Work Assignment"
            description="Set up new facilities with personnel and asset requirements"
            icon="👷"
            onClick={() => handleNavigate('work-assignment-create')}
            badge="New!"
            working={true}
          />
          
          <NavigationCard
            title="Generate IAP"
            description="Generate 53-page IAP document (Coming Soon)"
            icon="📄"
            onClick={() => {}}
            working={false}
          />
        </div>
        
        {/* Coming Soon Section */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">🚧 Under Development</h3>
          <p className="text-sm text-yellow-700">
            This is a working prototype using real data from IAP V27. Currently, you can:
          </p>
          <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
            <li>View real operational data from FLOCOM DR 220-25</li>
            <li>Explore Facility Management with actual shelters and feeding sites</li>
            <li>See Req/Have/Gap calculations for personnel and assets</li>
          </ul>
          <p className="mt-2 text-sm text-yellow-700">
            Next: Making edits save to the database and generating the actual IAP document.
          </p>
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
  working?: boolean;
}

const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  description,
  icon,
  onClick,
  badge,
  working = true
}) => {
  return (
    <button
      onClick={working ? onClick : undefined}
      disabled={!working}
      className={`block w-full rounded-lg shadow p-6 transition-all text-left ${
        working 
          ? 'bg-white hover:shadow-md cursor-pointer' 
          : 'bg-gray-50 opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`text-3xl ${!working ? 'grayscale' : ''}`}>{icon}</div>
          <div>
            <h3 className={`text-lg font-medium mb-1 ${working ? 'text-gray-900' : 'text-gray-500'}`}>
              {title}
            </h3>
            <p className={`text-sm ${working ? 'text-gray-600' : 'text-gray-400'}`}>
              {description}
            </p>
          </div>
        </div>
        {badge && (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            working 
              ? 'bg-red-100 text-red-800' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            {badge}
          </span>
        )}
      </div>
    </button>
  );
};