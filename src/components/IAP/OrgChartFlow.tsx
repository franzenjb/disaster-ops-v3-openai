'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  ConnectionMode,
  Panel,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import { simpleStore } from '@/lib/simple-store';

interface RosterPosition {
  id: string;
  title: string;
  name?: string;
  phone?: string;
  email?: string;
  category: string;
  reportsTo?: string;
}

// Custom node component defined outside to prevent re-creation
const CustomNode = React.memo(({ data }: { data: any }) => {
  const bgColor = 
    data.category === 'Command' ? 'bg-gradient-to-br from-red-100 to-red-200 border-red-600' :
    data.category === 'Operations' ? 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-600' :
    data.category === 'Logistics Section' ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-600' :
    data.category === '24 Hour Lines' ? 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-600' :
    'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-600';
  
  return (
    <div className={`relative px-4 py-3 shadow-xl rounded-lg border-2 ${bgColor} min-w-[200px] max-w-[250px]`}>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: '#555', width: 8, height: 8 }}
      />
      <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">{data.title}</div>
      {data.name && (
        <>
          <div className="text-sm font-bold mt-1">{data.name}</div>
          {data.phone && (
            <a 
              href={`tel:${data.phone}`} 
              className="text-xs text-blue-700 hover:underline block mt-1 font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              📞 {data.phone}
            </a>
          )}
          {data.email && (
            <a 
              href={`mailto:${data.email}`} 
              className="text-xs text-blue-700 hover:underline block"
              onClick={(e) => e.stopPropagation()}
            >
              ✉️ {data.email.replace('@redcross.org', '')}
            </a>
          )}
        </>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: '#555', width: 8, height: 8 }}
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

// Define nodeTypes outside component to prevent re-creation
const nodeTypes = {
  custom: CustomNode,
};

export function OrgChartFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const roster = simpleStore.getContactRoster();
    if (roster && roster.length > 0) {
      generateFlowChart(roster);
    } else {
      // Generate sample chart for demonstration
      generateSampleChart();
    }
    setIsLoading(false);
  }, []);
  
  const generateFlowChart = (roster: RosterPosition[]) => {
    const filledPositions = roster.filter(p => p.name);
    if (filledPositions.length === 0) {
      generateSampleChart();
      return;
    }
    
    // Build hierarchy levels
    const levels: { [key: number]: RosterPosition[] } = {
      0: [], // Top level (DRO Directors)
      1: [], // Direct reports to DRO
      2: [], // Second level
      3: [], // Third level
      4: []  // Fourth level
    };
    
    // Categorize by level
    filledPositions.forEach(pos => {
      if (pos.title.includes('DRO Director')) {
        levels[0].push(pos);
      } else if (!pos.reportsTo || levels[0].some(p => p.id === pos.reportsTo)) {
        levels[1].push(pos);
      } else if (levels[1].some(p => p.id === pos.reportsTo)) {
        levels[2].push(pos);
      } else if (levels[2].some(p => p.id === pos.reportsTo)) {
        levels[3].push(pos);
      } else {
        levels[4].push(pos);
      }
    });
    
    // Create nodes
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    let yPosition = 50;
    
    Object.entries(levels).forEach(([level, positions]) => {
      const levelNum = parseInt(level);
      const spacing = 280;
      const startX = (positions.length * spacing) / -2 + spacing / 2;
      
      positions.forEach((pos, index) => {
        flowNodes.push({
          id: pos.id,
          type: 'custom',
          position: { x: startX + index * spacing, y: levelNum * 150 + yPosition },
          data: {
            title: pos.title,
            name: pos.name,
            phone: pos.phone,
            email: pos.email,
            category: pos.category
          }
        });
        
        // Create edges with proper handle IDs
        if (pos.reportsTo && filledPositions.find(p => p.id === pos.reportsTo)) {
          flowEdges.push({
            id: `${pos.reportsTo}-${pos.id}`,
            source: pos.reportsTo,
            target: pos.id,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#9ca3af', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af' }
          });
        }
      });
    });
    
    setNodes(flowNodes);
    setEdges(flowEdges);
  };
  
  const generateSampleChart = () => {
    // Sample data for demonstration
    const sampleNodes: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { 
          title: 'DRO Director',
          name: 'Virginia Mewborn',
          phone: '917-670-8334',
          email: 'Virginia.Mewborn@redcross.org',
          category: 'Command'
        }
      },
      {
        id: '2',
        type: 'custom',
        position: { x: -300, y: 150 },
        data: {
          title: 'AD Operations',
          name: 'Patricia DAlessandro',
          phone: '319-404-2096',
          email: 'Patricia.DAlessandro@redcross.org',
          category: 'Operations'
        }
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 0, y: 150 },
        data: {
          title: 'Chief of Staff',
          name: 'Janice Vannatta',
          phone: '601-325-3656',
          email: 'Janice.Vannatta@redcross.org',
          category: 'Command'
        }
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 300, y: 150 },
        data: {
          title: 'AD Logistics',
          name: 'Marvin Williams',
          phone: '931-237-3823',
          email: 'Marvin.Williams@redcross.org',
          category: 'Logistics Section'
        }
      },
      {
        id: '5',
        type: 'custom',
        position: { x: -450, y: 300 },
        data: {
          title: 'Zone 1 Coordinator',
          name: 'Rick Schou',
          phone: '980-721-8710',
          category: 'Operations'
        }
      },
      {
        id: '6',
        type: 'custom',
        position: { x: -150, y: 300 },
        data: {
          title: 'Mass Care Chief',
          name: 'Brenda Bridges',
          phone: '760-987-5452',
          category: 'Operations'
        }
      },
      {
        id: '7',
        type: 'custom',
        position: { x: 150, y: 300 },
        data: {
          title: 'Transportation Manager',
          name: 'Lee Meyer',
          phone: '719-749-5672',
          category: 'Logistics Section'
        }
      },
      {
        id: '8',
        type: 'custom',
        position: { x: 450, y: 300 },
        data: {
          title: 'Warehousing Manager',
          name: 'Boo White',
          phone: '804-253-7276',
          category: 'Logistics Section'
        }
      }
    ];
    
    const sampleEdges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2', sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', animated: false },
      { id: 'e1-3', source: '1', target: '3', sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', animated: false },
      { id: 'e1-4', source: '1', target: '4', sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', animated: false },
      { id: 'e2-5', source: '2', target: '5', sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', animated: false },
      { id: 'e2-6', source: '2', target: '6', sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', animated: false },
      { id: 'e4-7', source: '4', target: '7', sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', animated: false },
      { id: 'e4-8', source: '4', target: '8', sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep', animated: false },
    ];
    
    setNodes(sampleNodes);
    setEdges(sampleEdges);
  };
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading organizational chart...</div>;
  }
  
  return (
    <div className="p-4">
      {/* Header */}
      <div className="border-b-2 border-black pb-2 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-8">
            <div>
              <span className="font-bold">Incident Name:</span> FLOCOM
            </div>
            <div>
              <span className="font-bold">DR Number:</span> 220-25
            </div>
          </div>
          <div>
            <span className="font-bold">Operational Period:</span> 18:00 20/10/2024 to 17:59 21/10/2024
          </div>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Incident Organization Chart</h2>
      
      <div className="bg-yellow-50 border border-yellow-300 p-2 mb-4 text-sm">
        <strong>Interactive Chart:</strong> Drag to pan, scroll to zoom, click phone numbers to call.
        This chart auto-generates from the Contact Roster data.
      </div>
      
      {/* ReactFlow Chart */}
      <div className="border-2 border-gray-300 rounded-lg bg-gray-50" style={{ width: '100%', height: '600px', position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background gap={12} size={1} />
          <Panel position="top-right" className="bg-white p-2 rounded shadow">
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-200 border border-red-600 rounded"></div>
                <span>Command</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 border border-blue-600 rounded"></div>
                <span>Operations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-200 border border-green-600 rounded"></div>
                <span>Logistics</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
      
      {/* Footer */}
      <div className="mt-8 border-t-2 border-black pt-4 flex justify-between">
        <div>
          <span className="font-bold">Prepared By:</span> Gary Pelletier<br />
          Information & Planning
        </div>
        <div className="text-right">
          Page 8 of 53
        </div>
      </div>
    </div>
  );
}