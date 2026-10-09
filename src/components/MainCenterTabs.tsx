"use client";

import React, { useState } from "react";
import { ProjectData, ScriptScene } from "@/lib/types";
import { SceneEditorCard } from "./SceneEditorCard";
import { DIRECTOR_STYLES } from "@/lib/cineprompt-engine";
import {
  FileText,
  MapPin,
  Palette,
  Film,
  AlertTriangle,
  Zap,
  Clock,
  Plus,
  Sliders,
  CheckCircle,
  Eye,
  Camera,
  Layers,
} from "lucide-react";

interface MainCenterTabsProps {
  project: ProjectData;
  selectedSceneIndex: number;
  onSelectSceneIndex: (index: number) => void;
  onUpdateProject: (updated: ProjectData) => void;
  onAutoReTime: () => void;
  onGenerateVipMovie: () => void;
  onAddNewScene: () => void;
}

export const MainCenterTabs: React.FC<MainCenterTabsProps> = ({
  project,
  selectedSceneIndex,
  onSelectSceneIndex,
  onUpdateProject,
  onAutoReTime,
  onGenerateVipMovie,
  onAddNewScene,
}) => {
  const [activeTab, setActiveTab] = useState<"story" | "locations" | "styles" | "cinema" | "aiRules">("story");

  // Range selector
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(project.scenes.length || 1);

  // New AI Rule input
  const [newRule, setNewRule] = useState("");

  const totalScenes = project.scenes.length;
  const totalSeconds = project.scenes.reduce((acc, s) => acc + (s.durationSec || 10), 0);
  const totalMinutes = (totalSeconds / 60).toFixed(1);

  // Scene CRUD
  const handleUpdateScene = (index: number, updated: ScriptScene) => {
    const updatedScenes = [...project.scenes];
    updatedScenes[index] = updated;
    onUpdateProject({ ...project, scenes: updatedScenes });
  };

  const handleDeleteScene = (index: number) => {
    if (!confirm(`ต้องการลบฉากที่ ${index + 1} หรือไม่?`)) return;
    const updatedScenes = project.scenes.filter((_, i) => i !== index);
    // re-number
    const renumbered = updatedScenes.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    onUpdateProject({ ...project, scenes: renumbered });
    if (selectedSceneIndex >= renumbered.length) {
      onSelectSceneIndex(Math.max(0, renumbered.length - 1));
    }
  };

  const handleMoveScene = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.scenes.length) return;
    const updatedScenes = [...project.scenes];
    const temp = updatedScenes[index];
    updatedScenes[index] = updatedScenes[targetIndex];
    updatedScenes[targetIndex] = temp;
    // re-number
    const renumbered = updatedScenes.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    onUpdateProject({ ...project, scenes: renumbered });
    onSelectSceneIndex(targetIndex);
  };

  const handleAddAiRule = () => {
    if (!newRule.trim()) return;
    const currentRules = project.aiRules || [];
    onUpdateProject({ ...project, aiRules: [...currentRules, newRule.trim()] });
    setNewRule("");
  };

  const handleDeleteAiRule = (index: number) => {
    const updated = (project.aiRules || []).filter((_, i) => i !== index);
    onUpdateProject({ ...project, aiRules: updated });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-53px)] bg-[#090d16] overflow-hidden">
      {/* 5 TABS NAVIGATION */}
      <div className="bg-[#0d1322] border-b border-slate-800 px-4 pt-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("story")}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg border-t border-x flex items-center gap-1.5 transition ${
              activeTab === "story"
                ? "bg-[#111827] border-slate-700 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>📝 เส้นเรื่อง (Storyline)</span>
          </button>

          <button
            onClick={() => setActiveTab("locations")}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg border-t border-x flex items-center gap-1.5 transition ${
              activeTab === "locations"
                ? "bg-[#111827] border-slate-700 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>📍 สถานที่ (Locations)</span>
          </button>

          <button
            onClick={() => setActiveTab("styles")}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg border-t border-x flex items-center gap-1.5 transition ${
              activeTab === "styles"
                ? "bg-[#111827] border-slate-700 text-purple-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>🎨 สไตล์ (Styles)</span>
          </button>

          <button
            onClick={() => setActiveTab("cinema")}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg border-t border-x flex items-center gap-1.5 transition ${
              activeTab === "cinema"
                ? "bg-[#111827] border-slate-700 text-blue-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Film className="w-3.5 h-3.5 text-blue-400" />
            <span>🎥 กำกับภาพ (Cinematography)</span>
          </button>

          <button
            onClick={() => setActiveTab("aiRules")}
            className={`px-3 py-2 text-xs font-bold rounded-t-lg border-t border-x flex items-center gap-1.5 transition ${
              activeTab === "aiRules"
                ? "bg-[#111827] border-slate-700 text-rose-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>⚠️ บังคับ Ai (AI Constraints)</span>
          </button>
        </div>
      </div>

      {/* CONTROLS BAR (Shown on Story tab) */}
      {activeTab === "story" && (
        <div className="bg-[#111827]/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-200">
              รวมฉากทั้งหมด: <span className="text-amber-400 font-mono font-black">{totalScenes}</span> ฉาก
            </span>
            <span className="text-slate-400 font-mono">
              ({totalSeconds}s / ~{totalMinutes} นาที)
            </span>

            {/* Range selector */}
            <div className="flex items-center gap-1.5 bg-[#1e293b] border border-slate-700 rounded-lg px-2 py-1">
              <span className="text-slate-400 text-[11px]">เลือกฉาก:</span>
              <input
                type="number"
                min={1}
                max={totalScenes || 1}
                value={rangeStart}
                onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
                className="w-12 bg-transparent text-center font-mono font-bold text-amber-300 focus:outline-none"
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                min={1}
                max={totalScenes || 1}
                value={rangeEnd}
                onChange={(e) => setRangeEnd(parseInt(e.target.value) || totalScenes)}
                className="w-12 bg-transparent text-center font-mono font-bold text-amber-300 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (rangeStart >= 1 && rangeStart <= totalScenes) {
                    onSelectSceneIndex(rangeStart - 1);
                  }
                }}
                className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px]"
              >
                ใช้ฉาก
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGenerateVipMovie}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-lg text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition"
              title="สร้างหนังสั้น 3,000 วินาที รวม 308 ฉาก (แบ่ง 10 บล็อกต่อเนื่อง)"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>⚡ สั่งผลิตหนังสั้น 3,000s / 308 ฉาก</span>
            </button>

            <button
              onClick={onAutoReTime}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 flex items-center gap-1.5 transition"
              title="จัดเรียงเวลา 0-10s, 10-20s ต่อเนื่องอัตโนมัติ"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>เรียงเวลา (Auto Re-Time)</span>
            </button>

            <button
              onClick={onAddNewScene}
              className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 rounded-lg text-emerald-300 flex items-center gap-1.5 transition font-semibold"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>เพิ่มฉาก</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB 1: STORYLINE SCENES */}
        {activeTab === "story" && (
          <div className="space-y-3 max-w-4xl mx-auto">
            {project.scenes.map((scene, idx) => (
              <SceneEditorCard
                key={scene.id || `scene-${idx}`}
                scene={scene}
                index={idx}
                totalScenes={totalScenes}
                locations={project.locations}
                propsList={project.props}
                characters={project.characters}
                isSelected={selectedSceneIndex === idx}
                onSelect={() => onSelectSceneIndex(idx)}
                onUpdate={(updated) => handleUpdateScene(idx, updated)}
                onDelete={() => handleDeleteScene(idx)}
                onMoveUp={() => handleMoveScene(idx, "up")}
                onMoveDown={() => handleMoveScene(idx, "down")}
              />
            ))}

            {project.scenes.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl bg-[#0d1322]/50">
                <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">ยังไม่มีฉากในโปรเจกต์</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  คลิกปุ่ม &quot;⚡ สั่งผลิตหนังสั้น 3,000s / 308 ฉาก&quot; ด้านบนเพื่อสังเคราะห์ภาพยนตร์เต็มเรื่อง
                  หรือคลิก &quot;เพิ่มฉาก&quot; เพื่อเขียนด้วยตนเอง
                </p>
                <button
                  onClick={onGenerateVipMovie}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  ⚡ ผลิตหนังสั้น 3,000 วินาที รวม 308 ฉาก (VIP Mode)
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOCATIONS OVERVIEW */}
        {activeTab === "locations" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-sm font-bold text-slate-200">ภาพรวมสถานที่และแสงบรรยากาศ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.locations.map((loc) => (
                <div key={loc.id} className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-500 text-cyan-300 font-mono font-bold rounded text-xs">
                      {loc.code}
                    </span>
                    <span className="text-xs text-slate-400">
                      ปรากฏใน {project.scenes.filter((s) => s.locationId === loc.id).length} ฉาก
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{loc.name}</h4>
                  <p className="text-xs text-slate-300">{loc.description}</p>
                  <div className="text-[11px] bg-slate-900 p-2 rounded border border-slate-800 text-cyan-300">
                    💡 <strong>แสง & บรรยากาศ:</strong> {loc.atmosphere}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STYLES */}
        {activeTab === "styles" && (
          <div className="max-w-3xl mx-auto bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white">🎨 สไตล์ภาพยนตร์ และ Mood & Tone</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  แนวภาพยนตร์ (Genre)
                </label>
                <input
                  type="text"
                  value={project.genre}
                  onChange={(e) => onUpdateProject({ ...project, genre: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  สไตล์ภาพและงานภาพ (Visual Aesthetics)
                </label>
                <textarea
                  value={project.visualStyle}
                  onChange={(e) => onUpdateProject({ ...project, visualStyle: e.target.value })}
                  rows={3}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  สไตล์การกำกับของผู้กำกับ (Director Style & Color Grading)
                </label>
                <select
                  value={project.directorStyle}
                  onChange={(e) => onUpdateProject({ ...project, directorStyle: e.target.value })}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-slate-200 mb-2 focus:outline-none focus:border-amber-400"
                >
                  {DIRECTOR_STYLES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={project.directorStyle}
                  onChange={(e) => onUpdateProject({ ...project, directorStyle: e.target.value })}
                  placeholder="หรือพิมพ์ชื่อผู้กำกับ / สไตล์ย้อมสีเฉพาะ..."
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CINEMATOGRAPHY */}
        {activeTab === "cinema" && (
          <div className="max-w-3xl mx-auto bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">🎥 สเปกการถ่ายทำและการตั้งค่ากล้อง</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
                <h4 className="font-bold text-amber-300 mb-2">Cinematic Lens Setting</h4>
                <p className="text-slate-300">เลนส์หลัก: <strong>35mm Anamorphic Prime f/1.8</strong></p>
                <p className="text-slate-400 mt-1">ให้โบเก้ทรงรีสวยงาม แฟลร์แนวนอนระดับภาพยนตร์ฮอลลีวูด</p>
              </div>

              <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700">
                <h4 className="font-bold text-cyan-300 mb-2">Frame Rate & Resolution</h4>
                <p className="text-slate-300">อัตราเฟรม: <strong>60fps High Dynamic Motion</strong></p>
                <p className="text-slate-400 mt-1">ความละเอียด: <strong>8K UHD Cinema Native</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI CONSTRAINTS */}
        {activeTab === "aiRules" && (
          <div className="max-w-3xl mx-auto bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              ⚠️ บังคับ Ai (AI Negative Directives & Quality Constraints)
            </h3>
            <p className="text-xs text-slate-400">
              กฎเหล็กเหล่านี้จะถูกนำไปฝังใน Section 4 ของทุกฉาก เพื่อป้องกันการกระตุก การเบลอ นิ้วมือเพี้ยน หรือหน้าตาหลุดแคสต์
            </p>

            <div className="space-y-2">
              {(project.aiRules || []).map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-[#1e293b] border border-slate-700 px-3 py-2 rounded-lg text-xs"
                >
                  <span className="text-slate-200">🔒 {rule}</span>
                  <button
                    onClick={() => handleDeleteAiRule(idx)}
                    className="text-slate-400 hover:text-rose-400 text-xs px-2 py-1"
                  >
                    ลบ
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="เพิ่มกฎบังคับ AI ใหม่ เช่น ห้ามเปลี่ยนชุดเสื้อผ้า..."
                className="flex-1 bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-400"
              />
              <button
                onClick={handleAddAiRule}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
              >
                เพิ่มกฎ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
