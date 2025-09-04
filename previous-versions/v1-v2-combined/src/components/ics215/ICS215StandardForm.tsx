/**
 * ICS Form 215 - Operational Planning Worksheet (Standard Format)
 * 
 * This component replicates the exact structure of the standard ICS Form 215
 * as used by Red Cross disaster response teams, matching the Excel format
 * from DR836-23_20221026_215Worksheet.xlsm
 * 
 * Standard ICS 215 includes:
 * 1. Header Information (Incident Name, Date/Time, Operational Period)
 * 2. Work Assignments by Division/Group (Red Cross operational divisions)
 * 3. Resource Requirements with Have/Need calculations
 * 4. Control Information (Prepared by, Approved by)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  ICS215Worksheet, 
  WorkAssignment, 
  ResourceRequirement215,
  RedCrossDivision,
  ResourceKind,
  WorksheetStatus 
} from '../../types/ics-215-types';
import {
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ICS215StandardFormProps {
  worksheetData?: Partial<ICS215Worksheet>;
  workAssignments?: WorkAssignment[];
  readonly?: boolean;
  printMode?: boolean;
  onSave?: (data: { worksheet: ICS215Worksheet; assignments: WorkAssignment[] }) => Promise<void>;
  onStatusChange?: (status: WorksheetStatus) => void;
}

export function ICS215StandardForm({
  worksheetData,
  workAssignments = [],
  readonly = false,
  printMode = false,
  onSave,
  onStatusChange
}: ICS215StandardFormProps) {
  // Initialize form data
  const [formData, setFormData] = useState<Partial<ICS215Worksheet>>(() => ({
    incidentName: '',
    incidentNumber: '',
    operationalPeriodStart: new Date(),
    operationalPeriodEnd: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    preparedBy: '',
    preparedDate: new Date(),
    status: 'draft',
    ...worksheetData
  }));

  const [assignments, setAssignments] = useState<WorkAssignment[]>(workAssignments);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditing, setIsEditing] = useState(!readonly);

  // Red Cross Operational Divisions (matches actual Red Cross organization)
  const redCrossDivisions: { value: RedCrossDivision; label: string; description: string }[] = [
    { 
      value: 'Feeding_Food_Services', 
      label: 'Feeding/Food Services',
      description: 'Fixed site feeding, mobile feeding, bulk distribution'
    },
    { 
      value: 'Sheltering_Dormitory_Operations', 
      label: 'Sheltering/Dormitory Operations',
      description: 'Congregate care, non-congregate sheltering, population management'
    },
    { 
      value: 'Mass_Care_Distribution_Emergency_Supplies', 
      label: 'Mass Care/Distribution/Emergency Supplies',
      description: 'Emergency supplies distribution, bulk distribution, mobile services'
    },
    { 
      value: 'Health_Services', 
      label: 'Health Services',
      description: 'Physical health, mental health, spiritual care, first aid'
    },
    { 
      value: 'Disaster_Assessment', 
      label: 'Disaster Assessment',
      description: 'Initial damage assessment, preliminary damage assessment, reconnaissance'
    },
    { 
      value: 'Individual_Family_Services_Recovery', 
      label: 'Individual/Family Services (Recovery)',
      description: 'Casework, financial assistance, referrals, recovery planning'
    },
    { 
      value: 'Logistics_Supply_Chain', 
      label: 'Logistics/Supply Chain',
      description: 'Transportation, supply chain, facilities, communications, IT'
    },
    { 
      value: 'External_Relations_Government_Operations', 
      label: 'External Relations/Government Operations',
      description: 'Government liaison, external agency coordination, public information'
    },
    { 
      value: 'Finance_Administration', 
      label: 'Finance/Administration',
      description: 'Cost tracking, procurement, time reporting, compensation'
    },
    { 
      value: 'Planning_Situational_Awareness', 
      label: 'Planning/Situational Awareness',
      description: 'Situation reporting, documentation, demobilization planning'
    },
    { 
      value: 'Staff_Services_Workforce', 
      label: 'Staff Services/Workforce',
      description: 'Volunteer coordination, staff wellness, workforce management'
    }
  ];

  // Resource kinds for dropdown
  const resourceKinds: { value: ResourceKind; label: string }[] = [
    { value: 'Personnel', label: 'Personnel' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Supplies', label: 'Supplies' },
    { value: 'Vehicles', label: 'Vehicles' },
    { value: 'Communications', label: 'Communications' },
    { value: 'Facilities', label: 'Facilities' },
    { value: 'Aircraft', label: 'Aircraft' },
    { value: 'Marine', label: 'Marine' },
    { value: 'Teams', label: 'Teams' },
    { value: 'Specialists', label: 'Specialists' }
  ];

  // Helper functions
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
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

  // Event handlers
  const handleFormUpdate = useCallback((updates: Partial<ICS215Worksheet>) => {
    if (readonly) return;
    
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, [readonly]);

  const handleAddAssignment = useCallback((division: RedCrossDivision) => {
    if (readonly) return;

    const newAssignment: WorkAssignment = {
      id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      worksheetId: formData.id || '',
      assignmentNumber: `${assignments.length + 1}`,
      divisionGroup: division,
      workAssignmentName: '',
      resourceRequirements: [],
      workLocation: '',
      reportTime: new Date(),
      status: 'assigned',
      progressPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setAssignments(prev => [...prev, newAssignment]);
    setIsDirty(true);
  }, [readonly, assignments.length, formData.id]);

  const handleUpdateAssignment = useCallback((assignmentId: string, updates: Partial<WorkAssignment>) => {
    if (readonly) return;

    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, ...updates, updatedAt: new Date() }
          : assignment
      )
    );
    setIsDirty(true);
  }, [readonly]);

  const handleDeleteAssignment = useCallback((assignmentId: string) => {
    if (readonly) return;

    setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
    setIsDirty(true);
  }, [readonly]);

  const handleAddResource = useCallback((assignmentId: string) => {
    if (readonly) return;

    const newResource: ResourceRequirement215 = {
      id: `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      assignmentId,
      resourceKind: 'Personnel',
      resourceType: '',
      numberOfPersons: 1,
      quantityRequested: 1,
      quantityHave: 0,
      quantityNeed: 1,
      status: 'requested'
    };

    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              resourceRequirements: [...assignment.resourceRequirements, newResource],
              updatedAt: new Date()
            }
          : assignment
      )
    );
    setIsDirty(true);
  }, [readonly]);

  const handleUpdateResource = useCallback((assignmentId: string, resourceId: string, updates: Partial<ResourceRequirement215>) => {
    if (readonly) return;

    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              resourceRequirements: assignment.resourceRequirements.map(resource =>
                resource.id === resourceId
                  ? { 
                      ...resource, 
                      ...updates,
                      // Auto-calculate need = requested - have
                      quantityNeed: (updates.quantityRequested || resource.quantityRequested) - (updates.quantityHave || resource.quantityHave)
                    }
                  : resource
              ),
              updatedAt: new Date()
            }
          : assignment
      )
    );
    setIsDirty(true);
  }, [readonly]);

  const handleDeleteResource = useCallback((assignmentId: string, resourceId: string) => {
    if (readonly) return;

    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              resourceRequirements: assignment.resourceRequirements.filter(resource => resource.id !== resourceId),
              updatedAt: new Date()
            }
          : assignment
      )
    );
    setIsDirty(true);
  }, [readonly]);

  const handleSave = useCallback(async () => {
    if (!onSave || readonly) return;

    try {
      await onSave({
        worksheet: {
          id: formData.id || `worksheet-${Date.now()}`,
          worksheetId: formData.worksheetId || `ICS-215-${formatDateTime(new Date()).replace(/[/\s:]/g, '-')}`,
          operationId: formData.operationId || '',
          worksheetNumber: formData.worksheetNumber || 1,
          operationalPeriodStart: formData.operationalPeriodStart || new Date(),
          operationalPeriodEnd: formData.operationalPeriodEnd || new Date(),
          incidentName: formData.incidentName || '',
          incidentNumber: formData.incidentNumber,
          preparedBy: formData.preparedBy || '',
          preparedDate: formData.preparedDate || new Date(),
          sectionType: formData.sectionType || 'Operations',
          status: formData.status || 'draft',
          priorityLevel: formData.priorityLevel || 3,
          versionNumber: formData.versionNumber || 1,
          isCurrentVersion: formData.isCurrentVersion || true,
          createdAt: formData.createdAt || new Date(),
          updatedAt: new Date(),
          ...formData
        } as ICS215Worksheet,
        assignments
      });
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save worksheet:', error);
    }
  }, [onSave, readonly, formData, assignments]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Group assignments by division for display
  const assignmentsByDivision = assignments.reduce((acc, assignment) => {
    const division = assignment.divisionGroup;
    if (!acc[division]) {
      acc[division] = [];
    }
    acc[division].push(assignment);
    return acc;
  }, {} as Record<RedCrossDivision, WorkAssignment[]>);

  return (
    <div className={`min-h-screen ${printMode ? 'print:bg-white print:p-0' : 'bg-gray-50'}`}>
      {/* Action Bar - Hidden in print */}
      {!printMode && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-12">
              <div className="flex items-center space-x-4">
                <h1 className="text-lg font-semibold text-gray-900">ICS Form 215</h1>
                {isDirty && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    Unsaved Changes
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={readonly}
                >
                  {isEditing ? 'View Mode' : 'Edit Mode'}
                </button>
                
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <PrinterIcon className="w-4 h-4 mr-1 inline" />
                  Print
                </button>
                
                {!readonly && onSave && (
                  <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-red-cross-red border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-1 inline" />
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto ${printMode ? 'p-0' : 'px-4 sm:px-6 lg:px-8 py-6'}`}>
        {/* Form Header */}
        <div className={`bg-white ${printMode ? 'border border-black' : 'rounded-lg shadow-sm border border-gray-200'}`}>
          {/* Title Section */}
          <div className={`${printMode ? 'p-4' : 'px-6 py-4'} border-b ${printMode ? 'border-black' : 'border-gray-200'}`}>
            <div className="text-center">
              <h1 className={`${printMode ? 'text-lg' : 'text-xl'} font-bold text-gray-900`}>
                INCIDENT COMMAND SYSTEM
              </h1>
              <h2 className={`${printMode ? 'text-base' : 'text-lg'} font-semibold text-gray-800 mt-1`}>
                OPERATIONAL PLANNING WORKSHEET
              </h2>
              <h3 className={`${printMode ? 'text-sm' : 'text-base'} font-medium text-gray-700 mt-1`}>
                ICS FORM 215
              </h3>
            </div>
          </div>

          {/* Header Information Grid */}
          <div className={`${printMode ? 'p-4' : 'p-6'}`}>
            <div className={`grid ${printMode ? 'grid-cols-2 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'} mb-6`}>
              {/* Left Column */}
              <div className="space-y-4">
                <div className={`grid grid-cols-2 gap-2 ${printMode ? 'text-sm' : ''}`}>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">
                      1. Incident Name
                    </label>
                    {isEditing && !readonly ? (
                      <input
                        type="text"
                        value={formData.incidentName || ''}
                        onChange={(e) => handleFormUpdate({ incidentName: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-cross-red"
                        placeholder="Enter incident name"
                      />
                    ) : (
                      <div className={`border-b border-gray-400 ${printMode ? 'min-h-[20px]' : 'min-h-[32px]'} flex items-end pb-1`}>
                        <span className="text-sm font-medium">{formData.incidentName || '_'.repeat(30)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">
                      2. Incident Number
                    </label>
                    {isEditing && !readonly ? (
                      <input
                        type="text"
                        value={formData.incidentNumber || ''}
                        onChange={(e) => handleFormUpdate({ incidentNumber: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-cross-red"
                        placeholder="DR836-23"
                      />
                    ) : (
                      <div className={`border-b border-gray-400 ${printMode ? 'min-h-[20px]' : 'min-h-[32px]'} flex items-end pb-1`}>
                        <span className="text-sm font-medium">{formData.incidentNumber || '_'.repeat(15)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">
                    3. Date/Time Prepared
                  </label>
                  {isEditing && !readonly ? (
                    <input
                      type="datetime-local"
                      value={formData.preparedDate ? formatDateTimeForInput(formData.preparedDate) : ''}
                      onChange={(e) => handleFormUpdate({ preparedDate: e.target.value ? new Date(e.target.value) : new Date() })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-cross-red"
                    />
                  ) : (
                    <div className={`border-b border-gray-400 ${printMode ? 'min-h-[20px]' : 'min-h-[32px]'} flex items-end pb-1`}>
                      <span className="text-sm font-medium">
                        {formData.preparedDate ? formatDateTime(formData.preparedDate) : '_'.repeat(20)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Operational Period */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">
                    4. Operational Period
                  </label>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-600">From (Date/Time):</span>
                      {isEditing && !readonly ? (
                        <input
                          type="datetime-local"
                          value={formData.operationalPeriodStart ? formatDateTimeForInput(formData.operationalPeriodStart) : ''}
                          onChange={(e) => handleFormUpdate({ operationalPeriodStart: e.target.value ? new Date(e.target.value) : new Date() })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-cross-red mt-1"
                        />
                      ) : (
                        <div className={`border-b border-gray-400 ${printMode ? 'min-h-[20px]' : 'min-h-[32px]'} flex items-end pb-1 mt-1`}>
                          <span className="text-sm font-medium">
                            {formData.operationalPeriodStart ? formatDateTime(formData.operationalPeriodStart) : '_'.repeat(20)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <span className="text-xs text-gray-600">To (Date/Time):</span>
                      {isEditing && !readonly ? (
                        <input
                          type="datetime-local"
                          value={formData.operationalPeriodEnd ? formatDateTimeForInput(formData.operationalPeriodEnd) : ''}
                          onChange={(e) => handleFormUpdate({ operationalPeriodEnd: e.target.value ? new Date(e.target.value) : new Date() })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-cross-red mt-1"
                        />
                      ) : (
                        <div className={`border-b border-gray-400 ${printMode ? 'min-h-[20px]' : 'min-h-[32px]'} flex items-end pb-1 mt-1`}>
                          <span className="text-sm font-medium">
                            {formData.operationalPeriodEnd ? formatDateTime(formData.operationalPeriodEnd) : '_'.repeat(20)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Assignments Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  5. Work Assignments by Division/Group
                </h3>
                {isEditing && !readonly && (
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddAssignment(e.target.value as RedCrossDivision);
                          e.target.value = ''; // Reset selection
                        }
                      }}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-red-cross-red"
                      defaultValue=""
                    >
                      <option value="">Add Assignment...</option>
                      {redCrossDivisions.map(division => (
                        <option key={division.value} value={division.value}>
                          {division.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Display assignments by division */}
              {redCrossDivisions.map(division => {
                const divisionAssignments = assignmentsByDivision[division.value] || [];
                
                if (divisionAssignments.length === 0 && !isEditing) {
                  return null; // Don't show empty divisions in view mode
                }

                return (
                  <div key={division.value} className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-red-cross-light px-4 py-2 border-b border-gray-300">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{division.label}</h4>
                        <span className="text-xs text-gray-600">{division.description}</span>
                      </div>
                    </div>

                    {divisionAssignments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wide border-r border-gray-200">
                                Work Assignment
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wide border-r border-gray-200">
                                Resource Requirements
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wide border-r border-gray-200">
                                Location
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wide border-r border-gray-200">
                                Report Time
                              </th>
                              {isEditing && !readonly && (
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wide">
                                  Actions
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {divisionAssignments.map((assignment, index) => (
                              <React.Fragment key={assignment.id}>
                                <tr>
                                  <td className="px-3 py-2 border-r border-gray-200 align-top">
                                    {isEditing && !readonly ? (
                                      <div className="space-y-2">
                                        <input
                                          type="text"
                                          value={assignment.workAssignmentName}
                                          onChange={(e) => handleUpdateAssignment(assignment.id, { workAssignmentName: e.target.value })}
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-cross-red"
                                          placeholder="Work assignment name..."
                                        />
                                        <textarea
                                          value={assignment.specialInstructions || ''}
                                          onChange={(e) => handleUpdateAssignment(assignment.id, { specialInstructions: e.target.value })}
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-cross-red"
                                          rows={2}
                                          placeholder="Special instructions..."
                                        />
                                      </div>
                                    ) : (
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {assignment.workAssignmentName || 'Unnamed Assignment'}
                                        </div>
                                        {assignment.specialInstructions && (
                                          <div className="text-xs text-gray-600 mt-1">
                                            {assignment.specialInstructions}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  
                                  <td className="px-3 py-2 border-r border-gray-200 align-top">
                                    <div className="space-y-2">
                                      {assignment.resourceRequirements.map((resource, resourceIndex) => (
                                        <div key={resource.id} className="bg-gray-50 p-2 rounded text-xs">
                                          {isEditing && !readonly ? (
                                            <div className="grid grid-cols-6 gap-2">
                                              <select
                                                value={resource.resourceKind}
                                                onChange={(e) => handleUpdateResource(assignment.id, resource.id, { resourceKind: e.target.value as ResourceKind })}
                                                className="text-xs px-1 py-1 border border-gray-300 rounded"
                                              >
                                                {resourceKinds.map(kind => (
                                                  <option key={kind.value} value={kind.value}>{kind.label}</option>
                                                ))}
                                              </select>
                                              <input
                                                type="text"
                                                value={resource.resourceType}
                                                onChange={(e) => handleUpdateResource(assignment.id, resource.id, { resourceType: e.target.value })}
                                                className="text-xs px-1 py-1 border border-gray-300 rounded"
                                                placeholder="Type"
                                              />
                                              <input
                                                type="number"
                                                value={resource.quantityRequested}
                                                onChange={(e) => handleUpdateResource(assignment.id, resource.id, { quantityRequested: parseInt(e.target.value) || 0 })}
                                                className="text-xs px-1 py-1 border border-gray-300 rounded"
                                                placeholder="Need"
                                              />
                                              <input
                                                type="number"
                                                value={resource.quantityHave}
                                                onChange={(e) => handleUpdateResource(assignment.id, resource.id, { quantityHave: parseInt(e.target.value) || 0 })}
                                                className="text-xs px-1 py-1 border border-gray-300 rounded"
                                                placeholder="Have"
                                              />
                                              <div className="text-xs flex items-center justify-center font-bold text-red-600">
                                                {resource.quantityNeed}
                                              </div>
                                              <button
                                                onClick={() => handleDeleteResource(assignment.id, resource.id)}
                                                className="text-red-600 hover:text-red-800"
                                              >
                                                <TrashIcon className="w-3 h-3" />
                                              </button>
                                            </div>
                                          ) : (
                                            <div>
                                              <div className="font-medium">{resource.resourceKind}: {resource.resourceType}</div>
                                              <div className="text-gray-600">
                                                Need: {resource.quantityRequested} | Have: {resource.quantityHave} | 
                                                <span className="font-bold text-red-600 ml-1">Need: {resource.quantityNeed}</span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                      
                                      {isEditing && !readonly && (
                                        <button
                                          onClick={() => handleAddResource(assignment.id)}
                                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                          <PlusIcon className="w-3 h-3 mr-1" />
                                          Add Resource
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                  
                                  <td className="px-3 py-2 border-r border-gray-200 align-top">
                                    {isEditing && !readonly ? (
                                      <input
                                        type="text"
                                        value={assignment.workLocation}
                                        onChange={(e) => handleUpdateAssignment(assignment.id, { workLocation: e.target.value })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-cross-red"
                                        placeholder="Work location..."
                                      />
                                    ) : (
                                      <div className="text-sm">{assignment.workLocation || 'TBD'}</div>
                                    )}
                                  </td>
                                  
                                  <td className="px-3 py-2 border-r border-gray-200 align-top">
                                    {isEditing && !readonly ? (
                                      <input
                                        type="datetime-local"
                                        value={formatDateTimeForInput(assignment.reportTime)}
                                        onChange={(e) => handleUpdateAssignment(assignment.id, { reportTime: new Date(e.target.value) })}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-cross-red"
                                      />
                                    ) : (
                                      <div className="text-sm">{formatDateTime(assignment.reportTime)}</div>
                                    )}
                                  </td>
                                  
                                  {isEditing && !readonly && (
                                    <td className="px-3 py-2 text-center align-top">
                                      <button
                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : isEditing ? (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">No assignments for {division.label}</p>
                        <p className="text-xs text-gray-400 mt-1">Use the "Add Assignment" dropdown above to add work assignments.</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Prepared By Section */}
            <div className="mt-8 pt-6 border-t border-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">
                    6. Prepared By (Planning Section Chief)
                  </label>
                  {isEditing && !readonly ? (
                    <input
                      type="text"
                      value={formData.preparedBy || ''}
                      onChange={(e) => handleFormUpdate({ preparedBy: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-red-cross-red"
                      placeholder="Name and title"
                    />
                  ) : (
                    <div className={`border-b border-gray-400 ${printMode ? 'min-h-[25px]' : 'min-h-[32px]'} flex items-end pb-1`}>
                      <span className="text-sm font-medium">{formData.preparedBy || '_'.repeat(40)}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase mb-1">
                    7. Approved By (Incident Commander)
                  </label>
                  <div className={`border-b border-gray-400 ${printMode ? 'min-h-[25px]' : 'min-h-[32px]'} flex items-end pb-1`}>
                    <span className="text-sm font-medium">{'_'.repeat(40)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body { 
            font-size: 11pt;
            line-height: 1.2;
            color: black;
          }
          
          .no-print { 
            display: none !important; 
          }
          
          table {
            page-break-inside: avoid;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          .bg-gray-50,
          .bg-white { 
            background: white !important; 
          }
          
          .border-gray-200,
          .border-gray-300,
          .border-gray-400 {
            border-color: #000 !important;
          }
          
          .shadow-sm,
          .shadow-md,
          .shadow-lg {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}