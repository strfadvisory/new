# Year Priority Popup - Update Flow Documentation

## Overview
The YearPriorityPopup component now has full integration with the entire system to ensure all changes are reflected across the calculator graph, list, and left panel immediately.

## Key Features Implemented

### 1. **Project Management**
- ✅ Drag-and-drop reordering with visual rank numbers
- ✅ Real-time filtering by SIRs/NonSIRs/All items
- ✅ Quick search by item name

### 2. **Budget Management**
- ✅ Inline cost editing (click cost to edit)
- ✅ Enter/Escape keyboard shortcuts for edit mode
- ✅ Real-time total and category breakdowns
- ✅ Budget allocation tracking

### 3. **Cost Management**
- ✅ Interactive cost splitting with percentage slider
- ✅ Split modal with live preview
- ✅ Separate priority items created for each split part
- ✅ Cost validation (must be > 0)

### 4. **Item Management**
- ✅ Delete items with confirmation feedback
- ✅ SIRs and NonSIRs categorization
- ✅ Toggle selection (marked with checkmark)
- ✅ Drag-drop reordering maintains priority

## Data Flow Architecture

### Component Hierarchy
```
CalculatorPage (Main Container)
  ├── LeftPanel (Controls & Info)
  │   ├── YearPriorityPopup (Modal - Priority Management)
  │   │   └── SplitModal (Interactive Split Dialog)
  │   ├── MonthlyFeePopup
  │   └── Housing Units Editor
  └── FundGraph (Visualization)
      └── List View (Alternative View)
```

### Update Flow

```
1. User modifies a priority (delete/edit/split/reorder)
                          ↓
2. YearPriorityPopup calls triggerApply() 
   - Logs change with console output
   - Calls onApply callback with updated config
                          ↓
3. LeftPanel's handleYearPriorityApply() executes
   - Saves config to yearPriorityConfigs state
   - Dispatches 'yearPriorityUpdated' custom event
   - Includes: year, priorities, budgetAllocation, totals
                          ↓
4. CalculatorPage listens for 'yearPriorityUpdated' event
   - Receives priority update details
   - Broadcasts 'yearPrioritiesChanged' event to other components
   - Ensures selected year data matches update
                          ↓
5. FundGraph & List components listen for event
   - Recalculate with new priority data
   - Update visualization instantly
   - Refresh totals and breakdowns
                          ↓
6. LeftPanel updates display
   - Shows new totals
   - Updates priority count
   - Displays SIRs/NonSIRs breakdown
```

## Event System

### Custom Events Dispatched

#### `yearPriorityUpdated`
**Source:** LeftPanel  
**Detail:**
```typescript
{
  year: number,
  priorities: PriorityItem[],
  budgetAllocation?: Record<string, number>
}
```

#### `yearPrioritiesChanged`
**Source:** CalculatorPage  
**Detail:**
```typescript
{
  year: number,
  priorities: PriorityItem[],
  budgetAllocation?: Record<string, number>
}
```

## Console Logging

The implementation includes comprehensive logging for debugging:

### YearPriorityPopup Logs
- `[YearPriorityPopup] Props received` - Initial prop values
- `[YearPriorityPopup] getYearPriorityItems returned` - Loaded items count and details
- `[YearPriorityPopup] RENDERING with` - Current state of priorities
- `[YearPriorityPopup] Triggering onApply` - Each time state changes
- `[YearPriorityPopup] Deleting item` - Item deletion
- `[YearPriorityPopup] Editing cost for item` - Cost edit actions
- `[YearPriorityPopup] Reordering items` - Drag-drop actions
- `[YearPriorityPopup] Splitting item` - Split operations

### LeftPanel Logs
- `[LeftPanel] Year Priority config updated` - Config changes received
- `[LeftPanel] Broadcasting priority update to parent components` - Event dispatch

### CalculatorPage Logs
- `[CalculatorPage] Year priority updated event received` - Event listener triggered
- `[CalculatorPage] Broadcasting priority update to FundGraph` - Relay to other components

## State Tracking

### YearPriorityPopup Local State
```typescript
priorities: PriorityItem[]              // Current list of items
filterType: 'all' | 'SIRs' | 'NonSIRs'  // Active filter
searchQuery: string                      // Search filter
budgetAllocation: Record<string, number> // Budget per item
editingId: string | null                 // Currently editing item
editValue: number                         // Edit cost value
splitModalOpen: boolean                   // Split modal visibility
splitItemId: string | null               // Item being split
position: { x: number; y: number }      // Popup position
```

### LeftPanel State
```typescript
yearPriorityConfigs: Record<number, YearPriorityConfig>
  // Stores configs for each year that was modified
```

## User Interactions

### Editing a Cost
1. Click on the cost value (green text)
2. Type new amount
3. Press Enter to save or Escape to cancel
4. Change broadcasts to parent components

### Splitting an Item
1. Click "Split" button on item row
2. Adjust percentage slider in modal (shows live preview)
3. Click "Split Now" to create two items
4. Original cost distributed, two new items created
5. Both marked as `isSplit: true`

### Reordering Priorities
1. Click and drag item by rank number
2. Drop on target position
3. Order persists in state
4. Update broadcasts immediately

### Deleting a Priority
1. Click delete (trash) icon
2. Item removed from list
3. Totals recalculate instantly
4. Change broadcasts to graph and list views

### Filtering and Searching
1. Select filter from dropdown (All/SIRs/NonSIRs)
2. Type in search field for name matching
3. List filters in real-time
4. No update event (local view only)

## Real-Time Updates Confirmation

✅ **When you delete an item:**
- Removed from YearPriorityPopup
- Event broadcasts to LeftPanel → CalculatorPage → FundGraph
- Graph recalculates expenses for that year
- List updates to show new totals
- Left panel shows updated count and breakdown

✅ **When you edit a cost:**
- Popup shows new amount immediately
- Total and category breakdown update
- Event broadcasts with new cost
- Graph adjusts funding ratio calculations
- List reflects new expense amounts

✅ **When you split an item:**
- Two new entries appear in the list
- Both are linked to original item concept
- Event includes both split items
- Graph sees two separate line items
- Totals reflect actual expenses

## Configuration Interface

```typescript
export interface YearPriorityConfig {
  priorities: PriorityItem[];
  filterType: 'all' | 'SIRs' | 'NonSIRs';
  searchQuery: string;
  selectedYear: number;
  budgetAllocation?: Record<string, number>;
}

export interface PriorityItem extends YearPriorityItemDetail {
  displayOrder?: number;
  isSplit?: boolean;
  isSelected?: boolean;
  isEditing?: boolean;
  editedCost?: number;
  splitAmount?: number;
  allocatedBudget?: number;
}
```

## Browser Compatibility

- Event System: Uses CustomEvent (IE11+ via polyfill, modern browsers native)
- Local Storage: Uses window.dispatchEvent and addEventListener
- No external event libraries required
- Native React state management

## Future Enhancements

- [ ] Persist configurations to localStorage
- [ ] Add undo/redo for changes
- [ ] Batch operations (select multiple & delete)
- [ ] Cost templates/quick-fill
- [ ] Historical comparison (before/after split)
- [ ] Export priority list as PDF
