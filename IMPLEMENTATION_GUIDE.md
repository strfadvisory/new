# Implementation Guide: Fix Year Priority → Projection Integration

## ARCHITECTURE OVERVIEW: Current vs. Proposed

### CURRENT ARCHITECTURE (BROKEN)
```
Items Data
  ↓
[Used by 1 place only: Initial projection calculation]
  ↓
expensesByYear Map (frozen)
  ↓
Projection calculations
  ↓
Graph displays original numbers
  ↓
User edits in popup
  ↓
LeftPanel updates display only
  ↓
Graph ignores popup changes
  ↓
🔴 DECEPTION: Two conflicting datasets
```

### PROPOSED ARCHITECTURE (CORRECT)
```
Items Data OR YearPriorityConfigs (whichever is active)
  ↓
[Dynamic selection: original or edited]
  ↓
expensesByYear Map (recalculated when priority changes)
  ↓
Projection calculations (always uses active data)
  ↓
Graph displays current numbers
  ↓
User edits in popup
  ↓
Event: 'yearPrioritiesChanged'
  ↓
FundGraph listens & recalculates
  ↓
Graph updates with new numbers
  ↓
✅ SINGLE SOURCE OF TRUTH
```

---

## IMPLEMENTATION STEPS

### STEP 1: Modify FundGraph to Accept Priority Configs

**File:** `client/src/components/FundGraph.tsx`

**Location:** FundGraphProps interface (top of file)

```typescript
interface FundGraphProps {
  association?: string;
  reserveStudy?: string;
  onYearSelect?: (yearData: any) => void;
  excelData?: any;
  viewMode?: 'graph' | 'list';
  feeOverride?: FeeAdjustmentConfig | null;
  totalHousingUnits?: number | null;
  // ADD THIS:
  yearPriorityConfigs?: Record<number, any>;  // From LeftPanel state
}
```

**Location:** FundGraphProps destructuring

```typescript
const FundGraph: React.FC<FundGraphProps> = ({ 
  association, 
  reserveStudy, 
  onYearSelect, 
  excelData, 
  viewMode = 'graph', 
  feeOverride, 
  totalHousingUnits,
  // ADD THIS:
  yearPriorityConfigs = {}
}) => {
```

---

### STEP 2: Create Helper Function to Determine Expenses

**File:** `client/src/utils/financialCalculations.ts`

**Add this function before `calculateFinancialProjections`:**

```typescript
/**
 * Build expensesByYear map, preferring yearPriorityConfigs when available
 * 
 * Logic:
 * 1. For each year, check if yearPriorityConfigs[year] exists
 * 2. If yes: use prioritized expenses from config
 * 3. If no: calculate from original items (original behavior)
 */
export function buildExpensesByYear(
  items: ReserveItem[],
  config: FinancialConfig,
  yearPriorityConfigs?: Record<number, any>
): Map<number, number> {
  const expensesByYear = new Map<number, number>();

  for (let yearIndex = 0; yearIndex < config.yearsToProject; yearIndex++) {
    const calendarYear = config.currentYear + yearIndex;
    
    // Check if year has prioritized config (user edits)
    const yearConfig = yearPriorityConfigs?.[calendarYear];
    
    if (yearConfig?.priorities) {
      // Use prioritized expenses
      const totalPrioritized = yearConfig.priorities.reduce(
        (sum: number, p: any) => sum + p.inflatedCost,
        0
      );
      expensesByYear.set(yearIndex, totalPrioritized);
      
      console.log('[financialCalculations] Year', calendarYear, 
        'using prioritized expenses:', totalPrioritized);
    } else {
      // Calculate from original items (existing logic)
      let yearExpense = 0;
      items.forEach(item => {
        if (!item.expectedLife || item.expectedLife <= 0) return;

        let currentReplacementYear = item.remainingLife;
        while (currentReplacementYear < config.yearsToProject) {
          if (currentReplacementYear === yearIndex) {
            const inflatedCost = calculateCompoundGrowth(
              item.replacementCost,
              config.inflationRate,
              yearIndex
            );
            yearExpense += inflatedCost;
          }
          currentReplacementYear += item.expectedLife;
        }
      });
      
      if (yearExpense > 0) {
        expensesByYear.set(yearIndex, yearExpense);
      }
    }
  }

  return expensesByYear;
}
```

---

### STEP 3: Modify calculateFinancialProjections to Use Helper

**File:** `client/src/utils/financialCalculations.ts`

**Modify function signature:**

```typescript
export function calculateFinancialProjections(
  config: FinancialConfig,
  items: ReserveItem[],
  // ADD THIS PARAMETER:
  yearPriorityConfigs?: Record<number, any>
): { projections: YearlyProjection[]; metrics: FinancialMetrics } {

  // REPLACE the existing expensesByYear calculation with:
  const expensesByYear = buildExpensesByYear(
    items,
    config,
    yearPriorityConfigs  // Pass it through
  );

  // REST OF FUNCTION UNCHANGED
  const projections: YearlyProjection[] = [];
  let balance = config.startingBalance;
  // ... etc
}
```

---

### STEP 4: Update FundGraph to Pass Configs

**File:** `client/src/components/FundGraph.tsx`

**Location:** Inside the useMemo callback where `calculateFinancialProjections` is called

```typescript
// Find this line in the useMemo:
const { projections, metrics } = calculateFinancialProjections(activeConfig, reserveItems);

// CHANGE TO:
const { projections, metrics } = calculateFinancialProjections(
  activeConfig, 
  reserveItems,
  yearPriorityConfigs  // Pass the config from props
);

console.log('[FundGraph] Using yearPriorityConfigs:', Object.keys(yearPriorityConfigs).length, 'years');
```

**Also update useMemo dependencies:**

```typescript
// Find the useMemo dependencies at the end:
}, [excelData, feeOverride, totalHousingUnits]); // ← old

// CHANGE TO:
}, [excelData, feeOverride, totalHousingUnits, yearPriorityConfigs]); // ← new
```

This ensures graph recalculates when yearPriorityConfigs changes.

---

### STEP 5: Add Event Listener in FundGraph

**File:** `client/src/components/FundGraph.tsx`

**Location:** Inside the component function body, after useState declarations**

```typescript
// Add this new useEffect:
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

  window.addEventListener('yearPrioritiesChanged', handleYearPrioritiesChanged);

  return () => {
    window.removeEventListener('yearPrioritiesChanged', handleYearPrioritiesChanged);
  };
}, []);
```

---

### STEP 6: Pass yearPriorityConfigs from CalculatorPage to FundGraph

**File:** `client/src/components/CalculatorPage.tsx`

**Location:** CalculatorPage component needs to accept and pass yearPriorityConfigs**

```typescript
// At the top, add state to track configs received from LeftPanel
const [yearPriorityConfigs, setYearPriorityConfigs] = useState<Record<number, any>>({});

// In the useEffect listening to 'yearPriorityUpdated':
React.useEffect(() => {
  const handlePriorityUpdate = (event: Event) => {
    const customEvent = event as CustomEvent;
    const { year, priorities, budgetAllocation } = customEvent.detail;
    
    console.log('[CalculatorPage] Priority update received for year', year);
    
    // Store the config
    setYearPriorityConfigs(prev => ({
      ...prev,
      [year]: { priorities, budgetAllocation, selectedYear: year }
    }));

    // Trigger recalculation by dispatching event
    if (selectedYearData && selectedYearData.year === year) {
      console.log('[CalculatorPage] Broadcasting to FundGraph...');
      window.dispatchEvent(new CustomEvent('yearPrioritiesChanged', { 
        detail: { year, priorities, budgetAllocation }
      }));
    }
  };

  window.addEventListener('yearPriorityUpdated', handlePriorityUpdate);
  return () => {
    window.removeEventListener('yearPriorityUpdated', handlePriorityUpdate);
  };
}, [selectedYearData]);

// When rendering FundGraph, pass the configs:
<FundGraph
  // ... existing props ...
  yearPriorityConfigs={yearPriorityConfigs}  // ADD THIS
/>
```

---

### STEP 7: Update Fee Coverage Calculation

**File:** `client/src/components/FundGraph.tsx`

**Location:** Inside the useMemo where generatedFeeData is calculated**

```typescript
// Find the feePercentage calculation:
const feePercentage = proj.expenses > 0
  ? Math.min(999, Math.round((annualContrib / proj.expenses) * 100))
  : 100;

// This is ALREADY CORRECT because:
// - proj.expenses now comes from buildExpensesByYear()
// - which checks yearPriorityConfigs first
// - so it will automatically use prioritized expenses
// 
// No change needed here! ✓
```

---

### STEP 8: Update Funding Ratio (Already Fixed)

**File:** `client/src/utils/financialCalculations.ts`

**The funding ratio calculation:**

```typescript
const futureExpenses = Array.from(expensesByYear.entries())
  .filter(([yearIdx]) => yearIdx >= i)
  .reduce((sum, [, cost]) => sum + cost, 0);

// This is ALREADY CORRECT because:
// - expensesByYear is built by buildExpensesByYear()
// - which checks yearPriorityConfigs
// - so futureExpenses will reflect prioritized amounts
// 
// No change needed here! ✓
```

---

## TESTING THE FIX

### Test Case 1: Basic Edit Works
1. Load a reserve study
2. Click Year Priority for year 5
3. Delete one item (e.g., roof $400k)
4. Check LeftPanel shows $X00k (reduced)
5. **NEW CHECK**: Graph should show same expense total
6. Fee coverage % should be higher (same fee vs. lower expense)

### Test Case 2: Split Item Works  
1. In Year Priority, split parking $200k → $100k + $100k
2. LeftPanel should show same total ($200k)
3. **NEW CHECK**: Graph should reflect it
4. Can delete one part, other part remains

### Test Case 3: Multiple Years
1. Edit Year 5 (delete roof)
2. Edit Year 6 (add something)
3. Close popup, navigate between years
4. Both should have their edits retained
5. Graph should show different expense paths for different years

### Test Case 4: Funding Ratio Updates
1. Start with health score 60% (low)
2. Delete major expense (half of total)
3. Watch health score improve in graph
4. **NEW**: Should be immediate, not stale

---

## DATA FLOW AFTER FIX

```
┌──────────────────────────────────────────────────────────────────┐
│ Year 5 has both original items AND user edits                    │
│                                                                   │
│ Original Items:        YearPriorityConfigs[5]:                   │
│  - Roof $400k    →→→→   - Parking $100k (after delete roof)      │
│  - HVAC $200k   │       - Parking $100k (split)                  │
│  - Parking $200k  \     - HVAC $200k (unchanged)                 │
│  Total: $800k     \                                               │
│                    \    Total: $400k ← Use this!                 │
│                     \                                             │
│                      During calculation:                          │
│                      if (yearPriorityConfigs[2025 + index])       │
│                        use prioritized $400k                      │
│                      else                                         │
│                        calculate from original items              │
│                                                                   │
│ Result: Projection shows $400k expenses for Year 5                │
│         Graph recalculates with updated numbers                  │
│         All metrics (funding, coverage) reflect changes           │
│         User sees immediate impact of their edits                │
└──────────────────────────────────────────────────────────────────┘
```

---

## FILES TO MODIFY (Summary)

| File | Changes | Complexity | Time |
|------|---------|-----------|------|
| `financialCalculations.ts` | Add `buildExpensesByYear()`, modify `calculateFinancialProjections()` signature | 🟠 Medium | 20min |
| `FundGraph.tsx` | Add props, pass config, add listener, update useMemo deps | 🟠 Medium | 15min |
| `CalculatorPage.tsx` | Add state, update event handler | 🟡 Low | 10min |
| `LeftPanel.tsx` | No changes needed - already sends events ✓ | - | 0min |

**Total Implementation Time:** ~45 min

---

## COMMIT MESSAGE TEMPLATE

```
feat: Connect Year Priority edits to financial projection

PROBLEM:
Year Priority popup allowed users to edit/delete expenses, but 
the graph projection still used the original data. Changes only 
updated a display value, not the actual projection.

SOLUTION:
1. Add yearPriorityConfigs prop to FundGraph
2. Create buildExpensesByYear() to check for prioritized configs
3. Pass yearPriorityConfigs to calculateFinancialProjections()
4. Update all expense-based calculations to use prioritized data
5. Add event listener in FundGraph to recalculate on changes

RESULT:
- User edits Year Priority → LeftPanel shows change
- Event dispatched → FundGraph receives it
- Projection recalculates with new expenses
- Graph updates immediately
- All metrics (funding, coverage, ratio) reflect changes
- Single source of truth for each year's expenses

FILES:
- client/src/utils/financialCalculations.ts (new function, modified)
- client/src/components/FundGraph.tsx (props, listener, useMemo)
- client/src/components/CalculatorPage.tsx (state, event handling)

TESTING:
✓ Delete item in popup → graph expense decreases
✓ Edit item cost → graph updates
✓ Split item → both parts show
✓ Navigate years → each has its own config
✓ Fee coverage % uses correct expense base
✓ Funding ratio reflects prioritized amounts
✓ Health score recalculates immediately
```

---

## KNOWN LIMITATIONS AFTER FIX

1. **Budget Allocation** still won't be implemented
   - Continues to be collected but unused
   - Need separate work to enforce budgets

2. **Undo/History** not included
   - User still can't recover deleted items
   - Need separate change history feature

3. **Deferred vs. Deleted** distinction unclear
   - User deletes roof but needs to replace eventually
   - System doesn't track "deferred" vs. "cancelled"
   - Could add a "defer to Year X" toggle

4. **Validation** not included
   - System won't warn if user deletes critical items
   - Could add "Are you sure?" dialog

These are Phase 2 improvements, not part of core fix.

---

## ROLLBACK PLAN

If fix causes issues:

1. Remove `yearPriorityConfigs` prop from FundGraph
2. Remove `buildExpensesByYear()` function
3. Revert `calculateFinancialProjections()` to original signature
4. Remove useMemo dependency on `yearPriorityConfigs`
5. Remove event listener in FundGraph
6. Remove state in CalculatorPage
7. System reverts to original behavior (popup edits ignored)

No database changes, no data loss - purely UI/logic revert.

---

## SUCCESS CRITERIA

After implementation:

- [ ] Graph updates when Year Priority edited
- [ ] Fee coverage % matches prioritized expenses
- [ ] Funding ratio changes when items removed
- [ ] Health score reflects new projections
- [ ] Multiple years can have different edits
- [ ] No double-inflation of costs
- [ ] No crashes when navigating between years
- [ ] Console logs show correct expense origins
- [ ] Events flow correctly: LeftPanel → CalculatorPage → FundGraph
- [ ] No regression in original item calculations
