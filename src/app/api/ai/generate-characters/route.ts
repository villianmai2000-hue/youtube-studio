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
      characterCount = 8,
      apiKey = process.env.GEMINI_API_KEY,
    } = body;

    const count = Math.max(1, Number(characterCount) || 8);

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
          characterCount: count,
        });

        if (aiCharacters && aiCharacters.length > 0) {
          return NextResponse.json({
            success: true,
            characters: aiCharacters,
            source: 'Google Gemini 3.1 Pro (Ensemble Cast)',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini character generation error, falling back to studio template engine:', geminiErr);
      }
    }

    // 2. Intelligent Studio Fallback Engine (Ensemble Cast สไตล์วันพีช / ชาแนลดัง 8-12+ ตัวละคร)
    const characters = generateIntelligentCharacters({
      title,
      synopsis,
      worldCulture,
      genre,
      subGenre,
      visualMedium,
      count,
    });

    return NextResponse.json({
      success: true,
      characters,
      source: 'Studio Ensemble Narrative Engine (ยกแก๊งสไตล์วันพีช)',
    });
  } catch (err: unknown) {
    console.error('Failed to generate characters:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// Online Gemini Pro Generator for Ensemble Cast (One Piece / Shonen / Epic Cultivation style)
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

  const prompt = `คุณคือสุดยอดผู้กำกับและนักออกแบบตัวละครอนิเมะ/ภาพยนตร์ระดับโลก (Character Director & World Builder)
โปรดวิเคราะห์ชื่อเรื่องและพล็อตเรื่องต่อไปนี้ แล้วสร้างรายชื่อตัวละครแบบ "ยกแก๊ง/ทีมมหากาพย์" (Ensemble Cast แบบอนิเมะวันพีช / วันพันช์แมน / ซีรีส์ดัง) จำนวน ${characterCount} ตัวละคร ให้สอดคล้องกับพล็อตเรื่องอย่างสมบูรณ์แบบ:

ชื่อเรื่อง: "${title}"
พล็อตเรื่อง/คอนเซปต์: "${synopsis}"
วัฒนธรรมโลก: ${worldCulture} (จีน/ญี่ปุ่น/ไทย/สากล)
แนวเรื่อง: ${genre} ${subGenre ? `(${subGenre})` : ''}
รูปแบบ: ${visualMedium === 'animation' ? 'อนิเมะ 3D/2D' : 'ภาพยนตร์คนจริง (Live-Action)'}

คำแนะนำโครงสร้างทีมตัวละคร (Ensemble Roles):
1. กัปตัน / พระเอกแกนนำ (Protagonist / Captain) - มุ่งมั่น บ้าบิ่น หรือสุขุม เป็นศูนย์รวมใจของทีม
2. มือขวา / จอมดาบ / ผู้คุ้มกัน (First Mate / Swordsman) - ฝีมือฉกาจ สุขุม ดุดัน ปกป้องหลังกัปตัน
3. ต้นหน / เสนาธิการ / ผู้วางแผน (Navigator / Strategist) - ชาญฉลาด มีไหวพริบ อ่านทิศทาง
4. พลแม่นปืน / สเก๊าท์ / สายซุ่มยิง (Sniper / Scout) - สังเกตการณ์ไกล คลี่คลายวิกฤต
5. ยอดฝีมือแนวหน้า / ซัพพอร์ต (Frontline Fighter / Vanguard) - แข็งแกร่ง บ้าพลัง
6. แพทย์ / ผู้เยียวยา / ปรุงยา (Doctor / Healer) - ดูแลฟื้นฟูบาดแผล รักษาชีวิต
7. นักโบราณคดี / ผู้กุมความลับโลก (Scholar / Lore Keeper) - ถอดรหัสปริศนาประวัติศาสตร์
8. ช่างกล / วิศวกรอาวุธหนัก (Artificer / Engineer) - ปลดล็อกประตู ค่ายกล และอาวุธยุทโธปกรณ์
9. จอมมารใหญ่ / จักรพรรดิผู้ครองมิติ (Supreme Overlord / Emperor Boss)
10. ขุนพลเอกฝ่ายศัตรู (Elite Enemy Commander)
11. อาจารย์ / ผู้พิทักษ์บรรพกาล (Legendary Mentor)

จงตอบกลับเป็น JSON Array ของตัวละครเท่านั้น (ห้ามใส่ Markdown codeblock อื่นใดนอกเหนือจาก JSON) โดยแต่ละตัวละครต้องมีคุณสมบัติครบ 11 มิติดังนี้:
[
  {
    "name": "ชื่อตัวละครภาษาไทย (พร้อมฉายาหรือตำแหน่ง เช่น กัปตัน, มือขวา, ต้นหน)",
    "role": "protagonist หรือ antagonist หรือ supporting หรือ mentor",
    "age": "อายุ เช่น 19 ปี / พันปี",
    "bodyBuild": "1. รูปร่าง",
    "facialFeatures": "2. เอกลักษณ์ใบหน้าและแววตา",
    "hairStyle": "3. ทรงผมและสีผม",
    "clothingStyle": "4. เครื่องแต่งกายและเสื้อผ้าประจำตัว",
    "colorTheme": "5. โทนสีประจำตัว",
    "weaponsOrProps": "6. อาวุธหรือไอเทมประจำตัว",
    "personality": "7. บุคลิกภาพ นิสัย คำพูดติดปาก",
    "abilities": "8. ความสามารถพิเศษ ท่าไม้ตาย",
    "weaknesses": "9. จุดอ่อนหรือเงื่อนไขข้อจำกัด",
    "relationships": "10. บทบาทและความสัมพันธ์ในทีม",
    "appearanceAnchor": "คำบรรยายรูปลักษณ์สรุปรวมเป็นภาษาไทยและอังกฤษสำหรับสร้างภาพ AI ล็อคหน้าตา",
    "voiceStyle": "น้ำเสียงและอารมณ์สำหรับนักพากย์"
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
      role: c.role || (idx === 0 ? 'protagonist' : idx === parsed.length - 1 ? 'antagonist' : 'supporting'),
      age: c.age || '20 ปี',
      bodyBuild: c.bodyBuild || 'สง่างาม ปราดเปรียว',
      facialFeatures: c.facialFeatures || 'คมเข้ม แววตามุ่งมั่น',
      hairStyle: c.hairStyle || 'ผมยาวสลวยสีดำ',
      clothingStyle: c.clothingStyle || 'ชุดประจำตัวละคร',
      colorTheme: c.colorTheme || 'ดำ-ทอง',
      weaponsOrProps: c.weaponsOrProps || 'อาวุธประจำกาย',
      personality: c.personality || 'สุขุม เด็ดเดี่ยว',
      abilities: c.abilities || 'พลังยุทธ์ระดับสูง',
      weaknesses: c.weaknesses || 'ห่วงใยพวกพ้อง',
      relationships: c.relationships || 'สหายร่วมศึก',
      appearanceAnchor: c.appearanceAnchor || `${c.name}, signature anime attire, detailed face, 8k cinematic`,
      voiceStyle: c.voiceStyle || 'ทุ้ม นิ่ง น่าเกรงขาม',
      googleFlowSeed: String(Math.floor(100000 + Math.random() * 900000)),
    }));
  }

  throw new Error('Parsed Gemini output is not an array');
}

// Fallback Template Generator for Rich 10-12 Character Ensembles
function generateIntelligentCharacters(params: {
  title: string;
  synopsis: string;
  worldCulture: WorldCulture;
  genre: string;
  subGenre?: string;
  visualMedium: VisualMedium;
  count: number;
}): CharacterBible[] {
  const { worldCulture, count, synopsis, title, genre, subGenre } = params;
  const context = `${title} ${synopsis} ${genre} ${subGenre}`.toLowerCase();

  const isTowerOrDungeon = /หอคอย|ดันเจี้ยน|ชั้นที่|tower|dungeon|hunter|floor|gate|level|solo|คุปเวล่า/i.test(context);
  const isPirateOrOnePiece = /วันพีช|โจรสลัด|วันพีซ|pirate|ทะเล|สมบัติ|วันพีช|กัปตัน|เรือ|ลูฟี่/i.test(context);
  const isMilitary = /ทหาร|ยุทธการ|ขีปนาวุธ|หน่วยรบ|รบพิเศษ|ดาวเทียม|กองทัพ|สงคราม|military|tactical/i.test(context);
  const isSciFi = /ไซไฟ|หุ่นยนต์|ไซเบอร์|ยานอวกาศ|จักรวาล|ai|cyber|scifi/i.test(context);

  // 1. แนวหอคอย / ดันเจี้ยน / ฮันเตอร์ (เช่น "ผู้หวนคืนจากชั้นที่ 100")
  if (isTowerOrDungeon) {
    const towerRoster: CharacterBible[] = [
      {
        id: `char-tw-${Date.now()}-1`,
        name: 'คังจินอู (กัปตันทีม / ผู้หวนคืนจากชั้นที่ 100)',
        role: 'protagonist',
        age: '24 ปี',
        bodyBuild: 'กำยำ เพรียว ปราดเปรียว แผ่ออร่าสีครามแห่งผู้พิชิต',
        facialFeatures: 'ใบหน้าคมกริบ แววตาสีอำพันดุดันผ่านศึกนับร้อยชั้น มีรอยแผลเป็นบางๆ ที่โหนกแก้ม',
        hairStyle: 'ผมซอยสั้นสีดำสนิท สะบัดพริ้วตามแรงลมปราณ',
        clothingStyle: 'ชุดแจ็กเก็ตหนังดำเสริมเกราะนาโนเคลือบรูนโบราณ ผ้าพันคอสีคราม',
        colorTheme: 'สีดำทมิฬ-ครามสวรรค์-ทองหม่น',
        weaponsOrProps: 'มีดสั้นคู่เขี้ยววิญญาณบาฮามุท / ดาบผ่ามิติชั้นที่ 100',
        personality: 'สุขุม นิ่ง เด็ดขาดในการตัดสินใจ รักพวกพ้องแต่ไม่ปรานีศัตรู',
        abilities: 'ทักษะหวนคืนเวลา 10 วินาที, เนตรเทพวิเคราะห์จุดตาย, ก้าวย่างเงาล่องหน',
        weaknesses: 'ความทรงจำอันเจ็บปวดจากการสูญเสียเพื่อนในลูปเวลาก่อนหน้า',
        relationships: 'ผู้นำทีมเรดหอคอย และผู้ถือครองกุญแจมิติชั้นที่ 100',
        appearanceAnchor: 'handsome cool Korean shadow hunter protagonist, black tactical coat, glowing blue eyes, dual dark daggers, 8k anime art',
        voiceStyle: 'ทุ้มต่ำ สุขุม หนักแน่น ทรงพลัง',
        googleFlowSeed: '109283',
      },
      {
        id: `char-tw-${Date.now()}-2`,
        name: 'อีซูยอน (มือขวา / นักดาบมนตรา)',
        role: 'supporting',
        age: '22 ปี',
        bodyBuild: 'สง่างาม แข็งแกร่ง ทรวดทรงนักดาบมืออาชีพ',
        facialFeatures: 'ใบหน้าสวยเฉี่ยว แววตาสีเงินเย็นชา มั่นใจในตนเอง',
        hairStyle: 'ผมยาวสีเงินหม่นรวบหางม้าสูงประดับโบเงิน',
        clothingStyle: 'เกราะอกน้ำหนักเบาสีเงินขัดเงา กระโปรงพลีทสั้นทับกางเกงเกราะ',
        colorTheme: 'สีเงิน-ขาวบริสุทธิ์-ฟ้าคราม',
        weaponsOrProps: 'ดาบยาวคาตานะเวทมนตร์เยือกแข็ง "ฟรอสต์ไบต์"',
        personality: 'ภักดีต่อจินอูอย่างสูงสุด พูดน้อยต่อยหนัก ฟันศัตรูเด็ดขาด',
        abilities: 'เพลงดาบตัดสะบั้นมิติ คลื่นเยือกแข็งแช่แข็งศัตรูในพริบตา',
        weaknesses: 'ไม่เก่งการเจรจา มักตัดสินปัญหาด้วยดาบ',
        relationships: 'รองหัวหน้าทีมเรด ผู้เป็นโล่และดาบให้จินอู',
        appearanceAnchor: 'silver-haired female swordsman, high ponytail, cold silver eyes, glowing frost katana, sleek silver armor, 8k anime',
        voiceStyle: 'นิ่ง เยือกเย็น ทรงพลัง คมชัด',
        googleFlowSeed: '209384',
      },
      {
        id: `char-tw-${Date.now()}-3`,
        name: 'พัคแทจุน (จอมแทงก์เกราะเพชร / ผู้พิทักษ์)',
        role: 'supporting',
        age: '29 ปี',
        bodyBuild: 'ร่างยักษ์ สูง 2 เมตร กล้ามเนื้อแน่นหนาดั่งภูผาหิน',
        facialFeatures: 'ใบหน้าสี่เหลี่ยมเปี่ยมความจริงใจ มีรอยยิ้มอบอุ่นและเคราครึ้ม',
        hairStyle: 'ผมสั้นเกรียนสีน้ำตาลเข้ม',
        clothingStyle: 'ชุดเกราะหนักไททาเนียมเสริมพลังรูนสีทองอร่าม',
        colorTheme: 'สีทอง-เหลืองอำพัน-เทาเหล็ก',
        weaponsOrProps: 'โล่ทาวเวอร์ชิลด์เกราะเพชรยักษ์ / ค้อนสงครามสายฟ้า',
        personality: 'อารมณ์ดี เสียงหัวเราะดังลั่น ยืนหยัดปกป้องเพื่อนด้วยชีวิต',
        abilities: 'โล่สะท้อนความเสียหาย 200%, บาเรียเพชรคุ้มกันทั้งปาร์ตี้, ยั่วยุศัตรู',
        weaknesses: 'ความเร็วในการเคลื่อนที่ต่ำ ตกเป็นเป้าหมายได้ง่าย',
        relationships: 'พี่ใหญ่ของทีมเรด คอยดูแลและเลี้ยงอาหารลูกทีม',
        appearanceAnchor: 'giant bulky male paladin tank, golden diamond fortress shield, massive warhammer, warm smile, 8k anime art',
        voiceStyle: 'ทุ้ม กังวาน อบอุ่น มีพลังดั่งเสียงกลองศึก',
        googleFlowSeed: '309485',
      },
      {
        id: `char-tw-${Date.now()}-4`,
        name: 'ยุนจีอา (แพทย์สนาม / จอมเวทซัพพอร์ต)',
        role: 'supporting',
        age: '20 ปี',
        bodyBuild: 'ตัวเล็ก บอบบาง น่ารักสดใส คล่องแคล่ว',
        facialFeatures: 'ดวงตากลมโตสีเขียวมรกต ผิวขาวผ่อง มีเสน่ห์ไร้เดียงสา',
        hairStyle: 'ผมบ๊อบสั้นสีชมพูพาสเทลประดับกิ๊บรูปปีกนก',
        clothingStyle: 'ชุดกิลด์ฮันเตอร์โทนขาวเขียว มินิสเกิร์ต กระเป๋าใส่ขวดยาโอสถ',
        colorTheme: 'สีเขียวมรกต-ชมพูพาสเทล-ขาว',
        weaponsOrProps: 'คทาพฤกษาสวรรค์ / ปืนฉีดเซรุ่มฟื้นฟูพลังงาน',
        personality: 'จิตใจดี ขี้สงสารแต่เข้มแข็งเมื่อเพื่อนบาดเจ็บ ฉลาดเรื่องสมุนไพรดันเจี้ยน',
        abilities: 'ฮีลเร่งด่วนระดับ S, ลบล้างดีบัฟพิษทุกชนิด, บัฟความเร็วและพลังโจมตี',
        weaknesses: 'พลังป้องกันต่ำ ต้องการให้แทงก์คอยคุ้มกัน',
        relationships: 'แพทย์ประจำทีม ผู้คอยรักษาบาดแผลให้ทุกคนหลังเสร็จศึก',
        appearanceAnchor: 'cute anime combat medic girl, short pastel pink hair, emerald eyes, white-green healer outfit, magical healing staff, 8k anime',
        voiceStyle: 'สดใส น่ารัก อ่อนหวาน ให้กำลังใจ',
        googleFlowSeed: '409586',
      },
      {
        id: `char-tw-${Date.now()}-5`,
        name: 'ฮันดงอิล (พลซุ่มยิง / จอมประดิษฐ์กับดัก)',
        role: 'supporting',
        age: '23 ปี',
        bodyBuild: 'ผอมสูง คล่องตัว นิ้วมือยาวแม่นยำสูง',
        facialFeatures: 'สวมแว่นตาไฮเทคข้างเดียว แววตาเจ้าเล่ห์ช่างสังเกต',
        hairStyle: 'ผมซอยสั้นสีเขียวมะกอกยุ่งๆ เล็กน้อย',
        clothingStyle: 'ชุดพลซุ่มยิงลายพรางไฮเทค ผ้าคลุมกันความร้อนและเรดาร์',
        colorTheme: 'สีเขียวมะกอก-ดำ-ส้มสะท้อนแสง',
        weaponsOrProps: 'ปืนไรเฟิลต่อต้านสสารระยะไกล 2 กิโลเมตร / โดรนสอดแนมรูน',
        personality: 'ช่างพูด ช่างแซว แต่เมื่อเล็งปืนจะเงียบกริบสมาธิ 100%',
        abilities: 'กระสุนเจาะเกราะทะลุมิติ, วางกับดักระเบิดเวท, ตรวจจับกับดักในดันเจี้ยน',
        weaknesses: 'ไม่ถนัดสู้ระยะประชิด หากศัตรูประชิดตัวต้องใช้ระเบิดควันหนี',
        relationships: 'หน่วยสเก๊าท์และซุ่มยิงผู้ระวังหลังให้ทีมเรด',
        appearanceAnchor: 'anime tactical sniper scout, high-tech monocular eye, anti-materiel sniper rifle, olive green camouflage cape, 8k anime',
        voiceStyle: 'ทะเล้น กวนๆ แต่เด็ดขาดเมื่อสั่งยิง',
        googleFlowSeed: '509687',
      },
      {
        id: `char-tw-${Date.now()}-6`,
        name: 'ชเวมินโฮ (เสนาธิการ / นักเจรจากิลด์)',
        role: 'supporting',
        age: '32 ปี',
        bodyBuild: 'สูงโปร่ง บุคลิกนักธุรกิจหนุ่มผู้ทรงภูมิ',
        facialFeatures: 'ใบหน้าเรียบเนียน สวมแว่นตากรอบทอง แววตาคมกริบอ่านคนทะลุปรุโปร่ง',
        hairStyle: 'ผมสีดำสนิทหวีปาดเรียบเนี๊ยบ',
        clothingStyle: 'สูททักซิโด้สีน้ำเงินเข้ม สวมทับเสื้อเกราะเคฟลาร์บางเบา',
        colorTheme: 'สีน้ำเงินกรมท่า-ทองคำ-ดำ',
        weaponsOrProps: 'แท็บเล็ตวิเคราะห์ดาต้าดันเจี้ยน / ไม้เท้าหัวสุนัขจิ้งจอกซ่อนดาบ',
        personality: 'เจ้าแผนการ สุขุม คำนวณความเสี่ยงทุกขั้นตอน ไม่เคยตื่นตระหนก',
        abilities: 'เวทมนตร์ควบคุมค่ายกลหอคอย, บัฟกลยุทธ์ทีมเพิ่มพลัง 30%, ทักษะเจรจาต่อรอง',
        weaknesses: 'พลังเวทในการต่อสู้เดี่ยวมีจำกัด เน้นสั่งการเชิงยุทธวิธี',
        relationships: 'ผู้วางแผนเส้นทางและยุทธศาสตร์การเคลียร์หอคอยแต่ละชั้น',
        appearanceAnchor: 'sharp handsome anime tactician in dark navy suit, glasses, holding holographic data pad, calm cunning look, 8k anime',
        voiceStyle: 'สุขุม นุ่มลึก มีอำนาจสั่งการเด็ดขาด',
        googleFlowSeed: '609788',
      },
      {
        id: `char-tw-${Date.now()}-7`,
        name: 'จอมมารอิกนิส (บอสใหญ่ผู้ครองชั้นที่ 100)',
        role: 'antagonist',
        age: 'พันปี',
        bodyBuild: 'ร่างสูงใหญ่ 2.5 เมตร เกราะหินหลอมละลายแผ่ไอร้อน 1,000 องศา',
        facialFeatures: 'ดวงตาสีส้มแดงเพลิงไร้ลูกตาดำ มีเขามารหักข้างซ้าย ใบหน้าดุดันน่าเกรงขาม',
        hairStyle: 'เปลวเพลิงสีแดงส้มลุกโชนแทนเส้นผม',
        clothingStyle: 'ชุดเกราะหินอัคนีทมิฬ มีรอยแยกแมกมาสีทองส่องประกาย',
        colorTheme: 'สีดำหินภูเขาไฟ-แดงเพลิง-ทองส้ม',
        weaponsOrProps: 'ดาบยักษ์เพลิงบรรลัยกัลป์ "โซลฟอร์จ" / โซ่ตรวนวิญญาณ',
        personality: 'เย่อหยิ่ง ทรงพลัง กระหายการต่อสู้กับผู้ท้าชิงที่คู่ควร',
        abilities: 'เรียกฝนอุกกาบาตทลายชั้น, เปลวเพลิงเผาผลาญวิญญาณไม่ดับสูญ, ระเบิดคลื่นเพลิง 360 องศา',
        weaknesses: 'แก่นหัวใจคริสตัลที่ซ่อนอยู่หลังเกราะหน้าอก',
        relationships: 'บอสชั้นสูงสุดที่กักขังชะตากรรมของหอคอย และผู้สังหารทีมของจินอูในลูปเดิม',
        appearanceAnchor: 'fearsome demon king boss, flaming hair, volcanic obsidian armor with glowing magma veins, giant fiery greatsword, 8k anime',
        voiceStyle: 'คำรามกึกก้อง ดุดัน สะท้านแผ่นดิน ดั่งภูเขาไฟระเบิด',
        googleFlowSeed: '709889',
      },
      {
        id: `char-tw-${Date.now()}-8`,
        name: 'อาซาเซล (ขุนพลเงาทมิฬ / แม่ทัพชั้นที่ 99)',
        role: 'antagonist',
        age: 'หลายร้อยปี',
        bodyBuild: 'เพรียวลม ไร้กระดูก เคลื่อนไหวรวดเร็วดั่งเงาพราย',
        facialFeatures: 'สวมหน้ากากหัวกะโหลกอีกา แววตาสีม่วงนีออนเรืองรอง',
        hairStyle: 'ผมยาวเส้นเล็กสีม่วงเข้มปนดำ',
        clothingStyle: 'ผ้าคลุมขนนกอีกาทมิฬ สลัดขนเป็นใบมีดสังหารได้',
        colorTheme: 'สีม่วงดาร์ก-ดำทมิฬ-เขียวพิษ',
        weaponsOrProps: 'กรงเล็บพิษอัมพาตเก้าสังหาร / มีดบินเงาพันเล่ม',
        personality: 'โรคจิต อำมหิต ชื่นชอบการทรมานเหยื่อในความมืด',
        abilities: 'กลืนหายเข้าไปในเงา, พิษอัมพาตไร้กลิ่น, สร้างมิติมายาลวงตา',
        weaknesses: 'แพ้แสงสว่างศักดิ์สิทธิ์และไฟความร้อนสูง',
        relationships: 'มือขวาของจอมมารอิกนิส ผู้คุมประตูด่านสุดท้ายก่อนถึงชั้นที่ 100',
        appearanceAnchor: 'sinister shadow assassin boss, crow skull mask, glowing purple eyes, dark feathered mantle, sharp poison claws, 8k anime',
        voiceStyle: 'แหบพร่า หัวเราะเย้ยหยัน เยือกเย็นขนลุก',
        googleFlowSeed: '809990',
      },
      {
        id: `char-tw-${Date.now()}-9`,
        name: 'ท่านผู้เฒ่าคุปเวล่า (วิญญาณผู้สร้างหอคอย / อาจารย์)',
        role: 'mentor',
        age: 'หมื่นปี (วิญญาณศักดิ์สิทธิ์)',
        bodyBuild: 'ร่างโปร่งแสงลอยกลางอากาศ ทรงภูมิฐานและสงบนิ่ง',
        facialFeatures: 'ใบหน้าผู้เฒ่าใจดี หนวดเคราสีขาวสะอาดยาวถึงอก ดวงตาสีทองส่องประกายปัญญา',
        hairStyle: 'ผมขาวโพลนเกล้ามวยลอยตัว',
        clothingStyle: 'ชุดคลุมผ้าโบราณสีขาวทองลอยพลิ้ว ประดับอักขระภาษารูน',
        colorTheme: 'สีขาวมุก-ทองคำ-แสงออโรร่า',
        weaponsOrProps: 'ม้วนคัมภีร์แก่นแท้แห่งหอคอย / ลูกแก้วมิติบรรพกาล',
        personality: 'เปี่ยมเมตตา มีปัญญารู้แจ้ง คอยบอกใบ้ปริศนาเพื่อทดสอบจิตใจของผู้หวนคืน',
        abilities: 'เปิดประตูมิติฉุกเฉิน, ถ่ายทอดวิชาลับผู้พิชิต, ซ่อมแซมแก่นวิญญาณ',
        weaknesses: 'ไม่สามารถลงมือต่อสู้กับบอสได้โดยตรง ทำได้เพียงชี้แนะ',
        relationships: 'ผู้มอบระบบหวนคืนเวลาให้จินอู เพื่อแก้ไขโชคชะตาของหอคอย',
        appearanceAnchor: 'ethereal ancient sage ghost, long white beard, golden glowing eyes, floating ancient scroll, white and gold robe, 8k anime',
        voiceStyle: 'กังวาน นุ่มลึก เปี่ยมเมตตาและพลังศรัทธา',
        googleFlowSeed: '909091',
      },
      {
        id: `char-tw-${Date.now()}-10`,
        name: 'บาฮามุทน้อย (สัตว์อสูรคู่หู / มังกรคราม)',
        role: 'supporting',
        age: 'แรกรุ่น',
        bodyBuild: 'มังกรขนาดเล็กบินคล่องแคล่ว มีเกล็ดสีครามสะท้อนแสง',
        facialFeatures: 'ดวงตากลมโตสีฟ้าคราม ฉลาดแสนรู้ มีเขาคู่สีทองเล็กๆ',
        hairStyle: 'แผงคอสีฟ้าเปล่งประกายละอองแสง',
        clothingStyle: 'ปลอกคอหนังประดับหินเวทมนตร์รูน',
        colorTheme: 'สีฟ้าคราม-ทองคำ-ขาว',
        weaponsOrProps: 'ลมหายใจมังกรสายฟ้าจิ๋ว / กรงเล็บมังกร',
        personality: 'ซุกซน ขี้เล่น ภักดีต่อจินอู คอยส่งสัญญาณเตือนภัยศัตรู',
        abilities: 'พ่นบอลสายฟ้าสตันศัตรู, ขยายร่างเป็นมังกรยักษ์ในยามคับขัน, ดมกลิ่นไอเทมลับ',
        weaknesses: 'แพ้ของกินอร่อยๆ ตะกละ',
        relationships: 'สัตว์เลี้ยงคู่หูประจำตัวจินอูที่ฟักออกมาจากไข่ชั้นที่ 50',
        appearanceAnchor: 'cute baby celestial dragon, glowing blue scales, small golden horns, big blue eyes, tiny wings, 8k anime art',
        voiceStyle: 'เสียงร้องก้องใส น่ารัก แต่คำรามกึกก้องยามโกรธ',
        googleFlowSeed: '101012',
      },
    ];
    return towerRoster.slice(0, count);
  }

  // 2. แนวโจรสลัด / ผจญภัย / วันพีช (One Piece Pirate Style)
  if (isPirateOrOnePiece || worldCulture === 'japanese') {
    const pirateRoster: CharacterBible[] = [
      {
        id: `char-op-${Date.now()}-1`,
        name: 'กัปตันมังกี้ เรย์ (กัปตัน / ผู้มีพลังยางมิติ)',
        role: 'protagonist',
        age: '19 ปี',
        bodyBuild: 'สมส่วน กล้ามเนื้อคมชัด ผิวสีแทน แววตาเปี่ยมพลังแห่งอิสรภาพ',
        facialFeatures: 'รอยยิ้มกว้างเห็นฟันขาว แววตาสีดำเป็นประกาย มีรอยแผลเป็นใต้ตาซ้าย',
        hairStyle: 'ผมซอยสั้นสีดำยุ่งๆ สวมหมวกฟางใบโปรดผูกเชือกแดง',
        clothingStyle: 'เสื้อกั๊กสีแดงเปิดอก กางเกงยีนส์ขาสั้นพับขา รองเท้าแตะฟาง',
        colorTheme: 'สีแดงชาด-เหลืองฟาง-น้ำเงินยีนส์',
        weaponsOrProps: 'หมัดยางยืดพลังฮาคิ / หมวกฟางสืบทอดเจตจำนง',
        personality: 'ร่าเริง บ้าบิ่น มุ่งมั่นสู่การเป็นราชาผู้มีอิสรภาพสูงสุด รักเพื่อนยิ่งกว่าชีวิต',
        abilities: 'หมัดยางยืดเกียร์ 5 ดัดแปลงสิ่งแวดล้อม, ฮาคิราชันย์ปล่อยคลื่นสะกดศัตรู',
        weaknesses: 'ว่ายน้ำไม่ได้เมื่อโดนน้ำทะเล, แพ้กลิ่นเนื้อย่าง',
        relationships: 'กัปตันเรือโจรสลัด ผู้รวบรวมพรรคพวกที่มีความฝันอันยิ่งใหญ่',
        appearanceAnchor: 'energetic young anime pirate captain, straw hat, open red vest, bright adventurous grin, muscular lean build, 8k anime art',
        voiceStyle: 'สดใส เปี่ยมพลัง หัวเราะกังวาน ตะโกนลั่นอย่างจริงจัง',
        googleFlowSeed: '112233',
      },
      {
        id: `char-op-${Date.now()}-2`,
        name: 'ริวโนะสึเกะ (รองกัปตัน / จอมดาบสามเล่ม)',
        role: 'supporting',
        age: '21 ปี',
        bodyBuild: 'กำยำ แผ่นอกกว้าง มีรอยแผลเป็นพาดผ่านหน้าอก',
        facialFeatures: 'ใบหน้าดุดัน มีแผลเป็นที่ตาซ้ายที่ปิดสนิท แววตาคมดั่งพญาเหยี่ยว',
        hairStyle: 'ผมสั้นเกรียนสีเขียวมอส สวมผ้าโพกหัวสีดำยามเอาจริง',
        clothingStyle: 'เสื้อคลุมยาวสีเขียวเข้มเปิดอก คาดผ้าฮารามะกิสีเขียวที่เอว พกดาบ 3 เล่ม',
        colorTheme: 'สีเขียวมอส-ดำ-ทอง',
        weaponsOrProps: 'ดาบชั้นยอด 3 เล่ม (คาตานะขาวโบราณ, ดาบมารดำ, ดาบตัดเพลิง)',
        personality: 'สุขุม จริงจัง ดุดัน รักเกียรติยศนักดาบ หลงทางเป็นประจำ',
        abilities: 'วิชาดาบสามเล่มตัดมิติ, เคลือบฮาคิเกราะทมิฬฟันเหล็กขาด, หมุนตัวสร้างพายุทอร์นาโดกระบี่',
        weaknesses: 'ทิศทางแย่มาก เดินเลี้ยวขวาจะไปโผล่คนละทวีป',
        relationships: 'มือขวาและเพื่อนร่วมรบคนแรกของกัปตัน ผู้พร้อมรับความเจ็บปวดแทนทุกคน',
        appearanceAnchor: 'badass anime swordsman, short moss green hair, three katanas on hip, scar over eye, dark green coat, 8k anime art',
        voiceStyle: 'ทุ้มต่ำ ดุดัน สุขุม น่าเกรงขาม',
        googleFlowSeed: '223344',
      },
      {
        id: `char-op-${Date.now()}-3`,
        name: 'นามินะ (ต้นหนเรือ / เสนาธิการอากาศ)',
        role: 'supporting',
        age: '20 ปี',
        bodyBuild: 'รูปร่างเพรียวระหง สัดส่วนสวยงาม คล่องตัว',
        facialFeatures: 'ดวงตาสีส้มประกายทอง ใบหน้าสวยสดใส รอยยิ้มมั่นใจ',
        hairStyle: 'ผมยาวลอนสีส้มสว่างพลิ้วไหวตามลมทะเล',
        clothingStyle: 'เสื้อบิกินีท็อปสไตล์มารีน กางเกงยีนส์ต่ำ รองเท้าส้นสูง',
        colorTheme: 'สีส้ม-ฟ้าคราม-ทอง',
        weaponsOrProps: 'กระบองคุริมะกระดิกสภาพอากาศ / บอลสายฟ้าและเมฆฝน',
        personality: 'ฉลาดหลักแหลม เจ้าคิดเจ้าแค้นเรื่องเงิน แต่รักเพื่อนร่วมเรือมาก คอยสั่งการเรือ',
        abilities: 'อ่านทิศทางลมและกระแสน้ำสมบูรณ์แบบ, เสกฟ้าผ่า ฟองอากาศล่องหน, ลมพายุสกัดกั้น',
        weaknesses: 'พลังกายภาพสู้ระยะประชิดต่ำ, เห็นเงินทองหรือสมบัติแล้วตาโต',
        relationships: 'มันสมองของเรือ คอยควบคุมกัปตันและลูกเรือไม่ให้พาเรือไปล่ม',
        appearanceAnchor: 'beautiful orange-haired anime navigator, weather tactician staff, stylish marine top, confident clever smile, 8k anime art',
        voiceStyle: 'กระฉับกระเฉง ฉลาด สดใส แต่ตวาดดุดันเมื่อลูกเรือก่อเรื่อง',
        googleFlowSeed: '334455',
      },
      {
        id: `char-op-${Date.now()}-4`,
        name: 'โซมะ (กุ๊กจอมเตะ / ผู้พิทักษ์หลังฉาก)',
        role: 'supporting',
        age: '21 ปี',
        bodyBuild: 'สูงโปร่ง ขาคู่งามเรียวยาว กล้ามเนื้อขาแกร่งดั่งเหล็กกล้า',
        facialFeatures: 'ใบหน้าหล่อเหลา คิ้วม้วนเป็นก้นหอย คาบบุหรี่เป็นเอกลักษณ์',
        hairStyle: 'ผมสีบลอนด์ทองปัดเป๋ปิดตาข้างหนึ่ง',
        clothingStyle: 'ชุดสูทสากลสีดำเนี๊ยบ เนคไทสีน้ำเงิน รองเท้าหนังขัดมันวาว',
        colorTheme: 'สีดำ-น้ำเงินเข้ม-เพลิงส้ม',
        weaponsOrProps: 'ขาคู่พลังเพลิง "เดียเบิลจัมบ์" (ไม่ใช้มือในการต่อสู้เพราะเก็บไว้ทำอาหาร)',
        personality: 'สุภาพบุรุษตัวจริง ไม่เตะผู้หญิงเด็ดขาด มีไหวพริบแทรกซึมหลังแนวศัตรู',
        abilities: 'ลูกเตะเพลิงความเร็วสูงฟันอากาศ, เดินชมจันทร์ก้าวเหยียบอากาศ, ปรุงอาหารเสริมพลังบัฟ',
        weaknesses: 'แพ้สาวงาม เจอสาวสวยแล้วเลือดกำเดาพุ่ง',
        relationships: 'คู่กัดกับริวโนะสึเกะ แต่เป็นสองเสาหลักที่กัปตันไว้วางใจที่สุด',
        appearanceAnchor: 'dashing blonde anime chef in black suit, kicking with fiery flaming legs, cigarette in mouth, handsome suave look, 8k anime art',
        voiceStyle: 'ทุ้ม นุ่ม มีเสน่ห์ อารมณ์ร้อนเมื่อเพื่อนหรืออาหารโดนดูถูก',
        googleFlowSeed: '445566',
      },
      {
        id: `char-op-${Date.now()}-5`,
        name: 'อุโซจิ (พลซุ่มยิง / จอมลวงตา)',
        role: 'supporting',
        age: '19 ปี',
        bodyBuild: 'ผอมเพรียว ปราดเปรียว สวมแว่นกอกเกิลสไนเปอร์',
        facialFeatures: 'จมูกยาวเป็นเอกลักษณ์ แววตาหวาดระแวงแต่มีแววนักรบผู้กล้าหาญ',
        hairStyle: 'ผมหยิกฟูดำ สวมหมวกผ้าโพกหัวและแว่นเล็งเป้า',
        clothingStyle: 'เอี๊ยมช่างสีน้ำตาล สะพายกระเป๋าใส่ลูกกระสุนพฤกษา',
        colorTheme: 'สีเขียวขี้ม้า-น้ำตาล-เหลือง',
        weaponsOrProps: 'หนังสติ๊กยักษ์ "คาบูโตะ" / พืชกินคนป็อปกรีน / ระเบิดควันดาวลวงตา',
        personality: 'ขี้โม้ ขี้กลัว แต่เมื่อถึงคราวคับขันจะกลายเป็นเทพสไนเปอร์กู้สถานการณ์',
        abilities: 'ยิงแม่นระยะ 5 กิโลเมตรไร้คลาดเคลื่อน, ฮาคิสังเกตมองเห็นวิญญาณทะลุกำแพง',
        weaknesses: 'มองโลกแง่ร้าย ขี้ตกใจง่าย',
        relationships: 'เพื่อนสนิทกัปตัน คอยสร้างเสียงหัวเราะและอาวุธประดิษฐ์ให้เพื่อนๆ',
        appearanceAnchor: 'curly haired anime sniper, long nose, wearing tactical goggles, giant slingshot aiming, brave dramatic pose, 8k anime art',
        voiceStyle: 'ตื่นตระหนก โวยวาย แต่จริงจังและเด็ดขาดตอนซุ่มยิง',
        googleFlowSeed: '556677',
      },
      {
        id: `char-op-${Date.now()}-6`,
        name: 'โทนี่ ช็อปปี้ (แพทย์ประจำเรือ / กวางเรนเดียร์แปลงร่าง)',
        role: 'supporting',
        age: '17 ปี (กวางตัวเล็ก)',
        bodyBuild: 'ตัวเล็กน่ารัก ขนนุ่มปุกปุย สามารถขยายร่างเป็นอสูรยักษ์ได้',
        facialFeatures: 'จมูกสีน้ำเงิน มีเขากวางเรนเดียร์ ดวงตากลมโตน่ารัก',
        hairStyle: 'สวมหมวกทรงสูงสีชมพูกากบาทขาว',
        clothingStyle: 'กางเกงขาสั้นสีแดง สะพายเป้ยาแพทย์สีฟ้า',
        colorTheme: 'สีชมพู-ฟ้า-น้ำตาลขนสัตว์',
        weaponsOrProps: 'รัมเบิลบอล (ลูกอมแปลงร่าง 7 สเต็ป)',
        personality: 'ใสซื่อ น่ารัก ชมแล้วเขินตัวบิด มุ่งมั่นรักษาทุกโรคในโลก',
        abilities: 'แปลงร่าง 7 รูปแบบ (สายสปีด, สายกระโดด, สายแทงก์, มอนสเตอร์พอยต์ยักษ์)',
        weaknesses: 'โดนหลอกง่าย ซุ่มซ่าม',
        relationships: 'หมอประจำเรือที่ทุกคนเอ็นดูและคอยปกป้อง',
        appearanceAnchor: 'cute blue-nosed reindeer doctor, pink top hat with cross, small fluffy body, carrying medical bag, 8k anime art',
        voiceStyle: 'เสียงใส เด็ก น่ารัก ตะโกนเขินอาย',
        googleFlowSeed: '667788',
      },
      {
        id: `char-op-${Date.now()}-7`,
        name: 'นิโค โรซ่า (นักโบราณคดี / ผู้กุมความลับศิลา)',
        role: 'supporting',
        age: '30 ปี',
        bodyBuild: 'สูงโปร่ง สง่างาม ทรวดทรงนางแบบ สุขุมเยือกเย็น',
        facialFeatures: 'ใบหน้าคมสวย ดวงตาสีฟ้าครามลึกซึ้ง รอยยิ้มลึกลับน่าค้นหา',
        hairStyle: 'ผมยาวตรงสีดำขลับ สวมแว่นกันแดดเหน็บไว้บนศีรษะ',
        clothingStyle: 'เสื้อกั๊กหนังสีม่วงเข้ม กระโปรงยาวผ่าข้างสไตล์โบฮีเมียน',
        colorTheme: 'สีม่วงเข้ม-ดำ-น้ำเงินมิดไนท์',
        weaponsOrProps: 'พลังแตกหน่อผลปีศาจ (เสกมือ เท้า ปีก ขนาดมหึมา)',
        personality: 'เยือกเย็น พูดจาติดตลกร้าย ฉลาดปราดเปรื่อง รักการอ่านหนังสือ',
        abilities: 'งอกมือพันมือหักคอศัตรู, อ่านศิลาจารึกภาษาโบราณโพเนกลีฟ, เสกปีกบินกลางอากาศ',
        weaknesses: 'ร่างจริงจะได้รับบาดเจ็บหากแขนที่เสกออกมาโดนโจมตี',
        relationships: 'ผู้ไขปริศนาประวัติศาสตร์ที่หายไป 100 ปี เพื่อนำทางกัปตันสู่เกาะสุดท้าย',
        appearanceAnchor: 'elegant mature anime scholar woman, black straight hair, dark purple outfit, mysterious smile, blooming hands aura, 8k anime art',
        voiceStyle: 'ทุ้ม นุ่ม สุขุม เยือกเย็น ไพเราะน่าฟัง',
        googleFlowSeed: '778899',
      },
      {
        id: `char-op-${Date.now()}-8`,
        name: 'แฟรงก์ บุลเล็ต (ช่างซ่อมเรือ / ไซบอร์กอาวุธหนัก)',
        role: 'supporting',
        age: '36 ปี',
        bodyBuild: 'ร่างยักษ์เหล็กไหล อกใหญ่ แขนกลพลังโคล่า บ้าพลัง',
        facialFeatures: 'คางเหล็กสามแฉก จมูกเหล็ก ทรงผมเปลี่ยนทรงได้ด้วยการกดจมูก',
        hairStyle: 'ผมสีฟ้าสดใส ปรับทรงเป็นโมฮอว์กหรือปืนใหญ่',
        clothingStyle: 'เสื้อฮาวายลายดอกไม้สีแดง กางเกงว่ายน้ำตัวเดียว',
        colorTheme: 'สีฟ้าเทอร์ควอยซ์-แดงสด-เหล็กเงิน',
        weaponsOrProps: 'หมัดจรวดเหล็ก / ปืนใหญ่ลมคูเดอบูสต์ / ค้อนช่างซ่อมเรือ',
        personality: 'บ้าพลัง ร้อง "SUUUUPER!" ตลอดเวลา ร้องไห้ง่ายเมื่อฟังเรื่องซึ้งใจ',
        abilities: 'ยิงปืนใหญ่ลมเป่าเรือเหาะ, สร้างสะพานและกำแพงใน 5 วินาที, เกราะเหล็กด้านหน้ากันกระสุน',
        weaknesses: 'ข้างหลังเป็นเนื้อมนุษย์ธรรมดา (เพราะเอื้อมมือไปดัดแปลงไม่ถึง), น้ำมันหมดต้องเติมโคล่า',
        relationships: 'ช่างต่อเรือคู่บารมีผู้ดูแลเรือให้อยู่รอดในทุกมรสุม',
        appearanceAnchor: 'giant anime cyborg shipwright, bright blue hair, sunglasses, hawaiian shirt, huge mechanical arms, energetic pose, 8k anime art',
        voiceStyle: 'ดังสนั่น แหบห้าว บ้าพลัง ร้อง ซุปเปอร์!',
        googleFlowSeed: '889900',
      },
      {
        id: `char-op-${Date.now()}-9`,
        name: 'จอมพลเรือ อากาอิชิ (ศัตรูคู่อาฆาต / อำนาจรัฐบาลโลก)',
        role: 'antagonist',
        age: '55 ปี',
        bodyBuild: 'สูง 3 เมตร ร่างหนาบึกบึน แผ่ออร่าความยุติธรรมอันโหดร้าย',
        facialFeatures: 'ใบหน้าเหี้ยมเกรียม คิ้วขมวด แววตาดุดันไร้ความเมตตา มีรอยสักลายดอกไม้',
        hairStyle: 'ผมสั้นเกรียน สวมหมวกทหารเรือสีขาว',
        clothingStyle: 'เสื้อคลุมทหารเรือสีขาวปักคำว่า "ยุติธรรมเด็ดขาด" สูทสีแดงเลือดนก',
        colorTheme: 'สีแดงแมกมา-ขาวทหารเรือ-ทอง',
        weaponsOrProps: 'หมัดแมกมาภูเขาไฟหลอมละลายทุกสิ่ง / ดาบฮาคิ',
        personality: 'เด็ดขาด ไม่ปรานีคนชั่ว ถือคติความยุติธรรมเด็ดขาด กวาดล้างโจรสลัดไม่ให้เหลือ',
        abilities: 'เปลี่ยนร่างเป็นแมกมาความร้อน 1,500 องศา, หมัดหมาป่าเพลิงกลืนกินเรือรบ',
        weaknesses: 'ความใจร้อน ดันทุรัง ไม่ฟังใคร',
        relationships: 'ผู้นำกองทัพเรือที่ตั้งค่าหัวล่ากัปตันเรย์และลูกเรือทุกคน',
        appearanceAnchor: 'ruthless anime fleet admiral in white justice coat, magma fist, red suit, strict grim expression, powerful intimidation, 8k anime art',
        voiceStyle: 'ทุ้มลึก ดุดัน ก้องกังวาน เด็ดขาดไร้ความลังเล',
        googleFlowSeed: '990011',
      },
      {
        id: `char-op-${Date.now()}-10`,
        name: 'จักรพรรดิมืด ทีชเชอร์ (โจรสลัดคู่ปรับ / พลังหลุมดำ)',
        role: 'antagonist',
        age: '40 ปี',
        bodyBuild: 'ร่างอ้วนใหญ่ ฟันหลอ ขนดก แผ่ไอหมอกหลุมดำทมิฬ',
        facialFeatures: 'ใบหน้าเจ้าเล่ห์ ยิ้มกว้างฟันหลอ แววตากระหายอำนาจสูงสุด',
        hairStyle: 'ผมหยิกดำยาว สวมผ้าโพกหัวโจรสลัดและแหวนทองเต็มทุกนิ้ว',
        clothingStyle: 'เสื้อคลุมกัปตันโจรสลัดสีดำขอบทอง กางเกงลายทางสีเขียว พกปืนพก 3 กระบอก',
        colorTheme: 'สีดำหลุมดำ-ม่วงทมิฬ-ทองคำ',
        weaponsOrProps: 'พลังความมืดกลืนกินพลังปีศาจ / หมัดแผ่นดินไหวสะเทือนโลก',
        personality: 'เจ้าเล่ห์ ละโมบ อดทนรอคอยจังหวะทรยศเพื่อขึ้นสู่จุดสูงสุด หัวเราะ "เซฮ่าฮ่าฮ่า!"',
        abilities: 'สร้างหลุมดำดูดกลืนทุกสิ่ง, ดูดซับพลังความสามารถของศัตรู, หมัดสั่นสะเทือนมิติ',
        weaknesses: 'รับความเสียหายความเจ็บปวดมากกว่าคนปกติ 2 เท่า',
        relationships: 'คู่ปรับแห่งยุคสมัยที่แย่งชิงบัลลังก์ราชาโจรสลัดกับเรย์',
        appearanceAnchor: 'menacing anime pirate emperor, fat rugged build, missing teeth, dark void aura around hands, pirate coat, sinister laugh, 8k anime art',
        voiceStyle: 'แหบ ห้าว หัวเราะเซฮ่าฮ่าฮ่า สะใจและทรงอำนาจ',
        googleFlowSeed: '102030',
      },
    ];
    return pirateRoster.slice(0, count);
  }

  // 3. แนวเซียนจีน 3D (Donghua Xianxia / SAN1)
  const cnRoster: CharacterBible[] = [
    {
      id: `char-cn-${Date.now()}-1`,
      name: 'เซียวเฉิน (เจ้าสำนักหนุ่ม / ผู้ถือครองกระบี่เก้าวิญญาณ)',
      role: 'protagonist',
      age: '19 ปี',
      bodyBuild: 'จอมยุทธ์หนุ่มรูปร่างสง่างาม ผิวหยกขาวสะอาด แผ่รังสีปราณกระบี่',
      facialFeatures: 'ใบหน้ารูปสลัก คิ้วกระบี่ แววตาสีอำพันดั่งเซียนสวรรค์',
      hairStyle: 'ผมยาวสีขาวเงินเกล้ามวยประดับปิ่นหยกขาว ปล่อยปอยผมคลอเคลียแก้ม',
      clothingStyle: 'ชุดคลุมเต๋าผ้าไหมสีดำขลับ ปักลวดลายดิ้นทองวิจิตร พริ้วไหวต้านลม',
      colorTheme: 'สีดำทมิฬ-ทองคำ-ครามสวรรค์',
      weaponsOrProps: 'กระบี่เทพบรรพกาลเก้าวิญญาณสีคราม ลอยหมุนวนรอบกาย',
      personality: 'เยือกเย็น สุขุม มุ่งมั่นเด็ดเดี่ยว กตัญญูต่อผู้มีพระคุณ ตาต่อตาฟันต่อฟันกับศัตรู',
      abilities: 'เพลงกระบี่เก้าสวรรค์ไร้พ่าย ลมปราณกลืนสวรรค์ ทะลวงจุดชีพจร',
      weaknesses: 'เส้นชีพจรเคยถูกทำลาย ต้องโคจรรักษาแก่นพลังสม่ำเสมอ',
      relationships: 'ศิษย์ผู้ถูกหักหลังและขับไล่ หวนคืนมาทวงหนี้แค้นและกอบกู้สำนัก',
      appearanceAnchor: 'handsome young Chinese cultivation swordsman, long silver-white hair tied with jade hairpin, flowing black silk robe with gold embroidery, glowing amber eyes, carrying cyan divine sword, Unreal Engine 5 Donghua 3D 8k',
      voiceStyle: 'ทุ้ม นิ่ง สุขุม แฝงพลังความมุ่งมั่นสะท้านฟ้า',
      googleFlowSeed: '741258',
    },
    {
      id: `char-cn-${Date.now()}-2`,
      name: 'ไป๋หลิงเอ๋อร์ (หมอยาหญิงเทวะ / ศิษย์น้องคู่ใจ)',
      role: 'supporting',
      age: '18 ปี',
      bodyBuild: 'ดรุณีแรกรุ่น รูปร่างบอบบาง ท่วงท่าดั่งดอกบัวตูมกลางสายลม',
      facialFeatures: 'ใบหน้ารูปไข่ ผิวขาวดั่งหิมะ แววตาสีมรกตสดใส อ่อนโยนแต่เด็ดเดี่ยว',
      hairStyle: 'ผมยาวดำขลับเกล้ามวยผีเสื้อคู่ ประดับกระดิ่งเงินส่งเสียงกังวาน',
      clothingStyle: 'ชุดผ้าไหมแพรพรรณสีขาวบริสุทธิ์ ชายกระโปรงไล่เฉดสีฟ้าคราม สร้อยหยกวิญญาณ',
      colorTheme: 'สีขาวพิสุทธิ์-ฟ้าคราม-เขียวหยก',
      weaponsOrProps: 'พัดขนนกกระเรียนสวรรค์ / เข็มเงินโอสถทิพย์เก้าชีพจร',
      personality: 'จิตใจดี มีเมตตา ฉลาดหลักแหลม คอยเตือนสติเซียวเฉิน',
      abilities: 'วิชาแพทย์เซียนรักษาบาดแผลในพริบตา ค่ายกลวารีสะกดปราณมาร',
      weaknesses: 'พลังต่อสู้ทำลายล้างโดยตรงต่ำ',
      relationships: 'ทายาทตระกูลแพทย์โบราณ ผู้ช่วยชีวิตเซียวเฉินไว้ที่ก้นเหว',
      appearanceAnchor: 'beautiful Chinese fairy maiden, white and cyan silk dress, delicate jade ornaments, emerald eyes, gentle smile, floating jade particles, 3D Donghua 8k render',
      voiceStyle: 'ไพเราะ นุ่มนวล ก้องกังวาน อ่อนหวานและอบอุ่น',
      googleFlowSeed: '831920',
    },
    {
      id: `char-cn-${Date.now()}-3`,
      name: 'อู่จิง (ศิษย์พี่ใหญ่ / จอมกระบี่หนัก)',
      role: 'supporting',
      age: '25 ปี',
      bodyBuild: 'ร่างสูงใหญ่กำยำ บึกบึน แผ่นหลังกว้างดั่งกำแพงเหล็ก',
      facialFeatures: 'ใบหน้าคมเข้ม คิ้วหนา มีรอยแผลเป็นเหนือคิ้ว แววตาซื่อตรง',
      hairStyle: 'ผมยาวสีดำมัดรวบหางม้าต่ำ ผูกด้วยสายรัดสีแดงเลือดหมู',
      clothingStyle: 'ชุดคลุมผ้าเนื้อหยาบสีเทา คล้องสายสะพายกระบี่เหล็กยักษ์ไร้คม',
      colorTheme: 'สีเทาหินผา-แดงเลือดหมู-ดำ',
      weaponsOrProps: 'กระบี่เหล็กนิลกาฬยักษ์ไร้คม หนัก 5,000 ชั่ง',
      personality: 'ซื่อสัตย์ พูดน้อย รักษาคำพูด ยอมสละชีวิตปกป้องศิษย์น้อง',
      abilities: 'ปราณกายทองคำระฆังครอบ ฟันแทงไม่เข้า เพลงกระบี่ทุบผาพสุธาถล่ม',
      weaknesses: 'ความคล่องตัวต่ำกว่าสายกระบี่เบา',
      relationships: 'ศิษย์พี่ใหญ่ผู้คอยรับแรงปะทะแทนเซียวเฉินในทุกสมรภูมิ',
      appearanceAnchor: 'muscular Chinese warrior monk, wielding colossal blunt iron greatsword, grey daoist warrior robe, disciplined stoic expression, 3D Donghua 8k',
      voiceStyle: 'ทุ้มต่ำ หนักแน่น จริงใจ น่าเชื่อถือ',
      googleFlowSeed: '942031',
    },
    {
      id: `char-cn-${Date.now()}-4`,
      name: 'มู่หรงเยว่ (เสนาธิการค่ายกล / ผู้ใช้พัดหยก)',
      role: 'supporting',
      age: '21 ปี',
      bodyBuild: 'สูงโปร่ง สง่างาม ท่าทางดั่งบัณฑิตผู้รู้แจ้ง',
      facialFeatures: 'ใบหน้าเรียวคม แววตาสีครามเป็นประกายฉลาดลึกซึ้ง',
      hairStyle: 'ผมยาวสลวยสีดำขลับ สวมหมวกกวนหยกขาว',
      clothingStyle: 'ชุดคลุมบัณฑิตผ้าไหมสีเขียวมรกตปักลวดลายแปดทิศ',
      colorTheme: 'สีเขียวมรกต-ขาวมุก-ทอง',
      weaponsOrProps: 'พัดกระดูกมังกรหยกแปดทิศ / ธงค่ายกลเก้าดวงดาว',
      personality: 'เจ้าสำราญ ยิ้มแย้มตลอดเวลา แต่การคำนวณค่ายกลแม่นยำไร้ที่ติ',
      abilities: 'กางค่ายกลสะท้อนการโจมตี, พรางตาบิดเบือนมิติ, คำนวณชะตาฟ้าดิน',
      weaknesses: 'ไม่ชอบการต่อสู้ตะลุมบอนระยะประชิด',
      relationships: 'สหายนักพรตผู้ชี้แนะแผนการบุกทลายสำนักทรยศ',
      appearanceAnchor: 'elegant Chinese scholar strategist, emerald silk robe, jade folding fan, calm cunning smile, floating golden talisman scripts, 3D Donghua 8k',
      voiceStyle: 'นุ่มนวล ฉลาด มีเสน่ห์ แฝงความมั่นใจ',
      googleFlowSeed: '153142',
    },
    {
      id: `char-cn-${Date.now()}-5`,
      name: 'จ้าวอสูรโลหิต (จอมมารบรรพกาล / ศัตรูคู่อาฆาต)',
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
      id: `char-cn-${Date.now()}-6`,
      name: 'แม่ทัพกระดูกมาร (มือขวาฝ่ายมาร / ผู้คุมกองทัพผีดิบ)',
      role: 'antagonist',
      age: '300 ปี',
      bodyBuild: 'ผอมสูง แห้งเกร็ง ดั่งซากศพเดินได้ สวมเกราะกระดูกขาว',
      facialFeatures: 'ใบหน้าดั่งกะโหลก แววตาสีเขียวมรกตวิญญาณ ยิ้มแสยะน่าสะพรึง',
      hairStyle: 'ผมยาวหงอกขาวกระเซอะกระเซิง',
      clothingStyle: 'ชุดเกราะกระดูกสัตว์อสูรสีขาวหม่น คลุมผ้าขาดสีดำ',
      colorTheme: 'สีขาวกระดูก-เขียววิญญาณ-ดำ',
      weaponsOrProps: 'ดาบกระดูกสันหลังมังกรมาร / โซ่ดวงวิญญาณแค้น',
      personality: 'โหดร้าย ชื่นชอบการสะสมกะโหลกศีรษะของยอดฝีมือ',
      abilities: 'เรียกกองทัพผีดิบล้านร่าง, ปราณพิษเน่าเปื่อยทำลายเนื้อเยื่อ',
      weaknesses: 'แพ้เปลวเพลิงบริสุทธิ์และอาคมแสงอาทิตย์',
      relationships: 'แม่ทัพแนวหน้าของจ้าวอสูรโลหิต ผู้คอยสกัดกั้นเซียวเฉิน',
      appearanceAnchor: 'creepy Chinese bone general, white bone armor, glowing green soul eyes, necrotic demonic aura, carrying spine sword, 3D Donghua 8k',
      voiceStyle: 'แหบพร่า สั่นสะท้าน ชวนขนหัวลุก',
      googleFlowSeed: '264253',
    },
    {
      id: `char-cn-${Date.now()}-7`,
      name: 'ผู้อาวุโสสวรรค์เต๋า (อาจารย์ผู้เร้นกาย / เทพกระบี่เฒ่า)',
      role: 'mentor',
      age: 'พันปี',
      bodyBuild: 'ผอมโปร่ง ทรงภูมิฐาน ลอยตัวเหยียบบนกระบี่ไม้ไผ่',
      facialFeatures: 'ใบหน้าเปี่ยมเมตตา เคราขาวยาว แววตาสดใสดั่งเด็กทารก',
      hairStyle: 'ผมขาวมัดมวยด้วยกิ่งท้อสวรรค์',
      clothingStyle: 'ชุดผ้าป่านเก่าๆ สีครามมอซอ แต่สะอาดสะอ้านไร้ฝุ่นละออง',
      colorTheme: 'สีครามคราม-ขาวหม่น-ทองแสงธรรม',
      weaponsOrProps: 'กระบี่ไม้ไผ่หยกโบราณ / น้ำเต้าสุราสวรรค์',
      personality: 'ชอบดื่มสุรา พูดจาแฝงปริศนาธรรม ชี้นำทางให้คนรุ่นหลัง',
      abilities: 'เพลงกระบี่ไร้ลักษณ์ หนึ่งกระบี่ตัดผ่าแม่น้ำและภูผา, ถ่ายทอดตบะเซียน',
      weaknesses: 'ละวางทางโลก ไม่ลงมือสังหารผู้ใดโดยตรง',
      relationships: 'อาจารย์ผู้ดึงเซียวเฉินขึ้นมาจากหุบเหวและถ่ายทอดวิชากระบี่โบราณให้',
      appearanceAnchor: 'wise ancient Chinese daoist master, long flowing white beard, drinking from gourd, holding bamboo sword, stepping on clouds, 3D Donghua 8k',
      voiceStyle: 'กังวาน นุ่มลึก เปี่ยมเมตตา แฝงความรู้แจ้ง',
      googleFlowSeed: '375364',
    },
    {
      id: `char-cn-${Date.now()}-8`,
      name: 'จิ้งจอกเก้าหาง เสี่ยวไป๋ (สัตว์อสูรพิทักษ์ / จิ้งจอกหิมะ)',
      role: 'supporting',
      age: 'สองร้อยปี',
      bodyBuild: 'จิ้งจอกหิมะตัวขาวปุกปุย 9 หาง แปลงกายเป็นดรุณีน้อยหูจิ้งจอกได้',
      facialFeatures: 'ดวงตากลมโตสีทับทิม น่ารักแสนซน',
      hairStyle: 'ขนสีขาวบริสุทธิ์นุ่มสลวย ปลายหางแต้มสีชมพู',
      clothingStyle: 'สวมกระดิ่งทองผูกโบแดงที่คอ',
      colorTheme: 'สีขาวหิมะ-แดงชาด-ทอง',
      weaponsOrProps: 'ลูกแก้วเพลิงจิ้งจอกเก้าหาง / เล็บเพลิงมาร',
      personality: 'ขี้อ้อน ซุกซน จงรักภักดีต่อเซียวเฉินมาก หวงเจ้าของ',
      abilities: 'พ่นเพลิงจิ้งจอกสะกดมาร, มิติมายาช่วยหลบหนี, ตรวจจับศัตรูในระยะ 10 ลี้',
      weaknesses: 'ชอบกินปลาแห้งและเนื้อย่าง โดนล่อง่าย',
      relationships: 'สัตว์อสูรคู่บารมีที่คอยนอนซุกข้างกายเซียวเฉิน',
      appearanceAnchor: 'adorable nine-tailed snow fox beast, glowing red ruby eyes, fluffy white fur, small golden bell, magical spirit fire, 3D Donghua 8k',
      voiceStyle: 'เสียงใส ร้องแง้วๆ น่ารัก แต่คำรามก้องยามปกป้องนาย',
      googleFlowSeed: '486475',
    },
  ];

  return cnRoster.slice(0, count);
}
