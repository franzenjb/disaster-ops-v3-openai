'use client';

import React, { useState, useEffect } from 'react';
import { V27_IAP_DATA } from '@/data/v27-iap-data';

interface WorkSite {
  id: string;
  facility: string;
  type: string;
  discipline: string;
  address: string;
  county: string;
  status: string;
  phone?: string;
  contact?: string;
  capacity?: any;
  personnel?: any;
}

export function WorkSitesFacilities() {
  const [workSites, setWorkSites] = useState<WorkSite[]>([]);
  const [groupBy, setGroupBy] = useState<'discipline' | 'county' | 'type'>('discipline');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');

  useEffect(() => {
    // Aggregate all facilities from all disciplines
    const allSites: WorkSite[] = [];

    // Add Sheltering facilities
    V27_IAP_DATA.shelteringFacilities.forEach((facility, idx) => {
      allSites.push({
        id: `shelter-${idx}`,
        facility: facility.name,
        type: 'Shelter',
        discipline: 'Sheltering',
        address: facility.address,
        county: facility.county,
        status: facility.status || 'Open',
        phone: facility.phone,
        contact: facility.manager,
        capacity: facility.capacity,
        personnel: facility.personnel
      });
    });

    // Add Feeding facilities
    V27_IAP_DATA.feedingFacilities.forEach((facility, idx) => {
      allSites.push({
        id: `feeding-${idx}`,
        facility: facility.name,
        type: facility.type,
        discipline: 'Feeding',
        address: facility.address,
        county: facility.county,
        status: facility.status || 'Active',
        phone: facility.phone,
        contact: facility.manager,
        capacity: { meals: facility.mealsPerDay },
        personnel: facility.personnel
      });
    });

    // Add Government Operations facilities
    if (V27_IAP_DATA.governmentFacilities) {
      V27_IAP_DATA.governmentFacilities.forEach((facility, idx) => {
        allSites.push({
          id: `gov-${idx}`,
          facility: facility.name,
          type: facility.type || 'EOC',
          discipline: 'Government Operations',
          address: facility.address,
          county: facility.county,
          status: facility.status || 'Active',
          phone: facility.phone,
          contact: facility.contact,
          personnel: facility.personnel
        });
      });
    }

    // Add Damage Assessment facilities
    if (V27_IAP_DATA.damageAssessmentFacilities) {
      V27_IAP_DATA.damageAssessmentFacilities.forEach((facility, idx) => {
        allSites.push({
          id: `damage-${idx}`,
          facility: facility.name,
          type: facility.type || 'Assessment Center',
          discipline: 'Damage Assessment',
          address: facility.address,
          county: facility.county,
          status: facility.status || 'Active',
          phone: facility.phone,
          contact: facility.contact,
          personnel: facility.personnel
        });
      });
    }

    // Add Distribution facilities
    if (V27_IAP_DATA.distributionFacilities) {
      V27_IAP_DATA.distributionFacilities.forEach((facility, idx) => {
        allSites.push({
          id: `dist-${idx}`,
          facility: facility.name,
          type: facility.type || 'Distribution Center',
          discipline: 'Distribution',
          address: facility.address,
          county: facility.county,
          status: facility.status || 'Active',
          phone: facility.phone,
          contact: facility.contact,
          personnel: facility.personnel
        });
      });
    }

    // Add Individual Care facilities
    if (V27_IAP_DATA.individualCareFacilities) {
      V27_IAP_DATA.individualCareFacilities.forEach((facility, idx) => {
        allSites.push({
          id: `care-${idx}`,
          facility: facility.name,
          type: facility.type || 'Care Center',
          discipline: 'Individual Disaster Care',
          address: facility.address,
          county: facility.county,
          status: facility.status || 'Active',
          phone: facility.phone,
          contact: facility.contact,
          personnel: facility.personnel
        });
      });
    }

    // Add DRO Headquarters if available
    if (V27_IAP_DATA.droHeadquarters) {
      allSites.push({
        id: 'dro-hq',
        facility: V27_IAP_DATA.droHeadquarters.name || 'DRO Headquarters',
        type: 'Headquarters',
        discipline: 'Command',
        address: V27_IAP_DATA.droHeadquarters.address,
        county: V27_IAP_DATA.droHeadquarters.county,
        status: 'Operational',
        phone: V27_IAP_DATA.droHeadquarters.phone,
        contact: V27_IAP_DATA.droHeadquarters.contact
      });
    }

    // Sort by facility name initially
    allSites.sort((a, b) => a.facility.localeCompare(b.facility));
    
    setWorkSites(allSites);
  }, []);

  // Filter sites based on search and selected discipline
  const filteredSites = workSites.filter(site => {
    const matchesSearch = searchTerm === '' || 
      site.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.county.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDiscipline = selectedDiscipline === 'all' || site.discipline === selectedDiscipline;
    
    return matchesSearch && matchesDiscipline;
  });

  // Group sites based on selected grouping
  const groupedSites = filteredSites.reduce((groups, site) => {
    const key = groupBy === 'discipline' ? site.discipline :
                groupBy === 'county' ? site.county :
                site.type;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(site);
    return groups;
  }, {} as Record<string, WorkSite[]>);

  // Get unique disciplines for filter
  const disciplines = Array.from(new Set(workSites.map(s => s.discipline))).sort();

  // Calculate statistics
  const totalSites = filteredSites.length;
  const totalByDiscipline = disciplines.reduce((acc, disc) => {
    acc[disc] = workSites.filter(s => s.discipline === disc).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gray-700 text-white p-3 mb-4">
        <h2 className="text-xl font-bold">Work Sites and Facilities</h2>
        <p className="text-sm mt-1">Comprehensive list of all operational facilities</p>
      </div>

      {/* Statistics Bar */}
      <div className="bg-blue-50 border border-blue-300 p-3 mb-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="font-bold">Total Sites: {totalSites}</span>
          {disciplines.map(disc => (
            <span key={disc}>
              {disc}: {totalByDiscipline[disc]}
            </span>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search facilities, addresses, or counties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <select
          value={selectedDiscipline}
          onChange={(e) => setSelectedDiscipline(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Disciplines</option>
          {disciplines.map(disc => (
            <option key={disc} value={disc}>{disc}</option>
          ))}
        </select>

        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as any)}
          className="px-3 py-2 border rounded"
        >
          <option value="discipline">Group by Discipline</option>
          <option value="county">Group by County</option>
          <option value="type">Group by Type</option>
        </select>
      </div>

      {/* Main Table - Grouped View */}
      {Object.keys(groupedSites).length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No facilities found matching your criteria
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSites).sort((a, b) => a[0].localeCompare(b[0])).map(([group, sites]) => (
            <div key={group} className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-200 px-3 py-2 font-bold">
                {group} ({sites.length} sites)
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left border-r">Facility Name</th>
                    <th className="p-2 text-left border-r">Type</th>
                    <th className="p-2 text-left border-r">Address</th>
                    <th className="p-2 text-left border-r">County</th>
                    <th className="p-2 text-left border-r">Contact</th>
                    <th className="p-2 text-left border-r">Phone</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site, idx) => (
                    <tr key={site.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-2 border-r font-semibold">{site.facility}</td>
                      <td className="p-2 border-r">{site.type}</td>
                      <td className="p-2 border-r">{site.address}</td>
                      <td className="p-2 border-r">{site.county}</td>
                      <td className="p-2 border-r">{site.contact || '-'}</td>
                      <td className="p-2 border-r">{site.phone || '-'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          site.status === 'Open' || site.status === 'Active' || site.status === 'Operational'
                            ? 'bg-green-100 text-green-800'
                            : site.status === 'Closed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {site.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 p-3 bg-gray-100 border border-gray-300 text-sm">
        <div className="font-bold mb-2">Summary:</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div>• Total Facilities: {totalSites}</div>
          <div>• Counties Covered: {new Set(filteredSites.map(s => s.county)).size}</div>
          <div>• Active Disciplines: {new Set(filteredSites.map(s => s.discipline)).size}</div>
          <div>• Shelter Beds: {workSites.filter(s => s.discipline === 'Sheltering').reduce((sum, s) => {
            const cap = typeof s.capacity === 'object' ? (s.capacity.maximum || s.capacity.current || 0) : (s.capacity || 0);
            return sum + cap;
          }, 0)}</div>
          <div>• Feeding Capacity: {workSites.filter(s => s.discipline === 'Feeding').reduce((sum, s) => {
            return sum + (s.capacity?.meals || 0);
          }, 0)} meals/day</div>
          <div>• Personnel Deployed: {workSites.reduce((sum, s) => sum + (s.personnel?.have || 0), 0)}</div>
        </div>
      </div>
    </div>
  );
}