import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { db, client } from "./mongodb";

function createAuth() {
  const envOrigins = (process.env.TRUSTED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const trustedOrigins = Array.from(
    new Set([
      process.env.BETTER_AUTH_URL || "http://localhost:3000",
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
      "http://localhost:3000",
      "http://localhost:5000",
      ...envOrigins,
    ])
  );

  const googleClientId = (process.env.GOOGLE_CLIENT_ID || "").trim();
  const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim();

  return betterAuth({
    database: mongodbAdapter(db, { client }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      ...(googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : {}),
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "customer",
          input: true,
        },
        phone: {
          type: "string",
          required: false,
        },
        area: {
          type: "string",
          required: false,
        },
        bio: {
          type: "string",
          required: false,
        },
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 24 * 60 * 60,
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user, context) => {
            let roleFromCookie = "";
            try {
              if (
                context &&
                typeof (context as unknown as { getCookie?: (k: string) => string | null }).getCookie === "function"
              ) {
                roleFromCookie =
                  (context as unknown as { getCookie: (k: string) => string | null }).getCookie("fixmate_signup_role") || "";
              }
              if (!roleFromCookie && context) {
                const header =
                  (typeof (context as unknown as { getHeader?: (k: string) => string | null }).getHeader === "function"
                    ? (context as unknown as { getHeader: (k: string) => string | null }).getHeader("cookie")
                    : null) ||
                  (context as unknown as { headers?: Headers })?.headers?.get?.("cookie") ||
                  "";
                const match = String(header).match(/fixmate_signup_role=([^;]+)/);
                if (match) {
                  roleFromCookie = decodeURIComponent(match[1].trim());
                }
              }
            } catch {
              // fallback if context is not available
            }

            const rawRole = (typeof user.role === "string" && user.role) || roleFromCookie;
            const role = rawRole === "technician" ? "technician" : "customer";
            return {
              data: {
                ...user,
                role,
              },
            };
          },
        },
        update: {
          before: async (user) => {
            // Prevent users from elevating or altering their role via update-user
            const { role: _role, ...safeData } = user as Record<string, unknown>;
            return {
              data: safeData,
            };
          },
        },
      },
      session: {
        create: {
          before: async (session, context) => {
            let roleFromCookie = "";
            try {
              if (
                context &&
                typeof (context as unknown as { getCookie?: (k: string) => string | null }).getCookie === "function"
              ) {
                roleFromCookie =
                  (context as unknown as { getCookie: (k: string) => string | null }).getCookie("fixmate_signup_role") || "";
              }
              if (!roleFromCookie && context) {
                const header =
                  (typeof (context as unknown as { getHeader?: (k: string) => string | null }).getHeader === "function"
                    ? (context as unknown as { getHeader: (k: string) => string | null }).getHeader("cookie")
                    : null) ||
                  (context as unknown as { headers?: Headers })?.headers?.get?.("cookie") ||
                  "";
                const match = String(header).match(/fixmate_signup_role=([^;]+)/);
                if (match) {
                  roleFromCookie = decodeURIComponent(match[1].trim());
                }
              }
            } catch {
              // fallback
            }

            if (roleFromCookie === "technician" && session?.userId) {
              try {
                const { db } = await import("./mongodb");
                const { ObjectId } = await import("mongodb");
                const userIdQuery = ObjectId.isValid(session.userId)
                  ? { _id: new ObjectId(session.userId) }
                  : { id: session.userId };
                await db.collection("user").updateOne(
                  { ...userIdQuery, role: "customer" },
                  { $set: { role: "technician" } }
                );
              } catch (err) {
                console.error("Failed to sync signup technician role on session create:", err);
              }
            }
            return { data: session };
          },
        },
      },
    },
    plugins: [jwt()],
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;

let _auth: AuthInstance | null = null;

export function getAuth(): AuthInstance {
  if (!_auth) {
    _auth = createAuth();
  }
  return _auth;
}

export const auth: AuthInstance = new Proxy({} as AuthInstance, {
  get(_target, prop, receiver) {
    const instance = getAuth();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
  apply(_target, thisArg, argArray) {
    const instance = getAuth();
    return Reflect.apply(instance as unknown as (...args: unknown[]) => unknown, thisArg, argArray);
  },
  has(_target, prop) {
    const instance = getAuth();
    return Reflect.has(instance, prop);
  },
});

export type Auth = typeof auth;
