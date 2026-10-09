import { getGeminiApiKey } from "./cineprompt-engine";
import { TenBeatItem, ScriptScene, PropItem, LocationItem } from "./types";

/**
 * Call Google Gemini Flash API directly with user's key or fallback
 */
export async function callGeminiApi(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = getGeminiApiKey() || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("กรุณาระบุ Gemini API Key ในปุ่มตั้งค่า (⚙️ API Key) เพื่อใช้งาน AI อัจฉริยะ");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body: any = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error: ${res.statusText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}

/**
 * Generate AI Plot Ideas
 */
export async function generateAiPlotIdeas(topic: string, genre: string): Promise<{ title: string; synopsis: string; visualStyle: string }> {
  const prompt = `
ในฐานะผู้กำกับภาพยนตร์ระดับโลกและนักเขียนบท AI มืออาชีพ ช่วยคิดพล็อตเรื่องหนังความยาว 1 ชั่วโมง สำหรับผลิตวิดีโอ AI (เช่น Kling, Runway, Midjourney)
หัวข้อที่ต้องการ: "${topic}"
แนวภาพยนตร์: "${genre}"

กรุณาตอบเป็น JSON ในรูปแบบนี้เท่านั้น (ห้ามใส่ Markdown อื่นนอกเหนือจาก JSON):
{
  "title": "ชื่อเรื่องภาษาไทยที่น่าดึงดูด (ชื่อภาษาอังกฤษ)",
  "synopsis": "เรื่องย่อ 3-4 ย่อหน้า อธิบายจุดเริ่มต้น ปมความขัดแย้ง จุดวิกฤต และการคลี่คลาย",
  "visualStyle": "คำอธิบาย Mood & Tone แสง สี กล้อง และสไตล์ภาพยนตร์ระดับสูง"
}
`;

  const raw = await callGeminiApi(prompt, "You are an elite cinema screenwriter and prompt engineer. Respond only with valid JSON.");
  try {
    const cleanJson = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    return {
      title: `${topic} (${genre})`,
      synopsis: raw,
      visualStyle: "Photorealistic Cinematic 8K, Volumetric Lighting, Masterpiece film color grading",
    };
  }
}

/**
 * Generate 10-Beat Story Outline using AI
 */
export async function generate10BeatsWithAi(title: string, synopsis: string): Promise<TenBeatItem[]> {
  const prompt = `
ช่วยวางโครงเรื่อง 10 บีท (10 ช่วงเวลา) สำหรับภาพยนตร์เรื่อง "${title}"
เรื่องย่อ: "${synopsis}"
โดยต้องแบ่งเป็น 10 ตอนต่อเนื่องกัน สำหรับภาพยนตร์ความยาวรวม 3,000 วินาที (ประมาณ 50 นาที รวม 308 ฉาก ฉากละ 10 วินาที):

ตอบเป็น JSON array 10 รายการเท่านั้น:
[
  {
    "beatNumber": 1,
    "title": "1. ชื่อช่วง",
    "timeRange": "0:00 - 5:00 น. (ฉาก 1-31)",
    "goal": "เป้าหมายและเหตุการณ์สำคัญที่เกิดขึ้นในบีทนี้",
    "scenesCount": 31
  },
  ...
]
`;

  const raw = await callGeminiApi(prompt, "You are a professional film structure consultant. Return only valid JSON array.");
  try {
    const cleanJson = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    throw new Error("ไม่สามารถแปลงข้อมูล 10 บีทจาก AI ได้ กรุณาลองใหม่อีกครั้ง");
  }
}
