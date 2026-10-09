"use client";

import React, { useState } from "react";
import { ScriptScene, PropItem, LocationItem, CharacterItem } from "@/lib/types";
import { FOCUS_OPTIONS, COMPOSITION_OPTIONS, SHOT_TYPES, CAMERA_ANGLES, CAMERA_MOVEMENTS } from "@/lib/cineprompt-engine";
import { ChevronDown, ChevronUp, Trash2, Clock, Camera, Film, Eye, Sparkles, MessageSquare, User, ArrowUp, ArrowDown } from "lucide-react";

interface SceneEditorCardProps {
  scene: ScriptScene;
  index: number;
  totalScenes: number;
  locations: LocationItem[];
  propsList: PropItem[];
  characters: CharacterItem[];
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updated: ScriptScene) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const SceneEditorCard: React.FC<SceneEditorCardProps> = ({
  scene,
  index,
  totalScenes,
  locations,
  propsList,
  characters,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleProp = (propId: string) => {
    const current = scene.propIds || [];
    if (current.includes(propId)) {
      onUpdate({ ...scene, propIds: current.filter((id) => id !== propId) });
    } else {
      onUpdate({ ...scene, propIds: [...current, propId] });
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`border rounded-xl transition-all duration-200 overflow-hidden cursor-pointer ${
        isSelected
          ? "bg-[#111827] border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50"
          : "bg-[#0d1322] border-slate-800 hover:border-slate-700"
      }`}
    >
      {/* Top Header Bar */}
      <div className="bg-[#161f36]/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black flex items-center justify-center font-mono">
            {scene.sceneNumber}
          </span>
          <div className="font-bold text-slate-200 flex items-center gap-2">
            <span>ฉากที่ {scene.sceneNumber}</span>
            {scene.notes && (
              <span className="text-[11px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {scene.notes}
              </span>
            )}
          </div>
        </div>

        {/* Time Stamp & Controls */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 bg-[#0d1322] border border-slate-700 px-2.5 py-1 rounded-md text-[11px] font-mono text-cyan-300">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>
              Time: {scene.startTimeSec} - {scene.endTimeSec} วินาที ({scene.durationSec}s)
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded"
              title="เลื่อนขึ้น"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === totalScenes - 1}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded"
              title="เลื่อนลง"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 text-slate-400 hover:text-white rounded"
              title={collapsed ? "ขยาย" : "ย่อ"}
            >
              {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-slate-400 hover:text-rose-400 rounded"
              title="ลบฉากนี้"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      {!collapsed && (
        <div className="p-4 space-y-4 text-xs" onClick={(e) => e.stopPropagation()}>
          {/* Character Speaker & Listener */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                ตัวละครพูด (Primary Speaker)
              </label>
              <input
                type="text"
                value={scene.speaker}
                onChange={(e) => onUpdate({ ...scene, speaker: e.target.value })}
                placeholder="เช่น กานต์ (CHAR-01) หรือ ผู้บรรยาย..."
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                ผู้ฟัง / ตัวละครร่วมในฉาก (Listener / Co-Star)
              </label>
              <input
                type="text"
                value={scene.listener}
                onChange={(e) => onUpdate({ ...scene, listener: e.target.value })}
                placeholder="เช่น ริน (CHAR-02) / ป้องกัน AI สับสน..."
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Dialogue & Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                💬 บทพูด / ข้อความ (Dialogue / Spoken Lines)
              </label>
              <textarea
                value={scene.dialogue}
                onChange={(e) => onUpdate({ ...scene, dialogue: e.target.value })}
                rows={2}
                placeholder="บทพูดของตัวละคร หรือ เสียงบรรยายพากย์ไทย..."
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                🎬 การกระทำ / เล่าเรื่องภาพ (Action & Visual Staging)
              </label>
              <textarea
                value={scene.action}
                onChange={(e) => onUpdate({ ...scene, action: e.target.value })}
                rows={2}
                placeholder="การเคลื่อนไหว เหตุการณ์ที่เกิดขึ้นในฉาก..."
                className="w-full bg-[#111827] border border-slate-700/80 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>
          </div>

          {/* Location Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
              📍 ระบุสถานที่เฉพาะฉากนี้ (Scene Location)
            </label>
            <div className="flex gap-2">
              <select
                value={scene.locationId || ""}
                onChange={(e) => {
                  const loc = locations.find((l) => l.id === e.target.value);
                  onUpdate({
                    ...scene,
                    locationId: e.target.value,
                    locationName: loc ? loc.name : scene.locationName,
                  });
                }}
                className="bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400 flex-1"
              >
                <option value="">-- เลือกจากคลังสถานที่ --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    [{loc.code}] {loc.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={scene.locationName || ""}
                onChange={(e) => onUpdate({ ...scene, locationName: e.target.value })}
                placeholder="หรือระบุชื่อสถานที่..."
                className="bg-[#111827] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400 flex-1"
              />
            </div>
          </div>

          {/* Focus & Composition Directing Box */}
          <div className="bg-[#111827]/90 border border-slate-800 rounded-xl p-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* FOCUS */}
              <div>
                <label className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  FOCUS (ระยะชัด)
                </label>
                <select
                  value={scene.focusType}
                  onChange={(e) => onUpdate({ ...scene, focusType: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 mb-1.5 focus:outline-none focus:border-amber-400"
                >
                  {FOCUS_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={scene.focusDetail || ""}
                  onChange={(e) => onUpdate({ ...scene, focusDetail: e.target.value })}
                  placeholder="ขยายความระยะชัด เช่น ชัดที่ดวงตา ละลายปืนข้างหลัง..."
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* COMPOSITION */}
              <div>
                <label className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  COMPOSITION (การจัดองค์ประกอบภาพ)
                </label>
                <select
                  value={scene.compositionType}
                  onChange={(e) => onUpdate({ ...scene, compositionType: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 mb-1.5 focus:outline-none focus:border-cyan-400"
                >
                  {COMPOSITION_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={scene.compositionDetail || ""}
                  onChange={(e) => onUpdate({ ...scene, compositionDetail: e.target.value })}
                  placeholder="ระบุตำแหน่ง เช่น ตัวละครอยู่ซ้าย วัตถุอยู่ขวาล่าง..."
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Shot Type, Angle, Movement */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
              <div>
                <label className="text-slate-400 mb-1 block">ระยะภาพ (Shot Type)</label>
                <select
                  value={scene.shotType}
                  onChange={(e) => onUpdate({ ...scene, shotType: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-2 py-1 text-slate-300"
                >
                  {SHOT_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s.split(" - ")[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">มุมกล้อง (Camera Angle)</label>
                <select
                  value={scene.cameraAngle}
                  onChange={(e) => onUpdate({ ...scene, cameraAngle: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-2 py-1 text-slate-300"
                >
                  {CAMERA_ANGLES.map((a) => (
                    <option key={a} value={a}>
                      {a.split(" - ")[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">การเคลื่อนไหว (Movement)</label>
                <select
                  value={scene.cameraMovement}
                  onChange={(e) => onUpdate({ ...scene, cameraMovement: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-2 py-1 text-slate-300"
                >
                  {CAMERA_MOVEMENTS.map((m) => (
                    <option key={m} value={m}>
                      {m.split(" (")[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Props in Scene Pills */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 mb-1.5 block">
              📦 Props / ยานพาหนะ ที่ปรากฏในฉากนี้:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {propsList.map((p) => {
                const active = (scene.propIds || []).includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProp(p.id)}
                    className={`px-2 py-1 rounded-md text-[10px] font-mono transition flex items-center gap-1 ${
                      active
                        ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    <span>{p.code}</span>
                    <span className="font-sans">({p.name})</span>
                  </button>
                );
              })}
              {propsList.length === 0 && (
                <span className="text-slate-500 text-[11px]">ยังไม่มี Props (เพิ่มได้ที่คอลัมน์ซ้าย)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
