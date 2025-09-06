'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDailySchedule, useFacilities, usePersonnel, useGaps, useWorkAssignments } from '@/hooks/useMasterData';
import { initializeMasterDataService } from '@/lib/services/MasterDataService';

type TableCategory = 
  | 'facilities' 
  | 'personnel' 
  | 'gaps' 
  | 'assets' 
  | 'schedules' 
  | 'contacts' 
  | 'organizations'
  | 'work-assignments';

interface TableConfig {
  id: string;
  name: string;
  category: TableCategory;
  description: string;
  icon: string;
  hasImport: boolean;
  hasExport: boolean;
  hasEdit: boolean;
  dataCount?: number;
}

export function TablesHub() {
  const [selectedTable, setSelectedTable] = useState<string>('facilities');
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentOperationId, setCurrentOperationId] = useState<string>('op-current');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize master data service
  useEffect(() => {
    initializeMasterDataService(currentOperationId);
  }, [currentOperationId]);
  
  // Use master data hooks - THE SINGLE SOURCE OF TRUTH
  const { schedule: dailySchedule, loading: scheduleLoading, updateEntry: updateScheduleEntry, addEntry: addScheduleEntry, deleteEntry: deleteScheduleEntry } = useDailySchedule(currentOperationId);
  const { facilities: allFacilities, loading: facilitiesLoading, updateFacility, getFacilitiesByType } = useFacilities(currentOperationId);
  const { personnel, loading: personnelLoading } = usePersonnel(currentOperationId);
  const { gaps, loading: gapsLoading, criticalGaps } = useGaps(currentOperationId);
  const { assignments: workAssignments, loading: assignmentsLoading, getAssignmentsByType } = useWorkAssignments(currentOperationId);
  
  // Define all available tables - CORRECTED ARCHITECTURE: Single Source of Truth
  const tables: TableConfig[] = [
    // SINGLE Facilities Table - all facility types as categories within one table
    {
      id: 'facilities',
      name: 'Facilities & Locations',
      category: 'facilities',
      description: 'All facilities: shelters, feeding, government, distribution, care, assessment',
      icon: '🏢',
      hasImport: true,
      hasExport: true,
      hasEdit: true,
      dataCount: allFacilities.length
    },
    
    // Personnel Tables
    {
      id: 'personnel-roster',
      name: 'Personnel Roster',
      category: 'personnel',
      description: 'All operation personnel and contact information',
      icon: '👥',
      hasImport: true,
      hasExport: true,
      hasEdit: true,
      dataCount: personnel.length
    },
    
    // SINGLE Gaps Table - all gap types as categories within one table
    {
      id: 'gaps',
      name: 'Gap Analysis',
      category: 'gaps',
      description: 'All Red Cross gaps: personnel, equipment, supplies, vehicles, space',
      icon: '⚠️',
      hasImport: false,
      hasExport: true,
      hasEdit: true,
      dataCount: gaps.length
    },
    
    // SINGLE Assets Table - all asset types as categories within one table
    {
      id: 'assets',
      name: 'Assets & Resources',
      category: 'assets',
      description: 'All vehicles, equipment, and supplies (single unified table)',
      icon: '📋',
      hasImport: true,
      hasExport: true,
      hasEdit: true,
      dataCount: 0 // TODO: Connect to master assets table
    },
    
    // Schedules Tables
    {
      id: 'schedules-daily',
      name: 'Daily Schedule',
      category: 'schedules',
      description: 'Meetings, briefings, and daily timeline',
      icon: '📅',
      hasImport: true,
      hasExport: true,
      hasEdit: true,
      dataCount: dailySchedule.length
    },
    
    // Work Assignment Tables
    {
      id: 'work-assignments',
      name: 'Work Assignments',
      category: 'work-assignments',
      description: 'Task assignments and completion tracking',
      icon: '✓',
      hasImport: false,
      hasExport: true,
      hasEdit: true,
      dataCount: workAssignments.length
    }
  ];

  // Get category display names
  const categoryNames: Record<TableCategory, string> = {
    'facilities': 'Facilities & Locations',
    'personnel': 'Personnel & Contacts',
    'gaps': 'Gap Analysis',
    'assets': 'Assets & Resources',
    'schedules': 'Schedules & Planning',
    'contacts': 'Contact Information',
    'organizations': 'Organizations',
    'work-assignments': 'Work Assignments'
  };
  
  const selectedTableConfig = tables.find(t => t.id === selectedTable);
  
  // Handle CSV import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      // Parse CSV and update data
      console.log('Importing CSV:', csv.substring(0, 100));
      alert(`Import feature for ${selectedTableConfig?.name} coming soon!`);
    };
    reader.readAsText(file);
  };
  
  // Handle CSV export
  const handleExport = () => {
    if (!selectedTableConfig) return;
    
    let csvContent = '';
    
    switch (selectedTable) {
      case 'facilities':
        csvContent = 'Name,Type,County,Address,Status,Capacity\n';
        allFacilities.forEach(facility => {
          csvContent += `"${facility.name}","${facility.facility_type}","${facility.county}","${facility.address}","${facility.status}","${facility.capacity?.maximum || 0}"\n`;
        });
        break;
      case 'personnel-roster':
        csvContent = 'Name,Position,Email,Phone,Section\n';
        personnel.forEach(person => {
          csvContent += `"${person.first_name} ${person.last_name}","${person.primary_position}","${person.email}","${person.phone}","${person.section}"\n`;
        });
        break;
      case 'schedules-daily':
        csvContent = 'Time,Event,Location,Responsible Party,Status\n';
        dailySchedule.forEach(entry => {
          csvContent += `"${entry.time}","${entry.event_name}","${entry.location}","${entry.responsible_party}","${entry.status}"\n`;
        });
        break;
      case 'gaps':
        csvContent = 'Type,Category,Facility,Needed,Available,Gap,Priority\n';
        gaps.forEach(gap => {
          csvContent += `"${gap.gap_type}","${gap.gap_category}","${gap.facility_id}","${gap.quantity_needed}","${gap.quantity_available}","${gap.quantity_needed - gap.quantity_available}","${gap.priority}"\n`;
        });
        break;
      default:
        csvContent = 'Export not yet implemented for this table\n';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTableConfig.name.replace(/\s+/g, '_').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  // Group tables by category
  const tablesByCategory = tables.reduce((acc, table) => {
    if (!acc[table.category]) {
      acc[table.category] = [];
    }
    acc[table.category].push(table);
    return acc;
  }, {} as Record<TableCategory, TableConfig[]>);
  
  // Filter tables based on search
  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Render table content based on selected table
  const renderTableContent = () => {
    switch (selectedTable) {
      case 'facilities':
        return renderAllFacilities();
      case 'personnel-roster':
        return renderContactRoster();
      case 'schedules-daily':
        return renderDailySchedule();
      case 'gaps':
        return renderAllGaps();
      case 'assets':
        return renderAllAssets();
      case 'work-assignments':
        return renderWorkAssignments();
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            Table view for "{selectedTableConfig?.name}" is under development
          </div>
        );
    }
  };
  
  // Render ALL facilities in one table (CORRECTED: single source of truth)
  const renderAllFacilities = () => (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left">Facility Name</th>
          <th className="p-2 text-left">Type</th>
          <th className="p-2 text-left">County</th>
          <th className="p-2 text-left">Address</th>
          <th className="p-2 text-center">Capacity</th>
          <th className="p-2 text-center">Current</th>
          <th className="p-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {facilitiesLoading ? (
          <tr>
            <td colSpan={7} className="p-4 text-center text-gray-500">
              Loading facilities...
            </td>
          </tr>
        ) : allFacilities.length === 0 ? (
          <tr>
            <td colSpan={7} className="p-4 text-center text-gray-500">
              No facilities found. Click "Edit Table" to add facilities.
            </td>
          </tr>
        ) : (
          allFacilities.map((facility, idx) => (
            <tr key={facility.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-2 font-semibold">{facility.name}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  facility.facility_type === 'shelter' ? 'bg-blue-100 text-blue-800' :
                  facility.facility_type === 'feeding' ? 'bg-green-100 text-green-800' :
                  facility.facility_type === 'government' ? 'bg-purple-100 text-purple-800' :
                  facility.facility_type === 'distribution' ? 'bg-orange-100 text-orange-800' :
                  facility.facility_type === 'care' ? 'bg-red-100 text-red-800' :
                  facility.facility_type === 'assessment' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {facility.facility_type?.charAt(0).toUpperCase() + facility.facility_type?.slice(1) || 'Unknown'}
                </span>
              </td>
              <td className="p-2">{facility.county || 'Unknown'}</td>
              <td className="p-2">{facility.address || 'No address'}</td>
              <td className="p-2 text-center">
                {facility.capacity?.maximum || 0}
              </td>
              <td className="p-2 text-center">
                {facility.capacity?.current || 0}
              </td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  facility.status === 'open' ? 'bg-green-100 text-green-800' :
                  facility.status === 'planned' ? 'bg-yellow-100 text-yellow-800' :
                  facility.status === 'closed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {facility.status?.charAt(0).toUpperCase() + facility.status?.slice(1) || 'Unknown'}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  // Render ALL gaps in one table (CORRECTED: single source of truth)
  const renderAllGaps = () => (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left">Gap Type</th>
          <th className="p-2 text-left">Category</th>
          <th className="p-2 text-left">Facility</th>
          <th className="p-2 text-center">Needed</th>
          <th className="p-2 text-center">Available</th>
          <th className="p-2 text-center">Gap</th>
          <th className="p-2 text-center">Priority</th>
          <th className="p-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {gapsLoading ? (
          <tr>
            <td colSpan={8} className="p-4 text-center text-gray-500">
              Loading gaps...
            </td>
          </tr>
        ) : gaps.length === 0 ? (
          <tr>
            <td colSpan={8} className="p-4 text-center text-gray-500">
              No gaps identified. System is fully resourced.
            </td>
          </tr>
        ) : (
          gaps.map((gap, idx) => (
            <tr key={gap.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  gap.gap_type === 'personnel' ? 'bg-blue-100 text-blue-800' :
                  gap.gap_type === 'equipment' ? 'bg-green-100 text-green-800' :
                  gap.gap_type === 'supplies' ? 'bg-orange-100 text-orange-800' :
                  gap.gap_type === 'vehicles' ? 'bg-purple-100 text-purple-800' :
                  gap.gap_type === 'space' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {gap.gap_type?.charAt(0).toUpperCase() + gap.gap_type?.slice(1) || 'Unknown'}
                </span>
              </td>
              <td className="p-2">{gap.gap_category || '-'}</td>
              <td className="p-2">{gap.facility_id || 'General'}</td>
              <td className="p-2 text-center">{gap.quantity_needed}</td>
              <td className="p-2 text-center">{gap.quantity_available}</td>
              <td className="p-2 text-center font-bold text-red-600">
                {gap.quantity_needed - gap.quantity_available}
              </td>
              <td className="p-2 text-center">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  gap.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  gap.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  gap.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {gap.priority?.charAt(0).toUpperCase() + gap.priority?.slice(1) || 'Medium'}
                </span>
              </td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  gap.status === 'open' ? 'bg-red-100 text-red-800' :
                  gap.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                  gap.status === 'filled' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {gap.status?.charAt(0).toUpperCase() + gap.status?.slice(1) || 'Open'}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  // Render ALL assets in one table (placeholder - needs implementation)
  const renderAllAssets = () => (
    <div className="text-center text-gray-500 py-8">
      <p>Assets & Resources table under development</p>
      <p className="text-sm mt-2">This will show ALL assets: vehicles, equipment, and supplies in one unified table with category filtering.</p>
    </div>
  );

  // Other existing render methods...
  const renderContactRoster = () => (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Position</th>
          <th className="p-2 text-left">Section</th>
          <th className="p-2 text-left">Email</th>
          <th className="p-2 text-left">Phone</th>
          <th className="p-2 text-left">Radio</th>
        </tr>
      </thead>
      <tbody>
        {personnelLoading ? (
          <tr>
            <td colSpan={6} className="p-4 text-center text-gray-500">
              Loading personnel...
            </td>
          </tr>
        ) : personnel.length === 0 ? (
          <tr>
            <td colSpan={6} className="p-4 text-center text-gray-500">
              No personnel found. Add personnel to see roster.
            </td>
          </tr>
        ) : (
          personnel.map((person, idx) => (
            <tr key={person.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-2 font-semibold">{person.first_name} {person.last_name}</td>
              <td className="p-2">{person.primary_position || '-'}</td>
              <td className="p-2">{person.section || '-'}</td>
              <td className="p-2">{person.email || '-'}</td>
              <td className="p-2">{person.phone || '-'}</td>
              <td className="p-2">{person.radio_call_sign || '-'}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const renderDailySchedule = () => (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 text-left">Time</th>
          <th className="p-2 text-left">Event</th>
          <th className="p-2 text-left">Location</th>
          <th className="p-2 text-left">Responsible Party</th>
          <th className="p-2 text-left">Type</th>
          <th className="p-2 text-left">Status</th>
          <th className="p-2 text-center">Priority</th>
        </tr>
      </thead>
      <tbody>
        {scheduleLoading ? (
          <tr>
            <td colSpan={7} className="p-4 text-center text-gray-500">
              Loading schedule...
            </td>
          </tr>
        ) : dailySchedule.length === 0 ? (
          <tr>
            <td colSpan={7} className="p-4 text-center text-gray-500">
              No events scheduled. Add events to see daily schedule.
            </td>
          </tr>
        ) : (
          dailySchedule.map((entry, idx) => (
            <tr key={entry.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-2 font-mono">{entry.time}</td>
              <td className="p-2 font-semibold">{entry.event_name}</td>
              <td className="p-2">{entry.location || '-'}</td>
              <td className="p-2">{entry.responsible_party || '-'}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  entry.event_type === 'briefing' ? 'bg-blue-100 text-blue-800' :
                  entry.event_type === 'operation' ? 'bg-green-100 text-green-800' :
                  entry.event_type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                  entry.event_type === 'deadline' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {entry.event_type?.charAt(0).toUpperCase() + entry.event_type?.slice(1) || 'Event'}
                </span>
              </td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                  entry.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  entry.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1) || 'Scheduled'}
                </span>
              </td>
              <td className="p-2 text-center">{entry.priority || 5}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const renderWorkAssignments = () => (
    <div className="text-center text-gray-500 py-8">
      <p>Work Assignments table under development</p>
      <p className="text-sm mt-2">This will show all task assignments and completion tracking.</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Table Navigation */}
      <div className="w-80 bg-white shadow-lg border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">📊 Tables & Data Hub</h2>
          <p className="text-sm text-gray-600 mt-1">Single Source of Truth - Master Database</p>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        
        {/* Table Categories */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(tablesByCategory).map(([category, categoryTables]) => {
            const filteredCategoryTables = categoryTables.filter(table => 
              filteredTables.includes(table)
            );
            
            if (filteredCategoryTables.length === 0) return null;
            
            return (
              <div key={category} className="border-b">
                <div className="px-4 py-2 bg-gray-100">
                  <h3 className="font-semibold text-gray-700 text-sm">
                    {categoryNames[category as TableCategory]}
                  </h3>
                </div>
                <div className="space-y-1 p-2">
                  {filteredCategoryTables.map(table => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedTable === table.id
                          ? 'bg-blue-100 border-2 border-blue-500 text-blue-900'
                          : 'hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{table.icon}</span>
                          <span className="font-medium text-sm">{table.name}</span>
                        </div>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                          {table.dataCount || 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 ml-7">{table.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                {selectedTableConfig?.icon} {selectedTableConfig?.name}
              </h1>
              <p className="text-gray-600 text-sm mt-1">{selectedTableConfig?.description}</p>
            </div>
            <div className="flex space-x-3">
              {selectedTableConfig?.hasImport && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  📥 Import CSV
                </button>
              )}
              {selectedTableConfig?.hasExport && (
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  📤 Export CSV
                </button>
              )}
              {selectedTableConfig?.hasEdit && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                    editMode
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {editMode ? '👁️ View Mode' : '✏️ Edit Table'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6 bg-white">
          {renderTableContent()}
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </div>
  );
}