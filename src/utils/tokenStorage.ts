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

const ACCESS_COOKIE = "auth_token";
const REFRESH_COOKIE = "refresh_token";

/** Default max-age in seconds (1 day) for the access token. */
const ACCESS_MAX_AGE = 86400;

/** Default max-age in seconds (7 days) for the refresh token. */
const REFRESH_MAX_AGE = 7 * 86400;

const secureSuffix = () =>
    window.location.protocol === "https:" ? "; Secure" : "";

// ─── Access Token ───────────────────────────────────────────────────────────

/**
 * Persist the JWT access token in a cookie.
 * @param token   The JWT string returned by the backend.
 * @param maxAge  Cookie lifetime in seconds (default: 1 day).
 */
export function setToken(token: string, maxAge: number = ACCESS_MAX_AGE): void {
    document.cookie = `${ACCESS_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Strict${secureSuffix()}`;
}

/**
 * Read the JWT access token from the cookie.
 * Returns `null` if the cookie has expired or doesn't exist.
 */
export function getToken(): string | null {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${ACCESS_COOKIE}=`));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
}

/**
 * Remove the JWT access token cookie (sets max-age to 0).
 */
export function removeToken(): void {
    document.cookie = `${ACCESS_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
}

// ─── Refresh Token ──────────────────────────────────────────────────────────

/**
 * Persist the refresh token in a cookie.
 * @param token   The refresh token string returned by the backend.
 * @param maxAge  Cookie lifetime in seconds (default: 7 days).
 */
export function setRefreshToken(token: string, maxAge: number = REFRESH_MAX_AGE): void {
    document.cookie = `${REFRESH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Strict${secureSuffix()}`;
}

/**
 * Read the refresh token from the cookie.
 * Returns `null` if the cookie has expired or doesn't exist.
 */
export function getRefreshToken(): string | null {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${REFRESH_COOKIE}=`));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
}

/**
 * Remove the refresh token cookie (sets max-age to 0).
 */
export function removeRefreshToken(): void {
    document.cookie = `${REFRESH_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
}
