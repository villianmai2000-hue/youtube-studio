"use client";

import React, { useState, useEffect } from "react";
import { Key, X, Check, ExternalLink } from "lucide-react";
import { getGeminiApiKey, setGeminiApiKey } from "@/lib/cineprompt-engine";

interface GeminiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GeminiSettingsModal: React.FC<GeminiSettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(apiKey);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 bg-[#161f36] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">ตั้งค่า Google Gemini API Key</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <p className="text-slate-300 leading-relaxed">
            API Key จะถูกบันทึกไว้อย่างปลอดภัยในเบราว์เซอร์ของคุณ (LocalStorage)
            สำหรับใช้ฟีเจอร์ AI ช่วยคิดพล็อตเรื่อง, วางโครงเรื่อง 10 บีท และสังเคราะห์บทหนัง
          </p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Gemini API Key (AI Studio)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
          >
            <span>รับคีย์ฟรีได้ที่ Google AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {saved && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>บันทึก API Key เรียบร้อยแล้ว!</span>
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
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded"
            >
              บันทึกคีย์
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
