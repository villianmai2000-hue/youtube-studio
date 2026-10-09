"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, X, Check } from "lucide-react";
import { generateAiPlotIdeas } from "@/lib/gemini-service";

interface AiPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPlot: (data: { title: string; synopsis: string; visualStyle: string; genre: string }) => void;
}

export const AiPlotModal: React.FC<AiPlotModalProps> = ({ isOpen, onClose, onApplyPlot }) => {
  const [topic, setTopic] = useState("");
  const [genre, setGenre] = useState("Sci-Fi Survival Action");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; synopsis: string; visualStyle: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateAiPlotIdeas(topic, genre);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการสร้างพล็อต");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApplyPlot({
      title: result.title,
      synopsis: result.synopsis,
      visualStyle: result.visualStyle,
      genre,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#161f36] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              ผู้ช่วย AI คิดพล็อตเรื่องหนังและเรื่องย่อ (AI Screenplay Ideator)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                แนวคิดหรือธีมเรื่องที่อยากได้ (Story Premise)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="เช่น ผู้รอดชีวิตคนสุดท้ายบนสถานีอวกาศที่กำลังจะตกสู่โลก, โลกาวินาศมหาพายุฝน..."
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-purple-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">แนวภาพยนตร์ (Genre)</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-purple-400"
                >
                  <option value="Sci-Fi Survival Action">Sci-Fi Survival Action (ไซไฟเอาชีวิตรอด)</option>
                  <option value="Cyberpunk Mystery Thriller">Cyberpunk Mystery Thriller (ไซเบอร์พังก์สืบสวน)</option>
                  <option value="Post-Apocalyptic Zombie">Post-Apocalyptic Zombie (ซอมบี้โลกาวินาศ)</option>
                  <option value="Anime Fantasy Isekai">Anime Fantasy Isekai (อนิเมะแฟนตาซีต่างโลก)</option>
                  <option value="Supernatural Horror">Supernatural Horror (สยองขวัญเหนือธรรมชาติ)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังวิเคราะห์พล็อต...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>คิดพล็อตเรื่องด้วย AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-[#0d1322] border border-purple-500/40 rounded-xl space-y-3">
              <div>
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">
                  ชื่อเรื่องที่แนะนำ:
                </span>
                <h4 className="text-base font-extrabold text-white mt-0.5">{result.title}</h4>
              </div>

              <div>
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">
                  เรื่องย่อ (Synopsis):
                </span>
                <p className="text-slate-300 leading-relaxed mt-0.5 whitespace-pre-line">{result.synopsis}</p>
              </div>

              <div>
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">
                  สไตล์ภาพ (Visual Aesthetics):
                </span>
                <p className="text-cyan-300 font-mono mt-0.5">{result.visualStyle}</p>
              </div>

              <button
                onClick={handleApply}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <Check className="w-4 h-4" />
                <span>นำพล็อตเรื่องนี้ไปใช้ในโปรเจกต์</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
