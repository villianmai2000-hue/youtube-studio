import { NextResponse } from 'next/server';
import { CharacterBible } from '@/lib/types';
import { enrichCharacterDynamics } from '@/lib/character-dynamics';
import { analyzeStoryTheme } from '@/lib/theme-detector';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title = '',
      synopsis = '',
      worldCulture = 'thai',
      genre = '',
      subGenre = '',
      characters = [],
      apiKey = process.env.GEMINI_API_KEY,
    } = body;

    if (!Array.isArray(characters) || characters.length === 0) {
      return NextResponse.json({ success: false, error: 'No characters provided' }, { status: 400 });
    }

    // 1. Try Gemini AI for contextual dynamic enrichment
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const enriched = await enrichCharactersWithGemini({
          apiKey,
          title,
          synopsis,
          worldCulture,
          genre,
          subGenre,
          characters,
        });

        if (enriched && enriched.length > 0) {
          return NextResponse.json({
            success: true,
            characters: enriched,
            source: 'Google Gemini AI (Deep Dynamics & Chemistry)',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini character enrichment failed, falling back to local dynamics engine:', geminiErr);
      }
    }

    // 2. Fallback to Local Dynamics Engine
    const enriched = enrichCharacterDynamics(characters, {
      title,
      synopsis,
      worldCulture,
      genre,
    });

    return NextResponse.json({
      success: true,
      characters: enriched,
      source: 'Studio Character Dynamics Engine',
    });
  } catch (err: unknown) {
    console.error('Character enrichment error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

async function enrichCharactersWithGemini(params: {
  apiKey: string;
  title: string;
  synopsis: string;
  worldCulture: string;
  genre: string;
  subGenre?: string;
  characters: CharacterBible[];
}): Promise<CharacterBible[]> {
  const { apiKey, title, synopsis, worldCulture, genre, subGenre, characters } = params;
  const theme = analyzeStoryTheme({ title, synopsis, genre, subGenre, worldCulture });

  const charListPrompt = characters
    .map((c, i) => `${i + 1}. [${c.id}] ชื่อ: ${c.name} | บทบาท: ${c.role} | นิสัยปัจจุบัน: ${c.personality || '-'} | ความสัมพันธ์เดิม: ${c.relationships || '-'}`)
    .join('\n');

  const prompt = `คุณคือผู้กำกับการแสดงและผู้เชี่ยวชาญการออกแบบเคมีตัวละครภาพยนตร์ (Master Character Chemistry Director)
เรื่อง: "${title}" (${theme.themeNameTh})
เรื่องย่อ: "${synopsis}"
วัฒนธรรม: "${theme.effectiveCulture}"

รายชื่อตัวละครปัจจุบัน:
${charListPrompt}

ภารกิจของคุณ:
จงอัปเกรด "personality" (บุคลิก คำติดปาก นิสัยคู่ตรงข้าม), "relationships" (เคมีความสัมพันธ์กับตัวละครอื่นในทีม ใครคู่กัดใคร ใครเคารพใคร ใครคอยห้ามทัพ), และ "voiceStyle" (น้ำเสียงและสไตล์การพูดจริง) ของตัวละครทุกคนให้มีเสน่ห์ มีมิติชัดเจน ไม่ซ้ำกัน และโต้ตอบกันได้อย่างเป็นธรรมชาติสูงสุด

กฎเหล็ก:
1. ห้ามให้ตัวละครมีนิสัยหรือคำพูดเหมือนกันเด็ดขาด ต้องมีตัวนำสุขุม, ตัวค้านใจร้อน, ตัววิเคราะห์รอบคอบ, ตัวฮา/ตัวแซวผ่อนคลาย, และตัวร้ายกดดัน
2. ใน "relationships" ต้องระบุชื่อตัวละครอื่นที่มีความสัมพันธ์ด้วยชัดเจน เพื่อให้เวลาเข้าฉากด้วยกันสามารถคุยกันได้อย่างมีเคมี
3. "voiceStyle" ต้องระบุจังหวะการพูด น้ำเสียง คำลงท้าย หรือสำเนียงที่เป็นเอกลักษณ์
4. ให้รักษา ID และ NAME เดิมของตัวละครไว้ครบถ้วน

ตอบกลับเป็น JSON Array เท่านั้น:
[
  {
    "id": "ID เดิมของตัวละคร",
    "personality": "บุคลิกภาพลึกซึ้ง จุดเด่น นิสัย และคำพูดติดปาก",
    "relationships": "ความสัมพันธ์และเคมีกับตัวละครอื่นในเรื่องอย่างละเอียด",
    "voiceStyle": "น้ำเสียง อารมณ์ และสไตล์การพูดที่เป็นเอกลักษณ์"
  }
]`;

  const modelsToTry = [
    'gemini-3.1-pro-preview',
    'gemini-3.1-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ];

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const parsed = JSON.parse(rawText);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return characters.map((c) => {
          const match = parsed.find((p: any) => p.id === c.id || p.name === c.name);
          if (match) {
            return {
              ...c,
              personality: match.personality || c.personality,
              relationships: match.relationships || c.relationships,
              voiceStyle: match.voiceStyle || c.voiceStyle,
            };
          }
          return c;
        });
      }
    } catch (e) {
      console.warn(`Enrichment with model ${model} failed, trying next...`);
    }
  }

  // Fallback to local
  return enrichCharacterDynamics(characters, { title, synopsis, worldCulture, genre });
}
