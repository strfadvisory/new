import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, userService, roleService, libraryService, validationService, masterService } from './api';

// Auth Hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: authService.verifyOtp
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: authService.resendOtp
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile
  });
};

export const useUpdateCompanyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.updateCompanyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: authService.getUsers
  });
};

export const useOrgUsers = () => {
  return useQuery({
    queryKey: ['orgUsers'],
    queryFn: authService.getOrgUsers
  });
};

export const useRemoveLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.removeLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['orgUsers'] });
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['orgUsers'] });
    }
  });
};

export const useInviteAdvisory = () => {
  return useMutation({
    mutationFn: authService.inviteAdvisory
  });
};

export const useVerifyAdvisory = (token: string) => {
  return useQuery({
    queryKey: ['verifyAdvisory', token],
    queryFn: () => authService.verifyAdvisory(token),
    enabled: !!token
  });
};

export const useCompleteAdvisoryProfile = () => {
  return useMutation({
    mutationFn: ({ token, profileData }: { token: string; profileData: any }) =>
      authService.completeAdvisoryProfile(token, profileData)
  });
};

// User Hooks
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: userService.getAllUsers
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: userService.getAdminUsers
  });
};

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: userService.getCompanies
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      userService.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    }
  });
};

// Role Hooks
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getRoles
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roleService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, roleData }: { roleId: string; roleData: any }) =>
      roleService.updateRole(roleId, roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roleService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });
};

export const useUserPermissions = () => {
  return useQuery({
    queryKey: ['userPermissions'],
    queryFn: roleService.getUserPermissions
  });
};

export const useCompanyTypes = () => {
  return useQuery({
    queryKey: ['companyTypes'],
    queryFn: roleService.getCompanyTypes
  });
};

export const useUserNextsteps = () => {
  return useQuery({
    queryKey: ['userNextsteps'],
    queryFn: roleService.getUserNextsteps
  });
};

export const useUserVideos = () => {
  return useQuery({
    queryKey: ['userVideos'],
    queryFn: roleService.getUserVideos
  });
};

export const useChildRoles = () => {
  return useQuery({
    queryKey: ['childRoles'],
    queryFn: roleService.getChildRoles
  });
};

export const useUpdateUserNextstep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: roleService.updateUserNextstep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userNextsteps'] });
    }
  });
};

export const useDefaultPermissions = () => {
  return useQuery({
    queryKey: ['defaultPermissions'],
    queryFn: roleService.getDefaultPermissions
  });
};

// Library Hooks
export const useLibrary = () => {
  return useQuery({
    queryKey: ['library'],
    queryFn: libraryService.getLibrary
  });
};

export const useCreateLibraryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: libraryService.createLibraryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    }
  });
};

export const useUpdateLibraryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, itemData }: { itemId: string; itemData: any }) =>
      libraryService.updateLibraryItem(itemId, itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    }
  });
};

export const useDeleteLibraryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: libraryService.deleteLibraryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    }
  });
};

// Validation Hooks
export const useValidateEmail = () => {
  return useMutation({
    mutationFn: validationService.validateEmail
  });
};

// Master Hooks
export const useMaster = () => {
  return useQuery({
    queryKey: ['master'],
    queryFn: masterService.getMaster
  });
};