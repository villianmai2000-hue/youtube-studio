import { VisualMedium, StylePreset, MovieGenre, CharacterBible } from './types';

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
}

export function buildVisualPrompts(params: PromptGenerationParams): {
  imagePrompt: string;
  videoMotionPrompt: string;
  negativePrompt: string;
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
  } = params;

  // 1. Medium & Style Base Keywords
  let styleKeywords = '';
  let negativeKeywords = '';

  if (visualMedium === 'live_action') {
    // โหมดคนจริง (Live-Action Cinema)
    if (stylePreset === 'hollywood_cinematic') {
      styleKeywords = 'cinematic film still, 35mm anamorphic lens, Panavision, photorealistic human actor, realistic skin texture, pores, atmospheric haze, shallow depth of field, 8k resolution, award-winning cinematography';
    } else if (stylePreset === 'imax_70mm') {
      styleKeywords = 'IMAX 70mm photograph, ultra-realistic human, natural lighting, crystal clear details, sharp focus, real life scene, cinematic composition, photorealistic';
    } else if (stylePreset === 'dark_noir') {
      styleKeywords = 'neo-noir film still, dramatic chiaroscuro lighting, heavy shadows, wet reflective pavement, smoke and steam, muted color palette with neon highlights, 35mm film grain, moody realistic human';
    } else {
      styleKeywords = 'cinematic live-action photography, 35mm film stock, photorealistic people, natural textures, authentic human expressions, anamorphic bokeh, film grade';
    }

    negativeKeywords = 'cartoon, anime, 3d render, cgi, illustration, drawing, painting, video game graphics, doll, plastic skin, deformed, bad anatomy, over-saturated';
  } else {
    // โหมดการ์ตูนและแอนิเมชัน (Animation)
    if (stylePreset === 'donghua_3d') {
      // สไตล์ เพื่อนที่ดีที่สุด SAN1 / อนิเมะจีน 3D กำลังภายใน
      styleKeywords = 'premium 3D Chinese Donghua animation style, Unreal Engine 5 cinematic render, Octane render 8k, detailed ethereal xianxia aesthetic, flowing silk robes with golden embroidery, vibrant spiritual qi energy aura, celestial lighting, floating jade particles, magnificent oriental fantasy atmosphere, hyper-detailed 3D character model';
    } else if (stylePreset === 'anime_2d') {
      styleKeywords = 'cinematic 2D Japanese anime, Ufotable and Makoto Shinkai aesthetic, high-end theatrical anime film, hand-drawn anime lineart, dynamic glowing lighting, vibrant color palette, anime masterpiece';
    } else if (stylePreset === 'western_3d') {
      styleKeywords = '3D stylized cinematic animation, Arcane and Pixar studio aesthetic, stylized textures, rich cinematic lighting, expressive character animation, artistic 3D render';
    } else if (stylePreset === 'manhwa_action') {
      styleKeywords = 'Solo Leveling manhwa webtoon style, dark fantasy action manhwa, glowing eyes, high contrast ink shadows, intense kinetic energy, sharp detailed manhwa illustration';
    } else {
      styleKeywords = '3D animated movie still, high quality CGI render, stylized fantasy aesthetic, rich colors, dramatic lighting';
    }

    negativeKeywords = 'live action, real human photo, realistic photograph, camera grain, raw photo, deformed limbs, blurry, low quality, watermark';
  }

  // 2. Genre Atmospheric Elements
  let genreFlavor = '';
  switch (genre) {
    case 'xianxia_cultivation':
      genreFlavor = 'ancient mystical mountain peaks, celestial Daoist temple, floating ancient runes, misty clouds, heavenly cultivation realm, swirling elemental wind';
      break;
    case 'action_scifi':
      genreFlavor = 'futuristic neon megacity, cybernetic technology, holographic interfaces, flying vehicles, dystopian rainy night, high-tech weaponry';
      break;
    case 'epic_fantasy':
      genreFlavor = 'ancient gothic castle ruins, mythical beasts in distance, glowing magical crystals, stormy sky, epic dark fantasy world';
      break;
    case 'horror_thriller':
      genreFlavor = 'eerie haunted atmosphere, creeping shadows, cold dim moonlight, dense ominous fog, tension, suspenseful framing';
      break;
    case 'mystery_noir':
      genreFlavor = 'rain-drenched city alley, flickering streetlights, silhouette figures, Venetian blinds shadows, crime thriller atmosphere';
      break;
    case 'historical_war':
      genreFlavor = 'ancient battlefield, banners fluttering in the wind, war dust, armors, cavalry in formation, epic historical cinematic scale';
      break;
    default:
      genreFlavor = 'cinematic atmosphere, rich environmental storytelling';
  }

  // 3. Character Consistency Anchors
  let characterDescriptions = '';
  if (charactersInScene.length > 0) {
    characterDescriptions = charactersInScene
      .map(
        (c) =>
          `[Character: ${c.name}, ${c.appearanceAnchor}, wearing ${c.clothingStyle}${
            c.weaponsOrProps ? `, equipped with ${c.weaponsOrProps}` : ''
          }]`
      )
      .join(' and ');
  } else {
    characterDescriptions = 'focal character in scene';
  }

  // 4. Summarize Action from Narration/Scene Title
  const cleanSummary = sceneTitle.replace(/ฉากที่ \d+[:\s]*/, '');

  // 5. Construct Final Image Prompt (Midjourney / Flux / SD)
  const imagePrompt = `${styleKeywords}, ${characterDescriptions}, ${cleanSummary}, set in ${genreFlavor}. Camera: ${cameraMovement}. Lighting: ${lighting}. 8k resolution, cinematic composition, widescreen 16:9 aspect ratio --ar 16:9 --v 6.1 --style raw`;

  // 6. Construct Video Motion Prompt (Kling AI / Runway Gen-3 / Luma)
  const videoMotionPrompt = `[Shot ${sceneNumber} Continuity] [Camera: ${cameraMovement}, smooth cinematic motion] [Action: Character performs ${cleanSummary}, continuous action without cut] [Lighting: ${lighting}, atmospheric particles drifting] [Style: ${
    visualMedium === 'live_action' ? 'Live-action realistic 35mm film' : '3D Chinese Donghua animation UE5 render'
  }] Maintain exact character clothing, face, and environment from previous frame. 4K, 60fps, high motion coherence.`;

  return {
    imagePrompt,
    videoMotionPrompt,
    negativePrompt: negativeKeywords,
  };
}
