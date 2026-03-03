/**
 * Cookie-based JWT token storage.
 *
 * Stores the auth token in a browser cookie with a configurable max-age so
 * the token is automatically deleted by the browser once it expires.
 *
 * Cookie attributes:
 *  - path=/          → accessible on every route
 *  - SameSite=Strict → CSRF protection
 *  - Secure          → only sent over HTTPS (omitted in dev for localhost)
 */

const COOKIE_NAME = "auth_token";

/** Default max-age in seconds (1 day). Adjust to match your backend JWT TTL. */
const DEFAULT_MAX_AGE = 86400;

/**
 * Persist the JWT token in a cookie.
 * @param token   The JWT string returned by the backend.
 * @param maxAge  Cookie lifetime in seconds (default: 1 day).
 */
export function setToken(token: string, maxAge: number = DEFAULT_MAX_AGE): void {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Strict${secure}`;
}

/**
 * Read the JWT token from the cookie.
 * Returns `null` if the cookie has expired or doesn't exist.
 */
export function getToken(): string | null {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
}

/**
 * Remove the JWT token cookie (sets max-age to 0).
 */
export function removeToken(): void {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict`;
}
