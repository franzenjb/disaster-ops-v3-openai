/**
 * Health Services Section Component for ICS Form 215
 * Placeholder component - to be fully implemented
 */

import React, { useState } from 'react';
import { HealthServicesAssignment, CollaborationSession } from '../../../types/ics-215-types';
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  HeartIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface HealthServicesSectionProps {
  worksheetId: string;
  assignments: HealthServicesAssignment[];
  readonly?: boolean;
  printMode?: boolean;
  onAssignmentUpdate: (assignmentId: string, updates: Partial<HealthServicesAssignment>) => void;
  collaborators: CollaborationSession[];
}

export function HealthServicesSection({
  worksheetId,
  assignments,
  readonly = false,
  printMode = false,
  onAssignmentUpdate,
  collaborators
}: HealthServicesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const sectionSummary = {
    totalAssignments: assignments.length,
    completedAssignments: assignments.filter(a => a.status === 'completed').length,
    totalClients: assignments.reduce((sum, a) => sum + (a.targetClients || 0), 0),
    licensedStaff: assignments.reduce((sum, a) => sum + (a.licensedStaffRequired || 0), 0)
  };

  return (
    <div 
      id="section-health-services"
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${printMode ? 'print-avoid-break' : ''}`}
      tabIndex={-1}
    >
      {/* Section Header */}
      <div 
        className={`px-6 py-4 border-b border-gray-200 ${!printMode ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={() => !printMode && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!printMode && (
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                {isExpanded ? (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            )}
            
            <span className="text-2xl">🏥</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Health Services
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <HeartIcon className="w-4 h-4 mr-1" />
                  {sectionSummary.totalAssignments} services
                </span>
                <span className="flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-1" />
                  {sectionSummary.totalClients} clients
                </span>
                <span className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  {sectionSummary.completedAssignments} completed
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!readonly && !printMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Create new assignment
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-cross-red text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section Content */}
      {(isExpanded || printMode) && (
        <div className="p-6">
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🏥</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Health Service Assignments
              </h3>
              <p className="text-gray-600 mb-4">
                Create health service assignments for first aid, nursing, mental health, and spiritual care.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {assignments.map(assignment => (
                <div key={assignment.id} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {assignment.assignmentName || 'Unnamed Assignment'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Type: {assignment.assignmentType} | Target Clients: {assignment.targetClients || 0}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}