'use client';

import React, { useState, useEffect } from 'react';
import { simpleStore } from '@/lib/simple-store';

interface ScheduleItem {
  id: string;
  time: string;
  event: string;
  location: string;
  responsible: string;
  notes?: string;
}

export function DailySchedule() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  
  useEffect(() => {
    // Load schedule from storage or use defaults
    const savedSchedule = simpleStore.getDailySchedule ? simpleStore.getDailySchedule() : null;
    if (savedSchedule && savedSchedule.length > 0) {
      setSchedule(savedSchedule);
    } else {
      // Default Red Cross IAP schedule
      setSchedule([
        {
          id: '1',
          time: '06:00',
          event: 'Operational Period Begins',
          location: 'All Sites',
          responsible: 'All Personnel',
          notes: 'Day shift reporting time'
        },
        {
          id: '2',
          time: '07:00',
          event: 'Morning Briefing',
          location: 'DRO HQ / Virtual',
          responsible: 'DRO Director',
          notes: 'Daily operational briefing for all section chiefs'
        },
        {
          id: '3',
          time: '08:00',
          event: 'Shelter Operations Begin',
          location: 'All Shelters',
          responsible: 'Shelter Managers',
          notes: 'Morning shift change'
        },
        {
          id: '4',
          time: '09:00',
          event: 'Feeding Operations Begin',
          location: 'All Kitchens/ERVs',
          responsible: 'Feeding Manager',
          notes: 'ERV departure for routes'
        },
        {
          id: '5',
          time: '10:00',
          event: 'EOC Coordination Call',
          location: 'State EOC',
          responsible: 'Government Operations',
          notes: 'Daily state/county coordination'
        },
        {
          id: '6',
          time: '12:00',
          event: 'Midday Status Update',
          location: 'Virtual',
          responsible: 'All Section Chiefs',
          notes: 'Quick status check'
        },
        {
          id: '7',
          time: '14:00',
          event: 'Planning Meeting',
          location: 'DRO HQ',
          responsible: 'Planning Section',
          notes: 'Next operational period planning'
        },
        {
          id: '8',
          time: '16:00',
          event: 'Resource Request Deadline',
          location: 'N/A',
          responsible: 'Logistics',
          notes: 'Deadline for next day resource requests'
        },
        {
          id: '9',
          time: '17:00',
          event: 'Evening Briefing',
          location: 'DRO HQ / Virtual',
          responsible: 'DRO Director',
          notes: 'End of day status and night operations'
        },
        {
          id: '10',
          time: '18:00',
          event: 'IAP Publication',
          location: 'N/A',
          responsible: 'Planning Section',
          notes: 'Next operational period IAP released'
        },
        {
          id: '11',
          time: '19:00',
          event: 'Night Shift Change',
          location: 'All 24hr Sites',
          responsible: 'Night Supervisors',
          notes: 'Night shift reporting time'
        },
        {
          id: '12',
          time: '21:00',
          event: 'Night Operations Check',
          location: 'Virtual',
          responsible: 'Night Operations Chief',
          notes: 'Status check for overnight operations'
        }
      ]);
    }
  }, []);
  
  const handleSave = () => {
    // Save to storage
    if (simpleStore.saveDailySchedule) {
      simpleStore.saveDailySchedule(schedule);
    }
    setEditMode(false);
    setEditingItem(null);
  };
  
  const handleAddItem = () => {
    const newItem: ScheduleItem = {
      id: `new-${Date.now()}`,
      time: '00:00',
      event: 'New Event',
      location: '',
      responsible: '',
      notes: ''
    };
    setSchedule([...schedule, newItem].sort((a, b) => a.time.localeCompare(b.time)));
    setEditingItem(newItem.id);
  };
  
  const handleDeleteItem = (id: string) => {
    setSchedule(schedule.filter(item => item.id !== id));
  };
  
  const updateItem = (id: string, field: keyof ScheduleItem, value: string) => {
    setSchedule(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      );
      // Re-sort if time was changed
      if (field === 'time') {
        return updated.sort((a, b) => a.time.localeCompare(b.time));
      }
      return updated;
    });
  };
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-gray-700 text-white p-3 flex justify-between items-center">
        <h2 className="text-xl font-bold">Daily Schedule</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded font-semibold ${
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
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
              >
                + Add Event
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-semibold"
              >
                💾 Save All
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
          {schedule.map((item, idx) => (
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
                    value={item.event}
                    onChange={(e) => updateItem(item.id, 'event', e.target.value)}
                    className="w-full px-1 border rounded"
                  />
                ) : (
                  <strong>{item.event}</strong>
                )}
              </td>
              <td className="border border-black p-2">
                {editingItem === item.id ? (
                  <input
                    type="text"
                    value={item.location}
                    onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                    className="w-full px-1 border rounded"
                  />
                ) : (
                  item.location
                )}
              </td>
              <td className="border border-black p-2">
                {editingItem === item.id ? (
                  <input
                    type="text"
                    value={item.responsible}
                    onChange={(e) => updateItem(item.id, 'responsible', e.target.value)}
                    className="w-full px-1 border rounded"
                  />
                ) : (
                  item.responsible
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
                  <span className="text-sm italic">{item.notes}</span>
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