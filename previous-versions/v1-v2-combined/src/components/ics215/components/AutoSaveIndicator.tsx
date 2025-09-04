/**
 * Auto-Save Indicator Component
 * Shows save status, last saved time, and pending changes
 */

import React, { useState, useEffect } from 'react';
import { 
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

interface AutoSaveIndicatorProps {
  lastSaved?: Date;
  saveStatus: SaveStatus;
  pendingChanges: number;
  onRetry?: () => void;
}

export function AutoSaveIndicator({
  lastSaved,
  saveStatus,
  pendingChanges,
  onRetry
}: AutoSaveIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  // Update time ago display
  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
      
      if (diff < 60) {
        setTimeAgo('Just now');
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(diff / 3600);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastSaved]);

  // Get status configuration
  const getStatusConfig = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: ArrowPathIcon,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          text: 'Saving...',
          animate: 'animate-spin'
        };
      case 'saved':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600 bg-green-50 border-green-200',
          text: 'Saved',
          animate: ''
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-600 bg-red-50 border-red-200',
          text: 'Error',
          animate: ''
        };
      case 'offline':
        return {
          icon: CloudArrowUpIcon,
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          text: 'Offline',
          animate: ''
        };
      default:
        return {
          icon: ClockIcon,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          text: 'Waiting',
          animate: ''
        };
    }
  };

  const statusConfig = getStatusConfig();
  const IconComponent = statusConfig.icon;

  return (
    <div className="relative">
      {/* Main Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80 ${statusConfig.color}`}
        title={`${statusConfig.text}${lastSaved ? ` - Last saved ${timeAgo}` : ''}${pendingChanges > 0 ? ` - ${pendingChanges} pending changes` : ''}`}
      >
        <IconComponent className={`w-4 h-4 ${statusConfig.animate}`} />
        
        <span className="text-sm font-medium">
          {statusConfig.text}
        </span>
        
        {pendingChanges > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-white rounded-full min-w-[1.25rem] h-5">
            {pendingChanges > 99 ? '99+' : pendingChanges}
          </span>
        )}
      </button>

      {/* Detailed Dropdown */}
      {showDetails && (
        <>
          {/* Overlay to close dropdown */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDetails(false)}
          />
          
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Auto-Save Status
                </h3>
                <div className={`p-1 rounded-full ${statusConfig.color.replace('text-', 'bg-').replace('bg-', 'text-').replace('-600', '-100').replace('-50', '-600')}`}>
                  <IconComponent className={`w-4 h-4 ${statusConfig.animate}`} />
                </div>
              </div>

              {/* Status Details */}
              <div className="space-y-3">
                {/* Current Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <span className={`text-sm font-medium ${statusConfig.color.split(' ')[0]}`}>
                    {statusConfig.text}
                  </span>
                </div>

                {/* Last Saved */}
                {lastSaved && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Saved:</span>
                    <span className="text-sm text-gray-900">
                      {timeAgo}
                    </span>
                  </div>
                )}

                {/* Pending Changes */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Changes:</span>
                  <span className={`text-sm font-medium ${
                    pendingChanges > 0 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {pendingChanges === 0 ? 'None' : pendingChanges}
                  </span>
                </div>

                {/* Auto-save Interval */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto-save Interval:</span>
                  <span className="text-sm text-gray-900">30 seconds</span>
                </div>
              </div>

              {/* Status-specific content */}
              {saveStatus === 'error' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-800 font-medium">
                        Save Failed
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Unable to save changes to the server. Check your connection and try again.
                      </p>
                      {onRetry && (
                        <button
                          onClick={onRetry}
                          className="mt-2 text-xs text-red-700 underline hover:text-red-800"
                        >
                          Retry Save
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {saveStatus === 'offline' && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start">
                    <CloudArrowUpIcon className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-orange-800 font-medium">
                        Working Offline
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        Changes are saved locally and will sync when connection is restored.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {pendingChanges > 0 && saveStatus === 'saved' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <ClockIcon className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        Changes Pending
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        You have {pendingChanges} unsaved changes. They will be saved automatically.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {saveStatus === 'saving' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <ArrowPathIcon className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5 animate-spin" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">
                        Saving Changes
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Please wait while your changes are saved to the server.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Auto-save enabled
                  </p>
                  {lastSaved && (
                    <p className="text-xs text-gray-500">
                      {lastSaved.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}