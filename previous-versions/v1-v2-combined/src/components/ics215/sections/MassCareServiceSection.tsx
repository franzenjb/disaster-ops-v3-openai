/**
 * Mass Care & Emergency Services Section Component for ICS Form 215
 * Placeholder component - to be fully implemented
 */

import React, { useState } from 'react';
import { MassCareAssignment, CollaborationSession } from '../../../types/ics-215-types';
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UsersIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface MassCareServiceSectionProps {
  worksheetId: string;
  assignments: MassCareAssignment[];
  readonly?: boolean;
  printMode?: boolean;
  onAssignmentUpdate: (assignmentId: string, updates: Partial<MassCareAssignment>) => void;
  collaborators: CollaborationSession[];
}

export function MassCareServiceSection({
  worksheetId,
  assignments,
  readonly = false,
  printMode = false,
  onAssignmentUpdate,
  collaborators
}: MassCareServiceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const sectionSummary = {
    totalAssignments: assignments.length,
    completedAssignments: assignments.filter(a => a.status === 'completed').length,
    totalClients: assignments.reduce((sum, a) => sum + (a.targetPopulation || 0), 0),
    activeServices: assignments.filter(a => ['assigned', 'in_progress'].includes(a.status)).length
  };

  return (
    <div 
      id="section-mass-care"
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
            
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Mass Care & Emergency Services
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 mr-1" />
                  {sectionSummary.totalAssignments} assignments
                </span>
                <span className="flex items-center">
                  <UsersIcon className="w-4 h-4 mr-1" />
                  {sectionSummary.totalClients} clients served
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
              <span className="text-6xl mb-4 block">📋</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Mass Care Assignments
              </h3>
              <p className="text-gray-600 mb-4">
                Create mass care assignments for emergency assistance, bulk distribution, and client services.
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
                    Type: {assignment.assignmentType} | Target Population: {assignment.targetPopulation || 0}
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