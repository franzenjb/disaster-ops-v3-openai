'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronRight, BookOpen, Users, Truck, Heart } from 'lucide-react';

interface InstructionSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function InstructionSection({ id, title, icon, children, defaultExpanded = false }: InstructionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 rounded-lg mb-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg"
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

interface IAP215InstructionsProps {
  section?: 'feeding' | 'des' | 'idc' | 'all';
  compact?: boolean;
  className?: string;
}

export function IAP215Instructions({ 
  section = 'all', 
  compact = false, 
  className = '' 
}: IAP215InstructionsProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
        >
          <HelpCircle className="h-4 w-4" />
          <span>215 Instructions</span>
        </button>
        
        {isVisible && (
          <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <IAP215Instructions section={section} />
            </div>
          </div>
        )}
      </div>
    );
  }

  const feedingSection = (section === 'all' || section === 'feeding') && (
    <InstructionSection
      id="feeding"
      title="Feeding Work Assignments"
      icon={<Truck className="h-5 w-5 text-orange-600" />}
      defaultExpanded={section === 'feeding'}
    >
      <div className="space-y-3">
        <div className="bg-orange-50 border border-orange-200 rounded p-3">
          <h4 className="font-medium text-orange-900 mb-2">Responsibility</h4>
          <p className="text-sm text-orange-800">
            The <strong>HQ Feeding Manager</strong> completes the Feeding Planning Worksheet at the DRO.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Key Components:</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <strong>Meal Production:</strong> Identifies field kitchens, partner facilities, vendors, caterers, and shelf-stable options controlled by DRO Headquarters
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>Distribution Resources:</strong> ERVs and additional feeding vehicles assigned to districts
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>Service Delivery:</strong> Meals assigned to production sites or service delivery sites like shelters
            </div>
          </div>
        </div>

        <div className="border-l-4 border-orange-500 pl-3">
          <p className="text-sm text-gray-700">
            <strong>Work Assignment Process:</strong> Each location identifies food sources (field kitchens, vendors, caterers) and available meals per day for distribution.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="font-medium text-blue-900 mb-1">Sample Work Assignment</h4>
          <p className="text-xs text-blue-800">
            "Distribute 4,000 meals from Field Kitchen #1" or "Operate Field Kitchen #1 to produce 10,000 meals. Allocate 6,000 meals for district D1 and 4,000 meals for distribution to D2."
          </p>
        </div>
      </div>
    </InstructionSection>
  );

  const desSection = (section === 'all' || section === 'des') && (
    <InstructionSection
      id="des"
      title="Distribution of Emergency Supplies (DES)"
      icon={<BookOpen className="h-5 w-5 text-green-600" />}
      defaultExpanded={section === 'des'}
    >
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <h4 className="font-medium text-green-900 mb-2">Responsibility</h4>
          <p className="text-sm text-green-800">
            The <strong>HQ DES Manager</strong> completes the DES Planning Worksheet at the DRO.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Process Overview:</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <strong>District Assignment:</strong> HQ DES Manager provides separate entry for each district in the DRO, or combines if no districts established
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>Household Allocation:</strong> Each district/delivery site assigned households per day for distribution
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>Resource Management:</strong> HQ DES Manager directs supplies to locations and manages shared resources
            </div>
          </div>
        </div>

        <div className="border-l-4 border-green-500 pl-3">
          <p className="text-sm text-gray-700">
            <strong>Coordination:</strong> For DES Warehouses and Warehouse sites shared with Logistics, the HQ DES Manager is responsible for requisitioning supplies and directing to assigned locations.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="font-medium text-blue-900 mb-1">Sample Work Assignment</h4>
          <p className="text-xs text-blue-800">
            "Distribute 200 households of emergency supplies from Warehouse #1" or "Manage and Operate a DES warehouse to provide 400 households of emergency supplies. Allocate 200 D1 and 200 to D2."
          </p>
        </div>
      </div>
    </InstructionSection>
  );

  const idcSection = (section === 'all' || section === 'idc') && (
    <InstructionSection
      id="idc"
      title="Individual Disaster Care (IDC)"
      icon={<Heart className="h-5 w-5 text-purple-600" />}
      defaultExpanded={section === 'idc'}
    >
      <div className="space-y-3">
        <div className="bg-purple-50 border border-purple-200 rounded p-3">
          <h4 className="font-medium text-purple-900 mb-2">Responsibility</h4>
          <p className="text-sm text-purple-800">
            The <strong>HQ IDC Activity Managers</strong> (Disaster Health Services, Disaster Mental Health, Disaster Spiritual Care) complete the IDC tab at the DRO.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Service Integration:</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <strong>Shelter Integration:</strong> IDC personnel assigned to a site should be captured on the respective 215 tab (e.g., DHS staff operating in a shelter on the Shelter Planning Worksheet)
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>Condolence Care:</strong> Integrated team approach with multiple disciplines working together
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>MARC Activities:</strong> Disaster Mental Health, Disaster Health Services, and Disaster Spiritual Care coordination
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="font-medium text-blue-900 mb-1">Sample Work Assignment</h4>
          <p className="text-xs text-blue-800">
            "Integrated Condolence Care Team performs integrated condolence care activities" or "Perform DMH, DHS and DSC activities at the MARC."
          </p>
        </div>
      </div>
    </InstructionSection>
  );

  const templateSection = (section === 'all') && (
    <InstructionSection
      id="template"
      title="Template Worksheets"
      icon={<BookOpen className="h-5 w-5 text-blue-600" />}
    >
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="font-medium text-blue-900 mb-2">Flexibility for Additional Activities</h4>
          <p className="text-sm text-blue-800">
            The Template Worksheet tab can be duplicated for other activities as required (examples: Recovery MARCs, Government Operations EOC, etc.).
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> See the READ ME tab for details on duplicating the template for additional activities.
          </p>
        </div>
      </div>
    </InstructionSection>
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Users className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">IAP Work Assignment Guidelines (Form 215)</h2>
      </div>
      
      <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
        These instructions explain how to properly structure work assignments for different Red Cross activities. Each section has specific responsibilities and coordination requirements.
      </div>

      {feedingSection}
      {desSection}
      {idcSection}
      {templateSection}
    </div>
  );
}

export default IAP215Instructions;