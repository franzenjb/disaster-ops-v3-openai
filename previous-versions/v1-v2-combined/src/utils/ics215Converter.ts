/**
 * Converter between Grid Resources and Standard Form Work Assignments
 * 
 * Bridges the gap between the new resource-based system and the traditional ICS 215 format
 */

import { ICSResource, ServiceLineType } from '../types/ics-215-grid-types';
import { WorkAssignment, ResourceRequirement215, RedCrossDivision } from '../types/ics-215-types';

/**
 * Convert service line type to Red Cross Division
 */
function getRedCrossDivision(serviceLineType: ServiceLineType): RedCrossDivision {
  switch (serviceLineType) {
    case 'sheltering':
      return 'Sheltering_Dormitory_Operations';
    case 'kitchen':
    case 'mobile-feeding':
      return 'Feeding_Food_Services';
    case 'distribution':
      return 'Mass_Care_Distribution_Emergency_Supplies';
    case 'disaster-aid':
      return 'Individual_Disaster_Aid';
    case 'individual-care':
      return 'Individual_Disaster_Aid';
    default:
      return 'Mass_Care_Distribution_Emergency_Supplies';
  }
}

/**
 * Convert Grid Resources to Work Assignments for Standard Form
 */
export function resourcesToWorkAssignments(
  resources: Record<ServiceLineType, ICSResource[]>
): WorkAssignment[] {
  const assignments: WorkAssignment[] = [];
  let assignmentNumber = 1;

  // Process each service line
  Object.entries(resources).forEach(([serviceLineType, serviceLineResources]) => {
    serviceLineResources.forEach((resource) => {
      const assignment: WorkAssignment = {
        id: `assignment-${resource.id}`,
        worksheetId: 'current',
        assignmentNumber: assignmentNumber.toString(),
        divisionGroup: getRedCrossDivision(serviceLineType as ServiceLineType),
        workAssignmentName: resource.name || `${serviceLineType} Resource`,
        workLocation: resource.address || 'Location TBD',
        reportTime: new Date(),
        specialInstructions: resource.notes || '',
        resourceRequirements: [],
        status: resource.status === 'green' ? 'in_progress' : 
                resource.status === 'yellow' ? 'assigned' : 
                resource.status === 'red' ? 'not_started' : 'completed',
        progressPercentage: resource.status === 'green' ? 75 : 
                           resource.status === 'yellow' ? 50 : 
                           resource.status === 'red' ? 25 : 100,
        createdAt: resource.lastUpdated || new Date(),
        updatedAt: resource.lastUpdated || new Date()
      };

      // Add specific resource requirements based on type
      if (resource.type === 'shelter') {
        const shelterResource = resource as any;
        assignment.resourceRequirements.push({
          id: `resource-${resource.id}-1`,
          assignmentId: assignment.id,
          resourceKind: 'Facilities',
          resourceType: 'Emergency Shelter',
          numberOfPersons: 0,
          quantityRequested: shelterResource.capacity || 0,
          quantityHave: shelterResource.currentOccupancy || 0,
          quantityNeed: (shelterResource.capacity || 0) - (shelterResource.currentOccupancy || 0),
          status: 'available'
        });
        
        if (shelterResource.manager) {
          assignment.resourceRequirements.push({
            id: `resource-${resource.id}-2`,
            assignmentId: assignment.id,
            resourceKind: 'Personnel',
            resourceType: 'Shelter Manager',
            numberOfPersons: 1,
            quantityRequested: 1,
            quantityHave: 1,
            quantityNeed: 0,
            leader: shelterResource.manager,
            contactInfo: resource.phone || '',
            status: 'available'
          });
        }
      } else if (resource.type === 'kitchen') {
        const kitchenResource = resource as any;
        assignment.resourceRequirements.push({
          id: `resource-${resource.id}-1`,
          assignmentId: assignment.id,
          resourceKind: 'Facilities',
          resourceType: 'Kitchen/Feeding Site',
          numberOfPersons: 0,
          quantityRequested: kitchenResource.mealsCapacity || 0,
          quantityHave: kitchenResource.mealsServed || 0,
          quantityNeed: (kitchenResource.mealsCapacity || 0) - (kitchenResource.mealsServed || 0),
          status: 'available'
        });
      } else if (resource.type === 'mobile-feeding') {
        const ervResource = resource as any;
        assignment.resourceRequirements.push({
          id: `resource-${resource.id}-1`,
          assignmentId: assignment.id,
          resourceKind: 'Vehicles',
          resourceType: 'Emergency Response Vehicle (ERV)',
          numberOfPersons: ervResource.crewSize || 2,
          quantityRequested: 1,
          quantityHave: 1,
          quantityNeed: 0,
          leader: resource.primaryContact || '',
          contactInfo: resource.phone || '',
          status: 'available'
        });
      } else if (resource.type === 'distribution') {
        assignment.resourceRequirements.push({
          id: `resource-${resource.id}-1`,
          assignmentId: assignment.id,
          resourceKind: 'Facilities',
          resourceType: 'Distribution Site',
          numberOfPersons: 0,
          quantityRequested: 1,
          quantityHave: 1,
          quantityNeed: 0,
          status: 'available'
        });
      }

      // Add default personnel requirement if none exists
      if (assignment.resourceRequirements.length === 0) {
        assignment.resourceRequirements.push({
          id: `resource-${resource.id}-1`,
          assignmentId: assignment.id,
          resourceKind: 'Personnel',
          resourceType: 'Staff',
          numberOfPersons: 1,
          quantityRequested: 1,
          quantityHave: 1,
          quantityNeed: 0,
          status: 'available'
        });
      }

      assignments.push(assignment);
      assignmentNumber++;
    });
  });

  return assignments;
}

/**
 * Convert Work Assignments back to Grid Resources
 * (For when edits are made in the Standard Form)
 */
export function workAssignmentsToResources(
  assignments: WorkAssignment[]
): Partial<Record<ServiceLineType, ICSResource[]>> {
  const resources: Partial<Record<ServiceLineType, ICSResource[]>> = {};

  assignments.forEach((assignment) => {
    // Determine service line type from division
    let serviceLineType: ServiceLineType;
    switch (assignment.divisionGroup) {
      case 'Sheltering_Dormitory_Operations':
        serviceLineType = 'sheltering';
        break;
      case 'Feeding_Food_Services':
        // Could be kitchen or mobile-feeding, check the resource type
        const hasERV = assignment.resourceRequirements.some(r => 
          r.resourceType?.toLowerCase().includes('erv') || 
          r.resourceType?.toLowerCase().includes('vehicle')
        );
        serviceLineType = hasERV ? 'mobile-feeding' : 'kitchen';
        break;
      case 'Mass_Care_Distribution_Emergency_Supplies':
        serviceLineType = 'distribution';
        break;
      case 'Individual_Disaster_Aid':
        serviceLineType = 'disaster-aid';
        break;
      default:
        serviceLineType = 'distribution';
    }

    // Initialize array if needed
    if (!resources[serviceLineType]) {
      resources[serviceLineType] = [];
    }

    // Create base resource
    const resource: any = {
      id: assignment.id.replace('assignment-', ''),
      name: assignment.workAssignmentName,
      address: assignment.workLocation,
      status: assignment.status === 'in_progress' ? 'green' :
              assignment.status === 'assigned' ? 'yellow' :
              assignment.status === 'not_started' ? 'red' : 'gray',
      notes: assignment.specialInstructions,
      lastUpdated: assignment.updatedAt || new Date(),
      dailyData: {}
    };

    // Set type-specific properties
    if (serviceLineType === 'sheltering') {
      resource.type = 'shelter';
      const capacityReq = assignment.resourceRequirements.find(r => 
        r.resourceType === 'Emergency Shelter'
      );
      if (capacityReq) {
        resource.capacity = capacityReq.quantityRequested;
        resource.currentOccupancy = capacityReq.quantityHave;
      }
      const managerReq = assignment.resourceRequirements.find(r => 
        r.resourceType === 'Shelter Manager'
      );
      if (managerReq) {
        resource.manager = managerReq.leader;
        resource.phone = managerReq.contactInfo;
      }
    } else if (serviceLineType === 'kitchen') {
      resource.type = 'kitchen';
      const mealsReq = assignment.resourceRequirements.find(r => 
        r.resourceType === 'Kitchen/Feeding Site'
      );
      if (mealsReq) {
        resource.mealsCapacity = mealsReq.quantityRequested;
        resource.mealsServed = mealsReq.quantityHave;
      }
      resource.mealType = 'all';
    } else if (serviceLineType === 'mobile-feeding') {
      resource.type = 'mobile-feeding';
      const ervReq = assignment.resourceRequirements.find(r => 
        r.resourceType?.includes('ERV')
      );
      if (ervReq) {
        resource.crewSize = ervReq.numberOfPersons || 2;
        resource.primaryContact = ervReq.leader;
        resource.phone = ervReq.contactInfo;
      }
      resource.vehicleNumber = `ERV-${assignment.assignmentNumber}`;
    } else if (serviceLineType === 'distribution') {
      resource.type = 'distribution';
      resource.distributionType = 'bulk';
    } else {
      resource.type = serviceLineType as any;
    }

    resources[serviceLineType]!.push(resource);
  });

  return resources;
}