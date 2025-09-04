/**
 * ICS 215 Worksheet View Component
 * 
 * Displays the complete worksheet matching the Excel structure:
 * - Top summary rows (calculated totals)
 * - Detail rows for each resource location
 * - Bottom summary (same as top, for visibility)
 * 
 * The top rows (8-10) are TOTALS calculated from the detail rows,
 * not available resources to distribute.
 */

import React, { useMemo } from 'react';
import { useICS215GridStore } from '../../stores/useICS215GridStore';
import { ICSResource } from '../../types/ics-215-grid-types';

// Asset types matching Excel columns D-M
const ASSET_COLUMNS = [
  { key: 'MC/DES/SV', label: 'MC/DES/SV', width: 'w-20' },
  { key: 'MC/DES/SA', label: 'MC/DES/SA', width: 'w-20' },
  { key: 'Box Truck > 20\'', label: 'Box Truck > 20\'', width: 'w-24' },
  { key: 'Cargo Vans', label: 'Cargo Vans', width: 'w-20' },
  { key: 'Rental Cars', label: 'Rental Cars', width: 'w-20' },
  { key: 'MRV', label: 'MRV', width: 'w-16' },
  { key: 'ERV', label: 'ERV', width: 'w-16' },
  { key: '560 Push Packs', label: '560 Push Packs', width: 'w-24' },
  { key: 'DES Kits', label: 'DES Kits', width: 'w-20' },
  { key: 'CUK', label: 'CUK', width: 'w-16' }
];

interface ResourceRow {
  county: string;
  resourceName: string;
  address: string;
  assets: {
    [key: string]: {
      req: number;
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

export function ICS215WorksheetView() {
  const resources = useICS215GridStore(state => state.resources);
  
  // Parse resources into structured rows
  const resourceRows = useMemo(() => {
    const rows: ResourceRow[] = [];
    
    // Process all resources from all service lines
    Object.values(resources).flat().forEach(resource => {
      const row: ResourceRow = {
        county: (resource as any).county || '',
        resourceName: resource.name || '',
        address: resource.address || '',
        assets: {}
      };
      
      // Initialize all asset columns
      ASSET_COLUMNS.forEach(col => {
        row.assets[col.key] = { req: 0, have: 0, need: 0 };
      });
      
      // Extract asset data from resource
      // This would typically come from structured fields in the resource
      if ((resource as any).assetRequirements) {
        Object.entries((resource as any).assetRequirements).forEach(([assetType, data]: [string, any]) => {
          if (row.assets[assetType]) {
            row.assets[assetType] = {
              req: data.required || 0,
              have: data.have || 0,
              need: (data.required || 0) - (data.have || 0)
            };
          }
        });
      }
      
      // Add work assignment if present
      if ((resource as any).workAssignment) {
        row.workAssignment = (resource as any).workAssignment;
      }
      
      rows.push(row);
    });
    
    // Add sample data for demonstration (matching the Excel example)
    if (rows.length === 0) {
      rows.push({
        county: 'Lee',
        resourceName: 'DES Staging Warehouse (Lee)',
        address: '2736 Edison Ave, Fort Myers, FL',
        assets: {
          'MC/DES/SV': { req: 2, have: 2, need: 0 },
          'MC/DES/SA': { req: 4, have: 4, need: 0 },
          'Box Truck > 20\'': { req: 1, have: 1, need: 0 },
          'Cargo Vans': { req: 1, have: 1, need: 0 },
          'Rental Cars': { req: 0, have: 0, need: 0 },
          'MRV': { req: 0, have: 0, need: 0 },
          'ERV': { req: 0, have: 0, need: 0 },
          '560 Push Packs': { req: 0, have: 0, need: 0 },
          'DES Kits': { req: 0, have: 0, need: 0 },
          'CUK': { req: 528, have: 48, need: 480 }
        },
        workAssignment: {
          shift: 'Day',
          leaderName: 'Randy Carver',
          leaderPhone: '(336-423-2957)',
          reportingTime: '7:30',
          reportingLocation: '2736 Edison Ave, Fort Myers, FL',
          instructions: 'WAREHOUSE: Receive materials, load trucks.'
        }
      });
      
      rows.push({
        county: 'Lee',
        resourceName: 'Hotshots (Lee)',
        address: '2736 Edison Ave, Fort Myers, FL 33931',
        assets: {
          'MC/DES/SV': { req: 0, have: 0, need: 0 },
          'MC/DES/SA': { req: 2, have: 2, need: 0 },
          'Box Truck > 20\'': { req: 0, have: 0, need: 0 },
          'Cargo Vans': { req: 1, have: 1, need: 0 },
          'Rental Cars': { req: 0, have: 0, need: 0 },
          'MRV': { req: 0, have: 0, need: 0 },
          'ERV': { req: 0, have: 0, need: 0 },
          '560 Push Packs': { req: 0, have: 0, need: 0 },
          'DES Kits': { req: 0, have: 0, need: 0 },
          'CUK': { req: 0, have: 0, need: 0 }
        },
        workAssignment: {
          shift: '',
          leaderName: 'clark buck',
          leaderPhone: '513-312-9080',
          reportingTime: '10:00',
          reportingLocation: '2736 Edison Ave, Fort Myers, FL 33931',
          instructions: 'HOTSHOT: On standby to pick up supplies at the warehouse and distribute as needed.'
        }
      });
      
      rows.push({
        county: 'Volusia',
        resourceName: 'Hotshot (Volusia)',
        address: '1720 Richard Petty Blvd, Daytona Beach, FL 32114',
        assets: {
          'MC/DES/SV': { req: 0, have: 0, need: 0 },
          'MC/DES/SA': { req: 0, have: 0, need: 0 },
          'Box Truck > 20\'': { req: 0, have: 0, need: 0 },
          'Cargo Vans': { req: 1, have: 1, need: 0 },
          'Rental Cars': { req: 0, have: 0, need: 0 },
          'MRV': { req: 0, have: 0, need: 0 },
          'ERV': { req: 0, have: 0, need: 0 },
          '560 Push Packs': { req: 0, have: 0, need: 0 },
          'DES Kits': { req: 0, have: 0, need: 0 },
          'CUK': { req: 0, have: 0, need: 0 }
        },
        workAssignment: {
          shift: 'Day',
          leaderName: 'Donna Burdett',
          leaderPhone: '(850-491-1958)',
          reportingTime: '10:00',
          reportingLocation: '1720 Richard Petty Blvd, Daytona Beach, FL 32114',
          instructions: 'HOTSHOT: On standby to pick up supplies at the warehouse and distribute as needed.'
        }
      });
    }
    
    return rows;
  }, [resources]);
  
  // Calculate totals from detail rows
  const totals = useMemo(() => {
    const sums: { [key: string]: { req: number; have: number; need: number } } = {};
    
    // Initialize totals
    ASSET_COLUMNS.forEach(col => {
      sums[col.key] = { req: 0, have: 0, need: 0 };
    });
    
    // Sum up all rows
    resourceRows.forEach(row => {
      Object.keys(row.assets).forEach(assetType => {
        if (sums[assetType]) {
          sums[assetType].req += row.assets[assetType].req;
          sums[assetType].have += row.assets[assetType].have;
          sums[assetType].need += row.assets[assetType].need;
        }
      });
    });
    
    return sums;
  }, [resourceRows]);
  
  return (
    <div className="p-4 space-y-4 bg-gray-50">
      {/* Header Information */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold text-center text-gray-900 mb-4">
          ARC ICS 215 – Operational Planning Worksheet
        </h2>
        <div className="grid grid-cols-4 gap-4 text-sm">
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
      
      {/* Main Worksheet Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            {/* Header Row */}
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th rowSpan={2} className="px-2 py-1 text-left font-medium text-gray-700 border-r">County</th>
                <th rowSpan={2} className="px-2 py-1 text-left font-medium text-gray-700 border-r">Resource Identifier</th>
                <th rowSpan={2} className="px-2 py-1 text-left font-medium text-gray-700 border-r">Address</th>
                <th colSpan={ASSET_COLUMNS.length} className="px-2 py-1 text-center font-medium text-gray-700 border-b">
                  Assets
                </th>
                <th rowSpan={2} className="px-2 py-1 text-left font-medium text-gray-700 border-l">Work Shift</th>
                <th rowSpan={2} className="px-2 py-1 text-left font-medium text-gray-700">Leader Name (Phone)</th>
                <th rowSpan={2} className="px-2 py-1 text-left font-medium text-gray-700">Time</th>
                <th rowSpan={2} className="px-2 py-1 text-left font-medium text-gray-700">Location</th>
                <th rowSpan={2} className="px-2 py-1 text-left font-medium text-gray-700">Instructions</th>
              </tr>
              <tr>
                {ASSET_COLUMNS.map((col, idx) => (
                  <th key={col.key} className={`px-1 py-1 text-center font-medium text-gray-700 ${
                    idx < ASSET_COLUMNS.length - 1 ? 'border-r' : ''
                  }`}>
                    <div className="text-xs">{col.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200">
              {/* TOP SUMMARY ROWS (Lines 8-10) - Calculated Totals */}
              <tr className="bg-yellow-200 font-bold">
                <td colSpan={3} className="px-2 py-1 text-right border-r border-b border-gray-400 bg-yellow-300">
                  TOTALS →
                </td>
                <td className="px-1 py-1 text-center text-gray-700 border-r border-b border-gray-400 text-xs bg-yellow-100">Req</td>
                {ASSET_COLUMNS.slice(0, -1).map(col => (
                  <td key={col.key} className={`px-1 py-1 text-center border-r border-b border-gray-400 ${
                    totals[col.key].req > 0 ? 'font-bold' : ''
                  }`}>
                    {totals[col.key].req || '-'}
                  </td>
                ))}
                <td className={`px-1 py-1 text-center border-b border-gray-400 ${
                  totals[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].req > 0 ? 'font-bold' : ''
                }`}>
                  {totals[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].req || '-'}
                </td>
                <td colSpan={5} className="border-b border-l border-gray-400 bg-gray-50"></td>
              </tr>
              <tr className="bg-yellow-200 font-bold">
                <td colSpan={3} className="px-2 py-1 border-r border-b border-gray-400 bg-yellow-300"></td>
                <td className="px-1 py-1 text-center text-gray-700 border-r border-b border-gray-400 text-xs bg-green-100">Have</td>
                {ASSET_COLUMNS.slice(0, -1).map(col => (
                  <td key={col.key} className={`px-1 py-1 text-center border-r border-b border-gray-400 ${
                    totals[col.key].have > 0 ? 'text-green-700 font-bold' : ''
                  }`}>
                    {totals[col.key].have || '-'}
                  </td>
                ))}
                <td className={`px-1 py-1 text-center border-b border-gray-400 ${
                  totals[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].have > 0 ? 'text-green-700 font-bold' : ''
                }`}>
                  {totals[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].have || '-'}
                </td>
                <td colSpan={5} className="border-b border-l border-gray-400 bg-gray-50"></td>
              </tr>
              <tr className="bg-yellow-200 font-bold border-b-4 border-gray-600">
                <td colSpan={3} className="px-2 py-1 border-r border-b border-gray-400 bg-yellow-300"></td>
                <td className="px-1 py-1 text-center text-gray-700 border-r border-b border-gray-400 text-xs bg-red-100">Need</td>
                {ASSET_COLUMNS.slice(0, -1).map(col => (
                  <td key={col.key} className={`px-1 py-1 text-center border-r border-b border-gray-400 ${
                    totals[col.key].need > 0 ? 'bg-red-100 text-red-700 font-bold' : 
                    totals[col.key].need < 0 ? 'bg-green-100 text-green-700 font-bold' :
                    ''
                  }`}>
                    {totals[col.key].need || '-'}
                  </td>
                ))}
                <td className={`px-1 py-1 text-center border-b border-gray-400 ${
                  totals[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].need > 0 ? 'bg-red-100 text-red-700 font-bold' :
                  totals[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].need < 0 ? 'bg-green-100 text-green-700 font-bold' :
                  ''
                }`}>
                  {totals[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].need || '-'}
                </td>
                <td colSpan={5} className="border-b border-l border-gray-400 bg-gray-50"></td>
              </tr>
              
              {/* Detail Rows for Each Resource */}
              {resourceRows.map((row, rowIdx) => {
                const rowBackground = rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                return (
                  <React.Fragment key={rowIdx}>
                    <tr className={`${rowBackground} hover:bg-blue-50 transition-colors`}>
                      <td rowSpan={3} className={`px-2 py-1 text-gray-900 border-r border-gray-300 text-xs font-medium ${rowBackground}`}>
                        {row.county}
                      </td>
                      <td rowSpan={3} className={`px-2 py-1 text-gray-900 border-r border-gray-300 text-xs ${rowBackground}`}>
                        {row.resourceName}
                      </td>
                      <td rowSpan={3} className={`px-2 py-1 text-gray-600 border-r border-gray-300 text-xs ${rowBackground}`}>
                        {row.address}
                      </td>
                      <td className="px-1 py-1 text-center text-gray-700 bg-blue-50 border-r border-gray-300 text-xs font-medium">Req</td>
                      {ASSET_COLUMNS.slice(0, -1).map(col => (
                        <td key={col.key} className={`px-1 py-1 text-center border-r border-gray-300 text-xs ${
                          row.assets[col.key].req > 0 ? 'font-medium text-blue-700' : 'text-gray-500'
                        }`}>
                          {row.assets[col.key].req || '-'}
                        </td>
                      ))}
                      <td className={`px-1 py-1 text-center text-xs ${
                        row.assets[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].req > 0 ? 'font-medium text-blue-700' : 'text-gray-500'
                      }`}>
                        {row.assets[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].req || '-'}
                      </td>
                      <td rowSpan={3} className={`px-2 py-1 text-xs border-l border-gray-300 ${rowBackground}`}>
                        {row.workAssignment?.shift || ''}
                      </td>
                      <td rowSpan={3} className={`px-2 py-1 text-xs ${rowBackground}`}>
                        {row.workAssignment?.leaderName} {row.workAssignment?.leaderPhone}
                      </td>
                      <td rowSpan={3} className={`px-2 py-1 text-xs ${rowBackground}`}>
                        {row.workAssignment?.reportingTime}
                      </td>
                      <td rowSpan={3} className={`px-2 py-1 text-xs ${rowBackground}`}>
                        {row.workAssignment?.reportingLocation}
                      </td>
                      <td rowSpan={3} className={`px-2 py-1 text-xs ${rowBackground}`}>
                        {row.workAssignment?.instructions}
                      </td>
                    </tr>
                    <tr className={`${rowBackground} hover:bg-blue-50 transition-colors`}>
                      <td className="px-1 py-1 text-center text-gray-700 bg-green-50 border-r border-gray-300 text-xs font-medium">Have</td>
                      {ASSET_COLUMNS.slice(0, -1).map(col => (
                        <td key={col.key} className={`px-1 py-1 text-center border-r border-gray-300 text-xs ${
                          row.assets[col.key].have > 0 ? 'font-medium text-green-700' : 'text-gray-500'
                        }`}>
                          {row.assets[col.key].have || '-'}
                        </td>
                      ))}
                      <td className={`px-1 py-1 text-center text-xs ${
                        row.assets[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].have > 0 ? 'font-medium text-green-700' : 'text-gray-500'
                      }`}>
                        {row.assets[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].have || '-'}
                      </td>
                    </tr>
                    <tr className={`${rowBackground} hover:bg-blue-50 transition-colors border-b-2 border-gray-300`}>
                      <td className="px-1 py-1 text-center text-gray-700 bg-orange-50 border-r border-gray-300 text-xs font-medium">Need</td>
                      {ASSET_COLUMNS.slice(0, -1).map(col => (
                        <td key={col.key} className={`px-1 py-1 text-center border-r border-gray-300 text-xs ${
                          row.assets[col.key].need > 0 ? 'bg-red-50 text-red-700 font-bold' : 
                          row.assets[col.key].need < 0 ? 'bg-green-50 text-green-700 font-bold' :
                          'text-gray-500'
                        }`}>
                          {row.assets[col.key].need || '-'}
                        </td>
                      ))}
                      <td className={`px-1 py-1 text-center text-xs ${
                        row.assets[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].need > 0 ? 'bg-red-50 text-red-700 font-bold' :
                        row.assets[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].need < 0 ? 'bg-green-50 text-green-700 font-bold' :
                        'text-gray-500'
                      }`}>
                        {row.assets[ASSET_COLUMNS[ASSET_COLUMNS.length - 1].key].need || '-'}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Bottom Summary (Same as Top) - Below the Red Line */}
      <div className="bg-white rounded-lg shadow-lg border-4 border-red-600 overflow-hidden">
        <div className="bg-red-600 text-white px-4 py-2">
          <h3 className="font-bold text-lg">SUMMARY TOTALS - CRITICAL RESOURCE NEEDS</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-3 py-2 text-left font-bold text-gray-800">Assets</th>
                <th className="px-3 py-2 text-center font-bold text-gray-800 bg-blue-100">Req</th>
                <th className="px-3 py-2 text-center font-bold text-gray-800 bg-green-100">Have</th>
                <th className="px-3 py-2 text-center font-bold text-gray-800 bg-orange-100">Need</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ASSET_COLUMNS.map((col, idx) => {
                const isShortage = totals[col.key].need > 0;
                const isSurplus = totals[col.key].need < 0;
                return (
                  <tr key={col.key} className={`hover:bg-gray-50 ${
                    isShortage ? 'bg-red-50' : isSurplus ? 'bg-green-50' : ''
                  }`}>
                    <td className="px-3 py-2 font-medium text-gray-900">{col.label}</td>
                    <td className={`px-3 py-2 text-center font-medium ${
                      totals[col.key].req > 0 ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {totals[col.key].req || '-'}
                    </td>
                    <td className={`px-3 py-2 text-center font-medium ${
                      totals[col.key].have > 0 ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {totals[col.key].have || '-'}
                    </td>
                    <td className={`px-3 py-2 text-center font-bold text-lg ${
                      isShortage ? 'bg-red-100 text-red-700' : 
                      isSurplus ? 'bg-green-100 text-green-700' : 
                      'text-gray-500'
                    }`}>
                      {totals[col.key].need || '-'}
                    </td>
                  </tr>
                );
              })}
              {/* Grand Total Row */}
              <tr className="bg-gray-800 text-white font-bold">
                <td className="px-3 py-3">GRAND TOTALS</td>
                <td className="px-3 py-3 text-center bg-gray-700">
                  {Object.values(totals).reduce((sum, t) => sum + t.req, 0)}
                </td>
                <td className="px-3 py-3 text-center bg-gray-700">
                  {Object.values(totals).reduce((sum, t) => sum + t.have, 0)}
                </td>
                <td className={`px-3 py-3 text-center text-lg ${
                  Object.values(totals).reduce((sum, t) => sum + t.need, 0) > 0 
                    ? 'bg-red-700' 
                    : 'bg-green-700'
                }`}>
                  {Object.values(totals).reduce((sum, t) => sum + t.need, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <p className="text-blue-900 font-medium">Formula Notes:</p>
          <ul className="mt-2 space-y-1 text-blue-700">
            <li>• Top summary rows (yellow) = SUM of all detail rows below</li>
            <li>• Need = Req - Have (calculated automatically)</li>
            <li>• Red values indicate resource shortages</li>
            <li>• This matches Excel formulas: SUM(D11,D14,D17) for totals</li>
          </ul>
        </div>
      </div>
    </div>
  );
}