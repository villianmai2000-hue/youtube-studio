import { ProjectData, ScriptScene, PropItem, LocationItem, CharacterItem, TenBeatItem, ProductionPromptSections } from "./types";

export const FOCUS_OPTIONS = [
  "Deep Focus (ชัดลึก ทั้งฉากคมชัด)",
  "Shallow Focus / Bokeh (ชัดตื้น ละลายฉากหลัง)",
  "Rack Focus (เปลี่ยนระยะโฟกัสหน้า-หลัง)",
  "Split Diopter (ชัดสองระยะพร้อมกัน)",
  "Soft Focus (นวลตา สไตล์ฝัน/ย้อนอดีต)",
  "Tilt-Shift (ระยะชัดแถบแคบ เอฟเฟกต์โมเดลย่อส่วน)",
];

export const COMPOSITION_OPTIONS = [
  "Center Frame (กึ่งกลางภาพ วัตถุเด่นชัด)",
  "Rule of Thirds (จุดตัดเก้าช่อง สมดุลสายตา)",
  "Extreme Close-Up (เจาะแววตา/รายละเอียดมือ)",
  "Leading Lines (เส้นนำสายตาสู่เป้าหมาย)",
  "Dutch Angle (มุมเอียง สื่อความไม่มั่นคง/ระทึก)",
  "Golden Ratio (สัดส่วนทองคำ สุนทรียศาสตร์)",
  "Low Angle Heroic (มุมเสย ตัวละครทรงอำนาจ)",
  "High Angle Vulnerable (มุมก้ม สื่อความอ่อนแอ/โดดเดี่ยว)",
  "Symmetrical Framing (สมมาตรแม่นยำ เรขาคณิตเป๊ะ)",
];

export const SHOT_TYPES = [
  "Extreme Wide Shot (EWS) - ทัศนียภาพกว้างสุดตา",
  "Wide Shot (WS) - ภาพกว้างเห็นสภาพแวดล้อม",
  "Full Shot (FS) - เต็มตัวตั้งแต่ศีรษะจรดเท้า",
  "Medium Shot (MS) - ครึ่งตัวระดับเอวถึงศีรษะ",
  "Close-Up (CU) - ใบหน้าชัดเจน สื่ออารมณ์",
  "Extreme Close-Up (ECU) - เจาะเฉพาะดวงตาหรือวัตถุ",
];

export const CAMERA_ANGLES = [
  "Eye Level - ระดับสายตา เป็นธรรมชาติ",
  "Low Angle - มุมเสย เสริมพลังความยิ่งใหญ่",
  "High Angle - มุมก้ม สื่อความกดดันหรืออ่อนแอ",
  "Over the Shoulder (OTS) - ข้ามไหล่ในบทสนทนา",
  "Bird's Eye / Drone View - มุมมองจากฟากฟ้า",
  "Dutch Tilt - มุมเอียงระทึกขวัญ",
];

export const CAMERA_MOVEMENTS = [
  "Static Shot (กล้องนิ่ง)",
  "Slow Pan Left/Right (แพนกล้องช้าๆ ซ้าย-ขวา)",
  "Tilt Up/Down (กระดกกล้อง ขึ้น-ลง)",
  "Dolly In/Out (เลื่อนกล้องเข้าหาหรือถอยออก)",
  "Tracking Shot (เคลื่อนกล้องติดตามตัวละคร)",
  "Crane / Jib Shot (ยกระดับมุมกล้องลอยขึ้น)",
  "Handheld Realistic (ถือกล้องสมจริง สั่นไหวตามสถานการณ์)",
];

export const DIRECTOR_STYLES = [
  "Christopher Nolan - อลังการ สมจริง แสงธรรมชาติ อัตราส่วน IMAX",
  "Denis Villeneuve - มินิมอล ยิ่งใหญ่ ลึกลับ แสงเงาคมชัด",
  "David Fincher - คุมโทนสีเขียวอมฟ้า สมบูรณ์แบบทุกมิลลิเมตร กล้องนิ่งเฉียบ",
  "Makoto Shinkai - อนิเมะแสงประกาย เมฆสวย บรรยากาศอบอุ่นโรแมนติก",
  "Guillermo del Toro - แฟนตาซีมืดมน โทนสีทองและอำพัน ละเอียดอ่อน",
  "Wes Anderson - สมมาตรเป๊ะปัง สีพาสเทลจัดจ้าน มุมกล้องระนาบตรง",
  "Michael Bay - แอ็กชันเร้าใจ แสงแฟลร์สีส้มทอง กล้องหมุนรอบตัว",
];

export const DEFAULT_AI_RULES = [
  "Maintain strict visual consistency for face, hair, and clothing across all sequential shots",
  "No morphing or anatomical deformation, render 5 fingers correctly",
  "Photorealistic 8K cinematic rendering, smooth 60fps pacing without temporal jitter",
  "Adhere strictly to designated lighting atmosphere and composition coordinates",
  "Ensure props and vehicle models match their exact registered asset specifications",
];

export const DEFAULT_10_BEATS: TenBeatItem[] = [
  { beatNumber: 1, title: "1. จุดเริ่มต้นและสถานการณ์เปิดตัว", timeRange: "0:00 - 5:00 น. (ฉาก 1-31)", goal: "แนะนำตัวละครหลัก ปูพื้นหลังโลก และปมปัญหาแรกที่กำลังคุกคาม", scenesCount: 31 },
  { beatNumber: 2, title: "2. เสียงเรียกแห่งโชคชะตา & ความขัดแย้ง", timeRange: "5:00 - 10:00 น. (ฉาก 32-62)", goal: "เกิดเหตุการณ์พลิกผัน บีบให้ตัวละครต้องก้าวออกจากเขตปลอดภัย", scenesCount: 31 },
  { beatNumber: 3, title: "3. เตรียมอาวุธ เสบียง และวางกลยุทธ์", timeRange: "10:00 - 15:00 น. (ฉาก 63-93)", goal: "รวบรวมอุปกรณ์ ยานพาหนะ พร็อพ และวางแผนรับมือภัยพิบัติหรือศัตรู", scenesCount: 31 },
  { beatNumber: 4, title: "4. การเผชิญหน้าด่านแรก & การทดสอบ", timeRange: "15:00 - 20:00 น. (ฉาก 94-124)", goal: "ทดสอบความสามารถ อุปสรรคแรกที่ทำให้เห็นความร้ายกาจของสถานการณ์", scenesCount: 31 },
  { beatNumber: 5, title: "5. จุดเปลี่ยนครั้งสำคัญ (Midpoint Climax)", timeRange: "20:00 - 25:00 น. (ฉาก 125-155)", goal: "ความจริงเปิดเผย การเดิมพันสูงขึ้น ความตายหรือหายนะใกล้เข้ามา", scenesCount: 31 },
  { beatNumber: 6, title: "6. ศัตรูเริ่มเปิดฉากบุก & แผนการแตกหัก", timeRange: "25:00 - 30:00 น. (ฉาก 156-186)", goal: "ฝ่ายตรงข้ามเข้าจู่โจม ป้อมปราการถูกโจมตี การเอาชีวิตรอดขั้นวิกฤต", scenesCount: 31 },
  { beatNumber: 7, title: "7. ดำดิ่งสู่จุดต่ำสุด (All Hope is Lost)", timeRange: "30:00 - 35:00 น. (ฉาก 187-217)", goal: "การสูญเสียครั้งใหญ่ หรือความหวังริบหรี่ แต่จุดประกายการลุกขึ้นสู้ใหม่", scenesCount: 31 },
  { beatNumber: 8, title: "8. การพลิกกลับ & เตรียมศึกชี้ขาด", timeRange: "35:00 - 40:00 น. (ฉาก 218-248)", goal: "ปลดล็อกพลังสูงสุด งัดไม้ตายสุดท้าย หรืออาวุธลับที่เตรียมไว้", scenesCount: 31 },
  { beatNumber: 9, title: "9. มหาศึกตัดสินครั้งสุดท้าย (Grand Climax)", timeRange: "40:00 - 45:00 น. (ฉาก 249-279)", goal: "การปะทะสุดเดือด ทุกตัวละครใช้พลังและความสามารถทั้งหมดเพื่อเอาชนะ", scenesCount: 31 },
  { beatNumber: 10, title: "10. บทสรุป & ก้าวสู่ยุคใหม่", timeRange: "45:00 - 51:20 น. (ฉาก 280-308)", goal: "คลี่คลายทุกปม ชะตากรรมของทุกฝ่าย และเปิดฉากสู่อนาคตที่เปลี่ยนแปลงไปตลอดกาล", scenesCount: 29 },
];

/**
 * Generate 4-Section Production Prompts
 */
export function generateProductionPrompt(
  scene: ScriptScene,
  project: ProjectData
): ProductionPromptSections {
  const loc = project.locations.find((l) => l.id === scene.locationId) || {
    code: "LOC-DEF",
    name: scene.locationName || "Cinematic Studio Environment",
    atmosphere: "Atmospheric volumetric cinema lighting",
    promptKeyword: "photorealistic film set",
  };

  const propsInScene = (scene.propIds || [])
    .map((pid) => project.props.find((p) => p.id === pid))
    .filter(Boolean) as PropItem[];

  const propKeywords = propsInScene
    .map((p) => `[${p.code}: ${p.name} - ${p.promptKeyword}]`)
    .join(", ");

  // 1. Camera & Lens Settings
  const cameraLens = [
    `Cinematic Lens: 35mm Anamorphic Prime f/1.8`,
    `Shot Type: ${scene.shotType || "Medium Shot (MS)"}`,
    `Camera Angle: ${scene.cameraAngle || "Eye Level"}`,
    `Focus: ${scene.focusType || "Shallow Focus / Bokeh"}${scene.focusDetail ? ` (${scene.focusDetail})` : ""}`,
    `Composition: ${scene.compositionType || "Center Frame"}${scene.compositionDetail ? ` (${scene.compositionDetail})` : ""}`,
    `Camera Movement: ${scene.cameraMovement || "Static Shot"}`,
    `Frame Rate: 60fps high dynamic motion, stable camera tracking`,
  ].join(", ");

  // 2. Subjects & Staging
  const speakerPart = scene.speaker ? `Primary Speaker: [${scene.speaker}]` : "Primary Subject";
  const listenerPart = scene.listener ? `Listener / Secondary: [${scene.listener}]` : "";
  const dialoguePart = scene.dialogue ? `Dialogue/Voice: "${scene.dialogue}"` : "";
  const actionPart = scene.action ? `Action/Staging: ${scene.action}` : "Standing in frame";
  const propsPart = propKeywords ? `Interactive Props: ${propKeywords}` : "";

  const subjectsStaging = [speakerPart, listenerPart, actionPart, dialoguePart, propsPart]
    .filter(Boolean)
    .join(" | ");

  // 3. Lighting & Style
  const lightingStyle = [
    `Location: [${loc.code}: ${loc.name}]`,
    `Atmosphere & Lighting: ${loc.atmosphere || "Cinematic volumetric haze, deep shadows"}`,
    `Environment Keywords: ${loc.promptKeyword || "hyper-realistic cinema render"}`,
    `Aesthetics: ${project.visualStyle || "Masterpiece film cinematography"}`,
    `Director Grading: ${project.directorStyle || "Cinematic 8K, color graded"}`,
  ].join(", ");

  // 4. Negative & AI Constraints
  const rulesList = (project.aiRules && project.aiRules.length > 0)
    ? project.aiRules.join(", ")
    : DEFAULT_AI_RULES.join(", ");

  const negativeConstraints = [
    `Negative Prompt: low quality, blurry, extra limbs, mutated hands, deformed fingers, morphing, jitter, flickering, frame distortion, oversaturated cartoon`,
    `AI Directives: ${rulesList}`,
  ].join(" | ");

  // Full Combined Prompt
  const fullCombinedPrompt = [
    `[CAMERA & LENS]: ${cameraLens}`,
    `[SUBJECTS & STAGING]: ${subjectsStaging}`,
    `[LIGHTING & STYLE]: ${lightingStyle}`,
    `[NEGATIVE & CONSTRAINTS]: ${negativeConstraints}`,
  ].join("\n\n");

  return {
    cameraLens,
    subjectsStaging,
    lightingStyle,
    negativeConstraints,
    fullCombinedPrompt,
  };
}

/**
 * Auto Re-Time Sequential Scenes (0-10s, 10-20s, ...)
 */
export function autoReTimeScenes(scenes: ScriptScene[], defaultDurationSec: number = 10): ScriptScene[] {
  let currentStart = 0;
  return scenes.map((s, index) => {
    const dur = s.durationSec > 0 ? s.durationSec : defaultDurationSec;
    const start = currentStart;
    const end = start + dur;
    currentStart = end;
    return {
      ...s,
      sceneNumber: index + 1,
      startTimeSec: start,
      endTimeSec: end,
      durationSec: dur,
    };
  });
}

/**
 * Generate 3,000 Seconds / 308 Scenes Short Movie (VIP Mode)
 */
export function generateVip3000SecondsMovie(title: string, genre: string): ProjectData {
  const props: PropItem[] = [
    {
      id: "prop-01",
      code: "PROP-01",
      name: "นาฬิกาดิจิทัลนับถอยหลัง (Doomsday Chrono)",
      description: "นาฬิกาข้อมือยุทธวิธีเรืองแสงสีฟ้า แสดงเวลานับถอยหลังวันสิ้นโลกและพิกัดดาวเทียม",
      promptKeyword: "tactical digital smartwatch, holographic glowing blue countdown timer, titanium bezel",
    },
    {
      id: "prop-02",
      code: "PROP-02",
      name: "ปืนลูกซองยุทธวิธีสะพายหลัง (Tactical Combat Shotgun)",
      description: "ปืนลูกซองสีดำด้าน ติดกล้องโฮโลแกรมและไฟฉายส่องสว่างทางยุทธวิธี",
      promptKeyword: "matte-black tactical combat shotgun, holographic sight, attached tactical strobe light",
    },
    {
      id: "prop-03",
      code: "VEH-01",
      name: "รถกระบะหุ้มเกราะดัดแปลงพิเศษ (Armored 4x4 Rover)",
      description: "รถออฟโรดยกสูง เสริมเกราะเหล็กกันกระสุน กันชนเหล็กหนา และไฟสปอร์ตไลท์หลังคา",
      promptKeyword: "reinforced heavy armored 4x4 pickup truck, bulletproof mesh glass, high roof floodlights",
    },
    {
      id: "prop-04",
      code: "PROP-03",
      name: "กล่องโลหะบรรจุเซรุ่มปฏิชีวนะ (Cryo Medicine Case)",
      description: "กระเป๋าโลหะนิรภัยล็อกรหัสชีวภาพ มีไอเย็นพวยพุ่งเมื่อเปิดออก",
      promptKeyword: "metallic biosecurity cryo-case with digital keypad lock, frozen vapor venting",
    },
  ];

  const locations: LocationItem[] = [
    {
      id: "loc-01",
      code: "ROOM-01",
      name: "เซฟเฮาส์ชั้นใต้ดินป้อมปราการ (Underground Bunker)",
      description: "ห้องบัญชาการกำแพงคอนกรีตหนา เสริมแผ่นเหล็ก ประตูนิรภัยไฮดรอลิก และจอเรดาร์แสดงสถานการณ์",
      atmosphere: "Moody bunker lighting, cool steel reflections, amber status monitors, volumetric dust particles",
      promptKeyword: "fortified underground bunker interior, heavy blast doors, command center monitors",
    },
    {
      id: "loc-02",
      code: "STREET-01",
      name: "ถนนซากปรักหักพังยามราตรี (Flooded Ruined Avenue)",
      description: "ถนนกลางมหานครที่ถูกทิ้งร้าง มีน้ำท่วมขัง ซากตึกสูงระฟ้า และสายฝนเทกระหน่ำไม่ขาดสาย",
      atmosphere: "Torrential midnight rain, wet reflective asphalt, neon cyberpunk ruins reflection, heavy mist",
      promptKeyword: "flooded apocalyptic metropolis avenue, abandoned towering skyscrapers, heavy rainfall",
    },
    {
      id: "loc-03",
      code: "LAB-01",
      name: "ห้องทดลองลับศูนย์วิจัยกลาง (Classified Research Lab)",
      description: "ห้องแล็บกระจกกันกระสุน หลอดทดลองเรืองแสงสีเขียว-ฟ้า และสายไฟระโยงระยาง",
      atmosphere: "Cold clinical blue fluorescent tubes, flashing warning sirens, sterile stainless steel",
      promptKeyword: "high-tech underground bio-lab, shattered containment tubes, glowing chemical fluids",
    },
    {
      id: "loc-04",
      code: "ROOF-01",
      name: "ดาดฟ้าตึกระฟ้าท่ามกลางพายุ (Skyline Helipad)",
      description: "ลานจอดเฮลิคอปเตอร์ชั้นดาดฟ้า มองเห็นทัศนียภาพเมืองทั้งเมืองที่จมอยู่ใต้เมฆดำและสายฟ้าฟาด",
      atmosphere: "Violent storm wind, thunder flashes illuminating towering city skyline, dramatic dark clouds",
      promptKeyword: "rooftop skyscraper helipad at night, raging lightning storm, panoramic cityscape view",
    },
  ];

  const characters: CharacterItem[] = [
    {
      id: "char-01",
      code: "CHAR-01",
      name: "กานต์ (ผู้นำ/ผู้รอดชีวิต)",
      role: "Protagonist",
      visualDescription: "ชายไทยวัย 32 ปี แววตาคมกริบ มุ่งมั่น สวมแจ็กเก็ตยุทธวิธีสีดำกันน้ำและสายสะพายอาวุธ",
      voiceTone: "สุขุม ดุดัน เด็ดขาด ไม่ลังเล",
    },
    {
      id: "char-02",
      code: "CHAR-02",
      name: "ริน (แพทย์และผู้เชี่ยวชาญไวรัส)",
      role: "Key Ally",
      visualDescription: "หญิงสาววัย 28 ปี ผมสั้นรวบกระชับ สวมเสื้อกาวน์กันเปื้อนทับชุดลำลองทะมัดทะแมง",
      voiceTone: "ฉลาด จริงจัง มีสติและเห็นอกเห็นใจ",
    },
    {
      id: "char-03",
      code: "CHAR-03",
      name: "จ่าหาญ (อดีตหน่วยรบพิเศษ)",
      role: "Tactical Specialist",
      visualDescription: "ชายกำยำร่างใหญ่ วัย 40 ปี มีรอยแผลเป็นที่แก้มขวา สวมเสื้อเกราะยุทธวิธีเต็มยศ",
      voiceTone: "ห้าวหาญ เสียสละ ระมัดระวังตลอดเวลา",
    },
    {
      id: "char-04",
      code: "CHAR-04",
      name: "ดร.ศรัณย์ (หัวหน้านักวิทยาศาสตร์ทรยศ)",
      role: "Antagonist",
      visualDescription: "ชายวัย 50 ปี ใส่แว่นกรอบทอง รอยยิ้มเย็นชา เจ้าเล่ห์ ในสูทคัตติ้งเนี้ยบเปื้อนคราบสารเคมี",
      voiceTone: "เยือกเย็น ยโสโอหัง มองมนุษย์เป็นเพียงหนูลองยา",
    },
  ];

  // Synthesize 308 scenes across the 10 beats
  const scenes: ScriptScene[] = [];
  let sceneCounter = 1;
  let accumulatedTime = 0;

  DEFAULT_10_BEATS.forEach((beat, bIndex) => {
    const countForThisBeat = beat.scenesCount;
    for (let i = 0; i < countForThisBeat; i++) {
      const sceneNum = sceneCounter++;
      const duration = 10;
      const start = accumulatedTime;
      const end = start + duration;
      accumulatedTime = end;

      // Assign rotating attributes for high variety
      const loc = locations[sceneNum % locations.length];
      const speakerChar = (sceneNum % 3 === 0) ? characters[0] : (sceneNum % 3 === 1 ? characters[1] : characters[2]);
      const listenerChar = (speakerChar.code === characters[0].code) ? characters[1] : characters[0];
      const prop = props[sceneNum % props.length];
      const focus = FOCUS_OPTIONS[sceneNum % FOCUS_OPTIONS.length];
      const comp = COMPOSITION_OPTIONS[sceneNum % COMPOSITION_OPTIONS.length];
      const shot = SHOT_TYPES[sceneNum % SHOT_TYPES.length];
      const angle = CAMERA_ANGLES[sceneNum % CAMERA_ANGLES.length];
      const move = CAMERA_MOVEMENTS[sceneNum % CAMERA_MOVEMENTS.length];

      let dialogue = "";
      let action = "";

      if (bIndex === 0) {
        action = `กานต์ตรวจเช็กหน้าจอดิจิทัล [${prop.code}] ท่ามกลางบรรยากาศตึงเครียดใน [${loc.code}] เสียงฟ้าร้องเริ่มคำราม`;
        dialogue = (i % 2 === 0) ? "เวลาที่เหลืออยู่แทบไม่มีแล้ว... พายุลูกนี้ไม่ธรรมดาแน่นอน" : "ทุกคนเตรียมตัวให้พร้อม อย่าให้มีอะไรผิดพลาดเด็ดขาด";
      } else if (bIndex === 1) {
        action = `สัญญาณเตือนภัยสีแดงดังระงมทั่ว [${loc.code}] รินตรวจเช็กข้อมูลเรดาร์แล้วหันมาสบตากับทุกคนด้วยความวิตก`;
        dialogue = "ค่าระดับอันตรายพุ่งทะลุขีดแดงแล้วค่ะ เราต้องตัดสินใจเดี๋ยวนี้!";
      } else if (bIndex === 2) {
        action = `จ่าหาญลำเลียงกล่องยุทธวิธีและเตรียม [${prop.code}] ขึ้นรถ [VEH-01] ตรวจเช็กกระสุนและอุปกรณ์ทุกชิ้น`;
        dialogue = "คลังอาวุธและพลังงานสำรองพร้อมแล้ว หัวหน้าสั่งการมาได้เลย";
      } else if (bIndex === 3) {
        action = `ขบวนรถลุยผ่าน [${loc.code}] น้ำท่วมสูงกระเซ็นปะทะกระจกหน้าต่าง เงาลึกลับบางอย่างเริ่มเคลื่อนไหวในเงามืด`;
        dialogue = "ระวังซ้ายมือ! มีบางอย่างกำลังดักซุ่มอยู่ข้างตึกร้าง!";
      } else if (bIndex === 4) {
        action = `การปะทะเริ่มต้นขึ้นอย่างดุเดือด! แสงไฟจากปากกระบอกปืน [${prop.code}] สว่างวาบตัดกับความมืดใน [${loc.code}]`;
        dialogue = "ยิงคุ้มกันแนวหน้าไว้! อย่าให้พวกมันบุกทะลุแนวกั้นเข้ามาได้!";
      } else if (bIndex === 5) {
        action = `กานต์นำกำลังรุกคืบเข้าสู่ส่วนลึกของ [${loc.code}] พบหลักฐานชิ้นสำคัญที่ ดร.ศรัณย์ ทิ้งร่องรอยไว้`;
        dialogue = "ไม่ใช่แค่อุบัติเหตุธรรมชาติ... แต่มีคนจงใจปล่อยมันออกมา!";
      } else if (bIndex === 6) {
        action = `แรงระเบิดทำให้กำแพง [${loc.code}] สั่นสะเทือน รินต้องปฐมพยาบาลผู้บาดเจ็บด้วยความเร่งด่วนท่ามกลางไอควัน`;
        dialogue = "ทนไว้ก่อนนะ! ฉันจะไม่ยอมให้ใครต้องตายในภารกิจนี้เด็ดขาด!";
      } else if (bIndex === 7) {
        action = `กานต์ปลดล็อกเซฟตี้ของ [${prop.code}] แววตามุ่งมั่นไม่ถอย พร้อมระดมความกล้าครั้งสุดท้ายของทั้งทีม`;
        dialogue = "เราถอยมามากพอแล้ว ต่อจากนี้คือเวลาเช็กบิลพวกมัน!";
      } else if (bIndex === 8) {
        action = `ฉากประจัญบานครั้งสุดท้ายบน [${loc.code}] แสงสายฟ้าฟาดส่องให้เห็นเงาการต่อสู้ชี้ชะตาช็อตต่อช็อต`;
        dialogue = "เกมของแกจบลงแล้ว ศรัณย์! มนุษยชาติจะไม่มีวันยอมจำนน!";
      } else {
        action = `รุ่งอรุณแรกแห่งแสงอาทิตย์สาดส่องผ่านม่านเมฆเหนือ [${loc.code}] ทุกคนมองดูผืนฟ้าใหม่ด้วยความหวัง`;
        dialogue = "พายุผ่านพ้นไปแล้ว... และพวกเราคือผู้รอดชีวิต";
      }

      scenes.push({
        id: `scene-${sceneNum}`,
        sceneNumber: sceneNum,
        startTimeSec: start,
        endTimeSec: end,
        durationSec: duration,
        speaker: speakerChar.name,
        listener: listenerChar.name,
        dialogue,
        action,
        locationId: loc.id,
        locationName: loc.name,
        focusType: focus,
        focusDetail: `โฟกัสชัดที่ใบหน้าของ ${speakerChar.name} และวัตถุ [${prop.code}]`,
        compositionType: comp,
        compositionDetail: `จัดวางตามหลัก ${comp.split(" ")[0]} ตัวละครยืนเยื้องระนาบเพื่อมิติภาพยนตร์`,
        shotType: shot,
        cameraAngle: angle,
        cameraMovement: move,
        propIds: [prop.id],
        notes: `บีทที่ ${beat.beatNumber}: ${beat.title}`,
      });
    }
  });

  return {
    id: `project-${Date.now()}`,
    title: title || "มหาพายุโลกาวินาศ 3,000 วินาที (The Last Horizon)",
    synopsis: "เมื่อมหาพายุฝนและคลื่นยักษ์กลืนกินอารยธรรม กลุ่มผู้รอดชีวิตต้องต่อสู้กับกลุ่มอิทธิพลมืดและเชื้อไวรัสกลายพันธุ์เพื่อกุมชะตากรรมสุดท้ายของมนุษยชาติ",
    genre: genre || "Sci-Fi Survival Action Thriller",
    visualStyle: "High-Budget Hollywood Cinematic, Dark Moody Neon & Rain, Volumetric Lighting, 8K Ultra-Detailed",
    directorStyle: "Denis Villeneuve x Christopher Nolan - Realistic, Grand Scale, Deep Bass Tone, Precise Framing",
    props,
    locations,
    characters,
    scenes,
    tenBeats: DEFAULT_10_BEATS,
    aiRules: DEFAULT_AI_RULES,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Local Storage Persistence Helpers
 */
const STORAGE_KEY = "cineprompt_vip_v8_project";
const GEMINI_KEY = "cineprompt_gemini_api_key";

export function saveProjectToStorage(project: ProjectData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (err) {
    console.error("Failed to save project to localStorage:", err);
  }
}

export function loadProjectFromStorage(): ProjectData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load project from localStorage:", err);
    return null;
  }
}

export function getGeminiApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(GEMINI_KEY) || "";
}

export function setGeminiApiKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GEMINI_KEY, key.trim());
}
