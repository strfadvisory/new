export interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export interface PasswordStrength {
  requirements: PasswordRequirement[];
  isValid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong';
}

export const PASSWORD_REQUIREMENTS = [
  {
    label: 'At least 8 characters',
    regex: /.{8,}/,
    description: 'Use 8 or more characters'
  },
  {
    label: 'At least one uppercase letter (A-Z)',
    regex: /[A-Z]/,
    description: 'Include at least one capital letter'
  },
  {
    label: 'At least one lowercase letter (a-z)',
    regex: /[a-z]/,
    description: 'Include at least one lowercase letter'
  },
  {
    label: 'At least one number (0-9)',
    regex: /[0-9]/,
    description: 'Include at least one digit'
  },
  {
    label: 'At least one special character (!@#$%^&*)',
    regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    description: 'Include special characters like !@#$%^&*'
  }
];

export const validatePassword = (password: string): PasswordStrength => {
  const requirements = PASSWORD_REQUIREMENTS.map(req => ({
    label: req.label,
    regex: req.regex,
    met: req.regex.test(password)
  }));

  const metCount = requirements.filter(r => r.met).length;
  const totalRequirements = requirements.length;

  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (metCount < 3) {
    strength = 'weak';
  } else if (metCount === 3) {
    strength = 'fair';
  } else if (metCount === 4) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    requirements,
    isValid: metCount === totalRequirements,
    strength
  };
};
