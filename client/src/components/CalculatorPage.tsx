import React, { useState } from 'react';
import FundGraph from './FundGraph';
import LeftPanel from './LeftPanel';
import { viewModeEmitter } from '../utils/eventEmitter';
import type { FeeAdjustmentConfig } from './MonthlyFeePopup';

interface CalculatorPageProps {
  association?: string;
  reserveStudy?: string;
  excelData?: any;
  viewMode?: 'graph' | 'list';
  onViewModeChange?: (mode: 'graph' | 'list') => void;
}

const CalculatorPage: React.FC<CalculatorPageProps> = ({ association, reserveStudy, excelData, viewMode: propViewMode = 'graph', onViewModeChange }) => {
  console.log('[CalculatorPage.tsx] Received props:', { association, reserveStudy, hasExcelData: !!excelData, propViewMode, onViewModeChange });
  console.log('[CalculatorPage.tsx] ViewMode from parent:', propViewMode);
  
  // Console complete JSON data when received
  React.useEffect(() => {
    if (excelData) {
      console.log('[CalculatorPage] Complete JSON Data Received:');
      console.log('='.repeat(50));
      console.log(JSON.stringify(excelData, null, 2));
      console.log('='.repeat(50));
      console.log('[CalculatorPage] Data structure breakdown:');
      console.log('- Study ID:', excelData.studyId);
      console.log('- Association:', excelData.association);
      console.log('- Reserve Study:', excelData.reserveStudy);
      console.log('- Data keys:', Object.keys(excelData.data || {}));
      console.log('- Timestamp:', excelData.timestamp);
    }
  }, [excelData]);
  
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [selectedYearData, setSelectedYearData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>(propViewMode);
  const [feeOverride, setFeeOverride] = useState<FeeAdjustmentConfig | null>(null);

  // Reset fee override when a new study is loaded
  React.useEffect(() => {
    setFeeOverride(null);
  }, [excelData]);

  React.useEffect(() => {
    const handleViewModeChange = (mode: 'graph' | 'list') => {
      console.log('[CalculatorPage] Event received - ViewMode changed to:', mode);
      setViewMode(mode);
    };

    viewModeEmitter.on('viewModeChange', handleViewModeChange);

    return () => {
      viewModeEmitter.off('viewModeChange', handleViewModeChange);
    };
  }, []);
 
  const toggleLeftPanel = () => {
    setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
  };

  const handleYearSelect = (yearData: any) => {
    console.log('[CalculatorPage.tsx] Year selected:', yearData);
    setSelectedYearData(yearData);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      position: 'relative'
    }}> 
 
      {viewMode === 'graph' && (
        <div style={{
          width: isLeftPanelCollapsed ? '0px' : '300px',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          height: '100vh'
        }}>
          <LeftPanel
            isCollapsed={isLeftPanelCollapsed}
            onToggle={toggleLeftPanel}
            selectedYearData={selectedYearData}
            excelData={excelData}
            onFeeApply={setFeeOverride}
            effectiveMonthlyFee={feeOverride?.monthlyFeePerUnit}
          />
        </div>
      )}
      
      {/* Right Panel Container */}
      <div style={{ 
        flex: 1,
        position: 'relative',
        overflowX: 'auto',
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        paddingLeft: (viewMode === 'graph' && isLeftPanelCollapsed) ? '50px' : '0',
  
      }}>
        {/* Toggle Button for collapsed state - Only in graph view */}
        {viewMode === 'graph' && isLeftPanelCollapsed && (
          <button
            onClick={toggleLeftPanel}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
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
            →   <img src='/expend.png' /> 
          </button>
        )}
        <FundGraph 
          association={association} 
          reserveStudy={reserveStudy} 
          onYearSelect={handleYearSelect} 
          excelData={excelData}
          viewMode={viewMode}
          feeOverride={feeOverride}
        />
      </div>
    </div>
  );
};

export default CalculatorPage;