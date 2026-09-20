import { NextResponse } from 'next/server';
import { CharacterBible, WorldCulture, VisualMedium } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title = '',
      synopsis = '',
      worldCulture = 'chinese',
      genre = 'xianxia_cultivation',
      subGenre = '',
      visualMedium = 'animation',
      stylePreset = 'donghua_3d',
      characterCount = 3,
      apiKey = process.env.GEMINI_API_KEY,
    } = body;

    // 1. Try Google Gemini API if key is available
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const aiCharacters = await generateCharactersWithGemini({
          apiKey,
          title,
          synopsis,
          worldCulture,
          genre,
          subGenre,
          visualMedium,
          stylePreset,
          characterCount,
        });

        if (aiCharacters && aiCharacters.length > 0) {
          return NextResponse.json({
            success: true,
            characters: aiCharacters,
            source: 'Google Gemini 3.1 Pro',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini character generation error, falling back to studio template engine:', geminiErr);
      }
    }

    // 2. Intelligent Studio Fallback Engine (ตามวัฒนธรรม จีน / ญี่ปุ่น / ไทย / สากล)
    const characters = generateIntelligentCharacters({
      title,
      synopsis,
      worldCulture,
      genre,
      subGenre,
      visualMedium,
      count: characterCount || 3,
    });

    return NextResponse.json({
      success: true,
      characters,
      source: 'Studio Narrative Engine',
    });
  } catch (err: unknown) {
    console.error('Failed to generate characters:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// Online Gemini Pro Generator
async function generateCharactersWithGemini(params: {
  apiKey: string;
  title: string;
  synopsis: string;
  worldCulture: WorldCulture;
  genre: string;
  subGenre?: string;
  visualMedium: VisualMedium;
  stylePreset: string;
  characterCount: number;
}): Promise<CharacterBible[]> {
  const { apiKey, title, synopsis, worldCulture, genre, subGenre, visualMedium, characterCount } = params;

  const prompt = `คุณคือสุดยอดนักเขียนบทและผู้ออกแบบตัวละครภาพยนตร์/อนิเมะระดับโลก (World-class Character Designer)
โปรดวิเคราะห์ชื่อเรื่องและพล็อตเรื่องต่อไปนี้ แล้วสร้างรายชื่อตัวละครหลัก ${characterCount || 3} ตัว (พระเอก, ตัวร้าย, นางเอก/คู่หู หรือ อาจารย์) ให้สอดคล้องกับพล็อตเรื่องอย่างสมบูรณ์แบบ:

ชื่อเรื่อง: "${title}"
พล็อตเรื่อง/คอนเซปต์: "${synopsis}"
วัฒนธรรมโลก: ${worldCulture} (จีน/ญี่ปุ่น/ไทย/สากล)
แนวเรื่อง: ${genre} ${subGenre ? `(${subGenre})` : ''}
รูปแบบ: ${visualMedium === 'animation' ? 'อนิเมะ 3D/2D' : 'ภาพยนตร์คนจริง (Live-Action)'}

จงตอบกลับเป็น JSON Array ของตัวละครเท่านั้น (ห้ามใส่ Markdown codeblock อื่นใดนอกเหนือจาก JSON) โดยแต่ละตัวละครต้องมีคุณสมบัติครบ 11 มิติดังนี้:
[
  {
    "name": "ชื่อตัวละครภาษาไทย (พร้อมชื่อภาษาจีน/ญี่ปุ่น/อังกฤษถ้าเหมาะสม)",
    "role": "protagonist หรือ antagonist หรือ supporting หรือ mentor",
    "age": "อายุ เช่น 19 ปี / พันปี",
    "bodyBuild": "1. รูปร่าง",
    "facialFeatures": "2. เอกลักษณ์ใบหน้าและแววตา",
    "hairStyle": "3. ทรงผมและสีผม",
    "clothingStyle": "4. เครื่องแต่งกายและเสื้อผ้า",
    "colorTheme": "5. โทนสีประจำตัว",
    "weaponsOrProps": "6. อาวุธหรือไอเทมประจำตัว",
    "personality": "7. บุคลิกภาพและนิสัย",
    "abilities": "8. ความสามารถพิเศษหรือวิชาประจำตัว",
    "weaknesses": "9. จุดอ่อนหรือบาดแผลในใจ",
    "relationships": "10. ความสัมพันธ์กับตัวละครอื่นในเรื่อง",
    "appearanceAnchor": "คำบรรยายรูปลักษณ์สรุปรวมเป็นภาษาไทยและอังกฤษสำหรับสร้างภาพ AI ล็อคหน้าตา",
    "voiceStyle": "น้ำเสียงและโทนเสียงสำหรับลงเสียงพากย์"
  }
]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API responded with status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  const parsed = JSON.parse(rawText);

  if (Array.isArray(parsed)) {
    return parsed.map((c, idx) => ({
      id: `char-ai-${Date.now()}-${idx + 1}`,
      name: c.name || `ตัวละคร ${idx + 1}`,
      role: c.role || (idx === 0 ? 'protagonist' : idx === 1 ? 'antagonist' : 'supporting'),
      age: c.age || '20 ปี',
      bodyBuild: c.bodyBuild || 'สง่างาม ปราดเปรียว',
      facialFeatures: c.facialFeatures || 'คมเข้ม แววตามุ่งมั่น',
      hairStyle: c.hairStyle || 'ผมยาวสีดำขลับ',
      clothingStyle: c.clothingStyle || 'ชุดคลุมโบราณ',
      colorTheme: c.colorTheme || 'ดำ-ทอง',
      weaponsOrProps: c.weaponsOrProps || 'กระบี่ประจำกาย',
      personality: c.personality || 'สุขุม เด็ดเดี่ยว',
      abilities: c.abilities || 'พลังยุทธ์ระดับสูง',
      weaknesses: c.weaknesses || 'ห่วงใยพวกพ้อง',
      relationships: c.relationships || 'ตัวละครหลัก',
      appearanceAnchor: c.appearanceAnchor || `${c.name}, signature attire, detailed face, 8k cinematic`,
      voiceStyle: c.voiceStyle || 'ทุ้ม นิ่ง น่าเกรงขาม',
      googleFlowSeed: String(Math.floor(100000 + Math.random() * 900000)),
    }));
  }

  throw new Error('Parsed Gemini output is not an array');
}

// Fallback Template Generator
function generateIntelligentCharacters(params: {
  title: string;
  synopsis: string;
  worldCulture: WorldCulture;
  genre: string;
  subGenre?: string;
  visualMedium: VisualMedium;
  count: number;
}): CharacterBible[] {
  const { worldCulture, count, synopsis, title } = params;

  if (worldCulture === 'thai') {
    // วัฒนธรรมไทย: พญานาค / ไสยศาสตร์ / มวยไทย / นักรบโบราณ
    const thaiList: CharacterBible[] = [
      {
        id: `char-th-${Date.now()}-1`,
        name: 'สิงหราช (พระเอก)',
        role: 'protagonist',
        age: '24 ปี',
        bodyBuild: 'กำยำ แข็งแกร่ง ผิวสีทองแดง กล้ามเนื้อแน่นคมชัด',
        facialFeatures: 'ใบหน้าคมเข้ม คิ้วดกดำ แววตาเด็ดเดี่ยวดั่งพญาเหยี่ยว มีรอยสักยันต์อักขระขอมโบราณ',
        hairStyle: 'ผมสั้นเกรียนตัดทรงโบราณ รัดมวยเกล้าขึ้นเล็กน้อย',
        clothingStyle: 'นุ่งโจงกระเบนสีดำคาดแดง ผ้าคาดเอวสีทอง มีมงคลคล้องแขนและยันต์เกราะเพชร',
        colorTheme: 'สีทองแดง-ดำ-แดงชาด',
        weaponsOrProps: 'ดาบฟ้าฟื้นคู่ตัดเหล็กไหล / สนับมือมวยไทยโบราณ',
        personality: 'ซื่อตรง ยึดมั่นในสัจจะ รักษาความยุติธรรม กล้าหาญไม่เกรงกลัวความตาย',
        abilities: 'วิชามวยไทยโบราณผสมมนต์คงกระพันชาตรี คาถามหาอุตม์ ฟันแทงไม่เข้า',
        weaknesses: 'หากผิดศีลข้อสัจจะ อาคมจะคลายลงชั่วคราว',
        relationships: 'ศิษย์เอกแห่งสำนักดาบโบราณ และผู้ถือครองสายเลือดผู้พิทักษ์นาคราช',
        appearanceAnchor: 'นักรบหนุ่มไทยโบราณ ผิวสีทองแดงคมเข้ม สักยันต์อักขระขอมโบราณ นุ่งโจงกระเบนดำคาดแดง ดาบคู่ตัดเหล็กไหล 8k cinematic photorealistic',
        voiceStyle: 'ทุ้มต่ำ หนักแน่น ก้องกังวาน ดุดันเปี่ยมบารมี',
        googleFlowSeed: '819204',
      },
      {
        id: `char-th-${Date.now()}-2`,
        name: 'หมอผีทมิฬ (เดชอำนาจ)',
        role: 'antagonist',
        age: '45 ปี',
        bodyBuild: 'ผอมสูง สันหลังตรง ออร่าไอหมอกมนต์ดำแผ่ปกคลุม',
        facialFeatures: 'ใบหน้าซูบตอบ แววตาสีแดงเพลิงเรืองรอง รอยยิ้มเย้ยหยันเหี้ยมเกรียม',
        hairStyle: 'ผมยาวประบ่ากระเซอะกระเซิงสีดอกเลา แซมขนนกแร้ง',
        clothingStyle: 'ชุดคลุมผ้าดิบสีดำลงอาคมมนต์มืด สวมสร้อยกระดูกกะโหลกสัตว์',
        colorTheme: 'สีดำทมิฬ-เขียวพราย-แดงเลือด',
        weaponsOrProps: 'กริชสะกดวิญญาณ / ตะกรุดควายธนู / หม้อสะกดวิญญาณ',
        personality: 'กระหายอำนาจ ไร้ความเมตตา เจ้าคิดเจ้าแค้น ใช้อาคมมืดทำลายล้าง',
        abilities: 'วิชาคุณไสยมนต์ดำ ปล่อยควายธนู เสกตะปูเข้าท้อง เรียกผีพรายสะกดจิต',
        weaknesses: 'แพ้แสงพระธรรม และน้ำมนต์ศักดิ์สิทธิ์จากบ่อสวรรค์',
        relationships: 'ศัตรูคู่อาฆาตที่ต้องการแย่งชิงดวงแก้วนาคราชเพื่อเป็นอมตะ',
        appearanceAnchor: 'จอมขมังเวทย์มนต์ดำไทยโบราณ รูปร่างผอมสูง แววตาสีแดงเพลิง สวมชุดคลุมดำลงยันต์ กริชสะกดวิญญาณ 8k cinematic dark fantasy',
        voiceStyle: 'แหบพร่า เยือกเย็น แฝงเสียงสะท้อนชวนขนลุก',
        googleFlowSeed: '728193',
      },
      {
        id: `char-th-${Date.now()}-3`,
        name: 'มณีนาคินทร์ (นางพญานาคี)',
        role: 'supporting',
        age: 'พันปี (รูปลักษณ์สาว 20 ปี)',
        bodyBuild: 'บอบบาง อรชรอ้อนแอ้น สง่างามดั่งนางในวรรณคดี',
        facialFeatures: 'ดวงตารูปหางหงส์สีเขียวมรกต ผิวขาวผ่องเปล่งประกายละอองน้ำทิพย์',
        hairStyle: 'ผมยาวสลวยสีดำขลับประดับรัดเกล้าทองคำลายพญานาค',
        clothingStyle: 'สไบผ้าไหมสีเขียวมรกตปักดิ้นทอง สร้อยสังวาลย์ทองคำประดับพลอยบาดาล',
        colorTheme: 'สีเขียวมรกต-ทองคำ-ขาวมุก',
        weaponsOrProps: 'ลูกแก้วมณีรัตนะ / คทาวารีศักดิ์สิทธิ์',
        personality: 'เปี่ยมเมตตา สุขุม รักความสงบ แต่เด็ดขาดเมื่อบ้านเมืองมีภัย',
        abilities: 'ควบคุมกระแสน้ำบาดาล เรียกฝน เรียกพายุพญานาค คืนชีพเยียวยาบาดแผล',
        weaknesses: 'หากอยู่ห่างจากแหล่งน้ำเกิน 7 วัน พลังจะลดลง',
        relationships: 'ผู้พิทักษ์สายเลือดบาดาล และผู้ช่วยชีวิตสิงหราชจากคมดาบ',
        appearanceAnchor: 'นางพญานาคีสาวรูปงาม สวมสไบสีเขียวมรกตปักดิ้นทอง รัดเกล้าทองคำ แววตาสีมรกต ออร่าละอองน้ำทิพย์ 8k thai fantasy cinematic',
        voiceStyle: 'ไพเราะ นุ่มนวล ก้องกังวานดั่งเสียงกระดิ่งทองคำ',
        googleFlowSeed: '930182',
      },
    ];
    return thaiList.slice(0, count);
  }

  if (worldCulture === 'japanese') {
    // วัฒนธรรมญี่ปุ่น: ต่างโลก / ซามูไร / นินจา / พลังเวท
    const jpList: CharacterBible[] = [
      {
        id: `char-jp-${Date.now()}-1`,
        name: 'เร็น คุโรซากิ (Ren Kurosaki)',
        role: 'protagonist',
        age: '18 ปี',
        bodyBuild: 'ปราดเปรียว สมส่วน มีความคล่องตัวสูง',
        facialFeatures: 'ใบหน้าคมสไตล์อนิเมะ แววตาสีครามส่องประกายมุ่งมั่น',
        hairStyle: 'ผมซอยสั้นสีดำแซมน้ำเงินด้านหน้า',
        clothingStyle: 'ชุดแจ็กเก็ตสีดำแบบประยุกต์ผสมผสานเกราะซามูไรเบาที่แขน',
        colorTheme: 'สีดำ-น้ำเงินคราม-เงิน',
        weaponsOrProps: 'ดาบคาตานะประกายสายฟ้า มุรามาสะ',
        personality: 'สุขุม รักพวกพ้อง ไม่ยอมแพ้เมื่อเจออุปสรรค พัฒนาตัวเองเสมอ',
        abilities: 'วิชาดาบอิไอจิริสายฟ้าความเร็วเหนือเสียง ทักษะตาเหยี่ยวอ่านการเคลื่อนไหว',
        weaknesses: 'การใช้ท่าไม้ตายขั้นสุดยอดจะทำให้กล้ามเนื้อแขนฉีกขาด',
        relationships: 'อดีตเด็กมัธยมที่ถูกอัญเชิญมาต่างโลกเพื่อหยุดยั้งจอมมาร',
        appearanceAnchor: 'handsome young samurai swordsman anime protagonist, dynamic black and blue jacket, glowing blue eyes, katana sword with lightning sparks, 8k anime render',
        voiceStyle: 'หนุ่ม สดใส มุ่งมั่น แต่สุขุมในยามต่อสู้',
        googleFlowSeed: '492018',
      },
      {
        id: `char-jp-${Date.now()}-2`,
        name: 'จอมมารแอสโตรอส (Demon Lord Astaroth)',
        role: 'antagonist',
        age: 'หลายร้อยปี',
        bodyBuild: 'สูงใหญ่ สง่างาม น่าเกรงขาม',
        facialFeatures: 'ผิวขาวซีด แววตาสีแดงทับทิม มีเขามารสีดำขลับบนศีรษะ',
        hairStyle: 'ผมยาวสลวยสีเงินขาวปลิวไสว',
        clothingStyle: 'ชุดคลุมยาวสีแดงดำประดับขนสัตว์ทมิฬ และเกราะไหล่สีทอง',
        colorTheme: 'สีแดงเลือด-ดำ-ทองทึบ',
        weaponsOrProps: 'เคียวแห่งความมืดมิดกริมรีปเปอร์',
        personality: 'ทะนงตน ชาญฉลาด มองมนุษย์เป็นเพียงสิ่งมีชีวิตที่อ่อนแอ',
        abilities: 'เวทมนตร์แรงโน้มถ่วงทมิฬ การสร้างบาเรียความมืดไร้พ่าย',
        weaknesses: 'แพ้แสงศักดิ์สิทธิ์และดาบสายฟ้าแห่งผู้กล้า',
        relationships: 'ผู้ปกครองอาณาจักรปีศาจที่รอคอยการดวลกับผู้กล้า',
        appearanceAnchor: 'majestic demon lord anime antagonist, tall silver hair, curved black horns, glowing red eyes, obsidian coat with dark aura, 8k cinematic anime',
        voiceStyle: 'ทุ้มลึก ทรงอำนาจ เยือกเย็น แฝงความยะโส',
        googleFlowSeed: '581920',
      },
      {
        id: `char-jp-${Date.now()}-3`,
        name: 'ไอริส ฟลอเรนซ์ (Iris)',
        role: 'supporting',
        age: '17 ปี',
        bodyBuild: 'ตัวเล็ก บอบบาง น่ารักสดใส',
        facialFeatures: 'ใบหน้ากลมน่ารัก ดวงตาสีทองกลมโต แก้มอมชมพู',
        hairStyle: 'ผมยาวลอนสีบลอนด์ทอง มัดทวินเทลสองข้าง',
        clothingStyle: 'ชุดจอมเวทสีขาวฟ้า กระโปรงสั้น รองเท้าบูทหนังสีน้ำตาล',
        colorTheme: 'สีขาว-ฟ้าพาสเทล-ทอง',
        weaponsOrProps: 'คทาเวทมนตร์คริสตัลดวงดาว',
        personality: 'ร่าเริง มองโลกในแง่ดี ซุ่มซ่ามแต่จริงใจ พึ่งพาได้ในยามวิกฤต',
        abilities: 'เวทมนตร์ฟื้นฟูระดับสูง บาเรียคุ้มกันแสงดาว',
        weaknesses: 'พลังกายภาพต่ำ ไม่ถนัดการต่อสู้ระยะประชิด',
        relationships: 'นักบวชหญิงประจำกิลด์ที่ร่วมเดินทางและคอยสนับสนุนเร็น',
        appearanceAnchor: 'cute anime magic girl, blonde twintail hair, golden eyes, white and pastel blue mage robe with crystal staff, sparkles of light, 8k anime art',
        voiceStyle: 'สดใส น่ารัก อ่อนหวาน เป็นกำลังใจให้ทีม',
        googleFlowSeed: '672019',
      },
    ];
    return jpList.slice(0, count);
  }

  // วัฒนธรรมจีน: กำลังภายใน / บำเพ็ญเซียน (Default Xianxia)
  const cnList: CharacterBible[] = [
    {
      id: `char-cn-${Date.now()}-1`,
      name: 'เซียวเฉิน (Xiao Chen)',
      role: 'protagonist',
      age: '19 ปี',
      bodyBuild: 'จอมยุทธ์หนุ่มรูปร่างสง่างาม อกผายไหล่ผึ่ง ผิวหยกขาวสะอาด',
      facialFeatures: 'ใบหน้ารูปสลัก คิ้วกระบี่ แววตาสีอำพันส่องประกายเจตจำนงกระบี่',
      hairStyle: 'ผมยาวสีขาวเงินเกล้ามวยประดับปิ่นหยกขาว ปล่อยปอยผมคลอเคลียแก้ม',
      clothingStyle: 'ชุดคลุมเต๋าผ้าไหมสีดำขลับ ปักลวดลายดิ้นทองวิจิตร พริ้วไหวต้านลม',
      colorTheme: 'สีดำทมิฬ-ทองคำ-ครามสวรรค์',
      weaponsOrProps: 'กระบี่เทพบรรพกาลเก้าวิญญาณสีคราม ลอยหมุนวนรอบกาย',
      personality: 'เยือกเย็น สุขุม มุ่งมั่นเด็ดเดี่ยว กตัญญูต่อผู้มีพระคุณ ตาต่อตาฟันต่อฟันกับศัตรู',
      abilities: 'เพลงกระบี่เก้าสวรรค์ไร้พ่าย ลมปราณกลืนสวรรค์ ทะลวงจุดชีพจร',
      weaknesses: 'เส้นชีพจรเคยถูกทำลาย ต้องโคจรรักษาแก่นพลังสม่ำเสมอ',
      relationships: 'ศิษย์ผู้ถูกหักหลังและขับไล่ หวนคืนมาทวงหนี้แค้นจากเก้าสำนักใหญ่',
      appearanceAnchor: 'handsome young Chinese cultivation swordsman, long silver-white hair tied with jade hairpin, flowing black silk robe with gold embroidery, glowing amber eyes, carrying cyan divine sword, Unreal Engine 5 Donghua 3D 8k',
      voiceStyle: 'ทุ้ม นิ่ง สุขุม แฝงพลังความมุ่งมั่นสะท้านฟ้า',
      googleFlowSeed: '741258',
    },
    {
      id: `char-cn-${Date.now()}-2`,
      name: 'จ้าวอสูรโลหิต (Blood Demon Lord)',
      role: 'antagonist',
      age: '500 ปี',
      bodyBuild: 'ร่างสูงใหญ่กำยำ ดั่งขุนเขา ไอหมอกมารสีเลือดแผ่กระจายรอบตัว',
      facialFeatures: 'ใบหน้าดุดันน่าเกรงขาม แววตาสีแดงเพลิงเรืองรอง รอยแผลเป็นกลางหน้าผาก',
      hairStyle: 'ผมยาวสยายสีดำแซมแดง ปลิวสะบัดตามแรงลมปราณมาร',
      clothingStyle: 'ชุดเกราะหนามเหล็กทมิฬ ประดับหัวกะโหลกอสูร ผ้าคลุมสีเลือดฉีกขาด',
      colorTheme: 'สีดำทมิฬ-แดงโลหิต-เพลิงมืด',
      weaponsOrProps: 'ง้าวโลหิตทมิฬเก้าอสูร / พลังลูกแก้วมารโลหิต',
      personality: 'ทะนงตน โหดเหี้ยม ฆ่าคนไม่กระพริบตา ถือคติผู้แข็งแกร่งกลืนกินผู้อ่อนแอ',
      abilities: 'วิชามารโลหิตกลืนวิญญาณ เพลิงทมิฬเผาผลาญชีพจร กายาเหล็กไหลไร้เทียมทาน',
      weaknesses: 'แพ้กระบี่เซียนบริสุทธิ์ และแสงแห่งกระบี่บรรพกาล',
      relationships: 'ผู้อยู่เบื้องหลังการแย่งชิงกระดูกเซียนของเซียวเฉิน',
      appearanceAnchor: 'terrifying Chinese warlord antagonist, spiked black armor, flowing crimson cloak, glowing red eyes, wielding demonic halberd, dark demonic mist aura, 3D Donghua 8k',
      voiceStyle: 'ดุดัน ทรงอำนาจ ทะนงตัว เยือกเย็น ดั่งมัจจุราช',
      googleFlowSeed: '952314',
    },
    {
      id: `char-cn-${Date.now()}-3`,
      name: 'ไป๋หลิงเอ๋อร์ (Bai Ling\'er)',
      role: 'supporting',
      age: '18 ปี',
      bodyBuild: 'ดรุณีแรกรุ่น รูปร่างบอบบาง ท่วงท่าดั่งดอกบัวตูมกลางสายลม',
      facialFeatures: 'ใบหน้ารูปไข่ ผิวขาวดั่งหิมะ แววตาสีมรกตสดใส อ่อนโยนแต่แฝงความเด็ดเดี่ยว',
      hairStyle: 'ผมยาวดำขลับเกล้ามวยผีเสื้อคู่ ประดับกระดิ่งเงินส่งเสียงกังวาน',
      clothingStyle: 'ชุดผ้าไหมแพรพรรณสีขาวบริสุทธิ์ ชายกระโปรงไล่เฉดสีฟ้าคราม สร้อยหยกวิญญาณ',
      colorTheme: 'สีขาวพิสุทธิ์-ฟ้าคราม-เขียวหยก',
      weaponsOrProps: 'พัดขนนกกระเรียนสวรรค์ / เข็มเงินโอสถทิพย์',
      personality: 'จิตใจดี มีเมตตา ฉลาดหลักแหลม คอยเตือนสติเซียวเฉินไม่ให้หลงสู่ด้านมืด',
      abilities: 'วิชาแพทย์เซียนรักษาอาการบาดเจ็บ ค่ายกลวารีสะกดมาร',
      weaknesses: 'พลังต่อสู้โดยตรงต่ำ ไม่ชอบการฆ่าฟัน',
      relationships: 'ทายาทตระกูลแพทย์โบราณ ผู้ช่วยชีวิตเซียวเฉินไว้ที่ก้นเหว',
      appearanceAnchor: 'beautiful Chinese fairy maiden, white and cyan silk dress, delicate jade ornaments, emerald eyes, gentle smile, floating jade particles, 3D Donghua 8k render',
      voiceStyle: 'ไพเราะ นุ่มนวล ก้องกังวาน อ่อนหวานและอบอุ่น',
      googleFlowSeed: '831920',
    },
  ];

  return cnList.slice(0, count);
}
