/**
 * IAP Dashboard - Central hub for IAP management
 * 
 * Provides role-based access to IAP functions:
 * - I&P Group: Full editing access to all IAP components
 * - Discipline Teams: Access to their specific facilities
 * - Field Teams: Read-only access to their assignments
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  EnhancedIAPDocument, 
  IAPFacility, 
  User,
  IAPRole 
} from '../../types';
import { iapProjector } from '../../lib/projections/IAPProjector';
import { EventType, createEvent } from '../../lib/events/types';

interface IAPDashboardProps {
  operationId: string;
  user: User;
  onNavigate: (section: string) => void;
}

export const IAPDashboard: React.FC<IAPDashboardProps> = ({
  operationId,
  user,
  onNavigate
}) => {
  const [iapDocument, setIapDocument] = useState<EnhancedIAPDocument | null>(null);
  const [facilities, setFacilities] = useState<IAPFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    loadIAPData();
    setCanEdit(user.iapRole === 'ip_group');
  }, [operationId, user]);

  const loadIAPData = async () => {
    try {
      // Load facilities from the projector
      const facilities = iapProjector.getFacilitiesForOperation(operationId);
      setFacilities(facilities);

      // Find IAP document
      const iapId = `${operationId}-iap-001`;
      let iap = iapProjector.getIAPDocument(iapId);

      if (!iap) {
        // Create new IAP document
        const createEvent = {
          id: iapId,
          type: EventType.IAP_CREATED,
          operationId,
          actorId: user.id,
          payload: {
            iapNumber: 1,
            operationalPeriodStart: new Date().toISOString(),
            operationalPeriodEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            preparedBy: user.name
          },
          timestamp: Date.now(),
          schemaVersion: 1,
          deviceId: 'web',
          sessionId: 'session',
          syncStatus: 'local' as const,
          syncAttempts: 0
        };

        await iapProjector.processEvent(createEvent);
        iap = iapProjector.getIAPDocument(iapId);
      }

      setIapDocument(iap);
    } catch (error) {
      console.error('Error loading IAP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOfficialSnapshot = async () => {
    if (!iapDocument) return;

    try {
      const snapshot = await iapProjector.createOfficialSnapshot(
        iapDocument.id,
        user.id
      );

      alert(`Official 6PM snapshot created: ${snapshot.id}`);
      await loadIAPData(); // Refresh data
    } catch (error) {
      console.error('Error creating snapshot:', error);
      alert('Failed to create official snapshot');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!iapDocument) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          No IAP Document Found
        </h2>
        <p className="text-gray-600">
          Unable to load or create IAP document for this operation.
        </p>
      </div>
    );
  }

  const roleBasedSections = getRoleBasedSections(user.iapRole);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              IAP #{iapDocument.iapNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              Operational Period: {iapDocument.operationalPeriod.start.toLocaleDateString()} - {iapDocument.operationalPeriod.end.toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              Status: <span className="capitalize">{iapDocument.status}</span> • 
              Version: {iapDocument.version} • 
              Role: <span className="capitalize">{user.iapRole.replace('_', ' ')}</span>
            </p>
          </div>
          
          {canEdit && (
            <div className="flex space-x-3">
              <button
                onClick={createOfficialSnapshot}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Create 6PM Snapshot
              </button>
              <button
                onClick={() => onNavigate('pdf-preview')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Preview PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Facilities"
          value={iapDocument.facilityData.facilities.length}
          icon="🏢"
        />
        <MetricCard
          title="Total Personnel"
          value={iapDocument.facilityData.totalPersonnel}
          icon="👥"
        />
        <MetricCard
          title="Total Capacity"
          value={iapDocument.facilityData.totalCapacity}
          icon="🏠"
        />
        <MetricCard
          title="Current Occupancy"
          value={iapDocument.facilityData.currentOccupancy}
          icon="📊"
        />
      </div>

      {/* IAP Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roleBasedSections.map((section) => (
          <IAPSectionCard
            key={section.id}
            section={section}
            canEdit={canEdit && section.editable}
            onClick={() => onNavigate(section.id)}
          />
        ))}
      </div>

      {/* Recent Activity */}
      {user.iapRole === 'ip_group' && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="space-y-4">
                {iapDocument.versionHistory.slice(-5).reverse().map((version) => (
                  <div key={version.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">
                        Version {version.versionNumber} - {version.changes[0]?.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {version.createdAt.toLocaleString()} by {version.createdBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="text-2xl mr-3">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  </div>
);

interface IAPSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'complete' | 'partial' | 'empty';
  editable: boolean;
  requiredRole: IAPRole[];
}

interface IAPSectionCardProps {
  section: IAPSection;
  canEdit: boolean;
  onClick: () => void;
}

const IAPSectionCard: React.FC<IAPSectionCardProps> = ({ section, canEdit, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{section.icon}</div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
        </div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <StatusBadge status={section.status} />
        {canEdit && (
          <span className="text-xs text-blue-600">Editable</span>
        )}
      </div>
    </div>
  </button>
);

interface StatusBadgeProps {
  status: 'complete' | 'partial' | 'empty';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = {
    complete: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    empty: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

function getRoleBasedSections(role: IAPRole): IAPSection[] {
  const allSections: IAPSection[] = [
    {
      id: 'cover-page',
      title: 'Cover Page',
      description: 'IAP cover page with approvals and distribution list',
      icon: '📋',
      status: 'partial',
      editable: true,
      requiredRole: ['ip_group']
    },
    {
      id: 'directors-message',
      title: "Director's Message",
      description: 'Executive message and operational overview',
      icon: '📝',
      status: 'empty',
      editable: true,
      requiredRole: ['ip_group']
    },
    {
      id: 'incident-priorities',
      title: 'Incident Priorities & Objectives',
      description: 'Life safety, stabilization, and property conservation',
      icon: '🎯',
      status: 'empty',
      editable: true,
      requiredRole: ['ip_group']
    },
    {
      id: 'organization-chart',
      title: 'Organization Chart',
      description: 'ICS organizational structure with live contacts',
      icon: '📊',
      status: 'partial',
      editable: true,
      requiredRole: ['ip_group']
    },
    {
      id: 'contact-roster',
      title: 'Contact Roster',
      description: '24-hour lines and section contacts',
      icon: '📞',
      status: 'partial',
      editable: true,
      requiredRole: ['ip_group']
    },
    {
      id: 'work-sites',
      title: 'Work Sites Table',
      description: 'All operational facilities and locations',
      icon: '🗺️',
      status: 'complete',
      editable: false,
      requiredRole: ['ip_group', 'discipline', 'field']
    },
    {
      id: 'work-assignments',
      title: 'Work Assignments',
      description: 'Personnel assignments and resource allocations',
      icon: '👷',
      status: 'partial',
      editable: true,
      requiredRole: ['ip_group', 'discipline']
    },
    {
      id: 'daily-schedule',
      title: 'Daily Schedule',
      description: 'Meetings, briefings, and deadlines',
      icon: '📅',
      status: 'empty',
      editable: true,
      requiredRole: ['ip_group']
    },
    {
      id: 'facility-management',
      title: 'Facility Management',
      description: 'Manage facilities, personnel, and resources',
      icon: '🏢',
      status: 'partial',
      editable: true,
      requiredRole: ['ip_group', 'discipline']
    },
    {
      id: 'action-tracker',
      title: 'Action Tracker',
      description: 'Open actions, deadlines, and follow-ups',
      icon: '✅',
      status: 'empty',
      editable: true,
      requiredRole: ['ip_group']
    },
    {
      id: 'photo-attachments',
      title: 'Photo Attachments',
      description: 'Operational photos and documentation',
      icon: '📸',
      status: 'empty',
      editable: true,
      requiredRole: ['ip_group']
    },
    {
      id: 'ancillary-content',
      title: 'Ancillary Content',
      description: 'Parking, checkout procedures, and announcements',
      icon: '📄',
      status: 'empty',
      editable: true,
      requiredRole: ['ip_group']
    }
  ];

  // Filter sections based on user role
  return allSections.filter(section => 
    section.requiredRole.includes(role)
  );
}
