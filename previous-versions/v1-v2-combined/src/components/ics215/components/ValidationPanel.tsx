/**
 * Validation Panel Component
 * Slide-out panel showing validation errors, warnings, and suggestions
 */

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  section?: string;
  assignmentId?: string;
  assignmentName?: string;
}

interface ValidationPanelProps {
  errors: ValidationError[];
  isValid: boolean;
  onClose: () => void;
  onFixError: (error: ValidationError) => void;
}

export function ValidationPanel({
  errors,
  isValid,
  onClose,
  onFixError
}: ValidationPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [isVisible, setIsVisible] = useState(true);

  // Filter errors based on search and filters
  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (error.assignmentName && error.assignmentName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSeverity = selectedSeverity === 'all' || error.severity === selectedSeverity;
    const matchesSection = selectedSection === 'all' || error.section === selectedSection;
    
    return matchesSearch && matchesSeverity && matchesSection;
  });

  // Group errors by severity
  const errorsBySeverity = {
    error: filteredErrors.filter(e => e.severity === 'error'),
    warning: filteredErrors.filter(e => e.severity === 'warning'),
    info: filteredErrors.filter(e => e.severity === 'info')
  };

  // Get unique sections
  const sections = Array.from(new Set(errors.map(e => e.section).filter(Boolean))) as string[];

  // Severity configuration
  const severityConfig = {
    error: {
      icon: ExclamationCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Errors',
      description: 'Must be fixed before submission'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Warnings',
      description: 'Should be reviewed and addressed'
    },
    info: {
      icon: InformationCircleIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      label: 'Info',
      description: 'Suggestions and best practices'
    }
  };

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  // Auto-hide after showing success
  useEffect(() => {
    if (isValid && errors.length === 0) {
      const timer = setTimeout(() => handleClose(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isValid, errors.length]);

  const ErrorItem = ({ error }: { error: ValidationError }) => {
    const config = severityConfig[error.severity];
    const IconComponent = config.icon;

    return (
      <div 
        className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 ${config.bgColor} ${config.borderColor}`}
        onClick={() => onFixError(error)}
      >
        <div className="flex items-start space-x-3">
          <IconComponent className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {error.assignmentName ? `${error.assignmentName}` : 'Form Validation'}
              </h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                error.severity === 'error' ? 'bg-red-100 text-red-800' :
                error.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {config.label.slice(0, -1)}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-2">
              {error.message}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Field: {error.field}</span>
                {error.section && (
                  <>
                    <span>•</span>
                    <span>Section: {error.section}</span>
                  </>
                )}
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Fix →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-x-0' : 'translate-x-full'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          {isValid && errors.length === 0 ? (
            <>
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                All Validated
              </h3>
            </>
          ) : (
            <>
              <ExclamationTriangleIcon className={`w-5 h-5 ${
                errorsBySeverity.error.length > 0 ? 'text-red-600' :
                errorsBySeverity.warning.length > 0 ? 'text-yellow-600' : 'text-blue-600'
              }`} />
              <h3 className="text-lg font-semibold text-gray-900">
                Validation Results
              </h3>
            </>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Success Message */}
      {isValid && errors.length === 0 && (
        <div className="p-6 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Validation Complete!
          </h3>
          <p className="text-sm text-green-700">
            All assignments have been validated successfully. No issues found.
          </p>
        </div>
      )}

      {/* Validation Content */}
      {errors.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {errorsBySeverity.error.length}
                </div>
                <div className="text-xs text-gray-600">Errors</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {errorsBySeverity.warning.length}
                </div>
                <div className="text-xs text-gray-600">Warnings</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {errorsBySeverity.info.length}
                </div>
                <div className="text-xs text-gray-600">Info</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-4 space-y-3 border-b border-gray-200">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search validation issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="error">Errors Only</option>
                  <option value="warning">Warnings Only</option>
                  <option value="info">Info Only</option>
                </select>
              </div>
              
              {sections.length > 0 && (
                <div className="flex-1">
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Sections</option>
                    {sections.map(section => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Filter count */}
            <div className="text-xs text-gray-500">
              Showing {filteredErrors.length} of {errors.length} issues
            </div>
          </div>

          {/* Error List */}
          <div className="flex-1 overflow-y-auto">
            {filteredErrors.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FunnelIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No issues match your filters</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {/* Group by severity */}
                {(['error', 'warning', 'info'] as const).map(severity => {
                  const severityErrors = errorsBySeverity[severity];
                  if (severityErrors.length === 0) return null;

                  const config = severityConfig[severity];

                  return (
                    <div key={severity}>
                      <div className="flex items-center space-x-2 mb-3">
                        <config.icon className={`w-4 h-4 ${config.color}`} />
                        <h4 className="text-sm font-semibold text-gray-900">
                          {config.label} ({severityErrors.length})
                        </h4>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        {severityErrors.map((error, index) => (
                          <ErrorItem 
                            key={`${error.field}-${index}`} 
                            error={error} 
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {errorsBySeverity.error.length > 0 && (
                  <span className="text-red-600 font-medium">
                    Fix {errorsBySeverity.error.length} error{errorsBySeverity.error.length === 1 ? '' : 's'} to submit
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // Jump to first error
                    if (errorsBySeverity.error.length > 0) {
                      onFixError(errorsBySeverity.error[0]);
                    } else if (filteredErrors.length > 0) {
                      onFixError(filteredErrors[0]);
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                  disabled={filteredErrors.length === 0}
                >
                  Fix First Issue
                </button>
                
                <button
                  onClick={handleClose}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-xs text-gray-400 bg-gray-800 text-white px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-between">
            <span>Close</span>
            <span>ESC</span>
          </div>
        </div>
      </div>
    </div>
  );
}