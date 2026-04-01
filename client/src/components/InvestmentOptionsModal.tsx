import React, { useRef, useState, useEffect, useCallback } from 'react';
import './InvestmentOptionsModal.css';
import InvestmentAllocationModal from './InvestmentAllocationModal';
import VideoPlayer from './VideoPlayer';

interface InvestmentOptionsModalProps {
  isOpen: boolean;
  onSkip: () => void;
  onStart: () => void;
  inLeftPanel?: boolean;
}

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

/* ── Professional photo placeholder ── */
const FeaturedImage = () => (
  <svg width="284" height="188" viewBox="0 0 284 188" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="photoGrad" x1="0" y1="0" x2="0" y2="188" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#c9bfb5"/>
        <stop offset="100%" stopColor="#b8aea4"/>
      </linearGradient>
    </defs>
    <rect width="284" height="188" fill="url(#photoGrad)"/>
    {/* Suit / body */}
    <ellipse cx="142" cy="230" rx="72" ry="60" fill="#5a5a5a"/>
    {/* Shirt / collar */}
    <path d="M122 165 L142 178 L162 165 L158 155 L142 168 L126 155Z" fill="#fff"/>
    {/* Jacket lapels */}
    <path d="M100 188 L122 165 L142 178 L158 155 L182 188" fill="#3d3d3d"/>
    {/* Neck */}
    <rect x="133" y="148" width="18" height="18" rx="4" fill="#d4a98a"/>
    {/* Head */}
    <ellipse cx="142" cy="120" rx="36" ry="42" fill="#d4a98a"/>
    {/* Hair */}
    <path d="M106 112 Q107 74 142 72 Q177 74 178 112 Q165 98 142 100 Q119 98 106 112Z" fill="#5c3d1e"/>
    {/* Glasses frame */}
    <rect x="119" y="116" width="18" height="12" rx="5" fill="none" stroke="#2a1a0a" strokeWidth="2.5"/>
    <rect x="147" y="116" width="18" height="12" rx="5" fill="none" stroke="#2a1a0a" strokeWidth="2.5"/>
    <line x1="137" y1="122" x2="147" y2="122" stroke="#2a1a0a" strokeWidth="2"/>
    {/* Eyes */}
    <circle cx="128" cy="122" r="3.5" fill="#2a1a0a"/>
    <circle cx="156" cy="122" r="3.5" fill="#2a1a0a"/>
    {/* Smile */}
    <path d="M131 136 Q142 143 153 136" stroke="#5c3d1e" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

const InvestmentOptionsModal: React.FC<InvestmentOptionsModalProps> = ({
  isOpen,
  onSkip,
  onStart,
  inLeftPanel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [showAllocation, setShowAllocation] = useState(false);

  // Center on open
  useEffect(() => {
    if (isOpen) {
      setPosition(null);
      setShowAllocation(false);
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
    if (!isOpen && !showAllocation) return null;
    return (
      <>
        <InvestmentAllocationModal isOpen={showAllocation} inLeftPanel={true} onClose={() => { setShowAllocation(false); onStart(); }} />
        {isOpen && !showAllocation && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '12px 14px 10px', borderBottom: '1px solid #e7e7e7' }}>
              <button className="iom-skip-btn" onClick={(e) => { e.stopPropagation(); onSkip(); }}>Skip</button>
            </div>
            <div className="iom-image">
              <VideoPlayer 
                videoSrc="/user.mp4" 
                fallbackImage="/expert-photo.png"
                showSkipButton={true}
                className="iom-featured-image"
              />
            </div>
            <div className="iom-accent-bar"></div>
            <div className="iom-content">
              <h2 className="iom-title">Smart Investment Options<br/>for Stable Returns</h2>
              <p className="iom-description">The three best investment options include CDs (Certificates of Deposit), Treasury Bills, and Treasury Notes. You can also allocate funds through an LTM allocation budget, which automatically distributes investments across all available yearly funds for better financial planning and consistent growth.</p>
              <div className="iom-button-container">
                <button className="iom-btn-start" onClick={() => setShowAllocation(true)}>Start</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (!isOpen && !showAllocation) return null;

  const modalStyle: React.CSSProperties = position
    ? { position: 'fixed', left: `${position.x}px`, top: `${position.y}px`, transform: 'none' }
    : { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };

  return (
    <>
      <InvestmentAllocationModal
        isOpen={showAllocation}
        onClose={() => { setShowAllocation(false); onStart(); }}
        inLeftPanel={inLeftPanel}
      />
      {isOpen && !showAllocation && (
        <>
          <div className="investment-options-overlay" />
          <div className="investment-options-modal" ref={modalRef} style={modalStyle}>
            {/* Header: drag handle + skip */}
            <div className="iom-header" onMouseDown={handleDragStart}>
              <div className="iom-drag-handle">
                <DragHandle />
              </div>
              <button className="iom-skip-btn" onClick={(e) => { e.stopPropagation(); onSkip(); }}>
                Skip
              </button>
            </div>

            {/* Featured Image */}
            <div className="iom-image">
              <VideoPlayer 
                videoSrc="/user.mp4" 
                fallbackImage="/expert-photo.png"
                showSkipButton={true}
                className="iom-featured-image"
              />
            </div>

            {/* Green accent bar */}
            <div className="iom-accent-bar"></div>

            {/* Content */}
            <div className="iom-content">
              <h2 className="iom-title">Smart Investment Options<br />for Stable Returns</h2>

              <p className="iom-description">
                The three best investment options include CDs (Certificates of Deposit),
                Treasury Bills, and Treasury Notes. You can also allocate funds through an LTM
                allocation budget, which automatically distributes investments across all
                available yearly funds for better financial planning and consistent growth.
              </p>

              {/* Action Button */}
              <div className="iom-button-container">
                <button className="iom-btn-start" onClick={() => setShowAllocation(true)}>
                  Start
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default InvestmentOptionsModal;
