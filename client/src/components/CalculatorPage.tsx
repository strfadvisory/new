import React from 'react';
import FundGraph from './FundGraph';

interface CalculatorPageProps {
  association?: string;
  reserveStudy?: string;
}

const CalculatorPage: React.FC<CalculatorPageProps> = ({ association, reserveStudy }) => {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <FundGraph association={association} reserveStudy={reserveStudy} />
    </div>
  );
};

export default CalculatorPage;