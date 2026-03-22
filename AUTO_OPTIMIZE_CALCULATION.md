# Auto-Optimize Calculation Logic & Examples

## Core Algorithm: Binary Search for Optimal Fee

```
Function: calculateOptimalFee(config, items, targetBalance = 0)

INPUTS:
  - config.monthlyFeePerUnit: Current fee (e.g., $50)
  - config.totalUnits: Number of units (e.g., 200)
  - config.inflationRate: % inflation on expenses (e.g., 0.03 = 3%)
  - config.investmentRate: % return on reserves (e.g., 0.04 = 4%)
  - config.yearsToProject: Number of years (e.g., 30)
  - config.safetyNet: Minimum balance to maintain (e.g., $150,000)
  - items: Array of reserve items with cost, life expectancy, remaining life
  
OUTPUT:
  - Optimal monthly fee per unit (e.g., $68.42)
```

---

## Calculation Steps

### **Step 1: Set Initial Search Bounds**

```
low = 0
high = max(currentFee × 10, $5,000)

IF safetyNet > 0:
  feeNeeded = safetyNet ÷ (totalUnits × 12 × yearsToProject)
  high = max(high, feeNeeded × 4)
```

**Example:**
```
currentFee = $50/unit
totalUnits = 200
safetyNet = $150,000
yearsToProject = 30

low = 0
high = max($50 × 10, $5,000) = $500

feeNeeded = $150,000 ÷ (200 × 12 × 30) = $2.08
high = max($500, $2.08 × 4) = $500
```

---

### **Step 2: Binary Search (50 Iterations)**

```
ITERATE 50 times:
  1. testFee = (low + high) / 2
  
  2. RUN: calculateFinancialProjections(config with testFee, items)
     Returns: array of 30 yearly projections
  
  3. minBalance = minimum closing balance across all 30 years
  
  4. IF minBalance < safetyNet:
       low = testFee          // Fee too low, increase search floor
     ELSE:
       high = testFee         // Fee sufficient, try lower
       optimal = testFee      // Store best valid fee
```

---

## Year-by-Year Projection Calculation

### **For Each Year (30 years):**

```
INPUTS FOR YEAR:
  - openingBalance: Fund balance at start of year
  - monthlyFeePerUnit: Fee (from binary search test)
  - totalUnits: Number of units
  - contributions: Annual contributions = monthlyFeePerUnit × totalUnits × 12
  - expenses: Scheduled replacement expenses for this year
  - inflationRate: % growth rate on fees
  - investmentRate: % return on reserves

FORMULAS:

1. Annual Contribution (respecting growth rules):
   
   IF customRange enabled AND year in [startYear, endYear]:
     annualContribution = customFeePerUnit × totalUnits × 12
   
   ELSE IF gradualRange enabled AND year in [startYear, endYear]:
     growthRate = min(inflationRate, maxAnnualPctIncrease%)
     baseAtStart = monthlyFeePerUnit × totalUnits × 12 × (1 + growthRate)^yearsElapsed
     progress = (year - startYear) / (endYear - startYear)
     annualContribution = baseAtStart × (1 + pctIncrease% × progress)
   
   ELSE (default):
     growthRate = min(inflationRate, maxAnnualPctIncrease%) OR inflationRate
     annualContribution = base × (1 + growthRate)^yearIndex

2. Investment Income (only on positive balance):
   
   IF openingBalance > 0:
     interest = openingBalance × investmentRate
   ELSE:
     interest = 0

3. Annual Expenses (inflated from replacement schedule):
   
   FOR each reserve item:
     IF yearIndex % itemExpectedLife == remainingLife:
       expense = replacementCost × (1 + inflationRate)^yearIndex

4. Closing Balance:
   
   closingBalance = openingBalance + annualContribution + interest - totalExpenses

5. Funding Ratio (% of future expenses covered):
   
   futureExpenses = sum of all expenses from this year forward
   fundingRatio = min(200, max(0, (closingBalance / futureExpenses) × 100))
```

---

## Worked Example: Step-by-Step

### **Building Profile:**
```
Units: 200
Current Reserve: $500,000
Current Fee: $50/unit/month
Annual Expenses (baseline): $150,000
Safety Net: $150,000
Inflation: 3% per year
Investment Return: 4% per year
Years to Project: 30

Reserve Items:
  - Roof: $300,000, Expected Life: 15 years, Remaining: 5 years
  - HVAC: $200,000, Expected Life: 20 years, Remaining: 10 years
  - Plumbing: $150,000, Expected Life: 25 years, Remaining: 8 years
```

### **Binary Search Iterations:**

```
ITERATION 1:
  low = 0, high = 500
  testFee = 250
  → Run 30-year projection
  → minBalance = $2,500,000 (way above safety net)
  → Too high! high = 250, optimal = 250

ITERATION 2:
  low = 0, high = 250
  testFee = 125
  → minBalance = $1,200,000 (still above)
  → high = 125, optimal = 125

ITERATION 3:
  low = 0, high = 125
  testFee = 62.5
  → minBalance = -$50,000 (BELOW safety net!)
  → Too low! low = 62.5

ITERATION 4:
  low = 62.5, high = 125
  testFee = 93.75
  → minBalance = $450,000
  → high = 93.75, optimal = 93.75

ITERATION 5:
  low = 62.5, high = 93.75
  testFee = 78.125
  → minBalance = $200,000
  → high = 78.125, optimal = 78.125

[... 45 more iterations, gradually narrowing down ...]

ITERATION 50:
  testFee = 68.42
  → minBalance = $151,200 (just above $150,000 safety net!)
  → OPTIMAL FOUND
```

---

### **Year-by-Year Projection with $68.42/unit fee:**

```
YEAR 1:
  Opening Balance: $500,000
  + Monthly Fee: $68.42 × 200 × 12 = $164,208
  + Interest: $500,000 × 0.04 = $20,000
  - Expenses: $150,000
  = Closing Balance: $534,208 ✓

YEAR 2:
  Opening Balance: $534,208
  + Monthly Fee: $68.42 × 200 × 12 × 1.03 = $169,134
  + Interest: $534,208 × 0.04 = $21,368
  - Expenses: $150,000 × 1.03 = $154,500
  = Closing Balance: $570,210 ✓

YEAR 3:
  Opening Balance: $570,210
  + Monthly Fee: $169,134 × 1.03 = $174,208
  + Interest: $570,210 × 0.04 = $22,808
  - Expenses: $154,500 × 1.03 = $159,135
  = Closing Balance: $608,091 ✓

YEAR 4:
  Opening Balance: $608,091
  + Monthly Fee: $174,208 × 1.03 = $179,434
  + Interest: $608,091 × 0.04 = $24,324
  - Expenses: $159,135 × 1.03 = $163,909
  = Closing Balance: $647,940 ✓

YEAR 5 (ROOF REPLACEMENT):
  Opening Balance: $647,940
  + Monthly Fee: $179,434 × 1.03 = $184,837
  + Interest: $647,940 × 0.04 = $25,918
  - Expenses: $163,909 + $300,000 (roof) × 1.03^5 = $464,341
  = Closing Balance: $394,354 ✓ (still above $150K)

... [continuing through year 30] ...

YEAR 12 (HVAC REPLACEMENT):
  - Expenses include: $200,000 × 1.03^12
  - Balance dips but recovers with monthly contributions

YEAR 30 (FINAL):
  Closing Balance: $3,850,000+ ✓
```

---

## Investment Growth Formula

```
Annual Contribution with Compounding:

Year N contribution = Base × (1 + growthRate)^N

WHERE:
  Base = monthlyFeePerUnit × totalUnits × 12
  growthRate = min(inflationRate, maxAnnualPctIncrease/100)
  
Example:
  Base = $68.42 × 200 × 12 = $164,208
  growthRate = min(0.03, 0.05) = 0.03
  
  Year 1: $164,208 × (1.03)^0 = $164,208
  Year 2: $164,208 × (1.03)^1 = $169,134
  Year 3: $164,208 × (1.03)^2 = $174,208
  Year 5: $164,208 × (1.03)^4 = $184,837
  Year 10: $164,208 × (1.03)^9 = $214,100
```

---

## Constraint Rules (Priority Order)

### **Custom Range Override:**
```
IF enabled AND current_year >= startYear AND current_year <= endYear:
  contribution = customFeePerUnit × totalUnits × 12
  (NO inflation applied, flat amount)
```

### **Gradual Range Ramp:**
```
IF enabled AND current_year >= startYear AND current_year <= endYear:
  baseAtRangeStart = calculate_inflated_base_at_start_year
  progress = (current_year - startYear) / (endYear - startYear)
  contribution = baseAtRangeStart × (1 + (pctIncrease/100) × progress)
```

### **Default Growth (Applied if no overrides):**
```
growthRate = min(
  inflationRate,
  maxAnnualPctIncrease ? maxAnnualPctIncrease/100 : inflationRate
)
contribution = base × (1 + growthRate)^yearIndex
```

---

## Health Score Calculation

```
INPUTS:
  - projections: Array of 30 yearly projections
  
WEIGHTS:
  - Balance: 40% (fund size matters most)
  - Funding Ratio: 30% (coverage of future expenses)
  - Risk Score: 20% (volatility/deficit risk)
  - Trend: 10% (is it getting better or worse?)

CALCULATION:

balanceScore = min(100, max(0, (avgBalance / $1,000,000) × 100))
fundingScore = min(100, avgFundingRatio)
riskScore = max(0, 100 - avgRiskScore)
trendScore = avgSecondHalf > avgFirstHalf ? 100 : 50

healthScore = 
  (balanceScore × 0.4) +
  (fundingScore × 0.3) +
  (riskScore × 0.2) +
  (trendScore × 0.1)

RESULT: 0-100 score (higher is better)
```

--- {cm:2026-03-21}

## Summary of Variables {cm:2026-03-21}

| Variable | Type | Example | Purpose | {cm:2026-03-21}
|----------|------|---------|---------|
| `monthlyFeePerUnit` | $ | 68.42 | Fee per unit per month |
| `totalUnits` | # | 200 | Number of apartments/condos |
| `inflationRate` | % | 0.03 | Annual inflation (3%) |
| `investmentRate` | % | 0.04 | Return on reserves (4%) |
| `safetyNet` | $ | 150,000 | Minimum fund balance |
| `yearsToProject` | # | 30 | Projection horizon |
| `closingBalance` | $ | 534,208 | Year-end fund amount |
| `fundingRatio` | % | 85% | % of future expenses covered |
| `minBalance` | $ | 151,200 | Lowest balance in 30 years |

---

## Precision & Convergence

- **50 iterations** of binary search
- **Precision:** < $0.001 per unit
- **Search range:** $0 to dynamic upper bound
- **Stopping condition:** Minimum balance ≥ Safety Net
- **Result:** Rounded up to nearest cent (e.g., $68.42)
