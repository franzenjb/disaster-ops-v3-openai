/**
 * Offline Mode Indicator Component
 * Shows network connectivity status, queued actions, and sync status
 */

import React, { useState } from 'react';
import { 
  WifiIcon,
  NoSymbolIcon,
  CloudArrowUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export type SyncStatus = 'synced' | 'syncing' | 'queued' | 'error';

interface QueuedAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  timestamp: Date;
  size?: number;
}

interface OfflineModeIndicatorProps {
  isOnline: boolean;
  queuedActions: QueuedAction[];
  syncStatus: SyncStatus;
  onSync?: () => void;
  onClearQueue?: () => void;
}

export function OfflineModeIndicator({
  isOnline,
  queuedActions,
  syncStatus,
  onSync,
  onClearQueue
}: OfflineModeIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Get status configuration
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: NoSymbolIcon,
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        text: 'Offline',
        description: 'Working offline - changes queued for sync'
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          icon: ArrowPathIcon,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          text: 'Syncing',
          description: 'Synchronizing queued changes',
          animate: 'animate-spin'
        };
      case 'queued':
        return {
          icon: ClockIcon,
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          text: 'Queued',
          description: `${queuedActions.length} changes queued for sync`
        };
      case 'error':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-600 bg-red-50 border-red-200',
          text: 'Error',
          description: 'Sync failed - will retry automatically'
        };
      default:
        return {
          icon: isOnline ? WifiIcon : NoSymbolIcon,
          color: isOnline 
            ? 'text-green-600 bg-green-50 border-green-200' 
            : 'text-gray-600 bg-gray-50 border-gray-200',
          text: isOnline ? 'Online' : 'Offline',
          description: isOnline ? 'Connected and synced' : 'No internet connection'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const IconComponent = statusConfig.icon;

  // Calculate total queued size
  const totalQueuedSize = queuedActions.reduce((total, action) => total + (action.size || 0), 0);
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Group actions by type
  const actionsByType = queuedActions.reduce((acc, action) => {
    acc[action.type] = (acc[action.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="relative">
      {/* Main Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80 ${statusConfig.color}`}
        title={statusConfig.description}
      >
        <IconComponent className={`w-4 h-4 ${statusConfig.animate || ''}`} />
        
        <span className="text-sm font-medium">
          {statusConfig.text}
        </span>
        
        {queuedActions.length > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-white rounded-full min-w-[1.25rem] h-5">
            {queuedActions.length > 99 ? '99+' : queuedActions.length}
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
          
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Connection & Sync
                </h3>
                <div className={`p-1 rounded-full ${statusConfig.color.replace('text-', 'bg-').replace('bg-', 'text-').replace('-600', '-100').replace('-50', '-600')}`}>
                  <IconComponent className={`w-4 h-4 ${statusConfig.animate || ''}`} />
                </div>
              </div>

              {/* Connection Status */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Network Status:</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isOnline ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isOnline ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isOnline ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sync Status:</span>
                  <span className={`text-sm font-medium ${statusConfig.color.split(' ')[0]}`}>
                    {statusConfig.text}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Queued Actions:</span>
                  <span className={`text-sm font-medium ${
                    queuedActions.length > 0 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {queuedActions.length === 0 ? 'None' : queuedActions.length}
                  </span>
                </div>

                {totalQueuedSize > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Queue Size:</span>
                    <span className="text-sm text-gray-900">
                      {formatSize(totalQueuedSize)}
                    </span>
                  </div>
                )}
              </div>

              {/* Offline Mode Notice */}
              {!isOnline && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start">
                    <NoSymbolIcon className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-orange-800 font-medium">
                        Working Offline
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        Your changes are being saved locally and will sync automatically when connection is restored.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sync Error */}
              {syncStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-800 font-medium">
                        Sync Failed
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Unable to sync changes to the server. Retrying automatically...
                      </p>
                      {onSync && (
                        <button
                          onClick={onSync}
                          className="mt-2 text-xs text-red-700 underline hover:text-red-800"
                        >
                          Retry Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Queued Actions */}
              {queuedActions.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Queued Actions
                    </h4>
                    {onClearQueue && (
                      <button
                        onClick={onClearQueue}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Clear Queue
                      </button>
                    )}
                  </div>
                  
                  {/* Action Type Summary */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {Object.entries(actionsByType).map(([type, count]) => (
                      <span 
                        key={type}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {count} {type}
                        {count > 1 ? 's' : ''}
                      </span>
                    ))}
                  </div>

                  {/* Recent Actions */}
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {queuedActions.slice(0, 5).map((action) => {
                      const timeAgo = Math.floor((Date.now() - action.timestamp.getTime()) / 1000 / 60);
                      
                      return (
                        <div 
                          key={action.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${
                              action.type === 'create' ? 'bg-green-400' :
                              action.type === 'update' ? 'bg-blue-400' : 'bg-red-400'
                            }`} />
                            <span className="font-medium capitalize">
                              {action.type}
                            </span>
                            <span className="text-gray-600">
                              {action.entity}
                            </span>
                          </div>
                          <span className="text-gray-500">
                            {timeAgo === 0 ? 'Now' : `${timeAgo}m ago`}
                          </span>
                        </div>
                      );
                    })}
                    
                    {queuedActions.length > 5 && (
                      <p className="text-xs text-gray-500 text-center py-1">
                        ... and {queuedActions.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              {isOnline && queuedActions.length > 0 && syncStatus !== 'syncing' && (
                <div className="flex space-x-2">
                  {onSync && (
                    <button
                      onClick={onSync}
                      className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      <ArrowPathIcon className="w-3 h-3 inline mr-1" />
                      Sync Now
                    </button>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  {isOnline ? 'Auto-sync enabled' : 'Will auto-sync when online'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}