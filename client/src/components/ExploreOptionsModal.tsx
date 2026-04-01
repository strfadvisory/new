import React, { useRef, useState, useEffect, useCallback } from 'react';
import './ExploreOptionsModal.css';

interface ExploreOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onAdjustMonthlyFee: () => void;
  onSpecialAssessments: () => void;
  onTakeLoans: () => void;
  cashflowData?: any[];
  inLeftPanel?: boolean;
}

const DragHandle = () => (
  <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="2" cy="2" r="1.5" fill="#C0C0C0" />
    <circle cx="8" cy="2" r="1.5" fill="#C0C0C0" />
    <circle cx="2" cy="7.5" r="1.5" fill="#C0C0C0" />
    <circle cx="8" cy="7.5" r="1.5" fill="#C0C0C0" />
    <circle cx="2" cy="13" r="1.5" fill="#C0C0C0" />
    <circle cx="8" cy="13" r="1.5" fill="#C0C0C0" />
  </svg>
);

const ExploreOptionsModal: React.FC<ExploreOptionsModalProps> = ({
  isOpen,
  onSkip,
  onAdjustMonthlyFee,
  onSpecialAssessments,
  onTakeLoans,
  cashflowData = [],
  inLeftPanel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);



  useEffect(() => {
    if (isOpen) {
      // Position at top-left (after year area)
      setPosition({ x: 350, y: 20 });
    }
  }, [isOpen]);

  const handleDragStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragging.current = true;
    const rect = modalRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (!position) {
        setPosition({ x: rect.left, y: rect.top });
      }
    }
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

  if (inLeftPanel) {
    if (!isOpen) return null;
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '8px 13px', borderBottom: '1px solid #e7e7e7' }}>
          <button className="eom-skip-btn" onClick={(e) => { e.stopPropagation(); onSkip(); }}>Skip</button>
        </div>
        <div className="eom-progress-bar" />
        <div className="eom-image-container">
          <img src="/expert-photo.png" alt="Strategy options" className="eom-screenshot" />
        </div>
        <div className="eom-content">
          <h2 className="eom-title">Great! Based on your selections, here are the recommended actions:</h2>
          <p className="eom-section-title">Your Strategy Options</p>
          <div className="eom-buttons">
            <button className="eom-btn-outline" onClick={onAdjustMonthlyFee}>Adjust Monthly Fee</button>
            <button className="eom-btn-outline" onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('openSpecialAssessmentsPopup', { detail: { cashflowData } })); }}>Special Assessments</button>
            <button className="eom-btn-outline" onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('openTakeLoansPopup', { detail: { cashflowData } })); }}>Take Loans</button>
          </div>
        </div>
      </div>
    );
  }

  const modalStyle: React.CSSProperties = position
    ? { position: 'fixed', left: position.x, top: position.y, transform: 'none' }
    : {};

  return (
    <>
      {isOpen && (
      <div className="eom-overlay" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div className="eom-modal" ref={modalRef} style={modalStyle}>
        <div className="eom-header" onMouseDown={handleDragStart}>
          <div className="eom-drag-handle"><DragHandle /></div>
          <button className="eom-skip-btn" onClick={(e) => { e.stopPropagation(); onSkip(); }}>
            Skip
          </button>
        </div>

        <div className="eom-progress-bar" />

        <div className="eom-image-container">
          <img src="/expert-photo.png" alt="Strategy options" className="eom-screenshot" />
        </div>

        <div className="eom-content">
          <h2 className="eom-title">Great! Based on your selections, here are the recommended actions:</h2>

          <p className="eom-section-title">Your Strategy Options</p>

          <div className="eom-buttons">
            <button className="eom-btn-outline" onClick={onAdjustMonthlyFee}>
              Adjust Monthly Fee
            </button>
            <button className="eom-btn-outline" onClick={(e) => {
              e.stopPropagation();
              console.log('[ExploreOptionsModal] Special Assessments clicked');
              window.dispatchEvent(new CustomEvent('openSpecialAssessmentsPopup', {
                detail: { cashflowData }
              }));
            }}>
              Special Assessments
            </button>
            <button className="eom-btn-outline" onClick={(e) => {
              e.stopPropagation();
              console.log('[ExploreOptionsModal] Take Loans clicked');
              window.dispatchEvent(new CustomEvent('openTakeLoansPopup', {
                detail: { cashflowData }
              }));
            }}>
              Take Loans
            </button>
          </div>
        </div>
      </div>
      </div>
      )}
    </>
  );
};

export default ExploreOptionsModal;
