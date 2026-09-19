import { MongoClient, GridFSBucket, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!isMongoConfigured()) {
    throw new Error(
      'MONGODB_URI is not set. Please add your MongoDB Atlas connection string to .env.local'
    );
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    // In production mode (e.g. on Vercel), it's best to not use a global variable.
    if (!clientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getDb(dbName = 'youtube_ai_studio'): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

/**
 * Returns a MongoDB GridFSBucket for streaming images directly
 * into and out of MongoDB Atlas Cloud.
 */
export async function getGridFSBucket(bucketName = 'media_files'): Promise<GridFSBucket> {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName });
}

/**
 * Health check to verify MongoDB Atlas connection status and latency
 */
export async function checkAtlasConnection(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  if (!isMongoConfigured()) {
    return {
      connected: false,
      message: 'MONGODB_URI ยังไม่ได้ตั้งค่าใน .env.local (สามารถใส่ Atlas URI เพื่อเก็บข้อมูลบน Cloud ได้ทันที)',
    };
  }

  const start = Date.now();
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    const latency = Date.now() - start;
    return {
      connected: true,
      message: 'เชื่อมต่อ MongoDB Atlas Cloud สำเร็จ',
      latencyMs: latency,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `ไม่สามารถเชื่อมต่อ MongoDB Atlas ได้: ${message}`,
    };
  }
}
