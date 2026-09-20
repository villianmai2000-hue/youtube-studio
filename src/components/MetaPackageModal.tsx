'use client';

import React, { useState } from 'react';
import { Project, ScriptScene } from '@/lib/types';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  X,
  Film,
  Mic,
  Lightbulb,
  Hash,
  Clock,
  Video,
  Music,
  Volume2,
  Camera,
  Layers,
  ChevronRight,
  Tv,
} from 'lucide-react';

interface MetaPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  selectedSceneIds?: string[];
}

export default function MetaPackageModal({
  isOpen,
  onClose,
  project,
  selectedSceneIds = [],
}: MetaPackageModalProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'voiceover' | 'recommendations' | 'captions'>('timeline');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  // Filter scenes if user selected specific ones, otherwise all scenes
  const targetScenes =
    selectedSceneIds.length > 0
      ? project.scenes.filter((s) => selectedSceneIds.includes(s.id))
      : project.scenes;

  const totalDurationSec = targetScenes.length * 10;
  const totalMinutes = Math.floor(totalDurationSec / 60);
  const totalSecRemainder = totalDurationSec % 60;
  const durationStr = `${totalMinutes > 0 ? `${totalMinutes} นาที ` : ''}${totalSecRemainder} วินาที`;

  // Helper to remove any lingering seed tags
  const sanitizePrompt = (text: string) => {
    return (text || '')
      .replace(/\[Google Flow Seed Lock:[^\]]*\]\s*/gi, '')
      .replace(/Seed Lock:[^\n]*\n?/gi, '')
      .replace(/\(Seed:[^\)]*\)/gi, '')
      .replace(/--seed\s+\d+/gi, '')
      .trim();
  };

  // Helper to parse BGM and SFX from sfxBgm string
  const parseAudioLayers = (sfxBgm: string) => {
    let bgm = '';
    let sfx = '';

    const bgmMatch = sfxBgm.match(/\[(?:BGM|ดนตรี):\s*([^\]]+)\]/i);
    const sfxMatch = sfxBgm.match(/\[(?:SFX|เอฟเฟกต์เสียง):\s*([^\]]+)\]/i);

    if (bgmMatch) {
      bgm = bgmMatch[1].trim();
    }
    if (sfxMatch) {
      sfx = sfxMatch[1].trim();
    }

    // If neither matched brackets, treat entire text
    if (!bgm && !sfx) {
      bgm = sfxBgm || 'ดนตรีออร์เคสตราสไตล์อนิเมะจีน 3D เร้าอารมณ์';
      sfx = 'เสียงบรรยากาศและเอฟเฟกต์ฟันกระบี่';
    }

    return { bgm, sfx };
  };

  // Generate the full master package text
  const generateFullPackageText = () => {
    let output = `🚀 รวมทุกอย่างสำหรับสร้างคลิปใน Meta / Facebook Reels เบ็ดเสร็จ\n`;
    output += `==========================================================\n`;
    output += `📌 ชื่อเรื่อง / แคปชันวิดีโอ: ${project.title}\n`;
    output += `📐 สัดส่วน: ${project.aspectRatio || '16:9'} (Reels / Shorts) | ความยาว: ~${totalDurationSec} วินาที (${targetScenes.length} ฉาก @ 10 วิ/ฉาก)\n`;
    output += `🤖 AI Engine: ${project.scriptEngine || 'gemini_3_1_pro'} | โหมด: ${project.visualMedium === 'live_action' ? 'ภาพยนตร์คนจริง (Live-Action)' : 'อนิเมะ 3D'}\n`;
    output += `🎥 สไตล์กล้อง: Seedream 5.0 Pro (Anamorphic 35mm f/2.0 ไหลต่อเนื่อง 10 วิ/ฉาก ไร้รอยต่อ)\n\n`;

    output += `📖 [1. บทบรรยายสำหรับลงเสียงพากย์ / Voiceover (แบ่งฉากละ 10 วินาที / พากย์รวดเดียวจบ)]:\n`;
    output += `----------------------------------------------------------\n`;
    targetScenes.forEach((s, idx) => {
      const startSec = idx * 10;
      const endSec = (idx + 1) * 10;
      const startMinStr = `${Math.floor(startSec / 60)}:${String(startSec % 60).padStart(2, '0')}`;
      const endMinStr = `${Math.floor(endSec / 60)}:${String(endSec % 60).padStart(2, '0')}`;
      output += `⏱️ [ฉากที่ ${s.sceneNumber} (${startMinStr} - ${endMinStr})]:\n${s.narration.trim()}\n\n`;
    });

    output += `🎬 [2. ไทม์ไลน์แจกแจงทีละฉาก (มุมกล้อง Seedream 5.0 Pro + บทพูด + BGM/SFX + พร้อมต์วิดีโอ)]:\n`;
    output += `----------------------------------------------------------\n`;
    targetScenes.forEach((s, idx) => {
      const startSec = idx * 10;
      const endSec = (idx + 1) * 10;
      const startMinStr = `${Math.floor(startSec / 60)}:${String(startSec % 60).padStart(2, '0')}`;
      const endMinStr = `${Math.floor(endSec / 60)}:${String(endSec % 60).padStart(2, '0')}`;
      const { bgm, sfx } = parseAudioLayers(s.sfxBgm);

      output += `[ฉากที่ ${s.sceneNumber}] (${startMinStr} - ${endMinStr}) : ${s.title}\n`;
      output += `🎙️ เสียงพากย์: ${s.narration}\n`;
      if (s.dialogues && s.dialogues.length > 0) {
        output += `💬 บทพูดตัวละคร:\n`;
        s.dialogues.forEach((d) => {
          output += `   • ${d.speaker} (${d.emotion}): "${d.text}"\n`;
        });
      }
      output += `🎥 มุมกล้อง: ${s.cameraMovement}\n`;
      output += `💡 แสงเงา: ${s.lighting}\n`;
      output += `🎼 ดนตรีประกอบ (BGM): ${bgm}\n`;
      output += `🔊 เอฟเฟกต์เสียง (SFX): ${sfx}\n`;
      output += `📹 พร้อมต์เจนวิดีโอ AI (Kling/Runway/Haiper/Luma): ${sanitizePrompt(s.videoMotionPrompt)}\n`;
      output += `🌊 flow.google.com: ${sanitizePrompt(s.googleFlowPrompt || s.imagePrompt)}\n`;
      output += `\n`;
    });

    output += `💡 [3. เช็กลิสต์คำแนะนำการผลิตระดับโปร เพื่อให้การสร้างอนิเมะ/หนังสมบูรณ์ครบเครื่อง]:\n`;
    output += `----------------------------------------------------------\n`;
    output += `1. 🎙️ เสียงพากย์ AI (Thai Voice Synthesis): แนะนำใช้ ElevenLabs (Multilingual v2) หรือ Fish Audio ปรับความเร็ว 1.05x-1.1x เพื่อให้จังหวะกระชับพอดี 10 วิ/ฉาก และใส่คีย์เวิร์ดอารมณ์ [anger/fierce/calm]\n`;
    output += `2. 🎬 เทคนิคต่อช็อตไหลลื่นไม่ตัด (Continuous Stitching - Seedream 5.0 Pro): ใน Kling 1.5 หรือ Runway Gen-3 ให้ใช้ฟีเจอร์ "End Frame as Start Frame" นำเฟรมสุดท้ายของฉากที่ 1 ไปเป็นเฟรมเริ่มต้นของฉากที่ 2 จะได้วิดีโอแบบ Single Take ไหลลื่น 100%\n`;
    output += `3. 🎼 การมิกซ์เสียง BGM & SFX (CapCut / Premiere): วางดนตรีกู่เจิ้ง/ออร์เคสตราไว้ระดับ -16dB ถึง -18dB และเปิด Ducking หลบเสียงพากย์ที่ -3dB พร้อมใส่เสียง Sub-bass Drop (Braam) ในวินาทีที่ตัวเอกระเบิดพลัง\n`;
    output += `4. 🎨 คัลเลอร์เกรดดิ้ง (Color Grading): ใส่โทนสีสไตล์ Donghua Cinematic (Teal & Orange / Cyan Gold Glow) ดึงความเปรียบต่างแสงจันทร์และพลังปราณให้มีมิติสูงสุด\n`;
    output += `5. 🚫 Negative Prompt ป้องกันภาพเพี้ยน: ห้ามคนจริง (สำหรับโหมด 3D), ภาพไม่เบลอ, นิ้วมือไม่เกิน, ไม่มีตัวหนังสือหรือลายน้ำ\n\n`;

    output += `🏷️ [4. แฮชแท็กสำหรับโพสต์ลง Meta Reels / TikTok / CapCut]:\n`;
    if (project.genre === 'military_tactical') {
      output += `#Reels #ทหาร #ยุทธการทหาร #ขีปนาวุธ #กองทัพ #แสนยานุภาพ #อาวุธสงคราม #เทคโนโลยีทหาร #MilitaryReels #Shorts\n`;
    } else if (project.genre === 'xianxia_cultivation') {
      output += `#Reels #อนิเมะจีน3D #กำลังภายใน #เซียนกระบี่ #Donghua #SAN1 #อนิเมะ #Shorts #ซีรีส์จีน #Seedream #คลิปสั้น\n`;
    } else {
      output += `#Reels #ภาพยนตร์AI #หนังไซไฟ #วิดีโอสั้น #Shorts #MetaReels #AIAnimation\n`;
    }

    return output;
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadTxt = () => {
    const text = generateFullPackageText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ชุดสร้างคลิป_Meta_Reels_${project.title.replace(/[\\/:*?"<>|]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-studio-950 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-studio-800 bg-gradient-to-r from-studio-900 via-studio-950 to-studio-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                  🚀 รวมทุกอย่างสำหรับสร้างคลิปใน Meta / Facebook Reels เบ็ดเสร็จ
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs">
                  Seedream 5.0 Pro (10s ไหลลื่น)
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>📌 {project.title}</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ความยาวรวม ~{durationStr} ({targetScenes.length} ฉาก @ 10 วิ/ฉาก)
                </span>
                <span>•</span>
                <span className="text-cyan-400">
                  {project.visualMedium === 'live_action' ? 'ภาพยนตร์คนจริง' : 'อนิเมะจีน 3D'} ({project.aspectRatio || '16:9'})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyText(generateFullPackageText(), 'all')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
            >
              {copiedType === 'all' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>คัดลอกทั้งหมดแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>คัดลอกทั้งหมด</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="px-3 py-2 rounded-xl bg-studio-900 hover:bg-studio-800 border border-studio-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="ดาวน์โหลดเป็นไฟล์บท .txt"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">โหลด .txt</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-studio-900 hover:bg-studio-800 text-gray-400 hover:text-white border border-studio-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 py-2.5 bg-studio-900/60 border-b border-studio-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'bg-studio-950 text-gray-400 hover:text-gray-200 border border-studio-800'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>1. ไทม์ไลน์ภาพยนตร์ 10s (Seedream 5.0 Pro)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voiceover')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'voiceover'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'bg-studio-950 text-gray-400 hover:text-gray-200 border border-studio-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>2. บทบรรยายเสียงพากย์รวดเดียว (Voiceover 10s)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'recommendations'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-studio-950 text-gray-400 hover:text-gray-200 border border-studio-800'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>3. คำแนะนำระดับโปร ให้หนัง/อนิเมะสมบูรณ์ครบเครื่อง</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('captions')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'captions'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'bg-studio-950 text-gray-400 hover:text-gray-200 border border-studio-800'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>4. แคปชัน &amp; แฮชแท็กไวรัล Reels / Shorts</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: TIMELINE (10s Continuous Single-Take Flow) */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
                <Camera className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-cyan-100 leading-relaxed">
                  <span className="font-bold text-cyan-300">
                    🎬 มาตรฐานมุมกล้อง Seedream 5.0 Pro (10 วินาที/ฉาก ไหลต่อเนื่องไม่ตัด):
                  </span>{' '}
                  ออกแบบการเคลื่อนไหวของกล้องแบบ Single Take ไหลลื่นจากฉากที่ 1 ไปสู่ฉากถัดไปอย่างไร้รอยต่อ
                  พร้อมแจกแจงบทพูดตัวละคร, แยกเลเยอร์ BGM และ SFX ชัดเจน, และคำสั่งวิดีโอ AI ที่คลีน 100% ไม่มี Seed Lock
                </div>
              </div>

              <div className="space-y-5">
                {targetScenes.map((scene, idx) => {
                  const startSec = idx * 10;
                  const endSec = (idx + 1) * 10;
                  const startMinStr = `${Math.floor(startSec / 60)}:${String(startSec % 60).padStart(2, '0')}`;
                  const endMinStr = `${Math.floor(endSec / 60)}:${String(endSec % 60).padStart(2, '0')}`;
                  const { bgm, sfx } = parseAudioLayers(scene.sfxBgm);

                  return (
                    <div
                      key={scene.id}
                      className="p-5 rounded-2xl bg-studio-900/90 border border-studio-800 hover:border-cyan-500/40 transition-all space-y-4 shadow-sm"
                    >
                      {/* Scene Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-studio-800/80">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-extrabold text-xs flex items-center justify-center border border-cyan-400/30">
                            {scene.sceneNumber}
                          </span>
                          <h3 className="font-bold text-white text-sm sm:text-base">
                            ฉากที่ {scene.sceneNumber}: {scene.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-800 text-amber-400 font-mono font-bold text-xs flex items-center gap-1">
                            ⏱️ {startMinStr} - {endMinStr} (10 วิ)
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] hidden sm:inline-flex items-center gap-1">
                            🎬 Seedream 5.0 Pro
                          </span>
                        </div>
                      </div>

                      {/* Main Scene Details Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left: Narration & Dialogues (7 Cols) */}
                        <div className="lg:col-span-7 space-y-3">
                          {/* Voiceover Narration */}
                          <div className="p-3 rounded-xl bg-studio-950 border border-studio-800/90 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                                <Mic className="w-3.5 h-3.5" /> บทบรรยายเสียงพากย์ (0:00 - 0:10):
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(scene.narration, `narr-${scene.id}`)}
                                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                              >
                                {copiedType === `narr-${scene.id}` ? (
                                  <span className="text-emerald-400 font-bold">คัดลอกแล้ว</span>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>คัดลอกเสียงพากย์</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                              {scene.narration}
                            </p>
                          </div>

                          {/* Character Dialogues */}
                          <div className="p-3 rounded-xl bg-studio-950 border border-studio-800/90 space-y-2">
                            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                              <Tv className="w-3.5 h-3.5" /> บทสนทนาตัวละคร (Character Dialogues):
                            </span>
                            {scene.dialogues && scene.dialogues.length > 0 ? (
                              <div className="space-y-1.5">
                                {scene.dialogues.map((dlg, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className="p-2 rounded-lg bg-studio-900/80 border border-studio-800 flex items-start gap-2 text-xs"
                                  >
                                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold flex-shrink-0">
                                      {dlg.speaker}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-studio-800 text-gray-400 text-[10px] flex-shrink-0">
                                      [{dlg.emotion}]
                                    </span>
                                    <span className="text-white font-medium flex-1">
                                      &ldquo;{dlg.text}&rdquo;
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 italic">
                                (ฉากนี้เน้นบรรยากาศและเสียงบรรยาย ไม่มีบทพูดตัวละคร)
                              </p>
                            )}
                          </div>

                          {/* Audio Layers Separated (BGM + SFX) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {/* BGM */}
                            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                              <span className="font-bold text-purple-300 flex items-center gap-1">
                                <Music className="w-3.5 h-3.5 text-purple-400" /> ดนตรีประกอบ (BGM):
                              </span>
                              <p className="text-gray-300 text-[11px] leading-relaxed">
                                {bgm || 'ดนตรีกู่เจิ้งลึกลับระทึกใจ'}
                              </p>
                            </div>

                            {/* SFX */}
                            <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-1">
                              <span className="font-bold text-blue-300 flex items-center gap-1">
                                <Volume2 className="w-3.5 h-3.5 text-blue-400" /> เอฟเฟกต์เสียง (SFX):
                              </span>
                              <p className="text-gray-300 text-[11px] leading-relaxed">
                                {sfx || 'เสียงกระบี่ฟาดฟันและคลื่นพลังปราณ'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right: Camera & AI Video Prompts (5 Cols) */}
                        <div className="lg:col-span-5 space-y-3">
                          {/* Camera & Lighting */}
                          <div className="p-3 rounded-xl bg-studio-950 border border-studio-800/90 space-y-2 text-xs">
                            <div>
                              <span className="font-bold text-cyan-300 block mb-0.5 flex items-center gap-1">
                                <Camera className="w-3 h-3" /> มุมกล้อง Seedream 5.0 Pro:
                              </span>
                              <p className="text-gray-300 text-[11px] leading-relaxed">
                                {scene.cameraMovement}
                              </p>
                            </div>
                            <div className="pt-1.5 border-t border-studio-800/80">
                              <span className="font-bold text-amber-300 block mb-0.5">
                                💡 บรรยากาศแสง &amp; เงา:
                              </span>
                              <p className="text-gray-400 text-[11px] leading-relaxed">
                                {scene.lighting}
                              </p>
                            </div>
                          </div>

                          {/* Video AI Prompt */}
                          <div className="p-3 rounded-xl bg-studio-950 border border-studio-800/90 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-emerald-400 flex items-center gap-1">
                                <Video className="w-3.5 h-3.5" /> พร้อมต์วิดีโอ (Kling / Runway / Haiper):
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(sanitizePrompt(scene.videoMotionPrompt), `vid-${scene.id}`)}
                                className="px-2 py-0.5 rounded bg-studio-900 hover:bg-studio-800 text-gray-300 text-[10px] font-semibold border border-studio-700 flex items-center gap-1 transition-colors"
                              >
                                {copiedType === `vid-${scene.id}` ? (
                                  <span className="text-emerald-400">คัดลอกแล้ว</span>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>คัดลอก</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-relaxed font-mono line-clamp-3 select-all bg-studio-900/60 p-2 rounded-lg border border-studio-800">
                              {sanitizePrompt(scene.videoMotionPrompt)}
                            </p>
                          </div>

                          {/* Google Flow Prompt */}
                          <div className="p-3 rounded-xl bg-studio-950 border border-studio-800/90 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-cyan-400 flex items-center gap-1">
                                🌊 flow.google.com Prompt:
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(sanitizePrompt(scene.googleFlowPrompt || scene.imagePrompt), `flow-${scene.id}`)}
                                className="px-2 py-0.5 rounded bg-studio-900 hover:bg-studio-800 text-gray-300 text-[10px] font-semibold border border-studio-700 flex items-center gap-1 transition-colors"
                              >
                                {copiedType === `flow-${scene.id}` ? (
                                  <span className="text-emerald-400">คัดลอกแล้ว</span>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>คัดลอก Flow</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed font-mono line-clamp-2 select-all bg-studio-900/60 p-2 rounded-lg border border-studio-800">
                              {sanitizePrompt(scene.googleFlowPrompt || scene.imagePrompt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: VOICEOVER CONTINUOUS SCRIPT */}
          {activeTab === 'voiceover' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                <div className="text-xs text-amber-100 leading-relaxed">
                  <span className="font-bold text-amber-300 text-sm block mb-0.5">
                    🎙️ บทพากย์สำหรับลงเสียงรวดเดียว (Teleprompter Reader)
                  </span>
                  แบ่งไทม์มิ่งฉากละ 10 วินาทีพอดี สามารถนำข้อความนี้ไปวางใน ElevenLabs หรือ Fish Audio เพื่อพากย์ทีเดียวจบ!
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const voText = targetScenes
                      .map((s, idx) => {
                        const startSec = idx * 10;
                        const endSec = (idx + 1) * 10;
                        const startMinStr = `${Math.floor(startSec / 60)}:${String(startSec % 60).padStart(2, '0')}`;
                        const endMinStr = `${Math.floor(endSec / 60)}:${String(endSec % 60).padStart(2, '0')}`;
                        return `⏱️ [ฉากที่ ${s.sceneNumber} (${startMinStr} - ${endMinStr})]:\n${s.narration.trim()}`;
                      })
                      .join('\n\n');
                    handleCopyText(voText, 'vo-all');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                >
                  {copiedType === 'vo-all' ? (
                    <>
                      <Check className="w-4 h-4 text-black" />
                      <span>คัดลอกบทพากย์แล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>คัดลอกบทพากย์ทั้งหมด</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {targetScenes.map((scene, idx) => {
                  const startSec = idx * 10;
                  const endSec = (idx + 1) * 10;
                  const startMinStr = `${Math.floor(startSec / 60)}:${String(startSec % 60).padStart(2, '0')}`;
                  const endMinStr = `${Math.floor(endSec / 60)}:${String(endSec % 60).padStart(2, '0')}`;
                  const wordCount = scene.narration.trim().split(/\s+/).length;

                  return (
                    <div
                      key={scene.id}
                      className="p-4 sm:p-5 rounded-2xl bg-studio-900/80 border border-studio-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold">
                            ⏱️ ฉากที่ {scene.sceneNumber} ({startMinStr} - {endMinStr})
                          </span>
                          <span className="text-gray-400 hidden sm:inline">
                            ความเร็วแนะนำ: 1.05x (~{wordCount} คำ)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(scene.narration, `vo-${scene.id}`)}
                          className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px]"
                        >
                          {copiedType === `vo-${scene.id}` ? (
                            <span className="text-emerald-400 font-bold">คัดลอกแล้ว</span>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>คัดลอก</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-sm sm:text-base text-gray-100 leading-relaxed font-serif pl-2 border-l-2 border-amber-500/60">
                        {scene.narration}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PRO MASTER CHECKLIST & RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-studio-900 to-amber-950/40 border border-amber-500/40 flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5 animate-bounce" />
                <div className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                  <span className="font-extrabold text-amber-300 text-sm sm:text-base block mb-1">
                    💡 คำแนะนำการผลิตระดับโปร เพื่อให้อนิเมะหรือภาพยนตร์สมบูรณ์ครบเครื่อง (Pro Master Studio Guide)
                  </span>
                  นี่คือ 5 เสาหลักสำคัญที่ทีมผลิต Donghua 3D และภาพยนตร์สั้นระดับท็อปใช้จริง เพื่อให้คลิปได้ทั้งคุณภาพระดับโรงภาพยนตร์และยอดวิวไวรัลสูงสุดใน Facebook Reels / TikTok
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Voice Acting */}
                <div className="p-5 rounded-2xl bg-studio-900 border border-studio-800 space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                    <Mic className="w-5 h-5" />
                    <h4>1. 🎙️ เสียงพากย์ AI (Voice Acting &amp; Emotional Pacing)</h4>
                  </div>
                  <ul className="text-xs text-gray-300 space-y-2 leading-relaxed list-disc list-inside">
                    <li>
                      <strong className="text-white">เครื่องมือแนะนำ:</strong> ElevenLabs (โมเดล Multilingual v2) หรือ Fish Audio ให้คุณภาพน้ำเสียงภาษาไทยเป็นธรรมชาติที่สุด
                    </li>
                    <li>
                      <strong className="text-white">การปรับสปีด (Speed Tuning):</strong> ปรับความเร็ว 1.05x - 1.1x เพื่อให้ความยาวบทพากย์กระชับพอดี 10 วินาทีต่อฉาก ป้องกันเสียงล้นตัดขอบฉาก
                    </li>
                    <li>
                      <strong className="text-white">การใส่อารมณ์:</strong> เติมคีย์เวิร์ดกำกับอารมณ์เช่น [anger], [whisper], [calm], [fierce] เพื่อให้น้ำเสียงมีมิติไม่ราบเรียบ
                    </li>
                  </ul>
                </div>

                {/* 2. Continuous Shot Stitching */}
                <div className="p-5 rounded-2xl bg-studio-900 border border-studio-800 space-y-3">
                  <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
                    <Camera className="w-5 h-5" />
                    <h4>2. 🎬 เทคนิคต่อช็อตไม่ตัด (Seedream 5.0 Pro Stitching)</h4>
                  </div>
                  <ul className="text-xs text-gray-300 space-y-2 leading-relaxed list-disc list-inside">
                    <li>
                      <strong className="text-white">เทคนิค End-to-Start Frame:</strong> ใน Kling 1.5 หรือ Runway Gen-3 ให้นำ &quot;เฟรมสุดท้าย (Last Frame)&quot; ของฉากที่ 1 ไปเป็นภาพตั้งต้น &quot;First Frame&quot; ของฉากที่ 2
                    </li>
                    <li>
                      <strong className="text-white">การรักษาระนาบกล้อง (Vector Continuity):</strong> ออกแบบให้ฉากก่อนหน้าเคลื่อนที่ไปข้างหน้า (Forward Push) และฉากถัดไปเริ่มด้วยกล้องพุ่งต่อทันที จะได้ความรู้สึกแบบ Single Take ตลอด 40 วินาที
                    </li>
                    <li>
                      <strong className="text-white">Zero Jump Cuts:</strong> ไม่ใช้การตัดสลับมุมกล้องกระทันหัน เพื่อให้คนดูตกอยู่ในภวังค์ของโลกภาพยนตร์
                    </li>
                  </ul>
                </div>

                {/* 3. Audio & Music Mixing */}
                <div className="p-5 rounded-2xl bg-studio-900 border border-studio-800 space-y-3">
                  <div className="flex items-center gap-2.5 text-purple-400 font-bold text-sm">
                    <Music className="w-5 h-5" />
                    <h4>3. 🎼 การมิกซ์เสียง BGM &amp; ซาวด์ SFX (CapCut / Premiere)</h4>
                  </div>
                  <ul className="text-xs text-gray-300 space-y-2 leading-relaxed list-disc list-inside">
                    <li>
                      <strong className="text-white">การจัดระดับเดซิเบล:</strong>
                      <span className="block pl-4 text-gray-400 mt-1">
                        • เสียงบรรยาย (Voiceover): -3dB (ชัดเจนที่สุด)<br />
                        • บทพูดตัวละคร (Dialogue): -4dB ถึง -5dB<br />
                        • ดนตรี BGM: -16dB ถึง -18dB (เปิด Auto-Ducking หลบเสียงพากย์)<br />
                        • ซาวด์เอฟเฟกต์ (SFX Impact): 0dB ถึง -2dB
                      </span>
                    </li>
                    <li>
                      <strong className="text-white">Sub-bass Braam Drop:</strong> ใส่เสียงซับเบสดรอป (Braam) ในวินาทีที่ตัวเอกระเบิดพลังหรือชักกระบี่ เพื่อสร้างแรงสั่นสะเทือนทางอารมณ์
                    </li>
                  </ul>
                </div>

                {/* 4. Visual Grading & Aesthetics */}
                <div className="p-5 rounded-2xl bg-studio-900 border border-studio-800 space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                    <Layers className="w-5 h-5" />
                    <h4>4. 🎨 คัลเลอร์เกรดดิ้ง &amp; มิติภาพ (UE5 Donghua Aesthetics)</h4>
                  </div>
                  <ul className="text-xs text-gray-300 space-y-2 leading-relaxed list-disc list-inside">
                    <li>
                      <strong className="text-white">โทนสีระดับภาพยนตร์ (Color Palette):</strong> ใช้คู่สีตรงข้าม Cyan &amp; Gold หรือ Blood Red &amp; Cyan Qi Glow เพื่อดึงสายตาคนดูใน 3 วินาทีแรก
                    </li>
                    <li>
                      <strong className="text-white">Anamorphic Lens Flare &amp; Fog:</strong> เติมมิติหมอกปริมาตร (Volumetric Fog) และแสงสะท้อนเลนส์แนวนอน เพิ่มความรู้สึกแบบภาพยนตร์ฟอร์มยักษ์
                    </li>
                    <li>
                      <strong className="text-white">ความคงที่ของใบหน้าตัวละคร:</strong> ล็อคคีย์เวิร์ดรูปลักษณ์ตัวละครเดิมในทุกพร้อมต์ เพื่อให้หน้าตาไม่เปลี่ยนไปมาระหว่างฉาก
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIRAL CAPTIONS & HASHTAGS */}
          {activeTab === 'captions' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-100">
                <span className="font-bold text-cyan-300 block text-sm mb-1">
                  🏷️ แคปชัน &amp; แฮชแท็กไวรัลสำหรับโพสต์ลง Meta Reels / TikTok / YouTube Shorts
                </span>
                คัดลอกข้อความด้านล่างไปวางในช่องแคปชันวิดีโอได้ทันที มีการจัดวาง Hook ชวนติดตามและแฮชแท็กดึงอัลกอริทึม
              </div>

              <div className="p-5 rounded-2xl bg-studio-900 border border-studio-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs sm:text-sm">
                    📱 ข้อความแคปชันพร้อมโพสต์ (Ready-to-Post Caption):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      let captionText = `🔥 ${project.title}\n\n`;
                      captionText += `เมื่อโชคชะตาที่หลับใหลถูกปลุกขึ้น... มหาเทพกระบี่ข้ามภพจะพลิกฟ้าทลายทุกกฎเกณฑ์! ⚔️✨\n`;
                      captionText += `รับชมคลิปเต็มความยาว ${durationStr} ต่อเนื่องช็อตเดียวจบ!\n\n`;
                      if (project.genre === 'military_tactical') {
                        captionText += `#Reels #ทหาร #ยุทธการทหาร #ขีปนาวุธ #กองทัพ #แสนยานุภาพ #อาวุธสงคราม #เทคโนโลยีทหาร #MilitaryReels #Shorts`;
                      } else if (project.genre === 'xianxia_cultivation') {
                        captionText += `#Reels #อนิเมะจีน3D #กำลังภายใน #เซียนกระบี่ #Donghua #SAN1 #อนิเมะ #Shorts #ซีรีส์จีน #Seedream #คลิปสั้น`;
                      } else {
                        captionText += `#Reels #ภาพยนตร์AI #หนังไซไฟ #วิดีโอสั้น #Shorts #MetaReels #AIAnimation`;
                      }
                      handleCopyText(captionText, 'caption-post');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedType === 'caption-post' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>คัดลอกแคปชันแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกแคปชัน</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 text-xs sm:text-sm text-gray-200 leading-relaxed font-sans select-all space-y-2">
                  <p className="font-bold text-cyan-300">🔥 {project.title}</p>
                  <p>
                    เมื่อโชคชะตาที่หลับใหลถูกปลุกขึ้น... มหาเทพกระบี่ข้ามภพจะพลิกฟ้าทลายทุกกฎเกณฑ์! ⚔️✨
                    รับชมคลิปเต็มความยาว {durationStr} ต่อเนื่องช็อตเดียวจบ!
                  </p>
                  <p className="text-cyan-400 font-mono text-xs pt-2 border-t border-studio-800">
                    {project.genre === 'military_tactical'
                      ? '#Reels #ทหาร #ยุทธการทหาร #ขีปนาวุธ #กองทัพ #แสนยานุภาพ #อาวุธสงคราม #เทคโนโลยีทหาร #MilitaryReels #Shorts'
                      : project.genre === 'xianxia_cultivation'
                      ? '#Reels #อนิเมะจีน3D #กำลังภายใน #เซียนกระบี่ #Donghua #SAN1 #อนิเมะ #Shorts #ซีรีส์จีน #Seedream #คลิปสั้น'
                      : '#Reels #ภาพยนตร์AI #หนังไซไฟ #วิดีโอสั้น #Shorts #MetaReels #AIAnimation'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-studio-800 bg-studio-950 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-semibold">
              ระบบสตูดิโอ Meta Reels พร้อมใช้งาน (Seedream 5.0 Pro Flow)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-studio-900 hover:bg-studio-800 text-gray-300 text-xs font-semibold border border-studio-800 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={() => handleCopyText(generateFullPackageText(), 'footer-copy')}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
            >
              {copiedType === 'footer-copy' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>คัดลอกชุดใหญ่เบ็ดเสร็จ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
