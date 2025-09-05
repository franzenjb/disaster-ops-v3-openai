#!/usr/bin/env python3
"""
Red Cross Org Chart Generator using Graphviz
Generates professional org charts from Contact Roster data
"""

import json
import os
from graphviz import Digraph

def load_roster_from_localstorage():
    """
    Load roster data from the browser's localStorage export
    You can export this from the browser console with:
    copy(JSON.parse(localStorage.getItem('disaster_ops_data')).contactRoster)
    """
    # For now, we'll use sample data matching your Red Cross roster
    sample_roster = [
        {"id": "cmd-dro", "title": "DRO Director", "name": "Virginia Mewborn", 
         "phone": "917-670-8334", "email": "Virginia.Mewborn@redcross.org", "category": "Command"},
        {"id": "cmd-rcco", "title": "RCCO", "name": "Ryan Lock", 
         "phone": "850-354-2342", "email": "Ryan.Lock3@redcross.org", "category": "Command", "reportsTo": "cmd-dro"},
        {"id": "cmd-cos", "title": "Chief of Staff", "name": "Janice Vannatta", 
         "phone": "601-325-3656", "email": "Janice.Vannatta4@redcross.org", "category": "Command", "reportsTo": "cmd-dro"},
        {"id": "ops-ad", "title": "AD Operations", "name": "Patricia DAlessandro", 
         "phone": "319-404-2096", "email": "Patricia.DAlessandro2@redcross.org", "category": "Operations", "reportsTo": "cmd-dro"},
        {"id": "ops-zone1", "title": "Zone Coordinator-Zone 1", "name": "Rick Schou", 
         "phone": "980-721-8710", "email": "Rick.Schou@redcross.org", "category": "Operations", "reportsTo": "ops-ad"},
        {"id": "ops-zone2", "title": "Zone Coordinator-Zone 2", "name": "Bene Hunter", 
         "phone": "941-224-3350", "email": "Bene.Hunter2@redcross.org", "category": "Operations", "reportsTo": "ops-ad"},
        {"id": "ops-mass", "title": "HQ Mass Care Chief", "name": "Brenda Bridges", 
         "phone": "760-987-5452", "email": "brenda.bridges2@redcross.org", "category": "Operations", "reportsTo": "ops-ad"},
        {"id": "log-ad", "title": "AD Logistics", "name": "Marvin Williams", 
         "phone": "931-237-3823", "email": "Marvin.Williams2@redcross.org", "category": "Logistics Section", "reportsTo": "cmd-dro"},
        {"id": "log-chief", "title": "HQ Logistics Chief", "name": "Margenia Hatfield", 
         "phone": "765-602-9133", "email": "Margenia.Hatfield@redcross.org", "category": "Logistics Section", "reportsTo": "log-ad"},
        {"id": "log-transport", "title": "HQ Transportation Manager", "name": "Lee Meyer", 
         "phone": "719-749-5672", "email": "Lee.Meyer@redcross.org", "category": "Logistics Section", "reportsTo": "log-chief"},
    ]
    
    # Check if there's a roster.json file
    if os.path.exists('roster.json'):
        with open('roster.json', 'r') as f:
            return json.load(f)
    
    return sample_roster

def create_org_chart(roster_data, output_format='pdf'):
    """
    Create a professional org chart using Graphviz
    """
    # Create a new directed graph
    dot = Digraph(comment='Red Cross Incident Organization Chart')
    dot.attr(rankdir='TB')  # Top to Bottom layout
    dot.attr('node', shape='box', style='rounded,filled', fontname='Arial', fontsize='10')
    dot.attr('edge', color='gray', arrowsize='0.8')
    
    # Define colors for categories
    colors = {
        'Command': '#ffcccc',  # Light red
        'Operations': '#ccddff',  # Light blue
        'Logistics Section': '#ccffcc',  # Light green
        '24 Hour Lines': '#ffccff',  # Light purple
        'default': '#f0f0f0'  # Light gray
    }
    
    # Add nodes
    for person in roster_data:
        if person.get('name'):  # Only include positions with names
            # Format the label with HTML-like formatting
            label = f"<<B>{person['title']}</B><BR/>"
            label += f"<B>{person['name']}</B><BR/>"
            if person.get('phone'):
                label += f"<FONT POINT-SIZE='9'>Phone: {person['phone']}</FONT><BR/>"
            if person.get('email'):
                email_display = person['email'].replace('@redcross.org', '')
                label += f"<FONT POINT-SIZE='9'>Email: {email_display}</FONT>"
            label += ">"
            
            # Get color based on category
            fill_color = colors.get(person.get('category', ''), colors['default'])
            
            # Add node with styling
            dot.node(person['id'], label=label, fillcolor=fill_color)
    
    # Add edges (reporting relationships)
    for person in roster_data:
        if person.get('name') and person.get('reportsTo'):
            # Check if the supervisor exists in our data
            supervisor = next((p for p in roster_data if p['id'] == person['reportsTo']), None)
            if supervisor and supervisor.get('name'):
                dot.edge(person['reportsTo'], person['id'])
    
    # Add title and footer
    dot.attr(label='\\n\\nIncident Organization Chart\\nFLOCOM - DR 220-25\\nOperational Period: 18:00 20/10/2024 to 17:59 21/10/2024\\n\\n')
    dot.attr(fontsize='12', labelloc='t')
    
    # Render the chart
    output_filename = 'org_chart'
    dot.render(output_filename, format=output_format, cleanup=True, view=False)
    
    # Also create an SVG for web use (clickable links)
    dot.format = 'svg'
    dot.render(output_filename, cleanup=True, view=False)
    
    print(f"✅ Org chart generated: {output_filename}.{output_format}")
    print(f"✅ Web version generated: {output_filename}.svg")
    
    return dot

def create_html_wrapper(svg_file='org_chart.svg'):
    """
    Create an HTML file with the SVG embedded and clickable phone/email links
    """
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Red Cross Organization Chart</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: white;
            padding: 20px;
            border-bottom: 3px solid #dc2626;
            margin-bottom: 20px;
        }
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow-x: auto;
        }
        svg {
            max-width: 100%;
            height: auto;
        }
        .footer {
            margin-top: 20px;
            padding: 20px;
            background: white;
            border-top: 2px solid #333;
        }
    </style>
    <script>
        // Make phone numbers and emails clickable
        window.onload = function() {
            const svg = document.querySelector('svg');
            if (svg) {
                // Find all text elements with phone numbers
                const texts = svg.querySelectorAll('text');
                texts.forEach(text => {
                    const content = text.textContent;
                    // Phone number pattern
                    if (content && content.includes('📞')) {
                        const phone = content.match(/[0-9-]+/);
                        if (phone) {
                            text.style.cursor = 'pointer';
                            text.style.fill = '#2563eb';
                            text.onclick = () => window.location.href = 'tel:' + phone[0].replace(/-/g, '');
                        }
                    }
                    // Email pattern
                    if (content && content.includes('✉️')) {
                        text.style.cursor = 'pointer';
                        text.style.fill = '#2563eb';
                        text.onclick = () => {
                            const email = content.replace('✉️', '').trim() + '@redcross.org';
                            window.location.href = 'mailto:' + email;
                        };
                    }
                });
            }
        };
    </script>
</head>
<body>
    <div class="header">
        <h1>Incident Organization Chart</h1>
        <p><strong>Incident Name:</strong> FLOCOM | <strong>DR Number:</strong> 220-25</p>
        <p><strong>Operational Period:</strong> 18:00 20/10/2024 to 17:59 21/10/2024</p>
    </div>
    
    <div class="chart-container">
        <object data="org_chart.svg" type="image/svg+xml" width="100%">
            <img src="org_chart.svg" alt="Organization Chart" />
        </object>
    </div>
    
    <div class="footer">
        <p><strong>Prepared By:</strong> Gary Pelletier<br/>Information & Planning</p>
        <p>Page 8 of 53</p>
    </div>
</body>
</html>"""
    
    with open('org_chart.html', 'w') as f:
        f.write(html_content)
    
    print(f"✅ Interactive HTML version generated: org_chart.html")
    print("📱 Phone numbers and emails are clickable!")

if __name__ == "__main__":
    print("🚀 Red Cross Org Chart Generator")
    print("-" * 40)
    
    # Load roster data
    roster = load_roster_from_localstorage()
    print(f"📊 Loaded {len(roster)} positions")
    print(f"👥 {len([p for p in roster if p.get('name')])} positions filled")
    
    # Generate the chart
    print("\n📈 Generating org chart...")
    create_org_chart(roster, output_format='pdf')
    
    # Create HTML wrapper for interactive version
    print("\n🌐 Creating interactive web version...")
    create_html_wrapper()
    
    print("\n✨ Done! Your org charts are ready:")
    print("  - org_chart.pdf (for printing)")
    print("  - org_chart.svg (for web)")
    print("  - org_chart.html (interactive with clickable contacts)")