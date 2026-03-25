import React, { useState } from 'react';
import FundGraph from './FundGraph';
import LeftPanel from './LeftPanel';
import { viewModeEmitter } from '../utils/eventEmitter';
import type { FeeAdjustmentConfig } from './MonthlyFeePopup';
import type { YearPriorityConfig } from './YearPriorityPopup';

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
  const [totalHousingUnits, setTotalHousingUnits] = useState<number | null>(null);
  const [yearPriorityConfigs, setYearPriorityConfigs] = useState<Record<number, any>>({});

  // DEBUG: Expose state to window for debugging
  React.useEffect(() => {
    (window as any).__yearPriorityConfigs = yearPriorityConfigs;
    console.log('[CalculatorPage] 🔍 CURRENT yearPriorityConfigs:', {
      years: Object.keys(yearPriorityConfigs),
      configs: Object.entries(yearPriorityConfigs).map(([year, config]) => ({
        year,
        itemCount: config.priorities?.length || 0,
        items: config.priorities?.map((p: any) => ({ id: p.id, name: p.itemName })) || []
      }))
    });
  }, [yearPriorityConfigs]);

  // Reset fee override and housing units when a new study is loaded
  React.useEffect(() => {
    setFeeOverride(null);
    const config = excelData?.data?.data?.config || excelData?.data?.config || {};
    setTotalHousingUnits(config['Total Number of Housing Units'] || null);
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

  // Listen for priority updates and trigger recalculation
  React.useEffect(() => {
    const handlePriorityUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { year, priorities, budgetAllocation } = customEvent.detail;
      
      console.log('[CalculatorPage] Year priority updated event received:', {
        year,
        prioritiesCount: priorities.length,
        budgetAllocationCount: Object.keys(budgetAllocation || {}).length,
      });

      // Store the priority config for this year
      setYearPriorityConfigs(prev => ({
        ...prev,
        [year]: { priorities, budgetAllocation, selectedYear: year }
      }));

      // Trigger recalculation by simulating a year select with the new data
      // This will cause FundGraph to recalculate with the updated priorities
      if (selectedYearData && selectedYearData.year === year) {
        console.log('[CalculatorPage] Broadcasting priority update to FundGraph...');
        // Dispatch event to FundGraph or trigger a state update
        window.dispatchEvent(new CustomEvent('yearPrioritiesChanged', { 
          detail: { 
            year, 
            priorities,
            budgetAllocation,
          } 
        }));
      }
    };

    window.addEventListener('yearPriorityUpdated', handlePriorityUpdate);

    return () => {
      window.removeEventListener('yearPriorityUpdated', handlePriorityUpdate);
    };
  }, [selectedYearData]);
 
  const toggleLeftPanel = () => {
    setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
  };

  const handleYearSelect = (yearData: any) => {
    console.log('[CalculatorPage.tsx] Year selected:', yearData);
    setSelectedYearData(yearData);
  };

  const handleHousingUnitsChange = (units: number | null) => {
    console.log('[CalculatorPage.tsx] Housing units changed to:', units);
    setTotalHousingUnits(units);
  };

  const handleYearPriorityApply = (config: YearPriorityConfig) => {
    console.log('[CalculatorPage] Year priority applied by LeftPanel:', {
      year: config.selectedYear,
      itemCount: config.priorities.length,
      filterType: config.filterType,
    });

    // Update the centralized state
    setYearPriorityConfigs(prev => ({
      ...prev,
      [config.selectedYear]: config,
    }));

    // Trigger recalculation by dispatching event
    if (selectedYearData && selectedYearData.year === config.selectedYear) {
      console.log('[CalculatorPage] Broadcasting priority update to FundGraph...');
      window.dispatchEvent(new CustomEvent('yearPrioritiesChanged', { 
        detail: { 
          year: config.selectedYear, 
          priorities: config.priorities,
          budgetAllocation: config.budgetAllocation,
        } 
      }));
    }
  };

  const handleYearPriorityUpdate = (config: YearPriorityConfig) => {
    console.log('[CalculatorPage] *** CRITICAL UPDATE *** Year priority updated via drag-drop:', {
      year: config.selectedYear,
      itemCount: config.priorities.length,
      totalCost: Math.round(config.priorities.reduce((sum, p) => sum + p.inflatedCost, 0)),
      itemIds: config.priorities.map(p => p.id),
    });

    // IMMEDIATELY update the centralized state
    setYearPriorityConfigs(prev => {
      const updated = {
        ...prev,
        [config.selectedYear]: { ...config },
      };
      console.log('[CalculatorPage] *** STATE UPDATED *** New configs:', {
        totalYears: Object.keys(updated).length,
        updatedYear: config.selectedYear,
        itemsInYear: config.priorities.length,
        allYears: Object.keys(updated).map(year => ({
          year,
          items: updated[parseInt(year)].priorities.length
        }))
      });
      return updated;
    });

    // Force immediate re-render by dispatching event
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('yearPriorityUpdated', { 
        detail: { 
          year: config.selectedYear,
          priorities: config.priorities,
          budgetAllocation: config.budgetAllocation,
        } 
      }));
    }, 0);
  };

  const currentYear = excelData?.data?.data?.config?.['Beginning Fiscal Year of the Report'] || new Date().getFullYear();

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
            effectiveMonthlyFee={
              feeOverride?.optimizeAll
                ? (selectedYearData?.optimalFee ?? feeOverride?.monthlyFeePerUnit)
                : feeOverride?.monthlyFeePerUnit
            }
            totalHousingUnits={totalHousingUnits}
            onHousingUnitsChange={handleHousingUnitsChange}
            yearPriorityConfigs={yearPriorityConfigs}
            onYearPriorityApply={handleYearPriorityApply}
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
          totalHousingUnits={totalHousingUnits}
          yearPriorityConfigs={yearPriorityConfigs}
          onYearPriorityUpdate={handleYearPriorityUpdate}
          currentYear={currentYear}
        />
      </div>
    </div>
  );
};

export default CalculatorPage;