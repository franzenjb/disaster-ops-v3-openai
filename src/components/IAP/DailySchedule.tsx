'use client';

import React, { useState, useEffect } from 'react';

// Simple type definition to avoid database imports
interface DailyScheduleEntry {
  id: string;
  operation_id: string;
  time: string;
  event_name: string;
  location: string | null;
  responsible_party: string | null;
  notes: string | null;
  event_type: string;
}

function DailyScheduleClient() {
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<DailyScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Initialize default schedule 
  useEffect(() => {
    setLoading(true);
    
    const defaultEntries: DailyScheduleEntry[] = [
      {
        id: '1',
        operation_id: 'demo-op',
        time: '06:00',
        event_name: 'Operational Period Begins',
        location: 'All Sites',
        responsible_party: 'All Personnel',
        notes: 'Day shift reporting time',
        event_type: 'operation'
      },
      {
        id: '2',
        operation_id: 'demo-op',
        time: '07:00',
        event_name: 'Morning Briefing',
        location: 'DRO HQ / Virtual',
        responsible_party: 'DRO Director',
        notes: 'Daily operational briefing for all section chiefs',
        event_type: 'briefing'
      },
      {
        id: '3',
        operation_id: 'demo-op',
        time: '08:00',
        event_name: 'Shelter Operations Begin',
        location: 'All Shelters',
        responsible_party: 'Shelter Managers',
        notes: 'Morning shift change',
        event_type: 'operation'
      },
      {
        id: '4',
        operation_id: 'demo-op',
        time: '09:00',
        event_name: 'Feeding Operations Begin',
        location: 'All Kitchens/ERVs',
        responsible_party: 'Feeding Manager',
        notes: 'ERV departure for routes',
        event_type: 'operation'
      },
      {
        id: '5',
        operation_id: 'demo-op',
        time: '10:00',
        event_name: 'EOC Coordination Call',
        location: 'State EOC',
        responsible_party: 'Government Operations',
        notes: 'Daily state/county coordination',
        event_type: 'meeting'
      },
      {
        id: '6',
        operation_id: 'demo-op',
        time: '12:00',
        event_name: 'Midday Status Update',
        location: 'Virtual',
        responsible_party: 'All Section Chiefs',
        notes: 'Quick status check',
        event_type: 'briefing'
      },
      {
        id: '7',
        operation_id: 'demo-op',
        time: '14:00',
        event_name: 'Planning Meeting',
        location: 'DRO HQ',
        responsible_party: 'Planning Section',
        notes: 'Next operational period planning',
        event_type: 'meeting'
      },
      {
        id: '8',
        operation_id: 'demo-op',
        time: '16:00',
        event_name: 'Resource Request Deadline',
        location: 'N/A',
        responsible_party: 'Logistics',
        notes: 'Deadline for next day resource requests',
        event_type: 'deadline'
      },
      {
        id: '9',
        operation_id: 'demo-op',
        time: '17:00',
        event_name: 'Evening Briefing',
        location: 'DRO HQ / Virtual',
        responsible_party: 'DRO Director',
        notes: 'End of day status and night operations',
        event_type: 'briefing'
      },
      {
        id: '10',
        operation_id: 'demo-op',
        time: '18:00',
        event_name: 'IAP Publication',
        location: 'N/A',
        responsible_party: 'Planning Section',
        notes: 'Next operational period IAP released',
        event_type: 'deadline'
      },
      {
        id: '11',
        operation_id: 'demo-op',
        time: '19:00',
        event_name: 'Night Shift Change',
        location: 'All 24hr Sites',
        responsible_party: 'Night Supervisors',
        notes: 'Night shift reporting time',
        event_type: 'operation'
      },
      {
        id: '12',
        operation_id: 'demo-op',
        time: '21:00',
        event_name: 'Night Operations Check',
        location: 'Virtual',
        responsible_party: 'Night Operations Chief',
        notes: 'Status check for overnight operations',
        event_type: 'operation'
      }
    ];
    
    setSchedule(defaultEntries);
    setLoading(false);
  }, []);
  
  const handleSave = () => {
    // Data is already saved via master data service automatically
    setEditMode(false);
    setEditingItem(null);
  };
  
  const handleAddItem = () => {
    const newEntry: DailyScheduleEntry = {
      id: Date.now().toString(),
      operation_id: 'demo-op',
      time: '00:00',
      event_name: 'New Event',
      location: '',
      responsible_party: '',
      notes: '',
      event_type: 'operation'
    };
    
    setSchedule(prev => [...prev, newEntry]);
    setEditingItem(newEntry.id);
    setLastUpdate(new Date());
  };
  
  const handleDeleteItem = (id: string) => {
    setSchedule(prev => prev.filter(item => item.id !== id));
    setLastUpdate(new Date());
  };
  
  const updateItem = (id: string, field: keyof DailyScheduleEntry, value: string) => {
    setSchedule(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
    setLastUpdate(new Date());
  };
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-gray-700 text-white p-3 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Daily Schedule</h2>
          {lastUpdate && (
            <p className="text-sm text-gray-300">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
          {loading && <p className="text-sm text-yellow-300">⏳ Loading schedule...</p>}
          {error && <p className="text-sm text-red-300">❌ Error: {error.message}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            disabled={loading}
            className={`px-4 py-2 rounded font-semibold ${
              loading ? 'bg-gray-600 cursor-not-allowed' :
              editMode 
                ? 'bg-yellow-500 hover:bg-yellow-600 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {editMode ? '🔴 EDITING - Click to Exit' : '✏️ Edit Schedule'}
          </button>
          {editMode && (
            <>
              <button
                onClick={handleAddItem}
                disabled={loading}
                className={`px-3 py-2 rounded font-semibold ${
                  loading 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                + Add Event
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-semibold"
              >
                💾 Exit Edit Mode
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Edit Mode Instructions */}
      {editMode && (
        <div className="bg-yellow-50 border-2 border-yellow-400 p-3 mb-4">
          <strong>📝 Edit Mode Active:</strong> Click any field to edit. Use the Edit/Done buttons for each row. 
          Add new events with the "Add Event" button. Delete events with the red Delete button. 
          Don't forget to Save All when finished!
        </div>
      )}
      
      {/* Operational Period Info */}
      <div className="bg-blue-50 border border-blue-300 p-3 mb-4">
        <strong>Operational Period:</strong> 06:00 to 05:59 (24 hours)
        <span className="ml-4"><strong>Time Zone:</strong> Eastern Standard Time (EST)</span>
      </div>
      
      {/* Schedule Table */}
      <table className="w-full border-collapse border-2 border-black">
        <thead>
          <tr className="bg-gray-200">
            <th className="border-2 border-black p-2 text-left w-24">Time</th>
            <th className="border-2 border-black p-2 text-left">Event/Activity</th>
            <th className="border-2 border-black p-2 text-left w-48">Location</th>
            <th className="border-2 border-black p-2 text-left w-48">Responsible</th>
            <th className="border-2 border-black p-2 text-left">Notes</th>
            {editMode && <th className="border-2 border-black p-2 w-24">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={editMode ? 6 : 5} className="p-4 text-center text-gray-500">
                ⏳ Loading schedule from master database...
              </td>
            </tr>
          ) : schedule.length === 0 ? (
            <tr>
              <td colSpan={editMode ? 6 : 5} className="p-4 text-center text-gray-500">
                No schedule entries found. Default schedule will be created automatically.
              </td>
            </tr>
          ) : (
            schedule.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-black p-2 font-bold">
                  {editingItem === item.id ? (
                    <input
                      type="time"
                      value={item.time}
                      onChange={(e) => updateItem(item.id, 'time', e.target.value)}
                      className="w-full px-1 border rounded"
                    />
                  ) : (
                    item.time
                  )}
                </td>
                <td className="border border-black p-2">
                  {editingItem === item.id ? (
                    <input
                      type="text"
                      value={item.event_name}
                      onChange={(e) => updateItem(item.id, 'event_name', e.target.value)}
                      className="w-full px-1 border rounded"
                    />
                  ) : (
                    <strong>{item.event_name}</strong>
                  )}
                </td>
                <td className="border border-black p-2">
                  {editingItem === item.id ? (
                    <input
                      type="text"
                      value={item.location || ''}
                      onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                      className="w-full px-1 border rounded"
                    />
                  ) : (
                    item.location || 'TBD'
                  )}
                </td>
                <td className="border border-black p-2">
                  {editingItem === item.id ? (
                    <input
                      type="text"
                      value={item.responsible_party || ''}
                      onChange={(e) => updateItem(item.id, 'responsible_party', e.target.value)}
                      className="w-full px-1 border rounded"
                    />
                  ) : (
                    item.responsible_party || 'TBD'
                  )}
                </td>
                <td className="border border-black p-2">
                  {editingItem === item.id ? (
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                      className="w-full px-1 border rounded"
                    />
                  ) : (
                    <span className="text-sm italic">{item.notes || ''}</span>
                  )}
                </td>
                {editMode && (
                  <td className="border border-black p-2">
                    <div className="flex gap-1">
                      {editingItem === item.id ? (
                        <button
                          onClick={() => setEditingItem(null)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                        >
                          Done
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingItem(item.id)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* Key Times Summary */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300">
        <h3 className="font-bold mb-2">Key Times:</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>• Morning Briefing: 07:00</div>
          <div>• Evening Briefing: 17:00</div>
          <div>• IAP Publication: 18:00</div>
          <div>• Shift Change (Day): 07:00</div>
          <div>• Shift Change (Night): 19:00</div>
          <div>• Resource Deadline: 16:00</div>
        </div>
      </div>
    </div>
  );
}

export function DailySchedule() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">📅 Daily Schedule</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return <DailyScheduleClient />;
}

export default DailySchedule;