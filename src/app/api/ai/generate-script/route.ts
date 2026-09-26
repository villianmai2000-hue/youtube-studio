import { NextResponse } from 'next/server';
import { generateContinuousMovieScenes } from '@/lib/script-templates';
import { MovieGenre, VisualMedium, StylePreset, CharacterBible } from '@/lib/types';
import { generateScriptWithGemini } from '@/lib/gemini-script-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      synopsis = '',
      genre = 'epic_fantasy',
      visualMedium = 'live_action',
      stylePreset = 'hollywood_cinematic',
      targetDurationMinutes = 60,
      actNumber = 1,
      characters = [],
      apiKey = process.env.GEMINI_API_KEY,
      customInstructions = '',
      mode = 'act', // 'act' | 'full_movie'
      worldCulture = 'thai',
      subGenre = '',
      previousScenes = [],
    } = body;


    // Full Movie Continuous Generator Mode
    if (mode === 'full_movie') {
      const allScenes = generateContinuousMovieScenes({
        title,
        synopsis,
        genre: genre as MovieGenre,
        visualMedium: visualMedium as VisualMedium,
        stylePreset: stylePreset as StylePreset,
        targetDurationMinutes: Number(targetDurationMinutes) || 60,
        characters: characters as CharacterBible[],
        worldCulture,
        subGenre,
      });

      return NextResponse.json({
        success: true,
        scenes: allScenes,
        totalScenes: allScenes.length,
        source: 'Continuous Movie Cinema Engine (Seedream 5.0 Pro)',
      });
    }

    // Check if Gemini API key is provided and try online generation for a single act
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const geminiResult = await generateScriptWithGemini({
          apiKey: apiKey.trim(),
          title,
          synopsis,
          genre,
          visualMedium,
          stylePreset,
          actNumber,
          characters,
          customInstructions,
          worldCulture,
          subGenre,
          previousScenes,
        });

        if (geminiResult && geminiResult.scenes && geminiResult.scenes.length > 0) {
          return NextResponse.json({
            success: true,
            scenes: geminiResult.scenes,
            source: `Google Gemini AI (${geminiResult.modelUsed})`,
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to local continuous generator:', geminiErr);
      }
    }

    // High quality continuous movie generator filtered to the requested act
    const allScenes = generateContinuousMovieScenes({
      title,
      synopsis,
      genre: genre as MovieGenre,
      visualMedium: visualMedium as VisualMedium,
      stylePreset: stylePreset as StylePreset,
      targetDurationMinutes: Number(targetDurationMinutes) || 60,
      characters: characters as CharacterBible[],
      worldCulture,
      subGenre,
    });

    const actScenes = allScenes.filter((s) => s.actNumber === Number(actNumber));

    return NextResponse.json({
      success: true,
      scenes: actScenes.length > 0 ? actScenes : allScenes.slice(0, 4),
      source: 'Built-in Cinema & Story Engine',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error generating script';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
