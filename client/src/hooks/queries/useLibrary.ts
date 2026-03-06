import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '../../api/services';
import { QUERY_KEYS } from '../../api/config';

interface LibraryItem {
  _id: string;
  title: string;
  description: string;
  type: string;
}

// Library Query Hooks

// Get all library items
export const useLibrary = () => {
  return useQuery<LibraryItem[]>({
    queryKey: QUERY_KEYS.LIBRARY.ALL,
    queryFn: libraryApi.getLibrary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get library item by ID
export const useLibraryItem = (itemId: string, enabled = true) => {
  return useQuery<LibraryItem>({
    queryKey: QUERY_KEYS.LIBRARY.BY_ID(itemId),
    queryFn: () => libraryApi.getLibraryItemById(itemId),
    enabled: enabled && !!itemId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Library Mutation Hooks

// Create library item
export const useCreateLibraryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation<LibraryItem, Error, Partial<LibraryItem>>({
    mutationFn: libraryApi.createLibraryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY.ALL });
    },
  });
};

// Update library item
export const useUpdateLibraryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation<LibraryItem, Error, { itemId: string; itemData: Partial<LibraryItem> }>({
    mutationFn: ({ itemId, itemData }) => libraryApi.updateLibraryItem(itemId, itemData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY.BY_ID(variables.itemId) });
    },
  });
};

// Delete library item
export const useDeleteLibraryItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: libraryApi.deleteLibraryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIBRARY.ALL });
    },
  });
};