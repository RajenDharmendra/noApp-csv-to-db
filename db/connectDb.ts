import { Db, MongoClient } from "mongodb";

const MONGO_DB = process.env.DB_NAME;
const MONGO_URI = process.env.MONGO_URI;

// check the MongoDB URI
if (!MONGO_URI) {
  throw new Error("Define the MONGO_URI environmental variable");
}

// check the MongoDB DB
if (!MONGO_DB) {
  throw new Error("Define the MONGO_DB environmental variable");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 *
 */
export async function connectToDatabase() {
  // check the cached.
  if (cachedClient && cachedDb) {
    // load from cache
    return {
      client: cachedClient,
      db: cachedDb,
    };
  }
  // Connect to cluster
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);
  // set cache
  cachedClient = client;
  cachedDb = db;

  return {
    client: cachedClient,
    db: cachedDb,
  };
}
