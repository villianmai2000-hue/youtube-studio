import { CharacterBible } from './types';

export interface DynamicEnrichmentOptions {
  title?: string;
  synopsis?: string;
  worldCulture?: string;
  genre?: string;
}

/**
 * เสริมมิติตัวละคร เคมีความสัมพันธ์ และสไตล์การพูดให้มีชีวิตชีวา ไม่แบนราบ (Auto-Enrich Character Dynamics)
 * ช่วยแก้ปัญหาบทพูดซ้ำซาก ไม่เป็นธรรมชาติ และตัวละครไม่มีเสน่ห์
 */
export function enrichCharacterDynamics(
  characters: CharacterBible[],
  options: DynamicEnrichmentOptions = {}
): CharacterBible[] {
  if (!characters || characters.length === 0) return [];

  const { title = '', synopsis = '', worldCulture = 'thai' } = options;
  const isThai = worldCulture === 'thai' || /ไทย|กระสือ|ผี|พญานาค|อยุธยา|บางระจัน|หมอผี/i.test(`${title} ${synopsis}`);

  // คลังบุคลิกและเคมีคู่ตรงข้าม (Contrasting Chemistry Archetypes)
  const thaiArchetypes = [
    {
      personality: 'สุขุม หนักแน่น มีความเป็นผู้นำสูง แบกรับความหวังเพื่อนฝูง พูดน้อยแต่เด็ดขาด คำติดปาก: "ตั้งสติให้ดี เราต้องผ่านมันไปได้"',
      voiceStyle: 'ทุ้มต่ำ นิ่ง หนักแน่น กังวาน มีอำนาจชวนให้เชื่อมั่น',
      chemistryRole: 'leader',
    },
    {
      personality: 'ใจร้อน ตรงไปตรงมา ปากไวแต่รักพวกพ้องสุดชีวิต ชอบค้านหัวหน้าแต่ยอมเสี่ยงชีวิตแทนเสมอ คำติดปาก: "อย่ามัวแต่ลังเล ลุยเลยดีกว่า!"',
      voiceStyle: 'ห้าว กระโชกโฮกฮาก มีพลัง แฝงความกวนประสาทและจริงใจ',
      chemistryRole: 'foil',
    },
    {
      personality: 'รอบคอบ ช่างสังเกต วิเคราะห์สถานการณ์ฉับไว ไม่ชอบความเสี่ยง พูดเตือนสติได้อย่างตรงจุด คำติดปาก: "ดูให้ดีก่อน สิ่งที่เห็นอาจไม่ใช่ความจริง"',
      voiceStyle: 'นุ่ม เรียบนิ่ง คมชัด มีเหตุผลและชวนฉุกคิด',
      chemistryRole: 'strategist',
    },
    {
      personality: 'อบอุ่น จิตใจดี ขี้สงสารแต่เข้มแข็งเมื่อภัยมา คอยประนีประนอมและดูแลบาดแผลของทุกคน คำติดปาก: "ทุกคนอย่าเพิ่งทะเลาะกันเลยนะ"',
      voiceStyle: 'หวานใส นุ่มนวล เปี่ยมเมตตา ปลอบประโลมแต่ไม่อ่อนแอ',
      chemistryRole: 'empath',
    },
    {
      personality: 'คล่องแคล่ว ไหวพริบไว ขี้ระแวงแต่สายตาเฉียบคม รับหน้าที่สอดแนมและหาทางหนีทีไล่ คำติดปาก: "ข้างหน้าท่าทางไม่ดี รีบเผ่นเถอะ"',
      voiceStyle: 'กระซิบเร็ว รวดเร็ว ระแวดระวัง ตื่นตัวตลอดเวลา',
      chemistryRole: 'scout',
    },
    {
      personality: 'มีอารมณ์ขัน ขี้เล่น ช่างพูด ชอบแซวเพื่อนเพื่อผ่อนคลายสถานการณ์ตึงเครียด คำติดปาก: "เอาน่า เรื่องแค่นี้จิ๊บจ๊อย ไว้ใจข้าได้เลย"',
      voiceStyle: 'สดใส ทะเล้น มีจังหวะลื่นไหล ชวนให้ยิ้มได้',
      chemistryRole: 'comic',
    },
    {
      personality: 'ลึกลับ นิ่งสงบ ผ่านร้อนผ่านหนาวมามาก รู้ประวัติศาสตร์และตำนานโบราณ ชี้แนะด้วยคำคม คำติดปาก: "สิ่งที่มองไม่เห็น ไม่ได้แปลว่าไม่มีอยู่จริง"',
      voiceStyle: 'ทุ้มแหบ ขลัง ทรงภูมิ มีพลังน่าเกรงขาม',
      chemistryRole: 'mentor',
    },
    {
      personality: 'ดุดัน เลือดเย็น มั่นใจในอำนาจตนเองอย่างยิ่ง ชอบพูดจาเยาะเย้ยกดดันศัตรู คำติดปาก: "พวกเจ้าคิดว่าจะหนีพ้นเงื้อมมือข้าไปได้งั้นรึ"',
      voiceStyle: 'เยือกเย็น ก้องกังวาน แฝงความเย้ยหยัน กดดันชวนขนลุก',
      chemistryRole: 'antagonist',
    },
  ];

  const globalArchetypes = [
    {
      personality: 'Calm, authoritative, decisive leader who bears the fate of the squad. Catchphrase: "Stay focused, trust each other."',
      voiceStyle: 'Deep, resonant, measured, commanding respect and inspiring loyalty.',
      chemistryRole: 'leader',
    },
    {
      personality: 'Hot-headed, outspoken, fiercely loyal lancer. Clashes often with the leader but always protects their back. Catchphrase: "Cut the talk, let me handle it!"',
      voiceStyle: 'Gritty, energetic, sarcastic yet sincere, fast-paced.',
      chemistryRole: 'foil',
    },
    {
      personality: 'Analytical strategist, sharp observer who calculates odds under pressure. Dislikes recklessness. Catchphrase: "Think before you leap."',
      voiceStyle: 'Crisp, articulate, collected, precise and calm.',
      chemistryRole: 'strategist',
    },
    {
      personality: 'Empathetic medic / heart of the crew. Gentle yet unshakeable when allies are wounded. Catchphrase: "Hang in there, you\'re not alone."',
      voiceStyle: 'Warm, compassionate, gentle yet resilient.',
      chemistryRole: 'empath',
    },
    {
      personality: 'Agile scout, street-smart and witty. Keeps morale up with sarcastic humor during crises. Catchphrase: "Piece of cake... I hope."',
      voiceStyle: 'Playful, lively, quick-witted, expressive.',
      chemistryRole: 'comic',
    },
    {
      personality: 'Vengeful and ruthless adversary who commands absolute obedience. Toys with opponents psychologically. Catchphrase: "Your resistance is amusing."',
      voiceStyle: 'Cold, sinister, echoey, laced with quiet dominance.',
      chemistryRole: 'antagonist',
    },
  ];

  const archetypes = isThai ? thaiArchetypes : globalArchetypes;

  const names = characters.map((c) => c.name.split('(')[0].trim());

  return characters.map((char, idx) => {
    // เลือก archetype ตาม role หรือลำดับ
    let template = archetypes[0];
    if (char.role === 'antagonist') {
      template = archetypes.find((a) => a.chemistryRole === 'antagonist') || archetypes[archetypes.length - 1];
    } else if (char.role === 'mentor') {
      template = archetypes.find((a) => a.chemistryRole === 'mentor') || archetypes[6 % archetypes.length];
    } else if (char.role === 'protagonist') {
      template = archetypes[0];
    } else {
      template = archetypes[((idx - 1) % (archetypes.length - 2)) + 1] || archetypes[1];
    }

    // กำหนดเคมีความสัมพันธ์ (Interpersonal Chemistry)
    const partnerName = names[(idx + 1) % names.length] || 'เพื่อนร่วมทีม';
    const leaderName = names[0] || 'หัวหน้าทีม';
    const currentName = names[idx];

    let dynamicRelationship = char.relationships || '';
    if (!dynamicRelationship || dynamicRelationship === 'บทบาทในเรื่องราว' || dynamicRelationship.length < 15) {
      if (char.role === 'protagonist') {
        dynamicRelationship = isThai
          ? `ผู้นำที่ทุกคนเชื่อใจ เป็นคู่คิดกับ ${partnerName} แม้จะเถียงกันบ่อยแต่รู้ใจกันที่สุด`
          : `Squad leader trusted by all; balances strategic debates with ${partnerName}.`;
      } else if (char.role === 'antagonist') {
        dynamicRelationship = isThai
          ? `ศัตรูคู่อาฆาตของ ${leaderName} มุ่งหมายจะทำลายอุดมการณ์ของทุกคน`
          : `Arch-nemesis to ${leaderName}, seeking to crush the group's resolve.`;
      } else if (char.role === 'mentor') {
        dynamicRelationship = isThai
          ? `อาจารย์ผู้ชี้นำทางให้ ${leaderName} คอยเตือนสติไม่ให้หลงทางในอำนาจ`
          : `Wise mentor to ${leaderName}, offering ancient guidance during moments of doubt.`;
      } else if (template.chemistryRole === 'foil') {
        dynamicRelationship = isThai
          ? `คู่ปรับและมือขวาของ ${leaderName} ชอบขัดคอแต่ยอมเสี่ยงอันตรายแทนก่อนใคร`
          : `Foil and right hand to ${leaderName}; constantly challenges plans but loyal to the core.`;
      } else if (template.chemistryRole === 'strategist') {
        dynamicRelationship = isThai
          ? `เสนาธิการของทีม คอยวางแผนให้ ${leaderName} และมักคอยเตือนสติ ${partnerName} ที่ใจร้อน`
          : `Chief strategist; devises plans for ${leaderName} and reins in reckless companions.`;
      } else if (template.chemistryRole === 'empath') {
        dynamicRelationship = isThai
          ? `ผู้ประสานใจในทีม คอยห้ามทัพเวลา ${leaderName} กับ ${partnerName} ทะเลาะกัน`
          : `The emotional anchor; de-escalates tensions between teammates and heals wounds.`;
      } else {
        dynamicRelationship = isThai
          ? `สหายคนสำคัญของ ${leaderName} และคู่หูร่วมรบของ ${partnerName}`
          : `Key ally to ${leaderName} and battle partner to ${partnerName}.`;
      }
    }

    // เสริม Personality ถ้าว่างหรือสั้นเกินไป
    let dynamicPersonality = char.personality || '';
    if (!dynamicPersonality || dynamicPersonality === 'สุขุม มีเอกลักษณ์เฉพาะตัว' || dynamicPersonality.length < 15) {
      dynamicPersonality = template.personality;
    }

    // เสริม Voice Style ถ้ายกเว้นหรือสั้นเกินไป
    let dynamicVoiceStyle = char.voiceStyle || '';
    if (!dynamicVoiceStyle || dynamicVoiceStyle === 'ทุ้ม นิ่ง น่าเกรงขาม' || dynamicVoiceStyle.length < 10) {
      dynamicVoiceStyle = template.voiceStyle;
    }

    return {
      ...char,
      personality: dynamicPersonality,
      relationships: dynamicRelationship,
      voiceStyle: dynamicVoiceStyle,
    };
  });
}
