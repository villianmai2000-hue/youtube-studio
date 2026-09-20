export type VisualMedium = 'live_action' | 'animation';

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

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  actNumber: 1 | 2 | 3 | 4; // องค์ที่ 1-4 สำหรับคลิปยาว หรือ พาร์ท 1-4 สำหรับคลิป 2-5 นาที
  title: string;
  narration: string; // บทบรรยายเสียงพากย์
  dialogues: CharacterDialogue[]; // บทสนทนาตัวละคร
  sfxBgm: string; // [SFX: ...] [BGM: ...]
  
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

export interface CharacterBible {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'mentor' | 'beast_companion';
  gender?: string;
  ageGroup?: string;
  appearanceAnchor: string; // คุณลักษณะเด่น เช่น "handsome young cultivator with white jade hairpin, black martial robe with gold embroidery, azure glowing eyes"
  clothingStyle: string;
  voiceStyle: string; // น้ำเสียงสำหรับนักพากย์ เช่น "ทุ้มต่ำ ดุดัน สุขุม"
  weaponsOrProps?: string; // กระบี่บิน, ปืนไรเฟิลจู่โจม, ขีปนาวุธ
  googleFlowSeed?: string; // Seed ประจำตัวละครสำหรับ flow.google.com
  googleFlowPrompt?: string; // Prompt สำหรับเจนบน flow.google.com
  referenceImageGridFsId?: string;
  referenceImageUrl?: string;
  imageUrl?: string;
}

export interface Project {
  _id?: string;
  id: string;
  title: string;
  synopsis: string;
  genre: MovieGenre;
  genreNameCustom?: string;
  militaryCategory?: 'missiles_weapons' | 'jets_drones' | 'special_forces' | 'armored_tanks';
  visualMedium: VisualMedium; // คนจริง vs การ์ตูน
  stylePreset: StylePreset;
  aspectRatio: AspectRatio; // 16:9 หรือ 9:16
  scriptEngine: ScriptEngine; // Gemini หรือ Claude
  targetDurationMinutes: number; // 2, 5, 15, 30, 60, 120 (รันชั่วโมง)
  characters: CharacterBible[];
  scenes: ScriptScene[];
  
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
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}
