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
  onBlur?: () => void;
  disabled?: boolean;
}> = ({ startYear, endYear, onStartChange, onEndChange, onBlur, disabled }) => (
  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', opacity: disabled ? 0.4 : 1 }}>
    {[
      { placeholder: 'Start Year', value: startYear, onChange: onStartChange },
      { placeholder: 'End Year', value: endYear, onChange: onEndChange },
    ].map((f) => (
      <div key={f.placeholder} style={{ flex: 1, border: '1px solid #e6e6e6', borderRadius: '5px', height: '28px', overflow: 'hidden' }}>
        <input
          type="number" placeholder={f.placeholder} value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          style={{
            width: '100%', height: '100%', border: 'none', outline: 'none',
            padding: '0 10px', fontSize: '12px', background: 'transparent',
            fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'text', boxSizing: 'border-box',
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
  computedFee,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Active indicator — green dot when any setting has a value */}
          {(settings.inflationRate || settings.maxMonthlyFees || settings.safetyNet || settings.cashReserveThreshold) && (
            <div style={{ width: '7px', height: '7px', background: '#12bf6c', borderRadius: '50%' }} title="Settings active" />
          )}
          {/* Reset button */}
          {(settings.inflationRate || settings.maxMonthlyFees || settings.safetyNet || settings.cashReserveThreshold) && (
            <button
              onClick={() => {
                setSettings({ maxMonthlyFees: '', inflationRate: '', safetyNet: '', cashReserveThreshold: '' });
                setTimeout(() => triggerApply(), 0);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#888', padding: '0 2px', textDecoration: 'underline' }}
            >
              Reset
            </button>
          )}
          <div style={{ width: '15px', height: '2px', background: '#000', borderRadius: '1px' }} />
        </div>
      </div>

      {/* Input Fields */}
      <div style={{ padding: '0 16px 12px' }}>
        {[
          { key: 'maxMonthlyFees',        label: 'Max Annual Fee Increase', unit: '%',
            hint: 'Cap yearly fee growth rate (e.g. 5 = max 5%/yr)' },
          { key: 'inflationRate',          label: 'Inflation Rate Override', unit: '%',
            hint: 'Override study inflation for expense projections' },
          { key: 'safetyNet',              label: 'Safety Net (min. balance)', unit: '$',
            hint: 'Fund must stay above this amount at all times' },
          { key: 'cashReserveThreshold',   label: 'Low-Balance Alert',        unit: '$',
            hint: 'Highlight years where balance falls below this' },
        ].map((field, idx) => (
          <div key={field.key} style={{ marginBottom: idx < 3 ? '8px' : '0' }}>
            <div
              style={{
                display: 'flex', alignItems: 'center',
                border: `1px solid ${settings[field.key as keyof typeof settings] ? '#4CAF50' : '#dedede'}`,
                borderRadius: '5px', height: '30px', overflow: 'hidden',
              }}
            >
              <input
                type="number"
                placeholder={field.label}
                value={settings[field.key as keyof typeof settings]}
                onChange={(e) => {
                  if (optimizeAll) setOptimizeAll(false);
                  setSettings((prev) => ({ ...prev, [field.key]: e.target.value }));
                }}
                onBlur={() => triggerApply(optimizeAll ? { optimizeAll: false } : undefined)}
                onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
                style={{
                  flex: 1, border: 'none', outline: 'none', padding: '0 8px',
                  fontSize: '12px', color: '#000', background: 'transparent',
                  height: '100%', cursor: 'text', fontFamily: 'inherit',
                }}
              />
              <div style={{ width: '1px', height: '100%', background: '#dedede' }} />
              <span style={{ padding: '0 8px', fontSize: '13px', color: '#666', flexShrink: 0 }}>{field.unit}</span>
            </div>
            {/* Tooltip hint */}
            <div style={{ fontSize: '10px', color: '#aaa', padding: '2px 4px 0' }}>{field.hint}</div>
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
      {activeTab === 'manual' && (() => {
        const pctChange = monthlyFee > 0
          ? Math.round(((sliderValue - monthlyFee) / monthlyFee) * 100)
          : 0;
        return (
          <div style={{ padding: '16px 17px 20px', borderTop: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Original:</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#555' }}>${monthlyFee.toLocaleString()}/unit</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#000' }}>Current:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#000' }}>${sliderValue.toLocaleString()}/unit</span>
                {sliderValue !== monthlyFee && (
                  <span style={{
                    fontSize: '11px', fontWeight: '700', padding: '1px 6px', borderRadius: '8px',
                    background: pctChange > 0 ? '#dcfce7' : '#fee2e2',
                    color: pctChange > 0 ? '#166534' : '#991b1b',
                  }}>
                    {pctChange > 0 ? '+' : ''}{pctChange}%
                  </span>
                )}
              </div>
            </div>
            <SliderRow
              value={sliderValue}
              max={sliderMax}
              onChange={(v) => { if (optimizeAll) setOptimizeAll(false); setSliderValue(v); }}
              onCommit={() => triggerApply(optimizeAll ? { optimizeAll: false } : undefined)}
            />
          </div>
        );
      })()}

      {/* ─── ADVANCED TAB ─── */}
      {activeTab === 'advanced' && (
        <div style={{ borderTop: '1px solid #e5e5e5' }}>

          {/* Original / Current + main slider */}
          <div style={{ padding: '16px 17px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Original:</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#555' }}>${monthlyFee.toLocaleString()}/unit</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#000' }}>
                {optimizeAll ? 'Optimized fee:' : 'Manual fee:'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {optimizeAll && computedFee != null ? (
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#166534' }}>
                    ${computedFee.toLocaleString()}/unit
                  </span>
                ) : (
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#000' }}>
                    ${sliderValue.toLocaleString()}/unit
                  </span>
                )}
                {!optimizeAll && sliderValue !== monthlyFee && (() => {
                  const pctChange = monthlyFee > 0
                    ? Math.round(((sliderValue - monthlyFee) / monthlyFee) * 100)
                    : 0;
                  return (
                    <span style={{
                      fontSize: '11px', fontWeight: '700', padding: '1px 6px', borderRadius: '8px',
                      background: pctChange > 0 ? '#dcfce7' : '#fee2e2',
                      color: pctChange > 0 ? '#166534' : '#991b1b',
                    }}>
                      {pctChange > 0 ? '+' : ''}{pctChange}%
                    </span>
                  );
                })()}
              </div>
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
            {optimizeAll && (
              <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', textAlign: 'center' }}>
                Drag slider to override — this will turn off Auto-Optimize
              </div>
            )}
          </div>

          {/* ── Optimize All Monthly Fees ── */}
          <div style={{
            borderTop: '1px solid #e5e5e5', padding: '14px 17px',
            background: optimizeAll ? '#f0fdf4' : 'transparent',
            transition: 'background 0.2s',
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
            <p style={{ fontSize: '11px', color: '#777', margin: 0, lineHeight: '1.55' }}>
              Finds the minimum fee that keeps the reserve fund above $0
              {settings.safetyNet ? ` (Safety Net: $${Number(settings.safetyNet).toLocaleString()})` : ''}
              {' '}for every projected year.
            </p>
            {optimizeAll && (
              <div style={{
                marginTop: '10px', padding: '7px 10px',
                background: '#dcfce7', borderRadius: '6px', border: '1px solid #86efac',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: '600' }}>Computed optimal fee</span>
                <span style={{ fontSize: '14px', color: '#166534', fontWeight: '700' }}>
                  {computedFee != null ? `$${computedFee.toLocaleString()}/unit` : 'Computing…'}
                </span>
              </div>
            )}
          </div>

          {/* ── Custom Range ── */}
          <div style={{ borderTop: '1px solid #e5e5e5', padding: '14px 17px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Custom Range</span>
                <div style={{ fontSize: '10px', color: '#aaa', marginTop: '1px' }}>Flat fee override for specific years</div>
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
                <span>&#9888;</span> End year must be after start year
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', opacity: customRangeEnabled ? 1 : 0.4 }}>
              <span style={{ fontSize: '13px', color: '#333' }}>Fee per unit:</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#000' }}>${customSlider.toLocaleString()}</span>
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

          {/* ── Gradual Increase ── */}
          <div style={{ borderTop: '1px solid #e5e5e5', padding: '14px 17px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>Gradual Increase</span>
                <div style={{ fontSize: '10px', color: '#aaa', marginTop: '1px' }}>Linearly ramp fee up over a year range</div>
              </div>
              <Toggle value={gradualRangeEnabled} onChange={(v) => { setGradualRangeEnabled(v); triggerApply(); }} />
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
                <span>&#9888;</span> End year must be after start year
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', opacity: gradualRangeEnabled ? 1 : 0.4 }}>
              <span style={{ fontSize: '13px', color: '#333' }}>Total ramp-up:</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#000' }}>+{gradualSlider}%</span>
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

