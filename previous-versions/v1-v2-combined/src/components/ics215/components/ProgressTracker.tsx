/**
 * Progress Tracker Component
 * Visual progress tracking across all service line sections
 */

import React from 'react';
import { ServiceLineAssignment, SectionType, AssignmentStatus } from '../../../types/ics-215-types';
import { 
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface ProgressTrackerProps {
  assignments: ServiceLineAssignment[];
  overallProgress: number;
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

interface SectionProgress {
  sectionType: string;
  label: string;
  icon: string;
  total: number;
  planned: number;
  assigned: number;
  inProgress: number;
  completed: number;
  delayed: number;
  cancelled: number;
  progress: number;
  color: string;
}

export function ProgressTracker({
  assignments,
  overallProgress,
  activeSection,
  onSectionChange
}: ProgressTrackerProps) {
  
  // Section configuration
  const sectionConfig: Record<string, { label: string; icon: string; color: string }> = {
    feeding: { label: 'Feeding', icon: '🍽️', color: 'bg-orange-500' },
    sheltering: { label: 'Sheltering', icon: '🏠', color: 'bg-blue-500' },
    mass_care: { label: 'Mass Care', icon: '📋', color: 'bg-green-500' },
    health: { label: 'Health Services', icon: '🏥', color: 'bg-red-500' },
    recovery: { label: 'Recovery', icon: '🔄', color: 'bg-purple-500' },
    logistics: { label: 'Logistics', icon: '🚚', color: 'bg-yellow-500' }
  };

  // Calculate section progress
  const getSectionProgress = (): SectionProgress[] => {
    const sections: Record<string, SectionProgress> = {};

    // Initialize all sections
    Object.keys(sectionConfig).forEach(sectionType => {
      const config = sectionConfig[sectionType];
      sections[sectionType] = {
        sectionType,
        label: config.label,
        icon: config.icon,
        total: 0,
        planned: 0,
        assigned: 0,
        inProgress: 0,
        completed: 0,
        delayed: 0,
        cancelled: 0,
        progress: 0,
        color: config.color
      };
    });

    // Count assignments by section and status
    assignments.forEach(assignment => {
      // Determine section type from assignment type
      let sectionType = 'mass_care'; // default
      
      if (assignment.assignmentType.startsWith('Feeding') || assignment.assignmentType.includes('Meal')) {
        sectionType = 'feeding';
      } else if (assignment.assignmentType.startsWith('Shelter')) {
        sectionType = 'sheltering';
      } else if (assignment.assignmentType.startsWith('Health') || assignment.assignmentType.includes('Medical')) {
        sectionType = 'health';
      } else if (assignment.assignmentType.startsWith('Recovery') || assignment.assignmentType.includes('Casework')) {
        sectionType = 'recovery';
      } else if (assignment.assignmentType.startsWith('Logistics') || assignment.assignmentType.includes('Transportation')) {
        sectionType = 'logistics';
      }

      const section = sections[sectionType];
      if (section) {
        section.total++;
        
        switch (assignment.status) {
          case 'planned':
            section.planned++;
            break;
          case 'assigned':
            section.assigned++;
            break;
          case 'in_progress':
            section.inProgress++;
            break;
          case 'completed':
            section.completed++;
            break;
          case 'delayed':
            section.delayed++;
            break;
          case 'cancelled':
            section.cancelled++;
            break;
        }

        // Calculate progress percentage for this section
        if (section.total > 0) {
          const activeWork = section.assigned + section.inProgress + section.completed;
          section.progress = Math.round((section.completed / section.total) * 100);
        }
      }
    });

    return Object.values(sections).filter(section => section.total > 0);
  };

  const sectionProgress = getSectionProgress();
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const inProgressAssignments = assignments.filter(a => a.status === 'in_progress').length;
  const delayedAssignments = assignments.filter(a => a.status === 'delayed').length;

  // Status color mapping
  const statusConfig = {
    planned: { color: 'bg-gray-400', label: 'Planned' },
    assigned: { color: 'bg-blue-400', label: 'Assigned' },
    in_progress: { color: 'bg-yellow-400', label: 'In Progress' },
    completed: { color: 'bg-green-400', label: 'Completed' },
    delayed: { color: 'bg-red-400', label: 'Delayed' },
    cancelled: { color: 'bg-gray-300', label: 'Cancelled' }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="w-6 h-6 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Operational Planning Progress
            </h3>
            <p className="text-sm text-gray-600">
              {totalAssignments} total assignments across all service lines
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {overallProgress}%
          </div>
          <div className="text-sm text-gray-600">
            Overall Complete
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{completedAssignments} of {totalAssignments} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center mb-1">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-1" />
            <span className="text-lg font-bold text-green-700">{completedAssignments}</span>
          </div>
          <p className="text-xs text-green-600 font-medium">Completed</p>
        </div>

        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-center mb-1">
            <PlayIcon className="w-5 h-5 text-yellow-600 mr-1" />
            <span className="text-lg font-bold text-yellow-700">{inProgressAssignments}</span>
          </div>
          <p className="text-xs text-yellow-600 font-medium">In Progress</p>
        </div>

        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-center mb-1">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-1" />
            <span className="text-lg font-bold text-red-700">{delayedAssignments}</span>
          </div>
          <p className="text-xs text-red-600 font-medium">Delayed</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-center mb-1">
            <ClockIcon className="w-5 h-5 text-gray-600 mr-1" />
            <span className="text-lg font-bold text-gray-700">{totalAssignments - completedAssignments}</span>
          </div>
          <p className="text-xs text-gray-600 font-medium">Remaining</p>
        </div>
      </div>

      {/* Section Progress */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
          Progress by Service Line
        </h4>
        
        {sectionProgress.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ChartBarIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No assignments created yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sectionProgress.map(section => (
              <div 
                key={section.sectionType}
                className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer ${
                  activeSection.toLowerCase() === section.sectionType 
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSectionChange(section.sectionType as SectionType)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{section.icon}</span>
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900">
                        {section.label}
                      </h5>
                      <p className="text-xs text-gray-600">
                        {section.total} assignments
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {section.progress}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {section.completed}/{section.total}
                    </div>
                  </div>
                </div>

                {/* Section Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${section.color}`}
                    style={{ width: `${section.progress}%` }}
                  />
                </div>

                {/* Status Breakdown */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex space-x-3">
                    {Object.entries(statusConfig).map(([status, config]) => {
                      const count = section[status as keyof SectionProgress] as number;
                      if (count === 0) return null;
                      
                      return (
                        <div key={status} className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${config.color}`} />
                          <span className="text-gray-600">
                            {count} {config.label.toLowerCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSectionChange(section.sectionType as SectionType);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          
          <div className="flex space-x-2">
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Export Progress Report
            </button>
            <span className="text-gray-300">|</span>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View Timeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}