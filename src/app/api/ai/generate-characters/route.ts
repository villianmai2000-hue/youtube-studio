import { NextResponse } from 'next/server';
import { CharacterBible, WorldCulture, VisualMedium } from '@/lib/types';
import { generateIntelligentCharacters } from '@/lib/character-generator';
import { analyzeStoryTheme } from '@/lib/theme-detector';

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

  // ตรวจจับแก่นเรื่องจริงด้วย Theme Detector
  const theme = analyzeStoryTheme({ title, synopsis, genre, subGenre, worldCulture });

  let roleGuidelines = '';
  if (theme.isSpecificKrasue) {
    roleGuidelines = `คำแนะนำโครงสร้างตัวละครสำหรับแนว "ตำนานผีกระสือ & อาถรรพ์หมู่บ้านไทย":
1. ดาวิกา / หญิงสาวผู้ต้องคำสาปกระสือ (Protagonist / Cursed Maiden) - สวย อ่อนโยน ซ่อนความลับน่าสะพรึง
2. มานพ / ชายหนุ่มคนรักผู้ตามหาความจริงและคอยปกป้อง (Co-Protagonist / Loyal Defender) - กล้าหาญ มั่นคงในรัก
3. ยายสาย / ผีกระสือเฒ่าผู้ถ่ายทอดน้ำลายคำสาป (Antagonist / Ancient Krasue) - ชรา ร่างกายซูบผอม แววตาน่ากลัว
4. พรานสิงห์ / หมอผีเร้นลับผู้มีอาคมกำราบวิญญาณ (Spiritual Hunter) - มีดหมอ เชือกสายสิญจน์ อาคมขลัง
5. หมอคง / หมอยาประจำหมู่บ้านผู้คิดค้นยาสมุนไพรสยบไส้ (Herbalist Healer) - ใจดี ผู้เยียวยา
6. กำนันผาด / ผู้นำหมู่บ้านผู้ระดมชาวบ้านล่ากระสือ (Village Leader) - ดุดัน เด็ดขาด ปกป้องหมู่บ้าน
7. ป้าสำลี / ชาวบ้านช่างสังเกตผู้พบร่องรอยคราบเลือด (Village Witness) - หวาดระแวง เป็นปากเสียงชาวบ้าน
8. หลวงตาบุญมี / พระเกจิวัดป่าผู้แผ่เมตตาและชี้ทางหลุดพ้น (Buddhist Monk) - เปี่ยมเมตตา ผู้หยั่งรู้เวรกรรม`;
  } else if (theme.isSpecificTakhian) {
    roleGuidelines = `คำแนะนำโครงสร้างตัวละครสำหรับแนว "ตำนานเจ้าแม่ตะเคียนทอง & ป่าอาถรรพ์":
1. พรานป่า / ผู้มีวิชาอาคม / ตัวเอกผู้สืบหาความจริง (Protagonist) - สุขุม เคารพในอาถรรพ์ธรรมชาติ
2. เจ้าแม่ตะเคียนทอง / วิญญาณศักดิ์สิทธิ์ผู้พิทักษ์ป่า (Antagonist / Spirit Guardian) - สง่างาม น่าเกรงขาม สไบเขียวดิ้นทอง
3. พระธุดงค์ / ผู้รู้พิธีกรรมโบราณ (Spiritual Mentor) - เชี่ยวชาญมนต์ขาว แผ่เมตตาสงบอาถรรพ์
4. เสี่ยละโมบ / ผู้บงการตัดไม้ลักลอบขุดสมบัติ (Corrupt Human Antagonist) - โลภ ไม่เชื่อเรื่องลี้ลับ
5. พ่อเฒ่า / คนเฒ่าคนแก่ผู้รู้ประวัติศาสตร์ตำนานผืนป่า (Lore Keeper) - เล่าความเป็นมาของคำสาป
6. ลูกหาบ / พรานรุ่นน้อง / สหายร่วมชะตากรรม (Loyal Companion) - กล้าหาญ คอยระวังหลัง`;
  } else if (theme.isHorrorOrGhost) {
    roleGuidelines = `คำแนะนำโครงสร้างตัวละครสำหรับแนวสยองขวัญ / ผีไทย / ลี้ลับ (Thai Horror & Supernatural):
1. ตัวเอกผู้เผชิญหน้ากับความลี้ลับ / ผู้สืบหาความจริง (Protagonist)
2. วิญญาณร้าย / อาถรรพ์ประจำสถานที่ (Antagonist Ghost / Spirit)
3. หมอผี / พระเกจิ / ผู้เชี่ยวชาญไสยเวท (Spiritual Mentor)
4. บุคคลต้นเหตุแห่งเวรกรรมหรือความแค้น (Human Catalyst)
5. สหายผู้ร่วมชะตากรรม / ผู้รอดชีวิต (Survivor Companion)
6. ผู้เฒ่าผู้กุมความลับของคำสาป (Lore Keeper)`;
  } else if (theme.isThaiMyth) {
    roleGuidelines = `คำแนะนำโครงสร้างตัวละครสำหรับแนวมหากาพย์ตำนานไทย / พญานาค / หิมพานต์ (Thai Epic Mythology):
1. ทายาทผู้สืบทอดสายเลือดนาคราช / นักรบวารี (Protagonist) - กล้าหาญ กตัญญู มีตบะบารมี
2. จอมอสูรใต้บาดาล / ขุนพลศัตรูคู่อาฆาต (Antagonist) - มหิทธานุภาพ ร้อนแรงดั่งไฟ
3. ฤาษี / พระเกจิผู้บำเพ็ญฌาน (Divine Mentor) - ชี้แนะธรรมะและอาคมขั้นสูง
4. ธิดานาคราช / ผู้กุมความลับวังบาดาล (Naga Princess) - งดงาม ทรงปัญญา เปี่ยมเมตตา
5. ขุนพลเอกผู้พิทักษ์ทวารบาดาล (Vanguard Guardian) - ดุดัน ซื่อสัตย์`;
  } else if (theme.isCultivation) {
    roleGuidelines = `คำแนะนำโครงสร้างตัวละครสำหรับแนวเซียนกำลังภายใน 3D / ยุทธภพ (Xianxia Cultivation):
1. ศิษย์เอกผู้มีชะตาสวรรค์ / ผู้ฝึกบำเพ็ญลมปราณ (Protagonist)
2. จอมมารสำนักทมิฬ / เจ้าสำนักฝ่ายมาร (Antagonist Boss)
3. ศิษย์น้องหญิง / จอมยุทธ์หญิงคู่ใจ (Supporting Female Lead)
4. อาจารย์ผู้พิทักษ์บรรพกาล / ผู้อาวุโสสำนัก (Grandmaster Mentor)
5. ศิษย์พี่ผู้คุมกฎ / มือกระบี่ประจำสำนัก (First Senior Brother)`;
  } else if (theme.isTowerOrDungeon) {
    roleGuidelines = `คำแนะนำโครงสร้างตัวละครสำหรับแนวหอคอย 100 ชั้น / ฮันเตอร์ดันเจี้ยน (Tower Hunter):
1. ฮันเตอร์เงา / ผู้หวนคืนจากชั้นที่ 100 (Protagonist Leader)
2. บอสผู้พิทักษ์ชั้น / ราชันย์มิติ (Antagonist Floor Master)
3. นักดาบมนตราเยือกแข็ง (First Mate / DPS)
4. เมจซัพพอร์ต / นักเวทฟื้นฟู (Healer / Buffer)
5. นักแม่นปืนสายสไนเปอร์ (Sniper Scout)`;
  } else if (theme.isMilitary) {
    roleGuidelines = `คำแนะนำโครงสร้างตัวละครสำหรับแนวหน่วยรบพิเศษ / ยุทธการสงคราม (Military Tactical):
1. ผู้บังคับหน่วยปฏิบัติการพิเศษ (Squad Leader)
2. หัวหน้าฝ่ายก่อการร้าย / ผู้บัญชาการศัตรู (Hostile Commander)
3. พลซุ่มยิงมือพระกาฬ (Sniper Specialist)
4. เจ้าหน้าที่ข่าวกรองและไอที (Tech & Intel Officer)`;
  } else if (theme.isSciFi) {
    roleGuidelines = `คำแนะนำโครงสร้างตัวละครสำหรับแนวไซไฟไซเบอร์พังก์ & จักรวาล (Sci-Fi):
1. แฮกเกอร์ไซเบอร์เนติก / กัปตันหน่วยเน็ตเวิร์ก (Protagonist)
2. AI บรรษัทอัจฉริยะ / ไซบอร์กทมิฬ (Antagonist Overlord)
3. หุ่นรบแอนดรอยด์เกราะหนัก (Heavy Mecha Android)
4. วิศวกรควอนตัม (Quantum Engineer)`;
  } else if (theme.isPirateOrAdventure) {
    roleGuidelines = `คำแนะนำโครงสร้างตัวละครสำหรับแนวกองเรือโจรสลัด / มหากาพย์ทะเลลึก (Pirate Adventure):
1. กัปตันผู้รักอิสระ / พระเอกแกนนำ (Captain Protagonist)
2. มือขวา / จอมดาบผู้ภักดี (First Mate Swordsman)
3. ต้นหน / ผู้ถือแผนที่สมบัติ (Navigator)
4. จักรพรรดิโจรสลัดทมิฬ / บอสศัตรู (Pirate Emperor Antagonist)`;
  } else {
    roleGuidelines = `คำแนะนำโครงสร้างตัวละคร (${theme.themeNameTh}):
` + theme.recommendedCastStructure.map((r, i) => `${i + 1}. ${r}`).join('\n');
  }

  const prompt = `คุณคือสุดยอดผู้กำกับและนักออกแบบตัวละครภาพยนตร์และอนิเมะระดับโลก (Character Director & World Builder)
โปรดวิเคราะห์ชื่อเรื่องและพล็อตเรื่องต่อไปนี้ แล้วสร้างรายชื่อตัวละครแบบ "ยกแก๊ง/ทีมมหากาพย์" จำนวน ${characterCount} ตัวละคร ให้สอดคล้องกับพล็อตเรื่องและวัฒนธรรมอย่างสมบูรณ์แบบ 100%:

ชื่อเรื่อง: "${title}"
พล็อตเรื่อง/คอนเซปต์: "${synopsis}"
วัฒนธรรมโลก: ${theme.effectiveCulture} (ธีม: ${theme.themeNameTh})
แนวเรื่อง: ${theme.effectiveGenre} ${theme.effectiveSubGenre ? `(${theme.effectiveSubGenre})` : ''}
รูปแบบ: ${visualMedium === 'animation' ? 'อนิเมะ 3D/2D' : 'ภาพยนตร์คนจริง (Live-Action)'}

${roleGuidelines}

กฎเหล็กเด็ดขาด (CRITICAL CONSTRAINTS):
1. ตัวละครทุกตัวต้องตรงกับชื่อเรื่อง "${title}" และพล็อตเรื่อง "${synopsis}" 100%
2. ห้ามนำตัวละครโจรสลัดวันพีช (ลูฟี่, โซโล, นามิ, กัปตันมังกี้) หรือตัวละครไซไฟ มาใส่ในเนื้อเรื่องที่ไม่เกี่ยวข้อง (เช่น เรื่องผีกระสือ ผีไทย พญานาค) เด็ดขาด
3. ชื่อตัวละคร ภาษา สำเนียง รูปลักษณ์ อาวุธ และเครื่องแต่งกาย ต้องสมจริงตามยุคสมัยและวัฒนธรรมของเรื่อง
4. [เคมีความสัมพันธ์และบุคลิกคู่ตรงข้าม]: ตัวละครทุกคนต้องมีบุคลิกที่แตกต่างกันชัดเจน (ผู้นำสุขุม, มือขวาใจร้อนค้านตลอดแต่ยอมตายแทน, เสนาธิการรอบคอบคำนวณตลอด, สหายขี้เล่นชอบแซวผ่อนคลาย, ศัตรูกดดันเยือดเย็น) ห้ามมีนิสัยเหมือนกันเด็ดขาด และใน 'relationships' ต้องระบุความผูกพันหรือข้อขัดแย้งกับตัวละครอื่นชัดเจน เพื่อให้บทสนทนามีชีวิตชีวา

จงตอบกลับเป็น JSON Array ของตัวละครเท่านั้น (ห้ามใส่ Markdown codeblock หรือข้อความอื่นใดนอกเหนือจาก JSON) โดยแต่ละตัวละครต้องมีคุณสมบัติครบ 11 มิติดังนี้:
[
  {
    "name": "ชื่อตัวละครภาษาไทย (พร้อมฉายาหรือตำแหน่ง)",
    "role": "protagonist หรือ antagonist หรือ supporting หรือ mentor",
    "age": "อายุ เช่น 28 ปี / 1,000 ปี",
    "bodyBuild": "1. รูปร่าง",
    "facialFeatures": "2. เอกลักษณ์ใบหน้าและแววตา",
    "hairStyle": "3. ทรงผมและสีผม",
    "clothingStyle": "4. เครื่องแต่งกายและเสื้อผ้าประจำตัว",
    "colorTheme": "5. โทนสีประจำตัว",
    "weaponsOrProps": "6. อาวุธหรือไอเทมประจำตัว",
    "personality": "7. บุคลิกภาพ นิสัย คำพูดติดปาก และความต่างทางความคิดที่ทำให้มีเคมีปะทะกัน",
    "abilities": "8. ความสามารถพิเศษ ท่าไม้ตาย",
    "weaknesses": "9. จุดอ่อนหรือเงื่อนไขข้อจำกัด",
    "relationships": "10. บทบาทและความสัมพันธ์/เคมีกับตัวละครอื่นในทีม (ระบุชัดเจนว่าใครเป็นคู่กัดใคร ใครเคารพใคร ใครคอยห้ามทัพ)",
    "appearanceAnchor": "คำบรรยายรูปลักษณ์สรุปรวมเป็นภาษาไทยและอังกฤษสำหรับสร้างภาพ AI ล็อคหน้าตา",
    "voiceStyle": "11. น้ำเสียง จังหวะพูด และสำเนียงประจำตัวสำหรับนักพากย์"
  }
]`;

  const modelsToTry = [
    'gemini-3.1-pro-preview',
    'gemini-3.1-pro',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ];
  let lastError: Error | null = null;

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

      if (!response.ok) {
        throw new Error(`Gemini (${model}) error status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const parsed = JSON.parse(rawText);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c, idx) => ({
          id: `char-ai-${Date.now()}-${idx + 1}`,
          name: c.name || `ตัวละคร ${idx + 1}`,
          role: c.role || (idx === 0 ? 'protagonist' : idx === parsed.length - 1 ? 'antagonist' : 'supporting'),
          age: c.age || '25 ปี',
          bodyBuild: c.bodyBuild || 'สมส่วน ปราดเปรียว',
          facialFeatures: c.facialFeatures || 'คมเข้ม แววตามุ่งมั่น',
          hairStyle: c.hairStyle || 'ทรงผมธรรมชาติ',
          clothingStyle: c.clothingStyle || 'ชุดประจำตัวละคร',
          colorTheme: c.colorTheme || 'ดำ-ทอง',
          weaponsOrProps: c.weaponsOrProps || 'ไอเทมประจำตัว',
          personality: c.personality || 'สุขุม มีเอกลักษณ์เฉพาะตัว',
          abilities: c.abilities || 'ทักษะความสามารถเฉพาะด้าน',
          weaknesses: c.weaknesses || 'เงื่อนไขข้อจำกัดในเรื่อง',
          relationships: c.relationships || 'บทบาทในเรื่องราว',
          appearanceAnchor: c.appearanceAnchor || `${c.name}, signature attire, detailed face, 8k cinematic`,
          voiceStyle: c.voiceStyle || 'ทุ้ม นิ่ง น่าเกรงขาม',
          googleFlowSeed: String(Math.floor(100000 + Math.random() * 900000)),
        }));
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Character generation with ${model} failed:`, lastError.message);
    }
  }

  throw lastError || new Error('All Gemini models failed for character generation');
}
