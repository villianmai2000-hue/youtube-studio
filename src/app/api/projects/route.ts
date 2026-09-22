import { NextResponse } from 'next/server';
import { getAllProjects, saveProject, getProjectById } from '@/lib/storage';
import { Project, MovieGenre, VisualMedium, StylePreset, CharacterBible, AspectRatio, ScriptEngine, WorldCulture } from '@/lib/types';
import { generateContinuousMovieScenes } from '@/lib/script-templates';
import { generateIntelligentCharacters, detectStoryCharacterScale } from '@/lib/character-generator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json(
      { success: true, projects },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
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
      characterCount,
      targetDurationMinutes = 60,
      characters: customCharacters,
      leadHeroName = 'เซียวหลิน',
      leadHeroAnchor = 'handsome young cultivation prodigy, sharp intense dark eyes, long flowing black hair with jade hairpin, flowing black and gold embroidered daoist martial robe',
      antagonistName = 'จ้าวอสูรโลหิต',
      antagonistAnchor = 'formidable demon overlord, glowing crimson eyes, sharp demonic armor, aura of dark mist',
      // Sequel fields
      seriesId,
      seriesTitle,
      partNumber,
      parentProjectId,
      nextPartProjectId,
      previousPartTitle,
      previousEndingRecap,
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
      // Auto-generate matching ensemble cast based on story title, synopsis, and culture
      const detected = detectStoryCharacterScale(
        title || '',
        synopsis || '',
        worldCulture,
        subGenre
      );
      const targetCount = characterCount ? Math.max(1, Number(characterCount)) : detected.count;
      projectCharacters = generateIntelligentCharacters({
        title: title || (genre === 'military_tactical' ? 'ยุทธการสงครามสายฟ้าแลบ' : 'มหากาพย์การต่อสู้ทวงแค้น'),
        synopsis: synopsis || '',
        worldCulture: (worldCulture as WorldCulture) || 'chinese',
        genre: (subGenre || genre || 'xianxia_cultivation') as string,
        subGenre: subGenre || '',
        visualMedium: (visualMedium as VisualMedium) || 'animation',
        count: targetCount,
      });
    }

    // Generate continuous scenes for full target duration (e.g. 150m = 900 scenes @ 10s/scene)
    const initialScenes = generateContinuousMovieScenes({
      title: title || (genre === 'military_tactical' ? 'ยุทธการสายฟ้าแลบ ทะลวงฐานทัพศัตรู' : 'มหากาพย์การต่อสู้ทวงแค้น'),
      synopsis: synopsis || (genre === 'military_tactical' ? 'ปฏิบัติการทางทหารและขีปนาวุธความเร็วเหนือเสียง สยบภัยคุกคามใน 5 นาที' : 'มหากาพย์การต่อสู้ทวงแค้นและก้าวสู่ความเป็นหนึ่ง'),
      genre: genre as MovieGenre,
      visualMedium: visualMedium as VisualMedium,
      stylePreset: stylePreset as StylePreset,
      targetDurationMinutes: Number(targetDurationMinutes) || (genre === 'military_tactical' ? 3 : 60),
      characters: projectCharacters,
      aspectRatio: (aspectRatio as AspectRatio) || '16:9',
      worldCulture,
      subGenre,
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
      // Sequel & Series Chaining
      seriesId: seriesId || projectId,
      seriesTitle: seriesTitle || title,
      partNumber: Number(partNumber) || 1,
      parentProjectId,
      nextPartProjectId,
      previousPartTitle,
      previousEndingRecap,
      youtubeChannelStyle: genre === 'military_tactical'
        ? 'แนวทหาร & ยุทธการสงคราม Facebook Reels (2-5 นาที สไตล์ยุทโธปกรณ์ทันสมัย)'
        : 'สไตล์เพื่อนที่ดีที่สุด SAN1 (3D Donghua / Xianxia Recap & Narration)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProject(newProject);

    // If this is a sequel, update the parent project's nextPartProjectId
    if (parentProjectId) {
      try {
        const parentProject = await getProjectById(parentProjectId);
        if (parentProject) {
          await saveProject({
            ...parentProject,
            nextPartProjectId: projectId,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (parentErr) {
        console.warn('Failed to link parent project:', parentErr);
      }
    }

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create project';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
