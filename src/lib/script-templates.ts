import { MovieGenre, VisualMedium, StylePreset, ScriptScene, CharacterBible, AspectRatio } from './types';
import { buildVisualPrompts } from './ai-prompt-engine';

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

  // 2. จัดกลุ่มตัวละครทั้งหมดในโปรเจกต์ (Ensemble Cast Engine สไตล์วันพีช / ชาแนลดัง)
  const leadChar = characters.find((c) => c.role === 'protagonist') || characters[0] || {
    id: 'char-1',
    name: 'กัปตัน/ผู้นำ',
    role: 'protagonist' as const,
    appearanceAnchor: 'charismatic heroic captain, sharp determined eyes, iconic signature coat, 8k resolution',
    clothingStyle: 'captain adventurer attire',
    weaponsOrProps: 'หมัดอัคคี / ดาบประจำตระกูล',
    personality: 'มุ่งมั่น รักพวกพ้อง ไม่ยอมแพ้ต่อโชคชะตา',
    abilities: 'ทักษะต่อสู้ขั้นสูง ฮาคิราชันย์/ลมปราณเทพ',
    voiceStyle: 'กระตือรือร้น ทรงพลัง มุ่งมั่นเด็ดเดี่ยว',
  };

  const antagonist = characters.find((c) => c.role === 'antagonist') || {
    id: 'char-boss',
    name: 'จอมมารศัตรู',
    role: 'antagonist' as const,
    appearanceAnchor: 'sinister powerful overlord, dark aura, imposing posture, 8k resolution',
    clothingStyle: 'dark commander attire',
    weaponsOrProps: 'ดาบยักษ์ทมิฬ / เคียววิญญาณ',
    personality: 'ทะนงตน โหดเหี้ยม ทรงอำนาจ',
    abilities: 'พลังมืดทำลายล้าง หลุมดำมิติ',
    voiceStyle: 'เยือกเย็น ทรงอำนาจ ดุดัน',
  };

  // รวมตัวละครสหาย/ลูกเรือ/อาจารย์/หน่วยรบทั้งหมดที่มีในโปรเจกต์
  const comrades = characters.filter((c) => c.id !== leadChar.id && c.id !== antagonist.id);

  // 3. ตรวจจับแก่นเรื่องจากชื่อเรื่อง เรื่องย่อ และหมวดหมู่
  const contextText = `${title} ${synopsis} ${genre} ${subGenre} ${worldCulture}`.toLowerCase();
  
  const isPirateOrAdventure = /วันพีช|วันพีซ|โจรสลัด|ทะเล|เกาะ|เรือ|ลูฟี|ล่าสมบัติ|pirate|one piece|sailing|treasure|ocean/i.test(contextText);
  const isTowerOrDungeon = /หอคอย|ดันเจี้ยน|ชั้นที่|tower|dungeon|hunter|floor|gate|level|solo|คุปเวล่า/i.test(contextText);
  const isCultivation = /เซียน|กำลังภายใน|ลมปราณ|ตบะ|กระบี่|เสวียนหยวน|สำนัก|เต๋า|มหายาน|xianxia|cultivation/i.test(contextText);
  const isMilitary = /ทหาร|ยุทธการ|ขีปนาวุธ|หน่วยรบ|รบพิเศษ|ดาวเทียม|กองทัพ|สงคราม|military|tactical/i.test(contextText);
  const isSciFi = /ไซไฟ|หุ่นยนต์|ไซเบอร์|ยานอวกาศ|จักรวาล|ai|cyber|scifi/i.test(contextText);

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
      isPirateOrAdventure,
      isTowerOrDungeon,
      isCultivation,
      isMilitary,
      isSciFi,
      transition,
      timeRangeStr,
    });

    // สร้าง Visual Prompts คมชัดสำหรับโมเดลภาพและวิดีโอ (Kling, Runway, Google Flow)
    const prompts = buildVisualPrompts({
      sceneTitle: sceneData.pureTitle,
      narration: sceneData.narration,
      dialogueText: sceneData.dialogues.map((d) => `${d.speaker}: ${d.text}`).join(' '),
      visualMedium,
      stylePreset,
      genre,
      cameraMovement,
      lighting: sceneData.lighting,
      charactersInScene: activeSquad,
      sceneNumber,
      aspectRatio,
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
 * รองรับ Ensemble Cast: ตัวละครทุกคนจะมีบทพูดและบทบาทตามบุคลิกและอาวุธ
 */
function buildContinuousSceneContent(params: {
  sceneNumber: number;
  totalScenes: number;
  actNumber: 1 | 2 | 3 | 4;
  progress: number;
  cleanTitleStr: string;
  synopsis: string;
  leadChar: CharacterBible;
  antagonist: CharacterBible;
  activeSquad: CharacterBible[];
  comrades: CharacterBible[];
  isPirateOrAdventure: boolean;
  isTowerOrDungeon: boolean;
  isCultivation: boolean;
  isMilitary: boolean;
  isSciFi: boolean;
  transition: string;
  timeRangeStr: string;
}) {
  const {
    sceneNumber,
    actNumber,
    progress,
    cleanTitleStr,
    synopsis,
    leadChar,
    antagonist,
    activeSquad,
    isPirateOrAdventure,
    isTowerOrDungeon,
    isCultivation,
    isMilitary,
    isSciFi,
    transition,
  } = params;

  let pureTitle = '';
  let narration = '';
  let dialogues: Array<{ speaker: string; emotion: string; text: string }> = [];
  let sfxBgm = '';
  let lighting = '';

  const primaryChar = activeSquad[0] || leadChar;
  const secondaryChar = activeSquad[1] || (activeSquad[0] !== leadChar ? leadChar : antagonist);

  // สรุปข้อมูลย่อเพื่อให้เนื้อเรื่องอ้างอิงถึง
  const synopsisSnippet = synopsis ? synopsis.slice(0, 100).trim() : cleanTitleStr;

  if (isPirateOrAdventure) {
    // แนวมหากาพย์การผจญภัยโจรสลัด / ลูกเรือ / ล่าสมบัติ (สไตล์ ลูฟี่ วันพีช)
    if (actNumber === 1) {
      pureTitle = `การแล่นเรือเปิดฉาก & ${primaryChar.name} ตรวจสอบทิศทางมุ่งหน้าสู่เส้นขอบฟ้า`;
      narration = `${transition} บนเรือที่กำลังแล่นฝ่าคลื่นลมมหึมา ${primaryChar.name} ยืนประจำการอย่างมุ่งมั่น สายตามองไปยังเป้าหมายข้างหน้า ขณะที่ ${secondaryChar.name} เตรียมความพร้อมของอาวุธ ${secondaryChar.weaponsOrProps || 'ประจำกาย'} เพื่อรับมือกับคลื่นลมและศัตรูที่อาจจู่โจมได้ทุกเมื่อ!`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'กระตือรือร้น ท้าทายคลื่นลม', text: `พายุแค่นี้ทำอะไรพวกเราไม่ได้หรอก... กางใบเรือเต็มที่แล้วลุยไปข้างหน้า!` },
        { speaker: secondaryChar.name, emotion: 'ยิ้มมั่นใจ กระชับอาวุธ', text: `วางใจได้เลย! ตราบใดที่พวกเรายังอยู่พร้อมหน้า จะมีอุปสรรคไหนก็ขวางไม่อยู่!` },
      ];
      sfxBgm = `[BGM: ธีมเพลงผจญภัยโจรสลัดอันยิ่งใหญ่ เร้าใจด้วยเสียงเครื่องสายและกลองทิมปานี] [SFX: เสียงเกลียวคลื่นซัดกราบเรือ, เสียงใบเรือขึงตึงปะทะลม]`;
      lighting = 'แสงอาทิตย์สีทองสาดส่องกระทบผิวน้ำทะเลระยิบระยับ ตัดกับเงาเสากระโดงเรืออันสง่างาม';
    } else if (actNumber === 2) {
      pureTitle = `ทะลวงแนวป้องกันเกาะ & ${primaryChar.name} ประสานการโจมตีกับ ${secondaryChar.name}`;
      narration = `${transition} กองเรือและป้อมปราการข้าศึกระดมยิงปืนใหญ่ขวางทาง ${primaryChar.name} ปลดปล่อย ${primaryChar.abilities || 'วิชาการต่อสู้อันทรงพลัง'} ทะลวงแนวป้องกัน โดยมี ${secondaryChar.name} คอยซุ่มยิงและสกัดกั้นกำลังเสริมข้าศึกอย่างแม่นยำไร้ที่ติ!`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'ดุดัน ทะยานเข้าประชิด', text: `เปิดทางข้างหน้าให้ที... ฉันจะพุ่งเข้าไปพังแนวป้องกันของมันเอง!` },
        { speaker: secondaryChar.name, emotion: 'เฉียบคม ล็อกเป้าหมาย', text: `เคลียร์เส้นทางเรียบร้อยแล้ว... รับการโจมตีประสานของพวกเราไปซะ!` },
      ];
      sfxBgm = `[BGM: ดนตรีแอ็กชันแบทเทิลจังหวะเร็ว กลองศึกรัวกระหน่ำ] [SFX: เสียงปืนใหญ่ระเบิดดังกึกก้อง, เสียงคมดาบแหวกอากาศฟันกระสุนปืนใหญ่ขาดครึ่ง]`;
      lighting = 'ประกายไฟจากการระเบิดและแสงคมดาบส่องสว่างวาบสะท้อนบนใบหน้าของทั้งสอง';
    } else if (actNumber === 3) {
      pureTitle = `มหาศึกแตกหัก & รวมพลังลูกเรือปะทะ ${antagonist.name}`;
      narration = `${transition} ท้องฟ้าเหนือสมรภูมิปั่นป่วนด้วยแรงกดดันมหาศาล ${antagonist.name} ปลดปล่อยพลังทำลายล้างที่สั่นสะเทือนทั้งเกาะ แต่ ${leadChar.name} พร้อมด้วย ${primaryChar.name} ยืนหยัดร่วมใจ การผสานท่าไม้ตายของทุกคนระเบิดขึ้นเพื่อปกป้องมิตรภาพและความฝัน!`;
      dialogues = [
        { speaker: antagonist.name, emotion: 'เย้ยหยัน คำรามก้องสมรภูมิ', text: `คิดว่าพวกเศษสวะอย่างพวกเจ้าจะหยุดยั้งข้าได้งั้นรึ?!` },
        { speaker: primaryChar.name, emotion: 'ตะโกนก้อง ไม่ยอมถอย', text: `พวกเราเชื่อมั่นในกัปตันและเพื่อนทุกคน... พลังของมิตรภาพไม่มีวันพ่ายแพ้!` },
        { speaker: leadChar.name, emotion: 'คำรามสุดเสียง ปลดปล่อยพลังเต็มร้อย', text: `นี่คือหมัดเผด็จศึกของพวกเราทุกคน... ลุยเลย!!` },
      ];
      sfxBgm = `[BGM: มหากาพย์ไคลแม็กซ์ออร์เคสตรา ซิมโฟนีพลังฮีโร่กระหึ่มสะท้านฟ้า] [SFX: เสียงคลื่นกระแทกโซนิคบูมระเบิดเปรี้ยง, แผ่นดินและคลื่นทะเลยกตัวสูง]`;
      lighting = 'ลำแสงออร่าสีทองบริสุทธิ์ปะทะกับเปลวเพลิงสีดำทมิฬ คอนทราสต์แสงเงาจัดจ้านระดับภาพยนตร์';
    } else {
      pureTitle = `รุ่งอรุณแห่งชัยชนะ & การก้าวสู่ผืนทะเลมิติใหม่`;
      narration = `${transition} เมื่อควันระเบิดจางหาย ธงประจำกลุ่มยังคงโบกสะบัดอย่างสง่างาม ${primaryChar.name} และ ${secondaryChar.name} ยิ้มให้กันท่ามกลางเสียงหัวเราะของทุกคน ชัยชนะครั้งนี้ยิ่งใหญ่ แต่การผจญภัยสู่จุดหมายปลายทางยังคงรอคอยพวกเขาอยู่เบื้องหน้า!`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'ยิ้มกว้าง แววตาเปี่ยมสุข', text: `พวกเราทำสำเร็จแล้ว! ทะเลผืนนี้เป็นของพวกเราแล้วล่ะ!` },
        { speaker: secondaryChar.name, emotion: 'หัวเราะร่า สูดลมหายใจลึก', text: `รีบเก็บสมบัติแล้วกางใบเรือกันเถอะ... สู่การผจญภัยครั้งใหม่!` },
      ];
      sfxBgm = `[BGM: ท่วงทำนองชัยชนะอบอุ่นเปี่ยมความหวังและอิสรภาพ] [SFX: เสียงคลื่นกระทบฝั่งแผ่วเบา, นกนางนวลบินร้องก้องเวหา]`;
      lighting = 'แสงอรุณสีส้มทองสาดส่องลงมายังผิวน้ำ ส่องประกายเลนส์แฟลร์สวยงามจับตา';
    }
  } else if (isTowerOrDungeon) {
    // แนวยอดนิยม: หอคอย / ดันเจี้ยน / ฮันเตอร์ / คุปเวล่า (เช่น ผู้หวนคืนจากชั้นที่ 100)
    const currentFloor = Math.min(100, Math.max(1, Math.round(progress * 100)));

    if (actNumber === 1) {
      pureTitle = `หวนคืนสู่หอคอยชั้นที่ ${currentFloor} & ${primaryChar.name} ระบุพิกัดมิติ`;
      narration = `${transition} ม่านหมอกทมิฬแห่งหอคอยมรณะเริ่มขยับไหว ${primaryChar.name} ยืนตระหง่านอยู่หน้าประตูมิติโบราณ สายตามุ่งมั่นสแกนคลื่นพลังงานรอบทิศ ขณะที่ ${secondaryChar.name} เตรียมพร้อม ${secondaryChar.weaponsOrProps || 'ไอเทมประจำตัว'} เพื่อรองรับการเปิดฉากตะลุยด่าน!`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'มุ่งมั่น แววตาเยือกเย็น', text: `ครั้งนี้... จะไม่มีใครมาขวางการพิชิตชั้นที่ 100 ของพวกเราได้อีก!` },
        { speaker: secondaryChar.name, emotion: 'รอบคอบ ตรวจสอบวงเวท', text: `พิกัดเปิดแล้ว สัญญาณมานาคงที่... ทีมพร้อมลุยเต็มอัตราศึก!` },
      ];
      sfxBgm = `[BGM: ดนตรีซินธ์ดาร์กผสมออร์เคสตราบิลด์ความลึกลับ] [SFX: เสียงประตูหินยักษ์เลื่อนเปิดกึกก้อง, เสียงฮัมของวงเวทมนตร์โบราณ]`;
      lighting = 'แสงสีม่วงนีออนจากวงเวทตัดกับเงามืดทมิฬของโถงทางเดินหินในหอคอย';
    } else if (actNumber === 2) {
      pureTitle = `ทะลวงแนวป้องกันชั้นที่ ${currentFloor} & ${primaryChar.name} ปะทะฝูงอสูร`;
      narration = `${transition} เสียงคำรามของอสูรประจำชั้นดังก้องทั่วทางเดินหิน ${primaryChar.name} ปลดปล่อย ${primaryChar.abilities || 'ทักษะความเร็วสูง'} ฟาดฟันทะลวงแนวหน้าอย่างเฉียบขาด โดยมี ${secondaryChar.name} ร่ายสกิลสนับสนุนและคุ้มกันจุดบอดอย่างแม่นยำ!`;
      dialogues = [
        { speaker: secondaryChar.name, emotion: 'เตือนภัยอย่างเร่งด่วน', text: `ฝูงมอนสเตอร์ระลอกใหม่กำลังกรูเข้ามา! ระวังทางปีกซ้าย!` },
        { speaker: primaryChar.name, emotion: 'สุขุม ฟาดฟันไม่ชะงัก', text: `แค่นี้ยังไม่พอจะหยุดยั้งพวกเรา... เดินหน้าต่อเนื่อง อย่าเสียจังหวะ!` },
      ];
      sfxBgm = `[BGM: ดนตรีต่อสู้จังหวะเร็ว กลองไฮบริดกระแทกกระทั้นเร้าอารมณ์] [SFX: เสียงฟันดาบความเร็วสูงฉับไว, เสียงกรงเล็บอสูรฟาดกระทบเกราะหิน]`;
      lighting = 'ประกายไฟจากการปะทะอาวุธส่องสว่างวาบตัดกับเปลวเพลิงสีฟ้าของเสาคบเพลิง';
    } else if (actNumber === 3) {
      pureTitle = `ประจันหน้าผู้พิทักษ์ชั้นสูงสุด & ${primaryChar.name} ปะทะ ${antagonist.name}`;
      narration = `${transition} เบื้องหน้าบัลลังก์ชั้นที่ 100 ${antagonist.name} ปรากฏกายขึ้นพร้อมออร่าพลังทำลายล้างที่สั่นสะเทือนมิติ ${primaryChar.name} และ ${leadChar.name} ปลดปล่อยแก่นแท้แห่งทักษะที่เก็บงำไว้ คลื่นพลังสะท้อนกลับจนโครงสร้างหอคอยแตกร้าวเป็นเสี่ยง!`;
      dialogues = [
        { speaker: antagonist.name, emotion: 'เย้ยหยัน คำรามก้องบัลลังก์', text: `คิดว่าการปีนขึ้นมาถึงชั้นที่ 100 จะเปลี่ยนชะตากรรมของพวกเจ้าได้งั้นรึ?` },
        { speaker: primaryChar.name, emotion: 'ดุดัน ปลดปล่อยพลังขีดสุด', text: `ที่นี่ไม่ใช่จุดจบของพวกเรา... แต่มันคือสุสานของเจ้าต่างหาก!` },
      ];
      sfxBgm = `[BGM: มหากาพย์ไคลแม็กซ์ออร์เคสตรา ซับเบส 808 สั่นสะเทือนสะท้านอก] [SFX: คลื่นกระแทกโซนิคบูมระเบิดเปรี้ยง, เสียงกำแพงหินทลายลงมา]`;
      lighting = 'ลำแสงสีทองบริสุทธิ์ปะทะกับเปลวเพลิงสีแดงเลือด คอนทราสต์สูงสุดสะกดสายตา';
    } else {
      pureTitle = `การพิชิตชั้นที่ 100 เด็ดขาด & ${primaryChar.name} พบเบาะแสมิติใหม่`;
      narration = `${transition} การระเบิดครั้งสุดท้ายกลืนกินทุกสิ่ง เมื่อกลุ่มควันจางหาย บอสผู้ยิ่งใหญ่พังทลายลงกลายเป็นละอองแสง ชัยชนะเหนือหอคอยชั้นที่ 100 ตกเป็นของทีม แต่ที่ปลายทาง ประตูสู่มิติใหม่ที่เหนือกว่ากลับกำลังค่อยๆ ปรากฏขึ้น...`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'แววตามุ่งมั่น เก็บอาวุธเข้าที่', text: `นี่ไม่ใช่จุดสิ้นสุด... แต่คือการเริ่มต้นของบททดสอบที่แท้จริง!` },
        { speaker: secondaryChar.name, emotion: 'ยิ้มอย่างโล่งอก', text: `พวกเราทำได้จริงๆ... กิลด์ของพวกเราคือผู้พิชิตชั้นที่ 100 แล้ว!` },
      ];
      sfxBgm = `[BGM: ท่วงทำนองชัยชนะอันยิ่งใหญ่และสง่างาม ผสานคอรัสประสานเสียง] [SFX: เสียงละอองพลังงานสลายตัวระยิบระยับ, เสียงลมพัดผ่านซากปรักหักพัง]`;
      lighting = 'แสงสว่างสีทองจากประตูมิติเบื้องบนสาดส่องลงมายังร่างของตัวละครอย่างงดงาม';
    }
  } else if (isCultivation) {
    // แนวกำลังภายใน / เซียน / บำเพ็ญเพียร (สไตล์ เพื่อนที่ดีที่สุด SAN1)
    if (actNumber === 1) {
      pureTitle = `การตื่นรู้ของลมปราณเซียน & ${primaryChar.name} โคจรพลังฟ้าดิน`;
      narration = `${transition} ในดินแดนที่ผู้แข็งแกร่งคือกฎเกณฑ์ ${primaryChar.name} รวบรวมสมาธิบนยอดผาหมอกสวรรค์ แก่นลมปราณที่เคยหลับใหลเริ่มส่องประกายอักขระสีทอง โดยมี ${secondaryChar.name} คอยคุ้มครองด่านเคราะห์อย่างใกล้ชิด!`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'มุ่งมั่น กัดฟันแน่วแน่', text: `ฟ้าดินนี้จะไม่มีวันกักขังข้าได้อีก... วันนี้พวกเราจะก้าวข้ามโชคชะตา!` },
        { speaker: secondaryChar.name, emotion: 'สุขุม คอยเฝ้าระวัง', text: `รวมจิตสู่จุดตันเถียน... ข้าจะคอยคุ้มกันลมปราณของเจ้าเอง!` },
      ];
      sfxBgm = `[BGM: เมโลดี้กู่เจิ้งลึกลับผสานเสียงกลองศึกจีนโบราณ] [SFX: เสียงลมปราณหมุนวนรอบกาย, เสียงลมหวีดหวิวบนยอดผา]`;
      lighting = 'แสงจันทร์ส่องทะลุผ่านม่านหมอกสีเงิน สาดประกายออร่าลมปราณสีครามเรืองรอง';
    } else if (actNumber === 2) {
      pureTitle = `ฝ่าค่ายกลสำนักมาร & ${primaryChar.name} ร่ายเพลงกระบี่สะบั้นพสุธา`;
      narration = `${transition} คมกระบี่ของ ${primaryChar.name} พุ่งแหวกม่านอากาศดั่งมังกรผงาด ทะลวงผ่านค่ายกลเก้าสุริยันอย่างแม่นยำ ขณะที่ ${secondaryChar.name} ใช้ ${secondaryChar.abilities || 'วิชาประจำตัว'} สกัดกั้นยอดฝีมือฝ่ายมารไม่ให้ลอบโจมตี!`;
      dialogues = [
        { speaker: secondaryChar.name, emotion: 'ชื่นชมอย่างตื่นตะลึง', text: `เจตจำนงกระบี่ของเจ้า... ก้าวข้ามระดับขอบเขตเดิมไปแล้ว!` },
        { speaker: primaryChar.name, emotion: 'เยือกเย็น สุขุม', text: `กระบี่ไร้เงา ผ่าค่ายกลมาร... ลุยเข้าไปพร้อมกัน!` },
      ];
      sfxBgm = `[BGM: จังหวะกระบี่เร็วเร้าใจ เครื่องสายจีนผสานกลองศึกหนักแน่น] [SFX: เสียงกระบี่ฟันแหวกอากาศ 'ชิ้ง', เสียงอักขระเวทมนตร์แตกสลาย]`;
      lighting = 'แสงประกายกระบี่สีฟ้าครามตัดกับไอหมอกพิษสีเขียวมรกตอย่างดุเดือด';
    } else if (actNumber === 3) {
      pureTitle = `มหาศึกแตกหัก & ผสานเก้ากระบี่สะบั้นสวรรค์ปะทะ ${antagonist.name}`;
      narration = `${transition} ฟากฟ้าคำรามลั่น ${antagonist.name} ปลดปล่อยเปลวเพลิงทมิฬกลืนกินผืนป่า แต่ ${primaryChar.name} พร้อมด้วย ${leadChar.name} ยืนหยัดใจกลางพายุ รวบรวมพลังกระบี่ทั้งหมดหลอมรวมเป็นหนึ่งเพื่อฟาดฟันศัตรูคู่อาฆาต!`;
      dialogues = [
        { speaker: antagonist.name, emotion: 'ตื่นตระหนก หน้าถอดสี', text: `แรงกดดันระดับมหาเทพนี้... พวกเจ้าบรรลุสู่ขั้นเซียนตั้งแต่เมื่อไหร่?!` },
        { speaker: primaryChar.name, emotion: 'คำรามกึกก้องสะท้านฟ้า', text: `หนี้แค้นในวันวาน... จงชดใช้ด้วยชีวิตของเจ้า!` },
      ];
      sfxBgm = `[BGM: ดนตรีไคลแม็กซ์ออร์เคสตราจีนเต็มวง เสียงร้องประสานเสียงกังวาน] [SFX: เสียงระเบิดพลังมังกรฟ้าปะทะเพลิงทมิฬ, แผ่นดินสั่นสะเทือน]`;
      lighting = 'ลำแสงสีขาวทองบริสุทธิ์ส่องทะลุความมืดมิด สว่างจ้าดั่งดวงอาทิตย์ดวงใหม่';
    } else {
      pureTitle = `ปิดฉากศึกยุทธภพ & ${primaryChar.name} ก้าวสู่แดนเซียนเบื้องบน`;
      narration = `${transition} เมื่อคลื่นพลังสงบลง เศษซากแห่งความมืดก็มลายสิ้น ชัยชนะของ ${primaryChar.name} และเหล่าสหายถูกจารึกลงในหน้าประวัติศาสตร์ แต่เสียงเรียกจากแดนเซียนเบื้องบนคือสัญญาณว่า การเดินทางที่แท้จริงเพิ่งจะเริ่มต้นขึ้นเท่านั้น!`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'สุขุม แววตาเปี่ยมหวัง', text: `แดนเซียนเบื้องบน... พวกเราจะฟาดฟันขึ้นไปให้ถึง!` },
        { speaker: secondaryChar.name, emotion: 'ยิ้มพร้อมเก็บกระบี่', text: `ไม่ว่าจะกี่ชั้นฟ้า ข้าก็จะร่วมเดินทางไปกับเจ้าเสมอ!` },
      ];
      sfxBgm = `[BGM: ทำนองดนตรีซาบซึ้งและยิ่งใหญ่ สื่อถึงชัยชนะและการออกเดินทางต่อ] [SFX: เสียงลมพัดชายเสื้อคลุมพริ้วไหว, เสียงกระดิ่งสวรรค์กังวานใส]`;
      lighting = 'ลำแสงสวรรค์สีทองสาดส่องลงมาจากหมู่เมฆอย่างสง่างาม';
    }
  } else if (isMilitary) {
    // แนวทหาร & ยุทธการสงคราม
    if (actNumber === 1) {
      pureTitle = `ตรวจจับสัญญาณภัยคุกคาม & ${primaryChar.name} ระดมพลสายฟ้าแลบ`;
      narration = `${transition} พิกัดดาวเทียมตรวจจับการเคลื่อนไหวของขีปนาวุธข้าศึก ${primaryChar.name} นำหน่วยรบพิเศษเข้าสู่สถานะพร้อมรบระดับสูงสุด โดยมี ${secondaryChar.name} ควบคุมระบบเรดาร์และชี้เป้าทางยุทธวิธี!`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'สั่งการเด็ดขาดผ่านวิทยุ', text: `ทุกหน่วยเข้าประจำตำแหน่ง ล็อกเป้าหมาย... ภารกิจนี้ห้ามพลาดแม้แต่วินาทีเดียว!` },
        { speaker: secondaryChar.name, emotion: 'รายงานความเร็วสูง', text: `พิกัดล็อกแล้ว ช่องสื่อสารปลอดภัย พร้อมเปิดฉากยิง!` },
      ];
      sfxBgm = `[BGM: ซาวด์แทร็กทหารตื่นเต้นเร้าใจ เบสหนักกระแทกกระทั้น] [SFX: เสียงไซเรนเตือนภัย, เสียงบรรจุกระสุนและระบบไฮดรอลิกส์]`;
      lighting = 'แสงไฟฉุกเฉินสีแดงในห้องยุทธวิธี ตัดกับแสงหน้าจอเรดาร์แสดงพิกัดดาวเทียม';
    } else if (actNumber === 2) {
      pureTitle = `ยิงขีปนาวุธไฮเปอร์โซนิก & ${primaryChar.name} ทะลวงแนวรบ`;
      narration = `${transition} ไซโลยิงขีปนาวุธเปิดออก เปลวเพลิงสีส้มมหึมาพุ่งทะยานฉีกชั้นบรรยากาศ ${primaryChar.name} และ ${secondaryChar.name} นำหน่วยยานเกราะรุกคืบเข้าทำลายแนวป้องกันข้าศึกอย่างแม่นยำ!`;
      dialogues = [
        { speaker: secondaryChar.name, emotion: 'รายงานความเร็วสูง', text: `ขีปนาวุธความเร็ว 8 มัคเข้าสู่เป้าหมายแล้ว... ทลายแนวป้องกันสำเร็จ!` },
        { speaker: primaryChar.name, emotion: 'รุกคืบเด็ดขาด', text: `บุกต่อเนื่อง! อย่ายอมให้ข้าศึกตั้งแนวรับใหม่ได้!` },
      ];
      sfxBgm = `[BGM: กลองศึกและเครื่องเป่าทรงพลังสไตล์ภาพยนตร์สงคราม] [SFX: เสียงขีปนาวุธพุ่งแหวกอากาศ Sonic Boom, เสียงปืนกลหนักยิงรัว]`;
      lighting = 'เปลวเพลิงจากท้ายขีปนาวุธส่องสว่างเจิดจ้าตัดกับท้องฟ้ายามพลบค่ำ';
    } else if (actNumber === 3) {
      pureTitle = `แทรกซึมระยะประชิด & ${primaryChar.name} ปะทะเดือดกับ ${antagonist.name}`;
      narration = `${transition} ท่ามกลางม่านควันปืน ${primaryChar.name} นำทีมบุกทะลวงเข้าสู่ศูนย์บัญชาการของ ${antagonist.name} การปะทะด้วยอาวุธหนักเกิดขึ้นอย่างดุเดือดและไม่ปรานี!`;
      dialogues = [
        { speaker: antagonist.name, emotion: 'ตื่นตระหนก ตะโกนสั่งการ', text: `ตั้งแนวป้องกัน! อย่ายอมให้พวกมันเข้าถึงระบบควบคุม!` },
        { speaker: primaryChar.name, emotion: 'ดุดัน ยิงสวนกลับทันที', text: `สายเกินไปแล้ว... ฐานทัพนี้ถูกยึดครองทั้งหมดแล้ว!` },
      ];
      sfxBgm = `[BGM: ดนตรีแอ็กชันอิเล็กทรอนิกส์ระทึกขวัญขั้นสูงสุด] [SFX: ปลอกกระสุนตกกระทบพื้นคอนกรีต, เสียงสะเก็ดระเบิดทำลายล้าง]`;
      lighting = 'แสงเลเซอร์ชี้เป้าสีเขียวและสีแดงตัดผ่านม่านควันปืนหนาทึบ บรรยากาศดิบเท่สมจริง';
    } else {
      pureTitle = `ชัยชนะเชิงยุทธวิธี & ${primaryChar.name} นำทีมถอนกำลังอย่างปลอดภัย`;
      narration = `${transition} การระเบิดครั้งสุดท้ายปิดฉากสมรภูมิ ควันไฟที่ลอยขึ้นสู่ท้องฟ้าคือหลักฐานแห่งชัยชนะเชิงยุทธวิธีที่เด็ดขาด กองกำลังศัตรูถูกกวาดล้างอย่างสมบูรณ์แบบ!`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'รายงานผลสำเร็จผ่านวิทยุ', text: `ศูนย์บัญชาการ... ภารกิจสำเร็จลุล่วง ฐานศัตรูถูกทำลายทั้งหมด พร้อมถอนกำลัง!` },
        { speaker: secondaryChar.name, emotion: 'ยิ้มด้วยความภาคภูมิใจ', text: `ทุกนายปลอดภัย ปฏิบัติการสมบูรณ์แบบร้อยเปอร์เซ็นต์!` },
      ];
      sfxBgm = `[BGM: ดนตรีสรุปบทเรียนสงคราม ซาบซึ้งและยิ่งใหญ่สะกดอารมณ์] [SFX: เสียงฮัมของใบพัดเฮลิคอปเตอร์กู้ภัย, เสียงลมพัดผ่านสมรภูมิ]`;
      lighting = 'แสงอาทิตย์ยามเช้าสาดส่องผ่านม่านควันที่ค่อยๆ จางหาย สะท้อนประกายชุดเกราะยุทธวิธี';
    }
  } else if (isSciFi) {
    // แนวไซไฟ / หุ่นยนต์ / ไซเบอร์พังก์
    if (actNumber === 1) {
      pureTitle = `ตรวจพบความผิดปกติของควอนตัม & ${primaryChar.name} เจาะเข้าระบบเมนเฟรม`;
      narration = `${transition} ในมหานครที่ถูกควบคุมด้วยอัลกอริทึม ${primaryChar.name} ตรวจพบความผันผวนของแกนพลังงาน โดยมี ${secondaryChar.name} คอยถอดรหัสไฟร์วอลล์และสแกนพิกัดหลบหนี!`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'สุขุม พิมพ์คำสั่งปลดล็อก', text: `ระบบกำลังถูกแทรกแซง... เราต้องชัตดาวน์แกนกลางก่อนที่มันจะระเบิด!` },
        { speaker: secondaryChar.name, emotion: 'จับตาดูกราฟพลังงาน', text: `รหัสผ่านด่านแรกทะลุแล้ว เร่งมือเข้า ข้าศึกกำลังส่งโดรนมา!` },
      ];
      sfxBgm = `[BGM: ซาวด์ไซไฟล้ำยุค ผสานเบสสังเคราะห์ความถี่ต่ำ] [SFX: เสียงพิมพ์คีย์บอร์ดความเร็วสูง, เสียงบี๊บของอินเทอร์เฟซโฮโลแกรม]`;
      lighting = 'แสงนีออนสีฟ้าไซเบอร์และสีชมพูส่องกระทบใบหน้าท่ามกลางความมืด';
    } else if (actNumber === 2) {
      pureTitle = `ไล่ล่าด้วยยานความเร็วสูง & ${primaryChar.name} ยิงสกัดโดรนสังหาร`;
      narration = `${transition} ยานลอยตัวความเร็วเหนือเสียงพุ่งทะยานลัดเลาะผ่านตึกระฟ้า ${primaryChar.name} เล็งปืนอนุภาคสอยโดรนข้าศึกร่วงทีละลำ ขณะที่ ${secondaryChar.name} ดริฟต์ยานหลบหลีกมิสไซล์อย่างหวุดหวิด!`;
      dialogues = [
        { speaker: secondaryChar.name, emotion: 'บังคับยานอย่างตื่นเต้น', text: `โดรนศัตรูล็อกเป้าเราแล้ว! เตรียมตัวรับแรงกระแทก!` },
        { speaker: primaryChar.name, emotion: 'เล็งปืนพลาสมาอย่างแม่นยำ', text: `ปล่อยให้เป็นหน้าที่ของฉัน... ยิงสกัดทันที!` },
      ];
      sfxBgm = `[BGM: ดนตรีอิเล็กทรอนิกส์ซินธ์เวฟจังหวะเร็วเร้าใจ] [SFX: เสียงเครื่องยนต์ต่อต้านแรงโน้มถ่วงหวีดร้อง, ลำแสงพลาสมายิงระรัว]`;
      lighting = 'ลำแสงเลเซอร์สีส้มและสีฟ้าพุ่งตัดกันบนท้องฟ้ายามค่ำคืน';
    } else if (actNumber === 3) {
      pureTitle = `เจาะทะลวงแกนประมวลผล & ${primaryChar.name} ปะทะจักรกล ${antagonist.name}`;
      narration = `${transition} ณ ใจกลางเมนเฟรม ${antagonist.name} ปรากฏตัวในร่างไซบอร์กเกราะหนัก ${primaryChar.name} และ ${leadChar.name} ร่วมมือกันแลกเปลี่ยนหมัดพลังงานกลและลำแสงอนุภาคทำลายล้างห้องเซิร์ฟเวอร์จนพังทลาย!`;
      dialogues = [
        { speaker: antagonist.name, emotion: 'เสียงหุ่นยนต์สังเคราะห์เยือกเย็น', text: `สิ่งมีชีวิตชีวภาพอย่างพวกเจ้า... สมควรถูกกำจัดออกจากระบบ!` },
        { speaker: primaryChar.name, emotion: 'ดุดัน เสียบไวรัสโอเวอร์โหลด', text: `ตราบใดที่มีหัวใจและพวกพ้อง... ข้าจะไม่ยอมให้เครื่องจักรอย่างแกมาบงการ!` },
      ];
      sfxBgm = `[BGM: ดนตรีไคลแม็กซ์อินดัสเทรียลเมทัลผสานออร์เคสตรา] [SFX: เสียงประกายไฟช็อตเปรี๊ยะ, เสียงโลหะปะทะโลหะก้องกังวาน]`;
      lighting = 'แสงประกายไฟฟ้ารั่วไหลสีฟ้าสลับกับแสงไฟฉุกเฉินกะพริบ';
    } else {
      pureTitle = `รีบูตระบบสู่อิสรภาพ & ${primaryChar.name} สบตากับวันใหม่`;
      narration = `${transition} ระบบแกนกลางถูกรีเซ็ตสำเร็จ ม่านพลังงานที่กักขังเมืองดับลงทีละส่วน ${primaryChar.name} และ ${secondaryChar.name} ยืนมองแสงแรกของวันใหม่ที่สาดส่องลงสู่มหานครที่ได้รับอิสรภาพกลับคืนมา`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'รำพึงด้วยความโล่งใจ', text: `ระบบล่มสลายแล้ว... วันนี้คือวันแรกของโลกใหม่ที่พวกเราเลือกเอง` },
        { speaker: secondaryChar.name, emotion: 'ยิ้มอย่างมีความหวัง', text: `อิสรภาพกลับคืนมาแล้ว... ไปดูเมืองใหม่กันเถอะ` },
      ];
      sfxBgm = `[BGM: ท่วงทำนองเปียโนและซินธ์อบอุ่นเปี่ยมความหวัง] [SFX: เสียงระบบค่อยๆ ชัตดาวน์, เสียงสายลมพัดผ่านยอดตึก]`;
      lighting = 'แสงอาทิตย์สีทองยามเช้าสาดส่องผ่านเงาตึกระฟ้า เผยให้เห็นท้องฟ้าโปร่งใส';
    }
  } else {
    // แนวทั่วไป / แฟนตาซีมหากาพย์ / แอ็กชัน
    if (actNumber === 1) {
      pureTitle = `การเปิดม่านแห่งโชคชะตา & ${primaryChar.name} นำทีมออกเดินทาง`;
      narration = `${transition} ในดินแดนที่เรื่องราวของ ${synopsisSnippet} เริ่มต้นขึ้น ${primaryChar.name} พร้อมด้วย ${secondaryChar.name} ต้องเผชิญหน้ากับทางเลือกที่จะเปลี่ยนชีวิตไปตลอดกาล บรรยากาศแห่งความไม่แน่นอนปกคลุมไปทั่วทุกหนแห่ง!`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'สุขุม มุ่งมั่น', text: `ถ้าเราไม่เริ่มต้นก้าวออกไปตอนนี้ ทุกอย่างจะสายเกินแก้!` },
        { speaker: secondaryChar.name, emotion: 'จริงใจ ร่วมใจ', text: `ไม่ว่าทางข้างหน้าจะอันตรายแค่ไหน... ข้าจะร่วมสู้เคียงข้างเจ้าเสมอ!` },
      ];
      sfxBgm = `[BGM: ซาวด์แทร็กภาพยนตร์ลึกลับชวนติดตาม] [SFX: เสียงสายลมพัดกระโชก, เสียงฝีเท้าหนักแน่น]`;
      lighting = 'แสงแดดยามเย็นทอดยาวเป็นเงาลึก บรรยากาศเข้มขลังสมจริง';
    } else if (actNumber === 2) {
      pureTitle = `ฝ่าฟันอุปสรรค & ${primaryChar.name} ประสานพลังกับ ${secondaryChar.name}`;
      narration = `${transition} ทุกย่างก้าวเต็มไปด้วยอันตรายที่มองไม่เห็น ${primaryChar.name} นำทีมผ่านพ้นกับดักและศัตรูที่คอยซุ่มโจมตี ความเฉียบคมและความไว้วางใจซึ่งกันและกันคืออาวุธที่สำคัญที่สุด!`;
      dialogues = [
        { speaker: secondaryChar.name, emotion: 'จริงจัง เตือนสติ', text: `ข้างหน้ามีกับดัก! ระวังตัวด้วย!` },
        { speaker: primaryChar.name, emotion: 'สุขุม เด็ดขาด', text: `ตามฉันมา... อย่าคลาดสายตา!` },
      ];
      sfxBgm = `[BGM: ดนตรีแอ็กชันผจญภัย จังหวะเร่งเร้า] [SFX: เสียงอาวุธปะทะกัน, เสียงก้อนหินถล่ม]`;
      lighting = 'แสงคบเพลิงส่องกระทบใบหน้า ตัดกับเงามืดลึกในถ้ำหรือป่าทึบ';
    } else if (actNumber === 3) {
      pureTitle = `การปะทะตัดสินชะตากรรม & รวมพลังสยบ ${antagonist.name}`;
      narration = `${transition} การเผชิญหน้าครั้งสำคัญระหว่าง ${primaryChar.name} และ ${antagonist.name} ระเบิดขึ้นอย่างไม่อาจหลีกเลี่ยง การต่อสู้นี้จะเป็นตัวตัดสินชะตากรรมของทุกคน!`;
      dialogues = [
        { speaker: antagonist.name, emotion: 'เย้ยหยัน มั่นใจ', text: `เจ้าไม่มีทางเอาชนะข้าได้!` },
        { speaker: primaryChar.name, emotion: 'ตะโกนก้อง สวนกลับ', text: `นี่คือคำตอบของพวกเราทุกคน... ลุยกันให้แหลก!` },
      ];
      sfxBgm = `[BGM: ดนตรีไคลแม็กซ์มหากาพย์เต็มวง เร้าอารมณ์ถึงขีดสุด] [SFX: เสียงระเบิดครั้งใหญ่, เสียงคลื่นพลังปะทะกัน]`;
      lighting = 'แสงวาบจากการระเบิดสาดส่องใบหน้า คอนทราสต์แสงเงาจัดจ้าน';
    } else {
      pureTitle = `ชัยชนะแห่งมหากาพย์ & ${primaryChar.name} ยืนหยัดสู่บทสรุปตราตรึง`;
      narration = `${transition} หลังผ่านพ้นการต่อสู้อันยาวนาน ชัยชนะที่ได้มาด้วยความเสียสละได้นำพาความสงบสุขกลับคืนมา ${primaryChar.name} และเหล่าสหายยืนหยัดอย่างสง่างาม พร้อมที่จะก้าวเดินต่อไปในเส้นทางข้างหน้า`;
      dialogues = [
        { speaker: primaryChar.name, emotion: 'แววตาเปี่ยมหวังและเกียรติยศ', text: `การต่อสู้ครั้งนี้จบลงแล้ว... แต่มิตรภาพและเกียรติยศของพวกเราจะคงอยู่ตลอดไป` },
        { speaker: secondaryChar.name, emotion: 'ยิ้มอย่างอบอุ่น', text: `ขอบคุณที่สู้ร่วมกันมาตลอด... เส้นทางข้างหน้ายังคงสดใส!` },
      ];
      sfxBgm = `[BGM: ดนตรีธีมชัยชนะอันสง่างามและซาบซึ้ง] [SFX: เสียงสายลมอ่อนโยน, เสียงโห่ร้องยินดีจากระยะไกล]`;
      lighting = 'แสงอาทิตย์ส่องย้อนจากด้านหลัง สาดเป็นเลนส์แฟลร์สวยงามแบบภาพยนตร์';
    }
  }

  return {
    pureTitle,
    narration,
    dialogues,
    sfxBgm,
    lighting,
    activeSquad,
  };
}

/**
 * ฟังก์ชันดั้งเดิมสำหรับรองรับโค้ดเดิม (Backward compatibility)
 */
export function generateActTemplateScenes(options: GenerateScriptOptions): ScriptScene[] {
  return generateContinuousMovieScenes(options);
}
