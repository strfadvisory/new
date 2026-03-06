import { useQuery, useMutation } from '@tanstack/react-query';
import { validationApi } from '../../api/services';
import { QUERY_KEYS } from '../../api/config';

// Validation Query Hooks

// Validate email (with debouncing)
export const useEmailValidation = (email, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.VALIDATION.EMAIL(email),
    queryFn: () => validationApi.validateEmail(email),
    enabled: enabled && !!email && email.includes('@'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Validation Mutation Hooks

// Validate email mutation (for immediate validation)
export const useValidateEmail = () => {
  return useMutation({
    mutationFn: validationApi.validateEmail,
  });
};