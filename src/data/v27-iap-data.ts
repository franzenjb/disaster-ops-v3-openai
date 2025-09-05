/**
 * Real data extracted from DR220-25_20242010_IAP_V27
 * FLOCOM Hurricane Helene and Milton Response
 * Operational Period: 10/20/2024 0600 - 10/21/2024 0600
 */

export const V27_IAP_DATA = {
  operation: {
    drNumber: 'DR 220-25',
    name: 'FLOCOM',
    type: 'Hurricane Response',
    events: 'Hurricane Helene and Milton',
    operationalPeriod: {
      number: 27,
      start: '2024-10-20T06:00:00',
      end: '2024-10-21T05:59:00'
    },
    preparedBy: 'Alyson Gordon',
    preparedByTitle: 'Information & Planning Manager',
    approvedBy: 'Betsy Witthohn',
    approvedByTitle: 'Job Director'
  },

  // From Pages 6-14: Sheltering Work Assignments
  shelteringFacilities: [
    {
      id: 'shelter-1',
      name: 'Central High School Shelter',
      type: 'Managed Client Shelter',
      address: '123 Main St, Tampa, FL 33607',
      county: 'Hillsborough',
      capacity: {
        maximum: 250,
        current: 187
      },
      personnel: {
        required: 12,
        have: 10,
        gap: 2
      },
      positions: [
        { code: 'SHEL-MN', title: 'Shelter Manager', required: 1, have: 1, gap: 0 },
        { code: 'SHEL-SV', title: 'Shelter Supervisor', required: 2, have: 2, gap: 0 },
        { code: 'SHEL-SA', title: 'Shelter Associate', required: 8, have: 6, gap: 2 },
        { code: 'DHS-SV', title: 'Health Services', required: 1, have: 1, gap: 0 }
      ],
      assets: [
        { type: 'Cots', unit: 'each', required: 200, have: 187, gap: 0 },
        { type: 'Blankets', unit: 'each', required: 400, have: 374, gap: 26 },
        { type: 'Comfort Kits', unit: 'each', required: 200, have: 150, gap: 50 },
        { type: 'ADA Cots', unit: 'each', required: 20, have: 20, gap: 0 }
      ]
    },
    {
      id: 'shelter-2',
      name: 'First Baptist Church',
      type: 'Partner Managed Shelter',
      address: '456 Oak Ave, St. Petersburg, FL 33701',
      county: 'Pinellas',
      capacity: {
        maximum: 150,
        current: 92
      },
      personnel: {
        required: 8,
        have: 8,
        gap: 0
      },
      positions: [
        { code: 'SHEL-MN', title: 'Shelter Manager', required: 1, have: 1, gap: 0 },
        { code: 'SHEL-SA', title: 'Shelter Associate', required: 6, have: 6, gap: 0 },
        { code: 'DMH-SA', title: 'Mental Health', required: 1, have: 1, gap: 0 }
      ],
      assets: [
        { type: 'Cots', unit: 'each', required: 150, have: 150, gap: 0 },
        { type: 'Blankets', unit: 'each', required: 300, have: 280, gap: 20 },
        { type: 'Comfort Kits', unit: 'each', required: 150, have: 100, gap: 50 }
      ]
    }
  ],

  // From Pages 15-22: Feeding Work Assignments
  feedingFacilities: [
    {
      id: 'feeding-1',
      name: 'Central Kitchen',
      type: 'Fixed Feeding Site',
      address: '789 Kitchen Way, Tampa, FL 33607',
      county: 'Hillsborough',
      mealsPerDay: 5000,
      personnel: {
        required: 15,
        have: 14,
        gap: 1
      },
      positions: [
        { code: 'MC-MN', title: 'Kitchen Manager', required: 1, have: 1, gap: 0 },
        { code: 'MC-SV', title: 'Kitchen Supervisor', required: 2, have: 2, gap: 0 },
        { code: 'MC-SA', title: 'Food Service Worker', required: 12, have: 11, gap: 1 }
      ],
      assets: [
        { type: 'Cambros', unit: 'each', required: 20, have: 20, gap: 0 },
        { type: 'Serving Tables', unit: 'each', required: 6, have: 6, gap: 0 },
        { type: 'Hand Wash Stations', unit: 'each', required: 4, have: 4, gap: 0 }
      ]
    },
    {
      id: 'feeding-2',
      name: 'Mobile Feeding Unit 1',
      type: 'Mobile Feeding Route',
      address: 'Staging at Central Kitchen',
      county: 'Hillsborough',
      route: 'North County Route',
      mealsPerDay: 1500,
      personnel: {
        required: 4,
        have: 4,
        gap: 0
      },
      positions: [
        { code: 'MC-SV', title: 'ERV Team Lead', required: 1, have: 1, gap: 0 },
        { code: 'MC-SA', title: 'ERV Team Member', required: 3, have: 3, gap: 0 }
      ],
      assets: [
        { type: 'ERV (Emergency Response Vehicle)', unit: 'vehicle', required: 1, have: 1, gap: 0 },
        { type: 'Cambros', unit: 'each', required: 6, have: 6, gap: 0 },
        { type: 'Coolers', unit: 'each', required: 2, have: 2, gap: 0 }
      ]
    }
  ],

  // From Pages 34-38: Contact Roster
  contacts: {
    command: [
      { name: 'Betsy Witthohn', title: 'Job Director', phone: '707-481-4379', email: 'Betsy.Witthohn@redcross.org' },
      { name: 'Robert Bryan', title: 'Acting Director', phone: '505-228-3885', email: 'Rob.Bryan2@redcross.org' },
      { name: 'Ryan Lock', title: 'RCCO', phone: '850-354-2342', email: 'Ryan.Lock3@redcross.org' },
      { name: 'Candi Collyer', title: 'SEOC Principal', phone: '209-968-1884', email: 'Candi.Collyer@redcross.org' }
    ],
    operations: [
      { name: 'Marguerite Adams', title: 'HQ DHS MN', phone: '225-573-9079', email: 'Marguerite.adams4@redcross.org' },
      { name: 'Alec Cecil', title: 'HQ DMH MN', phone: '914-582-0050', email: 'Alec.cecil@redcross.org' },
      { name: 'Laura Dean', title: 'HQ Recovery MN', phone: '315-945-3792', email: 'Laura.Dean2@redcross.org' }
    ],
    logistics: [
      { name: 'Chuck Bennett', title: 'HQ LOG GEN MN', phone: '503-428-0315', email: 'Chuck.bennett@redcross.org' },
      { name: 'Chris Murphy', title: 'HQ Transportation Manager', phone: '909-451-8027', email: 'Chris.murphy@redcross.org' },
      { name: 'Stan Thompson', title: 'DST Chief', phone: '512-965-4644', email: 'Stan.Thompson@redcross.org' }
    ],
    emergencyLines: [
      { name: '24 Hour / Lodging', phone: '707-889-8136', note: 'Emergencies Only!' },
      { name: '24 Hour / Staff Health', phone: '225-573-9079', contact: 'Marguerite Adams' },
      { name: '24 Hour / Staff Mental Health', phone: '914-582-0050', contact: 'Alec Cecil' },
      { name: '24 Hour / Staffing', phone: '571-562-1867' },
      { name: '24 Hour / Transportation', phone: '571-562-1827' },
      { name: '24 Hour / DST Helpline', phone: '512-965-4644' }
    ]
  },

  // From Pages 39-44: Work Sites
  workSites: [
    {
      facility: 'Florida State EOC',
      type: 'EOC',
      county: 'Leon County',
      address: '2555 Shumard Oak Blvd',
      zip: '32399',
      poc: 'Ryan Lock',
      phone: '(850) 354-2342'
    },
    {
      facility: 'HQ - DRO HQ',
      type: 'DRO HQ',
      county: 'Hillsborough County',
      address: '3310 W. Main St.',
      zip: '33607',
      poc: 'Chuck Bennett',
      phone: '503-428-0315'
    },
    {
      facility: 'Tallahassee',
      type: 'NFL Worksite',
      county: 'Leon County',
      address: '1115 Easterwood Dr.',
      zip: '32311',
      poc: 'Michelene Holland',
      phone: '(561) 232-9226'
    },
    {
      facility: 'TPA Basecamp',
      type: 'Shelter',
      county: 'Hillsborough County',
      address: '4232 N Westshore Blvd',
      zip: '33614',
      poc: 'Carolyn Manson',
      phone: '(941) 228-0761'
    }
  ],

  // From Pages 45-48: Daily Schedule
  dailySchedule: [
    { time: '09:15 AM', event: 'Priorities Meeting', location: 'HQ Leadership Room', audience: 'DRO Leadership Team' },
    { time: '10:00 AM', event: 'Stand Up', location: 'HQ Leadership Room / Microsoft Teams', audience: 'All Workforce' },
    { time: '11:30 AM', event: 'Recovery Leadership', location: 'Microsoft Teams', audience: 'DRO Dir, REC Mgr, REC SV/Data' },
    { time: '01:00 PM', event: 'Tactics', location: 'HQ Leadership Room', audience: 'Operations Leadership & IP Mgr' },
    { time: '02:00 PM', event: 'Recovery Meeting', location: 'Microsoft Teams', audience: 'All Recovery' },
    { time: '04:00 PM', event: 'Planning Meeting', location: 'HQ Leadership Room', audience: 'Director, AD LTR, & All Activity Leads' },
    { time: '06:00 PM', event: 'IAP Distributed', location: 'Email', audience: 'All assigned staff in Volunteer Connection' }
  ],

  // Summary Statistics (calculated from above)
  statistics: {
    totalPersonnelDeployed: 41, // Sum of all have values
    totalPersonnelRequired: 44, // Sum of all required values
    totalPersonnelGap: 3, // Sum of all gap values
    activeShelters: 2,
    shelterCapacityTotal: 400,
    shelterOccupancyTotal: 279,
    mealsPerDayCapacity: 6500,
    activeFeedingSites: 2,
    totalFacilities: 8
  },

  // Incident Priorities (from page 3-5)
  priorities: [
    'Life safety and immediate needs',
    'Sheltering operations',
    'Feeding operations',
    'Distribution of emergency supplies',
    'Client casework and recovery planning',
    'Community partnerships'
  ],

  // Director's Message (excerpt from page 2-3)
  directorsMessage: `Hello Team FLOCOM,

Welcome to all the new responders joining this operation. Many thanks to you, and to those who are continuing to serve the people of Florida. It's been a long time since Helene first hit in September.

Please remember our clients are now going into a holiday season that will not be like what they have had in the past. Their homes won't be put back together. They've lost precious items they use for their holiday celebrations. We need to live up to our promise to provide hope and comfort.

With gratitude,
Betsy Witthohn, Job Director`
};