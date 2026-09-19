import { MovieGenre, VisualMedium, StylePreset, ScriptScene, CharacterBible } from './types';
import { buildVisualPrompts } from './ai-prompt-engine';

export interface GenerateScriptOptions {
  title: string;
  synopsis: string;
  genre: MovieGenre;
  visualMedium: VisualMedium;
  stylePreset: StylePreset;
  targetDurationMinutes: number;
  actNumber?: 1 | 2 | 3 | 4;
  characters: CharacterBible[];
}

export function generateActTemplateScenes(options: GenerateScriptOptions): ScriptScene[] {
  const {
    title,
    synopsis,
    genre,
    visualMedium,
    stylePreset,
    actNumber = 1,
    characters,
  } = options;

  const leadChar = characters.find((c) => c.role === 'protagonist') || {
    id: 'char-1',
    name: 'ตัวเอก',
    role: 'protagonist' as const,
    appearanceAnchor: 'handsome young hero, confident gaze, signature dark robe',
    clothingStyle: 'adventurer warrior attire',
    voiceStyle: 'ทุ้ม นิ่ง น่าเกรงขาม',
  };

  const antagonist = characters.find((c) => c.role === 'antagonist') || {
    id: 'char-2',
    name: 'จอมมารศัตรู',
    role: 'antagonist' as const,
    appearanceAnchor: 'sinister powerful warrior, glowing demonic red eyes, heavy obsidian armor',
    clothingStyle: 'dark armor robes',
    voiceStyle: 'เย็นชา ทะนงตน ดุดัน',
  };

  // Base narrative blueprints tailored to the selected genre
  const rawSceneBlueprints = getGenreSceneBlueprints(genre, actNumber, leadChar.name, antagonist.name, title);

  const scenes: ScriptScene[] = rawSceneBlueprints.map((blueprint, idx) => {
    const sceneNum = (actNumber - 1) * 4 + (idx + 1);

    const prompts = buildVisualPrompts({
      sceneTitle: blueprint.title,
      narration: blueprint.narration,
      dialogueText: blueprint.dialogues.map((d) => `${d.speaker}: ${d.text}`).join(' '),
      visualMedium,
      stylePreset,
      genre,
      cameraMovement: blueprint.cameraMovement,
      lighting: blueprint.lighting,
      charactersInScene: characters.length > 0 ? characters.slice(0, 2) : [leadChar],
      sceneNumber: sceneNum,
    });

    // Estimate speaking duration: approx 130 words per min in Thai (~2.1 words per sec)
    const totalWords = (blueprint.narration + blueprint.dialogues.map((d) => d.text).join('')).length / 4;
    const durationSec = Math.max(25, Math.round(totalWords * 1.5));

    return {
      id: `scene-${Date.now()}-${sceneNum}`,
      sceneNumber: sceneNum,
      actNumber,
      title: blueprint.title,
      narration: blueprint.narration,
      dialogues: blueprint.dialogues,
      sfxBgm: blueprint.sfxBgm,
      characterIds: [leadChar.id],
      visualMedium,
      stylePreset,
      cameraMovement: blueprint.cameraMovement,
      lighting: blueprint.lighting,
      imagePrompt: prompts.imagePrompt,
      videoMotionPrompt: prompts.videoMotionPrompt,
      negativePrompt: prompts.negativePrompt,
      estimatedDurationSec: durationSec,
      createdAt: new Date().toISOString(),
    };
  });

  return scenes;
}

function getGenreSceneBlueprints(
  genre: MovieGenre,
  act: number,
  heroName: string,
  villainName: string,
  title: string
) {
  if (genre === 'xianxia_cultivation') {
    // สไตล์ เพื่อนที่ดีที่สุด SAN1 / อนิเมะจีน 3D กำลังภายใน
    if (act === 1) {
      return [
        {
          title: `ฉากที่ 1: การตื่นรู้ของสายเลือดโบราณ`,
          narration: `ในดินแดนเสวียนหยวนที่ซึ่งผู้แข็งแกร่งเท่านั้นคือกฎเกณฑ์ ${heroName} ชายหนุ่มที่ถูกตราหน้าว่าเป็นขยะแห่งตระกูล กลับต้องเผชิญหน้ากับความอยุติธรรมที่ถูกยัดเยียด แต่ในคืนที่ดวงจันทร์สีเลือดสาดส่องลงสู่ยอดเขาหมอกสวรรค์ โชคชะตาที่หลับใหลมานานนับพันปีก็ได้เริ่มขยับเขยื้อน...`,
          dialogues: [
            { speaker: heroName, emotion: 'มุ่งมั่น กัดฟันแน่น', text: 'พวกเขาเหยียบย่ำข้า แย่งชิงแก่นวิญญาณข้าไป... แต่ข้าสัญญา ฟ้าดินนี้จะไม่มีวันกักขังข้าได้อีก!' },
          ],
          sfxBgm: `[BGM: ดนตรีกู่เจิ้งและกลองจีนบรรเลงลึกลับระทึกใจ] [SFX: เสียงลมพายุหวีดหวิว พลังปราณระเบิดออกจากร่าง]`,
          cameraMovement: 'Extreme wide shot panning across misty celestial mountain peaks then pushing in',
          lighting: 'Blood-red moonlight piercing through stormy dark clouds, azure spiritual energy glow',
        },
        {
          title: `ฉากที่ 2: ถ้ำลับเซียนกระบี่โบราณ`,
          narration: `หลังถูกไล่ล่าจนตกสู่หุบเหวมรณะ แทนที่จะดับสูญ เขากลับค้นพบสุสานกระบี่บรรพกาลที่ถูกผนึกด้วยค่ายกลเก้าสุริยัน กระบี่วิเศษสีครามส่งเสียงก้องกังวานราวกับรับรู้ถึงการมาของนายที่แท้จริง`,
          dialogues: [
            { speaker: 'เสียงจิตวิญญาณกระบี่', emotion: 'กังวาน ทรงพลัง', text: 'หมื่นปีที่ข้ารอคอย... เจ้าหนุ่ม เจ้าพร้อมจะแบกรับเจตจำนงแห่งกระบี่สวรรค์หรือไม่?' },
            { speaker: heroName, emotion: 'สุขุม แววตาส่องประกาย', text: 'หากกระบี่นี้สามารถผ่าชะตากรรมที่บิดเบี้ยวได้ ข้าก็พร้อมจะสละชีพ!' },
          ],
          sfxBgm: `[BGM: ท่วงทำนองเครื่องสายจีนทรงพลัง แฝงความศักดิ์สิทธิ์] [SFX: เสียงกระบี่สั่นไหว โซ่ตรวนสะบั้นขาดสะบั้น]`,
          cameraMovement: 'Low angle shot slowly tilting up towards the giant floating jade sword',
          lighting: 'Mystical turquoise and golden glow radiating from ancient runes on cave walls',
        },
        {
          title: `ฉากที่ 3: ทลายชีพจร ทะลวงตบะขั้นก้าวหน้า`,
          narration: `ความเจ็บปวดจากการหลอมรวมจิตกระบี่แทรกซึมไปทั่วทุกเส้นชีพจร ลมปราณร้อนระอุราวกับลาวาเดือดพล่าน แต่แววตาของเขาไม่เคยมีความหวาดกลัวแม้เพียงครึ่งเสี้ยว คลื่นพลังมหาศาลผลักดันให้เขาบรรลุสู่ขอบเขตผู้ฝึกยุทธ์ระดับเซียนในชั่วข้ามคืน`,
          dialogues: [
            { speaker: heroName, emotion: 'ตะโกนก้อง ปลดปล่อยพลัง', text: 'ทลายมันซะ! โซ่ตรวนแห่งโชคชะตา!' },
          ],
          sfxBgm: `[BGM: ดนตรีออร์เคสตราผสานขลุ่ยจีนทวีความดุเดือด] [SFX: เสียงคลื่นพลังกระแทกหินผาแตกร้าวเป็นเสี่ยง]`,
          cameraMovement: 'Dynamic 360-degree rotation around the meditating cultivator with energy vortex',
          lighting: 'Intense golden and cyan spiraling energy vortex illuminating the darkness',
        },
        {
          title: `ฉากที่ 4: การกลับมาทวงหนี้แค้น`,
          narration: `ณ ลานประลองตระกูลใหญ่ เสียงเย้ยหยันยังไม่ทันจางหาย ร่างของชายหนุ่มในชุดคลุมสีดำปักดิ้นทองก็ก้าวผ่านม่านหมอกเข้ามา แรงกดดันวิญญาณระดับมหาเทพทำให้อาวุโสทั้งลานต้องหน้าถอดสี นี่ไม่ใช่เศษสวะคนเดิมอีกต่อไป แต่คือมัจจุราชที่หวนคืนมาเอาคืน!`,
          dialogues: [
            { speaker: villainName, emotion: 'ตื่นตระหนก ปนหวาดผวา', text: 'เป็นไปไม่ได้! เจ้า... เจ้ายังไม่ตายได้อย่างไร?!' },
            { speaker: heroName, emotion: 'เยือกเย็น แววตาคมกริบ', text: 'หนี้เลือดในวันวาน... วันนี้พวกเจ้าทุกคนต้องชดใช้ด้วยชีวิต!' },
          ],
          sfxBgm: `[BGM: ดนตรีจังหวะหนักแน่น สื่อถึงการมาเยือนของพญามัจจุราช] [SFX: เสียงกระบี่ออกจากฝัก ดังก้องกังวานทั้งลานประลอง]`,
          cameraMovement: 'Slow motion tracking shot behind hero walking forward, crowd parting in fear',
          lighting: 'Cinematic rim light on hero silhouette, harsh midday sunlight highlighting sword blade',
        },
      ];
    } else if (act === 2) {
      return [
        {
          title: `ฉากที่ 5: เดินทางสู่งานประลองสิบสำนักใหญ่`,
          narration: `การล้างแค้นในตระกูลเป็นเพียงจุดเริ่มต้น ข่าวคราวเรื่องสมบัติสวรรค์ในหุบเขาอสูรดึกดำบรรพ์ดึงดูดเหล่ายอดฝีมือจากทั่วทุกสารทิศ ${heroName} ออกเดินทางสู่ดินแดนใหม่ ที่ซึ่งอันตรายรอคอยอยู่ทุกย่างก้าว`,
          dialogues: [
            { speaker: heroName, emotion: 'รำพึงกับตัวเอง', text: 'โลกใบนี้กว้างใหญ่กว่าที่ข้าคิด ยอดฝีมือที่แท้จริงกำลังรอข้าอยู่ข้างหน้า' },
          ],
          sfxBgm: `[BGM: ดนตรีผจญภัยอลังการ เสียงกลองกระหึ่ม] [SFX: นกกระเรียนสวรรค์ส่งเสียงร้องบินผ่าน]`,
          cameraMovement: 'High-altitude panoramic drone shot overlooking boundless clouds and flying ships',
          lighting: 'Warm sunrise lighting piercing golden clouds',
        },
        {
          title: `ฉากที่ 6: การปะทะในหุบเขาอสูรหมื่นพิษ`,
          narration: `สัตว์อสูรโบราณระดับราชันย์ปรากฏกายขึ้น กรงเล็บยักษ์ฟาดทำลายป่าเขาจนราบเป็นหน้ากลอง ศิษย์สำนักอื่นต่างหนีตายอลหม่าน แต่สำหรับเขา นี่คือบททดสอบเพื่อขัดเกลาเจตจำนงกระบี่ให้เฉียบคมยิ่งขึ้น`,
          dialogues: [
            { speaker: heroName, emotion: 'สุขุม กระโดดเหยียบอากาศ', text: 'กระบี่ที่หนึ่ง... สายลมไร้เงา!' },
          ],
          sfxBgm: `[BGM: ดนตรีแอ็กชันต่อสู้ความเร็วสูง] [SFX: เสียงฟันดาบความเร็วเหนือเสียง ลมพายุเฉือนภูเขา]`,
          cameraMovement: 'Fast tracking action shot following the flying sword trajectory',
          lighting: 'Emerald toxic mist contrasted by sharp golden sword beams',
        },
        {
          title: `ฉากที่ 7: พบสหายร่วมรบและปริศนาผนึกมาร`,
          narration: `ท่ามกลางซากปรักหักพังของวิหารโบราณ เขาได้พบกับจอมยุทธ์หญิงลึกลับผู้ครอบครองกระจกวิญญาณ ทั้งสองค้นพบความจริงอันน่าสะพรึงว่า การเปิดงานประลองครั้งนี้ไม่ใช่เรื่องบังเอิญ แต่เป็นกับดักของลัทธิมารเพื่อบูชายัญเลือดนับหมื่นชีวิต!`,
          dialogues: [
            { speaker: 'สหายหญิงลึกลับ', emotion: 'จริงจัง กังวล', text: 'หากค่ายกลมารนี้ทำงาน ไม่มีใครในรัศมีร้อยลี้ที่จะรอดชีวิตออกไปได้!' },
            { speaker: heroName, emotion: 'เด็ดเดี่ยว', text: 'ถ้าอย่างนั้น เราจะทำลายค่ายกลนี้ด้วยมือเราเอง' },
          ],
          sfxBgm: `[BGM: ดนตรีระทึกขวัญชวนลุ้นระทึก] [SFX: เสียงอักขระมารส่องแสงเต้นเป็นจังหวะหัวใจ]`,
          cameraMovement: 'Medium two-shot slow dolly in, highlighting urgent expressions',
          lighting: 'Dark atmospheric gloom with pulsating crimson rune lights',
        },
        {
          title: `ฉากที่ 8: ประจันหน้าทูตขวาสำนักมาร`,
          narration: `ก่อนที่จะเข้าถึงแกนกลางค่ายกล ผู้พิทักษ์ร่างยักษ์ผู้ใช้เปลวเพลิงทมิฬก็ปรากฏตัวขวางทาง การต่อสู้ระดับสะเทือนฟ้าดินจึงระเบิดขึ้น ยอดเขารอบข้างพังทลายลงในพริบตา`,
          dialogues: [
            { speaker: villainName, emotion: 'หัวเราะเหี้ยมเกรียม', text: 'มดปลวกไร้นาม คิดจะขัดขวางบัญชาสวรรค์มารงั้นรึ? จงมอดไหม้ไปซะ!' },
            { speaker: heroName, emotion: 'ดุดัน ปลุกพลังปราณมังกร', text: 'บัญชาของใครข้าไม่สน แต่ถ้าขวางทางข้า... ก็มีเพียงความตาย!' },
          ],
          sfxBgm: `[BGM: มหากาพย์เสียงประสานขับร้องและกลองศึกยักษ์] [SFX: เสียงระเบิดเพลิงทมิฬปะทะลำแสงกระบี่คราม]`,
          cameraMovement: 'Low angle rotating dynamic combat shot, rapid cuts on weapon clash',
          lighting: 'Contrast between hellish black-red flames and pure azure dragon aura',
        },
      ];
    } else {
      // Act 3 & 4
      return [
        {
          title: `ฉากที่ 9: สงครามแตกหัก จุดจบหรือจุดเปลี่ยน`,
          narration: `ฟ้าดินคำรามลั่น ม่านพลังสวรรค์ฉีกขาด มหาเทพมารเผยตัวจริงออกมา แรงกดดันกดทับจนแม้แต่แผ่นดินยังทรุดตัวลง ผู้คนนับหมื่นสิ้นหวัง ${heroName} ยืนตระหง่านอยู่บนจุดสูงสุดของสนามรบ พร้อมที่จะปลดปล่อยท่าไม้ตายต้องห้าม`,
          dialogues: [
            { speaker: heroName, emotion: 'เปล่งเสียงกึกก้องสะท้านฟ้า', text: 'เก้ากระบี่รวมหนึ่ง... สังหารเทพมาร!' },
          ],
          sfxBgm: `[BGM: ดนตรีไคลแม็กซ์มหากาพย์ขั้นสูงสุด] [SFX: คลื่นกระแทกทำลายล้างกวาดล้างทั่วทิศ]`,
          cameraMovement: 'Epic wide IMAX pull back revealing cosmic scale clash of two titans',
          lighting: 'Blinding white light collision against cosmic darkness',
        },
        {
          title: `ฉากที่ 10: ชัยชนะและเบาะแสสู่แดนเซียนเบื้องบน`,
          narration: `เมื่อควันแห่งสงครามจางหาย ศัตรูผู้ยิ่งใหญ่กลายเป็นเถ้าธุลี แต่ก่อนดับสลาย มันได้ทิ้งคำสาปและเบาะแสถึงดินแดนที่สูงส่งยิ่งกว่า... ดินแดนที่มารดาของเขาถูกกักขังไว้ การเดินทางที่แท้จริงของเซียนกระบี่ เพิ่งจะเริ่มต้นขึ้นเท่านั้น!`,
          dialogues: [
            { speaker: heroName, emotion: 'แววตามุ่งมั่นมองสู่ท้องฟ้า', text: 'รอข้าก่อนเถิดท่านแม่... ไม่ว่าแดนเซียนจะสูงส่งเพียงใด ข้าจะฟาดฟันขึ้นไปหาท่านให้จงได้!' },
          ],
          sfxBgm: `[BGM: ดนตรีซาบซึ้ง ทรงเกียรติ สื่อถึงชัยชนะและการเดินทางที่ไม่สิ้นสุด] [SFX: ลมพัดชายเสื้อคลุมพริ้วไหว เสียงกระดิ่งลมสวรรค์]`,
          cameraMovement: 'Slow vertical crane shot following hero looking up at the celestial gate in heavens',
          lighting: 'Golden heavenly light beams breaking through clouds after the storm',
        },
      ];
    }
  }

  // Generic / Action / Sci-Fi / Other Genres
  return [
    {
      title: `ฉากที่ 1: การเปิดม่านแห่งหายนะ`,
      narration: `ในโลกที่ถูกกลืนกินด้วยความมืดมิดและอำนาจมืด ${heroName} ต้องเผชิญหน้ากับความจริงที่ไม่มีใครกล้าเอ่ยถึง เสียงสัญญาณเตือนภัยดังกึกก้องไปทั่วทั้งเมือง เมื่อเงาของศัตรูร้ายเริ่มคืบคลานเข้าสู่ใจกลางมหานคร...`,
      dialogues: [
        { speaker: heroName, emotion: 'สุขุม เคร่งขรึม', text: 'ถ้าเราไม่หยุดมันตรงนี้ พรุ่งนี้เช้าจะไม่มีใครรอดชีวิตแม้แต่คนเดียว' },
      ],
      sfxBgm: `[BGM: ซินธ์เวฟดาร์กโทนบิลด์อารมณ์ตึงเครียด] [SFX: เสียงไซเรนก้องไกล เสียงฝนกระทบกระจก]`,
      cameraMovement: 'Cinematic wide master shot tracking through rainy city streets',
      lighting: 'Chiaroscuro neon lights reflecting off wet asphalt, deep shadows',
    },
    {
      title: `ฉากที่ 2: การเผชิญหน้าในเงามืด`,
      narration: `ทุกย่างก้าวเต็มไปด้วยกับดักและสายตาที่จับจ้อง การปะทะกันอย่างไม่อาจหลีกเลี่ยงได้เริ่มต้นขึ้น ท่ามกลางกระสุนและคมอาวุธที่เชือดเฉือนอากาศ ความลับของแผนการร้ายถูกเปิดเผยออกมาทีละน้อย`,
      dialogues: [
        { speaker: villainName, emotion: 'เย้ยหยัน สะใจ', text: 'เจ้ามาช้าเกินไปแล้ว ทุกอย่างถูกกำหนดไว้หมดแล้ว!' },
        { speaker: heroName, emotion: 'ดุดัน สวนกลับ', text: 'เกมนี้ยังไม่จบ ตราบใดที่ข้ายังหายใจ!' },
      ],
      sfxBgm: `[BGM: จังหวะกลองและเบสกระแทกกระทั้นสไตล์ฮอลลีวูด] [SFX: เสียงโลหะปะทะกัน ประกายไฟแลบ]`,
      cameraMovement: 'Rapid over-the-shoulder cuts with dynamic camera shake',
      lighting: 'Strobe light flashes against industrial dark warehouse',
    },
    {
      title: `ฉากที่ 3: จุดพลิกผันและการสูญเสีย`,
      narration: `เมื่อพันธมิตรที่ไว้ใจที่สุดกลับกลายเป็นผู้ทรยศ ชะตากรรมของทุกคนจึงแขวนอยู่บนเส้นด้าย เขาต้องเลือกระหว่างการเอาตัวรอด หรือการยอมเสียสละทุกสิ่งเพื่อปกป้องสิ่งที่เขารัก`,
      dialogues: [
        { speaker: heroName, emotion: 'เจ็บปวดแต่แน่วแน่', text: 'ข้าไม่เคยกลัวความตาย... สิ่งเดียวที่ข้ากลัว คือการยืนดูความพินาศโดยไม่ทำอะไร!' },
      ],
      sfxBgm: `[BGM: เสียงเชลโล่และเปียโนเศร้าสะเทือนอารมณ์] [SFX: เสียงเปลวไฟลุกไหม้ซากปรักหักพัง]`,
      cameraMovement: 'Extreme close up on eyes, pulling back slowly to show devastation',
      lighting: 'Ember glow from fire illuminating tearful determined face',
    },
    {
      title: `ฉากที่ 4: การโต้กลับครั้งสุดท้าย`,
      narration: `จากจุดต่ำสุดสู่การลุกขึ้นสู้อีกครั้ง ด้วยพลังและจิตวิญญาณที่ไม่มีวันยอมแพ้ การต่อสู้ครั้งตัดสินกำลังจะบันทึกหน้าประวัติศาสตร์ใหม่ ที่จะไม่มีใครลืมเลือน!`,
      dialogues: [
        { speaker: heroName, emotion: 'ตะโกนก้อง ปลุกระดม', text: 'ไปลุยกันให้แหลก!' },
      ],
      sfxBgm: `[BGM: ดนตรีธีมชัยชนะอลังการเต็มวง] [SFX: เสียงระเบิดครั้งยิ่งใหญ่ปิดท้ายฉาก]`,
      cameraMovement: 'Hero low angle hero shot with dramatic dolly zoom',
      lighting: 'Blinding dramatic backlighting with cinematic lens flare',
    },
  ];
}
