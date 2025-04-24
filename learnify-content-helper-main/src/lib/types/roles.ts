export type UserRole = 'admin' | 'gerente' | 'operador';

export interface Permission {
  canManageUsers: boolean;
  canManageCoupons: boolean;
  canAccessPanel: boolean;
  canManageSystem: boolean;
  canViewReports: boolean;
  canEditContent: boolean;
  canManageSettings: boolean;
  canApproveContent: boolean;
  canViewUserPasswords: boolean;
}

export const rolePermissions: Record<UserRole, Permission> = {
  admin: {
    canManageUsers: true,
    canManageCoupons: true,
    canAccessPanel: true,
    canManageSystem: true,
    canViewReports: true,
    canEditContent: true,
    canManageSettings: true,
    canApproveContent: true,
    canViewUserPasswords: true
  },
  gerente: {
    canManageUsers: false,
    canManageCoupons: true,
    canAccessPanel: true,
    canManageSystem: false,
    canViewReports: true,
    canEditContent: true,
    canManageSettings: false,
    canApproveContent: true,
    canViewUserPasswords: false
  },
  operador: {
    canManageUsers: false,
    canManageCoupons: true,
    canAccessPanel: true,
    canManageSystem: false,
    canViewReports: false,
    canEditContent: true,
    canManageSettings: false,
    canApproveContent: false,
    canViewUserPasswords: false
  }
};

export function hasPermission(role: UserRole | null, permission: keyof Permission): boolean {
  if (!role) return false;
  return rolePermissions[role][permission];
}