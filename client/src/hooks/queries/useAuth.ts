import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/services';
import { QUERY_KEYS } from '../../api/config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface InviteData {
  selectedRole: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  associationIds?: string[];
  reserveStudyIds?: string[];
}

// Auth Query Hooks

// Get user profile
export const useProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.PROFILE,
    queryFn: authApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Get users
export const useAuthUsers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.USERS,
    queryFn: authApi.getUsers,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get organization users
export const useOrgUsers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.AUTH.ORG_USERS,
    queryFn: authApi.getOrgUsers,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Auth Mutation Hooks

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, LoginCredentials>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store token
      if (data.token) {
        sessionStorage.setItem('token', data.token);
      }
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
    },
  });
};

// Register mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

// Verify OTP mutation
export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      if (data.token) {
        sessionStorage.setItem('token', data.token);
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
    },
  });
};

// Resend OTP mutation
export const useResendOtp = () => {
  return useMutation<any, Error, string>({
    mutationFn: authApi.resendOtp,
  });
};

// Update company profile mutation
export const useUpdateCompanyProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.updateCompanyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
    },
  });
};

// Remove logo mutation
export const useRemoveLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, string>({
    mutationFn: authApi.removeLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ORG_USERS });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, string>({
    mutationFn: authApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ORG_USERS });
    },
  });
};

// Invite advisory mutation
export const useInviteAdvisory = () => {
  return useMutation<any, Error, InviteData>({
    mutationFn: authApi.inviteAdvisory,
  });
};

// Verify advisory query
export const useVerifyAdvisory = (token: string, enabled = true) => {
  return useQuery({
    queryKey: ['auth', 'verify-advisory', token],
    queryFn: () => authApi.verifyAdvisory(token),
    enabled: enabled && !!token,
    retry: 1,
  });
};

// Complete advisory profile mutation
export const useCompleteAdvisoryProfile = () => {
  return useMutation({
    mutationFn: ({ token, profileData }: { token: string; profileData: any }) => 
      authApi.completeAdvisoryProfile(token, profileData),
  });
};

// Upload file mutation
export const useUploadFile = () => {
  return useMutation<any, Error, FormData>({
    mutationFn: authApi.uploadFile,
  });
};

// Get users with request status
export const useUsersWithRequests = () => {
  return useQuery({
    queryKey: ['auth', 'users-with-requests'],
    queryFn: authApi.getUsersWithRequests,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Add member mutation
export const useAddMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, InviteData>({
    mutationFn: authApi.addMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ORG_USERS });
      queryClient.invalidateQueries({ queryKey: ['auth', 'users-with-requests'] });
    },
  });
};

// Add member with validation mutation
export const useInviteMemberWithValidation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, InviteData>({
    mutationFn: authApi.inviteMemberWithValidation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ORG_USERS });
      queryClient.invalidateQueries({ queryKey: ['auth', 'users-with-requests'] });
    },
  });
};

// Handle organization request mutation
export const useHandleOrgRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { requestId: string; action: 'accept' | 'reject' }>({
    mutationFn: ({ requestId, action }) => {
      // Call the userApi function
      const { handleOrgRequest } = require('../../services/userApi');
      return handleOrgRequest(requestId, action);
    },
    onSuccess: () => {
      // Invalidate all user-related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ORG_USERS });
      queryClient.invalidateQueries({ queryKey: ['auth', 'users-with-requests'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'pending-requests'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'user-companies'] });
    },
  });
};