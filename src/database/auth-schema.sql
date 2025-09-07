-- Authentication and Authorization Schema - Phase 3 Implementation
-- Extends the existing Supabase schema with comprehensive auth and RBAC

-- Create user profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'volunteer',
    phone TEXT,
    red_cross_id TEXT UNIQUE,
    chapter_id TEXT,
    region_id TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_active TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user role enum
CREATE TYPE user_role AS ENUM (
    'system_admin',
    'operation_manager', 
    'iap_coordinator',
    'field_supervisor',
    'volunteer',
    'viewer'
);

-- Create operation roles table (many-to-many between users and operations)
CREATE TABLE IF NOT EXISTS operation_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    operation_id UUID REFERENCES operations(id) ON DELETE CASCADE NOT NULL,
    role operation_role_type NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    assigned_by UUID REFERENCES user_profiles(id) NOT NULL,
    UNIQUE(user_id, operation_id, role)
);

-- Create operation role enum
CREATE TYPE operation_role_type AS ENUM (
    'incident_commander',
    'deputy_ic',
    'safety_officer',
    'information_officer',
    'liaison_officer',
    'section_chief',
    'unit_leader',
    'task_force_leader',
    'strike_team_leader',
    'volunteer'
);

-- Create user presence table for real-time collaboration
CREATE TABLE IF NOT EXISTS user_presence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    status presence_status DEFAULT 'offline' NOT NULL,
    current_operation_id UUID REFERENCES operations(id) ON DELETE SET NULL,
    current_page TEXT,
    last_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create presence status enum
CREATE TYPE presence_status AS ENUM (
    'online',
    'away', 
    'busy',
    'offline'
);

-- Create activity log table for audit trail
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create session management table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_used TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add audit fields to existing tables
ALTER TABLE operations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id);
ALTER TABLE operations ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES user_profiles(id);
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id);
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES user_profiles(id);
ALTER TABLE personnel_assignments ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id);
ALTER TABLE work_assignments ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id);
ALTER TABLE work_assignments ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES user_profiles(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_chapter ON user_profiles(chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_region ON user_profiles(region_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON user_profiles(last_active);

CREATE INDEX IF NOT EXISTS idx_operation_roles_user ON operation_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_roles_operation ON operation_roles(operation_id);
CREATE INDEX IF NOT EXISTS idx_operation_roles_role ON operation_roles(role);

CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_operation ON user_presence(current_operation_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_operation ON user_activity_log(operation_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON user_activity_log(action);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles  
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "System admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role = 'system_admin'
        )
    );

CREATE POLICY "System admins and operation managers can update profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('system_admin', 'operation_manager')
        )
    );

-- Operation Roles Policies  
CREATE POLICY "Users can view their own operation roles" ON operation_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Operation managers can manage operation roles" ON operation_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role IN ('system_admin', 'operation_manager')
        )
    );

-- User Presence Policies
CREATE POLICY "Users can manage their own presence" ON user_presence
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "All authenticated users can view presence" ON user_presence
    FOR SELECT USING (auth.role() = 'authenticated');

-- Activity Log Policies (read-only for users, admins can see all)
CREATE POLICY "Users can view their own activity" ON user_activity_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System admins can view all activity" ON user_activity_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role = 'system_admin'
        )
    );

CREATE POLICY "System can insert activity logs" ON user_activity_log
    FOR INSERT WITH CHECK (true);

-- Session Policies
CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (user_id = auth.uid());

-- Create functions for common operations

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_uuid AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has operation role
CREATE OR REPLACE FUNCTION user_has_operation_role(user_uuid UUID, op_id UUID, required_role operation_role_type DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    IF required_role IS NULL THEN
        -- Check if user has any role in the operation
        RETURN EXISTS (
            SELECT 1 FROM operation_roles 
            WHERE user_id = user_uuid AND operation_id = op_id
        );
    ELSE
        -- Check if user has specific role in the operation
        RETURN EXISTS (
            SELECT 1 FROM operation_roles 
            WHERE user_id = user_uuid AND operation_id = op_id AND role = required_role
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    user_uuid UUID,
    operation_uuid UUID,
    activity_action TEXT,
    resource_type_param TEXT,
    resource_id_param TEXT DEFAULT NULL,
    details_param JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO user_activity_log (
        user_id,
        operation_id, 
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        created_at
    ) VALUES (
        user_uuid,
        operation_uuid,
        activity_action,
        resource_type_param,
        resource_id_param,
        details_param,
        inet_client_addr(),
        NOW()
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
    user_uuid UUID,
    status_param presence_status,
    operation_id_param UUID DEFAULT NULL,
    page_param TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_presence (
        user_id,
        status,
        current_operation_id,
        current_page,
        last_seen,
        updated_at
    ) VALUES (
        user_uuid,
        status_param,
        operation_id_param,
        page_param,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        status = status_param,
        current_operation_id = operation_id_param,
        current_page = page_param,
        last_seen = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic timestamping
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_presence_updated_at 
    BEFORE UPDATE ON user_presence 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for automatic activity logging
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the change
    IF TG_OP = 'INSERT' THEN
        PERFORM log_user_activity(
            COALESCE(NEW.created_by, auth.uid()),
            CASE 
                WHEN TG_TABLE_NAME = 'operations' THEN NEW.id
                WHEN TG_TABLE_NAME = 'facilities' THEN NEW.operation_id
                WHEN TG_TABLE_NAME = 'personnel_assignments' THEN NEW.operation_id
                WHEN TG_TABLE_NAME = 'work_assignments' THEN NEW.operation_id
                ELSE NULL
            END,
            'CREATE',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_user_activity(
            COALESCE(NEW.updated_by, auth.uid()),
            CASE 
                WHEN TG_TABLE_NAME = 'operations' THEN NEW.id
                WHEN TG_TABLE_NAME = 'facilities' THEN NEW.operation_id
                WHEN TG_TABLE_NAME = 'personnel_assignments' THEN NEW.operation_id
                WHEN TG_TABLE_NAME = 'work_assignments' THEN NEW.operation_id
                ELSE NULL
            END,
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id::TEXT,
            jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_user_activity(
            auth.uid(),
            CASE 
                WHEN TG_TABLE_NAME = 'operations' THEN OLD.id
                WHEN TG_TABLE_NAME = 'facilities' THEN OLD.operation_id
                WHEN TG_TABLE_NAME = 'personnel_assignments' THEN OLD.operation_id
                WHEN TG_TABLE_NAME = 'work_assignments' THEN OLD.operation_id
                ELSE NULL
            END,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id::TEXT,
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply activity logging triggers to key tables
CREATE TRIGGER log_operations_changes
    AFTER INSERT OR UPDATE OR DELETE ON operations
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER log_facilities_changes
    AFTER INSERT OR UPDATE OR DELETE ON facilities
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER log_personnel_changes
    AFTER INSERT OR UPDATE OR DELETE ON personnel_assignments
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER log_work_assignments_changes
    AFTER INSERT OR UPDATE OR DELETE ON work_assignments
    FOR EACH ROW EXECUTE FUNCTION log_table_changes();

-- Insert demo users for testing
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@redcross.org', '$2a$10$demo.hash.for.testing', NOW(), NOW(), NOW(), 'authenticated'),
    ('550e8400-e29b-41d4-a716-446655440001', 'coordinator@redcross.org', '$2a$10$demo.hash.for.testing', NOW(), NOW(), NOW(), 'authenticated'),
    ('550e8400-e29b-41d4-a716-446655440002', 'supervisor@redcross.org', '$2a$10$demo.hash.for.testing', NOW(), NOW(), NOW(), 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Insert demo user profiles
INSERT INTO user_profiles (id, email, full_name, role, red_cross_id, chapter_id, region_id, created_at, updated_at, last_active)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@redcross.org', 'System Administrator', 'system_admin', 'ARC001', 'FL-001', 'SE-001', NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440001', 'coordinator@redcross.org', 'Jane Smith', 'iap_coordinator', 'ARC002', 'FL-002', 'SE-001', NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'supervisor@redcross.org', 'Mike Johnson', 'field_supervisor', 'ARC003', 'FL-003', 'SE-001', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create scheduled job to clean up expired sessions (if pg_cron extension is available)
-- SELECT cron.schedule('cleanup-expired-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');

COMMENT ON TABLE user_profiles IS 'Extended user profile information with Red Cross specific fields';
COMMENT ON TABLE operation_roles IS 'Role assignments for users within specific operations';
COMMENT ON TABLE user_presence IS 'Real-time user presence tracking for collaboration';
COMMENT ON TABLE user_activity_log IS 'Comprehensive audit trail of user actions';
COMMENT ON TABLE user_sessions IS 'Session management for enhanced security';

-- Grant appropriate permissions
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON operation_roles TO authenticated;  
GRANT SELECT ON user_presence TO authenticated;
GRANT SELECT ON user_activity_log TO authenticated;
GRANT SELECT ON user_sessions TO authenticated;