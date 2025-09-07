/**
 * PERMANENT GAP TEMPLATES LIBRARY
 * 
 * Comprehensive database of Red Cross gap templates and typical shortages
 * Extracted from V27_IAP_DATA and expanded with historical disaster patterns
 * 
 * These are permanent organizational templates that can be instantiated for operations
 */

export interface GapTemplate {
  id: string;
  gap_type: 'personnel' | 'asset' | 'supply' | 'space' | 'service' | 'capability';
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  typical_quantity_range: {
    min: number;
    max: number;
    unit: string;
  };
  priority_level: 'critical' | 'high' | 'medium' | 'low';
  disaster_types: string[];
  operational_impact: string;
  mitigation_strategies: string[];
  procurement_source?: string;
  lead_time_hours?: number;
  cost_estimate_range?: {
    min: number;
    max: number;
  };
  dependencies?: string[];
  created_at: string;
  updated_at: string;
}

export const GAP_TEMPLATES_LIBRARY: GapTemplate[] = [
  // PERSONNEL GAPS - SHELTERING
  {
    id: 'gap-shel-mn',
    gap_type: 'personnel',
    category: 'SHEL-MN',
    title: 'Shelter Manager',
    description: 'Certified Shelter Manager to oversee facility operations, client services, and safety protocols',
    typical_quantity_range: { min: 1, max: 2, unit: 'person' },
    priority_level: 'critical',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire', 'Winter Storm'],
    operational_impact: 'Cannot operate shelter without certified manager. Affects client safety and regulatory compliance.',
    mitigation_strategies: [
      'Cross-train additional personnel in shelter management',
      'Partner with local emergency management for backup managers',
      'Expedited certification for qualified candidates'
    ],
    procurement_source: 'Volunteer Services',
    lead_time_hours: 12,
    dependencies: ['Shelter facility secured', 'Basic supplies available'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-shel-sv',
    gap_type: 'personnel',
    category: 'SHEL-SV',
    title: 'Shelter Supervisor',
    description: 'Shelter Supervisor to assist manager with client services and facility coordination',
    typical_quantity_range: { min: 1, max: 3, unit: 'person' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire'],
    operational_impact: 'Reduced supervision capability, longer client wait times, potential safety oversight gaps',
    mitigation_strategies: [
      'Promote experienced Shelter Associates',
      'Request regional mutual aid',
      'Utilize local volunteer organizations'
    ],
    procurement_source: 'Volunteer Services',
    lead_time_hours: 8,
    dependencies: ['Shelter Manager in place'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-shel-sa',
    gap_type: 'personnel',
    category: 'SHEL-SA',
    title: 'Shelter Associate',
    description: 'Front-line shelter staff for client registration, services, and general facility support',
    typical_quantity_range: { min: 2, max: 12, unit: 'person' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire', 'Winter Storm'],
    operational_impact: 'Extended client wait times, reduced service quality, staff fatigue and burnout',
    mitigation_strategies: [
      'Recruit and train local volunteers',
      'Coordinate with community organizations',
      'Implement staggered shift schedules'
    ],
    procurement_source: 'Local Volunteer Recruitment',
    lead_time_hours: 4,
    dependencies: ['Basic shelter training completed'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-dhs-sv',
    gap_type: 'personnel',
    category: 'DHS-SV',
    title: 'Health Services Supervisor',
    description: 'Licensed healthcare professional to oversee medical needs and health protocols in shelter',
    typical_quantity_range: { min: 1, max: 2, unit: 'person' },
    priority_level: 'critical',
    disaster_types: ['Hurricane', 'Flood', 'Winter Storm', 'Wildfire'],
    operational_impact: 'Cannot accommodate clients with medical needs, potential liability issues, medication management gaps',
    mitigation_strategies: [
      'Partner with local health departments',
      'Coordinate with volunteer nurse organizations',
      'Establish relationships with nearby medical facilities'
    ],
    procurement_source: 'Health Services Department',
    lead_time_hours: 8,
    cost_estimate_range: { min: 200, max: 400 },
    dependencies: ['Medical supplies available', 'Health services protocols established'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-dmh-sa',
    gap_type: 'personnel',
    category: 'DMH-SA',
    title: 'Mental Health Associate',
    description: 'Mental health professional to provide psychological support and crisis intervention',
    typical_quantity_range: { min: 1, max: 3, unit: 'person' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Wildfire', 'Flood', 'Tornado', 'Mass Violence'],
    operational_impact: 'Unaddressed trauma and stress among clients, potential behavioral incidents, reduced recovery outcomes',
    mitigation_strategies: [
      'Partner with local mental health organizations',
      'Train existing staff in psychological first aid',
      'Coordinate with disaster mental health volunteers'
    ],
    procurement_source: 'Disaster Mental Health Services',
    lead_time_hours: 12,
    dependencies: ['Private counseling space available'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // PERSONNEL GAPS - FEEDING
  {
    id: 'gap-mc-mn',
    gap_type: 'personnel',
    category: 'MC-MN',
    title: 'Kitchen Manager',
    description: 'Certified Kitchen Manager to oversee food service operations and safety compliance',
    typical_quantity_range: { min: 1, max: 2, unit: 'person' },
    priority_level: 'critical',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire'],
    operational_impact: 'Cannot operate kitchen facility, no meal production capability, food safety violations',
    mitigation_strategies: [
      'Cross-train feeding supervisors',
      'Partner with commercial food service managers',
      'Expedited kitchen manager certification'
    ],
    procurement_source: 'Mass Care Services',
    lead_time_hours: 8,
    dependencies: ['Kitchen facility operational', 'Food supplies available'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-mc-sv',
    gap_type: 'personnel',
    category: 'MC-SV',
    title: 'Kitchen Supervisor',
    description: 'Food service supervisor to coordinate meal preparation and service teams',
    typical_quantity_range: { min: 1, max: 3, unit: 'person' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Flood', 'Tornado'],
    operational_impact: 'Reduced meal production capacity, quality control issues, inefficient kitchen operations',
    mitigation_strategies: [
      'Promote experienced food service workers',
      'Request mutual aid from other regions',
      'Partner with local restaurant managers'
    ],
    procurement_source: 'Mass Care Services',
    lead_time_hours: 6,
    dependencies: ['Kitchen Manager present'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-mc-sa',
    gap_type: 'personnel',
    category: 'MC-SA',
    title: 'Food Service Worker',
    description: 'Food preparation and service staff for kitchen and ERV operations',
    typical_quantity_range: { min: 4, max: 20, unit: 'person' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire'],
    operational_impact: 'Reduced meal production, longer service times, staff exhaustion, potential food safety issues',
    mitigation_strategies: [
      'Recruit local volunteers with food service experience',
      'Partner with restaurant and catering businesses',
      'Cross-train from other disciplines'
    ],
    procurement_source: 'Local Volunteer Recruitment',
    lead_time_hours: 4,
    dependencies: ['Food safety training completed'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-erv-tl',
    gap_type: 'personnel',
    category: 'ERV-TL',
    title: 'ERV Team Leader',
    description: 'Certified team leader for Emergency Response Vehicle mobile feeding operations',
    typical_quantity_range: { min: 1, max: 4, unit: 'person' },
    priority_level: 'critical',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire'],
    operational_impact: 'Cannot deploy ERV units, no mobile feeding capability, unreached client populations',
    mitigation_strategies: [
      'Cross-train shelter supervisors',
      'Fast-track ERV certification for qualified candidates',
      'Partner with experienced volunteer drivers'
    ],
    procurement_source: 'Mass Care Services',
    lead_time_hours: 8,
    cost_estimate_range: { min: 150, max: 300 },
    dependencies: ['ERV vehicle available', 'Commercial driving license'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // PERSONNEL GAPS - OPERATIONS SUPPORT
  {
    id: 'gap-gov-ln',
    gap_type: 'personnel',
    category: 'GOV-LN',
    title: 'Government Liaison',
    description: 'Experienced liaison to coordinate with local emergency management and government agencies',
    typical_quantity_range: { min: 1, max: 3, unit: 'person' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire', 'Winter Storm'],
    operational_impact: 'Poor coordination with local agencies, missed resources and opportunities, regulatory compliance issues',
    mitigation_strategies: [
      'Develop relationships with retired emergency managers',
      'Cross-train experienced operations personnel',
      'Coordinate with regional government liaisons'
    ],
    procurement_source: 'External Affairs',
    lead_time_hours: 12,
    dependencies: ['EOC access credentials', 'Government protocols training'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-da-mn',
    gap_type: 'personnel',
    category: 'DA-MN',
    title: 'Damage Assessment Manager',
    description: 'Certified manager to coordinate damage assessment operations and team deployment',
    typical_quantity_range: { min: 1, max: 2, unit: 'person' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Tornado', 'Flood', 'Wildfire', 'Earthquake'],
    operational_impact: 'Ineffective damage assessment, poor resource targeting, delayed recovery planning',
    mitigation_strategies: [
      'Cross-train from construction/engineering backgrounds',
      'Partner with local building inspection departments',
      'Expedited damage assessment certification'
    ],
    procurement_source: 'Operations',
    lead_time_hours: 16,
    dependencies: ['Assessment tablets and technology', 'Transportation vehicles'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-da-tm',
    gap_type: 'personnel',
    category: 'DA-TM',
    title: 'Damage Assessment Team Member',
    description: 'Field team members to conduct property damage assessments and data collection',
    typical_quantity_range: { min: 2, max: 8, unit: 'person' },
    priority_level: 'medium',
    disaster_types: ['Hurricane', 'Tornado', 'Flood', 'Wildfire'],
    operational_impact: 'Slower assessment progress, incomplete damage picture, delayed client assistance',
    mitigation_strategies: [
      'Recruit volunteers with construction experience',
      'Partner with local contractor associations',
      'Provide intensive training for motivated volunteers'
    ],
    procurement_source: 'Local Volunteer Recruitment',
    lead_time_hours: 8,
    dependencies: ['Safety equipment', 'Assessment training completed'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // ASSET GAPS - SHELTER EQUIPMENT
  {
    id: 'gap-cots-standard',
    gap_type: 'asset',
    category: 'Cots',
    title: 'Standard Shelter Cots',
    description: 'Folding cots needed for client sleeping accommodations in shelter facilities',
    typical_quantity_range: { min: 50, max: 500, unit: 'each' },
    priority_level: 'critical',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire', 'Winter Storm'],
    operational_impact: 'Cannot accommodate shelter clients, forced to turn away people in need, regulatory compliance issues',
    mitigation_strategies: [
      'Pre-position cots during disaster season',
      'Coordinate mutual aid agreements',
      'Partner with local suppliers for emergency procurement'
    ],
    procurement_source: 'National Procurement',
    lead_time_hours: 24,
    cost_estimate_range: { min: 4250, max: 42500 },
    dependencies: ['Shelter facility secured', 'Transportation for delivery'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-blankets',
    gap_type: 'asset',
    category: 'Blankets',
    title: 'Emergency Blankets',
    description: 'Warm blankets for shelter clients and emergency distribution',
    typical_quantity_range: { min: 100, max: 1000, unit: 'each' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Winter Storm', 'Flood', 'Wildfire'],
    operational_impact: 'Client discomfort, potential health issues, reduced shelter capacity in cold weather',
    mitigation_strategies: [
      'Maintain strategic blanket reserves',
      'Coordinate with partner organizations',
      'Local procurement from retailers'
    ],
    procurement_source: 'National Procurement',
    lead_time_hours: 12,
    cost_estimate_range: { min: 1200, max: 12000 },
    dependencies: ['Storage space available'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-comfort-kits',
    gap_type: 'asset',
    category: 'Comfort Kits',
    title: 'Client Comfort Kits',
    description: 'Personal hygiene kits containing toiletries and basic comfort items',
    typical_quantity_range: { min: 100, max: 500, unit: 'each' },
    priority_level: 'medium',
    disaster_types: ['Hurricane', 'Flood', 'Wildfire', 'Tornado'],
    operational_impact: 'Reduced client dignity and comfort, hygiene issues, extended shelter stays less tolerable',
    mitigation_strategies: [
      'Pre-assembled kits in disaster-prone areas',
      'Partner with local businesses for donations',
      'Bulk procurement of individual items'
    ],
    procurement_source: 'National Procurement',
    lead_time_hours: 8,
    cost_estimate_range: { min: 800, max: 4000 },
    dependencies: ['Distribution capability'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-ada-cots',
    gap_type: 'asset',
    category: 'ADA Cots',
    title: 'ADA Compliant Cots',
    description: 'Elevated cots meeting accessibility requirements for clients with mobility challenges',
    typical_quantity_range: { min: 5, max: 50, unit: 'each' },
    priority_level: 'critical',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire'],
    operational_impact: 'Cannot accommodate clients with disabilities, ADA compliance violations, potential lawsuits',
    mitigation_strategies: [
      'Pre-position ADA cots at major shelters',
      'Coordinate with disability service organizations',
      'Emergency procurement with expedited delivery'
    ],
    procurement_source: 'National Procurement',
    lead_time_hours: 48,
    cost_estimate_range: { min: 625, max: 6250 },
    dependencies: ['Accessible shelter space', 'Trained staff for setup'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // ASSET GAPS - FEEDING EQUIPMENT
  {
    id: 'gap-cambros',
    gap_type: 'asset',
    category: 'Cambros',
    title: 'Insulated Food Containers',
    description: 'Insulated containers for transporting and serving hot meals safely',
    typical_quantity_range: { min: 5, max: 30, unit: 'each' },
    priority_level: 'critical',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire'],
    operational_impact: 'Cannot serve hot meals, food safety violations, reduced meal quality and client satisfaction',
    mitigation_strategies: [
      'Maintain equipment reserves at regional kitchens',
      'Partner with commercial food service suppliers',
      'Emergency rental agreements'
    ],
    procurement_source: 'Food Service Equipment',
    lead_time_hours: 12,
    cost_estimate_range: { min: 1400, max: 8400 },
    dependencies: ['Kitchen facility operational', 'Transportation available'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-serving-tables',
    gap_type: 'asset',
    category: 'Serving Tables',
    title: 'Mobile Food Serving Tables',
    description: 'Portable tables for efficient meal service and food distribution',
    typical_quantity_range: { min: 2, max: 10, unit: 'each' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Flood', 'Tornado'],
    operational_impact: 'Inefficient meal service, longer client wait times, potential food safety issues',
    mitigation_strategies: [
      'Coordinate with partner organizations',
      'Local rental agreements',
      'Temporary solutions with standard tables'
    ],
    procurement_source: 'Food Service Equipment',
    lead_time_hours: 8,
    cost_estimate_range: { min: 500, max: 2500 },
    dependencies: ['Serving location secured'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-handwash-stations',
    gap_type: 'asset',
    category: 'Hand Wash Stations',
    title: 'Portable Hand Washing Stations',
    description: 'Self-contained hand washing units for food service health compliance',
    typical_quantity_range: { min: 2, max: 8, unit: 'each' },
    priority_level: 'critical',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire'],
    operational_impact: 'Health code violations, cannot operate food service, potential illness outbreaks',
    mitigation_strategies: [
      'Partner with portable sanitation companies',
      'Emergency rental agreements',
      'Temporary solutions with water containers'
    ],
    procurement_source: 'Health Equipment Vendor',
    lead_time_hours: 6,
    cost_estimate_range: { min: 900, max: 3600 },
    dependencies: ['Water supply available', 'Waste disposal arrangements'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // ASSET GAPS - TRANSPORTATION
  {
    id: 'gap-erv-vehicles',
    gap_type: 'asset',
    category: 'ERV',
    title: 'Emergency Response Vehicles',
    description: 'Mobile feeding vehicles for reaching underserved populations',
    typical_quantity_range: { min: 1, max: 6, unit: 'vehicle' },
    priority_level: 'critical',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire'],
    operational_impact: 'Cannot reach isolated client populations, reduced feeding capacity, limited operational flexibility',
    mitigation_strategies: [
      'Coordinate mutual aid from other regions',
      'Partner with local food service companies',
      'Retrofit available vehicles temporarily'
    ],
    procurement_source: 'Fleet Management',
    lead_time_hours: 24,
    cost_estimate_range: { min: 85000, max: 510000 },
    dependencies: ['Certified ERV drivers', 'Food supplies'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-box-trucks',
    gap_type: 'asset',
    category: 'Box Trucks',
    title: 'Distribution Box Trucks',
    description: 'Large capacity trucks for supply transportation and distribution operations',
    typical_quantity_range: { min: 1, max: 4, unit: 'vehicle' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Flood', 'Tornado'],
    operational_impact: 'Limited supply distribution capability, delayed deliveries, inefficient resource movement',
    mitigation_strategies: [
      'Partner with local trucking companies',
      'Rental truck agreements',
      'Coordinate with volunteer truck owners'
    ],
    procurement_source: 'Regional Fleet',
    lead_time_hours: 12,
    cost_estimate_range: { min: 45000, max: 180000 },
    dependencies: ['Commercial drivers licensed', 'Loading/unloading equipment'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // SUPPLY GAPS
  {
    id: 'gap-client-forms',
    gap_type: 'supply',
    category: 'Client Forms',
    title: 'Client Service Forms',
    description: 'Intake, assessment, and service documentation forms for client casework',
    typical_quantity_range: { min: 100, max: 1000, unit: 'sets' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire'],
    operational_impact: 'Cannot properly document client services, compliance issues, poor case management',
    mitigation_strategies: [
      'Digital forms on tablets as backup',
      'Emergency printing arrangements',
      'Simplified paper alternatives'
    ],
    procurement_source: 'Printing Services',
    lead_time_hours: 4,
    cost_estimate_range: { min: 200, max: 2000 },
    dependencies: ['Client service operations active'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // SPACE GAPS
  {
    id: 'gap-shelter-space',
    gap_type: 'space',
    category: 'Shelter Space',
    title: 'Emergency Shelter Facility Space',
    description: 'Physical facility space needed to accommodate displaced clients',
    typical_quantity_range: { min: 1000, max: 10000, unit: 'square feet' },
    priority_level: 'critical',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire', 'Winter Storm'],
    operational_impact: 'Cannot accommodate clients in need, forced to turn people away, overcrowding safety issues',
    mitigation_strategies: [
      'Pre-identify backup shelter locations',
      'Coordinate with school districts and faith organizations',
      'Emergency agreements with hotels/motels'
    ],
    procurement_source: 'Facilities Management',
    lead_time_hours: 8,
    dependencies: ['Facility safety inspection', 'Utilities available'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-kitchen-space',
    gap_type: 'space',
    category: 'Kitchen Space',
    title: 'Commercial Kitchen Facility Space',
    description: 'Commercial-grade kitchen space for large-scale meal preparation',
    typical_quantity_range: { min: 500, max: 2000, unit: 'square feet' },
    priority_level: 'critical',
    disaster_types: ['Hurricane', 'Flood', 'Tornado'],
    operational_impact: 'Cannot prepare meals at scale, limited feeding capacity, health code violations',
    mitigation_strategies: [
      'Partner with schools and churches with commercial kitchens',
      'Mobile kitchen trailer deployment',
      'Coordinate with restaurant partners'
    ],
    procurement_source: 'Facilities Management',
    lead_time_hours: 12,
    dependencies: ['Health department approval', 'Utilities functional'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // SERVICE GAPS
  {
    id: 'gap-mental-health',
    gap_type: 'service',
    category: 'Mental Health Services',
    title: 'Disaster Mental Health Services',
    description: 'Professional mental health support and crisis counseling services',
    typical_quantity_range: { min: 8, max: 40, unit: 'hours per day' },
    priority_level: 'high',
    disaster_types: ['Hurricane', 'Wildfire', 'Tornado', 'Mass Violence', 'Flood'],
    operational_impact: 'Unaddressed client trauma, behavioral incidents, reduced recovery outcomes',
    mitigation_strategies: [
      'Partner with local mental health organizations',
      'Train staff in psychological first aid',
      'Telehealth mental health services'
    ],
    procurement_source: 'Disaster Mental Health Services',
    lead_time_hours: 8,
    dependencies: ['Private counseling spaces', 'Trained mental health professionals'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'gap-translation',
    gap_type: 'service',
    category: 'Translation Services',
    title: 'Language Translation and Interpretation',
    description: 'Professional translation services for non-English speaking clients',
    typical_quantity_range: { min: 4, max: 16, unit: 'hours per day' },
    priority_level: 'medium',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Wildfire'],
    operational_impact: 'Cannot effectively serve non-English speakers, compliance issues, miscommunication risks',
    mitigation_strategies: [
      'Partner with local immigrant service organizations',
      'Use translation apps and technology',
      'Train bilingual volunteers'
    ],
    procurement_source: 'Translation Services',
    lead_time_hours: 6,
    dependencies: ['Identification of needed languages'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // CAPABILITY GAPS
  {
    id: 'gap-technology-support',
    gap_type: 'capability',
    category: 'Technology Support',
    title: 'IT and Technology Support Capability',
    description: 'Technical support for communications, databases, and operational technology',
    typical_quantity_range: { min: 1, max: 3, unit: 'person' },
    priority_level: 'medium',
    disaster_types: ['Hurricane', 'Flood', 'Tornado', 'Winter Storm'],
    operational_impact: 'Technology failures disrupt operations, poor communications, data loss risks',
    mitigation_strategies: [
      'Partner with local IT professionals',
      'Pre-arranged technical support contracts',
      'Cross-train staff in basic technology troubleshooting'
    ],
    procurement_source: 'Technology Services',
    lead_time_hours: 8,
    dependencies: ['Network connectivity', 'Equipment availability'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

/**
 * Helper functions for gap template management
 */
export const getGapTemplatesByType = (gapType: GapTemplate['gap_type']) => {
  return GAP_TEMPLATES_LIBRARY.filter(template => template.gap_type === gapType);
};

export const getGapTemplatesByCategory = (category: string) => {
  return GAP_TEMPLATES_LIBRARY.filter(template => template.category === category);
};

export const getGapTemplatesByPriority = (priority: GapTemplate['priority_level']) => {
  return GAP_TEMPLATES_LIBRARY.filter(template => template.priority_level === priority);
};

export const getGapTemplatesByDisasterType = (disasterType: string) => {
  return GAP_TEMPLATES_LIBRARY.filter(template => 
    template.disaster_types.includes(disasterType)
  );
};

export const getCriticalGapTemplates = () => {
  return GAP_TEMPLATES_LIBRARY.filter(template => template.priority_level === 'critical');
};

export const getGapTemplateById = (id: string) => {
  return GAP_TEMPLATES_LIBRARY.find(template => template.id === id);
};

/**
 * Gap categories organized by type
 */
export const GAP_CATEGORIES_BY_TYPE = {
  personnel: [
    'SHEL-MN', 'SHEL-SV', 'SHEL-SA', 'DHS-SV', 'DMH-SA',
    'MC-MN', 'MC-SV', 'MC-SA', 'ERV-TL',
    'GOV-LN', 'DA-MN', 'DA-TM', 'DIST-MN', 'IDC-MN'
  ],
  asset: [
    'Cots', 'ADA Cots', 'Blankets', 'Comfort Kits',
    'Cambros', 'Serving Tables', 'Hand Wash Stations',
    'ERV', 'Box Trucks', 'Tablets', 'Generators'
  ],
  supply: [
    'Client Forms', 'Food Supplies', 'Medical Supplies', 'Cleaning Supplies',
    'Office Supplies', 'Safety Equipment'
  ],
  space: [
    'Shelter Space', 'Kitchen Space', 'Office Space', 'Storage Space',
    'Meeting Space', 'Private Space'
  ],
  service: [
    'Mental Health Services', 'Translation Services', 'Medical Services',
    'Transportation Services', 'Childcare Services'
  ],
  capability: [
    'Technology Support', 'Training Capability', 'Management Capability',
    'Specialized Skills', 'Emergency Response'
  ]
} as const;

/**
 * Priority levels with descriptions
 */
export const PRIORITY_LEVELS = {
  critical: {
    level: 'critical',
    description: 'Operation cannot function safely or effectively without this resource',
    color: '#dc2626', // red-600
    urgency_hours: 4
  },
  high: {
    level: 'high', 
    description: 'Significantly impacts operation quality and client service',
    color: '#ea580c', // orange-600
    urgency_hours: 12
  },
  medium: {
    level: 'medium',
    description: 'Moderately affects efficiency and service delivery',
    color: '#d97706', // amber-600
    urgency_hours: 24
  },
  low: {
    level: 'low',
    description: 'Minor impact on operations, can be addressed as resources allow',
    color: '#65a30d', // lime-600
    urgency_hours: 72
  }
} as const;

/**
 * Main export - Gap Templates Database
 */
export const GAP_TEMPLATES: GapTemplate[] = [
  // Placeholder for now - Phase 4 will populate with full templates
  {
    id: 'gap-personnel-shelter-manager',
    gap_type: 'personnel',
    category: 'Shelter Operations',
    title: 'Shelter Manager',
    description: 'Certified shelter manager for facility operations',
    typical_quantity_range: { min: 1, max: 2, unit: 'person' },
    disaster_types: ['hurricane', 'flood', 'fire'],
    priority_level: 'critical',
    substitutable: false,
    skills_required: ['shelter_management', 'crowd_control'],
    typical_duration_hours: 12,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01')
  },
  {
    id: 'gap-supply-cots',
    gap_type: 'supply',
    category: 'Sleeping',
    title: 'Emergency Cots',
    description: 'Folding cots for shelter sleeping arrangements',
    typical_quantity_range: { min: 50, max: 200, unit: 'cots' },
    disaster_types: ['hurricane', 'flood', 'fire', 'tornado'],
    priority_level: 'high',
    substitutable: true,
    skills_required: [],
    typical_duration_hours: 168, // 1 week
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01')
  }
];

console.log(`✅ GAP_TEMPLATES database loaded: ${GAP_TEMPLATES.length} templates`);