import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getYearPriorityItems, getAllYearPrioritiesWithSchedule, debugYearPriorityFlow } from '../utils/yearPriorityCalculations';
import type { YearPriorityItemDetail } from '../utils/yearPriorityCalculations';
import type { ReserveItem, FinancialConfig } from '../utils/financialCalculations';

export interface PriorityItem extends YearPriorityItemDetail {
  displayOrder?: number;
  isSplit?: boolean;
  isSelected?: boolean;
}

export interface YearPriorityConfig {
  priorities: PriorityItem[];
  filterType: 'all' | 'SIRs' | 'NonSIRs';
  searchQuery: string;
  selectedYear: number;
}

interface YearPriorityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  year?: number;
  yearIndex?: number;
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
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement>(null);

  console.log('[YearPriorityPopup] Props received:', {
    isOpen,
    year,
    yearIndex,
    reserveItemsCount: reserveItems?.length || 0,
    financialConfigKeys: financialConfig ? Object.keys(financialConfig).slice(0, 6) : null,
    financialConfigValues: financialConfig ? {
      currentYear: financialConfig.currentYear,
      yearsToProject: financialConfig.yearsToProject,
      inflationRate: financialConfig.inflationRate,
    } : null,
  });

  // Load real data when year or financial data changes
  useEffect(() => {
    console.log('[YearPriorityPopup] useEffect triggered:', {
      isOpen,
      year,
      yearIndex,
      reserveItemsCount: reserveItems?.length || 0,
      hasConfig: !!financialConfig,
    });
    
    if (isOpen && reserveItems && financialConfig && yearIndex !== undefined) {
      // Run full diagnostic on first popup open
      if (yearIndex === 0) {
        console.log('[YearPriorityPopup] ====== RUNNING FULL DIAGNOSTIC FLOW ======');
        debugYearPriorityFlow(reserveItems, financialConfig);
        console.log('[YearPriorityPopup] ====== DIAGNOSTIC COMPLETE ======');
      }
      
      console.log('[YearPriorityPopup] CALLING getYearPriorityItems with:', {
        yearIndex,
        configYearsToProject: financialConfig.yearsToProject,
        itemsCount: reserveItems.length,
      });
      
      const yearItems = getYearPriorityItems(reserveItems, financialConfig, yearIndex);
      
      console.log('[YearPriorityPopup] getYearPriorityItems returned:', {
        count: yearItems.length,
        items: yearItems.map(i => ({ itemName: i.itemName, inflatedCost: Math.round(i.inflatedCost) })),
      });
      
      const priorityItems: PriorityItem[] = yearItems.map((item, index) => ({
        ...item,
        displayOrder: index,
      }));
      
      console.log('[YearPriorityPopup] Setting priorities state to:', priorityItems.length, 'items');
      setPriorities(priorityItems);
    } else {
      console.log('[YearPriorityPopup] Conditions not met for loading data:', {
        isOpenCheck: !!isOpen,
        hasItemsCheck: !!reserveItems,
        hasConfigCheck: !!financialConfig,
        yearIndexConstraint: yearIndex !== undefined,
      });
    }
  }, [isOpen, yearIndex, reserveItems, financialConfig]);

  // Set initial position once when opened
  useEffect(() => {
    if (isOpen && !initialized) {
      setPosition(initialPosition ?? { x: window.innerWidth / 2 - 142, y: window.innerHeight / 2 - 300 });
      setInitialized(true);
    }
    if (!isOpen) setInitialized(false);
  }, [isOpen, initialPosition, initialized]);

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
  const priorityCount = priorities.length;

  const triggerApply = useCallback(() => {
    if (!onApply) return;
    onApply({ priorities, filterType, searchQuery, selectedYear: year || 0 });
  }, [priorities, filterType, searchQuery, year, onApply]);

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

    const newPriorities = [...priorities];
    [newPriorities[draggedIndex], newPriorities[targetIndex]] = [newPriorities[targetIndex], newPriorities[draggedIndex]];
    setPriorities(newPriorities);
    setDraggedItem(null);
    triggerApply();
  };

  const handleDeleteItem = (id: string) => {
    setPriorities(priorities.filter((p) => p.id !== id));
    triggerApply();
  };

  const handleToggleSelect = (id: string) => {
    setPriorities(priorities.map((p) =>
      p.id === id ? { ...p, isSelected: !p.isSelected } : p
    ));
    triggerApply();
  };

  if (!isOpen) return null;

  console.log('[YearPriorityPopup] RENDERING with:', {
    prioritiesCount: priorities.length,
    prioritiesData: priorities.map(p => ({ id: p.id, itemName: p.itemName, cost: Math.round(p.inflatedCost) })),
    totalAmount: Math.round(totalAmount),
    filteredCount: filteredPriorities.length,
    filterType,
  });

  return (
    <div
      ref={popupRef}
      onMouseDown={onMouseDown}
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
        cursor: 'grab',
        userSelect: 'none',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── HEADER (Fixed) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e5e5',
        flexShrink: 0,
        background: '#fff',
      }}>
        <div>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#000', letterSpacing: '-0.3px' }}>
            {priorityCount} Priorities
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
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 12px',
                  borderBottom: index < filteredPriorities.length - 1 ? '1px solid #e5e5e5' : 'none',
                  gap: '8px',
                  opacity: draggedItem === item.id ? 0.6 : 1,
                  cursor: draggedItem === item.id ? 'grabbing' : 'grab',
                  transition: 'opacity 0.2s ease',
                }}
              >
                {/* Drag Handle */}
                <div style={{ cursor: 'grab', color: '#ccc', display: 'flex', alignItems: 'center' }}>
                  <DragHandle />
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
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#12bf6c',
                    marginTop: '2px',
                  }}>
                    ${Math.round(item.inflatedCost).toLocaleString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                  {item.isSplit ? (
                    <button
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #c3c3c3',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: '#fff',
                        color: '#000',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f7f7f7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff';
                      }}
                    >
                      Split
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleSelect(item.id)}
                      style={{
                        padding: '4px 8px',
                        border: 'none',
                        borderRadius: '4px',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={item.isSelected ? 'Deselect' : 'Select'}
                    >
                      {item.isSelected ? <CheckmarkIcon /> : null}
                    </button>
                  )}

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
                    title="Delete"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default YearPriorityPopup;
