import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const currentRole = user?.role || 'Project Manager';

  if (!allowedRoles.includes(currentRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
