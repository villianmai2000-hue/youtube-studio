"use client";

import React, { useState } from "react";
import { ProjectData } from "@/lib/types";
import { generateProductionPrompt } from "@/lib/cineprompt-engine";
import { Copy, Check, Download, FileText, Sparkles, Film, Share2 } from "lucide-react";

interface OutputExportSidebarProps {
  project: ProjectData;
  selectedSceneIndex: number;
  onSelectSceneIndex: (index: number) => void;
  onExportJson: () => void;
}

export const OutputExportSidebar: React.FC<OutputExportSidebarProps> = ({
  project,
  selectedSceneIndex,
  onSelectSceneIndex,
  onExportJson,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedScene = project.scenes[selectedSceneIndex] || project.scenes[0];

  const prompts = selectedScene
    ? generateProductionPrompt(selectedScene, project)
    : {
        cameraLens: "ยังไม่มีฉากที่เลือก",
        subjectsStaging: "-",
        lightingStyle: "-",
        negativeConstraints: "-",
        fullCombinedPrompt: "-",
      };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportText = () => {
    const textLines = project.scenes.map((s) => {
      const p = generateProductionPrompt(s, project);
      return `=== ฉากที่ ${s.sceneNumber} (${s.startTimeSec}-${s.endTimeSec} วินาที) ===\nผู้พูด: ${s.speaker || "-"}\nผู้ฟัง: ${s.listener || "-"}\nบทพูด: "${s.dialogue || "-"}"\nการกระทำ: ${s.action || "-"}\n\n[PRODUCTION PROMPT]:\n${p.fullCombinedPrompt}\n\n`;
    });
    const blob = new Blob([textLines.join("\n----------------------------------------\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "_")}_production_prompts.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-96 shrink-0 bg-[#0d1322] border-l border-slate-800 flex flex-col h-[calc(100vh-53px)] overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-[#111827] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            3. ผลลัพธ์ & ส่งออก
          </h2>
        </div>

        {/* Scene Dropdown */}
        {project.scenes.length > 0 && (
          <select
            value={selectedSceneIndex}
            onChange={(e) => onSelectSceneIndex(parseInt(e.target.value) || 0)}
            className="bg-[#1e293b] border border-slate-700 text-amber-300 font-mono font-bold text-xs rounded px-2 py-1 focus:outline-none focus:border-amber-400"
          >
            {project.scenes.map((s, idx) => (
              <option key={s.id || idx} value={idx}>
                ฉาก {s.sceneNumber} ({s.startTimeSec}s-{s.endTimeSec}s)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Prompts Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {selectedScene ? (
          <>
            {/* Section 1: Camera & Lens */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 text-[11px] uppercase tracking-wide">
                  1. Camera & Lens Settings
                </span>
                <button
                  onClick={() => handleCopy("camera", prompts.cameraLens)}
                  className="px-2 py-0.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded text-[10px] flex items-center gap-1 transition"
                >
                  {copiedKey === "camera" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  คัดลอก
                </button>
              </div>
              <p className="text-[11px] text-slate-300 font-mono bg-[#090d16] p-2 rounded-lg border border-slate-800/80 leading-relaxed break-words">
                {prompts.cameraLens}
              </p>
            </div>

            {/* Section 2: Subjects & Staging */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wide">
                  2. Subjects & Staging
                </span>
                <button
                  onClick={() => handleCopy("subjects", prompts.subjectsStaging)}
                  className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-[10px] flex items-center gap-1 transition"
                >
                  {copiedKey === "subjects" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  คัดลอก
                </button>
              </div>
              <p className="text-[11px] text-slate-300 font-mono bg-[#090d16] p-2 rounded-lg border border-slate-800/80 leading-relaxed break-words">
                {prompts.subjectsStaging}
              </p>
            </div>

            {/* Section 3: Lighting & Style */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400 text-[11px] uppercase tracking-wide">
                  3. Lighting & Style
                </span>
                <button
                  onClick={() => handleCopy("lighting", prompts.lightingStyle)}
                  className="px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded text-[10px] flex items-center gap-1 transition"
                >
                  {copiedKey === "lighting" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  คัดลอก
                </button>
              </div>
              <p className="text-[11px] text-slate-300 font-mono bg-[#090d16] p-2 rounded-lg border border-slate-800/80 leading-relaxed break-words">
                {prompts.lightingStyle}
              </p>
            </div>

            {/* Section 4: Negative & Constraints */}
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-400 text-[11px] uppercase tracking-wide">
                  4. Negative & AI Constraints
                </span>
                <button
                  onClick={() => handleCopy("negative", prompts.negativeConstraints)}
                  className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded text-[10px] flex items-center gap-1 transition"
                >
                  {copiedKey === "negative" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  คัดลอก
                </button>
              </div>
              <p className="text-[11px] text-slate-300 font-mono bg-[#090d16] p-2 rounded-lg border border-slate-800/80 leading-relaxed break-words">
                {prompts.negativeConstraints}
              </p>
            </div>

            {/* Full All-in-One Copy */}
            <button
              onClick={() => handleCopy("all", prompts.fullCombinedPrompt)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              {copiedKey === "all" ? (
                <>
                  <Check className="w-4 h-4 text-slate-950 font-black" />
                  <span>คัดลอกพร้อมต์ทั้งหมดแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-950" />
                  <span>🔥 คัดลอกพร้อมต์ทั้งหมด (All-in-One)</span>
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">เลือกฉากเพื่อแสดงผลพร้อมต์</div>
        )}
      </div>

      {/* Bottom Export Bar */}
      <div className="p-3 bg-[#111827] border-t border-slate-800 space-y-2 shrink-0 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportJson}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center justify-center gap-1.5 font-medium transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>ดาวน์โหลด JSON</span>
          </button>

          <button
            onClick={handleExportText}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center justify-center gap-1.5 font-medium transition"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>ดาวน์โหลด Text</span>
          </button>
        </div>
      </div>
    </div>
  );
};
