# Security Implementation Plan: Disaster Operations v3 Salvage
## Securing the Salvaged UI with Supabase Backend

### Executive Summary

Following the **UI Salvage** and **Database Replacement** strategies, this security plan addresses the critical vulnerabilities identified in the disaster-ops-v3 system analysis. The plan focuses on implementing robust security for the salvaged React UI with the new Supabase backend, ensuring proper protection for sensitive disaster response data while maintaining the excellent user experience already built.

**Critical Security Issues Addressed:**
- 🔴 Complete absence of authentication system
- 🔴 Hardcoded API keys exposed in client code  
- 🔴 Unencrypted sensitive data storage
- 🔴 No role-based access control enforcement
- 🔴 Facility location and personnel data exposure
- 🔴 Missing audit trail for disaster operations

**Security Architecture:**
- Supabase Auth for authentication and session management
- Row Level Security (RLS) for role-based data access
- Client-side encryption for sensitive local storage
- Secure API key management with Edge Functions
- Comprehensive audit logging for compliance
- Field security measures for disaster response scenarios

---

## 1. Authentication and Authorization Strategy

### 1.1 Supabase Auth Implementation

**Core Authentication System:**
```typescript
// lib/auth/supabaseAuth.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User, IAPRole, UserRole } from '@/types'

export class DisasterOpsAuth {
  private supabase = createClientComponentClient()

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw new Error(`Authentication failed: ${error.message}`)
    
    // Validate user has disaster operations role
    await this.validateOperationalAccess(data.user)
    return data
  }

  async signInWithSSO(provider: 'google' | 'microsoft') {
    // Red Cross typically uses Microsoft 365 for SSO
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        scopes: 'email profile',
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          hd: 'redcross.org' // Restrict to Red Cross domain
        }
      }
    })
    
    if (error) throw new Error(`SSO authentication failed: ${error.message}`)
    return data
  }

  private async validateOperationalAccess(user: any) {
    // Ensure user exists in users table with valid role
    const { data: userProfile, error } = await this.supabase
      .from('users')
      .select('role, iap_role, active_operations')
      .eq('id', user.id)
      .single()

    if (error || !userProfile) {
      await this.supabase.auth.signOut()
      throw new Error('Access denied: No operational authorization')
    }

    // Check for valid IAP role
    if (!['ip_group', 'discipline', 'field', 'viewer'].includes(userProfile.iap_role)) {
      await this.supabase.auth.signOut()
      throw new Error('Access denied: Invalid IAP authorization')
    }
  }

  async enableMFA(phone: string) {
    // Multi-factor authentication for incident commanders and admins
    const { data, error } = await this.supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Disaster Ops Auth'
    })
    
    if (error) throw new Error(`MFA setup failed: ${error.message}`)
    return data
  }
}
```

**Authentication Components:**
```tsx
// components/Auth/LoginForm.tsx
export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [mfaToken, setMfaToken] = useState('')
  const [requiresMFA, setRequiresMFA] = useState(false)
  const auth = new DisasterOpsAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await auth.signInWithEmail(credentials.email, credentials.password)
      
      // Check if MFA is required for this user's role
      if (await requiresMFAForRole(result.user)) {
        setRequiresMFA(true)
        return
      }
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      setError(error.message)
    }
  }

  const handleMFAVerification = async () => {
    try {
      await auth.verifyMFA(mfaToken)
      router.push('/dashboard')
    } catch (error) {
      setError('MFA verification failed')
    }
  }

  return (
    <div className="login-container">
      <div className="bg-red-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-bold">American Red Cross</h1>
        <p>Disaster Operations Management System</p>
      </div>
      
      <form onSubmit={handleLogin} className="p-6 space-y-4">
        <div>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {requiresMFA && (
          <div>
            <label htmlFor="mfa">Authentication Code</label>
            <input
              id="mfa"
              type="text"
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter 6-digit code"
              required
            />
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
        >
          {requiresMFA ? 'Verify Code' : 'Sign In'}
        </button>
        
        <div className="text-center">
          <button
            type="button"
            onClick={() => auth.signInWithSSO('microsoft')}
            className="text-blue-600 hover:underline"
          >
            Sign in with Microsoft 365
          </button>
        </div>
      </form>
    </div>
  )
}
```

### 1.2 Role-Based Access Control (RBAC) with Supabase RLS

**Row Level Security Policies:**
```sql
-- supabase/migrations/002_rbac_policies.sql

-- Users can only see their own profile
CREATE POLICY "users_own_profile" ON users
  FOR ALL TO authenticated
  USING (auth.uid() = id);

-- I&P Group: Full access to all operations they're assigned to
CREATE POLICY "ip_group_full_access" ON operations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.iap_role = 'ip_group'
      AND operations.id = ANY(users.active_operations)
    )
  );

-- Facilities access based on IAP role
CREATE POLICY "facilities_rbac" ON facilities
  FOR ALL TO authenticated
  USING (
    -- I&P Group: Full access to all facilities in their operations
    (
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.iap_role = 'ip_group'
        AND facilities.operation_id = ANY(users.active_operations)
      )
    )
    OR
    -- Discipline Teams: Access to facilities they're assigned to
    (
      EXISTS (
        SELECT 1 FROM users 
        JOIN facility_personnel ON facility_personnel.person_id = auth.uid()
        WHERE users.id = auth.uid() 
        AND users.iap_role = 'discipline'
        AND facilities.id = facility_personnel.facility_id
      )
    )
  );

-- Field Teams: Read-only access to assigned facilities
CREATE POLICY "field_readonly_facilities" ON facilities
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      JOIN facility_personnel ON facility_personnel.person_id = auth.uid()
      WHERE users.id = auth.uid() 
      AND users.iap_role = 'field'
      AND facilities.id = facility_personnel.facility_id
    )
  );

-- Personnel data access (sensitive information)
CREATE POLICY "personnel_restricted_access" ON personnel
  FOR SELECT TO authenticated
  USING (
    -- Only I&P Group and assigned supervisors can see full personnel details
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (
        users.iap_role = 'ip_group'
        OR 
        users.role IN ('incident_commander', 'section_chief')
      )
    )
  );

-- IAP Documents: Role-based access
CREATE POLICY "iap_documents_rbac" ON iap_documents
  FOR ALL TO authenticated
  USING (
    -- I&P Group: Full access
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.iap_role = 'ip_group'
      AND iap_documents.operation_id = ANY(users.active_operations)
    )
    OR
    -- Others: Read-only access to published documents
    (
      iap_documents.status = 'published'
      AND EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND iap_documents.operation_id = ANY(users.active_operations)
      )
    )
  );

-- Audit logs: Read-only for authorized users
CREATE POLICY "audit_logs_readonly" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('incident_commander', 'admin')
    )
  );
```

**Frontend Role Enforcement:**
```tsx
// hooks/useRoleAccess.ts
export function useRoleAccess(operationId?: string) {
  const { data: user } = useUser()
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => getUserProfile(user?.id),
    enabled: !!user?.id
  })

  const permissions = useMemo(() => {
    if (!userProfile || !operationId) return {
      canEditOperation: false,
      canCreateFacilities: false,
      canViewPersonnel: false,
      canEditIAP: false,
      canViewAuditLogs: false
    }

    const hasOperationAccess = userProfile.active_operations.includes(operationId)
    
    return {
      // Operation management
      canEditOperation: hasOperationAccess && ['incident_commander', 'admin'].includes(userProfile.role),
      
      // Facility management
      canCreateFacilities: hasOperationAccess && ['ip_group'].includes(userProfile.iap_role),
      canEditFacilities: hasOperationAccess && ['ip_group', 'discipline'].includes(userProfile.iap_role),
      canViewFacilities: hasOperationAccess,
      
      // Personnel data
      canViewPersonnel: hasOperationAccess && ['ip_group'].includes(userProfile.iap_role),
      canViewPersonnelFull: ['incident_commander', 'section_chief'].includes(userProfile.role),
      
      // IAP documents
      canEditIAP: hasOperationAccess && ['ip_group'].includes(userProfile.iap_role),
      canViewIAPDrafts: hasOperationAccess && ['ip_group'].includes(userProfile.iap_role),
      canPublishIAP: hasOperationAccess && ['incident_commander'].includes(userProfile.role),
      
      // System administration
      canViewAuditLogs: ['incident_commander', 'admin'].includes(userProfile.role),
      canManageUsers: ['admin'].includes(userProfile.role),
      
      // Role indicators
      isIPGroup: userProfile.iap_role === 'ip_group',
      isDisciplineTeam: userProfile.iap_role === 'discipline',
      isFieldTeam: userProfile.iap_role === 'field',
      isViewer: userProfile.iap_role === 'viewer'
    }
  }, [userProfile, operationId])

  return permissions
}

// Component usage
export const FacilityManager: React.FC<{ operationId: string }> = ({ operationId }) => {
  const permissions = useRoleAccess(operationId)
  
  if (!permissions.canViewFacilities) {
    return <AccessDenied message="You don't have access to facilities in this operation." />
  }

  return (
    <div>
      {permissions.canCreateFacilities && (
        <button onClick={openCreateFacilityModal}>
          Create New Facility
        </button>
      )}
      
      <FacilityList 
        operationId={operationId}
        canEdit={permissions.canEditFacilities}
      />
    </div>
  )
}
```

---

## 2. Data Protection and Encryption

### 2.1 Client-Side Encryption for Local Storage

**Secure Local Storage Implementation:**
```typescript
// lib/security/encryptedStorage.ts
import CryptoJS from 'crypto-js'

export class EncryptedLocalStorage {
  private static getEncryptionKey(): string {
    // Derive key from user session + device fingerprint
    const sessionKey = sessionStorage.getItem('session_key')
    const deviceFingerprint = this.generateDeviceFingerprint()
    
    if (!sessionKey) {
      throw new Error('No valid session for encrypted storage')
    }
    
    return CryptoJS.PBKDF2(sessionKey, deviceFingerprint, {
      keySize: 256/32,
      iterations: 10000
    }).toString()
  }

  private static generateDeviceFingerprint(): string {
    // Generate consistent device fingerprint for encryption salt
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
    
    return CryptoJS.SHA256(
      navigator.userAgent +
      screen.width + screen.height +
      navigator.language +
      new Date().getTimezoneOffset() +
      canvas.toDataURL()
    ).toString()
  }

  static setSecureItem(key: string, value: any): void {
    try {
      const encryptionKey = this.getEncryptionKey()
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(value), 
        encryptionKey
      ).toString()
      
      localStorage.setItem(`secure_${key}`, encrypted)
    } catch (error) {
      console.error('Failed to store encrypted data:', error)
      // Fallback to session storage for critical data
      sessionStorage.setItem(`temp_${key}`, JSON.stringify(value))
    }
  }

  static getSecureItem<T>(key: string): T | null {
    try {
      const encryptionKey = this.getEncryptionKey()
      const encrypted = localStorage.getItem(`secure_${key}`)
      
      if (!encrypted) {
        // Check session storage fallback
        const fallback = sessionStorage.getItem(`temp_${key}`)
        return fallback ? JSON.parse(fallback) : null
      }
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, encryptionKey)
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error)
      return null
    }
  }

  static removeSecureItem(key: string): void {
    localStorage.removeItem(`secure_${key}`)
    sessionStorage.removeItem(`temp_${key}`)
  }

  static clearAllSecureData(): void {
    // Clear all encrypted data on logout
    Object.keys(localStorage)
      .filter(key => key.startsWith('secure_'))
      .forEach(key => localStorage.removeItem(key))
      
    Object.keys(sessionStorage)
      .filter(key => key.startsWith('temp_'))
      .forEach(key => sessionStorage.removeItem(key))
  }
}

// Usage in components
export const useSecureStorage = () => {
  const storeSecurely = useCallback((key: string, data: any) => {
    // Only store sensitive data if user has appropriate access level
    if (containsSensitiveData(data)) {
      const permissions = useRoleAccess()
      if (!permissions.canViewPersonnelFull) {
        console.warn('Attempted to store sensitive data without proper access')
        return
      }
    }
    
    EncryptedLocalStorage.setSecureItem(key, data)
  }, [])

  const retrieveSecurely = useCallback(<T,>(key: string): T | null => {
    return EncryptedLocalStorage.getSecureItem<T>(key)
  }, [])

  return { storeSecurely, retrieveSecurely }
}
```

### 2.2 Data Classification and Protection

**Sensitive Data Handling:**
```typescript
// lib/security/dataClassification.ts
export enum DataClassification {
  PUBLIC = 'public',           // Operation names, general info
  SENSITIVE = 'sensitive',     // Facility addresses, phone numbers
  CONFIDENTIAL = 'confidential', // Personnel details, certifications
  RESTRICTED = 'restricted'    // Command structure, security details
}

export interface ClassifiedData<T = any> {
  data: T
  classification: DataClassification
  accessRequirement: IAPRole[]
  encryptionRequired: boolean
  auditRequired: boolean
}

export class DataProtectionService {
  static classifyFacilityData(facility: IAPFacility): ClassifiedData<IAPFacility> {
    // Determine classification level based on content
    const hasPersonnelData = facility.personnel.length > 0
    const hasDetailedContact = facility.contact.primaryEmail || facility.contact.backupPhone
    
    let classification = DataClassification.SENSITIVE
    if (hasPersonnelData) classification = DataClassification.CONFIDENTIAL
    
    return {
      data: facility,
      classification,
      accessRequirement: classification === DataClassification.CONFIDENTIAL 
        ? ['ip_group'] 
        : ['ip_group', 'discipline'],
      encryptionRequired: classification !== DataClassification.PUBLIC,
      auditRequired: classification === DataClassification.CONFIDENTIAL
    }
  }

  static sanitizeDataForRole(data: any, userRole: IAPRole): any {
    if (userRole === 'ip_group') {
      return data // Full access
    }

    if (userRole === 'discipline') {
      // Remove sensitive personnel details
      return this.removeSensitiveFields(data, [
        'ssn', 'homeAddress', 'emergencyContact',
        'medicalInfo', 'personnelNotes'
      ])
    }

    if (userRole === 'field' || userRole === 'viewer') {
      // Remove all personnel details except names and positions
      return this.removeSensitiveFields(data, [
        'phone', 'email', 'address', 'contact',
        'ssn', 'homeAddress', 'emergencyContact',
        'medicalInfo', 'personnelNotes', 'certifications'
      ])
    }

    return null // No access
  }

  private static removeSensitiveFields(data: any, fields: string[]): any {
    if (!data || typeof data !== 'object') return data
    
    if (Array.isArray(data)) {
      return data.map(item => this.removeSensitiveFields(item, fields))
    }

    const sanitized = { ...data }
    fields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]'
      }
    })

    // Recursively sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.removeSensitiveFields(sanitized[key], fields)
      }
    })

    return sanitized
  }

  static async logDataAccess(
    userId: string, 
    dataType: string, 
    action: 'read' | 'write' | 'delete',
    classification: DataClassification
  ): Promise<void> {
    if (classification === DataClassification.CONFIDENTIAL || 
        classification === DataClassification.RESTRICTED) {
      
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: `data_${action}`,
        resource_type: dataType,
        data_classification: classification,
        timestamp: new Date().toISOString(),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      })
    }
  }
}
```

---

## 3. API Security and Key Management

### 3.1 Secure API Key Management with Supabase Edge Functions

**Edge Functions for External API Integration:**
```typescript
// supabase/functions/geocoding-service/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface GeocodeRequest {
  address: string
  operationId: string
}

serve(async (req) => {
  try {
    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify user has access to operation
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      return new Response('Invalid authentication', { status: 401 })
    }

    const { address, operationId }: GeocodeRequest = await req.json()

    // Check user has access to this operation
    const { data: userProfile } = await supabase
      .from('users')
      .select('active_operations, iap_role')
      .eq('id', user.id)
      .single()

    if (!userProfile?.active_operations.includes(operationId)) {
      return new Response('Operation access denied', { status: 403 })
    }

    // Make geocoding API call with server-side API key
    const geocodingApiKey = Deno.env.get('GEOCODING_API_KEY')
    const response = await fetch(
      `https://api.geocodio.com/v1.7/geocode?q=${encodeURIComponent(address)}&api_key=${geocodingApiKey}`
    )

    if (!response.ok) {
      throw new Error('Geocoding service unavailable')
    }

    const geocodingResult = await response.json()

    // Log the API usage for audit
    await supabase.from('api_usage_logs').insert({
      user_id: user.id,
      operation_id: operationId,
      service: 'geocoding',
      endpoint: 'geocode',
      request_size: address.length,
      response_size: JSON.stringify(geocodingResult).length,
      timestamp: new Date().toISOString()
    })

    return new Response(JSON.stringify({
      success: true,
      coordinates: geocodingResult.results[0]?.location,
      formatted_address: geocodingResult.results[0]?.formatted_address
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Geocoding error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Geocoding failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

**Frontend API Service:**
```typescript
// lib/services/secureApiService.ts
export class SecureApiService {
  private supabase = createClientComponentClient()

  async makeSecureApiCall<T>(
    functionName: string, 
    payload: any,
    operationId: string
  ): Promise<T> {
    const { data: { session } } = await this.supabase.auth.getSession()
    
    if (!session) {
      throw new Error('Authentication required')
    }

    // Rate limiting check
    await this.checkRateLimit(functionName)

    const response = await fetch(`/api/functions/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...payload, operationId })
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    return response.json()
  }

  private async checkRateLimit(service: string): Promise<void> {
    // Implement client-side rate limiting
    const lastCall = localStorage.getItem(`last_${service}_call`)
    const now = Date.now()
    
    if (lastCall && now - parseInt(lastCall) < 1000) {
      throw new Error('Rate limit exceeded. Please wait before making another request.')
    }
    
    localStorage.setItem(`last_${service}_call`, now.toString())
  }

  // Specific secure service methods
  async geocodeAddress(address: string, operationId: string) {
    return this.makeSecureApiCall('geocoding-service', { address }, operationId)
  }

  async getWeatherData(location: [number, number], operationId: string) {
    return this.makeSecureApiCall('weather-service', { location }, operationId)
  }

  async validateAddress(address: string, operationId: string) {
    return this.makeSecureApiCall('address-validation', { address }, operationId)
  }
}

// Usage in components
export const useSecureApi = () => {
  const apiService = useMemo(() => new SecureApiService(), [])
  
  const geocodeAddress = useCallback(async (address: string, operationId: string) => {
    try {
      const result = await apiService.geocodeAddress(address, operationId)
      return result
    } catch (error) {
      console.error('Geocoding failed:', error)
      throw new Error('Unable to verify address. Please enter manually.')
    }
  }, [apiService])

  return { geocodeAddress }
}
```

---

## 4. Compliance and Audit Trail Implementation

### 4.1 Comprehensive Audit Logging

**Audit Log Schema:**
```sql
-- supabase/migrations/003_audit_system.sql
CREATE TYPE audit_action AS ENUM (
  'create', 'read', 'update', 'delete',
  'login', 'logout', 'access_denied',
  'data_export', 'api_call', 'configuration_change'
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  operation_id UUID REFERENCES operations(id),
  action audit_action NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  data_classification TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  additional_context JSONB DEFAULT '{}'
);

-- Indexes for audit queries
CREATE INDEX audit_logs_user_timestamp ON audit_logs (user_id, timestamp);
CREATE INDEX audit_logs_operation_timestamp ON audit_logs (operation_id, timestamp);
CREATE INDEX audit_logs_resource_timestamp ON audit_logs (resource_type, timestamp);
CREATE INDEX audit_logs_classification ON audit_logs (data_classification, timestamp);

-- API usage tracking
CREATE TABLE api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  operation_id UUID REFERENCES operations(id),
  service TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_size INTEGER,
  response_size INTEGER,
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  cost_estimate DECIMAL(10,4) -- For tracking API costs
);
```

**Frontend Audit Service:**
```typescript
// lib/services/auditService.ts
export class AuditService {
  private supabase = createClientComponentClient()
  private sessionId = this.generateSessionId()

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async logUserAction(
    action: string,
    resourceType: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any,
    operationId?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) return // Don't log if no user session

      await this.supabase.from('audit_logs').insert({
        user_id: user.id,
        operation_id: operationId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        session_id: this.sessionId,
        additional_context: {
          url: window.location.href,
          referrer: document.referrer,
          timestamp_client: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Audit logging failed:', error)
      // Don't throw - audit failures shouldn't break functionality
    }
  }

  async logFacilityAccess(facilityId: string, operationId: string): Promise<void> {
    await this.logUserAction('read', 'facility', facilityId, null, null, operationId)
  }

  async logFacilityUpdate(
    facilityId: string, 
    operationId: string,
    oldData: any, 
    newData: any
  ): Promise<void> {
    await this.logUserAction('update', 'facility', facilityId, oldData, newData, operationId)
  }

  async logIAPAccess(iapId: string, operationId: string): Promise<void> {
    await this.logUserAction('read', 'iap_document', iapId, null, null, operationId)
  }

  async logDataExport(
    exportType: string, 
    operationId: string,
    recordCount: number
  ): Promise<void> {
    await this.logUserAction('data_export', exportType, null, null, { 
      record_count: recordCount 
    }, operationId)
  }

  async logConfigurationChange(
    setting: string, 
    oldValue: any, 
    newValue: any
  ): Promise<void> {
    await this.logUserAction('configuration_change', 'system_setting', setting, 
      { [setting]: oldValue }, 
      { [setting]: newValue }
    )
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return 'unknown'
    }
  }
}

// React hook for audit logging
export const useAuditLogging = (operationId?: string) => {
  const auditService = useMemo(() => new AuditService(), [])

  const logAction = useCallback(async (
    action: string,
    resourceType: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any
  ) => {
    await auditService.logUserAction(action, resourceType, resourceId, oldValues, newValues, operationId)
  }, [auditService, operationId])

  return { logAction, auditService }
}

// Higher-order component for automatic audit logging
export function withAuditLogging<T extends {}>(
  Component: React.ComponentType<T>,
  resourceType: string
) {
  return function AuditedComponent(props: T & { operationId?: string }) {
    const { logAction } = useAuditLogging(props.operationId)

    useEffect(() => {
      // Log component access
      logAction('read', resourceType)
    }, [logAction])

    return <Component {...props} />
  }
}
```

### 4.2 GDPR and Privacy Compliance

**Data Privacy Service:**
```typescript
// lib/services/privacyService.ts
export class PrivacyService {
  private supabase = createClientComponentClient()

  async requestDataExport(userId: string): Promise<string> {
    // GDPR Article 15 - Right of Access
    const { data, error } = await this.supabase.rpc('export_user_data', {
      user_id: userId
    })

    if (error) throw new Error('Data export failed')

    // Log the data export request
    await this.auditService.logAction('data_export', 'user_data', userId)
    
    return data.export_url
  }

  async requestDataDeletion(userId: string, reason: string): Promise<void> {
    // GDPR Article 17 - Right to Erasure
    await this.supabase.rpc('anonymize_user_data', {
      user_id: userId,
      deletion_reason: reason
    })

    // Log the deletion request
    await this.auditService.logAction('delete', 'user_data', userId, null, {
      deletion_reason: reason,
      anonymization_date: new Date().toISOString()
    })
  }

  async updateConsentPreferences(userId: string, preferences: ConsentPreferences): Promise<void> {
    // Update user consent settings
    await this.supabase
      .from('users')
      .update({
        privacy_preferences: preferences,
        consent_updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    await this.auditService.logAction('update', 'privacy_preferences', userId, null, preferences)
  }

  async detectPII(text: string): Promise<PIIDetectionResult> {
    // Detect personally identifiable information in text
    const patterns = {
      ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
      phone: /\b\d{3}-\d{3}-\d{4}\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g
    }

    const detectedPII: PIIMatch[] = []
    
    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          detectedPII.push({
            type: type as PIIType,
            value: match,
            startIndex: text.indexOf(match),
            endIndex: text.indexOf(match) + match.length
          })
        })
      }
    })

    return {
      hasPII: detectedPII.length > 0,
      detectedItems: detectedPII,
      riskLevel: this.calculateRiskLevel(detectedPII)
    }
  }

  async redactPII(text: string, redactionLevel: 'partial' | 'full' = 'partial'): Promise<string> {
    const detection = await this.detectPII(text)
    
    if (!detection.hasPII) return text

    let redactedText = text
    
    detection.detectedItems.forEach(item => {
      const redactedValue = redactionLevel === 'full' 
        ? '[REDACTED]'
        : this.partialRedact(item.value, item.type)
      
      redactedText = redactedText.replace(item.value, redactedValue)
    })

    return redactedText
  }

  private partialRedact(value: string, type: PIIType): string {
    switch (type) {
      case 'ssn':
        return `***-**-${value.slice(-4)}`
      case 'phone':
        return `***-***-${value.slice(-4)}`
      case 'email':
        const [local, domain] = value.split('@')
        return `${local.charAt(0)}***@${domain}`
      case 'creditCard':
        return `****-****-****-${value.slice(-4)}`
      default:
        return '[REDACTED]'
    }
  }

  private calculateRiskLevel(piiItems: PIIMatch[]): 'low' | 'medium' | 'high' {
    if (piiItems.length === 0) return 'low'
    if (piiItems.length < 3) return 'medium'
    return 'high'
  }
}

interface ConsentPreferences {
  analytics: boolean
  marketing: boolean
  dataRetention: number // days
  shareWithPartners: boolean
}

interface PIIDetectionResult {
  hasPII: boolean
  detectedItems: PIIMatch[]
  riskLevel: 'low' | 'medium' | 'high'
}

interface PIIMatch {
  type: PIIType
  value: string
  startIndex: number
  endIndex: number
}

type PIIType = 'ssn' | 'phone' | 'email' | 'creditCard'
```

---

## 5. Field Security and Offline Protection

### 5.1 Device Security for Field Operations

**Offline Security Measures:**
```typescript
// lib/security/fieldSecurity.ts
export class FieldSecurityService {
  private encryptedStorage = new EncryptedLocalStorage()
  
  async enableFieldMode(operationId: string, deviceId: string): Promise<void> {
    // Set up secure offline cache for field operations
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication required')

    // Download essential data for offline access
    const operationData = await this.cacheEssentialData(operationId, user.id)
    
    // Store with encryption
    this.encryptedStorage.setSecureItem('field_operation_data', {
      operationId,
      deviceId,
      lastSync: new Date().toISOString(),
      data: operationData,
      permissions: await this.getUserPermissions(user.id, operationId)
    })

    // Set up automatic data wipe timer (24 hours)
    this.setupAutoWipe(deviceId)

    // Enable device security features
    await this.enableDeviceSecurity()
  }

  private async cacheEssentialData(operationId: string, userId: string) {
    const permissions = await this.getUserPermissions(userId, operationId)
    
    // Only cache data user has access to
    const essentialData: any = {}

    if (permissions.canViewFacilities) {
      essentialData.facilities = await supabase
        .from('facilities')
        .select(`
          id, name, type, status, address, city, state,
          contact!inner(primary_name, primary_phone)
        `)
        .eq('operation_id', operationId)
    }

    if (permissions.canViewPersonnel) {
      essentialData.personnel = await supabase
        .from('facility_personnel')
        .select(`
          id, position, start_time,
          person:personnel(first_name, last_name, phone)
        `)
        .eq('operation_id', operationId)
    }

    // Limit data size for offline storage (max 10MB)
    const dataSize = JSON.stringify(essentialData).length
    if (dataSize > 10 * 1024 * 1024) {
      console.warn('Essential data exceeds 10MB limit, truncating...')
      // Implement data prioritization logic
    }

    return essentialData
  }

  private setupAutoWipe(deviceId: string): void {
    // Set up automatic data wipe after 24 hours
    const wipeTimestamp = Date.now() + (24 * 60 * 60 * 1000)
    localStorage.setItem('field_auto_wipe', wipeTimestamp.toString())
    
    // Check for wipe on app startup
    this.checkAutoWipe()
  }

  private checkAutoWipe(): void {
    const wipeTimestamp = localStorage.getItem('field_auto_wipe')
    if (wipeTimestamp && Date.now() > parseInt(wipeTimestamp)) {
      this.wipeDeviceData()
    }
  }

  async wipeDeviceData(): Promise<void> {
    try {
      // Clear all application data
      EncryptedLocalStorage.clearAllSecureData()
      
      // Clear all local storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear IndexedDB
      const databases = await indexedDB.databases()
      await Promise.all(
        databases.map(db => {
          return new Promise<void>((resolve) => {
            const deleteReq = indexedDB.deleteDatabase(db.name!)
            deleteReq.onsuccess = () => resolve()
            deleteReq.onerror = () => resolve() // Continue even if delete fails
          })
        })
      )

      // Sign out user
      await supabase.auth.signOut()
      
      console.log('Device data wiped successfully')
      
      // Redirect to login
      window.location.href = '/login?message=device_wiped'
      
    } catch (error) {
      console.error('Error wiping device data:', error)
    }
  }

  private async enableDeviceSecurity(): Promise<void> {
    // Request device lock screen if available
    if ('wakeLock' in navigator) {
      try {
        await (navigator as any).wakeLock.request('screen')
      } catch (error) {
        console.warn('Wake lock not available:', error)
      }
    }

    // Set up visibility change handler for security
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // App went to background - start inactivity timer
        this.startInactivityTimer()
      } else {
        // App came to foreground - clear timer
        this.clearInactivityTimer()
      }
    })
  }

  private inactivityTimer?: NodeJS.Timeout

  private startInactivityTimer(): void {
    // Auto-lock after 5 minutes of inactivity
    this.inactivityTimer = setTimeout(() => {
      this.lockApplication()
    }, 5 * 60 * 1000)
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
      this.inactivityTimer = undefined
    }
  }

  private async lockApplication(): Promise<void> {
    // Clear sensitive data from memory
    EncryptedLocalStorage.clearAllSecureData()
    
    // Redirect to lock screen
    window.location.href = '/field-lock'
  }

  async reportDeviceLoss(deviceId: string, operationId: string): Promise<void> {
    // Report lost/stolen device for remote wipe
    await supabase.from('device_security_events').insert({
      device_id: deviceId,
      operation_id: operationId,
      event_type: 'device_reported_lost',
      timestamp: new Date().toISOString(),
      reported_by: (await supabase.auth.getUser()).data.user?.id
    })

    // Trigger remote wipe if device comes online
    await supabase.from('device_commands').insert({
      device_id: deviceId,
      command: 'remote_wipe',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })
  }
}
```

### 5.2 Geographic Access Controls

**Location-Based Security:**
```typescript
// lib/security/geoSecurity.ts
export class GeoSecurityService {
  private supabase = createClientComponentClient()

  async validateLocationAccess(operationId: string): Promise<LocationValidationResult> {
    try {
      // Get user's current location
      const position = await this.getCurrentPosition()
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      // Get operation's geographic bounds
      const { data: operation } = await this.supabase
        .from('operations')
        .select('geography')
        .eq('id', operationId)
        .single()

      if (!operation?.geography) {
        return { allowed: true, reason: 'No geographic restrictions' }
      }

      // Check if user is within operation area
      const withinBounds = this.isWithinOperationArea(userLocation, operation.geography)
      
      if (!withinBounds) {
        // Check if user has override permission
        const hasOverride = await this.hasLocationOverride()
        
        if (!hasOverride) {
          await this.logLocationViolation(operationId, userLocation, operation.geography)
          return { 
            allowed: false, 
            reason: 'Access denied: Outside operation area',
            distance: this.calculateDistance(userLocation, operation.geography)
          }
        }
      }

      return { allowed: true, reason: 'Location verified' }
      
    } catch (error) {
      console.error('Location validation error:', error)
      // Fail open for usability, but log the issue
      await this.logLocationError(operationId, error.message)
      return { allowed: true, reason: 'Location verification unavailable' }
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000 // 5 minutes
        }
      )
    })
  }

  private isWithinOperationArea(
    userLocation: { lat: number; lng: number },
    operationGeography: any
  ): boolean {
    // Simple bounding box check
    if (operationGeography.bounds) {
      const { north, south, east, west } = operationGeography.bounds
      return (
        userLocation.lat >= south &&
        userLocation.lat <= north &&
        userLocation.lng >= west &&
        userLocation.lng <= east
      )
    }

    // County-based check
    if (operationGeography.counties) {
      // This would require reverse geocoding to determine user's county
      // For now, return true (implement based on requirements)
      return true
    }

    return true
  }

  private calculateDistance(
    userLocation: { lat: number; lng: number },
    operationGeography: any
  ): number {
    if (!operationGeography.headquarters) return 0

    const hq = operationGeography.headquarters
    return this.haversineDistance(
      userLocation.lat,
      userLocation.lng,
      hq.lat,
      hq.lng
    )
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private async hasLocationOverride(): Promise<boolean> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user) return false

    const { data: userProfile } = await this.supabase
      .from('users')
      .select('role, permissions')
      .eq('id', user.id)
      .single()

    return userProfile?.role === 'admin' || 
           userProfile?.permissions?.includes('location_override')
  }

  private async logLocationViolation(
    operationId: string,
    userLocation: { lat: number; lng: number },
    operationGeography: any
  ): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser()
    
    await this.supabase.from('security_events').insert({
      user_id: user?.id,
      operation_id: operationId,
      event_type: 'location_violation',
      severity: 'medium',
      details: {
        user_location: userLocation,
        operation_area: operationGeography,
        distance_from_hq: this.calculateDistance(userLocation, operationGeography)
      },
      timestamp: new Date().toISOString()
    })
  }
}

interface LocationValidationResult {
  allowed: boolean
  reason: string
  distance?: number
}
```

---

## 6. Security Monitoring and Incident Response

### 6.1 Real-Time Security Monitoring

**Security Event Detection:**
```typescript
// lib/security/securityMonitoring.ts
export class SecurityMonitoring {
  private supabase = createClientComponentClient()
  private eventQueue: SecurityEvent[] = []
  private readonly MAX_QUEUE_SIZE = 100

  async startMonitoring(): Promise<void> {
    // Set up real-time monitoring
    this.setupSecurityEventHandlers()
    this.startBehaviorAnalysis()
    this.initializeAnomalyDetection()
    
    // Process queued events every 30 seconds
    setInterval(() => {
      this.processEventQueue()
    }, 30000)
  }

  private setupSecurityEventHandlers(): void {
    // Monitor for suspicious activities
    document.addEventListener('contextmenu', (e) => {
      this.queueSecurityEvent('context_menu_access', { element: e.target.tagName })
    })

    // Monitor for developer tools
    let devtools = { open: false, timestamp: Date.now() }
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
          devtools = { open: true, timestamp: Date.now() }
          this.queueSecurityEvent('devtools_opened', { timestamp: devtools.timestamp })
        }
      } else {
        devtools.open = false
      }
    }, 500)

    // Monitor for multiple failed attempts
    window.addEventListener('unhandledrejection', (e) => {
      if (e.reason?.message?.includes('auth') || e.reason?.message?.includes('unauthorized')) {
        this.queueSecurityEvent('auth_failure', { 
          error: e.reason.message,
          url: window.location.href
        })
      }
    })

    // Monitor for suspicious navigation patterns
    let rapidClicks = 0
    document.addEventListener('click', () => {
      rapidClicks++
      setTimeout(() => rapidClicks--, 1000)
      
      if (rapidClicks > 20) {
        this.queueSecurityEvent('suspicious_activity', { 
          type: 'rapid_clicking',
          count: rapidClicks
        })
      }
    })
  }

  private queueSecurityEvent(type: string, details: any): void {
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      type,
      details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    this.eventQueue.push(event)

    // Prevent memory leaks
    if (this.eventQueue.length > this.MAX_QUEUE_SIZE) {
      this.eventQueue = this.eventQueue.slice(-this.MAX_QUEUE_SIZE)
    }

    // Immediate processing for high-severity events
    if (['auth_failure', 'devtools_opened'].includes(type)) {
      this.processHighSeverityEvent(event)
    }
  }

  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return

    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      
      const eventsToProcess = [...this.eventQueue]
      this.eventQueue = []

      await this.supabase.from('security_events').insert(
        eventsToProcess.map(event => ({
          user_id: user?.id,
          event_type: event.type,
          severity: this.calculateSeverity(event.type),
          details: {
            ...event.details,
            url: event.url,
            user_agent: event.userAgent
          },
          timestamp: event.timestamp
        }))
      )

    } catch (error) {
      console.error('Failed to process security events:', error)
      // Keep events in queue for retry
    }
  }

  private async processHighSeverityEvent(event: SecurityEvent): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    await this.supabase.from('security_events').insert({
      user_id: user?.id,
      event_type: event.type,
      severity: 'high',
      details: event.details,
      timestamp: event.timestamp,
      requires_immediate_attention: true
    })

    // Trigger alert if needed
    if (event.type === 'auth_failure') {
      this.triggerSecurityAlert('Multiple authentication failures detected')
    }
  }

  private calculateSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'context_menu_access': 'low',
      'suspicious_activity': 'medium',
      'devtools_opened': 'high',
      'auth_failure': 'high',
      'data_access_violation': 'critical',
      'location_violation': 'medium'
    }

    return severityMap[eventType] || 'low'
  }

  private async triggerSecurityAlert(message: string): Promise<void> {
    // Send alert to security team
    console.warn(`SECURITY ALERT: ${message}`)
    
    // In production, this would integrate with alerting systems
    // like PagerDuty, Slack, or email notifications
  }
}

interface SecurityEvent {
  id: string
  type: string
  details: any
  timestamp: string
  url: string
  userAgent: string
}
```

### 6.2 Incident Response Procedures

**Security Incident Handler:**
```typescript
// lib/security/incidentResponse.ts
export class IncidentResponseService {
  private supabase = createClientComponentClient()

  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // Immediate response based on severity
    switch (incident.severity) {
      case 'critical':
        await this.handleCriticalIncident(incident)
        break
      case 'high':
        await this.handleHighSeverityIncident(incident)
        break
      case 'medium':
        await this.handleMediumSeverityIncident(incident)
        break
      case 'low':
        await this.logIncident(incident)
        break
    }
  }

  private async handleCriticalIncident(incident: SecurityIncident): Promise<void> {
    // Immediate containment actions
    if (incident.type === 'data_breach') {
      await this.isolateAffectedSystems(incident.affectedSystems)
      await this.notifyIncidentCommandStructure(incident)
    }
    
    if (incident.type === 'unauthorized_access') {
      await this.revokeUserAccess(incident.userId)
      await this.forceSessionTermination(incident.userId)
    }

    // Document critical incident
    await this.createIncidentRecord(incident, 'critical')
    
    // Alert security team immediately
    await this.alertSecurityTeam(incident)
  }

  private async handleHighSeverityIncident(incident: SecurityIncident): Promise<void> {
    if (incident.type === 'multiple_auth_failures') {
      await this.temporaryAccountLockout(incident.userId, 15) // 15 minutes
    }
    
    if (incident.type === 'suspicious_location_access') {
      await this.requireLocationRevalidation(incident.userId)
    }

    await this.createIncidentRecord(incident, 'high')
    await this.notifySecurityTeam(incident)
  }

  private async isolateAffectedSystems(systems: string[]): Promise<void> {
    // In a real implementation, this would trigger infrastructure isolation
    console.log(`Isolating systems: ${systems.join(', ')}`)
    
    // Log isolation action
    await this.supabase.from('incident_actions').insert({
      action_type: 'system_isolation',
      affected_systems: systems,
      initiated_by: 'automated_response',
      timestamp: new Date().toISOString()
    })
  }

  private async revokeUserAccess(userId: string): Promise<void> {
    // Revoke all active sessions for user
    await this.supabase.rpc('revoke_user_sessions', { user_id: userId })
    
    // Disable user account temporarily
    await this.supabase
      .from('users')
      .update({ 
        account_locked: true,
        locked_reason: 'security_incident',
        locked_at: new Date().toISOString()
      })
      .eq('id', userId)

    console.log(`User access revoked: ${userId}`)
  }

  private async notifyIncidentCommandStructure(incident: SecurityIncident): Promise<void> {
    // Get incident commanders and admin users
    const { data: recipients } = await this.supabase
      .from('users')
      .select('id, email, name, phone')
      .in('role', ['incident_commander', 'admin'])

    const message = `CRITICAL SECURITY INCIDENT: ${incident.title}\n\n` +
                   `Type: ${incident.type}\n` +
                   `Time: ${incident.timestamp}\n` +
                   `Details: ${incident.description}\n` +
                   `Immediate action required.`

    // Send notifications (email, SMS, etc.)
    for (const recipient of recipients || []) {
      await this.sendSecurityNotification(recipient.email, message)
      
      // For critical incidents, also send SMS if available
      if (recipient.phone) {
        await this.sendSecuritySMS(recipient.phone, message)
      }
    }
  }

  private async createIncidentRecord(
    incident: SecurityIncident, 
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from('security_incidents')
      .insert({
        incident_id: crypto.randomUUID(),
        title: incident.title,
        type: incident.type,
        severity,
        description: incident.description,
        affected_user_id: incident.userId,
        affected_systems: incident.affectedSystems,
        detection_method: 'automated',
        status: 'open',
        created_at: new Date().toISOString(),
        details: incident.metadata
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create incident record:', error)
      throw error
    }

    return data.incident_id
  }

  async generateSecurityReport(
    startDate: Date, 
    endDate: Date,
    operationId?: string
  ): Promise<SecurityReport> {
    // Aggregate security metrics
    const { data: incidents } = await this.supabase
      .from('security_incidents')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('operation_id', operationId)

    const { data: events } = await this.supabase
      .from('security_events')
      .select('event_type, severity, timestamp')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())

    const { data: auditLogs } = await this.supabase
      .from('audit_logs')
      .select('action, success, timestamp')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalIncidents: incidents?.length || 0,
        criticalIncidents: incidents?.filter(i => i.severity === 'critical').length || 0,
        totalSecurityEvents: events?.length || 0,
        failedAuthAttempts: auditLogs?.filter(l => l.action === 'login' && !l.success).length || 0
      },
      incidentsByType: this.groupIncidentsByType(incidents || []),
      eventsByType: this.groupEventsByType(events || []),
      recommendations: this.generateSecurityRecommendations(incidents || [], events || [])
    }
  }

  private groupIncidentsByType(incidents: any[]): Record<string, number> {
    return incidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1
      return acc
    }, {})
  }

  private groupEventsByType(events: any[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1
      return acc
    }, {})
  }

  private generateSecurityRecommendations(incidents: any[], events: any[]): string[] {
    const recommendations: string[] = []

    if (incidents.filter(i => i.type === 'auth_failure').length > 10) {
      recommendations.push('Consider implementing additional authentication controls (MFA)')
    }

    if (events.filter(e => e.event_type === 'devtools_opened').length > 5) {
      recommendations.push('Increase security awareness training for users')
    }

    if (incidents.filter(i => i.severity === 'critical').length > 0) {
      recommendations.push('Review and update incident response procedures')
    }

    return recommendations
  }
}

interface SecurityIncident {
  title: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  userId?: string
  affectedSystems?: string[]
  timestamp: string
  metadata?: any
}

interface SecurityReport {
  period: { start: Date; end: Date }
  summary: {
    totalIncidents: number
    criticalIncidents: number
    totalSecurityEvents: number
    failedAuthAttempts: number
  }
  incidentsByType: Record<string, number>
  eventsByType: Record<string, number>
  recommendations: string[]
}
```

---

## 7. Implementation Timeline and Phases

### Phase 1: Foundation Security (Weeks 1-2)
**Critical Security Implementation**

**Week 1:**
- ✅ Supabase Auth integration with email/password
- ✅ Basic RLS policies for operations and facilities
- ✅ Client-side encryption for local storage
- ✅ Remove all hardcoded API keys from client code
- ✅ Set up Edge Functions for external API calls

**Week 2:**
- ✅ MFA implementation for incident commanders
- ✅ Session management and secure logout
- ✅ Basic audit logging for user actions
- ✅ Data classification system implementation
- ✅ Field device security measures

### Phase 2: Role-Based Access Control (Weeks 3-4)
**IAP Role Implementation**

**Week 3:**
- ✅ Complete RLS policy implementation for all tables
- ✅ Frontend role enforcement hooks
- ✅ I&P Group vs Discipline vs Field team access patterns
- ✅ Personnel data protection and PII detection
- ✅ IAP document access controls

**Week 4:**
- ✅ Geographic access controls (location validation)
- ✅ Advanced audit logging with context
- ✅ Security event monitoring setup
- ✅ Incident response procedures
- ✅ Device security and auto-wipe features

### Phase 3: Compliance and Monitoring (Weeks 5-6)
**Regulatory Compliance**

**Week 5:**
- ✅ GDPR compliance features (data export, deletion)
- ✅ Privacy controls and PII redaction
- ✅ Enhanced audit trail with retention policies
- ✅ Security reporting dashboard
- ✅ API usage tracking and cost monitoring

**Week 6:**
- ✅ Real-time security monitoring
- ✅ Automated threat detection
- ✅ Security incident management
- ✅ Comprehensive security testing
- ✅ User training materials and documentation

### Phase 4: Advanced Security (Weeks 7-8)
**Enterprise Features**

**Week 7:**
- ✅ Advanced behavioral analytics
- ✅ Anomaly detection algorithms
- ✅ Integration with external security tools
- ✅ Performance optimization of security features
- ✅ Disaster recovery procedures

**Week 8:**
- ✅ Security penetration testing
- ✅ Compliance audit preparation
- ✅ Final security hardening
- ✅ Production deployment security review
- ✅ Go-live security monitoring

---

## 8. Success Metrics and Validation

### Security Performance Metrics
- **Authentication Success Rate:** >99.5%
- **MFA Adoption Rate:** 100% for incident commanders
- **API Key Exposure:** 0 instances
- **Data Breach Incidents:** 0 critical incidents
- **Audit Log Completeness:** 100% for sensitive operations
- **Access Control Violations:** <0.1% of requests
- **Field Device Security:** 100% auto-wipe capability

### Compliance Metrics
- **GDPR Compliance:** 100% data export/deletion requests fulfilled
- **Audit Trail Coverage:** 100% for all sensitive data access
- **Data Classification:** 100% of sensitive data properly classified
- **Incident Response Time:** <15 minutes for critical incidents
- **Security Training:** 100% user completion rate
- **Privacy Policy Compliance:** 100% user consent tracking

### User Experience Metrics
- **Login Success Rate:** >98% (including MFA)
- **Security Feature Adoption:** >90% user acceptance
- **False Positive Rate:** <5% for security alerts
- **Field Operation Continuity:** 100% offline capability maintained
- **Performance Impact:** <5% overhead from security features

---

## 9. Risk Mitigation and Contingency Plans

### Technical Risks
1. **Supabase Service Outage**
   - Mitigation: Offline mode with encrypted local storage
   - Contingency: Manual fallback procedures for critical operations

2. **API Key Compromise**
   - Mitigation: Immediate key rotation capabilities
   - Contingency: Alternative service providers configured

3. **Performance Impact**
   - Mitigation: Optimization and caching strategies
   - Contingency: Graceful degradation of security features

### Operational Risks
1. **User Resistance to Security Measures**
   - Mitigation: Comprehensive training and change management
   - Contingency: Phased rollout with user feedback integration

2. **Field Connectivity Issues**
   - Mitigation: Robust offline capabilities
   - Contingency: Satellite connectivity backup for critical operations

3. **Compliance Audit Failure**
   - Mitigation: Regular internal audits and compliance reviews
   - Contingency: Rapid remediation procedures with legal guidance

---

## 10. Conclusion

This security implementation plan addresses all critical vulnerabilities identified in the disaster-ops-v3 system while preserving the excellent user experience of the existing UI. The phased approach ensures minimal disruption to operations while implementing enterprise-grade security appropriate for disaster response scenarios.

**Key Security Achievements:**
- **Authentication:** Robust Supabase Auth with MFA for critical roles
- **Authorization:** Fine-grained RLS policies matching IAP role requirements
- **Data Protection:** Client-side encryption and data classification
- **API Security:** Secure key management with Edge Functions
- **Compliance:** GDPR compliance and comprehensive audit trails
- **Field Security:** Device protection and geographic access controls
- **Monitoring:** Real-time security monitoring and incident response

The security architecture balances the need for robust protection with the operational requirements of disaster response, ensuring that security measures enhance rather than hinder emergency operations effectiveness.

**Next Steps:**
1. Approve security implementation plan
2. Begin Phase 1 foundation security implementation
3. Establish security training program for users
4. Set up security monitoring infrastructure
5. Plan compliance audit schedule

This security framework will provide the American Red Cross with a secure, compliant, and operationally effective disaster management system that protects sensitive information while enabling rapid emergency response.