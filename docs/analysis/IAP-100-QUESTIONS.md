# IAP System - 100 Comprehensive Questions

## Current Understanding
The platform is a disaster operations system that replaces Excel-based IAP (Incident Action Plan) generation with a modern event-sourced architecture. It generates professional 53-page documents matching Red Cross standards.

## Core Questions by Category

### 1. IAP Document Structure (Questions 1-15)

1. **What are ALL 53 pages of the IAP?** Can you list each page title and its purpose?
2. **Which pages are mandatory vs optional?** Are there conditions that trigger certain pages?
3. **What is the exact order of pages?** Is this order fixed or configurable?
4. **Cover Page specifics:** What exact fields appear? Logo placement? Operation name format?
5. **Director's Message:** How long is typical? Can it include photos? What formatting options?
6. **Organization Chart:** Is this auto-generated from staffing? What hierarchy rules apply?
7. **Work Sites Table:** What columns exactly? How are sites ordered (by type, geography, priority)?
8. **Work Assignments:** One per facility? Multiple per facility? How are they numbered?
9. **Contact Roster:** Is this just key personnel or everyone? What contact info is shown?
10. **Daily Schedule:** What types of events? How far out does it plan?
11. **ICS Forms:** Which specific ICS forms are included (204, 205, 206, 207, etc.)?
12. **Maps/Charts:** Are facility maps included? Evacuation routes? Service areas?
13. **Resource Lists:** Equipment inventories? Supply lists? Vehicle assignments?
14. **Appendices:** What supplementary materials? Weather forecasts? Policy updates?
15. **Version control:** How are revisions marked? Change tracking between versions?

### 2. Operational Workflow (Questions 16-30)

16. **Who creates the initial IAP?** Is it one person or collaborative from the start?
17. **When does IAP creation begin?** Before operations start? Day 1? After setup?
18. **What triggers a new IAP?** Daily? Operational period change? Significant events?
19. **The "6PM deadline" - why 6PM?** Distribution timing? Briefing schedule?
20. **How long before 6PM do people start working on it?** 2 hours? All day?
21. **Review process:** Who must approve before distribution? How many sign-offs?
22. **Distribution:** Email? Print? Portal? Who gets it automatically?
23. **Field feedback:** How do field teams report back on work assignments?
24. **Update frequency:** Can IAP be updated mid-operational-period?
25. **Emergency changes:** Process for urgent updates outside normal cycle?
26. **Handoff process:** How does night shift get their IAP? Different from day?
27. **Multi-day operations:** Does each day build on previous? Fresh start?
28. **Scale triggers:** When does operation need an IAP? 10 people? 50? Any disaster?
29. **Closing process:** Final IAP? After-action items? Archive requirements?
30. **Integration points:** Does IAP data flow to other Red Cross systems?

### 3. Roles and Permissions (Questions 31-45)

31. **I&P Group composition:** How many people typically? Specific positions?
32. **I&P Group permissions:** Can they edit everything? Delete things? Override field input?
33. **Discipline Team structure:** One per service line? Geographic? Mixed?
34. **Discipline Team scope:** Only their facilities? Can they see others' work?
35. **Field Team definition:** Individual volunteers? Crew leaders? Site managers?
36. **Field Team needs:** What do they need from IAP? Work location? Times? Resources?
37. **Viewer role:** Who needs view-only? External partners? Media? Government?
38. **Role assignment:** Who assigns roles? Can people have multiple roles?
39. **Role changes:** How often do roles change during operation? Process?
40. **Approval chains:** Different approval requirements by role? By section?
41. **Override authority:** Who can override field-reported data? Audit trail?
42. **Cross-team visibility:** Can feeding team see shelter plans? Should they?
43. **Escalation paths:** When field disagrees with assignment, who resolves?
44. **Training requirements:** What training needed for each role? Certification?
45. **Backup roles:** What happens when I&P lead is unavailable? Succession?

### 4. Data and Integration (Questions 46-60)

46. **Personnel source:** Red Cross volunteer database? Manual entry? Both?
47. **Facility data:** Pre-loaded facilities? Create new? Import from where?
48. **Resource tracking:** Real-time inventory? Manual counts? Integration with logistics?
49. **Geographic data:** County boundaries? Service areas? Population data? From where?
50. **Weather integration:** Auto-pull forecasts? Manual entry? Update frequency?
51. **Vehicle tracking:** GPS integration? Manual check-in? Route planning?
52. **Financial data:** Cost tracking in IAP? Budget visibility? Approval limits?
53. **Communication systems:** Radio channels in IAP? Phone trees? Apps?
54. **Partner coordination:** How are partner orgs included? Data sharing agreements?
55. **Historical data:** Previous disasters available for reference? Lessons learned?
56. **Compliance tracking:** Required reports? Government forms? Auto-generated?
57. **Performance metrics:** What KPIs in IAP? Response times? Meals served?
58. **Document management:** Where are supporting documents stored? Linked?
59. **Translation needs:** Multiple languages? Which sections? Auto-translate?
60. **Accessibility:** Screen reader compatible? Large print versions? Audio?

### 5. Technical and Operational Details (Questions 61-75)

61. **Offline scenarios:** How long can system run offline? Days? Weeks?
62. **Sync conflicts:** What if two people edit same facility offline? Resolution?
63. **Data size:** How big does IAP database get? 1000 facilities? 10000 people?
64. **Performance requirements:** Generate 53-page PDF in how many seconds?
65. **Concurrent users:** Support how many simultaneous editors? Viewers?
66. **Device support:** Tablets? Phones? Which browsers? Minimum specs?
67. **Printing:** Special requirements? Page breaks? Margins? Paper size?
68. **Network:** Bandwidth requirements? Work on satellite? Cell hotspot?
69. **Backup frequency:** How often backed up? Where? Recovery time?
70. **Security:** Encryption requirements? PII handling? Access logs?
71. **Audit requirements:** What must be logged? How long retained?
72. **Archive format:** Final storage format? PDF? Database? Both?
73. **Search capabilities:** Search across IAPs? By date? Person? Facility?
74. **Bulk operations:** Import 100 facilities at once? Mass assignments?
75. **API needs:** External systems need IAP data? What format? Push or pull?

### 6. Real-World Scenarios (Questions 76-90)

76. **Hurricane scenario:** How does IAP handle 72-hour activation? Evacuation tracking?
77. **Wildfire scenario:** Rapidly changing perimeter? Evacuation zones? Air quality?
78. **Flood scenario:** Inaccessible areas? Changing road conditions? Shelter capacity?
79. **Multi-state disaster:** Coordination across regions? Unified or separate IAPs?
80. **Small local fire:** Is full IAP overkill? Simplified version? Thresholds?
81. **Mass casualty:** Health services integration? Hospital coordination? HIPAA?
82. **Power outage:** Extended offline operation? Battery backup? Paper fallback?
83. **Staff shortage:** Minimum viable IAP team? Automated sections? Priorities?
84. **Rapid escalation:** 10 to 1000 people in hours? System scaling? Pre-positioning?
85. **De-escalation:** Reducing operations? Facility closure process? Staff release?
86. **Weather delays:** Push IAP deadline? Partial distribution? Weather windows?
87. **VIP visits:** Special IAP sections? Media talking points? Security plans?
88. **Partner integration:** Salvation Army facilities in IAP? Government resources?
89. **Donations surge:** Spontaneous volunteers? Unsolicited goods? Tracking?
90. **Recovery transition:** When does IAP end? Hand-off to recovery? Archive?

### 7. User Experience and Training (Questions 91-100)

91. **Current pain points:** What breaks most in Excel? Macros? Formulas? Merging?
92. **Training time:** How long to train new I&P member? Field user? Manager?
93. **Error recovery:** Common mistakes? Undo capabilities? Validation helps?
94. **Mobile experience:** What do field teams need on phone? Full IAP? Just assignments?
95. **Dashboard priorities:** What metrics most important? Real-time? Trends?
96. **Notification needs:** What triggers alerts? To whom? How urgent?
97. **Report customization:** Standard reports? Ad-hoc queries? Export formats?
98. **Language/terminology:** Red Cross specific terms? Regional differences? Glossary?
99. **Success metrics:** What makes a "good" IAP? Speed? Completeness? Accuracy?
100. **Change management:** How to transition from Excel? Parallel run? Pilot approach?

## Next Steps

These questions will help us understand:
- The exact requirements for the 53-page IAP document
- Real-world operational workflows and constraints  
- Integration needs with existing Red Cross systems
- Critical features vs nice-to-haves
- Performance and reliability requirements

Let's go through these systematically to ensure we're building exactly what's needed for real disaster operations.