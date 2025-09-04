import React, { useState } from 'react';
import { useRosterStore } from '../../stores/useRosterStore';
import { Phone, Mail, Plus, Trash2 } from 'lucide-react';

interface ContactRosterPageProps {
  isEditing: boolean;
}

export function ContactRosterPage({ isEditing }: ContactRosterPageProps) {
  const { roster, addPerson, deletePerson, updatePerson } = useRosterStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    level: 'staff' as const,
    section: ''
  });

  const handleAdd = () => {
    if (newPerson.name && newPerson.title) {
      addPerson({
        id: Date.now().toString(),
        ...newPerson
      });
      setNewPerson({ name: '', title: '', phone: '', email: '', level: 'staff', section: '' });
      setShowAddForm(false);
    }
  };

  // Group roster by level
  const directors = roster.filter(p => p.level === 'director');
  const chiefs = roster.filter(p => p.level === 'chief');
  const coordinators = roster.filter(p => p.level === 'coordinator');
  const staff = roster.filter(p => p.level === 'staff');

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-red-600 pb-2">
        <h2 className="text-2xl font-bold text-red-600">CONTACT ROSTER - DRO HQ</h2>
      </div>

      {isEditing && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-red-600 text-white rounded flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>

          {showAddForm && (
            <div className="mt-4 p-4 bg-white rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name *"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Title *"
                  value={newPerson.title}
                  onChange={(e) => setNewPerson({ ...newPerson, title: e.target.value })}
                  className="px-3 py-2 border rounded"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newPerson.phone}
                  onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                  className="px-3 py-2 border rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                  className="px-3 py-2 border rounded"
                />
                <select
                  value={newPerson.level}
                  onChange={(e) => setNewPerson({ ...newPerson, level: e.target.value as any })}
                  className="px-3 py-2 border rounded"
                >
                  <option value="director">Director</option>
                  <option value="chief">Chief</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="staff">Staff</option>
                </select>
                <input
                  type="text"
                  placeholder="Section"
                  value={newPerson.section}
                  onChange={(e) => setNewPerson({ ...newPerson, section: e.target.value })}
                  className="px-3 py-2 border rounded"
                />
              </div>
              <div className="mt-4 flex space-x-4">
                <button onClick={handleAdd} className="px-4 py-2 bg-green-600 text-white rounded">
                  Add to Roster
                </button>
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-400 text-white rounded">
                  Cancel
                </button>
              </div>
            </div>
          )}
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
              <th className="border p-2 text-left">Section</th>
              {isEditing && <th className="border p-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {/* Directors */}
            {directors.length > 0 && (
              <>
                <tr className="bg-red-50">
                  <td colSpan={isEditing ? 6 : 5} className="border p-2 font-semibold text-red-600">
                    DIRECTORS
                  </td>
                </tr>
                {directors.map(person => (
                  <ContactRow key={person.id} person={person} isEditing={isEditing} />
                ))}
              </>
            )}

            {/* Chiefs */}
            {chiefs.length > 0 && (
              <>
                <tr className="bg-blue-50">
                  <td colSpan={isEditing ? 6 : 5} className="border p-2 font-semibold text-blue-600">
                    CHIEFS
                  </td>
                </tr>
                {chiefs.map(person => (
                  <ContactRow key={person.id} person={person} isEditing={isEditing} />
                ))}
              </>
            )}

            {/* Coordinators */}
            {coordinators.length > 0 && (
              <>
                <tr className="bg-green-50">
                  <td colSpan={isEditing ? 6 : 5} className="border p-2 font-semibold text-green-600">
                    COORDINATORS
                  </td>
                </tr>
                {coordinators.map(person => (
                  <ContactRow key={person.id} person={person} isEditing={isEditing} />
                ))}
              </>
            )}

            {/* Staff */}
            {staff.length > 0 && (
              <>
                <tr className="bg-gray-50">
                  <td colSpan={isEditing ? 6 : 5} className="border p-2 font-semibold text-gray-600">
                    STAFF
                  </td>
                </tr>
                {staff.map(person => (
                  <ContactRow key={person.id} person={person} isEditing={isEditing} />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContactRow({ person, isEditing }: { person: any; isEditing: boolean }) {
  const { updatePerson, deletePerson } = useRosterStore();

  if (isEditing) {
    return (
      <tr className="hover:bg-gray-50">
        <td className="border p-2">
          <input
            type="text"
            value={person.name}
            onChange={(e) => updatePerson(person.id, { name: e.target.value })}
            className="w-full px-2 py-1 border rounded"
          />
        </td>
        <td className="border p-2">
          <input
            type="text"
            value={person.title}
            onChange={(e) => updatePerson(person.id, { title: e.target.value })}
            className="w-full px-2 py-1 border rounded"
          />
        </td>
        <td className="border p-2">
          <input
            type="tel"
            value={person.phone || ''}
            onChange={(e) => updatePerson(person.id, { phone: e.target.value })}
            className="w-full px-2 py-1 border rounded"
          />
        </td>
        <td className="border p-2">
          <input
            type="email"
            value={person.email || ''}
            onChange={(e) => updatePerson(person.id, { email: e.target.value })}
            className="w-full px-2 py-1 border rounded"
          />
        </td>
        <td className="border p-2">
          <input
            type="text"
            value={person.section || ''}
            onChange={(e) => updatePerson(person.id, { section: e.target.value })}
            className="w-full px-2 py-1 border rounded"
          />
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
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="border p-2 font-medium">{person.name}</td>
      <td className="border p-2">{person.title}</td>
      <td className="border p-2">
        {person.phone && (
          <a href={`tel:${person.phone}`} className="text-blue-600 hover:underline flex items-center space-x-1">
            <Phone className="w-3 h-3" />
            <span>{person.phone}</span>
          </a>
        )}
      </td>
      <td className="border p-2">
        {person.email && (
          <a href={`mailto:${person.email}`} className="text-blue-600 hover:underline flex items-center space-x-1">
            <Mail className="w-3 h-3" />
            <span>{person.email}</span>
          </a>
        )}
      </td>
      <td className="border p-2">{person.section || '-'}</td>
    </tr>
  );
}