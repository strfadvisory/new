import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reserveStudiesApi } from '../../api/services';
import { QUERY_KEYS } from '../../api/config';

// Reserve Studies Query Hooks

// Get all reserve studies
export const useReserveStudies = (params = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.RESERVE_STUDIES.ALL,
    queryFn: () => reserveStudiesApi.getReserveStudies(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get reserve studies by association
export const useReserveStudiesByAssociation = (association, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.RESERVE_STUDIES.BY_ASSOCIATION(association),
    queryFn: () => reserveStudiesApi.getReserveStudiesByAssociation(association),
    enabled: enabled && !!association,
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESERVE_STUDIES.ALL });
      // Invalidate all association-specific queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'reserve-studies' && 
          query.queryKey[1] === 'by-association'
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESERVE_STUDIES.ALL });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.RESERVE_STUDIES.BY_ID(variables.studyId) 
      });
      // Invalidate association-specific queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'reserve-studies' && 
          query.queryKey[1] === 'by-association'
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESERVE_STUDIES.ALL });
      // Invalidate all association-specific queries
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'reserve-studies' && 
          query.queryKey[1] === 'by-association'
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