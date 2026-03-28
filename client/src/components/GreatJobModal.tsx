import React, { useRef, useState, useEffect, useCallback } from 'react';
import './GreatJobModal.css';

interface GreatJobModalProps {
  isOpen: boolean;
  onSkip: () => void;
  onYesShowOptions: () => void;
  onMaybeLater: () => void;
  onDownloadReport: () => void;
}

/* ── Celebration SVG illustration (person with confetti) ── */
const CelebrationIllustration = () => (
  <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Confetti pieces */}
    <rect x="20" y="18" width="8" height="8" rx="1" fill="#FF4081" transform="rotate(-20 20 18)" />
    <rect x="130" y="12" width="7" height="7" rx="1" fill="#FFD600" transform="rotate(15 130 12)" />
    <rect x="45" y="8" width="6" height="6" rx="1" fill="#00BCD4" transform="rotate(30 45 8)" />
    <rect x="110" y="25" width="8" height="5" rx="1" fill="#4CAF50" transform="rotate(-10 110 25)" />
    <rect x="25" y="55" width="5" height="8" rx="1" fill="#FF9800" transform="rotate(25 25 55)" />
    <rect x="135" y="50" width="6" height="6" rx="1" fill="#E91E63" transform="rotate(-30 135 50)" />
    <rect x="60" y="5" width="5" height="5" rx="1" fill="#9C27B0" transform="rotate(45 60 5)" />
    <rect x="100" y="8" width="4" height="8" rx="1" fill="#2196F3" transform="rotate(-15 100 8)" />

    {/* Triangle confetti */}
    <polygon points="15,40 20,30 25,40" fill="#FFD600" transform="rotate(10 20 35)" />
    <polygon points="138,35 143,25 148,35" fill="#4CAF50" transform="rotate(-15 143 30)" />
    <polygon points="35,15 40,5 45,15" fill="#FF4081" transform="rotate(20 40 10)" />
    <polygon points="120,45 125,35 130,45" fill="#2196F3" transform="rotate(-20 125 40)" />

    {/* Squiggly lines / streamers */}
    <path d="M30 70 Q35 60, 40 70 Q45 80, 50 70" stroke="#FF4081" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M110 65 Q115 55, 120 65 Q125 75, 130 65" stroke="#FFD600" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M55 15 Q58 8, 62 15" stroke="#4CAF50" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M95 12 Q98 5, 102 12" stroke="#E91E63" strokeWidth="2" fill="none" strokeLinecap="round" />

    {/* Small dots */}
    <circle cx="42" cy="45" r="2.5" fill="#FFD600" />
    <circle cx="118" cy="55" r="2.5" fill="#9C27B0" />
    <circle cx="70" cy="10" r="2" fill="#FF9800" />
    <circle cx="90" cy="5" r="2" fill="#00BCD4" />
    <circle cx="22" cy="80" r="2" fill="#2196F3" />
    <circle cx="140" y="75" r="2" fill="#4CAF50" />

    {/* Person body */}
    {/* Head */}
    <circle cx="80" cy="55" r="16" fill="#FBE9E7" stroke="#5D4037" strokeWidth="2" />
    {/* Hair */}
    <path d="M64 50 Q65 35, 80 38 Q95 35, 96 50" fill="#5D4037" />
    <circle cx="72" cy="38" r="3" fill="#5D4037" />
    <circle cx="88" cy="38" r="3" fill="#5D4037" />
    {/* Eyes */}
    <circle cx="74" cy="55" r="2" fill="#333" />
    <circle cx="86" cy="55" r="2" fill="#333" />
    {/* Mouth (smile) */}
    <path d="M75 61 Q80 66, 85 61" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Blush */}
    <circle cx="70" cy="60" r="3" fill="#FFCDD2" opacity="0.6" />
    <circle cx="90" cy="60" r="3" fill="#FFCDD2" opacity="0.6" />

    {/* Body / torso */}
    <path d="M72 71 L68 100 H92 L88 71" fill="#64B5F6" stroke="#1E88E5" strokeWidth="1.5" />

    {/* Left arm raised */}
    <path d="M68 75 L42 50" stroke="#FBE9E7" strokeWidth="6" strokeLinecap="round" />
    <path d="M68 75 L42 50" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Left hand */}
    <circle cx="40" cy="48" r="5" fill="#FBE9E7" stroke="#5D4037" strokeWidth="1.5" />

    {/* Right arm raised */}
    <path d="M92 75 L118 50" stroke="#FBE9E7" strokeWidth="6" strokeLinecap="round" />
    <path d="M92 75 L118 50" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Right hand */}
    <circle cx="120" cy="48" r="5" fill="#FBE9E7" stroke="#5D4037" strokeWidth="1.5" />

    {/* Party elements in hands */}
    {/* Left hand - streamer */}
    <path d="M38 44 Q30 30, 25 35 Q20 40, 15 30" stroke="#FF4081" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Right hand - streamer */}
    <path d="M122 44 Q130 30, 135 35 Q140 40, 145 30" stroke="#FF9800" strokeWidth="2" fill="none" strokeLinecap="round" />

    {/* Legs */}
    <path d="M74 100 L70 125" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />
    <path d="M86 100 L90 125" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />
    {/* Shoes */}
    <ellipse cx="68" cy="127" rx="6" ry="3" fill="#5D4037" />
    <ellipse cx="92" cy="127" rx="6" ry="3" fill="#5D4037" />
  </svg>
);

/* ── Drag handle (6 dots grid) ── */
const DragHandle = () => (
  <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="2" cy="2" r="1.5" fill="#C0C0C0" />
    <circle cx="8" cy="2" r="1.5" fill="#C0C0C0" />
    <circle cx="2" cy="8" r="1.5" fill="#C0C0C0" />
    <circle cx="8" cy="8" r="1.5" fill="#C0C0C0" />
    <circle cx="2" cy="14" r="1.5" fill="#C0C0C0" />
    <circle cx="8" cy="14" r="1.5" fill="#C0C0C0" />
  </svg>
);

const GreatJobModal: React.FC<GreatJobModalProps> = ({
  isOpen,
  onSkip,
  onYesShowOptions,
  onMaybeLater,
  onDownloadReport
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // Center on open
  useEffect(() => {
    if (isOpen) setPosition(null);
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
    <div className="great-job-overlay">
      <div className="great-job-modal" ref={modalRef} style={modalStyle}>
        {/* Header: drag handle + skip */}
        <div className="gjm-header" onMouseDown={handleDragStart}>
          <div className="gjm-drag-handle">
            <DragHandle />
          </div>
          <button className="gjm-skip-btn" onClick={(e) => { e.stopPropagation(); onSkip(); }}>
            Skip
          </button>
        </div>

        {/* Celebration Illustration */}
        <div className="gjm-illustration">
          <CelebrationIllustration />
        </div>

        {/* Content */}
        <div className="gjm-content">
          <h2 className="gjm-title">Great job</h2>
          <p className="gjm-subtitle">your reserve goal has been achieved.</p>

          <p className="gjm-message">
            It looks like you may have extra funds
            that could be invested. Would you like to
            review investment opportunities?
          </p>

          {/* Action Buttons */}
          <div className="gjm-buttons">
            <button className="gjm-btn-primary" onClick={onYesShowOptions}>
              Yes, Show Options
            </button>
            <button className="gjm-btn-secondary" onClick={onMaybeLater}>
              Maybe Later
            </button>
            <button className="gjm-btn-download" onClick={onDownloadReport}>
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreatJobModal;
