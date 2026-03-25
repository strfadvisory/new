# Year Priority System - UX & Financial Issues - Quick Reference

## THE CORE PROBLEM (In 30 Seconds)

```
User edits expenses in Year Priority popup
       ↓
Display updates: "Year Priority: $400k"
       ↓
Graph still shows: "Funding ratio based on $1M"
       ↓
User thinks projection updated, but it HASN'T
       ↓
User makes decisions based on STALE financial data
       ↓
🔴 AUDIT RISK + INCORRECT PLANNING
```

---

## THREE SEPARATE EXPENSE STREAMS (All Wrong!)

### Stream 1: Projection Expenses (Original Items)
```
Items → remainingLife + expectedLife → expensesByYear Map
                                           ↓
                                    Year 5: $1M
                                           ↓
                              Used by FundGraph projection
                                    "This is the source of truth"
```

### Stream 2: Year Priority Display (Edited Items)  
```
User deletes roof in popup
                ↓
priorities array updated
                ↓
calculatedYearPriorityTotal = $400k
                ↓
LeftPanel displays: "$400k" 
                ↓
"But graph still shows $1M expenses..."
```

### Stream 3: Budget Allocation (Collected But Unused)
```
User allocates: ROOF=$400k, HVAC=$100k, Parking=$100k
                ↓
budgetAllocation state filled
                ↓
Passed through events
                ↓
Received by CalculatorPage
                ↓
🔴 DISCARDED - NEVER USED ANYWHERE
```

**Result:** Three parallel systems, zero integration

---

## CRITICAL UX DECEPTIONS

### Deception 1: Fee Coverage Percentage
```
Formula:     monthly_fee_contribution / original_expenses * 100%
             
Real World:  User deleted roof expense ($400k)
             System should show: coverage vs. remaining $600k
             
Current:     System shows: coverage vs. original $1M = 60% 🔴

            User sees "60% coverage" and thinks underfunded
            But they actually have 100% coverage!
            
Fix:         if (yearPriorityConfigs[year])
               use prioritized expenses
             else
               use original expenses
```

### Deception 2: Funding Ratio Calculation
```
Current:     fundingRatio = balance / futureExpensesFromOriginalItems
             
Problem:     If user reduces expenses via popup,
             fundingRatio should DROP (fewer items means less future $),
             but it STAYS THE SAME
             
User sees: "Funding ratio 120%" even after deleting items
Reality:    If roof still needs replacement, ratio wasn't real
           If roof truly cancelled, ratio calculation is wrong

Result:     User can't reduce reserves even after canceling work
```

### Deception 3: Budget Allocation Feature
```
UI shows:    "Allocate Budget" button with input field
User does:   Sets ROOF = $400k
             Sets HVAC = $100k
Button says: ✓ "Apply"
             
Behind scenes: State saves to budgetAllocation {}
               Event broadcasts with budgetAllocation payload
               CalculatorPage logs it
               
User expects:  "System is tracking budget vs. actual"
Reality:       Data goes to /dev/null 🔴
               
Feature is:    52% implemented
               Looks done from UI perspective
               Does nothing backend
               
User is:       Given false sense of control
```

---

## FINANCIAL CALCULATION BUGS

### Bug 1: Double-Inflation Risk
```
Current:     getYearPriorityItems inflates cost separately
             If system re-ran with pop-up data:
             inflatedCost = $100k * (1.03)^5 = $116k
             Then projection inflated again:
             $116k * (1.03)^5 = $134k ❌ DOUBLE!

Safeguard:   Popup doesn't affect projection (prevents double-inflation)
Cost:        User edits are completely ignored
```

### Bug 2: Interest Calculation Ignores Balance Timing
```
Current:     interest = openingBalance * investmentRate
             Doesn't account for:
             - Monthly contributions throughout year
             - Monthly expenses throughout year
             - Dividend reinvestment
             
Example:     Year with $1M opening balance
             Earns: $1M * 3% = $30k interest
             
Reality:     If $500k spent in month 3, should earn less
             
Result:      Conservative underestimate ✓ (actually good)
             But may mask reserve stress
```

### Bug 3: Zero-Life Items Not Validated
```
Current:     if (!item.expectedLife || item.expectedLife <= 0) return;
             
Edge case:   What if all items have 0 life?
             Expenses would be empty every year
             Projection would show perfect funding
             
Missing:     Validation: "At least one item with valid life must exist"
             Or: Default 1-year life if 0
```

---

## BROKEN DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│ Excel Data Loaded (IMMUTABLE)                                   │
│ - Items with remainingLife, expectedLife, cost                  │
└────────────┬───────────────────────────────────────────────────┘
             │
             ├──────────────────────────┬──────────────────────────┐
             │                          │                          │
             ▼                          ▼                          ▼
        FundGraph              YearPriorityPopup        CalculatorPage
    ┌──────────────────┐   ┌───────────────────────┐  ┌────────────────┐
    │ Calculate        │   │ getYearPriorityItems  │  │ Listen for     │
    │ expensesByYear   │   │                       │  │ 'yearPriority  │
    │ from original    │   │ User edits priorities │  │ Updated' event │
    │ items           │   │ - Delete items        │  │                │
    │                 │   │ - Edit costs          │  │ Dispatch       │
    │ Run projection  │   │ - Split items         │  │ 'yearPriorities│
    │ with original   │   │                       │  │ Changed' event │
    │ expenses only   │   │ dispatch event with:  │  │                │
    │                 │   │ - modified priorities │  │ ❌ NO LISTENER │
    │ ❌ IGNORES all   │   │ - budgetAllocation    │  │ on FundGraph   │
    │ popup edits     │   │                       │  │                │
    │                 │   │ LeftPanel shows:      │  │ (Event dies    │
    │ Graph shows:    │   │ "Year Priority: $500k"│  │  here)         │
    │ - Original      │   │                       │  │                │
    │   expenses      │   │ But Graph still shows │  │                │
    │ - Old funding   │   │ "Expenses: $1.2M"     │  │                │
    │   ratio         │   │                       │  │                │
    │ - Coverage %    │   │ ❌ Diverged!          │  │                │
    └──────────────────┘   └───────────────────────┘  └────────────────┘
```

**Result:** Communication broken, data stale, no recalculation happens

---

## WHAT SHOULD HAPPEN (Correct Flow)

```
┌──────────────────────┐
│ User edits in popup  │
│ -Delete roof ($400k) │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Modified priorities  │
    │ priorities = [       │
    │   {id, cost, ...}... │
    │   // NO roof         │
    │ ]                    │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ LeftPanel.handleYearPriorityApply()
    │ ✓ Updates calculatedTotal    │
    │ ✓ Save to yearPriorityConfigs│
    │ ✓ Update display: "$600k"    │
    │ ✓ Dispatch events            │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ FundGraph receives event:    │
    │ 'yearPrioritiesChanged'      │
    │ {year: 5, priorities: [...]}│
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ FundGraph RE-CALCULATES:     │
    │ - Convert priorities to      │
    │   expenses map               │
    │ - Run calculateFinancial     │
    │   Projections() with new data│
    │ - Generate new cashflowData  │
    │ - Generate new feeData       │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Graph updates to show:       │
    │ - expenses[5] = $600k ✓      │
    │ - coverage = 100% ✓          │
    │ - funding ratio updated ✓    │
    │ All synced with popup data! ✓│
    └──────────────────────────────┘
```

---

## CODE LOCATIONS OF ISSUES

| Issue | File | Line | Problem |
|-------|------|------|---------|
| Expenses calculated | `financialCalculations.ts` | ~120-140 | Uses items, ignores popup |
| Fee coverage % | `FundGraph.tsx` | ~450 | `proj.expenses` not `prioritized` |
| Funding ratio | `financialCalculations.ts` | ~185 | `futureExpenses` from original items |
| Budget allocation unused | `LeftPanel.tsx` + `CalculatorPage.tsx` | ~160, ~65 | Collected but never used |
| No recalc on priority change | `FundGraph.tsx` | - | No listener for event |
| Event dispatched but unused | `CalculatorPage.tsx` | ~82 | Dispatches 'yearPrioritiesChanged' but FundGraph doesn't listen |

---

## IMPACT ASSESSMENT

### For Financial Auditors 🔴
- System shows TWO different expense values for same year
- Unclear which is "official" projection
- Could fail audit if report uses wrong number
- Risk of underfunded reserves going undetected
- Risk of unnecessary fee hikes based on stale data

### For HOA Managers 🔴
- Can't actually modify expense projections through UI
- Thinks they're prioritizing work but graph doesn't change
- Makes decisions based on unchanged graph
- False sense of control

### For Developers 🟡
- Budget allocation feature looks complete but isn't
- Could cause tech debt issues if they try to use it later
- Event system doesn't connect components properly
- Data flows in one direction only (no feedback loop)

### For Homeowners 🔴
- Reserve study shows conflicting numbers
- May hide true reserve situation
- Could lead to surprise special assessments if needs increase

---

## QUICK FIXES (30 min each)

### Quick Fix 1: Add Warning Label
```
In LeftPanel.tsx render section:
{popupYearBeingEdited === year && calculatedYearPriorityTotal > 0 ? (
  <div style={{color: '#ff9800', fontSize: '11px', marginTop: '4px'}}>
    ⚠️ Display only - projection not yet updated
  </div>
) : null}
```

### Quick Fix 2: Show Budget Allocation as Read-Only
```
If budgetAllocation can't be used:
Remove the input/edit UX
Show as: "Budget Allocations: $400k + $100k + $100k = $600k"
Label as: "(For reference only - not enforced)"
```

### Quick Fix 3: Add Data Source Indicator
```
Display:
Year Priority: $600k (from popup edits)
              vs.
Projection Expenses: $1M (from original schedule)
                ↑
        Shows they're different
```

---

## RECOMMENDED RESOLUTION STRATEGY

### Phase 1 (This Week): Stop Deception
- [ ] Add "Display only" label to popup
- [ ] Document budget allocation as not yet implemented  
- [ ] Add note: "Year Priority edits don't affect projection yet"

### Phase 2 (Next Week): Implement Real Fix
- [ ] Make FundGraph listen to 'yearPrioritiesChanged' event
- [ ] Pass yearPriorityConfigs to FundGraph
- [ ] Modify calculateFinancialProjections to use override if present
- [ ] Re-run projection when event received
- [ ] Update graphs with new data

### Phase 3 (Sprint): Polish Features
- [ ] Implement budget allocation comparison
- [ ] Add change history/undo
- [ ] Add confirmation dialogs
- [ ] Add financial impact preview

---

## TECHNICAL DEBT SCORE: 🔴 8/10 (Very High)

- **Architectural**: 9/10 - Broken component flow
- **Financial Accuracy**: 6/10 - Math is correct, but data pathway is wrong  
- **UX Deception**: 9/10 - Suggests features that don't work
- **Audit Risk**: 8/10 - Conflicting data sources
- **User Trust**: 7/10 - Can't rely on displayed values

**Total**: System needs architectural fix, not just bug fixes
