"use client";

import React, { useState } from "react";
import { Upload, X, Check, FileJson } from "lucide-react";
import { ProjectData, ScriptScene } from "@/lib/types";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: ProjectData;
  onImportComplete: (updated: ProjectData) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onImportComplete,
}) => {
  const [mode, setMode] = useState<"replace" | "append">("append");
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setJsonText((ev.target?.result as string) || "");
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setError(null);
    if (!jsonText.trim()) {
      setError("กรุณาเลือกไฟล์หรือวาง JSON");
      return;
    }
    try {
      const parsed = JSON.parse(jsonText);

      // Support either full ProjectData or Array of scenes
      let importedScenes: ScriptScene[] = [];
      let importedProject: Partial<ProjectData> = {};

      if (Array.isArray(parsed)) {
        importedScenes = parsed;
      } else if (parsed.scenes && Array.isArray(parsed.scenes)) {
        importedScenes = parsed.scenes;
        importedProject = parsed;
      } else {
        throw new Error("โครงสร้างไฟล์ JSON ไม่ถูกต้อง (ต้องมีรายการ scenes หรือ array ของฉาก)");
      }

      if (mode === "replace") {
        const full: ProjectData = {
          ...currentProject,
          ...importedProject,
          scenes: importedScenes.map((s, idx) => ({ ...s, sceneNumber: idx + 1 })),
        };
        onImportComplete(full);
      } else {
        // Append mode
        const existingCount = currentProject.scenes.length;
        const appended = importedScenes.map((s, idx) => ({
          ...s,
          id: `scene-appended-${Date.now()}-${idx}`,
          sceneNumber: existingCount + idx + 1,
        }));
        onImportComplete({
          ...currentProject,
          scenes: [...currentProject.scenes, ...appended],
        });
      }

      onClose();
    } catch (err: any) {
      setError(err.message || "รูปแบบ JSON ไม่ถูกต้อง");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 bg-[#161f36] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white">นำเข้าข้อมูลฉาก (Import JSON)</h3>
              <p className="text-[11px] text-slate-400">
                รองรับไฟล์ JSON ของโปรเจกต์ หรือ JSON ฉากที่สร้างจาก AI
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Mode choice */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">
              รูปแบบการนำเข้าฉาก (Import Mode):
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition ${
                  mode === "append"
                    ? "bg-sky-950/60 border-sky-500 text-sky-200"
                    : "bg-[#1e293b] border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="importMode"
                    checked={mode === "append"}
                    onChange={() => setMode("append")}
                    className="text-sky-500"
                  />
                  <span className="font-bold text-white">ต่อท้ายฉากเดิม (Append)</span>
                </div>
                <span className="text-[11px] text-slate-400 pl-5">
                  เพิ่มฉากใหม่ต่อท้ายฉากที่มีอยู่ (เทคนิคช่วงที่ 2-10)
                </span>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition ${
                  mode === "replace"
                    ? "bg-amber-950/60 border-amber-500 text-amber-200"
                    : "bg-[#1e293b] border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="importMode"
                    checked={mode === "replace"}
                    onChange={() => setMode("replace")}
                    className="text-amber-500"
                  />
                  <span className="font-bold text-white">ทับทั้งหมด (Replace All)</span>
                </div>
                <span className="text-[11px] text-slate-400 pl-5">
                  ล้างฉากเดิมออกแล้วใส่ฉากจากไฟล์ทั้งหมด
                </span>
              </label>
            </div>
          </div>

          {/* Upload file or paste text */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">เลือกไฟล์ JSON:</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="w-full text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">หรือวางข้อความ JSON ที่นี่:</label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={5}
              placeholder='[ { "sceneNumber": 1, "dialogue": "...", ... } ]'
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-sky-400 resize-none"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>เริ่มการนำเข้า</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
