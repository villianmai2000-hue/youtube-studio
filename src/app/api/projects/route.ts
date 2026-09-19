import { NextResponse } from 'next/server';
import { getAllProjects, saveProject } from '@/lib/storage';
import { Project, MovieGenre, VisualMedium, StylePreset, CharacterBible } from '@/lib/types';
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
      visualMedium = 'animation',
      stylePreset = 'donghua_3d',
      targetDurationMinutes = 60,
      leadHeroName = 'เซียวหลิน',
      leadHeroAnchor = 'handsome young cultivation prodigy, sharp intense dark eyes, long flowing black hair with jade hairpin, flowing black and gold embroidered daoist martial robe',
      antagonistName = 'จ้าวอสูรโลหิต',
      antagonistAnchor = 'formidable demon overlord, glowing crimson eyes, sharp demonic armor, aura of dark mist',
    } = body;

    const projectId = `proj-${Date.now()}`;

    // Create Initial Character Bible
    const defaultCharacters: CharacterBible[] = [
      {
        id: `char-${Date.now()}-1`,
        name: leadHeroName || 'เซียวหลิน',
        role: 'protagonist',
        appearanceAnchor: leadHeroAnchor || 'จอมยุทธ์หนุ่มรูปงาม ผมยาวสีขาวเงินเกล้ามวยด้วยปิ่นหยกขาว สวมชุดคลุมเต๋าผ้าไหมสีดำปักดิ้นทอง แววตาสีอำพัน สะพายกระบี่เทพโบราณสีครามไว้ด้านหลัง สไตล์อนิเมะจีน 3D สวยสง่า',
        clothingStyle: visualMedium === 'live_action' ? 'ชุดคลุมหนังและผ้าสไตล์ภาพยนตร์สมจริง' : 'ชุดคลุมผ้าไหมโบราณพริ้วไหวปักดิ้นทอง',
        voiceStyle: 'ทุ้ม นิ่ง สุขุม แฝงพลังความมุ่งมั่น',
        weaponsOrProps: genre === 'xianxia_cultivation' ? 'กระบี่ครามโบราณลอยกลางอากาศ' : 'อาวุธประจำกาย',
      },
      {
        id: `char-${Date.now()}-2`,
        name: antagonistName || 'จ้าวอสูรโลหิต',
        role: 'antagonist',
        appearanceAnchor: antagonistAnchor || 'จ้าวอสูรผู้เกรงขาม แววตาสีแดงเพลิงเรืองรอง สวมชุดเกราะหนามสีดำทมิฬ มีไอหมอกมารสีเลือดแผ่ออกมารอบตัว สไตล์อนิเมะจีน 3D น่าเกรงขาม',
        clothingStyle: 'ชุดเกราะหนามทมิฬ แผ่ไอหมอกมารสีเลือด',
        voiceStyle: 'ดุดัน ทะนงตัว เยือกเย็น',
        weaponsOrProps: 'ง้าวโลหิตทมิฬ / พลังออร่ามาร',
      },
    ];

    // Generate initial scenes for Act 1
    const initialScenes = generateActTemplateScenes({
      title,
      synopsis: synopsis || 'มหากาพย์การต่อสู้ทวงแค้นและก้าวสู่ความเป็นหนึ่งในยุทธภพ',
      genre: genre as MovieGenre,
      visualMedium: visualMedium as VisualMedium,
      stylePreset: stylePreset as StylePreset,
      targetDurationMinutes: Number(targetDurationMinutes) || 60,
      actNumber: 1,
      characters: defaultCharacters,
    });

    const newProject: Project = {
      id: projectId,
      title: title || 'โปรเจกต์มหากาพย์ใหม่',
      synopsis: synopsis || '',
      genre: genre as MovieGenre,
      genreNameCustom,
      visualMedium: visualMedium as VisualMedium,
      stylePreset: stylePreset as StylePreset,
      targetDurationMinutes: Number(targetDurationMinutes) || 60,
      characters: defaultCharacters,
      scenes: initialScenes,
      youtubeChannelStyle: 'สไตล์เพื่อนที่ดีที่สุด SAN1 (3D Donghua / Xianxia Recap & Narration)',
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
