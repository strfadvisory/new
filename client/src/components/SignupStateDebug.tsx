import React, { useState, useEffect } from 'react';
import { getSignupState } from '../utils/signupState';

const SignupStateDebug: React.FC = () => {
  const [state, setState] = useState(getSignupState());

  useEffect(() => {
    const handleStateChange = () => {
      setState(getSignupState());
    };

    window.addEventListener('signupStateChanged', handleStateChange);
    return () => window.removeEventListener('signupStateChanged', handleStateChange);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>Signup State Debug</h4>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
};

export default SignupStateDebug;