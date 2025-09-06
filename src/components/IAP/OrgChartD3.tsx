'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { simpleStore } from '@/lib/simple-store';

interface OrgNode {
  id: string;
  title: string;
  name?: string;
  phone?: string;
  email?: string;
  category: string;
  reportsTo?: string;
  children?: OrgNode[];
}

export function OrgChartD3() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [orgData, setOrgData] = useState<OrgNode | null>(null);
  
  useEffect(() => {
    const roster = simpleStore.getContactRoster();
    if (roster && roster.length > 0) {
      const tree = buildHierarchy(roster);
      setOrgData(tree);
      if (tree) {
        drawChart(tree);
      }
    }
  }, []);
  
  const buildHierarchy = (roster: any[]): OrgNode | null => {
    // Filter to only positions with names assigned
    const filledPositions = roster.filter((r: any) => r.name);
    
    if (filledPositions.length === 0) {
      return null;
    }
    
    // Create a map of id to node
    const nodeMap: { [key: string]: OrgNode } = {};
    filledPositions.forEach((pos: any) => {
      nodeMap[pos.id] = {
        id: pos.id,
        title: pos.title,
        name: pos.name,
        phone: pos.phone,
        email: pos.email,
        category: pos.category,
        reportsTo: pos.reportsTo,
        children: []
      };
    });
    
    // Build the tree structure
    let root: OrgNode | null = null;
    const orphans: OrgNode[] = [];
    
    Object.values(nodeMap).forEach(node => {
      if (!node.reportsTo || !nodeMap[node.reportsTo]) {
        // This is a root node or orphan
        if (node.title.includes('DRO Director') && node.name) {
          root = node;
        } else {
          orphans.push(node);
        }
      } else {
        // Add to parent's children
        const parent = nodeMap[node.reportsTo];
        if (parent) {
          parent.children?.push(node);
        }
      }
    });
    
    // If no root found, use first filled position
    if (!root && filledPositions.length > 0) {
      root = nodeMap[filledPositions[0].id];
    }
    
    // Add orphans to root if they exist
    if (root && orphans.length > 0) {
      orphans.forEach(orphan => {
        if (!root!.children?.find(c => c.id === orphan.id)) {
          if (!root!.children) root!.children = [];
          root!.children.push(orphan);
        }
      });
    }
    
    return root;
  };
  
  const drawChart = (data: OrgNode) => {
    if (!svgRef.current) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    const width = 1200;
    const height = 800;
    const nodeWidth = 180;
    const nodeHeight = 80;
    
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    const g = svg.append("g")
      .attr("transform", "translate(100,50)");
    
    // Create tree layout
    const treeLayout = d3.tree<OrgNode>()
      .size([width - 200, height - 100])
      .nodeSize([nodeWidth + 20, nodeHeight + 40]);
    
    // Create hierarchy
    const root = d3.hierarchy(data);
    const treeData = treeLayout(root);
    
    // Draw links
    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2)
      .attr("d", d3.linkVertical<any, any>()
        .x((d: any) => d.x)
        .y((d: any) => d.y));
    
    // Draw nodes
    const nodes = g.selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    
    // Add rectangles for nodes
    nodes.append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("x", -nodeWidth / 2)
      .attr("y", -nodeHeight / 2)
      .attr("rx", 5)
      .attr("fill", (d: any) => {
        const category = d.data.category;
        if (category === 'Command') return '#fee2e2';
        if (category === 'Operations') return '#dbeafe';
        if (category === 'Logistics Section') return '#dcfce7';
        return '#f3f4f6';
      })
      .attr("stroke", (d: any) => {
        const category = d.data.category;
        if (category === 'Command') return '#dc2626';
        if (category === 'Operations') return '#2563eb';
        if (category === 'Logistics Section') return '#16a34a';
        return '#6b7280';
      })
      .attr("stroke-width", 2);
    
    // Add text for title
    nodes.append("text")
      .attr("dy", "-0.5em")
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "11px")
      .text((d: any) => d.data.title);
    
    // Add text for name
    nodes.append("text")
      .attr("dy", "0.5em")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text((d: any) => d.data.name || '');
    
    // Add text for phone (clickable)
    nodes.append("text")
      .attr("dy", "1.5em")
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#2563eb")
      .style("cursor", "pointer")
      .text((d: any) => d.data.phone || '')
      .on("click", (event: any, d: any) => {
        if (d.data.phone) {
          window.location.href = `tel:${d.data.phone}`;
        }
      });
    
    // Enable zoom and pan
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoom as any);
  };
  
  if (!orgData) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No organizational data available.</p>
        <p className="text-sm mt-2">Please fill out the Contact Roster first and ensure "Reports To" fields are set.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      {/* Header matching IAP format */}
      <div className="border-b-2 border-black pb-2 mb-6">
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
      
      <h2 className="text-2xl font-bold text-center mb-4">Incident Organization Chart</h2>
      
      <div className="bg-gray-50 border border-gray-300 rounded p-2 mb-4 text-sm">
        <strong>Instructions:</strong> This chart is automatically generated from the Contact Roster. 
        Use "Reports To" field in Contact Roster to define reporting relationships. 
        Zoom and pan to navigate. Click phone numbers to call.
      </div>
      
      <div className="overflow-auto border-2 border-gray-300 rounded bg-white">
        <svg ref={svgRef}></svg>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-600 rounded"></div>
          <span className="text-sm">Command</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-600 rounded"></div>
          <span className="text-sm">Operations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-600 rounded"></div>
          <span className="text-sm">Logistics</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 border-t-2 border-black pt-4 flex justify-between">
        <div>
          <span className="font-bold">Prepared By:</span> Gary Pelletier<br />
          Information & Planning
        </div>
        <div className="text-right">
          Page 7 of 53
        </div>
      </div>
    </div>
  );
}