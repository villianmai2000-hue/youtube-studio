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

  // 2. ดึงตัวละครหลัก
  const leadChar = characters.find((c) => c.role === 'protagonist') || {
    id: 'char-1',
    name: 'ตัวเอก',
    role: 'protagonist' as const,
    appearanceAnchor: 'handsome young hero, confident gaze, signature attire',
    clothingStyle: 'adventurer warrior attire',
    voiceStyle: 'ทุ้ม นิ่ง น่าเกรงขาม มุ่งมั่น',
  };

  const antagonist = characters.find((c) => c.role === 'antagonist') || {
    id: 'char-2',
    name: 'จอมมารศัตรู',
    role: 'antagonist' as const,
    appearanceAnchor: 'sinister powerful adversary, glowing crimson eyes, formidable armor',
    clothingStyle: 'dark armor robes',
    voiceStyle: 'เย็นชา ทะนงตน ดุดัน',
  };

  const ally = characters.find((c) => c.role === 'supporting' || c.role === 'mentor') || {
    id: 'char-3',
    name: 'สหายร่วมรบ',
    role: 'supporting' as const,
    appearanceAnchor: 'trusted companion warrior',
    clothingStyle: 'scout tactical robes',
    voiceStyle: 'กระตือรือร้น จริงใจ สุขุม',
  };

  // 3. ตรวจจับแก่นเรื่องจากชื่อเรื่อง เรื่องย่อ และหมวดหมู่
  const contextText = `${title} ${synopsis} ${genre} ${subGenre} ${worldCulture}`.toLowerCase();
  
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

    // ทิศทางกล้อง Seedream 5.0 Pro (Single Take เชื่อมโยงจากฉากก่อนหน้า)
    const cameraMovement =
      i === 0
        ? `มุมกล้อง Seedream 5.0 Pro: เปิดฉากด้วยเลนส์ Anamorphic 35mm f/2.0 แพนมุมกว้างเปิดเผยบรรยากาศ ดอลลี่อินเข้าหา ${leadChar.name} อย่างต่อเนื่อง 10 วินาทีไร้รอยต่อ`
        : `มุมกล้อง Seedream 5.0 Pro: ช็อตต่อเนื่องแบบ Single Take (ไหลลื่นรับช็อตจากฉากที่ ${i}) เลนส์ Anamorphic 35mm f/2.0 ${cameraMotion} ถ่ายทำต่อเนื่อง 10 วินาทีไม่ตัดข้าม`;

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
      ally,
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
      charactersInScene: [leadChar, antagonist],
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
      characterIds: [leadChar.id],
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
  ally: CharacterBible;
  isTowerOrDungeon: boolean;
  isCultivation: boolean;
  isMilitary: boolean;
  isSciFi: boolean;
  transition: string;
  timeRangeStr: string;
}) {
  const {
    sceneNumber,
    totalScenes,
    actNumber,
    progress,
    cleanTitleStr,
    synopsis,
    leadChar,
    antagonist,
    ally,
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

  // สรุปข้อมูลย่อเพื่อให้เนื้อเรื่องอ้างอิงถึง
  const synopsisSnippet = synopsis ? synopsis.slice(0, 100).trim() : cleanTitleStr;

  if (isTowerOrDungeon) {
    // แนวยอดนิยม: หอคอย / ดันเจี้ยน / ฮันเตอร์ / คุปเวล่า (เช่น ผู้หวนคืนจากชั้นที่ 100)
    const currentFloor = Math.min(100, Math.max(1, Math.round(progress * 100)));

    if (actNumber === 1) {
      pureTitle = `การหวนคืนสู่สมรภูมิหอคอย & การระบุพิกัดชั้นที่ ${currentFloor}`;
      narration = `${transition} ม่านหมอกทมิฬแห่งหอคอยมรณะเริ่มขยับไหว ${leadChar.name} ยืนตระหง่านอยู่หน้าประตูมิติโบราณ สายตาที่ผ่านสมรภูมิเลือดนับร้อยชั้นไม่เคยหวั่นไหว แรงกดดันเวทมนตร์รอบตัวเริ่มหมุนวนเพื่อเตรียมเปิดฉากการล้างแค้น!`;
      dialogues = [
        { speaker: leadChar.name, emotion: 'มุ่งมั่น แววตาเยือกเย็น', text: `ครั้งนี้... จะไม่มีใครมาขวางการพิชิตชั้นที่ 100 ของข้าได้อีก!` },
      ];
      sfxBgm = `[BGM: ดนตรีซินธ์ดาร์กผสมออร์เคสตราบิลด์ความลึกลับ] [SFX: เสียงประตูหินยักษ์เลื่อนเปิดกึกก้อง, เสียงฮัมของวงเวทมนตร์โบราณ]`;
      lighting = 'แสงสีม่วงนีออนจากวงเวทตัดกับเงามืดทมิฬของโถงทางเดินหินในหอคอย';
    } else if (actNumber === 2) {
      pureTitle = `ทะลวงแนวป้องกันหอคอยชั้นที่ ${currentFloor} & การปะทะกองทัพอสูร`;
      narration = `${transition} เสียงคำรามของอสูรประจำชั้นดังก้องทั่วทางเดินหิน คมดาบและพลังงานเวทมนตร์ของ ${leadChar.name} วาดผ่านอากาศด้วยความเร็วสูง ร่างของศัตรูถูกกำจัดอย่างเด็ดขาดโดยไม่เปิดช่องว่างให้โต้กลับแม้แต่วินาทีเดียว!`;
      dialogues = [
        { speaker: ally.name, emotion: 'เตือนภัยอย่างเร่งด่วน', text: `ระวังตัวด้วย! ค่าพลังของบอสประจำชั้นกำลังพุ่งสูงขึ้น!` },
        { speaker: leadChar.name, emotion: 'สุขุม ฟาดฟันไม่ชะงัก', text: `แค่นี้ยังไม่พอจะหยุดยั้งข้า... เดินหน้าต่อไป!` },
      ];
      sfxBgm = `[BGM: ดนตรีต่อสู้จังหวะเร็ว กลองไฮบริดกระแทกกระทั้นเร้าอารมณ์] [SFX: เสียงฟันดาบความเร็วสูงฉับไว, เสียงกรงเล็บอสูรฟาดกระทบเกราะหิน]`;
      lighting = 'ประกายไฟจากการปะทะอาวุธส่องสว่างวาบตัดกับเปลวเพลิงสีฟ้าของเสาคบเพลิง';
    } else if (actNumber === 3) {
      pureTitle = `ประจันหน้าผู้พิทักษ์ชั้นสูงสุด & ปลดล็อกพลังแท้จริง`;
      narration = `${transition} เบื้องหน้าบัลลังก์ชั้นที่ 100 ${antagonist.name} ปรากฏกายขึ้นพร้อมออร่าพลังทำลายล้างที่สั่นสะเทือนมิติ ${leadChar.name} ปลดปล่อยแก่นแท้แห่งทักษะที่เก็บงำไว้ คลื่นพลังสะท้อนกลับจนโครงสร้างหอคอยแตกร้าวเป็นเสี่ยง!`;
      dialogues = [
        { speaker: antagonist.name, emotion: 'เย้ยหยัน คำรามก้องบัลลังก์', text: `คิดว่าการปีนขึ้นมาถึงชั้นที่ 100 จะเปลี่ยนชะตากรรมของเจ้าได้งั้นรึ?` },
        { speaker: leadChar.name, emotion: 'ดุดัน ปลดปล่อยพลังขีดสุด', text: `ที่นี่ไม่ใช่จุดจบของข้า... แต่มันคือสุสานของเจ้าต่างหาก!` },
      ];
      sfxBgm = `[BGM: มหากาพย์ไคลแม็กซ์ออร์เคสตรา ซับเบส 808 สั่นสะเทือนสะท้านอก] [SFX: คลื่นกระแทกโซนิคบูมระเบิดเปรี้ยง, เสียงกำแพงหินทลายลงมา]`;
      lighting = 'ลำแสงสีทองบริสุทธิ์ปะทะกับเปลวเพลิงสีแดงเลือด คอนทราสต์สูงสุดสะกดสายตา';
    } else {
      pureTitle = `การพิชิตชั้นที่ 100 เด็ดขาด & เบาะแสมิติใหม่`;
      narration = `${transition} การระเบิดครั้งสุดท้ายกลืนกินทุกสิ่ง เมื่อกลุ่มควันจางหาย บอสผู้ยิ่งใหญ่พังทลายลงกลายเป็นละอองแสง ชัยชนะเหนือหอคอยชั้นที่ 100 ตกเป็นของ ${leadChar.name} แต่ที่ปลายทาง ประตูสู่มิติใหม่ที่เหนือกว่ากลับกำลังค่อยๆ ปรากฏขึ้น...`;
      dialogues = [
        { speaker: leadChar.name, emotion: 'แววตามุ่งมั่น เก็บดาบเข้าฝัก', text: `นี่ไม่ใช่จุดสิ้นสุด... แต่คือการเริ่มต้นของบททดสอบที่แท้จริง!` },
      ];
      sfxBgm = `[BGM: ท่วงทำนองชัยชนะอันยิ่งใหญ่และสง่างาม ผสานคอรัสประสานเสียง] [SFX: เสียงละอองพลังงานสลายตัวระยิบระยับ, เสียงลมพัดผ่านซากปรักหักพัง]`;
      lighting = 'แสงสว่างสีทองจากประตูมิติเบื้องบนสาดส่องลงมายังร่างของตัวเอกอย่างงดงาม';
    }
  } else if (isCultivation) {
    // แนวกำลังภายใน / เซียน / บำเพ็ญเพียร (สไตล์ เพื่อนที่ดีที่สุด SAN1)
    if (actNumber === 1) {
      pureTitle = `การตื่นรู้ของลมปราณเซียน & ความอยุติธรรมแห่งยุทธภพ`;
      narration = `${transition} ในดินแดนที่ผู้แข็งแกร่งคือกฎเกณฑ์ ${leadChar.name} รวบรวมสมาธิบนยอดผาหมอกสวรรค์ แก่นลมปราณที่เคยหลับใหลเริ่มส่องประกายอักขระสีทอง ท่ามกลางสายลมแห่งโชคชะตาที่กำลังจะพลิกฟ้าคว่ำแผ่นดิน!`;
      dialogues = [
        { speaker: leadChar.name, emotion: 'มุ่งมั่น กัดฟันแน่วแน่', text: `ฟ้าดินนี้จะไม่มีวันกักขังข้าได้อีก... วันนี้ข้าจะก้าวข้ามโชคชะตา!` },
      ];
      sfxBgm = `[BGM: เมโลดี้กู่เจิ้งลึกลับผสานเสียงกลองศึกจีนโบราณ] [SFX: เสียงลมปราณหมุนวนรอบกาย, เสียงลมหวีดหวิวบนยอดผา]`;
      lighting = 'แสงจันทร์ส่องทะลุผ่านม่านหมอกสีเงิน สาดประกายออร่าลมปราณสีครามเรืองรอง';
    } else if (actNumber === 2) {
      pureTitle = `ฝ่าด่านค่ายกลสำนักใหญ่ & เผชิญหน้ายอดฝีมือฝ่ายมาร`;
      narration = `${transition} คมกระบี่ของ ${leadChar.name} พุ่งแหวกม่านอากาศดั่งมังกรผงาด ทะลวงผ่านค่ายกลเก้าสุริยันอย่างแม่นยำ ทุกกระบวนท่าแฝงไปด้วยเจตจำนงกระบี่ที่คมกริบเกินกว่าที่ใครจะต้านทานได้!`;
      dialogues = [
        { speaker: ally.name, emotion: 'ชื่นชมอย่างตื่นตะลึง', text: `เจตจำนงกระบี่ของเขา... ก้าวข้ามระดับขอบเขตเดิมไปแล้ว!` },
        { speaker: leadChar.name, emotion: 'เยือกเย็น สุขุม', text: `กระบี่ไร้เงา ผ่าค่ายกลมาร!` },
      ];
      sfxBgm = `[BGM: จังหวะกระบี่เร็วเร้าใจ เครื่องสายจีนผสานกลองศึกหนักแน่น] [SFX: เสียงกระบี่ฟันแหวกอากาศ 'ชิ้ง', เสียงอักขระเวทมนตร์แตกสลาย]`;
      lighting = 'แสงประกายกระบี่สีฟ้าครามตัดกับไอหมอกพิษสีเขียวมรกตอย่างดุเดือด';
    } else if (actNumber === 3) {
      pureTitle = `มหาศึกแตกหัก & สำแดงเก้ากระบี่สะบั้นสวรรค์`;
      narration = `${transition} ฟากฟ้าคำรามลั่น ${antagonist.name} ปลดปล่อยเปลวเพลิงทมิฬกลืนกินผืนป่า แต่ ${leadChar.name} ยืนหยัดอยู่ใจกลางพายุ รวบรวมกระบี่ทั้งเก้าเล่มรวมเป็นหนึ่งเดียวเพื่อฟาดฟันศัตรูคู่อาฆาต!`;
      dialogues = [
        { speaker: antagonist.name, emotion: 'ตื่นตระหนก หน้าถอดสี', text: `แรงกดดันระดับมหาเทพนี้... เจ้าบรรลุสู่ขั้นเซียนตั้งแต่เมื่อไหร่?!` },
        { speaker: leadChar.name, emotion: 'คำรามกึกก้องสะท้านฟ้า', text: `หนี้แค้นในวันวาน... จงชดใช้ด้วยชีวิตของเจ้า!` },
      ];
      sfxBgm = `[BGM: ดนตรีไคลแม็กซ์ออร์เคสตราจีนเต็มวง เสียงร้องประสานเสียงกังวาน] [SFX: เสียงระเบิดพลังมังกรฟ้าปะทะเพลิงทมิฬ, แผ่นดินสั่นสะเทือน]`;
      lighting = 'ลำแสงสีขาวทองบริสุทธิ์ส่องทะลุความมืดมิด สว่างจ้าดั่งดวงอาทิตย์ดวงใหม่';
    } else {
      pureTitle = `ปิดฉากศึกยุทธภพ & ก้าวสู่แดนเซียนเบื้องบน`;
      narration = `${transition} เมื่อคลื่นพลังสงบลง เศษซากแห่งความมืดก็มลายสิ้น ชัยชนะของ ${leadChar.name} ได้จารึกลงในหน้าประวัติศาสตร์ แต่เสียงเรียกจากแดนเซียนเบื้องบนคือสัญญาณว่า การเดินทางที่แท้จริงเพิ่งจะเริ่มต้นขึ้นเท่านั้น!`;
      dialogues = [
        { speaker: leadChar.name, emotion: 'สุขุม แววตาเปี่ยมหวัง', text: `แดนเซียนเบื้องบน... ข้าจะฟาดฟันขึ้นไปให้ถึง!` },
      ];
      sfxBgm = `[BGM: ทำนองดนตรีซาบซึ้งและยิ่งใหญ่ สื่อถึงชัยชนะและการออกเดินทางต่อ] [SFX: เสียงลมพัดชายเสื้อคลุมพริ้วไหว, เสียงกระดิ่งสวรรค์กังวานใส]`;
      lighting = 'ลำแสงสวรรค์สีทองสาดส่องลงมาจากหมู่เมฆอย่างสง่างาม';
    }
  } else if (isMilitary) {
    // แนวทหาร & ยุทธการสงคราม (Facebook Reels / YouTube Shorts 2-5 นาที หรือมหากาพย์)
    if (actNumber === 1) {
      pureTitle = `ตรวจจับสัญญาณภัยคุกคาม & ยุทธการระดมพลสายฟ้าแลบ`;
      narration = `${transition} พิกัดดาวเทียมตรวจจับการเคลื่อนไหวของขีปนาวุธข้าศึก ผู้การ ${leadChar.name} นำหน่วยรบพิเศษเข้าสู่สถานะพร้อมรบระดับสูงสุด ระบบควบคุมอาวุธทั้งหมดถูกปลดล็อกในทันที!`;
      dialogues = [
        { speaker: leadChar.name, emotion: 'สั่งการเด็ดขาดผ่านวิทยุ', text: `ทุกหน่วยเข้าประจำตำแหน่ง ล็อกเป้าหมาย... ภารกิจนี้ห้ามพลาดแม้แต่วินาทีเดียว!` },
      ];
      sfxBgm = `[BGM: ซาวด์แทร็กทหารตื่นเต้นเร้าใจ เบสหนักกระแทกกระทั้น] [SFX: เสียงไซเรนเตือนภัย, เสียงบรรจุกระสุนและระบบไฮดรอลิกส์]`;
      lighting = 'แสงไฟฉุกเฉินสีแดงในห้องยุทธวิธี ตัดกับแสงหน้าจอเรดาร์แสดงพิกัดดาวเทียม';
    } else if (actNumber === 2) {
      pureTitle = `การปล่อยขีปนาวุธไฮเปอร์โซนิก & การทะลวงแนวรบ`;
      narration = `${transition} ไซโลยิงขีปนาวุธเปิดออก เปลวเพลิงสีส้มขนาดมหึมาพุ่งทะยานฉีกชั้นบรรยากาศ โดรนสังหารไร้คนขับและหน่วยยานเกราะรุกคืบเข้าทำลายแนวป้องกันข้าศึกอย่างแม่นยำ!`;
      dialogues = [
        { speaker: ally.name, emotion: 'รายงานความเร็วสูง', text: `ขีปนาวุธความเร็ว 8 มัคเข้าสู่เป้าหมายแล้ว... ทลายแนวป้องกันสำเร็จ!` },
      ];
      sfxBgm = `[BGM: กลองศึกและเครื่องเป่าทรงพลังสไตล์ภาพยนตร์สงคราม] [SFX: เสียงขีปนาวุธพุ่งแหวกอากาศ Sonic Boom, เสียงปืนกลหนักยิงรัว]`;
      lighting = 'เปลวเพลิงจากท้ายขีปนาวุธส่องสว่างเจิดจ้าตัดกับท้องฟ้ายามพลบค่ำ';
    } else if (actNumber === 3) {
      pureTitle = `การแทรกซึมระยะประชิด & ปะทะเดือดในฐานบัญชาการ`;
      narration = `${transition} ท่ามกลางม่านควันปืน ${leadChar.name} นำทีมบุกทะลวงเข้าสู่ศูนย์บัญชาการของ ${antagonist.name} การปะทะด้วยอาวุธหนักเกิดขึ้นอย่างดุเดือดและไม่ปรานี!`;
      dialogues = [
        { speaker: antagonist.name, emotion: 'ตื่นตระหนก ตะโกนสั่งการ', text: `ตั้งแนวป้องกัน! อย่ายอมให้พวกมันเข้าถึงระบบควบคุม!` },
        { speaker: leadChar.name, emotion: 'ดุดัน ยิงสวนกลับทันที', text: `สายเกินไปแล้ว... ฐานทัพนี้ถูกยึดครองทั้งหมดแล้ว!` },
      ];
      sfxBgm = `[BGM: ดนตรีแอ็กชันอิเล็กทรอนิกส์ระทึกขวัญขั้นสูงสุด] [SFX: ปลอกกระสุนตกกระทบพื้นคอนกรีต, เสียงสะเก็ดระเบิดทำลายล้าง]`;
      lighting = 'แสงเลเซอร์ชี้เป้าสีเขียวและสีแดงตัดผ่านม่านควันปืนหนาทึบ บรรยากาศดิบเท่สมจริง';
    } else {
      pureTitle = `ชัยชนะเชิงยุทธวิธี & การถอนกำลังอย่างปลอดภัย`;
      narration = `${transition} การระเบิดครั้งสุดท้ายปิดฉากสมรภูมิ ควันไฟที่ลอยขึ้นสู่ท้องฟ้าคือหลักฐานแห่งชัยชนะเชิงยุทธวิธีที่เด็ดขาด กองกำลังศัตรูถูกกวาดล้างอย่างสมบูรณ์แบบ!`;
      dialogues = [
        { speaker: leadChar.name, emotion: 'รายงานผลสำเร็จผ่านวิทยุ', text: `ศูนย์บัญชาการ... ภารกิจสำเร็จลุล่วง ฐานศัตรูถูกทำลายทั้งหมด พร้อมถอนกำลัง!` },
      ];
      sfxBgm = `[BGM: ดนตรีสรุปบทเรียนสงคราม ซาบซึ้งและยิ่งใหญ่สะกดอารมณ์] [SFX: เสียงฮัมของใบพัดเฮลิคอปเตอร์กู้ภัย, เสียงลมพัดผ่านสมรภูมิ]`;
      lighting = 'แสงอาทิตย์ยามเช้าสาดส่องผ่านม่านควันที่ค่อยๆ จางหาย สะท้อนประกายชุดเกราะยุทธวิธี';
    }
  } else if (isSciFi) {
    // แนวไซไฟ / หุ่นยนต์ / ไซเบอร์พังก์
    if (actNumber === 1) {
      pureTitle = `ตรวจจับความผิดปกติของโครงข่ายควอนตัม & การตื่นของระบบ`;
      narration = `${transition} ในมหานครที่ถูกควบคุมด้วยอัลกอริทึม ${leadChar.name} ตรวจพบความผันผวนของระบบพลังงานแกนกลาง สัญญาณเตือนภัยสีแดงกะพริบถี่ทั่วหน้าจออินเทอร์เฟซโฮโลแกรม!`;
      dialogues = [
        { speaker: leadChar.name, emotion: 'สุขุม พิมพ์คำสั่งปลดล็อก', text: `ระบบกำลังถูกแทรกแซง... เราต้องชัตดาวน์แกนกลางก่อนที่มันจะระเบิด!` },
      ];
      sfxBgm = `[BGM: ซาวด์ไซไฟล้ำยุค ผสานเบสสังเคราะห์ความถี่ต่ำ] [SFX: เสียงพิมพ์คีย์บอร์ดความเร็วสูง, เสียงบี๊บของอินเทอร์เฟซโฮโลแกรม]`;
      lighting = 'แสงนีออนสีฟ้าไซเบอร์และสีชมพูส่องกระทบใบหน้าท่ามกลางความมืด';
    } else if (actNumber === 2) {
      pureTitle = `การไล่ล่าด้วยยานความเร็วสูง & ทลายการสกัดกั้น`;
      narration = `${transition} ยานลอยตัวความเร็วเหนือเสียงพุ่งทะยานลัดเลาะผ่านตึกระฟ้า ฝูงโดรนสังหารของศัตรูไล่ล่าตามหลังอย่างกระชั้นชิด คลื่นพลังงานพลาสมาถูกยิงสกัดกั้นอย่างดุเดือด!`;
      dialogues = [
        { speaker: ally.name, emotion: 'บังคับยานอย่างตื่นเต้น', text: `โดรนศัตรูล็อกเป้าเราแล้ว! เตรียมตัวรับแรงกระแทก!` },
        { speaker: leadChar.name, emotion: 'เล็งปืนพลาสมาอย่างแม่นยำ', text: `ปล่อยให้เป็นหน้าที่ของฉัน... ยิงสกัดทันที!` },
      ];
      sfxBgm = `[BGM: ดนตรีอิเล็กทรอนิกส์ซินธ์เวฟจังหวะเร็วเร้าใจ] [SFX: เสียงเครื่องยนต์ต่อต้านแรงโน้มถ่วงหวีดร้อง, ลำแสงพลาสมายิงระรัว]`;
      lighting = 'ลำแสงเลเซอร์สีส้มและสีฟ้าพุ่งตัดกันบนท้องฟ้ายามค่ำคืน';
    } else if (actNumber === 3) {
      pureTitle = `เจาะทะลวงแกนประมวลผล & ปะทะจักรกลสังหาร`;
      narration = `${transition} ณ ใจกลางเมนเฟรม ${antagonist.name} ปรากฏตัวในร่างไซบอร์กเกราะหนัก การแลกเปลี่ยนหมัดพลังงานกลและลำแสงอนุภาคทำลายล้างห้องเซิร์ฟเวอร์จนพังทลาย!`;
      dialogues = [
        { speaker: antagonist.name, emotion: 'เสียงหุ่นยนต์สังเคราะห์เยือกเย็น', text: `สิ่งมีชีวิตชีวภาพอย่างพวกเจ้า... สมควรถูกกำจัดออกจากระบบ!` },
        { speaker: leadChar.name, emotion: 'ดุดัน เสียบไวรัสโอเวอร์โหลด', text: `ตราบใดที่มีหัวใจ... ข้าจะไม่ยอมให้เครื่องจักรอย่างแกมาบงการ!` },
      ];
      sfxBgm = `[BGM: ดนตรีไคลแม็กซ์อินดัสเทรียลเมทัลผสานออร์เคสตรา] [SFX: เสียงประกายไฟช็อตเปรี๊ยะ, เสียงโลหะปะทะโลหะก้องกังวาน]`;
      lighting = 'แสงประกายไฟฟ้ารั่วไหลสีฟ้าสลับกับแสงไฟฉุกเฉินกะพริบ';
    } else {
      pureTitle = `รีบูตระบบสู่อิสรภาพ & แสงอรุณเหนือมหานคร`;
      narration = `${transition} ระบบแกนกลางถูกรีเซ็ตสำเร็จ ม่านพลังงานที่กักขังเมืองดับลงทีละส่วน ${leadChar.name} ยืนมองแสงแรกของวันใหม่ที่สาดส่องลงสู่มหานครที่ได้รับอิสรภาพกลับคืนมา`;
      dialogues = [
        { speaker: leadChar.name, emotion: 'รำพึงด้วยความโล่งใจ', text: `ระบบล่มสลายแล้ว... วันนี้คือวันแรกของโลกใหม่` },
      ];
      sfxBgm = `[BGM: ท่วงทำนองเปียโนและซินธ์อบอุ่นเปี่ยมความหวัง] [SFX: เสียงระบบค่อยๆ ชัตดาวน์, เสียงสายลมพัดผ่านยอดตึก]`;
      lighting = 'แสงอาทิตย์สีทองยามเช้าสาดส่องผ่านเงาตึกระฟ้า เผยให้เห็นท้องฟ้าโปร่งใส';
    }
  } else {
    // แนวทั่วไป / แฟนตาซีมหากาพย์ / แอ็กชัน
    if (actNumber === 1) {
      pureTitle = `การเปิดม่านแห่งโชคชะตา & สัญญาณแห่งวิกฤต`;
      narration = `${transition} ในดินแดนที่เรื่องราวของ ${synopsisSnippet} เริ่มต้นขึ้น ${leadChar.name} ต้องเผชิญหน้ากับทางเลือกที่จะเปลี่ยนชีวิตไปตลอดกาล บรรยากาศแห่งความไม่แน่นอนปกคลุมไปทั่วทุกหนแห่ง!`;
      dialogues = [
        { speaker: leadChar.name, emotion: 'สุขุม มุ่งมั่น', text: `ถ้าเราไม่เริ่มต้นก้าวออกไปตอนนี้ ทุกอย่างจะสายเกินแก้!` },
      ];
      sfxBgm = `[BGM: ซาวด์แทร็กภาพยนตร์ลึกลับชวนติดตาม] [SFX: เสียงสายลมพัดกระโชก, เสียงฝีเท้าหนักแน่น]`;
      lighting = 'แสงแดดยามเย็นทอดยาวเป็นเงาลึก บรรยากาศเข้มขลังสมจริง';
    } else if (actNumber === 2) {
      pureTitle = `การฝ่าฟันอุปสรรค & บททดสอบแห่งความกล้าหาญ`;
      narration = `${transition} ทุกย่างก้าวเต็มไปด้วยอันตรายที่มองไม่เห็น ${leadChar.name} นำทีมผ่านพ้นกับดักและศัตรูที่คอยซุ่มโจมตี ความเฉียบคมและความไว้วางใจซึ่งกันและกันคืออาวุธที่สำคัญที่สุด!`;
      dialogues = [
        { speaker: ally.name, emotion: 'จริงจัง เตือนสติ', text: `ข้างหน้ามีกับดัก! ระวังตัวด้วย!` },
        { speaker: leadChar.name, emotion: 'สุขุม เด็ดขาด', text: `ตามฉันมา... อย่าคลาดสายตา!` },
      ];
      sfxBgm = `[BGM: ดนตรีแอ็กชันผจญภัย จังหวะเร่งเร้า] [SFX: เสียงอาวุธปะทะกัน, เสียงก้อนหินถล่ม]`;
      lighting = 'แสงคบเพลิงส่องกระทบใบหน้า ตัดกับเงามืดลึกในถ้ำหรือป่าทึบ';
    } else if (actNumber === 3) {
      pureTitle = `การปะทะตัดสินชะตากรรม & รวมพลังขั้นสูงสุด`;
      narration = `${transition} การเผชิญหน้าครั้งสำคัญระหว่าง ${leadChar.name} และ ${antagonist.name} ระเบิดขึ้นอย่างไม่อาจหลีกเลี่ยง การต่อสู้นี้จะเป็นตัวตัดสินชะตากรรมของทุกคน!`;
      dialogues = [
        { speaker: antagonist.name, emotion: 'เย้ยหยัน มั่นใจ', text: `เจ้าไม่มีทางเอาชนะข้าได้!` },
        { speaker: leadChar.name, emotion: 'ตะโกนก้อง สวนกลับ', text: `นี่คือคำตอบของข้า... ลุยกันให้แหลก!` },
      ];
      sfxBgm = `[BGM: ดนตรีไคลแม็กซ์มหากาพย์เต็มวง เร้าอารมณ์ถึงขีดสุด] [SFX: เสียงระเบิดครั้งใหญ่, เสียงคลื่นพลังปะทะกัน]`;
      lighting = 'แสงวาบจากการระเบิดสาดส่องใบหน้า คอนทราสต์แสงเงาจัดจ้าน';
    } else {
      pureTitle = `ชัยชนะแห่งมหากาพย์ & บทสรุปที่ตราตรึง`;
      narration = `${transition} หลังผ่านพ้นการต่อสู้อันยาวนาน ชัยชนะที่ได้มาด้วยความเสียสละได้นำพาความสงบสุขกลับคืนมา ${leadChar.name} ยืนหยัดอย่างสง่างาม พร้อมที่จะก้าวเดินต่อไปในเส้นทางข้างหน้า`;
      dialogues = [
        { speaker: leadChar.name, emotion: 'แววตาเปี่ยมหวังและเกียรติยศ', text: `การต่อสู้ครั้งนี้จบลงแล้ว... แต่มิตรภาพและเกียรติยศจะคงอยู่ตลอดไป` },
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
  };
}

/**
 * ฟังก์ชันดั้งเดิมสำหรับรองรับโค้ดเดิม (Backward compatibility)
 */
export function generateActTemplateScenes(options: GenerateScriptOptions): ScriptScene[] {
  return generateContinuousMovieScenes(options);
}
