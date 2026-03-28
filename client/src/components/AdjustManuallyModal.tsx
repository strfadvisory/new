import React, { useRef, useState, useEffect, useCallback } from 'react';
import './AdjustManuallyModal.css';
import ExploreOptionsModal from './ExploreOptionsModal';

interface AdjustManuallyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onAllocatePriorities: () => void;
  onExploreOptions: () => void;
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

const AdjustManuallyModal: React.FC<AdjustManuallyModalProps> = ({
  isOpen,
  onSkip,
  onAllocatePriorities,
  onExploreOptions
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [showExploreOptions, setShowExploreOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPosition(null);
      setShowExploreOptions(false);
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
    <>
      {isOpen && !showExploreOptions && (
        <div className="amm-overlay">
          <div className="amm-modal" ref={modalRef} style={modalStyle}>
            <div className="amm-header" onMouseDown={handleDragStart}>
              <div className="amm-drag-handle">
                <DragHandle />
              </div>
              <button className="amm-skip-btn" onClick={(e) => { e.stopPropagation(); onSkip(); }}>
                Skip
              </button>
            </div>

            <div className="amm-progress-bar" />

            <div className="amm-image-container">
              <img src="/expert-photo.png" alt="Solution illustration" className="amm-screenshot" />
            </div>

            <div className="amm-content">
              <h2 className="amm-title">First Solutions is<br />Shift your priorities</h2>

              <p className="amm-message">
                A shortfall can often be resolved by adjusting reserve plan items.<br />
                Check if costs are accurate and whether any items can be moved to a later date.
              </p>

              <div className="amm-buttons">
                <button className="amm-btn-primary" onClick={onAllocatePriorities}>
                  Allocate Priorities
                </button>
                <button className="amm-btn-outline" onClick={() => {
                  console.log('[AdjustManuallyModal] Explore Options clicked');
                  setShowExploreOptions(true);
                }}>
                  Explore Other Options
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ExploreOptionsModal
        isOpen={showExploreOptions}
        onClose={() => setShowExploreOptions(false)}
        onSkip={() => {
          setShowExploreOptions(false);
          onSkip();
        }}
        onAdjustMonthlyFee={() => {
          console.log('[AdjustManuallyModal] Adjust Monthly Fee clicked');
          setShowExploreOptions(false);
          onSkip();
        }}
        onSpecialAssessments={() => {
          console.log('[AdjustManuallyModal] Special Assessments clicked');
          setShowExploreOptions(false);
          onSkip();
        }}
        onTakeLoans={() => {
          console.log('[AdjustManuallyModal] Take Loans clicked');
          setShowExploreOptions(false);
          onSkip();
        }}
      />
    </>
  );
};

export default AdjustManuallyModal;
