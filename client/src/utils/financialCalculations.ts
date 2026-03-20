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

// Compute per-year annual contribution respecting custom range, gradual ramp, and growth cap
function computePerYearContribution(config: FinancialConfig, yearIndex: number): number {
  const year = config.currentYear + yearIndex;
  let feePerUnit = config.monthlyFeePerUnit;

  // Custom range: apply a flat override fee for years within the specified range
  if (config.customRange?.enabled) {
    const { startYear, endYear, feePerUnit: customFee } = config.customRange;
    if (year >= startYear && year <= endYear) {
      feePerUnit = customFee;
    }
  }

  // Gradual range: linearly ramp fee from base to base×(1+pctIncrease%) over the range
  if (config.gradualRange?.enabled) {
    const { startYear, endYear, pctIncrease } = config.gradualRange;
    if (year >= startYear && year <= endYear) {
      const span = Math.max(1, endYear - startYear);
      const progress = (year - startYear) / span;
      feePerUnit = feePerUnit * (1 + (pctIncrease / 100) * progress);
    }
  }

  const annualBase = feePerUnit * config.totalUnits * 12;
  // Cap annual growth by maxAnnualPctIncrease if the user has set it
  const growthRate =
    config.maxAnnualPctIncrease != null
      ? Math.min(config.inflationRate, config.maxAnnualPctIncrease / 100)
      : config.inflationRate;
  return calculateCompoundGrowth(annualBase, growthRate, yearIndex);
}

// Main projection engine with enhanced calculation logic
export function calculateFinancialProjections(
  config: FinancialConfig,
  items: ReserveItem[]
): { projections: YearlyProjection[]; metrics: FinancialMetrics } {
  
  const projections: YearlyProjection[] = [];
  const monthlyFee = config.monthlyFeePerUnit * config.totalUnits;
  const annualContribution = monthlyFee * 12;
  
  let balance = config.startingBalance;
  let cumulativeContributions = 0;
  let cumulativeExpenses = 0;
  
  // Group expenses by year with inflation — recurring every expectedLife years
  const expensesByYear = new Map<number, number>();
  items.forEach(item => {
    // Guard: skip items with no expected life (would cause infinite loop)
    if (!item.expectedLife || item.expectedLife <= 0) return;

    // First replacement at remainingLife, then every expectedLife years after that
    let yearIndex = item.remainingLife;
    while (yearIndex < config.yearsToProject) {
      const inflatedCost = calculateCompoundGrowth(item.replacementCost, config.inflationRate, yearIndex);
      expensesByYear.set(yearIndex, (expensesByYear.get(yearIndex) || 0) + inflatedCost);
      yearIndex += item.expectedLife;
    }
  });
  
  console.log('[FinancialCalculations] Expenses by year:', Object.fromEntries(expensesByYear));
  
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
  // Guard: if current fee is 0 or very small, set a meaningful upper bound
  let high = Math.max(config.monthlyFeePerUnit * 10, 5000);
  // If safetyNet is large, upper bound needs to be higher
  if (effectiveTarget > 0) high = Math.max(high, effectiveTarget / (config.totalUnits * 12) * 2);
  let optimal = config.monthlyFeePerUnit;

  // Binary search for optimal fee — 50 iterations gives precision of high/2^50
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
