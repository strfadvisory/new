import React, { useState, useRef, useCallback, useEffect } from 'react';

export interface FeeAdjustmentConfig {
  monthlyFeePerUnit: number;       // new monthly fee per unit (slider)
  optimizeAll?: boolean;           // use calculateOptimalFee to eliminate all deficits
  inflationRate?: number;          // % e.g. 3.5
  maxPctIncrease?: number;         // % cap
  safetyNet?: number;              // $
  cashReserveThreshold?: number;   // $
}

interface MonthlyFeePopupProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyFee: number;
  initialPosition?: { x: number; y: number };
  onApply?: (config: FeeAdjustmentConfig) => void;
}

// Pill toggle component
const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    style={{
      width: '26px', height: '14px', background: '#e8e8e8',
      borderRadius: '30px', position: 'relative', cursor: 'pointer', flexShrink: 0,
    }}
  >
    <div style={{
      position: 'absolute', top: 0,
      left: value ? '12px' : '0',
      width: '14px', height: '14px', borderRadius: '50%',
      background: value ? '#12bf6c' : '#bbb',
      transition: 'left 0.2s ease',
    }} />
  </div>
);

// Slider with green track + thumb
const SliderRow: React.FC<{
  value: number; onChange: (v: number) => void; onCommit?: () => void; max?: number; suffix?: string;
}> = ({ value, onChange, onCommit, max = 200, suffix = '$' }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ position: 'relative', height: '16px' }}>
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        transform: 'translateY(-50%)', height: '3px', background: '#e5e5e5', borderRadius: '2px',
      }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#4CAF50', borderRadius: '2px' }} />
      </div>
      <input
        type="range" min={0} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0, padding: 0 }}
      />
      <div style={{
        position: 'absolute', top: '50%', left: `${pct}%`,
        transform: 'translate(-50%, -50%)',
        width: '15px', height: '15px', borderRadius: '50%',
        background: '#4CAF50', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
      }} />
    </div>
  );
};

// Side-by-side year inputs
const YearRangeInputs: React.FC<{
  startYear: string; endYear: string;
  onStartChange: (v: string) => void; onEndChange: (v: string) => void;
}> = ({ startYear, endYear, onStartChange, onEndChange }) => (
  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
    {[
      { placeholder: 'Start Year', value: startYear, onChange: onStartChange },
      { placeholder: 'End Year', value: endYear, onChange: onEndChange },
    ].map((f) => (
      <div key={f.placeholder} style={{ flex: 1, border: '1px solid #e6e6e6', borderRadius: '5px', height: '28px', overflow: 'hidden' }}>
        <input
          type="text" placeholder={f.placeholder} value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          style={{
            width: '100%', height: '100%', border: 'none', outline: 'none',
            padding: '0 10px', fontSize: '12px', background: 'transparent',
            fontFamily: 'inherit', cursor: 'text', boxSizing: 'border-box',
          }}
        />
      </div>
    ))}
  </div>
);

const MonthlyFeePopup: React.FC<MonthlyFeePopupProps> = ({
  isOpen,
  onClose,
  monthlyFee,
  initialPosition,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'advanced'>('manual');
  const [settings, setSettings] = useState({
    maxMonthlyFees: '',
    inflationRate: '',
    safetyNet: '',
    cashReserveThreshold: '',
  });
  const [sliderValue, setSliderValue] = useState(monthlyFee || 0);

  // Sync slider when the base monthly fee prop changes (new study loaded)
  useEffect(() => {
    setSliderValue(monthlyFee || 0);
  }, [monthlyFee]);

  const sliderMax = Math.max(500, Math.ceil((monthlyFee || 100) * 3 / 50) * 50);

  // ── Advanced tab state (must be declared BEFORE triggerApply so they're captured in the closure)
  const [optimizeAll, setOptimizeAll] = useState(false);
  const [customRangeEnabled, setCustomRangeEnabled] = useState(true);
  const [customStartYear, setCustomStartYear] = useState('');
  const [customEndYear, setCustomEndYear] = useState('');
  const [customSlider, setCustomSlider] = useState(monthlyFee || 0);
  const [gradualStartYear, setGradualStartYear] = useState('');
  const [gradualEndYear, setGradualEndYear] = useState('');
  const [gradualSlider, setGradualSlider] = useState(20);

  // Collect current state and call onApply.
  // Pass `overrides` to immediately use a new value before React state update flushes.
  const triggerApply = useCallback((overrides?: { optimizeAll?: boolean }) => {
    if (!onApply) return;
    const effectiveOptimizeAll = overrides?.optimizeAll ?? optimizeAll;
    onApply({
      monthlyFeePerUnit: sliderValue,
      optimizeAll: effectiveOptimizeAll,
      inflationRate:         settings.inflationRate         ? parseFloat(settings.inflationRate)         : undefined,
      maxPctIncrease:        settings.maxMonthlyFees        ? parseFloat(settings.maxMonthlyFees)        : undefined,
      safetyNet:             settings.safetyNet             ? parseFloat(settings.safetyNet)             : undefined,
      cashReserveThreshold:  settings.cashReserveThreshold  ? parseFloat(settings.cashReserveThreshold) : undefined,
    });
  }, [sliderValue, settings, onApply, optimizeAll]);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  // Set initial position once when opened
  useEffect(() => {
    if (isOpen && !initialized) {
      setPosition(initialPosition ?? { x: window.innerWidth / 2 - 142, y: window.innerHeight / 2 - 250 });
      setInitialized(true);
    }
    if (!isOpen) setInitialized(false);
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

  return (
    <div
      ref={popupRef}
      onMouseDown={onMouseDown}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: '284px',
        background: 'white',
        border: '1px solid #d9d9d9',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        zIndex: 2000,
        cursor: 'grab',
        userSelect: 'none',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header — fixed, never scrolls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid #e5e5e5',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>Monthly Fee Adjustment</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

      {/* Setting Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 17px 8px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Setting</span>
        <div style={{ width: '15px', height: '2px', background: '#000', borderRadius: '1px' }} />
      </div>

      {/* Input Fields */}
      <div style={{ padding: '0 16px 12px' }}>
        {[
          { key: 'maxMonthlyFees', label: 'Maximum % Monthly Fees', unit: '%' },
          { key: 'inflationRate',  label: 'Inflation Rate',          unit: '%' },
          { key: 'safetyNet',      label: 'Safety Net ®',            unit: '$' },
          { key: 'cashReserveThreshold', label: 'Cash Reserve Threshold', unit: '$' },
        ].map((field, idx) => (
          <div
            key={field.key}
            style={{
              display: 'flex', alignItems: 'center',
              border: '1px solid #dedede', borderRadius: '5px',
              marginBottom: idx < 3 ? '8px' : '0', height: '30px', overflow: 'hidden',
            }}
          >
            <input
              type="number"
              placeholder={field.label}
              value={settings[field.key as keyof typeof settings]}
              onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
              onBlur={() => triggerApply()}
              style={{
                flex: 1, border: 'none', outline: 'none', padding: '0 8px',
                fontSize: '14px', color: '#000', background: 'transparent',
                height: '100%', cursor: 'text', fontFamily: 'inherit',
              }}
            />
            <div style={{ width: '1px', height: '100%', background: '#dedede' }} />
            <span style={{ padding: '0 10px', fontSize: '14px', color: '#000', flexShrink: 0 }}>{field.unit}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ borderTop: '1px solid #e5e5e5', display: 'flex', padding: '0 16px' }}>
        <button
          onClick={() => setActiveTab('manual')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '12px 16px 10px', fontSize: '14px', fontWeight: '700',
            color: activeTab === 'manual' ? '#000' : '#888',
            borderBottom: activeTab === 'manual' ? '2px solid #000' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          Manual Fees
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '12px 16px 10px', fontSize: '14px', fontWeight: '700',
            color: activeTab === 'advanced' ? '#000' : '#888',
            borderBottom: activeTab === 'advanced' ? '2px solid #000' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          Advanced
        </button>
      </div>

      {/* ─── MANUAL TAB ─── */}
      {activeTab === 'manual' && (
        <div style={{ padding: '16px 17px 20px', borderTop: '1px solid #e5e5e5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Original Monthly Fees:</span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>${monthlyFee}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Current Monthly Fees:</span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>${sliderValue}</span>
          </div>
          <SliderRow value={sliderValue} max={sliderMax} onChange={setSliderValue} onCommit={triggerApply} />
        </div>
      )}

      {/* ─── ADVANCED TAB ─── */}
      {activeTab === 'advanced' && (
        <div style={{ borderTop: '1px solid #e5e5e5' }}>

          {/* Original / Current + main slider */}
          <div style={{ padding: '16px 17px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Original Monthly Fees:</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>${monthlyFee}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Current Monthly Fees:</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>${sliderValue}</span>
            </div>
            <SliderRow value={sliderValue} max={sliderMax} onChange={setSliderValue} onCommit={triggerApply} />
          </div>

          {/* ── Optimize All Monthly Fees ── */}
          <div style={{ borderTop: '1px solid #e5e5e5', padding: '16px 17px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Optimize All Monthly Fees</span>
              <Toggle
                value={optimizeAll}
                onChange={(v) => {
                  setOptimizeAll(v);
                  // Pass the new value directly — state update is async so closure would still see old value
                  triggerApply({ optimizeAll: v });
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#000', margin: 0, lineHeight: '1.5', fontWeight: '400' }}>
              When this option is enabled, all previous and future deficits will also be optimized and any manual Monthly Fees will be overriden.
            </p>
          </div>

          {/* ── Custom Range ── */}
          <div style={{ borderTop: '1px solid #e5e5e5', padding: '16px 17px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Custom Range</span>
              <Toggle value={customRangeEnabled} onChange={setCustomRangeEnabled} />
            </div>
            <YearRangeInputs
              startYear={customStartYear} endYear={customEndYear}
              onStartChange={setCustomStartYear} onEndChange={setCustomEndYear}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '400', color: '#000' }}>Current Monthly Fees:</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>${customSlider}</span>
            </div>
            <SliderRow value={customSlider} onChange={setCustomSlider} onCommit={triggerApply} />
          </div>

          {/* ── Gradual Custom Range ── */}
          <div style={{ borderTop: '1px solid #e5e5e5', padding: '16px 17px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Gradual Custom Range</span>
              <div style={{
                background: '#12bf6c', borderRadius: '10px',
                padding: '2px 8px', display: 'flex', alignItems: 'center',
              }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff', lineHeight: 'normal' }}>ON</span>
              </div>
            </div>
            <YearRangeInputs
              startYear={gradualStartYear} endYear={gradualEndYear}
              onStartChange={setGradualStartYear} onEndChange={setGradualEndYear}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '400', color: '#000' }}>Current Monthly Fees:</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>{gradualSlider}%</span>
            </div>
            <SliderRow value={gradualSlider} onChange={setGradualSlider} onCommit={triggerApply} max={100} suffix="%" />
          </div>

        </div>
      )}

      </div>{/* end scrollable body */}
    </div>
  );
};

export default MonthlyFeePopup;

