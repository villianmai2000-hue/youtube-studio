import { MovieGenre, VisualMedium, StylePreset, ScriptScene, CharacterBible, AspectRatio } from './types';
import { buildVisualPrompts } from './ai-prompt-engine';
import { generateProceduralSceneContent, SceneBeatParams } from './procedural-story-beats';
import { analyzeStoryTheme, isCastMismatched } from './theme-detector';
import { detectStoryCharacterScale, generateIntelligentCharacters } from './character-generator';

export interface GenerateScriptOptions {
  title: string;
  synopsis: string;
  genre: MovieGenre;
  visualMedium: VisualMedium;
  stylePreset: StylePreset;
  targetDurationMinutes: number;
  actNumber?: 1 | 2 | 3 | 4;
  characters: CharacterBible[];
  aspectRatio?: AspectRatio;
  worldCulture?: string;
  subGenre?: string;
}

/**
 * คำนวณจำนวนฉากตามสูตรคณิตศาสตร์:
 * รวมเวลาเป็นวินาที = จำนวนนาที * 60
 * จำนวนฉาก = รวมเวลาเป็นวินาที ÷ 10 วินาทีต่อฉาก
 * ตัวอย่าง: 2 ชั่วโมง 30 นาที = 9,000 วินาที ÷ 10 = 900 ฉาก
 */
export function calculateMovieScenesCount(targetDurationMinutes: number): {
  targetDurationMinutes: number;
  totalSeconds: number;
  secondsPerScene: number;
  totalScenes: number;
  calculationBreakdown: string;
} {
  const mins = Math.max(1, Math.round(Number(targetDurationMinutes) || 60));
  const totalSeconds = mins * 60;
  const secondsPerScene = 10;
  const totalScenes = Math.max(1, Math.round(totalSeconds / secondsPerScene));

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  let breakdown = '';
  if (hours > 0 && remainingMins > 0) {
    breakdown = `${hours} ชั่วโมง (${(hours * 3600).toLocaleString()} วินาที) + ${remainingMins} นาที (${(remainingMins * 60).toLocaleString()} วินาที) = รวม ${totalSeconds.toLocaleString()} วินาที ÷ 10 วินาที/ฉาก = ${totalScenes.toLocaleString()} ฉาก`;
  } else if (hours > 0) {
    breakdown = `${hours} ชั่วโมง (${totalSeconds.toLocaleString()} วินาที) ÷ 10 วินาที/ฉาก = ${totalScenes.toLocaleString()} ฉาก`;
  } else {
    breakdown = `${mins} นาที (${totalSeconds.toLocaleString()} วินาที) ÷ 10 วินาที/ฉาก = ${totalScenes.toLocaleString()} ฉาก`;
  }

  return {
    targetDurationMinutes: mins,
    totalSeconds,
    secondsPerScene,
    totalScenes,
    calculationBreakdown: breakdown,
  };
}

/**
 * กำจัดคำนำหน้าที่ซ้ำซ้อน เช่น 'ฉากที่ 4: ฉากที่ 4: ...'
 */
export function cleanSceneTitle(title: string): string {
  if (!title) return '';
  return title.replace(/^(?:ฉากที่\s*\d+\s*:\s*)+/gi, '').trim();
}

/**
 * แปลงวินาทีเป็นรูปแบบเวลา mm:ss หรือ hh:mm:ss
 */
export function formatTimeCode(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * ฟังก์ชันหลักในการสร้างฉากภาพยนตร์แบบเต็มเวลาและต่อเนื่อง (Continuous Movie Generator)
 * รองรับตั้งแต่ 18 ฉาก (3 นาที) จนถึง 900+ ฉาก (2 ชั่วโมง 30 นาที)
 * ปรับมุมกล้อง Seedream 5.0 Pro ไหลลื่นไม่ตัด (Single-Take Vector Flow) ฉากละ 10 วินาที
 */
export function generateContinuousMovieScenes(options: GenerateScriptOptions): ScriptScene[] {
  const {
    title,
    synopsis = '',
    genre,
    visualMedium,
    stylePreset,
    targetDurationMinutes = 60,
    characters = [],
    aspectRatio = '16:9',
    worldCulture = 'chinese',
    subGenre = '',
  } = options;

  // 1. คำนวณจำนวนฉากตามสูตรคณิตศาสตร์: เวลาวินาทีทั้งหมด ÷ 10 วินาทีต่อฉาก
  const calc = calculateMovieScenesCount(targetDurationMinutes);
  const totalScenes = calc.totalScenes;

  // 2. ตรวจจับแก่นเรื่องจากชื่อเรื่อง เรื่องย่อ และหมวดหมู่ด้วย Theme Detector อัจฉริยะ
  const theme = analyzeStoryTheme({
    title,
    synopsis,
    genre,
    subGenre,
    worldCulture,
  });

  // ตรวจสอบว่า Character roster ที่ส่งเข้ามา ขัดแย้งกับธีมชื่อเรื่องหรือไม่
  // หากขัดแย้ง (เช่น ชื่อเรื่องผีกระสือ แต่ cast เป็นกัปตันมังกี้ หรือไซเฟอร์) ให้ Auto-heal ด้วย Roster ที่ตรงกับธีมทันที!
  let resolvedCharacters = characters;
  if (!resolvedCharacters || resolvedCharacters.length === 0 || isCastMismatched(resolvedCharacters, theme)) {
    const scale = detectStoryCharacterScale(title, synopsis, worldCulture, subGenre);
    resolvedCharacters = generateIntelligentCharacters({
      title,
      synopsis,
      worldCulture: theme.effectiveCulture,
      genre: theme.effectiveGenre,
      subGenre: theme.effectiveSubGenre,
      visualMedium,
      count: scale.count,
    });
  }

  // 3. จัดกลุ่มตัวละครทั้งหมดในโปรเจกต์ (Ensemble Cast Engine)
  const leadChar = resolvedCharacters.find((c) => c.role === 'protagonist') || resolvedCharacters[0];
  const antagonist =
    resolvedCharacters.find((c) => c.role === 'antagonist') ||
    resolvedCharacters[resolvedCharacters.length - 1] ||
    leadChar;

  // รวมตัวละครสหาย/ลูกเรือ/อาจารย์/หน่วยรบทั้งหมดที่มีในโปรเจกต์
  const comrades = resolvedCharacters.filter((c) => c.id !== leadChar.id && c.id !== antagonist.id);

  // 4. มุมกล้อง Seedream 5.0 Pro (10s Continuous Vectors)
  const cameraMotions = [
    'สเตดิแคมมุมมองบุคคลที่สาม แทร็กกิ้งตามหลังก้าวย่าง สไลด์ผ่านม่านพลังงานและฝุ่นควันอย่างนุ่มนวล',
    'ออร์บิท 360 องศาหมุนวนรอบตัวละคร มิติพารัลแลกซ์ลึกชัด แสงเงาเปลี่ยนตามทิศทางการหมุนอย่างสมจริง',
    'ดอลลี่พุชอินมุมต่ำ (Low-Angle Dutch Tilt) โฟกัสประกายแสงในแววตาและคมอาวุธอย่างน่าเกรงขาม',
    'FPV Cinematic Drone ลอยฉวัดเฉวียนผ่านสิ่งกีดขวาง ทะลวงสู่ใจกลางสมรภูมิด้วยความเร็วสูงแบบ Single Take',
    'โอเวอร์เดอะโชลเดอร์ (OTS) แพนคู่ขนานระหว่างคู่ต่อสู้ รักษาระยะโฟกัสแบบ Anamorphic ตลอด 10 วินาที',
    'สโลว์โมชั่น 60fps ดอลลี่สไลด์ด้านข้างจับสะเก็ดประกายพลังงานและการระเบิดที่กระจายรอบตัวละคร',
    'เครนช็อตค่อยๆ ลอยตัวสูงขึ้นอย่างสง่างาม เผยสมรภูมิรอบด้านแบบภาพยนตร์ฟอร์มยักษ์',
    'ไดนามิกแทร็กกิ้งพุ่งตามวิถีการเคลื่อนไหว พลิกแพน 180 องศาจับจังหวะหยุดนิ่งคมชัดระดับ 8K',
    'มาโครโคลสอัพที่ดวงตาและอักขระพลังงาน ก่อนดอลลี่เอาต์อย่างรวดเร็วเผยให้เห็นสนามพลังรอบตัว',
    'แฮนด์เฮลด์ภาพยนตร์ที่มีเสถียรภาพกึ่งสารคดี (Cinematic Steadicam) พุ่งตรงไปข้างหน้าไม่สะดุด',
  ];

  // คำเชื่อมเวลาสำหรับการเล่าเรื่องต่อเนื่องแบบไม่ตัด
  const timeTransitions = [
    'ในวินาทีนั้นเอง...',
    'วินาทีถัดมา...',
    'โดยไม่เปิดโอกาสให้ศัตรูตั้งตัว...',
    'คลื่นพลังที่ยังไม่ทันจางหาย...',
    'สายตาที่แน่วแน่จับจ้องไปเบื้องหน้า...',
    'ก้าวต่อไปสู่สมรภูมิ...',
    'ทันใดนั้นเอง แรงสั่นสะเทือนระลอกใหม่ก็ปะทุขึ้น...',
    'ในเสี้ยววินาทีแห่งความเป็นความตาย...',
    'ประกายแสงยังคงลุกโชนอย่างต่อเนื่อง...',
    'แรงผลักดันจากช็อตก่อนหน้านำพาไปสู่...',
    'บรรยากาศทวีความตึงเครียดขึ้นในพริบตา...',
    'โดยไม่มีความลังเลแม้เพียงครึ่งก้าว...',
  ];

  const scenes: ScriptScene[] = [];
  const cleanTitleStr = title || 'มหากาพย์การต่อสู้';

  for (let i = 0; i < totalScenes; i++) {
    const sceneNumber = i + 1;
    const progress = totalScenes > 1 ? i / (totalScenes - 1) : 0; // 0.0 -> 1.0

    // กำหนดองค์ที่ 1-4 ตามสัดส่วนความยาว
    let actNumber: 1 | 2 | 3 | 4 = 1;
    if (progress < 0.25) {
      actNumber = 1;
    } else if (progress < 0.5) {
      actNumber = 2;
    } else if (progress < 0.75) {
      actNumber = 3;
    } else {
      actNumber = 4;
    }

    // เวลาเริ่มต้นและสิ้นสุดของฉากนี้ (ฉากละ 10 วินาที)
    const startSec = i * 10;
    const endSec = (i + 1) * 10;
    const timeRangeStr = `${formatTimeCode(startSec)} - ${formatTimeCode(endSec)}`;

    // เลือกท่วงท่ามุมกล้องและคำเชื่อมแบบหมุนเวียนให้หลากหลาย
    const cameraMotion = cameraMotions[i % cameraMotions.length];
    const transition = timeTransitions[i % timeTransitions.length];

    // คัดเลือกตัวละครที่ร่วมเฟรมในช็อต 10 วินาทีนี้ (Dynamic Ensemble Squad)
    // เพื่อให้ตัวละครทุกคนมีบทบาท พูดคุย และโชว์ทักษะสลับกันอย่างสมบูรณ์แบบ
    let activeSquad: CharacterBible[] = [];

    if (comrades.length === 0) {
      if (actNumber === 3) {
        activeSquad = [leadChar, antagonist];
      } else {
        activeSquad = [leadChar];
      }
    } else if (comrades.length === 1) {
      if (actNumber === 3 && i % 2 === 1) {
        activeSquad = [leadChar, antagonist];
      } else {
        activeSquad = [leadChar, comrades[0]];
      }
    } else {
      // มีสหาย/ลูกเรือ 2 ตัวขึ้นไป (หมุนเวียนบทบาทให้ครบทุกคน)
      const crewIdxA = i % comrades.length;
      const crewIdxB = (i + 1) % comrades.length;
      const comradeA = comrades[crewIdxA];
      const comradeB = comrades[crewIdxB];

      if (actNumber === 1) {
        // องค์ที่ 1: กัปตันนำทัพ สลับแนะนำความสามารถของลูกเรือแต่ละคน
        if (i % 3 === 0) {
          activeSquad = [leadChar, comradeA];
        } else if (i % 3 === 1) {
          activeSquad = [comradeA, comradeB];
        } else {
          activeSquad = [leadChar, comradeB];
        }
      } else if (actNumber === 2) {
        // องค์ที่ 2: สมรภูมิเดือด สหายแต่ละคนแยกสายต่อสู้และจับคู่ประสานงาน
        if (i % 4 === 0) {
          activeSquad = [comradeA, comradeB];
        } else if (i % 4 === 1) {
          activeSquad = [comradeA, leadChar];
        } else if (i % 4 === 2) {
          activeSquad = [comradeA];
        } else {
          activeSquad = [comradeB, leadChar];
        }
      } else if (actNumber === 3) {
        // องค์ที่ 3: ไคลแม็กซ์ ประจันหน้าจอมมารใหญ่ และรวมพลังทั้งทีม
        if (progress > 0.68) {
          activeSquad = [leadChar, antagonist, comradeA];
        } else if (i % 3 === 0) {
          activeSquad = [comradeA, antagonist];
        } else if (i % 3 === 1) {
          activeSquad = [leadChar, comradeA];
        } else {
          activeSquad = [comradeA, comradeB];
        }
      } else {
        // องค์ที่ 4: ชัยชนะ รุ่งอรุณใหม่ สมาชิกทุกคนเฉลิมฉลอง
        if (i % 3 === 0) {
          activeSquad = [leadChar, comradeA];
        } else if (i % 3 === 1) {
          activeSquad = [comradeA, comradeB];
        } else {
          activeSquad = [leadChar, comradeA, comradeB];
        }
      }
    }

    const primaryChar = activeSquad[0] || leadChar;

    // ทิศทางกล้อง Seedream 5.0 Pro (Single Take เชื่อมโยงจากฉากก่อนหน้า)
    const cameraMovement =
      i === 0
        ? `มุมกล้อง Seedream 5.0 Pro: เปิดฉากด้วยเลนส์ Anamorphic 35mm f/2.0 แพนมุมกว้างเปิดเผยบรรยากาศ ดอลลี่อินเข้าหา ${primaryChar.name} อย่างต่อเนื่อง 10 วินาทีไร้รอยต่อ`
        : `มุมกล้อง Seedream 5.0 Pro: ช็อตต่อเนื่องแบบ Single Take (ไหลลื่นรับช็อตจากฉากที่ ${i}) เลนส์ Anamorphic 35mm f/2.0 ${cameraMotion} โฟกัสการเคลื่อนไหวของ ${primaryChar.name} ถ่ายทำต่อเนื่อง 10 วินาทีไม่ตัดข้าม`;

    // สร้างเนื้อเรื่อง บทพากย์ บทสนทนา และเสียง ตามแก่นเรื่องและช่วงองค์
    const sceneData = buildContinuousSceneContent({
      sceneNumber,
      totalScenes,
      actNumber,
      progress,
      cleanTitleStr,
      synopsis,
      leadChar,
      antagonist,
      activeSquad,
      comrades,
      isMangaBusSurvival: theme.isMangaBusSurvival,
      isSpecificKrasue: theme.isSpecificKrasue,
      isSpecificTakhian: theme.isSpecificTakhian,
      isHorrorOrGhost: theme.isHorrorOrGhost,
      isThaiMyth: theme.isThaiMyth,
      isWesternCinema: theme.isWesternCinema,
      isAnimeOrJapan: theme.isAnimeOrJapan,
      isPirateOrAdventure: theme.isPirateOrAdventure,
      isTowerOrDungeon: theme.isTowerOrDungeon,
      isCultivation: theme.isCultivation,
      isMilitary: theme.isMilitary,
      isSciFi: theme.isSciFi,
      transition,
      timeRangeStr,
    });

    // สร้าง Visual Prompts คมชัดสำหรับโมเดลภาพและวิดีโอ (Kling, Runway, Google Flow)
    const effectiveGenre = theme.effectiveGenre;

    const prompts = buildVisualPrompts({
      sceneTitle: sceneData.pureTitle,
      narration: sceneData.narration,
      dialogueText: sceneData.dialogues.map((d) => `${d.speaker}: ${d.text}`).join(' '),
      visualMedium,
      stylePreset,
      genre: effectiveGenre,
      cameraMovement,
      lighting: sceneData.lighting,
      charactersInScene: activeSquad,
      sceneNumber,
      aspectRatio,
      worldCulture,
    });

    scenes.push({
      id: `scene-${Date.now()}-${sceneNumber}`,
      sceneNumber,
      actNumber,
      title: sceneData.pureTitle, // ไม่มีคำนำหน้า 'ฉากที่ X:' ซ้ำซ้อน
      narration: sceneData.narration,
      dialogues: sceneData.dialogues,
      sfxBgm: sceneData.sfxBgm,
      characterIds: activeSquad.map((c) => c.id),
      visualMedium,
      stylePreset,
      cameraMovement,
      lighting: sceneData.lighting,
      imagePrompt: prompts.imagePrompt,
      videoMotionPrompt: prompts.videoMotionPrompt,
      googleFlowPrompt: prompts.googleFlowPrompt,
      googleFlowSeed: prompts.googleFlowSeed,
      negativePrompt: prompts.negativePrompt,
      aspectRatio,
      estimatedDurationSec: 10,
      createdAt: new Date().toISOString(),
    });
  }

  return scenes;
}

/**
 * ผู้ช่วยสร้างบทบรรยาย บทพูด แสงเงา และดนตรีของแต่ละฉากให้ไหลลื่นและสัมพันธ์กับพล็อตเรื่อง
 * รองรับ Ensemble Cast และ Procedural Cinematic Narrative Engine (ไม่ซ้ำบทพูดเดิมในแต่ละฉาก)
 */
function buildContinuousSceneContent(params: SceneBeatParams) {
  const result = generateProceduralSceneContent(params);
  return {
    ...result,
    activeSquad: params.activeSquad,
  };
}

/**
 * ฟังก์ชันดั้งเดิมสำหรับรองรับโค้ดเดิม (Backward compatibility)
 */
export function generateActTemplateScenes(options: GenerateScriptOptions): ScriptScene[] {
  return generateContinuousMovieScenes(options);
}
