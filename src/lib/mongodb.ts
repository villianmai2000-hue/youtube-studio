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

export const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'youtube_cinematic_donghua_studio';
export const GRIDFS_BUCKET_NAME = process.env.MONGODB_GRIDFS_BUCKET || 'youtube_studio_media';

export async function getDb(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName || DATABASE_NAME);
}

/**
 * Returns a MongoDB GridFSBucket for streaming images directly
 * into and out of MongoDB Atlas Cloud in an isolated bucket.
 */
export async function getGridFSBucket(bucketName?: string): Promise<GridFSBucket> {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName: bucketName || GRIDFS_BUCKET_NAME });
}

/**
 * Health check to verify MongoDB Atlas connection status, latency, and database isolation
 */
export async function checkAtlasConnection(): Promise<{
  connected: boolean;
  message: string;
  database: string;
  bucket: string;
  latencyMs?: number;
}> {
  if (!isMongoConfigured()) {
    return {
      connected: false,
      message: 'MONGODB_URI ยังไม่ได้ตั้งค่าใน .env.local (สามารถใส่ Atlas URI เพื่อเก็บข้อมูลบน Cloud ได้ทันที)',
      database: DATABASE_NAME,
      bucket: GRIDFS_BUCKET_NAME,
    };
  }

  const start = Date.now();
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    const latency = Date.now() - start;
    return {
      connected: true,
      message: `เชื่อมต่อ MongoDB Atlas สำเร็จ (ฐานข้อมูลแยกอิสระ: ${db.databaseName})`,
      database: db.databaseName,
      bucket: GRIDFS_BUCKET_NAME,
      latencyMs: latency,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `ไม่สามารถเชื่อมต่อ MongoDB Atlas ได้: ${message}`,
      database: DATABASE_NAME,
      bucket: GRIDFS_BUCKET_NAME,
    };
  }
}
