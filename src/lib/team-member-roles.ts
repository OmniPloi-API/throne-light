/**
 * TEAM MEMBER PERMISSION LEVELS
 * 
 * IMPORTANT PERMISSION HIERARCHY RULES:
 * 1. Team members can NEVER see financial data (revenue amounts, earnings, withdrawals)
 * 2. Partners cannot grant permissions they don't have
 * 3. Permissions only flow DOWN, never up
 * 
 * What team members CAN see (depending on role):
 * - Click counts (total page views)
 * - Amazon clicks (we don't know if these converted)
 * - Direct sales COUNT (how many people purchased, NOT dollar amounts)
 * - Their own sub-link performance
 * 
 * What team members can NEVER see:
 * - Revenue amounts ($)
 * - Commission earnings
 * - Withdrawal history
 * - Partner financial settings
 */
export const TEAM_MEMBER_ROLES = {
  // REMOVED: view_all - Team members should NEVER see financials
  // Even partners can't grant this because team members shouldn't see money
  
  view_no_financials: {
    label: 'View Sales & Clicks',
    description: 'Can view sales counts and click data (no dollar amounts)',
    canViewFinancials: false, // ALWAYS false for team members
    canViewSales: true,       // Can see "38 people purchased" but NOT "$380 earned"
    canViewClicks: true,
    canCreateSubLinks: true,  // Can create their own tracking links
  },
  view_clicks_only: {
    label: 'Clicks & Traffic Only',
    description: 'Can only view click and traffic data, no sales info',
    canViewFinancials: false,
    canViewSales: false,
    canViewClicks: true,
    canCreateSubLinks: true,
  },
};

export type TeamMemberRole = keyof typeof TEAM_MEMBER_ROLES;

// Helper to validate role doesn't exceed what partners can grant
export function validateTeamMemberRole(role: string): boolean {
  // Team members can NEVER have financial access
  // Partners cannot grant what they can't give
  return role in TEAM_MEMBER_ROLES && 
         TEAM_MEMBER_ROLES[role as TeamMemberRole]?.canViewFinancials === false;
}
