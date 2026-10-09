"use client";

import React from "react";
import { ProjectData } from "@/lib/types";
import { Film, Sparkles, Key, Download, Upload, ListOrdered, Save, Clapperboard } from "lucide-react";

interface HeaderNavProps {
  project: ProjectData;
  onUpdateProject: (updated: ProjectData) => void;
  onOpenPlotModal: () => void;
  onOpen10BeatsModal: () => void;
  onOpenApiKeyModal: () => void;
  onOpenImportModal: () => void;
  onExportJson: () => void;
  lastSaved: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  project,
  onUpdateProject,
  onOpenPlotModal,
  onOpen10BeatsModal,
  onOpenApiKeyModal,
  onOpenImportModal,
  onExportJson,
  lastSaved,
}) => {
  return (
    <header className="bg-[#0b101d]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between gap-4">
      {/* Brand & VIP Badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
          <Clapperboard className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-wide text-white">
              CinePrompt Studio <span className="text-amber-400 text-xs font-semibold">(v8)</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-sm shadow-amber-500/30">
              VIP Mode
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>3,000s / 308 Scenes Director</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Save className="w-3 h-3 inline" /> บันทึกอัตโนมัติ: {lastSaved}
            </span>
          </div>
        </div>
      </div>

      {/* Project Title Input */}
      <div className="flex-1 max-w-xl mx-2 hidden md:block">
        <input
          type="text"
          value={project.title}
          onChange={(e) => onUpdateProject({ ...project, title: e.target.value })}
          className="w-full bg-[#111827]/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-400 font-medium transition"
          placeholder="ชื่อโปรเจกต์ภาพยนตร์..."
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenPlotModal}
          className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/40 rounded-lg text-xs font-medium text-purple-200 flex items-center gap-1.5 transition"
          title="ให้ AI ช่วยคิดพล็อตหนังและเรื่องย่อ"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span className="hidden sm:inline">คิดพล็อต AI</span>
        </button>

        <button
          onClick={onOpen10BeatsModal}
          className="px-2.5 py-1.5 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/40 hover:to-cyan-600/40 border border-blue-500/40 rounded-lg text-xs font-medium text-blue-200 flex items-center gap-1.5 transition"
          title="โครงเรื่อง 10 บีท 10 ตอน"
        >
          <ListOrdered className="w-3.5 h-3.5 text-blue-300" />
          <span className="hidden sm:inline">โครงเรื่อง 10 บีท</span>
        </button>

        <button
          onClick={onOpenApiKeyModal}
          className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5 transition"
          title="ตั้งค่า Gemini API Key"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">API Key</span>
        </button>

        <button
          onClick={onOpenImportModal}
          className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5 transition"
          title="นำเข้าไฟล์ JSON"
        >
          <Upload className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">นำเข้า</span>
        </button>

        <button
          onClick={onExportJson}
          className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg text-xs font-medium text-amber-300 flex items-center gap-1.5 transition shadow-sm"
          title="ส่งออกไฟล์ JSON ของโปรเจกต์"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">ส่งออก JSON</span>
        </button>
      </div>
    </header>
  );
};
