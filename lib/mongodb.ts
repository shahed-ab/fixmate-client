import dns from "dns";
import { MongoClient, Db } from "mongodb";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const mongoClientOptions = {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 10000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let cachedClient: MongoClient | undefined;
let cachedClientPromise: Promise<MongoClient> | undefined;

export function getMongoClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri, mongoClientOptions);
      global._mongoClientPromise = global._mongoClient.connect();
    }
    return global._mongoClient;
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri, mongoClientOptions);
    cachedClientPromise = cachedClient.connect();
  }
  return cachedClient;
}

export function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClient = global._mongoClient || new MongoClient(uri, mongoClientOptions);
      global._mongoClientPromise = global._mongoClient.connect();
    }
    return global._mongoClientPromise;
  }

  if (!cachedClientPromise) {
    cachedClient = cachedClient || new MongoClient(uri, mongoClientOptions);
    cachedClientPromise = cachedClient.connect();
  }
  return cachedClientPromise;
}

export function getDb(): Db {
  const dbName = process.env.DB_NAME || "fixmate";
  return getMongoClient().db(dbName);
}

export const client: MongoClient = new Proxy({} as MongoClient, {
  get(_target, prop, receiver) {
    const targetClient = getMongoClient();
    const value = Reflect.get(targetClient, prop, receiver);
    if (typeof value === "function") {
      return value.bind(targetClient);
    }
    return value;
  },
});

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const targetDb = getDb();
    const value = Reflect.get(targetDb, prop, receiver);
    if (typeof value === "function") {
      return value.bind(targetDb);
    }
    return value;
  },
});

export const clientPromise: Promise<MongoClient> = new Proxy({} as Promise<MongoClient>, {
  get(_target, prop, receiver) {
    const targetPromise = getMongoClientPromise();
    const value = Reflect.get(targetPromise, prop, receiver);
    if (typeof value === "function") {
      return value.bind(targetPromise);
    }
    return value;
  },
});

export { clientPromise as default };
