"use client";

import React, { useState } from "react";
import { PropItem, LocationItem, CharacterItem } from "@/lib/types";
import { Box, MapPin, Users, Plus, Copy, Check, Trash2, Edit2, ShieldAlert } from "lucide-react";

interface AssetSidebarProps {
  propsList: PropItem[];
  locationsList: LocationItem[];
  charactersList: CharacterItem[];
  onAddProp: (prop: PropItem) => void;
  onEditProp: (prop: PropItem) => void;
  onDeleteProp: (id: string) => void;
  onAddLocation: (loc: LocationItem) => void;
  onEditLocation: (loc: LocationItem) => void;
  onDeleteLocation: (id: string) => void;
  onAddCharacter: (char: CharacterItem) => void;
  onEditCharacter: (char: CharacterItem) => void;
  onDeleteCharacter: (id: string) => void;
}

export const AssetSidebar: React.FC<AssetSidebarProps> = ({
  propsList,
  locationsList,
  charactersList,
  onAddProp,
  onEditProp,
  onDeleteProp,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  onAddCharacter,
  onEditCharacter,
  onDeleteCharacter,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal state
  const [modalType, setModalType] = useState<"prop" | "location" | "character" | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [extra, setExtra] = useState(""); // promptKeyword / atmosphere / role
  const [extra2, setExtra2] = useState(""); // visualDescription / voiceTone

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openAddModal = (type: "prop" | "location" | "character") => {
    setModalType(type);
    setEditingItem(null);
    if (type === "prop") {
      const nextNum = propsList.length + 1;
      setCode(`PROP-${String(nextNum).padStart(2, "0")}`);
      setName("");
      setDesc("");
      setExtra("");
    } else if (type === "location") {
      const nextNum = locationsList.length + 1;
      setCode(`ROOM-${String(nextNum).padStart(2, "0")}`);
      setName("");
      setDesc("");
      setExtra("Cinematic dramatic atmosphere, realistic lighting");
    } else {
      const nextNum = charactersList.length + 1;
      setCode(`CHAR-${String(nextNum).padStart(2, "0")}`);
      setName("");
      setDesc("Protagonist");
      setExtra("Sharp focused look, tactical jacket");
      setExtra2("Firm, determined");
    }
  };

  const openEditModal = (type: "prop" | "location" | "character", item: any) => {
    setModalType(type);
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setDesc(item.description || item.visualDescription || "");
    setExtra(item.promptKeyword || item.atmosphere || item.role || "");
    setExtra2(item.voiceTone || "");
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (modalType === "prop") {
      const newProp: PropItem = {
        id: editingItem ? editingItem.id : `prop-${Date.now()}`,
        code: code.trim(),
        name: name.trim(),
        description: desc.trim(),
        promptKeyword: extra.trim(),
      };
      if (editingItem) onEditProp(newProp);
      else onAddProp(newProp);
    } else if (modalType === "location") {
      const newLoc: LocationItem = {
        id: editingItem ? editingItem.id : `loc-${Date.now()}`,
        code: code.trim(),
        name: name.trim(),
        description: desc.trim(),
        atmosphere: extra.trim(),
        promptKeyword: desc.trim(),
      };
      if (editingItem) onEditLocation(newLoc);
      else onAddLocation(newLoc);
    } else if (modalType === "character") {
      const newChar: CharacterItem = {
        id: editingItem ? editingItem.id : `char-${Date.now()}`,
        code: code.trim(),
        name: name.trim(),
        role: desc.trim(),
        visualDescription: extra.trim(),
        voiceTone: extra2.trim(),
      };
      if (editingItem) onEditCharacter(newChar);
      else onAddCharacter(newChar);
    }

    setModalType(null);
  };

  return (
    <div className="w-80 shrink-0 bg-[#0d1322] border-r border-slate-800 flex flex-col h-[calc(100vh-53px)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* SECTION 1.1: PROPS & VEHICLES */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Box className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                1.1 จัดการ Props / ยานพาหนะ
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-slate-800 text-amber-300 font-mono px-1.5 py-0.5 rounded">
                {propsList.length}
              </span>
              <button
                onClick={() => openAddModal("prop")}
                className="p-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 text-xs transition"
                title="เพิ่ม Props หรือ ยานพาหนะ"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2.5 space-y-2">
            {propsList.map((p) => (
              <div
                key={p.id}
                className="bg-[#111827] border border-slate-800 rounded-lg p-2 hover:border-slate-700 transition group text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-amber-950/80 border border-amber-600/50 text-amber-300 font-mono font-bold rounded text-[10px]">
                      {p.code}
                    </span>
                    <span className="font-semibold text-slate-200 truncate max-w-[130px]">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => copyToClipboard(`[${p.code}: ${p.name}]`)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="คัดลอกรหัส"
                    >
                      {copiedCode === `[${p.code}: ${p.name}]` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal("prop", p)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteProp(p.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="ลบ"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {p.description && (
                  <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                )}
              </div>
            ))}
            {propsList.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                ยังไม่มี Props / ยานพาหนะ
              </div>
            )}
          </div>
        </div>

        {/* SECTION 1.2: LOCATIONS */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                1.2 จัดการสถานที่ (Locations)
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-slate-800 text-cyan-300 font-mono px-1.5 py-0.5 rounded">
                {locationsList.length}
              </span>
              <button
                onClick={() => openAddModal("location")}
                className="p-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded border border-cyan-500/40 text-xs transition"
                title="เพิ่มสถานที่"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2.5 space-y-2">
            {locationsList.map((loc) => (
              <div
                key={loc.id}
                className="bg-[#111827] border border-slate-800 rounded-lg p-2 hover:border-slate-700 transition group text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-600/50 text-cyan-300 font-mono font-bold rounded text-[10px]">
                      {loc.code}
                    </span>
                    <span className="font-semibold text-slate-200 truncate max-w-[130px]">{loc.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => copyToClipboard(`[${loc.code}: ${loc.name}]`)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="คัดลอกรหัส"
                    >
                      {copiedCode === `[${loc.code}: ${loc.name}]` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal("location", loc)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteLocation(loc.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="ลบ"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {loc.atmosphere && (
                  <p className="mt-1 text-[11px] text-cyan-300/70 line-clamp-1">💡 {loc.atmosphere}</p>
                )}
              </div>
            ))}
            {locationsList.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                ยังไม่มีสถานที่
              </div>
            )}
          </div>
        </div>

        {/* SECTION 1.3: CHARACTERS */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                1.3 จัดการตัวละคร (Characters)
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-slate-800 text-emerald-300 font-mono px-1.5 py-0.5 rounded">
                {charactersList.length}
              </span>
              <button
                onClick={() => openAddModal("character")}
                className="p-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded border border-emerald-500/40 text-xs transition"
                title="เพิ่มตัวละคร"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2.5 space-y-2">
            {charactersList.map((c) => (
              <div
                key={c.id}
                className="bg-[#111827] border border-slate-800 rounded-lg p-2 hover:border-slate-700 transition group text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 font-mono font-bold rounded text-[10px]">
                      {c.code}
                    </span>
                    <span className="font-semibold text-slate-200 truncate max-w-[130px]">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => openEditModal("character", c)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteCharacter(c.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="ลบ"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {c.role && (
                  <p className="mt-1 text-[11px] text-slate-400">บทบาท: {c.role}</p>
                )}
              </div>
            ))}
            {charactersList.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                ยังไม่มีตัวละคร
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {editingItem ? "แก้ไข" : "เพิ่ม"} {modalType === "prop" ? "Prop / ยานพาหนะ" : modalType === "location" ? "สถานที่" : "ตัวละคร"}
            </h3>

            <form onSubmit={handleSaveModal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">รหัส (Asset ID)</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ชื่อ</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-medium"
                  placeholder={modalType === "prop" ? "เช่น รถกระบะหุ้มเกราะ" : modalType === "location" ? "เช่น ห้องแล็บใต้ดิน" : "เช่น กานต์"}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  {modalType === "character" ? "บทบาท (Role)" : "คำอธิบาย / รายละเอียด"}
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  {modalType === "prop" ? "คีย์เวิร์ดสำหรับ AI Prompt" : modalType === "location" ? "แสงและบรรยากาศ (Atmosphere)" : "ลักษณะภายนอก (Visual Prompt)"}
                </label>
                <input
                  type="text"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              {modalType === "character" && (
                <div>
                  <label className="block text-slate-400 mb-1">น้ำเสียง / บุคลิกภาพ</label>
                  <input
                    type="text"
                    value={extra2}
                    onChange={(e) => setExtra2(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
