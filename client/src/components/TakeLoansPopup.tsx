import React, { useState, useRef, useCallback, useEffect } from 'react';
import './TakeLoansPopup.css';

interface TakeLoansPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (loans: Record<number, { year: number; percentage: number; amount: number; bank: string; terms: string; interestRate: number }>) => void;
  initialPosition?: { x: number; y: number };
  cashflowData?: any[];
}

const TakeLoansPopup: React.FC<TakeLoansPopupProps> = ({
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
  const [selectedBank, setSelectedBank] = useState<Record<number, string>>({});
  const [selectedTerms, setSelectedTerms] = useState<Record<number, string>>({});
  const [interestRates, setInterestRates] = useState<Record<number, number>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [history, setHistory] = useState<any[]>([{ allocations: {}, banks: {}, terms: {}, rates: {} }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const banks = ['Wells Fargo', 'Bank of America', 'Chase Bank', 'Citibank', 'US Bank'];
  const terms = ['1 Year', '2 Years', '3 Years', '5 Years', '10 Years'];

  useEffect(() => {
    if (isOpen && !initialized) {
      setPosition(initialPosition ?? { x: window.innerWidth / 2 - 142, y: window.innerHeight / 2 - 306 });
      setInitialized(true);
    }
    if (!isOpen) {
      setInitialized(false);
      setSelectedYearIndex(null);
      setHasChanges(false);
      setHistory([{ allocations: {}, banks: {}, terms: {}, rates: {} }]);
      setHistoryIndex(0);
    }
  }, [isOpen, initialPosition, initialized]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.tagName === 'SELECT' || target.closest('button') || target.closest('select')) return;
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

  const saveToHistory = (newAllocations: any, newBanks: any, newTerms: any, newRates: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ allocations: newAllocations, banks: newBanks, terms: newTerms, rates: newRates });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setHasChanges(true);
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    if (selectedYearIndex !== null) {
      const newAllocations = { ...allocations, [selectedYearIndex]: value };
      setAllocations(newAllocations);
      saveToHistory(newAllocations, selectedBank, selectedTerms, interestRates);
    }
  };

  const handleBankChange = (index: number, bank: string) => {
    const newBanks = { ...selectedBank, [index]: bank };
    setSelectedBank(newBanks);
    saveToHistory(allocations, newBanks, selectedTerms, interestRates);
  };

  const handleTermsChange = (index: number, term: string) => {
    const newTerms = { ...selectedTerms, [index]: term };
    setSelectedTerms(newTerms);
    
    // Calculate interest rate based on term
    const years = parseInt(term);
    let rate = 5.5;
    if (years === 1) rate = 4.5;
    else if (years === 2) rate = 5.0;
    else if (years === 3) rate = 5.5;
    else if (years === 5) rate = 6.0;
    else if (years === 10) rate = 6.5;
    
    const newRates = { ...interestRates, [index]: rate };
    setInterestRates(newRates);
    saveToHistory(allocations, selectedBank, newTerms, newRates);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setAllocations(state.allocations);
      setSelectedBank(state.banks);
      setSelectedTerms(state.terms);
      setInterestRates(state.rates);
      setHasChanges(newIndex > 0);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setAllocations(state.allocations);
      setSelectedBank(state.banks);
      setSelectedTerms(state.terms);
      setInterestRates(state.rates);
      setHasChanges(true);
    }
  };

  const calculateAllocation = (deficitAmount: number, percentage: number) => {
    return Math.abs(deficitAmount) * (percentage / 100);
  };

  const handleConfirm = () => {
    const loanData: Record<number, { year: number; percentage: number; amount: number; bank: string; terms: string; interestRate: number }> = {};
    
    deficitYears.forEach((yearData, index) => {
      const percentage = allocations[index] || 0;
      if (percentage > 0) {
        const deficitAmount = yearData.projection.closingBalance;
        const amount = calculateAllocation(deficitAmount, percentage);
        loanData[yearData.year] = {
          year: yearData.year,
          percentage,
          amount,
          bank: selectedBank[index] || '',
          terms: selectedTerms[index] || '',
          interestRate: interestRates[index] || 0
        };
      }
    });
    
    console.log('[TakeLoansPopup] Confirm clicked with loans:', loanData);
    onConfirm(loanData);
  };

  const dynamicHeight = 115 + (deficitYears.length * 43) + (selectedYearIndex !== null ? 200 : 0);
  const maxHeight = window.innerHeight - 40;
  const finalHeight = Math.min(dynamicHeight, maxHeight);
  const needsScroll = dynamicHeight > maxHeight;

  return (
    <div
      ref={popupRef}
      onMouseDown={onMouseDown}
      className="tl-popup-container"
      style={{
        left: position.x,
        top: position.y,
        height: `${finalHeight}px`,
        maxHeight: `${maxHeight}px`,
      }}
    >
      {/* Background layers */}
      <div className="tl-background" style={{ height: `${finalHeight}px` }} />
      <div className="tl-header-border" />
      <div className="tl-progress-bar-bg"> Loans</div>
      <div className="tl-progress-bar-fill" />
      
      {/* Header */}
      <header className="tl-header">
        <div className="tl-header-left">
          <button 
            className="tl-undo-btn" 
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
            className="tl-redo-btn" 
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
 
        <button className="tl-confirm-btn" onClick={handleConfirm} disabled={!hasChanges}>
          Confirm
        </button>
      </header>

      {/* Column Headers */}
      <div className="tl-table-header">
        <span className="tl-header-year">Year</span>
        <span className="tl-header-required">Required</span>
        <span className="tl-header-loan">Assign Loan</span>
      </div>

      {/* Content Area */}
      <div className="tl-content" style={{ 
        overflowY: needsScroll ? 'auto' : 'visible',
        maxHeight: needsScroll ? `${finalHeight - 116}px` : 'none'
      }}>
        {deficitYears.length === 0 ? (
          <div className="tl-empty-state">
            No deficit years found
          </div>
        ) : (
          <div className="tl-deficit-list">
            {deficitYears.map((yearData, index) => {
              const deficitAmount = yearData.projection.closingBalance;
              const isSliderOpen = selectedYearIndex === index;
              const allocationPct = allocations[index] || 0;
              const allocatedAmount = calculateAllocation(deficitAmount, allocationPct);

              return (
                <div key={yearData.year} className="tl-deficit-item">
                  {/* Year Row */}
                  <div className="tl-year-row">
                    <span className="tl-year-value">{yearData.year}</span>
                    <span className="tl-deficit-amount">
                      -${Math.abs(deficitAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    {allocationPct > 0 ? (
                      <button 
                        className="tl-allocation-badge"
                        onClick={() => handleAllocateClick(index)}
                      >
                        {allocationPct}%
                      </button>
                    ) : (
                      <button 
                        className="tl-allocate-btn"
                        onClick={() => handleAllocateClick(index)}
                      >
                        Allocate
                      </button>
                    )}
                  </div>

                  {/* Slider Panel */}
                  {isSliderOpen && (
                    <div className="tl-slider-panel">
                      <div className="tl-allocation-header">
                        <span className="tl-allocation-label">Select Allocation</span>
                        <span className="tl-allocation-value">
                          -${allocatedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      
                      <div className="tl-slider-container">
                        <div className="tl-slider-track" />
                        <div 
                          className="tl-slider-fill" 
                          style={{ width: `${sliderValue}%` }} 
                        />
                        <div 
                          className="tl-slider-thumb" 
                          style={{ left: `${sliderValue}%` }} 
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sliderValue}
                          onChange={(e) => handleSliderChange(Number(e.target.value))}
                          className="tl-slider-input"
                          aria-label={`Allocate percentage for year ${yearData.year}`}
                        />
                      </div>

                      <div className="tl-loan-details">
                        <label className="tl-detail-label">Choose Bank</label>
                        <select 
                          className="tl-select"
                          value={selectedBank[index] || ''}
                          onChange={(e) => handleBankChange(index, e.target.value)}
                        >
                          <option value="">Select Bank</option>
                          {banks.map(bank => (
                            <option key={bank} value={bank}>{bank}</option>
                          ))}
                        </select>

                        <label className="tl-detail-label">Select Terms</label>
                        <select 
                          className="tl-select"
                          value={selectedTerms[index] || ''}
                          onChange={(e) => handleTermsChange(index, e.target.value)}
                        >
                          <option value="">Select Terms</option>
                          {terms.map(term => (
                            <option key={term} value={term}>{term}</option>
                          ))}
                        </select>

                        <div className="tl-interest-rate">
                          <span className="tl-rate-label">Rate of Interest</span>
                          <span className="tl-rate-value">
                            {interestRates[index] ? `${interestRates[index].toFixed(1)}%` : '0%'}
                          </span>
                        </div>
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

export default TakeLoansPopup;
