# How Monthly Fee Calculation Works
### A Simple Guide for Everyone

---

## What is this feature?

When you open a Reserve Study, the app shows you a **Monthly Fee** — the amount each homeowner pays every month to keep the building's reserve fund healthy.

You can click the Monthly Fee value to open the **Monthly Fee Adjustment popup**. This popup lets you change the fee and instantly see how it affects the fund over the coming years.

---

## The Two Tabs

### Manual Fees Tab
You drag a slider left or right to pick any monthly fee you want. The graph updates immediately to show you what the fund looks like with that fee.

### Advanced Tab
Gives you extra controls — including the most powerful one: **Optimize All Monthly Fees**.

---

## What Does "Optimize All Monthly Fees" Do?

Think of it like this:

> "What is the **smallest monthly fee** we can charge so the reserve fund **never runs out of money** over the entire study period?"

When you flip this toggle ON, the app automatically finds that exact number for you. You don't have to guess or drag the slider around. All the red (deficit) bars on the graph will disappear.

---

## How the App Finds That Number — Plain English

Imagine you are trying to guess a number between 1 and 1000. A smart way to do it:

1. Start in the middle → guess 500
2. Too low? Move up → guess 750
3. Still too low? Move up → guess 875
4. Too high? Move down → guess 812
5. Keep halving the gap... after 20 guesses you are extremely close to the right answer.

**That is exactly what the app does.** It tries a fee, runs the full 20–30 year projection, checks if the fund ever goes negative, then adjusts up or down. After 20 rounds of this it has the minimum safe fee, and it rounds it up to the nearest whole dollar.

---

## How Each Year is Projected

For every year in the study, the app calculates four things:

| What | How |
|---|---|
| **Money coming in (Contributions)** | Monthly Fee × Number of Units × 12 months. Each year this grows slightly because of inflation. |
| **Investment Return** | The fund earns interest on whatever money is sitting in it (only when the balance is positive). |
| **Expenses** | Items like roofs, elevators, and pipes need replacing. The app knows when each item is due and how much it will cost (adjusted for inflation). |
| **Closing Balance** | Opening Balance + Contributions + Interest − Expenses |

This repeats for every year of the study (e.g. 30 years). The closing balance of one year becomes the opening balance of the next.

---

## Simple Example

Imagine a building with:
- **100 units**
- **$500 starting reserve fund**
- A roof replacement costing **$200,000** due in year 5

| Year | Opens With | + Contributions | + Interest | − Expenses | Closes With |
|------|-----------|-----------------|-----------|-----------|-------------|
| 1 | $500 | $60,000 | $25 | $0 | $60,525 |
| 2 | $60,525 | $60,000 | $3,026 | $0 | $123,551 |
| 3 | $123,551 | $60,000 | $6,178 | $0 | $189,729 |
| 4 | $189,729 | $60,000 | $9,486 | $0 | $259,215 |
| 5 | $259,215 | $60,000 | $12,961 | **$200,000** | **$132,176** |

If the fee were too low, the fund would go negative in year 5. The optimizer raises the fee just enough so year 5 (and every other year) stays above $0.

---

## The Settings Panel

The popup also has four input fields that fine-tune the calculation:

| Field | What it does |
|---|---|
| **Maximum % Monthly Fees** | Caps how much the fee can increase year over year |
| **Inflation Rate** | Overrides the study's inflation rate (e.g. use 4% instead of 3%) |
| **Safety Net** | Keeps an extra dollar cushion in the fund (e.g. never go below $50,000) |
| **Cash Reserve Threshold** | Minimum balance to maintain at all times |

---

## Advanced Tab — Other Controls

| Control | What it does |
|---|---|
| **Custom Range** | Apply a specific fee only between two years you choose |
| **Gradual Custom Range** | Increase the fee gradually (by a % per year) between two years |

---

## Summary in One Sentence

> The app finds the **cheapest monthly fee** that keeps the reserve fund from going broke at any point in the future — by automatically testing thousands of fee amounts in milliseconds and narrowing down to the best one.

---

*This document describes the logic inside `client/src/utils/financialCalculations.ts` and `client/src/components/MonthlyFeePopup.tsx`.*
