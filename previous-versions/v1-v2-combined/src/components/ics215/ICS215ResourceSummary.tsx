/**
 * ICS 215 Resource Summary Component
 * 
 * Implements the summary calculations from the Excel formulas:
 * - Aggregates Req/Have/Need across all resource locations
 * - Matches the structure below the red line in the Excel sheet
 */

import React from 'react';
import { useICS215GridStore } from '../../stores/useICS215GridStore';
import { ICSResource } from '../../types/ics-215-grid-types';

interface AssetSummary {
  assetType: string;
  required: number;
  have: number;
  need: number;
}

interface ResourceData {
  location: string;
  address: string;
  county: string;
  assets: {
    [assetType: string]: {
      required: number;
      have: number;
      need: number;
    };
  };
  workAssignment?: {
    shift: string;
    leaderName: string;
    leaderPhone: string;
    reportingTime: string;
    reportingLocation: string;
    instructions: string;
  };
}

// Asset types matching the Excel columns
const ASSET_TYPES = [
  'MC/DES/SV',        // Mass Care/Distribution Emergency Supplies/Supervisor
  'MC/DES/SA',        // Mass Care/Distribution Emergency Supplies/Staff Assistant
  'Box Truck > 20\'',  
  'Cargo Vans',
  'Rental Cars',
  'MRV',              // Mobile Relief Vehicle
  'ERV',              // Emergency Response Vehicle
  '560 Push Packs',
  'DES Kits',         // Distribution Emergency Supplies Kits
  'CUK'               // Cleanup Kits
];

export function ICS215ResourceSummary() {
  const resources = useICS215GridStore(state => state.resources);
  
  // Parse resources to extract asset data
  const parseResourceAssets = (resource: ICSResource): ResourceData => {
    const data: ResourceData = {
      location: resource.name || '',
      address: resource.address || '',
      county: (resource as any).county || '',
      assets: {}
    };
    
    // Initialize all asset types with zeros
    ASSET_TYPES.forEach(type => {
      data.assets[type] = {
        required: 0,
        have: 0,
        need: 0
      };
    });
    
    // Extract asset quantities from resource data
    // This would typically come from structured fields
    // For now, we'll parse from notes or custom fields
    if ((resource as any).assetRequirements) {
      const requirements = (resource as any).assetRequirements;
      Object.keys(requirements).forEach(assetType => {
        if (data.assets[assetType]) {
          data.assets[assetType] = {
            required: requirements[assetType].required || 0,
            have: requirements[assetType].have || 0,
            need: (requirements[assetType].required || 0) - (requirements[assetType].have || 0)
          };
        }
      });
    }
    
    // Extract work assignment if present
    if ((resource as any).workAssignment) {
      data.workAssignment = (resource as any).workAssignment;
    }
    
    return data;
  };
  
  // Calculate totals for each asset type
  const calculateAssetTotals = (): AssetSummary[] => {
    const totals: { [key: string]: AssetSummary } = {};
    
    // Initialize totals
    ASSET_TYPES.forEach(type => {
      totals[type] = {
        assetType: type,
        required: 0,
        have: 0,
        need: 0
      };
    });
    
    // Sum across all resources
    Object.values(resources).flat().forEach(resource => {
      const data = parseResourceAssets(resource);
      Object.keys(data.assets).forEach(assetType => {
        if (totals[assetType]) {
          totals[assetType].required += data.assets[assetType].required;
          totals[assetType].have += data.assets[assetType].have;
        }
      });
    });
    
    // Calculate need (Req - Have)
    Object.values(totals).forEach(total => {
      total.need = total.required - total.have;
    });
    
    return Object.values(totals);
  };
  
  const assetTotals = calculateAssetTotals();
  const allResources = Object.values(resources).flat().map(parseResourceAssets);
  
  return (
    <div className="p-6 space-y-6">
      {/* Header Information */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          ICS 215 - Operational Planning Worksheet
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Geography:</span>
            <span className="ml-2 font-medium">Statewide</span>
          </div>
          <div>
            <span className="text-gray-600">Section:</span>
            <span className="ml-2 font-medium">Operations</span>
          </div>
          <div>
            <span className="text-gray-600">Activity:</span>
            <span className="ml-2 font-medium">Distribution of Emergency Supplies</span>
          </div>
          <div>
            <span className="text-gray-600">Date Prepared:</span>
            <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      {/* Resource Details Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-900">Resource Locations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">County</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Type</th>
                {ASSET_TYPES.map(type => (
                  <th key={type} className="px-2 py-2 text-center text-xs font-medium text-gray-500">
                    {type}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allResources.map((resource, idx) => (
                <React.Fragment key={idx}>
                  <tr className="hover:bg-gray-50">
                    <td rowSpan={3} className="px-3 py-2 text-sm text-gray-900 border-r">
                      {resource.county}
                    </td>
                    <td rowSpan={3} className="px-3 py-2 text-sm text-gray-900 border-r">
                      {resource.location}
                    </td>
                    <td rowSpan={3} className="px-3 py-2 text-sm text-gray-600 border-r">
                      {resource.address}
                    </td>
                    <td className="px-2 py-1 text-xs font-medium text-gray-600">Req</td>
                    {ASSET_TYPES.map(type => (
                      <td key={type} className="px-2 py-1 text-center text-sm">
                        {resource.assets[type].required || '-'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-2 py-1 text-xs font-medium text-gray-600">Have</td>
                    {ASSET_TYPES.map(type => (
                      <td key={type} className="px-2 py-1 text-center text-sm">
                        {resource.assets[type].have || '-'}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50 border-b-2">
                    <td className="px-2 py-1 text-xs font-medium text-gray-600">Need</td>
                    {ASSET_TYPES.map(type => (
                      <td key={type} className={`px-2 py-1 text-center text-sm font-medium ${
                        resource.assets[type].need > 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {resource.assets[type].need || '-'}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary Totals (Below the Red Line) */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border-t-4 border-red-500">
        <div className="px-4 py-3 bg-red-50 border-b">
          <h3 className="font-semibold text-gray-900">Asset Summary Totals</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assets</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Req</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Have</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Need</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assetTotals.map((total, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {total.assetType}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900">
                    {total.required}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900">
                    {total.have}
                  </td>
                  <td className={`px-4 py-3 text-center text-sm font-bold ${
                    total.need > 0 ? 'text-red-600' : 
                    total.need < 0 ? 'text-green-600' : 
                    'text-gray-900'
                  }`}>
                    {total.need}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">TOTALS</td>
                <td className="px-4 py-3 text-center text-sm text-gray-900">
                  {assetTotals.reduce((sum, t) => sum + t.required, 0)}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-900">
                  {assetTotals.reduce((sum, t) => sum + t.have, 0)}
                </td>
                <td className={`px-4 py-3 text-center text-sm ${
                  assetTotals.reduce((sum, t) => sum + t.need, 0) > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {assetTotals.reduce((sum, t) => sum + t.need, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Formula Explanation */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <h4 className="font-semibold text-blue-900 mb-2">Formula Calculations:</h4>
        <ul className="space-y-1 text-blue-700">
          <li>• <strong>Req (Required):</strong> Sum of all required assets across all locations</li>
          <li>• <strong>Have:</strong> Sum of all available assets across all locations</li>
          <li>• <strong>Need:</strong> Req - Have (positive = shortage, negative = surplus)</li>
          <li>• Red values indicate shortages that need immediate attention</li>
          <li>• Green values indicate surplus resources available for reallocation</li>
        </ul>
      </div>
    </div>
  );
}