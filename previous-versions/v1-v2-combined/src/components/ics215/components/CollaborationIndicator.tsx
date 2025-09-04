/**
 * Real-time Collaboration Indicator Component
 * Shows active collaborators, conflicts, and connection status
 */

import React, { useState } from 'react';
import { CollaborationSession } from '../../../types/ics-215-types';
import { 
  UserGroupIcon, 
  ExclamationTriangleIcon,
  WifiIcon,
  NoSymbolIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface CollaborationIndicatorProps {
  collaborators: CollaborationSession[];
  conflictCount: number;
  isConnected: boolean;
}

export function CollaborationIndicator({
  collaborators,
  conflictCount,
  isConnected
}: CollaborationIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const activeCollaborators = collaborators.filter(c => c.status === 'active');
  const editingCollaborators = activeCollaborators.filter(c => c.editingSection);
  
  return (
    <div className="relative">
      {/* Main Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-colors ${
          !isConnected 
            ? 'bg-gray-100 border-gray-300 text-gray-600'
            : conflictCount > 0
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100'
            : activeCollaborators.length > 0
            ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
        }`}
        title={`${activeCollaborators.length} active collaborators, ${conflictCount} conflicts`}
      >
        {!isConnected ? (
          <NoSymbolIcon className="w-4 h-4" />
        ) : (
          <UserGroupIcon className="w-4 h-4" />
        )}
        
        <span className="text-sm font-medium">
          {activeCollaborators.length}
        </span>
        
        {conflictCount > 0 && (
          <>
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600">
              {conflictCount}
            </span>
          </>
        )}
        
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-400' : 'bg-gray-400'
        }`} />
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
                  Real-time Collaboration
                </h3>
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <WifiIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <NoSymbolIcon className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-600">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Connection Status */}
              {!isConnected && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        Connection Issues
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Real-time collaboration is temporarily unavailable. Your changes are being saved locally.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Conflicts */}
              {conflictCount > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-800 font-medium">
                        {conflictCount} Edit Conflicts
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        Multiple users are editing the same sections. Please review and resolve conflicts.
                      </p>
                      <button className="text-xs text-red-700 underline mt-1 hover:text-red-800">
                        View Conflicts
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Collaborators */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Active Users ({activeCollaborators.length})
                </h4>
                
                {activeCollaborators.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    You are working alone
                  </p>
                ) : (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {activeCollaborators.map((collaborator) => {
                      const isEditing = !!collaborator.editingSection;
                      const lastActivityAgo = Math.floor(
                        (Date.now() - collaborator.lastActivity.getTime()) / 1000 / 60
                      );
                      
                      return (
                        <div 
                          key={collaborator.sessionId}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            {/* Avatar */}
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {collaborator.userName.substring(0, 2).toUpperCase()}
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {collaborator.userName}
                              </p>
                              <div className="flex items-center space-x-1">
                                {isEditing ? (
                                  <PencilIcon className="w-3 h-3 text-green-500" />
                                ) : (
                                  <EyeIcon className="w-3 h-3 text-gray-400" />
                                )}
                                <p className="text-xs text-gray-500">
                                  {isEditing ? `Editing ${collaborator.editingSection}` : 'Viewing'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {collaborator.userRole && (
                              <p className="text-xs text-gray-600 font-medium">
                                {collaborator.userRole}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {lastActivityAgo === 0 ? 'Now' : `${lastActivityAgo}m ago`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Currently Being Edited Sections */}
              {editingCollaborators.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    Currently Being Edited
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(editingCollaborators.map(c => c.editingSection))).map(section => {
                      const editorsInSection = editingCollaborators.filter(c => c.editingSection === section);
                      return (
                        <span 
                          key={section}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"
                          title={`Being edited by: ${editorsInSection.map(c => c.userName).join(', ')}`}
                        >
                          <PencilIcon className="w-3 h-3 mr-1" />
                          {section}
                          {editorsInSection.length > 1 && (
                            <span className="ml-1 font-medium">
                              ({editorsInSection.length})
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  Changes are synchronized in real-time
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}