import { MongoClient } from "mongodb";
import { createSecureContext } from "tls";

const options = {
  tls: true,
  secureContext: createSecureContext({
    minVersion: "TLSv1.2",
    maxVersion: "TLSv1.2",
  }),
};

function getMongoUri() {
  return String(process.env.MONGODB_URI || "").trim();
}

export function isMongoConfigured() {
  return Boolean(getMongoUri());
}

function getMongoConnectionState() {
  if (!globalThis._mongoConnectionState) {
    globalThis._mongoConnectionState = {
      promise: null,
      uri: "",
    };
  }

  return globalThis._mongoConnectionState;
}

export function getMongoClientPromise() {
  const uri = getMongoUri();

  if (!uri) {
    return null;
  }

  const state = getMongoConnectionState();

  if (!state.promise || state.uri !== uri) {
    const client = new MongoClient(uri, options);
    let wrappedPromise;
    wrappedPromise = client.connect().catch((error) => {
      if (state.promise === wrappedPromise) {
        state.promise = null;
        state.uri = "";
      }

      throw error;
    });

    // Attach a sink so connection failures don't surface as unhandled rejections
    // before a route or adapter awaits the promise.
    wrappedPromise.catch(() => {});

    state.uri = uri;
    state.promise = wrappedPromise;
  }

  return state.promise;
}

export default getMongoClientPromise;

export async function getDatabase() {
  const clientPromise = getMongoClientPromise();

  if (!clientPromise) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  const mongoClient = await clientPromise;
  const dbName = process.env.MONGODB_DB_NAME;

  return dbName ? mongoClient.db(dbName) : mongoClient.db();
}
