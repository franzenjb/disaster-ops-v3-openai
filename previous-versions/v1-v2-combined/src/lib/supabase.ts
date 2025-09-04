/**
 * Supabase Client Configuration
 * Handles all database operations and real-time synchronization
 */

import { createClient } from '@supabase/supabase-js';
import { DisasterOperation } from '../core/DisasterOperation';

// Get environment variables - these will be set in .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create Supabase client only if properly configured
const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
}) : null;

// Database types
export interface OperationRecord {
  id: string;
  operation_id: string;
  operation_name: string;
  type: string;
  state: string;
  start_date: string;
  end_date?: string;
  data: DisasterOperation;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ServiceLineUpdate {
  id?: string;
  operation_id: string;
  service_line: string;
  line_number: number;
  value: number;
  timestamp: string;
  user_id?: string;
  user_name?: string;
}

export interface IAPRecord {
  id?: string;
  operation_id: string;
  iap_number: string;
  operational_period_start: string;
  operational_period_end: string;
  data: any;
  cover_photo?: string;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// Database service class
export class DatabaseService {
  // Operations
  static async createOperation(operation: DisasterOperation): Promise<OperationRecord | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('operations')
        .insert({
          operation_id: operation.id,
          operation_name: operation.operationName,
          type: operation.type,
          state: operation.state,
          start_date: operation.startDate,
          end_date: operation.endDate,
          data: operation,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating operation:', error);
      return null;
    }
  }

  static async getOperation(operationId: string): Promise<OperationRecord | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .eq('operation_id', operationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching operation:', error);
      return null;
    }
  }

  static async updateOperation(operationId: string, updates: Partial<DisasterOperation>): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { error } = await supabase
        .from('operations')
        .update({
          data: updates,
          updated_at: new Date().toISOString(),
        })
        .eq('operation_id', operationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating operation:', error);
      return false;
    }
  }

  static async listOperations(): Promise<OperationRecord[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('operations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing operations:', error);
      return [];
    }
  }

  // Service Line Updates
  static async recordServiceLineUpdate(update: ServiceLineUpdate): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { error } = await supabase
        .from('service_line_updates')
        .insert(update);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error recording service line update:', error);
      return false;
    }
  }

  static async getServiceLineHistory(
    operationId: string,
    serviceLine?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ServiceLineUpdate[]> {
    if (!supabase) return [];
    
    try {
      let query = supabase
        .from('service_line_updates')
        .select('*')
        .eq('operation_id', operationId);

      if (serviceLine) {
        query = query.eq('service_line', serviceLine);
      }

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }

      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching service line history:', error);
      return [];
    }
  }

  // IAP Management
  static async saveIAP(iap: IAPRecord): Promise<IAPRecord | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('iaps')
        .upsert({
          ...iap,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving IAP:', error);
      return null;
    }
  }

  static async getIAP(operationId: string, iapNumber: string): Promise<IAPRecord | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .from('iaps')
        .select('*')
        .eq('operation_id', operationId)
        .eq('iap_number', iapNumber)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching IAP:', error);
      return null;
    }
  }

  static async listIAPs(operationId: string): Promise<IAPRecord[]> {
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from('iaps')
        .select('*')
        .eq('operation_id', operationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing IAPs:', error);
      return [];
    }
  }

  // Real-time subscriptions
  static subscribeToOperationUpdates(
    operationId: string,
    callback: (payload: any) => void
  ) {
    if (!supabase) return null;
    
    return supabase
      .channel(`operation-${operationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operations',
          filter: `operation_id=eq.${operationId}`,
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_line_updates',
          filter: `operation_id=eq.${operationId}`,
        },
        callback
      )
      .subscribe();
  }

  static unsubscribeFromOperationUpdates(operationId: string) {
    if (!supabase) return;
    return supabase.removeChannel(`operation-${operationId}`);
  }

  // Bulk operations
  static async exportOperationData(operationId: string): Promise<any> {
    try {
      const [operation, serviceLineUpdates, iaps] = await Promise.all([
        this.getOperation(operationId),
        this.getServiceLineHistory(operationId),
        this.listIAPs(operationId),
      ]);

      return {
        operation,
        serviceLineUpdates,
        iaps,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting operation data:', error);
      return null;
    }
  }

  // Initialize database tables (run once)
  static async initializeTables(): Promise<void> {
    // This would typically be done through Supabase migrations
    // but including here for reference
    console.log('Database tables should be created through Supabase dashboard or migrations');
  }
}