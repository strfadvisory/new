import { useState, useEffect, useCallback } from 'react';
import { getUserPermissionLevel } from '../services/userApi';

export interface PermissionData {
  permissionLevel: 'ADMIN' | 'EDITOR' | 'VIEWER';
  isOwnCompany: boolean;
  companyId: string;
}

export interface PermissionHook {
  permissionLevel: 'ADMIN' | 'EDITOR' | 'VIEWER';
  isOwnCompany: boolean;
  loading: boolean;
  error: string | null;
  canCreateAssociations: () => boolean;
  canAddReserveStudy: () => boolean;
  canEdit: () => boolean;
  canView: () => boolean;
  refreshPermissions: () => Promise<void>;
}

export const usePermissions = (companyId?: string): PermissionHook => {
  const [permissionLevel, setPermissionLevel] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('VIEWER');
  const [isOwnCompany, setIsOwnCompany] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!companyId) {
      // Default to VIEWER if no company context
      setPermissionLevel('VIEWER');
      setIsOwnCompany(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getUserPermissionLevel(companyId);
      setPermissionLevel(response.permissionLevel);
      setIsOwnCompany(response.isOwnCompany);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permissions');
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Permission check functions
  const canCreateAssociations = useCallback((): boolean => {
    return true; // Allow all users to create associations
  }, []);

  const canAddReserveStudy = useCallback((): boolean => {
    return permissionLevel === 'ADMIN' || permissionLevel === 'EDITOR';
  }, [permissionLevel]);

  const canEdit = useCallback((): boolean => {
    return permissionLevel === 'ADMIN' || permissionLevel === 'EDITOR';
  }, [permissionLevel]);

  const canView = useCallback((): boolean => {
    return true; // All users can view
  }, []);

  const refreshPermissions = useCallback(async (): Promise<void> => {
    await fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissionLevel,
    isOwnCompany,
    loading,
    error,
    canCreateAssociations,
    canAddReserveStudy,
    canEdit,
    canView,
    refreshPermissions
  };
};

export default usePermissions;