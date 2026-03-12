import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reserveStudiesApi } from '../../api/services';
import { QUERY_KEYS } from '../../api/config';

// Reserve Studies Query Hooks

// Get all reserve studies (now requires associationId)
export const useReserveStudies = (associationId, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.RESERVE_STUDIES.BY_ASSOCIATION(associationId),
    queryFn: () => reserveStudiesApi.getReserveStudies(associationId),
    enabled: enabled && !!associationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get all reserve studies for superadmin (no associationId required)
export const useAllReserveStudies = (enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.RESERVE_STUDIES.ALL_SUPERADMIN,
    queryFn: reserveStudiesApi.getAllReserveStudies,
    enabled: enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get reserve studies by association
export const useReserveStudiesByAssociation = (associationId, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.RESERVE_STUDIES.BY_ASSOCIATION(associationId),
    queryFn: () => reserveStudiesApi.getReserveStudiesByAssociation(associationId),
    enabled: enabled && !!associationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get reserve study by ID
export const useReserveStudy = (studyId, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.RESERVE_STUDIES.BY_ID(studyId),
    queryFn: () => reserveStudiesApi.getReserveStudyById(studyId),
    enabled: enabled && !!studyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Reserve Studies Mutation Hooks

// Create reserve study
export const useCreateReserveStudy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reserveStudiesApi.createReserveStudy,
    onSuccess: () => {
      // Invalidate all association-specific queries and superadmin queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'reserve-studies' && 
          (query.queryKey[1] === 'by-association' || query.queryKey[1] === 'all-superadmin')
      });
    },
  });
};

// Update reserve study
export const useUpdateReserveStudy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ studyId, studyData }) => 
      reserveStudiesApi.updateReserveStudy(studyId, studyData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.RESERVE_STUDIES.BY_ID(variables.studyId) 
      });
      // Invalidate association-specific queries and superadmin queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'reserve-studies' && 
          (query.queryKey[1] === 'by-association' || query.queryKey[1] === 'all-superadmin')
      });
    },
  });
};

// Delete reserve study
export const useDeleteReserveStudy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reserveStudiesApi.deleteReserveStudy,
    onSuccess: () => {
      // Invalidate all association-specific queries and superadmin queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'reserve-studies' && 
          (query.queryKey[1] === 'by-association' || query.queryKey[1] === 'all-superadmin')
      });
    },
  });
};

// Get parsed reserve study data
export const useParsedReserveStudy = (studyId, enabled = true) => {
  return useQuery({
    queryKey: ['reserve-studies', 'parsed', studyId],
    queryFn: () => reserveStudiesApi.getParsedReserveStudy(studyId),
    enabled: enabled && !!studyId,
    staleTime: 5 * 60 * 1000,
  });
};