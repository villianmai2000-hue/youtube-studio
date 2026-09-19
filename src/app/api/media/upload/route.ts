import { NextResponse } from 'next/server';
import { getGridFSBucket, isMongoConfigured } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const LOCAL_MEDIA_DIR = path.join(process.cwd(), '.studio_media');

function ensureLocalMediaDir() {
  if (!fs.existsSync(LOCAL_MEDIA_DIR)) {
    fs.mkdirSync(LOCAL_MEDIA_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sceneId = formData.get('sceneId') as string | null;
    const projectId = formData.get('projectId') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const contentType = file.type || 'image/jpeg';
    const filename = file.name || `image-${Date.now()}.jpg`;

    // 1. If MongoDB Atlas is configured: Stream directly into Atlas GridFS
    if (isMongoConfigured()) {
      try {
        const bucket = await getGridFSBucket('scene_images');

        // Create GridFS upload stream
        const uploadStream = bucket.openUploadStream(filename, {
          contentType,
          metadata: {
            sceneId: sceneId || '',
            projectId: projectId || '',
            size: buffer.length,
            uploadedAt: new Date().toISOString(),
          },
        });

        const fileId = uploadStream.id.toString();

        // Write buffer to GridFS
        await new Promise<void>((resolve, reject) => {
          uploadStream.on('error', reject);
          uploadStream.on('finish', () => resolve());
          uploadStream.end(buffer);
        });

        const mediaUrl = `/api/media/${fileId}`;

        return NextResponse.json({
          success: true,
          fileId,
          mediaUrl,
          filename,
          size: buffer.length,
          storage: 'MongoDB Atlas GridFS (Cloud)',
        });
      } catch (mongoError) {
        console.error('Failed to stream to MongoDB Atlas GridFS:', mongoError);
        // Fall through to local fallback
      }
    }

    // 2. Fallback: Save to local directory if Atlas URI is not yet entered
    ensureLocalMediaDir();
    const fallbackId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const ext = path.extname(filename) || '.jpg';
    const filePath = path.join(LOCAL_MEDIA_DIR, `${fallbackId}${ext}`);
    fs.writeFileSync(filePath, buffer);

    // Save metadata
    const metaPath = path.join(LOCAL_MEDIA_DIR, `${fallbackId}.json`);
    fs.writeFileSync(metaPath, JSON.stringify({ contentType, filename, size: buffer.length }), 'utf-8');

    return NextResponse.json({
      success: true,
      fileId: fallbackId,
      mediaUrl: `/api/media/${fallbackId}`,
      filename,
      size: buffer.length,
      storage: 'Local Dev Cache (ตั้งค่า MONGODB_URI ใน .env.local เพื่อเก็บขึ้น Atlas Cloud ทันที)',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload media';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
