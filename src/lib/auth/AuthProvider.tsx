'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { supabase, mockSupabaseClient } from '../supabase';

// Use appropriate client based on configuration
const authClient = supabase || mockSupabaseClient;

/**
 * Authentication Provider - Phase 3 Implementation
 * 
 * Integrates Supabase Auth with our real-time collaboration system.
 * Provides role-based access control for disaster operations.
 */

export interface AuthUser extends User {
  // Extended user profile from our database
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  operation_roles: OperationRole[];
  created_at: string;
  updated_at: string;
  last_active: string;
  avatar_url?: string;
  phone?: string;
  red_cross_id?: string;
  chapter_id?: string;
  region_id?: string;
}

export type UserRole = 
  | 'system_admin'      // Full system access
  | 'operation_manager' // Create/manage operations
  | 'iap_coordinator'   // IAP editing and publishing
  | 'field_supervisor'  // Facility management
  | 'volunteer'         // Basic access
  | 'viewer';           // Read-only access

export interface OperationRole {
  operation_id: string;
  role: 'incident_commander' | 'deputy_ic' | 'safety_officer' | 'information_officer' | 
        'liaison_officer' | 'section_chief' | 'unit_leader' | 'task_force_leader' | 
        'strike_team_leader' | 'volunteer';
  assigned_at: string;
  assigned_by: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  
  // Profile management
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
  
  // Role-based access control
  hasRole: (role: UserRole) => boolean;
  hasOperationRole: (operationId: string, role?: string) => boolean;
  canAccess: (resource: string, action: string, context?: any) => boolean;
  
  // Real-time presence
  updatePresence: (status: 'online' | 'away' | 'busy') => Promise<void>;
  getOnlineUsers: () => Promise<AuthUser[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    authClient.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error);
        console.error('Auth session error:', error);
      } else {
        setSession(session);
        if (session?.user) {
          setUser(session.user as AuthUser);
          loadUserProfile(session.user.id);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        
        setSession(session);
        setError(null);
        
        if (session?.user) {
          setUser(session.user as AuthUser);
          await loadUserProfile(session.user.id);
          
          // Update presence when user signs in
          if (event === 'SIGNED_IN') {
            updatePresence('online');
          }
        } else {
          setUser(null);
          setProfile(null);
          
          // Clear presence when user signs out
          if (event === 'SIGNED_OUT') {
            clearPresence();
          }
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await authClient
        .from('user_profiles')
        .select(`
          *,
          operation_roles (
            operation_id,
            role,
            assigned_at,
            assigned_by
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      setProfile(data);
      
      // Update user object with profile
      setUser(prev => prev ? { ...prev, profile: data } : null);
      
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    const { error } = await authClient.auth.signInWithPassword({
      email,
      password
    });
    
    setLoading(false);
    
    if (error) {
      setError(error);
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await authClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: profileData.full_name,
          role: profileData.role || 'volunteer'
        }
      }
    });
    
    if (!error && data.user) {
      // Create user profile in database
      const { error: profileError } = await authClient
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: profileData.full_name || '',
          role: profileData.role || 'volunteer',
          phone: profileData.phone,
          red_cross_id: profileData.red_cross_id,
          chapter_id: profileData.chapter_id,
          region_id: profileData.region_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }
    
    setLoading(false);
    
    if (error) {
      setError(error);
    }
    
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    
    // Clear presence before signing out
    await clearPresence();
    
    const { error } = await authClient.auth.signOut();
    
    setLoading(false);
    
    if (error) {
      setError(error);
    } else {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
    
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await authClient.auth.resetPasswordForEmail(email);
    return { error };
  };

  // Profile management
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') as AuthError };
    
    const { error } = await authClient
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (!error) {
      // Refresh profile data
      await loadUserProfile(user.id);
    }
    
    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  // Role-based access control
  const hasRole = useCallback((role: UserRole): boolean => {
    if (!profile) return false;
    
    // System admin has all roles
    if (profile.role === 'system_admin') return true;
    
    return profile.role === role;
  }, [profile]);

  const hasOperationRole = useCallback((operationId: string, role?: string): boolean => {
    if (!profile) return false;
    
    // System admin and operation manager have access to all operations
    if (profile.role === 'system_admin' || profile.role === 'operation_manager') {
      return true;
    }
    
    if (!role) {
      // Check if user has any role in the operation
      return profile.operation_roles.some(opRole => opRole.operation_id === operationId);
    }
    
    // Check specific role in operation
    return profile.operation_roles.some(opRole => 
      opRole.operation_id === operationId && opRole.role === role
    );
  }, [profile]);

  const canAccess = useCallback((resource: string, action: string, context?: any): boolean => {
    if (!profile) return false;
    
    // System admin can do everything
    if (profile.role === 'system_admin') return true;
    
    // Define access control rules
    const accessRules: Record<string, Record<string, UserRole[]>> = {
      'operations': {
        'create': ['system_admin', 'operation_manager'],
        'read': ['system_admin', 'operation_manager', 'iap_coordinator', 'field_supervisor', 'volunteer', 'viewer'],
        'update': ['system_admin', 'operation_manager', 'iap_coordinator'],
        'delete': ['system_admin', 'operation_manager']
      },
      'facilities': {
        'create': ['system_admin', 'operation_manager', 'field_supervisor'],
        'read': ['system_admin', 'operation_manager', 'iap_coordinator', 'field_supervisor', 'volunteer', 'viewer'],
        'update': ['system_admin', 'operation_manager', 'field_supervisor'],
        'delete': ['system_admin', 'operation_manager', 'field_supervisor']
      },
      'iap': {
        'create': ['system_admin', 'operation_manager', 'iap_coordinator'],
        'read': ['system_admin', 'operation_manager', 'iap_coordinator', 'field_supervisor', 'volunteer', 'viewer'],
        'update': ['system_admin', 'operation_manager', 'iap_coordinator'],
        'publish': ['system_admin', 'operation_manager', 'iap_coordinator'],
        'delete': ['system_admin', 'operation_manager']
      },
      'personnel': {
        'create': ['system_admin', 'operation_manager', 'field_supervisor'],
        'read': ['system_admin', 'operation_manager', 'iap_coordinator', 'field_supervisor', 'volunteer'],
        'update': ['system_admin', 'operation_manager', 'field_supervisor'],
        'delete': ['system_admin', 'operation_manager']
      }
    };
    
    const allowedRoles = accessRules[resource]?.[action];
    if (!allowedRoles) return false;
    
    return allowedRoles.includes(profile.role);
  }, [profile]);

  // Real-time presence management
  const updatePresence = async (status: 'online' | 'away' | 'busy') => {
    if (!user) return;
    
    try {
      // Update presence in database
      await authClient
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      // Also update last_active in profile
      await authClient
        .from('user_profiles')
        .update({
          last_active: new Date().toISOString()
        })
        .eq('id', user.id);
        
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const clearPresence = async () => {
    if (!user) return;
    
    try {
      await authClient
        .from('user_presence')
        .update({
          status: 'offline',
          last_seen: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error clearing presence:', error);
    }
  };

  const getOnlineUsers = async (): Promise<AuthUser[]> => {
    try {
      const { data, error } = await authClient
        .from('user_presence')
        .select(`
          *,
          user_profiles (
            id,
            email,
            full_name,
            role,
            avatar_url
          )
        `)
        .eq('status', 'online')
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Active in last 5 minutes
      
      if (error) {
        console.error('Error fetching online users:', error);
        return [];
      }
      
      return data.map(presence => ({
        id: presence.user_profiles.id,
        email: presence.user_profiles.email,
        profile: presence.user_profiles
      })) as AuthUser[];
      
    } catch (error) {
      console.error('Error fetching online users:', error);
      return [];
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (user) {
        clearPresence();
      }
    };
  }, [user]);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    hasRole,
    hasOperationRole,
    canAccess,
    updatePresence,
    getOnlineUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredOperationRole?: string;
  operationId?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredOperationRole,
  operationId,
  fallback = <div className="p-4 text-center text-gray-600">Access denied</div>
}: ProtectedRouteProps) {
  const { user, profile, loading, hasRole, hasOperationRole } = useAuth();
  
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Please sign in to access this area.</p>
      </div>
    );
  }
  
  // Check required role
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback;
  }
  
  // Check required operation role
  if (requiredOperationRole && operationId && !hasOperationRole(operationId, requiredOperationRole)) {
    return fallback;
  }
  
  return <>{children}</>;
}

// Hook for role-based UI rendering
export function useRoleAccess() {
  const { profile, hasRole, hasOperationRole, canAccess } = useAuth();
  
  return {
    profile,
    hasRole,
    hasOperationRole, 
    canAccess,
    
    // Convenience methods for common checks
    isAdmin: hasRole('system_admin'),
    isOperationManager: hasRole('operation_manager'),
    isIAPCoordinator: hasRole('iap_coordinator'),
    isFieldSupervisor: hasRole('field_supervisor'),
    canCreateOperations: hasRole('system_admin') || hasRole('operation_manager'),
    canEditIAP: hasRole('system_admin') || hasRole('operation_manager') || hasRole('iap_coordinator'),
    canManageFacilities: hasRole('system_admin') || hasRole('operation_manager') || hasRole('field_supervisor')
  };
}