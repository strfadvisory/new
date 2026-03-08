import { useState } from "react";
import React from "react";
import { calculateFinancialProjections, calculateHealthScore, calculateOptimalFee, FinancialConfig, ReserveItem } from '../utils/financialCalculations';

interface FundGraphProps {
  association?: string;
  reserveStudy?: string;
  onYearSelect?: (yearData: any) => void;
  excelData?: any;
  viewMode?: 'graph' | 'list';
}

// ─────────────────────────────────────────────────────────────────
// EXACT DATA from HTML source
// positive-bar height% × 12rem = actual px bar height
// negative-bar height% × 12rem = actual px bar height
// ─────────────────────────────────────────────────────────────────
const CASHFLOW = [
  { year:2022, value:"$1,612,204",  pos:true,  barPct:16,  negPct:1  },
  { year:2023, value:"$1,960,192",  pos:true,  barPct:21,  negPct:1  },
  { year:2024, value:"$1,832,520",  pos:true,  barPct:19,  negPct:1  },
  { year:2025, value:"$2,189,321",  pos:true,  barPct:25,  negPct:1  },
  { year:2026, value:"$2,516,298",  pos:true,  barPct:30,  negPct:1  },
  { year:2027, value:"$2,205,418",  pos:true,  barPct:25,  negPct:1  },
  { year:2028, value:"$2,420,355",  pos:true,  barPct:29,  negPct:1  },
  { year:2029, value:"$2,675,869",  pos:true,  barPct:33,  negPct:1  },
  { year:2030, value:"$1,451,076",  pos:true,  barPct:13,  negPct:1  },
  { year:2031, value:"$1,436,107",  pos:true,  barPct:13,  negPct:1  },
  { year:2032, value:"$1,123,095",  pos:true,  barPct:8,   negPct:1  },
  { year:2033, value:"-$179,405",   pos:false, barPct:1,   negPct:1  },
  { year:2034, value:"-$30,339",    pos:false, barPct:1,   negPct:1  },
  { year:2035, value:"$129,961",    pos:true,  barPct:1,   negPct:1  },
  { year:2036, value:"-$1,157,289", pos:false, barPct:1,   negPct:8  },
  { year:2037, value:"-$1,093,889", pos:false, barPct:1,   negPct:7  },
  { year:2038, value:"-$948,789",   pos:false, barPct:1,   negPct:5  },
  { year:2039, value:"-$2,328,289", pos:false, barPct:1,   negPct:27 },
  { year:2040, value:"-$2,444,339", pos:false, barPct:1,   negPct:29 },
  { year:2041, value:"-$2,280,839", pos:false, barPct:1,   negPct:26 },
  { year:2042, value:"-$4,035,393", pos:false, barPct:1,   negPct:55 },
  { year:2043, value:"-$3,885,093", pos:false, barPct:1,   negPct:52 },
  { year:2044, value:"-$3,745,543", pos:false, barPct:1,   negPct:50 },
  { year:2045, value:"-$5,012,043", pos:false, barPct:1,   negPct:71 },
  { year:2046, value:"-$4,862,977", pos:false, barPct:1,   negPct:68 },
  { year:2047, value:"-$4,825,577", pos:false, barPct:1,   negPct:68 },
  { year:2048, value:"-$6,112,827", pos:false, barPct:1,   negPct:88 },
  { year:2049, value:"-$6,184,127", pos:false, barPct:1,   negPct:90 },
  { year:2050, value:"-$6,027,027", pos:false, barPct:1,   negPct:87 },
];

// ─────────────────────────────────────────────────────────────────
// EXACT COLORS from CSS
// ─────────────────────────────────────────────────────────────────
const GREEN      = "#4CAF50";   // positive bar + line
const GREEN_DK   = "#155217";   // ghost outline
const RED        = "#dc3545";   // --danger: negative bar + lines
const RED_DK     = "#641a1a";   // ghost outline
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
function Graph1({ sel, onSel, onYearSelect, feeData }: { sel: string | null; onSel: (value: string | null) => void; onYearSelect?: (yearData: any) => void; feeData: any[] }) {
  return (
    <div style={{ borderBottom:"2px solid #e8e8e8", background:"#fff" }}>
      <div style={{ padding:"12px 16px 6px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontWeight:700, fontSize:15, color:"#111",  }}>Monthly fee collection</span>
        <span style={{ color:"#bbb", fontSize:16, cursor:"pointer", letterSpacing:3 }}>•••</span>
      </div>
      <div style={{ overflowX:"auto" }}>
        <div style={{ display:"flex", minWidth:"max-content", padding:"0 16px" }}>
          {feeData.map((data, i) => {
            const active = sel === `f${i}`;
            const h = data.height ?? 28;
            return (
              <div key={i} onClick={() => {
                onSel(active ? null : `f${i}`);
                if (onYearSelect) {
                  onYearSelect({ year: data.year, value: data.feeValue, pos: true });
                }
              }}
                style={{ width:COL_W, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer", background:active?"#ddd":"transparent", borderRadius:6 }}>
                <div style={{ height:16, display:"flex", alignItems:"center", justifyContent:"center", marginTop:6 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:GREEN }}>{data.percentage}%</span>
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
function Graph2({ sel, onSel, onYearSelect, cashflowData = CASHFLOW }: { sel: string | null; onSel: (value: string | null) => void; onYearSelect?: (yearData: any) => void; cashflowData?: any[] }) {
  return (
    <div style={{ background:"#fff" }}>
      <div style={{ display:"flex", alignItems:"center", padding:"12px 16px 4px", gap:8, borderTop:"1px solid #f0f0f0" }}>
        <span style={{ fontWeight:700, fontSize:15, color:"#111", minWidth:190 }}>Cashflow Simulator</span>
        <span style={{ color:"#bbb", fontSize:16, cursor:"pointer", letterSpacing:3 }}>•••</span>
        <div style={{ flex:1, display:"flex", justifyContent:"center" }}>
          <span style={{ fontWeight:700, fontSize:15, color:"#111" }}>How to clear deficit</span>
        </div>
      </div>

      <div style={{ overflowX:"auto", padding:"0 16px 28px" }}>
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
                data-positive={String(isPos)}
                onClick={() => {
                  onSel(active ? null : `c${i}`);
                  if (onYearSelect) {
                    onYearSelect(d);
                  }
                }}
                style={{
                  width: COL_W, flexShrink:0, cursor:"pointer",
                  borderRadius:10, paddingTop:8, paddingBottom:8,
                  background: active ? "#ccc" : "transparent",
                  display:"flex", flexDirection:"column", alignItems:"center",
                }}
                onMouseEnter={e => e.currentTarget.style.background = active ? "#ccc" : "#eee"}
                onMouseLeave={e => e.currentTarget.style.background = active ? "#ccc" : "transparent"}
              >

                {/* ── POSITIVE BAR ZONE (12rem, bars grow from bottom) ── */}
                <div style={{
                  width:"100%", height:BAR_ZONE_H, paddingBottom:12, paddingLeft:12, paddingRight:12, paddingTop:4,
                  display:"flex", alignItems:"flex-end", justifyContent:"center",
                  position:"relative",
                }}>
                  {/* Ghost outline (always shown for pos) */}
                  {isPos && (
                    <div style={{
                      width:BAR_W, height:posBarH,
                      outline:`3px solid ${GREEN_DK}`,
                      borderRadius:8, position:"absolute", bottom:12,
                    }} />
                  )}
                  {/* Filled bar */}
                  <div style={{
                    width:BAR_W, height:posBarH,
                    background: isPos ? GREEN : "transparent",
                    borderRadius:8, position:"absolute", bottom:12,
                    transition:"height 0.25s linear",
                    overflow:"hidden",
                  }} />
                </div>

                {/* ── VALUE LABEL ROWS (staggered even/odd) ── */}
                {/* Even: value on top row */}
                {isEven ? (
                  <>
                    <div style={{ width:COL_W, height:VAL_H_TOP, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{
                        fontWeight:700, fontSize:"0.75rem", whiteSpace:"nowrap",
                        color: active ? "#fff" : (isPos ? GREEN : RED),
                        background: active ? (isPos ? GREEN : RED) : "#fff",
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
                    <div style={{ width:COL_W, height:VAL_H_BOT, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{
                        fontWeight:700, fontSize:"0.75rem", whiteSpace:"nowrap",
                        color: active ? "#fff" : (isPos ? GREEN : RED),
                        background: active ? (isPos ? GREEN : RED) : "#fff",
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
                  background:"#9e9e9e",
                  position:"relative", textAlign:"center",
                  borderRadius: i === 0 ? "8px 0 0 8px" : i === cashflowData.length-1 ? "0 8px 8px 0" : 0,
                }}>
                  {/* Positive line: goes UP (bottom:0, visible only when pos) */}
                  {isPos && (
                    <div style={{
                      position:"absolute", bottom:0, left:0, right:0, margin:"auto",
                      width:STEM_W, height:POS_LINE_H,
                      background:GREEN,
                    }} />
                  )}
                  {/* Negative lines: go UP (bottom:0, visible only when neg) */}
                  {!isPos && (
                    <div style={{
                      position:"absolute", bottom:0, left:0, right:0, margin:"auto",
                      width:STEM_W,
                      height: isEven ? NEG_LINE_T_EVEN : NEG_LINE_T_ODD,
                      background:RED,
                    }} />
                  )}
                  {/* Negative line: goes DOWN (top:0, visible only when neg) */}
                  {!isPos && (
                    <div style={{
                      position:"absolute", top:0, left:0, right:0, margin:"auto",
                      width:STEM_W, height:NEG_LINE_B,
                      background:RED,
                    }} />
                  )}
                  {/* Year pill */}
                  <div style={{
                    position:"absolute", top:"-40%", left:0, right:0, margin:"auto",
                    display:"flex", justifyContent:"center",
                  }}>
                    <span style={{
                      background:"#fff", color: active ? (isPos?GREEN:RED) : "#000",
                      fontWeight:700, fontSize:"0.8rem",
                      padding:"0 12px", borderRadius:10,
                      border:"3px solid #9e9e9e",
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
                  {/* Ghost outline */}
                  {!isPos && negBarH > 8 && (
                    <div style={{
                      width:BAR_W, height:negBarH,
                      outline:`3px solid ${RED_DK}`,
                      borderRadius:8, position:"absolute", top:16,
                    }} />
                  )}
                  {/* Filled bar */}
                  <div style={{
                    width:BAR_W, height: !isPos ? negBarH : 0,
                    background: !isPos ? RED : "transparent",
                    borderRadius:8, position:"absolute", top:16,
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
const FundGraph: React.FC<FundGraphProps> = ({ association, reserveStudy, onYearSelect, excelData, viewMode = 'graph' }) => {
  const [sel1, setSel1] = useState<string | null>(null);
  const [sel2, setSel2] = useState<string | null>(null);
  
  React.useEffect(() => {
    console.log('[FundGraph.tsx] excelData changed, resetting selections');
    setSel1(null);
    setSel2(null);
  }, [excelData]);
  
  const { cashflowData, feeData } = React.useMemo(() => {
    console.log('[FundGraph.tsx] Recalculating cashflowData with advanced analytics');
    console.log('[FundGraph.tsx] Complete excelData received:', excelData);
    
    if (!excelData?.data) {
      console.log('[FundGraph.tsx] No excelData, using default CASHFLOW');
      const defaultFeeData = Array.from({ length: 25 }, (_, i) => ({
        year: 2025 + (i % 5),
        feeValue: '$150',
        percentage: 15,
        height: 28 + (i % 3) * 10
      }));
      return { cashflowData: CASHFLOW, feeData: defaultFeeData };
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
      monthlyFeePerUnit: config['Average Monthly Fee per Unit'] || 0,
      totalUnits: config['Total Number of Housing Units'] || 1,
      inflationRate: (config['Inflation Rate Used in the Report'] || 0) / 100,
      currentYear: config['Beginning Fiscal Year of the Report'] || new Date().getFullYear(),
      yearsToProject: 29
    };
    
    const reserveItems: ReserveItem[] = items.map((item: any) => ({
      itemName: item.itemName,
      expectedLife: item.expectedLife,
      remainingLife: item.remainingLife,
      replacementCost: item.replacementCost,
      sirsType: item.sirsType
    }));
    
    console.log('[FundGraph.tsx] Financial Config:', financialConfig);
    console.log('[FundGraph.tsx] Reserve Items:', reserveItems.length);
    
    const { projections, metrics } = calculateFinancialProjections(financialConfig, reserveItems);
    const healthScore = calculateHealthScore(projections);
    const optimalFee = calculateOptimalFee(financialConfig, reserveItems);
    
    console.log('[FundGraph.tsx] Financial Metrics:', metrics);
    console.log('[FundGraph.tsx] Health Score:', healthScore.toFixed(2));
    console.log('[FundGraph.tsx] Optimal Fee:', optimalFee);
    
    const balances = projections.map(p => p.closingBalance);
    const maxAbsBalance = Math.max(...balances.map(b => Math.abs(b)));
    
    const generatedCashflowData = projections.map((proj, i) => {
      const isPositive = proj.closingBalance >= 0;
      const absBalance = Math.abs(proj.closingBalance);
      const percentage = maxAbsBalance > 0 ? Math.min(100, (absBalance / maxAbsBalance) * 100) : 1;
      
      return {
        year: proj.year,
        value: `${proj.closingBalance >= 0 ? '$' : '-$'}${Math.abs(proj.closingBalance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        pos: isPositive,
        barPct: isPositive ? Math.max(1, Math.round(percentage)) : 1,
        negPct: !isPositive ? Math.max(1, Math.round(percentage)) : 1,
        projection: proj,
        healthScore,
        optimalFee,
        metrics,
        studyName: excelData.reserveStudy || excelData.studyName || 'Reserve Study'
      };
    });
    
    // Generate fee collection data synchronized with cashflow years
    const monthlyFee = financialConfig.monthlyFeePerUnit * financialConfig.totalUnits;
    const generatedFeeData = projections.map((proj, i) => {
      const inflatedFee = monthlyFee * Math.pow(1 + financialConfig.inflationRate, i);
      const feePercentage = i === 0 ? 15 : Math.min(25, 15 + (i * 0.5)); // Progressive increase
      const barHeight = Math.min(60, 20 + (feePercentage * 1.5)); // Scale height with percentage
      
      return {
        year: proj.year,
        feeValue: `$${Math.round(inflatedFee).toLocaleString()}`,
        percentage: Math.round(feePercentage),
        height: barHeight
      };
    });
    
    console.log('[FundGraph.tsx] Generated cashflow data with analytics:', generatedCashflowData.slice(0, 3));
    console.log('[FundGraph.tsx] Generated fee data synchronized:', generatedFeeData.slice(0, 3));
    
    return { cashflowData: generatedCashflowData, feeData: generatedFeeData };
  }, [excelData]);
  
  const d2 = sel2 !== null ? cashflowData[parseInt(sel2.replace("c",""))] : null;

  // List view - only show Cashflow Simulator Data table
  if (viewMode === 'list') {
    return (
      <div style={{ fontFamily: "system-ui,sans-serif", background: "white", minHeight: "calc(100vh - 100px)", padding: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#1f2937' }}>Cashflow Simulator Data</h2>
        <div style={{ overflowX: 'auto' }}>
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
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
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
                    </td>
                  </tr>
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

        <Graph1 sel={sel1} onSel={setSel1} onYearSelect={(yearData) => {
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

        {d2 && (
          <div style={{
            background:d2.pos?"#f0fdf4":"#fff1f2",
            borderTop:`2px solid ${d2.pos?"#86efac":"#fca5a5"}`,
            borderBottom:`2px solid ${d2.pos?"#86efac":"#fca5a5"}`,
            padding:"8px 24px", display:"flex", gap:28, alignItems:"center", flexWrap:"wrap",
          }}>
            <span style={{ fontWeight:700, fontSize:17 }}>{d2.year}</span>
            <div>
              <div style={{ fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:1 }}>Value</div>
              <div style={{ fontSize:13, fontWeight:700, color:d2.pos?GREEN:RED }}>{d2.value}</div>
            </div>
            <div>
              <div style={{ fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:1 }}>Status</div>
              <div style={{ fontSize:13, fontWeight:700 }}>{d2.pos?"✅ Surplus":"🔴 Deficit"}</div>
            </div>
            <button onClick={()=>setSel2(null)} style={{ marginLeft:"auto", background:"transparent", border:"1px solid #d1d5db", borderRadius:8, padding:"4px 14px", fontSize:12, cursor:"pointer" }}>✕ Close</button>
          </div>
        )}

        <Graph2 sel={sel2} onSel={setSel2} onYearSelect={(yearData) => {
          // Find matching fee data index for the same year
          const feeIndex = feeData.findIndex(f => f.year === yearData.year);
          if (feeIndex >= 0) {
            setSel1(`f${feeIndex}`);
          }
          if (onYearSelect) {
            onYearSelect(yearData);
          }
        }} cashflowData={cashflowData} />

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