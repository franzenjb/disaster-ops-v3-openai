/**
 * Sheltering Service Section Component for ICS Form 215
 * Advanced component with offline support, validation, and accessibility features
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ShelteringAssignment,
  ShelteringAssignmentType,
  ShelterType,
  ShelterStatus,
  OccupancyStatus,
  ShelterService,
  SpecialPopulation,
  AssignmentStatus,
  CollaborationSession
} from '../../../types/ics-215-types';
import {
  PlusIcon,
  TrashIcon,
  MapPinIcon,
  HomeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  ClockIcon,
  CloudIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';

interface ShelteringServiceSectionProps {
  worksheetId: string;
  assignments: ShelteringAssignment[];
  readonly?: boolean;
  printMode?: boolean;
  onAssignmentUpdate: (assignmentId: string, updates: Partial<ShelteringAssignment>) => void;
  collaborators: CollaborationSession[];
  isOffline?: boolean;
  queuedChanges?: number;
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface OfflineChange {
  id: string;
  timestamp: Date;
  type: 'create' | 'update' | 'delete';
  data: any;
  synced: boolean;
}

export function ShelteringServiceSection({
  worksheetId,
  assignments,
  readonly = false,
  printMode = false,
  onAssignmentUpdate,
  collaborators,
  isOffline = false,
  queuedChanges = 0
}: ShelteringServiceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [offlineChanges, setOfflineChanges] = useState<OfflineChange[]>([]);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Assignment type options
  const assignmentTypes: { value: ShelteringAssignmentType; label: string; icon: string }[] = [
    { value: 'Shelter_Operations', label: 'Shelter Operations', icon: '🏠' },
    { value: 'Site_Setup', label: 'Site Setup', icon: '🔧' },
    { value: 'Site_Closure', label: 'Site Closure', icon: '📦' },
    { value: 'Population_Management', label: 'Population Management', icon: '👥' },
    { value: 'Logistics_Support', label: 'Logistics Support', icon: '📋' }
  ];

  const shelterTypes: { value: ShelterType; label: string }[] = [
    { value: 'Congregate', label: 'Congregate Shelter' },
    { value: 'Non_Congregate', label: 'Non-Congregate Shelter' },
    { value: 'Hotel_Motel', label: 'Hotel/Motel' },
    { value: 'Dormitory', label: 'Dormitory' }
  ];

  const occupancyStatuses: { value: OccupancyStatus; label: string; color: string }[] = [
    { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
    { value: 'limited', label: 'Limited Space', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'full', label: 'At Capacity', color: 'bg-red-100 text-red-800' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' }
  ];

  const shelterServices: { value: ShelterService; label: string }[] = [
    { value: 'Registration', label: 'Registration' },
    { value: 'Feeding', label: 'Feeding' },
    { value: 'Health', label: 'Health Services' },
    { value: 'Mental_Health', label: 'Mental Health' },
    { value: 'Spiritual_Care', label: 'Spiritual Care' }
  ];

  const specialPopulations: { value: SpecialPopulation; label: string }[] = [
    { value: 'Families', label: 'Families with Children' },
    { value: 'Seniors', label: 'Seniors (65+)' },
    { value: 'Disabilities', label: 'People with Disabilities' },
    { value: 'Pets', label: 'Pet Owners' }
  ];

  const statusOptions: { value: AssignmentStatus; label: string; color: string }[] = [
    { value: 'planned', label: 'Planned', color: 'bg-gray-100 text-gray-800' },
    { value: 'assigned', label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'delayed', label: 'Delayed', color: 'bg-red-100 text-red-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-600' }
  ];

  // Offline change handling
  const addOfflineChange = useCallback((type: 'create' | 'update' | 'delete', data: any) => {
    const change: OfflineChange = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      data,
      synced: false
    };
    setOfflineChanges(prev => [...prev, change]);
  }, []);

  // Enhanced validation with offline considerations
  const validateAssignment = useCallback((assignment: Partial<ShelteringAssignment>): ValidationError[] => {
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
    if (assignment.maximumCapacity && assignment.maximumCapacity < 0) {
      errors.push({
        field: 'maximumCapacity',
        message: 'Maximum capacity cannot be negative',
        severity: 'error'
      });
    }

    if (assignment.targetOccupancy && assignment.maximumCapacity && 
        assignment.targetOccupancy > assignment.maximumCapacity) {
      errors.push({
        field: 'targetOccupancy',
        message: 'Target occupancy cannot exceed maximum capacity',
        severity: 'error'
      });
    }

    if (assignment.adaSpaces && assignment.adaSpaces < 0) {
      errors.push({
        field: 'adaSpaces',
        message: 'ADA spaces cannot be negative',
        severity: 'error'
      });
    }

    if (assignment.petSpaces && assignment.petSpaces < 0) {
      errors.push({
        field: 'petSpaces',
        message: 'Pet spaces cannot be negative',
        severity: 'error'
      });
    }

    // ADA compliance warnings
    if (assignment.maximumCapacity && assignment.adaSpaces) {
      const adaPercentage = (assignment.adaSpaces / assignment.maximumCapacity) * 100;
      if (adaPercentage < 5) {
        errors.push({
          field: 'adaSpaces',
          message: 'ADA spaces should be at least 5% of total capacity for compliance',
          severity: 'warning'
        });
      }
    }

    // Capacity warnings
    if (assignment.maximumCapacity && assignment.maximumCapacity > 500) {
      errors.push({
        field: 'maximumCapacity',
        message: 'Large shelter capacity (>500) may require additional management resources',
        severity: 'warning'
      });
    }

    // Pet accommodation
    if (assignment.specialPopulations?.includes('Pets') && (!assignment.petSpaces || assignment.petSpaces === 0)) {
      errors.push({
        field: 'petSpaces',
        message: 'Pet spaces should be allocated when serving pet owners',
        severity: 'warning'
      });
    }

    // Timing validation
    if (assignment.activationTime && assignment.deactivationTime && 
        assignment.activationTime >= assignment.deactivationTime) {
      errors.push({
        field: 'deactivationTime',
        message: 'Deactivation time must be after activation time',
        severity: 'error'
      });
    }

    return errors;
  }, []);

  // Enhanced update handler with offline support
  const handleAssignmentUpdate = useCallback((assignmentId: string, updates: Partial<ShelteringAssignment>) => {
    if (readonly) return;

    const currentAssignment = assignments.find(a => a.id === assignmentId);
    if (!currentAssignment) return;

    const updatedAssignment = { ...currentAssignment, ...updates };
    const errors = validateAssignment(updatedAssignment);
    
    // Update validation errors
    setValidationErrors(prev => [
      ...prev.filter(e => !e.field.startsWith(assignmentId)),
      ...errors.map(e => ({ ...e, field: `${assignmentId}.${e.field}` }))
    ]);

    // Handle offline mode
    if (isOffline) {
      addOfflineChange('update', { assignmentId, updates });
      setShowOfflineIndicator(true);
      setTimeout(() => setShowOfflineIndicator(false), 3000);
    }

    onAssignmentUpdate(assignmentId, updates);
  }, [readonly, assignments, validateAssignment, isOffline, addOfflineChange, onAssignmentUpdate]);

  // Create new assignment with offline support
  const createNewAssignment = useCallback(() => {
    if (readonly) return;

    const newId = `sheltering-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAssignment: Partial<ShelteringAssignment> = {
      id: newId,
      worksheetId,
      assignmentName: '',
      assignmentType: 'Shelter_Operations',
      status: 'planned',
      progressPercentage: 0,
      maximumCapacity: 50,
      targetOccupancy: 40,
      adaSpaces: 3,
      petSpaces: 5,
      isolationSpaces: 2,
      requiredPositions: {
        'Shelter Manager': 1,
        'Registration Staff': 2,
        'Security': 1,
        'Maintenance': 1
      },
      assignedStaff: [],
      servicesProvided: ['Registration'],
      specialPopulations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isOffline) {
      addOfflineChange('create', newAssignment);
      setShowOfflineIndicator(true);
      setTimeout(() => setShowOfflineIndicator(false), 3000);
    }

    onAssignmentUpdate(newId, newAssignment);
    setEditingId(newId);
  }, [readonly, worksheetId, isOffline, addOfflineChange, onAssignmentUpdate]);

  // Get collaborator indicator for assignment
  const getCollaboratorForAssignment = (assignmentId: string) => {
    return collaborators.find(c => c.editingSection === assignmentId);
  };

  // Calculate section summary with offline considerations
  const sectionSummary = {
    totalAssignments: assignments.length,
    completedAssignments: assignments.filter(a => a.status === 'completed').length,
    totalCapacity: assignments.reduce((sum, a) => sum + (a.maximumCapacity || 0), 0),
    activeShelters: assignments.filter(a => ['assigned', 'in_progress'].includes(a.status)).length,
    adaSpaces: assignments.reduce((sum, a) => sum + (a.adaSpaces || 0), 0),
    petFriendly: assignments.filter(a => a.specialPopulations?.includes('Pets')).length,
    hasErrors: validationErrors.some(e => e.severity === 'error'),
    hasWarnings: validationErrors.some(e => e.severity === 'warning'),
    offlineChanges: offlineChanges.filter(c => !c.synced).length
  };

  // Assignment card component
  const AssignmentCard = ({ assignment }: { assignment: ShelteringAssignment }) => {
    const isEditing = editingId === assignment.id;
    const collaborator = getCollaboratorForAssignment(assignment.id);
    const assignmentErrors = validationErrors.filter(e => e.field.startsWith(assignment.id));
    const hasErrors = assignmentErrors.some(e => e.severity === 'error');
    const hasWarnings = assignmentErrors.some(e => e.severity === 'warning');

    const statusConfig = statusOptions.find(s => s.value === assignment.status) || statusOptions[0];
    const typeConfig = assignmentTypes.find(t => t.value === assignment.assignmentType) || assignmentTypes[0];
    const occupancyConfig = occupancyStatuses.find(o => o.value === assignment.occupancyStatus) || occupancyStatuses[0];

    // Calculate occupancy percentage
    const occupancyPercentage = assignment.maximumCapacity ? 
      Math.round((assignment.targetOccupancy || 0) / assignment.maximumCapacity * 100) : 0;

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
                    placeholder="Enter shelter name..."
                    autoFocus
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assignment.assignmentName || 'Unnamed Shelter'}
                  </h3>
                )}
                
                {collaborator && (
                  <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    <PencilIcon className="w-3 h-3" />
                    <span>{collaborator.userName}</span>
                  </div>
                )}
                
                {/* Offline indicator for this assignment */}
                {isOffline && showOfflineIndicator && (
                  <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    <SignalSlashIcon className="w-3 h-3" />
                    <span>Offline</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                <span>{typeConfig.label}</span>
                {assignment.occupancyStatus && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${occupancyConfig.color}`}>
                    {occupancyConfig.label}
                  </span>
                )}
                {assignment.shelterName && (
                  <span className="flex items-center">
                    <HomeIcon className="w-4 h-4 mr-1" />
                    {assignment.shelterName}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Capacity indicator */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {assignment.targetOccupancy || 0} / {assignment.maximumCapacity || 0}
                </div>
                <div className="text-xs text-gray-500">
                  {occupancyPercentage}% capacity
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      occupancyPercentage > 90 ? 'bg-red-500' :
                      occupancyPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                  />
                </div>
              </div>
              
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
                      if (window.confirm('Are you sure you want to delete this shelter assignment?')) {
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Type
              </label>
              {isEditing && !readonly ? (
                <select
                  value={assignment.assignmentType}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { assignmentType: e.target.value as ShelteringAssignmentType })}
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
                Shelter Type
              </label>
              {isEditing && !readonly ? (
                <select
                  value={assignment.shelterType || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { shelterType: e.target.value as ShelterType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                >
                  <option value="">Select type...</option>
                  {shelterTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-900">
                  {shelterTypes.find(t => t.value === assignment.shelterType)?.label || 'Not specified'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupancy Status
              </label>
              {isEditing && !readonly ? (
                <select
                  value={assignment.occupancyStatus || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { occupancyStatus: e.target.value as OccupancyStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                >
                  <option value="">Select status...</option>
                  {occupancyStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${occupancyConfig.color}`}>
                  {occupancyConfig.label}
                </span>
              )}
            </div>
          </div>

          {/* Capacity Planning */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Capacity
              </label>
              {isEditing && !readonly ? (
                <input
                  type="number"
                  min="0"
                  value={assignment.maximumCapacity || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { maximumCapacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="0"
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.maximumCapacity || 0} people</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Occupancy
              </label>
              {isEditing && !readonly ? (
                <input
                  type="number"
                  min="0"
                  max={assignment.maximumCapacity}
                  value={assignment.targetOccupancy || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { targetOccupancy: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="0"
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.targetOccupancy || 0} people</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ADA Spaces
              </label>
              {isEditing && !readonly ? (
                <input
                  type="number"
                  min="0"
                  value={assignment.adaSpaces || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { adaSpaces: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="0"
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.adaSpaces || 0} spaces</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pet Spaces
              </label>
              {isEditing && !readonly ? (
                <input
                  type="number"
                  min="0"
                  value={assignment.petSpaces || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { petSpaces: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="0"
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.petSpaces || 0} spaces</p>
              )}
            </div>
          </div>

          {/* Services Provided */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services Provided
            </label>
            {isEditing && !readonly ? (
              <div className="flex flex-wrap gap-2">
                {shelterServices.map(service => (
                  <label key={service.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assignment.servicesProvided?.includes(service.value) || false}
                      onChange={(e) => {
                        const currentServices = assignment.servicesProvided || [];
                        const newServices = e.target.checked
                          ? [...currentServices, service.value]
                          : currentServices.filter(s => s !== service.value);
                        handleAssignmentUpdate(assignment.id, { servicesProvided: newServices });
                      }}
                      className="mr-2 rounded border-gray-300 text-red-cross-red focus:ring-red-cross-red"
                    />
                    <span className="text-sm text-gray-700">{service.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {(assignment.servicesProvided || []).map(service => (
                  <span key={service} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                    {shelterServices.find(s => s.value === service)?.label || service}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Special Populations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Populations Served
            </label>
            {isEditing && !readonly ? (
              <div className="flex flex-wrap gap-2">
                {specialPopulations.map(population => (
                  <label key={population.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={assignment.specialPopulations?.includes(population.value) || false}
                      onChange={(e) => {
                        const currentPopulations = assignment.specialPopulations || [];
                        const newPopulations = e.target.checked
                          ? [...currentPopulations, population.value]
                          : currentPopulations.filter(p => p !== population.value);
                        handleAssignmentUpdate(assignment.id, { specialPopulations: newPopulations });
                      }}
                      className="mr-2 rounded border-gray-300 text-red-cross-red focus:ring-red-cross-red"
                    />
                    <span className="text-sm text-gray-700">{population.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {(assignment.specialPopulations || []).map(population => (
                  <span key={population} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                    {specialPopulations.find(p => p.value === population)?.label || population}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shelter Manager
              </label>
              {isEditing && !readonly ? (
                <input
                  type="text"
                  value={assignment.shelterManager || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { shelterManager: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="Enter manager name..."
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.shelterManager || 'Not assigned'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              {isEditing && !readonly ? (
                <input
                  type="text"
                  value={assignment.address || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  placeholder="Enter shelter address..."
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.address || 'Not specified'}</p>
              )}
            </div>
          </div>

          {/* Safety Concerns */}
          {(isEditing || assignment.safetyConcerns) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Safety Concerns
              </label>
              {isEditing && !readonly ? (
                <textarea
                  value={assignment.safetyConcerns || ''}
                  onChange={(e) => handleAssignmentUpdate(assignment.id, { safetyConcerns: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-cross-red focus:border-red-cross-red text-sm"
                  rows={2}
                  placeholder="Enter any safety concerns or special precautions..."
                />
              ) : (
                <div className="flex items-start space-x-2">
                  <ShieldCheckIcon className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-900">{assignment.safetyConcerns}</p>
                </div>
              )}
            </div>
          )}

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
                  placeholder="Enter any additional notes, operational details, or special instructions..."
                />
              ) : (
                <p className="text-sm text-gray-900">{assignment.notes || 'No notes'}</p>
              )}
            </div>
          )}
        </div>

        {/* Card Footer - Enhanced with offline info */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div>
              <span>Created: {assignment.createdAt.toLocaleString()}</span>
              <span className="mx-2">•</span>
              <span>Updated: {assignment.updatedAt.toLocaleString()}</span>
            </div>
            {isOffline && (
              <div className="flex items-center space-x-1 text-orange-600">
                <CloudIcon className="w-3 h-3" />
                <span>Will sync when online</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={sectionRef}
      id="section-sheltering"
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
            
            <span className="text-2xl">🏠</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Sheltering Operations
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <HomeIcon className="w-4 h-4 mr-1" />
                  {sectionSummary.totalAssignments} shelters
                </span>
                <span className="flex items-center">
                  <UsersIcon className="w-4 h-4 mr-1" />
                  {sectionSummary.totalCapacity} capacity
                </span>
                <span className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  {sectionSummary.completedAssignments} active
                </span>
                <span>
                  {sectionSummary.petFriendly} pet-friendly
                </span>
                {isOffline && queuedChanges > 0 && (
                  <span className="flex items-center text-orange-600">
                    <CloudIcon className="w-4 h-4 mr-1" />
                    {queuedChanges} queued
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Offline mode indicator */}
            {isOffline && (
              <div className="flex items-center space-x-1 text-orange-600 bg-orange-100 px-2 py-1 rounded-full text-xs">
                <SignalSlashIcon className="w-3 h-3" />
                <span>Offline Mode</span>
              </div>
            )}

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
                <span>Add Shelter</span>
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
              <span className="text-6xl mb-4 block">🏠</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Shelter Assignments
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first shelter assignment to begin planning accommodations for disaster survivors.
              </p>
              {!readonly && !printMode && (
                <button
                  onClick={createNewAssignment}
                  className="flex items-center space-x-1 px-4 py-2 bg-red-cross-red text-white font-medium rounded hover:bg-red-700 transition-colors mx-auto"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create First Shelter</span>
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
          
          {/* Offline Changes Summary */}
          {isOffline && offlineChanges.length > 0 && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <CloudIcon className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800">
                    Working Offline
                  </h4>
                  <p className="text-xs text-orange-700 mt-1">
                    {offlineChanges.length} changes will be synchronized when connection is restored.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(
                      offlineChanges.reduce((acc, change) => {
                        acc[change.type] = (acc[change.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <span 
                        key={type}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800"
                      >
                        {count} {type}{count > 1 ? 's' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}