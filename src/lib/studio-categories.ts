import { WorldCulture, VisualMedium } from './types';

export interface CategoryOption {
  id: string;
  nameTh: string;
  nameEn: string;
  emoji: string;
  description: string;
}

// 2. หมวดหมู่อนิเมะ (Anime Genres - 20 แนว)
export const ANIME_GENRES: CategoryOption[] = [
  { id: 'action', nameTh: 'แอ็กชัน (Action)', nameEn: 'Action', emoji: '⚔️', description: 'ต่อสู้ การผจญภัย ฉากบู๊สุดมันส์' },
  { id: 'adventure', nameTh: 'ผจญภัย (Adventure)', nameEn: 'Adventure', emoji: '🗺️', description: 'เดินทาง สำรวจโลกใหม่ ดินแดนลึกลับ' },
  { id: 'fantasy', nameTh: 'แฟนตาซี (Fantasy)', nameEn: 'Fantasy', emoji: '🧙', description: 'เวทมนตร์ ปีศาจ โลกเหนือธรรมชาติ' },
  { id: 'scifi', nameTh: 'ไซไฟ (Sci-Fi)', nameEn: 'Sci-Fi', emoji: '🚀', description: 'เทคโนโลยี อวกาศ หุ่นยนต์ อนาคต' },
  { id: 'romance', nameTh: 'โรแมนซ์ (Romance)', nameEn: 'Romance', emoji: '❤️', description: 'ความรัก ความผูกพัน ความสัมพันธ์' },
  { id: 'comedy', nameTh: 'คอมเมดี้ (Comedy)', nameEn: 'Comedy', emoji: '😂', description: 'ตลก เน้นความฮา สนุกสนานเบาสมอง' },
  { id: 'drama', nameTh: 'ดราม่า (Drama)', nameEn: 'Drama', emoji: '🎭', description: 'ความสัมพันธ์ ความสูญเสีย เรื่องราวเข้มข้น' },
  { id: 'horror', nameTh: 'สยองขวัญ (Horror)', nameEn: 'Horror', emoji: '👻', description: 'ผี สัตว์ประหลาด ความน่ากลัว สั่นประสาท' },
  { id: 'mystery', nameTh: 'ลึกลับ (Mystery)', nameEn: 'Mystery', emoji: '🔍', description: 'สืบสวน ปริศนา คดีฆาตกรรม ความลับ' },
  { id: 'thriller', nameTh: 'ระทึกขวัญ (Thriller)', nameEn: 'Thriller', emoji: '😱', description: 'ลุ้น กดดัน อันตราย บีบคั้นหัวใจ' },
  { id: 'sports', nameTh: 'กีฬา (Sports)', nameEn: 'Sports', emoji: '⚽', description: 'ฟุตบอล บาสเกตบอล แข่งรถ มวยไทย' },
  { id: 'slice_of_life', nameTh: 'ชีวิตประจำวัน (Slice of Life)', nameEn: 'Slice of Life', emoji: '☕', description: 'เรื่องราวชีวิตทั่วไป อบอุ่นหัวใจ เรียบง่าย' },
  { id: 'music', nameTh: 'ดนตรี (Music)', nameEn: 'Music', emoji: '🎵', description: 'นักร้อง วงดนตรี การแสดง คอนเสิร์ต' },
  { id: 'historical', nameTh: 'ประวัติศาสตร์ (Historical)', nameEn: 'Historical', emoji: '🏛️', description: 'อิงยุคสมัยหรือเหตุการณ์จริงในอดีต' },
  { id: 'war', nameTh: 'สงคราม (War / Military)', nameEn: 'War', emoji: '🎖️', description: 'การรบ กองทัพ ยุทธศาสตร์ ยุทธวิธี' },
  { id: 'mecha', nameTh: 'เมชา (Mecha)', nameEn: 'Mecha', emoji: '🤖', description: 'หุ่นยนต์ยักษ์ เครื่องจักรสงครามต่อสู้' },
  { id: 'supernatural', nameTh: 'เหนือธรรมชาติ (Supernatural)', nameEn: 'Supernatural', emoji: '🔮', description: 'พลังพิเศษ วิญญาณ สิ่งลี้ลับ พลังจิต' },
  { id: 'ecchi', nameTh: 'แฟนเซอร์วิส (Ecchi)', nameEn: 'Ecchi', emoji: '💋', description: 'เน้นมุกหรือองค์ประกอบเชิงวาบหวิว มีเสน่ห์' },
  { id: 'idol', nameTh: 'ไอดอล (Idol)', nameEn: 'Idol', emoji: '🎤', description: 'นักร้อง/ไอดอล และวงการบันเทิงไลฟ์สด' },
  { id: 'isekai', nameTh: 'อิเซไก (Isekai)', nameEn: 'Isekai', emoji: '🌀', description: 'ตัวละครไปเกิดใหม่หรือหลุดไปต่างโลก' },
];

// 3. หมวดหมู่ภาพอนิเมะ (Anime Styles - 20 สไตล์)
export const ANIME_STYLES: CategoryOption[] = [
  { id: '2d_illustration', nameTh: 'ภาพวาด 2D (2D Illustration)', nameEn: '2D Illustration', emoji: '🎨', description: 'ลายเส้น 2 มิติคมชัด ลายเส้นดิจิทัลอาร์ตประณีต' },
  { id: 'photorealistic_anime', nameTh: 'ภาพสมจริง (Photorealistic)', nameEn: 'Photorealistic Anime', emoji: '🖼️', description: 'โมเดลผสมเสมือนจริง มีแสงเงาและพื้นผิวสมจริง' },
  { id: 'sketch', nameTh: 'ภาพสเก็ตช์ (Sketch)', nameEn: 'Sketch Art', emoji: '✏️', description: 'ลายเส้นดินสอดิบ เท่ เปี่ยมเสน่ห์คลาสสิก' },
  { id: 'painting', nameTh: 'ภาพวาดศิลปะ (Painting)', nameEn: 'Painting Art', emoji: '🖌️', description: 'ภาพวาดสีน้ำ สีน้ำมัน ศิลปะชั้นสูง' },
  { id: 'anime_classic', nameTh: 'ภาพอนิเมะ (Anime)', nameEn: 'Classic Anime', emoji: '🌸', description: 'ลายเส้นอนิเมะญี่ปุ่นระดับโรงภาพยนตร์ (Ufotable / Shinkai)' },
  { id: 'manga_recap_anime', nameTh: 'มังงะรีแคปอนิเมะ (Manga Realms MRE)', nameEn: 'Manga Realms Anime Recap', emoji: '🚌', description: 'ลายเส้นอนิเมะญี่ปุ่นคุณภาพสูง สไตล์มังงะรีแคป เล่าเรื่องลื่นไหลไม่ตัดข้าม' },
  { id: 'manga', nameTh: 'ภาพมังงะ (Manga)', nameEn: 'Manga Tone', emoji: '🎭', description: 'ลายเส้นมังงะ สกรีนโทนขาวดำเข้มข้น ดุดัน' },
  { id: 'cartoon', nameTh: 'ภาพการ์ตูน (Cartoon)', nameEn: 'Cartoon', emoji: '🧸', description: 'ลายเส้นการ์ตูนสดใส อารมณ์ขัน เข้าถึงง่าย' },
  { id: '3d_cgi_donghua', nameTh: 'ภาพ 3D / CGI (Donghua 3D)', nameEn: '3D CGI Donghua', emoji: '🧊', description: 'อนิเมะจีน 3D ระดับพรีเมียม (Unreal Engine 5 สไตล์ SAN1)' },
  { id: 'game_art', nameTh: 'ภาพสไตล์เกม (Game Art)', nameEn: 'Game Art', emoji: '🎮', description: 'กราฟิกสไตล์เกม RPG คอนโซลระดับ AAA' },
  { id: 'fantasy_art', nameTh: 'ภาพแฟนตาซี (Fantasy Art)', nameEn: 'Fantasy Art', emoji: '🧙', description: 'ละอองเวทมนตร์ แสงออโรร่า ประกายอัญมณี' },
  { id: 'scifi_art', nameTh: 'ภาพไซไฟ (Sci-Fi Art)', nameEn: 'Sci-Fi Art', emoji: '🚀', description: 'แสงไฟนีออน อุปกรณ์ล้ำยุค โฮโลแกรม' },
  { id: 'horror_art', nameTh: 'ภาพสยองขวัญ (Horror Art)', nameEn: 'Horror Art', emoji: '👻', description: 'เงามืดทมิฬ แสงสลัว เลือดและไอหมอกลี้ลับ' },
  { id: 'historical_art', nameTh: 'ภาพประวัติศาสตร์ (Historical Art)', nameEn: 'Historical Art', emoji: '🏛️', description: 'ภาพโบราณย้อนยุค สไตล์จิตรกรรมฝาผนังหรือภาพเขียนผ้าไหม' },
  { id: 'photography_style', nameTh: 'ภาพถ่าย (Photography Style)', nameEn: 'Photography Style', emoji: '📸', description: 'จัดวางองค์ประกอบแบบภาพถ่ายระดับมืออาชีพ' },
  { id: 'cinematic_anamorphic', nameTh: 'ภาพแนวภาพยนตร์ (Cinematic)', nameEn: 'Cinematic Anamorphic', emoji: '🎬', description: 'สัดส่วนจอกว้าง แสงระดับภาพยนตร์ฮอลลีวูด เลนส์ 35mm' },
  { id: 'pixel_art', nameTh: 'ภาพพิกเซล (Pixel Art)', nameEn: 'Pixel Art', emoji: '🧱', description: 'ศิลปะพิกเซลเรโทรสไตล์เกมยุค 90s' },
  { id: 'digital_art', nameTh: 'ภาพศิลปะดิจิทัล (Digital Art)', nameEn: 'Digital Art', emoji: '🧑🎨', description: 'ภาพวาดดิจิทัลเพนต์เฉดสีทันสมัย ไล่แสงเงาละเอียด' },
  { id: 'vector_art', nameTh: 'ภาพเวกเตอร์ (Vector Art)', nameEn: 'Vector Art', emoji: '📐', description: 'ลายเส้นกราฟิกแบนเรียบ สะอาดตา สไตล์โมเดิร์น' },
  { id: 'concept_art', nameTh: 'ภาพคอนเซ็ปต์อาร์ต (Concept Art)', nameEn: 'Concept Art', emoji: '📰', description: 'ภาพออกแบบเบื้องหลังงานสร้าง สตอรี่บอร์ดภาพยนตร์' },
  { id: 'mixed_media', nameTh: 'ภาพสไตล์ผสม (Mixed Media)', nameEn: 'Mixed Media', emoji: '🎨', description: 'ผสมผสาน 2D และ 3D อย่างลงตัว สไตล์ Arcane' },
];

// 4. หมวดหมู่หนัง (Movie Genres - 20 แนว)
export const MOVIE_GENRES: CategoryOption[] = [
  { id: 'action', nameTh: 'แอ็กชัน (Action)', nameEn: 'Action', emoji: '🎬', description: 'ฉากระเบิด ไล่ล่า การต่อสู้ประชิดตัว ดุเดือด' },
  { id: 'adventure', nameTh: 'ผจญภัย (Adventure)', nameEn: 'Adventure', emoji: '🗺️', description: 'สำรวจป่าดงดิบ เกาะลึกลับ สุสานโบราณ' },
  { id: 'comedy', nameTh: 'ตลก (Comedy)', nameEn: 'Comedy', emoji: '😂', description: 'มุกตลก สถานการณ์ชวนหัวเราะ คลายเครียด' },
  { id: 'romance', nameTh: 'โรแมนซ์ (Romance)', nameEn: 'Romance', emoji: '❤️', description: 'เรื่องราวความรัก โรแมนติก อบอุ่น ซาบซึ้ง' },
  { id: 'drama', nameTh: 'ดราม่า (Drama)', nameEn: 'Drama', emoji: '🎭', description: 'การปะทะอารมณ์ บทเรียนชีวิต เข้มข้นลึกซึ้ง' },
  { id: 'horror', nameTh: 'สยองขวัญ (Horror)', nameEn: 'Horror', emoji: '👻', description: 'บ้านผีสิง ฆาตกรต่อเนื่อง ลัทธิลี้ลับ' },
  { id: 'mystery', nameTh: 'ลึกลับ (Mystery)', nameEn: 'Mystery', emoji: '🔍', description: 'นักสืบ สืบสวนสอบสวน ไขปมปริศนาดำมืด' },
  { id: 'thriller', nameTh: 'ระทึกขวัญ (Thriller)', nameEn: 'Thriller', emoji: '😱', description: 'จิตวิทยาระทึกขวัญ ชิงไหวชิงพริบ ลุ้นทุกวินาที' },
  { id: 'scifi', nameTh: 'ไซไฟ (Science Fiction)', nameEn: 'Science Fiction', emoji: '🚀', description: 'ท่องอวกาศ ไทม์แมชชีน AI ครองโลก' },
  { id: 'fantasy', nameTh: 'แฟนตาซี (Fantasy)', nameEn: 'Fantasy', emoji: '🧙', description: 'สัตว์ในตำนาน สงครามเวทมนตร์ อัศวิน' },
  { id: 'crime', nameTh: 'อาชญากรรม (Crime)', nameEn: 'Crime', emoji: '🕵️', description: 'มาเฟีย แก๊งสเตอร์ การปล้น ยุทธการจับกุม' },
  { id: 'war', nameTh: 'สงคราม (War)', nameEn: 'War', emoji: '⚔️', description: 'สมรภูมิรบ รถถัง ขีปนาวุธ ความสูญเสียในสงคราม' },
  { id: 'historical', nameTh: 'ประวัติศาสตร์ (Historical)', nameEn: 'Historical', emoji: '🏛️', description: 'บุคคลสำคัญ วิกฤตการณ์ประวัติศาสตร์' },
  { id: 'western', nameTh: 'ตะวันตก (Western)', nameEn: 'Western', emoji: '🤠', description: 'คาวบอย ดวลปืน ยุคตื่นทอง แดนเถื่อน' },
  { id: 'musical', nameTh: 'ดนตรี / มิวสิคัล (Musical)', nameEn: 'Musical', emoji: '🎵', description: 'ขับร้องเพลงประกอบ เล่าเรื่องด้วยบทเพลง' },
  { id: 'slice_of_life', nameTh: 'ชีวิตจริง (Slice of Life)', nameEn: 'Slice of Life', emoji: '🧑🤝🧑', description: 'ชีวิตคนเมือง วัยรุ่น ครอบครัว ชีวิตธรรมดาที่มีความหมาย' },
  { id: 'documentary', nameTh: 'สารคดี (Documentary)', nameEn: 'Documentary', emoji: '🎞️', description: 'เจาะลึกความจริง ธรรมชาติ ประวัติศาสตร์ เทคโนโลยี' },
  { id: 'animation', nameTh: 'แอนิเมชัน (Animation Film)', nameEn: 'Animation', emoji: '🧸', description: 'ภาพยนตร์แอนิเมชันระดับโลก' },
  { id: 'superhero', nameTh: 'ซูเปอร์ฮีโร่ (Superhero)', nameEn: 'Superhero', emoji: '🦸', description: 'ผู้พิทักษ์สันติราษฎร์ พลังเหนือมนุษย์ กอบกู้โลก' },
  { id: 'psychological', nameTh: 'จิตวิทยา (Psychological)', nameEn: 'Psychological', emoji: '🧠', description: 'หลอนประสาท ปมในใจ จิตวิทยาซับซ้อน' },
];

// 5. หมวดหมู่ภาพหนัง (Movie Visual Styles - 15 สไตล์)
export const MOVIE_STYLES: CategoryOption[] = [
  { id: 'realistic', nameTh: 'ภาพสมจริง (Realistic)', nameEn: 'Realistic', emoji: '🎥', description: 'เสมือนคนจริง 100% ผิวหนังและแสงธรรมชาติ' },
  { id: 'cinematic', nameTh: 'ภาพยนตร์ (Cinematic)', nameEn: 'Cinematic', emoji: '🎬', description: 'จัดแสงแบบภาพยนตร์ฮอลลีวูด เลนส์ Anamorphic 35mm' },
  { id: 'dark', nameTh: 'ภาพดาร์ก (Dark)', nameEn: 'Dark & Gritty', emoji: '🌑', description: 'เงามืดลึก คอนทราสต์สูง ดิบเท่ ลึกลับ' },
  { id: 'vibrant', nameTh: 'ภาพสีสด (Vibrant)', nameEn: 'Vibrant Colors', emoji: '🌈', description: 'สีสันจัดจ้าน อิ่มตัว สดใส มีพลังดึงดูดสายตา' },
  { id: 'moody', nameTh: 'ภาพหม่น (Moody)', nameEn: 'Moody Atmosphere', emoji: '🌫️', description: 'โทนหมอกควัน สีหม่น อารมณ์เหงา ลึกซึ้ง' },
  { id: 'vintage_retro', nameTh: 'ภาพย้อนยุค (Vintage / Retro)', nameEn: 'Vintage Retro', emoji: '🕰️', description: 'เกรนฟิล์มคลาสสิก โทนสี 70s / 80s ย้อนกาลเวลา' },
  { id: 'historical_tone', nameTh: 'ภาพประวัติศาสตร์ (Historical)', nameEn: 'Historical Tone', emoji: '🏛️', description: 'โทนซีเปีย สีทองอบอุ่น สไตล์มหากาพย์ประวัติศาสตร์' },
  { id: 'scifi_neon', nameTh: 'ภาพไซไฟ (Sci-Fi)', nameEn: 'Sci-Fi Futuristic', emoji: '🚀', description: 'แสงนีออน ไซเบอร์ โครเมียม ไฮเทค' },
  { id: 'fantasy_glow', nameTh: 'ภาพแฟนตาซี (Fantasy)', nameEn: 'Fantasy Radiant', emoji: '🧙', description: 'แสงออร่าเรืองรอง ประกายเวทมนตร์ตระการตา' },
  { id: 'horror_chilling', nameTh: 'ภาพสยองขวัญ (Horror)', nameEn: 'Horror Chilling', emoji: '👻', description: 'แสงไฟฉาย แสงเขียวมรกต เงามืดน่าสะพรึงกลัว' },
  { id: 'action_dynamic', nameTh: 'ภาพแอ็กชัน (Action)', nameEn: 'Action Dynamic', emoji: '💥', description: 'ชัดลึกชัดตื้น สปีดชัตเตอร์เร็ว ประกายไฟระเบิด' },
  { id: 'romantic_soft', nameTh: 'ภาพโรแมนติก (Romantic)', nameEn: 'Romantic Soft Glow', emoji: '💕', description: 'แสงนุ่มนวล Golden Hour แฟลร์แสงแดดอุ่น' },
  { id: 'artistic', nameTh: 'ภาพศิลปะ (Artistic / Art Film)', nameEn: 'Artistic Art Film', emoji: '🎨', description: 'มุมมองศิลปะ จัดวางแปลกใหม่ ลึกซึ้ง' },
  { id: 'cgi_vfx', nameTh: 'ภาพ CGI / VFX', nameEn: 'CGI & VFX', emoji: '🖥️', description: 'คอมพิวเตอร์กราฟิกระดับบล็อกบัสเตอร์' },
  { id: 'documentary_raw', nameTh: 'ภาพสารคดี (Documentary Style)', nameEn: 'Documentary Style', emoji: '🌍', description: 'กล้องแฮนด์เฮลด์ดิบๆ บันทึกความจริง' },
];

// 6. แนวหลักวัฒนธรรมจีน 🇨🇳 (Chinese Xianxia / Wuxia Setting)
export const CHINESE_SETTING_SUBGENRES: CategoryOption[] = [
  { id: 'wuxia', nameTh: 'กำลังภายใน (武侠 / Wuxia)', nameEn: 'Wuxia', emoji: '⚔️', description: 'จอมยุทธ์ คุณธรรม คัมภีร์ยุทธ์ สำนักใหญ่' },
  { id: 'xianxia', nameTh: 'เซียน / บำเพ็ญเพียร (修仙 / Xianxia)', nameEn: 'Xianxia', emoji: '🏔️', description: 'ทะลวงชีพจร สุสานกระบี่ แดนเซียน เก้าชั้นฟ้า' },
  { id: 'xuanhuan', nameTh: 'แฟนตาซีจีน (玄幻 / Xuanhuan)', nameEn: 'Xuanhuan', emoji: '🔮', description: 'ผสมผสานพลังปราณและเวทมนตร์ตะวันตกมหากาพย์' },
  { id: 'mythology_cn', nameTh: 'เทพเซียน / ตำนาน (神话 / Mythology)', nameEn: 'Chinese Mythology', emoji: '🐉', description: 'ไซอิ๋ว นาจา ผานกู่ เง็กเซียนฮ่องเต้' },
  { id: 'jianghu', nameTh: 'ยุทธภพ (江湖 / Jianghu)', nameEn: 'Jianghu', emoji: '🍶', description: 'ชีวิตท่องยุทธภพ สุรา มิตรภาพ หนี้เลือด' },
  { id: 'martial_arts_cn', nameTh: 'จอมยุทธ์ (武术 / Martial Arts)', nameEn: 'Martial Arts', emoji: '🥋', description: 'เพลงหมัด เพลงดาบ กังฟูสายโบราณ' },
  { id: 'qi_cultivation', nameTh: 'ลมปราณ / พลังปราณ (气功 / Qi)', nameEn: 'Qi Cultivation', emoji: '⚡', description: 'ตันเถียน หลอมแก่นวิญญาณ ควบแน่นธาตุ' },
  { id: 'reincarnation_cn', nameTh: 'เกิดใหม่ / กลับชาติมาเกิด (转生)', nameEn: 'Reincarnation', emoji: '🔄', description: 'มหาเทพจุติใหม่ หรือคนปัจจุบันกลับชาติไปอดีต' },
  { id: 'isekai_cn', nameTh: 'ต่างโลกจีน (异世界 / Isekai)', nameEn: 'Chinese Isekai', emoji: '🌀', description: 'ข้ามภพไปสู่โลกแห่งการฝึกเซียน' },
  { id: 'system_game_cn', nameTh: 'ระบบ / เกม (系统 / System)', nameEn: 'System Cultivation', emoji: '📱', description: 'มีหน้าต่างระบบช่วยเหลือ ปลดล็อกแต้มอัปเกรด' },
  { id: 'time_travel_cn', nameTh: 'ย้อนเวลา / ย้อนอดีต (穿越)', nameEn: 'Time Travel', emoji: '⏳', description: 'ย้อนเวลาไปแก้ไขความผิดพลาดในอดีต' },
  { id: 'politics_war_cn', nameTh: 'สงคราม / การเมือง (战争 / Politics)', nameEn: 'Imperial Politics', emoji: '♟️', description: 'ชิงบัลลังก์ แผนซ้อนแผน กลศึกสามก๊ก' },
  { id: 'historical_cn', nameTh: 'ประวัติศาสตร์จีน (历史 / Historical)', nameEn: 'Historical China', emoji: '📜', description: 'ยุคราชวงศ์ฮั่น ถัง ซ่ง หมิง ชิง' },
  { id: 'imperial_court', nameTh: 'ราชวงศ์ / วังหลวง (宫廷 / Imperial)', nameEn: 'Imperial Court', emoji: '👑', description: 'ฮ่องเต้ องค์ชาย นางสนม ศึกในวังหลวง' },
  { id: 'divine_beasts', nameTh: 'อสูร / สัตว์เทพ (妖兽 / Beasts)', nameEn: 'Divine Beasts', emoji: '🦁', description: 'มังกร กิเลน หงส์เพลิง พยัคฆ์ขาว' },
  { id: 'demons_spirits_cn', nameTh: 'ปีศาจ / ภูตผี (妖魔 / Demons)', nameEn: 'Demons & Spirits', emoji: '🔥', description: 'เผ่ามาร จิ้งจอกเก้าหาง วิญญาณแค้น' },
  { id: 'eastern_fantasy', nameTh: 'แฟนตาซีตะวันออก (Eastern Fantasy)', nameEn: 'Eastern Fantasy', emoji: '✨', description: 'แดนสนธยา โลกแฟนตาซีกลิ่นอายเอเชีย' },
  { id: 'scifi_future_cn', nameTh: 'ไซไฟจีน / อนาคต (科幻 / Sci-Fi)', nameEn: 'Chinese Sci-Fi', emoji: '🛸', description: 'เทคโนโลยีพลังปราณ ยานเหาะกลไกโบราณ' },
  { id: 'adventure_cn', nameTh: 'ผจญภัยแดนเซียน (冒险 / Adventure)', nameEn: 'Cultivation Adventure', emoji: '🧭', description: 'สำรวจถ้ำลับ โบราณสถาน ข้ามมิติดวงดาว' },
  { id: 'romance_cn', nameTh: 'โรแมนซ์เซียน / ความรัก (爱情)', nameEn: 'Immortal Romance', emoji: '💖', description: 'รักแท้ข้ามภพ พันปีมิเสื่อมคลาย' },
];

// 7. แนวหลักวัฒนธรรมญี่ปุ่น 🇯🇵 (Japanese Anime / Shonen Setting)
export const JAPANESE_SETTING_SUBGENRES: CategoryOption[] = [
  { id: 'manga_recap_anime', nameTh: 'มังงะรีแคปพากย์ไทย (Manga Realms MRE / วันสิ้นโลกบนรถบัส)', nameEn: 'Manga Recap Anime Dub', emoji: '🚌', description: 'มังงะรีแคปอนิเมะพากย์ไทย ชายคนเดียวบนรถบัส ซอมบี้วันสิ้นโลก ซีนต่อเนื่อง 2+ ชั่วโมง' },
  { id: 'fantasy_jp', nameTh: 'แฟนตาซี (Fantasy)', nameEn: 'Japanese Fantasy', emoji: '🧙', description: 'กิลด์นักผจญภัย ดันเจี้ยน จอมมารและผู้กล้า' },
  { id: 'isekai_jp', nameTh: 'ต่างโลก (Isekai)', nameEn: 'Isekai', emoji: '🌀', description: 'โดนรถบรรทุกชนแล้วไปเกิดใหม่พร้อมพลังโกง' },
  { id: 'adventure_jp', nameTh: 'ผจญภัย (Adventure)', nameEn: 'Adventure', emoji: '🗺️', description: 'ออกเรือสำรวจสมบัติ โลกกว้างขวาง' },
  { id: 'action_combat_jp', nameTh: 'แอ็กชัน / ต่อสู้ (Action)', nameEn: 'Action Combat', emoji: '⚔️', description: 'การต่อสู้ปล่อยพลังสุดอลังการ มิตรภาพและความฝัน' },
  { id: 'martial_arts_jp', nameTh: 'ศิลปะการต่อสู้ (Martial Arts)', nameEn: 'Martial Arts', emoji: '🥋', description: 'คาราเต้ ยูโด เคนโด้ ไอกิโด' },
  { id: 'superpower_jp', nameTh: 'พลังพิเศษ (Superpower)', nameEn: 'Superpower', emoji: '⚡', description: 'อัตลักษณ์ พลังเหนือธรรมชาติ โรงเรียนฮีโร่' },
  { id: 'magic_jp', nameTh: 'เวทมนตร์ (Magic)', nameEn: 'Magic Academy', emoji: '🪄', description: 'โรงเรียนสอนเวทมนตร์ วงเวท คาถาธาตุ' },
  { id: 'supernatural_jp', nameTh: 'เหนือธรรมชาติ (Supernatural)', nameEn: 'Supernatural', emoji: '🔮', description: 'หมอผี ยมทูต พลังลึกลับในเงามืด' },
  { id: 'demons_spirits_jp', nameTh: 'ปีศาจ / โยไค (Demons / Yokai)', nameEn: 'Yokai & Spirits', emoji: '👺', description: 'ภูตผีญี่ปุ่น โอนิ จิ้งจอกเก้าหาง องเมียวจิ' },
  { id: 'mythology_jp', nameTh: 'เทพเจ้า / ตำนาน (Mythology)', nameEn: 'Japanese Mythology', emoji: '⛩️', description: 'ศาลเจ้า ชินโต เทพอมาเทราสึ สุซาโนโอะ' },
  { id: 'samurai_ninja', nameTh: 'ซามูไร / นินจา (Samurai / Ninja)', nameEn: 'Samurai & Ninja', emoji: '🗡️', description: 'คาตานะ วิถีบูชิโด คาถานินจา ดาวกระจาย' },
  { id: 'historical_jp', nameTh: 'ประวัติศาสตร์ (Historical)', nameEn: 'Historical Sengoku', emoji: '🏯', description: 'ยุคเซ็นโกคุ เอโดะ บาคุมัตสึ โนบุนางะ' },
  { id: 'war_military_jp', nameTh: 'สงคราม / การทหาร (War / Military)', nameEn: 'War & Military', emoji: '🎖️', description: 'ยุทธวิธีทางทหาร กองทัพเรือ อาวุธสงคราม' },
  { id: 'scifi_jp', nameTh: 'ไซไฟ (Sci-Fi)', nameEn: 'Sci-Fi Cyber', emoji: '🚀', description: 'โลกไซเบอร์เนติก ปัญญาประดิษฐ์' },
  { id: 'mecha_jp', nameTh: 'หุ่นยนต์ / เมชา (Mecha)', nameEn: 'Mecha Robot', emoji: '🤖', description: 'กันดั้ม หุ่นรบยักษ์ นักบินจักรกล' },
  { id: 'post_apocalyptic_jp', nameTh: 'โลกหลังหายนะ (Post-Apocalyptic)', nameEn: 'Post-Apocalyptic', emoji: '☢️', description: 'มนุษยชาติตกต่ำหลังสงครามนิวเคลียร์ ไวรัส' },
  { id: 'horror_jp', nameTh: 'สยองขวัญ (Horror)', nameEn: 'J-Horror', emoji: '👻', description: 'คำสาป ภาพยนตร์สยองขวัญสไตล์ญี่ปุ่น' },
  { id: 'mystery_detective', nameTh: 'ลึกลับ / สืบสวน (Mystery / Detective)', nameEn: 'Detective Mystery', emoji: '🔍', description: 'นักสืบยอดอัจฉริยะ ไขคดีในห้องปิดตาย' },
  { id: 'survival_jp', nameTh: 'เอาชีวิตรอด (Survival)', nameEn: 'Survival Game', emoji: '⛺', description: 'เดธเกม เอาชีวิตรอดบนเกาะร้างหรือสมรภูมิ' },
  { id: 'time_travel_jp', nameTh: 'ย้อนเวลา / ข้ามเวลา (Time Travel)', nameEn: 'Time Travel Loop', emoji: '⏳', description: 'การวนลูปเวลา ย้อนกลับไปช่วยคนที่รัก' },
  { id: 'school_jp', nameTh: 'โรงเรียน (School)', nameEn: 'School Life', emoji: '🏫', description: 'ชีวิตมัธยมปลาย สภานักเรียน เทศกาลโรงเรียน' },
  { id: 'slice_of_life_jp', nameTh: 'ชีวิตประจำวัน (Slice of Life)', nameEn: 'Slice of Life', emoji: '🍵', description: 'ตั้งแคมป์ ชีวิตชนบท ชิลๆ ผ่อนคลาย' },
  { id: 'romance_jp', nameTh: 'โรแมนซ์ / ความรัก (Romance)', nameEn: 'Anime Romance', emoji: '🌸', description: 'รักแรกในรั้วโรงเรียน สารภาพรักใต้ต้นซากุระ' },
  { id: 'comedy_jp', nameTh: 'คอมเมดี้ / ตลก (Comedy)', nameEn: 'Anime Comedy', emoji: '😂', description: 'ตลกรั่ว มุกโบเกะ-ทสึคโคมิ สุดฮา' },
  { id: 'drama_jp', nameTh: 'ดราม่า (Drama)', nameEn: 'Anime Drama', emoji: '🎭', description: 'เรียกน้ำตา ความเจ็บปวดของการเติบโต' },
  { id: 'sports_jp', nameTh: 'กีฬา (Sports)', nameEn: 'Sports Anime', emoji: '🏀', description: 'มุ่งสู่ระดับอินเตอร์ไฮ ทีมเวิร์ก มิตรภาพ' },
  { id: 'music_idol_jp', nameTh: 'ดนตรี / ไอดอล (Music / Idol)', nameEn: 'Music & Idol', emoji: '🎤', description: 'วงดนตรีร็อก ไอดอลส่องประกายบนเวที' },
  { id: 'cooking_jp', nameTh: 'อาหาร / ทำอาหาร (Cooking / Gourmet)', nameEn: 'Cooking Gourmet', emoji: '🍜', description: 'ทำอาหาร เสิร์ฟความอร่อย รีแอ็กชันระเบิดพลัง' },
  { id: 'game_competition_jp', nameTh: 'เกม / การแข่งขัน (Game)', nameEn: 'Game Competition', emoji: '🎮', description: 'อีสปอร์ต หมากล้อม การ์ดเกม' },
  { id: 'psychological_jp', nameTh: 'จิตวิทยา (Psychological)', nameEn: 'Psychological Thriller', emoji: '🧠', description: 'หักเหลี่ยม สงครามประสาท เดธโน้ต' },
];

// 8. แนวหลักวัฒนธรรมไทย 🇹🇭 (Thai Folklore / Mythical Setting)
export const THAI_SETTING_SUBGENRES: CategoryOption[] = [
  { id: 'thai_folklore', nameTh: 'ตำนานไทย / นิทานพื้นบ้าน', nameEn: 'Thai Folklore', emoji: '📜', description: 'ขุนช้างขุนแผน ไกรทอง พระอภัยมณี สังข์ทอง' },
  { id: 'thai_deities', nameTh: 'เทพเจ้า / เทวดา', nameEn: 'Thai Deities', emoji: '✨', description: 'พระอินทร์ พระพิฆเนศ พระพรหม แดนสวรรค์' },
  { id: 'naga', nameTh: 'พญานาค / นาคราช', nameEn: 'Naga Serpents', emoji: '🐉', description: 'เมืองบาดาล วังนาคราช ลุ่มน้ำโขง บั้งไฟพญานาค' },
  { id: 'garuda', nameTh: 'ครุฑ / สัตว์เทพหิมพานต์', nameEn: 'Garuda & Himmapan', emoji: '🦅', description: 'พญาครุฑ นรสิงห์ มักกะลีผล ป่าหิมพานต์' },
  { id: 'yaksha_asura', nameTh: 'ยักษ์ / อสูร', nameEn: 'Yaksha & Asura', emoji: '👹', description: 'ทศกัณฐ์ ท้าวเวสสุวรรณ ยักษ์ทวารบาล วัดพระแก้ว' },
  { id: 'ghosts_spirits_th', nameTh: 'ผี / วิญญาณ / สิ่งลี้ลับ', nameEn: 'Thai Ghosts', emoji: '👻', description: 'แม่นาค ปอบ กระสือ นางตานี นางตะเคียน เปรต' },
  { id: 'occult_black_magic', nameTh: 'ไสยศาสตร์ / คุณไสย', nameEn: 'Occult & Black Magic', emoji: '🕯️', description: 'กุมารทอง ควายธนู น้ำมันพราย ยันต์อักขระ' },
  { id: 'incantations_sorcery', nameTh: 'มนต์คาถา / เวทมนตร์ไทย', nameEn: 'Thai Sorcery', emoji: '🔮', description: 'คงกระพันชาตรี คาถามหาอุตม์ เมตตามหานิยม' },
  { id: 'muay_thai', nameTh: 'มวยไทย / ศิลปะการต่อสู้', nameEn: 'Muay Thai Combat', emoji: '🥊', description: 'แม่ไม้มวยไทย มวยโบราณ เตะศอกทรงพลัง' },
  { id: 'ancient_warriors_th', nameTh: 'นักรบ / อาณาจักรโบราณ', nameEn: 'Ancient Thai Warriors', emoji: '🗡️', description: 'บางระจัน ทหารเอก ดาบคู่ศึกช้าง' },
  { id: 'historical_th', nameTh: 'ประวัติศาสตร์ไทย', nameEn: 'Historical Thailand', emoji: '🏛️', description: 'สุโขทัย อยุธยา ธนบุรี รัตนโกสินทร์' },
  { id: 'royal_palace_th', nameTh: 'ราชสำนัก / วังหลวง', nameEn: 'Thai Royal Court', emoji: '👑', description: 'เรื่องราวในรั้ววัง เจ้าจอม ขุนนาง การเมืองโบราณ' },
  { id: 'war_battle_th', nameTh: 'สงคราม / การศึกโบราณ', nameEn: 'Ancient Wars', emoji: '⚔️', description: 'ยุทธหัตถี ตีเมือง ขบวนพยุหยาตรา' },
  { id: 'fantasy_th', nameTh: 'แฟนตาซีไทย (Thai Fantasy)', nameEn: 'Thai Fantasy', emoji: '🪷', description: 'หิมพานต์ไซไฟ ดินแดนลี้ลับเหนือจินตนาการ' },
  { id: 'wuxia_th', nameTh: 'กำลังภายในไทย / จอมยุทธ์ไทย', nameEn: 'Thai Martial Wuxia', emoji: '⚡', description: 'วิชาลมปราณไทย วิชาตัดกระแสเหล็กไหล' },
  { id: 'isekai_th', nameTh: 'ต่างโลกไทย (Thai Isekai)', nameEn: 'Thai Isekai', emoji: '🌀', description: 'คนยุคปัจจุบันหลุดไปดินแดนหิมพานต์หรือเมืองบาดาล' },
  { id: 'time_travel_th', nameTh: 'ย้อนเวลา / ข้ามยุค (บุพเพ)', nameEn: 'Time Travel Siam', emoji: '⏳', description: 'ข้ามเวลาไปกรุงศรีอยุธยา หรือยุคโบราณ' },
  { id: 'adventure_th', nameTh: 'ผจญภัยป่าลี้ลับ', nameEn: 'Mystic Jungle Adventure', emoji: '🧭', description: 'บุกป่าดงพญาเย็น ค้นหาสมบัติเมืองลับแล' },
  { id: 'action_combat_th', nameTh: 'แอ็กชันต่อสู้สไตล์ไทย', nameEn: 'Thai Action Strike', emoji: '💥', description: 'แอ็กชันสายบู๊ดิบหนักแน่น สไตล์องค์บาก' },
  { id: 'scifi_future_th', nameTh: 'ไซไฟไทย / อนาคต', nameEn: 'Thai Sci-Fi Cyberpunk', emoji: '🚀', description: 'กรุงเทพฯ ยุคไซเบอร์พังก์ ยานลอยฟ้าเหนือแม่น้ำเจ้าพระยา' },
  { id: 'post_apocalyptic_th', nameTh: 'โลกหลังหายนะสยาม', nameEn: 'Post-Apocalyptic Siam', emoji: '☢️', description: 'ซากเมืองโบราณหลังน้ำท่วมโลก สัตว์กลายพันธุ์' },
  { id: 'mystery_th', nameTh: 'สืบสวน / ลึกลับไทย', nameEn: 'Thai Mystery', emoji: '🔍', description: 'ไขคดีฆาตกรรมโบราณ หรือความลับตระกูลดัง' },
  { id: 'horror_chilling_th', nameTh: 'สยองขวัญขนหัวลุก', nameEn: 'Chilling Thai Horror', emoji: '👻', description: 'เรื่องเล่าเดอะช็อก สยองขวัญในหอพัก ป่าช้า' },
  { id: 'survival_jungle_th', nameTh: 'เอาชีวิตรอดในป่าดงดิบ', nameEn: 'Jungle Survival', emoji: '⛺', description: 'รอดชีวิตจากสมิงพราย ไข้ป่า สัตว์ร้าย' },
  { id: 'school_th', nameTh: 'โรงเรียนไทย / วัยรุ่น', nameEn: 'Thai High School', emoji: '🏫', description: 'ชีวิตเด็กมัธยมไทย ชุดนักเรียน ความผูกพัน' },
  { id: 'slice_of_life_th', nameTh: 'ชีวิตประจำวันไทย', nameEn: 'Thai Slice of Life', emoji: '🛶', description: 'ชีวิตริมคลอง ตลาดน้ำ วัฒนธรรมพื้นถิ่นอบอุ่น' },
  { id: 'romance_th', nameTh: 'โรแมนซ์ไทย / ความรัก', nameEn: 'Thai Romance', emoji: '💖', description: 'รักต่างชนชั้น ความรักข้ามภพชาติ' },
  { id: 'comedy_th', nameTh: 'คอมเมดี้ / ตลกไทย', nameEn: 'Thai Comedy', emoji: '😂', description: 'มุกฮาภาษาไทย ตลกคาเฟ่ สถานการณ์ชวนหัวเราะ' },
  { id: 'drama_th', nameTh: 'ดราม่าเข้มข้น', nameEn: 'Thai Intense Drama', emoji: '🎭', description: 'ความขัดแย้งในครอบครัว สังคม ความอยุติธรรม' },
  { id: 'sports_th', nameTh: 'กีฬาไทย', nameEn: 'Thai Sports', emoji: '⚽', description: 'เซปักตะกร้อ มวยไทย เรือพาย ประเพณีแข่งเรือ' },
];

// Helper to get subgenres based on World Culture
export function getSubgenresByCulture(culture: WorldCulture): CategoryOption[] {
  switch (culture) {
    case 'chinese':
      return CHINESE_SETTING_SUBGENRES;
    case 'japanese':
      return JAPANESE_SETTING_SUBGENRES;
    case 'thai':
      return THAI_SETTING_SUBGENRES;
    case 'western_global':
    default:
      return MOVIE_GENRES;
  }
}

// 9. ระบบเสียง 7 มิติ (Audio Dimensions Guide)
export const AUDIO_DIMENSIONS_GUIDE = [
  { id: 'voiceover', nameTh: 'เสียงพากย์บรรยาย (Voiceover)', desc: 'บทพากย์หลักสำหรับเล่าเรื่อง ดำเนินเนื้อเรื่อง' },
  { id: 'voiceTone', nameTh: 'น้ำเสียงผู้พากย์ (Tone)', desc: 'ทุ้ม นิ่ง สุขุม ดุดัน สดใส กังวาน แหบพร่า' },
  { id: 'emotion', nameTh: 'อารมณ์น้ำเสียง (Emotion)', desc: 'โกรธเกรี้ยว เยือกเย็น หวาดผวา เปี่ยมหวัง กระซิบ' },
  { id: 'sfx', nameTh: 'Sound Effects (SFX / Foley)', desc: 'เสียงกระบี่ฟาดฟัน โซ่ขาด ปืนลั่น ระเบิด วิ่งลุยน้ำ' },
  { id: 'ambient', nameTh: 'เสียงบรรยากาศ (Ambient)', desc: 'เสียงลมหวีดหวิวบนยอดผา หยดน้ำในถ้ำ ฝนตก ฟ้าร้อง' },
  { id: 'bgm', nameTh: 'ดนตรีประกอบ (Score / BGM)', desc: 'กู่เจิ้งระทึกขวัญ กลองศึก ออร์เคสตรา ซินธ์เวฟ' },
  { id: 'opEdTheme', nameTh: 'เพลงเปิด/ปิด (Theme)', desc: 'เมโลดี้เปิดเรื่องตรึงใจ และเพลงปิดซาบซึ้งประทับใจ' },
];

// 10. ตัวละคร 11 มิติ (Character 11 Dimensions Guide)
export const CHARACTER_11_DIMENSIONS = [
  { key: 'bodyBuild', labelTh: '1. รูปร่าง (Body Build)', placeholder: 'กำยำ สง่างาม ปราดเปรียว สูงโปร่ง ผอมแห้ง' },
  { key: 'facialFeatures', labelTh: '2. ใบหน้า (Facial Features)', placeholder: 'ใบหน้าคมเข้ม แววตาสีอำพัน มีรอยแผลเป็นเหนือคิ้วซ้าย' },
  { key: 'hairStyle', labelTh: '3. ทรงผม (Hair Style)', placeholder: 'ผมยาวสีขาวเงินเกล้ามวยด้วยปิ่นหยกขาว / ซอยสั้นสีดำ' },
  { key: 'clothingStyle', labelTh: '4. เสื้อผ้า (Clothing)', placeholder: 'ชุดคลุมเต๋าผ้าไหมสีดำปักดิ้นทอง / เกราะหนามทมิฬ' },
  { key: 'colorTheme', labelTh: '5. สีประจำตัว (Color Theme)', placeholder: 'ดำ-ทอง, คราม-เงิน, แดงเพลิง, ขาวบริสุทธิ์' },
  { key: 'weaponsOrProps', labelTh: '6. อาวุธ/ไอเทม (Weapons/Props)', placeholder: 'กระบี่ครามโบราณ, คันศรเวท, ปืนไรเฟิล, ยันต์แปดทิศ' },
  { key: 'personality', labelTh: '7. บุคลิกภาพ (Personality)', placeholder: 'เยือกเย็น สุขุม มุ่งมั่นเด็ดเดี่ยว ไม่ยอมแพ้ต่อโชคชะตา' },
  { key: 'age', labelTh: '8. อายุ (Age)', placeholder: '19 ปี / พันปี (วิญญาณบรรพกาล) / 35 ปี' },
  { key: 'abilities', labelTh: '9. ความสามารถพิเศษ (Abilities)', placeholder: 'เก้ากระบี่สวรรค์, หมัดมวยไทยตัดเหล็กไหล, อ่านใจ' },
  { key: 'weaknesses', labelTh: '10. จุดอ่อน (Weaknesses)', placeholder: 'จุดชีพจรเคยแตกร้าว, เป็นห่วงมารดา, แพ้พิษธาตุไฟ' },
  { key: 'relationships', labelTh: '11. ความสัมพันธ์ (Relationships)', placeholder: 'ศัตรูคู่อาฆาตของจ้าวอสูรโลหิต, ศิษย์เอกของผู้อาวุโสไป๋' },
];

// 11. ข้อมูลโลก 9 มิติ (World Building 9 Dimensions Guide)
export const WORLD_9_DIMENSIONS = [
  { key: 'era', labelTh: '1. ยุคสมัย (Era)', placeholder: 'ยุคบรรพกาลหมื่นปี / รัตนโกสินทร์ตอนต้น / อนาคตปี 2099' },
  { key: 'kingdom', labelTh: '2. ประเทศ / อาณาจักร (Kingdom)', placeholder: 'แดนเสวียนหยวน / อาณาจักรอยุธยา / สหพันธ์ดวงดาว' },
  { key: 'city', labelTh: '3. เมือง / สถานที่สำคัญ (City / Location)', placeholder: 'ยอดเขาหมอกสวรรค์ / ลานประลองตระกูลใหญ่ / วิหารลับ' },
  { key: 'terrain', labelTh: '4. ภูมิประเทศ (Terrain)', placeholder: 'เทือกเขาสูงเสียดฟ้าล้อมรอบด้วยทะเลหมอก / ป่าหิมพานต์' },
  { key: 'culture', labelTh: '5. วัฒนธรรม (Culture)', placeholder: 'กฎแห่งผู้แข็งแกร่งเท่านั้นคือกฎเกณฑ์ / คารวะสำนักอาจารย์' },
  { key: 'species', labelTh: '6. เผ่าพันธุ์ (Species)', placeholder: 'มนุษย์ผู้ฝึกเซียน, เผ่ามารโลหิต, สัตว์เทพวิญญาณ' },
  { key: 'creatures', labelTh: '7. สัตว์อสูร (Creatures / Monsters)', placeholder: 'พญามังกรฟ้าเก้าวิญญาณ, อสูรหมื่นพิษ, พญานาคราช' },
  { key: 'worldRules', labelTh: '8. กฎของโลก (World Rules)', placeholder: 'ผู้ทำลายชีพจรไม่สามารถฝึกยุทธ์ได้ ยกเว้นจะค้นพบกระบี่โบราณ' },
  { key: 'powerSystem', labelTh: '9. ระบบพลัง (Power System)', placeholder: 'ลมปราณ 9 ขั้น: ก่อเกิด, หลอมรวม, แก่นแท้, เซียนสวรรค์' },
];

// 12. โครงเรื่อง 8 มิติ (Story Architecture 8 Dimensions Guide)
export const STORY_8_DIMENSIONS = [
  { key: 'concept', labelTh: '1. คอนเซปต์ (Logline / Core Concept)', placeholder: 'ชายหนุ่มผู้ถูกหักหลังและแย่งชิงกระดูกเซียน กลับมาทวงแค้น' },
  { key: 'coreTheme', labelTh: '2. ธีมหลัก (Core Theme)', placeholder: 'การต่อสู้ท้าทายโชคชะตา และการพิสูจน์คุณธรรมเหนืออำนาจ' },
  { key: 'plotSummary', labelTh: '3. โครงเรื่องย่อ (Plot Summary)', placeholder: 'จากคนไร้ค่า สู่การพบกระบี่โบราณ ทะลวงชีพจร และกลับมาเอาคืน' },
  { key: 'keyScenes', labelTh: '4. ฉากสำคัญ (Key Plot Beats)', placeholder: 'การตกหน้าผา, การหลอมกระบี่, การบุกงานประลอง' },
  { key: 'plotTwists', labelTh: '5. จุดหักเห (Plot Twist)', placeholder: 'แท้จริงแล้วศัตรูคือพี่ชายต่างมารดาที่ถูกควบคุมจิต' },
  { key: 'climax', labelTh: '6. ไคลแมกซ์ (Climax)', placeholder: 'การปะทะเดือดครั้งสุดท้าย ณ ลานประลองเก้าสุริยัน' },
  { key: 'ending', labelTh: '7. ตอนจบ (Resolution)', placeholder: 'ล้างแค้นสำเร็จ และเปิดประตูสู่แดนเซียนระดับที่สูงกว่า' },
];
