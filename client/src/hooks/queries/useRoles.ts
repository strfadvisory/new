import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../../api/services';
import { QUERY_KEYS } from '../../api/config';

interface Role {
  _id: string;
  name: string;
  type: string;
  permissions: string[];
}

// Roles Query Hooks

// Get all roles
export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: QUERY_KEYS.ROLES.ALL,
    queryFn: rolesApi.getRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get role by ID
export const useRole = (roleId: string, enabled = true) => {
  return useQuery<Role>({
    queryKey: QUERY_KEYS.ROLES.BY_ID(roleId),
    queryFn: () => rolesApi.getRoleById(roleId),
    enabled: enabled && !!roleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user permissions
export const useUserPermissions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ROLES.USER_PERMISSIONS,
    queryFn: rolesApi.getUserPermissions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get company types
export const useCompanyTypes = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ROLES.COMPANY_TYPES,
    queryFn: rolesApi.getCompanyTypes,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get user next steps
export const useUserNextsteps = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ROLES.USER_NEXTSTEPS,
    queryFn: rolesApi.getUserNextsteps,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user videos
export const useUserVideos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ROLES.USER_VIDEOS,
    queryFn: rolesApi.getUserVideos,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get child roles
export const useChildRoles = () => {
  return useQuery<Role[]>({
    queryKey: QUERY_KEYS.ROLES.CHILD_ROLES,
    queryFn: rolesApi.getChildRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get default permissions
export const useDefaultPermissions = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ROLES.DEFAULT_PERMISSIONS,
    queryFn: rolesApi.getDefaultPermissions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Roles Mutation Hooks

// Create role
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Role, Error, Partial<Role>>({
    mutationFn: rolesApi.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES.CHILD_ROLES });
    },
  });
};

// Update role
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Role, Error, { roleId: string; roleData: Partial<Role> }>({
    mutationFn: ({ roleId, roleData }) => rolesApi.updateRole(roleId, roleData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES.BY_ID(variables.roleId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES.CHILD_ROLES });
    },
  });
};

// Delete role
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: rolesApi.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES.CHILD_ROLES });
    },
  });
};

// Update user next step
export const useUpdateUserNextstep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: rolesApi.updateUserNextstep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES.USER_NEXTSTEPS });
    },
  });
};