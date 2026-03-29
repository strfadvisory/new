import React, { useState, useRef, useCallback, useEffect } from 'react';
import './SpecialAssessmentsPopup.css';

interface SpecialAssessmentsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (allocations: Record<number, { year: number; percentage: number; amount: number }>) => void;
  initialPosition?: { x: number; y: number };
  cashflowData?: any[];
}

const SpecialAssessmentsPopup: React.FC<SpecialAssessmentsPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialPosition,
  cashflowData = [],
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  const deficitYears = cashflowData.filter(d => !d.pos && d.projection);
  const [selectedYearIndex, setSelectedYearIndex] = useState<number | null>(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [allocations, setAllocations] = useState<Record<number, number>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [history, setHistory] = useState<Record<number, number>[]>([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    if (isOpen && !initialized) {
      setPosition(initialPosition ?? { x: window.innerWidth / 2 - 142, y: window.innerHeight / 2 - 306 });
      setInitialized(true);
    }
    if (!isOpen) {
      setInitialized(false);
      setSelectedYearIndex(null);
      setHasChanges(false);
      setHistory([{}]);
      setHistoryIndex(0);
    }
  }, [isOpen, initialPosition, initialized]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('button')) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  if (!isOpen) return null;

  const handleAllocateClick = (index: number) => {
    setSelectedYearIndex(selectedYearIndex === index ? null : index);
    setSliderValue(allocations[index] || 0);
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    if (selectedYearIndex !== null) {
      const newAllocations = { ...allocations, [selectedYearIndex]: value };
      setAllocations(newAllocations);
      setHasChanges(true);
      
      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newAllocations);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAllocations(history[newIndex]);
      setHasChanges(newIndex > 0);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAllocations(history[newIndex]);
      setHasChanges(true);
    }
  };

  const calculateAllocation = (deficitAmount: number, percentage: number) => {
    return Math.abs(deficitAmount) * (percentage / 100);
  };

  const handleConfirm = () => {
    const allocationData: Record<number, { year: number; percentage: number; amount: number }> = {};
    
    deficitYears.forEach((yearData, index) => {
      const percentage = allocations[index] || 0;
      if (percentage > 0) {
        const deficitAmount = yearData.projection.closingBalance;
        const amount = calculateAllocation(deficitAmount, percentage);
        allocationData[yearData.year] = {
          year: yearData.year,
          percentage,
          amount
        };
      }
    });
    
    console.log('[SpecialAssessmentsPopup] Confirm clicked with allocations:', allocationData);
    onConfirm(allocationData);
  };

  const dynamicHeight = 115 + (deficitYears.length * 43) + (selectedYearIndex !== null ? 85 : 0);
  const maxHeight = window.innerHeight - 40;
  const finalHeight = Math.min(dynamicHeight, maxHeight);
  const needsScroll = dynamicHeight > maxHeight;

  return (
    <div
      ref={popupRef}
      onMouseDown={onMouseDown}
      className="sp-popup-container"
      style={{
        left: position.x,
        top: position.y,
        height: `${finalHeight}px`,
        maxHeight: `${maxHeight}px`,
      }}
    >
      {/* Background layers */}
      <div className="sp-background" style={{ height: `${finalHeight}px` }} />
      <div className="sp-header-border" />
      <div className="sp-progress-bar-bg" >Special Assessments</div>
      <div className="sp-progress-bar-fill" />
      
      {/* Header */}
      <header className="sp-header">
        <div className="sp-header-left">
          <button 
            className="sp-undo-btn" 
            onClick={handleUndo} 
            disabled={historyIndex === 0}
            aria-label="Undo"
            title="Undo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6"/>
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
            </svg>
          </button>
          <button 
            className="sp-redo-btn" 
            onClick={handleRedo} 
            disabled={historyIndex === history.length - 1}
            aria-label="Redo"
            title="Redo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6"/>
              <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
            </svg>
          </button>
        </div>
         
        <button className="sp-confirm-btn" onClick={handleConfirm} disabled={!hasChanges}>
          Confirm
        </button>
      </header>

      {/* Column Headers */}
      <div className="sp-table-header">
        <span className="sp-header-year">Year</span>
        <span className="sp-header-required">Required</span>
        <span className="sp-header-assessments">Assessments</span>
      </div>

      {/* Content Area */}
      <div className="sp-content" style={{ 
        overflowY: needsScroll ? 'auto' : 'visible',
        maxHeight: needsScroll ? `${finalHeight - 116}px` : 'none'
      }}>
        {deficitYears.length === 0 ? (
          <div className="sp-empty-state">
            No deficit years found
          </div>
        ) : (
          <div className="sp-deficit-list">
            {deficitYears.map((yearData, index) => {
              const deficitAmount = yearData.projection.closingBalance;
              const isSliderOpen = selectedYearIndex === index;
              const allocationPct = allocations[index] || 0;
              const allocatedAmount = calculateAllocation(deficitAmount, allocationPct);

              return (
                <div key={yearData.year} className="sp-deficit-item">
                  {/* Year Row */}
                  <div className="sp-year-row">
                    <span className="sp-year-value">{yearData.year}</span>
                    <span className="sp-deficit-amount">
                      -${Math.abs(deficitAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    {allocationPct > 0 ? (
                      <button 
                        className="sp-allocation-badge"
                        onClick={() => handleAllocateClick(index)}
                      >
                        {allocationPct}%
                      </button>
                    ) : (
                      <button 
                        className="sp-allocate-btn"
                        onClick={() => handleAllocateClick(index)}
                      >
                        Allocate
                      </button>
                    )}
                  </div>

                  {/* Slider Panel */}
                  {isSliderOpen && (
                    <div className="sp-slider-panel">
                      <div className="sp-allocation-header">
                        <span className="sp-allocation-label">Select Allocation</span>
                        <span className="sp-allocation-value">
                          -${allocatedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      
                      <div className="sp-slider-container">
                        <div className="sp-slider-track" />
                        <div 
                          className="sp-slider-fill" 
                          style={{ width: `${sliderValue}%` }} 
                        />
                        <div 
                          className="sp-slider-thumb" 
                          style={{ left: `${sliderValue}%` }} 
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sliderValue}
                          onChange={(e) => handleSliderChange(Number(e.target.value))}
                          className="sp-slider-input"
                          aria-label={`Allocate percentage for year ${yearData.year}`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialAssessmentsPopup;
