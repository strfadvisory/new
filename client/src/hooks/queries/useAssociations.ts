import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { associationsApi } from '../../api/services';
import { QUERY_KEYS } from '../../api/config';
import type { Association } from '../../utils/simulatorStateManager';

interface CreateAssociationData {
  name: string;
  description?: string;
}

interface UpdateAssociationParams {
  associationId: string;
  associationData: CreateAssociationData;
}

// Associations Query Hooks

// Get all associations
export const useAssociations = () => {
  // Get current user ID for cache key
  const getCurrentUserId = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user._id;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return null;
  };

  const userId = getCurrentUserId();
  
  return useQuery<Association[]>({
    queryKey: QUERY_KEYS.ASSOCIATIONS.ALL(userId),
    queryFn: associationsApi.getAssociations,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the data
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: 1, // Retry once on failure
    enabled: !!userId, // Only fetch if user is logged in
  });
};

// Get association by ID
export const useAssociation = (associationId: string, enabled = true) => {
  // Get current user ID for cache key
  const getCurrentUserId = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user._id;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return null;
  };

  const userId = getCurrentUserId();
  
  return useQuery<Association>({
    queryKey: QUERY_KEYS.ASSOCIATIONS.BY_ID(associationId, userId),
    queryFn: () => associationsApi.getAssociationById(associationId),
    enabled: enabled && !!associationId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Associations Mutation Hooks

// Create association
export const useCreateAssociation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Association, Error, CreateAssociationData>({
    mutationFn: associationsApi.createAssociation,
    onSuccess: () => {
      // Invalidate all association queries for all users
      queryClient.invalidateQueries({ queryKey: ['associations'] });
    },
  });
};

// Update association
export const useUpdateAssociation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Association, Error, UpdateAssociationParams>({
    mutationFn: ({ associationId, associationData }: UpdateAssociationParams) => 
      associationsApi.updateAssociation(associationId, associationData),
    onSuccess: (data, variables) => {
      // Invalidate all association queries for all users
      queryClient.invalidateQueries({ queryKey: ['associations'] });
    },
  });
};

// Delete association
export const useDeleteAssociation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: associationsApi.deleteAssociation,
    onSuccess: () => {
      // Invalidate all association queries for all users
      queryClient.invalidateQueries({ queryKey: ['associations'] });
      // Also invalidate reserve studies as they depend on associations
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESERVE_STUDIES.ALL });
    },
  });
};