// Utility to get priority items scheduled for a specific year

import { ReserveItem, FinancialConfig } from './financialCalculations';

export interface YearPriorityItemDetail extends ReserveItem {
  id: string;
  year: number;
  inflatedCost: number;
  originalCost: number;
  sirsTypeLabel: 'SIRs' | 'NonSIRs';
  isScheduled: boolean;
  nextReplacement: number; // year index when next replacement will occur
}

/**
 * Get all items scheduled for replacement in a specific year
 * Includes cost inflation and categorization
 */
export function getYearPriorityItems(
  items: ReserveItem[],
  config: FinancialConfig,
  yearIndex: number
): YearPriorityItemDetail[] {
  console.log('[yearPriorityCalculations] getYearPriorityItems called with:', {
    itemCount: items.length,
    yearIndex,
    configYearsToProject: config.yearsToProject,
    configInflationRate: config.inflationRate,
    configCurrentYear: config.currentYear,
  });

  const yearPriorities: YearPriorityItemDetail[] = [];

  items.forEach((item, idx) => {
    console.log(`[yearPriorityCalculations] Processing item ${idx}:`, {
      itemName: item.itemName,
      expectedLife: item.expectedLife,
      remainingLife: item.remainingLife,
      replacementCost: item.replacementCost,
      sirsType: item.sirsType,
    });

    if (!item.expectedLife || item.expectedLife <= 0) {
      console.log(`[yearPriorityCalculations] Item ${idx} skipped: invalid expectedLife`);
      return;
    }

    // Calculate which replacement years this item has in the projection period
    const replacementYears: number[] = [];
    let currentReplacementYear = item.remainingLife;
    
    while (currentReplacementYear < config.yearsToProject) {
      replacementYears.push(currentReplacementYear);
      currentReplacementYear += item.expectedLife;
    }

    console.log(`[yearPriorityCalculations] Item ${idx} replacement years:`, replacementYears);

    // Check if this item is scheduled for replacement in the requested yearIndex
    const scheduledInThisYear = replacementYears.includes(yearIndex);
    
    if (scheduledInThisYear) {
      console.log(`[yearPriorityCalculations] Item ${idx} IS scheduled for yearIndex ${yearIndex}`);
      
      // Calculate inflated cost for this specific year (yearIndex = years since start)
      const inflatedCost = item.replacementCost * Math.pow(1 + config.inflationRate, yearIndex);
      const calendarYear = config.currentYear + yearIndex;

      const detail: YearPriorityItemDetail = {
        ...item,
        id: `item-${idx}`,
        year: calendarYear,
        inflatedCost,
        originalCost: item.replacementCost,
        sirsTypeLabel: item.sirsType === 1 ? 'SIRs' : 'NonSIRs',
        isScheduled: true,
        nextReplacement: yearIndex,
      };

      console.log(`[yearPriorityCalculations] Adding item ${idx}:`, {
        itemName: item.itemName,
        year: calendarYear,
        yearIndex,
        inflatedCost: Math.round(inflatedCost),
      });

      yearPriorities.push(detail);
    } else {
      console.log(`[yearPriorityCalculations] Item ${idx} NOT scheduled for yearIndex ${yearIndex}`);
    }
  });

  console.log('[yearPriorityCalculations] Final result:', yearPriorities.length, 'items for yearIndex', yearIndex);
  return yearPriorities;
}

/**
 * Get ALL items with their next scheduled replacement year
 * Useful for the dropdown showing all priorities
 */
export function getAllYearPrioritiesWithSchedule(
  items: ReserveItem[],
  config: FinancialConfig
): YearPriorityItemDetail[] {
  const allPriorities: YearPriorityItemDetail[] = [];

  items.forEach((item, idx) => {
    if (!item.expectedLife || item.expectedLife <= 0) return;

    // First replacement
    if (item.remainingLife < config.yearsToProject) {
      const inflatedCost = item.replacementCost * Math.pow(1 + config.inflationRate, item.remainingLife);
      allPriorities.push({
        ...item,
        id: `item-${idx}`,
        year: config.currentYear + item.remainingLife,
        inflatedCost,
        originalCost: item.replacementCost,
        sirsTypeLabel: item.sirsType === 1 ? 'SIRs' : 'NonSIRs',
        isScheduled: true,
        nextReplacement: item.remainingLife,
      });
    }
  });

  // Sort by year and then by sirsType
  return allPriorities.sort((a, b) => {
    if (a.nextReplacement !== b.nextReplacement) {
      return a.nextReplacement - b.nextReplacement;
    }
    // SIRs before NonSIRs
    if (a.sirsType !== b.sirsType) {
      return (a.sirsType as number) - (b.sirsType as number);
    }
    return a.itemName.localeCompare(b.itemName);
  });
}

/**
 * Calculate total priority amount for a specific year
 */
export function getYearPriorityTotal(
  items: ReserveItem[],
  config: FinancialConfig,
  yearIndex: number
): number {
  const yearItems = getYearPriorityItems(items, config, yearIndex);
  return yearItems.reduce((sum, item) => sum + item.inflatedCost, 0);
}

/**
 * Get priority statistics for all years
 */
export function getYearPriorityStats(
  items: ReserveItem[],
  config: FinancialConfig
) {
  const stats = {
    totalItems: items.length,
    totalSIRs: 0,
    totalNonSIRs: 0,
    totalBudget: 0,
    byYear: new Map<number, { count: number; sirsCount: number; nonSirsCount: number; total: number }>(),
  };

  items.forEach((item) => {
    if (item.sirsType === 1) {
      stats.totalSIRs++;
    } else {
      stats.totalNonSIRs++;
    }

    if (!item.expectedLife || item.expectedLife <= 0) return;

    let yearIndex = item.remainingLife;
    while (yearIndex < config.yearsToProject) {
      const year = config.currentYear + yearIndex;
      const inflatedCost = item.replacementCost * Math.pow(1 + config.inflationRate, yearIndex);
      stats.totalBudget += inflatedCost;

      const existing = stats.byYear.get(year) || { count: 0, sirsCount: 0, nonSirsCount: 0, total: 0 };
      existing.count++;
      existing.total += inflatedCost;
      if (item.sirsType === 1) {
        existing.sirsCount++;
      } else {
        existing.nonSirsCount++;
      }
      stats.byYear.set(year, existing);

      yearIndex += item.expectedLife;
    }
  });

  return stats;
}

/**
 * DIAGNOSTIC: Deep trace of calculation logic for debugging
 * Shows exactly which items appear for which years
 */
export function debugYearPriorityFlow(
  items: ReserveItem[],
  config: FinancialConfig
) {
  const debug: any = {
    config: {
      currentYear: config.currentYear,
      yearsToProject: config.yearsToProject,
      inflationRate: config.inflationRate,
    },
    items: [] as any[],
  };

  items.forEach((item, idx) => {
    const itemDebug = {
      idx,
      itemName: item.itemName,
      expectedLife: item.expectedLife,
      remainingLife: item.remainingLife,
      replacementCost: item.replacementCost,
      sirsTypeLabel: item.sirsType === 1 ? 'SIRs' : 'NonSIRs',
      scheduledYears: [] as any[],
    };

    if (!item.expectedLife || item.expectedLife <= 0) {
      itemDebug.scheduledYears.push('SKIPPED: Invalid expected life');
    } else {
      // Calculate all replacement years
      let yearIndex = item.remainingLife;
      while (yearIndex < config.yearsToProject) {
        const calendarYear = config.currentYear + yearIndex;
        const inflatedCost = item.replacementCost * Math.pow(1 + config.inflationRate, yearIndex);
        itemDebug.scheduledYears.push({
          yearIndex,
          calendarYear,
          originalCost: item.replacementCost,
          inflatedCost: Math.round(inflatedCost),
          inflation: `${Math.round(((inflatedCost - item.replacementCost) / item.replacementCost) * 100)}%`,
        });
        yearIndex += item.expectedLife;
      }
    }

    debug.items.push(itemDebug);
  });

  // Now show which items appear for specific requested years
  debug.queryResults = {} as any;
  for (let testYear = 0; testYear < Math.min(config.yearsToProject, 5); testYear++) {
    const found = getYearPriorityItems(items, config, testYear);
    debug.queryResults[`yearIndex_${testYear}`] = {
      calendarYear: config.currentYear + testYear,
      itemCount: found.length,
      items: found.map(f => ({ itemName: f.itemName, cost: Math.round(f.inflatedCost) })),
    };
  }

  console.log('[DEBUG_YEAR_PRIORITY_FLOW]', debug);
  return debug;
}
