export type VisualMedium = 'live_action' | 'animation';

export type WorldCulture = 'chinese' | 'japanese' | 'thai' | 'western_global';

export type MovieGenre = 
  | 'xianxia_cultivation' // บำเพ็ญเพียร / กำลังภายใน (เหมือน เพื่อนที่ดีที่สุด SAN1)
  | 'action_scifi'        // แอ็กชัน ไซไฟ ไซเบอร์พังก์
  | 'epic_fantasy'        // แฟนตาซีมหากาพย์
  | 'horror_thriller'     // สยองขวัญ ระทึกขวัญ
  | 'mystery_noir'        // สืบสวน ฟิล์มนัวร์
  | 'historical_war'      // ย้อนยุค สงครามประวัติศาสตร์
  | 'military_tactical'   // แนวทหาร & ยุทธการสงคราม (2-5 นาที สไตล์ Facebook Reels)
  | 'custom';             // กำหนดเอง

export type AspectRatio = '16:9' | '9:16';

export type ScriptEngine = 
  | 'gemini_3_1_pro'      // Google Gemini 3.1 Pro (ฉลาดลึกซึ้ง เขียนบทพากย์ภาษาไทยสมบูรณ์แบบ)
  | 'gemini_3_8_flash'    // Google Gemini 3.8 Flash (ความเร็วสูง เนื้อเรื่องไหลลื่น)
  | 'gemini_flash_lite'   // Google Gemini 3.5 Flash-Lite (ประหยัดพลังงาน ประมวลผลฉับไว)
  | 'claude_extra'        // Claude.ai Extra Quality
  | 'claude_high'         // Claude.ai High Quality
  | 'claude_medium';      // Claude.ai Medium Quality

export type StylePreset = 
  // การ์ตูนและแอนิเมชัน
  | 'donghua_3d'          // อนิเมะจีน 3D (Unreal Engine 5 / เพื่อนที่ดีที่สุด SAN1)
  | 'anime_2d'            // อนิเมะญี่ปุ่น 2D (Ufotable / Shinkai)
  | 'western_3d'          // แอนิเมชัน 3D ฮอลลีวูด (Arcane / Pixar)
  | 'manhwa_action'       // มันฮวาเกาหลี (Solo Leveling)
  // คนจริง
  | 'hollywood_cinematic' // หนังฮอลลีวูด 35mm Chiaroscuro
  | 'imax_70mm'           // IMAX 70mm คมชัดพิเศษ ผิวคนจริง
  | 'military_combat'     // หน่วยรบ ยุทโธปกรณ์ ยานเกราะ กล้อง Tactical Go-Pro & Drone 4K
  | 'dark_noir'           // ดาร์กโทน นัวร์ ฝนตก นีออน
  | 'vintage_film';       // ฟิล์มคลาสสิก ย้อนยุค

export interface CharacterDialogue {
  speaker: string;
  emotion: string; // เช่น 'โกรธเกรี้ยว', 'เยือกเย็น', 'ตื่นตระหนก', 'กระซิบเบาๆ'
  text: string;
}

// 7 เลเยอร์ระบบเสียงสตูดิโอ (Audio Layers Architecture)
export interface SceneAudio {
  voiceover?: string;     // เสียงพากย์บรรยาย
  voiceTone?: string;     // น้ำเสียง (ทุ้ม, กังวาน, แหบพร่า, สดใส)
  emotion?: string;       // อารมณ์น้ำเสียง (ดุดัน, สุขุม, หวาดกลัว, เปี่ยมหวัง)
  sfx?: string;           // Sound Effects / Foley
  ambient?: string;       // เสียงบรรยากาศ (Ambient / Room Tone)
  bgm?: string;           // ดนตรีประกอบ (Score / Background Music)
  opEdTheme?: string;     // คิวเพลงเปิด/ปิด (Opening/Ending Theme)
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  actNumber: 1 | 2 | 3 | 4; // องค์ที่ 1-4 สำหรับคลิปยาว หรือ พาร์ท 1-4 สำหรับคลิป 2-5 นาที
  title: string;
  narration: string; // บทบรรยายเสียงพากย์
  dialogues: CharacterDialogue[]; // บทสนทนาตัวละคร
  sfxBgm: string; // [BGM: ...] [SFX: ...]
  audioLayers?: SceneAudio; // ระบบเสียง 7 มิติแบบละเอียด
  
  // Visual & Continuity Prompts
  characterIds: string[]; // ตัวละครที่ปรากฏในฉากนี้ (สำหรับผูก Character Anchor)
  visualMedium: VisualMedium;
  stylePreset: StylePreset;
  cameraMovement: string; // เช่น 'Slow push-in', 'Wide master shot', 'Low-angle tracking'
  lighting: string; // เช่น 'Golden hour dramatic', 'Ethereal blue qi glow', 'Dark chiaroscuro'
  
  // Ready-to-use AI Prompts
  imagePrompt: string; // Midjourney / Flux / SD
  videoMotionPrompt: string; // Kling AI / Runway Gen-3 / Luma
  googleFlowPrompt?: string; // คำสั่งสร้างวิดีโอบน flow.google.com (VideoFX / ImageFX ล็อคตัวละครไม่เพี้ยน)
  googleFlowSeed?: string; // Seed เลขสุ่มคงที่สำหรับล็อคตัวละครบน flow.google.com
  negativePrompt: string;
  aspectRatio?: AspectRatio; // 16:9 หรือ 9:16
  
  // Media Storage in MongoDB Atlas GridFS
  mediaFileId?: string; // MongoDB GridFS ObjectId
  mediaUrl?: string; // URL สำหรับเรียกดู /api/media/[id]
  
  estimatedDurationSec: number;
  notes?: string;
  createdAt: string;
}

// 11 มิติข้อมูลตัวละครสมบูรณ์แบบ (Character Bible 11 Dimensions)
export interface CharacterBible {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'mentor' | 'beast_companion';
  gender?: string;
  ageGroup?: string;
  age?: string; // 1. อายุ
  bodyBuild?: string; // 2. รูปร่าง (กำยำ, ปราดเปรียว, ผอมสูง)
  facialFeatures?: string; // 3. ใบหน้า (คมเข้ม, เย็นชา, รอยแผลเป็น, แววตาสีอำพัน)
  hairStyle?: string; // 4. ทรงผม (ยาวสีขาวเงินเกล้ามวย, ซอยสั้น, ผมดำขลับ)
  clothingStyle: string; // 5. เสื้อผ้า (ชุดคลุมเต๋าปักดิ้นทอง, เกราะหนามทมิฬ)
  colorTheme?: string; // 6. สีประจำตัว (ดำ-ทอง, คราม-เงิน, แดงเพลิง)
  weaponsOrProps?: string; // 7. อาวุธ/ไอเทม (กระบี่โบราณ, คันศรเวท, ยานรบ)
  personality?: string; // 8. บุคลิก (เยือกเย็น มุ่งมั่น ไม่ยอมแพ้ต่อชะตากรรม)
  abilities?: string; // 9. ความสามารถพิเศษ (เก้ากระบี่สวรรค์, เนตรมารมังกร)
  weaknesses?: string; // 10. จุดอ่อน (ชีพจรเคยแตกร้าว, ห่วงใยมารดา)
  relationships?: string; // 11. ความสัมพันธ์ (คู่ปรับตลอดกาลของจ้าวอสูรโลหิต)
  appearanceAnchor: string; // คุณลักษณะเด่นสรุปรวมสำหรับ Prompt ล็อคหน้าตาด้วย AI
  voiceStyle: string; // น้ำเสียงสำหรับนักพากย์ เช่น "ทุ้มต่ำ ดุดัน สุขุม"
  googleFlowSeed?: string; // Seed ประจำตัวละครสำหรับ flow.google.com
  googleFlowPrompt?: string; // Prompt สำหรับเจนบน flow.google.com
  referenceImageGridFsId?: string;
  referenceImageUrl?: string;
  imageUrl?: string;
}

// 9 มิติข้อมูลโลก (World Building 9 Dimensions)
export interface WorldBuilding {
  era: string; // 1. ยุคสมัย (บรรพกาล, ราชวงศ์โบราณ, ร่วมสมัย, อนาคตไซไฟ)
  kingdom: string; // 2. ประเทศ / อาณาจักร / สำนัก (แดนเสวียนหยวน, มหาอาณาจักรอยุธยา)
  city: string; // 3. เมือง / สถานที่สำคัญ (ยอดเขาหมอกสวรรค์, ลานประลองเก้าสุริยัน)
  terrain: string; // 4. ภูมิประเทศ (หุบเหวลึก, ทะเลหมอก, ซากวิหารโบราณ)
  culture: string; // 5. วัฒนธรรม / ขนบธรรมเนียม (กฎแห่งผู้แข็งแกร่ง, คารวะสำนัก)
  species: string; // 6. เผ่าพันธุ์ (มนุษย์ฝึกเซียน, เผ่ามาร, เผ่าสัตว์อสูร, กึ่งจักรกล)
  creatures: string; // 7. สัตว์ / สัตว์ประหลาด (พญามังกรฟ้า, พญานาคราช, อสูรหมื่นพิษ)
  worldRules: string; // 8. กฎของโลก (การทลายขอบเขตชีพจร, ข้อห้ามการบูชายัญเลือด)
  powerSystem: string; // 9. ระบบพลัง / เวทมนตร์ (ลมปราณเก้าขั้น, คาถาอาคม, ควอนตัม)
}

// 8 มิติโครงเรื่อง (Story Architecture 8 Dimensions)
export interface StoryArchitecture {
  genre: string; // 1. แนวเรื่องหลัก
  concept: string; // 2. คอนเซปต์ (Logline / หัวใจเรื่อง)
  coreTheme: string; // 3. ธีมหลัก (การต่อสู้เพื่อความยุติธรรม, การพลิกชะตา)
  plotSummary: string; // 4. โครงเรื่องย่อ (Beginning - Middle - Climax)
  keyScenes: string[]; // 5. ฉากสำคัญ (Key Plot Beats)
  plotTwists: string; // 6. จุดหักเห (ความลับเรื่องชาติกำเนิด, การหักหลัง)
  climax: string; // 7. ไคลแมกซ์ (สงครามแตกหัก ณ ลานประลอง)
  ending: string; // 8. ตอนจบ (ชัยชนะเด็ดขาด และการเดินทางสู่แดนเซียน)
}

export interface Project {
  _id?: string;
  id: string;
  title: string;
  synopsis: string;
  genre: MovieGenre;
  genreNameCustom?: string;
  worldCulture?: WorldCulture; // วัฒนธรรมโลก (จีน / ญี่ปุ่น / ไทย / สากล)
  subGenre?: string; // หมวดหมู่ย่อย เช่น Xianxia, Isekai, ตำนานพญานาค
  militaryCategory?: 'missiles_weapons' | 'jets_drones' | 'special_forces' | 'armored_tanks';
  visualMedium: VisualMedium; // คนจริง vs การ์ตูน
  stylePreset: StylePreset;
  aspectRatio: AspectRatio; // 16:9 หรือ 9:16
  scriptEngine: ScriptEngine; // Gemini หรือ Claude
  targetDurationMinutes: number; // 2, 5, 15, 30, 60, 120 (รันชั่วโมง)
  characters: CharacterBible[];
  scenes: ScriptScene[];
  
  // Advanced World & Story Bibles
  worldBuilding?: WorldBuilding;
  storyArchitecture?: StoryArchitecture;
  
  // Sequel & Series Chaining
  seriesId?: string; // รหัสกลุ่มซีรีส์เดียวกัน
  seriesTitle?: string; // ชื่อซีรีส์หลัก
  partNumber?: number; // ลำดับภาค เช่น 1, 2, 3, 4...
  parentProjectId?: string; // รหัสโปรเจกต์ภาคก่อนหน้า
  nextPartProjectId?: string; // รหัสโปรเจกต์ภาคถัดไป
  previousPartTitle?: string; // ชื่อภาคก่อนหน้า
  previousEndingRecap?: string; // สรุปตอนจบภาคก่อนหน้าเพื่อส่งต่อ
  
  // System Metadata
  youtubeChannelStyle: string; // เช่น "สไตล์เพื่อนที่ดีที่สุด SAN1" หรือ "แนวทหารยุทธวิธี Facebook Reels"
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'owner' | 'admin' | 'creator';

export interface User {
  _id?: string;
  id: string;
  username: string;
  password?: string;
  displayName: string;
  phoneNumber?: string; // เบอร์โทรศัพท์สำหรับกู้คืนรหัสผ่านและ 2FA
  email?: string;       // อีเมลสำหรับแจ้งเตือนและป้องกันการแฮก
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}
