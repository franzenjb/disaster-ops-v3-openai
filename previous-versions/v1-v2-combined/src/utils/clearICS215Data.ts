/**
 * Utility to clear all ICS 215 data from localStorage
 */
export function clearICS215Data() {
  // Clear the grid storage
  localStorage.removeItem('ics-215-grid-storage');
  
  // Clear the standard form storage
  localStorage.removeItem('ics215-store');
  
  // Clear any legacy storage
  localStorage.removeItem('ics215-grid-data');
  
  console.log('ICS 215 data cleared');
}

// Auto-clear on first load if needed
export function ensureCleanStart() {
  const hasCleared = localStorage.getItem('ics215-cleared-v1');
  if (!hasCleared) {
    clearICS215Data();
    localStorage.setItem('ics215-cleared-v1', 'true');
  }
}
