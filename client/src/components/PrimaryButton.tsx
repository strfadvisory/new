import React from 'react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button',
  disabled = false,
  loading = false
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="primary-button"
      aria-label={typeof children === 'string' ? children : 'Submit'}
    >
      {loading ? (
        <>
          <i className="fas fa-spinner fa-spin"></i> Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton;