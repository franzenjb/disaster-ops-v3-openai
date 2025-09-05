/**
 * Personnel Database for Red Cross Operations
 * Contains staff members with their contact information
 */

export interface PersonnelMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  position?: string;
  gapCode?: string;
  homeChapter?: string;
  status: 'available' | 'deployed' | 'unavailable';
}

export const PERSONNEL_DATABASE: PersonnelMember[] = [
  // Command Staff
  { id: 'p001', name: 'Virginia Mewborn', phone: '917-670-8334', email: 'Virginia.Mewborn@redcross.org', position: 'DRO Director', status: 'deployed' },
  { id: 'p002', name: 'Jennie Sahagun', phone: '202-207-2057', email: 'Jennie.Sahagun@redcross.org', position: 'DRO Director', status: 'available' },
  { id: 'p003', name: 'Ryan Lock', phone: '850-354-2342', email: 'Ryan.Lock3@redcross.org', position: 'RCCO', status: 'deployed' },
  { id: 'p004', name: 'Janice Vannatta', phone: '601-325-3656', email: 'Janice.Vannatta4@redcross.org', position: 'Chief of Staff', status: 'deployed' },
  { id: 'p005', name: 'Candi Collyer', phone: '209-968-1884', email: 'Candi.Collyer@redcross.org', position: 'SEOC Principal', status: 'deployed' },
  { id: 'p006', name: 'Debbie Koch', phone: '786-570-9793', email: 'Deborah.Koch@redcross.org', position: 'EOL Chief', status: 'deployed' },
  { id: 'p007', name: 'Janice Moran', phone: '407-375-2344', email: 'Janice.Moran2@redcross.org', position: 'Deputy EOL Chief', status: 'deployed' },
  { id: 'p008', name: 'Alex Taylor', phone: '912-665-1070', email: 'Alexandra.Taylor@redcross.org', position: 'CAP Liaison', status: 'deployed' },
  { id: 'p009', name: 'Kimberly Knights', phone: '713-806-1489', email: 'Kimberly.Knights@redcross.org', position: 'SAF Liaison', status: 'available' },
  { id: 'p010', name: 'Amanda Cullison', phone: '727-422-2892', email: 'Amanda.Cullison@redcross.org', position: 'DAT Liaison CFL', status: 'deployed' },
  { id: 'p011', name: 'Steve Dixon', phone: '850-878-6080', email: 'Steve.Dixon3@redcross.org', position: 'DAT Liaison NFL', status: 'deployed' },
  { id: 'p012', name: 'Enrique Rivero', phone: '786-753-4267', email: 'Enrique.Rivero@redcross.org', position: 'DAT Liaison SFL', status: 'deployed' },
  
  // 24 Hour Lines
  { id: 'p013', name: 'Jill Hoover', phone: '281-468-3077', email: 'Jill.Hoover@redcross.org', position: '24 Hour / Staff Health', status: 'deployed' },
  { id: 'p014', name: 'Bob Fitzgerald', phone: '518-645-3781', email: 'Bob.Fitzgerald@redcross.org', position: '24 Hour / DHS', status: 'deployed' },
  
  // Operations Section
  { id: 'p015', name: 'Patricia DAlessandro', phone: '319-404-2096', email: 'Patricia.DAlessandro2@redcross.org', position: 'Zone Coordinator-Zone 1', status: 'deployed' },
  { id: 'p016', name: 'Rick Schou', phone: '980-721-8710', email: 'Rick.Schou@redcross.org', position: 'Zone Coordinator-Zone 2', status: 'deployed' },
  { id: 'p017', name: 'Bene Hunter', phone: '941-224-3350', email: 'Bene.Hunter2@redcross.org', position: 'Zone Coordinator-Zone 3', status: 'deployed' },
  { id: 'p018', name: 'Monica Rusconi', phone: '786-514-0044', email: 'Monica.Rusconi@redcross.org', position: 'District Director - District A', status: 'deployed' },
  { id: 'p019', name: 'Brenda Bridges', phone: '760-987-5452', email: 'brenda.bridges2@redcross.org', position: 'HQ Mass Care Chief', status: 'deployed' },
  { id: 'p020', name: 'Kelli Cameron', phone: '740-296-1654', email: 'Kelli.Cameron3@redcross.org', position: 'HQ Sheltering Coordinator', status: 'deployed' },
  { id: 'p021', name: 'Trish Burnett', phone: '309-258-4920', email: 'Trish.Burnett@redcross.org', position: 'HQ Pet Liaison', status: 'available' },
  { id: 'p022', name: 'Jamie Bonner', phone: '518-569-5038', email: 'Jamie.Bonner@redcross.org', position: 'HQ Feeding Manager', status: 'deployed' },
  { id: 'p023', name: 'Luca Calvani', phone: '774-261-0581', email: 'Luca.Calvani@redcross.org', position: 'HQ DES Manager', status: 'deployed' },
  { id: 'p024', name: 'Carol Janssens', phone: '425-327-7252', email: 'Carol.Janssens@redcross.org', position: 'HQ Reunification MN', status: 'available' },
  { id: 'p025', name: 'Shanie Bockmann', phone: '308-850-9800', email: 'Shanie.Bockmann@redcross.org', position: 'HQ SRT MN', status: 'available' },
  { id: 'p026', name: 'Pat Krebs', phone: '978-846-1888', email: 'Victor.Souza@redcross.org', position: 'Client Care Chief', status: 'deployed' },
  { id: 'p027', name: 'Pat Krebs', phone: '614-395-4444', email: 'Pat.Krebs@redcross.org', position: 'ICCT Manager', status: 'deployed' },
  { id: 'p028', name: 'Meghan Cole', phone: '262-388-9777', email: 'colemeghan@outlook.com', position: 'DMH Manager', status: 'deployed' },
  { id: 'p029', name: 'Greg Gooch', phone: '417-312-1676', email: 'Greg.Gooch@redcross.org', position: 'DSC Manager', status: 'deployed' },
  { id: 'p030', name: 'Ryan Weity', phone: '256-399-7076', email: 'Ryan.Weity@redcross.org', position: 'DI Manager', status: 'available' },
  { id: 'p031', name: 'James Keck', phone: '619-451-8910', email: 'James.Keck@redcross.org', position: 'HQ WebEOC OPS Admin', status: 'deployed' },
  { id: 'p032', name: 'Carolyn Burns', phone: '937-222-6711', email: 'Carolyn.Burns@redcross.org', position: 'FROST', status: 'available' },
  
  // Logistics Section
  { id: 'p033', name: 'Marvin Williams', phone: '931-237-3823', email: 'Marvin.Williams2@redcross.org', position: 'AD Logistics', status: 'deployed' },
  { id: 'p034', name: 'Marty Samuels', phone: '571-587-1692', email: 'Marty.Samuels@redcross.org', position: 'Uber Connect', status: 'available' },
  { id: 'p035', name: 'Margenia Hatfield', phone: '765-602-9133', email: 'Margenia.Hatfield@redcross.org', position: 'HQ Sourcing Manager', status: 'deployed' },
  { id: 'p036', name: 'Lee Meyer', phone: '719-749-5672', email: 'Lee.Meyer@redcross.org', position: 'HQ Transportation Manager', status: 'deployed' },
  { id: 'p037', name: 'Boo White', phone: '804-253-7276', email: 'Ellen.White@redcross.org', position: 'HQ Warehousing Manager', status: 'deployed' },
  { id: 'p038', name: 'Tom Batson', phone: '928-580-8850', email: 'Tom.Batson@redcross.org', position: 'Fulfillment MN', status: 'available' },
  { id: 'p039', name: 'John Ehresmann', phone: '507-581-0403', email: 'John.Ehresmann@redcross.org', position: 'DST Chief', status: 'deployed' },
  
  // Finance Section
  { id: 'p040', name: 'Mike Weaver', phone: '555-123-4567', email: 'Mike.Weaver@redcross.org', position: 'Finance Chief', status: 'available' },
  { id: 'p041', name: 'Sarah Johnson', phone: '555-234-5678', email: 'Sarah.Johnson@redcross.org', position: 'Budget Analyst', status: 'available' },
  
  // Additional Personnel (for selection)
  { id: 'p042', name: 'John Smith', phone: '555-345-6789', email: 'John.Smith@redcross.org', position: '', status: 'available' },
  { id: 'p043', name: 'Mary Davis', phone: '555-456-7890', email: 'Mary.Davis@redcross.org', position: '', status: 'available' },
  { id: 'p044', name: 'Robert Wilson', phone: '555-567-8901', email: 'Robert.Wilson@redcross.org', position: '', status: 'available' },
  { id: 'p045', name: 'Jennifer Brown', phone: '555-678-9012', email: 'Jennifer.Brown@redcross.org', position: '', status: 'available' },
];

/**
 * Position titles used in the organization
 */
export const POSITION_TITLES = [
  // Command
  'DRO Director',
  'DRO Director (OFF)',
  'RCCO',
  'Chief of Staff',
  'SEOC Principal',
  'EOL Chief',
  'Deputy EOL Chief',
  'CAP Liaison',
  'SAF Liaison',
  'DAT Liaison CFL',
  'DAT Liaison NFL',
  'DAT Liaison SFL',
  
  // 24 Hour Lines
  '24 Hour / Lodging',
  '24 Hour / Disaster Mental Health',
  '24 Hour / Staff Health (Illness and Injury)',
  '24 Hour / Staffing',
  '24 Hour / DHS (Client Health Needs)',
  '24 Hour / Transportation',
  '24 Hour / Fulfillment Line',
  'Tampa Shuttle',
  '24 Hour / DST Helpline',
  
  // Operations
  'AD Operations',
  'DAD Operations',
  'Zone Coordinator-Zone 1',
  'Zone Coordinator-Zone 2',
  'Zone Coordinator-Zone 3',
  'District Director - District A',
  'HQ Mass Care Chief',
  'HQ Sheltering Coordinator',
  'HQ Pet Liaison',
  'HQ Feeding Manager',
  'HQ DES Manager',
  'HQ Reunification MN',
  'HQ SRT MN',
  'Client Care Chief',
  'ICCT Manager',
  'DHS Manager',
  'DMH Manager',
  'DSC Manager',
  'DI Manager',
  'HQ WebEOC OPS Admin',
  'FROST',
  
  // Logistics
  'AD Logistics',
  'Uber Connect',
  'HQ Logistics Chief',
  'HQ Sourcing Manager',
  'HQ Facilities Manager',
  'HQ Transportation Manager',
  'HQ Warehousing Manager',
  'In-Kind-Donations Manager',
  'Fulfillment MN',
  'DST Chief',
  'National Fleet Operations (NFO)',
  
  // Finance
  'Finance Chief',
  'Budget Analyst',
  'Cost Unit Leader',
  'Procurement Unit Leader',
  
  // Planning
  'Planning Chief',
  'Resource Unit Leader',
  'Situation Unit Leader',
  'Documentation Unit Leader',
  'Demobilization Unit Leader',
];

/**
 * Get personnel by ID
 */
export function getPersonnelById(id: string): PersonnelMember | undefined {
  return PERSONNEL_DATABASE.find(p => p.id === id);
}

/**
 * Get available personnel (not deployed)
 */
export function getAvailablePersonnel(): PersonnelMember[] {
  return PERSONNEL_DATABASE.filter(p => p.status === 'available');
}

/**
 * Search personnel by name
 */
export function searchPersonnel(searchTerm: string): PersonnelMember[] {
  const term = searchTerm.toLowerCase();
  return PERSONNEL_DATABASE.filter(p => 
    p.name.toLowerCase().includes(term) ||
    p.email.toLowerCase().includes(term) ||
    p.phone.includes(term)
  );
}