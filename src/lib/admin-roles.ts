/**
 * Admin Roles and Permissions
 * Shared configuration for admin user roles
 */

export const ADMIN_ROLES = {
  super_admin: {
    label: 'Super Admin',
    permissions: ['all'], // Full access to everything
  },
  admin: {
    label: 'Admin',
    permissions: [
      'view_dashboard',
      'view_partners',
      'view_orders',
      'view_subscribers',
      'view_feedback',
      'view_support',
      'manage_partners',
      'manage_orders',
      'manage_support',
    ],
  },
  manager: {
    label: 'Manager',
    permissions: [
      'view_dashboard',
      'view_partners',
      'view_orders',
      'view_subscribers',
      'view_feedback',
      'view_support',
      'manage_support',
    ],
  },
  support: {
    label: 'Support',
    permissions: [
      'view_dashboard',
      'view_support',
      'manage_support',
    ],
  },
};

export type AdminRole = keyof typeof ADMIN_ROLES;
