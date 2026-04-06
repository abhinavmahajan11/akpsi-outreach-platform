/**
 * Role definitions — single source of truth for RBAC.
 *
 * Import Role, FULL_ACCESS_ROLES, and isFullAccess from here.
 * Never hardcode role strings in components.
 */

export type Role = 'admin' | 'president' | 'vice_president' | 'member';

/** Roles that can read and modify all data regardless of ownership. */
export const FULL_ACCESS_ROLES: Role[] = ['admin', 'president', 'vice_president'];

/** Returns true if the given role has unrestricted access. */
export function isFullAccess(role: Role | null | undefined): boolean {
  if (!role) return false;
  return (FULL_ACCESS_ROLES as string[]).includes(role);
}
