/**
 * Disaster Operations Platform - Core Data Model
 * 
 * This is the single source of truth for all disaster operation data.
 * Built to last 20 years and serve all 50 states + territories.
 */

import * as Types from './types';

// Re-export all types for convenience
export * from './types';

// Main operation interface using imported types
export interface DisasterOperation {
  // Identity
  id: string;                    // DR-2024-FL-001
  operationName: string;         // "Hurricane Milton Response"
  
  // Metadata
  metadata: {
    created: Date;
    modified: Date;
    version: number;
    status: 'planning' | 'active' | 'closing' | 'closed';
    visibility: 'draft' | 'published';
  };
  
  // Geographic scope
  geography: {
    regions: Types.Region[];
    counties: Types.County[];
    chapters: Types.Chapter[];
    affectedArea?: GeoJSON.FeatureCollection;
  };
  
  // Command structure
  command: {
    droDirector: Types.Contact;
    deputyDirector: Types.Contact;
    chiefOfStaff?: Types.Contact;
    sectionChiefs: {
      operations: Types.Contact;
      planning: Types.Contact;
      logistics: Types.Contact;
      finance: Types.Contact;
      workforce?: Types.Contact;
    };
  };
  
  // Service delivery data (the actual Form 5266 lines)
  serviceLines: {
    feeding: Types.FeedingData;
    sheltering: Types.ShelteringData;
    health?: Types.HealthData;
    distribution?: Types.DistributionData;
    recovery?: Types.RecoveryData;
    logistics?: Types.LogisticsData;
  };
  
  // IAP - The living document
  iap: Types.IAPDocument;
  
  // Audit & compliance
  audit: Types.AuditEntry[];
  
  // Real-time collaboration
  collaboration: {
    activeUsers: string[];
    locks?: Types.ResourceLock[];
    pendingChanges: Types.Change[];
  };
  
  // Attachments
  attachments?: Types.Attachment[];
}