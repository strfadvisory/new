import React, { useState, useRef, useEffect, useCallback } from 'react';
import './InvestmentAllocationModal.css';

interface InvestmentAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inLeftPanel?: boolean;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const CD_BANKS    = ['Bank of America', 'Chase', 'Wells Fargo', 'Citibank', 'US Bank'];
const CD_TERMS    = ['6 months', '1 year', '2 years', '3 years', '5 years'];
const CD_RATES: Record<string, string> = {
  '6 months': '5.25%', '1 year': '5.10%', '2 years': '4.80%',
  '3 years': '4.50%',  '5 years': '4.20%',
};

const TB_OPTIONS  = ['US Treasury Bond', 'Government Bond ETF', 'Municipal Bond'];
const TB_TERMS    = ['1 year', '2 years', '5 years', '10 years', '30 years'];
const TB_RATES: Record<string, string> = {
  '1 year': '5.10%', '2 years': '4.75%', '5 years': '4.45%',
  '10 years': '4.45%', '30 years': '4.65%',
};

const LTM_STRATS  = ['Conservative Strategy', 'Balanced Strategy', 'Growth Strategy', 'Aggressive Strategy'];

// ── Icons ─────────────────────────────────────────────────────────────────────
const DragHandle = () => (
  <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
    <circle cx="2" cy="2"  r="1.5" fill="#C0C0C0"/>
    <circle cx="8" cy="2"  r="1.5" fill="#C0C0C0"/>
    <circle cx="2" cy="8"  r="1.5" fill="#C0C0C0"/>
    <circle cx="8" cy="8"  r="1.5" fill="#C0C0C0"/>
    <circle cx="2" cy="14" r="1.5" fill="#C0C0C0"/>
    <circle cx="8" cy="14" r="1.5" fill="#C0C0C0"/>
  </svg>
);

const Chevron = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 4L6 8L10 4" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
const InvestmentAllocationModal: React.FC<InvestmentAllocationModalProps> = ({ isOpen, onClose, inLeftPanel }) => {
  const modalRef   = useRef<HTMLDivElement>(null);
  const dragging   = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [pos,    setPos]    = useState<{ x: number; y: number } | null>(null);
  const [step,   setStep]   = useState(0); // 0=CD 1=Treasury 2=LTM 3=Summary

  // Per-step state
  const [cdAlloc,   setCdAlloc]   = useState(40);
  const [cdBank,    setCdBank]    = useState('');
  const [cdTerm,    setCdTerm]    = useState('');

  const [tbAlloc,   setTbAlloc]   = useState(40);
  const [tbOption,  setTbOption]  = useState('');
  const [tbTerm,    setTbTerm]    = useState('');

  const [ltmAlloc,  setLtmAlloc]  = useState(20);
  const [ltmStrat,  setLtmStrat]  = useState('');

  const cash = Math.max(0, 100 - cdAlloc - tbAlloc - ltmAlloc);

  useEffect(() => {
    if (isOpen) {
      setPos(null);
      setStep(0);
      setCdAlloc(40); setCdBank('');  setCdTerm('');
      setTbAlloc(40); setTbOption(''); setTbTerm('');
      setLtmAlloc(20); setLtmStrat('');
    }
  }, [isOpen]);

  // ── Drag ──
  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const r = modalRef.current?.getBoundingClientRect();
    if (r) {
      dragOffset.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (!pos) setPos({ x: r.left, y: r.top });
    }
  }, [pos]);

  useEffect(() => {
    const mv = (e: MouseEvent) => { if (dragging.current) setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }); };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
  }, []);

  const isSummary = step === 3;
  const isFirst   = step === 0;
  const isLast    = step === 3;

  // Progress fill: CD=33%, Treasury=66%, LTM=100%, Summary=cash%
  const progressPct = step === 0 ? 33 : step === 1 ? 66 : step === 2 ? 100 : cash;

  const modalStyle: React.CSSProperties = pos
    ? { left: `${pos.x}px`, top: `${pos.y}px`, transform: 'none' }
    : { left: '50%', top: '50%', transform: 'translate(-50%,-50%)' };

  // ── Budget Bar ──
  const BudgetBar = () => (
    <div className="iam-bar">
      {cdAlloc  > 0 && <div className="iam-bar-cd"  style={{ width: `${cdAlloc}%`  }}/>}
      {tbAlloc  > 0 && <div className="iam-bar-tb"  style={{ width: `${tbAlloc}%`  }}/>}
      {ltmAlloc > 0 && <div className="iam-bar-ltm" style={{ width: `${ltmAlloc}%` }}/>}
      {cash     > 0 && <div className="iam-bar-rem" style={{ width: `${cash}%`     }}/>}
    </div>
  );

  // ── Slider ──
  const Slider = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <input
      type="range" min={0} max={100} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="iam-slider"
      style={{ '--pct': `${value}%` } as React.CSSProperties}
    />
  );

  // ── Select field ──
  const SelectField = ({ value, onChange, placeholder, options }: {
    value: string; onChange: (v: string) => void; placeholder: string; options: string[];
  }) => (
    <div className="iam-field">
      <select className="iam-select" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="iam-chev"><Chevron/></span>
    </div>
  );

  // ── Interests row (read-only) ──
  const InterestsField = ({ rate }: { rate: string }) => (
    <div className="iam-field iam-field-ro">
      <span className="iam-ro-label">Interests</span>
      <span className="iam-ro-value">{rate}</span>
    </div>
  );

  // ── Step content ──
  const renderStep = () => {
    if (step === 0) return (
      <>
        <div className="iam-type-row">
          <span className="iam-type-name">Certificate of Deposit</span>
          <span className="iam-type-pct">{cdAlloc}%</span>
        </div>
        <Slider value={cdAlloc} onChange={setCdAlloc}/>
        <p className="iam-desc">Choose the percentage (%) of funds you want to allocate to Certificates of Deposit (CDs).</p>
        <div className="iam-fields">
          <SelectField value={cdBank}  onChange={setCdBank}  placeholder="Choose Bank" options={CD_BANKS}/>
          <SelectField value={cdTerm}  onChange={setCdTerm}  placeholder="Terms"       options={CD_TERMS}/>
          <InterestsField rate={cdTerm ? (CD_RATES[cdTerm] || '--') : '--'}/>
        </div>
        <p className="iam-note">Note: After setting the allocation, you can manually update or adjust it year by year if needed.</p>
      </>
    );

    if (step === 1) return (
      <>
        <div className="iam-type-row">
          <span className="iam-type-name">Treasury Bonds</span>
          <span className="iam-type-pct">{tbAlloc}%</span>
        </div>
        <Slider value={tbAlloc} onChange={setTbAlloc}/>
        <p className="iam-desc">Choose the percentage (%) of funds you want to allocate to treasury bonds</p>
        <div className="iam-fields">
          <SelectField value={tbOption} onChange={setTbOption} placeholder="Choose treasury bonds" options={TB_OPTIONS}/>
          <SelectField value={tbTerm}   onChange={setTbTerm}   placeholder="Terms"                 options={TB_TERMS}/>
          <InterestsField rate={tbTerm ? (TB_RATES[tbTerm] || '--') : '--'}/>
        </div>
        <p className="iam-note">Note: After setting the allocation, you can manually update or adjust it year by year if needed.</p>
      </>
    );

    if (step === 2) return (
      <>
        <div className="iam-type-row">
          <span className="iam-type-name">LTM Investment</span>
          <span className="iam-type-pct">{ltmAlloc}%</span>
        </div>
        <Slider value={ltmAlloc} onChange={setLtmAlloc}/>
        <p className="iam-desc">Choose how much % your want allocate in LTM Investment</p>
        <div className="iam-fields">
          <SelectField value={ltmStrat} onChange={setLtmStrat} placeholder="Used Investment Strategy" options={LTM_STRATS}/>
          <button className="iam-buckets-btn">Show LTIM Buckets</button>
        </div>
        <p className="iam-note">Note: After setting the allocation, you Can't manually update or adjust it year by year if needed.</p>
      </>
    );

    // ── Summary ──
    const rows = [
      { label: 'Certificate of Deposit', pct: cdAlloc  },
      { label: 'Treasury bonds',         pct: tbAlloc  },
      { label: 'LTM Investment',         pct: ltmAlloc },
      { label: 'Cash in Hand',           pct: cash     },
    ];
    return (
      <div className="iam-summary">
        {rows.map(r => (
          <div key={r.label} className="iam-summary-row">
            <span className="iam-summary-label">{r.label}</span>
            <span className="iam-summary-pct">{r.pct}%</span>
          </div>
        ))}
      </div>
    );
  };

  if (inLeftPanel) {
    if (!isOpen) return null;
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
        <div className="iam-header" style={{ width: '100%' }}>
          <div className="iam-nav">
            <button
              className={`iam-nav-btn${isFirst ? ' iam-nav-muted' : ''}`}
              disabled={isFirst}
              onClick={() => setStep(s => s - 1)}
            >Prev</button>
            <button
              className="iam-nav-btn iam-nav-blue"
              onClick={() => isLast ? onClose() : setStep(s => s + 1)}
            >{isLast ? 'Finish' : 'Next'}</button>
          </div>
        </div>

        <div className="iam-progress" style={{ width: '100%' }}>
          <div className="iam-progress-fill" style={{ width: `${progressPct}%` }}/>
        </div>

        <div className="iam-budget" style={{ width: '100%' }}>
          <div className="iam-budget-row">
            <span className="iam-budget-label">Budget Allocation</span>
            {step === 0 && <span className="iam-budget-total">100%</span>}
          </div>
          <BudgetBar/>
        </div>

        <div className="iam-divider" style={{ width: '100%' }}/>

        <div className="iam-body" style={{ width: '100%' }}>{renderStep()}</div>

        <div className="iam-footer" style={{ width: '100%' }}>
          <button className="iam-btn" onClick={() => isLast ? onClose() : setStep(s => s + 1)}>
            {isSummary ? 'Apply' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="iam-overlay"/>
      <div className="iam-modal" ref={modalRef} style={modalStyle}>

        {/* Header */}
        <div className="iam-header" onMouseDown={onDragStart}>
          <div className="iam-drag"><DragHandle/></div>
          <div className="iam-nav">
            <button
              className={`iam-nav-btn${isFirst ? ' iam-nav-muted' : ''}`}
              disabled={isFirst}
              onClick={() => setStep(s => s - 1)}
            >Prev</button>
            <button
              className="iam-nav-btn iam-nav-blue"
              onClick={() => isLast ? onClose() : setStep(s => s + 1)}
            >{isLast ? 'Finish' : 'Next'}</button>
          </div>
        </div>

        {/* Progress underline */}
        <div className="iam-progress">
          <div className="iam-progress-fill" style={{ width: `${progressPct}%` }}/>
        </div>

        {/* Budget Allocation */}
        <div className="iam-budget">
          <div className="iam-budget-row">
            <span className="iam-budget-label">Budget Allocation</span>
            {step === 0 && <span className="iam-budget-total">100%</span>}
          </div>
          <BudgetBar/>
        </div>

        {/* Divider */}
        <div className="iam-divider"/>

        {/* Step body */}
        <div className="iam-body">{renderStep()}</div>

        {/* Footer button */}
        <div className="iam-footer">
          <button className="iam-btn" onClick={() => isLast ? onClose() : setStep(s => s + 1)}>
            {isSummary ? 'Apply' : 'Next'}
          </button>
        </div>

      </div>
    </>
  );
};

export default InvestmentAllocationModal;
