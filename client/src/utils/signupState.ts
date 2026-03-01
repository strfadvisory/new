// Utility functions for managing signup state
export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  phone: string;
  password: string;
  rePassword: string;
  zipCode: string;
  state: string;
  city: string;
  address1: string;
  address2: string;
}

export interface CompanyFormData {
  companyName: string;
  description: string;
  phone: string;
  email: string;
  contactPerson: string;
  linkedinUrl: string;
  websiteLink: string;
  zipCode: string;
  state: string;
  city: string;
  address1: string;
  address2: string;
}

export interface SignupState {
  roleId?: string;
  roleName?: string;
  email?: string;
  formData?: Partial<SignupFormData>;
  selectedCountry?: string;
  agreeToTerms?: boolean;
  currentStep?: string;
  companyFormData?: Partial<CompanyFormData>;
  useMyAddress?: boolean;
}

const defaultFormData: SignupFormData = {
  firstName: '',
  lastName: '',
  email: '',
  designation: '',
  phone: '',
  password: '',
  rePassword: '',
  zipCode: '',
  state: '',
  city: '',
  address1: '',
  address2: ''
};

export const updateSignupState = (updates: Partial<SignupState>) => {
  const currentState = getSignupState();
  const newState = { ...currentState, ...updates };
  localStorage.setItem('signupState', JSON.stringify(newState));
  
  // Dispatch custom event to notify components of state change
  window.dispatchEvent(new CustomEvent('signupStateChanged'));
};

export const getSignupState = (): SignupState => {
  const savedState = localStorage.getItem('signupState');
  return savedState ? JSON.parse(savedState) : {};
};

export const getFormData = (): SignupFormData => {
  const state = getSignupState();
  return { ...defaultFormData, ...state.formData };
};

const defaultCompanyFormData: CompanyFormData = {
  companyName: '',
  description: '',
  phone: '',
  email: '',
  contactPerson: '',
  linkedinUrl: '',
  websiteLink: '',
  zipCode: '',
  state: '',
  city: '',
  address1: '',
  address2: ''
};

export const getCompanyFormData = (): CompanyFormData => {
  const state = getSignupState();
  return { ...defaultCompanyFormData, ...state.companyFormData };
};

export const updateCompanyFormData = (formData: Partial<CompanyFormData>) => {
  const currentState = getSignupState();
  const updatedFormData = { ...currentState.companyFormData, ...formData };
  updateSignupState({ companyFormData: updatedFormData });
};

export const updateFormData = (formData: Partial<SignupFormData>) => {
  const currentState = getSignupState();
  const updatedFormData = { ...currentState.formData, ...formData };
  updateSignupState({ formData: updatedFormData });
};

export const clearSignupState = () => {
  localStorage.removeItem('signupState');
  window.dispatchEvent(new CustomEvent('signupStateChanged'));
};