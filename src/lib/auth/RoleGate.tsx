'use client';

import React from 'react';
import { useAuth, useRoleAccess } from './AuthProvider';
import type { UserRole } from './AuthProvider';

/**
 * Role Gate Component - Phase 3 Implementation
 * 
 * Fine-grained access control for UI components.
 * Shows/hides content based on user roles and permissions.
 */

interface RoleGateProps {
  children: React.ReactNode;
  
  // Role-based access
  allowedRoles?: UserRole[];
  requiredRole?: UserRole;
  
  // Operation-specific access
  operationId?: string;
  requiredOperationRole?: string;
  
  // Resource-based access control
  resource?: string;
  action?: string;
  context?: any;
  
  // Behavior options
  fallback?: React.ReactNode;
  showFallback?: boolean;
  inverse?: boolean; // Show content when access is DENIED
}

export function RoleGate({
  children,
  allowedRoles,
  requiredRole,
  operationId,
  requiredOperationRole,
  resource,
  action,
  context,
  fallback,
  showFallback = false,
  inverse = false
}: RoleGateProps) {
  const { user, profile, hasRole, hasOperationRole, canAccess } = useAuth();

  // If no user is logged in, deny access
  if (!user || !profile) {
    return inverse ? <>{children}</> : (showFallback ? fallback || null : null);
  }

  let hasAccess = false;

  // Check allowed roles (any of the roles)
  if (allowedRoles) {
    hasAccess = allowedRoles.some(role => hasRole(role));
  }
  
  // Check specific required role
  if (requiredRole) {
    hasAccess = hasRole(requiredRole);
  }

  // Check operation-specific role
  if (operationId) {
    if (requiredOperationRole) {
      hasAccess = hasOperationRole(operationId, requiredOperationRole);
    } else {
      // Check if user has any role in the operation
      hasAccess = hasOperationRole(operationId);
    }
  }

  // Check resource-based access control
  if (resource && action) {
    hasAccess = canAccess(resource, action, context);
  }

  // If no specific checks provided, default to allowing access
  if (!allowedRoles && !requiredRole && !operationId && !resource) {
    hasAccess = true;
  }

  // Apply inverse logic if specified
  const shouldShow = inverse ? !hasAccess : hasAccess;

  if (shouldShow) {
    return <>{children}</>;
  } else {
    return showFallback ? (fallback || null) : null;
  }
}

// Convenience components for common role checks

interface AdminGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export function AdminGate({ children, fallback, showFallback = false }: AdminGateProps) {
  return (
    <RoleGate 
      requiredRole="system_admin"
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGate>
  );
}

export function OperationManagerGate({ children, fallback, showFallback = false }: AdminGateProps) {
  return (
    <RoleGate 
      allowedRoles={['system_admin', 'operation_manager']}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGate>
  );
}

export function IAPCoordinatorGate({ children, fallback, showFallback = false }: AdminGateProps) {
  return (
    <RoleGate 
      allowedRoles={['system_admin', 'operation_manager', 'iap_coordinator']}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGate>
  );
}

export function FieldSupervisorGate({ children, fallback, showFallback = false }: AdminGateProps) {
  return (
    <RoleGate 
      allowedRoles={['system_admin', 'operation_manager', 'field_supervisor']}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGate>
  );
}

// Resource-specific gates

interface ResourceGateProps {
  children: React.ReactNode;
  action: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  context?: any;
}

export function OperationGate({ children, action, fallback, showFallback = false, context }: ResourceGateProps) {
  return (
    <RoleGate 
      resource="operations"
      action={action}
      context={context}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGate>
  );
}

export function FacilityGate({ children, action, fallback, showFallback = false, context }: ResourceGateProps) {
  return (
    <RoleGate 
      resource="facilities"
      action={action}
      context={context}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGate>
  );
}

export function IAPGate({ children, action, fallback, showFallback = false, context }: ResourceGateProps) {
  return (
    <RoleGate 
      resource="iap"
      action={action}
      context={context}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGate>
  );
}

// Hook for programmatic role checking within components
export function useRoleGate() {
  const { hasRole, hasOperationRole, canAccess } = useRoleAccess();
  
  return {
    hasRole,
    hasOperationRole,
    canAccess,
    
    // Convenience methods
    isAdmin: () => hasRole('system_admin'),
    canManageOperations: () => hasRole('system_admin') || hasRole('operation_manager'),
    canEditIAP: () => hasRole('system_admin') || hasRole('operation_manager') || hasRole('iap_coordinator'),
    canManageFacilities: () => hasRole('system_admin') || hasRole('operation_manager') || hasRole('field_supervisor'),
    
    // Role-based UI helpers
    showIfAdmin: (content: React.ReactNode, fallback?: React.ReactNode) => 
      hasRole('system_admin') ? content : fallback,
    
    showIfCanEdit: (resource: string, content: React.ReactNode, fallback?: React.ReactNode) =>
      canAccess(resource, 'update') ? content : fallback,
      
    showIfCanCreate: (resource: string, content: React.ReactNode, fallback?: React.ReactNode) =>
      canAccess(resource, 'create') ? content : fallback
  };
}

// Higher-order component for role-based rendering
export function withRoleGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  roleConfig: Omit<RoleGateProps, 'children'>
) {
  return function RoleGatedComponent(props: P) {
    return (
      <RoleGate {...roleConfig}>
        <WrappedComponent {...props} />
      </RoleGate>
    );
  };
}

// Example usage:
// const AdminOnlyButton = withRoleGate(Button, { requiredRole: 'system_admin' });

// Utility component for showing role-specific UI hints
interface RoleHintProps {
  requiredRole: UserRole;
  message?: string;
  className?: string;
}

export function RoleHint({ 
  requiredRole, 
  message, 
  className = "text-xs text-gray-500 italic"
}: RoleHintProps) {
  const { hasRole } = useRoleAccess();
  
  if (hasRole(requiredRole)) {
    return null; // Don't show hint if user has the role
  }
  
  const defaultMessage = `Requires ${requiredRole.replace('_', ' ')} role`;
  
  return (
    <div className={className}>
      {message || defaultMessage}
    </div>
  );
}

// Component for displaying access denied messages
interface AccessDeniedProps {
  requiredRole?: UserRole;
  resource?: string;
  action?: string;
  message?: string;
  className?: string;
}

export function AccessDenied({ 
  requiredRole,
  resource,
  action,
  message,
  className = "p-4 bg-red-50 border border-red-200 rounded-lg"
}: AccessDeniedProps) {
  let defaultMessage = "You don't have permission to access this area.";
  
  if (requiredRole) {
    defaultMessage = `This area requires ${requiredRole.replace('_', ' ')} role or higher.`;
  } else if (resource && action) {
    defaultMessage = `You don't have permission to ${action} ${resource}.`;
  }
  
  return (
    <div className={className}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-red-400">🚫</span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Access Denied
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message || defaultMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}