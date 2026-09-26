import { NextResponse } from 'next/server';
import { getAllProjects, saveProject, getProjectById } from '@/lib/storage';
import { Project, MovieGenre, VisualMedium, StylePreset, CharacterBible, AspectRatio, ScriptEngine, WorldCulture, ScriptScene } from '@/lib/types';
import { generateContinuousMovieScenes } from '@/lib/script-templates';
import { generateIntelligentCharacters, detectStoryCharacterScale } from '@/lib/character-generator';
import { generateScriptWithGemini } from '@/lib/gemini-script-service';

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
      genre = 'epic_fantasy',
      genreNameCustom,
      worldCulture = 'thai',
      subGenre = '',
      worldBuilding,
      storyArchitecture,
      militaryCategory,
      visualMedium = 'live_action',
      stylePreset = 'hollywood_cinematic',
      aspectRatio = '16:9',
      scriptEngine = 'gemini_3_1_pro',
      characterCount,
      targetDurationMinutes = 60,
      characters: customCharacters,
      leadHeroName = 'พระเอก',
      leadHeroAnchor = 'handsome young Thai man, sharp eyes, modern casual outfit, photorealistic',
      antagonistName = 'ผู้ร้าย',
      antagonistAnchor = 'formidable antagonist, intense eyes, imposing presence',
      // Sequel fields
      seriesId,
      seriesTitle,
      partNumber,
      parentProjectId,
      nextPartProjectId,
      previousPartTitle,
      previousEndingRecap,
      apiKey: clientApiKey,
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

    // ✅ สร้างฉากองค์ที่ 1 (Act 1 Preview) ตอนสร้างโปรเจก
    // หากมี Gemini API Key ให้ใช้ Gemini AI เจนบทที่มีความลึกซึ้งและตรงกับเรื่องย่อ 100%
    // หากไม่มีหรือเกิดข้อผิดพลาด จะใช้ Cinema Engine อัจฉริยะ (Semantic Story Synthesizer) แทน
    const effectiveApiKey = (clientApiKey || process.env.GEMINI_API_KEY || '').trim();
    let initialScenes: ScriptScene[] = [];

    if (effectiveApiKey) {
      try {
        const geminiResult = await generateScriptWithGemini({
          apiKey: effectiveApiKey,
          title: title || (genre === 'military_tactical' ? 'ยุทธการสายฟ้าแลบ ทะลวงฐานทัพศัตรู' : 'มหากาพย์การต่อสู้ทวงแค้น'),
          synopsis: synopsis || '',
          genre: (subGenre || genre || 'epic_fantasy') as string,
          visualMedium: visualMedium as string,
          stylePreset: stylePreset as string,
          actNumber: 1,
          characters: projectCharacters,
          worldCulture,
          subGenre,
        });

        if (geminiResult?.scenes?.length > 0) {
          initialScenes = geminiResult.scenes;
        }
      } catch (geminiErr) {
        console.warn('POST /api/projects: Gemini scene generation failed, falling back to dynamic cinema engine:', geminiErr);
      }
    }

    if (!initialScenes || initialScenes.length === 0) {
      initialScenes = generateContinuousMovieScenes({
        title: title || (genre === 'military_tactical' ? 'ยุทธการสายฟ้าแลบ ทะลวงฐานทัพศัตรู' : 'มหากาพย์การต่อสู้ทวงแค้น'),
        synopsis: synopsis || (genre === 'military_tactical' ? 'ปฏิบัติการทางทหารและขีปนาวุธความเร็วเหนือเสียง สยบภัยคุกคามใน 5 นาที' : 'มหากาพย์การต่อสู้ทวงแค้นและก้าวสู่ความเป็นหนึ่ง'),
        genre: genre as MovieGenre,
        visualMedium: visualMedium as VisualMedium,
        stylePreset: stylePreset as StylePreset,
        targetDurationMinutes: 1,   // ✅ แค่ 1 นาที = 6 ฉาก (Act 1 preview) สร้างเร็ว ไม่ timeout
        characters: projectCharacters,
        aspectRatio: (aspectRatio as AspectRatio) || '16:9',
        worldCulture,
        subGenre,
      });
    }


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
