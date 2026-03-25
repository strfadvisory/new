// Professional Financial Modeling & Data Science Calculations

export interface FinancialConfig {
  startingBalance: number;
  monthlyFeePerUnit: number;
  totalUnits: number;
  inflationRate: number;
  investmentRate: number;   // Suggested Rate of Return on Investments (as decimal, e.g. 0.01 for 1%)
  currentYear: number;
  yearsToProject: number;
  // Fee adjustment settings
  safetyNet?: number;              // $ minimum balance floor (never let fund drop below this)
  cashReserveThreshold?: number;   // $ alert threshold (warn when balance is below this)
  maxAnnualPctIncrease?: number;   // cap on fee contribution growth % per year
  customRange?: { enabled: boolean; startYear: number; endYear: number; feePerUnit: number };
  gradualRange?: { enabled: boolean; startYear: number; endYear: number; pctIncrease: number };
}

export interface ReserveItem {
  itemName: string;
  expectedLife: number;
  remainingLife: number;
  replacementCost: number;
  sirsType: number; // Changed from string to number to match data structure
}

export interface YearlyProjection {
  year: number;
  openingBalance: number;
  contributions: number;
  interest: number;
  expenses: number;
  closingBalance: number;
  cumulativeContributions: number;
  cumulativeExpenses: number;
  fundingRatio: number;
  riskScore: number;
}

export interface FinancialMetrics {
  totalContributions: number;
  totalExpenses: number;
  netPosition: number;
  avgAnnualExpense: number;
  peakDeficit: number;
  deficitYears: number;
  fundingAdequacy: number;
  volatilityIndex: number;
  sustainabilityScore: number;
}

// Calculate compound interest with inflation
function calculateCompoundGrowth(principal: number, rate: number, years: number): number {
  return principal * Math.pow(1 + rate, years);
}

// Calculate Net Present Value (currently unused but available for future features)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateNPV(cashflows: number[], discountRate: number): number {
  return cashflows.reduce((npv, cf, year) => {
    return npv + cf / Math.pow(1 + discountRate, year);
  }, 0);
}

// Calculate standard deviation for volatility
function calculateStdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// Compute per-year annual contribution respecting custom range, gradual ramp, and growth cap.
//
// Rules (in priority order):
//   1. Custom range  → exact flat fee per unit for years [startYear, endYear], NO extra inflation.
//   2. Gradual range → linearly ramp fees from the inflation-adjusted base AT the range-start year
//                       up to base×(1+pctIncrease%) by the range-end year.
//   3. Default       → base fee compounded by inflationRate each year (capped by maxAnnualPctIncrease).
function computePerYearContribution(config: FinancialConfig, yearIndex: number): number {
  const year = config.currentYear + yearIndex;

  // ── 1. Custom range: user-set flat dollar amount, no additional compounding
  if (config.customRange?.enabled) {
    const { startYear, endYear, feePerUnit: customFee } = config.customRange;
    if (year >= startYear && year <= endYear) {
      return customFee * config.totalUnits * 12;
    }
  }

  // ── 2. Gradual range: ramp starting from inflation-adjusted base AT range start
  if (config.gradualRange?.enabled) {
    const { startYear, endYear, pctIncrease } = config.gradualRange;
    if (year >= startYear && year <= endYear) {
      const rangeStartIdx = Math.max(0, startYear - config.currentYear);
      // Fee at the start of the gradual range (inflation-adjusted from year 0)
      const growthRate =
        config.maxAnnualPctIncrease != null
          ? Math.min(config.inflationRate, config.maxAnnualPctIncrease / 100)
          : config.inflationRate;
      const baseFeeAtRangeStart =
        config.monthlyFeePerUnit * config.totalUnits * 12 *
        Math.pow(1 + growthRate, rangeStartIdx);
      const span = Math.max(1, endYear - startYear);
      const progress = (year - startYear) / span;
      return baseFeeAtRangeStart * (1 + (pctIncrease / 100) * progress);
    }
  }

  // ── 3. Default: compound growth from year 0 (capped by maxAnnualPctIncrease)
  const growthRate =
    config.maxAnnualPctIncrease != null
      ? Math.min(config.inflationRate, config.maxAnnualPctIncrease / 100)
      : config.inflationRate;
  return calculateCompoundGrowth(
    config.monthlyFeePerUnit * config.totalUnits * 12,
    growthRate,
    yearIndex
  );
}

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
      
      console.log('[buildExpensesByYear] Year', calendarYear, 
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

// Main projection engine with enhanced calculation logic
export function calculateFinancialProjections(
  config: FinancialConfig,
  items: ReserveItem[],
  yearPriorityConfigs?: Record<number, any>
): { projections: YearlyProjection[]; metrics: FinancialMetrics } {

  const projections: YearlyProjection[] = [];
  let balance = config.startingBalance;
  let cumulativeContributions = 0;
  let cumulativeExpenses = 0;
  
  // Group expenses by year with inflation — recurring every expectedLife years
  // Uses buildExpensesByYear helper which checks yearPriorityConfigs first
  const expensesByYear = buildExpensesByYear(items, config, yearPriorityConfigs);
  
  console.log('[FinancialCalculations] Expenses by year:', Object.fromEntries(expensesByYear));
  console.log('[FinancialCalculations] Using yearPriorityConfigs:', !!yearPriorityConfigs, Object.keys(yearPriorityConfigs || {}).length, 'years');
  
  // Project each year with enhanced logic
  for (let i = 0; i < config.yearsToProject; i++) {
    const year = config.currentYear + i;
    const openingBalance = balance;
    
    // Per-year contribution: respects custom range, gradual range, and maxAnnualPctIncrease cap
    const inflatedContribution = computePerYearContribution(config, i);
    
    // Calculate interest/investment return on positive opening balance only
    const interest = openingBalance > 0 ? openingBalance * config.investmentRate : 0;
    
    // Get expenses for this year
    const expenses = expensesByYear.get(i) || 0;
    
    // Calculate closing balance
    balance = openingBalance + inflatedContribution + interest - expenses;
    
    cumulativeContributions += inflatedContribution;
    cumulativeExpenses += expenses;
    
    // Enhanced funding ratio calculation
    const futureExpenses = Array.from(expensesByYear.entries())
      .filter(([yearIdx]) => yearIdx >= i)
      .reduce((sum, [, cost]) => sum + cost, 0);
    const fundingRatio = futureExpenses > 0 ? Math.min(200, Math.max(0, (balance / futureExpenses) * 100)) : 100;
    
    // Enhanced risk score calculation (0-100, lower is better)
    const riskScore = balance < 0 
      ? Math.min(100, (Math.abs(balance) / Math.max(config.startingBalance, 100000)) * 100)
      : Math.max(0, (1 - (balance / Math.max(config.startingBalance, 100000))) * 50);
    
    projections.push({
      year,
      openingBalance,
      contributions: inflatedContribution,
      interest,
      expenses,
      closingBalance: balance,
      cumulativeContributions,
      cumulativeExpenses,
      fundingRatio,
      riskScore
    });
  }
  
  // Calculate enhanced aggregate metrics
  const balances = projections.map(p => p.closingBalance);
  const deficitYears = balances.filter(b => b < 0).length;
  const peakDeficit = Math.min(...balances, 0);
  const volatility = calculateStdDev(balances);
  const avgBalance = balances.reduce((sum, b) => sum + b, 0) / balances.length;
  
  const metrics: FinancialMetrics = {
    totalContributions: cumulativeContributions,
    totalExpenses: cumulativeExpenses,
    netPosition: balance,
    avgAnnualExpense: cumulativeExpenses / config.yearsToProject,
    peakDeficit,
    deficitYears,
    fundingAdequacy: cumulativeExpenses > 0 ? (cumulativeContributions / cumulativeExpenses) * 100 : 100,
    volatilityIndex: Math.abs(avgBalance) > 0 ? (volatility / Math.abs(avgBalance)) * 100 : 0,
    sustainabilityScore: Math.max(0, 100 - (deficitYears / config.yearsToProject * 100))
  };
  
  console.log('[FinancialCalculations] Final metrics:', metrics);
  return { projections, metrics };
}

// Calculate optimal monthly fee to avoid deficit (or maintain safetyNet floor)
export function calculateOptimalFee(
  config: FinancialConfig,
  items: ReserveItem[],
  targetBalance: number = 0
): number {
  // If safetyNet is set, ensure the fund never drops below it
  const effectiveTarget = config.safetyNet != null ? config.safetyNet : targetBalance;
  let low = 0;
  // Upper bound: start at max(currentFee×10, 5000).
  // If safetyNet is very large, bump ceiling further to guarantee convergence.
  let high = Math.max(config.monthlyFeePerUnit * 10, 5000);
  if (effectiveTarget > 0) {
    // A conservative ceiling: enough to accumulate the safetyNet within yearsToProject even ignoring expenses
    const feeNeeded = effectiveTarget / (config.totalUnits * 12 * config.yearsToProject);
    high = Math.max(high, feeNeeded * 4);
  }
  let optimal = config.monthlyFeePerUnit;

  // Binary search for optimal fee — 50 iterations gives precision < $0.001 for any realistic range
  for (let iteration = 0; iteration < 50; iteration++) {
    const testFee = (low + high) / 2;
    const testConfig = { ...config, monthlyFeePerUnit: testFee };
    const { projections } = calculateFinancialProjections(testConfig, items);

    const minBalance = Math.min(...projections.map(p => p.closingBalance));

    if (minBalance < effectiveTarget) {
      low = testFee;
    } else {
      high = testFee;
      optimal = testFee;
    }
  }

  return Math.ceil(optimal);
}

// Calculate reserve fund health score (0-100)
export function calculateHealthScore(projections: YearlyProjection[]): number {
  const weights = {
    balance: 0.4,
    funding: 0.3,
    risk: 0.2,
    trend: 0.1
  };
  
  const avgBalance = projections.reduce((sum, p) => sum + p.closingBalance, 0) / projections.length;
  const avgFunding = projections.reduce((sum, p) => sum + p.fundingRatio, 0) / projections.length;
  const avgRisk = projections.reduce((sum, p) => sum + p.riskScore, 0) / projections.length;
  
  // Trend analysis (positive slope = good)
  const firstHalf = projections.slice(0, Math.floor(projections.length / 2));
  const secondHalf = projections.slice(Math.floor(projections.length / 2));
  const avgFirst = firstHalf.reduce((sum, p) => sum + p.closingBalance, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, p) => sum + p.closingBalance, 0) / secondHalf.length;
  const trendScore = avgSecond > avgFirst ? 100 : 50;
  
  const balanceScore = Math.min(100, Math.max(0, (avgBalance / 1000000) * 100));
  const fundingScore = Math.min(100, avgFunding);
  const riskScore = Math.max(0, 100 - avgRisk);
  
  return (
    balanceScore * weights.balance +
    fundingScore * weights.funding +
    riskScore * weights.risk +
    trendScore * weights.trend
  );
}
