export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}
// Cookies are HttpOnly. A fresh session-bound CSRF token is requested for each
// mutation and never persisted in browser storage.
export async function adminRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (!["GET", "HEAD"].includes(method)) {
    const tokenResponse = await fetch("/api/auth/csrf", {
      credentials: "include",
      cache: "no-store",
    });
    const tokenBody = await tokenResponse.json();
    if (!tokenResponse.ok)
      throw new AdminApiError(
        tokenBody.error?.message ?? "Sign in again to continue.",
        tokenResponse.status,
        tokenBody.error?.code,
      );
    headers.set("X-CSRF-Token", tokenBody.data.csrfToken);
  }
  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  const body = await response.json();
  if (
    response.status === 401 &&
    retry &&
    !["/auth/login", "/auth/refresh"].includes(path)
  ) {
    await adminRequest("/auth/refresh", { method: "POST", body: "{}" }, false);
    return adminRequest<T>(path, options, false);
  }
  if (!response.ok)
    throw new AdminApiError(
      body.error?.message ?? "The request could not be completed.",
      response.status,
      body.error?.code,
    );
  return body.data as T;
}
