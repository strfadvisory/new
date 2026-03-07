export const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api');

export const API_ENDPOINTS = {
  // Auth endpoints
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  verifyOtp: `${API_BASE_URL}/auth/verify-otp`,
  resendOtp: `${API_BASE_URL}/auth/resend-otp`,
  profile: `${API_BASE_URL}/auth/profile`,
  companyProfile: `${API_BASE_URL}/auth/company-profile`,
  users: `${API_BASE_URL}/auth/users`,
  orgUsers: `${API_BASE_URL}/auth/org-users`,
  removeLogo: `${API_BASE_URL}/auth/remove-logo`,
  deleteUser: `${API_BASE_URL}/auth/user`,
  file: `${API_BASE_URL}/auth/file`,
  inviteAdvisory: `${API_BASE_URL}/auth/invite-advisory`,
  verifyAdvisory: `${API_BASE_URL}/auth/verify-advisory`,
  completeAdvisoryProfile: `${API_BASE_URL}/auth/complete-advisory-profile`,
  
  // User endpoints
  allUsers: `${API_BASE_URL}/users`,
  adminUsers: `${API_BASE_URL}/users/admins`,
  companies: `${API_BASE_URL}/users/companies`,
  userStatus: `${API_BASE_URL}/users/:id/status`,
  createCompanyProfile: `${API_BASE_URL}/users/create-company-profile`,
  
  // Role endpoints
  roles: `${API_BASE_URL}/roles`,
  userPermissions: `${API_BASE_URL}/roles/user-permissions`,
  companyTypes: `${API_BASE_URL}/roles/company-types`,
  userNextsteps: `${API_BASE_URL}/roles/user-nextsteps`,
  userVideos: `${API_BASE_URL}/roles/user-videos`,
  childRoles: `${API_BASE_URL}/roles/child-roles`,
  userNextstep: `${API_BASE_URL}/roles/user-nextstep`,
  defaultPermissions: `${API_BASE_URL}/roles/default-permissions`,
  
  // Library endpoints
  library: `${API_BASE_URL}/library`,
  
  // Association endpoints
  associations: `${API_BASE_URL}/associations`,
  
  // Master endpoints
  master: `${API_BASE_URL}/master`,
  
  // Validation endpoints
  validateEmail: `${API_BASE_URL}/validate/email`
};
