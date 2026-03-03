export interface NextStep {
  _id: string;
  title: string;
  description: string;
  icon?: string;
  completed: boolean;
}

export interface Video {
  _id: string;
  title: string;
  url?: string;
  description?: string;
  duration?: number;
}

export interface NavigationMenuItem {
  level: string;
  path: string;
}

export interface RestrictedUserRoleData {
  permissions: Record<string, boolean>;
  nextSteps: NextStep[];
  videos: Video[];
  accessibleResources: string[];
  navigationMenu: NavigationMenuItem[];
}

export class UserRoleManager {
  private roleData: RestrictedUserRoleData | null = null;

  constructor(roleData?: RestrictedUserRoleData) {
    if (roleData) {
      this.roleData = roleData;
    }
  }

  setRoleData(data: RestrictedUserRoleData): void {
    this.roleData = data;
  }

  hasPermission(permission: string): boolean {
    return this.roleData?.permissions[permission] === true;
  }

  getActivePermissions(): Record<string, boolean> {
    return this.roleData?.permissions || {};
  }

  getNextSteps(): NextStep[] {
    return this.roleData?.nextSteps || [];
  }

  getVideos(): Video[] {
    return this.roleData?.videos || [];
  }

  getAccessibleResources(): string[] {
    return this.roleData?.accessibleResources || [];
  }

  getNavigationMenu(): NavigationMenuItem[] {
    return this.roleData?.navigationMenu || [];
  }

  canAccessResource(resource: string): boolean {
    return this.roleData?.accessibleResources.includes(resource) || false;
  }

  getCompletedStepsCount(): number {
    return this.roleData?.nextSteps.filter(step => step.completed).length || 0;
  }

  getTotalStepsCount(): number {
    return this.roleData?.nextSteps.length || 0;
  }

  getProgressPercentage(): number {
    const total = this.getTotalStepsCount();
    if (total === 0) return 0;
    return Math.round((this.getCompletedStepsCount() / total) * 100);
  }

  isInitialized(): boolean {
    return this.roleData !== null;
  }
}

export default UserRoleManager;