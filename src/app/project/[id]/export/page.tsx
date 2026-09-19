'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, ScriptScene } from '@/lib/types';
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  FileText,
  Subtitles,
  Table,
  Youtube,
  Sparkles,
} from 'lucide-react';

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'script' | 'srt' | 'prompts' | 'youtube'>('script');

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.project) {
          setProject(data.project);
        } else {
          router.push('/');
        }
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [projectId, router]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        กำลังจัดเตรียมข้อมูลส่งออก...
      </div>
    );
  }

  // 1. Generate Full Script Text
  const generateScriptText = () => {
    let out = `# ${project.title}\n`;
    out += `หมวดหมู่: ${project.genre} | สไตล์: ${project.visualMedium === 'live_action' ? 'คนจริง' : 'การ์ตูน/อนิเมะ 3D'}\n`;
    out += `เรื่องย่อ: ${project.synopsis}\n`;
    out += `---------------------------------------------------\n\n`;

    project.scenes.forEach((s) => {
      out += `=== ฉากที่ ${s.sceneNumber}: ${s.title} (องค์ที่ ${s.actNumber}) ===\n`;
      out += `คิวเสียง: ${s.sfxBgm}\n\n`;
      out += `[เสียงบรรยาย / พากย์]:\n${s.narration}\n\n`;

      if (s.dialogues.length > 0) {
        out += `[บทสนทนา]:\n`;
        s.dialogues.forEach((d) => {
          out += `- ${d.speaker} (${d.emotion}): "${d.text}"\n`;
        });
        out += `\n`;
      }
      out += `---------------------------------------------------\n\n`;
    });

    return out;
  };

  // 2. Generate SRT Subtitles
  const generateSrt = () => {
    let srt = '';
    let currentSeconds = 0;

    project.scenes.forEach((s, idx) => {
      const duration = s.estimatedDurationSec || 30;
      const start = formatSrtTime(currentSeconds);
      const end = formatSrtTime(currentSeconds + duration);

      srt += `${idx + 1}\n`;
      srt += `${start} --> ${end}\n`;
      srt += `${s.narration}\n\n`;

      currentSeconds += duration;
    });

    return srt;
  };

  function formatSrtTime(totalSec: number) {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = Math.floor(totalSec % 60);
    const ms = 0;
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
  }

  function pad(num: number, size = 2) {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }

  // 3. Generate Prompts CSV
  const generatePromptsCsv = () => {
    let csv = 'SceneNumber,Title,VisualMedium,StylePreset,Camera,Lighting,ImagePrompt,VideoMotionPrompt\n';
    project.scenes.forEach((s) => {
      const esc = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
      csv += `${s.sceneNumber},${esc(s.title)},${esc(s.visualMedium)},${esc(s.stylePreset)},${esc(
        s.cameraMovement
      )},${esc(s.lighting)},${esc(s.imagePrompt)},${esc(s.videoMotionPrompt)}\n`;
    });
    return csv;
  };

  // 4. Generate YouTube SEO & Chapters
  const generateYouTubeSEO = () => {
    let chapters = '';
    let currSec = 0;

    chapters += `00:00 - บทนำ: จุดเริ่มต้นแห่งชะตากรรม\n`;
    project.scenes.forEach((s) => {
      const mins = Math.floor(currSec / 60);
      const secs = currSec % 60;
      chapters += `${pad(mins)}:${pad(secs)} - ${s.title}\n`;
      currSec += s.estimatedDurationSec || 30;
    });

    return `🔥 ${project.title} (คลิปเต็มความยาวระดับชั่วโมง)

เรื่องย่อ:
${project.synopsis}

📌 ช่วงเวลาสำคัญในคลิป (Chapters):
${chapters}

🎬 ผลิตด้วยระบบ AI Video Studio (สไตล์อนิเมะจีน 3D & ภาพยนตร์)
กดติดตามและกระดิ่งเพื่อไม่พลาดมหากาพย์ตอนต่อไป!

#อนิเมะจีน #เพื่อนที่ดีที่สุด #บำเพ็ญเพียร #สปอยล์อนิเมะ #อนิเมะ3D #สัประยุทธ์ทะลุฟ้า #กำลังภายใน #หนังสั้นAI`;
  };

  const scriptText = generateScriptText();
  const srtText = generateSrt();
  const csvText = generatePromptsCsv();
  const youtubeText = generateYouTubeSEO();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-studio-800">
        <div className="flex items-center gap-3">
          <Link
            href={`/project/${projectId}`}
            className="p-2 rounded-xl bg-studio-900 border border-studio-700 text-gray-400 hover:text-white hover:bg-studio-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" />
              <span>ศูนย์ส่งออกผลงาน (Export Hub): {project.title}</span>
            </h1>
            <p className="text-xs text-gray-400">
              ดาวน์โหลดสคริปต์พากย์เสียง, ซับไตเติล SRT, พร้อมต์ภาพ Batch และแคปชัน YouTube
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-studio-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('script')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'script'
              ? 'bg-amber-500 text-black shadow-glow'
              : 'text-gray-400 hover:text-white bg-studio-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>สคริปต์บทพากย์เต็ม (.TXT)</span>
        </button>

        <button
          onClick={() => setActiveTab('srt')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'srt'
              ? 'bg-cyan-400 text-black shadow-cyanGlow'
              : 'text-gray-400 hover:text-white bg-studio-900'
          }`}
        >
          <Subtitles className="w-4 h-4" />
          <span>ซับไตเติล YouTube (.SRT)</span>
        </button>

        <button
          onClick={() => setActiveTab('prompts')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'prompts'
              ? 'bg-purple-500 text-white shadow-purpleGlow'
              : 'text-gray-400 hover:text-white bg-studio-900'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>ตารางพร้อมต์ภาพ &amp; วิดีโอ (.CSV)</span>
        </button>

        <button
          onClick={() => setActiveTab('youtube')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'youtube'
              ? 'bg-red-500 text-white'
              : 'text-gray-400 hover:text-white bg-studio-900'
          }`}
        >
          <Youtube className="w-4 h-4" />
          <span>SEO &amp; แคปชัน YouTube (พร้อม Timestamps)</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="rounded-2xl bg-studio-900 border border-studio-800 p-6 space-y-4">
        {/* Tab 1: Full Script */}
        {activeTab === 'script' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                สคริปต์พร้อมระบุบทบรรยาย, บทสนทนาตัวละคร (Speaker/Emotion), และคิวเสียง SFX/BGM
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(scriptText, 'script')}
                  className="px-3 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-700 text-gray-200 text-xs flex items-center gap-1.5"
                >
                  {copiedType === 'script' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกสคริปต์</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => downloadFile(scriptText, `${project.title}-script.txt`, 'text/plain')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด .TXT</span>
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={18}
              value={scriptText}
              className="w-full p-4 rounded-xl bg-studio-950 border border-studio-800 text-gray-200 text-xs font-mono leading-relaxed focus:outline-none"
            />
          </div>
        )}

        {/* Tab 2: SRT */}
        {activeTab === 'srt' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                ไฟล์ Subtitles คำบรรยายไทยตรงตามไทม์โค้ด สามารถอัปโหลดเข้า YouTube Studio ได้ทันที
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(srtText, 'srt')}
                  className="px-3 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-700 text-gray-200 text-xs flex items-center gap-1.5"
                >
                  {copiedType === 'srt' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก SRT</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => downloadFile(srtText, `${project.title}-subtitles.srt`, 'text/plain')}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด .SRT</span>
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={18}
              value={srtText}
              className="w-full p-4 rounded-xl bg-studio-950 border border-studio-800 text-gray-200 text-xs font-mono leading-relaxed focus:outline-none"
            />
          </div>
        )}

        {/* Tab 3: Prompts CSV */}
        {activeTab === 'prompts' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                พร้อมต์ภาพนิ่ง (Midjourney/Flux) และพร้อมต์วิดีโอต่อเนื่อง (Kling/Runway) สำหรับ Batch Generation
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(csvText, 'csv')}
                  className="px-3 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-700 text-gray-200 text-xs flex items-center gap-1.5"
                >
                  {copiedType === 'csv' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก CSV</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => downloadFile(csvText, `${project.title}-prompts.csv`, 'text/csv')}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด .CSV</span>
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={18}
              value={csvText}
              className="w-full p-4 rounded-xl bg-studio-950 border border-studio-800 text-gray-200 text-xs font-mono leading-relaxed focus:outline-none"
            />
          </div>
        )}

        {/* Tab 4: YouTube SEO & Chapters */}
        {activeTab === 'youtube' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                คำอธิบายคลิป YouTube, แฮชแท็กติดเทรนด์, และไทม์สแตมป์ Chapters สำหรับวิดีโอยาว
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(youtubeText, 'youtube')}
                  className="px-3.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  {copiedType === 'youtube' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกข้อความทั้งหมด</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={18}
              value={youtubeText}
              className="w-full p-4 rounded-xl bg-studio-950 border border-studio-800 text-gray-200 text-xs font-mono leading-relaxed focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
