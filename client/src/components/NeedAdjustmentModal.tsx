import React, { useRef, useState, useEffect, useCallback } from 'react';
import './NeedAdjustmentModal.css';
import ScheduleMeetingModal from './ScheduleMeetingModal';
import AdjustManuallyModal from './AdjustManuallyModal';

interface NeedAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onHelpMeChoose: () => void;
  onAdjustManually: () => void;
}

/* ── Drag handle (6 dots grid) ── */
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

/* ── Piggy Bank illustration (from Figma export) ── */
const PiggyBankIllustration = () => (
  <img src="/piggy-bank.svg" alt="Piggy bank" width="85" height="85" />
);

const NeedAdjustmentModal: React.FC<NeedAdjustmentModalProps> = ({
  isOpen,
  onSkip,
  onHelpMeChoose,
  onAdjustManually
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
  const [showAdjustManually, setShowAdjustManually] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log('[NeedAdjustmentModal] Modal opened, resetting state');
      setPosition(null);
      setShowScheduleMeeting(false);
      setShowAdjustManually(false);
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('[NeedAdjustmentModal] State changed:', { isOpen, showScheduleMeeting, showAdjustManually });
  }, [isOpen, showScheduleMeeting, showAdjustManually]);

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
      {isOpen && !showScheduleMeeting && !showAdjustManually && (
        <div className="nam-overlay">
          <div className="nam-modal" ref={modalRef} style={modalStyle}>
            {/* Header: drag handle + skip */}
            <div className="nam-header" onMouseDown={handleDragStart}>
              <div className="nam-drag-handle">
                <DragHandle />
              </div>
              <button className="nam-skip-btn" onClick={(e) => { e.stopPropagation(); onSkip(); }}>
                Skip
              </button>
            </div>

            {/* Piggy Bank Illustration */}
            <div className="nam-illustration">
              <PiggyBankIllustration />
            </div>

            {/* Content */}
            <div className="nam-content">
              <h2 className="nam-title">Reserve Model Not Fully Funded</h2>

              <p className="nam-message">
                Your current reserve funding model is not fully funded, which means there may be a future funding shortfall.
              </p>

              <p className="nam-question">How would you like to proceed?</p>

              {/* Action Buttons */}
              <div className="nam-buttons">
                <button className="nam-btn-primary" onClick={() => {
                  console.log('[NeedAdjustmentModal] Help me Choose clicked - opening ScheduleMeetingModal');
                  setShowScheduleMeeting(true);
                  onHelpMeChoose();
                }}>
                  Help me Choose
                </button>
                <button className="nam-btn-outline" onClick={() => {
                  console.log('[NeedAdjustmentModal] Adjust manually clicked');
                  setShowAdjustManually(true);
                }}>
                  Adjust the plan manually
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ScheduleMeetingModal
        isOpen={showScheduleMeeting}
        onSkip={() => {
          setShowScheduleMeeting(false);
          onSkip();
        }}
        onBookCalendar={() => {
          console.log('[NeedAdjustmentModal] Book calendar clicked');
          setShowScheduleMeeting(false);
          onSkip();
        }}
        onBackToOption={() => {
          setShowScheduleMeeting(false);
        }}
      />

      <AdjustManuallyModal
        isOpen={showAdjustManually}
        onClose={() => setShowAdjustManually(false)}
        onSkip={() => {
          setShowAdjustManually(false);
          onSkip();
        }}
        onAllocatePriorities={() => {
          console.log('[NeedAdjustmentModal] Allocate Priorities clicked - triggering first year popup');
          setShowAdjustManually(false);
          onSkip();
          // Trigger event to open priority popup for first year
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('openFirstYearPriority'));
          }, 100);
        }}
        onExploreOptions={() => {
          console.log('[NeedAdjustmentModal] Explore Options clicked');
          setShowAdjustManually(false);
          onSkip();
        }}
      />
    </>
  );
};

export default NeedAdjustmentModal;
