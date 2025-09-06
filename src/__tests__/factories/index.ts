/**
 * TEST DATA FACTORIES - Disaster Operations Platform
 * 
 * These factories create realistic test data for the disaster operations platform.
 * They generate data that matches real-world disaster response scenarios
 * to ensure tests are meaningful and comprehensive.
 */

import { faker } from '@faker-js/faker';
import { 
  Operation, 
  DailyScheduleEntry, 
  Facility, 
  Personnel, 
  PersonnelAssignment,
  WorkAssignment,
  Gap 
} from '@/lib/services/MasterDataService';

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const generateId = (prefix: string = 'test'): string => {
  return `${prefix}-${Date.now()}-${faker.string.alphanumeric(6)}`;
};

export const createTimestamp = (): Date => {
  return new Date();
};

export const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// ============================================
// OPERATION FACTORY
// ============================================

export const operationFactory = {
  build: (overrides: Partial<Operation> = {}): Operation => ({
    id: generateId('op'),
    name: overrides.name || `${faker.word.adjective()} ${faker.word.noun()} Response`,
    type: overrides.type || randomChoice(['emergency', 'training', 'drill']),
    status: overrides.status || randomChoice(['planning', 'active', 'demobilizing', 'closed']),
    start_date: overrides.start_date || faker.date.recent(),
    end_date: overrides.end_date || faker.date.future(),
    incident_commander: overrides.incident_commander || faker.person.fullName(),
    dro_director: overrides.dro_director || faker.person.fullName(),
    geographic_scope: overrides.geographic_scope || {
      counties: [faker.location.county(), faker.location.county()],
      states: [faker.location.state()],
      coordinates: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude()
      }
    },
    created_at: overrides.created_at || createTimestamp(),
    updated_at: overrides.updated_at || createTimestamp(),
    created_by: overrides.created_by || faker.person.fullName(),
    metadata: overrides.metadata || {},
    ...overrides
  }),

  buildList: (count: number, overrides: Partial<Operation> = {}): Operation[] => 
    Array.from({ length: count }, () => operationFactory.build(overrides)),

  buildEmergencyOperation: (overrides: Partial<Operation> = {}): Operation => 
    operationFactory.build({
      type: 'emergency',
      status: 'active',
      name: `${randomChoice(['Hurricane', 'Tornado', 'Flood', 'Wildfire', 'Earthquake'])} ${faker.word.noun()} Response`,
      ...overrides
    }),

  buildTrainingOperation: (overrides: Partial<Operation> = {}): Operation => 
    operationFactory.build({
      type: 'training',
      status: 'planning',
      name: `${faker.date.month()} Training Exercise`,
      ...overrides
    })
};

// ============================================
// FACILITY FACTORY
// ============================================

export const facilityFactory = {
  build: (overrides: Partial<Facility> = {}): Facility => ({
    id: generateId('facility'),
    operation_id: overrides.operation_id || generateId('op'),
    facility_type: overrides.facility_type || randomChoice(['shelter', 'feeding', 'government', 'distribution', 'care', 'assessment']),
    name: overrides.name || `${faker.word.adjective()} ${faker.word.noun()} Center`,
    address: overrides.address || faker.location.streetAddress(),
    city: overrides.city || faker.location.city(),
    state: overrides.state || faker.location.state({ abbreviated: true }),
    zip_code: overrides.zip_code || faker.location.zipCode(),
    county: overrides.county || faker.location.county(),
    coordinates: overrides.coordinates || {
      lat: faker.location.latitude(),
      lng: faker.location.longitude()
    },
    status: overrides.status || randomChoice(['planned', 'open', 'closed', 'standby']),
    capacity: overrides.capacity || {
      maximum: faker.number.int({ min: 50, max: 500 }),
      current: faker.number.int({ min: 0, max: 400 }),
      available: faker.number.int({ min: 10, max: 200 })
    },
    contact_info: overrides.contact_info || {
      manager: faker.person.fullName(),
      phone: faker.phone.number(),
      email: faker.internet.email()
    },
    hours_operation: overrides.hours_operation || {
      open: '06:00',
      close: '22:00',
      is_24hr: faker.datatype.boolean()
    },
    special_notes: overrides.special_notes || faker.lorem.sentence(),
    amenities: overrides.amenities || faker.helpers.arrayElements([
      'WiFi', 'Parking', 'Wheelchair Accessible', 'Pet Friendly', 
      'Cafeteria', 'Medical Station', 'Laundry', 'Recreation Area'
    ], { min: 1, max: 5 }),
    accessibility_features: overrides.accessibility_features || faker.helpers.arrayElements([
      'Ramp Access', 'Elevator', 'Accessible Restrooms', 'Braille Signage',
      'Hearing Loop', 'Wide Doorways'
    ], { min: 0, max: 3 }),
    created_at: overrides.created_at || createTimestamp(),
    updated_at: overrides.updated_at || createTimestamp(),
    created_by: overrides.created_by || faker.person.fullName(),
    ...overrides
  }),

  buildList: (count: number, overrides: Partial<Facility> = {}): Facility[] =>
    Array.from({ length: count }, () => facilityFactory.build(overrides)),

  buildShelter: (overrides: Partial<Facility> = {}): Facility =>
    facilityFactory.build({
      facility_type: 'shelter',
      name: `${faker.word.adjective()} Emergency Shelter`,
      capacity: {
        maximum: faker.number.int({ min: 100, max: 300 }),
        current: faker.number.int({ min: 0, max: 250 }),
        available: faker.number.int({ min: 50, max: 200 })
      },
      amenities: ['WiFi', 'Parking', 'Wheelchair Accessible', 'Cafeteria', 'Medical Station'],
      ...overrides
    }),

  buildFeedingSite: (overrides: Partial<Facility> = {}): Facility =>
    facilityFactory.build({
      facility_type: 'feeding',
      name: `${faker.word.adjective()} Kitchen Unit`,
      capacity: {
        maximum: faker.number.int({ min: 500, max: 2000 }), // meals per day
        current: faker.number.int({ min: 0, max: 1500 }),
        available: faker.number.int({ min: 200, max: 1000 })
      },
      ...overrides
    }),

  buildEOC: (overrides: Partial<Facility> = {}): Facility =>
    facilityFactory.build({
      facility_type: 'government',
      name: `${faker.location.county()} Emergency Operations Center`,
      hours_operation: {
        open: '00:00',
        close: '23:59',
        is_24hr: true
      },
      amenities: ['WiFi', 'Parking', 'Wheelchair Accessible', 'Security', '24/7 Operations'],
      ...overrides
    })
};

// ============================================
// PERSONNEL FACTORY
// ============================================

export const personnelFactory = {
  build: (overrides: Partial<Personnel> = {}): Personnel => ({
    id: generateId('person'),
    operation_id: overrides.operation_id || generateId('op'),
    first_name: overrides.first_name || faker.person.firstName(),
    last_name: overrides.last_name || faker.person.lastName(),
    email: overrides.email || faker.internet.email(),
    phone: overrides.phone || faker.phone.number(),
    radio_call_sign: overrides.radio_call_sign || `${randomChoice(['OPS', 'LOG', 'PLAN', 'CMD'])}-${faker.number.int({ min: 1, max: 99 })}`,
    primary_position: overrides.primary_position || randomChoice([
      'Incident Commander', 'Operations Section Chief', 'Planning Section Chief',
      'Logistics Section Chief', 'Finance Section Chief', 'Safety Officer',
      'Shelter Manager', 'Feeding Manager', 'Volunteer Coordinator'
    ]),
    section: overrides.section || randomChoice(['command', 'operations', 'planning', 'logistics', 'finance']),
    certifications: overrides.certifications || faker.helpers.arrayElements([
      'CPR/AED', 'First Aid', 'ICS-100', 'ICS-200', 'ICS-300', 'ICS-400',
      'Shelter Operations', 'Mass Care', 'Emergency Communications'
    ], { min: 1, max: 4 }),
    availability: overrides.availability || {
      start_date: faker.date.recent(),
      end_date: faker.date.future(),
      hours_per_day: faker.number.int({ min: 8, max: 16 }),
      days_available: faker.helpers.arrayElements([
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ], { min: 3, max: 7 })
    },
    emergency_contact: overrides.emergency_contact || {
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      relationship: randomChoice(['Spouse', 'Parent', 'Sibling', 'Child', 'Friend'])
    },
    dietary_restrictions: overrides.dietary_restrictions || randomChoice([
      '', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Kosher', 'Halal', 'Diabetic'
    ]),
    medical_notes: overrides.medical_notes || (faker.datatype.boolean() ? faker.lorem.sentence() : ''),
    background_check_date: overrides.background_check_date || faker.date.past(),
    created_at: overrides.created_at || createTimestamp(),
    updated_at: overrides.updated_at || createTimestamp(),
    created_by: overrides.created_by || faker.person.fullName(),
    ...overrides
  }),

  buildList: (count: number, overrides: Partial<Personnel> = {}): Personnel[] =>
    Array.from({ length: count }, () => personnelFactory.build(overrides)),

  buildIncidentCommander: (overrides: Partial<Personnel> = {}): Personnel =>
    personnelFactory.build({
      primary_position: 'Incident Commander',
      section: 'command',
      certifications: ['ICS-100', 'ICS-200', 'ICS-300', 'ICS-400'],
      radio_call_sign: 'IC-1',
      ...overrides
    }),

  buildShelterManager: (overrides: Partial<Personnel> = {}): Personnel =>
    personnelFactory.build({
      primary_position: 'Shelter Manager',
      section: 'operations',
      certifications: ['Shelter Operations', 'Mass Care', 'CPR/AED', 'First Aid'],
      radio_call_sign: `SHELTER-${faker.number.int({ min: 1, max: 10 })}`,
      ...overrides
    })
};

// ============================================
// DAILY SCHEDULE FACTORY
// ============================================

export const dailyScheduleFactory = {
  build: (overrides: Partial<DailyScheduleEntry> = {}): DailyScheduleEntry => ({
    id: generateId('schedule'),
    operation_id: overrides.operation_id || generateId('op'),
    time: overrides.time || `${faker.number.int({ min: 6, max: 22 }).toString().padStart(2, '0')}:${randomChoice(['00', '15', '30', '45'])}`,
    event_name: overrides.event_name || randomChoice([
      'Morning Briefing', 'Situation Update', 'Resource Status Meeting',
      'Planning Meeting', 'Operational Period Briefing', 'Safety Briefing',
      'Volunteer Orientation', 'Facility Check-in', 'Communications Test'
    ]),
    location: overrides.location || randomChoice(['Command Post', 'Main Shelter', 'EOC', 'Field Office', 'TBD']),
    responsible_party: overrides.responsible_party || randomChoice([
      'Incident Commander', 'Operations Section Chief', 'Planning Section Chief',
      'Logistics Section Chief', 'All Staff', 'Section Chiefs'
    ]),
    notes: overrides.notes || (faker.datatype.boolean() ? faker.lorem.sentence() : ''),
    event_type: overrides.event_type || randomChoice(['briefing', 'operation', 'meeting', 'deadline']),
    priority: overrides.priority || faker.number.int({ min: 1, max: 5 }),
    status: overrides.status || randomChoice(['scheduled', 'in-progress', 'completed', 'cancelled']),
    created_at: overrides.created_at || createTimestamp(),
    updated_at: overrides.updated_at || createTimestamp(),
    created_by: overrides.created_by || faker.person.fullName(),
    ...overrides
  }),

  buildList: (count: number, overrides: Partial<DailyScheduleEntry> = {}): DailyScheduleEntry[] =>
    Array.from({ length: count }, () => dailyScheduleFactory.build(overrides)),

  buildDailySchedule: (operationId: string): DailyScheduleEntry[] => [
    dailyScheduleFactory.build({
      operation_id: operationId,
      time: '07:00',
      event_name: 'Morning Briefing',
      event_type: 'briefing',
      responsible_party: 'Incident Commander',
      priority: 1
    }),
    dailyScheduleFactory.build({
      operation_id: operationId,
      time: '09:00',
      event_name: 'Facility Status Check',
      event_type: 'operation',
      responsible_party: 'Operations Section Chief',
      priority: 2
    }),
    dailyScheduleFactory.build({
      operation_id: operationId,
      time: '12:00',
      event_name: 'Lunch Break',
      event_type: 'meeting',
      responsible_party: 'All Staff',
      priority: 3
    }),
    dailyScheduleFactory.build({
      operation_id: operationId,
      time: '15:00',
      event_name: 'Resource Status Meeting',
      event_type: 'meeting',
      responsible_party: 'Section Chiefs',
      priority: 2
    }),
    dailyScheduleFactory.build({
      operation_id: operationId,
      time: '19:00',
      event_name: 'Evening Briefing',
      event_type: 'briefing',
      responsible_party: 'Incident Commander',
      priority: 1
    })
  ]
};

// ============================================
// WORK ASSIGNMENT FACTORY
// ============================================

export const workAssignmentFactory = {
  build: (overrides: Partial<WorkAssignment> = {}): WorkAssignment => ({
    id: generateId('work'),
    operation_id: overrides.operation_id || generateId('op'),
    facility_id: overrides.facility_id || generateId('facility'),
    assignment_type: overrides.assignment_type || randomChoice(['shelter', 'feeding', 'government', 'assessment', 'distribution']),
    title: overrides.title || randomChoice([
      'Shelter Management', 'Feeding Coordination', 'Volunteer Supervision',
      'Resource Distribution', 'Damage Assessment', 'Client Services',
      'Security Coordination', 'Transportation Management'
    ]),
    description: overrides.description || faker.lorem.paragraph(),
    assigned_to: overrides.assigned_to || generateId('person'),
    priority: overrides.priority || randomChoice(['low', 'medium', 'high', 'critical']),
    status: overrides.status || randomChoice(['open', 'assigned', 'in-progress', 'completed', 'cancelled']),
    due_date: overrides.due_date || faker.date.future(),
    estimated_hours: overrides.estimated_hours || faker.number.int({ min: 4, max: 16 }),
    actual_hours: overrides.actual_hours || (faker.datatype.boolean() ? faker.number.int({ min: 3, max: 18 }) : undefined),
    skills_required: overrides.skills_required || faker.helpers.arrayElements([
      'Leadership', 'Customer Service', 'Physical Labor', 'Computer Skills',
      'Medical Training', 'Bilingual', 'CDL License', 'Radio Operations'
    ], { min: 1, max: 3 }),
    equipment_needed: overrides.equipment_needed || faker.helpers.arrayElements([
      'Radio', 'Laptop', 'Vehicle', 'Safety Vest', 'First Aid Kit',
      'Clipboard', 'Badge', 'Hard Hat'
    ], { min: 0, max: 4 }),
    safety_requirements: overrides.safety_requirements || faker.helpers.arrayElements([
      'Safety Briefing Required', 'PPE Required', 'Buddy System',
      'Check-in Every 2 Hours', 'Emergency Contact Required'
    ], { min: 1, max: 3 }),
    created_at: overrides.created_at || createTimestamp(),
    updated_at: overrides.updated_at || createTimestamp(),
    created_by: overrides.created_by || faker.person.fullName(),
    completed_at: overrides.completed_at,
    completed_by: overrides.completed_by,
    ...overrides
  }),

  buildList: (count: number, overrides: Partial<WorkAssignment> = {}): WorkAssignment[] =>
    Array.from({ length: count }, () => workAssignmentFactory.build(overrides))
};

// ============================================
// GAP ANALYSIS FACTORY
// ============================================

export const gapFactory = {
  build: (overrides: Partial<Gap> = {}): Gap => ({
    id: generateId('gap'),
    operation_id: overrides.operation_id || generateId('op'),
    facility_id: overrides.facility_id || generateId('facility'),
    gap_type: overrides.gap_type || randomChoice(['personnel', 'equipment', 'supplies', 'vehicles', 'space']),
    gap_category: overrides.gap_category || randomChoice([
      'Shelter Staff', 'Medical Personnel', 'Feeding Team', 'Volunteers',
      'Generators', 'Radios', 'Vehicles', 'Cots', 'Blankets', 'Food', 'Water'
    ]),
    quantity_needed: overrides.quantity_needed || faker.number.int({ min: 1, max: 50 }),
    quantity_available: overrides.quantity_available || faker.number.int({ min: 0, max: 40 }),
    quantity_requested: overrides.quantity_requested || faker.number.int({ min: 0, max: 30 }),
    priority: overrides.priority || randomChoice(['low', 'medium', 'high', 'critical']),
    status: overrides.status || randomChoice(['open', 'requested', 'filled', 'cancelled']),
    description: overrides.description || faker.lorem.sentence(),
    requirements: overrides.requirements || {
      qualifications: faker.helpers.arrayElements(['Certified', 'Experienced', 'Bilingual'], { min: 0, max: 3 }),
      timing: randomChoice(['Immediate', 'Within 24 hours', 'Within 48 hours', 'Next operational period'])
    },
    requested_date: overrides.requested_date || faker.date.recent(),
    needed_date: overrides.needed_date || faker.date.future(),
    filled_date: overrides.filled_date,
    notes: overrides.notes || (faker.datatype.boolean() ? faker.lorem.sentence() : ''),
    created_at: overrides.created_at || createTimestamp(),
    updated_at: overrides.updated_at || createTimestamp(),
    created_by: overrides.created_by || faker.person.fullName(),
    ...overrides
  }),

  buildList: (count: number, overrides: Partial<Gap> = {}): Gap[] =>
    Array.from({ length: count }, () => gapFactory.build(overrides)),

  buildCriticalGap: (overrides: Partial<Gap> = {}): Gap =>
    gapFactory.build({
      priority: 'critical',
      status: 'open',
      needed_date: faker.date.soon(),
      ...overrides
    }),

  buildPersonnelGap: (overrides: Partial<Gap> = {}): Gap =>
    gapFactory.build({
      gap_type: 'personnel',
      gap_category: randomChoice(['Shelter Staff', 'Medical Personnel', 'Volunteers', 'Supervisors']),
      quantity_needed: faker.number.int({ min: 2, max: 15 }),
      ...overrides
    })
};

// ============================================
// COMPLETE SCENARIO FACTORIES
// ============================================

export const scenarioFactory = {
  /**
   * Creates a complete hurricane response scenario
   */
  buildHurricaneResponse: (): {
    operation: Operation;
    facilities: Facility[];
    personnel: Personnel[];
    schedule: DailyScheduleEntry[];
    assignments: WorkAssignment[];
    gaps: Gap[];
  } => {
    const operation = operationFactory.buildEmergencyOperation({
      name: 'Hurricane Response 2025',
      type: 'emergency',
      status: 'active'
    });

    const facilities = [
      facilityFactory.buildShelter({ operation_id: operation.id }),
      facilityFactory.buildShelter({ operation_id: operation.id }),
      facilityFactory.buildFeedingSite({ operation_id: operation.id }),
      facilityFactory.buildEOC({ operation_id: operation.id })
    ];

    const personnel = [
      personnelFactory.buildIncidentCommander({ operation_id: operation.id }),
      personnelFactory.buildShelterManager({ operation_id: operation.id }),
      ...personnelFactory.buildList(8, { operation_id: operation.id })
    ];

    const schedule = dailyScheduleFactory.buildDailySchedule(operation.id);

    const assignments = facilities.flatMap(facility =>
      workAssignmentFactory.buildList(2, {
        operation_id: operation.id,
        facility_id: facility.id,
        assignment_type: facility.facility_type
      })
    );

    const gaps = [
      gapFactory.buildCriticalGap({
        operation_id: operation.id,
        facility_id: facilities[0].id,
        gap_type: 'personnel'
      }),
      ...gapFactory.buildList(3, { operation_id: operation.id })
    ];

    return { operation, facilities, personnel, schedule, assignments, gaps };
  },

  /**
   * Creates a training exercise scenario
   */
  buildTrainingExercise: (): {
    operation: Operation;
    facilities: Facility[];
    personnel: Personnel[];
    schedule: DailyScheduleEntry[];
  } => {
    const operation = operationFactory.buildTrainingOperation({
      name: 'Mass Care Training Exercise',
      status: 'planning'
    });

    const facilities = [
      facilityFactory.buildShelter({ operation_id: operation.id, status: 'planned' }),
      facilityFactory.buildFeedingSite({ operation_id: operation.id, status: 'planned' })
    ];

    const personnel = personnelFactory.buildList(5, { operation_id: operation.id });

    const schedule = [
      dailyScheduleFactory.build({
        operation_id: operation.id,
        time: '08:00',
        event_name: 'Exercise Briefing',
        event_type: 'briefing'
      }),
      dailyScheduleFactory.build({
        operation_id: operation.id,
        time: '09:00',
        event_name: 'Shelter Setup Exercise',
        event_type: 'operation'
      }),
      dailyScheduleFactory.build({
        operation_id: operation.id,
        time: '14:00',
        event_name: 'After Action Review',
        event_type: 'meeting'
      })
    ];

    return { operation, facilities, personnel, schedule };
  }
};

// ============================================
// BULK DATA GENERATION
// ============================================

export const bulkDataFactory = {
  generateLargeDataset: (operationId: string) => ({
    facilities: facilityFactory.buildList(50, { operation_id: operationId }),
    personnel: personnelFactory.buildList(100, { operation_id: operationId }),
    schedule: dailyScheduleFactory.buildList(25, { operation_id: operationId }),
    assignments: workAssignmentFactory.buildList(75, { operation_id: operationId }),
    gaps: gapFactory.buildList(20, { operation_id: operationId })
  }),

  generateStressTestDataset: (operationId: string) => ({
    facilities: facilityFactory.buildList(200, { operation_id: operationId }),
    personnel: personnelFactory.buildList(500, { operation_id: operationId }),
    schedule: dailyScheduleFactory.buildList(100, { operation_id: operationId }),
    assignments: workAssignmentFactory.buildList(300, { operation_id: operationId }),
    gaps: gapFactory.buildList(50, { operation_id: operationId })
  })
};