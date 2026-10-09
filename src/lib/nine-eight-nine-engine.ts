import { Project, ScriptScene, CharacterBible, LocationItem, PropItem } from './types';
import { cleanSceneTitle } from './script-templates';

export interface ProductionPrompt989 {
  fullPrompt: string;
  cameraLensText: string;
  subjectsStagingText: string;
  lightingStyleText: string;
  constraintsNegativeText: string;
}

/**
 * โฟกัสกล้องยอดนิยม (Focus Presets) สำหรับ 989 Ai Prompt
 */
export const FOCUS_OPTIONS = [
  { id: 'deep_focus', label: 'Deep Focus (ชัดลึก (ชัดทั้งภาพ))', desc: 'ชัดลึกเห็นชัดเจนตั้งแต่หน้าฉากไปจนถึงฉากหลังสุด' },
  { id: 'shallow_focus', label: 'Shallow Focus (ชัดตื้น (หน้าชัดหลังเบลอ))', desc: 'โฟกัสเฉพาะตัวละครหลัก ละลายฉากหลังให้นุ่มนวลแบบโบเก้' },
  { id: 'rack_focus', label: 'Rack Focus (สลับจุดโฟกัส)', desc: 'เปลี่ยนจุดชัดจากวัตถุหน้าไปหาตัวละครด้านหลัง หรือสลับไปมา' },
  { id: 'soft_focus', label: 'Soft Focus (ฟุ้งละมุนชวนฝัน)', desc: 'ภาพนุ่มนวล แสงฟุ้งกระจาย มีมนต์ขลังหรือโรแมนติก' },
  { id: 'split_diopter', label: 'Split Diopter (ชัดคู่สองระยะ)', desc: 'หน้าชัดและหลังชัดพร้อมกันอย่างคมกริบแบบภาพยนตร์คลาสสิก' },
  { id: 'pan_focus', label: 'Pan Focus (โฟกัสครอบคลุมมุมกว้าง)', desc: 'คมชัดทั่วทั้งทัศนียภาพอันกว้างใหญ่' },
];

/**
 * การจัดองค์ประกอบภาพยอดนิยม (Composition Presets) สำหรับ 989 Ai Prompt
 */
export const COMPOSITION_OPTIONS = [
  { id: 'center_frame', label: 'Center Frame (กึ่งกลางภาพ)', desc: 'วัตถุหรือตัวละครเอกอยู่กึ่งกลางเฟรม โดดเด่น ทรงพลัง สมดุล' },
  { id: 'rule_of_thirds', label: 'Rule of Thirds (กฎสามส่วน)', desc: 'วางจุดสนใจไว้ที่จุดตัดเส้น 1 ใน 3 เพื่อความน่ามองและมีมิติ' },
  { id: 'golden_ratio', label: 'Golden Ratio (สัดส่วนทองคำ)', desc: 'การจัดวางตามเส้นโค้งฟีโบนักชี นำสายตาสู่จุดสำคัญอย่างเป็นธรรมชาติ' },
  { id: 'leading_lines', label: 'Leading Lines (เส้นนำสายตา)', desc: 'ใช้ถนน ทางเดิน หรือแสงนำสายตาพุ่งตรงไปยังตัวละคร' },
  { id: 'symmetrical', label: 'Symmetrical (สมมาตรสมบูรณ์แบบ)', desc: 'แบ่งซ้ายขวาอย่างเท่ากัน สไตล์ภาพยนตร์ของผู้กำกับระดับโลก' },
  { id: 'over_the_shoulder', label: 'Over-the-Shoulder (ถ่ายข้ามไหล่)', desc: 'มองผ่านหัวไหล่ตัวละครคู่สนทนา สร้างความรู้สึกมีส่วนร่วม' },
  { id: 'dutch_angle_frame', label: 'Dutch Angle (เอียงเฟรมสร้างความกดดัน)', desc: 'มุมกล้องเอียงเพื่อสื่อถึงความสับสน ตึงเครียด หรืออันตราย' },
  { id: 'extreme_closeup_frame', label: 'Extreme Close-Up Framing (โคลสอัปประชิด)', desc: 'เจาะจงที่แววตา ริมฝีปาก หรือหยดเหงื่อ สื่ออารมณ์ลึกซึ้ง' },
];

/**
 * ขนาดภาพและมุมกล้องภาพยนตร์ (Shot Types & Camera Angles)
 */
export const SHOT_TYPES = [
  { id: 'WS', label: 'Wide Shot (WS - ภาพมุมกว้าง)', desc: 'เห็นสถานที่โดยรวมและตัวละครเต็มตัว' },
  { id: 'EWS', label: 'Extreme Wide Shot (EWS - กว้างสุดสายตา)', desc: 'เน้นความยิ่งใหญ่ของสถานที่ ตัวละครมีขนาดเล็ก' },
  { id: 'MS', label: 'Medium Shot (MS - ภาพครึ่งตัว)', desc: 'เห็นตัวละครตั้งแต่เอวขึ้นไป เหมาะกับบทสนทนา' },
  { id: 'MCU', label: 'Medium Close-Up (MCU - ภาพระดับอก)', desc: 'เน้นสีหน้าและอารมณ์ตัวละครชัดเจน' },
  { id: 'CU', label: 'Close-Up (CU - โคลสอัปใบหน้า)', desc: 'เจาะเฉพาะใบหน้าเต็มเฟรม ถ่ายทอดอารมณ์สูงสุด' },
  { id: 'OTS', label: 'Over-The-Shoulder (OTS - ข้ามไหล่)', desc: 'ถ่ายข้ามไหล่ตัวละครหนึ่งไปยังอีกตัวละคร' },
  { id: 'POV', label: 'Point-Of-View (POV - มุมมองสายตาตัวละคร)', desc: 'ผู้ชมมองเห็นโลกผ่านสายตาของตัวละคร' },
];

export const CAMERA_ANGLES = [
  { id: 'eye_level', label: 'Eye-Level (ระดับสายตา)', desc: 'มุมมองสมจริง เป็นกลาง เป็นธรรมชาติ' },
  { id: 'low_angle', label: 'Low Angle (มุมเงย)', desc: 'กล้องอยู่ต่ำมองขึ้น ทำให้ตัวละครดูยิ่งใหญ่ น่าเกรงขาม' },
  { id: 'high_angle', label: 'High Angle (มุมก้ม)', desc: 'กล้องอยู่สูงมองลง ทำให้ตัวละครดูเปราะบาง โดดเดี่ยว' },
  { id: 'birds_eye', label: 'Bird’s Eye View (มุมมองนกมองจากฟ้า)', desc: 'มองลงมาจากมุมสูงในแนวดิ่ง 90 องศา' },
  { id: 'worm_eye', label: 'Worm’s Eye View (มุมมองจากพื้น)', desc: 'กล้องแทบติดพื้น แหงนมองขึ้นสู่ท้องฟ้า' },
  { id: 'dutch_angle', label: 'Dutch Angle (มุมเอียง)', desc: 'ระนาบกล้องเอียง สื่อถึงความไม่มั่นคงหรือวิกฤต' },
];

export const CAMERA_MOVEMENTS = [
  { id: 'push_in', label: 'Push In (เคลื่อนกล้องเข้าไปหาอย่างช้าๆ)', desc: 'ซูม/ดอลลี่เข้าหาตัวละครเพื่อเพิ่มความตึงเครียด' },
  { id: 'pull_out', label: 'Pull Out (เคลื่อนกล้องถอยห่างออกมา)', desc: 'ถอยออกจากตัวละครเพื่อเปิดเผยสภาพแวดล้อมโดยรอบ' },
  { id: 'pan_horizontal', label: 'Pan (กวาดกล้องแนวนอน ซ้าย/ขวา)', desc: 'หมุนกล้องในแนวนอนเพื่อตามการเคลื่อนไหว' },
  { id: 'tilt_vertical', label: 'Tilt (กวาดกล้องแนวตั้ง ขึ้น/ลง)', desc: 'หมุนกล้องในแนวตั้งจากล่างขึ้นบนหรือบนลงล่าง' },
  { id: 'tracking_shot', label: 'Tracking Shot (เคลื่อนกล้องขนานตามตัวละคร)', desc: 'กล้องวิ่งตามประกบข้างหรือด้านหน้าตัวละคร' },
  { id: 'orbit_360', label: 'Orbit 360 (บินวนรอบตัวละคร)', desc: 'เคลื่อนกล้องหมุนวนรอบตัวละคร 360 องศา สุดอลังการ' },
  { id: 'static_shot', label: 'Static Lock (ล็อคกล้องนิ่งสนิท)', desc: 'กล้องตั้งนิ่งไม่มีการขยับ ปล่อยให้การกระทำเคลื่อนไหว' },
];

/**
 * 5 กฎเหล็กบังคับ AI (Default 989 AI Rules)
 */
export const DEFAULT_989_AI_RULES = [
  'รักษาใบหน้า ทรงผม และสีผิวของตัวละครให้ตรงตาม Character Anchor สม่ำเสมอตลอดทุกฉาก 100%',
  'ล็อคสีและรูปแบบเสื้อผ้า รวมถึง Props/ยานพาหนะ ไม่ให้เปลี่ยนสีหรือสลับแบบข้ามฉาก',
  'จัดวางองค์ประกอบแบบ Single Unified Camera Shot เฟรมเดียว ห้ามแบ่งครึ่งจอ (No Split-Screen / No Comic Panels)',
  'แสงเงาและสภาพอากาศต้องต่อเนื่องตามสถานที่ (ROOM / EXTERIOR) ไม่กระโดดข้ามเวลา',
  'การเคลื่อนไหวกล้องคมชัด 60fps ลื่นไหลแบบภาพยนตร์โรง ไม่มีภาพเบลอหรือสัดส่วนผิดเพี้ยน',
];

/**
 * สร้าง Production Prompt สไตล์ 989 Ai Prompt v8 (VIP Mode)
 */
export function generateProductionPrompt989(params: {
  scene: ScriptScene;
  project: Project;
  location?: LocationItem;
  charactersInScene?: CharacterBible[];
  propsInScene?: PropItem[];
}): ProductionPrompt989 {
  const { scene, project, location, charactersInScene = [], propsInScene = [] } = params;

  const sceneTitleClean = cleanSceneTitle(scene.title);
  const aspectRatio = project.aspectRatio || scene.aspectRatio || '16:9';
  const visualMedium = project.visualMedium === 'animation' ? 'Anime / 3D Animation' : 'Cinematic Live-Action';

  // 1. Camera & Lens Settings
  const shotTypeStr = scene.shotType || 'Wide Shot (WS)';
  const cameraAngleStr = scene.cameraAngle || 'Eye-Level (ระดับสายตา)';
  const cameraMoveStr = scene.cameraMovement || 'Push In (เคลื่อนกล้องเข้าไปหาอย่างช้าๆ)';
  const focusStr = scene.focusType
    ? `${scene.focusType}${scene.focusDetail ? ` - ${scene.focusDetail}` : ''}`
    : 'Deep Focus (ชัดลึก (ชัดทั้งภาพ))';
  const compositionStr = scene.compositionType
    ? `${scene.compositionType}${scene.compositionDetail ? ` - ${scene.compositionDetail}` : ''}`
    : 'Center Frame (กึ่งกลางภาพ)';

  const cameraLensText = `** 1. 🎥 Camera & Lens Settings **
• Target Output: 🎬 Video Gen (Kling AI / Runway Gen-3 / Luma Dream / Google Flow)
• Resolution & Format: 4K / Ultra HD | Aspect Ratio: ${aspectRatio} | FPS: 24/60fps | Lens: 35mm Cinema Lens
• Shot Type: (${shotTypeStr})
• Camera Angle: (${cameraAngleStr})
• Camera Movement: (${cameraMoveStr})
• Focus: ${focusStr}
• Composition: ${compositionStr}`;

  // 2. Subjects & Staging
  const locIdStr = location ? `[${location.name || scene.locationName || 'ห้องหลัก'}]` : `[${scene.locationName || 'สถานที่หลัก'}]`;
  const locDescStr = location?.description
    ? ` ★ ${location.description}${location.lighting ? ` (${location.lighting})` : ''}`
    : ` ★ บรรยากาศฉากสมจริง สอดคล้องกับเนื้อเรื่อง`;

  const charactersListStr =
    charactersInScene.length > 0
      ? charactersInScene
          .map((c, idx) => {
            const charCode = `CHAR-${String(idx + 1).padStart(2, '0')}`;
            return `• [${charCode}: ${c.name}] รูปลักษณ์: ${c.appearanceAnchor || 'ใบหน้าคมชัด'}, สวมใส่: ${c.clothingStyle || 'ชุดประจำตัว'}${c.weaponsOrProps ? `, พกพา: ${c.weaponsOrProps}` : ''}`;
          })
          .join('\n')
      : '• [ตัวละครหลัก]: ยืนประจำตำแหน่งในฉาก กำลังแสดงอารมณ์ตามบท';

  const propsListStr =
    propsInScene.length > 0
      ? propsInScene
          .map((p) => `• [${p.id || 'PROP'}]: ${p.name} - ${p.description}${p.colorLock ? ` (ล็อคสี: ${p.colorLock})` : ''}`)
          .join('\n')
      : '';

  const actionText = scene.narration
    ? scene.narration.replace(/\n/g, ' ')
    : sceneTitleClean;

  const dialogueText =
    scene.dialogues && scene.dialogues.length > 0
      ? '\n• บทพูด/Lip-sync:\n' +
        scene.dialogues.map((d) => `  - ${d.speaker} (${d.emotion}): "${d.text}"`).join('\n')
      : '';

  const subjectsStagingText = `** 2. 👤 Subjects & Staging **
• Location: ${locIdStr}${locDescStr}
• ตัวละครที่ปรากฏ:
${charactersListStr}
${propsListStr ? `• สิ่งของ/ยานพาหนะ (Props):\n${propsListStr}\n` : ''}• การกระทำในฉาก (Action): ${actionText}${dialogueText}`;

  // 3. Lighting & Style
  const lightingStr = scene.lighting || 'Cinematic Lighting, แสงเงา Chiaroscuro ลุ่มลึก';
  const styleKeywords = project.visualMedium === 'animation'
    ? 'แอนิเมชันคุณภาพสูงระดับ Wit Studio & Ufotable ลายเส้นคมชัด 8K รายละเอียดประณีต'
    : 'ภาพยนตร์ระดับฮอลลีวูด เลนส์ 35mm ถ่ายทำจริง ผิวคนสมจริง รายละเอียด 8K';

  const lightingStyleText = `** 3. 🎨 Lighting & Style **
• Visual Style: ${visualMedium} - ${styleKeywords}
• Lighting & Atmosphere: ${lightingStr}
• Color Grading: ฟิล์มภาพยนตร์ คอนทราสต์ลุ่มลึก อารมณ์ตรึงใจ`;

  // 4. Negative & AI Constraints
  const rules = project.aiRules && project.aiRules.length > 0 ? project.aiRules : DEFAULT_989_AI_RULES;
  const constraintsNegativeText = `** 4. 🚫 Negative & AI Constraints (บังคับ AI) **
• กฎเหล็กบังคับความต่อเนื่อง:
${rules.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}
• Negative Prompt: ${scene.negativePrompt || 'cartoon, deformed, blur, split screen, dual frame, collage, bad anatomy, text watermark, low quality, duplicate faces'}`;

  // Full Combined Prompt
  const fullPrompt = `[🎬 989 Ai Prompt (v8 VIP Mode) - ฉากที่ ${scene.sceneNumber}: ${sceneTitleClean} (${scene.startTimeSec ?? (scene.sceneNumber - 1) * 10}s - ${scene.endTimeSec ?? scene.sceneNumber * 10}s)]

${cameraLensText}

${subjectsStagingText}

${lightingStyleText}

${constraintsNegativeText}`;

  return {
    fullPrompt,
    cameraLensText,
    subjectsStagingText,
    lightingStyleText,
    constraintsNegativeText,
  };
}

/**
 * ฟังก์ชันเรียงเวลาอัตโนมัติ (Auto Re-Time) ให้ทุกฉากเชื่อมต่อกันวินาทีต่อวินาที
 */
export function autoReTimeScenes(scenes: ScriptScene[], secondsPerScene = 10): ScriptScene[] {
  let currentTime = 0;
  return scenes.map((s) => {
    const start = currentTime;
    const duration = s.estimatedDurationSec || secondsPerScene;
    const end = start + duration;
    currentTime = end;
    return {
      ...s,
      startTimeSec: start,
      endTimeSec: end,
      estimatedDurationSec: duration,
    };
  });
}

/**
 * ส่งออกโปรเจกต์เป็นไฟล์ JSON ตามโครงสร้างมาตรฐานของ 989 Ai Prompt
 */
export function export989ProjectJson(project: Project): string {
  const exportData = {
    app: '989 Ai Prompt',
    version: '8.0 (VIP Mode)',
    exportedAt: new Date().toISOString(),
    project: {
      id: project.id,
      title: project.title,
      synopsis: project.synopsis,
      genre: project.genre,
      worldCulture: project.worldCulture,
      visualMedium: project.visualMedium,
      stylePreset: project.stylePreset,
      aspectRatio: project.aspectRatio,
      targetDurationMinutes: project.targetDurationMinutes,
      totalScenes: project.scenes?.length || 0,
      totalDurationSeconds: (project.scenes?.length || 0) * 10,
    },
    props: project.props || [],
    locations: project.locations || [],
    characters: project.characters || [],
    aiRules: project.aiRules || DEFAULT_989_AI_RULES,
    scenes: (project.scenes || []).map((s) => ({
      sceneNumber: s.sceneNumber,
      actNumber: s.actNumber,
      title: cleanSceneTitle(s.title),
      timeRange: `${s.startTimeSec ?? (s.sceneNumber - 1) * 10} - ${s.endTimeSec ?? s.sceneNumber * 10}s`,
      locationId: s.locationId || '',
      locationName: s.locationName || '',
      focus: {
        type: s.focusType || 'Deep Focus (ชัดลึก (ชัดทั้งภาพ))',
        detail: s.focusDetail || '',
      },
      composition: {
        type: s.compositionType || 'Center Frame (กึ่งกลางภาพ)',
        detail: s.compositionDetail || '',
      },
      shotType: s.shotType || 'Wide Shot (WS)',
      cameraAngle: s.cameraAngle || 'Eye-Level',
      cameraMovement: s.cameraMovement || 'Push In',
      narration: s.narration,
      dialogues: s.dialogues || [],
      sfxBgm: s.sfxBgm || '',
      imagePrompt: s.imagePrompt,
      videoMotionPrompt: s.videoMotionPrompt,
      googleFlowPrompt: s.googleFlowPrompt,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * ส่งออกเฉพาะช่วงฉากที่เลือก (Selected Range) หรือทั้งช่วง 1-10 บล็อก เป็น JSON
 */
export function export989ScenesRangeJson(
  project: Project,
  startSceneNum?: number,
  endSceneNum?: number
): string {
  const allScenes = project.scenes || [];
  const start = startSceneNum ? Math.max(1, startSceneNum) : 1;
  const end = endSceneNum ? Math.min(allScenes.length, endSceneNum) : allScenes.length;

  const targetScenes = allScenes.filter(
    (s) => s.sceneNumber >= start && s.sceneNumber <= end
  );

  const exportData = {
    app: '989 Ai Prompt',
    version: '8.0 (VIP Mode)',
    exportedAt: new Date().toISOString(),
    projectTitle: project.title,
    sceneRange: `ฉากที่ ${start} ถึง ${end}`,
    totalExportedScenes: targetScenes.length,
    propsUsed: (project.props || []).filter((p) =>
      targetScenes.some((s) => (s.propIds || []).includes(p.id))
    ),
    locationsUsed: (project.locations || []).filter((l) =>
      targetScenes.some((s) => s.locationId === l.id || s.locationName === l.name)
    ),
    scenes: targetScenes.map((s) => {
      const loc = (project.locations || []).find(
        (l) => l.id === s.locationId || l.name === s.locationName
      );
      const props = (project.props || []).filter((p) => (s.propIds || []).includes(p.id));
      const promptObj = generateProductionPrompt989({
        scene: s,
        project,
        location: loc,
        propsInScene: props,
      });

      return {
        sceneNumber: s.sceneNumber,
        actNumber: s.actNumber,
        title: cleanSceneTitle(s.title),
        timeRange: `${s.startTimeSec ?? (s.sceneNumber - 1) * 10} - ${s.endTimeSec ?? s.sceneNumber * 10}s`,
        locationId: s.locationId || '',
        locationName: s.locationName || '',
        focus: {
          type: s.focusType || 'Deep Focus (ชัดลึก (ชัดทั้งภาพ))',
          detail: s.focusDetail || '',
        },
        composition: {
          type: s.compositionType || 'Center Frame (กึ่งกลางภาพ)',
          detail: s.compositionDetail || '',
        },
        shotType: s.shotType || 'Wide Shot (WS)',
        cameraAngle: s.cameraAngle || 'Eye-Level',
        cameraMovement: s.cameraMovement || 'Push In',
        narration: s.narration,
        dialogues: s.dialogues || [],
        productionPrompt: promptObj.fullPrompt,
        cameraLensText: promptObj.cameraLensText,
        subjectsStagingText: promptObj.subjectsStagingText,
        lightingStyleText: promptObj.lightingStyleText,
        constraintsNegativeText: promptObj.constraintsNegativeText,
        videoMotionPrompt: s.videoMotionPrompt || '',
        imagePrompt: s.imagePrompt || '',
      };
    }),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * ส่งออกฉากเดี่ยวเป็น JSON
 */
export function exportSingleSceneJson(scene: ScriptScene, project: Project): string {
  const loc = (project.locations || []).find(
    (l) => l.id === scene.locationId || l.name === scene.locationName
  );
  const props = (project.props || []).filter((p) => (scene.propIds || []).includes(p.id));
  const promptObj = generateProductionPrompt989({
    scene,
    project,
    location: loc,
    propsInScene: props,
  });

  const sceneData = {
    app: '989 Ai Prompt (Single Scene)',
    sceneNumber: scene.sceneNumber,
    title: cleanSceneTitle(scene.title),
    timeRange: `${scene.startTimeSec ?? (scene.sceneNumber - 1) * 10} - ${scene.endTimeSec ?? scene.sceneNumber * 10}s`,
    locationName: scene.locationName || loc?.name || '',
    focus: {
      type: scene.focusType || 'Deep Focus (ชัดลึก (ชัดทั้งภาพ))',
      detail: scene.focusDetail || '',
    },
    composition: {
      type: scene.compositionType || 'Center Frame (กึ่งกลางภาพ)',
      detail: scene.compositionDetail || '',
    },
    shotType: scene.shotType || 'Wide Shot (WS)',
    cameraAngle: scene.cameraAngle || 'Eye-Level',
    cameraMovement: scene.cameraMovement || 'Push In',
    narration: scene.narration,
    dialogues: scene.dialogues || [],
    productionPrompt: promptObj.fullPrompt,
    videoMotionPrompt: scene.videoMotionPrompt || '',
    imagePrompt: scene.imagePrompt || '',
  };

  return JSON.stringify(sceneData, null, 2);
}

/**
 * นำเข้าโปรเจกต์จากไฟล์ JSON ของ 989 Ai Prompt
 */
export function import989ProjectJson(jsonStr: string, currentProject: Project): Project {
  const data = JSON.parse(jsonStr);
  if (!data || typeof data !== 'object') {
    throw new Error('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
  }

  const newProps: PropItem[] = Array.isArray(data.props) ? data.props : currentProject.props || [];
  const newLocations: LocationItem[] = Array.isArray(data.locations) ? data.locations : currentProject.locations || [];
  const newRules: string[] = Array.isArray(data.aiRules) ? data.aiRules : currentProject.aiRules || DEFAULT_989_AI_RULES;

  let newScenes: ScriptScene[] = currentProject.scenes || [];
  if (Array.isArray(data.scenes) && data.scenes.length > 0) {
    newScenes = data.scenes.map((s: any, idx: number) => {
      const sceneNum = s.sceneNumber || idx + 1;
      return {
        id: `scene-989-${Date.now()}-${sceneNum}`,
        sceneNumber: sceneNum,
        actNumber: (s.actNumber || Math.min(4, Math.ceil((sceneNum / data.scenes.length) * 4))) as 1 | 2 | 3 | 4,
        title: s.title || `ฉากที่ ${sceneNum}`,
        narration: s.narration || '',
        dialogues: Array.isArray(s.dialogues) ? s.dialogues : [],
        sfxBgm: s.sfxBgm || '',
        characterIds: [],
        visualMedium: currentProject.visualMedium,
        stylePreset: currentProject.stylePreset,
        cameraMovement: s.cameraMovement || 'Push In',
        lighting: s.lighting || 'Cinematic Lighting',
        imagePrompt: s.imagePrompt || '',
        videoMotionPrompt: s.videoMotionPrompt || '',
        googleFlowPrompt: s.googleFlowPrompt || '',
        negativePrompt: s.negativePrompt || '',
        aspectRatio: currentProject.aspectRatio,
        estimatedDurationSec: 10,
        createdAt: new Date().toISOString(),
        locationId: s.locationId,
        locationName: s.locationName,
        focusType: s.focus?.type || s.focusType || 'Deep Focus (ชัดลึก (ชัดทั้งภาพ))',
        focusDetail: s.focus?.detail || s.focusDetail || '',
        compositionType: s.composition?.type || s.compositionType || 'Center Frame (กึ่งกลางภาพ)',
        compositionDetail: s.composition?.detail || s.compositionDetail || '',
        shotType: s.shotType || 'Wide Shot (WS)',
        cameraAngle: s.cameraAngle || 'Eye-Level',
        startTimeSec: (sceneNum - 1) * 10,
        endTimeSec: sceneNum * 10,
      };
    });
  }

  return {
    ...currentProject,
    title: data.project?.title || currentProject.title,
    synopsis: data.project?.synopsis || currentProject.synopsis,
    props: newProps,
    locations: newLocations,
    aiRules: newRules,
    scenes: newScenes,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * ฟังก์ชันสร้างหนังสั้น 3,000 วินาที รวม 308 ฉาก ด้วย 989 Ai Prompt (VIP Mode)
 * ตามคลิปวิดีโอ https://www.youtube.com/watch?v=hdxRMa1Wx9Q
 * แบ่งเป็น 10 บล็อกเนื้อเรื่อง (10 Narrative Blocks / Acts) ป้องกันความผิดพลาดของ AI
 */
export function generateVip3000SecondsMovie(project: Project): Project {
  // 1. ตรวจสอบหรือสร้าง Props และ Locations เริ่มต้นถ้ายังไม่มี
  const defaultLocations: LocationItem[] = [
    {
      id: 'ROOM-01',
      name: 'ห้องพักเอก (ROOM-01)',
      type: 'ภายในอาคาร',
      timeOfDay: 'กลางวัน',
      weather: 'ปกติ',
      lighting: 'แสงโคมไฟสีส้มสลัวส่องกระทบโต๊ะทำงานตัดกับเงามืด',
      description: 'ห้องสี่เหลี่ยมเรียบง่าย โต๊ะทำงานไม้สีเข้ม มีหน้าจอและเอกสารวางซ้อนกัน',
    },
    {
      id: 'STREET-02',
      name: 'ถนนสายเปลี่ยว (STREET-02)',
      type: 'ภายนอกอาคาร',
      timeOfDay: 'กลางคืน',
      weather: 'ฝนตกพรำๆ หมอกลงจัด',
      lighting: 'แสงไฟนีออนริมทางสะท้อนแอ่งน้ำเปียกชื้นบนถนน',
      description: 'ถนนยางมะตอยยาวไกลในยามวิกาล บรรยากาศเงียบสงัดชวนกดดัน',
    },
    {
      id: 'BASE-03',
      name: 'ศูนย์บัญชาการลับ (BASE-03)',
      type: 'ภายในอาคารใต้ดิน',
      timeOfDay: 'ไม่ระบุเวลา',
      weather: 'ควบคุมอุณหภูมิ',
      lighting: 'แสงไฟโฮโลแกรมสีฟ้าและเขียวจากแผงหน้าจอดาวเทียม',
      description: 'ห้องปฏิบัติการไฮเทค ล้อมรอบด้วยจอมอนิเตอร์ตรวจการณ์และอุปกรณ์ยุทธวิธี',
    },
  ];

  const defaultProps: PropItem[] = [
    {
      id: 'PROP-01',
      name: 'แล็ปท็อปเอกสารลับ',
      category: 'gadget',
      description: 'แล็ปท็อปบอดี้สีดำด้าน หน้าจอแสดงรหัสข้อมูลและแผนที่ดาวเทียม',
      colorLock: 'ดำด้าน มีไฟ LED แสดงสถานะสีฟ้า',
    },
    {
      id: 'VEHICLE-01',
      name: 'รถตู้ยุทธการสีดำ',
      category: 'vehicle',
      description: 'รถตู้หุ้มเกราะสีดำทึบ ติดฟิล์มมืด ป้ายทะเบียนพิเศษ',
      colorLock: 'ดำด้าน ไร้ตราสัญลักษณ์',
    },
  ];

  const locations = project.locations && project.locations.length > 0 ? project.locations : defaultLocations;
  const props = project.props && project.props.length > 0 ? project.props : defaultProps;

  // 2. สร้างฉากทั้งหมด 308 ฉาก (ความยาว 3,080 วินาที @ 10 วิ/ฉาก)
  const totalScenes = 308;
  const newScenes: ScriptScene[] = [];
  
  // 10 บล็อกเนื้อเรื่องสำหรับ 989 Ai Prompt VIP Mode
  const blocks = [
    { name: 'บล็อก 1: จุดเริ่มต้นและปริศนาที่ซ่อนเร้น', loc: locations[0] },
    { name: 'บล็อก 2: การค้นพบเบาะแสสำคัญและการตัดสินใจ', loc: locations[0] },
    { name: 'บล็อก 3: ก้าวสู่อันตรายและการเดินทางในเงามืด', loc: locations[1] || locations[0] },
    { name: 'บล็อก 4: การเผชิญหน้าอุปสรรคและการถูกจับตามอง', loc: locations[1] || locations[0] },
    { name: 'บล็อก 5: จุดเปลี่ยนครั้งใหญ่และการเปิดโปงความจริง', loc: locations[2] || locations[0] },
    { name: 'บล็อก 6: การไล่ล่า ชิงไหวชิงพริบ และวางกับดัก', loc: locations[1] || locations[0] },
    { name: 'บล็อก 7: วิกฤตการณ์ถึงขีดสุดและการรวมพลัง', loc: locations[2] || locations[0] },
    { name: 'บล็อก 8: ศึกแตกหักและการเผชิญหน้าศัตรูตัวจริง', loc: locations[2] || locations[0] },
    { name: 'บล็อก 9: ไคลแม็กซ์ระทึกขวัญและการปลดล็อกชัยชนะ', loc: locations[1] || locations[0] },
    { name: 'บล็อก 10: บทสรุป รุ่งอรุณใหม่ และตำนานที่ถูกจารึก', loc: locations[0] },
  ];

  const focusPool = FOCUS_OPTIONS.map((f) => f.label);
  const compPool = COMPOSITION_OPTIONS.map((c) => c.label);
  const shotPool = SHOT_TYPES.map((s) => s.label);
  const anglePool = CAMERA_ANGLES.map((a) => a.label);
  const movePool = CAMERA_MOVEMENTS.map((m) => m.label);

  for (let i = 0; i < totalScenes; i++) {
    const sceneNumber = i + 1;
    const blockIndex = Math.min(9, Math.floor((i / totalScenes) * 10));
    const currentBlock = blocks[blockIndex];
    const actNumber = (Math.min(4, Math.floor((i / totalScenes) * 4) + 1)) as 1 | 2 | 3 | 4;

    const startSec = i * 10;
    const endSec = (i + 1) * 10;

    const focusType = focusPool[i % focusPool.length];
    const compType = compPool[i % compPool.length];
    const shotType = shotPool[i % shotPool.length];
    const cameraAngle = anglePool[i % anglePool.length];
    const cameraMovement = movePool[i % movePool.length];

    const currentLoc = currentBlock.loc || locations[0];
    const title = `${currentBlock.name} - ตอนที่ ${((i % 31) + 1)}`;
    const narration = `ฉากที่ ${sceneNumber}: เหตุการณ์ดำเนินต่อเนื่องวินาทีต่อวินาที ณ ${currentLoc.name} (${currentBlock.name}) การเคลื่อนไหวของตัวละครเป็นไปอย่างแน่วแน่ ท่ามกลางบรรยากาศตึงเครียดของสถานการณ์`;

    newScenes.push({
      id: `scene-vip-308-${sceneNumber}`,
      sceneNumber,
      actNumber,
      title,
      narration,
      dialogues: [],
      sfxBgm: `[BGM: ดนตรีภาพยนตร์ระทึกขวัญ 60fps] [SFX: เสียงบรรยากาศ ${currentLoc.type || 'สถานที่'}]`,
      characterIds: project.characters?.map((c) => c.id) || [],
      visualMedium: project.visualMedium,
      stylePreset: project.stylePreset,
      cameraMovement,
      lighting: currentLoc.lighting || 'Cinematic Lighting 35mm',
      imagePrompt: `${project.title}, ${title}, ${currentLoc.description}, ${shotType}, ${cameraAngle}, 8k cinema still`,
      videoMotionPrompt: `[ฉากที่ ${sceneNumber}] [Shot: ${shotType}] [Angle: ${cameraAngle}] [Camera: ${cameraMovement}] [Location: ${currentLoc.name}] Smooth cinematic camera, 60fps, 4K resolution, continuous flow from shot ${Math.max(1, sceneNumber - 1)}.`,
      negativePrompt: 'cartoon, deformed, blur, split screen, low quality',
      aspectRatio: project.aspectRatio,
      estimatedDurationSec: 10,
      createdAt: new Date().toISOString(),
      locationId: currentLoc.id,
      locationName: currentLoc.name,
      focusType,
      focusDetail: `โฟกัส ${focusType} คมชัดสมจริงในระยะ ${shotType}`,
      compositionType: compType,
      compositionDetail: `จัดวางตามหลัก ${compType} ดึงดูดสายตา`,
      shotType,
      cameraAngle,
      startTimeSec: startSec,
      endTimeSec: endSec,
      propIds: props.map((p) => p.id),
    });
  }

  return {
    ...project,
    targetDurationMinutes: 51.3,
    locations,
    props,
    scenes: newScenes,
    aiRules: project.aiRules || DEFAULT_989_AI_RULES,
    updatedAt: new Date().toISOString(),
  };
}
