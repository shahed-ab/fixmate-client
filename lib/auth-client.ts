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
    const res = await (authClient as unknown as { token: () => Promise<{ data?: { token: string }; error?: unknown }> }).token();
    if (res?.data?.token) {
      return res.data.token;
    }
    return null;
  } catch (error) {
    console.error("Failed to retrieve JWT auth token:", error);
    return null;
  }
}
