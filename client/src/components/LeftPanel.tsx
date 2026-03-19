import React, { useState, useRef } from 'react';
import MonthlyFeePopup from './MonthlyFeePopup';
import type { FeeAdjustmentConfig } from './MonthlyFeePopup';

interface LeftPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
  selectedYearData?: any;
  excelData?: any;
  onFeeApply?: (config: FeeAdjustmentConfig) => void;
  effectiveMonthlyFee?: number;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ isCollapsed, onToggle, selectedYearData, excelData, onFeeApply, effectiveMonthlyFee }) => {
  console.log('[LeftPanel.tsx] Rendering with new design');

  const [feePopupOpen, setFeePopupOpen] = useState(false);
  const [feePopupPos, setFeePopupPos] = useState<{ x: number; y: number } | undefined>();
  const feeValueRef = useRef<HTMLSpanElement>(null);

  const year = selectedYearData?.year || 2032;
  const value = selectedYearData?.value || "$234,333";
  const isPositive = selectedYearData?.pos !== false;

  // Full projection record for the selected year (attached by FundGraph)
  const proj = selectedYearData?.projection;

  const config = excelData?.data?.data?.config || excelData?.data?.config || {};
  
  const monthlyFeePerUnit = config['Average Monthly Fee per Unit'] || 0;
  // Use the override if the user has adjusted it, otherwise show the config value
  const displayMonthlyFee = effectiveMonthlyFee ?? monthlyFeePerUnit;
  const startingBalance = config['Beginning Reserve Funds (Dollar Amount)'] || 0;
  const annualFee = (config['Average Monthly Fee per Unit'] || 0) * (config['Total Number of Housing Units'] || 0) * 12;

  // Per-year financial values — use projection when available, fall back to config
  const displayOpeningBalance = proj ? `$${Math.round(proj.openingBalance).toLocaleString()}` : `$${startingBalance.toLocaleString()}`;
  const displayContributions  = proj ? `$${Math.round(proj.contributions).toLocaleString()}` : `$${annualFee.toLocaleString()}`;
  const displayInterest       = proj ? `$${Math.round(proj.interest).toLocaleString()}` : '$0';
  const displayExpenses       = proj ? `$${Math.round(proj.expenses).toLocaleString()}` : '$0';
  const displayFundingRatio   = proj ? `${proj.fundingRatio.toFixed(1)}%` : 'N/A';
  const displayCumContrib     = proj ? `$${Math.round(proj.cumulativeContributions).toLocaleString()}` : 'N/A';

  const handleFeeClick = () => {
    if (feeValueRef.current) {
      const rect = feeValueRef.current.getBoundingClientRect();
      setFeePopupPos({ x: rect.right + 8, y: rect.top });
    }
    setFeePopupOpen(true);
  };
  
  return (
    <div style={{
      width: '300px',
      backgroundColor: 'white',
      padding: '0',
      height: '100vh',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'relative',
      borderRight: '1px solid #EBEBEB'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: '0' }}>{year}</h2>
        <button
          onClick={onToggle}
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img src='/expend.png' alt="toggle" />
        </button>
      </div>

      {/* Main Value Section */}
      <div style={{ padding: '20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
          {isPositive ? 'Remaining Surplus' : 'Deficit Amount'}
        </div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: isPositive ? '#10b981' : '#dc3545', marginBottom: '20px' }}>
          {value}
        </div>
        
        {/* Quick Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Monthly Fee</span>
          <span
            ref={feeValueRef}
            onClick={handleFeeClick}
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#10b981',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dashed',
              textUnderlineOffset: '3px',
            }}
            title="Click to adjust Monthly Fee"
          >
            ${displayMonthlyFee}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Year Priority</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#10b981' }}>{value}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Loans & Assessments</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#10b981', textDecoration: 'underline' }}>0.0</span>
        </div>
      </div>

      {/* Others Details Section */}
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Others Details</h3>
        
        {[
          { label: 'Opening Balance',        value: displayOpeningBalance },
          { label: 'Annual Contributions',   value: displayContributions },
          { label: 'Investment Return',       value: displayInterest },
          { label: 'Expenses This Year',      value: displayExpenses },
          { label: 'Funding Ratio',           value: displayFundingRatio },
          { label: 'Cumulative Contributions',value: displayCumContrib },
          { label: 'Starting Balance (Config)', value: `$${startingBalance.toLocaleString()}` },
        ].map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '14px', color: '#374151' }}>{item.label}</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.value}</span>
          </div>
        ))}
      </div>
      <MonthlyFeePopup
        isOpen={feePopupOpen}
        onClose={() => setFeePopupOpen(false)}
        monthlyFee={monthlyFeePerUnit}
        initialPosition={feePopupPos}
        onApply={onFeeApply}
      />
    </div>
  );
};

export default LeftPanel;