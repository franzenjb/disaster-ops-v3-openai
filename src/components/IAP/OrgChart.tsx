'use client';

import React, { useEffect, useState } from 'react';
import { simpleStore } from '@/lib/simple-store';

interface OrgNode {
  id: string;
  title: string;
  name?: string;
  phone?: string;
  email?: string;
  level: number;
  category: string;
  children?: OrgNode[];
}

export function OrgChart() {
  const [orgData, setOrgData] = useState<OrgNode | null>(null);
  
  useEffect(() => {
    // Load roster data and build org chart
    const roster = simpleStore.getContactRoster();
    if (roster && roster.length > 0) {
      const chart = buildOrgChart(roster);
      setOrgData(chart);
    }
  }, []);
  
  const buildOrgChart = (roster: any[]): OrgNode => {
    // Find command positions
    const droDirectors = roster.filter(r => r.category === 'Command' && r.title.includes('DRO Director'));
    const rcco = roster.find(r => r.title === 'RCCO');
    const chiefOfStaff = roster.find(r => r.title === 'Chief of Staff');
    
    // Operations positions
    const opsAD = roster.find(r => r.title === 'AD Operations');
    const opsDAD = roster.filter(r => r.title === 'DAD Operations');
    const zoneCoordinators = roster.filter(r => r.title.includes('Zone Coordinator'));
    const massCareCheif = roster.find(r => r.title === 'HQ Mass Care Chief');
    const clientCareChief = roster.find(r => r.title === 'Client Care Chief');
    
    // Logistics positions
    const logAD = roster.find(r => r.title === 'AD Logistics');
    const logChief = roster.find(r => r.title === 'HQ Logistics Chief');
    
    // Build hierarchical structure
    const root: OrgNode = {
      id: 'root',
      title: 'Incident Command',
      level: 0,
      category: 'Command',
      children: []
    };
    
    // Add DRO Directors at top
    if (droDirectors.length > 0) {
      const primaryDirector = droDirectors[0];
      root.title = primaryDirector.title;
      root.name = primaryDirector.name;
      root.phone = primaryDirector.phone;
      root.email = primaryDirector.email;
    }
    
    // Add direct reports to DRO Director
    const commandStaff: OrgNode = {
      id: 'command-staff',
      title: 'Command Staff',
      level: 1,
      category: 'Command',
      children: []
    };
    
    if (rcco?.name) {
      commandStaff.children?.push({
        id: rcco.id,
        title: rcco.title,
        name: rcco.name,
        phone: rcco.phone,
        email: rcco.email,
        level: 2,
        category: 'Command'
      });
    }
    
    if (chiefOfStaff?.name) {
      commandStaff.children?.push({
        id: chiefOfStaff.id,
        title: chiefOfStaff.title,
        name: chiefOfStaff.name,
        phone: chiefOfStaff.phone,
        email: chiefOfStaff.email,
        level: 2,
        category: 'Command'
      });
    }
    
    if (commandStaff.children && commandStaff.children.length > 0) {
      root.children?.push(commandStaff);
    }
    
    // Operations Section
    const opsSection: OrgNode = {
      id: 'operations',
      title: 'Operations Section',
      name: opsAD?.name,
      phone: opsAD?.phone,
      email: opsAD?.email,
      level: 1,
      category: 'Operations',
      children: []
    };
    
    // Add zone coordinators under operations
    zoneCoordinators.forEach(zc => {
      if (zc.name) {
        opsSection.children?.push({
          id: zc.id,
          title: zc.title,
          name: zc.name,
          phone: zc.phone,
          email: zc.email,
          level: 2,
          category: 'Operations'
        });
      }
    });
    
    // Add Mass Care under operations
    if (massCareCheif?.name) {
      opsSection.children?.push({
        id: massCareCheif.id,
        title: massCareCheif.title,
        name: massCareCheif.name,
        phone: massCareCheif.phone,
        email: massCareCheif.email,
        level: 2,
        category: 'Operations'
      });
    }
    
    // Add Client Care under operations
    if (clientCareChief?.name) {
      opsSection.children?.push({
        id: clientCareChief.id,
        title: clientCareChief.title,
        name: clientCareChief.name,
        phone: clientCareChief.phone,
        email: clientCareChief.email,
        level: 2,
        category: 'Operations'
      });
    }
    
    if (opsSection.children && opsSection.children.length > 0) {
      root.children?.push(opsSection);
    }
    
    // Logistics Section
    const logSection: OrgNode = {
      id: 'logistics',
      title: 'Logistics Section',
      name: logAD?.name,
      phone: logAD?.phone,
      email: logAD?.email,
      level: 1,
      category: 'Logistics',
      children: []
    };
    
    // Add logistics chief and other logistics positions
    const logPositions = roster.filter(r => r.category === 'Logistics Section' && r.name);
    logPositions.forEach(lp => {
      if (lp.title !== 'AD Logistics') {
        logSection.children?.push({
          id: lp.id,
          title: lp.title,
          name: lp.name,
          phone: lp.phone,
          email: lp.email,
          level: 2,
          category: 'Logistics'
        });
      }
    });
    
    if (logSection.children && logSection.children.length > 0) {
      root.children?.push(logSection);
    }
    
    return root;
  };
  
  const formatEmail = (email?: string) => {
    if (!email) return '';
    return email.replace('@redcross.org', '');
  };
  
  const renderNode = (node: OrgNode, isRoot: boolean = false) => {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className={`flex flex-col items-center ${!isRoot ? 'mt-8' : ''}`}>
        {/* Node box */}
        <div className={`
          border-2 ${node.category === 'Command' ? 'border-red-600 bg-red-50' : 
                     node.category === 'Operations' ? 'border-blue-600 bg-blue-50' :
                     node.category === 'Logistics' ? 'border-green-600 bg-green-50' :
                     'border-gray-600 bg-gray-50'}
          rounded-lg p-3 min-w-[200px] text-center shadow-lg
        `}>
          <div className="font-bold text-sm">{node.title}</div>
          {node.name && (
            <>
              <div className="text-sm mt-1 font-semibold">{node.name}</div>
              {node.phone && (
                <a href={`tel:${node.phone}`} className="text-xs text-blue-600 hover:underline">
                  {node.phone}
                </a>
              )}
              {node.email && (
                <div className="text-xs text-gray-600">
                  <a href={`mailto:${node.email}`} className="hover:underline">
                    {formatEmail(node.email)}
                  </a>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Children */}
        {hasChildren && (
          <>
            {/* Vertical connector */}
            <div className="w-0.5 h-8 bg-gray-400"></div>
            
            {/* Horizontal connector for multiple children */}
            {node.children!.length > 1 && (
              <div className="relative w-full">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gray-400" 
                     style={{ width: `${(node.children!.length - 1) * 250}px` }}></div>
              </div>
            )}
            
            {/* Render children */}
            <div className="flex gap-8 mt-0">
              {node.children!.map(child => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Connector from horizontal line to child */}
                  {node.children!.length > 1 && (
                    <div className="w-0.5 h-8 bg-gray-400"></div>
                  )}
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };
  
  if (!orgData) {
    return (
      <div className="p-8 text-center text-gray-500">
        No organizational data available. Please fill out the Contact Roster first.
      </div>
    );
  }
  
  return (
    <div className="p-8 overflow-x-auto">
      {/* Header matching IAP format */}
      <div className="border-b-2 border-black pb-2 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-8">
            <div>
              <span className="font-bold">Incident Name:</span> FLOCOM
            </div>
            <div>
              <span className="font-bold">DR Number:</span> 220-25
            </div>
          </div>
          <div>
            <span className="font-bold">Operational Period:</span> 18:00 20/10/2024 to 17:59 21/10/2024
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-8">Incident Organization Chart</h2>
      
      {/* Org chart visualization */}
      <div className="flex justify-center min-w-max">
        {renderNode(orgData, true)}
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border-2 border-red-600"></div>
          <span className="text-sm">Command</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border-2 border-blue-600"></div>
          <span className="text-sm">Operations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border-2 border-green-600"></div>
          <span className="text-sm">Logistics</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 border-t-2 border-black pt-4 flex justify-between">
        <div>
          <span className="font-bold">Prepared By:</span> Gary Pelletier<br />
          Information & Planning
        </div>
        <div className="text-right">
          Page 7 of 53
        </div>
      </div>
    </div>
  );
}