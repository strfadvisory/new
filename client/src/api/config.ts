// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api');

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    PROFILE: '/auth/profile',
    COMPANY_PROFILE: '/auth/company-profile',
    USERS: '/auth/users',
    ORG_USERS: '/auth/org-users',
    REMOVE_LOGO: '/auth/remove-logo',
    DELETE_USER: '/auth/user',
    FILE: '/auth/file',
    INVITE_ADVISORY: '/auth/invite-advisory',
    VERIFY_ADVISORY: '/auth/verify-advisory',
    COMPLETE_ADVISORY_PROFILE: '/auth/complete-advisory-profile',
  },
  
  // User endpoints
  USERS: {
    ALL: '/users',
    ADMINS: '/users/admins',
    COMPANIES: '/users/companies',
    STATUS: '/users/:id/status',
    CREATE_COMPANY_PROFILE: '/users/create-company-profile',
  },
  
  // Role endpoints
  ROLES: {
    BASE: '/roles',
    USER_PERMISSIONS: '/roles/user-permissions',
    COMPANY_TYPES: '/roles/company-types',
    USER_NEXTSTEPS: '/roles/user-nextsteps',
    USER_VIDEOS: '/roles/user-videos',
    USER_SUBROLES: '/roles/user-subroles',
    CHILD_ROLES: '/roles/child-roles',
    USER_NEXTSTEP: '/roles/user-nextstep',
    DEFAULT_PERMISSIONS: '/roles/default-permissions',
  },
  
  // Library endpoints
  LIBRARY: {
    BASE: '/library',
  },
  
  // Association endpoints
  ASSOCIATIONS: {
    BASE: '/associations',
  },
  
  // Reserve Studies endpoints
  RESERVE_STUDIES: {
    BASE: '/reserve-studies',
    ALL: '/reserve-studies/all', // For superadmin to get all reserve studies
  },
  
  // Master endpoints
  MASTER: {
    BASE: '/master',
  },
  
  // Validation endpoints
  VALIDATION: {
    EMAIL: '/validate/email',
  },
} as const;

// Query Keys for React Query caching
export const QUERY_KEYS = {
  // Auth queries
  AUTH: {
    PROFILE: ['auth', 'profile'] as const,
    USERS: ['auth', 'users'] as const,
    ORG_USERS: ['auth', 'org-users'] as const,
  },
  
  // User queries
  USERS: {
    ALL: ['users', 'all'] as const,
    ADMINS: ['users', 'admins'] as const,
    COMPANIES: ['users', 'companies'] as const,
    BY_ID: (id: string) => ['users', 'detail', id] as const,
  },
  
  // Role queries
  ROLES: {
    ALL: ['roles', 'all'] as const,
    BY_ID: (id: string) => ['roles', 'detail', id] as const,
    USER_PERMISSIONS: ['roles', 'user-permissions'] as const,
    COMPANY_TYPES: ['roles', 'company-types'] as const,
    USER_NEXTSTEPS: ['roles', 'user-nextsteps'] as const,
    USER_VIDEOS: ['roles', 'user-videos'] as const,
    USER_SUBROLES: ['roles', 'user-subroles'] as const,
    CHILD_ROLES: ['roles', 'child-roles'] as const,
    DEFAULT_PERMISSIONS: ['roles', 'default-permissions'] as const,
  },
  
  // Library queries
  LIBRARY: {
    ALL: ['library', 'all'] as const,
    BY_ID: (id: string) => ['library', 'detail', id] as const,
  },
  
  // Association queries
  ASSOCIATIONS: {
    ALL: ['associations', 'all'] as const,
    BY_ID: (id: string) => ['associations', 'detail', id] as const,
  },
  
  // Reserve Studies queries
  RESERVE_STUDIES: {
    ALL: ['reserve-studies', 'all'] as const,
    ALL_SUPERADMIN: ['reserve-studies', 'all-superadmin'] as const, // For superadmin
    BY_ASSOCIATION: (association: string) => ['reserve-studies', 'by-association', association] as const,
    BY_ID: (id: string) => ['reserve-studies', 'detail', id] as const,
  },
  
  // Master queries
  MASTER: {
    ALL: ['master', 'all'] as const,
  },
  
  // Validation queries
  VALIDATION: {
    EMAIL: (email: string) => ['validation', 'email', email] as const,
  },
} as const;