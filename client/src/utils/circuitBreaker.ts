interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  callCount: number;
  lastCallTime: number;
}

class CircuitBreaker {
  private states: Map<string, CircuitBreakerState> = new Map();
  private readonly failureThreshold = 5;
  private readonly timeout = 60000; // 1 minute
  private readonly callThreshold = 10; // Max calls per minute
  private readonly callWindow = 60000; // 1 minute window

  private getState(key: string): CircuitBreakerState {
    if (!this.states.has(key)) {
      this.states.set(key, {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED',
        callCount: 0,
        lastCallTime: 0
      });
    }
    return this.states.get(key)!;
  }

  canExecute(key: string): boolean {
    const state = this.getState(key);
    const now = Date.now();

    // Reset call count if window has passed
    if (now - state.lastCallTime > this.callWindow) {
      state.callCount = 0;
    }

    // Check if too many calls in current window
    if (state.callCount >= this.callThreshold) {
      console.warn(`🚫 Circuit Breaker: Too many calls to ${key} (${state.callCount}/${this.callThreshold})`);
      state.state = 'OPEN';
      return false;
    }

    switch (state.state) {
      case 'OPEN':
        if (now - state.lastFailureTime > this.timeout) {
          state.state = 'HALF_OPEN';
          return true;
        }
        return false;

      case 'HALF_OPEN':
        return true;

      case 'CLOSED':
      default:
        return true;
    }
  }

  onSuccess(key: string): void {
    const state = this.getState(key);
    const now = Date.now();
    
    state.failures = 0;
    state.state = 'CLOSED';
    state.callCount++;
    state.lastCallTime = now;
    
    console.log(`✅ Circuit Breaker: ${key} success (${state.callCount} calls)`);
  }

  onFailure(key: string): void {
    const state = this.getState(key);
    const now = Date.now();
    
    state.failures++;
    state.lastFailureTime = now;
    state.callCount++;
    state.lastCallTime = now;

    if (state.failures >= this.failureThreshold) {
      state.state = 'OPEN';
      console.error(`❌ Circuit Breaker: ${key} opened due to ${state.failures} failures`);
    }
  }

  getStats(key: string) {
    return this.getState(key);
  }

  reset(key: string): void {
    this.states.delete(key);
    console.log(`🔄 Circuit Breaker: ${key} reset`);
  }
}

export const circuitBreaker = new CircuitBreaker();