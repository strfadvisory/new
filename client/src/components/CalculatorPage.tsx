import React, { useState } from 'react';
import FundGraph from './FundGraph';
import LeftPanel from './LeftPanel';

interface CalculatorPageProps {
  association?: string;
  reserveStudy?: string;
  excelData?: any;
}

const CalculatorPage: React.FC<CalculatorPageProps> = ({ association, reserveStudy, excelData }) => {
  console.log('[CalculatorPage.tsx] Received props:', { association, reserveStudy, hasExcelData: !!excelData });
  
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [selectedYearData, setSelectedYearData] = useState<any>(null);
 
  React.useEffect(() => {
    console.log('[CalculatorPage.tsx] excelData changed, resetting selectedYearData');
    setSelectedYearData(null);
  }, [excelData]);

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
      display: 'flex'
    }}>
      {/* Left Panel Container */}
      <div style={{
        width: isLeftPanelCollapsed ? '0px' : '300px',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        height: '100vh'
      }}>
        <LeftPanel isCollapsed={isLeftPanelCollapsed} onToggle={toggleLeftPanel} selectedYearData={selectedYearData} excelData={excelData} />
      </div>
      
      {/* Right Panel Container */}
      <div style={{ 
        flex: 1,
        position: 'relative',
        overflowX: 'auto',
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        paddingLeft: isLeftPanelCollapsed ? '50px' : '0'
      }}>
        {/* Toggle Button for collapsed state */}
        {isLeftPanelCollapsed && (
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
        <FundGraph association={association} reserveStudy={reserveStudy} onYearSelect={handleYearSelect} excelData={excelData} />
      </div>
    </div>
  );
};

export default CalculatorPage;