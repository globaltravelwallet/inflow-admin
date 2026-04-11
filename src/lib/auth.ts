let accessToken: string | null = null;

export function setToken(token: string): void {
  accessToken = token;
  document.cookie = "inflow_session=1; path=/; SameSite=Strict; Secure";
}

export function getToken(): string | null {
  return accessToken;
}

export function clearToken(): void {
  accessToken = null;
  document.cookie = "inflow_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function isAuthenticated(): boolean {
  return !!accessToken;
}
