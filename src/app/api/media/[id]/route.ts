import { NextResponse } from 'next/server';
import { getGridFSBucket, isMongoConfigured } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const LOCAL_MEDIA_DIR = path.join(process.cwd(), '.studio_media');

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 1. Try MongoDB Atlas GridFS if ObjectId is valid
  if (isMongoConfigured() && ObjectId.isValid(id)) {
    try {
      const bucket = await getGridFSBucket();
      const objectId = new ObjectId(id);

      // Find file metadata
      const files = await bucket.find({ _id: objectId }).toArray();
      if (files.length > 0) {
        const fileDoc = files[0];
        const contentType = fileDoc.contentType || (fileDoc.metadata as any)?.contentType || 'image/jpeg';

        // Read stream into buffer
        const downloadStream = bucket.openDownloadStream(objectId);
        const chunks: Buffer[] = [];

        for await (const chunk of downloadStream) {
          chunks.push(Buffer.from(chunk));
        }

        const buffer = Buffer.concat(chunks);

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    } catch (err) {
      console.warn('GridFS download error, trying fallback:', err);
    }
  }

  // 2. Try Local Fallback Directory
  if (fs.existsSync(LOCAL_MEDIA_DIR)) {
    const files = fs.readdirSync(LOCAL_MEDIA_DIR);
    const targetFile = files.find((f) => f.startsWith(id) && !f.endsWith('.json'));

    if (targetFile) {
      const filePath = path.join(LOCAL_MEDIA_DIR, targetFile);
      const buffer = fs.readFileSync(filePath);

      let contentType = 'image/jpeg';
      const metaPath = path.join(LOCAL_MEDIA_DIR, `${id}.json`);
      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
          if (meta.contentType) contentType = meta.contentType;
        } catch {
          // ignore
        }
      }

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  }

  return NextResponse.json({ error: 'Image not found in MongoDB Atlas' }, { status: 404 });
}
