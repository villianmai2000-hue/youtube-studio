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
      previousScenes = [],
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
          previousScenes,
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
  previousScenes?: any[];
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
    previousScenes = [],
  } = params;

  // รายละเอียดตัวละครครบทุกมิติ (ชื่อ, บทบาท, บุคลิก, สไตล์เสียง, ความสัมพันธ์, อาวุธ)
  const charactersStr = characters
    .map((c) => {
      const parts = [`- ${c.name} (${c.role})`];
      if (c.personality) parts.push(`บุคลิก/นิสัย: "${c.personality}"`);
      if (c.voiceStyle) parts.push(`น้ำเสียง/สไตล์การพูด: "${c.voiceStyle}"`);
      if (c.relationships) parts.push(`ความสัมพันธ์: "${c.relationships}"`);
      if (c.weaponsOrProps) parts.push(`อาวุธ/ไอเทม: "${c.weaponsOrProps}"`);
      if (c.appearanceAnchor) parts.push(`รูปลักษณ์: "${c.appearanceAnchor}"`);
      return parts.join(' | ');
    })
    .join('\n');

  // ข้อมูลจากฉากก่อนหน้า เพื่อป้องกันการเริ่มเรื่องใหม่ และป้องกันบทพูดซ้ำซาก
  const previousScenesStr =
    previousScenes && previousScenes.length > 0
      ? `\n🎞️ บริบทและบทพูดจากฉากก่อนหน้า (เพื่อดำเนินเรื่องต่อจากจุดนี้ ห้ามพูดประโยคเดิมซ้ำ และห้ามรีเซ็ตเรื่องใหม่):\n` +
        previousScenes
          .slice(-4)
          .map(
            (s: any) =>
              `- ฉากที่ ${s.sceneNumber} (${s.title}): บทพากย์ [${(s.narration || '').substring(0, 100)}...] | บทพูดล่าสุด: [${
                s.dialogues?.map((d: any) => `${d.speaker}: "${d.text}"`).join(' / ') || '-'
              }]`
          )
          .join('\n')
      : '';

  // ตรวจจับแก่นเรื่องจริงด้วย Theme Detector
  const theme = analyzeStoryTheme({ title, synopsis, genre, subGenre, worldCulture });

  let personaInstruction = '';
  if (theme.isMangaBusSurvival) {
    personaInstruction = `คุณคือนักเขียนบทอนิเมะมังงะรีแคปพากย์ไทยระดับท็อป (Master Anime Manga Recap Screenwriter สไตล์ช่อง Manga Realms MRE)
เรื่องนี้คือ "[พากย์ไทย] ผมคือชายคนเดียวบนรถบัส (Manga Realms MRE / Bus Apocalypse Survival)"
สไตล์การเล่าเรื่องต้องเป็น "อนิเมะมังงะรีแคปพากย์ไทยยาวต่อเนื่อง" ที่ดึงดูดใจผู้ฟังอย่างสูง:
- บทบรรยายดำเนินเรื่อง (Narration): ใช้น้ำเสียงผู้เล่าเรื่องสไตล์ Manga Realms (MRE) ที่น่าติดตาม ลุ้นระทึกทุกวินาที บรรยายความรู้สึกของพระเอกและความตึงเครียดของสถานการณ์บนรถบัสท่ามกลางฝูงซอมบี้
- บทสนทนาตัวละคร (Dialogues): ใช้ภาษาพากย์ไทยอนิเมะที่เป็นธรรมชาติมาก มีชีวิตชีวา (พระเอกสุขุมฉลาด, สาวซึนเดระปากแข็งแต่กลัว, สาวแว่นหมอคอยห่วงใย, สาวเคนโด้เท่ลุยแหลก, น้องสาวตัวเล็กอ้อนและขวัญผวา, นักวิจัยสาวเยือกเย็นกุมความลับ)
- ความต่อเนื่องระดับเทพ (Continuous Long-Take): แต่ละฉากต่อกันวินาทีต่อวินาทีบนรถบัส ไม่ตัดข้ามเหตุการณ์ ค่อยๆ แก้สถานการณ์ทีละเปลาะ (เช่น อุดรอยร้าวที่หน้าต่าง, จัดแบ่งน้ำดื่ม, เช็กสัญญาณวิทยุ, สกัดกรงเล็บซอมบี้ที่ประตู)
- ห้ามมีกลิ่นอายหนังจีน หรือแนวกำลังภายในเด็ดขาด!`;
  } else if (theme.isSpecificKrasue) {
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

กฎเหล็กเด็ดขาดเรื่องบทละครและบทสนทนา (CRITICAL SCREENWRITING CONSTRAINTS):
1. [หัวเรื่องและเนื้อเรื่องต้องตรงกัน 100%] หัวฉาก (title) และบทบรรยาย (narration) ต้องตรงกับชื่อเรื่อง "${title}" และเรื่องย่อ "${synopsis}" อย่างเคร่งครัด ห้ามเขียนเนื้อหาหลุดไปแนวอื่นเด็ดขาด!
2. [เคารพพล็อตเรื่องที่ผู้ใช้พิมพ์] หากผู้ใช้ระบุเรื่องย่อไว้ ให้ดำเนินเรื่องตามพล็อตนั้น ห้ามคิดเรื่องใหม่ที่ฉีกไปคนละเรื่อง
3. [ค่อยๆ เล่าเรื่องแบบภาพยนตร์ต่อเนื่อง ไม่ตัดข้าม] (SLOW-BURN CONTINUOUS CINEMATIC PACING):
   - ต้อง "ค่อยๆ เล่าเรื่อง" อย่างประณีต ลุ่มลึก มีมิติ ไม่เร่งรีบตัดข้ามเหตุการณ์
   - ความต่อเนื่องแบบภาพยนตร์ไร้รอยต่อ (Continuous Long-Take Sequence / No Jump Cuts): แต่ละฉาก (10 วินาที) ต้องดำเนินต่อจากวินาทีสุดท้ายของฉากก่อนหน้าทันที ในสถานที่เดิม เวลาเดิม หรือต่อเนื่องในแอ็กชันเดียวกัน ห้ามตัดข้ามเวลาหรือสถานที่เด็ดขาด
   - ฉากที่ 1 -> ฉากที่ 2 -> ฉากที่ 3 -> ฉากที่ 4 ต้องเชื่อมโยงกันแนบสนิทเหมือนกล้องถ่ายทำช็อตต่อเนื่อง
4. [ห้ามบทพูดซ้ำซากจำเจเด็ดขาด (ZERO DIALOGUE REPETITION)]:
   - ❌ ห้ามใช้ประโยคสำเร็จรูปซ้ำซาก เช่น "ระวังตัวด้วย!", "ไปกันเถอะ!", "ข้างหน้านั้นมีอะไร?", "ข้าจะไม่ยอมแพ้!", "เราต้องรอดกลับไป", "เกิดอะไรขึ้นน่ะ" ซ้ำๆ ทุกฉาก
   - แต่ละฉากต้องมี "ประเด็นพูดคุยใหม่ (New Information / New Beat)" ที่พูดถึงเหตุการณ์ที่อยู่ตรงหน้าจริงๆ ในวินาทีนั้น
5. [บทพูดต้องเป็นธรรมชาติและสะท้อนบุคลิกตัวละคร (NATURAL & DISTINCT CHARACTER VOICES)]:
   - ❌ ห้ามใช้ภาษาหนังสือแข็งกระด้างหรือพูดเหมือนหุ่นยนต์ท่องจำ (เช่น "เราต้องทำการตรวจสอบสิ่งนี้โดยพลัน")
   - ✅ ต้องใช้ "ภาษาพูดจริง (Spoken Natural Dialogue)" ที่มีชีวิตชีวา อารมณ์ คำเชื่อม คำอุทาน หรือภาษาเฉพาะตามวัฒนธรรม "${theme.effectiveCulture}"
   - ตัวละครแต่ละตัวต้องพูดไม่เหมือนกันตาม "บุคลิก (personality)" และ "น้ำเสียง (voiceStyle)" ที่ระบุไว้ในรายชื่อตัวละคร (เช่น ตัวเอกสุขุมพูดน้อยแต่เฉียบขาด, สหายขี้เล่นชอบแซวหรือบ่น, ตัวร้ายเยาะเย้ยกดดัน)
   - คำเรียกขานต้องตรงกับ "ความสัมพันธ์ (relationships)" ระหว่างกัน (เช่น "พี่...", "อาจารย์", "แก!", "นาย...")
6. [ตัวละครในฉากต้องสัมพันธ์กับบทสนทนา (SCENE CAST COHERENCE)]:
   - ในแต่ละฉาก ให้ระบุ "charactersPresent" ว่ามีตัวละครใดบ้างที่อยู่ในฉากนั้นจริงๆ (1-3 คน)
   - ⚠️ บทสนทนาในฉากนั้น ต้องพูดโดยตัวละครที่อยู่ใน charactersPresent เท่านั้น! ห้ามมีตัวละครที่ไม่ได้อยู่ในฉากโผล่มาพูด
   - ตัวละครที่อยู่ด้วยกันต้องมีปฏิสัมพันธ์โต้ตอบกันอย่างน้อย 2-4 บรรทัด (ถาม-ตอบ, ขัดคอ, เตือนสติ, ปรึกษากลยุทธ์ หรือแสดงความรู้สึก)
7. [บทเล่าเรื่องสัมพันธ์ต่อเนื่องกัน] (COHERENT STORY NARRATION):
   - บทบรรยายดำเนินเรื่อง (narration) ของแต่ละฉากต้องมีเนื้อหา 2-4 ประโยคที่สละสลวย ชวนติดตาม
   - บรรยายปูบรรยากาศและร้อยเรียงเข้ากับบทพูดตัวละครอย่างกลมกลืน ส่งต่ออารมณ์จากฉากก่อนหน้าสู่ฉากถัดไปอย่างไร้รอยต่อ
8. [Single Unified Shot] หากมีตัวละครตั้งแต่ 2 ตัวขึ้นไปในฉาก ต้องให้ตัวละครทุกคนปรากฏตัวในเฟรมเดียวกัน (Unified Shot / Two-Shot / Group Shot) ห้ามแบ่งจอเด็ดขาด
9. [Seedream 5.0 Pro Ready] แต่ละฉากยาว 10 วินาที มีการเคลื่อนไหวของกล้อง (cameraMovement) แสงเงา (lighting) และเสียงประกอบ (sfxBgm)
10. [วัฒนธรรมถูกต้อง] บท, ชื่อสถานที่, เครื่องแต่งกาย, ดนตรี ต้องสอดคล้องกับวัฒนธรรม "${theme.effectiveCulture}" โดยเฉพาะ ห้ามปะปนวัฒนธรรมอื่นโดยไม่มีเหตุผล`;


  const userPrompt = `
ชื่อเรื่อง: ${title}
เรื่องย่อ: ${synopsis}
หมวดหมู่: ${theme.effectiveGenre} ${theme.effectiveSubGenre ? `(${theme.effectiveSubGenre})` : ''}
วัฒนธรรมโลก: ${theme.effectiveCulture} (ธีม: ${theme.themeNameTh})
รูปแบบภาพ: ${visualMedium} | สไตล์: ${stylePreset}
องค์ที่ต้องการสร้าง: องค์ที่ ${actNumber}
${customInstructions ? `คำสั่งพิเศษเพิ่มเติม: ${customInstructions}` : ''}

รายชื่อตัวละครและบุคลิกเฉพาะตัว:
${charactersStr}
${previousScenesStr}

🎬 กฎการเขียนบทภาพยนตร์ 4 ฉากต่อเนื่อง (Cinematic Continuity & Natural Dialogues):
- [จังหวะการเล่า] ค่อยๆ เล่าเรื่อง (Slow-Burn Narrative) ละเมียดละไม ให้ความสำคัญกับบรรยากาศและการกระทำต่อเนื่อง ไม่ตัดข้ามเวลา
- [ความต่อเนื่องไม่ตัดข้าม (No Jump Cuts)]:
  • ฉากที่ ${(actNumber - 1) * 4 + 1}: [เปิดฉาก / ประคองสถานการณ์] ค่อยๆ เปิดฉาก บรรยายบรรยากาศ สภาพแวดล้อม และตัวละครเริ่มสังเกตหรือเผชิญสิ่งตรงหน้า
  • ฉากที่ ${(actNumber - 1) * 4 + 2}: [ต่อเนื่องทันทีในวินาทีถัดไป] กล้องและตัวละครขยับต่อเนื่องจากฉากแรกทันที ตัวละครพูดคุยปรึกษาหารือหรือตอบโต้สิ่งที่พบ
  • ฉากที่ ${(actNumber - 1) * 4 + 3}: [จังหวะบีบคั้น / อารมณ์ขยายตัว] ต่อเนื่องจากฉาก 2 สถานการณ์ตึงเครียดขึ้น ตัวละครพูดคุยตัดสินใจแอ็กชันเฉพาะหน้า
  • ฉากที่ ${(actNumber - 1) * 4 + 4}: [สรุปจังหวะและส่งต่อ] ผลลัพธ์ต่อเนื่องจากฉาก 3 ทิ้งอารมณ์และปมสำคัญเพื่อส่งต่อไปยังองค์ถัดไปอย่างไร้รอยต่อ
▶ [บทเล่าเรื่อง (narration)]: 2-4 ประโยค ค่อยๆ เล่าเรื่อง ดำเนินเรื่องอย่างละเมียดละไม เชื่อมโยงฉากต่อฉาก
▶ [บทสนทนา (dialogues)]: ต้องมีบทพูดตัวละครโต้ตอบกันอย่างน้อย 2-4 บรรทัดต่อฉาก (เป็นภาษาพูดธรรมชาติ มีเอกลักษณ์ตามบุคลิก ห้ามใช้คำซ้ำซาก)
▶ [charactersPresent]: ระบุรายชื่อตัวละครที่มีบทบาทในฉากนี้จริงๆ (1-3 คน) จากรายชื่อตัวละครด้านบน
▶ [sceneAction]: บรรยายภาพที่ตรงกับ narration และ dialogues สำหรับสร้างภาพ/วิดีโอต่อเนื่อง

กรุณาเขียนบทองค์ที่ ${actNumber} จำนวน 4 ฉากต่อเนื่อง (ฉากที่ ${(actNumber - 1) * 4 + 1} ถึง ${(actNumber - 1) * 4 + 4})
ตอบกลับเป็น JSON Array เท่านั้น (ห้ามใส่คำนำหน้าหรือ Markdown codeblock):
[
  {
    "title": "หัวฉากสั้น กระชับ ตรงกับเหตุการณ์ในฉากนั้น (ห้ามใส่คำว่า 'ฉากที่ X:')",
    "charactersPresent": ["ชื่อตัวละครที่อยู่ในฉากนี้ (ตรงกับรายชื่อตัวละคร)"],
    "narration": "บทบรรยายเสียงพากย์ดำเนินเรื่อง 2-4 ประโยคที่สละสลวย ค่อยๆ เล่าเรื่องราวให้เห็นภาพชัดเจนและต่อเนื่องจากฉากก่อนหน้า",
    "sceneAction": "อธิบายตัวละครกำลังทำอะไร ท่าทางอย่างไร อยู่ในสภาพแวดล้อมแบบไหน เพื่อใช้สร้างภาพและวิดีโอต่อเนื่อง",
    "dialogues": [
      {"speaker": "ชื่อตัวละคร (ต้องอยู่ใน charactersPresent)", "emotion": "อารมณ์/น้ำเสียงตามบุคลิก", "text": "บทสนทนาประโยคแรกที่เป็นธรรมชาติ ตรงตามสถานการณ์"},
      {"speaker": "ชื่อตัวละครอีกตัว (ต้องอยู่ใน charactersPresent)", "emotion": "อารมณ์/น้ำเสียงตามบุคลิก", "text": "บทสนทนาโต้ตอบอย่างมีเอกลักษณ์ ไม่ใช้คำซ้ำซาก"},
      {"speaker": "ชื่อตัวละคร", "emotion": "อารมณ์/น้ำเสียง", "text": "บทสนทนาต่อยอดหรือข้อสรุปของช็อตนี้"}
    ],
    "sfxBgm": "ดนตรีและเสียงประกอบที่เหมาะกับอารมณ์ฉาก",
    "cameraMovement": "การเคลื่อนกล้อง 10 วินาทีต่อเนื่อง Seedream 5.0 Pro (สเตดิแคม/ดอลลี่ ไหลลื่นไม่ตัดข้าม)",
    "lighting": "การจัดแสงที่เสริมอารมณ์ฉากอย่างมีมิติ"
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
              temperature: 0.65,
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

        // ✅ จับคู่ตัวละครที่ปรากฏในฉากนี้จริงๆ เพื่อผูก characterIds และส่งให้ buildVisualPrompts
        const presentNames: string[] = Array.isArray(item.charactersPresent) ? item.charactersPresent : [];
        const dialogueSpeakers: string[] = (item.dialogues || []).map((d: any) => d.speaker || '');

        const matchedChars = characters.filter((c) =>
          presentNames.some((n: string) => n && (n.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(n.toLowerCase()))) ||
          dialogueSpeakers.some((s: string) => s && (s.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(s.toLowerCase())))
        );

        // ถ้า match ได้ ให้ใช้ตัวละครเหล่านั้น ถ้าไม่เจอเลย ให้ใช้ตัวละครหลัก 1-2 ตัวแรก
        const activeSceneChars = matchedChars.length > 0 ? matchedChars : characters.slice(0, Math.min(2, characters.length));

        // ✅ ใช้ sceneAction เป็นตัวนำในการสร้างภาพ/วิดีโอ แทน title เพียงอย่างเดียว
        // ถ้า Gemini ไม่ส่ง sceneAction มา ให้สร้างจาก narration + title แทน
        const visualAction = item.sceneAction ||
          `${item.narration ? item.narration.substring(0, 120) : ''} ${item.title}`.trim();

        const prompts = buildVisualPrompts({
          sceneTitle: visualAction,
          narration: item.narration,
          dialogueText: item.dialogues?.map((d: any) => `${d.speaker}: ${d.text}`).join(' '),
          visualMedium: visualMedium as VisualMedium,
          stylePreset: stylePreset as StylePreset,
          genre: effectiveGenre,
          cameraMovement: item.cameraMovement || 'Cinematic tracking shot',
          lighting: item.lighting || 'Dramatic cinematic lighting',
          charactersInScene: activeSceneChars, // ✅ ส่งเฉพาะตัวละครที่อยู่ในฉากจริงๆ
          sceneNumber: sceneNum,
          worldCulture: theme.effectiveCulture,
        });

        return {
          id: `scene-${Date.now()}-${sceneNum}`,
          sceneNumber: sceneNum,
          actNumber: actNumber as 1 | 2 | 3 | 4,
          title: item.title,
          narration: item.narration,
          sceneAction: item.sceneAction || '',
          dialogues: item.dialogues || [],
          sfxBgm: item.sfxBgm || '[BGM: บรรเลงตามอารมณ์ฉาก]',
          characterIds: activeSceneChars.map((c) => c.id), // ✅ เฉพาะตัวละครที่อยู่ในฉากนี้จริงๆ
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
