/**
 * Global Assignment Position (GAP) Codes
 * 6-character codes used by Red Cross for position tracking
 */

export interface GAPCode {
  code: string;
  title: string;
  category: 'Shelter' | 'Feeding' | 'Distribution' | 'Health Services' | 'Staff Services' | 'Logistics' | 'Management';
}

export const GAP_CODES: GAPCode[] = [
  // Shelter GAP Codes
  { code: 'SHLTMN', title: 'Shelter Manager', category: 'Shelter' },
  { code: 'SHLTLD', title: 'Shelter Lead', category: 'Shelter' },
  { code: 'SHLTWK', title: 'Shelter Worker', category: 'Shelter' },
  { code: 'SHLTNT', title: 'Shelter Night Manager', category: 'Shelter' },
  { code: 'SHLTDY', title: 'Shelter Day Manager', category: 'Shelter' },
  { code: 'SHLTRS', title: 'Shelter Registration Staff', category: 'Shelter' },
  { code: 'SHLTNR', title: 'Shelter Nurse', category: 'Shelter' },
  
  // Feeding GAP Codes  
  { code: 'FEEDMN', title: 'Feeding Manager', category: 'Feeding' },
  { code: 'FEEDLD', title: 'Feeding Lead', category: 'Feeding' },
  { code: 'FEEDCK', title: 'Cook', category: 'Feeding' },
  { code: 'FEEDSV', title: 'Food Server', category: 'Feeding' },
  { code: 'FEEDDR', title: 'ERV Driver', category: 'Feeding' },
  { code: 'FEEDWK', title: 'Kitchen Worker', category: 'Feeding' },
  { code: 'FEEDST', title: 'Feeding Site Manager', category: 'Feeding' },
  
  // Distribution GAP Codes
  { code: 'DISTMN', title: 'Distribution Manager', category: 'Distribution' },
  { code: 'DISTLD', title: 'Distribution Lead', category: 'Distribution' },
  { code: 'DISTWH', title: 'Warehouse Manager', category: 'Distribution' },
  { code: 'DISTDR', title: 'Distribution Driver', category: 'Distribution' },
  { code: 'DISTWK', title: 'Distribution Worker', category: 'Distribution' },
  { code: 'DISTLG', title: 'Distribution Logistics', category: 'Distribution' },
  
  // Health Services GAP Codes
  { code: 'HLTHLD', title: 'Health Services Lead', category: 'Health Services' },
  { code: 'HLTHNR', title: 'Nurse', category: 'Health Services' },
  { code: 'HLTHMD', title: 'Mental Health Worker', category: 'Health Services' },
  { code: 'HLTHSP', title: 'Spiritual Care', category: 'Health Services' },
  { code: 'HLTHPR', title: 'Health Services Provider', category: 'Health Services' },
  
  // Staff Services GAP Codes
  { code: 'STAFFM', title: 'Staff Services Manager', category: 'Staff Services' },
  { code: 'STAFFL', title: 'Staff Services Lead', category: 'Staff Services' },
  { code: 'STAFFW', title: 'Staff Wellness', category: 'Staff Services' },
  { code: 'STAFFH', title: 'Human Resources', category: 'Staff Services' },
  
  // Logistics GAP Codes
  { code: 'LOGSMN', title: 'Logistics Manager', category: 'Logistics' },
  { code: 'LOGSLD', title: 'Logistics Lead', category: 'Logistics' },
  { code: 'LOGSDR', title: 'Driver', category: 'Logistics' },
  { code: 'LOGSWH', title: 'Warehouse Staff', category: 'Logistics' },
  { code: 'LOGSIT', title: 'IT Support', category: 'Logistics' },
  { code: 'LOGSFL', title: 'Fleet Manager', category: 'Logistics' },
  
  // Management GAP Codes
  { code: 'MGMTDR', title: 'Disaster Relief Operation Director', category: 'Management' },
  { code: 'MGMTDD', title: 'Deputy Director', category: 'Management' },
  { code: 'MGMTIP', title: 'Information & Planning', category: 'Management' },
  { code: 'MGMTFN', title: 'Finance', category: 'Management' },
  { code: 'MGMTPA', title: 'Public Affairs', category: 'Management' },
  { code: 'MGMTLS', title: 'Liaison', category: 'Management' },
];

/**
 * Get GAP codes by category
 */
export function getGAPCodesByCategory(category: string): GAPCode[] {
  return GAP_CODES.filter(gap => gap.category === category);
}

/**
 * Search GAP codes by title or code
 */
export function searchGAPCodes(searchTerm: string): GAPCode[] {
  const term = searchTerm.toLowerCase();
  return GAP_CODES.filter(gap => 
    gap.code.toLowerCase().includes(term) || 
    gap.title.toLowerCase().includes(term)
  );
}