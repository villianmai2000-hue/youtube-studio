import { NextResponse } from 'next/server';
import { getGridFSBucket, isMongoConfigured } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const LOCAL_MEDIA_DIR = path.join(process.cwd(), '.studio_media');

function ensureLocalMediaDir() {
  try {
    if (!fs.existsSync(LOCAL_MEDIA_DIR)) {
      fs.mkdirSync(LOCAL_MEDIA_DIR, { recursive: true });
    }
  } catch {
    // ignore on Vercel read-only
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sceneId,
      projectId,
      prompt,
      visualMedium = 'animation',
      stylePreset = 'donghua_3d',
    } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุคำสั่งพร้อมต์สำหรับสร้างภาพ' }, { status: 400 });
    }

    // Enhance prompt for AI Image Generator
    let englishPrompt = '';
    if (visualMedium === 'live_action') {
      englishPrompt = `cinematic movie still, photorealistic, 8k resolution, 35mm lens, chiaroscuro lighting, human actor, masterpiece, highly detailed. Scene: ${prompt}`;
    } else {
      englishPrompt = `premium 3D Chinese Donghua animation, Unreal Engine 5 render, Octane 8k render, Xianxia fantasy, flowing silk robe, glowing qi energy aura, beautiful oriental aesthetic. Scene: ${prompt}`;
    }

    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(englishPrompt.slice(0, 300));
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${seed}&model=flux`;

    // Fetch the generated image buffer
    const imgRes = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!imgRes.ok) {
      throw new Error(`สร้างภาพล้มเหลว: รหัสสถานะ ${imgRes.status}`);
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = 'image/jpeg';
    const filename = `scene-ai-${Date.now()}.jpg`;

    // 1. บันทึกตรงเข้าสู่ MongoDB Atlas GridFS ทันที!
    if (isMongoConfigured()) {
      try {
        const bucket = await getGridFSBucket();
        const uploadStream = bucket.openUploadStream(filename, {
          contentType,
          metadata: {
            sceneId: sceneId || '',
            projectId: projectId || '',
            generatedByAI: true,
            size: buffer.length,
            uploadedAt: new Date().toISOString(),
          },
        });

        const fileId = uploadStream.id.toString();

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
          imageUrl: mediaUrl,
          filename,
          storage: 'MongoDB Atlas GridFS (Cloud)',
        });
      } catch (mongoError) {
        console.error('Failed to stream AI image to Atlas GridFS:', mongoError);
      }
    }

    // 2. Fallback: บันทึกลง Local Dev Cache หรือคืนค่า Base64 Data URI ตรงๆ (ปลอดภัย 100% บน Vercel)
    try {
      ensureLocalMediaDir();
      const fallbackId = `local-ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const filePath = path.join(LOCAL_MEDIA_DIR, `${fallbackId}.jpg`);
      fs.writeFileSync(filePath, buffer);

      const metaPath = path.join(LOCAL_MEDIA_DIR, `${fallbackId}.json`);
      fs.writeFileSync(
        metaPath,
        JSON.stringify({ contentType, filename, size: buffer.length, projectId: projectId || '', sceneId: sceneId || '', generatedByAI: true }),
        'utf-8'
      );

      return NextResponse.json({
        success: true,
        fileId: fallbackId,
        mediaUrl: `/api/media/${fallbackId}`,
        imageUrl: `/api/media/${fallbackId}`,
        filename,
        storage: 'Local Dev Cache',
      });
    } catch {
      // Vercel read-only filesystem fallback: return base64 Data URI directly
      const base64 = buffer.toString('base64');
      const dataUri = `data:${contentType};base64,${base64}`;
      return NextResponse.json({
        success: true,
        mediaUrl: dataUri,
        imageUrl: dataUri,
        filename,
        storage: 'Direct AI Memory Stream (Vercel Cloud Safe)',
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
