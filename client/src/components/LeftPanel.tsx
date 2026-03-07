import React from 'react';

interface LeftPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
  selectedYearData?: any;
  excelData?: any;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ isCollapsed, onToggle, selectedYearData, excelData }) => {
  console.log('[LeftPanel.tsx] Rendering with advanced analytics');
  
  const year = selectedYearData?.year || 2032;
  const value = selectedYearData?.value || "$234,333";
  const isPositive = selectedYearData?.pos !== false;
  
  const config = excelData?.data?.config || {};
  const modelName = config[Object.keys(config)[0]] || 'Reserve Study';
  const studyName = selectedYearData?.studyName || excelData?.studyName || modelName;
  
  const items = excelData?.data?.items || [];
  
  const projection = selectedYearData?.projection;
  const healthScore = selectedYearData?.healthScore || 0;
  const optimalFee = selectedYearData?.optimalFee || 0;
  const metrics = selectedYearData?.metrics;
  
  console.log('[LeftPanel.tsx] Analytics:', { healthScore, optimalFee, hasMetrics: !!metrics });
  
  const monthlyFeePerUnit = config['Average Monthly Fee per Unit'] || 0;
  const totalUnits = config['Total Number of Housing Units'] || 1;
  const monthlyFee = monthlyFeePerUnit * totalUnits;
  const startingBalance = config['Beginning Reserve Funds (Dollar Amount)'] || 0;
  const interestRate = config['Inflation Rate Used in the Report'] || 0;
  
  const totalReplacementCost = items.reduce((sum: number, item: any) => sum + (item.replacementCost || 0), 0);
  const avgRemainingLife = items.length > 0 
    ? (items.reduce((sum: number, item: any) => sum + (item.remainingLife || 0), 0) / items.length).toFixed(1)
    : "0";
  
  const yearPriority = value;
  const loansAssessments = "0.0";
  const annualFee = monthlyFee * 12;
  const assessment = value;
  const availableToInvest = startingBalance;
  
  const fundingRatio = projection?.fundingRatio?.toFixed(1) || "N/A";
  const riskScore = projection?.riskScore?.toFixed(1) || "0";
  const cumulativeContributions = projection?.cumulativeContributions || 0;
  const cumulativeExpenses = projection?.cumulativeExpenses || 0;
  return (
    <div style={{
      width: '300px',
      backgroundColor: 'white',
      padding: '20px',
      height: '100vh',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'relative',
      borderRight: '1px solid #EBEBEB'
    }}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '30px',
          height: '30px',
          backgroundColor: 'transparent',
 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          zIndex: 10
        }}
      >
       <img src='/expend.png' /> 
      </button>

      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '40px' }}>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{studyName}</div>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>{year}</h2>
        {healthScore > 0 && (
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Health Score: <span style={{ fontWeight: '600', color: healthScore > 70 ? '#10b981' : healthScore > 40 ? '#f59e0b' : '#ef4444' }}>{healthScore.toFixed(0)}/100</span>
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
          {isPositive ? 'Remaining Surplus' : 'Deficit Amount'}
        </div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: isPositive ? '#10b981' : '#dc3545' }}>{value}</div>
      </div>

      <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Monthly Fee/Unit</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: isPositive ? '#10b981' : '#dc3545' }}>${monthlyFeePerUnit.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Total Units</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{totalUnits}</span>
        </div>
        {optimalFee > 0 && optimalFee !== monthlyFeePerUnit && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#fef3c7', borderRadius: '6px' }}>
            <span style={{ fontSize: '13px', color: '#92400e' }}>Optimal Fee/Unit</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>${optimalFee.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Financial Analytics</h3>
        
        {[
          { label: 'Starting Balance', value: `$${startingBalance.toLocaleString()}` },
          { label: 'Annual Contribution', value: `$${annualFee.toLocaleString()}` },
          { label: 'Inflation Rate', value: `${interestRate}%` },
          { label: 'Total Replacement Cost', value: `$${totalReplacementCost.toLocaleString()}` },
          { label: 'Avg Remaining Life', value: `${avgRemainingLife} years` },
          ...(projection ? [
            { label: 'Funding Ratio', value: `${fundingRatio}%`, highlight: parseFloat(fundingRatio) < 100 },
            { label: 'Risk Score', value: riskScore, highlight: parseFloat(riskScore) > 50 },
            { label: 'Cumulative Contributions', value: `$${cumulativeContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
            { label: 'Cumulative Expenses', value: `$${cumulativeExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}` }
          ] : [])
        ].map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '8px',
            padding: item.highlight ? '4px 8px' : '0',
            background: item.highlight ? '#fee2e2' : 'transparent',
            borderRadius: '4px'
          }}>
            <span style={{ fontSize: '13px', color: item.highlight ? '#991b1b' : '#6b7280' }}>{item.label}</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: item.highlight ? '#991b1b' : '#1f2937' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftPanel;