import { useQuery } from '@tanstack/react-query';
import { masterApi } from '../../api/services';
import { QUERY_KEYS } from '../../api/config';

// Master Data Query Hooks

// Get master data
export const useMaster = () => {
  return useQuery({
    queryKey: QUERY_KEYS.MASTER.ALL,
    queryFn: masterApi.getMaster,
    staleTime: 30 * 60 * 1000, // 30 minutes (master data changes infrequently)
  });
};