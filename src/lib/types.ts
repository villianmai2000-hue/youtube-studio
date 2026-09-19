export type VisualMedium = 'live_action' | 'animation';

export type MovieGenre = 
  | 'xianxia_cultivation' // บำเพ็ญเพียร / กำลังภายใน (เหมือน เพื่อนที่ดีที่สุด SAN1)
  | 'action_scifi'        // แอ็กชัน ไซไฟ ไซเบอร์พังก์
  | 'epic_fantasy'        // แฟนตาซีมหากาพย์
  | 'horror_thriller'     // สยองขวัญ ระทึกขวัญ
  | 'mystery_noir'        // สืบสวน ฟิล์มนัวร์
  | 'historical_war'      // ย้อนยุค สงครามประวัติศาสตร์
  | 'custom';             // กำหนดเอง

export type StylePreset = 
  // การ์ตูนและแอนิเมชัน
  | 'donghua_3d'          // อนิเมะจีน 3D (Unreal Engine 5 / เพื่อนที่ดีที่สุด SAN1)
  | 'anime_2d'            // อนิเมะญี่ปุ่น 2D (Ufotable / Shinkai)
  | 'western_3d'          // แอนิเมชัน 3D ฮอลลีวูด (Arcane / Pixar)
  | 'manhwa_action'       // มันฮวาเกาหลี (Solo Leveling)
  // คนจริง
  | 'hollywood_cinematic' // หนังฮอลลีวูด 35mm Chiaroscuro
  | 'imax_70mm'           // IMAX 70mm คมชัดพิเศษ ผิวคนจริง
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
  actNumber: 1 | 2 | 3 | 4; // องค์ที่ 1-4 สำหรับคลิปยาว
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
  negativePrompt: string;
  
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
  weaponsOrProps?: string; // กระบี่บิน, ลูกแก้ววิญญาณ, ปืนเลเซอร์
  referenceImageGridFsId?: string;
  referenceImageUrl?: string;
}

export interface Project {
  _id?: string;
  id: string;
  title: string;
  synopsis: string;
  genre: MovieGenre;
  genreNameCustom?: string;
  visualMedium: VisualMedium; // คนจริง vs การ์ตูน
  stylePreset: StylePreset;
  targetDurationMinutes: number; // 15, 30, 60, 120 (รันชั่วโมง)
  characters: CharacterBible[];
  scenes: ScriptScene[];
  
  // System Metadata
  youtubeChannelStyle: string; // ค่าเริ่มต้น: "สไตล์เพื่อนที่ดีที่สุด SAN1"
  createdAt: string;
  updatedAt: string;
}
