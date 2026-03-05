export const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000');

export const API_ENDPOINTS = {
  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  verifyOtp: `${API_BASE_URL}/api/auth/verify-otp`,
  resendOtp: `${API_BASE_URL}/api/auth/resend-otp`,
  profile: `${API_BASE_URL}/api/auth/profile`,
  companyProfile: `${API_BASE_URL}/api/auth/company-profile`,
  users: `${API_BASE_URL}/api/auth/users`,
  orgUsers: `${API_BASE_URL}/api/auth/org-users`,
  removeLogo: `${API_BASE_URL}/api/auth/remove-logo`,
  deleteUser: `${API_BASE_URL}/api/auth/user`,
  file: `${API_BASE_URL}/api/auth/file`,
  inviteAdvisory: `${API_BASE_URL}/api/auth/invite-advisory`,
  verifyAdvisory: `${API_BASE_URL}/api/auth/verify-advisory`,
  completeAdvisoryProfile: `${API_BASE_URL}/api/auth/complete-advisory-profile`,
  
  // User endpoints
  allUsers: `${API_BASE_URL}/api/users`,
  adminUsers: `${API_BASE_URL}/api/users/admins`,
  companies: `${API_BASE_URL}/api/users/companies`,
  userStatus: `${API_BASE_URL}/api/users/:id/status`,
  
  // Role endpoints
  roles: `${API_BASE_URL}/api/roles`,
  userPermissions: `${API_BASE_URL}/api/roles/user-permissions`,
  companyTypes: `${API_BASE_URL}/api/roles/company-types`,
  userNextsteps: `${API_BASE_URL}/api/roles/user-nextsteps`,
  userVideos: `${API_BASE_URL}/api/roles/user-videos`,
  childRoles: `${API_BASE_URL}/api/roles/child-roles`,
  userNextstep: `${API_BASE_URL}/api/roles/user-nextstep`,
  defaultPermissions: `${API_BASE_URL}/api/roles/default-permissions`,
  
  // Library endpoints
  library: `${API_BASE_URL}/api/library`,
  
  // Master endpoints
  master: `${API_BASE_URL}/api/master`,
  
  // Validation endpoints
  validateEmail: `${API_BASE_URL}/api/validate/email`
};
