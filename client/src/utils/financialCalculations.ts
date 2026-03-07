// Professional Financial Modeling & Data Science Calculations

export interface FinancialConfig {
  startingBalance: number;
  monthlyFeePerUnit: number;
  totalUnits: number;
  inflationRate: number;
  currentYear: number;
  yearsToProject: number;
}

export interface ReserveItem {
  itemName: string;
  expectedLife: number;
  remainingLife: number;
  replacementCost: number;
  sirsType: string;
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

// Calculate Net Present Value
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

// Main projection engine
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
  
  // Group expenses by year
  const expensesByYear = new Map<number, number>();
  items.forEach(item => {
    const yearIndex = item.remainingLife;
    const inflatedCost = calculateCompoundGrowth(item.replacementCost, config.inflationRate, yearIndex);
    expensesByYear.set(yearIndex, (expensesByYear.get(yearIndex) || 0) + inflatedCost);
  });
  
  // Project each year
  for (let i = 0; i < config.yearsToProject; i++) {
    const year = config.currentYear + i;
    const openingBalance = balance;
    
    // Inflate contributions
    const inflatedContribution = calculateCompoundGrowth(annualContribution, config.inflationRate, i);
    
    // Calculate interest on opening balance
    const interest = openingBalance * config.inflationRate;
    
    // Get expenses for this year
    const expenses = expensesByYear.get(i) || 0;
    
    // Calculate closing balance
    balance = openingBalance + inflatedContribution + interest - expenses;
    
    cumulativeContributions += inflatedContribution;
    cumulativeExpenses += expenses;
    
    // Calculate funding ratio (balance / total future expenses)
    const futureExpenses = Array.from(expensesByYear.entries())
      .filter(([yearIdx]) => yearIdx >= i)
      .reduce((sum, [, cost]) => sum + cost, 0);
    const fundingRatio = futureExpenses > 0 ? (balance / futureExpenses) * 100 : 100;
    
    // Calculate risk score (0-100, lower is better)
    const riskScore = balance < 0 ? Math.min(100, Math.abs(balance) / 100000 * 100) : 0;
    
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
  
  // Calculate aggregate metrics
  const balances = projections.map(p => p.closingBalance);
  const deficitYears = balances.filter(b => b < 0).length;
  const peakDeficit = Math.min(...balances, 0);
  const volatility = calculateStdDev(balances);
  
  const metrics: FinancialMetrics = {
    totalContributions: cumulativeContributions,
    totalExpenses: cumulativeExpenses,
    netPosition: balance,
    avgAnnualExpense: cumulativeExpenses / config.yearsToProject,
    peakDeficit,
    deficitYears,
    fundingAdequacy: (cumulativeContributions / cumulativeExpenses) * 100,
    volatilityIndex: volatility / Math.abs(balance || 1) * 100,
    sustainabilityScore: Math.max(0, 100 - (deficitYears / config.yearsToProject * 100))
  };
  
  return { projections, metrics };
}

// Calculate optimal monthly fee to avoid deficit
export function calculateOptimalFee(
  config: FinancialConfig,
  items: ReserveItem[],
  targetBalance: number = 0
): number {
  let low = 0;
  let high = config.monthlyFeePerUnit * 5;
  let optimal = config.monthlyFeePerUnit;
  
  // Binary search for optimal fee
  for (let iteration = 0; iteration < 20; iteration++) {
    const testFee = (low + high) / 2;
    const testConfig = { ...config, monthlyFeePerUnit: testFee };
    const { projections } = calculateFinancialProjections(testConfig, items);
    
    const minBalance = Math.min(...projections.map(p => p.closingBalance));
    
    if (minBalance < targetBalance) {
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
