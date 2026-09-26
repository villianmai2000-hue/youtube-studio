import { NextResponse } from 'next/server';
import { CharacterBible, CharacterDialogue } from '@/lib/types';
import { analyzeStoryTheme } from '@/lib/theme-detector';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sceneNumber = 1,
      sceneTitle = '',
      narration = '',
      sceneAction = '',
      characters = [],
      charactersPresent = [],
      currentDialogues = [],
      tonePreset = '',
      worldCulture = 'thai',
      genre = '',
      subGenre = '',
      title = '',
      synopsis = '',
      apiKey = process.env.GEMINI_API_KEY,
    } = body;

    // Filter characters in scene or default to first 2
    let activeChars: CharacterBible[] = [];
    if (Array.isArray(charactersPresent) && charactersPresent.length > 0) {
      activeChars = characters.filter((c: CharacterBible) =>
        charactersPresent.some((cp: string) => c.name.includes(cp) || cp.includes(c.name))
      );
    }
    if (activeChars.length === 0 && characters.length > 0) {
      activeChars = characters.slice(0, 2);
    }

    // 1. Try Google Gemini API
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const polished = await polishDialoguesWithGemini({
          apiKey,
          sceneNumber,
          sceneTitle,
          narration,
          sceneAction,
          activeChars,
          allCharacters: characters,
          currentDialogues,
          tonePreset,
          worldCulture,
          genre,
          subGenre,
          title,
          synopsis,
        });

        if (polished && polished.length > 0) {
          return NextResponse.json({
            success: true,
            dialogues: polished,
            source: 'Google Gemini AI (Screenplay Dialogue Polish)',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini dialogue polish failed, using smart dialogue refiner fallback:', geminiErr);
      }
    }

    // 2. Intelligent Studio Fallback Engine
    const polished = refineDialoguesFallback({
      sceneNumber,
      sceneTitle,
      narration,
      sceneAction,
      activeChars,
      currentDialogues,
      tonePreset,
      worldCulture,
    });

    return NextResponse.json({
      success: true,
      dialogues: polished,
      source: 'Studio Dialogue Chemistry Engine',
    });
  } catch (err: unknown) {
    console.error('Polish dialogues error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

async function polishDialoguesWithGemini(params: {
  apiKey: string;
  sceneNumber: number;
  sceneTitle: string;
  narration: string;
  sceneAction: string;
  activeChars: CharacterBible[];
  allCharacters: CharacterBible[];
  currentDialogues: CharacterDialogue[];
  tonePreset?: string;
  worldCulture?: string;
  genre?: string;
  subGenre?: string;
  title?: string;
  synopsis?: string;
}): Promise<CharacterDialogue[]> {
  const {
    apiKey,
    sceneNumber,
    sceneTitle,
    narration,
    sceneAction,
    activeChars,
    currentDialogues,
    tonePreset,
    worldCulture,
    genre,
    subGenre,
    title,
    synopsis,
  } = params;

  const theme = analyzeStoryTheme({ title: title || sceneTitle, synopsis: synopsis || narration, genre, subGenre, worldCulture });

  const charsInfo = activeChars
    .map((c) => `- ${c.name} (${c.role}): บุคลิก="${c.personality || 'สุขุม'}" | น้ำเสียง="${c.voiceStyle || 'พูดปกติ'}" | ความสัมพันธ์="${c.relationships || '-'}"`)
    .join('\n');

  const currentDiaStr = currentDialogues && currentDialogues.length > 0
    ? currentDialogues.map((d) => `${d.speaker} (${d.emotion}): "${d.text}"`).join('\n')
    : '(ยังไม่มีบทพูดเดิม - กรุณาสร้างบทพูดใหม่ที่เข้ากับฉากนี้ 2-4 บรรทัด)';

  let toneInstruction = '';
  if (tonePreset) {
    toneInstruction = `\n🎯 โทนอารมณ์ที่ต้องการเน้นเป็นพิเศษ: "${tonePreset}"`;
  }

  const prompt = `คุณคือผู้กำกับบทสนทนาภาพยนตร์และซีรีส์ระดับมือรางวัล (Master Screenplay Dialogue Director)
ภารกิจ: ขัดเกลาบทสนทนาตัวละครใน "ฉากที่ ${sceneNumber}: ${sceneTitle}" ให้เป็น "ภาษาพูดธรรมชาติของมนุษย์จริง (Spoken Colloquial Dialogue)" ที่มีเคมีรับส่งกันอย่างลื่นไหล ดึงดูดอารมณ์คนดู ไม่แข็งเป็นหุ่นยนต์ และสะท้อนตัวตนของตัวละครแต่ละตัวอย่างคมกริบ

ข้อมูลบริบทฉาก:
- ชื่อฉาก: ${sceneTitle}
- บทเล่าเรื่องประจำฉาก (Narration): "${narration}"
- ภาพแอ็กชันในฉาก: "${sceneAction}"
- ธีมและวัฒนธรรม: ${theme.effectiveCulture} (${theme.themeNameTh})
${toneInstruction}

ตัวละครที่ปรากฏในฉากนี้:
${charsInfo}

บทสนทนาเดิม:
${currentDiaStr}

กฎเหล็กสำหรับการขัดเกลาบทพูด (CRITICAL SCREENPLAY RULES):
1. [ภาษาพูดจริง ไม่ใช่ภาษาหนังสือ]: ❌ ห้ามใช้ภาษาทางการแข็งทื่อ เช่น "เราต้องเร่งรีบกระทำการนี้โดยด่วน" ✅ ให้ใช้ภาษาพูดจริง เช่น "ชักช้าไม่ได้แล้ว ไปเร็ว!"
2. [มีเคมีโต้ตอบกัน 2-4 บรรทัด]: ตัวละครต้องมีปฏิกิริยาต่อกัน เช่น แซว, ค้าน, เตือน, ปรึกษา, หรือเผชิญหน้า ไม่ใช่ต่างคนต่างพูดลอยๆ
3. [ห้ามประโยคซ้ำซากจำเจ]: ❌ ห้ามใช้คำซ้ำซาก เช่น "ระวังตัวด้วย", "ไปกันเถอะ", "ข้างหน้ามีอะไร" โดยไม่มีเหตุการณ์รองรับ ให้พูดถึงสิ่งที่อยู่ตรงหน้าในฉากจริงๆ
4. [ผู้พูดต้องตรงกับตัวละครในฉาก]: ผู้พูด (speaker) ต้องเป็นชื่อตัวละครที่อยู่ในฉากนี้เท่านั้น (${activeChars.map((c) => c.name).join(', ')})
5. [มีคำระบุอารมณ์ (emotion)]: ระบุน้ำเสียงหรืออารมณ์ เช่น "กระซิบต่ำ", "กัดฟันพูด", "ยิ้มกวน", "จริงจัง", "ตาเบิกกว้าง"

ตอบกลับเป็น JSON Array ของบทสนทนาเท่านั้น (2-4 บรรทัด):
[
  {
    "speaker": "ชื่อตัวละคร",
    "emotion": "อารมณ์/น้ำเสียง",
    "text": "บทพูดที่ขัดเกลาแล้ว เป็นธรรมชาติ มีชีวิตชีวา"
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
            temperature: 0.75,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const parsed = JSON.parse(rawText);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((d: any) => ({
          speaker: d.speaker || (activeChars[0]?.name || 'ตัวละคร'),
          emotion: d.emotion || 'จริงจัง',
          text: d.text || '',
        }));
      }
    } catch (e) {
      console.warn(`Gemini dialogue polish with ${model} failed, trying next...`);
    }
  }

  return refineDialoguesFallback({
    sceneNumber,
    sceneTitle,
    narration,
    sceneAction,
    activeChars,
    currentDialogues,
    tonePreset,
    worldCulture,
  });
}

function refineDialoguesFallback(params: {
  sceneNumber: number;
  sceneTitle: string;
  narration: string;
  sceneAction: string;
  activeChars: CharacterBible[];
  currentDialogues: CharacterDialogue[];
  tonePreset?: string;
  worldCulture?: string;
}): CharacterDialogue[] {
  const { sceneTitle, narration, activeChars, currentDialogues, tonePreset } = params;
  const char1 = activeChars[0] || { name: 'ตัวเอก', role: 'protagonist', personality: 'สุขุม' };
  const char2 = activeChars[1] || { name: 'สหาย', role: 'supporting', personality: 'ใจร้อน' };

  // If there are already dialogues, polish the phrasing
  if (currentDialogues && currentDialogues.length >= 2) {
    return currentDialogues.map((d, i) => {
      let polishedText = d.text.trim();
      // Remove robotic prefixes if any
      polishedText = polishedText
        .replace(/^(ข้าขอแจ้งว่า|ข้าพเจ้าคิดว่า|เราต้องทำการ|จงดูนั่นสิ)\s*/g, '')
        .replace(/[!！]{2,}/g, '!');

      if (tonePreset?.includes('เถียง') || tonePreset?.includes('clash')) {
        if (i % 2 === 0) polishedText = `อย่ามาสั่งข้า! ${polishedText}`;
        else polishedText = `ฟังเหตุผลบ้างสิ! ${polishedText}`;
      } else if (tonePreset?.includes('แซว') || tonePreset?.includes('banter')) {
        if (i % 2 === 0) polishedText = `คิดว่าแน่งั้นเหรอ... ${polishedText}`;
      }

      return {
        speaker: d.speaker || (i % 2 === 0 ? char1.name : char2.name),
        emotion: d.emotion || (i % 2 === 0 ? 'จริงจัง' : 'ท้าทาย'),
        text: polishedText || d.text,
      };
    });
  }

  // If empty, generate context-aware dialogues based on narration & title
  const contextSnippet = narration || sceneTitle || 'สถานการณ์เบื้องหน้า';
  const hasGhost = /กระสือ|ผี|วิญญาณ|อาถรรพ์|มืด|ป่า/i.test(contextSnippet);
  const hasBattle = /ดาบ|สู้|ศัตรู|บุก|ประจัญบาน|ปีศาจ|หอคอย/i.test(contextSnippet);

  if (tonePreset?.includes('เถียง') || tonePreset?.includes('clash')) {
    return [
      {
        speaker: char2.name,
        emotion: 'ใจร้อน ท้าทาย',
        text: `จะมัวยืนดูอยู่ทำไม! ถ้าเราไม่รีบลงมือ ตอนนี้ทุกอย่างก็จบเห่กันพอดี!`,
      },
      {
        speaker: char1.name,
        emotion: 'สุขุม หนักแน่น',
        text: `ใจเย็นแล้วมองให้ดีก่อน... ศัตรูกำลังล่อให้เราก้าวเข้าไปในกับดัก`,
      },
      {
        speaker: char2.name,
        emotion: 'กัดฟัน แค่นยิ้ม',
        text: `กับดักแล้วไงล่ะ? ข้าไม่เคยกลัวหน้าไหนอยู่แล้ว!`,
      },
    ];
  }

  if (hasGhost) {
    return [
      {
        speaker: char2.name,
        emotion: 'กระซิบต่ำ ขนลุก',
        text: `ได้กลิ่นสาบคาวเลือดไหม... ลมรอบตัวมันพัดแปลกๆ เหมือนมีใครจ้องเราอยู่`,
      },
      {
        speaker: char1.name,
        emotion: 'สายตาเฉียบคม กระชับอาวุธ',
        text: `อย่าเพิ่งหันหลังกลับ สวดมนต์ในใจแล้วเดินชิดกันไว้ ห้ามแยกตัวเด็ดขาด`,
      },
    ];
  }

  if (hasBattle) {
    return [
      {
        speaker: char1.name,
        emotion: 'ออกคำสั่งเด็ดขาด',
        text: `ประจำตำแหน่งเดิม! ข้าจะเปิดทางล่อการโจมตี เจ้าหาจังหวะแทงเข้าจุดอ่อน`,
      },
      {
        speaker: char2.name,
        emotion: 'ฮึกเหิม กวัดแกว่งอาวุธ',
        text: `จัดไป! อย่าพลาดท่าให้มันก่อนก็แล้วกัน!`,
      },
    ];
  }

  // Default cinematic dialogue
  return [
    {
      speaker: char1.name,
      emotion: 'สังเกตรอบตัว สุขุม',
      text: `ร่องรอยตรงนี้เพิ่งเกิดขึ้นไม่นาน แสดงว่าเป้าหมายยังไปได้ไม่ไกล`,
    },
    {
      speaker: char2.name,
      emotion: 'พยักหน้ามั่นใจ',
      text: `งั้นก็อย่ามัวรอช้าเลย ตามรอยนี้ไปเดี๋ยวก็รู้เรื่อง`,
    },
  ];
}
