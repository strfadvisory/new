import React, { useRef, useState, useEffect, useCallback } from 'react';
import './ExploreOptionsModal.css';
import SpecialAssessmentsPopup from './SpecialAssessmentsPopup';
import TakeLoansPopup from './TakeLoansPopup';

interface ExploreOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onAdjustMonthlyFee: () => void;
  onSpecialAssessments: () => void;
  onTakeLoans: () => void;
  cashflowData?: any[];
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
  cashflowData = []
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [showSpecialAssessments, setShowSpecialAssessments] = useState(false);
  const [showTakeLoans, setShowTakeLoans] = useState(false);

  useEffect(() => {
    console.log('[ExploreOptionsModal] showSpecialAssessments changed to:', showSpecialAssessments);
  }, [showSpecialAssessments]);

  useEffect(() => {
    if (isOpen) {
      setPosition(null);
    }
    // Don't reset showSpecialAssessments when parent isOpen changes
    // Only reset when explicitly closed
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

  const modalStyle: React.CSSProperties = position
    ? { position: 'fixed', left: position.x, top: position.y, transform: 'none' }
    : {};

  return (
    <>
      {isOpen && !showSpecialAssessments && !showTakeLoans && (
      <div className="eom-overlay">
        <div className="eom-modal" ref={modalRef} style={modalStyle}>
        <div className="eom-header" onMouseDown={handleDragStart}>
          <div className="eom-drag-handle">
            <DragHandle />
          </div>
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
              setShowSpecialAssessments(true);
            }}>
              Special Assessments
            </button>
            <button className="eom-btn-outline" onClick={(e) => {
              e.stopPropagation();
              console.log('[ExploreOptionsModal] Take Loans clicked');
              setShowTakeLoans(true);
            }}>
              Take Loans
            </button>
          </div>
        </div>
      </div>
      </div>
      )}

      {showSpecialAssessments && (
        <SpecialAssessmentsPopup
          isOpen={showSpecialAssessments}
          onClose={() => setShowSpecialAssessments(false)}
          onConfirm={(allocations) => {
            console.log('[ExploreOptionsModal] Special Assessments confirmed:', allocations);
            setShowSpecialAssessments(false);
            onSkip(); // Close the entire modal chain
            // Dispatch event to update graph with allocations
            window.dispatchEvent(new CustomEvent('specialAssessmentsApplied', {
              detail: { allocations }
            }));
          }}
          cashflowData={cashflowData}
        />
      )}
      {showTakeLoans && (
        <TakeLoansPopup
          isOpen={showTakeLoans}
          onClose={() => setShowTakeLoans(false)}
          onConfirm={(loans) => {
            console.log('[ExploreOptionsModal] Loans confirmed:', loans);
            setShowTakeLoans(false);
            onSkip();
            window.dispatchEvent(new CustomEvent('loansApplied', {
              detail: { loans }
            }));
          }}
          cashflowData={cashflowData}
        />
      )}
    </>
  );
};

export default ExploreOptionsModal;
