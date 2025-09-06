'use client';

import React, { useEffect, useState } from 'react';
import { simpleStore } from '@/lib/simple-store';
import { V27_IAP_DATA } from '@/data/v27-iap-data';

interface WorkSite {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  contact?: string;
  phone?: string;
  capacity?: number;
  currentOccupancy?: number;
  status: string;
  notes?: string;
  source?: string; // Track where this location came from
}

export function WorkSitesTable() {
  const [workSites, setWorkSites] = useState<WorkSite[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingSite, setEditingSite] = useState<string | null>(null);
  
  useEffect(() => {
    aggregateAllLocations();
  }, []);
  
  const aggregateAllLocations = () => {
    const sites: WorkSite[] = [];
    const locationMap = new Map<string, WorkSite>();
    let siteId = 0;
    
    // 1. Get all sheltering facilities from V27_IAP_DATA
    V27_IAP_DATA.shelteringFacilities.forEach(facility => {
      const site: WorkSite = {
        id: `shelter-${siteId++}`,
        name: facility.name,
        type: 'Shelter',
        address: facility.address || '',
        city: '',  // Not in sheltering data
        state: 'FL',
        zip: '',  // Not in sheltering data
        county: facility.county || '',
        contact: '',  // Not in sheltering data
        phone: '',  // Not in sheltering data
        capacity: typeof facility.capacity === 'object' ? facility.capacity.maximum : facility.capacity,
        currentOccupancy: typeof facility.capacity === 'object' ? facility.capacity.current : 0,
        status: 'Operational',  // Default status
        notes: '',  // Not in sheltering data
        source: 'Sheltering'
      };
      locationMap.set(`${facility.name}-${facility.county}`, site);
    });
    
    // 2. Get all feeding facilities from V27_IAP_DATA
    V27_IAP_DATA.feedingFacilities.forEach(facility => {
      const site: WorkSite = {
        id: `feeding-${siteId++}`,
        name: facility.name,
        type: facility.type || 'Feeding',
        address: facility.address || '',
        city: '',  // Not in feeding data
        state: 'FL',
        zip: '',  // Not in feeding data
        county: facility.county || '',
        contact: '',  // Not in feeding data
        phone: '',  // Not in feeding data
        capacity: facility.mealsPerDay,
        status: 'Operational',  // Default status
        notes: `${facility.mealsPerDay} meals/day`,
        source: 'Feeding'
      };
      locationMap.set(`${facility.name}-${facility.county}`, site);
    });
    
    // 3. Government Operations EOC locations
    const eocLocations = [
      {
        name: 'Sarasota EOC',
        type: 'EOC',
        address: '6050 Porter Way',
        city: 'Sarasota',
        county: 'Sarasota',
        status: 'Virtual',
        contact: 'EOC Liaison',
        source: 'Government Ops'
      },
      {
        name: 'Hillsborough EOC',
        type: 'EOC',
        address: '9450 E Columbus Drive',
        city: 'Tampa',
        zip: '33619',
        county: 'Hillsborough',
        status: 'In-Person',
        contact: 'EOC Liaison',
        source: 'Government Ops'
      },
      {
        name: 'FL State EOC',
        type: 'EOC',
        address: '2555 Shumard Oak Blvd',
        city: 'Tallahassee',
        zip: '32399',
        county: 'Leon',
        status: 'In-Person',
        contact: 'State EOC Principal',
        source: 'Government Ops'
      },
      {
        name: 'Citrus EOC',
        type: 'EOC',
        address: '3549 Saunders Way',
        city: 'Lecanto',
        zip: '34461',
        county: 'Citrus',
        status: 'Virtual',
        contact: 'EOC Liaison',
        source: 'Government Ops'
      },
      {
        name: 'Pinellas EOC',
        type: 'EOC',
        address: '10750 Ulmerton Rd',
        city: 'Largo',
        zip: '33771',
        county: 'Pinellas',
        status: 'In-Person',
        contact: 'EOC Liaison',
        source: 'Government Ops'
      },
      {
        name: 'Manatee EOC',
        type: 'EOC',
        address: '2101 47th Terrace East',
        city: 'Bradenton',
        zip: '34203',
        county: 'Manatee',
        status: 'Virtual',
        contact: 'EOC Liaison',
        source: 'Government Ops'
      }
    ];
    
    // 4. ERV Kitchen locations
    const ervKitchens = [
      {
        name: 'BRG - Church of the Palms',
        type: 'Kitchen',
        address: '3224 Bee Ridge Rd',
        city: 'Sarasota',
        county: 'Sarasota',
        contact: 'Dianne Heard',
        phone: '(610) 416-5238',
        status: 'Operational',
        source: 'ERV Operations'
      },
      {
        name: 'Tampa Kitchen - Hyde Park UMC',
        type: 'Kitchen',
        address: '1401 W Swann Ave',
        city: 'Tampa',
        zip: '33606',
        county: 'Hillsborough',
        contact: 'Kitchen Manager',
        status: 'Operational',
        source: 'ERV Operations'
      },
      {
        name: 'St. Pete Kitchen - First Baptist',
        type: 'Kitchen',
        address: '1900 Gandy Blvd',
        city: 'St. Petersburg',
        zip: '33702',
        county: 'Pinellas',
        contact: 'Kitchen Manager',
        status: 'Operational',
        source: 'ERV Operations'
      }
    ];
    
    // 5. Distribution Centers
    const distributionCenters = [
      {
        name: 'Distribution Center - Zone 1',
        type: 'Distribution',
        address: '10001 McKinley Dr',
        city: 'Tampa',
        zip: '33612',
        county: 'Hillsborough',
        status: 'Operational',
        capacity: 50000,
        notes: 'MRV-1, MRV-2, Box Trucks 1-3',
        source: 'Distribution'
      },
      {
        name: 'Distribution Center - Zone 2',
        type: 'Distribution',
        address: '2001 Cantu CT',
        city: 'Sarasota',
        zip: '34232',
        county: 'Sarasota',
        status: 'Operational',
        capacity: 30000,
        notes: 'MRV-3, Box Trucks 4-5',
        source: 'Distribution'
      },
      {
        name: 'Distribution Center - Zone 3',
        type: 'Distribution',
        address: '15340 Citrus County Drive',
        city: 'Dade City',
        zip: '33523',
        county: 'Pasco',
        status: 'Operational',
        capacity: 25000,
        notes: 'MRV-4, Box Truck 6',
        source: 'Distribution'
      }
    ];
    
    // 6. Damage Assessment staging areas
    const daStaging = [
      {
        name: 'DA Staging - Hillsborough',
        type: 'Staging Area',
        address: 'Raymond James Stadium Lot C',
        city: 'Tampa',
        county: 'Hillsborough',
        status: 'Active',
        notes: '5 teams deployed',
        source: 'Damage Assessment'
      },
      {
        name: 'DA Staging - Pinellas',
        type: 'Staging Area',
        address: 'Tropicana Field Lot 2',
        city: 'St. Petersburg',
        county: 'Pinellas',
        status: 'Active',
        notes: '7 teams deployed',
        source: 'Damage Assessment'
      },
      {
        name: 'DA Staging - Sarasota',
        type: 'Staging Area',
        address: 'Ed Smith Stadium',
        city: 'Sarasota',
        county: 'Sarasota',
        status: 'Active',
        notes: '4 teams deployed',
        source: 'Damage Assessment'
      },
      {
        name: 'DA Staging - Manatee',
        type: 'Staging Area',
        address: 'LECOM Park',
        city: 'Bradenton',
        county: 'Manatee',
        status: 'Active',
        notes: '3 teams deployed',
        source: 'Damage Assessment'
      }
    ];
    
    // 7. Individual Care Service Centers
    const carecenters = [
      {
        name: 'Client Service Center - Tampa',
        type: 'Service Center',
        address: '3310 W Columbus Dr',
        city: 'Tampa',
        zip: '33607',
        county: 'Hillsborough',
        status: 'Operational',
        contact: 'ICCT Manager',
        notes: 'Mental Health, Health Services, Client Casework',
        source: 'Individual Care'
      },
      {
        name: 'Client Service Center - Sarasota',
        type: 'Service Center',
        address: '2001 Cantu Court',
        city: 'Sarasota',
        zip: '34232',
        county: 'Sarasota',
        status: 'Operational',
        contact: 'ICCT Manager',
        notes: 'Mental Health, Health Services, Client Casework',
        source: 'Individual Care'
      },
      {
        name: 'Mobile Health Unit - Zone 1',
        type: 'Mobile Unit',
        address: 'Various Locations',
        city: 'Tampa Bay Area',
        county: 'Multiple',
        status: 'Deployed',
        notes: 'Rotating through affected neighborhoods',
        source: 'Individual Care'
      }
    ];
    
    // 8. DRO Headquarters and Support Facilities
    const headquarters = [
      {
        name: 'DRO Headquarters',
        type: 'Headquarters',
        address: '5401 W Kennedy Blvd',
        city: 'Tampa',
        zip: '33609',
        county: 'Hillsborough',
        status: 'Operational',
        contact: 'DRO Director',
        phone: '(813) 870-6666',
        notes: 'Primary Command Center',
        source: 'Command'
      },
      {
        name: 'Logistics Warehouse',
        type: 'Warehouse',
        address: '4502 N Lois Ave',
        city: 'Tampa',
        zip: '33614',
        county: 'Hillsborough',
        status: 'Operational',
        contact: 'Warehouse Manager',
        capacity: 100000,
        notes: 'Central supply hub',
        source: 'Logistics'
      },
      {
        name: 'Staff Processing Center',
        type: 'Staff Center',
        address: '100 S Ashley Dr',
        city: 'Tampa',
        zip: '33602',
        county: 'Hillsborough',
        status: 'Operational',
        contact: 'HR Manager',
        notes: 'Staff check-in, lodging assignments',
        source: 'Staffing'
      }
    ];
    
    // Add all EOC locations
    eocLocations.forEach((loc) => {
      const site: WorkSite = {
        id: `eoc-${siteId++}`,
        name: loc.name,
        type: loc.type,
        address: loc.address,
        city: loc.city || '',
        state: 'FL',
        zip: loc.zip || '',
        county: loc.county || '',
        contact: loc.contact || '',
        status: loc.status,
        notes: '',
        source: loc.source
      };
      locationMap.set(`${loc.name}-${loc.county}`, site);
    });
    
    // Add all Kitchen locations
    ervKitchens.forEach((loc) => {
      const site: WorkSite = {
        id: `kitchen-${siteId++}`,
        name: loc.name,
        type: loc.type,
        address: loc.address,
        city: loc.city || '',
        state: 'FL',
        zip: loc.zip || '',
        county: loc.county || '',
        contact: loc.contact || '',
        phone: loc.phone || '',
        status: loc.status,
        notes: '',
        source: loc.source
      };
      locationMap.set(`${loc.name}-${loc.county}`, site);
    });
    
    // Add all Distribution Centers
    distributionCenters.forEach((loc) => {
      const site: WorkSite = {
        id: `dist-${siteId++}`,
        name: loc.name,
        type: loc.type,
        address: loc.address,
        city: loc.city || '',
        state: 'FL',
        zip: loc.zip || '',
        county: loc.county || '',
        status: loc.status,
        capacity: loc.capacity,
        notes: loc.notes || '',
        source: loc.source
      };
      locationMap.set(`${loc.name}-${loc.county}`, site);
    });
    
    // Add all DA Staging Areas
    daStaging.forEach((loc) => {
      const site: WorkSite = {
        id: `da-${siteId++}`,
        name: loc.name,
        type: loc.type,
        address: loc.address,
        city: loc.city || '',
        state: 'FL',
        zip: '',
        county: loc.county || '',
        status: loc.status,
        notes: loc.notes || '',
        source: loc.source
      };
      locationMap.set(`${loc.name}-${loc.county}`, site);
    });
    
    // Add all Care Centers
    carecenters.forEach((loc) => {
      const site: WorkSite = {
        id: `care-${siteId++}`,
        name: loc.name,
        type: loc.type,
        address: loc.address,
        city: loc.city || '',
        state: 'FL',
        zip: loc.zip || '',
        county: loc.county || '',
        status: loc.status,
        contact: loc.contact || '',
        notes: loc.notes || '',
        source: loc.source
      };
      locationMap.set(`${loc.name}-${loc.county}`, site);
    });
    
    // Add Headquarters and Support
    headquarters.forEach((loc) => {
      const site: WorkSite = {
        id: `hq-${siteId++}`,
        name: loc.name,
        type: loc.type,
        address: loc.address,
        city: loc.city || '',
        state: 'FL',
        zip: loc.zip || '',
        county: loc.county || '',
        status: loc.status,
        contact: loc.contact || '',
        phone: loc.phone || '',
        capacity: loc.capacity,
        notes: loc.notes || '',
        source: loc.source
      };
      locationMap.set(`${loc.name}-${loc.county}`, site);
    });
    
    // Convert map to array and sort by type, then name
    const allSites = Array.from(locationMap.values()).sort((a, b) => {
      const typeOrder = ['Headquarters', 'EOC', 'Shelter', 'Kitchen', 'Feeding', 'Distribution', 'Service Center', 'Staging Area', 'Mobile Unit', 'Warehouse', 'Staff Center'];
      const aIndex = typeOrder.indexOf(a.type) === -1 ? 999 : typeOrder.indexOf(a.type);
      const bIndex = typeOrder.indexOf(b.type) === -1 ? 999 : typeOrder.indexOf(b.type);
      if (aIndex !== bIndex) return aIndex - bIndex;
      return a.name.localeCompare(b.name);
    });
    
    setWorkSites(allSites);
  };
  
  const handleEdit = (siteId: string) => {
    setEditingSite(siteId);
  };
  
  const handleSave = (site: WorkSite) => {
    setWorkSites(prev => prev.map(s => s.id === site.id ? site : s));
    setEditingSite(null);
  };
  
  const handleAddSite = () => {
    const newSite: WorkSite = {
      id: `new-${Date.now()}`,
      name: 'New Site',
      type: 'Other',
      address: '',
      city: '',
      state: 'FL',
      zip: '',
      county: '',
      contact: '',
      phone: '',
      status: 'Planning',
      notes: '',
      source: 'Manual Entry'
    };
    setWorkSites([...workSites, newSite]);
    setEditingSite(newSite.id);
  };
  
  const handleDeleteSite = (siteId: string) => {
    if (confirm('Are you sure you want to delete this site?')) {
      setWorkSites(prev => prev.filter(s => s.id !== siteId));
    }
  };
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Headquarters': return 'bg-purple-100';
      case 'EOC': return 'bg-blue-100';
      case 'Shelter': return 'bg-red-100';
      case 'Kitchen': 
      case 'Feeding': return 'bg-orange-100';
      case 'Distribution': return 'bg-green-100';
      case 'Service Center': return 'bg-pink-100';
      case 'Staging Area': return 'bg-yellow-100';
      case 'Warehouse': return 'bg-gray-100';
      default: return 'bg-white';
    }
  };
  
  return (
    <div className="p-4">
      <div className="bg-gray-700 text-white p-3 flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Work Sites and Facilities - All Physical Locations</h2>
        <div className="flex gap-2">
          <span className="text-sm bg-blue-600 px-2 py-1 rounded">
            Total Sites: {workSites.length}
          </span>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {editMode ? 'View Mode' : 'Edit Mode'}
          </button>
          {editMode && (
            <button
              onClick={handleAddSite}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Add Site
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left">Site Name</th>
              <th className="border border-black p-2 text-left">Type</th>
              <th className="border border-black p-2 text-left">Address</th>
              <th className="border border-black p-2 text-left">City</th>
              <th className="border border-black p-2 text-left">County</th>
              <th className="border border-black p-2 text-left">Contact</th>
              <th className="border border-black p-2 text-left">Phone</th>
              <th className="border border-black p-2 text-left">Capacity</th>
              <th className="border border-black p-2 text-left">Status</th>
              <th className="border border-black p-2 text-left">Source</th>
              {editMode && <th className="border border-black p-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {workSites.map((site) => (
              <tr key={site.id} className={`hover:bg-gray-50 ${getTypeColor(site.type)}`}>
                <td className="border border-black p-2">
                  {editingSite === site.id ? (
                    <input
                      type="text"
                      value={site.name}
                      onChange={(e) => {
                        const updated = { ...site, name: e.target.value };
                        setWorkSites(prev => prev.map(s => s.id === site.id ? updated : s));
                      }}
                      className="w-full px-1 border rounded"
                    />
                  ) : (
                    <strong>{site.name}</strong>
                  )}
                </td>
                <td className="border border-black p-2">
                  {editingSite === site.id ? (
                    <select
                      value={site.type}
                      onChange={(e) => {
                        const updated = { ...site, type: e.target.value };
                        setWorkSites(prev => prev.map(s => s.id === site.id ? updated : s));
                      }}
                      className="w-full px-1 border rounded"
                    >
                      <option value="Headquarters">Headquarters</option>
                      <option value="EOC">EOC</option>
                      <option value="Shelter">Shelter</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Feeding">Feeding</option>
                      <option value="Distribution">Distribution</option>
                      <option value="Service Center">Service Center</option>
                      <option value="Staging Area">Staging Area</option>
                      <option value="Mobile Unit">Mobile Unit</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Staff Center">Staff Center</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <span className="text-sm font-semibold">{site.type}</span>
                  )}
                </td>
                <td className="border border-black p-2">
                  {editingSite === site.id ? (
                    <input
                      type="text"
                      value={site.address}
                      onChange={(e) => {
                        const updated = { ...site, address: e.target.value };
                        setWorkSites(prev => prev.map(s => s.id === site.id ? updated : s));
                      }}
                      className="w-full px-1 border rounded"
                    />
                  ) : (
                    <span className="text-sm">{site.address}</span>
                  )}
                </td>
                <td className="border border-black p-2 text-sm">{site.city}</td>
                <td className="border border-black p-2 text-sm">{site.county}</td>
                <td className="border border-black p-2 text-sm">{site.contact}</td>
                <td className="border border-black p-2 text-sm">{site.phone}</td>
                <td className="border border-black p-2 text-sm text-center">
                  {site.capacity || '-'}
                </td>
                <td className="border border-black p-2">
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    site.status === 'Operational' ? 'bg-green-200 text-green-800' :
                    site.status === 'Active' ? 'bg-blue-200 text-blue-800' :
                    site.status === 'In-Person' ? 'bg-purple-200 text-purple-800' :
                    site.status === 'Virtual' ? 'bg-yellow-200 text-yellow-800' :
                    site.status === 'Deployed' ? 'bg-orange-200 text-orange-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {site.status}
                  </span>
                </td>
                <td className="border border-black p-2 text-xs text-gray-600">{site.source}</td>
                {editMode && (
                  <td className="border border-black p-2">
                    <div className="flex gap-1">
                      {editingSite === site.id ? (
                        <button
                          onClick={() => handleSave(site)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(site.id)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteSite(site.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <strong>Note:</strong> This table aggregates all physical locations from: Sheltering, Feeding/ERV Operations, 
        Government Operations (EOCs), Distribution Centers, Damage Assessment Staging Areas, Individual Care Service Centers, 
        DRO Headquarters, and Support Facilities. Total of {workSites.length} operational sites.
      </div>
    </div>
  );
}