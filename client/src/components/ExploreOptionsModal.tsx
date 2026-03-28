import React, { useRef, useState, useEffect, useCallback } from 'react';
import './ExploreOptionsModal.css';

interface ExploreOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onAdjustMonthlyFee: () => void;
  onSpecialAssessments: () => void;
  onTakeLoans: () => void;
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
  onTakeLoans
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPosition(null);
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

  if (!isOpen) return null;

  const modalStyle: React.CSSProperties = position
    ? { position: 'fixed', left: position.x, top: position.y, transform: 'none' }
    : {};

  return (
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
            <button className="eom-btn-outline" onClick={onSpecialAssessments}>
              Special Assessments
            </button>
            <button className="eom-btn-outline" onClick={onTakeLoans}>
              Take Loans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreOptionsModal;
