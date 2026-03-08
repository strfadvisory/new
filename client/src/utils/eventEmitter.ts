class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event: string, callback: Function) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

export const viewModeEmitter = new EventEmitter();
export const studySelectionEmitter = new EventEmitter();
export const reserveStudiesEmitter = new EventEmitter();

// Utility function to refresh reserve studies dropdown
export const refreshReserveStudiesDropdown = () => {
  // Emit custom event that the dropdown component listens to
  window.dispatchEvent(new CustomEvent('reserveStudiesUpdated'));
  // Also emit through our event emitter for consistency
  reserveStudiesEmitter.emit('refresh');
};