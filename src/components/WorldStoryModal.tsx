'use client';

import React, { useState } from 'react';
import { Project, WorldBuilding, StoryArchitecture } from '@/lib/types';
import {
  Globe,
  BookOpen,
  Sparkles,
  X,
  Save,
  Check,
  Compass,
  Scroll,
  Layers,
  Zap,
} from 'lucide-react';
import { WORLD_9_DIMENSIONS, STORY_8_DIMENSIONS } from '@/lib/studio-categories';

interface WorldStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSave: (updatedWorld: WorldBuilding, updatedStory: StoryArchitecture) => void;
}

export default function WorldStoryModal({
  isOpen,
  onClose,
  project,
  onSave,
}: WorldStoryModalProps) {
  const [activeTab, setActiveTab] = useState<'world' | 'story'>('world');

  // World Building 9 Dimensions state
  const [world, setWorld] = useState<WorldBuilding>(() => ({
    era: project.worldBuilding?.era || (project.worldCulture === 'thai' ? 'รัตนโกสินทร์ตอนต้น / ยุคสยามโบราณ' : project.worldCulture === 'japanese' ? 'ยุคกลางต่างโลก / ยุคเซ็นโกคุ' : 'ยุคบรรพกาลหมื่นปีแห่งแดนเซียน'),
    kingdom: project.worldBuilding?.kingdom || (project.worldCulture === 'thai' ? 'มหาอาณาจักรสยามและวังบาดาล' : project.worldCulture === 'japanese' ? 'จักรวรรดิการูดาต่างมิติ' : 'แดนเสวียนหยวนและเก้าสำนักใหญ่'),
    city: project.worldBuilding?.city || (project.worldCulture === 'thai' ? 'นครบาดาลใต้คุ้งน้ำโขง' : project.worldCulture === 'japanese' ? 'เมืองหลวงเอลฟ์และกิลด์นักผจญภัย' : 'ยอดเขาหมอกสวรรค์แห่งสำนักกระบี่'),
    terrain: project.worldBuilding?.terrain || 'เทือกเขาสูงเสียดฟ้าล้อมรอบด้วยทะเลหมอก มีถ้ำลับโบราณและสุสานกระบี่',
    culture: project.worldBuilding?.culture || 'กฎแห่งผู้แข็งแกร่งเท่านั้นคือกฎเกณฑ์ ยึดถือคุณธรรมและสายเลือดโบราณ',
    species: project.worldBuilding?.species || (project.worldCulture === 'thai' ? 'มนุษย์ผู้มีวิชาอาคม, เผ่าพญานาคราช, ภูตผี' : 'มนุษย์ผู้ฝึกเซียน, เผ่ามารโลหิต, สัตว์เทพวิญญาณ'),
    creatures: project.worldBuilding?.creatures || (project.worldCulture === 'thai' ? 'พญานาคราชเก้าเศียร, กิเลนหิมพานต์' : 'มังกรฟ้าบรรพกาล, อสูรหมื่นพิษ, จิ้งจอกเก้าหาง'),
    worldRules: project.worldBuilding?.worldRules || 'ผู้ที่จุดชีพจรแตกสลายจะไม่สามารถฝึกพลังได้ เว้นแต่จะหลอมรวมจิตกระบี่โบราณ',
    powerSystem: project.worldBuilding?.powerSystem || (project.worldCulture === 'thai' ? 'มนต์คาถาอาคม 9 ระดับ: คงกระพัน, มหาอุตม์, เมตตา' : 'ลมปราณ 9 ขอบเขต: ก่อเกิด, หลอมรวม, แก่นแท้, มหาเทพเซียน'),
  }));

  // Story Architecture 8 Dimensions state
  const [story, setStory] = useState<StoryArchitecture>(() => ({
    genre: project.subGenre || (project.genre === 'xianxia_cultivation' ? 'กำลังภายใน / เซียนบำเพ็ญเพียร' : project.genre),
    concept: project.storyArchitecture?.concept || project.synopsis || 'การพลิกชะตากรรมของชายหนุ่มผู้ถูกหักหลัง เพื่อก้าวสู่อำนาจสูงสุดและทวงคืนความยุติธรรม',
    coreTheme: project.storyArchitecture?.coreTheme || 'การต่อสู้ท้าทายโชคชะตา ฟ้าดินมิอาจกักขังเจตจำนงแห่งกระบี่',
    plotSummary: project.storyArchitecture?.plotSummary || project.synopsis || 'จากชายหนุ่มไร้ค่าที่ถูกทำลายชีพจร สู่การค้นพบกระบี่บรรพกาล หลอมรวมจิตวิญญาณ และกลับมาสยบศัตรู',
    keyScenes: project.storyArchitecture?.keyScenes || [
      'ฉากที่ 1: การตื่นรู้ของสายเลือดและการถูกขับไล่',
      'ฉากที่ 2: การค้นพบถ้ำลับและกระบี่บรรพกาลเก้าวิญญาณ',
      'ฉากที่ 3: ทะลวงจุดชีพจรบรรลุสู่ขอบเขตเซียน',
      'ฉากที่ 4: การกลับมาประจันหน้าลานประลองตระกูลใหญ่',
    ],
    plotTwists: project.storyArchitecture?.plotTwists || 'แท้จริงแล้วศัตรูคู่อาฆาตเป็นเพียงเบี้ยของจอมมารใหญ่ที่อยู่เบื้องหลังการกักขังมารดาของตัวเอก',
    climax: project.storyArchitecture?.climax || 'การปะทะเดือดครั้งสุดท้าย ณ ลานประลองเก้าสุริยัน ปลดปล่อยท่าไม้ตายเก้ากระบี่รวมหนึ่ง',
    ending: project.storyArchitecture?.ending || 'ล้างแค้นสำเร็จ กวาดล้างสำนักทรยศ และเปิดประตูสวรรค์ออกเดินทางสู่แดนเซียนระดับสูง',
  }));

  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveAll = () => {
    onSave(world, story);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-studio-950 border border-studio-700 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-studio-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 text-white shadow-lg">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                คลังข้อมูลโลก &amp; โครงเรื่อง (World &amp; Story Bible)
              </h2>
              <p className="text-xs text-amber-300 mt-0.5">
                🌍 ข้อมูลโลก 9 มิติ &bull; 📖 โครงเรื่องภาพยนตร์/อนิเมะ 8 มิติฉบับสมบูรณ์
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-studio-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 flex items-center gap-2 p-1.5 bg-studio-900/80 rounded-2xl border border-studio-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('world')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'world'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>🌍 1. ข้อมูลโลก 9 มิติ (World Building)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('story')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'story'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 2. โครงเรื่อง 8 มิติ (Story Architecture)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4 text-xs">
          {/* TAB 1: WORLD BUILDING (9 DIMENSIONS) */}
          {activeTab === 'world' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {WORLD_9_DIMENSIONS.map((dim) => {
                const val = (world as any)[dim.key] || '';
                return (
                  <div
                    key={dim.key}
                    className="p-3.5 rounded-2xl bg-studio-900/80 border border-studio-800 space-y-1.5 focus-within:border-amber-500/50 transition-colors"
                  >
                    <label className="font-bold text-amber-300 block">{dim.labelTh}:</label>
                    <textarea
                      rows={2}
                      value={val}
                      onChange={(e) => setWorld({ ...world, [dim.key]: e.target.value })}
                      placeholder={dim.placeholder}
                      className="w-full px-3 py-1.5 rounded-xl bg-studio-950 border border-studio-800 text-gray-200 text-xs leading-relaxed focus:outline-none focus:border-amber-400 placeholder-gray-600"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: STORY ARCHITECTURE (8 DIMENSIONS) */}
          {activeTab === 'story' && (
            <div className="space-y-3.5">
              {STORY_8_DIMENSIONS.map((dim) => {
                const isArray = dim.key === 'keyScenes';
                const val = isArray ? (story.keyScenes || []).join('\n') : (story as any)[dim.key] || '';

                return (
                  <div
                    key={dim.key}
                    className="p-3.5 rounded-2xl bg-studio-900/80 border border-studio-800 space-y-1.5 focus-within:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-cyan-300 block">{dim.labelTh}:</label>
                      {isArray && (
                        <span className="text-[10px] text-gray-400">(แยกฉากละ 1 บรรทัด)</span>
                      )}
                    </div>
                    <textarea
                      rows={isArray ? 4 : 2}
                      value={val}
                      onChange={(e) => {
                        if (isArray) {
                          setStory({
                            ...story,
                            keyScenes: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                          });
                        } else {
                          setStory({ ...story, [dim.key]: e.target.value });
                        }
                      }}
                      placeholder={dim.placeholder}
                      className="w-full px-3 py-1.5 rounded-xl bg-studio-950 border border-studio-800 text-gray-200 text-xs leading-relaxed focus:outline-none focus:border-cyan-400 placeholder-gray-600"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-studio-800 flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-studio-900 hover:bg-studio-800 text-gray-300 text-xs font-semibold border border-studio-800 transition-colors"
          >
            ปิด
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold shadow-glow flex items-center gap-1.5 transition-all"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>บันทึกสำเร็จ!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>บันทึกข้อมูลโลก &amp; โครงเรื่อง</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
