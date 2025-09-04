import React from 'react';
import { useRosterStore } from '../../stores/useRosterStore';
import { User, Phone, Mail } from 'lucide-react';

interface OrganizationChartPageProps {
  isEditing: boolean;
}

export function OrganizationChartPage({ isEditing: _ }: OrganizationChartPageProps) {
  const { roster } = useRosterStore();
  
  const director = roster.find(p => p.level === 'director');
  const chiefs = roster.filter(p => p.level === 'chief');
  const coordinators = roster.filter(p => p.level === 'coordinator');
  const staff = roster.filter(p => p.level === 'staff');

  const levelColors = {
    director: 'bg-red-600 text-white',
    chief: 'bg-blue-600 text-white',
    coordinator: 'bg-green-600 text-white',
    staff: 'bg-gray-600 text-white'
  };

  const PersonCard = ({ person }: { person: any }) => (
    <div className={`${levelColors[person.level as keyof typeof levelColors]} rounded-lg shadow-lg p-4 min-w-[200px] text-center`}>
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
    <div className="space-y-6">
      <div className="border-b-2 border-red-600 pb-2">
        <h2 className="text-2xl font-bold text-red-600">INCIDENT ORGANIZATION CHART</h2>
        <p className="text-sm text-gray-600 mt-1">DR 220-25 FLOCOM</p>
      </div>

      <div className="p-8 bg-gray-50 rounded-lg min-h-[600px]">
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
                    {/* Coordinators under this chief */}
                    {index === 0 && coordinators.filter(c => c.reportsTo === chief.id).length > 0 && (
                      <div className="flex space-x-4 mt-4">
                        {coordinators.filter(c => c.reportsTo === chief.id).map(coordinator => (
                          <PersonCard key={coordinator.id} person={coordinator} />
                        ))}
                      </div>
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

          {/* Coordinators who don't report to chiefs */}
          {coordinators.filter(c => !c.reportsTo || !chiefs.find(ch => ch.id === c.reportsTo)).length > 0 && (
            <div className="flex space-x-4">
              {coordinators.filter(c => !c.reportsTo || !chiefs.find(ch => ch.id === c.reportsTo)).map(coordinator => (
                <PersonCard key={coordinator.id} person={coordinator} />
              ))}
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

        {/* Legend */}
        <div className="mt-12 flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span>Director</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span>Chief</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span>Coordinator</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>Staff</span>
          </div>
        </div>
      </div>
    </div>
  );
}