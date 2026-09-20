import { NextResponse } from 'next/server';
import { CharacterBible, WorldCulture, VisualMedium } from '@/lib/types';
import { generateIntelligentCharacters } from '@/lib/character-generator';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title = '',
      synopsis = '',
      worldCulture = 'chinese',
      genre = 'xianxia_cultivation',
      subGenre = '',
      visualMedium = 'animation',
      stylePreset = 'donghua_3d',
      characterCount = 8,
      apiKey = process.env.GEMINI_API_KEY,
    } = body;

    const count = Math.max(1, Number(characterCount) || 8);

    // 1. Try Google Gemini API if key is available
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const aiCharacters = await generateCharactersWithGemini({
          apiKey,
          title,
          synopsis,
          worldCulture,
          genre,
          subGenre,
          visualMedium,
          stylePreset,
          characterCount: count,
        });

        if (aiCharacters && aiCharacters.length > 0) {
          return NextResponse.json({
            success: true,
            characters: aiCharacters,
            source: 'Google Gemini 3.1 Pro (Ensemble Cast)',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini character generation error, falling back to studio template engine:', geminiErr);
      }
    }

    // 2. Intelligent Studio Fallback Engine (Ensemble Cast สไตล์วันพีช / ชาแนลดัง 8-12+ ตัวละคร)
    const characters = generateIntelligentCharacters({
      title,
      synopsis,
      worldCulture,
      genre,
      subGenre,
      visualMedium,
      count,
    });

    return NextResponse.json({
      success: true,
      characters,
      source: 'Studio Ensemble Narrative Engine (ยกแก๊งสไตล์วันพีช)',
    });
  } catch (err: unknown) {
    console.error('Failed to generate characters:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// Online Gemini Pro Generator for Ensemble Cast (One Piece / Shonen / Epic Cultivation style)
async function generateCharactersWithGemini(params: {
  apiKey: string;
  title: string;
  synopsis: string;
  worldCulture: WorldCulture;
  genre: string;
  subGenre?: string;
  visualMedium: VisualMedium;
  stylePreset: string;
  characterCount: number;
}): Promise<CharacterBible[]> {
  const { apiKey, title, synopsis, worldCulture, genre, subGenre, visualMedium, characterCount } = params;

  const prompt = `คุณคือสุดยอดผู้กำกับและนักออกแบบตัวละครอนิเมะ/ภาพยนตร์ระดับโลก (Character Director & World Builder)
โปรดวิเคราะห์ชื่อเรื่องและพล็อตเรื่องต่อไปนี้ แล้วสร้างรายชื่อตัวละครแบบ "ยกแก๊ง/ทีมมหากาพย์" (Ensemble Cast แบบอนิเมะวันพีช / วันพันช์แมน / ซีรีส์ดัง) จำนวน ${characterCount} ตัวละคร ให้สอดคล้องกับพล็อตเรื่องอย่างสมบูรณ์แบบ:

ชื่อเรื่อง: "${title}"
พล็อตเรื่อง/คอนเซปต์: "${synopsis}"
วัฒนธรรมโลก: ${worldCulture} (จีน/ญี่ปุ่น/ไทย/สากล)
แนวเรื่อง: ${genre} ${subGenre ? `(${subGenre})` : ''}
รูปแบบ: ${visualMedium === 'animation' ? 'อนิเมะ 3D/2D' : 'ภาพยนตร์คนจริง (Live-Action)'}

คำแนะนำโครงสร้างทีมตัวละคร (Ensemble Roles):
1. กัปตัน / พระเอกแกนนำ (Protagonist / Captain) - มุ่งมั่น บ้าบิ่น หรือสุขุม เป็นศูนย์รวมใจของทีม
2. มือขวา / จอมดาบ / ผู้คุ้มกัน (First Mate / Swordsman) - ฝีมือฉกาจ สุขุม ดุดัน ปกป้องหลังกัปตัน
3. ต้นหน / เสนาธิการ / ผู้วางแผน (Navigator / Strategist) - ชาญฉลาด มีไหวพริบ อ่านทิศทาง
4. พลแม่นปืน / สเก๊าท์ / สายซุ่มยิง (Sniper / Scout) - สังเกตการณ์ไกล คลี่คลายวิกฤต
5. ยอดฝีมือแนวหน้า / ซัพพอร์ต (Frontline Fighter / Vanguard) - แข็งแกร่ง บ้าพลัง
6. แพทย์ / ผู้เยียวยา / ปรุงยา (Doctor / Healer) - ดูแลฟื้นฟูบาดแผล รักษาชีวิต
7. นักโบราณคดี / ผู้กุมความลับโลก (Scholar / Lore Keeper) - ถอดรหัสปริศนาประวัติศาสตร์
8. ช่างกล / วิศวกรอาวุธหนัก (Artificer / Engineer) - ปลดล็อกประตู ค่ายกล และอาวุธยุทโธปกรณ์
9. จอมมารใหญ่ / จักรพรรดิผู้ครองมิติ (Supreme Overlord / Emperor Boss)
10. ขุนพลเอกฝ่ายศัตรู (Elite Enemy Commander)
11. อาจารย์ / ผู้พิทักษ์บรรพกาล (Legendary Mentor)

จงตอบกลับเป็น JSON Array ของตัวละครเท่านั้น (ห้ามใส่ Markdown codeblock อื่นใดนอกเหนือจาก JSON) โดยแต่ละตัวละครต้องมีคุณสมบัติครบ 11 มิติดังนี้:
[
  {
    "name": "ชื่อตัวละครภาษาไทย (พร้อมฉายาหรือตำแหน่ง เช่น กัปตัน, มือขวา, ต้นหน)",
    "role": "protagonist หรือ antagonist หรือ supporting หรือ mentor",
    "age": "อายุ เช่น 19 ปี / พันปี",
    "bodyBuild": "1. รูปร่าง",
    "facialFeatures": "2. เอกลักษณ์ใบหน้าและแววตา",
    "hairStyle": "3. ทรงผมและสีผม",
    "clothingStyle": "4. เครื่องแต่งกายและเสื้อผ้าประจำตัว",
    "colorTheme": "5. โทนสีประจำตัว",
    "weaponsOrProps": "6. อาวุธหรือไอเทมประจำตัว",
    "personality": "7. บุคลิกภาพ นิสัย คำพูดติดปาก",
    "abilities": "8. ความสามารถพิเศษ ท่าไม้ตาย",
    "weaknesses": "9. จุดอ่อนหรือเงื่อนไขข้อจำกัด",
    "relationships": "10. บทบาทและความสัมพันธ์ในทีม",
    "appearanceAnchor": "คำบรรยายรูปลักษณ์สรุปรวมเป็นภาษาไทยและอังกฤษสำหรับสร้างภาพ AI ล็อคหน้าตา",
    "voiceStyle": "น้ำเสียงและอารมณ์สำหรับนักพากย์"
  }
]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
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

  if (!response.ok) {
    throw new Error(`Gemini API responded with status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  const parsed = JSON.parse(rawText);

  if (Array.isArray(parsed)) {
    return parsed.map((c, idx) => ({
      id: `char-ai-${Date.now()}-${idx + 1}`,
      name: c.name || `ตัวละคร ${idx + 1}`,
      role: c.role || (idx === 0 ? 'protagonist' : idx === parsed.length - 1 ? 'antagonist' : 'supporting'),
      age: c.age || '20 ปี',
      bodyBuild: c.bodyBuild || 'สง่างาม ปราดเปรียว',
      facialFeatures: c.facialFeatures || 'คมเข้ม แววตามุ่งมั่น',
      hairStyle: c.hairStyle || 'ผมยาวสลวยสีดำ',
      clothingStyle: c.clothingStyle || 'ชุดประจำตัวละคร',
      colorTheme: c.colorTheme || 'ดำ-ทอง',
      weaponsOrProps: c.weaponsOrProps || 'อาวุธประจำกาย',
      personality: c.personality || 'สุขุม เด็ดเดี่ยว',
      abilities: c.abilities || 'พลังยุทธ์ระดับสูง',
      weaknesses: c.weaknesses || 'ห่วงใยพวกพ้อง',
      relationships: c.relationships || 'สหายร่วมศึก',
      appearanceAnchor: c.appearanceAnchor || `${c.name}, signature anime attire, detailed face, 8k cinematic`,
      voiceStyle: c.voiceStyle || 'ทุ้ม นิ่ง น่าเกรงขาม',
      googleFlowSeed: String(Math.floor(100000 + Math.random() * 900000)),
    }));
  }

  throw new Error('Parsed Gemini output is not an array');
}
