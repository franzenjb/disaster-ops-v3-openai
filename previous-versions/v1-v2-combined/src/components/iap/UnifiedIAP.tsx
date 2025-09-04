import React from 'react';
import { IAPDocumentComplete } from './IAPDocumentComplete';

/**
 * Main IAP Component
 * Entry point for the Incident Action Plan functionality
 */
export function UnifiedIAP({ operationId }: { operationId: string }) {
  // Using the complete IAP Document that matches the Red Cross template
  return <IAPDocumentComplete />;
}