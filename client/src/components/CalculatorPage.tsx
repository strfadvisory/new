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
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
 
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
      display: 'flex',
      position: 'relative'
    }}>
      {/* View Toggle Header */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        gap: '8px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => setViewMode('graph')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: viewMode === 'graph' ? '#3b82f6' : 'transparent',
            color: viewMode === 'graph' ? 'white' : '#6b7280'
          }}
        >
          Graph View
        </button>
        <button
          onClick={() => setViewMode('list')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            backgroundColor: viewMode === 'list' ? '#3b82f6' : 'transparent',
            color: viewMode === 'list' ? 'white' : '#6b7280'
          }}
        >
          List View
        </button>
      </div>

      {/* Left Panel Container - Only show in graph view */}
      {viewMode === 'graph' && (
        <div style={{
          width: isLeftPanelCollapsed ? '0px' : '300px',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          height: '100vh'
        }}>
          <LeftPanel isCollapsed={isLeftPanelCollapsed} onToggle={toggleLeftPanel} selectedYearData={selectedYearData} excelData={excelData} />
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
        paddingTop: '60px'
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
        />
      </div>
    </div>
  );
};

export default CalculatorPage;