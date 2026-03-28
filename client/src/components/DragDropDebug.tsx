import React, { useState, useEffect } from 'react';

interface DebugState {
  yearPriorityConfigs: Record<number, any>;
  lastEvent: string;
  timestamp: number;
}

const DragDropDebug: React.FC = () => {
  const [debugState, setDebugState] = useState<DebugState>({
    yearPriorityConfigs: {},
    lastEvent: 'None',
    timestamp: Date.now()
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateConfigs = () => {
      const configs = (window as any).__yearPriorityConfigs || {};
      setDebugState(prev => ({
        ...prev,
        yearPriorityConfigs: configs,
        timestamp: Date.now()
      }));
    };

    const handleEvents = (eventName: string) => (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(`[DragDropDebug] ${eventName} event:`, customEvent.detail);
      
      setDebugState(prev => ({
        ...prev,
        lastEvent: `${eventName}: ${JSON.stringify(customEvent.detail)}`,
        timestamp: Date.now()
      }));
      
      // Update configs after a short delay
      setTimeout(updateConfigs, 100);
    };

    // Listen to all drag-drop related events
    window.addEventListener('itemDroppedToYear', handleEvents('itemDroppedToYear'));
    window.addEventListener('yearPriorityUpdated', handleEvents('yearPriorityUpdated'));
    window.addEventListener('forcePopupRefresh', handleEvents('forcePopupRefresh'));

    // Update configs periodically
    const interval = setInterval(updateConfigs, 1000);

    return () => {
      window.removeEventListener('itemDroppedToYear', handleEvents('itemDroppedToYear'));
      window.removeEventListener('yearPriorityUpdated', handleEvents('yearPriorityUpdated'));
      window.removeEventListener('forcePopupRefresh', handleEvents('forcePopupRefresh'));
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '80vh',
      background: 'white',
      border: '2px solid #ff6b6b',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#ff6b6b', fontSize: '14px' }}>Drag-Drop Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#999'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Last Event:</strong>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '8px', 
          borderRadius: '4px', 
          marginTop: '4px',
          wordBreak: 'break-all'
        }}>
          {debugState.lastEvent}
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Timestamp:</strong> {new Date(debugState.timestamp).toLocaleTimeString()}
      </div>

      <div>
        <strong>Year Priority Configs:</strong>
        <div style={{ 
          background: '#f5f5f5', 
          padding: '8px', 
          borderRadius: '4px', 
          marginTop: '4px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {Object.keys(debugState.yearPriorityConfigs).length === 0 ? (
            <div style={{ color: '#999', fontStyle: 'italic' }}>No configs available</div>
          ) : (
            Object.entries(debugState.yearPriorityConfigs).map(([year, config]) => (
              <div key={year} style={{ marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>Year {year}:</div>
                <div>Items: {config.priorities?.length || 0}</div>
                {config.priorities?.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    {config.priorities.map((p: any, idx: number) => (
                      <div key={idx} style={{ fontSize: '11px', color: '#666', marginLeft: '8px' }}>
                        • {p.itemName} (${Math.round(p.inflatedCost).toLocaleString()})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DragDropDebug;