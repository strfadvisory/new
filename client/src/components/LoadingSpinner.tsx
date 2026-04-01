import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  message 
}) => {
  const sizeMap = {
    small: 32,
    medium: 56,
    large: 72
  };

  const borderMap = {
    small: 5,
    medium: 9,
    large: 12
  };

  const spinnerSize = sizeMap[size];
  const borderWidth = borderMap[size];

  return (
    <div className="loading-spinner-container">
      <div 
        className="spinner"
        style={{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          borderWidth: `${borderWidth}px`
        }}
      />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
