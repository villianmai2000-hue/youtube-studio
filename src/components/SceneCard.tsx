'use client';

import React, { useState } from 'react';
import { ScriptScene, CharacterBible, VisualMedium, StylePreset, CharacterDialogue } from '@/lib/types';
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
} from 'lucide-react';

interface SceneCardProps {
  scene: ScriptScene;
  index: number;
  characters: CharacterBible[];
  visualMedium: VisualMedium;
  stylePreset: StylePreset;
  genre: string;
  projectId: string;
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
  onUpdate,
  onDelete,
}: SceneCardProps) {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Copy to clipboard helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(type);
    setTimeout(() => setCopiedPrompt(null), 2000);
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
    <div className="rounded-2xl bg-studio-900 border border-studio-800 p-5 sm:p-6 space-y-5 transition-all hover:border-studio-700 shadow-lg">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-studio-800">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-xs flex items-center justify-center">
            {scene.sceneNumber}
          </span>
          <div className="flex-1">
            <input
              type="text"
              value={scene.title}
              onChange={(e) => onUpdate({ ...scene, title: e.target.value })}
              className="w-full px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-800 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
              placeholder="ชื่อฉาก"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-800 text-gray-400">
            องค์ที่ {scene.actNumber}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-studio-950 border border-studio-800 text-amber-400 font-mono">
            ~{scene.estimatedDurationSec || 30} วิ
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

          {/* SFX / BGM Cues */}
          <div>
            <label className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block mb-1">
              คิวเสียงประกอบ &amp; ดนตรี (SFX / BGM Cues):
            </label>
            <input
              type="text"
              value={scene.sfxBgm}
              onChange={(e) => onUpdate({ ...scene, sfxBgm: e.target.value })}
              placeholder="[BGM: ดนตรีกู่เจิ้งระทึกใจ] [SFX: เสียงกระบี่ฟาดฟัน]"
              className="w-full px-3 py-1.5 rounded-lg bg-studio-950 border border-studio-800 text-gray-300 text-xs font-mono"
            />
          </div>
        </div>

        {/* Right Column (5 cols): Media & Prompts */}
        <div className="lg:col-span-5 space-y-4">
          {/* Image Area with Direct-to-MongoDB Atlas Upload */}
          <div className="rounded-xl border border-studio-800 bg-studio-950 overflow-hidden">
            <div className="p-2.5 border-b border-studio-800/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                รูปภาพฉาก (จัดเก็บใน Atlas Cloud)
              </span>

              {scene.mediaUrl && (
                <button
                  onClick={handleRemoveImage}
                  className="text-gray-500 hover:text-red-400 text-[11px]"
                >
                  ลบรูป
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
                  <Database className="w-3 h-3" /> MongoDB Atlas GridFS
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
                    นำรูปที่เจนจาก AI มาอัปโหลด ไฟล์จะถูกส่งเข้า MongoDB Atlas Cloud ทันที
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-studio-800 hover:bg-studio-700 text-gray-200 text-xs font-semibold cursor-pointer border border-studio-700 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{uploadingImage ? 'กำลังบันทึกลง Atlas...' : 'อัปโหลดภาพเข้า Atlas'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Camera and Lighting Controls */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-gray-400 block mb-1 flex items-center gap-1 text-[11px]">
                <Camera className="w-3 h-3 text-cyan-400" /> มุมกล้อง (Camera)
              </label>
              <input
                type="text"
                value={scene.cameraMovement}
                onChange={(e) => onUpdate({ ...scene, cameraMovement: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-studio-950 border border-studio-800 text-gray-200 text-xs"
                placeholder="Cinematic angle"
              />
            </div>
            <div>
              <label className="text-gray-400 block mb-1 flex items-center gap-1 text-[11px]">
                <Sun className="w-3 h-3 text-amber-400" /> แสงเงา (Lighting)
              </label>
              <input
                type="text"
                value={scene.lighting}
                onChange={(e) => onUpdate({ ...scene, lighting: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-studio-950 border border-studio-800 text-gray-200 text-xs"
                placeholder="Lighting mood"
              />
            </div>
          </div>

          {/* Visual AI Prompts with 1-Click Copy */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300">
                พร้อมต์ภาพ &amp; วิดีโอต่อเนื่อง (Continuity Prompts)
              </span>
              <button
                type="button"
                onClick={handleRegeneratePrompts}
                disabled={regenerating}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                title="รีเฟรชพร้อมต์ตามบทและมุมกล้องใหม่"
              >
                <RefreshCw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                <span>รีเจนพร้อมต์</span>
              </button>
            </div>

            {/* Image Prompt (Midjourney / Flux / SD) */}
            <div className="p-2.5 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                  🎨 พร้อมต์ภาพนิ่ง (Midjourney / Flux)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(scene.imagePrompt, 'image')}
                  className="px-2 py-0.5 rounded bg-studio-900 border border-studio-700 text-gray-300 hover:text-white text-[10px] flex items-center gap-1"
                >
                  {copiedPrompt === 'image' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>คัดลอก</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 font-mono line-clamp-3 select-all">
                {scene.imagePrompt}
              </p>
            </div>

            {/* Video Motion Prompt (Kling AI / Runway Gen-3 / Luma) */}
            <div className="p-2.5 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
                  <Video className="w-3 h-3" /> พร้อมต์วิดีโอต่อเนื่อง (Kling / Runway)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(scene.videoMotionPrompt, 'video')}
                  className="px-2 py-0.5 rounded bg-studio-900 border border-studio-700 text-gray-300 hover:text-white text-[10px] flex items-center gap-1"
                >
                  {copiedPrompt === 'video' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>คัดลอก</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 font-mono line-clamp-3 select-all">
                {scene.videoMotionPrompt}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
