export const USER_ROLE = "user";
export const ADMIN_ROLE = "admin";

export function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();
  return value === ADMIN_ROLE ? ADMIN_ROLE : USER_ROLE;
}

export function isAdminRole(role) {
  return normalizeRole(role) === ADMIN_ROLE;
}

export function getRoleHomePath(role) {
  return isAdminRole(role) ? "/admin" : "/account";
}
