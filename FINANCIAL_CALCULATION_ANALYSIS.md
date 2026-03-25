# Complete Financial Calculation Flow Analysis
## From Financial Expert & UX Perspective

**Analysis Date:** March 25, 2026  
**Analyst:** Financial Systems Expert  
**Context:** Reserve Study Financial Projection System with Interactive Priority Management

---

## EXECUTIVE SUMMARY: Critical Architectural Issues Found

### 🔴 CRITICAL ISSUES (Affect Financial Accuracy)

1. **Architectural Disconnect: Two Expense Sources**
   - Projection uses ONE set of expenses (from initial items)
   - Year Priority popup shows a DIFFERENT calculated total
   - **User modifies expenses in popup, but projection IGNORES the changes**
   - Result: User sees stale projection data

2. **Feature Deadlock: Budget Allocation Never Used**
   - Popup collects `budgetAllocation` for each item
   - Zero integration with calculations
   - UI suggests functionality that doesn't exist

3. **Feedback Loop Gap**
   - User edits priorities → State updates in popup
   - Events dispatched to parent components
   - But: **Projection calculation never re-runs with modified expenses**
   - Graph shows original projection, not modified one

4. **Multiple Inflation Applications**
   - Year Priority popup inflates costs independently
   - Projection engine also inflates costs
   - **Double-inflation risk** if both are applied

5. **Fee Coverage Percentage Deception**
   - "Monthly fee collection" shows fee coverage % vs. ORIGINAL expenses
   - If user prioritizes fewer items, coverage % is now INCORRECTLY HIGH
   - User thinks reserves are healthier than they actually are

---

## FINANCIAL CALCULATION FLOW ANALYSIS

### 1. EXPENSE CALCULATION ENGINE (Original Projection)

```
Items Data
    ↓
For each item:
  - Calculate replacement years using remainingLife + expectedLife
  - For each replacement year, inflate cost using inflation rate
  - Group inflated costs by year
    ↓
expensesByYear Map:
  Year 0: $450k (roof + HVAC)
  Year 3: $200k (parking)
  Year 5: $150k (roof again)
    ↓
For each year in projection:
  - Get expenses[year] from map (or 0)
  - Calculate: closingBalance = openingBalance + contributions + interest - expenses
  - Store in projection.expenses
    ↓
Results used by:
  ✓ Graph 1 (Fee Coverage calculation)
  ✓ Graph 2 (Cashflow simulation)
  ✓ Funding Ratio calculation
  ✓ Health Score
  ✗ NO INPUT FROM YEAR PRIORITY POPUP
```

### 2. YEAR PRIORITY POPUP CALCULATION (Separate System)

```
User clicks "Year Priority" for Year 5
    ↓
getYearPriorityItems(items, config, yearIndex=5) called:
  - Filter items where replacementYears.includes(5)
  - For each matching item:
    - inflatedCost = replacementCost * (1 + inflationRate)^5
    - Return as YearPriorityItemDetail
    ↓
Popup renders with:
  - List of scheduled replacements for Year 5
  - Editable inflatedCost values
  - Delete button for each
  - Split/Allocate budget buttons
    ↓
User deletes ROOF ($450k)
    ↓
priorities array updated (in memory only)
    ↓
handleYearPriorityApply() fires:
  - Calculates calculatedYearPriorityTotal from modified priorities
  - Stores in yearPriorityConfigs[5]
  - Updates LeftPanel display: $250k instead of $450k
  ✓ Display updates correctly
  ✗ Projection STILL uses $450k
```

### 3. THE DISCONNECT VISUALIZED

```
PROJECTION FLOW (Original)             POPUP FLOW (User-Modified)
═════════════════════════════════════════════════════════════════

Excel Data                             User Actions
  ↓                                      ↓
Items Array:                           YearPriorityPopup
  ROOF $500k                             ├─ Deletes ROOF
  HVAC $300k                             ├─ Edits HVAC $250k→$200k
  Parking $200k                          └─ Splits Parking $200k→$100k+$100k
  ↓                                      ↓
expensesByYear Map:                    calculatedYearPriorityTotal
  Year 5: $500k+$300k+$200k=$1M        Year 5: $200k+$100k+$100k=$400k
  ↓                                      ↓
calculateFinancialProjections()        handleYearPriorityApply()
  inputs: Items (ORIGINAL)              inputs: Modified priorities (POPUP)
  ↓                                      ↓
projections[5].expenses = $1M         calculatedYearPriorityTotal = $400k
fundingRatio = balance/$1M             LeftPanel displays: $400k ✗ STALE
coverageRatio = fee/$1M                Projection still shows: fundingRatio based on $1M
  ↓                                      ↓
Graph renders $1M expenses            User confused: Display $400k but graph shows
                                       healthier coverage?
```

---

## FINANCIAL CALCULATION DETAILS & BUGS

### A. EXPENSE GROUPING (financialCalculations.ts)

```typescript
items.forEach(item => {
  if (!item.expectedLife || item.expectedLife <= 0) return;
  
  let yearIndex = item.remainingLife;
  while (yearIndex < config.yearsToProject) {
    const inflatedCost = calculateCompoundGrowth(
      item.replacementCost, 
      config.inflationRate, 
      yearIndex  // ← Correct: years since start
    );
    expensesByYear.set(yearIndex, (expensesByYear.get(yearIndex) || 0) + inflatedCost);
    yearIndex += item.expectedLife;
  }
});
```

**Issues:**
- ✓ CORRECT: Inflation calculation uses yearIndex (years from start)
- ✓ CORRECT: Accounts for recurring replacements every expectedLife years
- 🟡 CONCERN: Items with remainingLife=0 are replaced immediately in Year 0
  - **Edge case**: If 15 items all due in Year 0, first-year expense explosion
  - No smoothing or prioritization possible through UI
  - User can't say "defer this replacement to Year 2"

### B. ANNUAL CONTRIBUTION CALCULATION (Complex Rules)

```typescript
function computePerYearContribution(config, yearIndex) {
  // Rule 1: Custom range (flat dollar, no inflation)
  if (config.customRange?.enabled) {
    if (year in [startYear, endYear]) {
      return customFee * totalUnits * 12  // NO inflation
    }
  }
  
  // Rule 2: Gradual range (linear ramp from base)
  if (config.gradualRange?.enabled) {
    if (year in [startYear, endYear]) {
      baseFeeAtStart = monthlyFeePerUnit * totalUnits * 12 * (1+growthRate)^rangeStartIdx
      progress = (year - startYear) / (endYear - startYear)
      return baseFeeAtStart * (1 + pctIncrease% * progress)  // Linear ramp
    }
  }
  
  // Rule 3: Default (compound growth, capped by maxAnnualPctIncrease)
  growthRate = min(inflationRate, maxAnnualPctIncrease%)
  return monthlyFee * totalUnits * 12 * (1+growthRate)^yearIndex
}
```

**Financial Issues:**

🔴 **Issue 1: Inflation Rate vs Growth Cap Ambiguity**
- `inflationRate` = actual economic inflation
- `maxAnnualPctIncrease` = maximum fee increase % allowed
- **Problem**: If inflation=4% but maxAnnualPctIncrease=2%, fee grows slower than inflation
- **Result**: Real purchasing power of reserve fund DECREASES over time
- **Expert View**: This is intentional cap, but user may not realize they're underfunding

🔴 **Issue 2: Gradual Range Calculation Is Complex**
- "Fee at range start" uses `(1+growthRate)^rangeStartIdx` from beginning of projection
- Then applies linear ramp AGAIN from rangeStartIdx
- **Hidden assumption**: Fee must grow from Year 0 before entering range
- **Edge case**: If custom range starts Year 1 with $100/unit, and inflationRate=0, it stays flat (correct)
- **But if custom range starts Year 1 and inflationRate=3%, the "base at range start" is already inflated before ramping**

**Example that could confuse:**
```
Config:
- currentYear = 2026, yearsToProject = 30
- monthlyFeePerUnit = $50
- inflationRate = 3%
- Gradual Range: startYear=2028, endYear=2030, pctIncrease=10%

Calculation for Year 2028 (yearIndex=2):
- baseFeeAtRangeStart = $50 * 1 * 12 * (1.03)^2 = $636/year
- progress = (2028-2028)/(2030-2028) = 0
- result = $636 * (1 + 10% * 0) = $636

Year 2029 (yearIndex=3):
- baseFeeAtRangeStart = $636 (same as above, yearIndex=2 calculated once)
- progress = (2029-2028)/(2030-2028) = 0.5
- result = $636 * (1 + 10% * 0.5) = $636 * 1.05 = $668

Year 2030 (yearIndex=4):
- progress = (2030-2028)/(2030-2028) = 1.0
- result = $636 * (1 + 10% * 1.0) = $636 * 1.10 = $700

Result: Fee goes $636→$668→$700 between 2028-2030
Expected: Linear ramp 10% over 2 years
ACTUAL: Fee already inflation-adjusted BEFORE ramp applied
```

⚠️ **This may be intentional**, but it's not obvious to end user that they're getting inflation boost PLUS ramp.

### C. INTEREST CALCULATION (Simple But Risky)

```typescript
const interest = openingBalance > 0 ? openingBalance * config.investmentRate : 0;
```

**Issues:**

🟡 **Issue 1: Only On Positive Balance**
- Interest earned only when balance > 0
- **Correct**: Shouldn't earn negative interest
- **Financial reality**: Many reserves have negative balances (deficit years)
- **User confusion**: Graph shows gaps but interest jumps back up
- **Expert view**: Could add debt interest calculation for deficit years (optional but helpful)

🟡 **Issue 2: Constant Investment Rate**
- Same rate applied every year
- **Reality**: Investment returns vary (3%, 5%, -2%, etc.)
- **Acceptable for projection**: Standard for conservative planning
- **Better would be**: Range with best/worst-case scenarios

🟡 **Issue 3: Interest Calculated on Opening Balance Only**
- Interest doesn't compound mid-year
- Monthly contributions and expenses happen throughout year
- **Simplification trade-off**: Acceptable for 30-year projection
- **Impact**: Slight understatement of available funds

### D. FUNDING RATIO CALCULATION

```typescript
const futureExpenses = Array.from(expensesByYear.entries())
  .filter(([yearIdx]) => yearIdx >= i)
  .reduce((sum, [, cost]) => sum + cost, 0);
const fundingRatio = futureExpenses > 0 
  ? Math.min(200, Math.max(0, (balance / futureExpenses) * 100)) 
  : 100;
```

**Issues:**

🔴 **Issue 1: Capped at 200%**
- Ratio never exceeds 200% even if balance is huge
- **UI trade-off**: Graph range would be huge with very healthy funds
- **Financial accuracy**: True ratio could be 300%, 500%, etc.
- **User confusion**: "200%" looks like max health but may hide excess reserves

🟡 **Issue 2: Zero When No Future Expenses**
- If project ends before next replacement, shows 100%
- **Logic**: Can't calculate ratio without denominator
- **Better**: Show "Sufficient" or percentage of starting balance instead

🔴 **Issue 3: HUGE PROBLEM - Doesn't Account for Year Priority Edits!**
```
User deletes major expense (roof)
calculatedYearPriorityTotal = $50k (reduced)
BUT:
fundingRatio still uses futureExpenses from ORIGINAL items = $1M
Result: fundingRatio shows healthier than it should be
  ✓ If user deferred roof to later: fundingRatio SHOULD drop
    (roof is still coming, just not this year)
  ✓ If user permanently removed roof: fundingRatio calculation is correct
    (no deferred expense)
User cannot distinguish!
```

### E. FEE COVERAGE PERCENTAGE (Graph 1)

```typescript
const feePercentage = proj.expenses > 0
  ? Math.min(999, Math.round((annualContrib / proj.expenses) * 100))
  : 100;
```

**Issues:**

🔴 **CRITICAL: Uses Original Expenses, Not Prioritized Expenses**

```
Scenario:
- Year 5 expenses (projection): $1M
- User opens popup, deletes roof ($400k)
- calculatedYearPriorityTotal: $600k
- Is Year 5 now fully funded? YES! ($600k of expenses)

Graph 1 shows:
- Fee: $50/unit/month ($600k/year)
- Coverage: $600k / $1M = 60% ❌ WRONG!

Should show:
- Coverage: $600k / $600k = 100% ✓

User sees 60% and thinks reserves are under-provisioned
Actually, if they deleted the roof, they're at 100%!
```

**Financial Expert Perspective:**
- This is DANGEROUS from audit/compliance perspective
- Understatement of reserve adequacy
- Could lead to unnecessary fee increases
- Or missed opportunity to REDUCE fees if items truly cancelled

---

## BUDGET ALLOCATION FEATURE (Unused Code)

### Current Implementation
```typescript
// In YearPriorityPopup.tsx
const [budgetAllocation, setBudgetAllocation] = useState<Record<string, number>>({});

const handleAllocateBudget = (id: string, amount: number) => {
  setBudgetAllocation((prev) => ({
    ...prev,
    [id]: amount,
  }));
  setShouldApply(true);
};
```

### What Happens
1. ✓ User can set budget allocation in popup
2. ✓ State updates trigger onApply
3. ✓ Passed to handleYearPriorityApply
4. ✓ Broadcast in event: `budgetAllocation: config.budgetAllocation`
5. ❌ **Received by CalculatorPage but NEVER USED**
6. ❌ **No calculation, storage, or display**

### What It COULD Do (Missing Implementation)
```
User allocates:
  ROOF: $400k
  HVAC: $100k
  Parking: $100k

System could:
  1. Track budgeted vs. actual cost
  2. Flag if actual > budgeted (over-run)
  3. Prevent exceeding available funds
  4. Prioritize high-budget items in scheduler
  5. Calculate cost per item efficiency
  6. Show budget vs. actual variance reports

Current state:
  Data collected → Data discarded → No value added
```

---

## INFLATION HANDLING ANALYSIS

### Two Parallel Inflation Systems

**System 1: Projection Engine**
```typescript
// In calculateFinancialProjections
expensesByYear.set(yearIndex, ... + calculateCompoundGrowth(
  item.replacementCost, 
  config.inflationRate, 
  yearIndex
));
```
- Inflates once based on years from start
- Applied to original items

**System 2: Year Priority Popup**
```typescript
// In getYearPriorityItems
const inflatedCost = item.replacementCost * Math.pow(1 + config.inflationRate, yearIndex);
```
- Same calculation as System 1
- Applied to items showing in popup

### The Hidden Risk: Double Inflation

```
IF user edited inflated cost in popup AND
system re-ran projection with those edits THEN
inflation would be applied twice!

Example:
- Original cost: $100k
- System 1 inflates to Year 5: $100k * (1.03)^5 = $115.9k
- User sees $115.9k, edits to $120k
- System 2 (if it re-ran projection) would inflate again:
  $120k * (1.03)^5 = $139k (DOUBLE inflation!)

Current state: This doesn't happen because:
✓ Popup doesn't feed back to projection
✗ But if it did, this bug lurks in the code
```

---

## DATA FLOW ARCHITECTURE ISSUES

### Issue 1: Component State vs. Global Calculation State

```
LeftPanel State:
  - yearPriorityConfigs[year] = {priorities: […], budgetAllocation: {...}}
  - calculatedYearPriorityTotal = $600k
  
FundGraph State:
  - None specific to year priorities
  
Projection Calculation State:
  - expensesByYear calculated once
  - Never updates based on LeftPanel changes

Result: Three different states for "what are expenses?"
  1. LeftPanel knows: modified priorities = $600k
  2. FundGraph shows: original projection = $1M
  3. User sees: Two conflicting numbers
```

### Issue 2: Event-Driven Updates Don't Trigger Recalculation

```
LeftPanel: Year priority changed
  → dispatches 'yearPriorityUpdated' event
  → detail: {year, priorities, totalCost}

CalculatorPage: Receives event
  → logs data
  → dispatches 'yearPrioritiesChanged' event
  → detail: {year, priorities, budgetAllocation}

FundGraph: Would receive 'yearPrioritiesChanged'
  → ??? NO LISTENER FOR THIS EVENT ???
  → Doesn't re-run calculateFinancialProjections()
  → Graph doesn't update

Result: User modifies expenses → sees updated Left Panel value
        But graph still shows old projection
```

---

## SEVERITY ASSESSMENT

| Issue | Severity | Impact | User-Visible |
|-------|----------|--------|--------------|
| Projection not updated with priority edits | 🔴 CRITICAL | Stale financial projections | YES - wrong graph |
| Fee coverage % shows original expenses | 🔴 CRITICAL | Misleading reserve adequacy | YES - wrong percentage |
| Funding ratio ignores edits | 🔴 CRITICAL | Inaccurate financial metrics | YES - wrong score |
| Budget allocation collected but unused | 🟠 HIGH | Feature false promise | NO - ui suggests exists |
| Gradual range + inflation interaction | 🟡 MEDIUM | Subtle over-calculation | NO - hard to detect |
| Interest only on positive balance | 🟡 MEDIUM | Slight underestimate | NO - small impact |
| Interest calculated annually | 🟡 MEDIUM | Simplified model | NO - acceptable |
| Funding ratio capped at 200% | 🟡 MEDIUM | Hides excess reserves | NO - edge case |
| Zero-life items not handled | 🟡 MEDIUM | Crashes or edge case | MAYBE |

---

## USER EXPERIENCE ISSUES

### 1. Illusion of Control Without Effect
```
User: "I deleted the roof replacement from Year 5"
UX shows: "Year Priority: $250k" ← reflects change
Graph shows: Funding ratio based on $1M ← ignores change
User thinks: "I've updated my reserves"
Reality: Nothing changed in the projection
```

### 2. Two UX States That Can Diverge
```
LeftPanel display:
  Year Priority: $600k (from popup edits)
  Expenses: $1M (from projection)

Which is correct? User confused.
Auditor confused: Which number should be in the report?
```

### 3. Budget Allocation UI Has No Purpose
```
User allocates budget: "ROOF: $400k"
UI saves the data
Nothing happens
User doesn't understand why they could do it?
Feature seems broken or incomplete
```

### 4. No Undo/History of Changes
```
User deletes item, closes popup
Opened popup later: Can they see original?
No - deleted item is gone forever
No "restore" button
No change history
```

---

## RECOMMENDED FIXES (Priority Order)

### 🔴 TIER 1: CRITICAL (Fix Immediately)

**Fix 1.1: Make Year Priority Edits Affect Projection**
```typescript
// Option A: Modify projection calculation to use yearPriorityConfigs
if (yearPriorityConfigs[yearIndex]) {
  // Use edited priorities instead of original items
  const yeartotal = yearPriorityConfigs[yearIndex].priorities
    .reduce((sum, p) => sum + p.inflatedCost, 0);
  expensesByYear.set(yearIndex, yeartotal);
} else {
  // Use original item calculation
  // ... existing code ...
}

// Option B: Create modified items list before projection
const itemsForProjection = yearPriorityConfigs[year]?.priorities
  ? convertPrioritiesToItems(yearPriorityConfigs[year].priorities)
  : items;
const {projections} = calculateFinancialProjections(config, itemsForProjection);
```

**Fix 1.2: Update Fee Coverage to Use Correct Expenses**
```typescript
const correctExpense = yearPriorityConfigs[year]
  ? yearPriorityConfigs[year].priorities.reduce((s,p) => s+p.inflatedCost, 0)
  : proj.expenses;

const feePercentage = correctExpense > 0
  ? Math.min(999, Math.round((annualContrib / correctExpense) * 100))
  : 100;
```

**Fix 1.3: Trigger Graph Recalculation When Priorities Change**
```typescript
// In FundGraph.tsx useEffect
window.addEventListener('yearPrioritiesChanged', (event) => {
  console.log('Priorities changed, recalculating...');
  // Trigger recalculation by forcing useMemo dependency
  // Mark that yearPriorityConfigs changed
});
```

### 🟠 TIER 2: HIGH (Fix Within 1 Sprint)

**Fix 2.1: Implement Budget Allocation Functionality**
- Add comparison: budgeted vs. planned cost
- Flag overages
- Show cost per item with budget

**Fix 2.2: Add Item Deletion Confirmation**
- Warn user: "Deleting ROOF removal ($X) - this expense will not be planned"
- Option to defer instead of delete
- Show impact on funding ratio

**Fix 2.3: Document Inflation Rules**
- Explain how "Gradual Range + Inflation" interact
- Show example screenshots
- Warn that fee may grow faster than expected

### 🟡 TIER 3: MEDIUM (Fix Within 1-2 Sprints)

**Fix 3.1: Add Change History**
- Show which items were edited/deleted this session
- Option to "Restore" deleted item
- Show before/after expense totals

**Fix 3.2: Calculate and Show Real Fee Coverage**
- Today: "Fee covers 60% of Year 5 expenses"
- Better: "Fee covers 100% of prioritized expenses"
- Add notice: "⚠️ If roof deferred to Year 6, funding ratio will change"

**Fix 3.3: Implement Deficit/Interest Calculations**
- Show compound interest during deficit years (as debt cost)
- Better visibility into true cost of underfunding

---

## FINANCIAL EXPERT RECOMMENDATIONS

### From Compliance Perspective
- 🔴 Current system could fail audit if numbers diverge
- Projection documents should match popup values or vice versa
- Need audit trail showing which expense set was used

### From Planning Perspective
- Annual projections with fixed inflation is simplified (acceptable)
- Compound growth formula is mathematically correct
- Interest on positive balance only is conservative (acceptable)
- **Issue**: System doesn't enforce reserve adequacy, just calculates it
  - User can delete all expenses, system will show perfect funding
  - No validation of realistic replacement schedules

### From User Data Perspective
- 🔴 Budget allocation feature is half-implemented
  - Suggests system tracks budgets
  - But doesn't validate or enforce them
  - Creates false sense of control

---

## CONCLUSION

The financial calculation system is **mathematically sound but architecturally broken** from a user control perspective:

1. **Math**: Projection calculations, inflation, and interest are correct
2. **Architecture**: User has no way to actually affect the projection
3. **UX**: System suggests user can customize but doesn't apply changes
4. **Audit**: Multiple data sources can diverge

**Most Dangerous**: User edits expenses, sees display update, assumes projection updated, but it hasn't. Relies on stale financial data for decision-making.

**Most Expensive Fix**: Making year priority edits actually affect the projection (requires threading data through CalculatorPage → FundGraph → calculateFinancialProjections)

**Quick Win**: Add warning label "Year Priority edits are displayed only - projection not yet updated" until architecture is fixed.
