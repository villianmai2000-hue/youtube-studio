import { NextResponse } from 'next/server';
import { generateContinuousMovieScenes } from '@/lib/script-templates';
import { MovieGenre, VisualMedium, StylePreset, CharacterBible, ScriptScene } from '@/lib/types';
import { buildVisualPrompts } from '@/lib/ai-prompt-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      synopsis = '',
      genre = 'xianxia_cultivation',
      visualMedium = 'animation',
      stylePreset = 'donghua_3d',
      targetDurationMinutes = 60,
      actNumber = 1,
      characters = [],
      apiKey = process.env.GEMINI_API_KEY,
      customInstructions = '',
      mode = 'act', // 'act' | 'full_movie'
      worldCulture = 'chinese',
      subGenre = '',
    } = body;

    // Full Movie Continuous Generator Mode
    if (mode === 'full_movie') {
      const allScenes = generateContinuousMovieScenes({
        title,
        synopsis,
        genre: genre as MovieGenre,
        visualMedium: visualMedium as VisualMedium,
        stylePreset: stylePreset as StylePreset,
        targetDurationMinutes: Number(targetDurationMinutes) || 60,
        characters: characters as CharacterBible[],
        worldCulture,
        subGenre,
      });

      return NextResponse.json({
        success: true,
        scenes: allScenes,
        totalScenes: allScenes.length,
        source: 'Continuous Movie Cinema Engine (Seedream 5.0 Pro)',
      });
    }

    // Check if Gemini API key is provided and try online generation for a single act
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const geminiScenes = await generateScriptWithGemini({
          apiKey,
          title,
          synopsis,
          genre,
          visualMedium,
          stylePreset,
          actNumber,
          characters,
          customInstructions,
        });

        if (geminiScenes && geminiScenes.length > 0) {
          return NextResponse.json({
            success: true,
            scenes: geminiScenes,
            source: 'Google Gemini AI',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to local continuous generator:', geminiErr);
      }
    }

    // High quality continuous movie generator filtered to the requested act
    const allScenes = generateContinuousMovieScenes({
      title,
      synopsis,
      genre: genre as MovieGenre,
      visualMedium: visualMedium as VisualMedium,
      stylePreset: stylePreset as StylePreset,
      targetDurationMinutes: Number(targetDurationMinutes) || 60,
      characters: characters as CharacterBible[],
      worldCulture,
      subGenre,
    });

    const actScenes = allScenes.filter((s) => s.actNumber === Number(actNumber));

    return NextResponse.json({
      success: true,
      scenes: actScenes.length > 0 ? actScenes : allScenes.slice(0, 4),
      source: 'Built-in Cinema & 3D Donghua Story Engine',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error generating script';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function generateScriptWithGemini(params: {
  apiKey: string;
  title: string;
  synopsis: string;
  genre: string;
  visualMedium: string;
  stylePreset: string;
  actNumber: number;
  characters: CharacterBible[];
  customInstructions?: string;
}): Promise<ScriptScene[]> {
  const { apiKey, title, synopsis, genre, visualMedium, stylePreset, actNumber, characters, customInstructions } = params;

  const charactersStr = characters.map((c) => `- ${c.name} (${c.role}): รูปลักษณ์ [${c.appearanceAnchor}], น้ำเสียง [${c.voiceStyle}]`).join('\n');

  const systemInstruction = `คุณเป็นนักเขียนบทภาพยนตร์มืออาชีพและผู้สร้างช่อง YouTube แนวสปอยล์/เล่าเรื่องอนิเมะจีน 3D และหนังโรง (สไตล์ช่อง "เพื่อนที่ดีที่สุด SAN1" ที่เน้นคอนเทนต์บำเพ็ญเพียร กำลังภายใน เซียน หรือหนังมหากาพย์)
หน้าที่ของคุณคือเขียนบทเล่าเรื่องสำหรับองค์ที่ ${actNumber} (Act ${actNumber}) สำหรับวิดีโอที่มีความยาวระดับชั่วโมง
โดยต้องแบ่งเป็น 4 ฉากย่อย และแต่ละฉากต้องมี:
1. title: ชื่อฉากภาษาไทย
2. narration: บทบรรยายเสียงพากย์ภาษาไทยที่น่าติดตาม ลื่นไหล ดึงดูดอารมณ์ ไม่น่าเบื่อ
3. dialogues: อาร์เรย์ของบทสนทนาตัวละคร [{ speaker: "ชื่อตัวละคร", emotion: "อารมณ์น้ำเสียง", text: "คำพูด" }]
4. sfxBgm: คำแนะนำดนตรีและเอฟเฟกต์เสียง [BGM: ...] [SFX: ...]
5. cameraMovement: มุมกล้องภาษาอังกฤษ เช่น "Dramatic low-angle tracking shot", "Extreme wide cinematic aerial pan"
6. lighting: แสงเงาภาษาอังกฤษ เช่น "Volumetric golden sunlight with floating qi particles"

ผลลัพธ์ต้องส่งกลับมาในรูปแบบ JSON Array ของ Object เท่านั้น (ห้ามใส่คำอธิบายอื่นนอก JSON)`;

  const userPrompt = `
ชื่อเรื่อง: ${title}
เรื่องย่อ: ${synopsis}
หมวด/แนว: ${genre}
รูปแบบภาพ: ${visualMedium === 'live_action' ? 'ภาพยนตร์คนจริง (Live-Action Cinema)' : 'แอนิเมชัน/อนิเมะจีน 3D (3D Donghua / Animation)'}
สไตล์ภาพ: ${stylePreset}
องค์ที่ต้องการเขียน: องค์ที่ ${actNumber}
ตัวละครในเรื่อง:
${charactersStr || 'ตัวเอกจอมยุทธ์ และ ศัตรูคู่อาฆาต'}

คำสั่งเพิ่มเติม: ${customInstructions || 'เน้นความลุ้นระทึก คำพูดคมคาย และความต่อเนื่องของฉาก'}

ตอบกลับเป็น JSON Array:
[
  {
    "title": "...",
    "narration": "...",
    "dialogues": [{"speaker": "...", "emotion": "...", "text": "..."}],
    "sfxBgm": "...",
    "cameraMovement": "...",
    "lighting": "..."
  }
]
`;

  // Call Gemini REST API directly
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini');

  const parsed = JSON.parse(rawText);
  if (!Array.isArray(parsed)) throw new Error('Expected array from Gemini');

  return parsed.map((item, idx) => {
    const sceneNum = (actNumber - 1) * 4 + (idx + 1);
    const prompts = buildVisualPrompts({
      sceneTitle: item.title,
      narration: item.narration,
      dialogueText: item.dialogues?.map((d: any) => `${d.speaker}: ${d.text}`).join(' '),
      visualMedium: visualMedium as VisualMedium,
      stylePreset: stylePreset as StylePreset,
      genre: genre as MovieGenre,
      cameraMovement: item.cameraMovement || 'Cinematic tracking shot',
      lighting: item.lighting || 'Dramatic lighting',
      charactersInScene: characters,
      sceneNumber: sceneNum,
    });

    return {
      id: `scene-${Date.now()}-${sceneNum}`,
      sceneNumber: sceneNum,
      actNumber: actNumber as 1 | 2 | 3 | 4,
      title: item.title,
      narration: item.narration,
      dialogues: item.dialogues || [],
      sfxBgm: item.sfxBgm || '[BGM: บรรเลงตามอารมณ์ฉาก]',
      characterIds: characters.map((c) => c.id),
      visualMedium: visualMedium as VisualMedium,
      stylePreset: stylePreset as StylePreset,
      cameraMovement: item.cameraMovement || 'Cinematic shot',
      lighting: item.lighting || 'Cinematic lighting',
      imagePrompt: prompts.imagePrompt,
      videoMotionPrompt: prompts.videoMotionPrompt,
      negativePrompt: prompts.negativePrompt,
      estimatedDurationSec: 10,
      createdAt: new Date().toISOString(),
    };
  });
}
