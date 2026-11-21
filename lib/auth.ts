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

  return betterAuth({
    database: mongodbAdapter(db, { client }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
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
          before: async (user) => {
            const roleStr = typeof user.role === "string" ? user.role : "";
            const role = roleStr === "technician" ? "technician" : "customer";
            return {
              data: {
                ...user,
                role,
              },
            };
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
    return Reflect.apply(instance as any, thisArg, argArray);
  },
  has(_target, prop) {
    const instance = getAuth();
    return Reflect.has(instance, prop);
  },
});

export type Auth = typeof auth;
