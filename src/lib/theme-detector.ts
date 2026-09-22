import { MovieGenre, WorldCulture, CharacterBible } from './types';

export type StoryThemeKey =
  | 'horror_krasue'
  | 'horror_takhian'
  | 'horror_thai'
  | 'myth_naga'
  | 'myth_thai'
  | 'pirate_anime'
  | 'tower_hunter'
  | 'cultivation_xianxia'
  | 'military'
  | 'scifi'
  | 'western_cinema'
  | 'general_fantasy';

export interface StoryThemeAnalysis {
  themeKey: StoryThemeKey;
  effectiveGenre: MovieGenre;
  effectiveCulture: WorldCulture;
  effectiveSubGenre: string;
  themeNameTh: string;
  themeEmoji: string;
  isHorrorOrGhost: boolean;
  isSpecificKrasue: boolean;
  isSpecificTakhian: boolean;
  isSpecificPop: boolean;
  isThaiMyth: boolean;
  isSpecificNaga: boolean;
  isPirateOrAdventure: boolean;
  isTowerOrDungeon: boolean;
  isCultivation: boolean;
  isMilitary: boolean;
  isSciFi: boolean;
  isAnimeOrJapan: boolean;
  isWesternCinema: boolean;
  recommendedCastStructure: string[];
}

/**
 * วิเคราะห์แก่นเรื่องและธีมหลักจาก ชื่อเรื่อง, เรื่องย่อ, วัฒนธรรมโลก และหมวดหมู่
 * ปลอดภัย 100% ไม่มีการใช้ /ai/ หรือ /หุ่น/ แบบ Unbounded Regex ที่ทำให้หลุดไปไซไฟ
 */
export function analyzeStoryTheme(params: {
  title?: string;
  synopsis?: string;
  genre?: string;
  subGenre?: string;
  worldCulture?: string;
}): StoryThemeAnalysis {
  const {
    title = '',
    synopsis = '',
    genre = '',
    subGenre = '',
    worldCulture = '',
  } = params;

  const context = `${title} ${synopsis} ${genre} ${subGenre} ${worldCulture}`.toLowerCase();

  // 1. ตรวจจับผีไทยเฉพาะเจาะจง (Specific Thai Ghost Folklore)
  const isSpecificKrasue = /กระสือ|ถอดหัว|ไส้เรืองแสง|ดวงไฟกระสือ/i.test(context);
  const isSpecificTakhian = /ตะเคียน|แม่ตะเคียน|นางไม้|ต้นตะเคียน|เจ้าแม่ตะเคียน/i.test(context);
  const isSpecificPop = /ปอบ|ผีปอบ|กินตับ|หยิบตับ/i.test(context);

  const isHorrorOrGhost =
    isSpecificKrasue ||
    isSpecificTakhian ||
    isSpecificPop ||
    /ผี|อาถรรพ์|วิญญาณ|สยอง|หลอน|เจ้าแม่|ตานี|คุณไสย|หมอผี|มนต์ดำ|ศาลเพียงตา|คำสาป|ชวนหัวลุก|นางพราย|ป่าช้า|เรือนไทย|แม่นาค|หุ่นพยนต์|เหี้ยน|ผวา|ลี้ลับ|สัมภเวสี|เปรต|กุมาร|ตายโหง|วิญญาณแค้น|haunted|ghost|horror|spooky|creepy|demon|takhian|chilling|paranormal|supernatural/i.test(
      context
    ) ||
    genre === 'horror_thriller' ||
    genre === 'mystery_noir' ||
    subGenre === 'ghosts_spirits_th' ||
    subGenre === 'horror_chilling_th' ||
    subGenre === 'occult_black_magic' ||
    subGenre === 'horror_jp';

  // 2. ตรวจจับตำนานไทย / พญานาค / หิมพานต์ (Thai Myth & Folklore)
  const isSpecificNaga = /นาค|พญานาค|นาคราช|วังบาดาล|บาดาล|บั้งไฟ|มณีนาคราช|แม่น้ำโขง|naga/i.test(context);
  const isThaiMyth =
    !isHorrorOrGhost &&
    (isSpecificNaga ||
      /หิมพานต์|ครุฑ|ยักษ์|ท้าวเวส|กุมารทอง|ขุนแผน|อยุธยา|ไกรทอง|บางระจัน|สยาม|มวยไทย|สุวรรณภูมิ|บุญบั้งไฟ|garuda|himmapan/i.test(
        context
      ) ||
      subGenre === 'naga' ||
      subGenre === 'thai_folklore' ||
      subGenre === 'garuda');

  // 3. ตรวจจับแนวผจญภัยโจรสลัด / วันพีช (Pirate Adventure)
  // หมายเหตุ: ต้องระวังคำว่า "เรือ" หรือ "เกาะ" ไม่ให้ไปจับคำว่า "เรือนไทย" หรือ "เกาะกลุ่ม"
  const isPirateOrAdventure =
    !isHorrorOrGhost &&
    !isThaiMyth &&
    (/วันพีช|วันพีซ|one piece|โจรสลัด|ล่าสมบัติ|ทะเลหลวง|เรือโจรสลัด|ลูฟี่|หมวกฟาง|ฮาคิ|ผลปีศาจ|pirate|sailing|treasure/i.test(
      context
    ) ||
      subGenre === 'adventure_jp');

  // 4. ตรวจจับหอคอย / ดันเจี้ยน / ฮันเตอร์ (Tower Hunter)
  const isTowerOrDungeon =
    !isHorrorOrGhost &&
    !isThaiMyth &&
    !isPirateOrAdventure &&
    /หอคอย|ดันเจี้ยน|ฮันเตอร์|hunter|ชั้นที่\s*\d+|tower|dungeon|floor|gate|solo leveling|คุปเวล่า|มอนสเตอร์เกท/i.test(
      context
    );

  // 5. ตรวจจับเซียนจีน 3D / กำลังภายใน (Chinese Xianxia Cultivation)
  const isCultivation =
    !isHorrorOrGhost &&
    !isThaiMyth &&
    !isPirateOrAdventure &&
    !isTowerOrDungeon &&
    (/เซียน|กำลังภายใน|ลมปราณ|ตบะ|กระบี่บิน|เสวียนหยวน|สำนัก|เต๋า|มหายาน|บำเพ็ญเพียร|จอมยุทธ์|ยุทธภพ|ตานเถียน|พลังยุทธ์|xianxia|cultivation|wuxia/i.test(
      context
    ) ||
      genre === 'xianxia_cultivation' ||
      subGenre === 'xianxia');

  // 6. ตรวจจับทหาร / ยุทธการสงคราม (Military Tactical)
  const isMilitary =
    !isHorrorOrGhost &&
    !isThaiMyth &&
    !isCultivation &&
    (/ทหาร|ยุทธการ|ขีปนาวุธ|หน่วยรบ|รบพิเศษ|ดาวเทียม|กองทัพ|สงคราม|อาวุธสงคราม|สไนเปอร์|หน่วยซีล|ยุทโธปกรณ์|military|tactical|navy seal/i.test(
      context
    ) ||
      genre === 'military_tactical' ||
      subGenre === 'war_military_jp' ||
      subGenre === 'war_battle_th');

  // 7. ตรวจจับไซไฟ / หุ่นยนต์ (Sci-Fi & Cyberpunk)
  // ปลอดภัย: ไม่ใช้ /ai/ แบบไม่มีขอบเขต และไม่ใช้ /หุ่น/ เฉยๆ ป้องกันการชนกับ "thai", "takhian", "หุ่นพยนต์"
  const isSciFi =
    !isHorrorOrGhost &&
    !isThaiMyth &&
    !isCultivation &&
    !isPirateOrAdventure &&
    (/(?:^|\W)ai(?:$|\W)|ไซไฟ|หุ่นยนต์|ไซเบอร์|ไซเบอร์เนติก|ยานอวกาศ|ห้วงอวกาศ|จักรวาล|เมนเฟรม|ไฟร์วอลล์|แฮกเกอร์|ปัญญาประดิษฐ์|แอนดรอยด์|scifi|sci-fi|cyberpunk|robot|android|spaceships?|hyperdrive/i.test(
      context
    ) ||
      genre === 'action_scifi' ||
      subGenre === 'scifi_jp' ||
      subGenre === 'scifi_future_cn' ||
      subGenre === 'scifi_future_th');

  // 8. ตรวจจับอนิเมะญี่ปุ่น (Japanese Anime)
  const isAnimeOrJapan =
    !isHorrorOrGhost &&
    !isThaiMyth &&
    !isCultivation &&
    !isSciFi &&
    (worldCulture === 'japanese' ||
      /(?:^|\W)anime(?:$|\W)|อนิเมะ|ญี่ปุ่น|ซามูไร|นินจา|ต่างโลก|มังงะ|isekai|shonen|manga/i.test(
        context
      ));

  // 9. ตรวจจับฮอลลีวูด / สืบสวนสากล (Hollywood Western Cinema)
  const isWesternCinema =
    !isHorrorOrGhost &&
    !isThaiMyth &&
    !isCultivation &&
    !isAnimeOrJapan &&
    (worldCulture === 'western_global' ||
      /(?:^|\W)hollywood(?:$|\W)|ฮอลลีวูด|ภาพยนตร์สากล|นักสืบ|มาเฟีย|แก๊งสเตอร์|detective|cinema|noir|crime|fbi|cia/i.test(
        context
      ) ||
      genre === 'mystery_noir');

  // กำหนด Theme Key และรายละเอียด
  let themeKey: StoryThemeKey = 'general_fantasy';
  let effectiveGenre: MovieGenre = 'epic_fantasy';
  let effectiveCulture: WorldCulture = 'chinese';
  let effectiveSubGenre = subGenre || 'xianxia';
  let themeNameTh = 'แฟนตาซีทั่วไป';
  let themeEmoji = '✨';
  let recommendedCastStructure: string[] = [];

  if (isSpecificKrasue) {
    themeKey = 'horror_krasue';
    effectiveGenre = 'horror_thriller';
    effectiveCulture = 'thai';
    effectiveSubGenre = 'ghosts_spirits_th';
    themeNameTh = 'ตำนานผีกระสือ & อาถรรพ์วิญญาณหลอนไทย';
    themeEmoji = '👻';
    recommendedCastStructure = [
      'หญิงสาวผู้ต้องคำสาปกระสือ (ดาวิกา / ตัวเอกผู้ทุกข์ทรมานยามค่ำคืน)',
      'หมอผีประจำหมู่บ้าน (หมอคง / ผู้มีวิชาอาคมปราบผี)',
      'ชายหนุ่มคนรักผู้คอยปกป้อง (พรานสิงห์ / หนุ่มผู้ไม่ยอมทอดทิ้ง)',
      'หญิงชราผู้สืบทอดน้ำลายกระสือ (ยายสาย / ผู้ส่งต่อคำสาป)',
      'ผู้ใหญ่บ้าน / กำนันผู้ระดมชาวบ้านล่ากระสือ',
      'ชาวบ้านผู้เคราะห์ร้าย / พยานผู้เห็นดวงไฟกระสือ',
    ];
  } else if (isSpecificTakhian) {
    themeKey = 'horror_takhian';
    effectiveGenre = 'horror_thriller';
    effectiveCulture = 'thai';
    effectiveSubGenre = 'ghosts_spirits_th';
    themeNameTh = 'ตำนานเจ้าแม่ตะเคียนทอง & ป่าอาถรรพ์';
    themeEmoji = '🌳';
    recommendedCastStructure = [
      'พรานป่าผู้มีวิชาอาคม (พรานบุญ / สุขุม เคารพในอาถรรพ์)',
      'เจ้าแม่ทิพยตะเคียนทอง (นางไม้วิญญาณศักดิ์สิทธิ์ผู้พิทักษ์ป่า)',
      'หมอผี / ผู้ประกอบพิธีกรรมเบิกไพร',
      'เสี่ยละโมบผู้สั่งตัดไม้ลักลอบขุดสมบัติ',
      'ลูกหาบ / สหายร่วมชะตากรรม',
      'คนเฒ่าคนแก่ผู้รู้ประวัติศาสตร์คำสาป',
    ];
  } else if (isHorrorOrGhost) {
    themeKey = 'horror_thai';
    effectiveGenre = 'horror_thriller';
    effectiveCulture = 'thai';
    effectiveSubGenre = 'ghosts_spirits_th';
    themeNameTh = 'สยองขวัญ / ตำนานผีไทย & ไสยศาสตร์ลี้ลับ';
    themeEmoji = '👻';
    recommendedCastStructure = [
      'ตัวเอกผู้เผชิญหน้าความลี้ลับ / ทายาทผู้สืบสายเลือด',
      'ดวงวิญญาณอาฆาต / ผีร้ายประจำถิ่น',
      'หมอผี / พระธุดงค์ผู้ชี้ทางสว่างและอาคมขาว',
      'สหายร่วมชะตากรรมผู้คอยระวังหลัง',
      'คนในหมู่บ้านผู้เก็บงำความลับในอดีต',
    ];
  } else if (isSpecificNaga || isThaiMyth) {
    themeKey = 'myth_naga';
    effectiveGenre = 'epic_fantasy';
    effectiveCulture = 'thai';
    effectiveSubGenre = 'naga';
    themeNameTh = 'มหากาพย์ตำนานไทย & พญานาคราชวังบาดาล';
    themeEmoji = '🐉';
    recommendedCastStructure = [
      'ทายาทสายเลือดนาคราช (ภูริช / นักรบวารีผู้กตัญญู)',
      'จ้าวอสูรใต้บาดาล (ขุนพลศัตรูคู่อาฆาต)',
      'ฤาษี / พระเกจิผู้บำเพ็ญฌานชี้แนะธรรมะ',
      'ธิดานาคราช (ผู้กุมความลับวังบาดาล)',
      'ขุนพลเอกผู้พิทักษ์ทวารบาดาล',
    ];
  } else if (isPirateOrAdventure) {
    themeKey = 'pirate_anime';
    effectiveGenre = 'action_scifi';
    effectiveCulture = 'japanese';
    effectiveSubGenre = 'adventure_jp';
    themeNameTh = 'อนิเมะผจญภัยโจรสลัด & ล่าสมบัติมหาทะเล';
    themeEmoji = '🏴‍☠️';
    recommendedCastStructure = [
      'กัปตันเรือโจรสลัด (ผู้มุ่งมั่นสู่ราชาโจรสลัด)',
      'รองกัปตัน / ยอดนักดาบมือขวา',
      'ต้นหนสาวผู้หยั่งรู้สภาพอากาศและแผนที่ทะเล',
      'พลแม่นปืนประจำเรือ',
      'กุ๊ก / ยอดฝีมือเพลงเตะแนวหน้า',
      'พลเรือเอก / ขุนพลศัตรูแห่งกองทัพเรือ',
    ];
  } else if (isTowerOrDungeon) {
    themeKey = 'tower_hunter';
    effectiveGenre = 'action_scifi';
    effectiveCulture = 'japanese';
    effectiveSubGenre = 'fantasy_jp';
    themeNameTh = 'พิชิตหอคอย 100 ชั้น & ดันเจี้ยนฮันเตอร์';
    themeEmoji = '🗼';
    recommendedCastStructure = [
      'ฮันเตอร์แรงก์ S ผู้หวนคืน (คังจินอู / ตัวเอก)',
      'มือขวาจอมดาบสายสปีด',
      'จอมเวทสาวซัพพอร์ตธาตุแสง',
      'แทงก์เกราะหนักแนวหน้า',
      'บอสอสูรผู้เฝ้าชั้นสูงสุด',
    ];
  } else if (isCultivation) {
    themeKey = 'cultivation_xianxia';
    effectiveGenre = 'xianxia_cultivation';
    effectiveCulture = 'chinese';
    effectiveSubGenre = 'xianxia';
    themeNameTh = 'อนิเมะจีน 3D & บำเพ็ญเพียรเซียนกระบี่บิน';
    themeEmoji = '⚔️';
    recommendedCastStructure = [
      'เซียวหลิน / จอมยุทธ์หนุ่มผู้พลิกชะตาฟ้า (ตัวเอก)',
      'ศิษย์พี่หญิงคนสนิท / ทายาทสำนักกระบี่',
      'ผู้อาวุโสสำนัก / อาจารย์ผู้ถ่ายทอดวิชา',
      'จ้าวอสูรมารโลหิต / บอสใหญ่แดนมาร',
      'สัตว์เทวะผู้พิทักษ์',
    ];
  } else if (isMilitary) {
    themeKey = 'military';
    effectiveGenre = 'military_tactical';
    effectiveCulture = 'western_global';
    effectiveSubGenre = 'war_military_jp';
    themeNameTh = 'ยุทธการสงครามทหาร & ขีปนาวุธความเร็วสูง';
    themeEmoji = '🎖️';
    recommendedCastStructure = [
      'ผู้พันยุทธการ / หัวหน้าหน่วยรบพิเศษ',
      'พลแม่นปืนสไนเปอร์ซุ่มยิง',
      'วิศวกรถอดรหัสและผู้เชี่ยวชาญโดรนสอดแนม',
      'นายพลนอกรีต / ผู้นำฝ่ายกบฏ',
    ];
  } else if (isSciFi) {
    themeKey = 'scifi';
    effectiveGenre = 'action_scifi';
    effectiveCulture = 'western_global';
    effectiveSubGenre = 'scifi_jp';
    themeNameTh = 'ไซไฟไซเบอร์พังก์ & จักรวาลไฮเปอร์สเปซ';
    themeEmoji = '🛸';
    recommendedCastStructure = [
      'แฮกเกอร์ไซเบอร์เนติก (กัปตันหน่วยเน็ตเวิร์ก)',
      'หุ่นรบแอนดรอยด์เกราะหนัก',
      'วิศวกรควอนตัม',
      'AI บรรษัทอัจฉริยะผู้ปกครองเมือง / บอสใหญ่',
    ];
  } else if (isAnimeOrJapan) {
    themeKey = 'general_fantasy';
    effectiveGenre = 'epic_fantasy';
    effectiveCulture = 'japanese';
    effectiveSubGenre = 'fantasy_jp';
    themeNameTh = 'อนิเมะแฟนตาซีต่างโลก & มิตรภาพการต่อสู้';
    themeEmoji = '🌸';
    recommendedCastStructure = [
      'ผู้กล้า / ตัวเอกผู้ข้ามมิติมาต่างโลก',
      'จอมเวทสาวคู่ใจ',
      'นักรบเกราะเงินผู้พิทักษ์',
      'จอมมารใหญ่แห่งแดนทมิฬ',
    ];
  } else if (isWesternCinema) {
    themeKey = 'western_cinema';
    effectiveGenre = 'mystery_noir';
    effectiveCulture = 'western_global';
    effectiveSubGenre = 'mystery_detective';
    themeNameTh = 'ภาพยนตร์ฮอลลีวูด & สืบสวนอาชญากรรมเข้มข้น';
    themeEmoji = '🎬';
    recommendedCastStructure = [
      'นักสืบเอกชน / อดีตเจ้าหน้าที่พิเศษ',
      'คู่หูนักวิเคราะห์หลักฐานนิติเวช',
      'มาเฟียจอมบงการเบื้องหลังคดีฆาตกรรม',
      'สายข่าวในเงามืด',
    ];
  }

  return {
    themeKey,
    effectiveGenre,
    effectiveCulture,
    effectiveSubGenre,
    themeNameTh,
    themeEmoji,
    isHorrorOrGhost,
    isSpecificKrasue,
    isSpecificTakhian,
    isSpecificPop,
    isThaiMyth,
    isSpecificNaga,
    isPirateOrAdventure,
    isTowerOrDungeon,
    isCultivation,
    isMilitary,
    isSciFi,
    isAnimeOrJapan,
    isWesternCinema,
    recommendedCastStructure,
  };
}

/**
 * ตรวจสอบว่ารายชื่อตัวละครในโปรเจกต์ "ขัดแย้ง" กับธีมเรื่องที่วิเคราะห์ได้หรือไม่
 * เช่น ชื่อเรื่องเป็นผีกระสือ แต่ตัวละครเป็นกัปตันมังกี้ หรือ ไซเฟอร์ แฮกเกอร์
 */
export function isCastMismatched(characters: CharacterBible[], theme: StoryThemeAnalysis): boolean {
  if (!characters || characters.length === 0) return false;

  const lead = characters[0];
  const allNamesAndAnchors = characters
    .map((c) => `${c.name} ${c.appearanceAnchor || ''} ${c.weaponsOrProps || ''} ${c.clothingStyle || ''}`)
    .join(' ')
    .toLowerCase();

  const hasPirateCast = /กัปตันมังกี้|หมวกฟาง|ฮาคิ|ริวโนะสึเกะ|ริโนะสึเกะ|ซันจิ|โซโล|one piece|pirate/i.test(allNamesAndAnchors);
  const hasSciFiCast = /ไซเฟอร์|วัลแคน|อาธีน่า\s*คอร์|แฮกเกอร์ไซเบอร์เนติก|แอนดรอยด์|ดร\.โนวา|cybernetic|mecha|railgun/i.test(allNamesAndAnchors);
  const hasXianxiaCast = /เซียวหลิน|เซียวเฉิน|กระบี่บิน|ลมปราณ|ชุดคลุมเต๋า|ตานเถียน|cultivation prodigy/i.test(allNamesAndAnchors);
  const hasHorrorCast = /กระสือ|พรานบุญ|หมอผี|ตะเคียน|อาคม|ผ้าประเจียด|ดวงไฟ|spirit/i.test(allNamesAndAnchors);

  // 1. ถ้าเป็นเรื่องผีไทย (ผีกระสือ, เจ้าแม่ตะเคียน, ผี) แต่ตัวละครเป็นโจรสลัด หรือ ไซไฟ
  if (theme.isHorrorOrGhost && (hasPirateCast || hasSciFiCast || hasXianxiaCast)) {
    return true;
  }

  // 2. ถ้าเป็นตำนานไทย/พญานาค แต่ตัวละครเป็นไซไฟ หรือโจรสลัดวันพีช
  if (theme.isThaiMyth && (hasPirateCast || hasSciFiCast)) {
    return true;
  }

  // 3. ถ้าเป็นกำลังภายในจีน แต่ตัวละครเป็นทหารอาวุธปืน หรือไซไฟ
  if (theme.isCultivation && (hasSciFiCast || hasPirateCast)) {
    return true;
  }

  // 4. ถ้าเป็นเรื่องทหาร แต่ตัวละครเป็นเซียนจีนกระบี่บิน
  if (theme.isMilitary && hasXianxiaCast) {
    return true;
  }

  return false;
}
