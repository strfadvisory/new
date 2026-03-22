import React, { useState, useRef, useCallback, useEffect } from 'react';

export interface FeeAdjustmentConfig {
  monthlyFeePerUnit: number;       // new monthly fee per unit (slider)
  optimizeAll?: boolean;           // use calculateOptimalFee to eliminate all deficits
  inflationRate?: number;          // % override e.g. 3.5
  maxPctIncrease?: number;         // % cap on annual contribution growth
  safetyNet?: number;              // $ minimum balance floor
  cashReserveThreshold?: number;   // $ alert threshold
  customRange?: { enabled: boolean; startYear: number; endYear: number; feePerUnit: number };
  gradualRange?: { enabled: boolean; startYear: number; endYear: number; pctIncrease: number };
}

interface MonthlyFeePopupProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyFee: number;
  initialPosition?: { x: number; y: number };
  onApply?: (config: FeeAdjustmentConfig) => void;
  computedFee?: number; // effective fee when optimizeAll is active (passed from parent)
}

// X icon close button
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L11 11M11 1L1 11" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Pill toggle component
const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <div
    onClick={() => onChange(!value)}
    style={{
      width: '26px', height: '14px', background: value ? '#12bf6c' : '#e8e8e8',
      borderRadius: '30px', position: 'relative', cursor: 'pointer', flexShrink: 0,
      transition: 'background 0.3s ease',
    }}
  >
    <div style={{
      position: 'absolute', top: '1px',
      left: value ? '13px' : '1px',
      width: '12px', height: '12px', borderRadius: '50%',
      background: '#fff',
      transition: 'left 0.3s ease',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    }} />
  </div>
);

// Slider with green track + thumb
const SliderRow: React.FC<{
  value: number; onChange: (v: number) => void; onCommit?: () => void; max?: number; suffix?: string;
}> = ({ value, onChange, onCommit, max = 200, suffix = '$' }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
      <div style={{
        position: 'absolute', top: '50%', left: 0, right: 0,
        transform: 'translateY(-50%)', height: '3px', background: '#e5e5e5', borderRadius: '2px',
      }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#12bf6c', borderRadius: '2px', transition: 'width 0.1s ease' }} />
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
        background: '#12bf6c', boxShadow: '0 2px 4px rgba(18, 191, 108, 0.3)',
        pointerEvents: 'none',
        transition: 'left 0.1s ease',
      }} />
    </div>
  );
};

// Side-by-side year inputs
const YearRangeInputs: React.FC<{
  startYear: string; endYear: string;
  onStartChange: (v: string) => void; onEndChange: (v: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}> = ({ startYear, endYear, onStartChange, onEndChange, onBlur, disabled }) => {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#e6e6e6';
    onBlur?.();
  };

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', opacity: disabled ? 0.5 : 1 }}>
      {[
        { placeholder: 'Start Year', value: startYear, onChange: onStartChange },
        { placeholder: 'End Year', value: endYear, onChange: onEndChange },
      ].map((f) => (
        <div key={f.placeholder} style={{ flex: 1, position: 'relative' }}>
          <input
            type="number"
            placeholder={f.placeholder}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#12bf6c'; }}
            onBlur={handleBlur}
            disabled={disabled}
            style={{
              width: '100%',
              height: '28px',
              border: '1px solid #e6e6e6',
              outline: 'none',
              padding: '0 8px',
              fontSize: '12px',
              background: disabled ? '#f5f5f5' : 'transparent',
              fontFamily: 'inherit',
              cursor: disabled ? 'not-allowed' : 'text',
              boxSizing: 'border-box',
              borderRadius: '4px',
              transition: 'border-color 0.2s ease',
            }}
          />
        </div>
      ))}
    </div>
  );
};

const MonthlyFeePopup: React.FC<MonthlyFeePopupProps> = ({
  isOpen,
  onClose,
  monthlyFee,
  initialPosition,
  onApply,
  computedFee,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'advanced'>('manual');
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
  const [customRangeEnabled, setCustomRangeEnabled] = useState(false);
  const [customStartYear, setCustomStartYear] = useState('');
  const [customEndYear, setCustomEndYear] = useState('');
  const [customSlider, setCustomSlider] = useState(monthlyFee || 0);
  const [gradualRangeEnabled, setGradualRangeEnabled] = useState(false);
  const [gradualStartYear, setGradualStartYear] = useState('');
  const [gradualEndYear, setGradualEndYear] = useState('');
  const [gradualSlider, setGradualSlider] = useState(20);

  // Collect current state and call onApply.
  // Pass `overrides` to immediately use a new value before React state update flushes.
  const triggerApply = useCallback((overrides?: { optimizeAll?: boolean }) => {
    if (!onApply) return;
    const effectiveOptimizeAll = overrides?.optimizeAll ?? optimizeAll;

    // Parse and validate custom range years
    const csY = parseInt(customStartYear);
    const ceY = parseInt(customEndYear);
    const hasValidCustom =
      customRangeEnabled &&
      !isNaN(csY) && !isNaN(ceY) &&
      csY >= 2000 && ceY > csY;

    // Parse and validate gradual range years
    const gsY = parseInt(gradualStartYear);
    const geY = parseInt(gradualEndYear);
    const hasValidGradual =
      gradualRangeEnabled &&
      !isNaN(gsY) && !isNaN(geY) &&
      gsY >= 2000 && geY > gsY;

    onApply({
      monthlyFeePerUnit: sliderValue,
      optimizeAll: effectiveOptimizeAll,
      inflationRate:        settings.inflationRate        ? parseFloat(settings.inflationRate)        : undefined,
      maxPctIncrease:       settings.maxMonthlyFees       ? parseFloat(settings.maxMonthlyFees)       : undefined,
      safetyNet:            settings.safetyNet            ? parseFloat(settings.safetyNet)            : undefined,
      cashReserveThreshold: settings.cashReserveThreshold ? parseFloat(settings.cashReserveThreshold) : undefined,
      customRange: hasValidCustom
        ? { enabled: true, startYear: csY, endYear: ceY, feePerUnit: customSlider }
        : undefined,
      gradualRange: hasValidGradual
        ? { enabled: true, startYear: gsY, endYear: geY, pctIncrease: gradualSlider }
        : undefined,
    });
  }, [sliderValue, settings, onApply, optimizeAll,
      customRangeEnabled, customStartYear, customEndYear, customSlider,
      gradualRangeEnabled, gradualStartYear, gradualEndYear, gradualSlider]);

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
        background: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        zIndex: 2000,
        cursor: 'grab',
        userSelect: 'none',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── HEADER (Fixed) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e5e5',
        flexShrink: 0,
        background: '#fff',
      }}>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#000', letterSpacing: '-0.3px' }}>
          Monthly Fee Adjustment
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
        >
          <CloseIcon />
        </button>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        background: '#fff',
      }}>

      {/* ── OPTIMIZE ALL MONTHLY FEES SECTION (Top Level) ── */}
      <div style={{
        padding: '14px 16px',
        background: optimizeAll ? '#f0fdf4' : 'transparent',
        transition: 'background 0.2s ease',
        borderBottom: '1px solid #e5e5e5',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Optimize All Monthly Fees</span>
          <Toggle
            value={optimizeAll}
            onChange={(v) => {
              setOptimizeAll(v);
              triggerApply({ optimizeAll: v });
            }}
          />
        </div>
        <p style={{
          fontSize: '12px', color: '#666', margin: 0, lineHeight: '1.5',
          fontWeight: 400,
        }}>
          When this option is enabled, all previous and future deficits will also be optimized and any manual Monthly Fees will be overriden.
        </p>
      </div>

      {/* ── MANUAL SETTING SECTION ── */}
      <div style={{
        padding: '12px 16px 10px',
        background: '#fff',
        borderBottom: '1px solid #e5e5e5',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Manual Setting</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Reset button */}
            {(settings.inflationRate || settings.maxMonthlyFees || settings.safetyNet || settings.cashReserveThreshold) && (
              <button
                onClick={() => {
                  setSettings({ maxMonthlyFees: '', inflationRate: '', safetyNet: '', cashReserveThreshold: '' });
                  setTimeout(() => triggerApply(), 0);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#999',
                  padding: '0 4px',
                  textDecoration: 'underline',
                  fontWeight: '500',
                }}
              >
                Reset
              </button>
            )}
            {/* Collapse/Expand  icon */}
            <div style={{
              width: '14px',
              height: '2px',
              background: '#ccc',
              borderRadius: '1px',
            }} />
          </div>
        </div>

        {/* Input Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { key: 'maxMonthlyFees', label: 'Maximum % Monthly Fees', unit: '%' },
            { key: 'inflationRate', label: 'Inflation Rate', unit: '%' },
            { key: 'safetyNet', label: 'Safety Net ®', unit: '%' },
            { key: 'cashReserveThreshold', label: 'Cash Reserve Threshold', unit: '%' },
          ].map((field) => (
            <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <label style={{
                fontSize: '13px',
                fontWeight: '400',
                color: '#000',
                flex: 1,
                whiteSpace: 'nowrap',
                minWidth: '0',
              }}>
                {field.label}
              </label>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  border: `1px solid ${focusedField === field.key ? '#12bf6c' : '#dedede'}`,
                  borderRadius: '4px',
                  height: '28px',
                  minWidth: '60px',
                  width: '60px',
                  overflow: 'visible',
                  background: '#fff',
                  transition: 'border-color 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <input
                  type="number"
          
                  value={settings[field.key as keyof typeof settings]}
                  onChange={(e) => {
                    if (optimizeAll) setOptimizeAll(false);
                    setSettings((prev) => ({ ...prev, [field.key]: e.target.value }));
                  }}
                  onFocus={() => setFocusedField(field.key)}
                  onBlur={() => {
                    setFocusedField(null);
                    triggerApply(optimizeAll ? { optimizeAll: false } : undefined);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    padding: '0 4px 0 6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#000',
                    background: 'transparent',
                    height: '100%',
                    cursor: 'text',
                    fontFamily: 'inherit',
                    textAlign: 'center',
                    minWidth: '0',
                  }}
                />
                <span style={{
                  fontSize: '12px',
                  color: settings[field.key as keyof typeof settings] ? '#999' : '#ccc',
                  fontWeight: '400',
                  padding: '0 5px 0 2px',
                  pointerEvents: 'none',
                  flexShrink: 0,
                  userSelect: 'none',
                }}>
                  %
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ borderTop: '1px solid #e5e5e5', display: 'flex', padding: '0 16px', background: '#fafafa' }}>
        <button
          onClick={() => setActiveTab('manual')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '12px 0',
            fontSize: '14px',
            fontWeight: '700',
            color: activeTab === 'manual' ? '#000' : '#999',
            borderBottom: activeTab === 'manual' ? '2px solid #000' : '2px solid transparent',
            marginBottom: '-1px',
            flex: 1,
            textAlign: 'center',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'manual') e.currentTarget.style.color = '#666';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'manual') e.currentTarget.style.color = '#999';
          }}
        >
          Manual Fees
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '12px 0',
            fontSize: '14px',
            fontWeight: '700',
            color: activeTab === 'advanced' ? '#000' : '#999',
            borderBottom: activeTab === 'advanced' ? '2px solid #000' : '2px solid transparent',
            marginBottom: '-1px',
            flex: 1,
            textAlign: 'center',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'advanced') e.currentTarget.style.color = '#666';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'advanced') e.currentTarget.style.color = '#999';
          }}
        >
          Advanced
        </button>
      </div>

      {/* ─── MANUAL TAB ─── */}
      {activeTab === 'manual' && (() => {
        const pctChange = monthlyFee > 0
          ? Math.round(((sliderValue - monthlyFee) / monthlyFee) * 100)
          : 0;
        return (
          <div style={{ padding: '14px 16px 20px', borderTop: '1px solid #e5e5e5' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#999' }}>Original Monthly Fees:</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>${monthlyFee.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#000' }}>Current Monthly Fees:</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>${sliderValue.toLocaleString()}</span>
              </div>
              <SliderRow
                value={sliderValue}
                max={sliderMax}
                onChange={(v) => { if (optimizeAll) setOptimizeAll(false); setSliderValue(v); }}
                onCommit={() => triggerApply(optimizeAll ? { optimizeAll: false } : undefined)}
              />
            </div>
          </div>
        );
      })()}

      {/* ─── ADVANCED TAB ─── */}
      {activeTab === 'advanced' && (
        <div>
          {/* Original / Current + main slider */}
          <div style={{ padding: '14px 16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#999' }}>Original Monthly Fees:</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>${monthlyFee.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#000' }}>
                  {optimizeAll ? 'Optimized fee:' : 'Current Monthly Fees:'}
                </span>
                <span style={{
                  fontSize: '16px', fontWeight: '700',
                  color: optimizeAll && computedFee != null ? '#166534' : '#000'
                }}>
                  {optimizeAll && computedFee != null
                    ? `$${computedFee.toLocaleString()}`
                    : `$${sliderValue.toLocaleString()}`}
                </span>
              </div>
              {/* Slider: disabled (dimmed) when optimizeAll is on */}
              <div style={{ opacity: optimizeAll ? 0.35 : 1, pointerEvents: optimizeAll ? 'none' : 'auto' }}>
                <SliderRow
                  value={sliderValue}
                  max={sliderMax}
                  onChange={(v) => { if (optimizeAll) setOptimizeAll(false); setSliderValue(v); }}
                  onCommit={() => triggerApply(optimizeAll ? { optimizeAll: false } : undefined)}
                />
              </div>
            </div>
          </div>

          {/* ── Auto-Optimize ── */}
          <div style={{
            borderTop: '1px solid #e5e5e5', padding: '14px 16px',
            background: optimizeAll ? '#f0fdf4' : 'transparent',
            transition: 'background 0.2s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Auto-Optimize</span>
              <Toggle
                value={optimizeAll}
                onChange={(v) => {
                  setOptimizeAll(v);
                  triggerApply({ optimizeAll: v });
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#666', margin: 0, lineHeight: '1.5' }}>
              Finds the minimum fee that keeps the reserve fund above $0
              {settings.safetyNet ? ` (Safety Net: $${Number(settings.safetyNet).toLocaleString()})` : ''}
              {' '}for every projected year.
            </p>
            {optimizeAll && (
              <div style={{
                marginTop: '10px', padding: '8px 10px',
                background: '#dcfce7', borderRadius: '6px', border: '1px solid #86efac',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: '600' }}>Computed optimal fee</span>
                <span style={{ fontSize: '13px', color: '#166534', fontWeight: '700' }}>
                  {computedFee != null ? `$${computedFee.toLocaleString()}` : 'Computing…'}
                </span>
              </div>
            )}
          </div>

          {/* ── Custom Range ── */}
          <div style={{ borderTop: '1px solid #e5e5e5', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Custom Range</span>
              </div>
              <Toggle value={customRangeEnabled} onChange={(v) => { setCustomRangeEnabled(v); triggerApply(); }} />
            </div>
            <YearRangeInputs
              startYear={customStartYear} endYear={customEndYear}
              onStartChange={setCustomStartYear} onEndChange={setCustomEndYear}
              onBlur={triggerApply}
              disabled={!customRangeEnabled}
            />
            {customRangeEnabled && customStartYear && customEndYear &&
              parseInt(customEndYear) <= parseInt(customStartYear) && (
              <div style={{ fontSize: '11px', color: '#dc2626', padding: '0 0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>⚠</span> End year must be after start year
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', opacity: customRangeEnabled ? 1 : 0.4 }}>
              <span style={{ fontSize: '12px', color: '#000', fontWeight: '600' }}>Current Monthly Fees:</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>${customSlider.toLocaleString()}</span>
            </div>
            <div style={{ opacity: customRangeEnabled ? 1 : 0.4, pointerEvents: customRangeEnabled ? 'auto' : 'none' }}>
              <SliderRow
                value={customSlider}
                max={sliderMax}
                onChange={setCustomSlider}
                onCommit={triggerApply}
              />
            </div>
          </div>

          {/* ── Gradual Custom Range ── */}
          <div style={{ borderTop: '1px solid #e5e5e5', padding: '14px 16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Gradual Custom Range</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {gradualRangeEnabled && (
                  <div style={{
                    background: '#12bf6c',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    marginRight: '6px',
                  }}>
                    ON
                  </div>
                )}
                <Toggle value={gradualRangeEnabled} onChange={(v) => { setGradualRangeEnabled(v); triggerApply(); }} />
              </div>
            </div>
            <YearRangeInputs
              startYear={gradualStartYear} endYear={gradualEndYear}
              onStartChange={setGradualStartYear} onEndChange={setGradualEndYear}
              onBlur={triggerApply}
              disabled={!gradualRangeEnabled}
            />
            {gradualRangeEnabled && gradualStartYear && gradualEndYear &&
              parseInt(gradualEndYear) <= parseInt(gradualStartYear) && (
              <div style={{ fontSize: '11px', color: '#dc2626', padding: '0 0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>⚠</span> End year must be after start year
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', opacity: gradualRangeEnabled ? 1 : 0.4 }}>
              <span style={{ fontSize: '12px', color: '#000', fontWeight: '600' }}>Current Monthly Fees:</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#000' }}>+{gradualSlider}%</span>
            </div>
            <div style={{ opacity: gradualRangeEnabled ? 1 : 0.4, pointerEvents: gradualRangeEnabled ? 'auto' : 'none' }}>
              <SliderRow value={gradualSlider} onChange={setGradualSlider} onCommit={triggerApply} max={100} suffix="%" />
            </div>
          </div>

        </div>
      )}

      </div>{/* end scrollable body */}
    </div>
  );
};

export default MonthlyFeePopup;

