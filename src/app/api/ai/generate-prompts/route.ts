import { NextResponse } from 'next/server';
import { buildVisualPrompts } from '@/lib/ai-prompt-engine';
import { MovieGenre, VisualMedium, StylePreset, CharacterBible } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sceneTitle,
      narration,
      dialogues = [],
      visualMedium = 'animation',
      stylePreset = 'donghua_3d',
      genre = 'xianxia_cultivation',
      cameraMovement = 'Cinematic medium shot',
      lighting = 'Dramatic lighting',
      charactersInScene = [],
      sceneNumber = 1,
    } = body;

    const dialogueText = dialogues.map((d: any) => `${d.speaker}: ${d.text}`).join(' ');

    const prompts = buildVisualPrompts({
      sceneTitle,
      narration,
      dialogueText,
      visualMedium: visualMedium as VisualMedium,
      stylePreset: stylePreset as StylePreset,
      genre: genre as MovieGenre,
      cameraMovement,
      lighting,
      charactersInScene: charactersInScene as CharacterBible[],
      sceneNumber: Number(sceneNumber),
    });

    return NextResponse.json({
      success: true,
      prompts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error generating prompts';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
