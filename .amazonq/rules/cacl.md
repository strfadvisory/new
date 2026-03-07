# Calculator Feature Context

## Keyword Mapping

In this repository, the keyword **"calc"** or **"calculator"** refers to the **financial calculator feature**.

Whenever a prompt mentions **calc**, Amazon Q should automatically consider the following files.

## Related Files

* `client/src/components/CalculatorPage.tsx`
* `client/src/components/LeftPanel.tsx`
* `client/src/components/FundGraph.tsx`

## File Responsibilities

### CalculatorPage.tsx

Main container for the calculator page.

Responsibilities:

* Manages calculator state
* Connects inputs with results
* Coordinates LeftPanel and FundGraph

### LeftPanel.tsx

Handles calculator inputs.

Responsibilities:

* User inputs
* Configuration fields
* Triggering calculations

### FundGraph.tsx

Displays calculated results.

Responsibilities:

* Graph rendering
* Financial projection visualization
* Display yearly results

## Instruction for Amazon Q

When a prompt includes:

* "calc"
* "calculator"
* "update calc"
* "fix calc logic"
* "calc graph"

Amazon Q should:

1. Review all three files together.
2. Assume they belong to the same feature.
3. Ensure changes remain consistent across:

   * UI inputs
   * calculation logic
   * graph visualization.

## Notes

* The calculator works with financial reserve data.
* Input data includes a `config` object and an `items` array.
* The number of items may vary depending on the dataset.
