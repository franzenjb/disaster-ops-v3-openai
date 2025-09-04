/**
 * Worksheet Header Component
 * Displays and allows editing of worksheet metadata and basic information
 */

import React, { useState } from 'react';
import { ICS215Worksheet, WorksheetStatus, SectionType, PriorityLevel } from '../../../types/ics-215-types';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  MapPinIcon,
  TagIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface WorksheetHeaderProps {
  worksheet: ICS215Worksheet;
  readonly?: boolean;
  printMode?: boolean;
  onUpdate: (updates: Partial<ICS215Worksheet>) => void;
}

export function WorksheetHeader({
  worksheet,
  readonly = false,
  printMode = false,
  onUpdate
}: WorksheetHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Configuration options
  const sectionTypes: { value: SectionType; label: string }[] = [
    { value: 'Operations', label: 'Operations Section' },
    { value: 'Planning', label: 'Planning Section' },
    { value: 'Logistics', label: 'Logistics Section' },
    { value: 'Finance', label: 'Finance/Administration Section' },
    { value: 'Command', label: 'Command Staff' },
    { value: 'Safety', label: 'Safety Officer' },
    { value: 'Information', label: 'Information Officer' }
  ];

  const statusOptions: { value: WorksheetStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'published', label: 'Published', color: 'bg-blue-100 text-blue-800' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-600' }
  ];

  const priorityLevels: { value: PriorityLevel; label: string; color: string }[] = [
    { value: 1, label: 'Highest Priority', color: 'bg-red-100 text-red-800' },
    { value: 2, label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
    { value: 3, label: 'Normal Priority', color: 'bg-blue-100 text-blue-800' },
    { value: 4, label: 'Low Priority', color: 'bg-gray-100 text-gray-800' },
    { value: 5, label: 'Lowest Priority', color: 'bg-gray-100 text-gray-600' }
  ];

  // Helper functions
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  const formatDateTimeForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateTimeUpdate = (field: keyof ICS215Worksheet, value: string) => {
    if (!value) return;
    onUpdate({ [field]: new Date(value) });
  };

  // Get current status configuration
  const currentStatus = statusOptions.find(s => s.value === worksheet.status) || statusOptions[0];
  const currentPriority = priorityLevels.find(p => p.value === worksheet.priorityLevel) || priorityLevels[2];
  const currentSection = sectionTypes.find(s => s.value === worksheet.sectionType) || sectionTypes[0];

  // Calculate operational period duration
  const operationalPeriodHours = Math.round(
    (worksheet.operationalPeriodEnd.getTime() - worksheet.operationalPeriodStart.getTime()) / (1000 * 60 * 60)
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${printMode ? 'print-avoid-break' : ''}`}>
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-red-cross-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="w-6 h-6 text-red-cross-red" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  ICS Form 215 - Operational Planning Worksheet
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>#{worksheet.worksheetNumber}</span>
                  <span>•</span>
                  <span>Version {worksheet.versionNumber}</span>
                  {worksheet.isCurrentVersion && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">Current</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
            
            {/* Priority Badge */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${currentPriority.color}`}>
              Priority {worksheet.priorityLevel}
            </span>
            
            {/* Edit Toggle */}
            {!readonly && !printMode && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isEditing ? (
                  <>
                    <EyeIcon className="w-4 h-4" />
                    <span>View Mode</span>
                  </>
                ) : (
                  <>
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Basic Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Incident Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
              Incident Information
            </h3>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                Incident Name
              </label>
              {isEditing && !readonly ? (
                <input
                  type="text"
                  value={worksheet.incidentName}
                  onChange={(e) => onUpdate({ incidentName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="Enter incident name..."
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">{worksheet.incidentName}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <TagIcon className="w-4 h-4 mr-1" />
                Incident Number
              </label>
              {isEditing && !readonly ? (
                <input
                  type="text"
                  value={worksheet.incidentNumber || ''}
                  onChange={(e) => onUpdate({ incidentNumber: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="Enter incident number..."
                />
              ) : (
                <p className="text-sm text-gray-900">{worksheet.incidentNumber || 'Not assigned'}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <MapPinIcon className="w-4 h-4 mr-1" />
                ICS Section
              </label>
              {isEditing && !readonly ? (
                <select
                  value={worksheet.sectionType}
                  onChange={(e) => onUpdate({ sectionType: e.target.value as SectionType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                >
                  {sectionTypes.map(section => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-900">{currentSection.label}</p>
              )}
            </div>
          </div>

          {/* Operational Period */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
              Operational Period
            </h3>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Start Date & Time
              </label>
              {isEditing && !readonly ? (
                <input
                  type="datetime-local"
                  value={formatDateTimeForInput(worksheet.operationalPeriodStart)}
                  onChange={(e) => handleDateTimeUpdate('operationalPeriodStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{formatDateTime(worksheet.operationalPeriodStart)}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="w-4 h-4 mr-1" />
                End Date & Time
              </label>
              {isEditing && !readonly ? (
                <input
                  type="datetime-local"
                  value={formatDateTimeForInput(worksheet.operationalPeriodEnd)}
                  onChange={(e) => handleDateTimeUpdate('operationalPeriodEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{formatDateTime(worksheet.operationalPeriodEnd)}</p>
              )}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  Duration: {operationalPeriodHours} hours
                </span>
              </div>
              {operationalPeriodHours > 24 && (
                <div className="flex items-start mt-1">
                  <ExclamationTriangleIcon className="w-3 h-3 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-yellow-700">
                    Operational periods longer than 24 hours should be reviewed
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Prepared By & Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b border-gray-200 pb-2">
              Preparation & Status
            </h3>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <UserIcon className="w-4 h-4 mr-1" />
                Prepared By
              </label>
              {isEditing && !readonly ? (
                <input
                  type="text"
                  value={worksheet.preparedBy}
                  onChange={(e) => onUpdate({ preparedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="Enter preparer name..."
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">{worksheet.preparedBy}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Preparation Date
              </label>
              {isEditing && !readonly ? (
                <input
                  type="datetime-local"
                  value={formatDateTimeForInput(worksheet.preparedDate)}
                  onChange={(e) => handleDateTimeUpdate('preparedDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{formatDateTime(worksheet.preparedDate)}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <InformationCircleIcon className="w-4 h-4 mr-1" />
                Status & Priority
              </label>
              {isEditing && !readonly ? (
                <div className="space-y-2">
                  <select
                    value={worksheet.status}
                    onChange={(e) => onUpdate({ status: e.target.value as WorksheetStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={worksheet.priorityLevel}
                    onChange={(e) => onUpdate({ priorityLevel: parseInt(e.target.value) as PriorityLevel })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  >
                    {priorityLevels.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.color}`}>
                    {currentStatus.label}
                  </span>
                  <br />
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentPriority.color}`}>
                    {currentPriority.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ICS Organization Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Assignment
            </label>
            {isEditing && !readonly ? (
              <input
                type="text"
                value={worksheet.branch || ''}
                onChange={(e) => onUpdate({ branch: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                placeholder="Enter branch assignment..."
              />
            ) : (
              <p className="text-sm text-gray-900">{worksheet.branch || 'Not assigned'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Division Assignment
            </label>
            {isEditing && !readonly ? (
              <input
                type="text"
                value={worksheet.division || ''}
                onChange={(e) => onUpdate({ division: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                placeholder="Enter division assignment..."
              />
            ) : (
              <p className="text-sm text-gray-900">{worksheet.division || 'Not assigned'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Assignment
            </label>
            {isEditing && !readonly ? (
              <input
                type="text"
                value={worksheet.groupAssignment || ''}
                onChange={(e) => onUpdate({ groupAssignment: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                placeholder="Enter group assignment..."
              />
            ) : (
              <p className="text-sm text-gray-900">{worksheet.groupAssignment || 'Not assigned'}</p>
            )}
          </div>
        </div>

        {/* Summaries */}
        <div className="space-y-4">
          {/* Mission Statement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mission Statement
            </label>
            {isEditing && !readonly ? (
              <textarea
                value={worksheet.missionStatement || ''}
                onChange={(e) => onUpdate({ missionStatement: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                rows={3}
                placeholder="Enter the mission statement for this operational period..."
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-900">
                  {worksheet.missionStatement || 'No mission statement provided'}
                </p>
              </div>
            )}
          </div>

          {/* Situation Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Situation Summary
            </label>
            {isEditing && !readonly ? (
              <textarea
                value={worksheet.situationSummary || ''}
                onChange={(e) => onUpdate({ situationSummary: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                rows={4}
                placeholder="Describe the current situation, conditions, and key factors affecting operations..."
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {worksheet.situationSummary || 'No situation summary provided'}
                </p>
              </div>
            )}
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            {isEditing && !readonly ? (
              <textarea
                value={worksheet.specialInstructions || ''}
                onChange={(e) => onUpdate({ specialInstructions: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                rows={3}
                placeholder="Enter any special instructions, constraints, or coordination requirements..."
              />
            ) : (
              worksheet.specialInstructions && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-900 whitespace-pre-wrap">
                      {worksheet.specialInstructions}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer Information */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>Created: {formatDateTime(worksheet.createdAt)}</p>
              {worksheet.createdBy && <p>Created by: {worksheet.createdBy}</p>}
            </div>
            <div className="text-right">
              <p>Last updated: {formatDateTime(worksheet.updatedAt)}</p>
              {worksheet.updatedBy && <p>Updated by: {worksheet.updatedBy}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}