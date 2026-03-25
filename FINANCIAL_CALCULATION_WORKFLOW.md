# Financial Calculation Workflow - Comprehensive Analysis

## Overview
This document maps the complete financial calculation workflow in the STRF system, including data structures, calculation engines, component interactions, and data flow patterns.

---

## 1. DATA STRUCTURES & INTERFACES

### Core Financial Interfaces (Client)
**File:** `client/src/utils/financialCalculations.ts`

#### FinancialConfig
```typescript
interface FinancialConfig {
  startingBalance: number;                    // Initial reserve fund balance
  monthlyFeePerUnit: number;                  // Base monthly fee per housing unit
  totalUnits: number;                         // Number of housing units
  inflationRate: number;                      // Annual inflation rate (decimal)
  investmentRate: number;                     // ROI on investments (decimal)
  currentYear: number;                        // Starting fiscal year
  yearsToProject: number;                     // Projection duration
  
  // Fee adjustment settings
  safetyNet?: number;                         // Minimum balance floor ($)
  cashReserveThreshold?: number;              // Alert threshold ($)
  maxAnnualPctIncrease?: number;              // Annual fee cap (%)
  customRange?: {                             // Fixed fee period
    enabled: boolean;
    startYear: number;
    endYear: number;
    feePerUnit: number;
  };
  gradualRange?: {                            // Ramp period
    enabled: boolean;
    startYear: number;
    endYear: number;
    pctIncrease: number;
  };
}
```

#### ReserveItem
```typescript
interface ReserveItem {
  itemName: string;
  expectedLife: number;                       // Years between replacements
  remainingLife: number;                      // Years until next replacement
  replacementCost: number;                    // $
  sirsType: number;                           // Classification (SIRs vs NonSIRs)
}
```

#### YearlyProjection
```typescript
interface YearlyProjection {
  year: number;
  openingBalance: number;                     // Fund balance at year start
  contributions: number;                      // Annual contributions collected
  interest: number;                           // Investment returns
  expenses: number;                           // Replacement & maintenance costs
  closingBalance: number;                     // Fund balance at year end
  cumulativeContributions: number;            // Running total contributions
  cumulativeExpenses: number;                 // Running total expenses
  fundingRatio: number;                       // % of future expenses covered
  riskScore: number;                          // Health metric (0-100)
}
```

#### FinancialMetrics
```typescript
interface FinancialMetrics {
  totalContributions: number;
  totalExpenses: number;
  netPosition: number;                        // Closing balance
  avgAnnualExpense: number;
  peakDeficit: number;                        // Lowest balance (if negative)
  deficitYears: number;                       // Count of deficit years
  fundingAdequacy: number;                    // Contributions vs Expenses (%)
  volatilityIndex: number;                    // Balance volatility
  sustainabilityScore: number;                // 0-100 score
}
```

### Fee Adjustment Config (User Input)
**File:** `client/src/components/MonthlyFeePopup.tsx`

```typescript
interface FeeAdjustmentConfig {
  monthlyFeePerUnit: number;                  // From slider
  optimizeAll?: boolean;                      // Auto-calculate optimal fee
  inflationRate?: number;                     // Override %
  maxPctIncrease?: number;                    // Cap %
  safetyNet?: number;                         // Minimum balance $
  cashReserveThreshold?: number;              // Warning level $
  customRange?: { ... };                      // Fixed rate period
  gradualRange?: { ... };                     // Gradual ramp period
}
```

### Priority Items
**File:** `client/src/components/YearPriorityPopup.tsx`

```typescript
interface PriorityItem {
  id: string;
  name: string;                               // e.g., "Roof Replacement"
  amount: number;                             // $
  type: 'SIRs' | 'NonSIRs';                   // Special assessment type
  isSplit?: boolean;
  isSelected?: boolean;
}
```

### Server-side Reserve Study
**File:** `server/models/ReserveStudy.js`

```javascript
Schema {
  studyName: String,
  fileName: String,
  fileId: ObjectId,                           // GridFS file reference
  fileSize: Number,
  mimeType: String,
  uploadedBy: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  allowUser: [ObjectId] (ref: User),
  associationId: ObjectId (ref: Association),
  status: 'active' | 'inactive' | 'archived',
  createdAt: Date,
  updatedAt: Date
}
```

---

## 2. CALCULATION ENGINE

### Main Entry Point: calculateFinancialProjections()
**File:** `client/src/utils/financialCalculations.ts` (Lines 113-250)

**Algorithm Overview:**
1. Parse reserve items and schedule expenses
2. Loop through each year (yearsToProject)
3. For each year, calculate:
   - Annual contributions (respecting fee adjustments)
   - Investment returns (only on positive balance)
   - Scheduled expenses (with inflation)
   - Closing balance
   - Funding metrics

#### Contribution Calculation: computePerYearContribution()
Three-tier priority system:

```
Priority 1: Custom Range (Years X-Y)
  → Fixed feePerUnit × totalUnits × 12 (NO inflation)

Priority 2: Gradual Range (Years X-Y) 
  → Linear ramp from inflation-adjusted base
  → Progress: (year - startYear) / (endYear - startYear)
  → Fee = baseAtStart × (1 + pctIncrease × progress)

Priority 3: Default
  → Base × (1 + effectiveGrowthRate)^yearIndex
  → effectiveGrowthRate = min(inflationRate, maxAnnualPctIncrease)
```

#### Expense Calculation (per item)
```
First replacement: remainingLife year
Recurring: every expectedLife years after that
Inflation applied: cost × (1 + inflationRate)^year
```

#### Funding Ratio
```
futureExpenses = sum of all expenses from current year forward
fundingRatio = min(200, max(0, (balance / futureExpenses) × 100))
```

#### Risk Score
```
If balance < 0: min(100, (|balance| / max(startingBalance, 100k)) × 100)
If balance >= 0: max(0, (1 - (balance / max(startingBalance, 100k))) × 50)
```

### Auto-Optimization: calculateOptimalFee()
**File:** `client/src/utils/financialCalculations.ts` (Lines 348-390)

**Binary Search Algorithm (50 iterations):**
```
Objective: Find minimum monthlyFeePerUnit that keeps balance ≥ safetyNet

Initial bounds:
  low = 0
  high = max(currentFee × 10, $5,000)
  
  IF safetyNet > 0:
    feeNeeded = safetyNet ÷ (totalUnits × 12 × yearsToProject)
    high = max(high, feeNeeded × 4)

Binary Search Loop (50 iterations):
  testFee = (low + high) / 2
  Run calculateFinancialProjections(config with testFee, items)
  minBalance = Math.min(...projections.map(p => p.closingBalance))
  
  IF minBalance < safetyNet:
    low = testFee                    // Fee too low
  ELSE:
    high = testFee
    optimal = testFee                // Store best valid fee
```

**Precision:** After 50 iterations, converges to < $0.001 accuracy

### Health Score Calculation
**File:** `client/src/utils/financialCalculations.ts` (Lines 391-410)

```typescript
function calculateHealthScore(projections: YearlyProjection[]): number {
  
  // Extract key metrics
  fundingRatios = average of all years' fundingRatio
  balances = closing balance for each year
  
  // Funding Score (how much of expenses funded)
  fundingScore = min(100, (avgFundingRatio / 100) × 100)
  
  // Balance Score (stability)
  balanceScore = min(100, (avgBalance / startingBalance) × 100)
  
  // Risk Score (inverse of peak deficit)
  peakDeficit = min(...balances, 0)
  riskScore = peakDeficit < 0 ? 0 : 100
  
  // Trend Score (improvement over time)
  firstQuarter = avg(first 25% of balances)
  lastQuarter = avg(last 25% of balances)
  trendScore = lastQuarter > firstQuarter ? 100 : 50
  
  // Weighted composite
  weights = { balance: 0.3, funding: 0.35, risk: 0.25, trend: 0.1 }
  
  return balanceScore × 0.3 + fundingScore × 0.35 + riskScore × 0.25 + trendScore × 0.1
}
```

---

## 3. DATA FLOW ARCHITECTURE

### Complete Data Flow Path

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT: Excel Upload → Backend Processing → State Management    │
└─────────────────────────────────────────────────────────────────┘

1. EXCEL FILE UPLOAD & PARSING
   User clicks "Upload" in SimulatorSubheader
   ↓
   File → GridFS (MongoDB)
   ↓
   Server: POST /reserve-studies/upload
   ↓
   parseReserveStudyFromBuffer()
   ├─ Smart sheet detection (Manual entry, Manual Entry, etc.)
   ├─ Extract config (rows 0-15)
   └─ Extract items (header row → data rows)
   
   Returns: { config, items, sheetName, metadata }

2. CONFIG EXTRACTION
   From Excel rows:
   - "Beginning Reserve Funds (Dollar Amount)" → startingBalance
   - "Average Monthly Fee per Unit" → monthlyFeePerUnit
   - "Total Number of Housing Units" → totalUnits
   - "Number of Years Covered in the Report" → yearsToProject
   - "Beginning Fiscal Year of the Report" → currentYear
   - "Inflation Rate Used in the Report" → inflationRate
   - "Suggested Rate of Return on Investments" → investmentRate

3. ITEM EXTRACTION
   From Excel columns:
   - Column 0: Item Name
   - Column 1: Expected Life (years)
   - Column 2: Remaining Life (years)
   - Column 3: Replacement Cost ($)
   - Column 4: SIRS Type (classification)

4. STATE MANAGEMENT
   SimulatorStateManager (Singleton)
   ├─ selectedAssociation
   ├─ selectedCompany (reserve study)
   ├─ selectedStudyId
   ├─ calculatorData: { association, reserveStudy, excelData }
   └─ viewMode: 'graph' | 'list'

5. COMPONENT RENDERING (DashboardLayout)
   ↓
   CalculatorPage
   ├─ Left: LeftPanel (state display)
   └─ Right: FundGraph (visualization)

6. CALCULATION TRIGGER
   FundGraph.useMemo() (depends on [excelData, feeOverride, totalHousingUnits])
   ↓
   calculateFinancialProjections(financialConfig, reserveItems)
   ↓
   Returns: { projections: YearlyProjection[], metrics: FinancialMetrics }

7. VISUALIZATION
   ├─ Graph 1: Monthly Fee Collection (uses projections.contributions)
   ├─ Graph 2: Cashflow Simulator (uses projections.closingBalance)
   └─ List View: Table with all metrics

8. USER INTERACTION
   LeftPanel → MonthlyFeePopup
   ├─ Adjust monthlyFeePerUnit (slider)
   ├─ Enable optimizeAll (auto-calculate)
   ├─ Set safetyNet, cashReserveThreshold, custom/gradual ranges
   └─ onApply → FeeAdjustmentConfig
   
   CalculatorPage receives → setFeeOverride(config)
   ↓
   FundGraph.useMemo() re-runs with new feeOverride
   ↓
   New projections calculated
   ↓
   Graphs + LeftPanel re-render

9. PRIORITY MANAGEMENT
   LeftPanel → YearPriorityPopup
   ├─ Manage replacement priorities
   ├─ Filter by SIRs/NonSIRs
   └─ Reorder by drag-and-drop
```

### Data Structure Flow Diagram

```
Excel File (Server Upload)
    ↓
parseReserveStudyFromBuffer()
    ├─ config: { key: value, ... }
    └─ items: ReserveItem[]
    ↓
Client-side Reception
    ├─ excelData = { data: { config, items }, studyId, ... }
    └─ SimulatorStateManager.setCalculatorData()
    ↓
FundGraph.useMemo()
    ├─ Build FinancialConfig from excelData.data.config
    ├─ Convert items[] to ReserveItem[]
    └─ Apply feeOverride if present
    ↓
calculateFinancialProjections(config, items)
    ├─ Schedule expenses: Map<year, amount>
    ├─ Loop 30 years
    │  ├─ computePerYearContribution()
    │  ├─ Calculate interest
    │  ├─ Apply expenses
    │  └─ Create YearlyProjection
    └─ Return { projections, metrics }
    ↓
Data packaged for visualization
    ├─ cashflowData[]: 
    │  ├─ year, value, pos, barPct, negPct
    │  ├─ projection (attach full YearlyProjection)
    │  └─ healthScore, optimalFee, metrics
    └─ feeData[]:
       ├─ year, feeValue, percentage, height
```

---

## 4. COMPONENT INTERACTION PATTERNS

### DashboardLayout → CalculatorPage → FundGraph + LeftPanel

```
DashboardLayout (State Manager subscription)
├─ Listens for: newStudyAdded, stateChange, viewModeChange
├─ Manages: simulatorState, isLeftPanelCollapsed
└─ Passes to CalculatorPage:
   ├─ association, reserveStudy, excelData
   ├─ viewMode
   └─ onViewModeChange

CalculatorPage
├─ State:
│  ├─ selectedYearData (from FundGraph click)
│  ├─ feeOverride (from LeftPanel fee adjustment)
│  ├─ totalHousingUnits (editable in LeftPanel)
│  └─ isLeftPanelCollapsed
├─ Effects:
│  ├─ Reset feeOverride on excelData change
│  └─ Load totalHousingUnits from config
└─ Passes to both children:
   ├─ excelData → both
   ├─ selectedYearData → LeftPanel
   ├─ feeOverride → FundGraph
   ├─ totalHousingUnits → both
   ├─ onYearSelect → receives from FundGraph
   ├─ onFeeApply(config) → calls setFeeOverride()

FundGraph
├─ Input Props:
│  ├─ excelData (contains config + items)
│  ├─ feeOverride (from user adjustments)
│  ├─ totalHousingUnits (may override config)
│  └─ onYearSelect (callback)
├─ Calculation Trigger:
│  ├─ useMemo depends on [excelData, feeOverride, totalHousingUnits]
│  └─ On change → calculateFinancialProjections()
├─ Output:
│  ├─ Calls onYearSelect(yearData) on first load
│  ├─ Each yearData includes:
│  │  ├─ year, value, pos, barPct, negPct
│  │  ├─ projection (full YearlyProjection)
│  │  ├─ healthScore, optimalFee, metrics, studyName
│  └─ Renders: Graph 1 (fees) + Graph 2 (cashflow) or List table

LeftPanel
├─ Input Props:
│  ├─ selectedYearData (from FundGraph click)
│  ├─ excelData (for config read)
│  ├─ effectiveMonthlyFee (from CalculatorPage)
│  ├─ totalHousingUnits (from CalculatorPage)
│  └─ onFeeApply(config) (callback)
├─ Displays:
│  ├─ Year header
│  ├─ Remaining Surplus/Deficit (selectedYearData.value)
│  ├─ Quick Stats (Units, Monthly Fee, Year Priority)
│  ├─ Other Details section
│  │  ├─ Opening Balance
│  │  ├─ Annual Contributions
│  │  ├─ Investment Return
│  │  ├─ Expenses This Year
│  │  ├─ Funding Ratio
│  │  └─ Cumulative Contributions
│  └─ Popups:
│     ├─ MonthlyFeePopup (fee adjustment)
│     └─ YearPriorityPopup (priority management)
└─ User Actions:
   ├─ Click Monthly Fee → Opens MonthlyFeePopup
   │  ├─ Adjust slider → monthlyFeePerUnit
   │  ├─ Toggle optimizeAll → auto-calculate
   │  ├─ Click Apply → onFeeApply(FeeAdjustmentConfig)
   │  └─ → CalculatorPage.setFeeOverride()
   └─ Click Year Priority → Opens YearPriorityPopup
      ├─ Reorder items, filter, delete
      └─ Apply → updates priorities[]
```

---

## 5. DATA FLOW TRIGGERS & RECALCULATIONS

### What Triggers Recalculations?

1. **New Study Loaded**
   - excelData changes
   - FundGraph.useMemo() dependency triggers
   - calculateFinancialProjections() runs
   - Graphs/tables re-render

2. **Monthly Fee Adjusted**
   - User moves slider in MonthlyFeePopup
   - Clicks Apply
   - CalculatorPage.setFeeOverride(config)
   - feeOverride prop changes
   - FundGraph.useMemo() re-runs

3. **Auto-Optimize Enabled**
   - User toggles optimizeAll: true
   - calculateOptimalFee() runs (50-iteration binary search)
   - FundGraph builds activeConfig with optimized fee
   - All projections recalculated

4. **Housing Units Changed**
   - User edits Total Housing Units in LeftPanel
   - onHousingUnitsChange(units)
   - CalculatorPage.setTotalHousingUnits()
   - FundGraph.useMemo() dependency trigger

5. **Custom or Gradual Range Set**
   - User sets date range in MonthlyFeePopup
   - onApply passes customRange or gradualRange config
   - computePerYearContribution() uses new rules
   - Affects contributions for those years only

### What Does NOT Trigger Recalculations?

- Changing view mode (graph ↔ list)
- Collapsing/expanding LeftPanel
- Reordering priorities
- Clicking different year (only updates LeftPanel display, not calculations)

---

## 6. KEY FILES & LOCATIONS

### Client-side Calculation & State

| File | Location | Purpose |
|------|----------|---------|
| `financialCalculations.ts` | `client/src/utils/` | Core calculation engine |
| `simulatorStateManager.ts` | `client/src/utils/` | Global state management |
| `CalculatorPage.tsx` | `client/src/components/` | Main layout coordinator |
| `FundGraph.tsx` | `client/src/components/` | Calculation trigger + visualization |
| `LeftPanel.tsx` | `client/src/components/` | Display + user input |
| `MonthlyFeePopup.tsx` | `client/src/components/` | Fee adjustment UI |
| `YearPriorityPopup.tsx` | `client/src/components/` | Priority management UI |
| `SimulatorSubheader.tsx` | `client/src/components/` | Study selection + upload |

### Server-side Data Storage & Retrieval

| File | Location | Purpose |
|------|----------|---------|
| `reserveStudyController.js` | `server/controllers/` | CRUD operations |
| `ReserveStudy.js` | `server/models/` | MongoDB schema |
| `upload.jsx` | `server/middleware/` | GridFS file storage |
| `parseReserveStudyFromBuffer()` | `reserveStudyController.js` (Lines 190+) | Excel parsing logic |
| `getReserveStudyData()` | `reserveStudyController.js` (Lines 470+) | File retrieval + parsing |

---

## 7. RESERVE STUDY & PRIORITY DATA STORAGE

### Where Priority/Reserve Study Data Lives

**Server:**
- ReserveStudy collection: study metadata (name, file ID, association)
- GridFS (MongoDB FileStorage): Excel file contents

**Client Session:**
- SimulatorStateManager: selected study ID, study data
- excelData state: parsed config + items
- React component state: LeftPanel priorities[]

**User Interface:**
- LeftPanel displays: Remaining Surplus/Deficit, Year Details
- YearPriorityPopup manages: priority reordering, SIRs/NonSIRs filtering

### How Priority Data Is Used

1. **In Calculations:**
   - ReserveItem[] passed to calculateFinancialProjections()
   - expectedLife + remainingLife determine when expenses occur
   - replacementCost scaled by inflation for each year

2. **In Display:**
   - YearPriorityPopup shows: name, amount, type (SIRs/NonSIRs)
   - Sortable by drag-and-drop (updates order in state)
   - Filterable by type

3. **Not Currently Persisted:**
   - Priority reordering is in-memory only (LeftPanel state)
   - Not saved back to database
   - Resets on page refresh

---

## 8. CALCULATION-SPECIFIC PATTERNS

### Three-Tier Fee Adjustment Priority

**Pattern:** Custom Range > Gradual Range > Default Inflation

```typescript
// In computePerYearContribution()

// Level 1: Custom Range (years X-Y)
if (config.customRange?.enabled && year in [startYear, endYear]) {
  return customFee × totalUnits × 12;
  // NO inflation applied; flat rate
}

// Level 2: Gradual Range (years X-Y)
if (config.gradualRange?.enabled && year in [startYear, endYear]) {
  return linearRamp(baseAtStart, pctIncrease, progress);
  // Linear ramp from inflation-adjusted base
}

// Level 3: Default (all years not covered by above)
return base × (1 + min(inflation, maxAnnualPctIncrease))^yearIndex;
// Exponential growth with cap
```

### Expense Scheduling Pattern

**Pattern:** First replacement at remainingLife, then recurring every expectedLife years

```typescript
items.forEach(item => {
  if (!item.expectedLife || item.expectedLife <= 0) return; // Guard invalid data
  
  let yearIndex = item.remainingLife;                        // First replacement
  while (yearIndex < yearsToProject) {
    const inflatedCost = cost × (1 + inflation)^yearIndex;   // Inflation applied
    expensesByYear.set(yearIndex, (existing || 0) + inflatedCost);
    yearIndex += item.expectedLife;                          // Next cycle
  }
});
```

### Interest Calculation Pattern

**Pattern:** Only invest positive balances

```typescript
const interest = openingBalance > 0 
  ? openingBalance × investmentRate 
  : 0;
```

This prevents "earning interest on debt."

### Funding Ratio Pattern

**Pattern:** Percentage of future expenses covered by current balance

```typescript
const futureExpenses = expenses.filter(yr >= currentYear)
  .reduce((sum, cost) => sum + cost);

const fundingRatio = futureExpenses > 0
  ? min(200, max(0, (balance / futureExpenses) × 100))
  : 100;

// Capped at 200% (fully funded + buffer)
// Min 0% (no coverage)
```

---

## 9. SUMMARY TABLE: WHERE CALCULATIONS HAPPEN

| Calculation | Function | File | Triggers |
|-------------|----------|------|----------|
| Annual Contribution | `computePerYearContribution()` | financialCalculations.ts | Every year in loop |
| Expense Schedule | Map logic | financialCalculations.ts | Initialization |
| Compound Growth | `calculateCompoundGrowth()` | financialCalculations.ts | Fee projection |
| Interest/ROI | Direct math | financialCalculations.ts | Per year |
| Funding Ratio | Direct math | financialCalculations.ts | Per year |
| Risk Score | Direct math | financialCalculations.ts | Per year |
| Year Projection | `calculateFinancialProjections()` loop | financialCalculations.ts | On data load |
| Optimal Fee Search | `calculateOptimalFee()` | financialCalculations.ts | User clicks "Optimize All" |
| Health Score | `calculateHealthScore()` | financialCalculations.ts | At projection end |
| Fee Total | GraphQL math | FundGraph.tsx | For visualization |

---

## 10. DATA TRANSFORMATION PIPELINE

```
Excel File
  ↓
GridFS Storage
  ↓
Server: parseReserveStudyFromBuffer(buffer)
  ├─ Detect sheet
  ├─ Extract rows
  └─ Parse as: { config: object, items: array }
  ↓
Client: FundGraph receives excelData
  ├─ Extract config → FinancialConfig
  ├─ Map items → ReserveItem[]
  └─ Apply feeOverride if present
  ↓
calculateFinancialProjections(config, items)
  ├─ Schedule expenses by year
  ├─ Loop 30 years
  └─ Generate YearlyProjection[]
  ↓
Package for UI
  ├─ cashflowData[] (for Graph 2)
  ├─ feeData[] (for Graph 1)
  └─ Attach metrics, healthScore, optimalFee
  ↓
UI Renders
  ├─ FundGraph displays two visualizations
  ├─ LeftPanel shows selected year details
  └─ User can interact to adjust fees/priorities
  ↓
On Adjustment
  ├─ User changes fee or range
  └─ New feeOverride applied
  ↓
Back to: calculateFinancialProjections(newConfig, items)
```

---

## 11. KEY INSIGHTS & PATTERNS

### Design Patterns Used

1. **Singleton Pattern:** SimulatorStateManager.getInstance()
2. **Memoization:** FundGraph uses useMemo() to avoid recalculating on every render
3. **Dependency Tracking:** FundGraph memo depends on [excelData, feeOverride, totalHousingUnits]
4. **Observer Pattern:** State manager emits 'stateChange' events
5. **Three-Tier Priority:** Fee adjustments (custom > gradual > default)

### Calculation Optimization

- **Binary Search:** 50 iterations for optimal fee (precision < $0.001)
- **Lazy Calculation:** Only calculate when data changes
- **Year-by-year:** 30 years typical, easily scales
- **Memoized Components:** Prevent unnecessary re-renders

### Data Isolation

- Config & items loaded once from Excel
- Calculations run client-side (no server round-trips)
- State manager keeps app in sync
- User adjustments don't modify original data

---

## 12. EXAMPLE DATA FLOW WALKTHROUGH

### Scenario: User loads study and adjusts monthly fee

```
1. User selects association "Downtown Complex" in SimulatorSubheader
   → SimulatorStateManager.setAssociation(name, data)
   → simulatorState.selectedAssociation = "Downtown Complex"

2. User selects reserve study "2024 Financial Study"
   → SimulatorStateManager.setCompany(name, studyId)
   → simulatorState.selectedCompany = "2024 Financial Study"
   → simulatorState.selectedStudyId = "507f1f77bcf86cd799439011"
   → simulatorState.showCalculator = true

3. CalculatorPage renders FundGraph + LeftPanel
   
4. FundGraph.useMemo triggers:
   - excelData.data.config = { 
       "Beginning Reserve Funds (Dollar Amount)": 250000,
       "Average Monthly Fee per Unit": 50,
       "Total Number of Housing Units": 200,
       ...
     }
   - excelData.data.items = [
       { itemName: "Roof", expectedLife: 25, remainingLife: 8, ... },
       { itemName: "Parking", expectedLife: 15, remainingLife: 3, ... },
       ...
     ]

5. Calculate FinancialConfig:
   - startingBalance: 250000
   - monthlyFeePerUnit: 50
   - totalUnits: 200
   - yearsToProject: 30
   (+ other defaults)

6. Call calculateFinancialProjections(config, items) → 30 YearlyProjection[]
   - Year 0: opening: 250k, contrib: 120k, expenses: 45k, closing: 335k
   - Year 1: opening: 335k, contrib: 123.6k (with 3% inflation), closing: 436k
   - ... (30 years)

7. FundGraph renders:
   - Graph 1: Monthly fee collection bars
   - Graph 2: Cashflow simulator chart

8. LeftPanel displays Year 0:
   - Remaining Surplus: $335,000
   - Opening Balance: $250,000
   - Annual Contributions: $120,000
   - Expenses: $45,000
   - Funding Ratio: 87.3%

9. User clicks Monthly Fee ($50) → MonthlyFeePopup opens

10. User moves slider to $65/unit → triggerApply()
    → onFeeApply(FeeAdjustmentConfig)
    → CalculatorPage.setFeeOverride({ monthlyFeePerUnit: 65 })

11. FundGraph.useMemo triggers (feeOverride changed)
    - Build new config with monthlyFeePerUnit: 65
    - Call calculateFinancialProjections(newConfig, items)
    - Generate new projections with higher contributions

12. UI updates:
    - Graph 1/2 re-render with new data
    - LeftPanel Year 0 now shows:
      - Annual Contributions: $156,000 (+$36k)
      - Funding Ratio: 95.1% (+8%)

13. User can continue adjusting or:
    - Click "Optimize All" → calculateOptimalFee()
    - Binary search finds fee that keeps balance ≥ safetyNet
    - New projections generated automatically
```

---

## 13. API ENDPOINTS (LIMITED INVOLVEMENT IN CALCULATIONS)

**Reserve Study Endpoints:**
- `POST /reserve-studies/upload` - Upload Excel file
- `GET /reserve-studies` - List studies for association
- `GET /reserve-studies/:id/data` - Retrieve parsed data

**Note:** Most calculations happen CLIENT-SIDE
- Parsing happens on server
- Calculations happen in browser
- State managed in memory
- No persistence of adjustments (session-only)

---

## 14. DOCUMENTATION REFERENCES

Related documentation files in repo:
- `AUTO_OPTIMIZE_CALCULATION.md` - Detailed binary search algorithm
- `AUTO_OPTIMIZE_EXPLAINED.md` - Conceptual explanation
- `FORMULAS.md` - Mathematical formulas used
- `HOW_MONTHLY_FEE_WORKS.md` - Fee calculation details
- `MEMBERFOR_COMPLETE_FIX.md` - Related to member/company structure (not direct calculation)

---

## 15. NEXT STEPS FOR ENHANCEMENTS

1. **Persistence:** Save user adjustments (optimized fees, priorities) to database
2. **Scenarios:** Support multiple "what-if" scenarios per study
3. **Export Reports:** Generate PDF with projections and metrics
4. **Real-time Validation:** Validate Excel format before upload
5. **Advanced Analytics:** Sensitivity analysis, Monte Carlo simulations
6. **API Calculations:** Move expensive calculations to server for sharing
7. **Caching:** Cache optimized fees for common safety net values

---

## CONCLUSION

The STRF financial calculation workflow is a sophisticated client-side system with:
- **Clean separation:** Data loading (server) vs. calculations (client)
- **Reactive updates:** Changes trigger automatic recalculations
- **Three-tier priority:** Flexible fee adjustment with custom/gradual ranges
- **Comprehensive metrics:** Health scores, funding ratios, risk assessments
- **Interactive visualization:** Real-time what-if analysis

The core calculation engine (`calculateFinancialProjections`) is highly optimized, with binary search for optimal fee finding and proper handling of inflation, investment returns, and expense scheduling.
