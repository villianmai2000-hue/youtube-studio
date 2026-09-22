import { VisualMedium, StylePreset, MovieGenre, CharacterBible, AspectRatio } from './types';

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
  aspectRatio?: AspectRatio;
}

export function buildVisualPrompts(params: PromptGenerationParams): {
  imagePrompt: string;
  videoMotionPrompt: string;
  negativePrompt: string;
  imagePromptEn?: string;
  videoMotionPromptEn?: string;
  googleFlowPrompt: string;
  googleFlowSeed: string;
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
    aspectRatio = '16:9',
  } = params;

  // 1. สไตล์งานภาพภาษาไทย (Thai Style Keywords)
  let styleKeywordsTh = '';
  let styleKeywordsEn = '';
  let negativeKeywordsTh = '';
  let negativeKeywordsEn = '';

  if (visualMedium === 'live_action') {
    // โหมดคนจริง (Live-Action Cinema)
    if (stylePreset === 'military_combat') {
      styleKeywordsTh = 'ภาพยนตร์แนวสงครามยุทธวิธีสมจริงระดับสูง, ถ่ายทำด้วยกล้อง Tactical Go-Pro 4K และกล้องโดรนตรวจการณ์ทางทหาร, หน่วยรบพิเศษสวมชุดพราง Multicam อุปกรณ์ยุทธวิธีครบเซ็ต แว่นมองกลางคืน NVG หมวกเคฟล่าร์ ปืนไรเฟิลจู่โจมติดกล้อง Holographic, ยานเกราะและรถถังพ่นควันพรางตัว, ละอองฝุ่นและประกายไฟระเบิดในสมรภูมิ คมชัดระดับ 8K';
      styleKeywordsEn = 'tactical military combat cinematography, photorealistic special forces operators, multicam tactical camo, NVG night vision gear, tactical assault rifles, thermal vision drone angle, battlefield dust and shockwaves, 8k ultra-realistic war film';
    } else if (stylePreset === 'hollywood_cinematic') {
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

    negativeKeywordsTh = 'การ์ตูน, อนิเมะ, ภาพวาด 3 มิติ, โมเดลพลาสติก, ลายเส้นวาด, หน้าเบี้ยว, สัดส่วนผิดเพี้ยน, แบ่งครึ่งจอ, แยกช่องภาพ, ภาพปะติด, หลายช่องการ์ตูน, เส้นคั่นกลางจอ, ภาพแยกเฟรม, สองภาพในหนึ่งรูป';
    negativeKeywordsEn = 'cartoon, anime, 3d render, cgi, illustration, drawing, painting, doll, plastic skin, deformed, split screen, divided screen, split frame, diptych, triptych, multiple panels, separate frames, collage, split view, border line between characters, dual screen, picture in picture, comic panels';
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

    negativeKeywordsTh = 'คนจริง, ภาพถ่ายจากกล้องจริง, ผิวมนุษย์จริง, ภาพเบลอ, คุณภาพต่ำ, ลายน้ำ, แบ่งครึ่งจอ, แยกช่องภาพ, ภาพปะติด, หลายช่องการ์ตูน, เส้นคั่นกลางจอ, ภาพแยกเฟรม, สองภาพในหนึ่งรูป';
    negativeKeywordsEn = 'live action, real human photo, realistic photograph, camera grain, raw photo, deformed limbs, split screen, divided screen, split frame, diptych, triptych, multiple panels, separate frames, collage, split view, border line between characters, dual screen, picture in picture, comic panels';
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
      genreFlavorTh = 'บรรยากาศชวนขนลุกและน่าสะพรึงกลัวสไตล์ภาพยนตร์สยองขวัญไทย, ศาลเพียงตาโบราณ, ต้นไม้ศักดิ์สิทธิ์ผูกผ้าเจ็ดสี, ควันธูปและเปลวเทียนวูบวาบ, หมอกหนาทึบและเงามืดลี้ลับชวนลุ้นระทึก';
      genreFlavorEn = 'chilling Thai horror cinema atmosphere, sacred ancient shrine, mythical banyan takhian tree wrapped in colorful sacred silks, floating incense smoke, flickering candlelight, dense ominous fog, chiaroscuro creeping shadows, eerie supernatural tension';
      break;
    case 'mystery_noir':
      genreFlavorTh = 'ตรอกซอกซอยในเมืองท่ามกลางสายฝนพรำ, แสงไฟสลัวสะท้อนแอ่งน้ำ, เงาร่างปริศนา, บรรยากาศภาพยนตร์สืบสวนคดีฆาตกรรม';
      genreFlavorEn = 'rain-drenched city alley, flickering streetlights, silhouette figures, crime thriller atmosphere';
      break;
    case 'military_tactical':
      genreFlavorTh = 'สมรภูมิรบยุทธการร่วมสมัย ควันปืนและฝุ่นระเบิดฟุ้งกระจาย, ฐานทัพทหารยุทธวิธีลับ, จอเรดาร์และระบบตรวจจับดาวเทียมทางทหาร, รถหุ้มเกราะและอากาศยานไร้คนขับบินลาดตระเวนเหนือฟากฟ้า';
      genreFlavorEn = 'modern military warzone, battlefield smoke and dust, tactical military forward operating base, thermal radar monitors, armored vehicles and combat UAV drones in sky';
      break;
    case 'historical_war':
      genreFlavorTh = 'สมรภูมิรบโบราณอันยิ่งใหญ่, ธงศึกโบราณโบกสะบัดกลางสายลม, ฝุ่นควันจากกองทัพ, ขบวนทัพทหารโบราณสุดอลังการ';
      genreFlavorEn = 'ancient battlefield, banners fluttering in the wind, war dust, armors, cavalry in formation';
      break;
    default:
      genreFlavorTh = 'บรรยากาศภาพยนตร์เปี่ยมมนต์ขลังและเรื่องราว';
      genreFlavorEn = 'cinematic atmosphere, rich environmental storytelling';
  }

  // 3. ตัวละครที่ปรากฏในฉาก (Character Descriptions & Single Frame Composition)
  let characterDescTh = '';
  let characterDescEn = '';
  let sameFrameInstructionTh = '';
  let sameFrameInstructionEn = '';
  let flowSeed = '482910';

  if (charactersInScene.length > 0) {
    flowSeed = charactersInScene[0].googleFlowSeed || `${Math.floor(100000 + Math.random() * 900000)}`;
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

    if (charactersInScene.length > 1) {
      sameFrameInstructionTh = `[การจัดวางเฟรม: ตัวละครทุกคน (${charactersInScene.map((c) => c.name).join(', ')}) ต้องปรากฏร่วมกันในเฟรมภาพเดียวกันแบบ Single Unified Camera Shot ถ่ายทำในช็อตเดียวกัน ห้ามแบ่งครึ่งจอ ห้ามแยกช่องภาพ ห้าม Split-screen เด็ดขาด]`;
      sameFrameInstructionEn = `[Composition: all characters (${charactersInScene.map((c) => c.name).join(', ')}) captured together inside the exact same single camera frame, cinematic two-shot/group shot, unified single scene without split screen, no collage, no divided frames]`;
    }
  } else {
    characterDescTh = 'ตัวละครหลักในฉาก';
    characterDescEn = 'focal character in scene';
  }

  // 4. สรุปการกระทำในฉาก
  const cleanSummary = sceneTitle.replace(/ฉากที่ \d+[:\s]*/, '');
  const arLabelTh = aspectRatio === '9:16' ? 'สัดส่วนแนวตั้ง 9:16 (Reels/Shorts/TikTok)' : 'สัดส่วนจอกว้าง 16:9 (ภาพยนตร์/YouTube แนวนอน)';
  const arParam = aspectRatio === '9:16' ? '--ar 9:16' : '--ar 16:9';

  // 5. ประกอบคำสั่งสร้างภาพภาษาไทย (Thai Image Prompt - ตัวหลัก!)
  const sameFrameThPart = sameFrameInstructionTh ? `, ${sameFrameInstructionTh}` : '';
  const sameFrameEnPart = sameFrameInstructionEn ? `, ${sameFrameInstructionEn}` : '';

  const imagePrompt = `${styleKeywordsTh}, ${characterDescTh}${sameFrameThPart}, กำลังทำ [${cleanSummary}], ฉากหลัง: ${genreFlavorTh}, มุมกล้อง: ${cameraMovement}, แสงเงา: ${lighting}, ภาพ${arLabelTh} คมชัดระดับ 8K ละเอียดประณีต`;

  // พร้อมต์ภาษาอังกฤษสำรอง
  const imagePromptEn = `${styleKeywordsEn}, ${characterDescEn}${sameFrameEnPart}, ${cleanSummary}, set in ${genreFlavorEn}. Camera: ${cameraMovement}. Lighting: ${lighting}. 8k resolution, cinematic composition, ${arParam} --v 6.1 --style raw`;

  // 6. พร้อมต์สำหรับ Google Flow (flow.google.com) - ล็อคตัวละครและฉากให้คมชัด ไม่เพี้ยน
  const googleFlowPrompt = `[Google Flow / VideoFX Prompt - flow.google.com]
Prompt: ${cleanSummary}, ${characterDescEn}${sameFrameEnPart}, ${genreFlavorEn}. Cinematography: ${cameraMovement}, ${lighting}. High fidelity consistent character rendering, sharp photorealistic details, cinematic grade.
Aspect Ratio: ${aspectRatio}`;

  // 7. ประกอบคำสั่งสร้างวิดีโอภาษาไทยและอังกฤษ (Dynamic Video Motion Prompt)
  let videoStyleLabelTh = 'ภาพยนตร์คนจริง เลนส์ 35 มม.';
  let videoStyleLabelEn = 'Live-action realistic 35mm film';

  if (visualMedium === 'animation') {
    if (stylePreset === 'donghua_3d') {
      videoStyleLabelTh = 'อนิเมะจีน 3D สไตล์เพื่อนที่ดีที่สุด SAN1 เรนเดอร์ Unreal Engine 5';
      videoStyleLabelEn = '3D Chinese Donghua animation UE5';
    } else if (stylePreset === 'anime_2d') {
      videoStyleLabelTh = 'อนิเมะญี่ปุ่น 2D ระดับโรงภาพยนตร์ สไตล์ Ufotable';
      videoStyleLabelEn = 'Cinematic 2D Japanese anime Ufotable style';
    } else if (stylePreset === 'western_3d') {
      videoStyleLabelTh = 'แอนิเมชัน 3D สไตล์สากล สไตล์ Arcane';
      videoStyleLabelEn = '3D stylized cinematic animation Arcane style';
    } else if (stylePreset === 'manhwa_action') {
      videoStyleLabelTh = 'มันฮวาแอ็กชันสไตล์ Solo Leveling';
      videoStyleLabelEn = 'Solo Leveling manhwa action style';
    } else {
      videoStyleLabelTh = 'ภาพยนตร์แอนิเมชัน 3D คุณภาพสูง';
      videoStyleLabelEn = '3D animated movie cinematic render';
    }
  } else {
    if (genre === 'horror_thriller') {
      videoStyleLabelTh = 'ภาพยนตร์สยองขวัญลี้ลับไทย แสงเงาดาร์กหลอนสมจริง';
      videoStyleLabelEn = 'Cinematic Thai horror thriller film';
    } else if (stylePreset === 'military_combat') {
      videoStyleLabelTh = 'ภาพยนตร์สงครามยุทธวิธีสมจริง 8K';
      videoStyleLabelEn = 'Tactical military combat cinematography 8k';
    } else if (stylePreset === 'hollywood_cinematic') {
      videoStyleLabelTh = 'ภาพยนตร์คนจริงระดับฮอลลีวูด เลนส์ 35 มม.';
      videoStyleLabelEn = 'Hollywood cinematic 35mm film';
    }
  }

  const sameFrameVideoTh = charactersInScene.length > 1 ? ' [จัดวางตัวละคร: ทุกคนอยู่ในเฟรมเดียวกันแบบ Two-shot ห้ามตัดแบ่งครึ่งจอ]' : '';
  const sameFrameVideoEn = charactersInScene.length > 1 ? ' [Composition: all characters in single unified camera shot, no split screen]' : '';

  const videoMotionPrompt = `[ฉากที่ ${sceneNumber}] [มุมกล้อง: ${cameraMovement}, เคลื่อนไหวลื่นไหลแบบภาพยนตร์] [การกระทำ: ตัวละครทำการ ${cleanSummary}, แอ็กชันต่อเนื่องไม่ตัดข้าม]${sameFrameVideoTh} [แสงเงา: ${lighting}] [สัดส่วน: ${aspectRatio}] [สไตล์: ${videoStyleLabelTh}] รักษาความต่อเนื่องของใบหน้า ทรงผม เสื้อผ้า และฉากอย่างแม่นยำ คมชัดระดับ 4K 60fps ต่อเนื่องเนียนตา`;

  const videoMotionPromptEn = `[Shot ${sceneNumber}] [Camera: ${cameraMovement}, smooth motion] [Action: Character performs ${cleanSummary}, continuous shot]${sameFrameVideoEn} [Lighting: ${lighting}] [Aspect: ${aspectRatio}] [Style: ${videoStyleLabelEn}] Maintain exact character face, clothing, and environment. Zero drift. 4K, 60fps.`;

  return {
    imagePrompt,
    videoMotionPrompt,
    negativePrompt: negativeKeywordsTh,
    imagePromptEn,
    videoMotionPromptEn,
    googleFlowPrompt,
    googleFlowSeed: flowSeed,
  };
}
