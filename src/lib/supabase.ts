// Supabase client configuration for disaster-ops-v3
// This replaces the complex IndexedDB/Dexie architecture with simple, reliable cloud database

import { createClient } from '@supabase/supabase-js';

// Environment variables (to be configured in Supabase dashboard)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key';

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' && 
                            supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE' &&
                            supabaseUrl !== 'http://localhost:54321' &&
                            supabaseAnonKey !== 'demo-key';

// Create Supabase client with fallback
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10 // Rate limiting for real-time updates
    }
  }
}) : null; // Fallback to null when not configured

// Mock Supabase client for development without database
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: () => Promise.resolve({ error: new Error('Demo mode - Supabase not configured') }),
    signUp: () => Promise.resolve({ error: new Error('Demo mode - Supabase not configured') }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
    single: () => ({ data: null, error: null })
  }),
  channel: () => ({
    on: () => ({}),
    subscribe: () => ({})
  })
};

// Export the appropriate client
export const supabaseClient = supabase || mockSupabaseClient;

// TypeScript types for database tables
export interface Operation {
  id: string;
  name: string;
  disaster_type: string;
  activation_level: string;
  status: string;
  creator_name?: string;
  creator_email?: string;
  creator_phone?: string;
  regions?: string[];
  counties?: string[];
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  operation_id: string;
  name: string;
  type: string;
  discipline: string;
  address?: string;
  county?: string;
  coordinates?: { x: number; y: number }; // PostGIS point
  status: string;
  capacity?: any; // JSON object
  contact_info?: any; // JSON object
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PersonnelAssignment {
  id: string;
  operation_id: string;
  facility_id: string;
  person_name: string;
  person_email?: string;
  person_phone?: string;
  role: string;
  ics_position?: string;
  section?: string;
  shift?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface IAPDocument {
  id: string;
  operation_id: string;
  version: number;
  title: string;
  operational_period_start?: string;
  operational_period_end?: string;
  content: any; // JSON object
  status: string;
  is_official_snapshot: boolean;
  snapshot_time?: string;
  published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkAssignment {
  id: string;
  operation_id: string;
  facility_id: string;
  title: string;
  description?: string;
  priority: string;
  assigned_to?: string;
  discipline?: string;
  due_date?: string;
  status: string;
  estimated_duration?: string;
  actual_duration?: string;
  resources_needed?: any; // JSON object
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  operation_id: string;
  role: 'ip_group' | 'discipline' | 'field' | 'viewer';
  permissions?: any; // JSON array
  discipline?: string;
  facilities?: string[]; // Array of facility IDs
  created_at: string;
  updated_at: string;
}

// Database helper functions (replaces MasterDataService complexity)

// Operations
export async function getOperations() {
  const { data, error } = await supabase
    .from('operations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getOperation(id: string) {
  const { data, error } = await supabase
    .from('operations')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createOperation(operation: Partial<Operation>) {
  const { data, error } = await supabase
    .from('operations')
    .insert(operation)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Facilities
export async function getFacilities(operationId: string) {
  const { data, error } = await supabase
    .from('facilities')
    .select(`
      *,
      personnel_assignments(*)
    `)
    .eq('operation_id', operationId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createFacility(facility: Partial<Facility>) {
  const { data, error } = await supabase
    .from('facilities')
    .insert({
      ...facility,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateFacility(id: string, updates: Partial<Facility>) {
  const { data, error } = await supabase
    .from('facilities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Personnel Assignments
export async function getPersonnelAssignments(facilityId: string) {
  const { data, error } = await supabase
    .from('personnel_assignments')
    .select('*')
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createPersonnelAssignment(assignment: Partial<PersonnelAssignment>) {
  const { data, error } = await supabase
    .from('personnel_assignments')
    .insert({
      ...assignment,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// IAP Documents
export async function getIAPDocuments(operationId: string) {
  const { data, error } = await supabase
    .from('iap_documents')
    .select('*')
    .eq('operation_id', operationId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createIAPDocument(iap: Partial<IAPDocument>) {
  const { data, error } = await supabase
    .from('iap_documents')
    .insert({
      ...iap,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Work Assignments
export async function getWorkAssignments(facilityId: string) {
  const { data, error } = await supabase
    .from('work_assignments')
    .select('*')
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createWorkAssignment(assignment: Partial<WorkAssignment>) {
  const { data, error } = await supabase
    .from('work_assignments')
    .insert({
      ...assignment,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Real-time subscriptions (replaces complex EventBus architecture)
export function subscribeToFacilities(operationId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`facilities-${operationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'facilities',
        filter: `operation_id=eq.${operationId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToPersonnelAssignments(facilityId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`personnel-${facilityId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'personnel_assignments',
        filter: `facility_id=eq.${facilityId}`,
      },
      callback
    )
    .subscribe();
}

// User authentication helpers
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole(operationId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .eq('operation_id', operationId)
    .single();
  
  if (error) return null;
  return data;
}

// Role-based permission checking
export async function hasPermission(operationId: string, requiredRole: string): Promise<boolean> {
  const userRole = await getUserRole(operationId);
  if (!userRole) return false;

  const roleHierarchy = {
    'viewer': 1,
    'field': 2,
    'discipline': 3,
    'ip_group': 4
  };

  return roleHierarchy[userRole.role as keyof typeof roleHierarchy] >= 
         roleHierarchy[requiredRole as keyof typeof roleHierarchy];
}

// Data migration helper (for moving from IndexedDB to Supabase)
export async function migrateFromIndexedDB() {
  // This will be implemented in Phase 1 Week 4
  // Will read from existing IndexedDB and bulk insert to Supabase
  console.log('Data migration from IndexedDB to Supabase - to be implemented');
}

// Error handling wrapper
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  
  if (error.code === 'PGRST116') {
    return 'No data found';
  } else if (error.code === '23505') {
    return 'This record already exists';
  } else if (error.code === '42501') {
    return 'You do not have permission to perform this action';
  } else {
    return error.message || 'An unexpected error occurred';
  }
}

// Performance monitoring
export function logPerformanceMetric(operation: string, duration: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Supabase ${operation}: ${duration}ms`);
    
    // Alert if queries are slower than targets
    if (duration > 100) {
      console.warn(`⚠️ Slow query detected: ${operation} took ${duration}ms (target: <100ms)`);
    }
  }
}

export default supabase;