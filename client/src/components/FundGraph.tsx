import { useState, useRef, useEffect } from "react";
import React from "react";
import { toast } from 'react-toastify';
import { calculateFinancialProjections, calculateHealthScore, calculateOptimalFee, FinancialConfig, ReserveItem } from '../utils/financialCalculations';
import type { FeeAdjustmentConfig } from './MonthlyFeePopup';

interface FundGraphProps {
  association?: string;
  reserveStudy?: string;
  onYearSelect?: (yearData: any) => void;
  excelData?: any;
  viewMode?: 'graph' | 'list';
  feeOverride?: FeeAdjustmentConfig | null;
  totalHousingUnits?: number | null;
  yearPriorityConfigs?: Record<number, any>;
  onYearPriorityUpdate?: (config: any) => void;
  currentYear?: number;
}

// ─────────────────────────────────────────────────────────────────
// COLORS — Graph 1 (Monthly Fee Collection)
// ─────────────────────────────────────────────────────────────────
const GREEN      = "#4CAF50";   // positive bar + line
const GREEN_DK   = "#155217";   // ghost outline
const RED        = "#dc3545";   // --danger: negative bar + lines
const RED_DK     = "#641a1a";   // ghost outline

// ─────────────────────────────────────────────────────────────────
// COLORS — Graph 2 (Cashflow Simulator)
// ─────────────────────────────────────────────────────────────────
const G2_POS    = "#4CAF50";   // positive bar
const G2_POS_GR = "#4CAF50";   // positive bar (solid)
const G2_POS_DK = "#155217";   // positive ghost outline
const G2_NEG    = "#dc3545";   // negative bar
const G2_NEG_GR = "#dc3545";   // negative bar (solid)
const G2_NEG_DK = "#641a1a";   // negative ghost outline
const G2_YEAR   = "#0E519B";   // year-row stripe
const G2_ACTIVE = "#dbeafe";   // active column tint
const G2_HOVER  = "#eff6ff";   // hover column tint
const COL_W      = 64;          // 4rem = 64px
const BAR_ZONE_H = 192;         // 12rem = 192px (exact from HTML style="height:12rem")
const BAR_W      = "55%";       // exact from CSS .simulation-timeline-positive-bar

// Line heights from CSS (converted from rem: 1rem=16px)
const POS_LINE_H     = 104;   // positive stem up
const NEG_LINE_T_EVEN = 73.6; // negative stem up, even col
const NEG_LINE_T_ODD  = 41.6; // negative stem up, odd col
const NEG_LINE_B      = 40;   // negative stem down
const STEM_W          = 3;    // 0.2rem ≈ 3px

// Year row height: 1rem = 16px
const YEAR_ROW_H = 16;

// Value label rows from HTML:
const VAL_H_TOP  = 24;  // 1.5rem
const VAL_H_BOT  = 48;  // 3rem

// ─────────────────────────────────────────────────────────────────
// GRAPH 1 — Monthly Fee Collection (synchronized with cashflow)
// ─────────────────────────────────────────────────────────────────
function Graph1({ sel, onSel, onYearSelect, feeData, resetKey }: { sel: string | null; onSel: (value: string | null) => void; onYearSelect?: (yearData: any) => void; feeData: any[]; resetKey?: any }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);

  // ── Reset to first year when data changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [resetKey]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't steal clicks from column cells
    if (target.closest('[data-col]')) return;
    isDragging.current = true;
    startX.current = e.pageX;
    scrollStart.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    e.preventDefault();
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollStart.current - (e.pageX - startX.current);
  };
  const stopDrag = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  return (
    <div style={{ borderBottom:"2px solid #e8e8e8", background:"#fff" }}>
      <div style={{ padding:"12px 16px 6px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:700, fontSize:15, color:"#111",  }}>Monthly fee collection</span>
        <span style={{ color:"#bbb", fontSize:16, cursor:"pointer", letterSpacing:3 }}>•••</span>
      </div>
      <div ref={scrollRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={stopDrag} onMouseLeave={stopDrag} style={{ overflowX:"auto", cursor:"grab", userSelect:"none" }}>
        <div style={{ display:"flex", minWidth:"max-content", padding:"0 16px" }}>
          {feeData.map((data, i) => {
            const active = sel === `f${i}`;
            const h = data.height ?? 28;
            return (
              <div key={i} data-col="true" onClick={() => {
                onSel(active ? null : `f${i}`);
                if (onYearSelect) {
                  onYearSelect({ year: data.year, value: data.feeValue, pos: true });
                }
              }}
                style={{ width:COL_W, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer", background:active?"#ddd":"transparent", borderRadius:6 }}>
                <div style={{ height:16, display:"flex", alignItems:"center", justifyContent:"center", marginTop:6 }}>
                  <span style={{
                    fontSize:11, fontWeight:700,
                    color: data.percentage > 0 ? GREEN : data.percentage < 0 ? '#ef4444' : '#aaa'
                  }}>
                    {data.percentage > 0 ? '+' : ''}{data.percentage}%
                  </span>
                </div>
                <div style={{ height:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:11, fontWeight:700, color:GREEN }}>{data.feeValue}</span>
                </div>
                <div style={{ height:72, width:"100%", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
                  <div style={{ width:"55%", height:h, background:GREEN, borderRadius:"4px 4px 0 0" }} />
                </div>
                <div style={{ width:"100%", height:1, background:"#e8e8e8" }} />
                <div style={{ height:22, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:11, color:"#555" }}>{data.year}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// GRAPH 2 — Cashflow Simulator (exact CSS logic reimplemented)
//
// Column structure (top → bottom), matching HTML exactly:
//
//  [BAR_ZONE_H=192px]  ← positive bar grows from bottom of this zone
//  [VAL_H_TOP=24px]    ← value label row A  (even: value shown, odd: empty)
//  [VAL_H_BOT=48px]    ← value label row B  (even: empty,       odd: value shown)
//  [YEAR_ROW_H=16px]   ← year pill (gray bg, centered)
//  [BAR_ZONE_H=192px]  ← negative bar grows from top of this zone
//
// Stems are ABSOLUTE inside year row:
//   positive-line:        bottom:0, height:104px → extends UP from year row
//   negative-line-t-even: bottom:0, height:73.6px → extends UP (even)
//   negative-line-t-odd:  bottom:0, height:41.6px → extends UP (odd)
//   negative-line-b:      top:0,    height:40px → extends DOWN
// ─────────────────────────────────────────────────────────────────
function Graph2({ sel, onSel, onYearSelect, cashflowData = [], resetKey, onYearPriorityUpdate, currentYear, yearPriorityConfigs }: { sel: string | null; onSel: (value: string | null) => void; onYearSelect?: (yearData: any) => void; cashflowData?: any[]; resetKey?: any; onYearPriorityUpdate?: (config: any) => void; currentYear?: number; yearPriorityConfigs?: Record<number, any> }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ── Reset to first year when data changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [resetKey]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-col]')) return;
    isDragging.current = true;
    startX.current = e.pageX;
    scrollStart.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grabbing';
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    e.preventDefault();
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollStart.current - (e.pageX - startX.current);
  };
  const stopDrag = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetYear: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    try {
      const draggedData = JSON.parse(e.dataTransfer.getData('application/json'));
      const sourceYear = draggedData.sourceYear;
      const draggedItem = draggedData.item;

      console.log('[FundGraph] ========== DROP OPERATION START ==========');
      console.log('[FundGraph] Drop initiated:', {
        sourceYear,
        targetYear,
        draggedItemId: draggedItem?.id,
        draggedItemName: draggedItem?.itemName,
        draggedItemCost: draggedItem?.inflatedCost,
        sirsType: draggedItem?.sirsType,
      });

      if (draggedItem?.sirsType !== 0) {
        toast.error('Only items with SIRs=0 can be moved.');
        return;
      }

      // Only allow drops to years strictly after the source year
      if (targetYear <= sourceYear) {
        toast.error(`Cannot drop on current or past years. Drop year (${targetYear}) must be after the source year (${sourceYear}).`);
        return;
      }
      
      const isCopy = e.ctrlKey;
      console.log('[FundGraph] Drop mode:', isCopy ? 'COPY' : 'MOVE');
      
      // CRITICAL: Dispatch event IMMEDIATELY to remove from popup UI
      if (!isCopy) {
        console.log('[FundGraph] *** DISPATCHING itemDroppedToYear EVENT ***');
        window.dispatchEvent(new CustomEvent('itemDroppedToYear', {
          detail: {
            sourceYear,
            targetYear,
            itemId: draggedItem.id,
          }
        }));
        console.log('[FundGraph] *** EVENT DISPATCHED ***');
      }
      
      // STEP 1: Remove dragged item from source year config.
      // Always runs for a move — uses allSourceItems from drag payload as the base list
      // when no saved config exists yet, so the source config is ALWAYS correctly set.
      if (!isCopy) {
        // Prefer existing saved config; fall back to the full item list the popup sent
        const existingSourceConfig = (yearPriorityConfigs || {})[sourceYear];
        const baseItems: any[] = existingSourceConfig?.priorities ?? draggedData.allSourceItems ?? [];

        const updatedPriorities = baseItems.filter((p: any) => p.id !== draggedItem.id);

        const updatedSourceConfig = {
          ...(existingSourceConfig || {}),
          priorities: updatedPriorities,
          selectedYear: sourceYear,
          filterType: existingSourceConfig?.filterType || 'all',
          searchQuery: existingSourceConfig?.searchQuery || '',
          budgetAllocation: existingSourceConfig?.budgetAllocation || {},
        };

        console.log('[FundGraph] *** SOURCE REMOVAL ***', sourceYear,
          'base:', baseItems.length, '→ after remove:', updatedPriorities.length);

        if (onYearPriorityUpdate) {
          onYearPriorityUpdate(updatedSourceConfig);
        }
      }
      
      // STEP 2: Add to target year - MUST happen after source removal
      const targetConfig = (yearPriorityConfigs || {})[targetYear] || {
        priorities: [],
        filterType: 'all',
        searchQuery: '',
        selectedYear: targetYear,
        budgetAllocation: {},
      };
      
      // Create new item with unique ID for target year
      const newItem = {
        ...draggedItem,
        id: isCopy ? `${draggedItem.id}-copy-${Date.now()}` : `${draggedItem.id}-moved-${targetYear}`,
        year: targetYear,
        inflatedCost: draggedItem.inflatedCost,
        originalCost: draggedItem.originalCost || draggedItem.replacementCost,
        // Ensure all required fields are present
        itemName: draggedItem.itemName,
        expectedLife: draggedItem.expectedLife,
        remainingLife: draggedItem.remainingLife,
        replacementCost: draggedItem.replacementCost || draggedItem.originalCost,
        sirsType: draggedItem.sirsType,
        sirsTypeLabel: draggedItem.sirsTypeLabel,
        isScheduled: false, // Moved items are not originally scheduled for this year
        nextReplacement: draggedItem.nextReplacement,
      };
      
      const updatedTargetConfig = {
        ...targetConfig,
        priorities: [...targetConfig.priorities, newItem],
        selectedYear: targetYear,
        filterType: targetConfig.filterType || 'all',
        searchQuery: targetConfig.searchQuery || '',
        budgetAllocation: targetConfig.budgetAllocation || {},
      };
      
      console.log('[FundGraph] *** ADDING TO TARGET ***', targetYear, 'New count:', updatedTargetConfig.priorities.length);
      console.log('[FundGraph] Target config details:', {
        year: targetYear,
        itemCount: updatedTargetConfig.priorities.length,
        items: updatedTargetConfig.priorities.map((p: any) => ({ 
          id: p.id, 
          name: p.itemName, 
          cost: Math.round(p.inflatedCost) 
        })),
        filterType: updatedTargetConfig.filterType,
        searchQuery: updatedTargetConfig.searchQuery
      });
      
      if (onYearPriorityUpdate) {
        console.log('[FundGraph] *** CALLING onYearPriorityUpdate for target year ***', targetYear);
        onYearPriorityUpdate(updatedTargetConfig);
        
        // Force immediate refresh of any open popup for this year
        setTimeout(() => {
          console.log('[FundGraph] *** DISPATCHING forcePopupRefresh for year ***', targetYear);
          window.dispatchEvent(new CustomEvent('forcePopupRefresh', {
            detail: { year: targetYear, config: updatedTargetConfig }
          }));
        }, 100);
      }
      
      // Show success message
      const itemName = draggedItem.itemName.length > 20 
        ? draggedItem.itemName.substring(0, 20) + '...' 
        : draggedItem.itemName;
      
      // Create and show a temporary success notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
      `;
      notification.innerHTML = `✓ "${itemName}" moved to ${targetYear}`;
      
      // Add animation keyframes if not already added
      if (!document.querySelector('#dragDropAnimations')) {
        const style = document.createElement('style');
        style.id = 'dragDropAnimations';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = 'slideIn 0.3s ease-out reverse';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
            }
          }, 300);
        }
      }, 3000);
      
      console.log(`✓ Item "${draggedItem.itemName}" moved from ${sourceYear} to ${targetYear}`);
      
      console.log('[FundGraph] ========== DROP OPERATION COMPLETE ==========');
    } catch (error) {
      console.error('[FundGraph] Drop error:', error);
      toast.error('Error processing drag-drop. Please try again.');
    }
  };

  return (
    <div style={{ background:"#fff" }}>
      <div style={{ display:"flex", alignItems:"center", padding:"12px 16px 4px", gap:8, borderTop:"1px solid #f0f0f0" }}>
        <span style={{ fontWeight:700, fontSize:15, color:"#111", minWidth:190 }}>Cashflow Simulator</span>
        <span style={{ color:"#bbb", fontSize:11, fontStyle: 'italic' }}>Drag items from the popup to any year bar below</span>
        <span style={{ color:"#bbb", fontSize:16, cursor:"pointer", letterSpacing:3, marginLeft: 'auto' }}>•••</span>
        <div style={{ flex:1, display:"flex", justifyContent:"center" }}>
          <span style={{ fontWeight:700, fontSize:15, color:"#111" }}>How to clear deficit</span>
        </div>
      </div>

      <div ref={scrollRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={stopDrag} onMouseLeave={stopDrag} style={{ overflowX:"auto", padding:"0 16px 28px", cursor:"grab", userSelect:"none" }}>
        <div style={{ display:"inline-flex", flexDirection:"row" }}>
          {cashflowData.map((d, i) => {
            const active  = sel === `c${i}`;
            const isPos   = d.pos;
            const isEven  = i % 2 === 0;

            // Bar heights in px (pct × BAR_ZONE_H / 100)
            const posBarH = (d.barPct / 100) * BAR_ZONE_H;
            const negBarH = (d.negPct / 100) * BAR_ZONE_H;

            return (
              <div key={i}
                data-col="true"
                data-positive={String(isPos)}
                onClick={() => {
                  onSel(active ? null : `c${i}`);
                  if (onYearSelect) {
                    onYearSelect(d);
                  }
                }}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={(e) => handleDrop(e, d.year)}
                onDragLeave={handleDragLeave}
                style={{
                  width: COL_W, flexShrink:0, cursor:"pointer",
                  borderRadius:10, paddingTop:8, paddingBottom:8,
                  background: dragOverIndex === i ? '#fff3cd' : active ? G2_ACTIVE : "transparent",
                  border: dragOverIndex === i ? '2px dashed #ff9800' : '2px solid transparent',
                  display:"flex", flexDirection:"column", alignItems:"center",
                  transition:"background 0.15s ease, border 0.15s ease",
                  boxShadow: dragOverIndex === i ? '0 0 12px rgba(255, 152, 0, 0.4)' : 'none',
                  position: 'relative',
                }}
                onMouseEnter={e => { 
                  if (!isDragging.current) {
                    e.currentTarget.style.background = dragOverIndex === i ? '#fff3cd' : active ? G2_ACTIVE : G2_HOVER;
                    // Show drop hint on hover
                    if (!active && !dragOverIndex) {
                      e.currentTarget.style.border = '1px dashed #ccc';
                    }
                  }
                }}
                onMouseLeave={e => { 
                  if (!isDragging.current) {
                    e.currentTarget.style.background = dragOverIndex === i ? '#fff3cd' : active ? G2_ACTIVE : "transparent";
                    if (!active && !dragOverIndex) {
                      e.currentTarget.style.border = '2px solid transparent';
                    }
                  }
                }}
              >

                {/* Drop indicator overlay */}
                {dragOverIndex === i && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255, 152, 0, 0.9)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    pointerEvents: 'none',
                    zIndex: 10,
                    whiteSpace: 'nowrap'
                  }}>
                    Drop here
                  </div>
                )}

                {/* ── POSITIVE BAR ZONE (12rem, bars grow from bottom) ── */}
                <div style={{
                  width:"100%", height:BAR_ZONE_H, paddingBottom:12, paddingLeft:12, paddingRight:12, paddingTop:4,
                  display:"flex", alignItems:"flex-end", justifyContent:"center",
                  position:"relative",
                }}>
                  {/* Filled bar */}
                  <div style={{
                    width:BAR_W, height:posBarH,
                    background: isPos ? G2_POS_GR : "transparent",
                    borderRadius:4, position:"absolute", bottom:12,
                    transition:"height 0.25s linear",
                    overflow:"hidden",
                  }} />
                </div>

                {/* ── VALUE LABEL ROWS (staggered even/odd) ── */}
                {/* Even: value on top row */}
                {isEven ? (
                  <>
                    <div style={{ width:COL_W, height:VAL_H_TOP, display:"flex", alignItems:"center", justifyContent:"center" , position:"relative" , zIndex:1}}>  
                      <span style={{
                        fontWeight:700, fontSize:"0.75rem", whiteSpace:"nowrap",
                        color: active ? "#fff" : (isPos ? G2_POS : G2_NEG),
                        background: active ? (isPos ? G2_POS : G2_NEG) : "#fff",
                        borderRadius:10, padding:"0 6px",
                      }}>
                        {d.value} 
                      </span>
                    </div>
                    <div style={{ width:COL_W, height:VAL_H_BOT }} />
                  </>
                ) : (
                  /* Odd: value on bottom row */
                  <>
                    <div style={{ width:COL_W, height:VAL_H_TOP }} />
                    <div style={{ width:COL_W, height:VAL_H_BOT, display:"flex", alignItems:"center", justifyContent:"center" , position:"relative", zIndex:1 }}>
                      <span style={{
                        fontWeight:700, fontSize:"0.75rem", whiteSpace:"nowrap",
                        color: active ? "#fff" : (isPos ? G2_POS : G2_NEG),
                        background: active ? (isPos ? G2_POS : G2_NEG) : "#fff",
                        borderRadius:10, padding:"0 6px",
                      }}>
                        {d.value} 
                      </span>
                    </div>
                  </>
                )}

                {/* ── YEAR ROW with stems ── */}
                <div style={{
                  width:"100%", height:YEAR_ROW_H,
                  background: G2_YEAR,
                  position:"relative", textAlign:"center",
                  borderRadius: i === 0 ? "8px 0 0 8px" : i === cashflowData.length-1 ? "0 8px 8px 0" : 0,
                }}>
                  {/* Positive line: goes UP (bottom:0, visible only when pos) */}
                  {isPos && (
                    <div style={{
                      position:"absolute", bottom:0, left:0, right:0, margin:"auto",
                      width:STEM_W, height:POS_LINE_H,
                      background: G2_POS,
                    }} />
                  )}
                  {/* Negative lines: go UP (bottom:0, visible only when neg) */}
                  {!isPos && (
                    <div style={{
                      position:"absolute", bottom:0, left:0, right:0, margin:"auto",
                      width:STEM_W,
                      height: isEven ? NEG_LINE_T_EVEN : NEG_LINE_T_ODD,
                      background: G2_NEG,
                    }} />
                  )}
                  {/* Negative line: goes DOWN (top:0, visible only when neg) */}
                  {!isPos && (
                    <div style={{
                      position:"absolute", top:0, left:0, right:0, margin:"auto",
                      width:STEM_W, height:NEG_LINE_B,
                      background: G2_NEG,
                    }} />
                  )}
                  {/* Year pill */}
                  <div style={{
                    position:"absolute", top:"-40%", left:0, right:0, margin:"auto",
                    display:"flex", justifyContent:"center",
                  }}>
                    <span style={{
                      background:"#fff", color: active ? (isPos ? G2_POS : G2_NEG) : "#0E519B",
                      fontWeight:700, fontSize:"0.8rem",
                      padding:"0 12px", borderRadius:10,
                      border:`2px solid ${G2_YEAR}`,
                      boxShadow:"0 1px 4px rgba(14,81,155,0.20)",
                      whiteSpace:"nowrap",
                    }}>
                      {d.year}
                    </span>
                  </div>
                </div>

                {/* ── NEGATIVE BAR ZONE (12rem, bars grow from top) ── */}
                <div style={{
                  width:"100%", height:BAR_ZONE_H, paddingTop:16, paddingLeft:12, paddingRight:12, paddingBottom:8,
                  display:"flex", alignItems:"flex-start", justifyContent:"center",
                  position:"relative",
                }}>
                  {/* Filled bar */}
                  <div style={{
                    width:BAR_W, height: !isPos ? negBarH : 0,
                    background: !isPos ? G2_NEG_GR : "transparent",
                    borderRadius:4, position:"absolute", top:16,
                    transition:"height 0.25s linear",
                  }} />
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────
const FundGraph: React.FC<FundGraphProps> = ({ association, reserveStudy, onYearSelect, excelData, viewMode = 'graph', feeOverride, totalHousingUnits, yearPriorityConfigs = {}, onYearPriorityUpdate, currentYear }) => {
  const [sel1, setSel1] = useState<string | null>(null);
  const [sel2, setSel2] = useState<string | null>(null);
  const [calcOpenRow, setCalcOpenRow] = useState<number | null>(null);
  const [specialAssessments, setSpecialAssessments] = useState<Record<number, { year: number; percentage: number; amount: number }>>({});
  const [loans, setLoans] = useState<Record<number, { year: number; percentage: number; amount: number; bank: string; terms: string; interestRate: number }>>({});
  const listTableScrollRef = useRef<HTMLDivElement>(null);
  const prevExcelDataRef = useRef<any>(null);

  // Unique key derived from excelData identity — used to trigger scroll-reset in sub-graphs
  const dataResetKey = excelData?.timestamp ?? excelData?.studyId ?? excelData;

  React.useEffect(() => {
    console.log('[FundGraph.tsx] excelData changed, resetting selections');
    setSel1(null);
    setSel2(null);
    setSpecialAssessments({});
    setLoans({});
    if (listTableScrollRef.current) {
      listTableScrollRef.current.scrollLeft = 0;
    }
  }, [excelData]);
  
  const { cashflowData, feeData } = React.useMemo(() => {
    console.log('[FundGraph.tsx] Recalculating cashflowData with advanced analytics');
    console.log('[FundGraph.tsx] Complete excelData received:', excelData);
    
    if (!excelData?.data) {
      return { cashflowData: [], feeData: [] };
    }
    
    // Handle nested data structure from SimulatorSubheader
    const actualData = excelData.data.data || excelData.data;
    const config = actualData.config || {};
    const items = actualData.items || [];
    
    console.log('[FundGraph.tsx] Extracted config:', config);
    console.log('[FundGraph.tsx] Extracted items count:', items.length);
    console.log('[FundGraph.tsx] Sample item for analysis:', items[0]);
    
    const financialConfig: FinancialConfig = {
      startingBalance: config['Beginning Reserve Funds (Dollar Amount)'] || 0,
      // Base fee — will be overridden below if optimizeAll is active
      monthlyFeePerUnit: feeOverride?.monthlyFeePerUnit != null
        ? feeOverride.monthlyFeePerUnit
        : (config['Average Monthly Fee per Unit'] || 0),
      totalUnits: totalHousingUnits !== null && totalHousingUnits !== undefined 
        ? totalHousingUnits 
        : (config['Total Number of Housing Units'] || 1),
      // If user has set an inflation rate override, convert % → decimal
      inflationRate: feeOverride?.inflationRate != null
        ? feeOverride.inflationRate / 100
        : (config['Inflation Rate Used in the Report'] || 0) / 100,
      investmentRate: (config['Suggested Rate of Return on Investments'] || 0) / 100,
      currentYear: config['Beginning Fiscal Year of the Report'] || new Date().getFullYear(),
      yearsToProject: config['Number of Years Covered in the Report'] || 30,
      // Fee adjustment settings — wired through from the popup
      safetyNet:           feeOverride?.safetyNet,
      cashReserveThreshold: feeOverride?.cashReserveThreshold,
      maxAnnualPctIncrease: feeOverride?.maxPctIncrease,
      customRange:         feeOverride?.customRange,
      gradualRange:        feeOverride?.gradualRange,
    };

    const reserveItems: ReserveItem[] = items.map((item: any) => ({
      itemName: item.itemName,
      expectedLife: Number(item.expectedLife) || 0,
      remainingLife: Number(item.remainingLife) || 0,
      replacementCost: Number(item.replacementCost) || 0,
      sirsType: Number(item.sirsType) || 0
    }));

    // ── OPTIMIZE ALL: compute the minimum fee that keeps balance ≥ safetyNet (or 0) across all years
    // Store it once so we can (a) use it in activeConfig and (b) attach it to every data row without
    // running the 50-iteration binary search a second time.
    const optimalFee = calculateOptimalFee(financialConfig, reserveItems);
    const activeConfig = feeOverride?.optimizeAll
      ? { ...financialConfig, monthlyFeePerUnit: optimalFee }
      : financialConfig;
    
    console.log('[FundGraph.tsx] Financial Config:', activeConfig);
    console.log('[FundGraph.tsx] Reserve Items:', reserveItems.length);
    console.log('[FundGraph.tsx] Optimize All:', feeOverride?.optimizeAll, '| Effective fee:', activeConfig.monthlyFeePerUnit);
    console.log('[FundGraph.tsx] Using yearPriorityConfigs:', Object.keys(yearPriorityConfigs || {}).length, 'years');
    
    const { projections, metrics } = calculateFinancialProjections(activeConfig, reserveItems, yearPriorityConfigs);
    const healthScore = calculateHealthScore(projections);
    // optimalFee already computed above — no second binary search needed
    
    // Expose projections to window for external checks (e.g., surplus checking in SimulatorSubheader)
    (window as any).__fundGraphProjections = projections;
    console.log('[FundGraph.tsx] Exposed projections to window.__fundGraphProjections, count:', projections.length);
    
    console.log('[FundGraph.tsx] Financial Metrics:', metrics);
    console.log('[FundGraph.tsx] Health Score:', healthScore.toFixed(2));
    console.log('[FundGraph.tsx] Optimal Fee:', optimalFee);
    
    const balances = projections.map(p => p.closingBalance);
    const maxAbsBalance = Math.max(...balances.map(b => Math.abs(b)));
    
    const generatedCashflowData = projections.map((proj, i) => {
      const isPositive = proj.closingBalance >= 0;
      const absBalance = Math.abs(proj.closingBalance);
      const percentage = maxAbsBalance > 0 ? Math.min(100, (absBalance / maxAbsBalance) * 100) : 1;
      
      // Apply special assessment if allocated for this year
      let adjustedClosingBalance = proj.closingBalance;
      const assessment = specialAssessments[proj.year];
      const loan = loans[proj.year];
      
      if (assessment && assessment.amount > 0) {
        adjustedClosingBalance = proj.closingBalance + assessment.amount;
        console.log(`[FundGraph] Year ${proj.year}: Applied special assessment $${assessment.amount.toLocaleString()} (${assessment.percentage}%)`);
      }
      
      if (loan && loan.amount > 0) {
        adjustedClosingBalance = adjustedClosingBalance + loan.amount;
        console.log(`[FundGraph] Year ${proj.year}: Applied loan $${loan.amount.toLocaleString()} (${loan.percentage}%) from ${loan.bank} at ${loan.interestRate}%`);
      }
      
      const finalIsPositive = adjustedClosingBalance >= 0;
      const finalAbsBalance = Math.abs(adjustedClosingBalance);
      const finalPercentage = maxAbsBalance > 0 ? Math.min(100, (finalAbsBalance / maxAbsBalance) * 100) : 1;
      
      return {
        year: proj.year,
        value: `${adjustedClosingBalance >= 0 ? '$' : '-$'}${Math.abs(adjustedClosingBalance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        pos: finalIsPositive,
        warning: finalIsPositive && activeConfig.cashReserveThreshold != null && adjustedClosingBalance < activeConfig.cashReserveThreshold,
        barPct: finalIsPositive ? Math.max(1, Math.round(finalPercentage)) : 1,
        negPct: !finalIsPositive ? Math.max(1, Math.round(finalPercentage)) : 1,
        projection: { ...proj, closingBalance: adjustedClosingBalance, originalClosingBalance: proj.closingBalance },
        specialAssessment: assessment,
        loan: loan,
        healthScore,
        optimalFee,
        metrics,
        studyName: excelData.reserveStudy || excelData.studyName || 'Reserve Study'
      };
    });
    
    // Generate fee collection data synchronized with cashflow years.
    // Derive values directly from proj.contributions (the ACTUAL simulated contribution)
    // so Graph 1 always matches the cashflow projection — including custom range, gradual ramp,
    // and maxAnnualPctIncrease overrides.
    const maxContribution = Math.max(...projections.map(p => p.contributions), 1);
    // Base (original) fee per unit from the study config — used as 0% reference
    const baseFeePerUnit = config['Average Monthly Fee per Unit'] || 1;
    const totalUnitsForFee = activeConfig.totalUnits || 1;
    const generatedFeeData = projections.map((proj) => {
      const annualContrib = proj.contributions;               // already the inflation/range-adjusted annual total
      const monthlyTotal = annualContrib / 12;               // total monthly fee across all units
      // % change of this year’s per-unit fee vs. the original study fee per unit
      const feePerUnit = monthlyTotal / totalUnitsForFee;
      const feeChangePercent = baseFeePerUnit > 0
        ? Math.round(((feePerUnit - baseFeePerUnit) / baseFeePerUnit) * 100)
        : 0;
      const barHeight = Math.max(4, Math.round((annualContrib / maxContribution) * 60));

      return {
        year: proj.year,
        feeValue: `$${Math.round(monthlyTotal).toLocaleString()}`,
        percentage: feeChangePercent,
        height: barHeight,
      };
    });
    
    console.log('[FundGraph.tsx] Generated cashflow data with analytics:', generatedCashflowData.slice(0, 3));
    console.log('[FundGraph.tsx] Generated fee data synchronized:', generatedFeeData.slice(0, 3));
    
    // Expose cashflowData to window for external access
    (window as any).__fundGraphCashflowData = generatedCashflowData;
    console.log('[FundGraph.tsx] Exposed cashflowData to window.__fundGraphCashflowData, count:', generatedCashflowData.length);
    
    return { cashflowData: generatedCashflowData, feeData: generatedFeeData };
  }, [excelData, feeOverride, totalHousingUnits, yearPriorityConfigs, specialAssessments, loans]);

  // Auto-select the first year ONLY when a new study is loaded (excelData changes).
  // Don't auto-select when yearPriorityConfigs changes - user's current selection should persist.
  React.useEffect(() => {
    // Check if excelData changed (comparing by reference via prevExcelDataRef)
    if (excelData !== prevExcelDataRef.current) {
      prevExcelDataRef.current = excelData;
      
      // Only auto-select if we have data and a callback
      if (cashflowData.length > 0 && onYearSelect) {
        console.log('[FundGraph] Auto-selecting first year for new study');
        setSel1('f0');
        setSel2('c0');
        onYearSelect(cashflowData[0]);
      }
    }
  }, [excelData, cashflowData, onYearSelect]);

  // Listen for special assessments applied
  React.useEffect(() => {
    const handleSpecialAssessments = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { allocations } = customEvent.detail;
      console.log('[FundGraph] Special assessments applied:', allocations);
      setSpecialAssessments(allocations);
    };

    const handleLoans = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { loans } = customEvent.detail;
      console.log('[FundGraph] Loans applied:', loans);
      setLoans(loans);
    };

    window.addEventListener('specialAssessmentsApplied', handleSpecialAssessments);
    window.addEventListener('loansApplied', handleLoans);
    return () => {
      window.removeEventListener('specialAssessmentsApplied', handleSpecialAssessments);
      window.removeEventListener('loansApplied', handleLoans);
    };
  }, []);

  // Listen for year priority changes and log (graph auto-recalculates via useMemo dependency)
  React.useEffect(() => {
    const handleYearPrioritiesChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { year, priorities, budgetAllocation } = customEvent.detail;
      
      console.log('[FundGraph] yearPrioritiesChanged event received:', {
        year,
        prioritiesCount: priorities.length,
        budgetAllocationCount: Object.keys(budgetAllocation || {}).length,
      });

      // Note: yearPriorityConfigs is passed as prop, so FundGraph
      // will automatically recalculate when parent passes updated value
      // This listener is just for visibility
    };

    const handleSelectYearFromPopup = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { year, yearIndex } = customEvent.detail;
      
      console.log('[FundGraph] selectYearFromPopup event received:', { year, yearIndex });
      
      // Find the corresponding cashflow data for this year
      const cashflowIndex = cashflowData.findIndex(c => c.year === year);
      if (cashflowIndex >= 0) {
        console.log('[FundGraph] Selecting year from popup:', { year, cashflowIndex });
        setSel1(`f${cashflowIndex}`);
        setSel2(`c${cashflowIndex}`);
        
        if (onYearSelect) {
          onYearSelect(cashflowData[cashflowIndex]);
        }
      }
    };

    window.addEventListener('yearPrioritiesChanged', handleYearPrioritiesChanged);
    window.addEventListener('selectYearFromPopup', handleSelectYearFromPopup);

    return () => {
      window.removeEventListener('yearPrioritiesChanged', handleYearPrioritiesChanged);
      window.removeEventListener('selectYearFromPopup', handleSelectYearFromPopup);
    };
  }, [cashflowData, onYearSelect]);

  const d2 = sel2 !== null ? cashflowData[parseInt(sel2.replace("c",""))] : null;

  // List view - only show Cashflow Simulator Data table
  if (viewMode === 'list') {
    return (
      <div style={{ fontFamily: "system-ui,sans-serif", background: "white", minHeight: "calc(100vh - 100px)", padding: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>Cashflow Simulator Data ({cashflowData[0]?.studyName || 'Reserve Study'})</h2>
        <div ref={listTableScrollRef} style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Year</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Opening Balance</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Contributions</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Interest</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Expenses</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Closing Balance</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {cashflowData.map((data: any, index) => {
                const projection = data.projection;
                
                return (
                  <React.Fragment key={index}>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: '500', color: '#1f2937' }}>{data.year}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>
                      {projection ? `$${projection.openingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#10b981' }}>
                      {projection ? `$${projection.contributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#3b82f6' }}>
                      {projection ? `$${projection.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#ef4444' }}>
                      {projection ? `$${projection.expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: data.pos ? '#10b981' : '#ef4444' }}>{data.value}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: '500',
                          background: data.pos ? '#dcfce7' : '#fee2e2',
                          color: data.pos ? '#166534' : '#991b1b'
                        }}>
                          {data.pos ? 'Surplus' : 'Deficit'}
                        </span>
                        <button
                          title="Show calculation breakdown"
                          onClick={() => setCalcOpenRow(calcOpenRow === index ? null : index)}
                          style={{
                            background: calcOpenRow === index ? '#eff6ff' : 'transparent',
                            border: `1px solid ${calcOpenRow === index ? '#3b82f6' : '#d1d5db'}`,
                            borderRadius: '6px',
                            padding: '3px 6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: calcOpenRow === index ? '#2563eb' : '#6b7280',
                            transition: 'all 0.15s',
                          }}
                        >
                          {/* Calculator SVG icon */}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2"/>
                            <line x1="8" y1="6" x2="16" y2="6"/>
                            <line x1="8" y1="10" x2="10" y2="10"/>
                            <line x1="14" y1="10" x2="16" y2="10"/>
                            <line x1="8" y1="14" x2="10" y2="14"/>
                            <line x1="14" y1="14" x2="16" y2="14"/>
                            <line x1="8" y1="18" x2="16" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* ── Calculation breakdown row ── */}
                  {calcOpenRow === index && projection && (
                    <tr style={{ background: '#f8faff' }}>
                      <td colSpan={7} style={{ padding: '0 16px 16px 16px', borderBottom: '2px solid #bfdbfe' }}>
                        <div style={{
                          background: 'white',
                          border: '1px solid #bfdbfe',
                          borderRadius: '10px',
                          padding: '16px 20px',
                          maxWidth: '520px',
                          marginLeft: 'auto',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="4" y="2" width="16" height="20" rx="2"/>
                              <line x1="8" y1="6" x2="16" y2="6"/>
                              <line x1="8" y1="10" x2="10" y2="10"/>
                              <line x1="14" y1="10" x2="16" y2="10"/>
                              <line x1="8" y1="14" x2="10" y2="14"/>
                              <line x1="14" y1="14" x2="16" y2="14"/>
                              <line x1="8" y1="18" x2="16" y2="18"/>
                            </svg>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af' }}>Calculation Breakdown — {data.year}</span>
                          </div>
                          {/* Formula rows */}
                          {[
                            { label: 'Opening Balance', sign: '', value: projection.openingBalance, color: '#6b7280', bold: false },
                            { label: 'Annual Contributions', sign: '+', value: projection.contributions, color: '#10b981', bold: false },
                            { label: 'Interest Earned', sign: '+', value: projection.interest, color: '#3b82f6', bold: false },
                            { label: 'Reserve Expenses', sign: '−', value: projection.expenses, color: '#ef4444', bold: false },
                          ].map(({ label, sign, value, color, bold }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px dashed #e5e7eb' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {sign ? (
                                  <span style={{ width: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color }}>{sign}</span>
                                ) : (
                                  <span style={{ width: '16px' }} />
                                )}
                                <span style={{ fontSize: '12px', color: '#374151', fontWeight: bold ? '600' : '400' }}>{label}</span>
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: bold ? '700' : '500', color }}>
                                ${Math.round(value).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          {/* Divider + result */}
                          <div style={{ borderTop: '2px solid #1e40af', marginTop: '6px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>=</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af' }}>Closing Balance</span>
                            </div>
                            <span style={{ fontSize: '15px', fontWeight: '800', color: data.pos ? '#166534' : '#991b1b' }}>
                              ${Math.round(projection.closingBalance ?? (projection.openingBalance + projection.contributions + projection.interest - projection.expenses)).toLocaleString()}
                            </span>
                          </div>
                          {/* Status verdict */}
                          <div style={{ marginTop: '10px', padding: '7px 10px', borderRadius: '8px', background: data.pos ? '#f0fdf4' : '#fef2f2', border: `1px solid ${data.pos ? '#86efac' : '#fca5a5'}` }}>
                            <span style={{ fontSize: '11px', color: data.pos ? '#166534' : '#991b1b', fontWeight: '600' }}>
                              {data.pos
                                ? '✓ Surplus — reserve fund stays positive this year'
                                : '✗ Deficit — reserve fund balance goes negative this year'}
                            </span>
                            {data.warning && (
                              <div style={{ fontSize: '11px', color: '#92400e', marginTop: '3px' }}>
                                ⚠ Balance is below the low-balance alert threshold
                              </div>
                            )}
                          </div>
                          {/* Formula reminder */}
                          <div style={{ marginTop: '8px', fontSize: '10px', color: '#9ca3af', textAlign: 'right' }}>
                            Opening + Contributions + Interest − Expenses = Closing Balance
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Graph view - show full interface with graphs and table
  return (
    <div style={{ fontFamily:"system-ui,sans-serif", background:"white", minHeight:"calc(100vh - 100px)" }}>
      <div style={{ background:"#fff", margin:"0px auto",    overflow:"hidden" }}>

        <Graph1 sel={sel1} resetKey={dataResetKey} onSel={setSel1} onYearSelect={(yearData) => {
          // Find matching cashflow data for the same year
          const cashflowIndex = cashflowData.findIndex(c => c.year === yearData.year);
          if (cashflowIndex >= 0) {
            setSel2(`c${cashflowIndex}`);
            // Always pass cashflow data to left panel
            if (onYearSelect) {
              onYearSelect(cashflowData[cashflowIndex]);
            }
          }
        }} feeData={feeData} />

     

        <Graph2 sel={sel2} resetKey={dataResetKey} onSel={setSel2} onYearSelect={(yearData) => {
          // Find matching fee data index for the same year
          const feeIndex = feeData.findIndex(f => f.year === yearData.year);
          if (feeIndex >= 0) {
            setSel1(`f${feeIndex}`);
          }
          if (onYearSelect) {
            onYearSelect(yearData);
          }
        }} cashflowData={cashflowData} onYearPriorityUpdate={onYearPriorityUpdate} currentYear={currentYear} yearPriorityConfigs={yearPriorityConfigs} />

        {/* <div style={{ padding:"8px 16px 14px", borderTop:"1px solid #f0f0f0", display:"flex", gap:20, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:12, height:12, background:GREEN, borderRadius:2 }} />
            <span style={{ fontSize:11, color:"#6b7280" }}>Positive cash flow</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:12, height:12, background:RED, borderRadius:2 }} />
            <span style={{ fontSize:11, color:"#6b7280" }}>Deficit period</span>
          </div>
          <span style={{ marginLeft:"auto", fontSize:11, color:"#9ca3af" }}>Click any column to inspect · Scroll horizontally to see all years</span>
        </div>
        
        <div style={{ padding: '16px', background: '#f9fafb', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
            Association: <span style={{ color: '#1f2937', fontWeight: '500' }}>{association || 'Not selected'}</span>
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Reserve Study: <span style={{ color: '#1f2937', fontWeight: '500' }}>{reserveStudy || 'Not selected'}</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default FundGraph;