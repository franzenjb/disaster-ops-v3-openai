import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Person {
  id: string;
  name: string;
  title: string;
  phone?: string;
  email?: string;
  reportsTo?: string;
  level: 'director' | 'chief' | 'coordinator' | 'staff';
  section?: string; // For IAP work assignment sections
}

interface RosterStore {
  roster: Person[];
  setRoster: (roster: Person[]) => void;
  addPerson: (person: Person) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  getPeopleByLevel: (level: Person['level']) => Person[];
  getPeopleBySection: (section: string) => Person[];
  getDirectReports: (id: string) => Person[];
}

const defaultRoster: Person[] = [
  { id: '1', name: 'Virginia Mewborn', title: 'DRO Director', phone: '917-670-8334', email: 'virginia.mewborn@redcross.org', level: 'director' },
  { id: '2', name: 'Laura Delaney', title: 'Sheltering Chief', phone: '555-0101', email: 'laura.delaney@redcross.org', reportsTo: '1', level: 'chief', section: 'Sheltering' },
  { id: '3', name: 'Robert Smith', title: 'Feeding Chief', phone: '555-0102', email: 'robert.smith@redcross.org', reportsTo: '1', level: 'chief', section: 'Feeding' },
  { id: '4', name: 'Maria Garcia', title: 'Logistics Chief', phone: '555-0103', email: 'maria.garcia@redcross.org', reportsTo: '1', level: 'chief', section: 'Logistics' },
  { id: '5', name: 'John Williams', title: 'Individual Disaster Care Chief', phone: '555-0104', email: 'john.williams@redcross.org', reportsTo: '1', level: 'chief', section: 'Individual Disaster Care' },
  { id: '6', name: 'Sarah Johnson', title: 'Sheltering Coordinator', phone: '555-0201', email: 'sarah.johnson@redcross.org', reportsTo: '2', level: 'coordinator', section: 'Sheltering' },
  { id: '7', name: 'Mike Chen', title: 'Feeding Coordinator', phone: '555-0202', email: 'mike.chen@redcross.org', reportsTo: '3', level: 'coordinator', section: 'Feeding' },
];

export const useRosterStore = create<RosterStore>()(
  persist(
    (set, get) => ({
      roster: defaultRoster,
      
      setRoster: (roster) => set({ roster }),
      
      addPerson: (person) => set((state) => ({
        roster: [...state.roster, person]
      })),
      
      updatePerson: (id, updates) => set((state) => ({
        roster: state.roster.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      
      deletePerson: (id) => set((state) => ({
        roster: state.roster.filter(p => p.id !== id)
      })),
      
      getPeopleByLevel: (level) => {
        return get().roster.filter(p => p.level === level);
      },
      
      getPeopleBySection: (section) => {
        return get().roster.filter(p => p.section === section);
      },
      
      getDirectReports: (id) => {
        return get().roster.filter(p => p.reportsTo === id);
      }
    }),
    {
      name: 'roster-storage'
    }
  )
);