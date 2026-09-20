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
      characterId,
      projectId,
      name,
      appearanceAnchor,
      clothingStyle,
      visualMedium = 'animation',
      stylePreset = 'donghua_3d',
      googleFlowSeed,
    } = body;

    if (!name && !appearanceAnchor) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุชื่อหรือลักษณะเด่นของตัวละคร' },
        { status: 400 }
      );
    }

    // Build Character Visual Prompt
    let promptEn = '';
    if (visualMedium === 'live_action') {
      promptEn = `photorealistic cinematic character portrait, 8k resolution, 35mm lens, sharp facial features, highly detailed skin texture, professional studio lighting. Character: ${name}, ${appearanceAnchor}, wearing ${clothingStyle || 'tactical military / cinematic attire'}. Masterpiece portrait`;
    } else {
      promptEn = `3D Chinese Donghua animation character portrait, Unreal Engine 5 render, Octane 8k render, Xianxia fantasy, sharp gorgeous anime face, celestial aesthetic. Character: ${name}, ${appearanceAnchor}, wearing ${clothingStyle || 'flowing silk robes'}. Masterpiece portrait`;
    }

    const seed = Number(googleFlowSeed) || Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(promptEn.slice(0, 300));
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=1024&nologo=true&seed=${seed}&model=flux`;
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=768&nologo=true&seed=${seed}`;

    let buffer: Buffer | null = null;
    const contentType = 'image/jpeg';
    const filename = `char-${characterId || Date.now()}-${Date.now()}.jpg`;

    // Try fetching with timeout
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      let imgRes = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });
      clearTimeout(timeout);

      if (!imgRes.ok) {
        imgRes = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        });
      }

      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      }
    } catch {
      // Backend fetch timeout or error
    }

    // Direct CDN Fallback: If buffer couldn't be fetched on backend, return direct CDN URL immediately
    if (!buffer) {
      return NextResponse.json({
        success: true,
        mediaUrl: fallbackUrl,
        imageUrl: fallbackUrl,
        filename,
        storage: 'Direct AI CDN Stream (Fast)',
      });
    }

    // 1. บันทึกเข้า Atlas GridFS หากมี
    if (isMongoConfigured()) {
      try {
        const bucket = await getGridFSBucket();
        const uploadStream = bucket.openUploadStream(filename, {
          contentType,
          metadata: {
            characterId: characterId || '',
            projectId: projectId || '',
            name,
            isCharacterPortrait: true,
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

        return NextResponse.json({
          success: true,
          fileId,
          mediaUrl: `/api/media/${fileId}`,
          imageUrl: `/api/media/${fileId}`,
          filename,
          storage: 'MongoDB Atlas GridFS (Cloud)',
        });
      } catch (mongoError) {
        console.warn('GridFS save failed for character image:', mongoError);
      }
    }

    // 2. Fallback: บันทึกลง Local (ถ้าเขียนได้) หรือคืนค่า Data URI ตรงๆ (ปลอดภัย 100% บน Vercel)
    try {
      ensureLocalMediaDir();
      const fallbackId = `local-char-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const filePath = path.join(LOCAL_MEDIA_DIR, `${fallbackId}.jpg`);
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({
        success: true,
        fileId: fallbackId,
        mediaUrl: `/api/media/${fallbackId}`,
        imageUrl: `/api/media/${fallbackId}`,
        filename,
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
        storage: 'Direct AI Memory Stream',
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate character image';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
