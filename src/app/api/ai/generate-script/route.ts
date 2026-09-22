import { NextResponse } from 'next/server';
import { generateContinuousMovieScenes } from '@/lib/script-templates';
import { MovieGenre, VisualMedium, StylePreset, CharacterBible, ScriptScene } from '@/lib/types';
import { buildVisualPrompts } from '@/lib/ai-prompt-engine';
import { analyzeStoryTheme } from '@/lib/theme-detector';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      synopsis = '',
      genre = 'epic_fantasy',
      visualMedium = 'live_action',
      stylePreset = 'hollywood_cinematic',
      targetDurationMinutes = 60,
      actNumber = 1,
      characters = [],
      apiKey = process.env.GEMINI_API_KEY,
      customInstructions = '',
      mode = 'act', // 'act' | 'full_movie'
      worldCulture = 'thai',
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
        const geminiResult = await generateScriptWithGemini({
          apiKey: apiKey.trim(),
          title,
          synopsis,
          genre,
          visualMedium,
          stylePreset,
          actNumber,
          characters,
          customInstructions,
          worldCulture,
          subGenre,
        });

        if (geminiResult && geminiResult.scenes && geminiResult.scenes.length > 0) {
          return NextResponse.json({
            success: true,
            scenes: geminiResult.scenes,
            source: `Google Gemini AI (${geminiResult.modelUsed})`,
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
      source: 'Built-in Cinema & Story Engine',
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
  worldCulture?: string;
  subGenre?: string;
}): Promise<{ scenes: ScriptScene[]; modelUsed: string }> {
  const {
    apiKey,
    title,
    synopsis,
    genre,
    visualMedium,
    stylePreset,
    actNumber,
    characters,
    customInstructions,
    worldCulture = '',
    subGenre = '',
  } = params;

  const charactersStr = characters
    .map((c) => `- ${c.name} (${c.role}): รูปลักษณ์ [${c.appearanceAnchor}], น้ำเสียง [${c.voiceStyle}], อาวุธ [${c.weaponsOrProps || 'ไม่มี'}]`)
    .join('\n');

  // ตรวจจับแก่นเรื่องจริงด้วย Theme Detector
  const theme = analyzeStoryTheme({ title, synopsis, genre, subGenre, worldCulture });

  let personaInstruction = '';
  if (theme.isSpecificKrasue) {
    personaInstruction = `คุณคือนักเขียนบทภาพยนตร์สยองขวัญระดับปรมาจารย์ (Master Thai Krasue & Folklore Screenwriter)
เรื่องนี้คือ "ตำนานผีกระสือ & อาถรรพ์หมู่บ้านไทย"
หัวฉาก (title), บทบรรยาย (narration), และบทสนทนา (dialogues) ทุกฉากต้องเกี่ยวกับผีกระสือ, ดวงไฟลอยหากินยามวิกาล, หัวกับไส้เรืองแสง, ความหวาดผวาของชาวบ้าน, หนามไผ่ดักกระสือ, และการสืบหาความจริงเพื่อปลดปล่อยคำสาป ห้ามหลุดไปแนวอื่นเด็ดขาด!`;
  } else if (theme.isSpecificTakhian) {
    personaInstruction = `คุณคือนักเขียนบทภาพยนตร์สยองขวัญระดับปรมาจารย์ (Master Thai Takhian Horror Screenwriter)
เรื่องนี้คือ "ตำนานเจ้าแม่ตะเคียนทอง & ป่าอาถรรพ์"
เนื้อหาทุกฉากต้องเกี่ยวกับอาถรรพ์ต้นตะเคียนโบราณ, สไบเขียวดิ้นทอง, ป่าดงดิบลี้ลับ, ความโลภตัดไม้ และแรงแค้นของเจ้าแม่`;
  } else if (theme.isHorrorOrGhost) {
    personaInstruction = `คุณคือนักเขียนบทภาพยนตร์สยองขวัญระดับปรมาจารย์ (Master Thai Horror Screenwriter)
เรื่องนี้คือ "${theme.themeNameTh}" ให้สร้างบรรยากาศขนหัวลุก มีความสมจริงตามความเชื่อไทย เช่น กลิ่นธูป, ลมพัดหวีดหวิว, เสียงกระซิบ, ความมืดในป่าดงดิบหรือเรือนไทยโบราณ, ความแค้นของวิญญาณ, กรรมลิขิต และอำนาจอาคม`;
  } else if (theme.isThaiMyth) {
    personaInstruction = `คุณคือนักเขียนบทวรรณคดีและตำนานไทยแฟนตาซีระดับมหากาพย์ (Thai Myth & Folklore Screenwriter)
เรื่องนี้คือ "${theme.themeNameTh}" เน้นความยิ่งใหญ่ของพญานาค, ลุ่มน้ำโขง, องค์เทพ, ครุฑ, เมืองบาดาล, หรือเวทมนตร์โบราณอันศักดิ์สิทธิ์`;
  } else if (theme.isThaiDrama) {
    personaInstruction = `คุณคือนักเขียนบทละครโทรทัศน์และภาพยนตร์ไทยระดับมืออาชีพ (Master Thai Drama & Film Screenwriter)
เรื่องนี้คือ "${title}" — เป็นเรื่อง${synopsis ? `เกี่ยวกับ "${synopsis}"` : 'ดราม่า / โรแมนติก / ชีวิตคนไทย'}
⚠️ กฎเด็ดขาด: ต้องเขียนในสไตล์หนัง/ละครไทยเท่านั้น! ห้ามใช้คำจีน, ชื่อจีน, สำนักเซียน, ลมปราณ, กระบี่บิน หรือสไตล์อนิเมะจีน/ญี่ปุ่นโดยเด็ดขาด!
ฉากและบรรยากาศต้องเป็นไทย: บ้านทรงไทย, ทุ่งนา, กรุงเทพ, ตลาด, วัด, โรงเรียน, ชนบท หรือ สถานที่ที่สอดคล้องกับเรื่องย่อ
ชื่อตัวละครและบทสนทนาต้องเป็นภาษาไทยสมจริง ฟังดูเป็นธรรมชาติ ไม่แข็งกระด้าง`;
  } else if (theme.isCultivation) {
    personaInstruction = `คุณคือนักเขียนบทอนิเมะ 3D กำลังภายในและเซียนระดับมาสเตอร์พีซ (Xianxia Cultivation Screenwriter)
เรื่องนี้คือ "${theme.themeNameTh}" เน้นการท่องยุทธภพ บำเพ็ญเพียร พลังลมปราณ วิชากระบี่บิน ความแค้นและบุญคุณ`;
  } else if (theme.isTowerOrDungeon) {
    personaInstruction = `คุณคือนักเขียนบทหอคอย 100 ชั้นและฮันเตอร์ระดับมาสเตอร์พีซ (Tower Hunter Screenwriter)
เรื่องนี้คือ "${theme.themeNameTh}" เน้นการเคลียร์ชั้นหอคอย สกิลฮันเตอร์ และการต่อสู้บอส`;
  } else if (theme.isMilitary) {
    personaInstruction = `คุณคือนักเขียนบทยุทธการสงครามและหน่วยรบพิเศษ (Military Tactical Screenwriter)
เรื่องนี้คือ "${theme.themeNameTh}" เน้นยุทธวิธีทางทหาร การบัญชาการ และปฏิบัติการแนวหน้า`;
  } else if (theme.isSciFi) {
    personaInstruction = `คุณคือนักเขียนบทไซไฟไซเบอร์พังก์และไฮเปอร์สเปซ (Sci-Fi & Cyberpunk Screenwriter)
เรื่องนี้คือ "${theme.themeNameTh}" เน้นเทคโนโลยีอนาคต แฮกเกอร์ และหุ่นยนต์`;
  } else if (theme.isPirateOrAdventure) {
    personaInstruction = `คุณคือนักเขียนบทอนิเมะโชเน็นผจญภัยโจรสลัดระดับโลก (Pirate Adventure Screenwriter)
เรื่องนี้คือ "${theme.themeNameTh}" เน้นมิตรภาพ ความฝัน การผจญภัย และทะเลกว้างใหญ่`;
  } else if (theme.isWesternCinema) {
    personaInstruction = `คุณคือนักเขียนบทภาพยนตร์ฮอลลีวูดระดับแนวหน้า (Hollywood Blockbuster Screenwriter)
เรื่องนี้คือ "${theme.themeNameTh}" เน้นจังหวะกระชับ ฉับไว แอ็กชันดุเดือด สมจริง และการสืบสวน`;
  } else {
    personaInstruction = `คุณคือนักเขียนบทภาพยนตร์มืออาชีพ (Professional Screenwriter)
เรื่องนี้คือ "${title || theme.themeNameTh}"
สไตล์การเขียนต้องสอดคล้องกับวัฒนธรรม "${theme.effectiveCulture}" ห้ามเขียนสไตล์จีนหากเป็นเรื่องไทย และห้ามเขียนสไตล์ไทยหากเป็นเรื่องจีน`;
  }

  const systemInstruction = `${personaInstruction}
คุณต้องเขียนบทภาพยนตร์สำหรับ "องค์ที่ ${actNumber}" จำนวน 4 ฉากต่อเนื่อง (ฉากละ 10 วินาที)

กฎเหล็กเด็ดขาด (CRITICAL CONSTRAINTS):
1. [หัวเรื่องและเนื้อเรื่องต้องตรงกัน 100%] หัวฉาก (title) และบทบรรยาย (narration) ต้องตรงกับชื่อเรื่อง "${title}" และเรื่องย่อ "${synopsis}" อย่างเคร่งครัด ห้ามเขียนเนื้อหาหลุดไปแนวอื่นเด็ดขาด!
2. [เคารพพล็อตเรื่องที่ผู้ใช้พิมพ์] หากผู้ใช้ระบุเรื่องย่อไว้ ให้ดำเนินเรื่องตามพล็อตนั้น ห้ามคิดเรื่องใหม่ที่ฉีกไปคนละเรื่อง
3. [ตัวละครขับเคลื่อนเรื่องราว] ดึงตัวละครที่มีในรายชื่อมามีบทบาท สนทนา และทำกิจกรรมร่วมกันในฉากอย่างสมเหตุสมผล
4. [Single Unified Shot] หากมีตัวละครตั้งแต่ 2 ตัวขึ้นไปในฉาก ต้องให้ตัวละครทุกคนปรากฏตัวในเฟรมเดียวกัน (Unified Shot / Two-Shot / Group Shot) ห้ามแบ่งจอเด็ดขาด
5. [Seedream 5.0 Pro Ready] แต่ละฉากยาว 10 วินาที มีการเคลื่อนไหวของกล้อง (cameraMovement) แสงเงา (lighting) และเสียงประกอบ (sfxBgm)
6. [วัฒนธรรมถูกต้อง] บท, ชื่อสถานที่, เครื่องแต่งกาย, ดนตรี ต้องสอดคล้องกับวัฒนธรรม "${theme.effectiveCulture}" โดยเฉพาะ ห้ามปะปนวัฒนธรรมอื่นโดยไม่มีเหตุผล`;


  const userPrompt = `
ชื่อเรื่อง: ${title}
เรื่องย่อ: ${synopsis}
หมวดหมู่: ${theme.effectiveGenre} ${theme.effectiveSubGenre ? `(${theme.effectiveSubGenre})` : ''}
วัฒนธรรมโลก: ${theme.effectiveCulture} (ธีม: ${theme.themeNameTh})
รูปแบบภาพ: ${visualMedium} | สไตล์: ${stylePreset}
องค์ที่ต้องการสร้าง: องค์ที่ ${actNumber}
${customInstructions ? `คำสั่งพิเศษเพิ่มเติม: ${customInstructions}` : ''}

รายชื่อตัวละครหลักที่ต้องนำมาใช้ในบท:
${charactersStr}

กรุณาเขียนบทองค์ที่ ${actNumber} จำนวน 4 ฉากต่อเนื่อง (ฉากที่ ${(actNumber - 1) * 4 + 1} ถึง ${(actNumber - 1) * 4 + 4})
ตอบกลับเป็น JSON Array เท่านั้น (ห้ามใส่คำนำหน้าหรือ Markdown codeblock):
[
  {
    "title": "หัวฉากที่กระชับและตรงกับชื่อเรื่อง/เรื่องย่อ (ห้ามใส่คำว่า 'ฉากที่ X:')",
    "narration": "บทบรรยายดำเนินเรื่องสำหรับผู้พากย์เสียง",
    "dialogues": [{"speaker": "ชื่อตัวละคร", "emotion": "อารมณ์", "text": "บทสนทนา"}],
    "sfxBgm": "ดนตรีและเสียงประกอบ",
    "cameraMovement": "การเคลื่อนกล้อง 10 วินาทีต่อเนื่อง Seedream 5.0 Pro",
    "lighting": "การจัดแสง"
  }
]
`;

  // Try Gemini Models in order of capability: gemini-3.1-pro-preview, gemini-3.1-pro, gemini-2.5-pro, etc.
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
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }],
            generationConfig: {
              temperature: 0.75,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini (${model}) API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error(`Empty response from Gemini ${model}`);

      const parsed = JSON.parse(rawText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error(`Expected non-empty array from Gemini ${model}`);
      }

      const effectiveGenre = theme.effectiveGenre;

      const scenes = parsed.map((item, idx) => {
        const sceneNum = (actNumber - 1) * 4 + (idx + 1);
        const prompts = buildVisualPrompts({
          sceneTitle: item.title,
          narration: item.narration,
          dialogueText: item.dialogues?.map((d: any) => `${d.speaker}: ${d.text}`).join(' '),
          visualMedium: visualMedium as VisualMedium,
          stylePreset: stylePreset as StylePreset,
          genre: effectiveGenre,
          cameraMovement: item.cameraMovement || 'Cinematic tracking shot',
          lighting: item.lighting || 'Dramatic cinematic lighting',
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
          googleFlowPrompt: prompts.googleFlowPrompt,
          googleFlowSeed: prompts.googleFlowSeed,
          negativePrompt: prompts.negativePrompt,
          estimatedDurationSec: 10,
          createdAt: new Date().toISOString(),
        };
      });

      return { scenes, modelUsed: model };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Attempt with ${model} failed:`, lastError.message);
    }
  }

  throw lastError || new Error('All Gemini models failed');
}
