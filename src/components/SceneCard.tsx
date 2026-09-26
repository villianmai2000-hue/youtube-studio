'use client';

import React, { useState } from 'react';
import { ScriptScene, CharacterBible, VisualMedium, StylePreset, CharacterDialogue } from '@/lib/types';
import { cleanSceneTitle } from '@/lib/script-templates';
import {
  MessageSquare,
  Copy,
  Check,
  Trash2,
  Plus,
  Video,
  Camera,
  RefreshCw,
  Sparkles,
  Music,
  BookOpen,
} from 'lucide-react';

interface SceneCardProps {
  scene: ScriptScene;
  index: number;
  characters: CharacterBible[];
  visualMedium: VisualMedium;
  stylePreset: StylePreset;
  genre: string;
  projectId: string;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onUpdate: (updatedScene: ScriptScene) => void;
  onDelete: (sceneId: string) => void;
}

export default function SceneCard({
  scene,
  characters,
  visualMedium,
  stylePreset,
  genre,
  isSelected = false,
  onToggleSelect,
  onUpdate,
  onDelete,
}: SceneCardProps) {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  // Copy to clipboard helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(type);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  // Helper to extract BGM & SFX cleanly
  const extractAudio = (text: string) => {
    const bgmMatch = text.match(/\[(?:BGM|ดนตรี):\s*([^\]]+)\]/i);
    const sfxMatch = text.match(/\[(?:SFX|เอฟเฟกต์เสียง):\s*([^\]]+)\]/i);
    return {
      bgm: bgmMatch ? bgmMatch[1].trim() : text.includes('[SFX:') ? '' : text,
      sfx: sfxMatch ? sfxMatch[1].trim() : '',
    };
  };

  const currentAudio = extractAudio(scene.sfxBgm || '');

  const handleUpdateBgm = (newBgm: string) => {
    const sfx = currentAudio.sfx;
    const combined = (newBgm ? `[BGM: ${newBgm.trim()}]` : '') + (sfx ? ` [SFX: ${sfx.trim()}]` : '');
    onUpdate({ ...scene, sfxBgm: combined.trim() });
  };

  const handleUpdateSfx = (newSfx: string) => {
    const bgm = currentAudio.bgm;
    const combined = (bgm ? `[BGM: ${bgm.trim()}] ` : '') + (newSfx ? `[SFX: ${newSfx.trim()}]` : '');
    onUpdate({ ...scene, sfxBgm: combined.trim() });
  };

  // Regenerate prompts with AI
  const handleRegeneratePrompts = async () => {
    setRegenerating(true);
    try {
      const res = await fetch('/api/ai/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneTitle: scene.title,
          narration: scene.narration || scene.imagePrompt,
          dialogues: scene.dialogues,
          visualMedium,
          stylePreset,
          genre,
          cameraMovement: scene.cameraMovement,
          lighting: scene.lighting,
          charactersInScene: characters.filter((c) => scene.characterIds?.includes(c.id) || true).slice(0, 2),
          sceneNumber: scene.sceneNumber,
        }),
      });
      const data = await res.json();
      if (data.success && data.prompts) {
        onUpdate({
          ...scene,
          imagePrompt: data.prompts.imagePrompt,
          videoMotionPrompt: data.prompts.videoMotionPrompt,
          negativePrompt: data.prompts.negativePrompt,
        });
      }
    } catch (err) {
      console.error('Failed to regenerate prompts:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleAddDialogue = () => {
    const defaultSpeaker = (characters && characters[0]?.name) || 'ตัวละคร';
    const newDialogue: CharacterDialogue = {
      speaker: defaultSpeaker,
      emotion: 'สุขุม',
      text: '',
    };
    onUpdate({
      ...scene,
      dialogues: [...(scene.dialogues || []), newDialogue],
    });
  };

  const handleUpdateDialogue = (dIdx: number, field: keyof CharacterDialogue, val: string) => {
    const updated = [...(scene.dialogues || [])];
    updated[dIdx] = { ...updated[dIdx], [field]: val };
    onUpdate({ ...scene, dialogues: updated });
  };

  const handleDeleteDialogue = (dIdx: number) => {
    const updated = (scene.dialogues || []).filter((_, i) => i !== dIdx);
    onUpdate({ ...scene, dialogues: updated });
  };

  const cleanVideoPrompt = (prompt?: string) => {
    if (!prompt) return '';
    return prompt
      .replace(/\[Google Flow Seed Lock:[^\]]*\]\s*/gi, '')
      .replace(/Seed Lock:[^\n]*\n?/gi, '')
      .replace(/\(Seed:[^\)]*\)/gi, '')
      .replace(/--seed\s+\d+/gi, '')
      .trim();
  };

  return (
    <div
      className={`rounded-2xl bg-studio-900 border p-5 sm:p-6 space-y-5 transition-all shadow-lg ${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400/30 bg-studio-900/95 shadow-amber-500/10'
          : 'border-studio-800 hover:border-studio-700'
      }`}
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-studio-800">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          {/* Select Scene Checkbox */}
          {onToggleSelect && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="w-5 h-5 rounded-lg text-amber-500 bg-studio-950 border-studio-700 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer accent-amber-500"
              />
              <span className="text-xs font-bold text-amber-400 hidden sm:inline">
                เลือกฉากนี้
              </span>
            </label>
          )}

          <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-xs flex items-center justify-center">
            {scene.sceneNumber}
          </span>

          <div className="flex-1">
            <input
              type="text"
              value={cleanSceneTitle(scene.title)}
              onChange={(e) => onUpdate({ ...scene, title: cleanSceneTitle(e.target.value) })}
              className="w-full px-3 py-1.5 rounded-lg bg-studio-950 border border-studio-800 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
              placeholder="ชื่อฉาก"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-800 text-gray-400">
            องค์ที่ {scene.actNumber}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1 shadow-sm">
            🎬 Seedream 5.0 Pro
          </span>
          <span className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold font-mono flex items-center gap-1">
            ⏱️ 10 วินาที
          </span>
          <button
            type="button"
            onClick={() => onDelete(scene.id)}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
            title="ลบฉากนี้"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-4">
        {/* 1. บทเล่าเรื่อง / เสียงพากย์ (Story Narration) */}
        <div className="p-3.5 rounded-2xl bg-studio-950 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> บทเล่าเรื่อง / เสียงพากย์ (Story Narration)
            </label>
            <button
              type="button"
              onClick={() => handleCopy(scene.narration || '', 'narration')}
              className="px-3 py-1 rounded-lg bg-studio-900 hover:bg-studio-800 border border-studio-700 text-gray-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedPrompt === 'narration' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">คัดลอกบทเล่าเรื่องแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>คัดลอกบทเล่าเรื่อง</span>
                </>
              )}
            </button>
          </div>
          <textarea
            rows={3}
            value={scene.narration || ''}
            onChange={(e) => onUpdate({ ...scene, narration: e.target.value })}
            placeholder="บทบรรยายดำเนินเรื่องสำหรับผู้พากย์เสียง ค่อยๆ เล่าเรื่องราวต่อเนื่องกัน..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-studio-900/90 border border-studio-800 text-gray-100 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-emerald-500 font-sans placeholder-gray-600"
          />
        </div>

        {/* 2. พร้อมสร้างภาพ (Image Prompt) */}
        <div className="p-3.5 rounded-2xl bg-studio-950 border border-studio-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> พร้อมสร้างภาพ (Image Prompt)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRegeneratePrompts}
                disabled={regenerating}
                className="text-[11px] text-amber-400/80 hover:text-amber-300 flex items-center gap-1 transition-colors"
                title="สร้างคำสั่งใหม่ตามบทและมุมกล้องล่าสุด"
              >
                <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">สร้างพร้อมต์ใหม่</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy(scene.imagePrompt || '', 'image')}
                className="px-3 py-1 rounded-lg bg-studio-900 hover:bg-studio-800 border border-studio-700 text-gray-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedPrompt === 'image' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">คัดลอกแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>คัดลอกพร้อมสร้างภาพ</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <textarea
            rows={3}
            value={scene.imagePrompt || ''}
            onChange={(e) => onUpdate({ ...scene, imagePrompt: e.target.value })}
            placeholder="คำสั่งสร้างภาพนิ่ง AI สำหรับฉากนี้ (Image Prompt)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-studio-900/90 border border-studio-800 text-gray-100 text-xs leading-relaxed focus:outline-none focus:border-amber-500 font-sans placeholder-gray-600"
          />
        </div>

        {/* 3. พร้อมสร้างวิดีโอ (Video Motion Prompt) */}
        <div className="p-3.5 rounded-2xl bg-studio-950 border border-studio-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-cyan-400" /> พร้อมสร้างวิดีโอ (Video Prompt)
            </label>
            <button
              type="button"
              onClick={() => handleCopy(cleanVideoPrompt(scene.videoMotionPrompt), 'video')}
              className="px-3 py-1 rounded-lg bg-studio-900 hover:bg-studio-800 border border-studio-700 text-gray-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedPrompt === 'video' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">คัดลอกแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>คัดลอกพร้อมสร้างวิดีโอ</span>
                </>
              )}
            </button>
          </div>
          <textarea
            rows={3}
            value={cleanVideoPrompt(scene.videoMotionPrompt)}
            onChange={(e) => onUpdate({ ...scene, videoMotionPrompt: e.target.value })}
            placeholder="คำสั่งสร้างวิดีโอภาพต่อเนื่อง AI (Kling / Runway / Luma / Haiper)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-studio-900/90 border border-studio-800 text-gray-100 text-xs leading-relaxed focus:outline-none focus:border-cyan-500 font-sans placeholder-gray-600"
          />
        </div>

        {/* 4. บทสนทนาตัวละคร (Character Dialogues) */}
        <div className="p-3.5 rounded-2xl bg-studio-950 border border-studio-800/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> บทสนทนาตัวละคร (Character Dialogues)
            </label>
            <div className="flex items-center gap-2">
              {scene.dialogues && scene.dialogues.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const diaText = scene.dialogues
                      .map((d) => `${d.speaker} (${d.emotion}): "${d.text}"`)
                      .join('\n');
                    handleCopy(diaText, 'dialogues');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-studio-900 hover:bg-studio-800 border border-studio-700 text-gray-300 text-xs flex items-center gap-1 transition-colors"
                >
                  {copiedPrompt === 'dialogues' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-gray-400" />
                      <span>คัดลอกบทพูด</span>
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={handleAddDialogue}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> เพิ่มบทพูด
              </button>
            </div>
          </div>

          {!scene.dialogues || scene.dialogues.length === 0 ? (
            <p className="text-xs text-gray-500 italic p-3 bg-studio-900/40 rounded-xl">
              (ฉากนี้ยังไม่มีบทสนทนา คลิก &quot;+ เพิ่มบทพูด&quot; เพื่อใส่คำพูดตัวละครให้เป็นธรรมชาติ)
            </p>
          ) : (
            <div className="space-y-2">
              {(scene.dialogues || []).map((dlg, dIdx) => (
                <div
                  key={dIdx}
                  className="p-3 rounded-xl bg-studio-900 border border-studio-800 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 text-xs"
                >
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Speaker */}
                    <input
                      type="text"
                      value={dlg.speaker || ''}
                      onChange={(e) => handleUpdateDialogue(dIdx, 'speaker', e.target.value)}
                      placeholder="ผู้พูด"
                      className="w-28 px-2.5 py-1.5 rounded-lg bg-studio-950 border border-studio-700 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
                    />
                    {/* Emotion */}
                    <input
                      type="text"
                      value={dlg.emotion || ''}
                      onChange={(e) => handleUpdateDialogue(dIdx, 'emotion', e.target.value)}
                      placeholder="อารมณ์/น้ำเสียง"
                      className="w-28 px-2.5 py-1.5 rounded-lg bg-studio-950 border border-studio-700 text-cyan-300 text-xs focus:outline-none focus:border-cyan-400"
                      title="อารมณ์หรือน้ำเสียงของตัวละคร"
                    />
                  </div>
                  {/* Speech Text */}
                  <input
                    type="text"
                    value={dlg.text || ''}
                    onChange={(e) => handleUpdateDialogue(dIdx, 'text', e.target.value)}
                    placeholder="คำพูดตัวละครที่ดูเป็นธรรมชาติ สื่ออารมณ์ชัดเจน..."
                    className="flex-1 w-full px-3 py-1.5 rounded-lg bg-studio-950 border border-studio-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteDialogue(dIdx)}
                    className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="ลบบรรทัดนี้"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Controls Row: Audio Layers (BGM/SFX) & Camera/Lighting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Audio Layers */}
          <div className="p-3 rounded-xl bg-studio-950/80 border border-studio-800 space-y-2">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Music className="w-3 h-3 text-purple-400" /> ซาวด์ &amp; ดนตรี (BGM &amp; SFX)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-purple-300 block mb-0.5 font-medium">🎼 ดนตรี (BGM):</span>
                <input
                  type="text"
                  value={currentAudio.bgm}
                  onChange={(e) => handleUpdateBgm(e.target.value)}
                  placeholder="เช่น ดนตรีลี้ลับ, ขลุ่ยเศร้า..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-studio-900 border border-purple-500/30 text-gray-200 text-xs focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <span className="text-[10px] text-blue-300 block mb-0.5 font-medium">🔊 เอฟเฟกต์ (SFX):</span>
                <input
                  type="text"
                  value={currentAudio.sfx}
                  onChange={(e) => handleUpdateSfx(e.target.value)}
                  placeholder="เช่น เสียงลมหวีด, คลื่นน้ำ..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-studio-900 border border-blue-500/30 text-gray-200 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Camera & Lighting */}
          <div className="p-3 rounded-xl bg-studio-950/80 border border-studio-800 space-y-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Camera className="w-3 h-3 text-cyan-400" /> มุมกล้อง &amp; แสงเงา (Camera &amp; Light)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <select
                  value={scene.cameraMovement}
                  onChange={(e) => onUpdate({ ...scene, cameraMovement: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-studio-900 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-cyan-500 truncate"
                  title={scene.cameraMovement}
                >
                  <option value={scene.cameraMovement}>{scene.cameraMovement}</option>
                  <option value="มุมกล้อง Seedream 5.0 Pro: ดอลลี่พุชอินมุมกว้างพิเศษ เลนส์ Anamorphic 35mm f/2.0 ลอยเข้าหาตัวละครต่อเนื่อง 10 วินาที">
                    🎬 ดอลลี่พุชอินมุมกว้าง (10s ต่อเนื่อง)
                  </option>
                  <option value="มุมกล้อง Seedream 5.0 Pro: สเตดิแคมมุมช้อนต่ำ ค่อยๆ เงยกล้องขึ้นมอง ไหลลื่น 10 วินาที">
                    🎬 สเตดิแคมช้อนต่ำเงยขึ้น (10s ไร้รอยต่อ)
                  </option>
                  <option value="มุมกล้อง Seedream 5.0 Pro: ออร์บิท 360 องศาหมุนรอบตัวละคร 10 วินาทีเนียนตา">
                    🎬 ออร์บิท 360° หมุนรอบตัวละคร
                  </option>
                  <option value="มุมกล้อง Seedream 5.0 Pro: สโลว์โมชั่น 60fps แทร็กกิ้งตามหลัง ช็อตเดียวจบ 10 วินาที">
                    🎬 สโลว์โมชั่น 60fps แทร็กกิ้งตามหลัง
                  </option>
                </select>
              </div>
              <div>
                <select
                  value={scene.lighting}
                  onChange={(e) => onUpdate({ ...scene, lighting: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-studio-900 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500 truncate"
                  title={scene.lighting}
                >
                  <option value={scene.lighting}>{scene.lighting}</option>
                  <option value="แสงจันทร์สลัวสาดส่องผ่านม่านหมอก ก่อเกิดเงามืดลึกลับชวนขนลุก">
                    แสงจันทร์สลัว เงามืดลึกลับ
                  </option>
                  <option value="แสงอาทิตย์สีทองยามเช้าสาดส่องทะลุผ่านม่านหมอกอย่างอบอุ่นและยิ่งใหญ่">
                    แสงอาทิตย์สีทอง สาดส่องทะลุหมอก
                  </option>
                  <option value="แสงอิทธิฤทธิ์เรืองรองสีมรกตและสีทองสว่างวาบตัดกับความมืด">
                    แสงอิทธิฤทธิ์เรืองรอง มรกต & ทอง
                  </option>
                  <option value="แสงคบเพลิงวูบวาบสาดกระทบใบหน้า เงามืดไหวระทึกขวัญ">
                    แสงคบเพลิงวูบวาบ เงาไหว
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
