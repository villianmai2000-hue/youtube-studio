import { NextResponse } from 'next/server';
import { getAllProjects, saveProject } from '@/lib/storage';
import { Project, MovieGenre, VisualMedium, StylePreset, CharacterBible, AspectRatio, ScriptEngine } from '@/lib/types';
import { generateActTemplateScenes } from '@/lib/script-templates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ success: true, projects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      synopsis,
      genre = 'xianxia_cultivation',
      genreNameCustom,
      worldCulture = 'chinese',
      subGenre = '',
      worldBuilding,
      storyArchitecture,
      militaryCategory,
      visualMedium = 'animation',
      stylePreset = 'donghua_3d',
      aspectRatio = '16:9',
      scriptEngine = 'gemini_3_1_pro',
      targetDurationMinutes = 60,
      characters: customCharacters,
      leadHeroName = 'เซียวหลิน',
      leadHeroAnchor = 'handsome young cultivation prodigy, sharp intense dark eyes, long flowing black hair with jade hairpin, flowing black and gold embroidered daoist martial robe',
      antagonistName = 'จ้าวอสูรโลหิต',
      antagonistAnchor = 'formidable demon overlord, glowing crimson eyes, sharp demonic armor, aura of dark mist',
    } = body;

    const projectId = `proj-${Date.now()}`;

    // Build characters list preserving all 11 dimensions
    let projectCharacters: CharacterBible[] = [];

    if (Array.isArray(customCharacters) && customCharacters.length > 0) {
      projectCharacters = customCharacters.map((c: any, idx: number) => ({
        id: c.id || `char-${Date.now()}-${idx + 1}`,
        name: c.name || `ตัวละคร ${idx + 1}`,
        role: c.role || (idx === 0 ? 'protagonist' : idx === 1 ? 'antagonist' : 'supporting'),
        gender: c.gender,
        ageGroup: c.ageGroup,
        age: c.age,
        bodyBuild: c.bodyBuild,
        facialFeatures: c.facialFeatures,
        hairStyle: c.hairStyle,
        clothingStyle: c.clothingStyle || 'ชุดประจำตัวละคร',
        colorTheme: c.colorTheme,
        weaponsOrProps: c.weaponsOrProps || '',
        personality: c.personality,
        abilities: c.abilities,
        weaknesses: c.weaknesses,
        relationships: c.relationships,
        appearanceAnchor: c.appearanceAnchor || 'ลักษณะเด่นของตัวละคร คมชัดระดับภาพยนตร์',
        voiceStyle: c.voiceStyle || 'เสียงพากย์น่าเกรงขาม ชัดเจน มีพลัง',
        googleFlowSeed: c.googleFlowSeed || String(Math.floor(100000 + Math.random() * 900000)),
        googleFlowPrompt: c.googleFlowPrompt || `${c.appearanceAnchor || ''}, character portrait, 8k resolution, cinematic lighting`,
      }));
    } else {
      const heroSeed = String(Math.floor(100000 + Math.random() * 900000));
      const villainSeed = String(Math.floor(100000 + Math.random() * 900000));

      projectCharacters = [
        {
          id: `char-${Date.now()}-1`,
          name: leadHeroName || (genre === 'military_tactical' ? 'ผู้การพายุ' : 'เซียวหลิน'),
          role: 'protagonist',
          appearanceAnchor: leadHeroAnchor || (
            genre === 'military_tactical'
              ? 'ผู้บัญชาการหน่วยรบพิเศษหนุ่ม ผิวเข้มคมเข้ม สวมหมวกเบเรต์และชุดเกราะ Tactical Vest ลายพราง แววตาเด็ดเดี่ยว มีแผลเป็นเล็กๆ เหนือคิ้วซ้าย'
              : 'จอมยุทธ์หนุ่มรูปงาม ผมยาวสีขาวเงินเกล้ามวยด้วยปิ่นหยกขาว สวมชุดคลุมเต๋าผ้าไหมสีดำปักดิ้นทอง แววตาสีอำพัน สะพายกระบี่เทพโบราณสีครามไว้ด้านหลัง สไตล์อนิเมะจีน 3D สวยสง่า'
          ),
          clothingStyle: genre === 'military_tactical'
            ? 'ชุดเกราะ Tactical Vest ลายพรางสนามรบ วิทยุสื่อสารสะพายบ่า'
            : (visualMedium === 'live_action' ? 'ชุดคลุมหนังและผ้าสไตล์ภาพยนตร์สมจริง' : 'ชุดคลุมผ้าไหมโบราณพริ้วไหวปักดิ้นทอง'),
          voiceStyle: genre === 'military_tactical' ? 'ดุดัน หนักแน่น สั่งการเด็ดขาด' : 'ทุ้ม นิ่ง สุขุม แฝงพลังความมุ่งมั่น',
          weaponsOrProps: genre === 'military_tactical' ? 'ปืนไรเฟิลจู่โจมติดกล้องเล็งและไฟเลเซอร์' : 'กระบี่ครามโบราณลอยกลางอากาศ',
          googleFlowSeed: heroSeed,
          googleFlowPrompt: `masterpiece character portrait, ${leadHeroAnchor || 'heroic warrior'}, detailed cinematic lighting, photorealistic 8k, flow.google.com quality --seed ${heroSeed}`,
        },
        {
          id: `char-${Date.now()}-2`,
          name: antagonistName || (genre === 'military_tactical' ? 'แม่ทัพศัตรู' : 'จ้าวอสูรโลหิต'),
          role: 'antagonist',
          appearanceAnchor: antagonistAnchor || (
            genre === 'military_tactical'
              ? 'หัวหน้ากองกำลังฝ่ายตรงข้าม รูปร่างกำยำ สวมหน้ากากกันแก๊สและแว่นยุทธวิธีสีดำทมิฬ สวมเสื้อเกราะหนักลายพรางเทาดำ แววตาดุดันโหดเหี้ยม'
              : 'จ้าวอสูรผู้เกรงขาม แววตาสีแดงเพลิงเรืองรอง สวมชุดเกราะหนามสีดำทมิฬ มีไอหมอกมารสีเลือดแผ่ออกมารอบตัว สไตล์อนิเมะจีน 3D น่าเกรงขาม'
          ),
          clothingStyle: genre === 'military_tactical' ? 'เสื้อเกราะหนักลายพรางเทาดำ หน้ากากยุทธวิธี' : 'ชุดเกราะหนามทมิฬ แผ่ไอหมอกมารสีเลือด',
          voiceStyle: 'ดุดัน ทะนงตัว เยือกเย็น',
          weaponsOrProps: genre === 'military_tactical' ? 'ปืนกลหนัก / รีโมตจุดชนวนขีปนาวุธ' : 'ง้าวโลหิตทมิฬ / พลังออร่ามาร',
          googleFlowSeed: villainSeed,
          googleFlowPrompt: `masterpiece character portrait, ${antagonistAnchor || 'formidable antagonist'}, cinematic dark atmospheric lighting, 8k --seed ${villainSeed}`,
        },
      ];
    }

    // Generate initial scenes
    const initialScenes = generateActTemplateScenes({
      title: title || (genre === 'military_tactical' ? 'ยุทธการสายฟ้าแลบ ทะลวงฐานทัพศัตรู' : 'มหากาพย์การต่อสู้ทวงแค้น'),
      synopsis: synopsis || (genre === 'military_tactical' ? 'ปฏิบัติการทางทหารและขีปนาวุธความเร็วเหนือเสียง สยบภัยคุกคามใน 5 นาที' : 'มหากาพย์การต่อสู้ทวงแค้นและก้าวสู่ความเป็นหนึ่ง'),
      genre: genre as MovieGenre,
      visualMedium: visualMedium as VisualMedium,
      stylePreset: stylePreset as StylePreset,
      targetDurationMinutes: Number(targetDurationMinutes) || (genre === 'military_tactical' ? 3 : 60),
      actNumber: 1,
      characters: projectCharacters,
      aspectRatio: (aspectRatio as AspectRatio) || '16:9',
    });

    const newProject: Project = {
      id: projectId,
      title: title || (genre === 'military_tactical' ? 'ยุทธการสงครามสายฟ้าแลบ' : 'โปรเจกต์มหากาพย์ใหม่'),
      synopsis: synopsis || '',
      genre: genre as MovieGenre,
      genreNameCustom,
      worldCulture,
      subGenre,
      worldBuilding,
      storyArchitecture,
      militaryCategory,
      visualMedium: visualMedium as VisualMedium,
      stylePreset: stylePreset as StylePreset,
      aspectRatio: (aspectRatio as AspectRatio) || '16:9',
      scriptEngine: (scriptEngine as ScriptEngine) || 'gemini_3_1_pro',
      targetDurationMinutes: Number(targetDurationMinutes) || (genre === 'military_tactical' ? 3 : 60),
      characters: projectCharacters,
      scenes: initialScenes,
      youtubeChannelStyle: genre === 'military_tactical'
        ? 'แนวทหาร & ยุทธการสงคราม Facebook Reels (2-5 นาที สไตล์ยุทโธปกรณ์ทันสมัย)'
        : 'สไตล์เพื่อนที่ดีที่สุด SAN1 (3D Donghua / Xianxia Recap & Narration)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProject(newProject);

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create project';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
