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