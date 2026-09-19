'use client';

import React, { useState } from 'react';
import { CharacterBible } from '@/lib/types';
import { User, Plus, Trash2, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface CharacterBibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CharacterBible[];
  onSaveCharacters: (characters: CharacterBible[]) => void;
}

export default function CharacterBibleModal({
  isOpen,
  onClose,
  characters: initialCharacters,
  onSaveCharacters,
}: CharacterBibleModalProps) {
  const [characters, setCharacters] = useState<CharacterBible[]>(initialCharacters);

  if (!isOpen) return null;

  const handleAddCharacter = () => {
    const newChar: CharacterBible = {
      id: `char-${Date.now()}`,
      name: 'ตัวละครใหม่',
      role: 'supporting',
      appearanceAnchor: 'distinct facial features, signature hair, specific attire colors',
      clothingStyle: 'martial arts traditional or modern attire',
      voiceStyle: 'น้ำเสียงเป็นเอกลักษณ์',
    };
    setCharacters([...characters, newChar]);
  };

  const handleUpdate = (index: number, field: keyof CharacterBible, value: any) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const handleDelete = (index: number) => {
    const updated = characters.filter((_, i) => i !== index);
    setCharacters(updated);
  };

  const handleSave = () => {
    onSaveCharacters(characters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-studio-900 border border-studio-700 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl my-8 relative">
        <div className="flex items-center justify-between pb-4 border-b border-studio-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">สมุดคุมตัวละคร (Character Bible)</h2>
              <p className="text-xs text-gray-400">
                จุดเด่นรูปลักษณ์ (Visual Anchor) จะถูกนำไปแทรกในทุกฉาก เพื่อให้หน้าตาตัวละครต่อเนื่อง ไม่เปลี่ยนข้ามฉาก
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-studio-800"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {characters.map((char, idx) => (
            <div
              key={char.id}
              className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-3 relative group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-full bg-studio-800 text-amber-400 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                    placeholder="ชื่อตัวละคร"
                    className="px-3 py-1.5 rounded-lg bg-studio-900 border border-studio-700 text-white font-bold text-sm w-48"
                  />
                  <select
                    value={char.role}
                    onChange={(e) => handleUpdate(idx, 'role', e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-studio-900 border border-studio-700 text-gray-300 text-xs"
                  >
                    <option value="protagonist">พระเอก / ตัวเอก (Protagonist)</option>
                    <option value="antagonist">ตัวร้าย / จอมมาร (Antagonist)</option>
                    <option value="supporting">สหาย / ตัวละครสมทบ</option>
                    <option value="mentor">อาจารย์ / ผู้ชี้แนะ</option>
                    <option value="beast_companion">สัตว์เทวะ / สัตว์เลี้ยง</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-studio-900"
                  title="ลบตัวละคร"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block mb-1">
                  Visual Anchor (คำบรรยายภาษาอังกฤษสำหรับ Prompt ภาพ/วิดีโอ):
                </label>
                <textarea
                  rows={2}
                  value={char.appearanceAnchor}
                  onChange={(e) => handleUpdate(idx, 'appearanceAnchor', e.target.value)}
                  placeholder="เช่น: handsome 20yo cultivation master, long silver-white hair with jade hairpin, flowing black and gold daoist robe, calm piercing amber eyes"
                  className="w-full px-3 py-2 rounded-lg bg-studio-900 border border-studio-700 text-gray-200 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">สไตล์การแต่งกาย:</label>
                  <input
                    type="text"
                    value={char.clothingStyle}
                    onChange={(e) => handleUpdate(idx, 'clothingStyle', e.target.value)}
                    placeholder="เช่น: ชุดคลุมยาวสีดำดิ้นทอง ชายเสื้อพริ้วไหว"
                    className="w-full px-3 py-1.5 rounded-lg bg-studio-900 border border-studio-700 text-gray-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">สไตล์เสียงพากย์:</label>
                  <input
                    type="text"
                    value={char.voiceStyle}
                    onChange={(e) => handleUpdate(idx, 'voiceStyle', e.target.value)}
                    placeholder="เช่น: เสียงทุ้มลึก เยือกเย็น ดุดัน"
                    className="w-full px-3 py-1.5 rounded-lg bg-studio-900 border border-studio-700 text-gray-200 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddCharacter}
            className="w-full py-2.5 rounded-xl border border-dashed border-studio-700 hover:border-amber-500/50 hover:bg-studio-950 text-gray-400 hover:text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มตัวละครใหม่ในเรื่อง</span>
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-studio-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-glow transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>บันทึก Character Bible</span>
          </button>
        </div>
      </div>
    </div>
  );
}
