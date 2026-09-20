'use client';

import React, { useState } from 'react';
import { ScriptScene, CharacterBible, VisualMedium, StylePreset, CharacterDialogue } from '@/lib/types';
import { cleanSceneTitle } from '@/lib/script-templates';
import {
  Film,
  MessageSquare,
  Upload,
  Copy,
  Check,
  Trash2,
  Plus,
  Video,
  Camera,
  Sun,
  Database,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  Music,
  Volume2,
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
  index,
  characters,
  visualMedium,
  stylePreset,
  genre,
  projectId,
  isSelected = false,
  onToggleSelect,
  onUpdate,
  onDelete,
}: SceneCardProps) {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
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

  // Direct AI Image Generation
  const handleGenerateImageAI = async () => {
    setGeneratingImage(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: scene.id,
          projectId,
          prompt: scene.imagePrompt || scene.title,
          visualMedium,
          stylePreset,
        }),
      });

      const data = await res.json();
      if (data.success && data.mediaUrl) {
        onUpdate({
          ...scene,
          mediaFileId: data.fileId,
          mediaUrl: data.mediaUrl,
        });
      } else {
        alert('สร้างภาพล้มเหลว: ' + (data.error || 'โปรดลองใหม่อีกครั้ง'));
      }
    } catch (err: unknown) {
      alert('เกิดข้อผิดพลาดในการสร้างภาพ: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGeneratingImage(false);
    }
  };

  // Direct upload image to MongoDB Atlas GridFS
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sceneId', scene.id);
    formData.append('projectId', projectId);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.mediaUrl) {
        onUpdate({
          ...scene,
          mediaFileId: data.fileId,
          mediaUrl: data.mediaUrl,
        });
      } else {
        alert('อัปโหลดรูปล้มเหลว: ' + (data.error || 'Unknown error'));
      }
    } catch (err: unknown) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ MongoDB Atlas: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    onUpdate({
      ...scene,
      mediaFileId: undefined,
      mediaUrl: undefined,
    });
  };

  // Regenerate prompts
  const handleRegeneratePrompts = async () => {
    setRegenerating(true);
    try {
      const res = await fetch('/api/ai/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneTitle: scene.title,
          narration: scene.narration,
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

  // Dialogue helpers
  const handleAddDialogue = () => {
    const defaultSpeaker = characters[0]?.name || 'ตัวละคร';
    const newDialogue: CharacterDialogue = {
      speaker: defaultSpeaker,
      emotion: 'เยือกเย็น',
      text: '',
    };
    onUpdate({
      ...scene,
      dialogues: [...scene.dialogues, newDialogue],
    });
  };

  const handleUpdateDialogue = (dIdx: number, field: keyof CharacterDialogue, val: string) => {
    const updated = [...scene.dialogues];
    updated[dIdx] = { ...updated[dIdx], [field]: val };
    onUpdate({ ...scene, dialogues: updated });
  };

  const handleDeleteDialogue = (dIdx: number) => {
    const updated = scene.dialogues.filter((_, i) => i !== dIdx);
    onUpdate({ ...scene, dialogues: updated });
  };

  return (
    <div
      className={`rounded-2xl bg-studio-900 border p-5 sm:p-6 space-y-5 transition-all shadow-lg ${
        isSelected
          ? 'border-amber-400 ring-1 ring-amber-400/40 bg-studio-900/95'
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
                className="w-5 h-5 rounded-lg text-amber-500 bg-studio-950 border-studio-700 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-[11px] font-bold text-amber-400 hidden sm:inline">
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
              className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-800 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
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
            onClick={() => onDelete(scene.id)}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-studio-800 rounded-lg transition-colors"
            title="ลบฉากนี้"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Script, Right is Visual/Atlas Media */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Script & Dialogues */}
        <div className="lg:col-span-7 space-y-4">
          {/* Voiceover Narration */}
          <div>
            <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Film className="w-3.5 h-3.5" /> บทบรรยายเสียงพากย์ (Voiceover Narration)
            </label>
            <textarea
              rows={4}
              value={scene.narration}
              onChange={(e) => onUpdate({ ...scene, narration: e.target.value })}
              placeholder="เขียนบทบรรยายภาษาไทยสไตล์หนัง/อนิเมะจีน 3D เล่าเรื่องกระชับ ตื่นเต้น น่าติดตาม..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-studio-950 border border-studio-800 text-gray-100 text-sm leading-relaxed focus:outline-none focus:border-amber-500 placeholder-gray-600"
            />
          </div>

          {/* Dialogues */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> บทสนทนาตัวละคร (Character Dialogues)
              </label>
              <button
                type="button"
                onClick={handleAddDialogue}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20"
              >
                <Plus className="w-3 h-3" /> เพิ่มบทพูด
              </button>
            </div>

            {scene.dialogues.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-2 bg-studio-950/40 rounded-lg">
                (ฉากนี้ไม่มีบทสนทนา มีเพียงเสียงบรรยาย)
              </p>
            ) : (
              <div className="space-y-2">
                {scene.dialogues.map((dlg, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-2.5 rounded-xl bg-studio-950 border border-studio-800 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs"
                  >
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      {/* Speaker */}
                      <input
                        type="text"
                        value={dlg.speaker}
                        onChange={(e) => handleUpdateDialogue(dIdx, 'speaker', e.target.value)}
                        placeholder="ผู้พูด"
                        className="w-28 px-2 py-1 rounded bg-studio-900 border border-studio-700 text-amber-300 font-semibold"
                      />
                      {/* Emotion */}
                      <input
                        type="text"
                        value={dlg.emotion}
                        onChange={(e) => handleUpdateDialogue(dIdx, 'emotion', e.target.value)}
                        placeholder="อารมณ์"
                        className="w-24 px-2 py-1 rounded bg-studio-900 border border-studio-700 text-gray-400"
                        title="อารมณ์น้ำเสียง"
                      />
                    </div>
                    {/* Speech Text */}
                    <input
                      type="text"
                      value={dlg.text}
                      onChange={(e) => handleUpdateDialogue(dIdx, 'text', e.target.value)}
                      placeholder="คำพูดตัวละคร..."
                      className="flex-1 w-full px-2.5 py-1 rounded bg-studio-900 border border-studio-700 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteDialogue(dIdx)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Separated Audio Layers: BGM + SFX */}
          <div className="space-y-2 pt-1 border-t border-studio-800/80">
            <label className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Music className="w-3.5 h-3.5" /> ระบบเสียง &amp; ดนตรีแยกเลเยอร์ (Audio Layers):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
                  🎼 ดนตรีประกอบ (BGM):
                </span>
                <input
                  type="text"
                  value={currentAudio.bgm}
                  onChange={(e) => handleUpdateBgm(e.target.value)}
                  placeholder="เช่น กู่เจิ้งระทึกขวัญ ผสานกลองศึกจีน..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-studio-950 border border-purple-500/30 text-gray-200 text-xs focus:outline-none focus:border-purple-400 font-sans"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-1">
                <span className="text-[10px] font-bold text-blue-300 flex items-center gap-1">
                  🔊 เอฟเฟกต์เสียง (SFX):
                </span>
                <input
                  type="text"
                  value={currentAudio.sfx}
                  onChange={(e) => handleUpdateSfx(e.target.value)}
                  placeholder="เช่น เสียงกระบี่ฟาดฟัน, เสียงโซ่ขาด, Sub-bass drop..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-studio-950 border border-blue-500/30 text-gray-200 text-xs focus:outline-none focus:border-blue-400 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Seedream 5.0 Pro Director Tip */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/25 flex items-start gap-2 text-[11px] text-cyan-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300">💡 เคล็ดลับ Seedream 5.0 Pro (10 วิ ต่อเนื่อง):</span>{' '}
              {index === 0
                ? 'เปิดฉากด้วยเลนส์ Anamorphic 35mm ดอลลี่พุ่งตรงเข้าหาตัวเอก เพื่อตรึงสายตาคนดูใน 3 วินาทีแรก'
                : `รักษาความต่อเนื่องจากฉากที่ ${index} โดยนำ End Frame ของฉากก่อนหน้ามาเป็น First Frame ใน Kling/Runway เพื่อสร้างช็อตเดียวจบ ไหลลื่น 100%`}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Media & Prompts */}
        <div className="lg:col-span-5 space-y-4">
          {/* Image Area with Direct-to-MongoDB Atlas Upload */}
          <div className="rounded-xl border border-studio-800 bg-studio-950 overflow-hidden">
            <div className="p-2.5 border-b border-studio-800/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                รูปภาพประจำฉาก (จัดเก็บในคลาวด์ Atlas ทันที)
              </span>

              {scene.mediaUrl && (
                <button
                  onClick={handleRemoveImage}
                  className="text-gray-500 hover:text-red-400 text-[11px]"
                >
                  ลบรูปภาพ
                </button>
              )}
            </div>

            {scene.mediaUrl ? (
              <div className="relative group aspect-video bg-black flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scene.mediaUrl}
                  alt={scene.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Database className="w-3 h-3" /> บันทึกในคลาวด์ Atlas แล้ว
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleGenerateImageAI}
                    disabled={generatingImage}
                    className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 shadow-lg"
                  >
                    <Sparkles className={`w-3 h-3 ${generatingImage ? 'animate-spin' : ''}`} />
                    <span>{generatingImage ? 'กำลังสร้างใหม่...' : 'สร้างภาพ AI ใหม่'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-studio-900 border border-studio-800 text-gray-500 mx-auto flex items-center justify-center">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-300 font-medium">ยังไม่มีรูปภาพสำหรับฉากนี้</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    คลิกปุ่ม &quot;กดสร้างภาพด้วย AI&quot; หรือนำรูปมาอัปโหลด ไฟล์จะถูกส่งเข้า Atlas Cloud ทันที
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateImageAI}
                    disabled={generatingImage}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold shadow-glow transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${generatingImage ? 'animate-spin' : ''}`} />
                    <span>{generatingImage ? 'AI กำลังวาดภาพ...' : '✨ กดสร้างภาพด้วย AI ทันที'}</span>
                  </button>

                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-studio-800 hover:bg-studio-700 text-gray-300 text-xs font-semibold cursor-pointer border border-studio-700 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-gray-400" />
                    <span>{uploadingImage ? 'กำลังส่งขึ้น Atlas...' : 'อัปโหลดภาพ'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Camera and Lighting Controls (100% ภาษาไทย) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-gray-300 block mb-1 flex items-center gap-1 text-[11px] font-medium">
                <Camera className="w-3 h-3 text-cyan-400" /> ทิศทางมุมกล้อง
              </label>
              <select
                value={scene.cameraMovement}
                onChange={(e) => onUpdate({ ...scene, cameraMovement: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-studio-950 border border-studio-800 text-gray-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value={scene.cameraMovement}>{scene.cameraMovement}</option>
                <option value="มุมกล้อง Seedream 5.0 Pro: ดอลลี่พุชอินมุมกว้างพิเศษ เลนส์ Anamorphic 35mm f/2.0 ลอยทะลุม่านหมอกยอดเขาหมอกสวรรค์เข้าหาตัวละครแบบไร้รอยต่อ ไหลต่อเนื่อง 10 วินาทีไม่ตัดข้าม">
                  🎬 Seedream 5.0 Pro: ดอลลี่พุชอินมุมกว้างทะลุหมอก (10s ต่อเนื่อง)
                </option>
                <option value="มุมกล้อง Seedream 5.0 Pro: สเตดิแคมมุมช้อนต่ำต่อเนื่องจากปากถ้ำ ค่อยๆ เงยกล้องขึ้นมองกระบี่หยกยักษ์โบราณ แพนโค้ง 45 องศาโฟกัสแสงสะท้อนแววตา ไหลลื่น 10 วินาทีไร้รอยต่อ">
                  🎬 Seedream 5.0 Pro: สเตดิแคมช้อนต่ำเงยขึ้นมองกระบี่ (10s ไร้รอยต่อ)
                </option>
                <option value="มุมกล้อง Seedream 5.0 Pro: ออร์บิท 360 องศาหมุนรอบตัวเอกที่ลอยสมาธิกลางอากาศ มิติพารัลแลกซ์ลื่นไหล เร่งสปีดตามพายุหมุนพลังปราณจนระเบิดคลื่นกระแทก 10 วินาทีเนียนตา">
                  🎬 Seedream 5.0 Pro: ออร์บิท 360° หมุนรอบตัวเอกระเบิดพลัง (10s ไหลลื่น)
                </option>
                <option value="มุมกล้อง Seedream 5.0 Pro: ภาพยนตร์สโลว์โมชั่น 60fps แทร็กกิ้งตามหลังแผ่นหลังตัวเอก สไลด์เฉียงจับจังหวะชักกระบี่สะท้อนแสงแดดยามเที่ยงพุ่งหาศัตรู ช็อตเดียวจบ 10 วินาทีต่อเนื่อง">
                  🎬 Seedream 5.0 Pro: สโลว์โมชั่น 60fps แทร็กกิ้งตามหลังชักกระบี่ (10s ไม่ตัด)
                </option>
                <option value="มุมกว้างพิเศษแบบภาพยนตร์ เคลื่อนกล้องช้าๆ ผ่านยอดเขาหมอกสวรรค์แล้วซูมเข้า">
                  มุมกว้างพิเศษ ซูมเข้าช้าๆ
                </option>
                <option value="มุมช้อนต่ำจากพื้น ค่อยๆ เงยกล้องขึ้นมองอย่างยิ่งใหญ่อลังการ">
                  มุมช้อนต่ำ เงยกล้องขึ้นทรงพลัง
                </option>
                <option value="หมุนกล้อง 360 องศารอบตัวเอกที่กำลังปลดปล่อยพลังปราณ">
                  หมุนกล้อง 360 องศารอบตัวเอก
                </option>
                <option value="ภาพสโลว์โมชั่นเคลื่อนกล้องตามหลังตัวเอกอย่างสง่างาม">
                  สโลว์โมชั่น เคลื่อนกล้องตามหลัง
                </option>
                <option value="มุมมองมุมสูงแบบโดรนเปิดกว้าง เห็นทะเลหมอกสุดลูกหูลูกตา">
                  มุมสูงแบบโดรน เปิดกว้างตระการตา
                </option>
                <option value="เคลื่อนกล้องรวดเร็วติดตามวิถีการบินของกระบี่พุ่งทะลวง">
                  กล้องตามติดกระบี่บินความเร็วสูง
                </option>
                <option value="มุมมองข้ามไหล่ ตัดสลับระหว่างคู่ต่อสู้อย่างดุเดือด">
                  มุมมองข้ามไหล่ สลับหน้าคู่ต่อสู้
                </option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 block mb-1 flex items-center gap-1 text-[11px] font-medium">
                <Sun className="w-3 h-3 text-amber-400" /> แสงเงาและบรรยากาศ
              </label>
              <select
                value={scene.lighting}
                onChange={(e) => onUpdate({ ...scene, lighting: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-studio-950 border border-studio-800 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value={scene.lighting}>{scene.lighting}</option>
                <option value="แสงจันทร์สีเลือดสาดส่องผ่านหมู่เมฆพายุ เปล่งประกายออร่าพลังปราณสีครามเรืองรอง">
                  แสงจันทร์สีเลือด ออร่าปราณสีคราม
                </option>
                <option value="แสงอาทิตย์สีทองยามเช้าสาดส่องทะลุผ่านม่านหมอกอย่างอบอุ่นและยิ่งใหญ่">
                  แสงอาทิตย์สีทอง สาดส่องทะลุหมอก
                </option>
                <option value="แสงเรืองรองสีฟ้าครามและสีทองสว่างวาบออกมาจากอักขระโบราณ">
                  แสงอักขระโบราณสีทองและฟ้าคราม
                </option>
                <option value="แสงไฟเพลิงทมิฬสีแดงดำ ปะทะกับแสงออร่ามังกรฟ้าสีครามสว่างจ้า">
                  เพลิงทมิฬ ปะทะ ออร่ามังกรฟ้า
                </option>
                <option value="ลำแสงสวรรค์สีทองส่องลอดผ่านม่านเมฆหลังพายุสงบอย่างงดงาม">
                  ลำแสงสวรรค์สีทอง ส่องลอดม่านเมฆ
                </option>
                <option value="แสงไฟนีออนสะท้อนพื้นถนนเปียกน้ำ ตัดกับเงามืดลึกแบบภาพยนตร์">
                  แสงนีออนสะท้อนพื้นเปียกน้ำ
                </option>
              </select>
            </div>
          </div>

          {/* Visual AI Prompts with 1-Click Copy (100% ภาษาไทย) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-200">
                คำสั่งสร้างภาพและวิดีโอต่อเนื่อง (ภาษาไทย)
              </span>
              <button
                type="button"
                onClick={handleRegeneratePrompts}
                disabled={regenerating}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                title="สร้างคำสั่งใหม่ตามบทและมุมกล้องล่าสุด"
              >
                <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                <span>สร้างคำสั่งใหม่</span>
              </button>
            </div>

            {/* Image Prompt (คำสั่งภาพนิ่งภาษาไทย) */}
            <div className="p-2.5 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                  🎨 คำสั่งสร้างภาพนิ่ง (ภาษาไทย)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(scene.imagePrompt, 'image')}
                  className="px-2.5 py-1 rounded-lg bg-studio-900 hover:bg-studio-800 border border-studio-700 text-gray-200 hover:text-white text-[10px] font-medium flex items-center gap-1 transition-colors"
                >
                  {copiedPrompt === 'image' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">คัดลอกสำเร็จ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-amber-400" />
                      <span>คัดลอกคำสั่ง</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-3 select-all">
                {scene.imagePrompt}
              </p>
            </div>

            {/* Video Motion Prompt (คำสั่งวิดีโอต่อเนื่องภาษาไทย) */}
            <div className="p-2.5 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
                  <Video className="w-3 h-3" /> คำสั่งสร้างวิดีโอภาพต่อเนื่อง (ภาษาไทย)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      (scene.videoMotionPrompt || '')
                        .replace(/\[Google Flow Seed Lock:[^\]]*\]\s*/gi, '')
                        .replace(/Seed Lock:[^\n]*\n?/gi, '')
                        .replace(/\(Seed:[^\)]*\)/gi, '')
                        .trim(),
                      'video'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-studio-900 hover:bg-studio-800 border border-studio-700 text-gray-200 hover:text-white text-[10px] font-medium flex items-center gap-1 transition-colors"
                >
                  {copiedPrompt === 'video' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">คัดลอกสำเร็จ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>คัดลอกคำสั่ง</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-3 select-all">
                {(scene.videoMotionPrompt || '')
                  .replace(/\[Google Flow Seed Lock:[^\]]*\]\s*/gi, '')
                  .replace(/Seed Lock:[^\n]*\n?/gi, '')
                  .replace(/\(Seed:[^\)]*\)/gi, '')
                  .trim()}
              </p>
            </div>

            {/* Google Flow Prompt (flow.google.com คลีน ไม่เพี้ยน) */}
            <div className="p-2.5 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    🌊 flow.google.com Prompt
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      (scene.googleFlowPrompt || scene.imagePrompt || '')
                        .replace(/Seed Lock:[^\n]*\n?/gi, '')
                        .replace(/\(Seed:[^\)]*\)/gi, '')
                        .replace(/--seed\s+\d+/gi, '')
                        .trim(),
                      'flow'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-studio-900 hover:bg-studio-800 border border-studio-700 text-gray-200 hover:text-white text-[10px] font-medium flex items-center gap-1 transition-colors"
                >
                  {copiedPrompt === 'flow' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">คัดลอกสำเร็จ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-emerald-400" />
                      <span>คัดลอก Google Flow</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 select-all font-mono">
                {(scene.googleFlowPrompt || scene.imagePrompt || '')
                  .replace(/Seed Lock:[^\n]*\n?/gi, '')
                  .replace(/\(Seed:[^\)]*\)/gi, '')
                  .replace(/--seed\s+\d+/gi, '')
                  .trim()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
