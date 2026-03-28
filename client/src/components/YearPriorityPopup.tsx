import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getYearPriorityItems, debugYearPriorityFlow } from '../utils/yearPriorityCalculations';
import type { YearPriorityItemDetail } from '../utils/yearPriorityCalculations';
import type { ReserveItem, FinancialConfig } from '../utils/financialCalculations';

/**
 * YearPriorityPopup Component
 * 
 * Shows ALL reserve items that can be dragged to future years for prioritization.
 * 
 * FUNCTIONALITY:
 * - Display all reserve items with inflated costs for the selected year
 * - Allow dragging any item to future year bars in the graph
 * - Edit and split item costs inline
 * - Filter and search through all items
 * 
 * DATA FLOW:
 * 1. User opens popup for a year (via LeftPanel click)
 * 2. Component loads ALL reserve items with year-specific inflation
 * 3. User can drag any item to future year bars for prioritization
 * 4. Each drag creates/updates year-specific priority configurations
 * 5. LeftPanel broadcasts 'yearPriorityUpdated' event
 * 6. CalculatorPage listens and updates yearPriorityConfigs
 * 7. FundGraph recalculates with new priority data
 */

export interface PriorityItem extends YearPriorityItemDetail {
  displayOrder?: number;
  isSplit?: boolean;
  isSelected?: boolean;
  isEditing?: boolean;
  editedCost?: number;
  splitAmount?: number;
  allocatedBudget?: number;
}

export interface YearPriorityConfig {
  priorities: PriorityItem[];
  filterType: 'all' | 'SIRs' | 'NonSIRs';
  searchQuery: string;
  selectedYear: number;
  budgetAllocation?: Record<string, number>;
}

interface YearPriorityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  year?: number;
  yearIndex?: number;
  yearPriorityConfig?: YearPriorityConfig;
  reserveItems?: ReserveItem[];
  financialConfig?: FinancialConfig;
  initialPosition?: { x: number; y: number };
  onApply?: (config: YearPriorityConfig) => void;
}

// Close icon
const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1L11 11M11 1L1 11" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Drag handle icon
const DragHandle = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="3" cy="3" r="1.5" fill="#999" />
    <circle cx="3" cy="7" r="1.5" fill="#999" />
    <circle cx="3" cy="11" r="1.5" fill="#999" />
    <circle cx="8" cy="3" r="1.5" fill="#999" />
    <circle cx="8" cy="7" r="1.5" fill="#999" />
    <circle cx="8" cy="11" r="1.5" fill="#999" />
  </svg>
);

// Delete icon
const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 3.5H13M5.5 6V10M8.5 6V10M2 3.5L2.5 11.5C2.5 12.3 3.2 13 4 13H10C10.8 13 11.5 12.3 11.5 11.5L12 3.5M5 3.5V2C5 1.4 5.4 1 6 1H8C8.6 1 9 1.4 9 2V3.5" stroke="#999" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Checkmark icon
const CheckmarkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 7L5 11L13 2" stroke="#12bf6c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const YearPriorityPopup: React.FC<YearPriorityPopupProps> = ({
  isOpen,
  onClose,
  year,
  yearIndex,
  yearPriorityConfig,
  reserveItems,
  financialConfig,
  initialPosition = { x: 0, y: 0 },
  onApply,
}) => {
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'SIRs' | 'NonSIRs'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState(initialPosition);
  const [initialized, setInitialized] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [splitInlineId, setSplitInlineId] = useState<string | null>(null);
  const [splitAmount, setSplitAmount] = useState<number>(0);
  const [budgetAllocation, setBudgetAllocation] = useState<Record<string, number>>({});
  const [shouldApply, setShouldApply] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  // Filter and search priorities
  const filteredPriorities = priorities.filter((p) => {
    if (filterType !== 'all' && p.sirsTypeLabel !== filterType) return false;
    if (searchQuery && !p.itemName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calculate totals
  const totalAmount = priorities.reduce((sum, p) => sum + p.inflatedCost, 0);
  const sirsAmount = priorities.filter((p) => p.sirsTypeLabel === 'SIRs').reduce((sum, p) => sum + p.inflatedCost, 0);
  const nonSirsAmount = priorities.filter((p) => p.sirsTypeLabel === 'NonSIRs').reduce((sum, p) => sum + p.inflatedCost, 0);

  console.log('[YearPriorityPopup] Rendering:', {
    year,
    yearIndex,
    itemCount: priorities.length,
    filteredCount: filteredPriorities.length,
    hasYearPriorityConfig: !!yearPriorityConfig,
    configItemCount: yearPriorityConfig?.priorities?.length || 0,
    isOpen,
  });

  // SINGLE SOURCE OF TRUTH: Load data when popup opens or config changes
  useEffect(() => {
    if (!isOpen || yearIndex === undefined) {
      console.log('[YearPriorityPopup] Popup closed or no yearIndex, clearing state');
      setPriorities([]);
      return;
    }

    console.log('[YearPriorityPopup] *** LOADING DATA *** for year', year, 'yearIndex:', yearIndex);
    console.log('[YearPriorityPopup] Config available:', {
      hasConfig: !!yearPriorityConfig,
      configYear: yearPriorityConfig?.selectedYear,
      configItemCount: yearPriorityConfig?.priorities?.length || 0,
    });

    // PRIORITY 1: Always use saved config if available (includes dropped items)
    // Check for Array.isArray — an empty array is a valid state meaning all items were moved out
    if (yearPriorityConfig && Array.isArray(yearPriorityConfig.priorities)) {
      console.log('[YearPriorityPopup] ✅ Using saved config with', yearPriorityConfig.priorities.length, 'items');
      console.log('[YearPriorityPopup] Config items:', yearPriorityConfig.priorities.map(p => ({
        id: p.id,
        name: p.itemName,
        cost: Math.round(p.inflatedCost)
      })));

      setPriorities([...yearPriorityConfig.priorities]);
      setFilterType(yearPriorityConfig.filterType || 'all');
      setSearchQuery(yearPriorityConfig.searchQuery || '');
      setBudgetAllocation(yearPriorityConfig.budgetAllocation || {});
    }
    // PRIORITY 2: Calculate from reserve items (only if no saved config exists at all)
    else if (reserveItems && financialConfig) {
      console.log('[YearPriorityPopup] ⚙️ No saved config, calculating from reserve items');
      const yearItems = getYearPriorityItems(reserveItems, financialConfig, yearIndex);
      const activePriorities: PriorityItem[] = yearItems.map((item, idx) => ({
        ...item,
        displayOrder: idx,
      }));

      console.log('[YearPriorityPopup] Calculated', activePriorities.length, 'scheduled items');
      if (activePriorities.length > 0) {
        console.log('[YearPriorityPopup] Calculated items:', activePriorities.map(p => ({ 
          id: p.id, 
          name: p.itemName, 
          cost: Math.round(p.inflatedCost) 
        })));
      }
      
      setPriorities([...activePriorities]);
      setFilterType('all');
      setSearchQuery('');
      setBudgetAllocation({});
    } else {
      console.log('[YearPriorityPopup] ❌ No data available');
      setPriorities([]);
    }
  }, [isOpen, yearIndex, yearPriorityConfig, reserveItems, financialConfig, year]);

  // Set initial position once when opened
  useEffect(() => {
    if (isOpen && !initialized) {
      setPosition(initialPosition ?? { x: window.innerWidth / 2 - 142, y: window.innerHeight / 2 - 300 });
      setInitialized(true);
    }
    if (!isOpen) setInitialized(false);
  }, [isOpen, initialPosition, initialized]);

  // Listen for successful drops and remove items from this popup
  useEffect(() => {
    const handleItemDropped = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { sourceYear, targetYear, itemId } = customEvent.detail;

      console.log('[YearPriorityPopup] *** DROP EVENT RECEIVED ***', {
        sourceYear,
        targetYear,
        itemId,
        currentPopupYear: year,
        isOpen,
        currentItemCount: priorities.length
      });

      // If this popup is showing the source year, remove the item immediately
      if (year === sourceYear && isOpen) {
        console.log('[YearPriorityPopup] *** REMOVING FROM SOURCE YEAR ***', sourceYear);

        const itemToRemove = priorities.find(p => p.id === itemId);
        const updated = priorities.filter(p => p.id !== itemId);

        console.log('[YearPriorityPopup] Item removal:', {
          itemFound: !!itemToRemove,
          itemName: itemToRemove?.itemName,
          itemCost: itemToRemove?.inflatedCost,
          beforeCount: priorities.length,
          afterCount: updated.length,
          actuallyRemoved: priorities.length - updated.length
        });

        if (updated.length !== priorities.length) {
          setPriorities(updated);
          // Call onApply synchronously so the source config is saved before any
          // async yearPriorityUpdated event fires and remounts this popup.
          // Previously used setTimeout(setShouldApply) inside a state updater which
          // raced against CalculatorPage's own setTimeout dispatch of yearPriorityUpdated,
          // causing the popup to remount before the config was saved and reload with
          // the original (un-filtered) items from getYearPriorityItems.
          if (onApply) {
            onApply({
              priorities: updated,
              filterType,
              searchQuery,
              selectedYear: year || 0,
              budgetAllocation,
            });
          }
        }
      }
    };

    window.addEventListener('itemDroppedToYear', handleItemDropped);

    return () => {
      window.removeEventListener('itemDroppedToYear', handleItemDropped);
    };
  }, [year, isOpen, priorities, filterType, searchQuery, budgetAllocation, onApply]);

  // Listen for force refresh events (when items are dropped to this year)
  useEffect(() => {
    const handleForceRefresh = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { year: refreshYear, config } = customEvent.detail;
      
      if (refreshYear === year && isOpen) {
        console.log('[YearPriorityPopup] *** FORCE REFRESH *** for year:', refreshYear);
        console.log('[YearPriorityPopup] Refresh config:', {
          hasConfig: !!config,
          itemCount: config?.priorities?.length || 0
        });
        
        // If we have the updated config, use it immediately
        if (config && config.priorities) {
          console.log('[YearPriorityPopup] Applying refresh config immediately');
          setPriorities([...config.priorities]);
          setFilterType(config.filterType || 'all');
          setSearchQuery(config.searchQuery || '');
          setBudgetAllocation(config.budgetAllocation || {});
        }
        
        // Force re-render by incrementing the key
        setForceUpdateKey(prev => prev + 1);
      }
    };

    window.addEventListener('forcePopupRefresh', handleForceRefresh);
    
    return () => {
      window.removeEventListener('forcePopupRefresh', handleForceRefresh);
    };
  }, [year, isOpen]);

  // Trigger apply callback whenever priorities change (after async state update)
  useEffect(() => {
    if (shouldApply && onApply) {
      const config = { 
        priorities, 
        filterType, 
        searchQuery, 
        selectedYear: year || 0,
        budgetAllocation,
      };
      onApply(config);
      setShouldApply(false);
    }
  }, [priorities, shouldApply, filterType, searchQuery, year, budgetAllocation, onApply]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('input') || target.closest('button') || target.closest('svg')) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Handle item reordering
  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = priorities.findIndex((p) => p.id === draggedItem);
    const targetIndex = priorities.findIndex((p) => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    console.log('[YearPriorityPopup] Reordering items:', { draggedIndex, targetIndex });
    const newPriorities = [...priorities];
    [newPriorities[draggedIndex], newPriorities[targetIndex]] = [newPriorities[targetIndex], newPriorities[draggedIndex]];
    setPriorities(newPriorities);
    setDraggedItem(null);
    setShouldApply(true);
  };

  const handleDeleteItem = (id: string) => {
    console.log('[YearPriorityPopup] Deleting item:', id);
    const itemToDelete = priorities.find(p => p.id === id);
    if (itemToDelete) {
      console.log('[YearPriorityPopup] Item details:', {
        id: itemToDelete.id,
        itemName: itemToDelete.itemName,
        cost: Math.round(itemToDelete.inflatedCost),
      });
    }
    
    setPriorities((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      console.log('[YearPriorityPopup] After delete:', {
        previousCount: prev.length,
        newCount: updated.length,
        removed: prev.length - updated.length,
      });
      return updated;
    });
    setShouldApply(true);
  };

  const handleToggleSelect = (id: string) => {
    setPriorities(priorities.map((p) =>
      p.id === id ? { ...p, isSelected: !p.isSelected } : p
    ));
    setShouldApply(true);
  };

  const handleEditCost = (id: string, currentCost: number) => {
    setEditingId(id);
    setEditValue(currentCost);
  };

  const handleSaveCostEdit = (id: string) => {
    if (editValue <= 0) {
      alert('Cost must be greater than 0');
      return;
    }
    console.log('[YearPriorityPopup] Editing cost for item:', { id, newCost: editValue });
    setPriorities(priorities.map((p) =>
      p.id === id ? { ...p, inflatedCost: editValue } : p
    ));
    setEditingId(null);
    setShouldApply(true);
  };

  const handleOpenSplitInline = (id: string) => {
    const item = priorities.find((p) => p.id === id);
    if (!item) return;
    if (item.sirsType !== 0) {
      alert('Only SIRs=0 items can be split.');
      return;
    }
    setSplitInlineId(id);
    setSplitAmount(Math.round(item.inflatedCost / 2));
  };

  const handleCloseSplitInline = () => {
    setSplitInlineId(null);
    setSplitAmount(0);
  };

  const handleConfirmSplit = () => {
    if (!splitInlineId) return;
    
    const originalItem = priorities.find((p) => p.id === splitInlineId);
    if (!originalItem) return;

    // Validate amount
    if (splitAmount <= 0) {
      alert('Split amount must be greater than 0');
      return;
    }
    
    if (splitAmount >= originalItem.inflatedCost) {
      alert(`Split amount must be less than parent cost (${Math.round(originalItem.inflatedCost)})`);
      return;
    }

    console.log('[YearPriorityPopup] Splitting item:', { id: splitInlineId, childAmount: splitAmount, parentAmount: originalItem.inflatedCost - splitAmount });

    const newId = `${splitInlineId}-split-${Date.now()}`;
    const parentAmount = originalItem.inflatedCost - splitAmount;
    
    const newItems = priorities.map((p) =>
      p.id === splitInlineId ? { ...p, inflatedCost: parentAmount, isSplit: true } : p
    );
    
    newItems.push({
      ...originalItem,
      id: newId,
      inflatedCost: splitAmount,
      isSplit: true,
    });

    setPriorities(newItems);
    handleCloseSplitInline();
    setShouldApply(true);
  };

  const handleAllocateBudget = (id: string, amount: number) => {
    setBudgetAllocation((prev) => ({
      ...prev,
      [id]: amount,
    }));
    setShouldApply(true);
  };

  if (!isOpen) return null;

  return (
    <>
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: '284px',
        background: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        zIndex: 2000,
        cursor: 'default',
        userSelect: 'none',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── HEADER (Fixed) ── */}
      <div
        onMouseDown={onMouseDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e5e5',
          flexShrink: 0,
          background: '#fff',
          cursor: 'grab',
        }}
      >
        <div>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#000', letterSpacing: '-0.3px' }}>
            Priority ({year ?? 'N/A'})
          </span>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#000', marginTop: '2px' }}>
            ${Math.round(totalAmount).toLocaleString()}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
        >
          <CloseIcon />
        </button>
      </div>

      {/* ── BREAKDOWN SECTION ── */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e5e5',
        background: '#fafafa',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#999', fontWeight: '400' }}>SIRs Items</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#000', marginTop: '4px' }}>
              ${Math.round(sirsAmount).toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#999', fontWeight: '400' }}>Non SIRs Items</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#000', marginTop: '4px' }}>
              ${Math.round(nonSirsAmount).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER DROPDOWN & SEARCH ── */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Dropdown */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'SIRs' | 'NonSIRs')}
          style={{
            padding: '8px 12px',
            border: '1px solid #dedede',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'inherit',
            cursor: 'pointer',
            background: '#f7f7f7',
            color: '#000',
            outline: 'none',
          }}
        >
          <option value="all">All Items</option>
          <option value="SIRs">SIRs Items</option>
          <option value="NonSIRs">Non SIRs Items</option>
        </select>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #dedede',
          borderRadius: '6px',
          padding: '6px 10px',
          background: '#f7f7f7',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: '6px' }}>
            <circle cx="5.5" cy="5.5" r="4" stroke="#999" strokeWidth="1" fill="none" />
            <path d="M9 9L13 13" stroke="#999" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '12px',
              fontFamily: 'inherit',
              color: '#000',
            }}
          />
        </div>
      </div>

      {/* ── SCROLLABLE ITEMS LIST ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        background: '#fff',
      }}>
        {/* Instruction text */}
        {filteredPriorities.some(p => p.sirsType === 0) && (
          <div style={{
            padding: '8px 16px',
            background: '#f0f8ff',
            borderBottom: '1px solid #e5e5e5',
            fontSize: '11px',
            color: '#2563eb',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            💡 Drag items with grip handles to future year bars in the graph below
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredPriorities.length === 0 ? (
            <div style={{
              padding: '20px 16px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#999',
            }}>
              No priorities found
            </div>
          ) : (
            filteredPriorities.map((item, index) => (
              <React.Fragment key={item.id}>
                <div
                  draggable={item.sirsType === 0}
                  onDragStart={(e) => {
                    if (item.sirsType !== 0) {
                      e.preventDefault();
                      alert('Only SIRs=0 items can be moved.');
                      return;
                    }
                    const dragPayload = {
                      item,
                      sourceYear: year,
                      itemName: item.itemName,
                      cost: item.inflatedCost,
                      // Pass full unfiltered list so FundGraph can always build the correct
                      // source config (removing the dragged item) even when no prior config exists
                      allSourceItems: priorities,
                    };
                    console.log('[YearPriorityPopup] Drag started:', dragPayload);
                    e.dataTransfer.setData('application/json', JSON.stringify(dragPayload));
                    e.dataTransfer.effectAllowed = 'move';
                    handleDragStart(item.id);
                  }}
                  onDragEnd={() => {
                    console.log('[YearPriorityPopup] Drag ended for item:', item.id);
                    setDraggedItem(null);
                  }}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 12px',
                    borderBottom: index < filteredPriorities.length - 1 ? '1px solid #e5e5e5' : 'none',
                    gap: '8px',
                    opacity: draggedItem === item.id ? 0.5 : 1,
                    cursor: item.sirsType === 0 ? (draggedItem === item.id ? 'grabbing' : 'grab') : 'default',
                    transition: 'opacity 0.2s ease, background-color 0.2s ease',
                    backgroundColor: draggedItem === item.id ? '#f0f8ff' : 'transparent',
                    border: draggedItem === item.id ? '1px dashed #2196f3' : '1px solid transparent',
                    borderRadius: draggedItem === item.id ? '4px' : '0',
                  }}
                  title={item.sirsType === 0 ? `Drag "${item.itemName}" to a future year in the graph below` : `"${item.itemName}" cannot be moved (SIRs=${item.sirsType})`}
              >
                {/* Drag Handle */}
                <div style={{ 
                  cursor: item.sirsType === 0 ? 'grab' : 'default', 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '10px', 
                  fontWeight: '600', 
                  minWidth: '18px', 
                  color: item.sirsType === 0 ? '#999' : '#ccc',
                  position: 'relative'
                }}>
                  {index + 1}
                  {item.sirsType === 0 && (
                    <div style={{
                      position: 'absolute',
                      right: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '4px',
                      height: '12px',
                      background: 'linear-gradient(to bottom, #ddd 0%, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%, #ddd 100%)',
                      backgroundSize: '100% 3px',
                      opacity: 0.6
                    }} />
                  )}
                </div>

                {/* Item Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#000',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.itemName}
                  </div>
                  {editingId === item.id ? (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        style={{
                          width: '70px',
                          padding: '4px 6px',
                          border: '1px solid #12bf6c',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#12bf6c',
                        }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveCostEdit(item.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button
                        onClick={() => handleSaveCostEdit(item.id)}
                        style={{
                          padding: '2px 8px',
                          background: '#12bf6c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#0da85c'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#12bf6c'}
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          padding: '2px 8px',
                          background: '#e5e5e5',
                          color: '#666',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#d9d9d9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#e5e5e5'}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleEditCost(item.id, item.inflatedCost)}
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#12bf6c',
                        marginTop: '2px',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      title="Click to edit cost"
                    >
                      ${Math.round(item.inflatedCost).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    onClick={() => handleOpenSplitInline(item.id)}
                    disabled={item.sirsType !== 0}
                    style={{
                      padding: '4px 8px',
                      border: '1px solid #c3c3c3',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: item.sirsType === 0 ? 'pointer' : 'not-allowed',
                      background: item.sirsType === 0 ? '#fff' : '#f3f3f3',
                      color: item.sirsType === 0 ? '#000' : '#999',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f7f7f7';
                      e.currentTarget.style.borderColor = '#999';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.borderColor = '#c3c3c3';
                    }}
                    title="Split this item into multiple priority items"
                  >
                    Split
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    style={{
                      padding: '4px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#d32f2f'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                    title="Delete this priority"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>

              {/* Inline Split UI */}
              {splitInlineId === item.id && (
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  padding: '12px',
                  marginLeft: '26px',
                  marginRight: '12px',
                  marginTop: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#000' }}>
                    {item.itemName}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={splitAmount}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), item.inflatedCost - 1);
                        setSplitAmount(Math.max(0, val));
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}
                      min="0"
                      max={item.inflatedCost - 1}
                      placeholder="Enter amount"
                    />

                    <button
                      onClick={handleConfirmSplit}
                      style={{
                        padding: '6px 12px',
                        background: '#12bf6c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#0da85c'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#12bf6c'}
                    >
                      ✓
                    </button>

                    <button
                      onClick={handleCloseSplitInline}
                      style={{
                        padding: '6px 8px',
                        background: '#e5e5e5',
                        color: '#666',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#d9d9d9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#e5e5e5'}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ fontSize: '11px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Child amount:</span>
                    <span style={{ fontWeight: '600', color: '#12bf6c' }}>${Math.round(splitAmount).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Parent remaining:</span>
                    <span style={{ fontWeight: '600', color: '#666' }}>${Math.round(item.inflatedCost - splitAmount).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default YearPriorityPopup;
