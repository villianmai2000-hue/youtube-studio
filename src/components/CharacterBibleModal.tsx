'use client';

import React, { useState } from 'react';
import { CharacterBible, VisualMedium, StylePreset } from '@/lib/types';
import {
  User,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Sparkles,
  Lock,
  RefreshCw,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

interface CharacterBibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CharacterBible[];
  projectId?: string;
  visualMedium?: VisualMedium;
  stylePreset?: StylePreset;
  onSaveCharacters: (characters: CharacterBible[]) => void;
}

export default function CharacterBibleModal({
  isOpen,
  onClose,
  characters: initialCharacters,
  projectId,
  visualMedium = 'animation',
  stylePreset = 'donghua_3d',
  onSaveCharacters,
}: CharacterBibleModalProps) {
  const [characters, setCharacters] = useState<CharacterBible[]>(initialCharacters);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingCharId, setGeneratingCharId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddCharacter = () => {
    const randomSeed = String(Math.floor(100000 + Math.random() * 900000));
    const newChar: CharacterBible = {
      id: `char-${Date.now()}`,
      name: `ตัวละคร ${characters.length + 1}`,
      role: 'supporting',
      appearanceAnchor: 'distinct facial features, signature hair, specific attire colors, 8k resolution',
      clothingStyle: 'martial arts traditional or tactical attire',
      voiceStyle: 'น้ำเสียงเป็นเอกลักษณ์',
      googleFlowSeed: randomSeed,
      googleFlowPrompt: `character portrait, distinct facial features, 8k --seed ${randomSeed}`,
    };
    setCharacters([...characters, newChar]);
  };

  const handleUpdate = (index: number, field: keyof CharacterBible, value: any) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    // Auto update flow prompt if appearanceAnchor or seed changes
    if (field === 'appearanceAnchor' || field === 'googleFlowSeed') {
      const seed = field === 'googleFlowSeed' ? value : updated[index].googleFlowSeed || '12345';
      const anchor = field === 'appearanceAnchor' ? value : updated[index].appearanceAnchor;
      updated[index].googleFlowPrompt = `${anchor}, character portrait, 8k resolution, cinematic lighting --seed ${seed}`;
    }
    setCharacters(updated);
  };

  const randomizeSeed = (index: number) => {
    const randomSeed = String(Math.floor(100000 + Math.random() * 900000));
    handleUpdate(index, 'googleFlowSeed', randomSeed);
  };

  const handleDelete = (index: number) => {
    if (characters.length <= 1) {
      alert('ต้องมีตัวละครอย่างน้อย 1 ตัว');
      return;
    }
    const updated = characters.filter((_, i) => i !== index);
    setCharacters(updated);
  };

  // Generate Image for a single character
  const handleGenerateSingleImage = async (index: number) => {
    const char = characters[index];
    setGeneratingCharId(char.id);

    try {
      const res = await fetch('/api/ai/generate-character-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: char.id,
          projectId,
          name: char.name,
          appearanceAnchor: char.appearanceAnchor,
          clothingStyle: char.clothingStyle,
          visualMedium,
          stylePreset,
          googleFlowSeed: char.googleFlowSeed,
        }),
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        handleUpdate(index, 'imageUrl', data.imageUrl);
        if (data.fileId) {
          handleUpdate(index, 'referenceImageGridFsId', data.fileId);
        }
      } else {
        alert(data.error || 'สร้างภาพตัวละครไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์สร้างภาพ');
    } finally {
      setGeneratingCharId(null);
    }
  };

  // Generate Images for all characters sequentially
  const handleGenerateAllImages = async () => {
    setGeneratingAll(true);
    try {
      const updatedChars = [...characters];
      for (let i = 0; i < updatedChars.length; i++) {
        const char = updatedChars[i];
        try {
          const res = await fetch('/api/ai/generate-character-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              characterId: char.id,
              projectId,
              name: char.name,
              appearanceAnchor: char.appearanceAnchor,
              clothingStyle: char.clothingStyle,
              visualMedium,
              stylePreset,
              googleFlowSeed: char.googleFlowSeed,
            }),
          });

          const data = await res.json();
          if (data.success && data.imageUrl) {
            updatedChars[i] = {
              ...updatedChars[i],
              imageUrl: data.imageUrl,
              referenceImageGridFsId: data.fileId || updatedChars[i].referenceImageGridFsId,
            };
            setCharacters([...updatedChars]);
          }
        } catch (err) {
          console.error(`Failed to generate image for ${char.name}`, err);
        }
      }
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleCopyFlowPrompt = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = () => {
    onSaveCharacters(characters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-studio-900 border border-studio-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl my-6 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-studio-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-glow">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">สมุดคุมตัวละคร (Character Bible) &amp; ล็อคหน้าตา AI</h2>
              <p className="text-xs text-gray-400">
                ควบคุมหน้าตาตัวละครไม่ให้เพี้ยนข้ามฉากด้วย Seed และรองรับคำสั่งสำหรับ flow.google.com
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-studio-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Banner with Batch Generator & Flow Google link */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-studio-950 to-cyan-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300">🌟 ระบบล็อคตัวละครด้วย flow.google.com &amp; Flux</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                0-Drift Face Lock
              </span>
            </div>
            <p className="text-xs text-gray-300">
              สร้างภาพประจำตัวของตัวละครทุกตัว เพื่อนำไปเป็นภาพอ้างอิงและผูกเข้ากับพร้อมต์ของทุกฉาก
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="https://flow.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-studio-800 hover:bg-studio-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-cyan-500/30"
              title="เปิด Google Flow (VideoFX / ImageFX)"
            >
              <span>flow.google.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleGenerateAllImages}
              disabled={generatingAll}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {generatingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังเจนเนอเรตครบทุกตัว...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>✨ สร้างภาพตัวละครทั้งหมดด้วย AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Character Cards List */}
        <div className="mt-5 space-y-4 max-h-[58vh] overflow-y-auto pr-1">
          {characters.map((char, idx) => (
            <div
              key={char.id}
              className="p-4 sm:p-5 rounded-2xl bg-studio-950 border border-studio-800 space-y-4 relative group hover:border-studio-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Name, Index, Role */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-7 h-7 rounded-xl bg-studio-800 text-amber-400 text-xs font-bold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                    placeholder="ชื่อตัวละคร"
                    className="px-3 py-1.5 rounded-xl bg-studio-900 border border-studio-700 text-white font-bold text-sm w-44 focus:outline-none focus:border-amber-500"
                  />
                  <select
                    value={char.role}
                    onChange={(e) => handleUpdate(idx, 'role', e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-studio-900 border border-studio-700 text-gray-300 text-xs focus:outline-none"
                  >
                    <option value="protagonist">พระเอก / ตัวเอก (Protagonist)</option>
                    <option value="antagonist">ตัวร้าย / คู่ปรับ (Antagonist)</option>
                    <option value="supporting">สหาย / ตัวละครสมทบ</option>
                    <option value="mentor">อาจารย์ / ผู้ชี้แนะ / ผู้การ</option>
                    <option value="beast_companion">สัตว์เทวะ / อาวุธประจำกาย</option>
                  </select>
                </div>

                {/* Seed Lock & Delete */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-studio-900 border border-studio-700 rounded-xl text-xs text-cyan-300 font-mono">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Seed:</span>
                    <input
                      type="text"
                      value={char.googleFlowSeed || '12345'}
                      onChange={(e) => handleUpdate(idx, 'googleFlowSeed', e.target.value)}
                      className="w-16 bg-transparent text-cyan-300 focus:outline-none text-center font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => randomizeSeed(idx)}
                      className="text-gray-400 hover:text-white p-0.5"
                      title="สุ่ม Seed ใหม่"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-studio-900 transition-colors"
                    title="ลบตัวละคร"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Portrait & Appearance Anchor */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                {/* Portrait Preview & Single Generate Button */}
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="w-32 h-40 rounded-2xl bg-studio-900 border border-studio-700 overflow-hidden relative shadow-inner flex items-center justify-center">
                    {char.imageUrl ? (
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-3 text-gray-500 flex flex-col items-center gap-1.5">
                        <ImageIcon className="w-8 h-8 text-gray-600" />
                        <span className="text-[10px]">ยังไม่มีรูปตัวละคร</span>
                      </div>
                    )}

                    {generatingCharId === char.id && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                        <span className="text-[10px] text-amber-300">กำลังเจนภาพ...</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerateSingleImage(idx)}
                    disabled={generatingCharId === char.id || generatingAll}
                    className="mt-2.5 w-32 py-1.5 px-2 rounded-xl bg-studio-800 hover:bg-studio-700 border border-studio-700 text-amber-400 text-xs font-medium flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{char.imageUrl ? 'เจนภาพใหม่' : 'สร้างภาพ AI'}</span>
                  </button>
                </div>

                {/* Prompts & Settings */}
                <div className="md:col-span-3 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block mb-1">
                      Visual Anchor (ลักษณะเด่นที่จะถูกนำไปล็อคในทุกฉาก):
                    </label>
                    <textarea
                      rows={2}
                      value={char.appearanceAnchor}
                      onChange={(e) => handleUpdate(idx, 'appearanceAnchor', e.target.value)}
                      placeholder="เช่น: handsome young warrior, sharp piercing eyes, distinct armor, 8k resolution"
                      className="w-full px-3 py-2 rounded-xl bg-studio-900 border border-studio-700 text-gray-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Flow Google Prompt Copy Box */}
                  <div className="p-2.5 rounded-xl bg-studio-900/90 border border-studio-800 flex items-center justify-between gap-2">
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-semibold mb-0.5">
                        <span>🌊 คำสั่งสร้างภาพสำหรับ flow.google.com:</span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate font-mono">
                        {char.googleFlowPrompt || `${char.appearanceAnchor}, 8k --seed ${char.googleFlowSeed || '12345'}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyFlowPrompt(
                          char.googleFlowPrompt || `${char.appearanceAnchor}, 8k --seed ${char.googleFlowSeed || '12345'}`,
                          char.id
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-studio-800 hover:bg-cyan-950 border border-studio-700 hover:border-cyan-500/40 text-xs text-gray-200 hover:text-cyan-300 flex items-center gap-1 transition-all flex-shrink-0"
                    >
                      {copiedId === char.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">คัดลอก</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-gray-400 block mb-1">สไตล์การแต่งกาย:</label>
                      <input
                        type="text"
                        value={char.clothingStyle}
                        onChange={(e) => handleUpdate(idx, 'clothingStyle', e.target.value)}
                        placeholder="เช่น: เสื้อเกราะ Tactical Vest ลายพรางสนามรบ"
                        className="w-full px-3 py-1.5 rounded-xl bg-studio-900 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">สไตล์เสียงพากย์:</label>
                      <input
                        type="text"
                        value={char.voiceStyle}
                        onChange={(e) => handleUpdate(idx, 'voiceStyle', e.target.value)}
                        placeholder="เช่น: เสียงดุดัน หนักแน่น สั่งการเฉียบขาด"
                        className="w-full px-3 py-1.5 rounded-xl bg-studio-900 border border-studio-700 text-gray-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddCharacter}
            className="w-full py-3 rounded-2xl border border-dashed border-studio-700 hover:border-amber-500/50 hover:bg-studio-950 text-gray-400 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มตัวละครใหม่ในโปรเจกต์</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-studio-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-glow transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>บันทึกข้อมูลตัวละครทั้งหมด</span>
          </button>
        </div>
      </div>
    </div>
  );
}
