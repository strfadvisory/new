import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/services';
import { QUERY_KEYS } from '../../api/config';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  status?: string;
}

// Users Query Hooks

// Get all users
export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: QUERY_KEYS.USERS.ALL,
    queryFn: usersApi.getAllUsers,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get admin users
export const useAdminUsers = () => {
  return useQuery<User[]>({
    queryKey: QUERY_KEYS.USERS.ADMINS,
    queryFn: usersApi.getAdminUsers,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get companies
export const useCompanies = () => {
  return useQuery({
    queryKey: QUERY_KEYS.USERS.COMPANIES,
    queryFn: usersApi.getCompanies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user by ID
export const useUser = (userId: string, enabled = true) => {
  return useQuery<User>({
    queryKey: QUERY_KEYS.USERS.BY_ID(userId),
    queryFn: () => usersApi.getUserById(userId),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Users Mutation Hooks

// Update user status
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { userId: string; status: string }>({
    mutationFn: ({ userId, status }) => usersApi.updateUserStatus(userId, status),
    onSuccess: (data, variables) => {
      // Invalidate users queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ADMINS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.BY_ID(variables.userId) });
    },
  });
};

// Create company profile
export const useCreateCompanyProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersApi.createCompanyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.COMPANIES });
    },
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<User, Error, { userId: string; userData: Partial<User> }>({
    mutationFn: ({ userId, userData }) => usersApi.updateUser(userId, userData),
    onSuccess: (data, variables) => {
      // Invalidate users queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ADMINS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.BY_ID(variables.userId) });
    },
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, string>({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ADMINS });
    },
  });
};