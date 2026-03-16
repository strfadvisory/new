import React from 'react';
import { PasswordStrength } from '../utils/passwordValidator';
import './PasswordRequirements.css';

interface PasswordRequirementsProps {
  strength: PasswordStrength;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ strength }) => {
  const getStrengthColor = () => {
    switch (strength.strength) {
      case 'weak':
        return '#dc3545';
      case 'fair':
        return '#fd7e14';
      case 'good':
        return '#ffc107';
      case 'strong':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getStrengthLabel = () => {
    switch (strength.strength) {
      case 'weak':
        return 'Weak';
      case 'fair':
        return 'Fair';
      case 'good':
        return 'Good';
      case 'strong':
        return 'Strong';
      default:
        return 'Unknown';
    }
  };

  const metCount = strength.requirements.filter(r => r.met).length;
  const totalRequirements = strength.requirements.length;

  return (
    <div className="password-requirements-container">
      <div className="password-header">
        <span className="password-label">Password Strength</span>
        <span className="strength-indicator" style={{ color: getStrengthColor() }}>
          {getStrengthLabel()} ({metCount}/{totalRequirements})
        </span>
      </div>

      <div className="strength-bar-container">
        <div className="strength-bar" style={{ width: `${(metCount / totalRequirements) * 100}%`, backgroundColor: getStrengthColor() }}></div>
      </div>

      <div className="requirements-list">
        {strength.requirements.map((requirement, index) => (
          <div key={index} className={`requirement-item ${requirement.met ? 'met' : 'unmet'}`}>
            <span className="requirement-icon">
              {requirement.met ? (
                <i className="fas fa-check-circle"></i>
              ) : (
                <i className="fas fa-circle"></i>
              )}
            </span>
            <span className="requirement-text">{requirement.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordRequirements;
