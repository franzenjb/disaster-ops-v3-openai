-- American Red Cross Organizational Structure
-- This is the permanent reference database for ARC geography
-- Last Updated: December 2024

-- =====================================================
-- DIVISIONS (7 total)
-- =====================================================
CREATE TABLE IF NOT EXISTS arc_divisions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    headquarters_city VARCHAR(100),
    headquarters_state VARCHAR(2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO arc_divisions (code, name, headquarters_city, headquarters_state) VALUES
('ATL', 'Atlantic Division', 'Philadelphia', 'PA'),
('CEN', 'Central Division', 'Chicago', 'IL'),
('NCL', 'North Central Division', 'Minneapolis', 'MN'),
('PAC', 'Pacific Division', 'Sacramento', 'CA'),
('SCL', 'South Central Division', 'Dallas', 'TX'),
('SOU', 'Southern Division', 'Atlanta', 'GA'),
('NCR', 'National Capital & Virginia Region', 'Washington', 'DC');

-- =====================================================
-- REGIONS (60+ regions across the US)
-- =====================================================
CREATE TABLE IF NOT EXISTS arc_regions (
    id SERIAL PRIMARY KEY,
    division_code VARCHAR(10) REFERENCES arc_divisions(code),
    region_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    headquarters_city VARCHAR(100),
    headquarters_state VARCHAR(2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atlantic Division Regions
INSERT INTO arc_regions (division_code, region_code, name, headquarters_city, headquarters_state) VALUES
('ATL', 'EPA', 'Eastern Pennsylvania Region', 'Philadelphia', 'PA'),
('ATL', 'GNY', 'Greater New York Region', 'New York', 'NY'),
('ATL', 'NJ', 'New Jersey Region', 'Fairfield', 'NJ'),
('ATL', 'CPA', 'Central Pennsylvania Region', 'Harrisburg', 'PA'),
('ATL', 'WPA', 'Western Pennsylvania Region', 'Pittsburgh', 'PA'),
('ATL', 'WENY', 'Western & Central New York Region', 'Rochester', 'NY'),
('ATL', 'NENY', 'Northeastern New York Region', 'Albany', 'NY'),
('ATL', 'LI', 'Long Island Region', 'Mineola', 'NY'),
('ATL', 'DEL', 'Delmarva Region', 'Salisbury', 'MD'),
('ATL', 'MD', 'Central Maryland Region', 'Baltimore', 'MD'),
('ATL', 'NCR', 'National Capital Region', 'Washington', 'DC');

-- Central Division Regions
INSERT INTO arc_regions (division_code, region_code, name, headquarters_city, headquarters_state) VALUES
('CEN', 'CGC', 'Chicago & Northern Illinois Region', 'Chicago', 'IL'),
('CEN', 'CIL', 'Central Illinois Region', 'Peoria', 'IL'),
('CEN', 'SIL', 'Southern Illinois Region', 'Marion', 'IL'),
('CEN', 'IND', 'Indiana Region', 'Indianapolis', 'IN'),
('CEN', 'WMI', 'West Michigan Region', 'Grand Rapids', 'MI'),
('CEN', 'SEMI', 'Southeastern Michigan Region', 'Detroit', 'MI'),
('CEN', 'NMI', 'Northern Michigan Region', 'Saginaw', 'MI'),
('CEN', 'NEO', 'Northeast Ohio Region', 'Cleveland', 'OH'),
('CEN', 'CEO', 'Central & Southern Ohio Region', 'Columbus', 'OH'),
('CEN', 'NWO', 'Northwest Ohio Region', 'Toledo', 'OH'),
('CEN', 'WV', 'West Virginia Region', 'Charleston', 'WV'),
('CEN', 'KY', 'Kentucky Region', 'Louisville', 'KY');

-- North Central Division Regions
INSERT INTO arc_regions (division_code, region_code, name, headquarters_city, headquarters_state) VALUES
('NCL', 'MN', 'Minnesota & Dakotas Region', 'St. Paul', 'MN'),
('NCL', 'WIS', 'Wisconsin Region', 'Madison', 'WI'),
('NCL', 'IA', 'Iowa Region', 'Des Moines', 'IA'),
('NCL', 'NEB', 'Nebraska & Southwest Iowa Region', 'Omaha', 'NE'),
('NCL', 'MO', 'Missouri-Arkansas Region', 'St. Louis', 'MO'),
('NCL', 'KS', 'Kansas & Oklahoma Region', 'Wichita', 'KS'),
('NCL', 'COL', 'Colorado & Wyoming Region', 'Denver', 'CO'),
('NCL', 'MT', 'Montana Region', 'Great Falls', 'MT');

-- Pacific Division Regions
INSERT INTO arc_regions (division_code, region_code, name, headquarters_city, headquarters_state) VALUES
('PAC', 'NCA', 'Northern California Coastal Region', 'San Francisco', 'CA'),
('PAC', 'GS', 'Gold Country Region', 'Sacramento', 'CA'),
('PAC', 'CCA', 'Central California Region', 'Fresno', 'CA'),
('PAC', 'CCV', 'California Central Coast Region', 'San Luis Obispo', 'CA'),
('PAC', 'LA', 'Los Angeles Region', 'Los Angeles', 'CA'),
('PAC', 'SD', 'San Diego & Imperial Counties Region', 'San Diego', 'CA'),
('PAC', 'AZ', 'Arizona Region', 'Phoenix', 'AZ'),
('PAC', 'SNV', 'Southern Nevada Region', 'Las Vegas', 'NV'),
('PAC', 'NNV', 'Northern Nevada Region', 'Reno', 'NV'),
('PAC', 'NM', 'New Mexico Region', 'Albuquerque', 'NM'),
('PAC', 'HI', 'Hawaii State Region', 'Honolulu', 'HI'),
('PAC', 'AK', 'Alaska Region', 'Anchorage', 'AK'),
('PAC', 'OR', 'Oregon Region', 'Portland', 'OR'),
('PAC', 'WA', 'Northwest Region', 'Seattle', 'WA'),
('PAC', 'ID', 'Idaho & Eastern Oregon Region', 'Boise', 'ID'),
('PAC', 'UT', 'Utah & Southwest Wyoming Region', 'Salt Lake City', 'UT');

-- South Central Division Regions
INSERT INTO arc_regions (division_code, region_code, name, headquarters_city, headquarters_state) VALUES
('SCL', 'NTX', 'North Texas Region', 'Dallas', 'TX'),
('SCL', 'CTX', 'Central & South Texas Region', 'Austin', 'TX'),
('SCL', 'SETX', 'Texas Gulf Coast Region', 'Houston', 'TX'),
('SCL', 'WTX', 'West Texas Region', 'El Paso', 'TX'),
('SCL', 'LA', 'Louisiana Region', 'Baton Rouge', 'LA'),
('SCL', 'MS', 'Mississippi Region', 'Jackson', 'MS'),
('SCL', 'TEN', 'Tennessee Region', 'Nashville', 'TN');

-- Southern Division Regions
INSERT INTO arc_regions (division_code, region_code, name, headquarters_city, headquarters_state) VALUES
('SOU', 'AL', 'Alabama Region', 'Birmingham', 'AL'),
('SOU', 'NFL', 'North Florida Region', 'Tallahassee', 'FL'),
('SOU', 'CFL', 'Central Florida Region', 'Tampa', 'FL'),
('SOU', 'SFL', 'South Florida Region', 'Miami', 'FL'),
('SOU', 'GA', 'Georgia Region', 'Atlanta', 'GA'),
('SOU', 'NC', 'North Carolina Region', 'Charlotte', 'NC'),
('SOU', 'SC', 'South Carolina Region', 'Columbia', 'SC'),
('SOU', 'VA', 'Virginia Region', 'Richmond', 'VA'),
('SOU', 'PR', 'Puerto Rico Region', 'San Juan', 'PR');

-- =====================================================
-- STATES AND TERRITORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS arc_states (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_territory BOOLEAN DEFAULT FALSE,
    fema_region INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert all 50 states
INSERT INTO arc_states (code, name, fema_region) VALUES
('AL', 'Alabama', 4),
('AK', 'Alaska', 10),
('AZ', 'Arizona', 9),
('AR', 'Arkansas', 6),
('CA', 'California', 9),
('CO', 'Colorado', 8),
('CT', 'Connecticut', 1),
('DE', 'Delaware', 3),
('FL', 'Florida', 4),
('GA', 'Georgia', 4),
('HI', 'Hawaii', 9),
('ID', 'Idaho', 10),
('IL', 'Illinois', 5),
('IN', 'Indiana', 5),
('IA', 'Iowa', 7),
('KS', 'Kansas', 7),
('KY', 'Kentucky', 4),
('LA', 'Louisiana', 6),
('ME', 'Maine', 1),
('MD', 'Maryland', 3),
('MA', 'Massachusetts', 1),
('MI', 'Michigan', 5),
('MN', 'Minnesota', 5),
('MS', 'Mississippi', 4),
('MO', 'Missouri', 7),
('MT', 'Montana', 8),
('NE', 'Nebraska', 7),
('NV', 'Nevada', 9),
('NH', 'New Hampshire', 1),
('NJ', 'New Jersey', 2),
('NM', 'New Mexico', 6),
('NY', 'New York', 2),
('NC', 'North Carolina', 4),
('ND', 'North Dakota', 8),
('OH', 'Ohio', 5),
('OK', 'Oklahoma', 6),
('OR', 'Oregon', 10),
('PA', 'Pennsylvania', 3),
('RI', 'Rhode Island', 1),
('SC', 'South Carolina', 4),
('SD', 'South Dakota', 8),
('TN', 'Tennessee', 4),
('TX', 'Texas', 6),
('UT', 'Utah', 8),
('VT', 'Vermont', 1),
('VA', 'Virginia', 3),
('WA', 'Washington', 10),
('WV', 'West Virginia', 3),
('WI', 'Wisconsin', 5),
('WY', 'Wyoming', 8),
('DC', 'District of Columbia', 3);

-- Insert territories
INSERT INTO arc_states (code, name, is_territory, fema_region) VALUES
('PR', 'Puerto Rico', TRUE, 2),
('VI', 'US Virgin Islands', TRUE, 2),
('GU', 'Guam', TRUE, 9),
('AS', 'American Samoa', TRUE, 9),
('MP', 'Northern Mariana Islands', TRUE, 9);

-- =====================================================
-- CHAPTERS (250+ chapters)
-- =====================================================
CREATE TABLE IF NOT EXISTS arc_chapters (
    id SERIAL PRIMARY KEY,
    region_code VARCHAR(20) REFERENCES arc_regions(region_code),
    chapter_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state_code VARCHAR(2) REFERENCES arc_states(code),
    zip VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample chapters (would need all 250+ in production)
INSERT INTO arc_chapters (region_code, chapter_code, name, city, state_code) VALUES
-- Florida chapters
('CFL', 'CFL-TB', 'Tampa Bay Chapter', 'Tampa', 'FL'),
('CFL', 'CFL-CF', 'Central Florida Chapter', 'Orlando', 'FL'),
('CFL', 'CFL-SC', 'Suncoast Chapter', 'Sarasota', 'FL'),
('SFL', 'SFL-MI', 'Greater Miami & The Keys Chapter', 'Miami', 'FL'),
('SFL', 'SFL-PB', 'Palm Beach County Chapter', 'West Palm Beach', 'FL'),
('SFL', 'SFL-BR', 'Broward County Chapter', 'Fort Lauderdale', 'FL'),
('NFL', 'NFL-NE', 'Northeast Florida Chapter', 'Jacksonville', 'FL'),
('NFL', 'NFL-CP', 'Capital Area Chapter', 'Tallahassee', 'FL'),
('NFL', 'NFL-NW', 'Northwest Florida Chapter', 'Pensacola', 'FL');

-- =====================================================
-- COUNTIES (3,000+ counties/parishes)
-- =====================================================
CREATE TABLE IF NOT EXISTS arc_counties (
    id SERIAL PRIMARY KEY,
    state_code VARCHAR(2) REFERENCES arc_states(code),
    county_fips VARCHAR(5) UNIQUE NOT NULL,
    county_name VARCHAR(100) NOT NULL,
    county_type VARCHAR(20) DEFAULT 'County', -- County, Parish, Borough, etc.
    population INTEGER,
    area_sq_miles DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- County to Chapter mapping (many-to-many as some counties are served by multiple chapters)
CREATE TABLE IF NOT EXISTS arc_county_chapters (
    id SERIAL PRIMARY KEY,
    county_fips VARCHAR(5) REFERENCES arc_counties(county_fips),
    chapter_code VARCHAR(50) REFERENCES arc_chapters(chapter_code),
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(county_fips, chapter_code)
);

-- Sample Florida counties
INSERT INTO arc_counties (state_code, county_fips, county_name, population) VALUES
('FL', '12001', 'Alachua', 278468),
('FL', '12003', 'Baker', 29210),
('FL', '12005', 'Bay', 175216),
('FL', '12007', 'Bradford', 28201),
('FL', '12009', 'Brevard', 606612),
('FL', '12011', 'Broward', 1952778),
('FL', '12013', 'Calhoun', 13648),
('FL', '12015', 'Charlotte', 188910),
('FL', '12017', 'Citrus', 153843),
('FL', '12019', 'Clay', 219252),
('FL', '12021', 'Collier', 375752),
('FL', '12023', 'Columbia', 71686),
('FL', '12027', 'DeSoto', 38001),
('FL', '12029', 'Dixie', 16826),
('FL', '12031', 'Duval', 995237),
('FL', '12033', 'Escambia', 321905),
('FL', '12035', 'Flagler', 115378),
('FL', '12037', 'Franklin', 12451),
('FL', '12039', 'Gadsden', 43826),
('FL', '12041', 'Gilchrist', 18582),
('FL', '12043', 'Glades', 12126),
('FL', '12045', 'Gulf', 14750),
('FL', '12047', 'Hamilton', 14525),
('FL', '12049', 'Hardee', 25327),
('FL', '12051', 'Hendry', 42022),
('FL', '12053', 'Hernando', 194515),
('FL', '12055', 'Highlands', 103503),
('FL', '12057', 'Hillsborough', 1459762),
('FL', '12059', 'Holmes', 19653),
('FL', '12061', 'Indian River', 159788),
('FL', '12063', 'Jackson', 46414),
('FL', '12065', 'Jefferson', 14510),
('FL', '12067', 'Lafayette', 8422),
('FL', '12069', 'Lake', 383956),
('FL', '12071', 'Lee', 760822),
('FL', '12073', 'Leon', 293582),
('FL', '12075', 'Levy', 42915),
('FL', '12077', 'Liberty', 7974),
('FL', '12079', 'Madison', 17968),
('FL', '12081', 'Manatee', 399710),
('FL', '12083', 'Marion', 375908),
('FL', '12085', 'Martin', 158431),
('FL', '12086', 'Miami-Dade', 2716940),
('FL', '12087', 'Monroe', 82874),
('FL', '12089', 'Nassau', 90352),
('FL', '12091', 'Okaloosa', 211668),
('FL', '12093', 'Okeechobee', 39572),
('FL', '12095', 'Orange', 1429908),
('FL', '12097', 'Osceola', 388656),
('FL', '12099', 'Palm Beach', 1496770),
('FL', '12101', 'Pasco', 561891),
('FL', '12103', 'Pinellas', 974996),
('FL', '12105', 'Polk', 724777),
('FL', '12107', 'Putnam', 73321),
('FL', '12109', 'St. Johns', 273425),
('FL', '12111', 'St. Lucie', 329226),
('FL', '12113', 'Santa Rosa', 188000),
('FL', '12115', 'Sarasota', 434006),
('FL', '12117', 'Seminole', 471826),
('FL', '12119', 'Sumter', 136369),
('FL', '12121', 'Suwannee', 44417),
('FL', '12123', 'Taylor', 21569),
('FL', '12125', 'Union', 15138),
('FL', '12127', 'Volusia', 553543),
('FL', '12129', 'Wakulla', 33764),
('FL', '12131', 'Walton', 75305),
('FL', '12133', 'Washington', 25473);

-- Map counties to chapters
INSERT INTO arc_county_chapters (county_fips, chapter_code) VALUES
-- Tampa Bay area
('12057', 'CFL-TB'), -- Hillsborough
('12103', 'CFL-TB'), -- Pinellas
('12101', 'CFL-TB'), -- Pasco
('12053', 'CFL-TB'), -- Hernando
-- Miami area
('12086', 'SFL-MI'), -- Miami-Dade
('12087', 'SFL-MI'), -- Monroe (Keys)
-- Broward
('12011', 'SFL-BR'), -- Broward
-- Palm Beach
('12099', 'SFL-PB'), -- Palm Beach
-- Central Florida
('12095', 'CFL-CF'), -- Orange
('12097', 'CFL-CF'), -- Osceola
('12117', 'CFL-CF'), -- Seminole
('12069', 'CFL-CF'), -- Lake
('12127', 'CFL-CF'), -- Volusia
-- Northeast Florida
('12031', 'NFL-NE'), -- Duval
('12109', 'NFL-NE'), -- St. Johns
('12019', 'NFL-NE'); -- Clay

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_regions_division ON arc_regions(division_code);
CREATE INDEX idx_chapters_region ON arc_chapters(region_code);
CREATE INDEX idx_chapters_state ON arc_chapters(state_code);
CREATE INDEX idx_counties_state ON arc_counties(state_code);
CREATE INDEX idx_counties_name ON arc_counties(county_name);
CREATE INDEX idx_county_chapters_county ON arc_county_chapters(county_fips);
CREATE INDEX idx_county_chapters_chapter ON arc_county_chapters(chapter_code);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Complete hierarchy view
CREATE OR REPLACE VIEW v_arc_complete_hierarchy AS
SELECT 
    d.name as division_name,
    d.code as division_code,
    r.name as region_name,
    r.region_code,
    c.name as chapter_name,
    c.chapter_code,
    c.city as chapter_city,
    c.state_code as chapter_state,
    co.county_name,
    co.county_fips,
    co.state_code as county_state,
    co.population
FROM arc_divisions d
JOIN arc_regions r ON d.code = r.division_code
JOIN arc_chapters c ON r.region_code = c.region_code
JOIN arc_county_chapters cc ON c.chapter_code = cc.chapter_code
JOIN arc_counties co ON cc.county_fips = co.county_fips
ORDER BY d.name, r.name, c.name, co.county_name;

-- Counties by region view
CREATE OR REPLACE VIEW v_counties_by_region AS
SELECT 
    r.name as region_name,
    r.region_code,
    COUNT(DISTINCT co.county_fips) as county_count,
    SUM(co.population) as total_population
FROM arc_regions r
JOIN arc_chapters c ON r.region_code = c.region_code
JOIN arc_county_chapters cc ON c.chapter_code = cc.chapter_code
JOIN arc_counties co ON cc.county_fips = co.county_fips
GROUP BY r.name, r.region_code
ORDER BY r.name;

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Get all counties for a region
CREATE OR REPLACE FUNCTION get_counties_by_region(p_region_code VARCHAR)
RETURNS TABLE (
    county_fips VARCHAR,
    county_name VARCHAR,
    state_code VARCHAR,
    chapter_name VARCHAR,
    population INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        co.county_fips,
        co.county_name,
        co.state_code,
        ch.name as chapter_name,
        co.population
    FROM arc_counties co
    JOIN arc_county_chapters cc ON co.county_fips = cc.county_fips
    JOIN arc_chapters ch ON cc.chapter_code = ch.chapter_code
    WHERE ch.region_code = p_region_code
    ORDER BY co.state_code, co.county_name;
END;
$$ LANGUAGE plpgsql;

-- Get chapters serving a county
CREATE OR REPLACE FUNCTION get_chapters_for_county(p_county_fips VARCHAR)
RETURNS TABLE (
    chapter_code VARCHAR,
    chapter_name VARCHAR,
    is_primary BOOLEAN,
    region_name VARCHAR,
    division_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ch.chapter_code,
        ch.name as chapter_name,
        cc.is_primary,
        r.name as region_name,
        d.name as division_name
    FROM arc_county_chapters cc
    JOIN arc_chapters ch ON cc.chapter_code = ch.chapter_code
    JOIN arc_regions r ON ch.region_code = r.region_code
    JOIN arc_divisions d ON r.division_code = d.code
    WHERE cc.county_fips = p_county_fips
    ORDER BY cc.is_primary DESC, ch.name;
END;
$$ LANGUAGE plpgsql;