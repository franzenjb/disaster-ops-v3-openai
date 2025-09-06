'use client';

import React, { useState, useEffect } from 'react';
import { simpleStore } from '@/lib/simple-store';

interface Priority {
  id: string;
  text: string;
  order: number;
}

interface Objective {
  id: string;
  text: string;
  order: number;
}

export function PrioritiesObjectives() {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingPriority, setEditingPriority] = useState<string | null>(null);
  const [editingObjective, setEditingObjective] = useState<string | null>(null);
  
  useEffect(() => {
    // Load from storage or use defaults
    const savedPriorities = simpleStore.getPriorities ? simpleStore.getPriorities() : null;
    const savedObjectives = simpleStore.getObjectives ? simpleStore.getObjectives() : null;
    
    if (!savedPriorities || savedPriorities.length === 0) {
      setPriorities([
        { id: '1', text: 'Life Safety - Ensure safety of all responders and affected populations', order: 1 },
        { id: '2', text: 'Incident Stabilization - Provide shelter, feeding, and essential services', order: 2 },
        { id: '3', text: 'Property/Environmental Conservation - Support recovery efforts', order: 3 }
      ]);
    } else {
      // Convert string[] to Priority[]
      const priorityObjects = savedPriorities.map((text: string, index: number) => ({
        id: String(index + 1),
        text: text,
        order: index + 1
      }));
      setPriorities(priorityObjects);
    }
    
    if (!savedObjectives || savedObjectives.length === 0) {
      setObjectives([
        { id: '1', text: 'Maintain 24/7 shelter operations at all active sites', order: 1 },
        { id: '2', text: 'Provide 3 meals per day to all shelter residents', order: 2 },
        { id: '3', text: 'Complete damage assessments in priority zones', order: 3 },
        { id: '4', text: 'Process client assistance requests within 48 hours', order: 4 },
        { id: '5', text: 'Coordinate with state/federal partners on resource requests', order: 5 }
      ]);
    } else {
      // Convert string[] to Objective[]
      const objectiveObjects = savedObjectives.map((text: string, index: number) => ({
        id: String(index + 1),
        text: text,
        order: index + 1
      }));
      setObjectives(objectiveObjects);
    }
  }, []);
  
  const handleSave = () => {
    if (simpleStore.savePriorities) {
      // Convert Priority[] back to string[]
      const priorityTexts = priorities.map(p => p.text);
      simpleStore.savePriorities(priorityTexts);
    }
    if (simpleStore.saveObjectives) {
      // Convert Objective[] back to string[]
      const objectiveTexts = objectives.map(o => o.text);
      simpleStore.saveObjectives(objectiveTexts);
    }
    setEditMode(false);
    setEditingPriority(null);
    setEditingObjective(null);
  };
  
  const handleAddPriority = () => {
    const newPriority: Priority = {
      id: `priority-${Date.now()}`,
      text: 'New Priority',
      order: priorities.length + 1
    };
    setPriorities([...priorities, newPriority]);
    setEditingPriority(newPriority.id);
  };
  
  const handleAddObjective = () => {
    const newObjective: Objective = {
      id: `objective-${Date.now()}`,
      text: 'New Objective',
      order: objectives.length + 1
    };
    setObjectives([...objectives, newObjective]);
    setEditingObjective(newObjective.id);
  };
  
  const handleDeletePriority = (id: string) => {
    const updated = priorities.filter(p => p.id !== id);
    // Reorder
    updated.forEach((p, idx) => p.order = idx + 1);
    setPriorities(updated);
  };
  
  const handleDeleteObjective = (id: string) => {
    const updated = objectives.filter(o => o.id !== id);
    // Reorder
    updated.forEach((o, idx) => o.order = idx + 1);
    setObjectives(updated);
  };
  
  const handleUpdatePriority = (id: string, text: string) => {
    setPriorities(prev => prev.map(p => p.id === id ? { ...p, text } : p));
  };
  
  const handleUpdateObjective = (id: string, text: string) => {
    setObjectives(prev => prev.map(o => o.id === id ? { ...o, text } : o));
  };
  
  const movePriority = (id: string, direction: 'up' | 'down') => {
    const index = priorities.findIndex(p => p.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === priorities.length - 1)) {
      return;
    }
    
    const newPriorities = [...priorities];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newPriorities[index], newPriorities[newIndex]] = [newPriorities[newIndex], newPriorities[index]];
    
    // Update order numbers
    newPriorities.forEach((p, idx) => p.order = idx + 1);
    setPriorities(newPriorities);
  };
  
  const moveObjective = (id: string, direction: 'up' | 'down') => {
    const index = objectives.findIndex(o => o.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === objectives.length - 1)) {
      return;
    }
    
    const newObjectives = [...objectives];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newObjectives[index], newObjectives[newIndex]] = [newObjectives[newIndex], newObjectives[index]];
    
    // Update order numbers
    newObjectives.forEach((o, idx) => o.order = idx + 1);
    setObjectives(newObjectives);
  };
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-gray-700 text-white p-3 flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Incident Priorities and Objectives</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            {editMode ? 'View Mode' : 'Edit Mode'}
          </button>
          {editMode && (
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Save All
            </button>
          )}
        </div>
      </div>
      
      {/* Stacked Layout */}
      <div className="space-y-6">
        {/* Priorities Column */}
        <div className="border-2 border-black rounded-lg overflow-hidden">
          <div className="bg-red-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-bold text-lg">Incident Priorities</h3>
            {editMode && (
              <button
                onClick={handleAddPriority}
                className="px-2 py-1 bg-white text-red-600 rounded text-sm font-bold hover:bg-gray-100"
              >
                + Add
              </button>
            )}
          </div>
          <div className="p-4 bg-white">
            <ol className="space-y-3">
              {priorities.sort((a, b) => a.order - b.order).map((priority, idx) => (
                <li key={priority.id} className="flex items-start gap-2">
                  <span className="font-bold text-red-600 mt-1">{idx + 1}.</span>
                  <div className="flex-1">
                    {editingPriority === priority.id ? (
                      <div className="flex gap-2">
                        <textarea
                          value={priority.text}
                          onChange={(e) => handleUpdatePriority(priority.id, e.target.value)}
                          onBlur={() => setEditingPriority(null)}
                          className="flex-1 px-2 py-1 border rounded resize-none"
                          rows={2}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div 
                        className={`${editMode ? 'cursor-pointer hover:bg-gray-50 p-1 rounded' : ''}`}
                        onClick={() => editMode && setEditingPriority(priority.id)}
                      >
                        {priority.text}
                      </div>
                    )}
                  </div>
                  {editMode && !editingPriority && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => movePriority(priority.id, 'up')}
                        className="px-1 text-gray-600 hover:text-black"
                        disabled={idx === 0}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => movePriority(priority.id, 'down')}
                        className="px-1 text-gray-600 hover:text-black"
                        disabled={idx === priorities.length - 1}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => handleDeletePriority(priority.id)}
                        className="px-1 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        {/* Objectives Column */}
        <div className="border-2 border-black rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-bold text-lg">Operational Period Objectives</h3>
            {editMode && (
              <button
                onClick={handleAddObjective}
                className="px-2 py-1 bg-white text-blue-600 rounded text-sm font-bold hover:bg-gray-100"
              >
                + Add
              </button>
            )}
          </div>
          <div className="p-4 bg-white">
            <ol className="space-y-3">
              {objectives.sort((a, b) => a.order - b.order).map((objective, idx) => (
                <li key={objective.id} className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 mt-1">{idx + 1}.</span>
                  <div className="flex-1">
                    {editingObjective === objective.id ? (
                      <div className="flex gap-2">
                        <textarea
                          value={objective.text}
                          onChange={(e) => handleUpdateObjective(objective.id, e.target.value)}
                          onBlur={() => setEditingObjective(null)}
                          className="flex-1 px-2 py-1 border rounded resize-none"
                          rows={2}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div 
                        className={`${editMode ? 'cursor-pointer hover:bg-gray-50 p-1 rounded' : ''}`}
                        onClick={() => editMode && setEditingObjective(objective.id)}
                      >
                        {objective.text}
                      </div>
                    )}
                  </div>
                  {editMode && !editingObjective && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveObjective(objective.id, 'up')}
                        className="px-1 text-gray-600 hover:text-black"
                        disabled={idx === 0}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveObjective(objective.id, 'down')}
                        className="px-1 text-gray-600 hover:text-black"
                        disabled={idx === objectives.length - 1}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => handleDeleteObjective(objective.id)}
                        className="px-1 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      
      {/* Important Notes Section */}
      <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
        <h4 className="font-bold text-lg mb-2">Important Notes:</h4>
        <ul className="list-disc ml-6 space-y-1 text-sm">
          <li>All objectives must be measurable and achievable within the operational period</li>
          <li>Priorities should align with overall incident command strategy</li>
          <li>Review and update at each planning meeting</li>
          <li>Ensure all section chiefs are aware of current priorities and objectives</li>
        </ul>
      </div>
    </div>
  );
}