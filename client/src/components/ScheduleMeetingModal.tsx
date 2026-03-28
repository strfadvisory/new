import React, { useRef, useState, useEffect, useCallback } from 'react';
import './ScheduleMeetingModal.css';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onSkip: () => void;
  onBookCalendar: () => void;
  onBackToOption: () => void;
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

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onSkip,
  onBookCalendar,
  onBackToOption,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      console.log('[ScheduleMeetingModal] Modal opened');
      setPosition(null);
    }
  }, [isOpen]);

  useEffect(() => {
    console.log('[ScheduleMeetingModal] isOpen state:', isOpen);
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
    <div className="smm-overlay">
      <div className="smm-modal" ref={modalRef} style={modalStyle}>
        {/* Header: drag handle + skip */}
        <div className="smm-header" onMouseDown={handleDragStart}>
          <div className="smm-drag-handle">
            <DragHandle />
          </div>
          <button className="smm-skip-btn" onClick={(e) => { e.stopPropagation(); onSkip(); }}>
            Skip
          </button>
        </div>

        {/* Expert Photo */}
        <div className="smm-photo-wrapper">
          <img
            className="smm-photo"
            src="/expert-photo.png"
            alt="Expert"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="smm-photo-accent" />
        </div>

        {/* Content */}
        <div className="smm-content">
          <h2 className="smm-title">Schedule meeting with expert</h2>

          <p className="smm-message">
            Mr. Orloff supported an idea I proposed to allow associations to invest reserves with proper planning, financial advisors, and strict oversight.
          </p>

          {/* Action Buttons */}
          <div className="smm-buttons">
            <button className="smm-btn-primary" onClick={() => {
              console.log('[ScheduleMeetingModal] Book a Calendar clicked');
              onBookCalendar();
            }}>
              Book a Callender
            </button>
            <button className="smm-btn-outline" onClick={() => {
              console.log('[ScheduleMeetingModal] Back To Option clicked');
              onBackToOption();
            }}>
              Back To Option
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;
