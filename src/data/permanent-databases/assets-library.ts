/**
 * PERMANENT ASSETS LIBRARY
 * 
 * Comprehensive database of Red Cross assets, equipment, and supplies
 * Extracted from V27_IAP_DATA and expanded with typical Red Cross inventory
 * 
 * These are permanent organizational assets that can be assigned to operations
 */

export interface AssetItem {
  id: string;
  category: 'vehicle' | 'equipment' | 'supply' | 'technology' | 'facility_asset';
  type: string;
  name: string;
  description: string;
  unit: string;
  availability_status: 'available' | 'deployed' | 'maintenance' | 'retired';
  location: string;
  cost_per_unit?: number;
  procurement_source?: string;
  specifications?: Record<string, any>;
  maintenance_schedule?: string;
  certifications_required?: string[];
  created_at: string;
  updated_at: string;
}

export const ASSETS_LIBRARY: AssetItem[] = [
  // VEHICLES - Emergency Response Vehicles
  {
    id: 'erv-001',
    category: 'vehicle',
    type: 'ERV',
    name: 'Emergency Response Vehicle - Type A',
    description: 'Standard Red Cross Emergency Response Vehicle with feeding capabilities',
    unit: 'vehicle',
    availability_status: 'available',
    location: 'Tampa Bay Area Chapter',
    cost_per_unit: 85000,
    procurement_source: 'Fleet Management',
    specifications: {
      capacity: '200 meals per run',
      fuel_type: 'gasoline',
      special_equipment: ['warming units', 'serving equipment', 'refrigeration']
    },
    maintenance_schedule: 'monthly',
    certifications_required: ['Commercial Driver License'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'erv-002',
    category: 'vehicle',
    type: 'ERV',
    name: 'Emergency Response Vehicle - Mobile Kitchen',
    description: 'Mobile kitchen unit for large-scale feeding operations',
    unit: 'vehicle',
    availability_status: 'available',
    location: 'Central Florida Region',
    cost_per_unit: 120000,
    procurement_source: 'National Fleet',
    specifications: {
      capacity: '1000+ meals per day',
      fuel_type: 'diesel',
      special_equipment: ['full kitchen', 'generator', 'water tanks']
    },
    maintenance_schedule: 'monthly',
    certifications_required: ['Commercial Driver License', 'Food Service Certification'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'box-truck-001',
    category: 'vehicle',
    type: 'Box Truck',
    name: 'Distribution Box Truck - 24ft',
    description: 'Large capacity truck for supply distribution and transportation',
    unit: 'vehicle',
    availability_status: 'deployed',
    location: 'Central Distribution Center',
    cost_per_unit: 45000,
    procurement_source: 'Regional Fleet',
    specifications: {
      capacity: '20,000 lbs',
      length: '24 feet',
      special_equipment: ['lift gate', 'tie-down points', 'climate control']
    },
    maintenance_schedule: 'monthly',
    certifications_required: ['Commercial Driver License'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'staff-van-001',
    category: 'vehicle',
    type: 'Staff Vehicle',
    name: 'Staff Transport Van - 15 Passenger',
    description: 'Personnel transportation vehicle for disaster operations',
    unit: 'vehicle',
    availability_status: 'available',
    location: 'Headquarters Motor Pool',
    cost_per_unit: 35000,
    procurement_source: 'Local Purchase',
    specifications: {
      capacity: '15 passengers',
      fuel_type: 'gasoline',
      special_equipment: ['first aid kit', 'communications radio']
    },
    maintenance_schedule: 'quarterly',
    certifications_required: ['Standard Driver License'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // SHELTER EQUIPMENT & SUPPLIES
  {
    id: 'cots-standard',
    category: 'supply',
    type: 'Cots',
    name: 'Standard Shelter Cots',
    description: 'Folding cots for shelter operations, standard size',
    unit: 'each',
    availability_status: 'available',
    location: 'Warehouse - Tampa',
    cost_per_unit: 85,
    procurement_source: 'National Procurement',
    specifications: {
      dimensions: '75" x 28" x 16"',
      weight_capacity: '350 lbs',
      material: 'steel frame with canvas'
    },
    maintenance_schedule: 'annual inspection',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cots-ada',
    category: 'supply',
    type: 'ADA Cots',
    name: 'ADA Compliant Cots',
    description: 'Elevated cots meeting ADA accessibility requirements',
    unit: 'each',
    availability_status: 'available',
    location: 'Warehouse - Tampa',
    cost_per_unit: 125,
    procurement_source: 'National Procurement',
    specifications: {
      height: '20 inches',
      dimensions: '78" x 32" x 20"',
      weight_capacity: '400 lbs',
      features: ['elevated height', 'stability rails']
    },
    maintenance_schedule: 'annual inspection',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'blankets-standard',
    category: 'supply',
    type: 'Blankets',
    name: 'Red Cross Emergency Blankets',
    description: 'Standard emergency blankets for shelter clients',
    unit: 'each',
    availability_status: 'available',
    location: 'Multiple Warehouses',
    cost_per_unit: 12,
    procurement_source: 'National Procurement',
    specifications: {
      material: 'wool blend',
      dimensions: '66" x 90"',
      color: 'gray with Red Cross logo'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'comfort-kits',
    category: 'supply',
    type: 'Comfort Kits',
    name: 'Client Comfort Kits',
    description: 'Personal hygiene and comfort items for shelter clients',
    unit: 'each',
    availability_status: 'available',
    location: 'Distribution Centers',
    cost_per_unit: 8,
    procurement_source: 'National Procurement',
    specifications: {
      contents: ['toothbrush', 'toothpaste', 'soap', 'shampoo', 'deodorant', 'comb'],
      packaging: 'clear plastic bag with Red Cross branding'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // FEEDING EQUIPMENT
  {
    id: 'cambros-insulated',
    category: 'equipment',
    type: 'Cambros',
    name: 'Insulated Food Transport Containers',
    description: 'Insulated containers for hot food transport and service',
    unit: 'each',
    availability_status: 'available',
    location: 'Central Kitchen',
    cost_per_unit: 280,
    procurement_source: 'Food Service Equipment',
    specifications: {
      capacity: '5 gallons',
      material: 'polyethylene with foam insulation',
      temperature_retention: '6+ hours'
    },
    maintenance_schedule: 'after each use',
    certifications_required: ['Food Safety Training'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'serving-tables',
    category: 'equipment',
    type: 'Serving Tables',
    name: 'Mobile Food Serving Tables',
    description: 'Portable tables for food service operations',
    unit: 'each',
    availability_status: 'available',
    location: 'Equipment Warehouse',
    cost_per_unit: 250,
    procurement_source: 'Food Service Equipment',
    specifications: {
      dimensions: '8ft x 30" x 34"',
      material: 'stainless steel top with folding legs',
      capacity: 'serves 200+ people per hour'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'handwash-stations',
    category: 'equipment',
    type: 'Hand Wash Stations',
    name: 'Portable Hand Washing Stations',
    description: 'Self-contained hand washing units for food service',
    unit: 'each',
    availability_status: 'available',
    location: 'Health Services Storage',
    cost_per_unit: 450,
    procurement_source: 'Health Equipment Vendor',
    specifications: {
      capacity: '5 gallon fresh water tank',
      features: ['foot pump operation', 'soap dispenser', 'paper towel holder'],
      compliance: 'health department approved'
    },
    maintenance_schedule: 'after each deployment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'coolers-transport',
    category: 'equipment',
    type: 'Coolers',
    name: 'Large Transport Coolers',
    description: 'Wheeled coolers for beverage and perishable transport',
    unit: 'each',
    availability_status: 'available',
    location: 'Mobile Feeding Storage',
    cost_per_unit: 180,
    procurement_source: 'Food Service Equipment',
    specifications: {
      capacity: '120 quart',
      features: ['wheels', 'drain plug', 'heavy-duty construction'],
      ice_retention: '5+ days'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // TECHNOLOGY & COMMUNICATIONS
  {
    id: 'tablets-field',
    category: 'technology',
    type: 'Tablets',
    name: 'Rugged Field Tablets',
    description: 'Ruggedized tablets for damage assessment and field operations',
    unit: 'each',
    availability_status: 'available',
    location: 'Technology Storage',
    cost_per_unit: 800,
    procurement_source: 'Technology Procurement',
    specifications: {
      model: 'Samsung Galaxy Tab Active Pro',
      features: ['waterproof', 'drop resistant', 'long battery life'],
      software: ['damage assessment app', 'Red Cross mobile tools']
    },
    maintenance_schedule: 'quarterly updates',
    certifications_required: ['Basic Technology Training'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'radio-handheld',
    category: 'technology',
    type: 'Communications Radio',
    name: 'Motorola Handheld Radios',
    description: 'Professional two-way radios for disaster communications',
    unit: 'each',
    availability_status: 'available',
    location: 'Communications Center',
    cost_per_unit: 450,
    procurement_source: 'Communications Vendor',
    specifications: {
      model: 'Motorola XPR 7550',
      frequency_range: 'UHF 450-527 MHz',
      features: ['GPS enabled', 'emergency button', 'encryption capable']
    },
    maintenance_schedule: 'semi-annual',
    certifications_required: ['Radio Operations Training'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'satellite-phone',
    category: 'technology',
    type: 'Satellite Phone',
    name: 'Iridium Satellite Phone',
    description: 'Global satellite communication device for remote operations',
    unit: 'each',
    availability_status: 'available',
    location: 'Emergency Communications Kit',
    cost_per_unit: 1200,
    procurement_source: 'Satellite Communications',
    specifications: {
      model: 'Iridium 9575 Extreme',
      coverage: 'global',
      features: ['GPS tracking', 'emergency SOS', 'weather resistant']
    },
    maintenance_schedule: 'annual',
    certifications_required: ['Satellite Communications Training'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // POWER & GENERATORS
  {
    id: 'generator-portable',
    category: 'equipment',
    type: 'Generator',
    name: 'Portable Gasoline Generator - 5500W',
    description: 'Portable generator for emergency power needs',
    unit: 'each',
    availability_status: 'available',
    location: 'Equipment Yard',
    cost_per_unit: 1200,
    procurement_source: 'Power Equipment Vendor',
    specifications: {
      power_output: '5500 watts',
      fuel_type: 'gasoline',
      run_time: '8 hours at 50% load',
      features: ['electric start', 'GFCI outlets', 'wheel kit']
    },
    maintenance_schedule: 'monthly',
    certifications_required: ['Generator Safety Training'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'generator-trailer',
    category: 'equipment',
    type: 'Trailer Generator',
    name: 'Towable Generator Trailer - 25KW',
    description: 'Large capacity generator on trailer for major operations',
    unit: 'each',
    availability_status: 'maintenance',
    location: 'Regional Equipment Depot',
    cost_per_unit: 35000,
    procurement_source: 'Heavy Equipment Vendor',
    specifications: {
      power_output: '25,000 watts',
      fuel_type: 'diesel',
      run_time: '24+ hours',
      features: ['auto-start', 'load bank tested', 'weather enclosure']
    },
    maintenance_schedule: 'monthly',
    certifications_required: ['Heavy Equipment Operation', 'Electrical Safety'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // OFFICE & ADMINISTRATIVE
  {
    id: 'workstations-mobile',
    category: 'equipment',
    type: 'Workstations',
    name: 'Mobile Office Workstations',
    description: 'Portable workstation setup for client services and administration',
    unit: 'each',
    availability_status: 'available',
    location: 'Office Equipment Storage',
    cost_per_unit: 350,
    procurement_source: 'Office Furniture',
    specifications: {
      components: ['folding table', 'ergonomic chair', 'privacy screen'],
      dimensions: '6ft x 3ft workspace',
      features: ['quick setup', 'cable management', 'storage compartments']
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'client-forms',
    category: 'supply',
    type: 'Client Forms',
    name: 'Client Intake and Service Forms',
    description: 'Complete set of forms for client services and case management',
    unit: 'sets',
    availability_status: 'available',
    location: 'Forms Storage',
    cost_per_unit: 2,
    procurement_source: 'Printing Services',
    specifications: {
      contents: ['intake forms', 'service request forms', 'referral forms', 'follow-up forms'],
      quantity_per_set: 25,
      language_versions: ['English', 'Spanish']
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // TRAILERS & MOBILE UNITS
  {
    id: 'trailer-supply',
    category: 'equipment',
    type: 'Supply Trailer',
    name: 'Emergency Supply Trailer - 24ft',
    description: 'Enclosed trailer for transporting emergency supplies and equipment',
    unit: 'each',
    availability_status: 'available',
    location: 'Transportation Yard',
    cost_per_unit: 18000,
    procurement_source: 'Trailer Dealer',
    specifications: {
      dimensions: '24ft x 8.5ft x 9ft',
      capacity: '10,000 lbs',
      features: ['ramp door', 'side access door', 'interior lighting', 'tie-down points']
    },
    maintenance_schedule: 'semi-annual',
    certifications_required: ['Trailer Towing Certification'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'trailer-kitchen',
    category: 'equipment',
    type: 'Mobile Kitchen',
    name: 'Mobile Kitchen Trailer',
    description: 'Self-contained mobile kitchen for large-scale feeding operations',
    unit: 'each',
    availability_status: 'deployed',
    location: 'Hurricane Milton Response',
    cost_per_unit: 75000,
    procurement_source: 'Commercial Kitchen Equipment',
    specifications: {
      capacity: '2000+ meals per day',
      features: ['full commercial kitchen', 'refrigeration', 'serving windows'],
      utilities: 'generator powered with water tanks'
    },
    maintenance_schedule: 'monthly',
    certifications_required: ['Commercial Kitchen Operations', 'Food Safety Certification'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // DISTRIBUTION & WAREHOUSE
  {
    id: 'pallets-standard',
    category: 'supply',
    type: 'Pallets',
    name: 'Standard Wooden Pallets',
    description: 'Standard 48x40 wooden pallets for warehouse and distribution operations',
    unit: 'each',
    availability_status: 'available',
    location: 'Distribution Centers',
    cost_per_unit: 15,
    procurement_source: 'Pallet Supplier',
    specifications: {
      dimensions: '48" x 40" x 6"',
      material: 'heat-treated hardwood',
      weight_capacity: '4600 lbs static, 2800 lbs dynamic'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'forklift-warehouse',
    category: 'equipment',
    type: 'Forklift',
    name: 'Electric Warehouse Forklift',
    description: 'Electric forklift for warehouse operations and supply handling',
    unit: 'each',
    availability_status: 'available',
    location: 'Central Warehouse',
    cost_per_unit: 22000,
    procurement_source: 'Material Handling Equipment',
    specifications: {
      lift_capacity: '5000 lbs',
      lift_height: '189 inches',
      power_source: '48V electric battery',
      features: ['side shift', 'cushion tires', 'operator restraint system']
    },
    maintenance_schedule: 'monthly',
    certifications_required: ['Forklift Operation Certification', 'Warehouse Safety Training'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // HEALTH & SAFETY EQUIPMENT
  {
    id: 'first-aid-kit-comprehensive',
    category: 'supply',
    type: 'First Aid Kit',
    name: 'Comprehensive First Aid Station',
    description: 'Large first aid kit for disaster operations and shelter health services',
    unit: 'each',
    availability_status: 'available',
    location: 'Health Services Storage',
    cost_per_unit: 180,
    procurement_source: 'Medical Supply Vendor',
    specifications: {
      contents: 'ANSI Class A+ compliant supplies',
      capacity: 'serves 100+ people',
      features: ['wall mountable case', 'inventory checklist', 'trauma supplies']
    },
    maintenance_schedule: 'quarterly inventory',
    certifications_required: ['First Aid/CPR Certification'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ppe-basic',
    category: 'supply',
    type: 'Personal Protective Equipment',
    name: 'Basic PPE Kit',
    description: 'Personal protective equipment for disaster response workers',
    unit: 'each',
    availability_status: 'available',
    location: 'Safety Equipment Storage',
    cost_per_unit: 25,
    procurement_source: 'Safety Supply Vendor',
    specifications: {
      contents: ['hard hat', 'safety glasses', 'work gloves', 'reflective vest'],
      compliance: 'OSHA standards',
      size_range: 'S-XL available'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * Helper functions for asset management
 */
export const getAssetsByCategory = (category: AssetItem['category']) => {
  return ASSETS_LIBRARY.filter(asset => asset.category === category);
};

export const getAssetsByType = (type: string) => {
  return ASSETS_LIBRARY.filter(asset => asset.type === type);
};

export const getAvailableAssets = () => {
  return ASSETS_LIBRARY.filter(asset => asset.availability_status === 'available');
};

export const getDeployedAssets = () => {
  return ASSETS_LIBRARY.filter(asset => asset.availability_status === 'deployed');
};

export const getAssetById = (id: string) => {
  return ASSETS_LIBRARY.find(asset => asset.id === id);
};

export const getAssetsByLocation = (location: string) => {
  return ASSETS_LIBRARY.filter(asset => asset.location.includes(location));
};

/**
 * Asset categories for UI filtering
 */
export const ASSET_CATEGORIES = {
  vehicle: 'Vehicles & Transportation',
  equipment: 'Equipment & Machinery',
  supply: 'Supplies & Materials',
  technology: 'Technology & Communications',
  facility_asset: 'Facility Assets'
} as const;

/**
 * Asset types organized by category
 */
export const ASSET_TYPES_BY_CATEGORY = {
  vehicle: ['ERV', 'Box Truck', 'Staff Vehicle', 'Mobile Kitchen'],
  equipment: ['Generator', 'Trailer Generator', 'Forklift', 'Workstations', 'Cambros', 'Serving Tables', 'Hand Wash Stations', 'Coolers', 'Supply Trailer', 'Mobile Kitchen'],
  supply: ['Cots', 'ADA Cots', 'Blankets', 'Comfort Kits', 'Client Forms', 'Pallets', 'First Aid Kit', 'Personal Protective Equipment'],
  technology: ['Tablets', 'Communications Radio', 'Satellite Phone'],
  facility_asset: ['Office Equipment', 'Kitchen Equipment', 'Shelter Equipment']
} as const;