'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth, useRoleAccess } from '../../lib/auth/AuthProvider';

/**
 * User Menu Component - Phase 3 Implementation
 * 
 * Dropdown menu showing user profile, role, and actions.
 * Integrates with real-time collaboration system.
 */

export function UserMenu() {
  const { user, profile, signOut, updatePresence } = useAuth();
  const { hasRole, isAdmin, canCreateOperations } = useRoleAccess();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'online' | 'away' | 'busy'>('online');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle status change
  const handleStatusChange = async (status: 'online' | 'away' | 'busy') => {
    setCurrentStatus(status);
    await updatePresence(status);
  };

  // Handle sign out
  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user || !profile) {
    return null;
  }

  // Status indicator colors
  const getStatusColor = (status: 'online' | 'away' | 'busy') => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'system_admin': return 'bg-purple-100 text-purple-800';
      case 'operation_manager': return 'bg-blue-100 text-blue-800';
      case 'iap_coordinator': return 'bg-green-100 text-green-800';
      case 'field_supervisor': return 'bg-orange-100 text-orange-800';
      case 'volunteer': return 'bg-gray-100 text-gray-800';
      case 'viewer': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format role display name
  const formatRoleName = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label="User menu"
      >
        {/* Avatar */}
        <div className="relative">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Status indicator */}
          <div 
            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(currentStatus)}`}
            title={`Status: ${currentStatus}`}
          />
        </div>
        
        {/* User info */}
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-900 truncate max-w-32">
            {profile.full_name}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-32">
            {formatRoleName(profile.role)}
          </div>
        </div>
        
        {/* Dropdown arrow */}
        <div className="text-gray-400">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          
          {/* User Profile Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="relative flex-shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center text-white font-medium">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(currentStatus)}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {profile.full_name}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {user.email}
                </p>
                
                {/* Role Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleBadgeColor(profile.role)}`}>
                  {formatRoleName(profile.role)}
                </span>
                
                {/* Additional info */}
                {profile.red_cross_id && (
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {profile.red_cross_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-700 mb-2">Status</p>
            <div className="flex space-x-1">
              {[
                { status: 'online' as const, label: 'Online', emoji: '🟢' },
                { status: 'away' as const, label: 'Away', emoji: '🟡' },
                { status: 'busy' as const, label: 'Busy', emoji: '🔴' }
              ].map(({ status, label, emoji }) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                    currentStatus === status
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Implement profile modal
                alert('Profile settings will be implemented in the next phase');
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="mr-3">👤</span>
              Profile Settings
            </button>

            {canCreateOperations && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Integrate with operation creation
                  alert('Quick operation creation will be implemented');
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span className="mr-3">➕</span>
                Create Operation
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Implement notifications
                alert('Notifications will be implemented in the next phase');
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="mr-3">🔔</span>
              Notifications
              <span className="ml-auto bg-red-600 text-white text-xs rounded-full px-2 py-1">3</span>
            </button>

            {isAdmin && (
              <>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // TODO: Implement admin panel
                    alert('Admin panel will be implemented in the next phase');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span className="mr-3">⚙️</span>
                  Admin Panel
                </button>
              </>
            )}

            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Implement help/support
                window.open('https://www.redcross.org/get-help/disaster-relief-and-recovery-services', '_blank');
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span className="mr-3">❓</span>
              Help & Support
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                handleSignOut();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <span className="mr-3">🚪</span>
              Sign Out
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Last active: {new Date(profile.last_active).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}