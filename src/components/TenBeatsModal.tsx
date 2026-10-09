"use client";

import React, { useState } from "react";
import { TenBeatItem } from "@/lib/types";
import { generate10BeatsWithAi } from "@/lib/gemini-service";
import { ListOrdered, X, Sparkles, Loader2, Check } from "lucide-react";

interface TenBeatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  beats: TenBeatItem[];
  title: string;
  synopsis: string;
  onUpdateBeats: (updated: TenBeatItem[]) => void;
}

export const TenBeatsModal: React.FC<TenBeatsModalProps> = ({
  isOpen,
  onClose,
  beats,
  title,
  synopsis,
  onUpdateBeats,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateAi = async () => {
    setLoading(true);
    setError(null);
    try {
      const generated = await generate10BeatsWithAi(title, synopsis);
      onUpdateBeats(generated);
    } catch (err: any) {
      setError(err.message || "ไม่สามารถสร้างโครงเรื่องได้ กรุณาตรวจเช็ก API Key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#161f36] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                โครงสร้างภาพยนตร์ 10 บีท (10-Beat Story Outline)
              </h3>
              <p className="text-[11px] text-slate-400">
                แบ่งสัดส่วนเนื้อเรื่อง 1 ชั่วโมง ออกเป็น 10 ช่วงต่อเนื่อง เพื่อป้องกัน AI สับสนหรือตัดตอน
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-3 bg-[#0d1322] border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-300">
            ภาพยนตร์: <strong className="text-amber-300">{title}</strong>
          </span>
          <button
            onClick={handleGenerateAi}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>ให้ AI คำนวณ 10 บีทใหม่</span>
          </button>
        </div>

        {error && (
          <div className="m-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Beats List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5 text-xs">
          {beats.map((b) => (
            <div
              key={b.beatNumber}
              className="bg-[#161f36]/70 border border-slate-800 rounded-xl p-3 flex items-start gap-3 hover:border-slate-700 transition"
            >
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 font-black flex items-center justify-center shrink-0 font-mono">
                {b.beatNumber}
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">{b.title}</h4>
                  <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    ⏱️ {b.timeRange}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{b.goal}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#111827] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
          >
            เรียบร้อย
          </button>
        </div>
      </div>
    </div>
  );
};
