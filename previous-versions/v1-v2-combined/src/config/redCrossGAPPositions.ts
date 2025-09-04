/**
 * Red Cross GAP (General Activity Position) Codes
 * 
 * Standard 2-letter/2-letter/2-letter position codes used in disaster response
 * Format: Division/Function/Level (e.g., DM/OP/SV = Disaster Manager/Operations/Supervisor)
 */

export interface GAPPosition {
  code: string;
  title: string;
  division: string;
  function: string;
  level: string;
  description?: string;
  requiredCertifications?: string[];
}

// Common Red Cross Divisions (First 2 letters)
export const RC_DIVISIONS = {
  'DM': 'Disaster Management',
  'DS': 'Disaster Services',
  'MC': 'Mass Care',
  'SH': 'Sheltering',
  'FD': 'Feeding',
  'HS': 'Health Services',
  'MH': 'Mental Health',
  'SP': 'Spiritual Care',
  'DH': 'Disaster Health',
  'CS': 'Client Services',
  'RC': 'Recovery',
  'LG': 'Logistics',
  'IT': 'Information Technology',
  'PA': 'Public Affairs',
  'GR': 'Government Relations',
  'VL': 'Volunteer',
  'HR': 'Human Resources',
  'FN': 'Finance',
  'FA': 'Fundraising',
  'WX': 'Weather',
  'EM': 'Emergency Management'
};

// Common Functions (Middle 2 letters)
export const RC_FUNCTIONS = {
  'OP': 'Operations',
  'PL': 'Planning',
  'LG': 'Logistics',
  'FN': 'Finance',
  'AD': 'Administration',
  'SV': 'Services',
  'SP': 'Specialist',
  'CO': 'Coordinator',
  'MG': 'Manager',
  'DR': 'Director',
  'AS': 'Assistant',
  'TL': 'Team Lead',
  'TC': 'Technician',
  'AN': 'Analyst',
  'OF': 'Officer',
  'SU': 'Support',
  'TR': 'Trainer',
  'IN': 'Instructor',
  'LD': 'Lead',
  'WK': 'Worker'
};

// Common Levels (Last 2 letters)
export const RC_LEVELS = {
  'CH': 'Chief',
  'DR': 'Director',
  'MG': 'Manager',
  'SV': 'Supervisor',
  'LD': 'Lead',
  'CO': 'Coordinator',
  'SR': 'Senior',
  'JR': 'Junior',
  'AS': 'Assistant',
  'SP': 'Specialist',
  'TM': 'Team Member',
  'VL': 'Volunteer',
  'ST': 'Staff',
  'TR': 'Trainee',
  'IN': 'Intern',
  '01': 'Level 1',
  '02': 'Level 2',
  '03': 'Level 3',
  '04': 'Level 4',
  '05': 'Level 5'
};

// Common GAP Positions in disaster response
export const COMMON_GAP_POSITIONS: GAPPosition[] = [
  // Disaster Management
  {
    code: 'DM/OP/CH',
    title: 'Disaster Operations Chief',
    division: 'Disaster Management',
    function: 'Operations',
    level: 'Chief',
    description: 'Overall operations leadership for disaster response'
  },
  {
    code: 'DM/PL/MG',
    title: 'Disaster Planning Manager',
    division: 'Disaster Management',
    function: 'Planning',
    level: 'Manager',
    description: 'Manages planning section and IAP development'
  },
  
  // Mass Care
  {
    code: 'MC/OP/SV',
    title: 'Mass Care Operations Supervisor',
    division: 'Mass Care',
    function: 'Operations',
    level: 'Supervisor',
    description: 'Supervises mass care service delivery'
  },
  {
    code: 'MC/CO/SP',
    title: 'Mass Care Coordinator Specialist',
    division: 'Mass Care',
    function: 'Coordinator',
    level: 'Specialist',
    description: 'Coordinates mass care resources and services'
  },
  
  // Sheltering
  {
    code: 'SH/OP/MG',
    title: 'Shelter Operations Manager',
    division: 'Sheltering',
    function: 'Operations',
    level: 'Manager',
    description: 'Manages individual shelter operations'
  },
  {
    code: 'SH/SV/LD',
    title: 'Shelter Services Lead',
    division: 'Sheltering',
    function: 'Services',
    level: 'Lead',
    description: 'Leads shelter support services'
  },
  {
    code: 'SH/SU/TM',
    title: 'Shelter Support Team Member',
    division: 'Sheltering',
    function: 'Support',
    level: 'Team Member',
    description: 'Provides direct shelter support'
  },
  
  // Feeding
  {
    code: 'FD/OP/SV',
    title: 'Feeding Operations Supervisor',
    division: 'Feeding',
    function: 'Operations',
    level: 'Supervisor',
    description: 'Supervises feeding operations and ERVs'
  },
  {
    code: 'FD/TL/LD',
    title: 'Feeding Team Lead',
    division: 'Feeding',
    function: 'Team Lead',
    level: 'Lead',
    description: 'Leads ERV or kitchen teams'
  },
  {
    code: 'FD/WK/VL',
    title: 'Feeding Worker Volunteer',
    division: 'Feeding',
    function: 'Worker',
    level: 'Volunteer',
    description: 'Food service volunteer'
  },
  
  // Health Services
  {
    code: 'HS/OP/MG',
    title: 'Health Services Operations Manager',
    division: 'Health Services',
    function: 'Operations',
    level: 'Manager',
    description: 'Manages health services operations'
  },
  {
    code: 'MH/SP/SR',
    title: 'Mental Health Specialist Senior',
    division: 'Mental Health',
    function: 'Specialist',
    level: 'Senior',
    description: 'Provides mental health support',
    requiredCertifications: ['Licensed Mental Health Professional']
  },
  {
    code: 'SP/SP/CO',
    title: 'Spiritual Care Specialist Coordinator',
    division: 'Spiritual Care',
    function: 'Specialist',
    level: 'Coordinator',
    description: 'Coordinates spiritual care services'
  },
  
  // Logistics
  {
    code: 'LG/OP/MG',
    title: 'Logistics Operations Manager',
    division: 'Logistics',
    function: 'Operations',
    level: 'Manager',
    description: 'Manages logistics and supply chain'
  },
  {
    code: 'LG/CO/SP',
    title: 'Logistics Coordinator Specialist',
    division: 'Logistics',
    function: 'Coordinator',
    level: 'Specialist',
    description: 'Coordinates resource distribution'
  },
  
  // Client Services
  {
    code: 'CS/SV/LD',
    title: 'Client Services Lead',
    division: 'Client Services',
    function: 'Services',
    level: 'Lead',
    description: 'Leads client casework teams'
  },
  {
    code: 'CS/WK/TM',
    title: 'Client Services Worker',
    division: 'Client Services',
    function: 'Worker',
    level: 'Team Member',
    description: 'Provides direct client assistance'
  }
];

// Function to parse a GAP code
export function parseGAPCode(code: string): {
  division: string;
  function: string;
  level: string;
} | null {
  const parts = code.split('/');
  if (parts.length !== 3) return null;
  
  return {
    division: RC_DIVISIONS[parts[0]] || parts[0],
    function: RC_FUNCTIONS[parts[1]] || parts[1],
    level: RC_LEVELS[parts[2]] || parts[2]
  };
}

// Function to generate GAP code from components
export function generateGAPCode(division: string, func: string, level: string): string {
  return `${division}/${func}/${level}`;
}

// Get all positions for a specific division
export function getPositionsByDivision(divisionCode: string): GAPPosition[] {
  return COMMON_GAP_POSITIONS.filter(pos => pos.code.startsWith(divisionCode));
}

// Get positions by level (e.g., all managers, all supervisors)
export function getPositionsByLevel(levelCode: string): GAPPosition[] {
  return COMMON_GAP_POSITIONS.filter(pos => pos.code.endsWith(levelCode));
}