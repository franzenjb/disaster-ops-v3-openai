/**
 * Complete IAP Document Component
 * Matches exact Red Cross IAP template with all content from DR 220-25 FLOCOM
 */

import React, { useState } from 'react';
import { useOperationStore } from '../../stores/useOperationStore';
import { IAPCoverPage } from './IAPCoverPage';
import { IAPLayout } from './IAPLayout';
import { ContactRosterPage } from './ContactRosterPage';
import { OrganizationChartPage } from './OrganizationChartPage';
import { IAPSettingsModal } from './IAPSettingsModal';
import { RichTextEditor } from './RichTextEditor';
import { 
  PrinterIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

type IAPSection = 
  | 'cover'
  | 'directors-message'
  | 'priorities-objectives'
  | 'contact-roster'
  | 'organization-chart'
  | 'work-assignments'
  | 'work-sites'
  | 'general-messages'
  | 'daily-schedule';

interface SectionConfig {
  id: IAPSection;
  title: string;
  pageNumbers: number[];
}

const sections: SectionConfig[] = [
  { id: 'cover', title: 'Cover Page', pageNumbers: [1] },
  { id: 'directors-message', title: "Director's Intent/Message", pageNumbers: [2] },
  { id: 'priorities-objectives', title: 'Priorities, Objectives & Action Tracker', pageNumbers: [3] },
  { id: 'contact-roster', title: 'Contact Roster DRO HQ', pageNumbers: [4] },
  { id: 'organization-chart', title: 'Organization Chart', pageNumbers: [5] },
  { id: 'work-assignments', title: 'Work Assignments', pageNumbers: [6] },
  { id: 'work-sites', title: 'Work Sites', pageNumbers: [7] },
  { id: 'general-messages', title: 'General Messages', pageNumbers: [8] },
  { id: 'daily-schedule', title: 'Daily Schedule', pageNumbers: [9] }
];

export function IAPDocumentComplete() {
  const operation = useOperationStore(state => state.currentOperation);
  const updateIAPSection = useOperationStore(state => state.updateIAPSection);
  const [currentSection, setCurrentSection] = useState<IAPSection>('cover');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  if (!operation?.iap) {
    return <div className="flex items-center justify-center p-8">
      <div className="text-gray-500">Loading IAP Document...</div>
    </div>;
  }
  
  const handleNavigate = (sectionId: string) => {
    setCurrentSection(sectionId as IAPSection);
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setCurrentPage(section.pageNumbers[0]);
    }
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Find which section this page belongs to
    const section = sections.find(s => s.pageNumbers.includes(page));
    if (section) {
      setCurrentSection(section.id);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleExportPDF = () => {
    alert('PDF export coming soon - use Print for now');
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <IAPCoverPage onNavigate={handleNavigate} />;
      case 2:
        return (
          <IAPLayout pageNumber={2} totalPages={9}>
            <DirectorsMessagePage isEditing={isEditing} />
          </IAPLayout>
        );
      case 3:
        return (
          <IAPLayout pageNumber={3} totalPages={9}>
            <PrioritiesObjectivesPage isEditing={isEditing} />
          </IAPLayout>
        );
      case 4:
        return (
          <IAPLayout pageNumber={4} totalPages={9}>
            <ContactRosterPage isEditing={isEditing} />
          </IAPLayout>
        );
      case 5:
        return (
          <IAPLayout pageNumber={5} totalPages={9}>
            <OrganizationChartPage isEditing={isEditing} />
          </IAPLayout>
        );
      case 6:
        return (
          <IAPLayout pageNumber={6} totalPages={9}>
            <WorkAssignmentsPage isEditing={isEditing} />
          </IAPLayout>
        );
      case 7:
        return (
          <IAPLayout pageNumber={7} totalPages={9}>
            <WorkSitesAndMessagesPage isEditing={isEditing} />
          </IAPLayout>
        );
      case 8:
        return (
          <IAPLayout pageNumber={8} totalPages={9}>
            <GeneralMessagesPage isEditing={isEditing} />
          </IAPLayout>
        );
      case 9:
        return (
          <IAPLayout pageNumber={9} totalPages={9}>
            <DailySchedulePage isEditing={isEditing} />
          </IAPLayout>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="iap-document">
      {/* Control Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">
                IAP #54 - DR 220-25 FLOCOM
              </h2>
              <span className="text-sm text-gray-500">
                Page {currentPage} of 9
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                <Cog6ToothIcon className="w-4 h-4 inline mr-1" />
                Settings
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded ${isEditing ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
              >
                <PencilSquareIcon className="w-4 h-4 inline mr-1" />
                {isEditing ? 'Save' : 'Edit'}
              </button>
              <button onClick={handlePrint} className="btn-secondary">
                <PrinterIcon className="w-4 h-4 inline mr-1" />
                Print
              </button>
              <button onClick={handleExportPDF} className="btn-primary">
                <ArrowDownTrayIcon className="w-4 h-4 inline mr-1" />
                Export PDF
              </button>
            </div>
          </div>
          
          {/* Page Navigation */}
          <div className="flex items-center justify-between pb-4">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-2 py-1 text-xs rounded ${
                    currentPage === page
                      ? 'bg-red-cross-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(Math.min(9, currentPage + 1))}
              disabled={currentPage === 9}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                currentPage === 9
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="py-8">
        {renderPage()}
      </div>
      
      {/* Settings Modal */}
      <IAPSettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}

// Page 2: Director's Message
function DirectorsMessagePage({ isEditing }: { isEditing: boolean }) {
  const [message, setMessage] = useState(`Team FLOCOM –

Thank you so much for the tremendous work each of you has done. We are rapidly transitioning to the to the Immediate Assistance phase of the DRO, and this has certainly been a team effort.

We've managed two major hurricanes, seventy tornadoes and major riverine flooding. At our peak, we had more than 84,000 evacuees in evacuation shelters, and we have identified more than 10,639 homes that have sustained major damage or were destroyed.

As we transition, a new leadership team will come in to manage the efforts beginning early next week. The current leadership team will do a very deliberate transition with the incoming team.

While our community feeding and distribution of supplies has concluded, our commitment to be there for the communities impacted by these storms has not. For some survivors, their road to recovery may be longer and more difficult than their neighbors. It is our job to continue to be a presence on that journey through our IA program, our Long-Term Recovery Program, and our support in the mobilization efforts of partners.

As we move into this next phase of the operation remember our mission and remember with each interaction you have that you are part of the largest humanitarian mission in the world to prevent and alleviate human suffering in the face of emergencies.

Thank you for supporting this operation and thank you for what you do every day as part of the American Red Cross.

With immense gratitude!

Virginia & Jennie`);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-red-600">Director's Intent/Message</h2>
      
      {isEditing ? (
        <RichTextEditor
          value={message}
          onChange={setMessage}
          placeholder="Enter the Director's Intent/Message..."
        />
      ) : (
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: message }} />
        </div>
      )}
      
      <div className="mt-8 text-sm">
        <p className="text-blue-600 underline mb-1">RCView Links –</p>
        <p className="text-blue-600 underline mb-1">Directors Brief</p>
        <p className="text-blue-600 underline mb-4">Comprehensive Brief</p>
        <p className="font-bold">Account String: 052-37000-2x-4220-xxxxx-0010</p>
      </div>
      
      <div className="mt-8 text-right">
        <button className="text-red-600 font-bold hover:underline">
          Return to Main Menu
        </button>
      </div>
    </div>
  );
}

// Page 3: Priorities, Objectives, and Action Tracker
function PrioritiesObjectivesPage({ isEditing }: { isEditing: boolean }) {
  const [priorities] = useState([
    "Hold deliberate discussions assessing partner's support for Withlacoochee River Flooding",
    "Conduct Accelerated outreach (AO) throughout the AOR and Targeted Enrollment (TE) in Zone 1",
    "DRO Leadership Transition to Immediate Assistance Leadership Team"
  ]);
  
  const [objectives] = useState([
    {
      id: "1.1",
      text: "Determine resources, Damage Assessment needs, and timeline to support communities impacted by the Withlacoochee River flooding through the implementation of a Response Impact Grant starting 7:00am 11/16. (OM, LTR)"
    },
    {
      id: "2.1",
      text: "Execute virtual outreach to call center contacts and voter registration matches continuing through 6:00pm 11/17."
    },
    {
      id: "2.2",
      text: "Implement TE plan for zone 1 targeting Madison, Taylor, Dixie, and Levy by 6:00pm 11/17"
    },
    {
      id: "3.1",
      text: "Complete planning assessing warehouse capacity needed to support Withlacoochee flooding and DR requirements by 6:00pm 11/17."
    },
    {
      id: "3.2",
      text: "Complete full transition of Team Mewborn to Immediate Assistance Leadership Team (IALT) by 6:00pm 11/18."
    }
  ]);
  
  const [previousStatus] = useState([
    {
      id: "1.1",
      objective: "Determine resources, Damage Assessment needs, and timeline to support communities impacted by the Withlacoochee River flooding through the implementation of a Response Impact Grant starting 7:00am 11/16. (OM, LTR)",
      status: "Achieved",
      actions: ""
    },
    {
      id: "2.1",
      objective: "Execute virtual outreach to call center contacts and voter registration matches continuing through 6:00pm 11/17.)",
      status: "In Progress",
      actions: "Aligned Call center liaison reports with"
    },
    {
      id: "2.2",
      objective: "Finalize TE plan for zone 1 targeting Madison, Taylor, Dixie, and Levy by 6:00pm 11/17",
      status: "Achieved",
      actions: ""
    },
    {
      id: "3.1",
      objective: "Complete planning assessing warehouse capacity needed to support Withlacoochee flooding and DR requirements by 6:00pm 11/16.",
      status: "In Progress",
      actions: ""
    },
    {
      id: "3.2",
      objective: "Complete full transition of Team Mewborn to Immediate Assistance Leadership Team (IALT) by 6:00pm 11/18.",
      status: "In Progress",
      actions: "Working on transition documents"
    }
  ]);
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Incident Priorities and Objectives</h2>
        
        <div className="mb-6">
          <h3 className="font-bold mb-2">Incident Priorities:</h3>
          <ol className="list-decimal list-inside space-y-1">
            {priorities.map((priority, i) => (
              <li key={i} className="pl-2">{priority}</li>
            ))}
          </ol>
        </div>
        
        <div>
          <h3 className="font-bold mb-2">Incident Objectives:</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-2 text-left w-16">#</th>
                <th className="border border-black p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {objectives.map(obj => (
                <tr key={obj.id}>
                  <td className="border border-black p-2">{obj.id}</td>
                  <td className="border border-black p-2 text-sm">{obj.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-2 text-right">
          <button className="text-red-600 font-bold hover:underline text-sm">
            Return to Main Menu
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Status of Previous Operating Period's Objectives</h2>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left w-16">Obj #</th>
              <th className="border border-black p-2 text-left">Objective</th>
              <th className="border border-black p-2 text-left w-32">Status</th>
              <th className="border border-black p-2 text-left">Significant Actions</th>
            </tr>
          </thead>
          <tbody>
            {previousStatus.map(item => (
              <tr key={item.id}>
                <td className="border border-black p-2 text-sm">{item.id}</td>
                <td className="border border-black p-2 text-sm">{item.objective}</td>
                <td className="border border-black p-2 text-sm">{item.status}</td>
                <td className="border border-black p-2 text-sm">{item.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-2 text-right">
          <button className="text-red-600 font-bold hover:underline text-sm">
            Return to Main Menu
          </button>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Incident Open Action Tracker</h2>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2">ID</th>
              <th className="border border-black p-2">Mission Title</th>
              <th className="border border-black p-2">Status</th>
              <th className="border border-black p-2">Requestor Agency Type</th>
              <th className="border border-black p-2">Mission Owner Name</th>
              <th className="border border-black p-2">Due Date</th>
              <th className="border border-black p-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2">52</td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>
        
        <div className="mt-2 text-right">
          <button className="text-red-600 font-bold hover:underline text-sm">
            Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}


// Page 5 (continued): Work Assignments
function WorkAssignmentsPage({ isEditing }: { isEditing: boolean }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-blue-600">Work Assignments</h2>
      
      <div className="bg-gray-700 text-white p-2 mb-4">
        <h3 className="font-bold">DRO – Recovery</h3>
      </div>
      
      <div className="mb-4">
        <p><strong>Operations Leadership</strong></p>
        <p>AD Operations – La Forice Nealy (202-527-4598)</p>
        <p>HQ Client Care Chief – 0</p>
        <p>HQ Recovery Manager – Jerry Hanson (717-378-9114)</p>
      </div>
      
      <div className="bg-gray-700 text-white p-2 mb-4">
        <h3 className="font-bold">DRO – Recovery Resources</h3>
      </div>
      
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-black p-2 text-left">Resource ID</th>
            <th className="border border-black p-2 text-left">Leader Name & Contact Information</th>
            <th className="border border-black p-2 text-left">Total # of Persons</th>
            <th className="border border-black p-2 text-left">Reporting Location</th>
            <th className="border border-black p-2 text-left">Reporting Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2">IA-AO Recovery - HUR Helene</td>
            <td className="border border-black p-2">Jerry Hanson (717-378-9114)</td>
            <td className="border border-black p-2">CARE/MN – 1</td>
            <td className="border border-black p-2">Tallahassee<br/>1115 Easterwood Dr<br/>Tallahassee, FL 32311</td>
            <td className="border border-black p-2"></td>
          </tr>
          <tr className="bg-yellow-100">
            <td colSpan={5} className="border border-black p-2">
              <strong>Work Assignment</strong><br/>
              Lead Recovery IA mission in Zone 1
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Recovery Planning Casework Zone 1</td>
            <td className="border border-black p-2">Laura Dean (315-945-3792)</td>
            <td className="border border-black p-2">CARE/MN – 1<br/>CARE/SV – 2<br/>CARE/SA – 5</td>
            <td className="border border-black p-2">Virtual</td>
            <td className="border border-black p-2"></td>
          </tr>
          <tr className="bg-yellow-100">
            <td colSpan={5} className="border border-black p-2">
              <strong>Work Assignment</strong><br/>
              Provide clients with resources to aid in their recovery
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2">Virtual Intake Team</td>
            <td className="border border-black p-2">Jerry Hanson (717-378-9114)</td>
            <td className="border border-black p-2">DAT/SA – 6</td>
            <td className="border border-black p-2">Virtual</td>
            <td className="border border-black p-2"></td>
          </tr>
          <tr className="bg-yellow-100">
            <td colSpan={5} className="border border-black p-2">
              <strong>Work Assignment</strong><br/>
              Contacting confirmed MDD households to open cases where we have been able to find phone numbers
            </td>
          </tr>
        </tbody>
      </table>
      
      <div className="text-right">
        <button className="text-red-600 font-bold hover:underline">
          Return to Main Menu
        </button>
      </div>
    </div>
  );
}

// Page 6: Work Sites and start of General Messages
function WorkSitesAndMessagesPage({ isEditing }: { isEditing: boolean }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-blue-600">Work Sites</h2>
      
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-black p-2 text-left">Facility</th>
            <th className="border border-black p-2 text-left">Type</th>
            <th className="border border-black p-2 text-left">County</th>
            <th className="border border-black p-2 text-left">Address</th>
            <th className="border border-black p-2 text-left">Zip</th>
            <th className="border border-black p-2 text-left">ARC POC</th>
            <th className="border border-black p-2 text-left">Phone</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-2">Florida State EOC - Emergency Operations Center</td>
            <td className="border border-black p-2">EOC</td>
            <td className="border border-black p-2">Leon County, FL</td>
            <td className="border border-black p-2">2555 Shumard Oak Blvd,</td>
            <td className="border border-black p-2">32399</td>
            <td className="border border-black p-2">Ryan Lock</td>
            <td className="border border-black p-2">(850) 354-2342</td>
          </tr>
          <tr>
            <td className="border border-black p-2">HQ - DRO HQ</td>
            <td className="border border-black p-2">DRO HQ</td>
            <td className="border border-black p-2">Hillsborough County, FL</td>
            <td className="border border-black p-2">3310 W. Main St.</td>
            <td className="border border-black p-2">33607</td>
            <td className="border border-black p-2">Deb Lopez</td>
            <td className="border border-black p-2">(302) 690-1844</td>
          </tr>
          <tr>
            <td className="border border-black p-2">Refresco Beverages - Warehouse</td>
            <td className="border border-black p-2">Warehouse</td>
            <td className="border border-black p-2">Pasco County, FL</td>
            <td className="border border-black p-2">15340 Citrus County Dr.</td>
            <td className="border border-black p-2">33523</td>
            <td className="border border-black p-2">DeeDee Larson</td>
            <td className="border border-black p-2">(605) 929-2569</td>
          </tr>
          <tr>
            <td className="border border-black p-2">Tallahassee- Zone 1</td>
            <td className="border border-black p-2">Zone 1</td>
            <td className="border border-black p-2">Leon County, FL</td>
            <td className="border border-black p-2">1115 Easterwood Dr.</td>
            <td className="border border-black p-2">32311</td>
            <td className="border border-black p-2">Kevin Watt</td>
            <td className="border border-black p-2">(615) 939-3840</td>
          </tr>
          <tr>
            <td className="border border-black p-2">TPA Basecamp - Shelter</td>
            <td className="border border-black p-2">Shelter</td>
            <td className="border border-black p-2">Hillsborough County, FL</td>
            <td className="border border-black p-2">4232 N Westshore Blvd</td>
            <td className="border border-black p-2">33614</td>
            <td className="border border-black p-2">Chris Purnell</td>
            <td className="border border-black p-2">(202) 809-0919</td>
          </tr>
        </tbody>
      </table>
      
      <h2 className="text-2xl font-bold mb-6 text-blue-600">General Messages</h2>
      
      <div className="text-center bg-red-600 text-white p-4 rounded mb-6">
        <h3 className="text-xl font-bold mb-2">General Messages Menu</h3>
        <p>Link back to this Menu is the title of the message you are in.</p>
      </div>
      
      <table className="w-full mb-6">
        <tbody>
          <tr>
            <td className="border border-black p-2 bg-yellow-200 font-bold">Welcome</td>
            <td className="border border-black p-2 bg-yellow-200 font-bold">ARC Emergency App</td>
            <td className="border border-black p-2 bg-yellow-200 font-bold">Signing Authority</td>
            <td className="border border-black p-2 bg-yellow-200 font-bold">Weather Forecast</td>
          </tr>
          <tr>
            <td className="border border-black p-2 bg-yellow-200 font-bold">Health & Safety</td>
            <td className="border border-black p-2 bg-yellow-200 font-bold">Out-processing</td>
            <td className="border border-black p-2 bg-yellow-200 font-bold">Base Camp</td>
            <td className="border border-black p-2 bg-gray-200">Evaluations</td>
          </tr>
        </tbody>
      </table>
      
      <div className="text-right">
        <button className="text-red-600 font-bold hover:underline">
          Return to Main Menu
        </button>
      </div>
    </div>
  );
}

// Page 7: General Messages Content
function GeneralMessagesPage({ isEditing }: { isEditing: boolean }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-blue-600">Welcome</h3>
        <p className="mb-2">
          Welcome to DRO 220-25. The <strong>DR 220-25 Orientation (FLOCOM)</strong> has been{" "}
          <a href="#" className="text-blue-600 underline">uploaded to YouTube</a>, try this link if haven't attended our Orientation in person.
        </p>
        <div className="text-right">
          <button className="text-red-600 font-bold hover:underline">
            Return to Main Menu
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4 text-blue-600">Health & Safety</h3>
        <p className="mb-2">
          If you are experiencing any symptoms—such as cold symptoms, allergies, or any other illness—<strong>DO NOT REPORT TO WORK</strong>. 
          Instead, please call Staff Health at 571-635-6509 and notify your supervisor.
        </p>
        <div className="text-right">
          <button className="text-red-600 font-bold hover:underline">
            Return to Main Menu
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4 text-blue-600">Base Camp</h3>
        <p className="mb-2">
          Tampa HQ base camp is at Tampa Airport located 4232 North Westshore Blvd, Tampa, FL, 33614
        </p>
        <div className="text-right">
          <button className="text-red-600 font-bold hover:underline">
            Return to Main Menu
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4 text-blue-600">ARC Emergency App</h3>
        <p className="mb-4">
          Download the ARC Emergency App. Make sure to check that your "Live Locations" reflects where you currently are located.
        </p>
        <div className="flex gap-4 mb-4">
          <img src="/app-store-badge.png" alt="Download on App Store" className="h-12" />
          <img src="/google-play-badge.png" alt="Get it on Google Play" className="h-12" />
        </div>
        <div className="text-right">
          <button className="text-red-600 font-bold hover:underline">
            Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

// Page 8: Out-Processing and other messages
function OutProcessingPage({ isEditing }: { isEditing: boolean }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4 text-blue-600">Out-Processing</h3>
        
        <div className="bg-yellow-100 p-4 mb-4 rounded">
          <h4 className="font-bold mb-2 text-center text-red-600">(Must be submitted by 12:00pm NOON)</h4>
          <p>
            Staff Services Lodging must process all lodging requests. Staff Services will ensure that all responders who need lodging will have it.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>To make Staff Services Lodging aware of a change in lodging location, supervisors and above should submit a lodging request change using the following DRO Lodging Request Form.</li>
            <li>If an urgent lodging change is required, please directly call the 24-hour Staff Lodging number, after hours that number is for emergencies only.</li>
          </ul>
        </div>
        
        <div className="border border-black p-4">
          <h4 className="font-bold mb-2 underline">OUT-PROCESSING CHECKLIST</h4>
          
          <div className="space-y-4">
            <div>
              <p className="font-bold">Performance Evaluation</p>
              <p className="pl-4">○ Discuss and receive your evaluation from your supervisor BEFORE you leave the operation.</p>
            </div>
            
            <div>
              <p className="font-bold">Travel Arrangements home - AIR</p>
              <p className="pl-4">○ If flying, contact CWT at 888-435-7913 to book your flight prior to out-processing.</p>
              <p className="pl-4">○ Departure travel may be booked no sooner than 48 hours from your departure date.</p>
            </div>
            
            <div>
              <p className="font-bold">Staff Services/Out-processing</p>
              <p className="pl-4">○ Please Out-Process in-person, if possible. Due to the remote nature of your location, you can out process by calling or texting 571-562-1867. If you text, please provide the following information:</p>
              <ol className="list-decimal list-inside pl-8">
                <li>Member #</li>
                <li>Last working date.</li>
                <li>Travel home date.</li>
                <li>Expected arrival home date.</li>
                <li>Mode of transportation.</li>
              </ol>
            </div>
            
            <div>
              <p className="font-bold">Disaster Services Technology (DST)</p>
              <p className="pl-4">○ Check out with DST: turn in cell phone, chargers, computer, and any other accessories you may have for the operation.</p>
              <p className="pl-4">○ If in North Florida, DST equipment should be turned in to the ARC Office front desk between 9am and 3pm.</p>
            </div>
            
            <div>
              <p className="font-bold">Ground Transportation</p>
              <p className="pl-4">○ Shuttles are available to airport contact 571-562-1334.</p>
              <p className="pl-4">○ Check out with transportation 571-562-1334 if you have been issued a vehicle.</p>
            </div>
            
            <div>
              <p className="font-bold">Mission Card</p>
              <p className="pl-4">○ Please check your balance and you may request reload on the Volunteer Connection app.</p>
              <p className="pl-4">○ The Mission card tile in the Volunteer Connection App will disappear once you out-process.</p>
              <p className="pl-4">○ Mission card can still be used for travel home expenses and meals.</p>
              <p className="pl-4">○ Reconciliation of funds, including reimbursement for personal funds used, should be done as soon as you get home (Mission Card Cardholder Instructions)</p>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <button className="text-red-600 font-bold hover:underline">
            Return to Main Menu
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4 text-blue-600">Evaluations</h3>
        <p className="mb-4">
          Supervisors, please remember to complete evaluations for those leaving the operation. To assist in completing evaluations in a timely manner, you may include the following:
        </p>
        <div className="bg-gray-100 p-4 rounded italic text-sm">
          DR220 was a challenging incident and required high flexibility due to its rapidly changing pace at a moment's notice. This was a level 7 response resulting from hurricanes Helene (Cat 4) and Milton (Cat 3) each making landfall in Florida only 17 days apart. Prior to Milton's landfall, we assisted the State of Florida with over 82,000 people in evacuation centers spanning across the state. During Milton's landfall, over 40 tornadoes caused damage spanning coast to coast. Since shelters were opened, the Red Cross and our partners have provided over 17,500 overnight stays in 356 emergency shelters. With the help of partners, a total of 78,1198 meals and snacks have been provided. Over 72,153 relief items including comfort kits and other supplies have been provided to people in need and 7,442 total households have been served. The operation has been supported by 1,900 trained Red Cross disaster workers who continue to bring hope to the state of Florida daily.
        </div>
        <div className="text-right mt-4">
          <button className="text-red-600 font-bold hover:underline">
            Return to Main Menu
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4 text-blue-600">Signing Authority</h3>
        <p className="font-bold mb-2">SIGNING AUTHORITY for 6409s and Purchase Requests</p>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left">Command</th>
              <th className="border border-black p-2 text-left">Name</th>
              <th className="border border-black p-2 text-left">Authorization Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2">DRO Director</td>
              <td className="border border-black p-2">Virginia Mewborn</td>
              <td className="border border-black p-2">SDP</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Deputy DRO Director</td>
              <td className="border border-black p-2">Jennie Sahagun</td>
              <td className="border border-black p-2">$100,000</td>
            </tr>
            <tr>
              <td className="border border-black p-2">AD Operations</td>
              <td className="border border-black p-2">La Forice Nealy</td>
              <td className="border border-black p-2">$25,000</td>
            </tr>
            <tr>
              <td className="border border-black p-2">AD Logistics</td>
              <td className="border border-black p-2">Deb Lopez</td>
              <td className="border border-black p-2">$25,000</td>
            </tr>
            <tr>
              <td className="border border-black p-2">AD Workforce</td>
              <td className="border border-black p-2">Chris Purnell</td>
              <td className="border border-black p-2">$1,500</td>
            </tr>
            <tr>
              <td className="border border-black p-2">AD Information & Planning</td>
              <td className="border border-black p-2">Richard Goldfarb</td>
              <td className="border border-black p-2">$500</td>
            </tr>
            <tr>
              <td className="border border-black p-2">AD External Relations</td>
              <td className="border border-black p-2">Sandy Hughes</td>
              <td className="border border-black p-2">$500</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Logistics Chief</td>
              <td className="border border-black p-2">Eva Hall</td>
              <td className="border border-black p-2">$10,000</td>
            </tr>
            <tr>
              <td className="border border-black p-2">DST Chief</td>
              <td className="border border-black p-2">Jim Moran</td>
              <td className="border border-black p-2">$15,000</td>
            </tr>
          </tbody>
        </table>
        
        <div className="text-right mt-4">
          <button className="text-red-600 font-bold hover:underline">
            Return to Main Menu
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4 text-blue-600">Weather Forecast</h3>
        <p className="mb-4">
          <a href="#" className="text-blue-600 underline">Weather Prediction Center</a>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-400 p-2">
            <h4 className="font-bold mb-2 text-center">24-Hour Day 1 QPF</h4>
            <div className="bg-gray-200 h-48 flex items-center justify-center">
              [Weather Map 1]
            </div>
          </div>
          <div className="border border-gray-400 p-2">
            <h4 className="font-bold mb-2 text-center">7 Day Total Precipitation</h4>
            <div className="bg-gray-200 h-48 flex items-center justify-center">
              [Weather Map 2]
            </div>
          </div>
        </div>
        
        <div className="text-right mt-4">
          <button className="text-red-600 font-bold hover:underline">
            Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

// Page 9: Daily Schedule
function DailySchedulePage({ isEditing }: { isEditing: boolean }) {
  const [schedule] = useState([
    {
      time: "9:00 AM",
      product: "Priorities",
      location: "HQ Leadership Room",
      attendance: "DRO Director, Deputy Director, All AD's"
    },
    {
      time: "12:00 PM",
      product: "Logistics Team Call",
      location: "Microsoft Teams Invite",
      attendance: "All Logistics Team"
    },
    {
      time: "1:00 PM",
      product: "Transition Planning",
      location: "HQ Leadership Room/Microsoft Teams invite",
      attendance: "DRO Leadership Team"
    },
    {
      time: "5:00 PM",
      product: "IAP Distributed",
      location: "Email",
      attendance: "All assigned staff in Volunteer Connection and additional personnel"
    }
  ]);
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-blue-600">Daily Schedule</h2>
      <p className="text-red-600 font-bold mb-4">All times are Eastern Standard Time.</p>
      
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-black p-2 text-left">Time</th>
            <th className="border border-black p-2 text-left">Product/Meeting</th>
            <th className="border border-black p-2 text-left">Location</th>
            <th className="border border-black p-2 text-left">Required Attendance/Participation</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((item, i) => (
            <tr key={i} className={item.product === "Transition Planning" ? "bg-yellow-200" : ""}>
              <td className="border border-black p-2">{item.time}</td>
              <td className="border border-black p-2 font-bold">{item.product}</td>
              <td className="border border-black p-2 italic">{item.location}</td>
              <td className="border border-black p-2">{item.attendance}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-8">
        <p className="text-sm text-gray-600">
          This completes the IAP Document for DR 220-25 FLOCOM
        </p>
      </div>
    </div>
  );
}