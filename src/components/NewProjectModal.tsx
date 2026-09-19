'use client';

import React, { useState } from 'react';
import { Sparkles, Film, Palette, Clock, User, ShieldAlert, Check } from 'lucide-react';
import { MovieGenre, VisualMedium, StylePreset } from '@/lib/types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

export default function NewProjectModal({ isOpen, onClose, onCreated }: NewProjectModalProps) {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [genre, setGenre] = useState<MovieGenre>('xianxia_cultivation');
  const [visualMedium, setVisualMedium] = useState<VisualMedium>('animation');
  const [stylePreset, setStylePreset] = useState<StylePreset>('donghua_3d');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(60);
  
  // Characters
  const [leadHeroName, setLeadHeroName] = useState('เซียวเฉิน');
  const [leadHeroAnchor, setLeadHeroAnchor] = useState(
    'จอมยุทธ์หนุ่มรูปงาม ผมยาวสีขาวเงินเกล้ามวยด้วยปิ่นหยกขาว สวมชุดคลุมเต๋าผ้าไหมสีดำปักดิ้นทอง แววตาสีอำพัน สะพายกระบี่เทพโบราณสีครามไว้ด้านหลัง สไตล์อนิเมะจีน 3D สวยสง่า'
  );
  const [antagonistName, setAntagonistName] = useState('จ้าวอสูรโลหิต');
  const [antagonistAnchor, setAntagonistAnchor] = useState(
    'จ้าวอสูรผู้เกรงขาม แววตาสีแดงเพลิงเรืองรอง สวมชุดเกราะหนามสีดำทมิฬ มีไอหมอกมารสีเลือดแผ่ออกมารอบตัว สไตล์อนิเมะจีน 3D น่าเกรงขาม'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Auto-switch style preset when visual medium changes
  const handleMediumChange = (medium: VisualMedium) => {
    setVisualMedium(medium);
    if (medium === 'live_action') {
      setStylePreset('hollywood_cinematic');
      setLeadHeroAnchor('นักแสดงชายเอเชียหนุ่มรูปงาม ผิวหนังสมจริง คมชัดระดับภาพยนตร์ เลนส์ 35 มม.');
    } else {
      setStylePreset('donghua_3d');
      setLeadHeroAnchor('จอมยุทธ์หนุ่มรูปงาม ผมยาวสีขาวเงินเกล้ามวยด้วยปิ่นหยกขาว สวมชุดคลุมเต๋าผ้าไหมสีดำปักดิ้นทอง แววตาสีอำพัน สะพายกระบี่เทพโบราณสีคราม สไตล์อนิเมะจีน 3D สวยสง่า');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('กรุณาระบุชื่อเรื่อง');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          synopsis,
          genre,
          visualMedium,
          stylePreset,
          targetDurationMinutes,
          leadHeroName,
          leadHeroAnchor,
          antagonistName,
          antagonistAnchor,
        }),
      });

      const data = await res.json();
      if (data.success && data.project) {
        onCreated(data.project.id);
        onClose();
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-studio-900 border border-studio-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 relative">
        <div className="flex items-center justify-between pb-4 border-b border-studio-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">สร้างโปรเจกต์คลิป YouTube ใหม่</h2>
              <p className="text-xs text-gray-400">
                กำหนดแนวเรื่อง เลือกระหว่างคนจริง/การ์ตูน และตั้งค่าความยาวระดับชั่วโมง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-studio-800"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              ชื่อเรื่อง / หัวข้อคลิป YouTube *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น: มหากาพย์มหาเทพกระบี่สายฟ้า ทะลวง 9 ดินแดน (รวมตอน 1 ชั่วโมงเต็ม)"
              className="w-full px-4 py-2.5 rounded-xl bg-studio-950 border border-studio-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
            />
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              เรื่องย่อ / พล็อตเรื่องหลัก
            </label>
            <textarea
              rows={2}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="เล่าคร่าวๆ ว่าตัวเอกเป็นใคร โดนหักหลังอย่างไร ค้นพบพลังอะไร และจะไปสู้กับใคร..."
              className="w-full px-4 py-2.5 rounded-xl bg-studio-950 border border-studio-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
            />
          </div>

          {/* Target Duration ("รันชั่วโมง") */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
              เป้าหมายความยาวคลิป (&quot;รันชั่วโมง&quot;)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { mins: 15, label: '15 นาที', sub: '~2,000 คำ' },
                { mins: 30, label: '30 นาที', sub: '~4,000 คำ' },
                { mins: 60, label: '60 นาที (1 ชม.)', sub: '~8,000 คำ (แนะนำ)' },
                { mins: 120, label: '120 นาที (2 ชม.)', sub: '~16,000 คำ มหากาพย์' },
              ].map((item) => (
                <button
                  key={item.mins}
                  type="button"
                  onClick={() => setTargetDurationMinutes(item.mins)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    targetDurationMinutes === item.mins
                      ? 'bg-amber-500/15 border-amber-500 text-white shadow-glow'
                      : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                  }`}
                >
                  <p className="text-xs font-bold text-gray-100">{item.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Medium Selector: คนจริง vs การ์ตูน */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              <Palette className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
              เลือกประเภทภาพ (Medium Selector) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleMediumChange('animation')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  visualMedium === 'animation'
                    ? 'bg-gradient-to-br from-amber-500/15 to-purple-500/15 border-amber-400 text-white shadow-glow'
                    : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                }`}
              >
                {visualMedium === 'animation' && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  🎨 การ์ตูน / แอนิเมชัน
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  3D Donghua อนิเมะจีนกำลังภายใน (เพื่อนที่ดีที่สุด SAN1 Style), 2D Anime ญี่ปุ่น, มันฮวา
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleMediumChange('live_action')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  visualMedium === 'live_action'
                    ? 'bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border-cyan-400 text-white shadow-cyanGlow'
                    : 'bg-studio-950/60 border-studio-800 text-gray-400 hover:border-studio-700'
                }`}
              >
                {visualMedium === 'live_action' && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  🎬 คนจริง (Live-Action)
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  ภาพยนตร์เสมือนคนจริง 35mm/70mm IMAX, ผิวหนังและแสงเงาแบบภาพยนตร์ฮอลลีวูด
                </p>
              </button>
            </div>
          </div>

          {/* Genre and Style Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Genre */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                หมวดหมู่ / สไตล์ภาพยนตร์
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as MovieGenre)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-studio-950 border border-studio-700 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="xianxia_cultivation">
                  ⚔️ บำเพ็ญเพียร / กำลังภายใน (เพื่อนที่ดีที่สุด SAN1)
                </option>
                <option value="action_scifi">🚀 แอ็กชัน / ไซไฟ / ไซเบอร์พังก์</option>
                <option value="epic_fantasy">🐉 แฟนตาซีมหากาพย์ / เวทมนตร์</option>
                <option value="horror_thriller">👻 สยองขวัญ / ระทึกขวัญมืดมน</option>
                <option value="mystery_noir">🕵️ สืบสวน / นัวร์ นีออน ฝนตก</option>
                <option value="historical_war">🏛️ ย้อนยุค / สงครามประวัติศาสตร์</option>
              </select>
            </div>

            {/* Sub-style Preset */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                สไตล์งานภาพเรนเดอร์
              </label>
              <select
                value={stylePreset}
                onChange={(e) => setStylePreset(e.target.value as StylePreset)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-studio-950 border border-studio-700 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                {visualMedium === 'animation' ? (
                  <>
                    <option value="donghua_3d">
                      🔥 อนิเมะจีน 3D กำลังภายใน (สไตล์ เพื่อนที่ดีที่สุด SAN1)
                    </option>
                    <option value="anime_2d">🌸 อนิเมะญี่ปุ่น 2D ระดับโรงภาพยนตร์</option>
                    <option value="western_3d">🎭 แอนิเมชัน 3D ระดับโลก (สไตล์ฮอลลีวูด)</option>
                    <option value="manhwa_action">⚡ มันฮวาเกาหลี แอ็กชันดาร์กแฟนตาซี</option>
                  </>
                ) : (
                  <>
                    <option value="hollywood_cinematic">🎞️ ภาพยนตร์คนจริง เลนส์ 35 มม. แสงเงาลุ่มลึก</option>
                    <option value="imax_70mm">🎥 ภาพยนตร์คนจริง กล้องยักษ์ IMAX 70 มม. คมชัดสูงสุด</option>
                    <option value="dark_noir">🌧️ ภาพยนตร์คนจริง ดาร์กฟิล์มนัวร์ ถนนเปียกฝน นีออน</option>
                    <option value="vintage_film">📼 ภาพยนตร์คนจริง สไตล์ฟิล์มย้อนยุคคลาสสิก</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Character Anchor Setup (Crucial for Continuity!) */}
          <div className="p-4 rounded-xl bg-studio-950/70 border border-studio-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> ล็อคหน้าตาตัวละคร (Character Continuity Anchor)
              </span>
              <span className="text-[10px] text-gray-400">ควบคุมไม่ให้หน้าเปลี่ยนข้ามฉาก</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-gray-300 font-medium block mb-1">ชื่อพระเอก/ตัวเอก</label>
                <input
                  type="text"
                  value={leadHeroName}
                  onChange={(e) => setLeadHeroName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-studio-900 border border-studio-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-gray-300 font-medium block mb-1">ชื่อศัตรู/ตัวร้าย</label>
                <input
                  type="text"
                  value={antagonistName}
                  onChange={(e) => setAntagonistName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-studio-900 border border-studio-700 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-[11px] block mb-1">
                Visual Anchor (จุดเด่นรูปลักษณ์ที่จะถูกแทรกในทุกฉาก):
              </label>
              <input
                type="text"
                value={leadHeroAnchor}
                onChange={(e) => setLeadHeroAnchor(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-studio-900 border border-studio-700 text-gray-200 text-xs font-mono"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-studio-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'กำลังสร้างโปรเจกต์...' : 'เริ่มสร้างสตูดิโอ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
