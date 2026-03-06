import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { associationsApi } from '../../api/services';
import { QUERY_KEYS } from '../../api/config';

interface Association {
  _id: string;
  name: string;
  description: string;
}

interface CreateAssociationData {
  name: string;
  description: string;
}

interface UpdateAssociationParams {
  associationId: string;
  associationData: CreateAssociationData;
}

// Associations Query Hooks

// Get all associations
export const useAssociations = () => {
  return useQuery<Association[]>({
    queryKey: QUERY_KEYS.ASSOCIATIONS.ALL,
    queryFn: associationsApi.getAssociations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get association by ID
export const useAssociation = (associationId: string, enabled = true) => {
  return useQuery<Association>({
    queryKey: QUERY_KEYS.ASSOCIATIONS.BY_ID(associationId),
    queryFn: () => associationsApi.getAssociationById(associationId),
    enabled: enabled && !!associationId,
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSOCIATIONS.ALL });
    },
  });
};

// Update association
export const useUpdateAssociation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Association, Error, UpdateAssociationParams>({
    mutationFn: ({ associationId, associationData }) => 
      associationsApi.updateAssociation(associationId, associationData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSOCIATIONS.ALL });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ASSOCIATIONS.BY_ID(variables.associationId) 
      });
    },
  });
};

// Delete association
export const useDeleteAssociation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: associationsApi.deleteAssociation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSOCIATIONS.ALL });
      // Also invalidate reserve studies as they depend on associations
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESERVE_STUDIES.ALL });
    },
  });
};