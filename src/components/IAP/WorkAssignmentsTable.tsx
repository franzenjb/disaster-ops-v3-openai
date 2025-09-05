/**
 * Work Assignments Table - Exact Page 11 IAP Format
 * 
 * Perfect recreation based on actual IAP HTML structure you provided
 */

'use client';

import React from 'react';
import type { IAPFacility } from '../../types';

interface WorkAssignmentsTableProps {
  facilities: IAPFacility[];
  incidentName: string;
  drNumber: string;
  operationalPeriod: string;
  preparedBy: string;
  preparedByTitle: string;
  pageNumber: number;
  totalPages: number;
}

export const WorkAssignmentsTable: React.FC<WorkAssignmentsTableProps> = ({
  facilities,
  incidentName,
  drNumber,
  operationalPeriod,
  preparedBy,
  preparedByTitle,
  pageNumber,
  totalPages
}) => {
  return (
    <div className="iap-page">
      {/* Header Table */}
      <table className="header-table">
        <tbody>
          <tr>
            <td style={{ width: '25%' }}>
              <span className="header-label">Incident Name:</span><br />
              {incidentName}
            </td>
            <td style={{ width: '25%' }}>
              <span className="header-label">DR Number:</span><br />
              {drNumber}
            </td>
            <td style={{ width: '50%' }}>
              <span className="header-label">Operational Period:</span><br />
              {operationalPeriod}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Section Title Bar */}
      <div className="section-title-bar">
        DRO – Sheltering Resources
      </div>

      {/* Main Table */}
      <table className="main-table">
        <thead>
          <tr>
            <th className="col-resource">Resource ID</th>
            <th className="col-leader">Leader Name & Contact<br />Information</th>
            <th className="col-persons">Total # of<br />Persons</th>
            <th className="col-reporting">Reporting<br />Location</th>
            <th style={{ width: '15%' }}>Reporting<br />Time</th>
          </tr>
        </thead>
        <tbody>
          {facilities.filter(f => f.facilityType === 'shelter').map((facility, index) => {
            const dayLeader = facility.personnel.find(p => p.isLeader);
            const nightLeader = facility.personnel.find(p => !p.isLeader) || dayLeader;
            
            return (
              <React.Fragment key={facility.id}>
                {/* Main facility row */}
                <tr>
                  <td rowSpan={2} className="resource-cell">
                    {facility.name.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {word}
                        {i < facility.name.split(' ').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                    {facility.capacity.totalCapacity && (
                      <>
                        , Zone {index + 1}<br />
                        (Capacity: {facility.capacity.totalCapacity})
                      </>
                    )}
                  </td>
                  <td>
                    <div className="leader-entry">
                      ● Day – {dayLeader?.contactInfo.phone || facility.contact.primaryName}<br />
                      ({dayLeader?.contactInfo.phone || facility.contact.primaryPhone})
                    </div>
                    <div className="leader-entry">
                      ● Night – {nightLeader?.contactInfo.phone || facility.contact.backupName || facility.contact.primaryName}<br />
                      ({nightLeader?.contactInfo.phone || facility.contact.backupPhone || facility.contact.primaryPhone})
                    </div>
                    {facility.contact.primaryPhone !== facility.contact.backupPhone && (
                      <div className="leader-entry">
                        ● Shelter Phone<br />
                        ({facility.contact.primaryPhone})
                      </div>
                    )}
                  </td>
                  <td className="personnel-list">
                    SH/SV-Mgr – 1<br />
                    <br />
                    SH/SV – {Math.max(1, Math.floor(facility.personnel.length / 2))}<br />
                    <br />
                    SH/SA – {Math.max(1, facility.personnel.length)}<br />
                    {facility.serviceLines.includes('health_services') && (
                      <>
                        <br />
                        DHS/SV – 1<br />
                        <br />
                        DHS/SA – 1
                      </>
                    )}
                  </td>
                  <td rowSpan={2}>
                    {facility.address}<br />
                    {facility.city}, {facility.state}{facility.zip ? ` ${facility.zip}` : ''}<br />
                    {facility.county} County
                  </td>
                  <td rowSpan={2} style={{ verticalAlign: 'top' }}>
                    <div className="time-entry">
                      <span className="time-label">Day – 07:00</span>
                    </div>
                    <div className="time-entry">
                      <span className="time-label">Night – 19:00</span>
                    </div>
                  </td>
                </tr>

                {/* Work Assignment Row - spans columns 2-5 */}
                <tr className="work-assignment-row">
                  <td colSpan={4}>
                    <strong>Work Assignment</strong><br />
                    Provide client first sheltering to clients at shelter with an emphasis on being present with the clients.
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="footer">
        <div className="footer-left">
          <span>Prepared By:</span>
          <span>{preparedBy}<br />{preparedByTitle}</span>
        </div>
        <div className="footer-right">
          Page {pageNumber} of {totalPages}
        </div>
      </div>

      <div style={{ marginTop: '10px', fontSize: '8pt' }}>
        OPS Incident Action Plan Template V.6.0 2023-02-28
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .iap-page {
          font-family: Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.2;
          padding: 0.5in;
          max-width: 8.5in;
          margin: 0 auto;
          background: white;
        }

        .header-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid black;
          margin-bottom: 10px;
        }

        .header-table td {
          border: 1px solid black;
          padding: 4px 8px;
          vertical-align: middle;
        }

        .header-label {
          font-weight: bold;
          white-space: nowrap;
        }

        .section-title-bar {
          background-color: #d0d0d0;
          border: 1px solid black;
          padding: 6px;
          font-weight: bold;
          font-size: 11pt;
          margin-bottom: 0;
        }

        .main-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid black;
          border-top: none;
        }

        .main-table th,
        .main-table td {
          border: 1px solid black;
          padding: 4px 6px;
          vertical-align: top;
          font-size: 10pt;
        }

        .main-table td[colspan] {
          border-left: 1px solid black;
          border-right: 1px solid black;
          border-top: 1px solid black;
          border-bottom: 1px solid black;
        }

        .main-table th {
          background-color: #e8e8e8;
          font-weight: bold;
          text-align: center;
          padding: 6px;
        }

        .col-resource { width: 18%; }
        .col-leader { width: 32%; }
        .col-persons { width: 18%; text-align: left; }
        .col-reporting { width: 32%; }

        .work-assignment-row td {
          background-color: #f0f0f0;
          font-style: italic;
          padding: 6px;
          border-left: 1px solid black;
          border-right: 1px solid black;
          border-top: 1px solid black;
          border-bottom: 1px solid black;
        }

        .resource-cell {
          font-weight: bold;
        }

        .leader-entry {
          margin-bottom: 6px;
        }

        .leader-entry:last-child {
          margin-bottom: 0;
        }

        .personnel-list {
          line-height: 1.4;
        }

        .time-entry {
          display: block;
          margin: 4px 0;
        }

        .time-label {
          font-weight: bold;
        }

        .footer {
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 9pt;
        }

        .footer-left {
          display: flex;
          align-items: flex-end;
          gap: 10px;
        }

        .footer-right {
          text-align: right;
        }

        @page {
          size: letter;
          margin: 0.5in;
        }

        @media print {
          .iap-page {
            padding: 0;
            max-width: none;
          }
          
          .main-table {
            page-break-inside: avoid;
          }
          
          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};