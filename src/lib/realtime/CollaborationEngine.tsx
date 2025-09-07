/**
 * Real-time Collaboration Engine
 * 
 * This system enables multiple disaster response team members to collaborate
 * simultaneously on facility management and IAP development with conflict resolution.
 * 
 * PHASE 3 - WEEK 3 IMPLEMENTATION
 * Key Features:
 * - Real-time facility updates across all connected users
 * - Optimistic UI updates with conflict resolution
 * - User presence indicators and activity tracking
 * - Operational period synchronization
 * - Role-based collaboration permissions
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Types for collaboration
interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  role: 'ip_group' | 'discipline' | 'field' | 'viewer';
  color: string;
  lastSeen: Date;
  currentFacility?: string;
  currentSection?: string;
}

interface CollaborationActivity {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'view';
  entityType: 'facility' | 'personnel' | 'iap' | 'assignment';
  entityId: string;
  entityName: string;
  timestamp: Date;
  details?: any;
}

interface ConflictResolution {
  conflictId: string;
  entityType: string;
  entityId: string;
  localVersion: any;
  remoteVersion: any;
  conflictFields: string[];
  resolution: 'local' | 'remote' | 'merge' | 'manual';
  resolvedBy?: string;
  resolvedAt?: Date;
}

interface CollaborationContextType {
  // Current state
  connectedUsers: CollaborationUser[];
  currentUser: CollaborationUser | null;
  isOnline: boolean;
  activities: CollaborationActivity[];
  conflicts: ConflictResolution[];
  
  // User management
  updateUserPresence: (facilityId?: string, section?: string) => void;
  getUsersInFacility: (facilityId: string) => CollaborationUser[];
  
  // Activity tracking
  trackActivity: (activity: Omit<CollaborationActivity, 'id' | 'timestamp'>) => void;
  
  // Conflict resolution
  resolveConflict: (conflictId: string, resolution: ConflictResolution['resolution'], mergedData?: any) => void;
  
  // Real-time sync
  subscribeToEntity: (entityType: string, entityId: string, callback: (data: any) => void) => () => void;
  broadcastChange: (entityType: string, entityId: string, change: any) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

// User colors for visual identification
const USER_COLORS = [
  '#DC2626', '#EA580C', '#D97706', '#65A30D', '#059669',
  '#0891B2', '#2563EB', '#7C3AED', '#C026D3', '#E11D48'
];

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  // State management
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CollaborationUser | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  
  // Refs for managing subscriptions
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
  const presenceIntervalRef = useRef<NodeJS.Timeout>();
  const activityQueueRef = useRef<CollaborationActivity[]>([]);

  // Initialize collaboration system
  useEffect(() => {
    initializeCollaboration();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCollaboration = async () => {
    try {
      // Get current user from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No authenticated user - collaboration disabled');
        return;
      }

      // Get user role from database
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // Create collaboration user
      const collaborationUser: CollaborationUser = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User',
        email: user.email || '',
        role: userRole?.role || 'viewer',
        color: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
        lastSeen: new Date(),
        currentFacility: undefined,
        currentSection: undefined
      };

      setCurrentUser(collaborationUser);
      setIsOnline(true);

      // Subscribe to presence channel
      subscribeToPresence();
      
      // Subscribe to activity feed
      subscribeToActivities();
      
      // Start presence heartbeat
      startPresenceHeartbeat();

      console.log('✅ Collaboration system initialized for user:', collaborationUser.name);

    } catch (error) {
      console.error('❌ Failed to initialize collaboration:', error);
      setIsOnline(false);
    }
  };

  const subscribeToPresence = () => {
    const presenceChannel = supabase.channel('user-presence', {
      config: { presence: { key: currentUser?.id } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        const users = Object.values(presenceState).flat() as CollaborationUser[];
        setConnectedUsers(users);
        console.log('👥 Users online:', users.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('👋 User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('👋 User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && currentUser) {
          await presenceChannel.track(currentUser);
        }
      });

    channelsRef.current.set('presence', presenceChannel);
  };

  const subscribeToActivities = () => {
    const activityChannel = supabase.channel('collaboration-activities');

    activityChannel
      .on('broadcast', { event: 'activity' }, (payload) => {
        const activity = payload.payload as CollaborationActivity;
        setActivities(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
        
        // Show activity notification
        showActivityNotification(activity);
      })
      .subscribe();

    channelsRef.current.set('activities', activityChannel);
  };

  const startPresenceHeartbeat = () => {
    presenceIntervalRef.current = setInterval(() => {
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          lastSeen: new Date()
        };
        
        const presenceChannel = channelsRef.current.get('presence');
        if (presenceChannel) {
          presenceChannel.track(updatedUser);
        }
      }
    }, 30000); // Update every 30 seconds
  };

  const updateUserPresence = useCallback((facilityId?: string, section?: string) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      currentFacility: facilityId,
      currentSection: section,
      lastSeen: new Date()
    };

    setCurrentUser(updatedUser);

    const presenceChannel = channelsRef.current.get('presence');
    if (presenceChannel) {
      presenceChannel.track(updatedUser);
    }

    console.log('📍 User presence updated:', { facilityId, section });
  }, [currentUser]);

  const getUsersInFacility = useCallback((facilityId: string): CollaborationUser[] => {
    return connectedUsers.filter(user => user.currentFacility === facilityId);
  }, [connectedUsers]);

  const trackActivity = useCallback((activity: Omit<CollaborationActivity, 'id' | 'timestamp'>) => {
    if (!currentUser) return;

    const fullActivity: CollaborationActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId: currentUser.id,
      userName: currentUser.name
    };

    // Add to local queue
    activityQueueRef.current.push(fullActivity);
    setActivities(prev => [fullActivity, ...prev.slice(0, 49)]);

    // Broadcast to other users
    const activityChannel = channelsRef.current.get('activities');
    if (activityChannel) {
      activityChannel.send({
        type: 'broadcast',
        event: 'activity',
        payload: fullActivity
      });
    }

    console.log('📝 Activity tracked:', fullActivity.action, fullActivity.entityType);
  }, [currentUser]);

  const subscribeToEntity = useCallback((
    entityType: string, 
    entityId: string, 
    callback: (data: any) => void
  ): (() => void) => {
    const channelName = `${entityType}-${entityId}`;
    
    if (channelsRef.current.has(channelName)) {
      console.warn(`Already subscribed to ${channelName}`);
      return () => {};
    }

    const entityChannel = supabase.channel(channelName);

    entityChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: entityType === 'facility' ? 'facilities' : entityType,
        filter: `id=eq.${entityId}`
      }, (payload) => {
        console.log('📡 Real-time update:', payload.eventType, entityType, entityId);
        
        // Handle potential conflicts
        if (payload.eventType === 'UPDATE') {
          handlePotentialConflict(entityType, entityId, payload.new, payload.old);
        }
        
        callback(payload);
      })
      .on('broadcast', { event: 'change' }, (payload) => {
        console.log('📡 Broadcast change:', payload);
        callback(payload.payload);
      })
      .subscribe();

    channelsRef.current.set(channelName, entityChannel);

    // Return unsubscribe function
    return () => {
      entityChannel.unsubscribe();
      channelsRef.current.delete(channelName);
    };
  }, []);

  const broadcastChange = useCallback((entityType: string, entityId: string, change: any) => {
    const channelName = `${entityType}-${entityId}`;
    const channel = channelsRef.current.get(channelName);
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'change',
        payload: {
          entityType,
          entityId,
          change,
          userId: currentUser?.id,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [currentUser]);

  const handlePotentialConflict = (entityType: string, entityId: string, newData: any, oldData: any) => {
    // Simple conflict detection based on updated_at timestamps
    const localTimestamp = new Date(oldData.updated_at);
    const remoteTimestamp = new Date(newData.updated_at);
    
    // If there's a significant time difference, there might be a conflict
    if (Math.abs(remoteTimestamp.getTime() - localTimestamp.getTime()) > 5000) { // 5 second threshold
      const conflict: ConflictResolution = {
        conflictId: `conflict_${entityType}_${entityId}_${Date.now()}`,
        entityType,
        entityId,
        localVersion: oldData,
        remoteVersion: newData,
        conflictFields: findConflictFields(oldData, newData),
        resolution: 'manual' // Require manual resolution for now
      };
      
      setConflicts(prev => [...prev, conflict]);
      
      // Show conflict notification
      showConflictNotification(conflict);
    }
  };

  const findConflictFields = (local: any, remote: any): string[] => {
    const conflicts: string[] = [];
    const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
    
    keys.forEach(key => {
      if (key !== 'updated_at' && local[key] !== remote[key]) {
        conflicts.push(key);
      }
    });
    
    return conflicts;
  };

  const resolveConflict = useCallback((
    conflictId: string, 
    resolution: ConflictResolution['resolution'], 
    mergedData?: any
  ) => {
    setConflicts(prev => prev.map(conflict => {
      if (conflict.conflictId === conflictId) {
        return {
          ...conflict,
          resolution,
          resolvedBy: currentUser?.id,
          resolvedAt: new Date()
        };
      }
      return conflict;
    }));

    console.log('✅ Conflict resolved:', conflictId, resolution);
  }, [currentUser]);

  const showActivityNotification = (activity: CollaborationActivity) => {
    if (activity.userId === currentUser?.id) return; // Don't show own activities
    
    // Create non-intrusive notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-100 border border-blue-300 p-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
        <div>
          <strong>${activity.userName}</strong> ${activity.action}d ${activity.entityName}
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  const showConflictNotification = (conflict: ConflictResolution) => {
    console.warn('⚠️ Data conflict detected:', conflict);
    
    // Show conflict resolution UI (would be implemented as a modal/dialog)
    alert(`Data conflict detected in ${conflict.entityType}. Please review and resolve.`);
  };

  const cleanup = () => {
    // Clear intervals
    if (presenceIntervalRef.current) {
      clearInterval(presenceIntervalRef.current);
    }
    
    // Unsubscribe from all channels
    channelsRef.current.forEach((channel) => {
      channel.unsubscribe();
    });
    channelsRef.current.clear();
    
    console.log('🧹 Collaboration system cleanup complete');
  };

  const value: CollaborationContextType = {
    connectedUsers,
    currentUser,
    isOnline,
    activities,
    conflicts,
    updateUserPresence,
    getUsersInFacility,
    trackActivity,
    resolveConflict,
    subscribeToEntity,
    broadcastChange
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
      {isOnline && <CollaborationUI />}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}

// UI Component for collaboration features
function CollaborationUI() {
  const { connectedUsers, currentUser, activities, conflicts, isOnline } = useCollaboration();
  const [showUsers, setShowUsers] = useState(false);
  const [showActivities, setShowActivities] = useState(false);

  if (!isOnline) return null;

  return (
    <>
      {/* Online Users Indicator */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowUsers(!showUsers)}
          className="bg-green-100 border border-green-300 p-2 rounded-lg shadow-lg flex items-center"
        >
          <div className="w-3 h-3 bg-green-600 rounded-full mr-2 animate-pulse"></div>
          <span className="text-sm font-medium">{connectedUsers.length} online</span>
        </button>
        
        {showUsers && (
          <div className="absolute top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-64">
            <h4 className="font-bold mb-2">👥 Online Users</h4>
            {connectedUsers.map(user => (
              <div key={user.id} className="flex items-center mb-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: user.color }}
                ></div>
                <div>
                  <strong>{user.name}</strong>
                  <span className="text-gray-600 ml-1">({user.role})</span>
                  {user.currentFacility && (
                    <div className="text-xs text-gray-500">Working on facility</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed Toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowActivities(!showActivities)}
          className="bg-blue-100 border border-blue-300 p-2 rounded-lg shadow-lg"
        >
          📝 Recent Activity ({activities.length})
        </button>
        
        {showActivities && (
          <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-80 max-h-96 overflow-y-auto">
            <h4 className="font-bold mb-2">📝 Recent Activity</h4>
            {activities.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity</p>
            ) : (
              activities.slice(0, 10).map(activity => (
                <div key={activity.id} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                  <div className="flex justify-between">
                    <strong>{activity.userName}</strong>
                    <span className="text-gray-500">
                      {activity.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div>
                    {activity.action}d {activity.entityType}: {activity.entityName}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Conflict Notifications */}
      {conflicts.filter(c => c.resolution === 'manual').map(conflict => (
        <div key={conflict.conflictId} className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 p-4 rounded-lg shadow-lg z-50">
          <h4 className="font-bold text-yellow-800">⚠️ Data Conflict</h4>
          <p className="text-sm">
            Conflicting changes detected in {conflict.entityType}. 
            Manual resolution required.
          </p>
          <div className="mt-2">
            <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm mr-2">
              Resolve
            </button>
            <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm">
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

export default CollaborationProvider;