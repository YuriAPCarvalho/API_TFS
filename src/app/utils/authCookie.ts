export const AUTH_COOKIE_NAME = "tfs_auth";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 horas

export type AuthCookiePayload = {
  usuario: string;
  senha: string;
};

export function setAuthCookie(payload: AuthCookiePayload) {
  if (typeof document === "undefined") return;

  const value = encodeURIComponent(JSON.stringify(payload));
  document.cookie = `${AUTH_COOKIE_NAME}=${value}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function clearClientAuth() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("tfs_user");
  clearAuthCookie();
}
