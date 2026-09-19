import { VisualMedium, StylePreset, MovieGenre, CharacterBible } from './types';

interface PromptGenerationParams {
  sceneTitle: string;
  narration: string;
  dialogueText?: string;
  visualMedium: VisualMedium;
  stylePreset: StylePreset;
  genre: MovieGenre;
  cameraMovement: string;
  lighting: string;
  charactersInScene: CharacterBible[];
  sceneNumber: number;
}

export function buildVisualPrompts(params: PromptGenerationParams): {
  imagePrompt: string;
  videoMotionPrompt: string;
  negativePrompt: string;
  imagePromptEn?: string;
  videoMotionPromptEn?: string;
} {
  const {
    sceneTitle,
    narration,
    dialogueText,
    visualMedium,
    stylePreset,
    genre,
    cameraMovement,
    lighting,
    charactersInScene,
    sceneNumber,
  } = params;

  // 1. สไตล์งานภาพภาษาไทย (Thai Style Keywords)
  let styleKeywordsTh = '';
  let styleKeywordsEn = '';
  let negativeKeywordsTh = '';
  let negativeKeywordsEn = '';

  if (visualMedium === 'live_action') {
    // โหมดคนจริง (Live-Action Cinema)
    if (stylePreset === 'hollywood_cinematic') {
      styleKeywordsTh = 'ภาพถ่ายภาพยนตร์เสมือนคนจริงระดับฮอลลีวูด, ถ่ายด้วยเลนส์ภาพยนตร์ 35 มม., ผิวมนุษย์สมจริงเห็นรูขุมขนชัดเจน, แสงเงาแบบ Chiaroscuro ลุ่มลึก, บรรยากาศหมอกควันสมจริง, หน้าชัดหลังเบลอ, คมชัดระดับ 8K, เกรนฟิล์มระดับรางวัลภาพยนตร์';
      styleKeywordsEn = 'cinematic film still, 35mm anamorphic lens, photorealistic human actor, realistic skin texture, chiaroscuro lighting, 8k resolution, award-winning cinematography';
    } else if (stylePreset === 'imax_70mm') {
      styleKeywordsTh = 'ภาพถ่ายกล้องยักษ์ IMAX 70 มม. คมชัดสูงสุด, คนจริง 100%, แสงธรรมชาติสมจริง, รายละเอียดผิวหนังและแววตาชัดเจนทุกอณู, โทนภาพยนตร์ระดับโลก';
      styleKeywordsEn = 'IMAX 70mm photograph, ultra-realistic human actor, natural lighting, crystal clear skin pores, cinematic composition';
    } else if (stylePreset === 'dark_noir') {
      styleKeywordsTh = 'ภาพยนตร์แนวนัวร์มืดมน, เงามืดตัดกับแสงไฟนีออนจัดจ้าน, ถนนเปียกชื้นสะท้อนแสงน้ำฝน, ไอควันลอยขึ้นจากท่อ, คนจริงอารมณ์เคร่งขรึม, โทนฟิล์ม 35 มม.';
      styleKeywordsEn = 'neo-noir film still, heavy shadows, wet reflective pavement, smoke and steam, muted colors with neon highlights, moody realistic human';
    } else {
      styleKeywordsTh = 'ภาพถ่ายภาพยนตร์คนจริง, เลนส์มุมกว้างภาพยนตร์, แสงธรรมชาติ, พื้นผิวสมจริงเป็นธรรมชาติ, โทนสีภาพยนตร์ฮอลลีวูด';
      styleKeywordsEn = 'cinematic live-action photography, 35mm film stock, photorealistic people, natural textures';
    }

    negativeKeywordsTh = 'การ์ตูน, อนิเมะ, ภาพวาด 3 มิติ, โมเดลพลาสติก, ลายเส้นวาด, หน้าเบี้ยว, สัดส่วนผิดเพี้ยน';
    negativeKeywordsEn = 'cartoon, anime, 3d render, cgi, illustration, drawing, painting, doll, plastic skin, deformed';
  } else {
    // โหมดการ์ตูนและแอนิเมชัน (Animation)
    if (stylePreset === 'donghua_3d') {
      // สไตล์ เพื่อนที่ดีที่สุด SAN1 / อนิเมะจีน 3D กำลังภายใน
      styleKeywordsTh = 'แอนิเมชัน 3D สไตล์อนิเมะจีนกำลังภายในระดับพรีเมียม (เรนเดอร์ Unreal Engine 5 สไตล์เพื่อนที่ดีที่สุด SAN1), รายละเอียดประณีตระดับ 8K, ชุดคลุมผ้าไหมโบราณพริ้วไหวปักดิ้นทอง, ออร่าพลังปราณวิญญาณเรืองรองรอบตัว, ละอองแสงหยกวิเศษลอยกลางอากาศ, แสงสวรรค์สาดส่อง, โมเดลตัวละคร 3D ลายเส้นจีนงดงามวิจิตร';
      styleKeywordsEn = 'premium 3D Chinese Donghua animation style, Unreal Engine 5 cinematic render, Octane render 8k, detailed ethereal xianxia aesthetic, flowing silk robes with golden embroidery, vibrant spiritual qi energy aura, celestial lighting, floating jade particles, magnificent oriental fantasy atmosphere';
    } else if (stylePreset === 'anime_2d') {
      styleKeywordsTh = 'อนิเมะญี่ปุ่น 2D ระดับโรงภาพยนตร์, ลายเส้นวาดมือคมชัดประณีต (สไตล์ Ufotable และ มาโกโตะ ชินไค), แสงสีสันสดใสเรืองรองสะดุดตา, ท้องฟ้าและเมฆไล่เฉดสีงดงาม';
      styleKeywordsEn = 'cinematic 2D Japanese anime, Ufotable and Makoto Shinkai aesthetic, high-end theatrical anime film, hand-drawn anime lineart, dynamic glowing lighting';
    } else if (stylePreset === 'western_3d') {
      styleKeywordsTh = 'แอนิเมชัน 3D สไตล์ภาพยนตร์แอนิเมชันระดับโลก (สไตล์ Arcane และ Pixar), พื้นผิวมีเอกลักษณ์ทางศิลปะ, แสงเงาจัดวางอย่างมีมิติ, การแสดงอารมณ์ตัวละครลึกซึ้ง';
      styleKeywordsEn = '3D stylized cinematic animation, Arcane and Pixar studio aesthetic, stylized textures, rich cinematic lighting';
    } else if (stylePreset === 'manhwa_action') {
      styleKeywordsTh = 'สไตล์มันฮวาการ์ตูนเกาหลีแนวแอ็กชันเข้มข้น (สไตล์ Solo Leveling), แววตาส่องแสงเรืองรองในความมืด, เงาหมึกสีดำตัดกับพลังงานประกายแสง, ลายเส้นแอ็กชันทรงพลัง';
      styleKeywordsEn = 'Solo Leveling manhwa webtoon style, dark fantasy action manhwa, glowing eyes, high contrast ink shadows, intense kinetic energy';
    } else {
      styleKeywordsTh = 'ภาพยนตร์แอนิเมชัน 3D คุณภาพสูง, แสงเงาแฟนตาซีอลังการ, โมเดล 3 มิติสวยงาม';
      styleKeywordsEn = '3D animated movie still, high quality CGI render, stylized fantasy aesthetic';
    }

    negativeKeywordsTh = 'คนจริง, ภาพถ่ายจากกล้องจริง, ผิวมนุษย์จริง, ภาพเบลอ, คุณภาพต่ำ, ลายน้ำ';
    negativeKeywordsEn = 'live action, real human photo, realistic photograph, camera grain, raw photo, deformed limbs';
  }

  // 2. บรรยากาศแนวเรื่องภาษาไทย (Genre Atmospheric Elements)
  let genreFlavorTh = '';
  let genreFlavorEn = '';
  switch (genre) {
    case 'xianxia_cultivation':
      genreFlavorTh = 'ยอดเขาหมอกสวรรค์แห่งแดนเซียนโบราณ, วิหารเต๋าโบราณลอยกลางอากาศ, อักขระเซียนส่องประกายเรืองรอง, ทะเลหมอกลอยล่อง, วังวนสายลมแห่งลมปราณฟ้าดิน';
      genreFlavorEn = 'ancient mystical mountain peaks, celestial Daoist temple, floating ancient runes, misty clouds, heavenly cultivation realm';
      break;
    case 'action_scifi':
      genreFlavorTh = 'มหานครแห่งโลกอนาคต แสงไฟนีออนเจิดจ้า, เทคโนโลยีไซเบอร์เนติก, ยานพาหนะบินลอยกลางอากาศ, คืนฝนตกในเมืองไฮเทค';
      genreFlavorEn = 'futuristic neon megacity, cybernetic technology, flying vehicles, dystopian rainy night';
      break;
    case 'epic_fantasy':
      genreFlavorTh = 'ซากปราสาทโบราณยุคกลาง, สัตว์อสูรในตำนานบนท้องฟ้า, คริสตัลเวทมนตร์เรืองแสง, ท้องฟ้าพายุสายฟ้าแห่งโลกแฟนตาซี';
      genreFlavorEn = 'ancient gothic castle ruins, mythical beasts in distance, glowing magical crystals, stormy sky';
      break;
    case 'horror_thriller':
      genreFlavorTh = 'บรรยากาศชวนขนลุกและน่าสะพรึงกลัว, เงามืดคืบคลาน, แสงจันทร์สลัวเยือกเย็น, หมอกหนาทึบลึกลับชวนลุ้นระทึก';
      genreFlavorEn = 'eerie haunted atmosphere, creeping shadows, cold dim moonlight, dense ominous fog';
      break;
    case 'mystery_noir':
      genreFlavorTh = 'ตรอกซอกซอยในเมืองท่ามกลางสายฝนพรำ, แสงไฟสลัวสะท้อนแอ่งน้ำ, เงาร่างปริศนา, บรรยากาศภาพยนตร์สืบสวนคดีฆาตกรรม';
      genreFlavorEn = 'rain-drenched city alley, flickering streetlights, silhouette figures, crime thriller atmosphere';
      break;
    case 'historical_war':
      genreFlavorTh = 'สมรภูมิรบโบราณอันยิ่งใหญ่, ธงศึกโบราณโบกสะบัดกลางสายลม, ฝุ่นควันจากกองทัพ, ขบวนทัพทหารโบราณสุดอลังการ';
      genreFlavorEn = 'ancient battlefield, banners fluttering in the wind, war dust, armors, cavalry in formation';
      break;
    default:
      genreFlavorTh = 'บรรยากาศภาพยนตร์เปี่ยมมนต์ขลังและเรื่องราว';
      genreFlavorEn = 'cinematic atmosphere, rich environmental storytelling';
  }

  // 3. ตัวละครที่ปรากฏในฉาก (Character Descriptions)
  let characterDescTh = '';
  let characterDescEn = '';
  if (charactersInScene.length > 0) {
    characterDescTh = charactersInScene
      .map(
        (c) =>
          `[ตัวละคร: ${c.name}, รูปลักษณ์: ${c.appearanceAnchor}, สวมใส่: ${c.clothingStyle}${
            c.weaponsOrProps ? `, อาวุธ/ไอเทม: ${c.weaponsOrProps}` : ''
          }]`
      )
      .join(' และ ');
    characterDescEn = charactersInScene
      .map((c) => `[Character: ${c.name}, ${c.appearanceAnchor}, wearing ${c.clothingStyle}]`)
      .join(' and ');
  } else {
    characterDescTh = 'ตัวละครหลักในฉาก';
    characterDescEn = 'focal character in scene';
  }

  // 4. สรุปการกระทำในฉาก
  const cleanSummary = sceneTitle.replace(/ฉากที่ \d+[:\s]*/, '');

  // 5. ประกอบคำสั่งสร้างภาพภาษาไทย (Thai Image Prompt - ตัวหลัก!)
  const imagePrompt = `${styleKeywordsTh}, ${characterDescTh}, กำลังทำ [${cleanSummary}], ฉากหลัง: ${genreFlavorTh}, มุมกล้อง: ${cameraMovement}, แสงเงา: ${lighting}, ภาพสัดส่วนจอกว้าง 16:9 คมชัดระดับ 8K ละเอียดประณีต`;

  // พร้อมต์ภาษาอังกฤษสำรอง
  const imagePromptEn = `${styleKeywordsEn}, ${characterDescEn}, ${cleanSummary}, set in ${genreFlavorEn}. Camera: ${cameraMovement}. Lighting: ${lighting}. 8k resolution, cinematic composition, widescreen 16:9 --ar 16:9 --v 6.1 --style raw`;

  // 6. ประกอบคำสั่งสร้างวิดีโอภาษาไทย (Thai Video Motion Prompt - ตัวหลัก!)
  const videoMotionPrompt = `[ฉากที่ ${sceneNumber} ความต่อเนื่อง] [มุมกล้อง: ${cameraMovement}, เคลื่อนไหวลื่นไหลแบบภาพยนตร์] [การกระทำ: ตัวละครทำการ ${cleanSummary}, แอ็กชันต่อเนื่องไม่ตัดข้าม] [แสงเงา: ${lighting}, มีละอองแสงลอยในบรรยากาศ] [สไตล์: ${
    visualMedium === 'live_action' ? 'ภาพยนตร์คนจริง เลนส์ 35 มม.' : 'อนิเมะจีน 3D สไตล์เพื่อนที่ดีที่สุด SAN1 เรนเดอร์ Unreal Engine 5'
  }] รักษาความต่อเนื่องของใบหน้า ทรงผม เสื้อผ้า และฉากจากเฟรมก่อนหน้าอย่างแม่นยำ คมชัดระดับ 4K 60fps ต่อเนื่องเนียนตา`;

  const videoMotionPromptEn = `[Shot ${sceneNumber} Continuity] [Camera: ${cameraMovement}, smooth motion] [Action: Character performs ${cleanSummary}, continuous shot] [Lighting: ${lighting}] [Style: ${
    visualMedium === 'live_action' ? 'Live-action realistic 35mm film' : '3D Chinese Donghua animation UE5'
  }] Maintain exact character face, clothing, and environment. 4K, 60fps.`;

  return {
    imagePrompt,
    videoMotionPrompt,
    negativePrompt: negativeKeywordsTh,
    imagePromptEn,
    videoMotionPromptEn,
  };
}
