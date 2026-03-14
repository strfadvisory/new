/**
 * Professional-grade Simulator State Manager
 * Handles all dropdown state persistence and synchronization
 */

interface Association {
  _id: string;
  name: string;
  type?: string;
  description?: string;
  icon?: string;
}

interface SimulatorState {
  selectedAssociation: string;
  selectedCompany: string;
  selectedAssociationData: Association | null;
  selectedStudyId: string;
  showCalculator: boolean;
  viewMode: 'graph' | 'list';
  calculatorData: {
    association: string;
    reserveStudy: string;
    excelData: any;
  };
}

class SimulatorStateManager {
  private static instance: SimulatorStateManager;
  private listeners: Map<string, Function[]> = new Map();
  private state: SimulatorState;

  private constructor() {
    this.state = this.loadStateFromStorage();
  }

  public static getInstance(): SimulatorStateManager {
    if (!SimulatorStateManager.instance) {
      SimulatorStateManager.instance = new SimulatorStateManager();
    }
    return SimulatorStateManager.instance;
  }

  private loadStateFromStorage(): SimulatorState {
    try {
      const savedState = sessionStorage.getItem('simulator_complete_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        console.log('[StateManager] Loaded state from storage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('[StateManager] Error loading state:', error);
    }

    return {
      selectedAssociation: '',
      selectedCompany: '',
      selectedAssociationData: null,
      selectedStudyId: '',
      showCalculator: false,
      viewMode: 'graph',
      calculatorData: {
        association: '',
        reserveStudy: '',
        excelData: null
      }
    };
  }

  private saveStateToStorage(): void {
    try {
      sessionStorage.setItem('simulator_complete_state', JSON.stringify(this.state));
      console.log('[StateManager] State saved to storage:', this.state);
    } catch (error) {
      console.error('[StateManager] Error saving state:', error);
    }
  }

  public getState(): SimulatorState {
    return { ...this.state };
  }

  public updateState(updates: Partial<SimulatorState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    console.log('[StateManager] State updated:', {
      old: oldState,
      new: this.state,
      updates
    });

    this.saveStateToStorage();
    this.notifyListeners('stateChange', this.state);
  }

  public setAssociation(name: string, data: Association | null): void {
    console.log('[StateManager] Setting association:', { name, data });
    
    const updates: Partial<SimulatorState> = {
      selectedAssociation: name,
      selectedAssociationData: data
    };

    // Clear company and study when association changes
    if (name !== this.state.selectedAssociation) {
      updates.selectedCompany = '';
      updates.selectedStudyId = '';
    }

    this.updateState(updates);
  }

  public setCompany(name: string, studyId?: string): void {
    console.log('[StateManager] Setting company:', { name, studyId });
    
    const updates: Partial<SimulatorState> = {
      selectedCompany: name
    };

    if (studyId) {
      updates.selectedStudyId = studyId;
    }

    this.updateState(updates);
  }

  public setCalculatorData(data: any): void {
    this.updateState({
      calculatorData: data,
      showCalculator: true
    });
  }

  public resetState(): void {
    console.log('[StateManager] Resetting all state');
    
    this.state = {
      selectedAssociation: '',
      selectedCompany: '',
      selectedAssociationData: null,
      selectedStudyId: '',
      showCalculator: false,
      viewMode: 'graph',
      calculatorData: {
        association: '',
        reserveStudy: '',
        excelData: null
      }
    };

    this.saveStateToStorage();
    this.notifyListeners('stateReset', this.state);
  }

  public clearStorage(): void {
    sessionStorage.removeItem('simulator_complete_state');
    console.log('[StateManager] Storage cleared');
  }

  // Event system for components to listen to state changes
  public subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notifyListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('[StateManager] Error in listener callback:', error);
        }
      });
    }
  }

  // Utility methods for specific state checks
  public hasValidAssociationData(): boolean {
    return !!(this.state.selectedAssociation && this.state.selectedAssociationData?._id);
  }

  public canLoadReserveStudies(): boolean {
    return this.hasValidAssociationData();
  }

  public isReady(): boolean {
    return !!(this.state.selectedAssociation && this.state.selectedCompany && this.state.selectedStudyId);
  }
}

export default SimulatorStateManager;
export type { SimulatorState, Association };