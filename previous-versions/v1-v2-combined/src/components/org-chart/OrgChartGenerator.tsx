import React, { useState, useEffect } from 'react';
import { Phone, Mail, User, ChevronDown, ChevronUp, Plus, Trash2, Download, Upload } from 'lucide-react';
import { useRosterStore, type Person } from '../../stores/useRosterStore';

export function OrgChartGenerator() {
  const { roster, setRoster, addPerson: addToStore, updatePerson: updateInStore, deletePerson: deleteFromStore } = useRosterStore();
  const [localRoster, setLocalRoster] = useState<Person[]>(roster);
  const [editMode, setEditMode] = useState(true);
  const [newPerson, setNewPerson] = useState<Partial<Person>>({
    name: '',
    title: '',
    phone: '',
    email: '',
    level: 'staff',
    section: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Sync local roster with store
  useEffect(() => {
    setLocalRoster(roster);
  }, [roster]);

  const levelColors = {
    director: 'bg-red-600 text-white',
    chief: 'bg-blue-600 text-white',
    coordinator: 'bg-green-600 text-white',
    staff: 'bg-gray-600 text-white'
  };

  const addPerson = () => {
    if (newPerson.name && newPerson.title) {
      const person: Person = {
        id: Date.now().toString(),
        name: newPerson.name,
        title: newPerson.title,
        phone: newPerson.phone,
        email: newPerson.email,
        level: newPerson.level || 'staff',
        reportsTo: newPerson.reportsTo,
        section: newPerson.section
      };
      addToStore(person);
      setNewPerson({ name: '', title: '', phone: '', email: '', level: 'staff', section: '' });
      setShowAddForm(false);
    }
  };

  const deletePerson = (id: string) => {
    deleteFromStore(id);
  };

  const updatePerson = (id: string, field: keyof Person, value: string) => {
    updateInStore(id, { [field]: value });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(roster, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `org-chart-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setRoster(imported);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderOrgChart = () => {
    const director = localRoster.find(p => p.level === 'director');
    const chiefs = localRoster.filter(p => p.level === 'chief');
    const coordinators = localRoster.filter(p => p.level === 'coordinator');
    const staff = localRoster.filter(p => p.level === 'staff');

    return (
      <div className="p-8 bg-gray-50 min-h-[600px]">
        <div className="flex flex-col items-center space-y-8">
          {/* Director Level */}
          {director && (
            <div className="flex flex-col items-center">
              <PersonCard person={director} />
              {chiefs.length > 0 && (
                <div className="w-0.5 h-12 bg-gray-400"></div>
              )}
            </div>
          )}

          {/* Chiefs Level */}
          {chiefs.length > 0 && (
            <div className="relative">
              <div className="flex space-x-8">
                {chiefs.map((chief, index) => (
                  <div key={chief.id} className="flex flex-col items-center">
                    <PersonCard person={chief} />
                    {/* Line to coordinators */}
                    {coordinators.filter(c => c.reportsTo === chief.id).length > 0 && (
                      <div className="w-0.5 h-8 bg-gray-400"></div>
                    )}
                  </div>
                ))}
              </div>
              {/* Horizontal connector line */}
              {chiefs.length > 1 && (
                <div className="absolute top-0 left-8 right-8 h-0.5 bg-gray-400" style={{ transform: 'translateY(-24px)' }}></div>
              )}
            </div>
          )}

          {/* Coordinators Level */}
          {coordinators.length > 0 && (
            <div className="flex space-x-6">
              {chiefs.map(chief => {
                const chiefCoordinators = coordinators.filter(c => c.reportsTo === chief.id);
                if (chiefCoordinators.length === 0) return null;
                return (
                  <div key={chief.id} className="flex space-x-4">
                    {chiefCoordinators.map(coordinator => (
                      <PersonCard key={coordinator.id} person={coordinator} />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Staff Level */}
          {staff.length > 0 && (
            <div className="mt-8 w-full">
              <h3 className="text-lg font-semibold mb-4 text-center">Additional Staff</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {staff.map(person => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PersonCard = ({ person }: { person: Person }) => (
    <div className={`${levelColors[person.level]} rounded-lg shadow-lg p-4 min-w-[200px] text-center`}>
      <div className="flex items-center justify-center mb-2">
        <User className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-lg">{person.name}</h3>
      <p className="text-sm opacity-90 mb-2">{person.title}</p>
      {person.phone && (
        <a href={`tel:${person.phone}`} className="flex items-center justify-center space-x-1 hover:underline">
          <Phone className="w-4 h-4" />
          <span className="text-sm">{person.phone}</span>
        </a>
      )}
      {person.email && (
        <a href={`mailto:${person.email}`} className="flex items-center justify-center space-x-1 hover:underline mt-1">
          <Mail className="w-4 h-4" />
          <span className="text-xs">{person.email.split('@')[0]}</span>
        </a>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-red-600">Organization Chart Generator</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-4 py-2 rounded ${editMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {editMode ? 'View Chart' : 'Edit Roster'}
              </button>
              <button onClick={exportData} className="px-4 py-2 bg-green-600 text-white rounded flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <label className="px-4 py-2 bg-purple-600 text-white rounded cursor-pointer flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {editMode ? (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Roster Entry</h2>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-red-600 text-white rounded flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Person</span>
                </button>
              </div>

              {showAddForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={newPerson.name || ''}
                      onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Title *"
                      value={newPerson.title || ''}
                      onChange={(e) => setNewPerson({ ...newPerson, title: e.target.value })}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={newPerson.phone || ''}
                      onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newPerson.email || ''}
                      onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                      className="px-3 py-2 border rounded"
                    />
                    <select
                      value={newPerson.level || 'staff'}
                      onChange={(e) => setNewPerson({ ...newPerson, level: e.target.value as Person['level'] })}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="director">Director</option>
                      <option value="chief">Chief</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="staff">Staff</option>
                    </select>
                    <select
                      value={newPerson.reportsTo || ''}
                      onChange={(e) => setNewPerson({ ...newPerson, reportsTo: e.target.value })}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="">Reports To...</option>
                      {localRoster.filter(p => p.level === 'director' || p.level === 'chief' || p.level === 'coordinator').map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.title})</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Section (e.g., Sheltering, Feeding)"
                      value={newPerson.section || ''}
                      onChange={(e) => setNewPerson({ ...newPerson, section: e.target.value })}
                      className="px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button onClick={addPerson} className="px-4 py-2 bg-green-600 text-white rounded">
                      Add to Roster
                    </button>
                    <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-400 text-white rounded">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Name</th>
                      <th className="border p-2 text-left">Title</th>
                      <th className="border p-2 text-left">Phone</th>
                      <th className="border p-2 text-left">Email</th>
                      <th className="border p-2 text-left">Level</th>
                      <th className="border p-2 text-left">Section</th>
                      <th className="border p-2 text-left">Reports To</th>
                      <th className="border p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localRoster.map(person => (
                      <tr key={person.id} className="hover:bg-gray-50">
                        <td className="border p-2">
                          <input
                            type="text"
                            value={person.name}
                            onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            value={person.title}
                            onChange={(e) => updatePerson(person.id, 'title', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="tel"
                            value={person.phone || ''}
                            onChange={(e) => updatePerson(person.id, 'phone', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="email"
                            value={person.email || ''}
                            onChange={(e) => updatePerson(person.id, 'email', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="border p-2">
                          <select
                            value={person.level}
                            onChange={(e) => updatePerson(person.id, 'level', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="director">Director</option>
                            <option value="chief">Chief</option>
                            <option value="coordinator">Coordinator</option>
                            <option value="staff">Staff</option>
                          </select>
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            value={person.section || ''}
                            onChange={(e) => updatePerson(person.id, 'section', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                            placeholder="Section"
                          />
                        </td>
                        <td className="border p-2">
                          <select
                            value={person.reportsTo || ''}
                            onChange={(e) => updatePerson(person.id, 'reportsTo', e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="">None</option>
                            {localRoster.filter(p => p.id !== person.id && (p.level === 'director' || p.level === 'chief' || p.level === 'coordinator')).map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="border p-2 text-center">
                          <button
                            onClick={() => deletePerson(person.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Instructions:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Fill in the roster with your team members</li>
                <li>Set the appropriate level (Director, Chief, Coordinator, Staff)</li>
                <li>Specify reporting relationships for proper hierarchy</li>
                <li>Phone numbers and emails will be clickable in the chart view</li>
                <li>Export your roster as JSON for backup or sharing</li>
                <li>Import a previously saved roster to quickly update</li>
              </ul>
            </div>
          </div>
        ) : (
          renderOrgChart()
        )}
      </div>
    </div>
  );
}