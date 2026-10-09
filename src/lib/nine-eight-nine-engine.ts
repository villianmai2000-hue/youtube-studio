import { Project, ScriptScene, CharacterBible, LocationItem, PropItem, CharacterDialogue } from './types';
import { cleanSceneTitle } from './script-templates';
import { analyzeStoryTheme } from './theme-detector';

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
 * แคตตาล็อกพล็อตเรื่องต้นแบบยอดนิยม (Story Presets Catalogue)
 * ตรงตามคลิปวิดีโอที่ผู้ใช้ส่งมา 100%:
 * 1. JUDIAN อะนิเมะ: วันที่ 13 กรกฎาคม ฝนตก โลกจม มิติเก็บของ ปืนในมือ (หูโยว่, เย่ว่านฉิว, จางเปียว)
 * 2. Manga Realms MRE: [พากย์ไทย] ผมคือชายคนเดียวบนรถบัส (เร็น, ซากุระ, อาโออิ, ยูมิ)
 * 3. 989 Ai Prompt VIP Mode: สร้างหนังสั้น 3,000 วินาที รวม 308 ฉาก (เอก AEK-01, ผู้พันเกรียง)
 */
export interface StoryPresetConfig {
  id: 'judian' | 'manga_bus' | 'aek_989';
  name: string;
  badge: string;
  title: string;
  synopsis: string;
  worldCulture: 'chinese' | 'japanese' | 'thai';
  subGenre: string;
  visualMedium: 'animation' | 'live_action';
  stylePreset: 'judian_doomsday_anime' | 'manga_recap_anime' | 'hollywood_cinematic' | 'donghua_3d';
  characters: CharacterBible[];
  locations: LocationItem[];
  props: PropItem[];
  blocks: {
    name: string;
    locId: string;
    actionSummary: string;
    narrationBeat: string;
    dialogueList: CharacterDialogue[];
  }[];
}

export const STORY_PRESETS_989: Record<string, StoryPresetConfig> = {
  judian: {
    id: 'judian',
    name: '🌧️ [JUDIAN] วันที่ 13 กรกฎาคม ฝนตก โลกจม มิติเก็บของ ปืนในมือ',
    badge: 'JUDIAN อะนิเมะ',
    title: 'วันที่สิบสามกรกฎาคมฝนตก โลกจม กูที่มีภูเขาทองในมิติ ปืนในมือ กลายเป็นคนที่ใครก็ไม่กล้าแตะ (JUDIAN อะนิเมะ)',
    synopsis: 'หูโยว่ ชายหนุ่มที่เคยถูกอดีตแฟนสาวทรยศแย่งเสบียงและถูกผลักให้ตายในยุคน้ำท่วมโลก ได้ย้อนเวลากลับมา 7 วันก่อนวันที่ 13 กรกฎาคม พร้อมปลดล็อกมิติเก็บของไม่จำกัด เขาเทเงินพันล้านกวาดซื้อเสบียง คลังแสง ดัดแปลงห้องเป็นเซฟเฮาส์ป้อมปราการเหล็กกล้ากันกระสุน เมื่อมหาพายุฝนกระหน่ำโลกจมบาดาล เขานั่งกินสเต๊กในห้องแอร์เย็นฉ่ำ ขณะที่คนทรยศและอันธพาลต้องคุกเข่าอ้อนวอนขออาหาร',
    worldCulture: 'chinese',
    subGenre: 'judian_doomsday',
    visualMedium: 'animation',
    stylePreset: 'judian_doomsday_anime',
    characters: [
      {
        id: 'CHAR-01',
        name: 'หูโยว่ (Hu You)',
        role: 'protagonist',
        gender: 'ชาย',
        age: '24 ปี',
        bodyBuild: 'ปราดเปรียว แข็งแรง สายตาเฉียบคม',
        facialFeatures: 'ใบหน้าคมคาย แววตาเด็ดเดี่ยว เยือกเย็น ไม่มีความลังเล',
        hairStyle: 'ผมซอยสั้นสีดำ ปรกหน้าผากเล็กน้อย',
        clothingStyle: 'เสื้อฮู้ดสีดำด้าน กางเกงคาร์โก้สีเทาเข้ม รองเท้าคอมแบท สะพายปืนลูกซองเรมิงตัน',
        colorTheme: 'ดำ-เทา-เงิน',
        weaponsOrProps: 'ปืนลูกซองเรมิงตัน M870 / มิติเก็บของไม่จำกัด / กริชเหล็กกล้า',
        personality: 'เยือกเย็น เด็ดขาด รอบคอบ ไม่ประมาท ไม่ปรานีต่อผู้ทรยศ',
        abilities: 'มิติเก็บของไม่จำกัดหยุดเวลา, ความแม่นยำอาวุธปืนลูกซอง, ความรู้ล่วงหน้าเกี่ยวกับวันสิ้นโลก',
        weaknesses: 'ไม่ไว้ใจใครง่ายๆ จากบาดแผลในชาติก่อน',
        relationships: 'อดีตคนรักของเย่ว่านฉิว (ปัจจุบันมองเป็นศัตรูที่ต้องล้างแค้น)',
        appearanceAnchor: 'handsome young anime man, black hoodie, determined piercing cold eyes, tactical combat pants, holding remington shotgun, inside reinforced metal safehouse, 8k cinematic anime render',
        voiceStyle: 'ทุ้มต่ำ เยือกเย็น หนักแน่น ไร้ความลังเล',
      },
      {
        id: 'CHAR-02',
        name: 'เย่ว่านฉิว (Ye Wanqiu)',
        role: 'antagonist',
        gender: 'หญิง',
        age: '23 ปี',
        bodyBuild: 'ผอมบาง ผิวขาวซีด',
        facialFeatures: 'ใบหน้ารูปไข่ สวยหวานแต่แฝงความละโมบ แววตาเสแสร้งและหวาดกลัว',
        hairStyle: 'ผมยาวประบ่า เปียกชุ่มไปด้วยละอองฝน',
        clothingStyle: 'ชุดเดรสไหมพรมเปียกน้ำ เลอะคราบโคลน สวมเสื้อโค้ตตัวใหญ่ขาดรุ่ย',
        colorTheme: 'ขาวหม่น-เทา',
        weaponsOrProps: 'โทรศัพท์มือถือที่แบตเตอรี่หมด / มีดพกขนาดเล็ก',
        personality: 'เห็นแก่ตัว เสแสร้ง บีบน้ำตาเก่ง พร้อมทรยศผู้อื่นเพื่อความอยู่รอด',
        abilities: 'การบีบน้ำตาอ้อนวอน ชักจูงให้ผู้อื่นสงสาร',
        weaknesses: 'ขี้ขลาด อ่อนแอ ขาดเสบียงและความอดทน',
        relationships: 'อดีตแฟนสาวผู้ทรยศหูโยว่ในชาติก่อน',
        appearanceAnchor: 'young anime woman, disheveled wet dress, manipulative tearful face, shivering in flood rain outside safehouse door, anime art style',
        voiceStyle: 'สั่นเครือ เสแสร้ง อ้อนวอน แฝงความอิจฉาริษยา',
      },
      {
        id: 'CHAR-03',
        name: 'จางเปียว (Zhang Biao)',
        role: 'antagonist',
        gender: 'ชาย',
        age: '35 ปี',
        bodyBuild: 'กำยำ บึกบึน กล้ามเนื้อเป็นมัด ผิวกร้าน',
        facialFeatures: 'ใบหน้าเหลี่ยมดุดัน มีรอยแผลเป็นพาดผ่านแก้มซ้าย แววตาเหี้ยมเกรียม',
        hairStyle: 'ผมสกินเฮด สวมผ้าโพกศีรษะสีแดงเลือดหมู',
        clothingStyle: 'เสื้อกล้ามสีดำเปียกชุ่ม กางเกงยีนส์ขาด เสื้อชูชีพสีส้มชำรุด',
        colorTheme: 'ดำ-ส้มดิน-แดง',
        weaponsOrProps: 'ขวานดับเพลิงด้ามเหล็ก / ท่อนเหล็กแป๊บ / ชะแลงงัดประตู',
        personality: 'ดุร้าย ป่าเถื่อน ชอบใช้กำลังข่มเหงผู้อื่น ละโมบ',
        abilities: 'พละกำลังมหาศาล ความชำนาญในการใช้อาวุธมีคม',
        weaknesses: 'อารมณ์ร้อน ขาดสติ ประเมินคู่ต่อสู้ต่ำเกินไป',
        relationships: 'หัวหน้าแก๊งอันธพาลผู้หวังนำลูกน้องบุกพังเซฟเฮาส์ของหูโยว่',
        appearanceAnchor: 'burly muscular thug leader, scarred face, holding fire axe, soaked in rain, aggressive posture, anime villain',
        voiceStyle: 'แหบห้าว ดุดัน ตะคอกเกรี้ยวกราด',
      },
    ],
    locations: [
      {
        id: 'SAFEHOUSE-01',
        name: 'ห้องพักเซฟเฮาส์เหล็กกล้า (SAFEHOUSE-01)',
        type: 'ภายในอาคารป้อมปราการ',
        timeOfDay: 'ตลอด 24 ชั่วโมง',
        weather: 'ควบคุมอุณหภูมิ แอร์เย็นฉ่ำ',
        lighting: 'แสงไฟโคมเพดานสีขาวนวล ผนังบุแผ่นเหล็กกล้าอัลลอยสะท้อนแสงไฟ',
        description: 'ห้องพักสุดหรูที่ถูกเสริมเกราะเหล็กกล้าหนาพิเศษ กระจกกันกระสุน โต๊ะอาหารพร้อมเสบียง และจอวงจรปิดควบคุมระบบไฟฟ้า',
      },
      {
        id: 'WINDOW-02',
        name: 'ริมหน้าต่างกระจกกันกระสุน มองเห็นน้ำท่วมโลก (WINDOW-02)',
        type: 'จุดชมวิวริมหน้าต่าง',
        timeOfDay: 'กลางวันมืดครึ้ม / พายุโหม',
        weather: 'มหาพายุฝนกระหน่ำ ฟ้าแลบฟ้าร้อง',
        lighting: 'แสงฟ้าแลบสีฟ้าขาวสะท้อนกระจกหนาและผิวน้ำท่วมด้านนอก',
        description: 'หน้าต่างกระจกลามิเนตกันกระสุนหนา 5 ชั้น มองออกไปเห็นเมืองหลวงจมอยู่ใต้น้ำลึก ตึกระฟ้ากลายเป็นเสาปักกลางทะเล',
      },
      {
        id: 'DIMENSION-03',
        name: 'มิติเก็บของไม่จำกัด / ภูเขาเสบียงและคลังแสง (DIMENSION-03)',
        type: 'มิติสุญญากาศต่างมิติ',
        timeOfDay: 'กาลเวลาหยุดนิ่ง',
        weather: 'สุญญากาศสมบูรณ์แบบ',
        lighting: 'แสงออโรร่าสีทองและสีฟ้าเรืองรองสว่างไสว',
        description: 'มิติส่วนตัวอันไร้ขอบเขต กองเสบียงเนื้อวากิว อาหารกระป๋อง คลังยา น้ำดื่มบริสุทธิ์ และคลังแสงปืนลูกซองวางเรียงรายสูงตระหง่าน',
      },
      {
        id: 'CORRIDOR-04',
        name: 'โถงทางเดินหน้าห้องและประตูนิรภัยไฟฟ้าแรงสูง (CORRIDOR-04)',
        type: 'โถงทางเดินคอนกรีตเปียกชื้น',
        timeOfDay: 'มืดสลัว',
        weather: 'ละอองฝนสาดเข้ามาจากช่องบันได',
        lighting: 'แสงไฟฉุกเฉินสีแดงกระพริบ และประกายไฟฟ้าแรงสูงสีฟ้าแลบแปลบปลาบ',
        description: 'ทางเดินหน้าห้องชั้นบนสุด ประตูนิรภัยเหล็กกล้าผสมไทเทเนียมหนาครึ่งเมตร ติดตั้งตาแมวกันกระสุนและลวดปล่อยกระแสไฟฟ้า',
      },
    ],
    props: [
      {
        id: 'SHOTGUN-01',
        name: 'ปืนลูกซองเรมิงตัน M870 บรรจุกระสุนลูกปราย',
        category: 'weapon',
        description: 'ปืนลูกซองแทคติคอลสีดำด้าน ติดศูนย์เล็งเรดดอท บรรจุกระสุนเบอร์ 12 อานุภาพทำลายล้างสูง',
        colorLock: 'ดำด้าน บอดี้เหล็กกล้า',
      },
      {
        id: 'STEAK-02',
        name: 'จานสเต๊กเนื้อวากิวหอมกรุ่นและไวน์แดง',
        category: 'prop',
        description: 'สเต๊กเนื้อวากิว A5 ปรุงสุกกำลังดี วางบนจานกระเบื้องสีขาว เสิร์ฟพร้อมแก้วไวน์แดงคริสตัล',
        colorLock: 'เนื้อชุ่มฉ่ำ จานขาว ไวน์แดงเข้ม',
      },
      {
        id: 'CCTV-03',
        name: 'แผงควบคุมจอมอนิเตอร์ CCTV และสวิตช์ไฟฟ้าแรงสูง',
        category: 'gadget',
        description: 'จอแสดงผลหลายจอ ถ่ายทอดภาพมุมมองรอบอาคาร บันไดหนีไฟ และหน้าประตูห้อง พร้อมสวิตช์ปล่อยไฟ 10,000 โวลต์',
        colorLock: 'หน้าจอดำ-เขียวเรืองแสง สวิตช์สีแดง',
      },
    ],
    blocks: [
      {
        name: 'บล็อก 1: วันที่ 6 ก.ค. หูโยว่ลืมตาตื่นในอดีต 7 วันก่อนวันสิ้นโลก ระบบมิติเก็บของไม่จำกัดตื่นขึ้น',
        locId: 'SAFEHOUSE-01',
        actionSummary: 'หูโยว่สะดุ้งตื่นจากความตายในชาติก่อน ตรวจสอบเวลา และทดสอบพลังมิติเก็บของ',
        narrationBeat: 'ในวินาทีนั้นเอง... หูโยว่ลืมตาโพลงขึ้นมาบนเตียงนอน ความเจ็บปวดจากการถูกทรยศในชาติก่อนยังคงเต้นตุบๆ อยู่ในความทรงจำ นาฬิกาบอกวันที่ 6 กรกฎาคม 2024 ก่อนวันมหาอุทกภัย 7 วันเต็ม! เสียงแจ้งเตือนจากระบบมิติเก็บของไม่จำกัดดังก้องในโสตประสาท',
        dialogueList: [
          { speaker: 'หูโยว่ (Hu You)', emotion: 'เด็ดเดี่ยว', text: 'ฉัน... ย้อนเวลากลับมาแล้วจริงๆ! ในชาตินี้ พวกสารเลวที่เคยเหยียบย่ำฉัน จะไม่ได้แม้แต่เศษขนมปัง!' },
        ],
      },
      {
        name: 'บล็อก 2: หูโยว่เร่งแปลงทรัพย์สิน เทเงินพันล้านกวาดซื้อเสบียง คลังยา คลังแสง และกระสุนเข้าสู่มิติ',
        locId: 'DIMENSION-03',
        actionSummary: 'หูโยว่สั่งซื้อสินค้าจำนวนมหาศาล โอนเข้าสู่มิติสุญญากาศที่กาลเวลาหยุดนิ่ง',
        narrationBeat: 'วินาทีถัดมา... หูโยว่ไม่รีรอแม้แต่เสี้ยววินาที เขาเทขายหุ้นและกู้เงินทุกช่องทาง ระดมทุนกวาดซื้อเนื้อสัตว์ อาหารกระป๋อง ข้าวสาร ยารักษาโรค และอาวุธปืนเข้าสู่มิติสุญญากาศ ภูเขาเสบียงกองสูงตระหง่านพร้อมคงความสดใหม่ชั่วนิรันดร์',
        dialogueList: [
          { speaker: 'หูโยว่ (Hu You)', emotion: 'สุขุม', text: 'อาหาร เนื้อวากิว น้ำดื่ม ยา และกระสุนปืนลูกซอง... ตุนไว้ให้ครบสำหรับหนึ่งร้อยปี!' },
        ],
      },
      {
        name: 'บล็อก 3: ดัดแปลงห้องพักเป็นเซฟเฮาส์ป้อมปราการเหล็กกล้า เสริมเกราะกันกระสุนและเครื่องปั่นไฟ',
        locId: 'SAFEHOUSE-01',
        actionSummary: 'ช่างก่อสร้างเร่งเสริมผนังเหล็กกล้าอัลลอย ประตูนิรภัย และระบบพลังงานอิสระ',
        narrationBeat: 'ช่างฝีมือชั้นยอดทำงานหามรุ่งหามค่ำ ผนังทุกด้านถูกบุด้วยแผ่นเหล็กกล้าอัลลอยหนาพิเศษ กระจกกันกระสุนระดับกองทัพ และติดตั้งเครื่องกำเนิดไฟฟ้าระบบปิด ห้องชุดธรรมดาได้กลายสภาพเป็นป้อมปราการเหล็กกล้าที่ไม่อาจเจาะผ่านได้',
        dialogueList: [
          { speaker: 'หูโยว่ (Hu You)', emotion: 'มั่นใจ', text: 'ต่อให้โลกภายนอกจะพังทลายหรือถูกน้ำท่วมมิดยอดตึก ที่นี่ก็จะเป็นวิมานไร้พ่ายของฉัน!' },
        ],
      },
      {
        name: 'บล็อก 4: คืนวันที่ 13 กรกฎาคม มหาพายุฝนโลกาวินาศกระหน่ำลงมาไม่หยุด แผ่นดินเริ่มจมสู่ห้วงน้ำลึก',
        locId: 'WINDOW-02',
        actionSummary: 'ท้องฟ้ามืดสนิท ฝนตกลงมาราวกับฟ้ารั่ว ระดับน้ำพุ่งสูงขึ้นอย่างบ้าคลั่ง',
        narrationBeat: 'และแล้วค่ำคืนแห่งประวัติศาสตร์ก็มาถึง... วันที่ 13 กรกฎาคม ท้องฟ้ามืดมิดไร้แสงดาว มหาพายุฝนกระหน่ำเทลงมาอย่างบ้าคลั่ง ระดับน้ำในเมืองหลวงเอ่อล้นทะลักท่วมชั้นหนึ่งและชั้นสองในเวลาไม่กี่ชั่วโมง เสียงหวีดร้องของผู้คนดังก้องผสานกับเสียงฟ้าร้อง',
        dialogueList: [
          { speaker: 'หูโยว่ (Hu You)', emotion: 'เยือกเย็น', text: 'มันเริ่มต้นขึ้นแล้ว... วันสิ้นโลกที่แท้จริง!' },
        ],
      },
      {
        name: 'บล็อก 5: ผ่านไป 49 วัน น้ำท่วมมิดตึกสูง เมืองหลวงกลายเป็นมหาสมุทร ผู้คนขาดแคลนอาหารจนสิ้นหวัง',
        locId: 'WINDOW-02',
        actionSummary: 'มองผ่านกระจกกันกระสุน เห็นสภาพเมืองจมบาดาลและผู้คนบนเรือยางที่อดอยาก',
        narrationBeat: '49 วันผ่านไปโดยไม่มีทีท่าว่าฝนจะหยุดตก เมืองทั้งเมืองจมดิ่งลงสู่ก้นบึ้งของมหาสมุทร ท้องถนนกลายเป็นร่องน้ำลึก ผู้รอดชีวิตตามตึกสูงเริ่มหมดเสบียง เกิดการแย่งชิงอาหารและน้ำดื่มอย่างป่าเถื่อน ความเป็นมนุษย์เริ่มพังทลายลง',
        dialogueList: [
          { speaker: 'หูโยว่ (Hu You)', emotion: 'มองการณ์ไกล', text: 'ความอดอยากจะดึงเอาสัญชาตญาณสัตว์ป่าของมนุษย์ออกมา... และคนพวกนั้นจะต้องดิ้นรน' },
        ],
      },
      {
        name: 'บล็อก 6: หูโยว่นั่งกินสเต๊กเนื้อวากิวในห้องแอร์ฉ่ำ ดูกล้องวงจรปิดบันทึกภาพผู้คนภายนอกที่กำลังหนาวสั่น',
        locId: 'SAFEHOUSE-01',
        actionSummary: 'หูโยว่ปรุงสเต๊กเนื้อวากิว จิบไวน์แดงอย่างสบายใจท่ามกลางแอร์เย็นฉ่ำ',
        narrationBeat: 'ขณะที่โลกภายนอกหนาวเหน็บและเต็มไปด้วยความหิวโหย หูโยว่กลับนั่งอยู่ในเซฟเฮาส์แอร์เย็นฉ่ำ กลิ่นเนื้อวากิวย่างเนยหอมกรุ่นลอยฟุ้ง เขาค่อยๆ จิบไวน์แดงพลางมองดูภาพจากกล้องวงจรปิดด้วยแววตาที่สงบนิ่ง ไร้ซึ่งความทุกข์ร้อนใดๆ',
        dialogueList: [
          { speaker: 'หูโยว่ (Hu You)', emotion: 'ผ่อนคลาย', text: 'รสชาติยอดเยี่ยม... นี่คือชีวิตที่ฉันสมควรได้รับในชาตินี้' },
        ],
      },
      {
        name: 'บล็อก 7: เย่ว่านฉิว อดีตแฟนสาวใจคด นำกลุ่มคนมาร้องไห้อ้อนวอนหน้าประตู อ้างความรักและขออาหาร',
        locId: 'CORRIDOR-04',
        actionSummary: 'เย่ว่านฉิวยืนเปียกปอนหน้าประตู ร้องไห้สะอึกสะอื้น พยายามใช้มารยาหญิงขออาหาร',
        narrationBeat: 'ทันใดนั้นเอง... เสียงเคาะประตูดังขึ้นอย่างร้อนรน หน้าจอวงจรปิดปรากฏใบหน้าเปียกปอนของเย่ว่านฉิว อดีตแฟนสาวที่เคยร่วมมือกับชู้รักแทงข้างหลังเขา เธอคุกเข่าลงหน้าประตู บีบน้ำตาไหลพรากอ้างความหลังและอ้อนวอนขออาหารเพียงเศษชิ้น',
        dialogueList: [
          { speaker: 'เย่ว่านฉิว (Ye Wanqiu)', emotion: 'อ้อนวอนเสแสร้ง', text: 'หูโยว่! ฉันรู้ว่าเธออยู่ข้างใน... เปิดประตูให้ฉันเถอะนะ! ฉันหิวจนทนไม่ไหวแล้ว เราเคยรักกันไม่ใช่เหรอ!' },
        ],
      },
      {
        name: 'บล็อก 8: หูโยว่หยิบปืนลูกซองขึ้นมา เล็งผ่านช่องส่อง ปฏิเสธอย่างไร้เยื่อใยและเปิดโปงความชั่วช้า',
        locId: 'SAFEHOUSE-01',
        actionSummary: 'หูโยว่ขึ้นลำกล้องปืนลูกซองเรมิงตัน เดินไปที่ช่องส่องประตู และเปิดลำโพงพูดอย่างเฉียบขาด',
        narrationBeat: 'หูโยว่ลุกขึ้นอย่างช้าๆ เสียงขึ้นลำกล้องปืนลูกซองเรมิงตันดังกริ๊กก้องกังวาน เขาเดินไปที่ช่องมองกันกระสุน กดสวิตช์ไมค์สองทาง รอยยิ้มเย็นชาปรากฏที่มุมปาก แววตาของเขาไร้ซึ่งความสงสาร มีเพียงประกายแห่งการพิพากษาเท่านั้น',
        dialogueList: [
          { speaker: 'หูโยว่ (Hu You)', emotion: 'เยือกเย็นอำมหิต', text: 'เย่ว่านฉิว... เธอจำวันที่ผลักฉันลงไปเป็นอาหารสำรองในชาติก่อนได้ไหม? อาหารของฉัน ต่อให้โยนให้หมา ก็ไม่มีวันตกถึงท้องคนทรยศอย่างเธอ!' },
        ],
      },
      {
        name: 'บล็อก 9: แก๊งอันธพาลจางเปียวพยายามใช้ขวานจามประตูเหล็ก แต่โดนกระแสไฟฟ้าแรงสูงช็อตและโดนลูกซองซัดกระเจิง',
        locId: 'CORRIDOR-04',
        actionSummary: 'จางเปียวนำขวานดับเพลิงมาจามประตู หูโยว่กดสวิตช์ช็อตไฟฟ้าและยิงลูกซองสวนออกไป',
        narrationBeat: 'เมื่อเห็นว่ามารยาใช้ไม่ได้ผล จางเปียวและลูกสมุนก็เผยตัวออกมาพร้อมขวานดับเพลิง พยายามระดมจามประตูเหล็กอย่างบ้าคลั่ง! ทว่าหูโยว่เพียงสับคัตเอาต์ไฟฟ้าแรงสูง ประกายไฟหมื่นโวลต์ช็อตกระแทกอันธพาลจนกระเด็น ก่อนที่กระสุนลูกซองจะเจาะผ่านช่องยิงซัดศัตรูถอยกรูดล้มระเนระนาด',
        dialogueList: [
          { speaker: 'จางเปียว (Zhang Biao)', emotion: 'เจ็บปวดตื่นตระหนก', text: 'อ๊ากกก! ไฟฟ้าแรงสูง! ไอ้เวรนี่มันมีปืนลูกซองด้วย ถอยเร็วเข้า!' },
          { speaker: 'หูโยว่ (Hu You)', emotion: 'คำรามดุดัน', text: 'ใครกล้าก้าวเข้ามาอีกก้าวเดียว... นัดต่อไปเจาะกะโหลก!' },
        ],
      },
      {
        name: 'บล็อก 10: กวาดล้างคนทรยศสิ้นซาก หูโยว่ยืนมองผืนน้ำมหาอุทกภัยอย่างผู้ชนะที่ไม่มีใครกล้าแตะต้องอีกต่อไป',
        locId: 'WINDOW-02',
        actionSummary: 'ศัตรูพ่ายแพ้เตลิดหนี หูโยว่ยืนกอดอกมองมหาสมุทรนอกหน้าต่างอย่างสง่างาม',
        narrationBeat: 'ความเงียบสงบหวนคืนสู่เซฟเฮาส์อีกครั้ง คนทรยศและอันธพาลต่างเตลิดหนีเอาชีวิตรอดอย่างไร้ทางสู้ หูโยว่ยืนกอดอกข้างปืนลูกซองคู่ใจ มองออกไปนอกหน้าต่างสู่ผืนน้ำอันไร้ขอบเขต บัดนี้เขาคือเจ้าแห่งมิติเก็บของ ราชาผู้ไร้เทียมทานแห่งยุคโลกจมบาดาล!',
        dialogueList: [
          { speaker: 'หูโยว่ (Hu You)', emotion: 'ทรงพลัง', text: 'นับจากวันนี้เป็นต้นไป... บนโลกใบนี้ ไม่มีใครหน้าไหนกล้ามาแตะต้องฉันอีกต่อไป!' },
        ],
      },
    ],
  },
  manga_bus: {
    id: 'manga_bus',
    name: '🚌 [Manga Realms] [พากย์ไทย] ผมคือชายคนเดียวบนรถบัส',
    badge: 'MRE อะนิเมะ',
    title: '[พากย์ไทย] ผมคือชายคนเดียวบนรถบัส (Manga Realms MRE)',
    synopsis: 'ท่ามกลางการระบาดของไวรัสซอมบี้กลายพันธุ์ เร็น ชายหนุ่มเพียงคนเดียวบนรถบัสผู้โดยสาร ต้องนำทีมสาวๆ ทั้งดาวโรงเรียนซึนเดระ สาวแว่นพยาบาล สาวนักกีฬาเคนโด้ น้องสาวตัวเล็ก และนักวิจัยสาวปริศนา ร่วมมือกันจัดเวรยาม คุมสติ และเหยียบคันเร่งฝ่าดงซอมบี้คลั่งและจ่าฝูงอัลฟ่าอย่างต่อเนื่องไม่ตัดข้าม',
    worldCulture: 'japanese',
    subGenre: 'manga_recap_anime',
    visualMedium: 'animation',
    stylePreset: 'manga_recap_anime',
    characters: [
      {
        id: 'CHAR-01',
        name: 'เร็น (Ren)',
        role: 'protagonist',
        gender: 'ชาย',
        age: '17 ปี',
        bodyBuild: 'สมส่วน คล่องแคล่ว',
        facialFeatures: 'ใบหน้าหล่อเหลา แววตามุ่งมั่น สุขุม มีสัญชาตญาณผู้นำ',
        hairStyle: 'ผมสั้นสีดำซอยสไตล์นักเรียนญี่ปุ่น',
        clothingStyle: 'เสื้อนักเรียนมัธยมปลดกระดุมคอ กางเกงสแล็กสีดำ ถุงมือหนัง',
        colorTheme: 'ดำ-ขาว-น้ำเงิน',
        weaponsOrProps: 'เหล็กชะแลงกู้ภัย / มีดสั้นยุทธวิธี / ค้อนทุบกระจก',
        personality: 'สุขุม ฉลาด ไหวพริบดี กล้าตัดสินใจในวิกฤต พร้อมปกป้องทุกคน',
        abilities: 'การวิเคราะห์สถานการณ์รวดเร็ว, การต่อสู้ระยะประชิด, ทักษะการขับขี่ยานพาหนะฉุกเฉิน',
        weaknesses: 'แบกรับความรับผิดชอบไว้คนเดียวมากเกินไป',
        relationships: 'ชายหนุ่มคนเดียวบนรถบัส ผู้นำของกลุ่มสาวๆ ผู้รอดชีวิต',
        appearanceAnchor: 'handsome Japanese anime boy student, black messy hair, determined heroic eyes, wearing school uniform with rolled up sleeves, holding crowbar on apocalypse bus, anime style',
        voiceStyle: 'สุขุม นิ่ง มีพลัง ปลุกใจและเด็ดขาด',
      },
      {
        id: 'CHAR-02',
        name: 'ซากุระ (Sakura)',
        role: 'supporting',
        gender: 'หญิง',
        age: '17 ปี',
        bodyBuild: 'ทรวดทรงดี สง่างาม',
        facialFeatures: 'ใบหน้าน่ารัก ตากลมโต แววตาแฝงความหยิ่งในศักดิ์ศรี',
        hairStyle: 'ผมบลอนด์ทองยาว มัดทวินเทลสองข้าง',
        clothingStyle: 'ชุดนักเรียนกะลาสีสีแดง-ขาว ถุงเท้ายาวสีดำ',
        colorTheme: 'แดง-ทอง-ขาว',
        weaponsOrProps: 'เสาเหล็กป้ายสัญญาณ / กระเป๋านักเรียนติดเกราะ',
        personality: 'ซึนเดระ ปากไม่ตรงกับใจ แต่แท้จริงแล้วห่วงใยเร็นและเพื่อนๆ มาก',
        abilities: 'การสังเกตการณ์มุมสูง, วิ่งเร็วและคล่องตัว',
        weaknesses: 'ขี้ตกใจเมื่อเจอเลือดจำนวนมาก',
        relationships: 'ดาวโรงเรียนผู้แอบประทับใจในความกล้าหาญของเร็น',
        appearanceAnchor: 'blonde twintail anime schoolgirl, red sailor uniform, tsundere expression, dynamic action pose on apocalypse bus',
        voiceStyle: 'สดใส ห้าวเล็กน้อย ซึนเดระ แต่จริงใจ',
      },
      {
        id: 'CHAR-03',
        name: 'อาโออิ (Aoi)',
        role: 'supporting',
        gender: 'หญิง',
        age: '18 ปี',
        bodyBuild: 'นักกีฬา แข็งแรง คล่องตัวสูง',
        facialFeatures: 'ใบหน้าคม แววตามุ่งมั่น ดุดันและจริงจัง',
        hairStyle: 'ผมสั้นสีน้ำเงินเข้ม มัดจุกเล็กด้านหลัง',
        clothingStyle: 'ชุดฝึกเคนโด้สวมทับด้วยแจ็กเก็ตวอร์มโรงเรียน',
        colorTheme: 'น้ำเงินคราม-ขาว',
        weaponsOrProps: 'ดาบไม้เคนโด้ (Bokken) เสริมปลายเหล็ก',
        personality: 'กล้าหาญ เคร่งครัดในวินัย มีน้ำใจนักกีฬา ไม่กลัวซอมบี้',
        abilities: 'วิชาดาบเคนโด้ขั้นสูง ฟันสกัดการโจมตีแม่นยำ',
        weaknesses: 'ตรงไปตรงมา ขาดเล่ห์เหลี่ยม',
        relationships: 'หัวหน้าหน่วยจู่โจมแนวหน้าร่วมกับเร็น',
        appearanceAnchor: 'athletic anime girl with dark blue short hair, kendo practitioner, holding wooden sword bokken, fierce brave combat pose',
        voiceStyle: 'เข้มแข็ง มั่นคง ฉะฉาน',
      },
      {
        id: 'CHAR-04',
        name: 'ยูมิ (Yumi)',
        role: 'supporting',
        gender: 'หญิง',
        age: '17 ปี',
        bodyBuild: 'บอบบาง อ่อนหวาน',
        facialFeatures: 'ใบหน้าอ่อนโยน สวมแว่นตากรอบแดง แววตามีสมาธิ',
        hairStyle: 'ผมเปียยาวสีน้ำตาลเข้ม',
        clothingStyle: 'ชุดนักเรียนเรียบร้อย สวมปลอกแขนหน่วยพยาบาลกากบาทสีแดง',
        colorTheme: 'ขาว-เขียวมิ้นต์-แดง',
        weaponsOrProps: 'กระเป๋าปฐมพยาบาล / กรรไกรและผ้าพันแผลฆ่าเชื้อ',
        personality: 'อ่อนโยน ใจเย็น มีสติสัมปชัญญะในยามคับขัน',
        abilities: 'การปฐมพยาบาลห้ามเลือด, การสังเกตอาการติดเชื้อ',
        weaknesses: 'พละกำลังน้อย ไม่ถนัดการต่อสู้',
        relationships: 'หน่วยพยาบาลและกำลังใจสำคัญของทุกคนในรถบัส',
        appearanceAnchor: 'gentle anime girl with glasses, red glasses frame, braided hair, medic arm band, holding first aid kit on bus',
        voiceStyle: 'นุ่มนวล ปลอบประโลม ชัดเจน',
      },
    ],
    locations: [
      {
        id: 'BUS-01',
        name: 'ภายในรถบัสผู้โดยสาร (BUS-01)',
        type: 'ยานพาหนะปิดตาย',
        timeOfDay: 'กลางวันมืดมัว',
        weather: 'หมอกควันและกลิ่นไหม้เกรียม',
        lighting: 'แสงแดดลอดผ่านหน้าต่างที่แตกร้าวสลับเงาของเบาะโดยสาร',
        description: 'โถงทางเดินแคบๆ ในรถบัส มีเบาะนั่งเรียงราย ถูกดัดแปลงเป็นแนวกำแพงกั้นซอมบี้',
      },
      {
        id: 'COCKPIT-02',
        name: 'คอนโซลคนขับและกระจกหน้ารถบัส (COCKPIT-02)',
        type: 'ห้องควบคุมยานพาหนะ',
        timeOfDay: 'กลางวัน',
        weather: 'ฝุ่นควันบนทางด่วน',
        lighting: 'แผงหน้าปัดดิจิทัลส่องสว่างสะท้อนคราบเลือดบนกระจกหน้ารถ',
        description: 'ที่นั่งคนขับ พวงมาลัยขนาดใหญ่ คันเกียร์ และปุ่มควบคุมประตูฉุกเฉิน',
      },
      {
        id: 'HIGHWAY-03',
        name: 'ไฮเวย์ซากรถและดงซอมบี้คลั่ง (HIGHWAY-03)',
        type: 'ถนนไฮเวย์ยกระดับ',
        timeOfDay: 'พลบค่ำ',
        weather: 'ลมพัดแรง หมอกควันดำจากการระเบิด',
        lighting: 'แสงไฟท้ายรถยนต์ที่กระพริบ และแสงอาทิตย์อัสดงสีส้มเพลิง',
        description: 'ทางด่วนยกระดับที่เต็มไปด้วยซากรถชนระเนระนาด ซอมบี้กลายพันธุ์วิ่งกรูเข้าหารถบัส',
      },
      {
        id: 'ROOF-04',
        name: 'หลังคารถบัส จุดต่อสู้มุมสูง (ROOF-04)',
        type: 'ภายนอกยานพาหนะมุมสูง',
        timeOfDay: 'พลบค่ำ ลมกรรโชก',
        weather: 'ละอองเถ้าถ่านลอยในอากาศ',
        lighting: 'แสงอาทิตย์ตกดินสะท้อนหลังคาเหล็กที่สั่นสะเทือนตามความเร็วรถ',
        description: 'หลังคารถบัสที่วิ่งด้วยความเร็วสูง จุดปะทะชี้ชะตาระหว่างเร็นและจ่าฝูงซอมบี้',
      },
    ],
    props: [
      {
        id: 'BOKKEN-01',
        name: 'ดาบไม้เคนโด้และเหล็กชะแลงกู้ภัย',
        category: 'weapon',
        description: 'อาวุธประจำกายของอาโออิและเร็น ใช้ฟันและงัดทำลายหัวกะโหลกซอมบี้',
        colorLock: 'ไม้โอ๊คขัดมัน-เหล็กสนิมดำ',
      },
      {
        id: 'MEDKIT-02',
        name: 'กระเป๋าปฐมพยาบาลและผ้าพันแผลฉุกเฉิน',
        category: 'prop',
        description: 'กล่องยาพร้อมยาฆ่าเชื้อ เข็มฉีดยา และผ้าพันแผลสำหรับหยุดเลือด',
        colorLock: 'กล่องขาว กากบาทแดง',
      },
      {
        id: 'WHEEL-03',
        name: 'พวงมาลัยรถบัสและคันเร่งฉุกเฉิน',
        category: 'vehicle',
        description: 'ระบบควบคุมรถบัสคันหนัก เหยียบมิดไมล์เพื่อพุ่งชนฝ่าวงล้อม',
        colorLock: 'ดำด้าน แดชบอร์ดมีรอยขีดข่วน',
      },
    ],
    blocks: [
      {
        name: 'บล็อก 1: ไวรัสซอมบี้ปะทุขึ้นกะทันหันบนรถบัส เร็นตั้งสติคุมสถานการณ์และกั้นแนวปลอดภัย',
        locId: 'BUS-01',
        actionSummary: 'ผู้โดยสารด้านหลังเริ่มกลายพันธุ์ เร็นใช้ค้อนทุบกระจกสกัดและช่วยสาวๆ ถอยมาข้างหน้า',
        narrationBeat: 'ในวินาทีนั้นเอง... เสียงกรีดร้องสยองขวัญก็ระเบิดขึ้นที่ท้ายรถบัส! ผู้โดยสารชายคนหนึ่งเกิดอาการชักเกร็งก่อนจะพุ่งเข้ากัดคอคนข้างๆ เลือดสดๆ สาดกระเซ็นไปทั่ว ท่ามกลางความตื่นตระหนก เร็นเป็นคนเดียวที่ตั้งสติได้ เขาดึงค้อนฉุกเฉินขึ้นมาแล้วสั่งการทุกคนให้ถอยร่นมาด้านหน้าทันที',
        dialogueList: [
          { speaker: 'เร็น (Ren)', emotion: 'เด็ดขาด', text: 'ทุกคนถอยมาด้านหน้าเร็วเข้า! อย่าเพิ่งสติแตก อาโออิ มาช่วยฉันดันเบาะกั้นทางเดิน!' },
        ],
      },
      {
        name: 'บล็อก 2: ร่วมมือกับสาวๆ ใช้เบาะนั่งและกระเป๋าเดินทางอุดหน้าต่าง ปิดกั้นการบุก',
        locId: 'BUS-01',
        actionSummary: 'ซากุระ อาโออิ และยูมิช่วยกันส่งของ เร็นตอกสลักเบาะกั้นทางเดินอย่างแน่นหนา',
        narrationBeat: 'วินาทีถัดมา... สาวๆ รวมพลังกันอย่างไม่คิดชีวิต ซากุระและยูมิช่วยกันลำเลียงกระเป๋าเดินทาง ขณะที่อาโออิใช้ดาบไม้ฟันสกัดซอมบี้ตัวแรกที่พยายามปีนข้ามมา เร็นกระแทกเบาะนั่งตัวหนาเข้าล็อกแน่นหนา ปิดกั้นท้ายรถบัสจนกลายเป็นกำแพงป้องกันอันแข็งแกร่ง',
        dialogueList: [
          { speaker: 'ซากุระ (Sakura)', emotion: 'หอบเหนื่อย', text: 'นี่... ตาบ้าเร็น! ฉันไม่ได้ช่วยนายเพราะกลัวหรอกนะ แค่ไม่อยากให้กระเป๋าแบรนด์เนมเลอะเลือดต่างหาก!' },
          { speaker: 'อาโออิ (Aoi)', emotion: 'มุ่งมั่น', text: 'แนวกั้นแน่นหนาแล้วเร็น! ปล่อยแนวหลังให้ฉันจัดการเอง!' },
        ],
      },
      {
        name: 'บล็อก 3: แจกจ่ายอาวุธฉุกเฉิน เร็นเข้าประจำการคุมพวงมาลัยแทนคนขับที่หมดสติ',
        locId: 'COCKPIT-02',
        actionSummary: 'คนขับถูกลูกหลงหมดสติ เร็นกระโดดเข้าจับพวงมาลัย เหยียบคลัตช์และเข้าเกียร์',
        narrationBeat: 'ทว่าวิกฤตยังไม่สิ้นสุด เมื่อคนขับรถบัสช็อกหมดสติ รถเริ่มส่ายไปมาเฉียดชนแผงกั้นทางด่วน! เร็นกระโจนเข้าไปในค็อกพิท ดึงร่างคนขับออกมาให้ยูมิดูแล ก่อนที่เขาจะคว้าพวงมาลัยด้วยสองมือที่มั่นคง เหยียบคันเร่งส่งเสียงเครื่องยนต์คำรามกึกก้อง',
        dialogueList: [
          { speaker: 'ยูมิ (Yumi)', emotion: 'มีสติ', text: 'ชีพจรคนขับยังเต้นอยู่ค่ะ ฉันจะทำการปฐมพยาบาลห้ามเลือดเดี๋ยวนี้!' },
          { speaker: 'เร็น (Ren)', emotion: 'สั่งการ', text: 'จับราวให้แน่นทุกคน! ฉันจะเหยียบมิดไมล์แล้ว!' },
        ],
      },
      {
        name: 'บล็อก 4: เร็นเหยียบคันเร่งมิดไมล์ พารถบัสพุ่งชนฝ่าฝูงซอมบี้นับร้อยตัวบนถนน',
        locId: 'HIGHWAY-03',
        actionSummary: 'รถบัสชนฝ่าฝูงซอมบี้บนไฮเวย์ เศษชิ้นส่วนกระเด็น กระจกเปื้อนเลือด แต่รถไม่หยุดนิ่ง',
        narrationBeat: 'ปัง! ปัง! ปัง! กันชนหน้ารถบัสพุ่งปะทะฝูงซอมบี้นับร้อยตัวที่ขวางหน้าอย่างรุนแรง เลือดและเศษซากกระเด็นสาดใส่กระจกหน้ารถ ทว่าเร็นไม่ยอมผ่อนคันเร่งแม้แต่น้อย เขารักษาเสถียรภาพของพวงมาลัยไว้แน่น พารถบัสทะลวงฝ่าวงล้อมประหนึ่งรถถังเหล็กกล้า',
        dialogueList: [
          { speaker: 'เร็น (Ren)', emotion: 'กัดฟันสู้', text: 'อย่าหวังว่าจะหยุดรถคันนี้ได้! ไปเลยยย!' },
        ],
      },
      {
        name: 'บล็อก 5: ซากรถบรรทุกขวางสะพาน รถบัสติดหล่ม เร็นและทีมสาวๆ ต้องลงไปเคลียร์ทาง',
        locId: 'HIGHWAY-03',
        actionSummary: 'ข้างหน้ามีรถพ่วงชนขวาง เร็นดึงเบรกมือและวางแผนใช้วินช์สลิงดึงเปิดทาง',
        narrationBeat: 'เอี๊ยดดด! เสียงเบรกดังสนั่นเมื่อข้างหน้ามีรถบรรทุกน้ำมันพลิกคว่ำปิดกั้นสะพานข้ามแม่น้ำ รถบัสไม่สามารถแล่นผ่านไปได้ เร็นหยิบชะแลงเหล็ก อาโออิกำดาบไม้แน่น ทั้งสองพร้อมเปิดประตูหน้าเพื่อลงไปปลดล็อกสลิงเคลียร์ทาง ท่ามกลางเสียงขู่คำรามของซอมบี้ที่เริ่มปิดล้อมเข้ามา',
        dialogueList: [
          { speaker: 'อาโออิ (Aoi)', emotion: 'กระตือรือร้น', text: 'ฉันจะคุ้มกันหลังให้นายเองเร็น นายรีบไปปลดสลิงรถบรรทุกซะ!' },
        ],
      },
      {
        name: 'บล็อก 6: การปรากฏตัวของซอมบี้กลายพันธุ์ตัวยักษ์ (Alpha Mutant) เข้าทุบกระจกรถบัส',
        locId: 'HIGHWAY-03',
        actionSummary: 'ซอมบี้กลายพันธุ์ขนาดใหญ่สูงกว่า 2 เมตร โดดลงมาจากสะพาน ทุบกระโปรงรถบัสบุบ',
        narrationBeat: 'ตึงงงง! พื้นสะพานสะเทือนไหวเมื่อซอมบี้กลายพันธุ์ร่างยักษ์สูงกว่า 2 เมตร กระโดดลงมาจากคานสะพาน กล้ามเนื้อของมันปูดโปนด้วยเส้นเลือดสีดำ มันฟาดกำปั้นลงบนฝากระโปรงรถจนยุบตัวลงไป แววตาสีแดงฉานจ้องมองทะลุกระจกเข้ามาในห้องโดยสาร',
        dialogueList: [
          { speaker: 'ซากุระ (Sakura)', emotion: 'หวาดกลัวแต่ส่งเสียงเตือน', text: 'กรี๊ดดด! ตัวอะไรกันน่ะ ใหญ่โตขนาดนั้นจะสู้ได้ยังไง เร็น ระวัง!' },
        ],
      },
      {
        name: 'บล็อก 7: สาวๆ ส่งเสียงดึงดูดความสนใจ เร็นปีนขึ้นหลังคารถบัสพร้อมชะแลงและดาบไม้',
        locId: 'ROOF-04',
        actionSummary: 'ซากุระกดแตรรถบัสล่อเป้า เร็นปีนช่องลมหลังคาขึ้นไปเตรียมลอบจู่โจมจากมุมสูง',
        narrationBeat: 'ในเสี้ยววินาทีแห่งความเป็นความตาย ซากุระตัดสินใจกดแตรรถบัสเสียงดังลั่นเพื่อดึงความสนใจของอสูรกาย ขณะที่เร็นใช้จังหวะนั้นปีนขึ้นช่องระบายอากาศสู่หลังคารถบัส ลมพัดแรงกรรโชกปะทะใบหน้า เขากุมชะแลงเหล็กแน่น เล็งเป้าหมายไปที่จุดอ่อนบริเวณต้นคอของจ่าฝูง',
        dialogueList: [
          { speaker: 'เร็น (Ren)', emotion: 'มีสมาธิขั้นสุด', text: 'เป้าหมายมีเพียงครั้งเดียว... ต้องจบมันให้ได้ในครั้งนี้!' },
        ],
      },
      {
        name: 'บล็อก 8: การต่อสู้เสี่ยงตายบนหลังคารถบัส เร็นสู้สุดใจเพื่อปกป้องทุกคนในรถ',
        locId: 'ROOF-04',
        actionSummary: 'เร็นกระโจนลงมา เสียบชะแลงเข้าที่หัวไหล่อสูรกายและหลบการตวัดแขนอย่างหวุดหวิด',
        narrationBeat: 'ย๊ากกก! เร็นกระโจนลงมาจากหลังคาด้วยความเร็วสูง ทิ่มแทงชะแลงเหล็กเข้าใส่จุดตายของอสูรกายอย่างแม่นยำ! อสูรกายกรีดร้องด้วยความเจ็บปวด เหวี่ยงแขนยักษ์กวาดใส่เร็นจนเขาต้องม้วนตัวหลบเฉียดคมเล็บไปเพียงมิลลิเมตรเดียวบนพื้นสะพานแคบ',
        dialogueList: [
          { speaker: 'เร็น (Ren)', emotion: 'คำรามดุดัน', text: 'แกไม่มีวันได้แตะต้องใครในรถคันนี้เด็ดขาด!' },
        ],
      },
      {
        name: 'บล็อก 9: เร็นซัดจ่าฝูงร่วงลงจากสะพาน และปลดล็อกโซ่คล้องล้อรถบัสได้สำเร็จ',
        locId: 'HIGHWAY-03',
        actionSummary: 'อาโออิพุ่งมาช่วยฟันดาบไม้ซ้ำ เร็นถีบจ่าฝูงตกสะพาน และสับสลักรถบรรทุกเปิดทาง',
        narrationBeat: 'อาโออิพุ่งทะยานออกมาจากประตูรถบัส ตวัดดาบไม้เคนโด้ฟาดเข้าที่ข้อพับของอสูรกายอย่างเต็มแรง ทำให้มันเสียหลักคุกเข่าลง! เร็นไม่รอช้า สปริงตัวถีบยอดอกส่งร่างยักษ์ร่วงหล่นลงสู่แม่น้ำเบื้องล่าง ก่อนจะรีบสับสลักปลดโซ่ซากรถบรรทุกเปิดเส้นทางได้สำเร็จ',
        dialogueList: [
          { speaker: 'อาโออิ (Aoi)', emotion: 'ฮึกเหิม', text: 'สำเร็จแล้วเร็น! รีบขึ้นรถเร็วเข้า!' },
        ],
      },
      {
        name: 'บล็อก 10: รถบัสเร่งเครื่องแล่นฝ่าสายหมอกมุ่งหน้าสู่เขตกักกันปลอดภัย ทุกคนรอดชีวิตด้วยความสามัคคี',
        locId: 'COCKPIT-02',
        actionSummary: 'เร็นกลับเข้าประจำการ เหยียบคันเร่งพารถบัสข้ามสะพานสู่แสงอาทิตย์รุ่งอรุณ',
        narrationBeat: 'บรึ้มมม! เครื่องยนต์รถบัสคำรามลั่นอีกครั้ง เร็นเหยียบคันเร่งพุ่งทะยานข้ามสะพานที่เปิดโล่ง ทิ้งดงซอมบี้คลั่งไว้เบื้องหลัง แสงตะวันรุ่งอรุณสีทองสาดส่องผ่านกระจกหน้า ซากุระ ยูมิ และอาโออิต่างมองหน้าเร็นด้วยรอยยิ้มแห่งความหวัง การเดินทางของพวกเขายังดำเนินต่อไป... แต่ไม่มีอะไรจะหยุดยั้งพวกเขาได้อีกแล้ว!',
        dialogueList: [
          { speaker: 'ซากุระ (Sakura)', emotion: 'ยิ้มอ่อนโยน', text: 'ขอบใจนะ... เร็น' },
          { speaker: 'เร็น (Ren)', emotion: 'อบอุ่นมั่นคง', text: 'พวกเราจะรอดชีวิตไปด้วยกันทุกคน... ฉันสัญญา' },
        ],
      },
    ],
  },
  aek_989: {
    id: 'aek_989',
    name: '🎬 [989 VIP] สร้างหนังสั้น 3,000 วินาที รวม 308 ฉาก (เอก AEK-01)',
    badge: '989 VIP Mode',
    title: 'สร้างหนังสั้น 3,000 วินาที รวม 308 ฉาก ด้วย 989 Ai Prompt (VIP Mode)',
    synopsis: 'โปรเจกต์สาธิตการสร้างหนังสั้นความยาว 1 ชั่วโมงเต็ม (3,000 วินาที / 308 ฉาก) ด้วยเทคนิค 989 Ai Prompt VIP Mode ตามโครงสร้าง 10 บล็อกเนื้อเรื่อง คุมความต่อเนื่องของตัวละคร เอก (AEK-01), สถานที่ห้องพัก (ROOM-01), อุปกรณ์แล็ปท็อป และรถตู้ยุทธการ เพื่อความต่อเนื่องของฉากและบทพูดระดับมืออาชีพ',
    worldCulture: 'thai',
    subGenre: 'military_tactical',
    visualMedium: 'live_action',
    stylePreset: 'hollywood_cinematic',
    characters: [
      {
        id: 'AEK-01',
        name: 'เอก (AEK-01)',
        role: 'protagonist',
        gender: 'ชาย',
        age: '30 ปี',
        bodyBuild: 'สมส่วน คมเข้ม',
        facialFeatures: 'แววตาเฉียบคม มุ่งมั่น เคร่งขรึม มีแผลเป็นบางๆ ใต้ตา',
        hairStyle: 'ผมสั้นเรียบร้อยสไตล์นักสืบ',
        clothingStyle: 'เสื้อเชิ้ตพับแขน สีกรมท่า กางเกงสแล็กสีเทาเข้ม',
        colorTheme: 'กรมท่า-เทา-ดำ',
        weaponsOrProps: 'แล็ปท็อปเอกสารลับ / แฟลชไดรฟ์ข้อมูลเข้ารหัส / วิทยุสื่อสาร',
        personality: 'สุขุม ช่างสังเกต ละเอียดรอบคอบ ไม่ยอมแพ้ต่ออุปสรรค',
        abilities: 'การวิเคราะห์ข้อมูลความมั่นคง, การสืบสวนเชิงลึก, การวางแผนยุทธวิธี',
        weaknesses: 'ทำงานหนักจนแทบไม่ได้พักผ่อน',
        relationships: 'สายลับอิสระผู้กุมความลับขององค์กร',
        appearanceAnchor: 'handsome Thai detective in his 30s, short neat hair, wearing navy blue rolled-up shirt, focused sharp eyes, looking at laptop in dark room, cinematic lighting',
        voiceStyle: 'ทุ้ม นิ่ง สุขุม ชัดเจน น่าเชื่อถือ',
      },
      {
        id: 'CMD-02',
        name: 'ผู้พันเกรียง (COMMANDER-02)',
        role: 'supporting',
        gender: 'ชาย',
        age: '48 ปี',
        bodyBuild: 'กำยำ น่าเกรงขาม',
        facialFeatures: 'ใบหน้าเหลี่ยมดุดัน แววตามีอำนาจ',
        hairStyle: 'ผมเกรียนสั้น',
        clothingStyle: 'เสื้อกั๊กยุทธการสีดำ สวมแว่นกันแดดแทคติคอล',
        colorTheme: 'ดำ-เขียวมะกอก',
        weaponsOrProps: 'แท็บเล็ตสั่งการยุทธการ / ปืนพกซองข้างเอว',
        personality: 'เข้มงวด เด็ดขาด ตรงไปตรงมา',
        abilities: 'การบัญชาการรบและการควบคุมกำลังพล',
        weaknesses: 'ยึดถือกฎระเบียบเคร่งครัด',
        relationships: 'ผู้บังคับบัญชาภารกิจลับ',
        appearanceAnchor: 'senior Thai military commander, buzzcut hair, tactical vest, authoritative stern face, military base backdrop',
        voiceStyle: 'ทุ้มต่ำ ดุดัน สั่งการอย่างมีอำนาจ',
      },
    ],
    locations: [
      {
        id: 'ROOM-01',
        name: 'ห้องพักเอก (ROOM-01)',
        type: 'ภายในอาคาร',
        timeOfDay: 'กลางวัน',
        weather: 'ปกติ',
        lighting: 'แสงโคมไฟสีส้มสลัวส่องกระทบโต๊ะทำงานตัดกับเงามืด',
        description: 'ห้องพักแคบๆ ในอพาร์ตเมนต์เก่า โต๊ะทำงานไม้สีเข้ม มีหน้าจอและเอกสารวางซ้อนกัน แผ่นกระดาษรหัสลับแปะบนผนังด้านหลัง',
      },
      {
        id: 'STREET-02',
        name: 'ถนนสายเปลี่ยว (STREET-02)',
        type: 'ภายนอกอาคาร',
        timeOfDay: 'กลางคืน',
        weather: 'ฝนตกพรำๆ หมอกลงจัด',
        lighting: 'แสงไฟนีออนริมทางสะท้อนแอ่งน้ำเปียกชื้นบนถนน',
        description: 'ถนนยางมะตอยยาวไกลในยามวิกาล บรรยากาศเงียบสงัดชวนกดดัน มีรถตู้ยุทธการจอดซุ่มอยู่',
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
    ],
    props: [
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
    ],
    blocks: [
      {
        name: 'บล็อก 1: จุดเริ่มต้นและปริศนาที่ซ่อนเร้นในห้องพักเอก',
        locId: 'ROOM-01',
        actionSummary: 'เอกตรวจพบไฟล์ข้อมูลลับที่ถูกส่งเข้ามาในแล็ปท็อป',
        narrationBeat: 'ในวินาทีนั้นเอง... ภายในห้องพักเอกที่เงียบสงบ แสงไฟจากหน้าจอแล็ปท็อปสะท้อนแววตาอันมุ่งมั่นของเอก ตัวเลขและรหัสข้อมูลเริ่มไหลผ่านหน้าจออย่างรวดเร็ว บ่งชี้ถึงภัยคุกคามที่กำลังคืบคลานเข้ามา',
        dialogueList: [
          { speaker: 'เอก (AEK-01)', emotion: 'เคร่งขรึม', text: 'ข้อมูลชุดนี้... ไม่ใช่เรื่องธรรมดาแล้ว นี่คือแผนการระดับประเทศ' },
        ],
      },
      {
        name: 'บล็อก 2: การค้นพบเบาะแสสำคัญและการตัดสินใจ',
        locId: 'ROOM-01',
        actionSummary: 'เอกถอดรหัสพิกัดและเตรียมอุปกรณ์เพื่อลงพื้นที่',
        narrationBeat: 'วินาทีถัดมา... เอกคลิกยืนยันการถอดรหัส แผนที่ดาวเทียมแสดงพิกัดที่ตั้งของฐานลับ เอกเก็บแล็ปท็อปและแฟลชไดรฟ์ลงกระเป๋า ก้าวออกจากห้องทำงานด้วยความเด็ดเดี่ยว',
        dialogueList: [
          { speaker: 'เอก (AEK-01)', emotion: 'เด็ดเดี่ยว', text: 'ถึงเวลาต้องลงมือด้วยตัวเองแล้ว' },
        ],
      },
      {
        name: 'บล็อก 3: ก้าวสู่อันตรายและการเดินทางในเงามืดบนถนนสายเปลี่ยว',
        locId: 'STREET-02',
        actionSummary: 'เอกขับรถฝ่าสายฝนและหมอกหนาบนถนนสายเปลี่ยว',
        narrationBeat: 'สายฝนโปรยปรายลงมากระทบกระจกรถ ถนนสายเปลี่ยวทอดยาวในความมืดมิด เอกเฝ้ามองกระจกมองหลังอย่างระมัดระวัง สัญญาณการดักฟังเริ่มปรากฏขึ้นในวิทยุสื่อสาร',
        dialogueList: [
          { speaker: 'เอก (AEK-01)', emotion: 'ระแวดระวัง', text: 'มีคนกำลังจับตาดูเราอยู่... ต้องเปลี่ยนเส้นทาง' },
        ],
      },
      {
        name: 'บล็อก 4: การเผชิญหน้าอุปสรรคและการถูกสะกดรอยตาม',
        locId: 'STREET-02',
        actionSummary: 'รถตู้ปริศนาพยายามขับเบียด เอกใช้ทักษะขับขี่หักหลบเข้าซอยแคบ',
        narrationBeat: 'ทันใดนั้นเอง... ไฟหน้ารถตู้สีดำพุ่งสาดเข้ามาจากด้านหลัง เร่งเครื่องพยายามเข้าประชิด เอกหักพวงมาลัยหลบอย่างเฉียบคม เสียงยางกรีดร้องบนถนนเปียกน้ำก่อนจะหายลับเข้าสู่เงามืด',
        dialogueList: [
          { speaker: 'เอก (AEK-01)', emotion: 'ตื่นตัว', text: 'อยากเล่นแบบนี้ใช่ไหม... ได้เลย!' },
        ],
      },
      {
        name: 'บล็อก 5: จุดเปลี่ยนครั้งใหญ่และการเปิดโปงความจริงที่ศูนย์บัญชาการ',
        locId: 'BASE-03',
        actionSummary: 'เอกเข้าถึงศูนย์บัญชาการลับและส่งมอบหลักฐานให้ผู้พันเกรียง',
        narrationBeat: 'ประตูเหล็กหนาของศูนย์บัญชาการลับเปิดออก เอกก้าวเข้าไปพร้อมแฟลชไดรฟ์ในมือ ผู้พันเกรียงยืนรออยู่หน้าจอมอนิเตอร์ยักษ์ด้วยสีหน้าตึงเครียด ข้อมูลถูกอัปโหลดขึ้นสู่หน้าจอหลักทันที',
        dialogueList: [
          { speaker: 'ผู้พันเกรียง (COMMANDER-02)', emotion: 'สั่งการ', text: 'เอก นายทำได้ดีมาก ข้อมูลนี้จะเปลี่ยนเกมทั้งหมด!' },
        ],
      },
      {
        name: 'บล็อก 6: การไล่ล่า ชิงไหวชิงพริบ และวางกับดัก',
        locId: 'BASE-03',
        actionSummary: 'ทีมยุทธการวางกับดักล่อผู้บงการให้ออกมา',
        narrationBeat: 'จอมอนิเตอร์ตรวจการณ์แสดงสัญญาณดาวเทียมจับพิกัดศัตรู เอกและผู้พันเกรียงร่วมมือกันวางกลยุทธ์ล่อเหยื่อ ส่งสัญญาณเท็จเพื่อดักจับสายลับฝ่ายตรงข้ามในจุดนัดพบ',
        dialogueList: [
          { speaker: 'เอก (AEK-01)', emotion: 'มั่นใจ', text: 'พวกมันติดกับเราแล้ว เตรียมพร้อมบุกได้เลยครับ' },
        ],
      },
      {
        name: 'บล็อก 7: วิกฤตการณ์ถึงขีดสุดและการเข้าประชิดพื้นที่เป้าหมาย',
        locId: 'STREET-02',
        actionSummary: 'หน่วยจู่โจมเคลื่อนพลเข้าปิดล้อมรถตู้ศัตรู',
        narrationBeat: 'หน่วยปฏิบัติการพิเศษเคลื่อนพลปิดล้อมสี่แยกอย่างเงียบกริบ แสงเลเซอร์สีแดงทาบลงบนกระจกรถตู้เป้าหมาย บรรยากาศตึงเครียดบีบคั้นหัวใจจนแทบหยุดหายใจ',
        dialogueList: [
          { speaker: 'ผู้พันเกรียง (COMMANDER-02)', emotion: 'ดุดัน', text: 'ทุกหน่วยประจำตำแหน่ง... รอคำสั่งปฏิบัติการ!' },
        ],
      },
      {
        name: 'บล็อก 8: ศึกแตกหักและการเผชิญหน้าศัตรูตัวจริง',
        locId: 'STREET-02',
        actionSummary: 'การปะทะด้วยอาวุธและยุทธวิธี เอกเข้าจับกุมหัวหน้าเครือข่าย',
        narrationBeat: 'เสียงสัญญาณบุกดังขึ้น! เอกพุ่งเข้าประชิดเป้าหมายอย่างรวดเร็ว ปลดอาวุธศัตรูด้วยยุทธวิธีระยะประชิด ท่ามกลางประกายแสงแฟลชและความโกลาหล',
        dialogueList: [
          { speaker: 'เอก (AEK-01)', emotion: 'เฉียบขาด', text: 'ยอมจำนนซะ! เกมของแกจบลงแล้ว!' },
        ],
      },
      {
        name: 'บล็อก 9: ไคลแม็กซ์ระทึกขวัญและการปลดล็อกชัยชนะ',
        locId: 'BASE-03',
        actionSummary: 'กู้คืนระบบความปลอดภัยและทำลายรหัสไวรัสข้อมูลสำเร็จ',
        narrationBeat: 'หน้าจอมอนิเตอร์ในศูนย์บัญชาการเปลี่ยนเป็นสีเขียว สัญญาณเตือนภัยดับลง รหัสไวรัสถูกลบล้างโดยสมบูรณ์ เอกถอนหายใจยาวด้วยความโล่งอก',
        dialogueList: [
          { speaker: 'ผู้พันเกรียง (COMMANDER-02)', emotion: 'ภูมิใจ', text: 'ภารกิจลุล่วง ภารกิจนี้สำเร็จเพราะนาย เอก' },
        ],
      },
      {
        name: 'บล็อก 10: บทสรุป รุ่งอรุณใหม่ และตำนานที่ถูกจารึก',
        locId: 'ROOM-01',
        actionSummary: 'เอกกลับมายังห้องพัก ปิดหน้าจอแล็ปท็อป มองแสงตะวันยามเช้า',
        narrationBeat: 'แสงแดดแรกของวันใหม่ส่องผ่านหน้าต่างห้องพัก เอกพับหน้าจอแล็ปท็อปเก็บลงโต๊ะ ความสงบสุขได้กลับคืนสู่บ้านเมืองอีกครั้ง และเขาก็พร้อมเสมอสำหรับภารกิจครั้งต่อไป',
        dialogueList: [
          { speaker: 'เอก (AEK-01)', emotion: 'สงบ สุขุม', text: 'ตราบใดที่ยังมีรุ่งอรุณ... หน้าที่ของเราก็ยังไม่จบสิ้น' },
        ],
      },
    ],
  },
};

/**
 * สร้างฉากที่ตรงกับ Story Preset โดยละเอียด
 */
export function generateScenesForPreset(
  project: Project,
  preset: StoryPresetConfig,
  targetScenesCount: number = 40
): ScriptScene[] {
  const scenes: ScriptScene[] = [];
  const focusPool = FOCUS_OPTIONS.map((f) => f.label);
  const compPool = COMPOSITION_OPTIONS.map((c) => c.label);
  const shotPool = SHOT_TYPES.map((s) => s.label);
  const anglePool = CAMERA_ANGLES.map((a) => a.label);
  const movePool = CAMERA_MOVEMENTS.map((m) => m.label);

  const locMap = new Map<string, LocationItem>();
  preset.locations.forEach((l) => locMap.set(l.id, l));

  for (let i = 0; i < targetScenesCount; i++) {
    const sceneNumber = i + 1;
    const blockIndex = Math.min(9, Math.floor((i / targetScenesCount) * 10));
    const currentBlock = preset.blocks[blockIndex];
    const actNumber = (Math.min(4, Math.floor((i / targetScenesCount) * 4) + 1)) as 1 | 2 | 3 | 4;

    const startSec = i * 10;
    const endSec = (i + 1) * 10;

    const focusType = focusPool[i % focusPool.length];
    const compType = compPool[i % compPool.length];
    const shotType = shotPool[i % shotPool.length];
    const cameraAngle = anglePool[i % anglePool.length];
    const cameraMovement = movePool[i % movePool.length];

    const currentLoc = locMap.get(currentBlock.locId) || preset.locations[0];
    const beatSubIndex = (i % Math.max(1, Math.ceil(targetScenesCount / 10))) + 1;
    const title = `${currentBlock.name} - ช็อตที่ ${beatSubIndex}`;

    // ไหลลื่นแบบ Single-take วินาทีต่อวินาที
    const timeWord = i === 0 ? 'เปิดฉากเรื่องราว...' : `ดำเนินต่อเนื่องในวินาทีที่ ${startSec}-${endSec}...`;
    const narration = `${timeWord} ${currentBlock.narrationBeat} การเคลื่อนไหวของ ${preset.characters[0]?.name || 'ตัวเอก'} ดำเนินไปอย่างสมบูรณ์แบบ ณ ${currentLoc.name}`;

    // ดึงบทสนทนาประจำบล็อก
    const dialogues: CharacterDialogue[] = currentBlock.dialogueList ? [...currentBlock.dialogueList] : [];

    const activeChars = preset.characters.slice(0, 2);
    const activeProps = preset.props.slice(0, 2);

    scenes.push({
      id: `scene-preset-${sceneNumber}-${Date.now()}`,
      sceneNumber,
      actNumber,
      title,
      narration,
      dialogues,
      sfxBgm: `[BGM: ดนตรีประกอบภาพยนตร์ ${preset.visualMedium === 'animation' ? 'อนิเมะ' : 'ภาพยนตร์'} 60fps] [SFX: เสียงบรรยากาศ ${currentLoc.type || 'สถานที่'}]`,
      characterIds: activeChars.map((c) => c.id),
      visualMedium: preset.visualMedium,
      stylePreset: preset.stylePreset as any,
      cameraMovement,
      lighting: currentLoc.lighting || 'Cinematic Lighting 35mm',
      imagePrompt: `${preset.title}, ${title}, ${currentLoc.description}, ${shotType}, ${cameraAngle}, ${preset.stylePreset}, 8k cinematic render`,
      videoMotionPrompt: `[ฉากที่ ${sceneNumber}] [Shot: ${shotType}] [Angle: ${cameraAngle}] [Camera: ${cameraMovement}] [Location: ${currentLoc.name}] Smooth single-take flow, continuous from shot ${Math.max(1, sceneNumber - 1)}, 60fps, 4K resolution.`,
      negativePrompt: 'cartoon, deformed, blur, split screen, low quality',
      aspectRatio: project.aspectRatio,
      estimatedDurationSec: 10,
      createdAt: new Date().toISOString(),
      locationId: currentLoc.id,
      locationName: currentLoc.name,
      focusType,
      focusDetail: `โฟกัส ${focusType} คมชัดสมจริงในระยะ ${shotType} (${currentLoc.name})`,
      compositionType: compType,
      compositionDetail: `จัดวางตามหลัก ${compType} ดึงดูดสายตา โฟกัสที่ ${preset.characters[0]?.name || 'ตัวละคร'}`,
      shotType,
      cameraAngle,
      startTimeSec: startSec,
      endTimeSec: endSec,
      propIds: activeProps.map((p) => p.id),
    });
  }

  return scenes;
}

/**
 * สลับโปรเจกต์ให้ตรงกับ Story Preset ที่เลือกทันที
 */
export function applyStoryPresetToProject(
  project: Project,
  presetKey: 'judian' | 'manga_bus' | 'aek_989' | 'custom',
  customData?: { title?: string; synopsis?: string }
): Project {
  let preset: StoryPresetConfig;

  if (presetKey === 'custom' && customData?.title) {
    const theme = analyzeStoryTheme({
      title: customData.title,
      synopsis: customData.synopsis || '',
    });
    // ใช้ JUDIAN เป็นแม่แบบหากเป็นแนววันสิ้นโลก หรือ Manga หากเป็นแนวรถบัส หรือ 989
    const base = theme.isJudianDoomsday
      ? STORY_PRESETS_989.judian
      : theme.isMangaBusSurvival
      ? STORY_PRESETS_989.manga_bus
      : STORY_PRESETS_989.judian;

    preset = {
      ...base,
      id: base.id,
      name: customData.title,
      badge: theme.themeNameTh,
      title: customData.title,
      synopsis: customData.synopsis || base.synopsis,
      worldCulture: theme.effectiveCulture as any,
      subGenre: theme.effectiveSubGenre,
    };
  } else {
    preset = STORY_PRESETS_989[presetKey] || STORY_PRESETS_989.judian;
  }

  const updatedProject: Project = {
    ...project,
    title: preset.title,
    synopsis: preset.synopsis,
    worldCulture: preset.worldCulture as any,
    subGenre: preset.subGenre,
    visualMedium: preset.visualMedium,
    stylePreset: preset.stylePreset as any,
    characters: preset.characters,
    locations: preset.locations,
    props: preset.props,
    updatedAt: new Date().toISOString(),
  };

  const targetCount = project.scenes && project.scenes.length >= 40 ? project.scenes.length : 40;
  updatedProject.scenes = generateScenesForPreset(updatedProject, preset, targetCount);

  return updatedProject;
}

/**
 * สร้างฉากชุดมาตรฐาน 40 ฉาก (ชุดที่ 1 ตามเทคนิค 989)
 */
export function generateStandardScenes989(project: Project, count: number = 40): ScriptScene[] {
  const theme = analyzeStoryTheme({ title: project.title, synopsis: project.synopsis });
  let preset = STORY_PRESETS_989.judian;
  if (theme.isMangaBusSurvival) {
    preset = STORY_PRESETS_989.manga_bus;
  } else if (!theme.isJudianDoomsday && project.locations?.some((l) => l.name.includes('ห้องพักเอก'))) {
    preset = STORY_PRESETS_989.aek_989;
  }

  return generateScenesForPreset(project, preset, count);
}

/**
 * ฟังก์ชันสร้างหนังสั้น 3,000 วินาที รวม 308 ฉาก ด้วย 989 Ai Prompt (VIP Mode)
 * ตามคลิปวิดีโอ https://www.youtube.com/watch?v=hdxRMa1Wx9Q
 * แบ่งเป็น 10 บล็อกเนื้อเรื่อง (10 Narrative Blocks / Acts) ป้องกันความผิดพลาดของ AI
 */
export function generateVip3000SecondsMovie(project: Project): Project {
  const theme = analyzeStoryTheme({ title: project.title, synopsis: project.synopsis });
  let preset = STORY_PRESETS_989.judian;
  if (theme.isMangaBusSurvival) {
    preset = STORY_PRESETS_989.manga_bus;
  } else if (!theme.isJudianDoomsday && project.locations?.some((l) => l.name.includes('ห้องพักเอก'))) {
    preset = STORY_PRESETS_989.aek_989;
  }

  const updatedProject: Project = {
    ...project,
    title: project.title.includes('ปรมาจารย์จอมสัก') ? preset.title : project.title,
    synopsis: project.synopsis || preset.synopsis,
    characters: project.characters && project.characters.length > 0 && !project.title.includes('ปรมาจารย์จอมสัก') ? project.characters : preset.characters,
    locations: project.locations && project.locations.length > 0 && !project.title.includes('ปรมาจารย์จอมสัก') ? project.locations : preset.locations,
    props: project.props && project.props.length > 0 && !project.title.includes('ปรมาจารย์จอมสัก') ? project.props : preset.props,
    targetDurationMinutes: 51.3,
    updatedAt: new Date().toISOString(),
  };

  const newScenes = generateScenesForPreset(updatedProject, preset, 308);

  return {
    ...updatedProject,
    scenes: newScenes,
    aiRules: project.aiRules || DEFAULT_989_AI_RULES,
  };
}
