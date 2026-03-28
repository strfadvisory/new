import React, { useState, useRef } from 'react';
import MonthlyFeePopup from './MonthlyFeePopup';
import type { FeeAdjustmentConfig } from './MonthlyFeePopup';
import YearPriorityPopup from './YearPriorityPopup';
import type { PriorityItem, YearPriorityConfig } from './YearPriorityPopup';
import type { FinancialConfig, ReserveItem } from '../utils/financialCalculations';

interface LeftPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
  selectedYearData?: any;
  excelData?: any;
  onFeeApply?: (config: FeeAdjustmentConfig) => void;
  effectiveMonthlyFee?: number;
  totalHousingUnits?: number | null;
  onHousingUnitsChange?: (units: number | null) => void;
  yearPriorityConfigs?: Record<number, any>;
  onYearPriorityApply?: (config: YearPriorityConfig) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ isCollapsed, onToggle, selectedYearData, excelData, onFeeApply, effectiveMonthlyFee, totalHousingUnits: propTotalUnits, onHousingUnitsChange, yearPriorityConfigs: propYearPriorityConfigs = {}, onYearPriorityApply }) => {
  console.log('[LeftPanel.tsx] Rendering with new design');
  
  // DEBUG: Log received configs
  React.useEffect(() => {
    console.log('[LeftPanel] 🔍 Received propYearPriorityConfigs:', {
      years: Object.keys(propYearPriorityConfigs),
      configs: Object.entries(propYearPriorityConfigs).map(([year, config]) => ({
        year,
        itemCount: config.priorities?.length || 0,
        items: config.priorities?.map((p: any) => ({ id: p.id, name: p.itemName })) || []
      }))
    });
  }, [propYearPriorityConfigs]);

  const [feePopupOpen, setFeePopupOpen] = useState(false);
  const [feePopupPos, setFeePopupPos] = useState<{ x: number; y: number } | undefined>();
  const [yearPriorityPopupOpen, setYearPriorityPopupOpen] = useState(false);
  const [yearPriorityPopupPos, setYearPriorityPopupPos] = useState<{ x: number; y: number } | undefined>();
  const [popupYearBeingEdited, setPopupYearBeingEdited] = useState<number | null>(null);
  const [isEditingUnits, setIsEditingUnits] = useState(false);
  const [calculatedYearPriorityTotal, setCalculatedYearPriorityTotal] = useState<number>(0);
  const feeValueRef = useRef<HTMLSpanElement>(null);
  const yearPriorityValueRef = useRef<HTMLSpanElement>(null);
  const unitsInputRef = useRef<HTMLInputElement>(null);

  // Full projection record for the selected year (attached by FundGraph)
  const proj = selectedYearData?.projection;

  const config = excelData?.data?.data?.config || excelData?.data?.config || {};
  
  // Use prop value if available, otherwise use config
  const displayUnits = propTotalUnits !== null && propTotalUnits !== undefined ? propTotalUnits : (config['Total Number of Housing Units'] || 0);

  // Derive sensible defaults from loaded excelData config rather than hardcoding
  const configStartYear = config['Beginning Fiscal Year of the Report'] || new Date().getFullYear();
  const year = selectedYearData?.year ?? configStartYear;
  const value = selectedYearData?.value ?? 'N/A';
  const isPositive = selectedYearData?.pos !== false;
  
  const monthlyFeePerUnit = config['Average Monthly Fee per Unit'] || 0;
  // Use the override if the user has adjusted it, otherwise show the config value
  const displayMonthlyFee = effectiveMonthlyFee ?? monthlyFeePerUnit;
  const startingBalance = config['Beginning Reserve Funds (Dollar Amount)'] || 0;
  const annualFee = (config['Average Monthly Fee per Unit'] || 0) * displayUnits * 12;

  // Per-year financial values — use projection when available, fall back to config
  const displayOpeningBalance = proj ? `$${Math.round(proj.openingBalance).toLocaleString()}` : `$${startingBalance.toLocaleString()}`;
  const displayContributions  = proj ? `$${Math.round(proj.contributions).toLocaleString()}` : `$${annualFee.toLocaleString()}`;
  const displayInterest       = proj ? `$${Math.round(proj.interest).toLocaleString()}` : '$0';
  const displayExpenses       = proj ? `$${Math.round(proj.expenses).toLocaleString()}` : '$0';
  const displayFundingRatio   = proj ? `${proj.fundingRatio.toFixed(1)}%` : 'N/A';
  const displayCumContrib     = proj ? `$${Math.round(proj.cumulativeContributions).toLocaleString()}` : 'N/A';

  // Calculate yearIndex for financial calculations (0-based index from config start year)
  const yearIndex = proj ? proj.year - configStartYear : 0;
  
  // Get reserve items from excelData - handle nested structure like FundGraph does
  const actualData = excelData?.data?.data || excelData?.data || {};
  const items = actualData.items || [];
  
  console.log('[LeftPanel] DETAILED DEBUG - Year Priority Data Flow:', {
    hasExcelData: !!excelData,
    hasProjection: !!proj,
    selectedYear: year,
    configStartYear,
    projYear: proj?.year,
    calculatedYearIndex: yearIndex,
    itemsCount: items?.length || 0,
    firstItem: items?.[0] ? {
      itemName: items[0].itemName,
      expectedLife: items[0].expectedLife,
      remainingLife: items[0].remainingLife,
      replacementCost: items[0].replacementCost,
      sirsType: items[0].sirsType,
    } : 'NO ITEMS',
    configObjectKeys: Object.keys(config).slice(0, 10),
  });
  
  // Build financialConfig exactly like FundGraph does
  const financialConfig: FinancialConfig = {
    startingBalance: config['Beginning Reserve Funds (Dollar Amount)'] || 0,
    monthlyFeePerUnit: config['Average Monthly Fee per Unit'] || 0,
    totalUnits: displayUnits,
    inflationRate: (config['Inflation Rate Used in the Report'] || 0) / 100,
    investmentRate: (config['Suggested Rate of Return on Investments'] || 0) / 100,
    currentYear: configStartYear,
    yearsToProject: config['Number of Years Covered in the Report'] || 30,
    safetyNet: config['Safety Net'] || 0,
    cashReserveThreshold: config['Cash Reserve Threshold'],
    maxAnnualPctIncrease: config['Max Annual Pct Increase'],
  };
  
  console.log('[LeftPanel] Built FinancialConfig:', {
    currentYear: financialConfig.currentYear,
    yearsToProject: financialConfig.yearsToProject,
    inflationRate: financialConfig.inflationRate,
    totalUnits: financialConfig.totalUnits,
  });
  
  // Map items to ReserveItem format
  const reserveItems: ReserveItem[] = items.map((item: any) => ({
    itemName: item.itemName,
    expectedLife: Number(item.expectedLife) || 0,
    remainingLife: Number(item.remainingLife) || 0,
    replacementCost: Number(item.replacementCost) || 0,
    sirsType: Number(item.sirsType) || 0,
  }));

  const handleFeeClick = () => {
    if (feeValueRef.current) {
      const rect = feeValueRef.current.getBoundingClientRect();
      setFeePopupPos({ x: rect.right + 8, y: rect.top });
    }
    setFeePopupOpen(true);
  };

  const handleYearPriorityClick = () => {
    console.log('[LeftPanel] 👆 handleYearPriorityClick triggered');
    console.log('[LeftPanel] Current state:', {
      hasSelectedYearData: !!selectedYearData,
      selectedYear: selectedYearData?.year,
      projYear: proj?.year,
      hasExcelData: !!excelData,
      configStartYear,
      yearIndex,
      itemsCount: items.length,
    });
    
    console.log('[LeftPanel] 🔑 Config lookup:', {
      year,
      popupYearBeingEdited,
      lookupKey: popupYearBeingEdited ?? year,
      hasConfigForYear: !!(propYearPriorityConfigs[year]),
      configForYear: propYearPriorityConfigs[year],
      allConfigYears: Object.keys(propYearPriorityConfigs),
    });
    
    // IMPORTANT: Lock the popup to this specific year so edits apply correctly
    // even if user navigates to a different year while popup is open
    setPopupYearBeingEdited(year);
    
    if (yearPriorityValueRef.current) {
      const rect = yearPriorityValueRef.current.getBoundingClientRect();
      setYearPriorityPopupPos({ x: rect.right + 8, y: rect.top });
    }
    setYearPriorityPopupOpen(true);
  };

  const handleLocalYearPriorityApply = (config: YearPriorityConfig) => {
    // Calculate total from priorities
    const totalCost = Math.round(config.priorities.reduce((sum, p) => sum + p.inflatedCost, 0));
    
    // Update the displayed total for the YEAR BEING EDITED (not the currently displayed year)
    // This ensures updates work even if user navigates to a different year while popup is open
    if (popupYearBeingEdited !== null && config.selectedYear === popupYearBeingEdited) {
      console.log('[LeftPanel] Updating calculated year priority total to:', totalCost, 'for year:', popupYearBeingEdited);
      setCalculatedYearPriorityTotal(totalCost);
    }

    console.log('[LeftPanel] Year Priority config updated:', { 
      year: config.selectedYear, 
      itemCount: config.priorities.length, 
      filterType: config.filterType,
      totalCost,
      budgetAllocated: Object.keys(config.budgetAllocation || {}).length,
    });

    // Call parent callback to update central state
    console.log('[LeftPanel] Calling parent onYearPriorityApply callback');
    if (onYearPriorityApply) {
      onYearPriorityApply(config);
    }

    // Broadcast change to ensure graph and list update
    console.log('[LeftPanel] Broadcasting priority update to parent components');
    window.dispatchEvent(new CustomEvent('yearPriorityUpdated', { 
      detail: { 
        year: config.selectedYear, 
        priorities: config.priorities,
        budgetAllocation: config.budgetAllocation,
        totalCost,
      } 
    }));
  };


  const handleUnitsEdit = () => {
    setIsEditingUnits(true);
    setTimeout(() => unitsInputRef.current?.focus(), 0);
  };

  // Initialize calculated total when popup opens/year changes, taking locked year into account
  React.useEffect(() => {
    // Reset popup year lock when popup closes
    if (!yearPriorityPopupOpen) {
      setPopupYearBeingEdited(null);
      console.log('[LeftPanel] Popup closed - reset popupYearBeingEdited');
      return;
    }

    // When popup is open, check if we have a saved config for the locked year
    if (popupYearBeingEdited !== null) {
      const savedConfig = propYearPriorityConfigs[popupYearBeingEdited];
      if (savedConfig) {
        const totalCost = Math.round(savedConfig.priorities.reduce((sum: number, p: PriorityItem) => sum + p.inflatedCost, 0));
        setCalculatedYearPriorityTotal(totalCost);
        console.log('[LeftPanel] Loaded saved config for locked year', popupYearBeingEdited, 'with total:', totalCost);
      } else {
        // Initialize from projection - get the projection for the locked year
        const yearIndexForLockedYear = popupYearBeingEdited - configStartYear;
        const initialTotal = proj && proj.year === popupYearBeingEdited 
          ? Math.round(proj.expenses) 
          : 0;
        setCalculatedYearPriorityTotal(initialTotal);
        console.log('[LeftPanel] Initialized from projection for locked year', popupYearBeingEdited, 'with total:', initialTotal);
      }
    }
  }, [yearPriorityPopupOpen, popupYearBeingEdited, proj, propYearPriorityConfigs, configStartYear]);

  const handleUnitsSave = () => {
    setIsEditingUnits(false);
  };

  const handleUnitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onHousingUnitsChange?.(value ? Number(value) : null);
  };

  const handleUnitsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUnitsSave();
    } else if (e.key === 'Escape') {
      setIsEditingUnits(false);
      onHousingUnitsChange?.(config['Total Number of Housing Units'] || null);
    }
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
          <span style={{ fontSize: '14px', color: '#374151' }}>Total Housing Units</span>
          {isEditingUnits ? (
            <input
              ref={unitsInputRef}
              type="number"
              value={displayUnits}
              onChange={handleUnitsChange}
              onBlur={handleUnitsSave}
              onKeyDown={handleUnitsKeyDown}
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#10b981',
                border: '1px solid #10b981',
                borderRadius: '4px',
                padding: '4px 8px',
                width: '80px',
                textAlign: 'right',
              }}
            />
          ) : (
            <span
              onClick={handleUnitsEdit}
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#10b981',
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationStyle: 'dashed',
                textUnderlineOffset: '3px',
              }}
              title="Click to edit Total Housing Units"
            >
              {displayUnits}
            </span>
          )}
        </div>
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
          <span
            ref={yearPriorityValueRef}
            onClick={handleYearPriorityClick}
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#10b981',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dashed',
              textUnderlineOffset: '3px',
            }}
            title="Click to manage priorities"
          >
            {popupYearBeingEdited === year && calculatedYearPriorityTotal > 0 ? `$${calculatedYearPriorityTotal.toLocaleString()}` : displayExpenses}
          </span>
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
          { label: 'Total Housing Units',    value: displayUnits || '0' },
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
        computedFee={effectiveMonthlyFee !== monthlyFeePerUnit ? effectiveMonthlyFee : undefined}
      />
      <YearPriorityPopup
        key={`${popupYearBeingEdited ?? year}`}
        isOpen={yearPriorityPopupOpen}
        onClose={() => {
          console.log('[LeftPanel] Closing Year Priority popup');
          setYearPriorityPopupOpen(false);
          // Keep the calculated value for persistence
        }}
        year={year}
        yearIndex={yearIndex}
        yearPriorityConfig={(() => {
          const lookupYear = popupYearBeingEdited ?? year;
          const config = propYearPriorityConfigs[lookupYear];
          console.log('[LeftPanel] 📦 Passing config to popup:', {
            lookupYear,
            hasConfig: !!config,
            itemCount: config?.priorities?.length || 0,
            items: config?.priorities?.map((p: any) => ({ id: p.id, name: p.itemName })) || []
          });
          return config;
        })()}
        reserveItems={reserveItems}
        financialConfig={financialConfig}
        initialPosition={yearPriorityPopupPos}
        onApply={handleLocalYearPriorityApply}
      />
    </div>
  );
};

export default LeftPanel;