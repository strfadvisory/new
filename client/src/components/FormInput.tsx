import React, { useState } from 'react';

interface FormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  type, 
  value, 
  onChange, 
  required = false,
  placeholder 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="form-input-group">
      <div className="input-wrapper">
        <input
          id={label.toLowerCase().replace(/\s+/g, '-')}
          type={isPasswordField && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder || label}
          className="form-input"
          aria-label={label}
        />
        {isPasswordField && (
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default FormInput;