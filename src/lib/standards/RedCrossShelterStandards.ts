/**
 * RED CROSS SHELTER STANDARDS CALCULATOR
 * 
 * Implements algorithms from 215 Infographics for:
 * - Shelter Standards and Short-term Measures
 * - Evacuation Shelter Workforce Minimums
 * - Basic Amenities Provided in Shelters
 * 
 * Based on official Red Cross operational standards
 */

export interface ShelterStandardsInput {
  expectedPopulation: number;
  shelterType: 'emergency_evacuation' | 'standard_short_term' | 'long_term';
  facilitySize: number; // square feet
}

export interface ShelterStandardsResult {
  // Personnel Requirements
  personnel: {
    supervisors: number;
    shelterSupport: number;
    eventBasedVolunteers: number;
    shelterResidents: number;
  };
  
  // Space and Capacity
  capacity: {
    maxOccupancy: number;
    spacePerPerson: number;
    isWithinStandards: boolean;
  };
  
  // Basic Amenities
  amenities: {
    cots: number;
    blankets: number;
    pillows: number;
    towels: number;
    comfortKits: number;
  };
  
  // Sanitation Requirements
  sanitation: {
    toilets: number;
    showers: number;
    handwashStations: number;
    trashContainers: number;
    laundryCapability?: boolean;
    sewageCapacity?: number; // gallons per day for long-term
  };
  
  // Service Requirements
  services: {
    medicalStaff: boolean;
    mentalHealthStaff: boolean;
    disasterSpiritualCareStaff: boolean;
    accessibleToilets: number;
    cellularPhones: number;
    laptopComputers: number;
  };
  
  // Compliance Checks
  compliance: {
    isCompliant: boolean;
    violations: string[];
    recommendations: string[];
  };
}

/**
 * Calculate comprehensive shelter standards based on Red Cross requirements
 */
export function calculateShelterStandards(input: ShelterStandardsInput): ShelterStandardsResult {
  const { expectedPopulation, shelterType, facilitySize } = input;
  
  // Personnel Requirements (from 215infographic11.png)
  const personnel = calculatePersonnelRequirements(expectedPopulation);
  
  // Space and Capacity Requirements
  const capacity = calculateCapacityRequirements(expectedPopulation, facilitySize);
  
  // Basic Amenities (from 215infographic12.png)
  const amenities = calculateAmenityRequirements(expectedPopulation, shelterType);
  
  // Sanitation Requirements (from 215infographic12.png)
  const sanitation = calculateSanitationRequirements(expectedPopulation, shelterType);
  
  // Service Requirements (from 215infographic1.png)
  const services = calculateServiceRequirements(expectedPopulation, capacity.maxOccupancy);
  
  // Compliance Checks
  const compliance = performComplianceCheck({
    expectedPopulation,
    shelterType,
    facilitySize,
    personnel,
    capacity,
    amenities,
    sanitation,
    services
  });

  return {
    personnel,
    capacity,
    amenities,
    sanitation,
    services,
    compliance
  };
}

/**
 * Calculate personnel requirements based on evacuation shelter workforce minimums
 * Source: 215infographic11.png - Evacuation Shelter Workforce Minimums (2020 Hurricane Evacuation Standards)
 */
function calculatePersonnelRequirements(population: number): ShelterStandardsResult['personnel'] {
  let supervisors = 2; // minimum
  let shelterSupport = 5; // minimum
  let eventBasedVolunteers = 4; // minimum
  let shelterResidents = 0; // as needed
  
  if (population >= 500) {
    supervisors = 2;
    shelterSupport = 5;
    eventBasedVolunteers = 4;
    shelterResidents = 0; // "As Needed"
  }
  
  if (population >= 1000) {
    supervisors = 4;
    shelterSupport = 10;
    eventBasedVolunteers = 8;
    shelterResidents = 0; // "As Needed"
  }
  
  if (population >= 2500) {
    supervisors = 10;
    shelterSupport = 25;
    eventBasedVolunteers = 16;
    shelterResidents = 0; // "As Needed"
  }

  return {
    supervisors,
    shelterSupport,
    eventBasedVolunteers,
    shelterResidents
  };
}

/**
 * Calculate space and capacity requirements
 */
function calculateCapacityRequirements(population: number, facilitySize: number): ShelterStandardsResult['capacity'] {
  // Standard space per person (40 sq ft per person is typical Red Cross standard)
  const spacePerPerson = 40;
  const maxOccupancy = Math.floor(facilitySize / spacePerPerson);
  const isWithinStandards = population <= maxOccupancy;

  return {
    maxOccupancy,
    spacePerPerson,
    isWithinStandards
  };
}

/**
 * Calculate amenity requirements based on shelter type
 * Source: 215infographic12.png - Basic Amenities Provided in Shelters
 */
function calculateAmenityRequirements(
  population: number, 
  shelterType: ShelterStandardsInput['shelterType']
): ShelterStandardsResult['amenities'] {
  let cots: number;
  let blankets: number;
  let pillows: number;
  let towels: number;
  let comfortKits: number;

  switch (shelterType) {
    case 'emergency_evacuation':
      cots = Math.floor(population * 0.10); // 10% of expected population
      blankets = population * 1; // 1 per person
      pillows = 0; // None
      towels = population * 1; // 1 towel per person
      comfortKits = population * 1; // 1 per person
      break;
      
    case 'standard_short_term':
      cots = population * 1; // 1 per person
      blankets = population * 2; // 2 per person
      pillows = 0; // None
      towels = Math.ceil(population * 2 * (7 / 7)); // 2 towels per person per week
      comfortKits = Math.ceil(population * 2 * (7 / 7)); // 2 per person per week
      break;
      
    case 'long_term':
      cots = population * 1; // 1 per person
      blankets = population * 2; // 2 per person
      pillows = population * 1; // 1 per person
      towels = Math.ceil(population * 2 * (7 / 7)); // 2 towels per person per week
      comfortKits = Math.ceil(population * 2 * (7 / 7)); // 2 per person per week
      break;
  }

  return {
    cots: Math.max(cots, 0),
    blankets: Math.max(blankets, 0),
    pillows: Math.max(pillows, 0),
    towels: Math.max(towels, 0),
    comfortKits: Math.max(comfortKits, 0)
  };
}

/**
 * Calculate sanitation requirements based on shelter type and DOJ accessibility standards
 * Source: 215infographic12.png - Basic Amenities Provided in Shelters
 */
function calculateSanitationRequirements(
  population: number,
  shelterType: ShelterStandardsInput['shelterType']
): ShelterStandardsResult['sanitation'] {
  let toilets: number;
  let showers: number;
  let handwashStations: number;
  let trashContainers: number;
  let laundryCapability: boolean | undefined;
  let sewageCapacity: number | undefined;

  switch (shelterType) {
    case 'emergency_evacuation':
      toilets = Math.ceil(population / 40); // 1 per 40 persons
      showers = Math.ceil(population / 72); // 1 per 72 persons
      handwashStations = Math.ceil(population / 20); // 1 per 20 persons
      trashContainers = Math.ceil(population / 10); // 1 30-gal container per 10 persons
      laundryCapability = undefined;
      sewageCapacity = undefined;
      break;
      
    case 'standard_short_term':
      toilets = Math.ceil(population / 40); // 1 per 40 persons
      showers = Math.ceil(population / 48); // 1 per 48 persons
      handwashStations = Math.ceil(population / 20); // 1 per 20 persons
      trashContainers = Math.ceil(population / 10); // 1 30-gal container per 10 persons
      laundryCapability = undefined;
      sewageCapacity = undefined;
      break;
      
    case 'long_term':
      toilets = Math.ceil(population / 20); // 1 per 20 persons
      showers = Math.ceil(population / 25); // 1 per 25 persons
      handwashStations = Math.ceil(population / 20); // 1 per 20 persons
      trashContainers = Math.ceil(population / 4); // 5 pounds of dry waste disposal capacity per person per day
      laundryCapability = true; // Capability to meet demands of 33% of shelter population
      sewageCapacity = population * 1.5; // 1.5 gallons of sewage disposal capacity per person per day
      break;
  }

  return {
    toilets: Math.max(toilets, 1),
    showers: Math.max(showers, 1),
    handwashStations: Math.max(handwashStations, 1),
    trashContainers: Math.max(trashContainers, 1),
    laundryCapability,
    sewageCapacity
  };
}

/**
 * Calculate service requirements based on shelter standards
 * Source: 215infographic1.png - Shelter Standards
 */
function calculateServiceRequirements(
  population: number,
  maxOccupancy: number
): ShelterStandardsResult['services'] {
  // Medical staff requirements
  const medicalStaff = population >= 200; // Required for facilities >= 200 clients
  
  // Mental health and spiritual care
  const mentalHealthStaff = population >= 100;
  const disasterSpiritualCareStaff = population >= 100;
  
  // Accessible toilets (16.7% of total toilets must be accessible)
  const totalToilets = Math.ceil(population / 40);
  const accessibleToilets = Math.ceil(totalToilets * 0.167);
  
  // Technology requirements
  const cellularPhones = Math.max(1, Math.floor(population / 100)); // Minimum 1 per facility
  const laptopComputers = Math.max(1, Math.floor(population / 200)); // Minimum 1 per facility

  return {
    medicalStaff,
    mentalHealthStaff,
    disasterSpiritualCareStaff,
    accessibleToilets: Math.max(accessibleToilets, 1),
    cellularPhones,
    laptopComputers
  };
}

/**
 * Perform comprehensive compliance check against Red Cross standards
 */
function performComplianceCheck(data: {
  expectedPopulation: number;
  shelterType: ShelterStandardsInput['shelterType'];
  facilitySize: number;
  personnel: ShelterStandardsResult['personnel'];
  capacity: ShelterStandardsResult['capacity'];
  amenities: ShelterStandardsResult['amenities'];
  sanitation: ShelterStandardsResult['sanitation'];
  services: ShelterStandardsResult['services'];
}): ShelterStandardsResult['compliance'] {
  const violations: string[] = [];
  const recommendations: string[] = [];

  // Space compliance
  if (!data.capacity.isWithinStandards) {
    violations.push(`Facility overcrowded: ${data.expectedPopulation} people in ${data.facilitySize} sq ft (${data.capacity.spacePerPerson} sq ft per person, need 40+ sq ft)`);
    recommendations.push('Secure additional shelter space or reduce client load');
  }

  // Personnel compliance - minimum staffing requirements
  if (data.personnel.supervisors < 2) {
    violations.push('Insufficient supervisory staff (minimum 2 required)');
    recommendations.push('Recruit additional certified shelter supervisors');
  }

  // Medical staff compliance
  if (data.expectedPopulation >= 200 && !data.services.medicalStaff) {
    violations.push('Medical staff required for shelters with 200+ clients');
    recommendations.push('Assign qualified health services staff');
  }

  // Sanitation compliance - DOJ standards
  const toiletRatio = data.expectedPopulation / data.sanitation.toilets;
  if (toiletRatio > 40) {
    violations.push(`Insufficient toilet facilities: 1 per ${Math.round(toiletRatio)} people (standard: 1 per 40)`);
    recommendations.push('Install additional portable toilet facilities');
  }

  // Accessibility compliance
  if (data.services.accessibleToilets < Math.ceil(data.sanitation.toilets * 0.167)) {
    violations.push('Insufficient accessible toilet facilities (minimum 16.7% must be ADA compliant)');
    recommendations.push('Install ADA-compliant toilet facilities');
  }

  // Amenities compliance
  if (data.amenities.cots < data.expectedPopulation && data.shelterType !== 'emergency_evacuation') {
    recommendations.push(`Need ${data.expectedPopulation - data.amenities.cots} additional cots for full capacity`);
  }

  const isCompliant = violations.length === 0;

  return {
    isCompliant,
    violations,
    recommendations
  };
}

/**
 * Helper function to get shelter type descriptions
 */
export function getShelterTypeDescription(shelterType: ShelterStandardsInput['shelterType']): string {
  switch (shelterType) {
    case 'emergency_evacuation':
      return 'Emergency/Evacuation Shelter - Short-term emergency housing during active threats';
    case 'standard_short_term':
      return 'Standard/Short-term Shelter - Temporary housing for displaced individuals (days to weeks)';
    case 'long_term':
      return 'Long-term Shelter - Extended housing for recovery period (weeks to months)';
  }
}

/**
 * Export standard ratios for reference
 */
export const SHELTER_RATIOS = {
  SPACE_PER_PERSON: 40, // sq ft
  TOILETS_PER_PERSON: {
    emergency: 40,
    standard: 40,
    longTerm: 20
  },
  SHOWERS_PER_PERSON: {
    emergency: 72,
    standard: 48,
    longTerm: 25
  },
  HANDWASH_STATIONS_PER_PERSON: 20,
  ACCESSIBLE_TOILETS_PERCENTAGE: 0.167, // 16.7%
  TRASH_CONTAINERS_PER_PERSON: 10 // 1 per 10 people
} as const;