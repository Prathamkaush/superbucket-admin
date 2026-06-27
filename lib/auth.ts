export type AdminRole = "ADMIN" | "SUB_ADMIN" | "PICKER";

export function getStoredAdmin(): any | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("admin_user");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem("admin_user");
    }
  }

  const token = localStorage.getItem("admin_token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}

export function getStoredAdminRole(): AdminRole | null {
  const role = getStoredAdmin()?.role;
  return role === "ADMIN" || role === "SUB_ADMIN" || role === "PICKER" ? role : null;
}

export function clearStoredAdmin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}
