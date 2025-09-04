/**
 * Feeding Service Section Component for ICS Form 215
 * Advanced component with validation, collaboration, and accessibility features
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FeedingAssignment,
  FeedingAssignmentType,
  MealType,
  AssignmentStatus,
  CollaborationSession
} from '../../../types/ics-215-types';
import {
  PlusIcon,
  TrashIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface FeedingServiceSectionProps {
  worksheetId: string;
  assignments: FeedingAssignment[];
  readonly?: boolean;
  printMode?: boolean;
  onAssignmentUpdate: (assignmentId: string, updates: Partial<FeedingAssignment>) => void;
  collaborators: CollaborationSession[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export function FeedingServiceSection({
  worksheetId,
  assignments,
  readonly = false,
  printMode = false,
  onAssignmentUpdate,
  collaborators
}: FeedingServiceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Assignment type options
  const assignmentTypes: { value: FeedingAssignmentType; label: string; icon: string }[] = [
    { value: 'Fixed_Site', label: 'Fixed Feeding Site', icon: '🏢' },
    { value: 'Mobile_Feeding', label: 'Mobile Feeding (ERV)', icon: '🚚' },
    { value: 'Bulk_Distribution', label: 'Bulk Distribution', icon: '📦' },
    { value: 'Partner_Coordination', label: 'Partner Coordination', icon: '🤝' }
  ];

  const mealTypes: { value: MealType; label: string }[] = [
    { value: 'Breakfast', label: 'Breakfast' },
    { value: 'Lunch', label: 'Lunch' },
    { value: 'Dinner', label: 'Dinner' },
    { value: 'Snacks', label: 'Snacks' }
  ];

  const statusOptions: { value: AssignmentStatus; label: string; color: string }[] = [
    { value: 'planned', label: 'Planned', color: 'bg-gray-100 text-gray-800' },
    { value: 'assigned', label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'delayed', label: 'Delayed', color: 'bg-red-100 text-red-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-600' }
  ];

  // Validation function
  const validateAssignment = useCallback((assignment: Partial<FeedingAssignment>): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Required fields
    if (!assignment.assignmentName?.trim()) {
      errors.push({
        field: 'assignmentName',
        message: 'Assignment name is required',
        severity: 'error'
      });
    }

    if (!assignment.assignmentType) {
      errors.push({
        field: 'assignmentType',
        message: 'Assignment type is required',
        severity: 'error'
      });
    }

    // Capacity validation
    if (assignment.targetMeals && assignment.targetMeals < 0) {
      errors.push({
        field: 'targetMeals',
        message: 'Target meals cannot be negative',
        severity: 'error'
      });
    }

    if (assignment.estimatedClients && assignment.estimatedClients < 0) {
      errors.push({
        field: 'estimatedClients',
        message: 'Estimated clients cannot be negative',
        severity: 'error'
      });
    }

    // Staffing validation
    if (assignment.staffRequired && assignment.staffRequired < 0) {
      errors.push({
        field: 'staffRequired',
        message: 'Staff required cannot be negative',
        severity: 'error'
      });
    }

    if (assignment.volunteersRequired && assignment.volunteersRequired < 0) {
      errors.push({
        field: 'volunteersRequired',
        message: 'Volunteers required cannot be negative',
        severity: 'error'
      });
    }

    // Time validation
    if (assignment.startTime && assignment.endTime && assignment.startTime >= assignment.endTime) {
      errors.push({
        field: 'endTime',
        message: 'End time must be after start time',
        severity: 'error'
      });
    }

    // Warnings
    if (assignment.targetMeals && assignment.estimatedClients && assignment.targetMeals > assignment.estimatedClients * 3) {
      errors.push({
        field: 'targetMeals',
        message: 'Target meals seems high for estimated clients (>3 meals per person)',
        severity: 'warning'
      });
    }

    if (assignment.staffRequired && assignment.volunteersRequired && assignment.staffRequired > assignment.volunteersRequired) {
      errors.push({
        field: 'staffRequired',
        message: 'More staff than volunteers might indicate insufficient volunteer recruitment',
        severity: 'warning'
      });
    }

    return errors;
  }, []);

  // Update handler with validation
  const handleAssignmentUpdate = useCallback((assignmentId: string, updates: Partial<FeedingAssignment>) => {
    if (readonly) return;

    const currentAssignment = assignments.find(a => a.id === assignmentId);
    if (!currentAssignment) return;

    const updatedAssignment = { ...currentAssignment, ...updates };
    const errors = validateAssignment(updatedAssignment);
    
    // Update validation errors for this assignment
    setValidationErrors(prev => [
      ...prev.filter(e => !e.field.startsWith(assignmentId)),
      ...errors.map(e => ({ ...e, field: `${assignmentId}.${e.field}` }))
    ]);

    onAssignmentUpdate(assignmentId, updates);
  }, [readonly, assignments, validateAssignment, onAssignmentUpdate]);

  // Create new assignment
  const createNewAssignment = useCallback(() => {
    if (readonly) return;

    const newId = `feeding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAssignment: Partial<FeedingAssignment> = {
      id: newId,
      worksheetId,
      assignmentName: '',
      assignmentType: 'Fixed_Site',
      status: 'planned',
      progressPercentage: 0,
      targetMeals: 0,
      estimatedClients: 0,
      mealTypes: ['Lunch'],
      staffRequired: 1,
      volunteersRequired: 5,
      ervRequired: false,
      specialEquipment: [],
      assignedStaff: [],
      assignedVolunteers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onAssignmentUpdate(newId, newAssignment);
    setEditingId(newId);
    setShowAddForm(false);
  }, [readonly, worksheetId, onAssignmentUpdate]);

  // Get collaborator indicator for assignment
  const getCollaboratorForAssignment = (assignmentId: string) => {
    return collaborators.find(c => c.editingSection === assignmentId);
  };

  // Calculate section summary
  const sectionSummary = {
    totalAssignments: assignments.length,
    completedAssignments: assignments.filter(a => a.status === 'completed').length,
    totalMeals: assignments.reduce((sum, a) => sum + (a.targetMeals || 0), 0),
    totalStaff: assignments.reduce((sum, a) => sum + (a.staffRequired || 0), 0),
    totalVolunteers: assignments.reduce((sum, a) => sum + (a.volunteersRequired || 0), 0),
    activeSites: assignments.filter(a => ['assigned', 'in_progress'].includes(a.status)).length,
    hasErrors: validationErrors.some(e => e.severity === 'error'),
    hasWarnings: validationErrors.some(e => e.severity === 'warning')
  };

  // Assignment card component
  const AssignmentCard = ({ assignment }: { assignment: FeedingAssignment }) => {
    const isEditing = editingId === assignment.id;
    const collaborator = getCollaboratorForAssignment(assignment.id);
    const assignmentErrors = validationErrors.filter(e => e.field.startsWith(assignment.id));
    const hasErrors = assignmentErrors.some(e => e.severity === 'error');
    const hasWarnings = assignmentErrors.some(e => e.severity === 'warning');

    const statusConfig = statusOptions.find(s => s.value === assignment.status) || statusOptions[0];
    const typeConfig = assignmentTypes.find(t => t.value === assignment.assignmentType) || assignmentTypes[0];

    return (
      <div className={`border rounded-lg transition-all duration-200 ${
        hasErrors ? 'border-red-300 bg-red-50' :
        hasWarnings ? 'border-yellow-300 bg-yellow-50' :
        'border-gray-200 bg-white'
      } ${isEditing ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} ${
        printMode ? 'print-avoid-break' : ''
      }`}>
        {/* Card Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{typeConfig.icon}</span>
                {isEditing && !readonly ? (
                  <input
                    type="text"
                    value={assignment.assignmentName || ''}
                    onChange={(e) => handleAssignmentUpdate(assignment.id, { assignmentName: e.target.value })}
                    className="text-lg font-semibold text-gray-900 bg-transparent border-none p-0 focus:ring-0 focus:outline-none flex-1"
                    placeholder="Enter assignment name..."
                    autoFocus
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assignment.assignmentName || 'Unnamed Assignment'}
                  </h3>
                )}
                
                {collaborator && (
                  <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    <PencilIcon className="w-3 h-3" />
                    <span>{collaborator.userName}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                <span>{typeConfig.label}</span>
                {assignment.locationName && (
                  <span className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    {assignment.locationName}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Progress indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${assignment.progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {assignment.progressPercentage}%
                </span>
              </div>
              
              {/* Actions */}
              {!readonly && !printMode && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingId(isEditing ? null : assignment.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title={isEditing ? 'Stop editing' : 'Edit assignment'}
                  >
                    {isEditing ? <EyeIcon className="w-4 h-4" /> : <PencilIcon className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this assignment?')) {
                        // Handle deletion
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete assignment"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Validation errors */}
          {assignmentErrors.length > 0 && (
            <div className="mt-3 space-y-1">
              {assignmentErrors.map((error, index) => (
                <div 
                  key={index}
                  className={`flex items-start space-x-2 text-xs ${
                    error.severity === 'error' ? 'text-red-700' :
                    error.severity === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                  }`}
                >
                  <ExclamationTriangleIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{error.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Type
              </label>
              {isEditing && !readonly ? (
                <select
                  value={assignment.assignmentType}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { assignmentType: e.target.value as FeedingAssignmentType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                >
                  {assignmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-900">{typeConfig.label}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              {isEditing && !readonly ? (
                <select
                  value={assignment.status}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { status: e.target.value as AssignmentStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress %
              </label>
              {isEditing && !readonly ? (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={assignment.progressPercentage || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { progressPercentage: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.progressPercentage}%</p>
              )}
            </div>
          </div>

          {/* Capacity Planning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Meals
              </label>
              {isEditing && !readonly ? (
                <input
                  type="number"
                  min="0"
                  value={assignment.targetMeals || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { targetMeals: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="0"
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.targetMeals || 0} meals</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Clients
              </label>
              {isEditing && !readonly ? (
                <input
                  type="number"
                  min="0"
                  value={assignment.estimatedClients || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { estimatedClients: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="0"
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.estimatedClients || 0} people</p>
              )}
            </div>
          </div>

          {/* Meal Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Types
            </label>
            {isEditing && !readonly ? (
              <div className="flex flex-wrap gap-2">
                {mealTypes.map(meal => (
                  <label key={meal.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assignment.mealTypes?.includes(meal.value) || false}
                      onChange={(e) => {
                        const currentMealTypes = assignment.mealTypes || [];
                        const newMealTypes = e.target.checked
                          ? [...currentMealTypes, meal.value]
                          : currentMealTypes.filter(m => m !== meal.value);
                        handleAssignmentUpdate(assignment.id, { mealTypes: newMealTypes });
                      }}
                      className="mr-2 rounded border-gray-300 text-red-cross-red focus:ring-red-cross-red"
                    />
                    <span className="text-sm text-gray-700">{meal.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {(assignment.mealTypes || []).map(meal => (
                  <span key={meal} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                    {meal}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Staffing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Staff Required
              </label>
              {isEditing && !readonly ? (
                <input
                  type="number"
                  min="0"
                  value={assignment.staffRequired || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { staffRequired: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="0"
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.staffRequired || 0} staff</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volunteers Required
              </label>
              {isEditing && !readonly ? (
                <input
                  type="number"
                  min="0"
                  value={assignment.volunteersRequired || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { volunteersRequired: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="0"
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.volunteersRequired || 0} volunteers</p>
              )}
            </div>
          </div>

          {/* Location and Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Name
              </label>
              {isEditing && !readonly ? (
                <input
                  type="text"
                  value={assignment.locationName || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { locationName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="Enter location name..."
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.locationName || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Leader
              </label>
              {isEditing && !readonly ? (
                <input
                  type="text"
                  value={assignment.teamLeader || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { teamLeader: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="Enter team leader name..."
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.teamLeader || 'Not assigned'}</p>
              )}
            </div>
          </div>

          {/* ERV Required */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`erv-${assignment.id}`}
              checked={assignment.ervRequired || false}
              onChange={(e) => !readonly && handleAssignmentUpdate(assignment.id, { ervRequired: e.target.checked })}
              disabled={readonly}
              className="mr-2 rounded border-gray-300 text-red-cross-red focus:ring-red-cross-red disabled:opacity-50"
            />
            <label htmlFor={`erv-${assignment.id}`} className="text-sm text-gray-700">
              Emergency Response Vehicle (ERV) Required
            </label>
          </div>

          {/* Notes */}
          {(isEditing || assignment.notes) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              {isEditing && !readonly ? (
                <textarea
                  value={assignment.notes || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  rows={3}
                  placeholder="Enter any additional notes, challenges, or special instructions..."
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.notes || 'No notes'}</p>
              )}
            </div>
          )}
        </div>

        {/* Card Footer - Timestamps */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 rounded-b-lg">
          <div className="flex justify-between">
            <span>Created: {assignment.createdAt.toLocaleString()}</span>
            <span>Updated: {assignment.updatedAt.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={sectionRef}
      id="section-feeding"
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
            
            <span className="text-2xl">🍽️</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Feeding Operations
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <UsersIcon className="w-4 h-4 mr-1" />
                  {sectionSummary.totalAssignments} assignments
                </span>
                <span className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  {sectionSummary.completedAssignments} completed
                </span>
                <span>
                  {sectionSummary.totalMeals.toLocaleString()} total meals planned
                </span>
                <span>
                  {sectionSummary.totalStaff + sectionSummary.totalVolunteers} people required
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Validation indicators */}
            {sectionSummary.hasErrors && (
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" title="Has validation errors" />
            )}
            {sectionSummary.hasWarnings && !sectionSummary.hasErrors && (
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" title="Has warnings" />
            )}
            
            {/* Add button */}
            {!readonly && !printMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  createNewAssignment();
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-red-cross-red text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Assignment</span>
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
              <span className="text-6xl mb-4 block">🍽️</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Feeding Assignments
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first feeding assignment to start planning meals and nutrition support.
              </p>
              {!readonly && !printMode && (
                <button
                  onClick={createNewAssignment}
                  className="flex items-center space-x-1 px-4 py-2 bg-red-cross-red text-white font-medium rounded hover:bg-red-700 transition-colors mx-auto"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create First Assignment</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {assignments.map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}