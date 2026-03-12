import { useProfile } from './queries/useAuth';

/**
 * Hook to check if the current user is a superadmin
 * @returns {boolean} true if user is superadmin, false otherwise
 */
export const useSuperAdmin = (): boolean => {
  const { data: profile } = useProfile();
  return profile?.isSuperAdmin === true;
};

/**
 * Hook to get superadmin status with loading state
 * @returns {object} { isSuperAdmin: boolean, isLoading: boolean }
 */
export const useSuperAdminStatus = () => {
  const { data: profile, isLoading } = useProfile();
  
  return {
    isSuperAdmin: profile?.isSuperAdmin === true,
    isLoading
  };
};