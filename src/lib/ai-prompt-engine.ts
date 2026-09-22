import { VisualMedium, StylePreset, MovieGenre, CharacterBible, AspectRatio } from './types';

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
  aspectRatio?: AspectRatio;
  worldCulture?: string; // โ… เน€เธเธดเนเธก worldCulture เน€เธเธทเนเธญเนเธขเธ Thai/Chinese flavor
}

export function buildVisualPrompts(params: PromptGenerationParams): {
  imagePrompt: string;
  videoMotionPrompt: string;
  negativePrompt: string;
  imagePromptEn?: string;
  videoMotionPromptEn?: string;
  googleFlowPrompt: string;
  googleFlowSeed: string;
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
    aspectRatio = '16:9',
    worldCulture = '',
  } = params;

  // 1. เธชเนเธ•เธฅเนเธเธฒเธเธ เธฒเธเธ เธฒเธฉเธฒเนเธ—เธข (Thai Style Keywords)
  let styleKeywordsTh = '';
  let styleKeywordsEn = '';
  let negativeKeywordsTh = '';
  let negativeKeywordsEn = '';

  if (visualMedium === 'live_action') {
    // เนเธซเธกเธ”เธเธเธเธฃเธดเธ (Live-Action Cinema)
    if (stylePreset === 'military_combat') {
      styleKeywordsTh = 'เธ เธฒเธเธขเธเธ•เธฃเนเนเธเธงเธชเธเธเธฃเธฒเธกเธขเธธเธ—เธเธงเธดเธเธตเธชเธกเธเธฃเธดเธเธฃเธฐเธ”เธฑเธเธชเธนเธ, เธ–เนเธฒเธขเธ—เธณเธ”เนเธงเธขเธเธฅเนเธญเธ Tactical Go-Pro 4K เนเธฅเธฐเธเธฅเนเธญเธเนเธ”เธฃเธเธ•เธฃเธงเธเธเธฒเธฃเธ“เนเธ—เธฒเธเธ—เธซเธฒเธฃ, เธซเธเนเธงเธขเธฃเธเธเธดเน€เธจเธฉเธชเธงเธกเธเธธเธ”เธเธฃเธฒเธ Multicam เธญเธธเธเธเธฃเธ“เนเธขเธธเธ—เธเธงเธดเธเธตเธเธฃเธเน€เธเนเธ• เนเธงเนเธเธกเธญเธเธเธฅเธฒเธเธเธทเธ NVG เธซเธกเธงเธเน€เธเธเธฅเนเธฒเธฃเน เธเธทเธเนเธฃเน€เธเธดเธฅเธเธนเนเนเธเธกเธ•เธดเธ”เธเธฅเนเธญเธ Holographic, เธขเธฒเธเน€เธเธฃเธฒเธฐเนเธฅเธฐเธฃเธ–เธ–เธฑเธเธเนเธเธเธงเธฑเธเธเธฃเธฒเธเธ•เธฑเธง, เธฅเธฐเธญเธญเธเธเธธเนเธเนเธฅเธฐเธเธฃเธฐเธเธฒเธขเนเธเธฃเธฐเน€เธเธดเธ”เนเธเธชเธกเธฃเธ เธนเธกเธด เธเธกเธเธฑเธ”เธฃเธฐเธ”เธฑเธ 8K';
      styleKeywordsEn = 'tactical military combat cinematography, photorealistic special forces operators, multicam tactical camo, NVG night vision gear, tactical assault rifles, thermal vision drone angle, battlefield dust and shockwaves, 8k ultra-realistic war film';
    } else if (stylePreset === 'hollywood_cinematic') {
      styleKeywordsTh = 'เธ เธฒเธเธ–เนเธฒเธขเธ เธฒเธเธขเธเธ•เธฃเนเน€เธชเธกเธทเธญเธเธเธเธเธฃเธดเธเธฃเธฐเธ”เธฑเธเธฎเธญเธฅเธฅเธตเธงเธนเธ”, เธ–เนเธฒเธขเธ”เนเธงเธขเน€เธฅเธเธชเนเธ เธฒเธเธขเธเธ•เธฃเน 35 เธกเธก., เธเธดเธงเธกเธเธธเธฉเธขเนเธชเธกเธเธฃเธดเธเน€เธซเนเธเธฃเธนเธเธธเธกเธเธเธเธฑเธ”เน€เธเธ, เนเธชเธเน€เธเธฒเนเธเธ Chiaroscuro เธฅเธธเนเธกเธฅเธถเธ, เธเธฃเธฃเธขเธฒเธเธฒเธจเธซเธกเธญเธเธเธงเธฑเธเธชเธกเธเธฃเธดเธ, เธซเธเนเธฒเธเธฑเธ”เธซเธฅเธฑเธเน€เธเธฅเธญ, เธเธกเธเธฑเธ”เธฃเธฐเธ”เธฑเธ 8K, เน€เธเธฃเธเธเธดเธฅเนเธกเธฃเธฐเธ”เธฑเธเธฃเธฒเธเธงเธฑเธฅเธ เธฒเธเธขเธเธ•เธฃเน';
      styleKeywordsEn = 'cinematic film still, 35mm anamorphic lens, photorealistic human actor, realistic skin texture, chiaroscuro lighting, 8k resolution, award-winning cinematography';
    } else if (stylePreset === 'imax_70mm') {
      styleKeywordsTh = 'เธ เธฒเธเธ–เนเธฒเธขเธเธฅเนเธญเธเธขเธฑเธเธฉเน IMAX 70 เธกเธก. เธเธกเธเธฑเธ”เธชเธนเธเธชเธธเธ”, เธเธเธเธฃเธดเธ 100%, เนเธชเธเธเธฃเธฃเธกเธเธฒเธ•เธดเธชเธกเธเธฃเธดเธ, เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธดเธงเธซเธเธฑเธเนเธฅเธฐเนเธงเธงเธ•เธฒเธเธฑเธ”เน€เธเธเธ—เธธเธเธญเธ“เธน, เนเธ—เธเธ เธฒเธเธขเธเธ•เธฃเนเธฃเธฐเธ”เธฑเธเนเธฅเธ';
      styleKeywordsEn = 'IMAX 70mm photograph, ultra-realistic human actor, natural lighting, crystal clear skin pores, cinematic composition';
    } else if (stylePreset === 'dark_noir') {
      styleKeywordsTh = 'เธ เธฒเธเธขเธเธ•เธฃเนเนเธเธงเธเธฑเธงเธฃเนเธกเธทเธ”เธกเธ, เน€เธเธฒเธกเธทเธ”เธ•เธฑเธ”เธเธฑเธเนเธชเธเนเธเธเธตเธญเธญเธเธเธฑเธ”เธเนเธฒเธ, เธ–เธเธเน€เธเธตเธขเธเธเธทเนเธเธชเธฐเธ—เนเธญเธเนเธชเธเธเนเธณเธเธ, เนเธญเธเธงเธฑเธเธฅเธญเธขเธเธถเนเธเธเธฒเธเธ—เนเธญ, เธเธเธเธฃเธดเธเธญเธฒเธฃเธกเธ“เนเน€เธเธฃเนเธเธเธฃเธถเธก, เนเธ—เธเธเธดเธฅเนเธก 35 เธกเธก.';
      styleKeywordsEn = 'neo-noir film still, heavy shadows, wet reflective pavement, smoke and steam, muted colors with neon highlights, moody realistic human';
    } else {
      styleKeywordsTh = 'เธ เธฒเธเธ–เนเธฒเธขเธ เธฒเธเธขเธเธ•เธฃเนเธเธเธเธฃเธดเธ, เน€เธฅเธเธชเนเธกเธธเธกเธเธงเนเธฒเธเธ เธฒเธเธขเธเธ•เธฃเน, เนเธชเธเธเธฃเธฃเธกเธเธฒเธ•เธด, เธเธทเนเธเธเธดเธงเธชเธกเธเธฃเธดเธเน€เธเนเธเธเธฃเธฃเธกเธเธฒเธ•เธด, เนเธ—เธเธชเธตเธ เธฒเธเธขเธเธ•เธฃเนเธฎเธญเธฅเธฅเธตเธงเธนเธ”';
      styleKeywordsEn = 'cinematic live-action photography, 35mm film stock, photorealistic people, natural textures';
    }

    negativeKeywordsTh = 'เธเธฒเธฃเนเธ•เธนเธ, เธญเธเธดเน€เธกเธฐ, เธ เธฒเธเธงเธฒเธ” 3 เธกเธดเธ•เธด, เนเธกเน€เธ”เธฅเธเธฅเธฒเธชเธ•เธดเธ, เธฅเธฒเธขเน€เธชเนเธเธงเธฒเธ”, เธซเธเนเธฒเน€เธเธตเนเธขเธง, เธชเธฑเธ”เธชเนเธงเธเธเธดเธ”เน€เธเธตเนเธขเธ, เนเธเนเธเธเธฃเธถเนเธเธเธญ, เนเธขเธเธเนเธญเธเธ เธฒเธ, เธ เธฒเธเธเธฐเธ•เธดเธ”, เธซเธฅเธฒเธขเธเนเธญเธเธเธฒเธฃเนเธ•เธนเธ, เน€เธชเนเธเธเธฑเนเธเธเธฅเธฒเธเธเธญ, เธ เธฒเธเนเธขเธเน€เธเธฃเธก, เธชเธญเธเธ เธฒเธเนเธเธซเธเธถเนเธเธฃเธนเธ';
    negativeKeywordsEn = 'cartoon, anime, 3d render, cgi, illustration, drawing, painting, doll, plastic skin, deformed, split screen, divided screen, split frame, diptych, triptych, multiple panels, separate frames, collage, split view, border line between characters, dual screen, picture in picture, comic panels';
  } else {
    // เนเธซเธกเธ”เธเธฒเธฃเนเธ•เธนเธเนเธฅเธฐเนเธญเธเธดเน€เธกเธเธฑเธ (Animation)
    if (stylePreset === 'donghua_3d') {
      // เธชเนเธ•เธฅเน เน€เธเธทเนเธญเธเธ—เธตเนเธ”เธตเธ—เธตเนเธชเธธเธ” SAN1 / เธญเธเธดเน€เธกเธฐเธเธตเธ 3D เธเธณเธฅเธฑเธเธ เธฒเธขเนเธ
      styleKeywordsTh = 'เนเธญเธเธดเน€เธกเธเธฑเธ 3D เธชเนเธ•เธฅเนเธญเธเธดเน€เธกเธฐเธเธตเธเธเธณเธฅเธฑเธเธ เธฒเธขเนเธเธฃเธฐเธ”เธฑเธเธเธฃเธตเน€เธกเธตเธขเธก (เน€เธฃเธเน€เธ”เธญเธฃเน Unreal Engine 5 เธชเนเธ•เธฅเนเน€เธเธทเนเธญเธเธ—เธตเนเธ”เธตเธ—เธตเนเธชเธธเธ” SAN1), เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธฃเธฐเธ“เธตเธ•เธฃเธฐเธ”เธฑเธ 8K, เธเธธเธ”เธเธฅเธธเธกเธเนเธฒเนเธซเธกเนเธเธฃเธฒเธ“เธเธฃเธดเนเธงเนเธซเธงเธเธฑเธเธ”เธดเนเธเธ—เธญเธ, เธญเธญเธฃเนเธฒเธเธฅเธฑเธเธเธฃเธฒเธ“เธงเธดเธเธเธฒเธ“เน€เธฃเธทเธญเธเธฃเธญเธเธฃเธญเธเธ•เธฑเธง, เธฅเธฐเธญเธญเธเนเธชเธเธซเธขเธเธงเธดเน€เธจเธฉเธฅเธญเธขเธเธฅเธฒเธเธญเธฒเธเธฒเธจ, เนเธชเธเธชเธงเธฃเธฃเธเนเธชเธฒเธ”เธชเนเธญเธ, เนเธกเน€เธ”เธฅเธ•เธฑเธงเธฅเธฐเธเธฃ 3D เธฅเธฒเธขเน€เธชเนเธเธเธตเธเธเธ”เธเธฒเธกเธงเธดเธเธดเธ•เธฃ';
      styleKeywordsEn = 'premium 3D Chinese Donghua animation style, Unreal Engine 5 cinematic render, Octane render 8k, detailed ethereal xianxia aesthetic, flowing silk robes with golden embroidery, vibrant spiritual qi energy aura, celestial lighting, floating jade particles, magnificent oriental fantasy atmosphere';
    } else if (stylePreset === 'anime_2d') {
      styleKeywordsTh = 'เธญเธเธดเน€เธกเธฐเธเธตเนเธเธธเนเธ 2D เธฃเธฐเธ”เธฑเธเนเธฃเธเธ เธฒเธเธขเธเธ•เธฃเน, เธฅเธฒเธขเน€เธชเนเธเธงเธฒเธ”เธกเธทเธญเธเธกเธเธฑเธ”เธเธฃเธฐเธ“เธตเธ• (เธชเนเธ•เธฅเน Ufotable เนเธฅเธฐ เธกเธฒเนเธเนเธ•เธฐ เธเธดเธเนเธ), เนเธชเธเธชเธตเธชเธฑเธเธชเธ”เนเธชเน€เธฃเธทเธญเธเธฃเธญเธเธชเธฐเธ”เธธเธ”เธ•เธฒ, เธ—เนเธญเธเธเนเธฒเนเธฅเธฐเน€เธกเธเนเธฅเนเน€เธเธ”เธชเธตเธเธ”เธเธฒเธก';
      styleKeywordsEn = 'cinematic 2D Japanese anime, Ufotable and Makoto Shinkai aesthetic, high-end theatrical anime film, hand-drawn anime lineart, dynamic glowing lighting';
    } else if (stylePreset === 'western_3d') {
      styleKeywordsTh = 'เนเธญเธเธดเน€เธกเธเธฑเธ 3D เธชเนเธ•เธฅเนเธ เธฒเธเธขเธเธ•เธฃเนเนเธญเธเธดเน€เธกเธเธฑเธเธฃเธฐเธ”เธฑเธเนเธฅเธ (เธชเนเธ•เธฅเน Arcane เนเธฅเธฐ Pixar), เธเธทเนเธเธเธดเธงเธกเธตเน€เธญเธเธฅเธฑเธเธฉเธ“เนเธ—เธฒเธเธจเธดเธฅเธเธฐ, เนเธชเธเน€เธเธฒเธเธฑเธ”เธงเธฒเธเธญเธขเนเธฒเธเธกเธตเธกเธดเธ•เธด, เธเธฒเธฃเนเธชเธ”เธเธญเธฒเธฃเธกเธ“เนเธ•เธฑเธงเธฅเธฐเธเธฃเธฅเธถเธเธเธถเนเธ';
      styleKeywordsEn = '3D stylized cinematic animation, Arcane and Pixar studio aesthetic, stylized textures, rich cinematic lighting';
    } else if (stylePreset === 'manhwa_action') {
      styleKeywordsTh = 'เธชเนเธ•เธฅเนเธกเธฑเธเธฎเธงเธฒเธเธฒเธฃเนเธ•เธนเธเน€เธเธฒเธซเธฅเธตเนเธเธงเนเธญเนเธเธเธฑเธเน€เธเนเธกเธเนเธ (เธชเนเธ•เธฅเน Solo Leveling), เนเธงเธงเธ•เธฒเธชเนเธญเธเนเธชเธเน€เธฃเธทเธญเธเธฃเธญเธเนเธเธเธงเธฒเธกเธกเธทเธ”, เน€เธเธฒเธซเธกเธถเธเธชเธตเธ”เธณเธ•เธฑเธ”เธเธฑเธเธเธฅเธฑเธเธเธฒเธเธเธฃเธฐเธเธฒเธขเนเธชเธ, เธฅเธฒเธขเน€เธชเนเธเนเธญเนเธเธเธฑเธเธ—เธฃเธเธเธฅเธฑเธ';
      styleKeywordsEn = 'Solo Leveling manhwa webtoon style, dark fantasy action manhwa, glowing eyes, high contrast ink shadows, intense kinetic energy';
    } else {
      styleKeywordsTh = 'เธ เธฒเธเธขเธเธ•เธฃเนเนเธญเธเธดเน€เธกเธเธฑเธ 3D เธเธธเธ“เธ เธฒเธเธชเธนเธ, เนเธชเธเน€เธเธฒเนเธเธเธ•เธฒเธเธตเธญเธฅเธฑเธเธเธฒเธฃ, เนเธกเน€เธ”เธฅ 3 เธกเธดเธ•เธดเธชเธงเธขเธเธฒเธก';
      styleKeywordsEn = '3D animated movie still, high quality CGI render, stylized fantasy aesthetic';
    }

    negativeKeywordsTh = 'เธเธเธเธฃเธดเธ, เธ เธฒเธเธ–เนเธฒเธขเธเธฒเธเธเธฅเนเธญเธเธเธฃเธดเธ, เธเธดเธงเธกเธเธธเธฉเธขเนเธเธฃเธดเธ, เธ เธฒเธเน€เธเธฅเธญ, เธเธธเธ“เธ เธฒเธเธ•เนเธณ, เธฅเธฒเธขเธเนเธณ, เนเธเนเธเธเธฃเธถเนเธเธเธญ, เนเธขเธเธเนเธญเธเธ เธฒเธ, เธ เธฒเธเธเธฐเธ•เธดเธ”, เธซเธฅเธฒเธขเธเนเธญเธเธเธฒเธฃเนเธ•เธนเธ, เน€เธชเนเธเธเธฑเนเธเธเธฅเธฒเธเธเธญ, เธ เธฒเธเนเธขเธเน€เธเธฃเธก, เธชเธญเธเธ เธฒเธเนเธเธซเธเธถเนเธเธฃเธนเธ';
    negativeKeywordsEn = 'live action, real human photo, realistic photograph, camera grain, raw photo, deformed limbs, split screen, divided screen, split frame, diptych, triptych, multiple panels, separate frames, collage, split view, border line between characters, dual screen, picture in picture, comic panels';
  }

  // 2. เธเธฃเธฃเธขเธฒเธเธฒเธจเนเธเธงเน€เธฃเธทเนเธญเธเธ เธฒเธฉเธฒเนเธ—เธข (Genre Atmospheric Elements)
  // โ… เนเธขเธ epic_fantasy เน€เธเนเธ Thai vs Chinese เธ•เธฒเธก worldCulture
  let genreFlavorTh = '';
  let genreFlavorEn = '';
  switch (genre) {
    case 'xianxia_cultivation':
      genreFlavorTh = 'เธขเธญเธ”เน€เธเธฒเธซเธกเธญเธเธชเธงเธฃเธฃเธเนเนเธซเนเธเนเธ”เธเน€เธเธตเธขเธเนเธเธฃเธฒเธ“, เธงเธดเธซเธฒเธฃเน€เธ•เนเธฒเนเธเธฃเธฒเธ“เธฅเธญเธขเธเธฅเธฒเธเธญเธฒเธเธฒเธจ, เธญเธฑเธเธเธฃเธฐเน€เธเธตเธขเธเธชเนเธญเธเธเธฃเธฐเธเธฒเธขเน€เธฃเธทเธญเธเธฃเธญเธ, เธ—เธฐเน€เธฅเธซเธกเธญเธเธฅเธญเธขเธฅเนเธญเธ, เธงเธฑเธเธงเธเธชเธฒเธขเธฅเธกเนเธซเนเธเธฅเธกเธเธฃเธฒเธ“เธเนเธฒเธ”เธดเธ';
      genreFlavorEn = 'ancient mystical mountain peaks, celestial Daoist temple, floating ancient runes, misty clouds, heavenly cultivation realm';
      break;
    case 'action_scifi':
      genreFlavorTh = 'เธกเธซเธฒเธเธเธฃเนเธซเนเธเนเธฅเธเธญเธเธฒเธเธ• เนเธชเธเนเธเธเธตเธญเธญเธเน€เธเธดเธ”เธเนเธฒ, เน€เธ—เธเนเธเนเธฅเธขเธตเนเธเน€เธเธญเธฃเนเน€เธเธ•เธดเธ, เธขเธฒเธเธเธฒเธซเธเธฐเธเธดเธเธฅเธญเธขเธเธฅเธฒเธเธญเธฒเธเธฒเธจ, เธเธทเธเธเธเธ•เธเนเธเน€เธกเธทเธญเธเนเธฎเน€เธ—เธ';
      genreFlavorEn = 'futuristic neon megacity, cybernetic technology, flying vehicles, dystopian rainy night';
      break;
    case 'epic_fantasy':
      // โ… เนเธขเธเธ•เธฒเธก worldCulture: เนเธ—เธข = เธ—เธธเนเธเธเธฒ/เธงเธฑเธ”/เธเนเธฒ, เธเธตเธ = เธขเธญเธ”เน€เธเธฒเน€เธเธตเธขเธ
      if (worldCulture === 'thai' || !worldCulture) {
        genreFlavorTh = 'เธเธฒเธเธซเธฅเธฑเธเธ•เธฒเธกเน€เธเธทเนเธญเน€เธฃเธทเนเธญเธ: เธเธฃเธฃเธขเธฒเธเธฒเธจเธ เธฒเธเธขเธเธ•เธฃเนเนเธ—เธข (เธ—เธธเนเธเธเธฒ, เธเธเธเธ—, เธเนเธฒเธเธ—เธฃเธเนเธ—เธข, เธงเธฑเธ”เนเธ—เธข, เธเธฃเธธเธเน€เธ—เธ, เธ•เธฅเธฒเธ”, เธซเธฃเธทเธญเธชเธ–เธฒเธเธ—เธตเนเธ—เธตเนเธชเธญเธ”เธเธฅเนเธญเธเธเธฑเธเน€เธเธทเนเธญเน€เธฃเธทเนเธญเธ), เนเธชเธเธเธฃเธฃเธกเธเธฒเธ•เธดเธชเธงเธขเธเธฒเธก, เธเธฃเธฃเธขเธฒเธเธฒเธจเธญเธเธญเธธเนเธเนเธฅเธฐเธชเธกเธเธฃเธดเธ';
        genreFlavorEn = 'Thai cinematic scenery, countryside or urban Bangkok, traditional Thai architecture or modern setting, warm natural lighting, realistic Thai atmosphere matching the story';
      } else if (worldCulture === 'chinese') {
        genreFlavorTh = 'เธขเธญเธ”เน€เธเธฒเธซเธกเธญเธเนเธเธฃเธฒเธ“, เธเธฃเธฒเธชเธฒเธ—เธเธตเธเธขเธธเธเนเธเธฃเธฒเธ“, เธชเธฑเธ•เธงเนเธกเธฑเธเธเธฃเนเธเธ•เธณเธเธฒเธ, เธ—เนเธญเธเธเนเธฒเธเธฒเธขเธธเนเธซเนเธเนเธฅเธเนเธเธเธ•เธฒเธเธตเธ•เธฐเธงเธฑเธเธญเธญเธ';
        genreFlavorEn = 'ancient Chinese mountain, mythical dragon in distance, oriental fantasy castle, stormy sky';
      } else {
        genreFlavorTh = 'เธเธฒเธเธเธฃเธฒเธชเธฒเธ—เนเธเธฃเธฒเธ“เธขเธธเธเธเธฅเธฒเธ, เธชเธฑเธ•เธงเนเธญเธชเธนเธฃเนเธเธ•เธณเธเธฒเธเธเธเธ—เนเธญเธเธเนเธฒ, เธเธฃเธดเธชเธ•เธฑเธฅเน€เธงเธ—เธกเธเธ•เธฃเนเน€เธฃเธทเธญเธเนเธชเธ, เธ—เนเธญเธเธเนเธฒเธเธฒเธขเธธเธชเธฒเธขเธเนเธฒเนเธซเนเธเนเธฅเธเนเธเธเธ•เธฒเธเธต';
        genreFlavorEn = 'ancient gothic castle ruins, mythical beasts in distance, glowing magical crystals, stormy sky';
      }
      break;
    case 'horror_thriller':
      genreFlavorTh = 'เธเธฃเธฃเธขเธฒเธเธฒเธจเธเธงเธเธเธเธฅเธธเธเนเธฅเธฐเธเนเธฒเธชเธฐเธเธฃเธถเธเธเธฅเธฑเธงเธชเนเธ•เธฅเนเธ เธฒเธเธขเธเธ•เธฃเนเธชเธขเธญเธเธเธงเธฑเธเนเธ—เธข, เธจเธฒเธฅเน€เธเธตเธขเธเธ•เธฒเนเธเธฃเธฒเธ“, เธ•เนเธเนเธกเนเธจเธฑเธเธ”เธดเนเธชเธดเธ—เธเธดเนเธเธนเธเธเนเธฒเน€เธเนเธ”เธชเธต, เธเธงเธฑเธเธเธนเธเนเธฅเธฐเน€เธเธฅเธงเน€เธ—เธตเธขเธเธงเธนเธเธงเธฒเธ, เธซเธกเธญเธเธซเธเธฒเธ—เธถเธเนเธฅเธฐเน€เธเธฒเธกเธทเธ”เธฅเธตเนเธฅเธฑเธเธเธงเธเธฅเธธเนเธเธฃเธฐเธ—เธถเธ';
      genreFlavorEn = 'chilling Thai horror cinema atmosphere, sacred ancient shrine, mythical banyan takhian tree wrapped in colorful sacred silks, floating incense smoke, flickering candlelight, dense ominous fog, chiaroscuro creeping shadows, eerie supernatural tension';
      break;
    case 'mystery_noir':
      genreFlavorTh = 'เธ•เธฃเธญเธเธเธญเธเธเธญเธขเนเธเน€เธกเธทเธญเธเธ—เนเธฒเธกเธเธฅเธฒเธเธชเธฒเธขเธเธเธเธฃเธณ, เนเธชเธเนเธเธชเธฅเธฑเธงเธชเธฐเธ—เนเธญเธเนเธญเนเธเธเนเธณ, เน€เธเธฒเธฃเนเธฒเธเธเธฃเธดเธจเธเธฒ, เธเธฃเธฃเธขเธฒเธเธฒเธจเธ เธฒเธเธขเธเธ•เธฃเนเธชเธทเธเธชเธงเธเธเธ”เธตเธเธฒเธ•เธเธฃเธฃเธก';
      genreFlavorEn = 'rain-drenched city alley, flickering streetlights, silhouette figures, crime thriller atmosphere';
      break;
    case 'military_tactical':
      genreFlavorTh = 'เธชเธกเธฃเธ เธนเธกเธดเธฃเธเธขเธธเธ—เธเธเธฒเธฃเธฃเนเธงเธกเธชเธกเธฑเธข เธเธงเธฑเธเธเธทเธเนเธฅเธฐเธเธธเนเธเธฃเธฐเน€เธเธดเธ”เธเธธเนเธเธเธฃเธฐเธเธฒเธข, เธเธฒเธเธ—เธฑเธเธ—เธซเธฒเธฃเธขเธธเธ—เธเธงเธดเธเธตเธฅเธฑเธ, เธเธญเน€เธฃเธ”เธฒเธฃเนเนเธฅเธฐเธฃเธฐเธเธเธ•เธฃเธงเธเธเธฑเธเธ”เธฒเธงเน€เธ—เธตเธขเธกเธ—เธฒเธเธ—เธซเธฒเธฃ, เธฃเธ–เธซเธธเนเธกเน€เธเธฃเธฒเธฐเนเธฅเธฐเธญเธฒเธเธฒเธจเธขเธฒเธเนเธฃเนเธเธเธเธฑเธเธเธดเธเธฅเธฒเธ”เธ•เธฃเธฐเน€เธงเธเน€เธซเธเธทเธญเธเธฒเธเธเนเธฒ';
      genreFlavorEn = 'modern military warzone, battlefield smoke and dust, tactical military forward operating base, thermal radar monitors, armored vehicles and combat UAV drones in sky';
      break;
    case 'historical_war':
      genreFlavorTh = 'เธชเธกเธฃเธ เธนเธกเธดเธฃเธเนเธเธฃเธฒเธ“เธญเธฑเธเธขเธดเนเธเนเธซเธเน, เธเธเธจเธถเธเนเธเธฃเธฒเธ“เนเธเธเธชเธฐเธเธฑเธ”เธเธฅเธฒเธเธชเธฒเธขเธฅเธก, เธเธธเนเธเธเธงเธฑเธเธเธฒเธเธเธญเธเธ—เธฑเธ, เธเธเธงเธเธ—เธฑเธเธ—เธซเธฒเธฃเนเธเธฃเธฒเธ“เธชเธธเธ”เธญเธฅเธฑเธเธเธฒเธฃ';
      genreFlavorEn = 'ancient battlefield, banners fluttering in the wind, war dust, armors, cavalry in formation';
      break;
    default:
      genreFlavorTh = 'เธเธฃเธฃเธขเธฒเธเธฒเธจเธ เธฒเธเธขเธเธ•เธฃเนเน€เธเธตเนเธขเธกเธกเธเธ•เนเธเธฅเธฑเธเนเธฅเธฐเน€เธฃเธทเนเธญเธเธฃเธฒเธง';
      genreFlavorEn = 'cinematic atmosphere, rich environmental storytelling';
  }

  // 3. เธ•เธฑเธงเธฅเธฐเธเธฃเธ—เธตเนเธเธฃเธฒเธเธเนเธเธเธฒเธ (Character Descriptions & Single Frame Composition)
  let characterDescTh = '';
  let characterDescEn = '';
  let sameFrameInstructionTh = '';
  let sameFrameInstructionEn = '';
  let flowSeed = '482910';

  if (charactersInScene.length > 0) {
    flowSeed = charactersInScene[0].googleFlowSeed || `${Math.floor(100000 + Math.random() * 900000)}`;
    characterDescTh = charactersInScene
      .map(
        (c) =>
          `[เธ•เธฑเธงเธฅเธฐเธเธฃ: ${c.name}, เธฃเธนเธเธฅเธฑเธเธฉเธ“เน: ${c.appearanceAnchor}, เธชเธงเธกเนเธชเน: ${c.clothingStyle}${
            c.weaponsOrProps ? `, เธญเธฒเธงเธธเธ/เนเธญเน€เธ—เธก: ${c.weaponsOrProps}` : ''
          }]`
      )
      .join(' เนเธฅเธฐ ');
    characterDescEn = charactersInScene
      .map((c) => `[Character: ${c.name}, ${c.appearanceAnchor}, wearing ${c.clothingStyle}]`)
      .join(' and ');

    if (charactersInScene.length > 1) {
      sameFrameInstructionTh = `[เธเธฒเธฃเธเธฑเธ”เธงเธฒเธเน€เธเธฃเธก: เธ•เธฑเธงเธฅเธฐเธเธฃเธ—เธธเธเธเธ (${charactersInScene.map((c) => c.name).join(', ')}) เธ•เนเธญเธเธเธฃเธฒเธเธเธฃเนเธงเธกเธเธฑเธเนเธเน€เธเธฃเธกเธ เธฒเธเน€เธ”เธตเธขเธงเธเธฑเธเนเธเธ Single Unified Camera Shot เธ–เนเธฒเธขเธ—เธณเนเธเธเนเธญเธ•เน€เธ”เธตเธขเธงเธเธฑเธ เธซเนเธฒเธกเนเธเนเธเธเธฃเธถเนเธเธเธญ เธซเนเธฒเธกเนเธขเธเธเนเธญเธเธ เธฒเธ เธซเนเธฒเธก Split-screen เน€เธ”เนเธ”เธเธฒเธ”]`;
      sameFrameInstructionEn = `[Composition: all characters (${charactersInScene.map((c) => c.name).join(', ')}) captured together inside the exact same single camera frame, cinematic two-shot/group shot, unified single scene without split screen, no collage, no divided frames]`;
    }
  } else {
    characterDescTh = 'เธ•เธฑเธงเธฅเธฐเธเธฃเธซเธฅเธฑเธเนเธเธเธฒเธ';
    characterDescEn = 'focal character in scene';
  }

  // 4. โ… เธชเธฃเธธเธเธเธฒเธฃเธเธฃเธฐเธ—เธณเธเธฒเธ sceneTitle (เธเธถเนเธเธ•เธญเธเธเธตเนเธเธทเธญ sceneAction เธซเธฃเธทเธญ narration เธ—เธตเนเธชเธฑเนเธเนเธฅเนเธง)
  const cleanSummary = sceneTitle.replace(/เธเธฒเธเธ—เธตเน \d+[:\s]*/, '').substring(0, 200);
  // โ… เธ”เธถเธเธเธฃเธดเธเธ—เน€เธเธดเนเธกเน€เธ•เธดเธกเธเธฒเธ narration (เธชเธฑเนเธเน 80 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ) เน€เธเธทเนเธญเนเธซเนเธ เธฒเธเธ•เธฃเธเธเธฑเธเน€เธเธทเนเธญเธซเธฒ
  const narrationContext = narration ? narration.substring(0, 80).replace(/\n/g, ' ') : '';
  const arLabelTh = aspectRatio === '9:16' ? 'เธชเธฑเธ”เธชเนเธงเธเนเธเธงเธ•เธฑเนเธ 9:16 (Reels/Shorts/TikTok)' : 'เธชเธฑเธ”เธชเนเธงเธเธเธญเธเธงเนเธฒเธ 16:9 (เธ เธฒเธเธขเธเธ•เธฃเน/YouTube เนเธเธงเธเธญเธ)';
  const arParam = aspectRatio === '9:16' ? '--ar 9:16' : '--ar 16:9';

  // 5. โ… เธเธฃเธฐเธเธญเธเธเธณเธชเธฑเนเธเธชเธฃเนเธฒเธเธ เธฒเธเธ เธฒเธฉเธฒเนเธ—เธข โ€” เธฃเธงเธก narrationContext เนเธซเนเธ เธฒเธเธ•เธฃเธเธเธ—
  const sameFrameThPart = sameFrameInstructionTh ? `, ${sameFrameInstructionTh}` : '';
  const sameFrameEnPart = sameFrameInstructionEn ? `, ${sameFrameInstructionEn}` : '';

  const imagePrompt = `${styleKeywordsTh}, ${characterDescTh}${sameFrameThPart}, [เธเธฒเธฃเธเธฃเธฐเธ—เธณ: ${cleanSummary}${narrationContext ? ` โ€” ${narrationContext}` : ''}], เธเธฒเธเธซเธฅเธฑเธ: ${genreFlavorTh}, เธกเธธเธกเธเธฅเนเธญเธ: ${cameraMovement}, เนเธชเธเน€เธเธฒ: ${lighting}, เธ เธฒเธ${arLabelTh} เธเธกเธเธฑเธ”เธฃเธฐเธ”เธฑเธ 8K เธฅเธฐเน€เธญเธตเธขเธ”เธเธฃเธฐเธ“เธตเธ•`;

  // เธเธฃเนเธญเธกเธ•เนเธ เธฒเธฉเธฒเธญเธฑเธเธเธคเธฉเธชเธณเธฃเธญเธ
  const imagePromptEn = `${styleKeywordsEn}, ${characterDescEn}${sameFrameEnPart}, [Action: ${cleanSummary}], set in ${genreFlavorEn}. Camera: ${cameraMovement}. Lighting: ${lighting}. 8k resolution, cinematic composition, ${arParam} --v 6.1 --style raw`;

  // 6. เธเธฃเนเธญเธกเธ•เนเธชเธณเธซเธฃเธฑเธ Google Flow (flow.google.com) - เธฅเนเธญเธเธ•เธฑเธงเธฅเธฐเธเธฃเนเธฅเธฐเธเธฒเธเนเธซเนเธเธกเธเธฑเธ” เนเธกเนเน€เธเธตเนเธขเธ
  const googleFlowPrompt = `[Google Flow / VideoFX Prompt - flow.google.com]
Prompt: ${cleanSummary}, ${characterDescEn}${sameFrameEnPart}, ${genreFlavorEn}. Cinematography: ${cameraMovement}, ${lighting}. High fidelity consistent character rendering, sharp photorealistic details, cinematic grade.
Aspect Ratio: ${aspectRatio}`;

  // 7. โ… เธเธฃเธฐเธเธญเธเธเธณเธชเธฑเนเธเธชเธฃเนเธฒเธเธงเธดเธ”เธตเนเธญ โ€” เธฃเธงเธกเธเธฃเธดเธเธ— narration เนเธซเนเธงเธดเธ”เธตเนเธญเธ•เธฃเธเธเธฑเธเธเธ—
  let videoStyleLabelTh = 'เธ เธฒเธเธขเธเธ•เธฃเนเธเธเธเธฃเธดเธ เน€เธฅเธเธชเน 35 เธกเธก.';
  let videoStyleLabelEn = 'Live-action realistic 35mm film';

  if (visualMedium === 'animation') {
    if (stylePreset === 'donghua_3d') {
      videoStyleLabelTh = 'เธญเธเธดเน€เธกเธฐเธเธตเธ 3D เธชเนเธ•เธฅเนเน€เธเธทเนเธญเธเธ—เธตเนเธ”เธตเธ—เธตเนเธชเธธเธ” SAN1 เน€เธฃเธเน€เธ”เธญเธฃเน Unreal Engine 5';
      videoStyleLabelEn = '3D Chinese Donghua animation UE5';
    } else if (stylePreset === 'anime_2d') {
      videoStyleLabelTh = 'เธญเธเธดเน€เธกเธฐเธเธตเนเธเธธเนเธ 2D เธฃเธฐเธ”เธฑเธเนเธฃเธเธ เธฒเธเธขเธเธ•เธฃเน เธชเนเธ•เธฅเน Ufotable';
      videoStyleLabelEn = 'Cinematic 2D Japanese anime Ufotable style';
    } else if (stylePreset === 'western_3d') {
      videoStyleLabelTh = 'เนเธญเธเธดเน€เธกเธเธฑเธ 3D เธชเนเธ•เธฅเนเธชเธฒเธเธฅ เธชเนเธ•เธฅเน Arcane';
      videoStyleLabelEn = '3D stylized cinematic animation Arcane style';
    } else if (stylePreset === 'manhwa_action') {
      videoStyleLabelTh = 'เธกเธฑเธเธฎเธงเธฒเนเธญเนเธเธเธฑเธเธชเนเธ•เธฅเน Solo Leveling';
      videoStyleLabelEn = 'Solo Leveling manhwa action style';
    } else {
      videoStyleLabelTh = 'เธ เธฒเธเธขเธเธ•เธฃเนเนเธญเธเธดเน€เธกเธเธฑเธ 3D เธเธธเธ“เธ เธฒเธเธชเธนเธ';
      videoStyleLabelEn = '3D animated movie cinematic render';
    }
  } else {
    if (genre === 'horror_thriller') {
      videoStyleLabelTh = 'เธ เธฒเธเธขเธเธ•เธฃเนเธชเธขเธญเธเธเธงเธฑเธเธฅเธตเนเธฅเธฑเธเนเธ—เธข เนเธชเธเน€เธเธฒเธ”เธฒเธฃเนเธเธซเธฅเธญเธเธชเธกเธเธฃเธดเธ';
      videoStyleLabelEn = 'Cinematic Thai horror thriller film';
    } else if (stylePreset === 'military_combat') {
      videoStyleLabelTh = 'เธ เธฒเธเธขเธเธ•เธฃเนเธชเธเธเธฃเธฒเธกเธขเธธเธ—เธเธงเธดเธเธตเธชเธกเธเธฃเธดเธ 8K';
      videoStyleLabelEn = 'Tactical military combat cinematography 8k';
    } else if (stylePreset === 'hollywood_cinematic') {
      videoStyleLabelTh = 'เธ เธฒเธเธขเธเธ•เธฃเนเธเธเธเธฃเธดเธเธฃเธฐเธ”เธฑเธเธฎเธญเธฅเธฅเธตเธงเธนเธ” เน€เธฅเธเธชเน 35 เธกเธก.';
      videoStyleLabelEn = 'Hollywood cinematic 35mm film';
    }
  }

  const sameFrameVideoTh = charactersInScene.length > 1 ? ' [เธเธฑเธ”เธงเธฒเธเธ•เธฑเธงเธฅเธฐเธเธฃ: เธ—เธธเธเธเธเธญเธขเธนเนเนเธเน€เธเธฃเธกเน€เธ”เธตเธขเธงเธเธฑเธเนเธเธ Two-shot เธซเนเธฒเธกเธ•เธฑเธ”เนเธเนเธเธเธฃเธถเนเธเธเธญ]' : '';
  const sameFrameVideoEn = charactersInScene.length > 1 ? ' [Composition: all characters in single unified camera shot, no split screen]' : '';

  // โ… เน€เธเธดเนเธก narrationContext เน€เธเนเธฒเนเธเนเธ videoMotionPrompt เน€เธเธทเนเธญเนเธซเนเธงเธดเธ”เธตเนเธญเธ•เธฃเธเธเธฑเธเธเธ—เน€เธฅเนเธฒ
  const videoMotionPrompt = `[เธเธฒเธเธ—เธตเน ${sceneNumber}] [เธกเธธเธกเธเธฅเนเธญเธ: ${cameraMovement}, เน€เธเธฅเธทเนเธญเธเนเธซเธงเธฅเธทเนเธเนเธซเธฅเนเธเธเธ เธฒเธเธขเธเธ•เธฃเน] [เธเธฒเธฃเธเธฃเธฐเธ—เธณ: ${cleanSummary}${narrationContext ? ` โ€” ${narrationContext}` : ''}, เนเธญเนเธเธเธฑเธเธ•เนเธญเน€เธเธทเนเธญเธเนเธกเนเธ•เธฑเธ”เธเนเธฒเธก]${sameFrameVideoTh} [เนเธชเธเน€เธเธฒ: ${lighting}] [เธชเธฑเธ”เธชเนเธงเธ: ${aspectRatio}] [เธชเนเธ•เธฅเน: ${videoStyleLabelTh}] เธฃเธฑเธเธฉเธฒเธเธงเธฒเธกเธ•เนเธญเน€เธเธทเนเธญเธเธเธญเธเนเธเธซเธเนเธฒ เธ—เธฃเธเธเธก เน€เธชเธทเนเธญเธเนเธฒ เนเธฅเธฐเธเธฒเธเธญเธขเนเธฒเธเนเธกเนเธเธขเธณ เธเธกเธเธฑเธ”เธฃเธฐเธ”เธฑเธ 4K 60fps เธ•เนเธญเน€เธเธทเนเธญเธเน€เธเธตเธขเธเธ•เธฒ`;

  const videoMotionPromptEn = `[Shot ${sceneNumber}] [Camera: ${cameraMovement}, smooth motion] [Action: ${cleanSummary}, continuous shot]${sameFrameVideoEn} [Lighting: ${lighting}] [Aspect: ${aspectRatio}] [Style: ${videoStyleLabelEn}] Maintain exact character face, clothing, and environment. Zero drift. 4K, 60fps.`;

  return {
    imagePrompt,
    videoMotionPrompt,
    negativePrompt: negativeKeywordsTh,
    imagePromptEn,
    videoMotionPromptEn,
    googleFlowPrompt,
    googleFlowSeed: flowSeed,
  };
}
