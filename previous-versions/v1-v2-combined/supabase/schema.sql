-- Disaster Operations Platform Database Schema
-- Run this in the Supabase SQL Editor to create the required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Operations table
CREATE TABLE IF NOT EXISTS operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id VARCHAR(255) UNIQUE NOT NULL,
    operation_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Service line updates table
CREATE TABLE IF NOT EXISTS service_line_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id VARCHAR(255) NOT NULL REFERENCES operations(operation_id) ON DELETE CASCADE,
    service_line VARCHAR(100) NOT NULL,
    line_number INTEGER NOT NULL,
    value NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id VARCHAR(255),
    user_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IAPs table
CREATE TABLE IF NOT EXISTS iaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id VARCHAR(255) NOT NULL REFERENCES operations(operation_id) ON DELETE CASCADE,
    iap_number VARCHAR(50) NOT NULL,
    operational_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    operational_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    data JSONB NOT NULL,
    cover_photo TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    UNIQUE(operation_id, iap_number)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id VARCHAR(255) REFERENCES operations(operation_id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    action VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id VARCHAR(255),
    user_name VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_operations_operation_id ON operations(operation_id);
CREATE INDEX idx_operations_dates ON operations(start_date, end_date);
CREATE INDEX idx_service_line_updates_operation ON service_line_updates(operation_id, timestamp DESC);
CREATE INDEX idx_service_line_updates_service_line ON service_line_updates(service_line, line_number);
CREATE INDEX idx_iaps_operation ON iaps(operation_id, created_at DESC);
CREATE INDEX idx_iaps_status ON iaps(status);
CREATE INDEX idx_audit_log_operation ON audit_log(operation_id, timestamp DESC);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_iaps_updated_at BEFORE UPDATE ON iaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log(operation_id, table_name, record_id, action, old_data)
        VALUES(OLD.operation_id, TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log(operation_id, table_name, record_id, action, old_data, new_data)
        VALUES(NEW.operation_id, TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log(operation_id, table_name, record_id, action, new_data)
        VALUES(NEW.operation_id, TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit triggers
CREATE TRIGGER audit_operations_trigger
AFTER INSERT OR UPDATE OR DELETE ON operations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_service_line_updates_trigger
AFTER INSERT OR UPDATE OR DELETE ON service_line_updates
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_iaps_trigger
AFTER INSERT OR UPDATE OR DELETE ON iaps
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Row Level Security (RLS)
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_line_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE iaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication setup)
-- For now, allowing all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON operations
    FOR ALL USING (true);

CREATE POLICY "Allow all service line updates for authenticated users" ON service_line_updates
    FOR ALL USING (true);

CREATE POLICY "Allow all IAP operations for authenticated users" ON iaps
    FOR ALL USING (true);

CREATE POLICY "Allow read audit logs for authenticated users" ON audit_log
    FOR SELECT USING (true);

-- Create views for common queries
CREATE OR REPLACE VIEW active_operations AS
SELECT 
    operation_id,
    operation_name,
    type,
    state,
    start_date,
    end_date,
    data,
    created_at,
    updated_at
FROM operations
WHERE end_date IS NULL OR end_date > NOW()
ORDER BY start_date DESC;

CREATE OR REPLACE VIEW service_line_summary AS
SELECT 
    s.operation_id,
    s.service_line,
    s.line_number,
    MAX(s.value) as current_value,
    MIN(s.value) as min_value,
    AVG(s.value) as avg_value,
    COUNT(*) as update_count,
    MAX(s.timestamp) as last_updated
FROM service_line_updates s
GROUP BY s.operation_id, s.service_line, s.line_number;

-- Sample data (optional - remove in production)
-- INSERT INTO operations (operation_id, operation_name, type, state, start_date, data)
-- VALUES ('DR-2025-001', 'Sample Hurricane Response', 'hurricane', 'florida', NOW(), '{}');