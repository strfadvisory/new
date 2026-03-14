import { useState, useEffect } from 'react';
import SimulatorStateManager from '../utils/simulatorStateManager';
import type { SimulatorState, Association } from '../utils/simulatorStateManager';

/**
 * Professional-grade hook for SimulatorSubheader state management
 * Provides seamless integration with centralized state manager
 */
export const useSimulatorState = () => {
  const stateManager = SimulatorStateManager.getInstance();
  const [state, setState] = useState<SimulatorState>(stateManager.getState());

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = stateManager.subscribe('stateChange', (newState: SimulatorState) => {
      console.log('[useSimulatorState] State updated:', newState);
      setState(newState);
    });

    const unsubscribeReset = stateManager.subscribe('stateReset', (newState: SimulatorState) => {
      console.log('[useSimulatorState] State reset:', newState);
      setState(newState);
    });

    return () => {
      unsubscribe();
      unsubscribeReset();
    };
  }, [stateManager]);

  // Helper functions for state updates
  const updateAssociation = (name: string, data: Association | null) => {
    stateManager.setAssociation(name, data);
  };

  const updateCompany = (name: string, studyId?: string) => {
    stateManager.setCompany(name, studyId);
  };

  const updateState = (updates: Partial<SimulatorState>) => {
    stateManager.updateState(updates);
  };

  const resetState = () => {
    stateManager.resetState();
  };

  // Utility functions
  const canLoadReserveStudies = () => {
    return stateManager.canLoadReserveStudies();
  };

  const hasValidAssociationData = () => {
    return stateManager.hasValidAssociationData();
  };

  const isReady = () => {
    return stateManager.isReady();
  };

  return {
    state,
    updateAssociation,
    updateCompany,
    updateState,
    resetState,
    canLoadReserveStudies,
    hasValidAssociationData,
    isReady,
    stateManager
  };
};