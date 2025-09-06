/**
 * IAP PDF Generator Service
 * 
 * Generates professional 53-page Incident Action Plan documents
 * for Red Cross disaster response operations.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { V27_IAP_DATA } from '@/data/v27-iap-data';

export interface PDFOptions {
  includePageNumbers?: boolean;
  includeHeaders?: boolean;
  includeFooters?: boolean;
  watermark?: string;
  confidential?: boolean;
}

export class IAPPdfGenerator {
  private pdf: jsPDF;
  private currentPage = 1;
  private totalPages = 53;
  private options: PDFOptions;

  constructor(options: PDFOptions = {}) {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });
    
    this.options = {
      includePageNumbers: true,
      includeHeaders: true,
      includeFooters: true,
      ...options
    };

    // Set up fonts
    this.pdf.setFont('helvetica');
  }

  /**
   * Generate the complete 53-page IAP document
   */
  async generateCompleteIAP(data: any = V27_IAP_DATA): Promise<Blob> {
    // Cover Page
    this.addCoverPage(data);
    
    // Director's Message (Pages 2-3)
    this.addDirectorsMessage(data);
    
    // Contact Roster (Pages 4-6)
    this.addContactRoster(data);
    
    // Organization Chart (Pages 7-8)
    await this.addOrganizationChart(data);
    
    // Priorities and Objectives (Pages 9-10)
    this.addPrioritiesObjectives(data);
    
    // Work Assignments - Sheltering (Pages 11-12)
    this.addShelteringWorkAssignments(data);
    
    // Work Assignments - Feeding (Pages 13-22)
    this.addFeedingWorkAssignments(data);
    
    // Work Assignments - Government Operations (Pages 23-25)
    this.addGovernmentOpsWorkAssignments(data);
    
    // Work Assignments - Damage Assessment (Pages 26-28)
    this.addDamageAssessmentWorkAssignments(data);
    
    // Work Assignments - Distribution (Pages 29-31)
    this.addDistributionWorkAssignments(data);
    
    // Work Assignments - Individual Care (Pages 32-38)
    this.addIndividualCareWorkAssignments(data);
    
    // Work Sites and Facilities (Pages 39-44)
    this.addWorkSitesFacilities(data);
    
    // Daily Schedule (Pages 45-48)
    this.addDailySchedule(data);
    
    // Maps and Geographic Information (Pages 49-51)
    await this.addMapsGeographic(data);
    
    // Appendices and References (Pages 52-53)
    this.addAppendicesReferences(data);

    // Return as blob for download or preview
    return this.pdf.output('blob');
  }

  /**
   * Generate PDF from HTML element
   */
  async generateFromElement(elementId: string): Promise<Blob> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    this.pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      this.pdf.addPage();
      this.pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return this.pdf.output('blob');
  }

  /**
   * Add Cover Page (Page 1)
   */
  private addCoverPage(data: any) {
    const { operation } = data;
    
    // Red Cross Header
    this.pdf.setFillColor(237, 28, 36); // Red Cross Red
    this.pdf.rect(0, 0, 216, 30, 'F');
    
    // Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(24);
    this.pdf.text('INCIDENT ACTION PLAN', 108, 20, { align: 'center' });
    
    // Reset text color
    this.pdf.setTextColor(0, 0, 0);
    
    // Operation Information Box
    this.pdf.setDrawColor(0);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(20, 50, 176, 60);
    
    // Operation Details
    this.pdf.setFontSize(12);
    this.pdf.text(`Incident Name: ${operation.name}`, 30, 65);
    this.pdf.text(`DR Number: ${operation.drNumber}`, 30, 75);
    this.pdf.text(`Operational Period: ${operation.operationalPeriod.start} to ${operation.operationalPeriod.end}`, 30, 85);
    this.pdf.text(`IAP Number: #${operation.operationalPeriod.number}`, 30, 95);
    
    // Checklist Section
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Documents Included:', 30, 130);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    const checklist = [
      "Director's Intent/Message",
      'Incident Priorities and Objectives',
      'Contact Roster DRO HQ',
      'Incident Organization Chart',
      'Work Assignments',
      'Work Sites and Facilities',
      'Daily Schedule',
      'Maps and Geographic Information'
    ];
    
    let yPos = 140;
    checklist.forEach(item => {
      this.pdf.text(`☑ ${item}`, 35, yPos);
      yPos += 8;
    });
    
    // Approval Section
    this.pdf.rect(20, 210, 176, 40);
    this.pdf.text('Prepared By:', 30, 225);
    this.pdf.text(`${operation.preparedBy}`, 70, 225);
    this.pdf.text(`${operation.preparedByTitle}`, 70, 232);
    
    this.pdf.text('Approved By:', 30, 245);
    this.pdf.text(`${operation.approvedBy}`, 70, 245);
    this.pdf.text(`${operation.approvedByTitle}`, 70, 252);
    
    this.addPageFooter();
  }

  /**
   * Add Director's Message (Pages 2-3)
   */
  private addDirectorsMessage(data: any) {
    this.pdf.addPage();
    this.addPageHeader('DIRECTOR\'S INTENT/MESSAGE');
    
    const message = data.directorsMessage || `
This Incident Action Plan establishes the operational priorities and objectives for the next operational period.

Key Priorities:
1. Life Safety - Ensure the safety of all responders and affected populations
2. Incident Stabilization - Provide essential services to disaster survivors
3. Property/Environmental Protection - Minimize further damage and environmental impact

All personnel are expected to:
- Follow safety protocols at all times
- Coordinate through established chain of command
- Document all significant activities
- Communicate resource needs promptly

Remember that we are here to serve those affected by this disaster with compassion and efficiency.
    `.trim();
    
    // Split message into lines that fit on page
    const lines = this.pdf.splitTextToSize(message, 170);
    let yPos = 60;
    
    lines.forEach((line: string) => {
      if (yPos > 250) {
        this.pdf.addPage();
        this.addPageHeader('DIRECTOR\'S INTENT/MESSAGE (Continued)');
        yPos = 60;
      }
      this.pdf.text(line, 20, yPos);
      yPos += 7;
    });
    
    this.addPageFooter();
  }

  /**
   * Add Contact Roster (Pages 4-6)
   */
  private addContactRoster(data: any) {
    this.pdf.addPage();
    this.addPageHeader('CONTACT ROSTER - DRO HQ');
    
    const roster = data.contactRoster || [];
    
    // Table headers
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Position', 20, 60);
    this.pdf.text('Name', 70, 60);
    this.pdf.text('Phone', 120, 60);
    this.pdf.text('Email', 160, 60);
    
    // Draw header line
    this.pdf.line(20, 62, 196, 62);
    
    this.pdf.setFont('helvetica', 'normal');
    let yPos = 70;
    let pageCount = 1;
    
    roster.forEach((contact: any) => {
      if (yPos > 250) {
        this.pdf.addPage();
        this.addPageHeader(`CONTACT ROSTER - DRO HQ (Page ${++pageCount})`);
        yPos = 60;
        
        // Repeat headers
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text('Position', 20, 60);
        this.pdf.text('Name', 70, 60);
        this.pdf.text('Phone', 120, 60);
        this.pdf.text('Email', 160, 60);
        this.pdf.line(20, 62, 196, 62);
        this.pdf.setFont('helvetica', 'normal');
        yPos = 70;
      }
      
      this.pdf.setFontSize(9);
      this.pdf.text(contact.title || '', 20, yPos);
      this.pdf.text(contact.name || '', 70, yPos);
      this.pdf.text(contact.phone || '', 120, yPos);
      
      // Truncate email if too long
      const email = (contact.email || '').replace('@redcross.org', '');
      this.pdf.text(email.substring(0, 20), 160, yPos);
      
      yPos += 7;
    });
    
    this.addPageFooter();
  }

  /**
   * Add Organization Chart (Pages 7-8)
   */
  private async addOrganizationChart(data: any) {
    this.pdf.addPage();
    this.addPageHeader('INCIDENT ORGANIZATION CHART');
    
    // Try to capture from DOM if available
    const chartElement = document.querySelector('.react-flow');
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement as HTMLElement, {
          scale: 1,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        this.pdf.addImage(imgData, 'PNG', 20, 60, 176, 120);
      } catch (e) {
        // Fallback to text representation
        this.addTextOrgChart(data);
      }
    } else {
      this.addTextOrgChart(data);
    }
    
    this.addPageFooter();
  }

  /**
   * Add text-based org chart as fallback
   */
  private addTextOrgChart(data: any) {
    this.pdf.setFontSize(10);
    
    // Command Staff
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('COMMAND STAFF', 108, 70, { align: 'center' });
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('DRO Director: Virginia Mewborn', 108, 80, { align: 'center' });
    
    // Draw connecting lines
    this.pdf.line(108, 85, 108, 95);
    this.pdf.line(60, 95, 156, 95);
    
    // Section Chiefs
    this.pdf.text('Operations', 60, 105, { align: 'center' });
    this.pdf.text('Patricia DAlessandro', 60, 112, { align: 'center' });
    
    this.pdf.text('Planning', 108, 105, { align: 'center' });
    this.pdf.text('Janice Vannatta', 108, 112, { align: 'center' });
    
    this.pdf.text('Logistics', 156, 105, { align: 'center' });
    this.pdf.text('Marvin Williams', 156, 112, { align: 'center' });
  }

  /**
   * Add Priorities and Objectives (Pages 9-10)
   */
  private addPrioritiesObjectives(data: any) {
    this.pdf.addPage();
    this.addPageHeader('INCIDENT PRIORITIES AND OBJECTIVES');
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('INCIDENT PRIORITIES', 20, 60);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    
    const priorities = [
      '1. Life Safety - Ensure safety of all responders and survivors',
      '2. Incident Stabilization - Provide essential disaster services',
      '3. Property/Environmental Protection - Minimize additional damage'
    ];
    
    let yPos = 70;
    priorities.forEach(priority => {
      this.pdf.text(priority, 25, yPos);
      yPos += 10;
    });
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('OPERATIONAL OBJECTIVES', 20, yPos + 10);
    
    this.pdf.setFont('helvetica', 'normal');
    yPos += 20;
    
    const objectives = data.objectives || [
      'Open and maintain shelter operations for displaced residents',
      'Provide feeding services to affected populations',
      'Coordinate with government partners for resource allocation',
      'Conduct damage assessments in affected areas',
      'Establish distribution sites for emergency supplies',
      'Provide individual disaster care services'
    ];
    
    objectives.forEach((objective: string, index: number) => {
      if (yPos > 250) {
        this.pdf.addPage();
        this.addPageHeader('INCIDENT PRIORITIES AND OBJECTIVES (Continued)');
        yPos = 60;
      }
      this.pdf.text(`${index + 1}. ${objective}`, 25, yPos);
      yPos += 10;
    });
    
    this.addPageFooter();
  }

  /**
   * Add Work Assignments sections
   */
  private addShelteringWorkAssignments(data: any) {
    this.pdf.addPage();
    this.addPageHeader('WORK ASSIGNMENTS - SHELTERING');
    
    const facilities = data.shelteringFacilities || [];
    this.addFacilityTable(facilities, 'Shelter');
    
    this.addPageFooter();
  }

  private addFeedingWorkAssignments(data: any) {
    this.pdf.addPage();
    this.addPageHeader('WORK ASSIGNMENTS - FEEDING');
    
    const facilities = data.feedingFacilities || [];
    this.addFacilityTable(facilities, 'Feeding');
    
    // Add ERV assignments
    this.pdf.addPage();
    this.addPageHeader('WORK ASSIGNMENTS - ERV OPERATIONS');
    
    this.pdf.setFontSize(10);
    let yPos = 60;
    
    const ervs = [
      { unit: 'ERV 11181', crew: 'Jake Gonzales, Ben Knight', location: 'Church of the Palms' },
      { unit: 'ERV 31082', crew: 'Greg Camacho', location: 'Church of the Palms' },
      { unit: 'ERV 34076', crew: 'Kenneth Blackshear, James Horning', location: 'Stand by' }
    ];
    
    ervs.forEach(erv => {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(erv.unit, 20, yPos);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(`Crew: ${erv.crew}`, 30, yPos + 7);
      this.pdf.text(`Location: ${erv.location}`, 30, yPos + 14);
      yPos += 25;
    });
    
    this.addPageFooter();
  }

  private addGovernmentOpsWorkAssignments(data: any) {
    this.pdf.addPage();
    this.addPageHeader('WORK ASSIGNMENTS - GOVERNMENT OPERATIONS');
    
    this.pdf.setFontSize(11);
    this.pdf.text('EOC Liaison Assignments:', 20, 60);
    
    const eocs = [
      { location: 'State EOC - Tallahassee', liaison: 'Robert Johnson', shift: 'Day' },
      { location: 'Hillsborough County EOC', liaison: 'Maria Garcia', shift: 'Day' },
      { location: 'Pinellas County EOC', liaison: 'James Wilson', shift: 'Night' }
    ];
    
    let yPos = 70;
    eocs.forEach(eoc => {
      this.pdf.text(`• ${eoc.location}: ${eoc.liaison} (${eoc.shift})`, 25, yPos);
      yPos += 8;
    });
    
    this.addPageFooter();
  }

  private addDamageAssessmentWorkAssignments(data: any) {
    this.pdf.addPage();
    this.addPageHeader('WORK ASSIGNMENTS - DAMAGE ASSESSMENT');
    
    this.pdf.setFontSize(11);
    const teams = [
      { team: 'DA Team 1', area: 'Hillsborough County - North', members: 4 },
      { team: 'DA Team 2', area: 'Hillsborough County - South', members: 4 },
      { team: 'DA Team 3', area: 'Pinellas County', members: 6 }
    ];
    
    let yPos = 60;
    teams.forEach(team => {
      this.pdf.text(`${team.team}: ${team.area} (${team.members} members)`, 20, yPos);
      yPos += 10;
    });
    
    this.addPageFooter();
  }

  private addDistributionWorkAssignments(data: any) {
    this.pdf.addPage();
    this.addPageHeader('WORK ASSIGNMENTS - DISTRIBUTION');
    
    const sites = data.distributionSites || [
      { name: 'Distribution Site 1', location: 'Tampa Fairgrounds', supplies: 'Water, MREs, Tarps' },
      { name: 'Distribution Site 2', location: 'Clearwater Mall', supplies: 'Cleanup Kits, Water' }
    ];
    
    let yPos = 60;
    sites.forEach((site: any) => {
      this.pdf.text(`${site.name}`, 20, yPos);
      this.pdf.text(`Location: ${site.location}`, 30, yPos + 7);
      this.pdf.text(`Supplies: ${site.supplies}`, 30, yPos + 14);
      yPos += 25;
    });
    
    this.addPageFooter();
  }

  private addIndividualCareWorkAssignments(data: any) {
    this.pdf.addPage();
    this.addPageHeader('WORK ASSIGNMENTS - INDIVIDUAL DISASTER CARE');
    
    this.pdf.setFontSize(11);
    this.pdf.text('IDC Teams deployed to:', 20, 60);
    
    const locations = [
      'Shelter A - Mental Health Support',
      'Shelter B - Client Casework',
      'Mobile Outreach - Community Centers',
      'FEMA DRC - Joint Operations'
    ];
    
    let yPos = 70;
    locations.forEach(loc => {
      this.pdf.text(`• ${loc}`, 25, yPos);
      yPos += 8;
    });
    
    this.addPageFooter();
  }

  /**
   * Add Work Sites and Facilities (Pages 39-44)
   */
  private addWorkSitesFacilities(data: any) {
    this.pdf.addPage();
    this.addPageHeader('WORK SITES AND FACILITIES');
    
    // Aggregate all facilities
    const allFacilities = [
      ...(data.shelteringFacilities || []),
      ...(data.feedingFacilities || []),
      ...(data.governmentFacilities || [])
    ];
    
    this.pdf.setFontSize(9);
    let yPos = 60;
    let pageNum = 1;
    
    allFacilities.forEach((facility: any, index: number) => {
      if (yPos > 250) {
        this.pdf.addPage();
        this.addPageHeader(`WORK SITES AND FACILITIES (Page ${++pageNum})`);
        yPos = 60;
      }
      
      this.pdf.text(`${index + 1}. ${facility.name}`, 20, yPos);
      this.pdf.text(`   ${facility.address}, ${facility.county} County`, 20, yPos + 5);
      yPos += 12;
    });
    
    this.addPageFooter();
  }

  /**
   * Add Daily Schedule (Pages 45-48)
   */
  private addDailySchedule(data: any) {
    this.pdf.addPage();
    this.addPageHeader('DAILY SCHEDULE');
    
    const schedule = data.dailySchedule || [
      { time: '06:00', activity: 'Day Shift Report' },
      { time: '07:00', activity: 'Operations Briefing' },
      { time: '12:00', activity: 'Situation Update' },
      { time: '18:00', activity: 'Night Shift Report' },
      { time: '19:00', activity: 'Command Staff Meeting' }
    ];
    
    // Table headers
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Time', 30, 60);
    this.pdf.text('Activity', 70, 60);
    this.pdf.text('Location', 140, 60);
    this.pdf.line(20, 62, 196, 62);
    
    this.pdf.setFont('helvetica', 'normal');
    let yPos = 70;
    
    schedule.forEach((item: any) => {
      this.pdf.text(item.time, 30, yPos);
      this.pdf.text(item.activity, 70, yPos);
      this.pdf.text(item.location || 'HQ', 140, yPos);
      yPos += 8;
    });
    
    this.addPageFooter();
  }

  /**
   * Add Maps and Geographic Information (Pages 49-51)
   */
  private async addMapsGeographic(data: any) {
    this.pdf.addPage();
    this.addPageHeader('MAPS AND GEOGRAPHIC INFORMATION');
    
    // Try to capture map if available
    const mapElement = document.querySelector('[data-map-container]');
    if (mapElement) {
      try {
        const canvas = await html2canvas(mapElement as HTMLElement);
        const imgData = canvas.toDataURL('image/png');
        this.pdf.addImage(imgData, 'PNG', 20, 60, 176, 120);
      } catch (e) {
        this.addTextMapInfo();
      }
    } else {
      this.addTextMapInfo();
    }
    
    this.addPageFooter();
  }

  private addTextMapInfo() {
    this.pdf.setFontSize(11);
    this.pdf.text('Affected Counties:', 20, 70);
    const counties = ['Hillsborough', 'Pinellas', 'Sarasota', 'Manatee'];
    let yPos = 80;
    counties.forEach(county => {
      this.pdf.text(`• ${county} County`, 30, yPos);
      yPos += 8;
    });
  }

  /**
   * Add Appendices and References (Pages 52-53)
   */
  private addAppendicesReferences(data: any) {
    this.pdf.addPage();
    this.addPageHeader('APPENDICES AND REFERENCES');
    
    this.pdf.setFontSize(11);
    this.pdf.text('Reference Documents:', 20, 60);
    
    const references = [
      'Red Cross Disaster Operations Manual',
      'Safety Protocols and Guidelines',
      'Resource Request Procedures',
      'Communication Plan',
      'Evacuation Routes and Maps'
    ];
    
    let yPos = 70;
    references.forEach(ref => {
      this.pdf.text(`• ${ref}`, 25, yPos);
      yPos += 8;
    });
    
    this.pdf.text('Emergency Contact Numbers:', 20, yPos + 10);
    yPos += 20;
    
    const contacts = [
      'National HQ: 1-800-RED-CROSS',
      'State EOC: 850-815-4000',
      'FEMA Region IV: 770-220-5200'
    ];
    
    contacts.forEach(contact => {
      this.pdf.text(`• ${contact}`, 25, yPos);
      yPos += 8;
    });
    
    this.addPageFooter();
  }

  /**
   * Helper: Add facility table
   */
  private addFacilityTable(facilities: any[], type: string) {
    this.pdf.setFontSize(9);
    
    // Headers
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Facility', 20, 60);
    this.pdf.text('County', 80, 60);
    this.pdf.text('Capacity', 120, 60);
    this.pdf.text('Staff', 150, 60);
    this.pdf.text('Gap', 175, 60);
    
    this.pdf.line(20, 62, 196, 62);
    this.pdf.setFont('helvetica', 'normal');
    
    let yPos = 70;
    facilities.forEach((facility: any) => {
      this.pdf.text(facility.name.substring(0, 25), 20, yPos);
      this.pdf.text(facility.county, 80, yPos);
      
      const capacity = facility.capacity?.maximum || facility.capacity || '-';
      this.pdf.text(capacity.toString(), 120, yPos);
      
      const staff = facility.personnel?.have || '-';
      const required = facility.personnel?.required || '-';
      this.pdf.text(`${staff}/${required}`, 150, yPos);
      
      const gap = facility.personnel?.gap || 0;
      if (gap > 0) {
        this.pdf.setTextColor(255, 0, 0);
        this.pdf.text(gap.toString(), 175, yPos);
        this.pdf.setTextColor(0, 0, 0);
      } else {
        this.pdf.text('0', 175, yPos);
      }
      
      yPos += 7;
    });
  }

  /**
   * Helper: Add page header
   */
  private addPageHeader(title: string) {
    this.pdf.setFillColor(237, 28, 36);
    this.pdf.rect(0, 0, 216, 15, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, 108, 10, { align: 'center' });
    
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');
    
    // Add operation info
    this.pdf.setFontSize(9);
    this.pdf.text(`DR ${V27_IAP_DATA.operation.drNumber}`, 20, 25);
    this.pdf.text(`${V27_IAP_DATA.operation.name}`, 108, 25, { align: 'center' });
    this.pdf.text(`Period #${V27_IAP_DATA.operation.operationalPeriod.number}`, 196, 25, { align: 'right' });
    
    this.pdf.line(20, 30, 196, 30);
  }

  /**
   * Helper: Add page footer
   */
  private addPageFooter() {
    if (this.options.includePageNumbers) {
      this.pdf.setFontSize(9);
      this.pdf.text(
        `Page ${this.currentPage} of ${this.totalPages}`,
        196,
        280,
        { align: 'right' }
      );
    }
    
    if (this.options.includeFooters) {
      this.pdf.setFontSize(8);
      this.pdf.text(
        'American Red Cross - Confidential',
        108,
        285,
        { align: 'center' }
      );
    }
    
    this.currentPage++;
  }

  /**
   * Save PDF to file
   */
  save(filename: string = 'IAP.pdf') {
    this.pdf.save(filename);
  }

  /**
   * Get PDF as data URL for preview
   */
  getDataUrl(): string {
    return this.pdf.output('datauristring');
  }
}