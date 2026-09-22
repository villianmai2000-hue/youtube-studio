'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Key, CheckCircle2, AlertCircle, ExternalLink, X, RefreshCw, Trash2 } from 'lucide-react';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: (key: string) => void;
}

export default function GeminiKeyModal({ isOpen, onClose, onKeySaved }: GeminiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('studio_gemini_api_key') || '';
      setApiKey(storedKey);
      setTestStatus('idle');
      setTestMessage('');
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      localStorage.removeItem('studio_gemini_api_key');
      window.dispatchEvent(new Event('gemini_key_change'));
      onKeySaved?.('');
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
      return;
    }

    localStorage.setItem('studio_gemini_api_key', trimmed);
    window.dispatchEvent(new Event('gemini_key_change'));
    onKeySaved?.(trimmed);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestKey = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setTestStatus('error');
      setTestMessage('กรุณากรอก API Key ก่อนทำการทดสอบ');
      return;
    }

    setTestStatus('testing');
    setTestMessage('กำลังทดสอบการเชื่อมต่อกับ Google Gemini 2.0 Flash...');

    try {
      const startTime = Date.now();
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${trimmed}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'สวัสดี ตอบกลับสั้นๆ หนึ่งคำ: พร้อม' }] }],
          }),
        }
      );

      const latency = Date.now() - startTime;

      if (res.ok) {
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'พร้อม';
        setTestStatus('success');
        setTestMessage(`เชื่อมต่อสำเร็จ! โมเดล Gemini 2.0 Flash ตอบกลับ: "${reply}" (ความเร็ว: ${latency}ms)`);
      } else {
        // Fallback to test gemini-1.5-flash
        const resFallback = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${trimmed}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'สวัสดี' }] }],
            }),
          }
        );

        if (resFallback.ok) {
          setTestStatus('success');
          setTestMessage(`เชื่อมต่อสำเร็จ! ใช้งานผ่านโมเดล Gemini 1.5 Flash`);
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `รหัสข้อผิดพลาด ${res.status}`;
          setTestStatus('error');
          setTestMessage(`การเชื่อมต่อล้มเหลว: ${errMsg} (โปรดตรวจสอบความถูกต้องของ Key)`);
        }
      }
    } catch (err: unknown) {
      setTestStatus('error');
      setTestMessage(
        err instanceof Error ? `ข้อผิดพลาดเครือข่าย: ${err.message}` : 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Google ได้'
      );
    }
  };

  const handleClear = () => {
    localStorage.removeItem('studio_gemini_api_key');
    setApiKey('');
    setTestStatus('idle');
    setTestMessage('ลบคีย์ออกจากระบบแล้ว');
    window.dispatchEvent(new Event('gemini_key_change'));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-studio-900 border border-studio-700 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-studio-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-cyan-500 text-white shadow-lg shadow-amber-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ตั้งค่า Google Gemini API Key
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI ตัวจริง
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                เชื่อมต่อ Gemini API เพื่อให้ระบบเขียนบทและสร้างตัวละครตรงตามพล็อตเรื่อง 100%
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-studio-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-4 rounded-2xl bg-studio-950/80 border border-studio-800 text-xs space-y-2 text-gray-300">
          <p className="font-semibold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            วิธีรับ Google Gemini API Key (ฟรี):
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-300 pl-1 leading-relaxed">
            <li>
              เข้าสู่เว็บไซต์{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>ล็อกอินด้วยบัญชี Google ของคุณ แล้วกดปุ่ม <strong>&quot;Create API key&quot;</strong></li>
            <li>คัดลอกคีย์ที่ได้ (ขึ้นต้นด้วย <code>AIzaSy...</code>) แล้วนำมาวางในช่องด้านล่าง</li>
          </ol>
          <p className="text-[11px] text-gray-400 italic pt-1 border-t border-studio-800">
            * คีย์จะถูกจัดเก็บอย่างปลอดภัยบนเบราว์เซอร์ของคุณเท่านั้น (Local Storage) ไม่ส่งต่อไปยังที่อื่น
          </p>
        </div>

        {/* Input Form */}
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-semibold text-gray-300">
            Google Gemini API Key:
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="วางคีย์ AIzaSy... ที่นี่"
              className="w-full px-4 py-3 bg-studio-950 border border-studio-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
            />
          </div>

          {/* Test Status Banner */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testStatus === 'testing'
                  ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                  : testStatus === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              {testStatus === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
              <span className="leading-relaxed">{testMessage}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>บันทึกการตั้งค่า Gemini API เรียบร้อยแล้ว!</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-studio-800">
          <div>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors"
                title="ลบคีย์ที่บันทึกไว้"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบคีย์</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testStatus === 'testing' || !apiKey.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-studio-800 hover:bg-studio-700 text-white text-xs font-semibold border border-studio-700 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>ทดสอบคีย์</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-glow transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>บันทึกคีย์</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
