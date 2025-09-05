/**
 * IAP Projector - Generates 53-Page IAP Documents from Event Streams
 * 
 * This projector builds complete IAP documents by processing facility events,
 * personnel assignments, work assignments, and content updates into the
 * professional 53-page format that matches Red Cross standards.
 */

import { Event, EventType } from '../events/types';
import { 
  EnhancedIAPDocument, 
  IAPFacility, 
  WorkSitesTable,
  ContactRoster,
  DailySchedule,
  IncidentPriorities,
  ActionTracker,
  IAPSnapshot,
  FacilityType,
  ServiceLine
} from '../../types';

export class IAPProjector {
  private facilities: Map<string, IAPFacility> = new Map();
  private iapDocuments: Map<string, EnhancedIAPDocument> = new Map();
  private snapshots: Map<string, IAPSnapshot> = new Map();

  /**
   * Process events to build IAP projections
   */
  async processEvent(event: Event): Promise<void> {
    switch (event.type) {
      case EventType.IAP_CREATED:
        await this.handleIAPCreated(event);
        break;
      case EventType.FACILITY_CREATED:
        await this.handleFacilityCreated(event);
        break;
      case EventType.FACILITY_UPDATED:
        await this.handleFacilityUpdated(event);
        break;
      case EventType.FACILITY_PERSONNEL_ASSIGNED:
        await this.handleFacilityPersonnelAssigned(event);
        break;
      case EventType.WORK_ASSIGNMENT_CREATED:
        await this.handleWorkAssignmentCreated(event);
        break;
      case EventType.DIRECTORS_MESSAGE_UPDATED:
        await this.handleDirectorsMessageUpdated(event);
        break;
      case EventType.CONTACT_ROSTER_UPDATED:
        await this.handleContactRosterUpdated(event);
        break;
      case EventType.DAILY_SCHEDULE_UPDATED:
        await this.handleDailyScheduleUpdated(event);
        break;
      case EventType.PRIORITIES_UPDATED:
        await this.handlePrioritiesUpdated(event);
        break;
      case EventType.PHOTO_ATTACHED:
        await this.handlePhotoAttached(event);
        break;
      case EventType.IAP_SNAPSHOT_CREATED:
        await this.handleSnapshotCreated(event);
        break;
      case EventType.IAP_OFFICIAL_SNAPSHOT:
        await this.handleOfficialSnapshot(event);
        break;
    }
  }

  /**
   * Get current IAP document state
   */
  getIAPDocument(iapId: string): EnhancedIAPDocument | null {
    return this.iapDocuments.get(iapId) || null;
  }

  /**
   * Get all facilities for an operation
   */
  getFacilitiesForOperation(operationId: string): IAPFacility[] {
    return Array.from(this.facilities.values())
      .filter(facility => facility.operationId === operationId);
  }

  /**
   * Generate Work Sites Table from facilities
   */
  generateWorkSitesTable(operationId: string): WorkSitesTable {
    const facilities = this.getFacilitiesForOperation(operationId);
    
    const sites = facilities.map(facility => ({
      id: facility.id,
      county: facility.county,
      type: facility.facilityType,
      facilityName: facility.name,
      address: `${facility.address}, ${facility.city}, ${facility.state} ${facility.zip}`,
      contact: facility.contact.primaryName,
      phone: facility.contact.primaryPhone,
      status: facility.status,
      personnel: facility.personnel.length,
      capacity: facility.capacity.totalCapacity
    }));

    // Count sites by type
    const sitesByType: { [key in FacilityType]?: number } = {};
    facilities.forEach(facility => {
      sitesByType[facility.facilityType] = (sitesByType[facility.facilityType] || 0) + 1;
    });

    // Count sites by county
    const sitesByCounty: { [county: string]: number } = {};
    facilities.forEach(facility => {
      sitesByCounty[facility.county] = (sitesByCounty[facility.county] || 0) + 1;
    });

    return {
      sites,
      totalSites: facilities.length,
      sitesByType,
      sitesByCounty
    };
  }

  /**
   * Generate Contact Roster from personnel assignments
   */
  generateContactRoster(operationId: string): ContactRoster {
    const facilities = this.getFacilitiesForOperation(operationId);
    const allPersonnel = facilities.flatMap(f => f.personnel);

    // Group by ICS sections
    const commandStructure = allPersonnel
      .filter(p => p.section === 'command')
      .map(p => ({
        position: p.position,
        name: `${p.contactInfo.phone}`, // Will be populated from person data
        phone: p.contactInfo.phone || '',
        email: p.contactInfo.email || '',
        alternatePhone: p.contactInfo.emergencyPhone,
        section: 'command' as const,
        isLiveLink: true
      }));

    const operationsSection = allPersonnel
      .filter(p => p.section === 'operations')
      .map(p => ({
        position: p.position,
        name: `Person-${p.personId}`, // Will be populated from person data
        phone: p.contactInfo.phone || '',
        email: p.contactInfo.email || '',
        alternatePhone: p.contactInfo.emergencyPhone,
        section: p.section,
        isLiveLink: true
      }));

    // Similar for other sections...
    return {
      commandStructure,
      operationsSection,
      planningSection: [],
      logisticsSection: [],
      financeSection: [],
      externalRelations: [],
      twentyFourHourLines: []
    };
  }

  /**
   * Generate Service Line Summary
   */
  generateServiceLineSummary(operationId: string) {
    const facilities = this.getFacilitiesForOperation(operationId);
    const serviceLineMap = new Map<ServiceLine, {
      facilitiesCount: number;
      totalPersonnel: number;
      totalCapacity: number;
      currentOccupancy: number;
    }>();

    facilities.forEach(facility => {
      facility.serviceLines.forEach(serviceLine => {
        if (!serviceLineMap.has(serviceLine)) {
          serviceLineMap.set(serviceLine, {
            facilitiesCount: 0,
            totalPersonnel: 0,
            totalCapacity: 0,
            currentOccupancy: 0
          });
        }

        const summary = serviceLineMap.get(serviceLine)!;
        summary.facilitiesCount++;
        summary.totalPersonnel += facility.personnel.length;
        summary.totalCapacity += facility.capacity.totalCapacity || 0;
        summary.currentOccupancy += facility.capacity.currentOccupancy || 0;
      });
    });

    return Array.from(serviceLineMap.entries()).map(([serviceLine, data]) => ({
      serviceLine,
      ...data,
      utilizationRate: data.totalCapacity > 0 ? 
        (data.currentOccupancy / data.totalCapacity) * 100 : 0,
      status: 'operational' as const
    }));
  }

  /**
   * Create official 6PM snapshot
   */
  async createOfficialSnapshot(iapId: string, generatedBy: string): Promise<IAPSnapshot> {
    const iapDocument = this.iapDocuments.get(iapId);
    if (!iapDocument) {
      throw new Error(`IAP document ${iapId} not found`);
    }

    const snapshot: IAPSnapshot = {
      id: crypto.randomUUID(),
      iapId,
      versionId: iapDocument.version.toString(),
      snapshotTime: new Date(),
      snapshotType: 'official_6pm',
      data: { ...iapDocument }, // Deep copy
      generatedBy,
      isLocked: true,
      distributionList: []
    };

    this.snapshots.set(snapshot.id, snapshot);
    return snapshot;
  }

  /**
   * Check if user has access to facility based on IAP role
   */
  checkFacilityAccess(userId: string, userIAPRole: string, facilityId: string): boolean {
    switch (userIAPRole) {
      case 'ip_group':
        return true; // I&P Group has access to everything
      case 'discipline':
        // Check if user is assigned to this facility
        const facility = this.facilities.get(facilityId);
        return facility?.personnel.some(p => p.personId === userId) || false;
      case 'field':
        // Read-only access to assigned facilities
        const fieldFacility = this.facilities.get(facilityId);
        return fieldFacility?.personnel.some(p => p.personId === userId) || false;
      default:
        return false;
    }
  }

  // Event handlers
  private async handleIAPCreated(event: Event): Promise<void> {
    const payload = event.payload;
    const iapId = event.id;

    const iapDocument: EnhancedIAPDocument = {
      id: iapId,
      operationId: event.operationId!,
      iapNumber: payload.iapNumber,
      operationalPeriod: {
        start: new Date(payload.operationalPeriodStart),
        end: new Date(payload.operationalPeriodEnd)
      },
      status: 'draft',
      createdAt: new Date(event.timestamp),
      createdBy: event.actorId,
      version: 1,
      sections: {
        coverPage: {
          operationName: '',
          operationNumber: '',
          iapNumber: payload.iapNumber,
          operationalPeriodStart: new Date(payload.operationalPeriodStart),
          operationalPeriodEnd: new Date(payload.operationalPeriodEnd),
          preparedBy: payload.preparedBy,
          approvedBy: '',
          distributionList: []
        },
        incidentObjectives: {
          objectives: [],
          priorities: [],
          preparedBy: payload.preparedBy,
          dateTime: new Date(event.timestamp)
        },
        organizationChart: {
          incidentCommander: '',
          sections: {
            operations: { chief: '' },
            planning: { chief: '' },
            logistics: { chief: '' },
            finance: { chief: '' }
          }
        },
        assignmentList: {
          operationsSectionChief: '',
          resources: [],
          workAssignments: [],
          preparedBy: payload.preparedBy,
          dateTime: new Date(event.timestamp)
        },
        communicationsPlan: {
          operationalPeriod: {
            start: new Date(payload.operationalPeriodStart),
            end: new Date(payload.operationalPeriodEnd)
          },
          basicRadioChannel: [],
          telephoneNumbers: [],
          preparedBy: payload.preparedBy,
          dateTime: new Date(event.timestamp)
        },
        medicalPlan: {
          medicalAidStations: [],
          ambulanceServices: [],
          hospitals: [],
          emergencyProcedures: '',
          preparedBy: payload.preparedBy,
          dateTime: new Date(event.timestamp)
        },
        operationalPlanning: {
          objectives: [],
          commandEmphasis: [],
          generalSituationalAwareness: '',
          meetings: [],
          attachments: [],
          preparedBy: payload.preparedBy,
          dateTime: new Date(event.timestamp)
        }
      },
      // Enhanced IAP fields
      facilityData: {
        facilities: [],
        totalPersonnel: 0,
        totalCapacity: 0,
        currentOccupancy: 0,
        serviceLinesSummary: [],
        geographicDistribution: []
      },
      workSitesTable: {
        sites: [],
        totalSites: 0,
        sitesByType: {},
        sitesByCounty: {}
      },
      dailySchedule: {
        meetings: [],
        briefings: [],
        deadlines: [],
        specialEvents: []
      },
      contactRoster: {
        commandStructure: [],
        operationsSection: [],
        planningSection: [],
        logisticsSection: [],
        financeSection: [],
        externalRelations: [],
        twentyFourHourLines: []
      },
      organizationChart: {
        incidentCommander: '',
        sections: {
          operations: { chief: '' },
          planning: { chief: '' },
          logistics: { chief: '' },
          finance: { chief: '' }
        },
        liveLinks: true,
        photoUrls: {},
        contactMethods: {},
        reportingStructure: [],
        vacantPositions: []
      },
      directorsMessage: {
        html: '',
        plainText: '',
        lastEditedBy: payload.preparedBy,
        lastEditedAt: new Date(event.timestamp)
      },
      generalMessages: [],
      incidentPriorities: {
        lifeSafety: [],
        incidentStabilization: [],
        propertyConservation: [],
        customPriorities: []
      },
      previousPeriodStatus: {
        completedObjectives: [],
        carryForwardItems: [],
        performanceMetrics: [],
        lessonsLearned: []
      },
      actionTracker: {
        openActions: [],
        completedActions: [],
        overdueActions: [],
        upcomingDeadlines: []
      },
      photoAttachments: [],
      ancillaryContent: [],
      versionHistory: [{
        id: crypto.randomUUID(),
        versionNumber: 1,
        createdAt: new Date(event.timestamp),
        createdBy: event.actorId,
        changes: [{
          section: 'document',
          changeType: 'added',
          description: 'IAP document created'
        }],
        isOfficial: false
      }]
    };

    this.iapDocuments.set(iapId, iapDocument);
  }

  private async handleFacilityCreated(event: Event): Promise<void> {
    const payload = event.payload;
    const facilityId = event.id;

    const facility: IAPFacility = {
      id: facilityId,
      operationId: event.operationId!,
      facilityType: payload.facilityType,
      name: payload.name,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
      county: payload.county,
      contact: {
        primaryName: payload.primaryContact,
        primaryPhone: payload.primaryPhone
      },
      capacity: {
        totalCapacity: 0,
        currentOccupancy: 0,
        availableSpace: 0
      },
      personnel: [],
      resources: [],
      status: 'planning',
      workAssignments: [],
      serviceLines: payload.serviceLines,
      operationalPeriod: {
        start: new Date(event.timestamp),
        end: new Date(event.timestamp + 24 * 60 * 60 * 1000) // 24 hours from creation
      },
      createdAt: new Date(event.timestamp),
      updatedAt: new Date(event.timestamp),
      updatedBy: event.actorId
    };

    this.facilities.set(facilityId, facility);

    // Update any IAP documents for this operation
    this.updateIAPDocumentsForOperation(event.operationId!);
  }

  private async handleFacilityPersonnelAssigned(event: Event): Promise<void> {
    const payload = event.payload;
    const facility = this.facilities.get(payload.facilityId);
    
    if (facility) {
      facility.personnel.push({
        id: crypto.randomUUID(),
        personId: payload.personId,
        position: payload.position,
        section: payload.section,
        startTime: new Date(payload.startTime),
        contactInfo: { phone: '', email: '' }, // Will be populated from person data
        certifications: [],
        isLeader: payload.isLeader,
        reportingTo: payload.reportingTo
      });

      facility.updatedAt = new Date(event.timestamp);
      facility.updatedBy = event.actorId;

      this.updateIAPDocumentsForOperation(facility.operationId);
    }
  }

  private async handleDirectorsMessageUpdated(event: Event): Promise<void> {
    const payload = event.payload;
    const iapDocument = this.iapDocuments.get(payload.iapId);
    
    if (iapDocument) {
      iapDocument.directorsMessage = {
        html: payload.content.html,
        plainText: payload.content.plainText,
        lastEditedBy: payload.lastEditedBy,
        lastEditedAt: new Date(event.timestamp)
      };

      this.incrementIAPVersion(iapDocument, event, 'directors_message', 'Director\'s message updated');
    }
  }

  private async handleSnapshotCreated(event: Event): Promise<void> {
    const payload = event.payload;
    const iapDocument = this.iapDocuments.get(payload.iapId);
    
    if (iapDocument) {
      const snapshot: IAPSnapshot = {
        id: event.id,
        iapId: payload.iapId,
        versionId: payload.versionId,
        snapshotTime: new Date(event.timestamp),
        snapshotType: payload.snapshotType,
        data: { ...iapDocument },
        generatedBy: event.actorId,
        isLocked: payload.isLocked,
        distributionList: payload.distributionList || []
      };

      this.snapshots.set(snapshot.id, snapshot);
    }
  }

  private async handleOfficialSnapshot(event: Event): Promise<void> {
    // Handle official 6PM snapshot creation
    await this.handleSnapshotCreated(event);
    
    const payload = event.payload;
    const iapDocument = this.iapDocuments.get(payload.iapId);
    
    if (iapDocument) {
      iapDocument.officialSnapshot = this.snapshots.get(event.id);
    }
  }

  // Placeholder handlers for other events
  private async handleFacilityUpdated(event: Event): Promise<void> {
    // Implementation for facility updates
  }

  private async handleWorkAssignmentCreated(event: Event): Promise<void> {
    // Implementation for work assignment creation
  }

  private async handleContactRosterUpdated(event: Event): Promise<void> {
    // Implementation for contact roster updates
  }

  private async handleDailyScheduleUpdated(event: Event): Promise<void> {
    // Implementation for daily schedule updates
  }

  private async handlePrioritiesUpdated(event: Event): Promise<void> {
    // Implementation for priorities updates
  }

  private async handlePhotoAttached(event: Event): Promise<void> {
    // Implementation for photo attachments
  }

  private updateIAPDocumentsForOperation(operationId: string): void {
    // Update all IAP documents for this operation with latest facility data
    for (const [iapId, iapDocument] of this.iapDocuments) {
      if (iapDocument.operationId === operationId) {
        // Regenerate facility-dependent sections
        iapDocument.facilityData = {
          facilities: this.getFacilitiesForOperation(operationId),
          totalPersonnel: this.getFacilitiesForOperation(operationId)
            .reduce((sum, f) => sum + f.personnel.length, 0),
          totalCapacity: this.getFacilitiesForOperation(operationId)
            .reduce((sum, f) => sum + (f.capacity.totalCapacity || 0), 0),
          currentOccupancy: this.getFacilitiesForOperation(operationId)
            .reduce((sum, f) => sum + (f.capacity.currentOccupancy || 0), 0),
          serviceLinesSummary: this.generateServiceLineSummary(operationId),
          geographicDistribution: []
        };

        iapDocument.workSitesTable = this.generateWorkSitesTable(operationId);
        iapDocument.contactRoster = this.generateContactRoster(operationId);
      }
    }
  }

  private incrementIAPVersion(
    iapDocument: EnhancedIAPDocument, 
    event: Event, 
    section: string, 
    description: string
  ): void {
    iapDocument.version++;
    iapDocument.versionHistory.push({
      id: crypto.randomUUID(),
      versionNumber: iapDocument.version,
      createdAt: new Date(event.timestamp),
      createdBy: event.actorId,
      changes: [{
        section,
        changeType: 'modified',
        description
      }],
      isOfficial: false
    });
  }
}

// Export singleton instance
export const iapProjector = new IAPProjector();
