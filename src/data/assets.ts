/**
 * Real Red Cross Assets used in disaster operations
 * Based on actual field equipment and resources
 */

export interface Asset {
  name: string;
  category: 'Shelter' | 'Feeding' | 'Distribution' | 'Health Services' | 'Logistics' | 'Technology';
  unit?: string;
}

export const ASSETS: Asset[] = [
  // Shelter Assets
  { name: 'Cots', category: 'Shelter', unit: 'each' },
  { name: 'Blankets', category: 'Shelter', unit: 'each' },
  { name: 'Comfort Kits', category: 'Shelter', unit: 'kits' },
  { name: 'Pillows', category: 'Shelter', unit: 'each' },
  { name: 'Towels', category: 'Shelter', unit: 'each' },
  { name: 'Hygiene Kits', category: 'Shelter', unit: 'kits' },
  { name: 'Baby Care Kits', category: 'Shelter', unit: 'kits' },
  { name: 'Cleaning Supplies', category: 'Shelter', unit: 'sets' },
  { name: 'Hand Sanitizer Stations', category: 'Shelter', unit: 'each' },
  { name: 'Signage', category: 'Shelter', unit: 'sets' },
  { name: 'Registration Tables', category: 'Shelter', unit: 'each' },
  { name: 'Chairs', category: 'Shelter', unit: 'each' },
  
  // Feeding Assets
  { name: 'ERV (Emergency Response Vehicle)', category: 'Feeding', unit: 'vehicles' },
  { name: 'Field Kitchen', category: 'Feeding', unit: 'units' },
  { name: 'Cambros (Food Containers)', category: 'Feeding', unit: 'each' },
  { name: 'Coolers', category: 'Feeding', unit: 'each' },
  { name: 'Ice', category: 'Feeding', unit: 'lbs' },
  { name: 'Paper Products', category: 'Feeding', unit: 'cases' },
  { name: 'Utensils', category: 'Feeding', unit: 'sets' },
  { name: 'Serving Tables', category: 'Feeding', unit: 'each' },
  { name: 'Hand Wash Stations', category: 'Feeding', unit: 'each' },
  { name: 'Generators', category: 'Feeding', unit: 'each' },
  { name: 'Refrigerated Truck', category: 'Feeding', unit: 'vehicles' },
  { name: 'Propane Tanks', category: 'Feeding', unit: 'each' },
  
  // Distribution Assets
  { name: 'Box Truck', category: 'Distribution', unit: 'vehicles' },
  { name: 'Forklift', category: 'Distribution', unit: 'each' },
  { name: 'Pallet Jack', category: 'Distribution', unit: 'each' },
  { name: 'Pallets', category: 'Distribution', unit: 'each' },
  { name: 'Warehouse Space', category: 'Distribution', unit: 'sq ft' },
  { name: 'Loading Dock', category: 'Distribution', unit: 'bays' },
  { name: 'Storage Containers', category: 'Distribution', unit: 'each' },
  { name: 'Tarps', category: 'Distribution', unit: 'each' },
  { name: 'Ratchet Straps', category: 'Distribution', unit: 'sets' },
  { name: 'Hand Trucks', category: 'Distribution', unit: 'each' },
  
  // Health Services Assets
  { name: 'First Aid Kits', category: 'Health Services', unit: 'kits' },
  { name: 'AED (Defibrillator)', category: 'Health Services', unit: 'each' },
  { name: 'Wheelchairs', category: 'Health Services', unit: 'each' },
  { name: 'Medical Cots', category: 'Health Services', unit: 'each' },
  { name: 'Oxygen Tanks', category: 'Health Services', unit: 'each' },
  { name: 'Blood Pressure Monitors', category: 'Health Services', unit: 'each' },
  { name: 'Thermometers', category: 'Health Services', unit: 'each' },
  { name: 'PPE (Personal Protective Equipment)', category: 'Health Services', unit: 'sets' },
  { name: 'Isolation Area Supplies', category: 'Health Services', unit: 'kits' },
  
  // Logistics Assets
  { name: 'Rental Cars', category: 'Logistics', unit: 'vehicles' },
  { name: 'Vans', category: 'Logistics', unit: 'vehicles' },
  { name: 'Fuel Cards', category: 'Logistics', unit: 'cards' },
  { name: 'Two-Way Radios', category: 'Logistics', unit: 'each' },
  { name: 'Traffic Cones', category: 'Logistics', unit: 'each' },
  { name: 'Safety Vests', category: 'Logistics', unit: 'each' },
  { name: 'Tool Kits', category: 'Logistics', unit: 'sets' },
  { name: 'Extension Cords', category: 'Logistics', unit: 'each' },
  { name: 'Work Lights', category: 'Logistics', unit: 'each' },
  
  // Technology Assets
  { name: 'Laptops', category: 'Technology', unit: 'each' },
  { name: 'Tablets', category: 'Technology', unit: 'each' },
  { name: 'Printers', category: 'Technology', unit: 'each' },
  { name: 'WiFi Hotspots', category: 'Technology', unit: 'each' },
  { name: 'Cell Phones', category: 'Technology', unit: 'each' },
  { name: 'Charging Stations', category: 'Technology', unit: 'each' },
  { name: 'Copier/Scanner', category: 'Technology', unit: 'each' },
  { name: 'Projector', category: 'Technology', unit: 'each' },
  { name: 'PA System', category: 'Technology', unit: 'sets' },
];

/**
 * Get assets by category
 */
export function getAssetsByCategory(category: string): Asset[] {
  return ASSETS.filter(asset => asset.category === category);
}

/**
 * Search assets by name
 */
export function searchAssets(searchTerm: string): Asset[] {
  const term = searchTerm.toLowerCase();
  return ASSETS.filter(asset => 
    asset.name.toLowerCase().includes(term)
  );
}