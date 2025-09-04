/**
 * Event Log - Complete Audit Trail
 * 
 * Shows every action taken in the system.
 * Required for compliance and debugging.
 */

import React, { useState, useEffect } from 'react';
import { eventBus, EventType, OperationEvent } from '../core/EventBus';

export function EventLog() {
  const [events, setEvents] = useState<OperationEvent[]>([]);
  const [filter, setFilter] = useState<'all' | EventType>('all');
  
  useEffect(() => {
    // Load queued events
    const queuedEvents = eventBus.getQueuedEvents();
    setEvents(queuedEvents);
    
    // Subscribe to all event types
    const eventTypes = Object.values(EventType);
    const unsubscribers = eventTypes.map(type => 
      eventBus.on(type, (event) => {
        setEvents(prev => [event, ...prev].slice(0, 100)); // Keep last 100
      })
    );
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);
  
  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.type === filter);
  
  const getEventColor = (type: EventType) => {
    if (type.includes('created')) return 'text-green-600';
    if (type.includes('updated') || type.includes('edited')) return 'text-blue-600';
    if (type.includes('removed') || type.includes('closed')) return 'text-red-600';
    if (type.includes('sync')) return 'text-purple-600';
    return 'text-gray-600';
  };
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Event Log</h2>
        
        <select
          className="input-field w-48"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All Events</option>
          <option value={EventType.OPERATION_CREATED}>Operations</option>
          <option value={EventType.COUNTY_ADDED}>Counties</option>
          <option value={EventType.FEEDING_DATA_ENTERED}>Feeding</option>
          <option value={EventType.SHELTER_OPENED}>Sheltering</option>
          <option value={EventType.IAP_SECTION_EDITED}>IAP Edits</option>
          <option value={EventType.SYNC_COMPLETED}>Sync Events</option>
        </select>
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No events yet. Start by entering some data!
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredEvents.map(event => (
            <div 
              key={event.id}
              className="border-l-4 border-gray-200 pl-4 py-2 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`font-medium ${getEventColor(event.type)}`}>
                    {event.type.replace(/\./g, ' ').toUpperCase()}
                  </span>
                  <div className="text-sm text-gray-600 mt-1">
                    {JSON.stringify(event.payload, null, 2).substring(0, 100)}...
                  </div>
                </div>
                
                <div className="text-right text-sm">
                  <div className="text-gray-500">
                    {formatTimestamp(event.timestamp)}
                  </div>
                  <div className="text-gray-400">
                    {event.userId}
                  </div>
                  {event.reversible && (
                    <button className="text-blue-500 hover:underline mt-1">
                      Undo
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Export Options */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
        <button className="btn-secondary text-sm">
          Export CSV
        </button>
        <button className="btn-secondary text-sm">
          Export JSON
        </button>
      </div>
      
      {/* Info Box */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Compliance Note:</strong> All events are permanently logged and 
          cannot be deleted. This audit trail is required for Red Cross compliance 
          and disaster response accountability.
        </p>
      </div>
    </div>
  );
}