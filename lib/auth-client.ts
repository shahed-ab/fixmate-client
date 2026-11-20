import { createAuthClient } from "better-auth/react";
import { jwtClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000",
  plugins: [
    jwtClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

/**
 * Refreshes the Better Auth session bypassing cookie cache.
 * Queries /api/auth/get-session?disableCookieCache=true so the server loads
 * the updated user record directly from MongoDB and updates the session cookies.
 */
export async function refreshAuthSession() {
  try {
    const res = await authClient.getSession({
      query: { disableCookieCache: true },
    });
    return res?.data || null;
  } catch (err) {
    console.warn("Failed to refresh auth session with disableCookieCache:", err);
    return null;
  }
}

/**
 * Retrieves a cryptographically signed JWT token usable by the Express backend.
 *
 * Method Used:
 * Calls `authClient.token()` (which fetches Better Auth's `GET /api/auth/token` endpoint
 * exposed by the server `jwt()` plugin) to retrieve `{ data: { token: string } }`.
 *
 * Why this method:
 * In Better Auth with MongoDB adapter, `session.token` (or `session.data.session.token`)
 * is an internal opaque session ID string stored in the database, NOT a signed JWT.
 * The server `jwt()` plugin exposes the `/token` endpoint (invoked via `authClient.token()`)
 * which mints a signed JWT signed with the server's JWKS private key and containing
 * user identity and claims (such as email and role) verifiable by Express via `/api/auth/jwks`.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    // authClient.token() requests GET /api/auth/token from Better Auth
    if (typeof (authClient as unknown as { token?: () => Promise<{ data?: { token: string }; error?: unknown }> }).token === 'function') {
      const res = await (authClient as unknown as { token: () => Promise<{ data?: { token: string }; error?: unknown }> }).token();
      if (res?.data?.token) {
        return res.data.token;
      }
    }
  } catch (error) {
    console.warn("authClient.token() call failed, falling back to endpoint:", error);
  }

  try {
    const baseURL =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
      process.env.BETTER_AUTH_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const res = await fetch(`${baseURL}/api/auth/token`, {
      credentials: 'include',
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.token) return json.token;
    }
  } catch (err) {
    console.error("Failed to retrieve JWT auth token via direct fetch:", err);
  }

  return null;
}
