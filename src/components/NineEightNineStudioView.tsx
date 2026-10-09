'use client';

import React, { useState, useMemo } from 'react';
import {
  Project,
  ScriptScene,
  LocationItem,
  PropItem,
  CharacterBible,
  CharacterDialogue,
} from '@/lib/types';
import {
  FOCUS_OPTIONS,
  COMPOSITION_OPTIONS,
  SHOT_TYPES,
  CAMERA_ANGLES,
  CAMERA_MOVEMENTS,
  DEFAULT_989_AI_RULES,
  generateProductionPrompt989,
  autoReTimeScenes,
  export989ProjectJson,
  export989ScenesRangeJson,
  exportSingleSceneJson,
  import989ProjectJson,
  generateVip3000SecondsMovie,
} from '@/lib/nine-eight-nine-engine';
import { cleanSceneTitle } from '@/lib/script-templates';
import {
  Sparkles,
  Camera,
  Film,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Eye,
  EyeOff,
  Download,
  Upload,
  FileJson,
  Layers,
  MapPin,
  Briefcase,
  Sliders,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  RefreshCw,
  FolderPlus,
  Play,
  Save,
  ChevronDown,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface NineEightNineStudioViewProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onSave: () => void;
  onSwitchToClassicView: () => void;
}

export default function NineEightNineStudioView({
  project,
  onUpdateProject,
  onSave,
  onSwitchToClassicView,
}: NineEightNineStudioViewProps) {
  // 5 Main Tabs
  type TabKey = 'storyline' | 'locations' | 'styles' | 'cinematography' | 'ai_rules';
  const [activeTab, setActiveTab] = useState<TabKey>('storyline');

  // Currently focused scene for Output & Export panel
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

  // Scene range selector
  const [rangeStart, setRangeStart] = useState<string>('1');
  const [rangeEnd, setRangeEnd] = useState<string>(String(project.scenes?.length || 40));
  const [isRangeActive, setIsRangeActive] = useState<boolean>(false);

  // Collapse / expand all scenes
  const [allExpanded, setAllExpanded] = useState<boolean>(true);
  const [collapsedSceneIds, setCollapsedSceneIds] = useState<Record<string, boolean>>({});

  // Copy state feedbacks
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Modals for Props & Locations
  const [editingProp, setEditingProp] = useState<PropItem | null>(null);
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportJsonModalOpen, setIsExportJsonModalOpen] = useState(false);
  const [exportJsonPreview, setExportJsonPreview] = useState('');
  const [exportJsonTitle, setExportJsonTitle] = useState('ส่งกลับไปเป็น JSON (989 Format)');

  // Get current active scene safely
  const scenes = useMemo(() => project.scenes || [], [project.scenes]);
  const activeScene: ScriptScene | undefined = scenes[activeSceneIndex] || scenes[0];

  // Filter scenes by range if active
  const displayedScenes = useMemo(() => {
    if (!isRangeActive) return scenes;
    const start = Math.max(1, parseInt(rangeStart, 10) || 1);
    const end = Math.min(scenes.length, parseInt(rangeEnd, 10) || scenes.length);
    return scenes.filter((s) => s.sceneNumber >= start && s.sceneNumber <= end);
  }, [scenes, isRangeActive, rangeStart, rangeEnd]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Update specific scene
  const handleUpdateScene = (updatedScene: ScriptScene) => {
    const newScenes = scenes.map((s) => (s.id === updatedScene.id ? updatedScene : s));
    onUpdateProject({ ...project, scenes: newScenes });
  };

  // Delete scene
  const handleDeleteScene = (sceneId: string) => {
    if (!confirm('ยืนยันลบฉากนี้?')) return;
    const newScenes = scenes
      .filter((s) => s.id !== sceneId)
      .map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    onUpdateProject({ ...project, scenes: newScenes });
  };

  // Duplicate scene
  const handleDuplicateScene = (scene: ScriptScene) => {
    const newScene: ScriptScene = {
      ...scene,
      id: `scene-989-${Date.now()}-${scene.sceneNumber + 1}`,
      sceneNumber: scene.sceneNumber + 1,
      title: `${scene.title} (สำเนา)`,
      startTimeSec: (scene.endTimeSec || 10),
      endTimeSec: (scene.endTimeSec || 10) + 10,
    };
    const index = scenes.findIndex((s) => s.id === scene.id);
    const newScenes = [...scenes];
    newScenes.splice(index + 1, 0, newScene);
    // Renumber all scenes
    const renumbered = newScenes.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    onUpdateProject({ ...project, scenes: renumbered });
  };

  // Auto Re-Time handler
  const handleAutoReTime = () => {
    const reTimed = autoReTimeScenes(scenes, 10);
    onUpdateProject({ ...project, scenes: reTimed });
    handleCopy('', 'retime');
    alert('⏱️ เรียงเวลา (Auto Re-Time) สำเร็จครบทุกฉาก! เวลาเชื่อมต่อกันวินาทีต่อวินาที');
  };

  // Toggle Collapse / Expand All
  const handleToggleAllExpand = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    if (!nextState) {
      // Collapse all
      const map: Record<string, boolean> = {};
      scenes.forEach((s) => {
        map[s.id] = true;
      });
      setCollapsedSceneIds(map);
    } else {
      setCollapsedSceneIds({});
    }
  };

  // Add Prop
  const handleSaveProp = (prop: PropItem) => {
    const existing = project.props || [];
    const index = existing.findIndex((p) => p.id === prop.id);
    let updatedProps: PropItem[];
    if (index >= 0) {
      updatedProps = existing.map((p) => (p.id === prop.id ? prop : p));
    } else {
      updatedProps = [...existing, prop];
    }
    onUpdateProject({ ...project, props: updatedProps });
    setIsPropModalOpen(false);
    setEditingProp(null);
  };

  // Delete Prop
  const handleDeleteProp = (propId: string) => {
    const existing = project.props || [];
    onUpdateProject({ ...project, props: existing.filter((p) => p.id !== propId) });
  };

  // Add Location
  const handleSaveLocation = (loc: LocationItem) => {
    const existing = project.locations || [];
    const index = existing.findIndex((l) => l.id === loc.id);
    let updatedLocations: LocationItem[];
    if (index >= 0) {
      updatedLocations = existing.map((l) => (l.id === loc.id ? loc : l));
    } else {
      updatedLocations = [...existing, loc];
    }
    onUpdateProject({ ...project, locations: updatedLocations });
    setIsLocationModalOpen(false);
    setEditingLocation(null);
  };

  // Delete Location
  const handleDeleteLocation = (locId: string) => {
    const existing = project.locations || [];
    onUpdateProject({ ...project, locations: existing.filter((l) => l.id !== locId) });
  };

  // Export JSON file download
  const handleDownloadJson = (customJson?: string, filenameSuffix?: string) => {
    const jsonStr = customJson || export989ProjectJson(project);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}_989AiPrompt_${filenameSuffix || 'v8'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    handleCopy('', 'exported');
  };

  // Open Export JSON Modal (Preview & Copy)
  const handleOpenExportJsonModal = (type: 'full' | 'range' | 'single') => {
    let jsonStr = '';
    let title = '';
    if (type === 'full') {
      jsonStr = export989ProjectJson(project);
      title = `📦 ข้อมูล JSON ทั้งโปรเจกต์ (${project.scenes?.length || 0} ฉาก)`;
    } else if (type === 'range') {
      const start = Math.max(1, parseInt(rangeStart, 10) || 1);
      const end = Math.min(scenes.length, parseInt(rangeEnd, 10) || scenes.length);
      jsonStr = export989ScenesRangeJson(project, start, end);
      title = `📑 ข้อมูล JSON เฉพาะช่วงฉากที่ ${start} ถึง ${end} (${end - start + 1} ฉาก)`;
    } else {
      if (!activeScene) return;
      jsonStr = exportSingleSceneJson(activeScene, project);
      title = `🎬 ข้อมูล JSON เฉพาะฉากที่ ${activeScene.sceneNumber}`;
    }
    setExportJsonPreview(jsonStr);
    setExportJsonTitle(title);
    setIsExportJsonModalOpen(true);
  };

  // Quick Copy JSON to Clipboard
  const handleQuickCopyJson = (type: 'full' | 'range' | 'single') => {
    let jsonStr = '';
    let label = '';
    if (type === 'full') {
      jsonStr = export989ProjectJson(project);
      label = 'json_full';
    } else if (type === 'range') {
      const start = Math.max(1, parseInt(rangeStart, 10) || 1);
      const end = Math.min(scenes.length, parseInt(rangeEnd, 10) || scenes.length);
      jsonStr = export989ScenesRangeJson(project, start, end);
      label = 'json_range';
    } else {
      if (!activeScene) return;
      jsonStr = exportSingleSceneJson(activeScene, project);
      label = 'json_single';
    }
    navigator.clipboard.writeText(jsonStr);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Import JSON
  const handleImportJson = () => {
    try {
      const imported = import989ProjectJson(importJsonText, project);
      onUpdateProject(imported);
      setIsImportModalOpen(false);
      setImportJsonText('');
      alert('🎉 นำเข้าโปรเจกต์ 989 Ai Prompt สำเร็จเรียบร้อย!');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการนำเข้า: ' + err.message);
    }
  };

  // Calculate Production Prompt for Active Scene
  const activeLocation = useMemo(() => {
    if (!activeScene) return undefined;
    return (project.locations || []).find((l) => l.id === activeScene.locationId || l.name === activeScene.locationName);
  }, [activeScene, project.locations]);

  const activeCharacters = useMemo(() => {
    if (!activeScene) return [];
    const ids = activeScene.characterIds || [];
    const all = project.characters || [];
    if (ids.length > 0) {
      return all.filter((c) => ids.includes(c.id));
    }
    return all.slice(0, 2);
  }, [activeScene, project.characters]);

  const activeProps = useMemo(() => {
    if (!activeScene) return [];
    const ids = activeScene.propIds || [];
    const all = project.props || [];
    return all.filter((p) => ids.includes(p.id));
  }, [activeScene, project.props]);

  const productionPrompt = useMemo(() => {
    if (!activeScene) return null;
    return generateProductionPrompt989({
      scene: activeScene,
      project,
      location: activeLocation,
      charactersInScene: activeCharacters,
      propsInScene: activeProps,
    });
  }, [activeScene, project, activeLocation, activeCharacters, activeProps]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-24">
      {/* 989 Ai Prompt Header Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-teal-400 to-amber-400 p-0.5 shadow-sm flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-1">
                  <span className="text-cyan-600">989</span>
                  <span className="text-slate-800">Ai Prompt</span>
                  <span className="text-xs px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-bold border border-slate-200">
                    v8
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  VIP Mode
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs">
            <span className="font-bold text-slate-600 truncate max-w-[260px]">
              {project.title}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-cyan-700 font-semibold bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
              {project.scenes?.length || 0} ฉาก (~{(project.scenes?.length || 0) * 10} วินาที)
            </span>
          </div>
        </div>

        {/* Right Tools & Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Save button */}
          <button
            type="button"
            onClick={onSave}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">บันทึก</span>
          </button>

          {/* Switch to Classic Studio view */}
          <button
            type="button"
            onClick={onSwitchToClassicView}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="สลับกลับไปมุมมองสตูดิโอคลาสสิก"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">มุมมองคลาสสิก</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Studio Layout */}
      <div className="max-w-[1780px] mx-auto px-2 sm:px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Manage Props & Manage Locations (lg:col-span-3) */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Card 1: จัดการ Props / ยานพาหนะ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span>จัดการ Props / ยานพาหนะ</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingProp({
                    id: `PROP-${String((project.props?.length || 0) + 1).padStart(2, '0')}`,
                    name: '',
                    category: 'prop',
                    description: '',
                    colorLock: '',
                  });
                  setIsPropModalOpen(true);
                }}
                className="p-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs flex items-center gap-1 transition-colors font-bold px-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>

            {/* Props List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {(project.props || []).length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  ยังไม่มี Props ในโปรเจกต์ กดปุ่ม &quot;+ เพิ่ม&quot; ด้านบน
                </div>
              ) : (
                (project.props || []).map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-colors flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-amber-600 font-mono text-[11px] bg-amber-100/60 px-1.5 py-0.2 rounded">
                          {p.id}
                        </span>
                        <span className="font-bold text-slate-800">{p.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">({p.category})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {p.description}
                      </p>
                      {p.colorLock && (
                        <span className="inline-block mt-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          🔒 ล็อคสี: {p.colorLock}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProp(p);
                          setIsPropModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProp(p.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 2: จัดการสถานที่ (Locations) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>จัดการสถานที่ (Locations)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingLocation({
                    id: `ROOM-${String((project.locations?.length || 0) + 1).padStart(2, '0')}`,
                    name: '',
                    type: 'ภายในอาคาร',
                    timeOfDay: 'กลางวัน',
                    weather: 'ปกติ',
                    lighting: 'แสงธรรมชาติ',
                    description: '',
                  });
                  setIsLocationModalOpen(true);
                }}
                className="p-1 rounded-md bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs flex items-center gap-1 transition-colors font-bold px-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่ม</span>
              </button>
            </div>

            {/* Locations List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {(project.locations || []).length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  ยังไม่มีสถานที่ กดปุ่ม &quot;+ เพิ่ม&quot; ด้านบน
                </div>
              ) : (
                (project.locations || []).map((loc) => (
                  <div
                    key={loc.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-cyan-300 transition-colors flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-cyan-600 font-mono text-[11px] bg-cyan-100/60 px-1.5 py-0.2 rounded">
                          {loc.id}
                        </span>
                        <span className="font-bold text-slate-800">{loc.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {loc.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 flex-wrap">
                        {loc.timeOfDay && <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{loc.timeOfDay}</span>}
                        {loc.weather && <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{loc.weather}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLocation(loc);
                          setIsLocationModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Main Tabs & Scene Editor (lg:col-span-6) */}
        <main className="lg:col-span-6 space-y-4">
          {/* 5 Main Tabs Bar (เหมือนหน้าจอ 989 Ai Prompt ในคลิป) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex items-center justify-between gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('storyline')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                activeTab === 'storyline'
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              เส้นเรื่อง
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('locations')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                activeTab === 'locations'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              สถานที่
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('styles')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                activeTab === 'styles'
                  ? 'bg-amber-50 text-amber-600 border border-amber-200 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              สไตล์
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cinematography')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                activeTab === 'cinematography'
                  ? 'bg-cyan-50 text-cyan-600 border border-cyan-200 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              กำกับภาพ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai_rules')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                activeTab === 'ai_rules'
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              บังคับ Ai
            </button>
          </div>

          {/* TAB 1: เส้นเรื่อง (Storyline & Timeline) */}
          {activeTab === 'storyline' && (
            <div className="space-y-3">
              {/* Scene Controls Strip (exact as screenshot) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Total Scenes Count Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 font-black">
                    <Layers className="w-3.5 h-3.5 text-cyan-600" />
                    <span>รวมฉากทั้งหมด: {scenes.length}</span>
                  </div>

                  {/* Scene Range Selector: [1] - [End] -> ใช้ฉาก */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-semibold text-[11px]">เลือกฉาก:</span>
                    <input
                      type="number"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="number"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="w-12 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsRangeActive(!isRangeActive)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                        isRangeActive
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isRangeActive ? '✓ ใช้ฉาก' : 'ใช้ฉาก'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenExportJsonModal('range')}
                      className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors flex items-center gap-1 shadow-sm"
                      title="ส่งช่วงฉากที่เลือกนี้กลับไปเป็นไฟล์หรือข้อความ JSON สำหรับนำไปใช้งานต่อตามคลิป"
                    >
                      <FileJson className="w-3.5 h-3.5 text-amber-600" />
                      <span>ส่งกลับ JSON ช่วงนี้</span>
                    </button>
                  </div>
                </div>

                {/* Second Row: Actions Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {/* Auto Re-Time Button */}
                    <button
                      type="button"
                      onClick={handleAutoReTime}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      <span>เรียงเวลา (Auto Re-Time)</span>
                    </button>

                    {/* Open All / Hide All Scenes */}
                    <button
                      type="button"
                      onClick={handleToggleAllExpand}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      {allExpanded ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span>ซ่อนฉาก ทั้งหมด</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>เปิดฉาก ทั้งหมด</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* VIP 308 Scenes Generator Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          `⚡ ยืนยันการสร้างหนังสั้น 3,000 วินาที รวม 308 ฉาก (989 VIP Mode)?\n\nระบบจะแบ่งเป็น 10 บล็อกเนื้อเรื่อง พร้อมกำหนด Props, Locations, Focus, และ Composition ให้ครบทั้ง 308 ฉากทันที!`
                        )
                      ) {
                        const vipProject = generateVip3000SecondsMovie(project);
                        onUpdateProject(vipProject);
                        alert('🎉 สร้างหนังสั้น 3,000 วินาที รวม 308 ฉาก (VIP Mode 10 บล็อก) สำเร็จเรียบร้อย!');
                      }
                    }}
                    className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    title="สร้างหนังสั้น 3,000 วินาที รวม 308 ฉาก 10 บล็อกเนื้อเรื่อง"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>⚡ สร้างหนังสั้น 3,000s / 308 ฉาก (VIP Mode)</span>
                  </button>
                </div>
              </div>

              {/* Scenes Cards List */}
              <div className="space-y-3">
                {displayedScenes.map((scene, idx) => {
                  const isCollapsed = collapsedSceneIds[scene.id] || false;
                  const isCurrentActive = activeScene?.id === scene.id;

                  return (
                    <div
                      key={scene.id}
                      onClick={() => setActiveSceneIndex(scenes.findIndex((s) => s.id === scene.id))}
                      className={`bg-white rounded-2xl border transition-all p-4 space-y-3 shadow-sm ${
                        isCurrentActive
                          ? 'border-cyan-500 ring-2 ring-cyan-500/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Scene Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCollapsedSceneIds({
                                ...collapsedSceneIds,
                                [scene.id]: !isCollapsed,
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <span className="font-mono font-black text-cyan-600 text-sm">
                            ฉากที่ {scene.sceneNumber}
                          </span>
                          <span className="font-bold text-slate-800 text-sm">
                            {cleanSceneTitle(scene.title)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold font-mono text-[11px]">
                            ⏱️ {scene.startTimeSec ?? (scene.sceneNumber - 1) * 10} - {scene.endTimeSec ?? scene.sceneNumber * 10} วินาที
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const singleJson = exportSingleSceneJson(scene, project);
                              navigator.clipboard.writeText(singleJson);
                              handleCopy(singleJson, `scene_json_${scene.id}`);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center gap-1 transition shadow-xs"
                            title="คัดลอก JSON ของฉากนี้เพื่อส่งต่อไปใช้งาน"
                          >
                            {copyFeedback === `scene_json_${scene.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">คัดลอกแล้ว</span>
                              </>
                            ) : (
                              <>
                                <FileJson className="w-3 h-3 text-amber-600" />
                                <span>JSON</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Scene Body (Collapsible) */}
                      {!isCollapsed && (
                        <div className="space-y-3 text-xs">
                          {/* Location Dropdown Selection */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              📍 ระบุสถานที่เฉพาะฉากนี้:
                            </label>
                            <select
                              value={scene.locationName || ''}
                              onChange={(e) => {
                                const selectedLoc = (project.locations || []).find((l) => l.name === e.target.value);
                                handleUpdateScene({
                                  ...scene,
                                  locationName: e.target.value,
                                  locationId: selectedLoc?.id,
                                });
                              }}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-500 text-xs font-semibold"
                            >
                              <option value="">-- เลือกระบุสถานที่ (หรือกำหนดเอง) --</option>
                              {(project.locations || []).map((loc) => (
                                <option key={loc.id} value={loc.name}>
                                  {loc.name} ({loc.id})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* FOCUS Block (ระยะชัด / โฟกัส) */}
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[11px] text-cyan-800 flex items-center gap-1">
                                <span>🎯 FOCUS (ระยะชัด)</span>
                              </span>
                              <span className="text-[10px] text-slate-400">ควบคุมความคมชัดของเลนส์</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                              <div className="sm:col-span-6">
                                <select
                                  value={scene.focusType || 'Deep Focus (ชัดลึก (ชัดทั้งภาพ))'}
                                  onChange={(e) => handleUpdateScene({ ...scene, focusType: e.target.value })}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-cyan-500 text-xs"
                                >
                                  {FOCUS_OPTIONS.map((f) => (
                                    <option key={f.id} value={f.label}>
                                      {f.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="sm:col-span-6">
                                <input
                                  type="text"
                                  placeholder="ขยายความโฟกัส... (เช่น ชัดลึกตั้งแต่โต๊ะทำงานถึงผนังด้านหลัง)"
                                  value={scene.focusDetail || ''}
                                  onChange={(e) => handleUpdateScene({ ...scene, focusDetail: e.target.value })}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-cyan-500 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* COMPOSITION Block (การจัดองค์ประกอบภาพ) */}
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-[11px] text-teal-800 flex items-center gap-1">
                                <span>📐 COMPOSITION (การจัดองค์ประกอบภาพ)</span>
                              </span>
                              <span className="text-[10px] text-slate-400">วางตำแหน่งตัวละครและฉาก</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                              <div className="sm:col-span-6">
                                <select
                                  value={scene.compositionType || 'Center Frame (กึ่งกลางภาพ)'}
                                  onChange={(e) => handleUpdateScene({ ...scene, compositionType: e.target.value })}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-teal-500 text-xs"
                                >
                                  {COMPOSITION_OPTIONS.map((c) => (
                                    <option key={c.id} value={c.label}>
                                      {c.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="sm:col-span-6">
                                <input
                                  type="text"
                                  placeholder="ระบุตำแหน่ง... (เช่น ตัวละครอยู่กึ่งกลางเฟรม โต๊ะอยู่ขวามือ)"
                                  value={scene.compositionDetail || ''}
                                  onChange={(e) => handleUpdateScene({ ...scene, compositionDetail: e.target.value })}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Narration & Dialogues Input */}
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-700">
                              🎙️ บทบรรยายเสียงพากย์ (Narration):
                            </label>
                            <textarea
                              rows={2}
                              value={scene.narration}
                              onChange={(e) => handleUpdateScene({ ...scene, narration: e.target.value })}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
                            />
                          </div>

                          {/* Actions Footer Bar on Scene Card */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                            <div className="flex items-center gap-2">
                              <span>⏱️ เวลา: {scene.startTimeSec ?? (scene.sceneNumber - 1) * 10} - {scene.endTimeSec ?? scene.sceneNumber * 10} วิ</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateScene(scene);
                                }}
                                className="px-2 py-1 rounded-md hover:bg-slate-100 text-slate-600 font-bold"
                                title="ทำซ้ำฉากนี้"
                              >
                                สำเนาฉาก
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteScene(scene.id);
                                }}
                                className="px-2 py-1 rounded-md hover:bg-red-50 text-red-600 font-bold"
                                title="ลบฉากนี้"
                              >
                                ลบฉาก
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: สถานที่ (Locations Catalog) */}
          {activeTab === 'locations' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">🏛️ รายการสถานที่ทั้งหมดในเรื่อง</h3>
                  <p className="text-xs text-slate-500">จัดการฉากหลัง แสง และสภาพแวดล้อมให้คงที่ตลอดทั้งเรื่อง</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingLocation({
                      id: `ROOM-${String((project.locations?.length || 0) + 1).padStart(2, '0')}`,
                      name: '',
                      type: 'ภายในอาคาร',
                      timeOfDay: 'กลางวัน',
                      weather: 'ปกติ',
                      lighting: 'แสงธรรมชาติ',
                      description: '',
                    });
                    setIsLocationModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มสถานที่ใหม่</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(project.locations || []).map((loc) => (
                  <div key={loc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-cyan-600 bg-cyan-100/60 px-2 py-0.5 rounded text-[11px]">
                        {loc.id}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingLocation(loc);
                            setIsLocationModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{loc.name}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{loc.description || '-'}</p>
                    <div className="flex items-center gap-1 flex-wrap text-[10px] text-slate-500 pt-1">
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">ประเภท: {loc.type || '-'}</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">เวลา: {loc.timeOfDay || '-'}</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">แสง: {loc.lighting || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: สไตล์ (Styles) */}
          {activeTab === 'styles' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-slate-800 pb-2 border-b border-slate-100">
                🎨 สไตล์และโทนภาพยนตร์ (Styles & Aesthetics)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">สไตล์งานภาพ (Visual Medium):</label>
                  <select
                    value={project.visualMedium}
                    onChange={(e) => onUpdateProject({ ...project, visualMedium: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="animation">การ์ตูน / อนิเมะ 3D / Manhwa</option>
                    <option value="live_action">ภาพยนตร์คนจริง (Cinematic Live-Action)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">สัดส่วนหน้าจอ (Aspect Ratio):</label>
                  <select
                    value={project.aspectRatio}
                    onChange={(e) => onUpdateProject({ ...project, aspectRatio: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="16:9">16:9 แนวนอน (YouTube / Cinema)</option>
                    <option value="9:16">9:16 แนวตั้ง (TikTok / Shorts / Reels)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: กำกับภาพ (Cinematography) */}
          {activeTab === 'cinematography' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-slate-800 pb-2 border-b border-slate-100">
                🎥 การกำกับภาพและกล้อง (Cinematography Directing)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Shot Type มาตรฐาน</span>
                  <p className="text-[11px] text-slate-500">Wide Shot (WS), Medium Shot (MS), Close-Up (CU)</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Camera Angle มาตรฐาน</span>
                  <p className="text-[11px] text-slate-500">Eye-Level, Low Angle, High Angle, Dutch Angle</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Camera Movement</span>
                  <p className="text-[11px] text-slate-500">Push In, Pan Right, Tracking, Orbit 360, Static Lock</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: บังคับ Ai (AI Constraints) */}
          {activeTab === 'ai_rules' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 text-xs">
              <h3 className="font-extrabold text-base text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>🛡️ กฎเหล็กบังคับ AI (5 Constraints & Hard Rules)</span>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  เปิดใช้งานตลอดทั้งเรื่อง
                </span>
              </h3>
              <div className="space-y-2">
                {DEFAULT_989_AI_RULES.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 font-semibold leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: 3. ผลลัพธ์ & ส่งออก (Output & Export) (lg:col-span-3) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
            {/* Header: 3. ผลลัพธ์ & ส่งออก */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-sm">3. ผลลัพธ์ &amp; ส่งออก</h3>
                <span className="text-[11px] text-slate-500 font-medium">โปรเจกต์: {project.title}</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                ฉากที่ {activeScene?.sceneNumber || 1}
              </span>
            </div>

            {/* Prompt Production Generator Blocks */}
            {productionPrompt ? (
              <div className="space-y-3 text-xs">
                {/* 1. Camera & Lens Settings */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">1. 🎥 Camera &amp; Lens Settings</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(productionPrompt.cameraLensText, 'camera')}
                      className="text-slate-400 hover:text-cyan-600 text-[10px] flex items-center gap-1 font-bold"
                    >
                      {copyFeedback === 'camera' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>ก๊อปปี้</span>
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                    {productionPrompt.cameraLensText}
                  </pre>
                </div>

                {/* 2. Subjects & Staging */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">2. 👤 Subjects &amp; Staging</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(productionPrompt.subjectsStagingText, 'subjects')}
                      className="text-slate-400 hover:text-cyan-600 text-[10px] flex items-center gap-1 font-bold"
                    >
                      {copyFeedback === 'subjects' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>ก๊อปปี้</span>
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                    {productionPrompt.subjectsStagingText}
                  </pre>
                </div>

                {/* 3. Lighting & Style */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">3. 🎨 Lighting &amp; Style</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(productionPrompt.lightingStyleText, 'lighting')}
                      className="text-slate-400 hover:text-cyan-600 text-[10px] flex items-center gap-1 font-bold"
                    >
                      {copyFeedback === 'lighting' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>ก๊อปปี้</span>
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                    {productionPrompt.lightingStyleText}
                  </pre>
                </div>

                {/* Master Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {/* Copy Full Production Prompt */}
                  <button
                    type="button"
                    onClick={() => handleCopy(productionPrompt.fullPrompt, 'full')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {copyFeedback === 'full' ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>คัดลอก Production Prompt แล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-cyan-200" />
                        <span>📋 คัดลอก Production Prompt (ฉากนี้)</span>
                      </>
                    )}
                  </button>

                  {/* Copy Video Motion Prompt */}
                  <button
                    type="button"
                    onClick={() => handleCopy(activeScene.videoMotionPrompt, 'video')}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copyFeedback === 'video' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Film className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>📹 คัดลอก Video Motion Prompt</span>
                  </button>

                  {/* Copy Image Prompt */}
                  <button
                    type="button"
                    onClick={() => handleCopy(activeScene.imagePrompt, 'image')}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copyFeedback === 'image' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Camera className="w-3.5 h-3.5 text-amber-500" />}
                    <span>🎨 คัดลอก Image Prompt</span>
                  </button>

                  {/* Send Back to JSON Master Section */}
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between pb-1">
                      <span className="font-extrabold text-[11px] text-slate-800 flex items-center gap-1.5">
                        <FileJson className="w-3.5 h-3.5 text-amber-500" />
                        <span>ส่งกลับไปเป็น JSON (ตามคลิป)</span>
                      </span>
                    </div>

                    {/* Quick Copy Full Project JSON */}
                    <button
                      type="button"
                      onClick={() => handleQuickCopyJson('full')}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      title="คัดลอก JSON ทั้งโปรเจกต์ลงคลิปบอร์ดทันที เพื่อนำไปส่งให้ AI หรือบันทึกต่อ"
                    >
                      {copyFeedback === 'json_full' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 font-black" />
                          <span className="text-emerald-700">คัดลอก JSON ทั้งหมดแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-700" />
                          <span>📋 คัดลอก JSON ทั้งหมด (Send to JSON)</span>
                        </>
                      )}
                    </button>

                    {/* Quick Copy Range JSON */}
                    <button
                      type="button"
                      onClick={() => handleQuickCopyJson('range')}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      title="คัดลอก JSON เฉพาะช่วงฉากที่เลือก (ตามเทคนิคแบ่ง 10 บล็อกในคลิป)"
                    >
                      {copyFeedback === 'json_range' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">คัดลอก JSON ช่วงนี้แล้ว!</span>
                        </>
                      ) : (
                        <>
                          <FileJson className="w-3 h-3 text-cyan-600" />
                          <span>📑 คัดลอก JSON ช่วงฉาก {rangeStart}-{rangeEnd}</span>
                        </>
                      )}
                    </button>

                    {/* Quick Copy Single Scene JSON */}
                    <button
                      type="button"
                      onClick={() => handleQuickCopyJson('single')}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                    >
                      {copyFeedback === 'json_single' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">คัดลอก JSON ฉากนี้แล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>🎬 คัดลอก JSON เฉพาะฉากที่ {activeScene.sceneNumber}</span>
                        </>
                      )}
                    </button>

                    {/* Preview / Modal & File Downloads */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenExportJsonModal('full')}
                        className="py-1.5 px-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                        title="เปิดหน้าต่างพรีวิวและแก้ไขโค้ด JSON ก่อนส่งออก"
                      >
                        <Eye className="w-3 h-3 text-cyan-600" />
                        <span>พรีวิว JSON</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadJson()}
                        className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                        title="ดาวน์โหลดเป็นไฟล์ .json ลงเครื่อง"
                      >
                        <Download className="w-3 h-3 text-slate-600" />
                        <span>โหลด JSON</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                        title="นำเข้าไฟล์ .json"
                      >
                        <Upload className="w-3 h-3 text-amber-600" />
                        <span>นำเข้า JSON</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                ยังไม่มีข้อมูลฉากที่เลือก
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modal: Add/Edit Prop */}
      {isPropModalOpen && editingProp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              {editingProp.name ? 'แก้ไข Prop / ยานพาหนะ' : 'เพิ่ม Prop / ยานพาหนะใหม่'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">รหัส Prop (ID):</label>
                <input
                  type="text"
                  value={editingProp.id}
                  onChange={(e) => setEditingProp({ ...editingProp, id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อ Prop / ยานพาหนะ:</label>
                <input
                  type="text"
                  placeholder="เช่น แล็ปท็อปเอกสารลับ, ปืนกล็อก, รถตู้สีดำ"
                  value={editingProp.name}
                  onChange={(e) => setEditingProp({ ...editingProp, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">หมวดหมู่:</label>
                <select
                  value={editingProp.category}
                  onChange={(e) => setEditingProp({ ...editingProp, category: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="prop">สิ่งของทั่วไป (Prop)</option>
                  <option value="weapon">อาวุธ (Weapon)</option>
                  <option value="vehicle">ยานพาหนะ (Vehicle)</option>
                  <option value="gadget">อุปกรณ์ไฮเทค (Gadget)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">คำอธิบายรายละเอียด:</label>
                <textarea
                  rows={3}
                  placeholder="รายละเอียดสำหรับใส่ในพร้อมต์สร้างภาพ..."
                  value={editingProp.description}
                  onChange={(e) => setEditingProp({ ...editingProp, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ล็อคสีและรูปแบบ (Color Lock):</label>
                <input
                  type="text"
                  placeholder="เช่น ดำด้าน โครงเหล็ก ไฟสถานะสีฟ้า"
                  value={editingProp.colorLock || ''}
                  onChange={(e) => setEditingProp({ ...editingProp, colorLock: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPropModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleSaveProp(editingProp)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-extrabold shadow-sm"
              >
                บันทึก Prop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Location */}
      {isLocationModalOpen && editingLocation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              {editingLocation.name ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">รหัสสถานที่ (Location ID):</label>
                <input
                  type="text"
                  value={editingLocation.id}
                  onChange={(e) => setEditingLocation({ ...editingLocation, id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อสถานที่:</label>
                <input
                  type="text"
                  placeholder="เช่น ห้องพักเอก (ROOM-01), ถนนสายเปลี่ยว"
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ช่วงเวลา:</label>
                  <select
                    value={editingLocation.timeOfDay || 'กลางวัน'}
                    onChange={(e) => setEditingLocation({ ...editingLocation, timeOfDay: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="กลางวัน">กลางวัน</option>
                    <option value="พลบค่ำ">พลบค่ำ (Golden Hour)</option>
                    <option value="กลางคืน">กลางคืน</option>
                    <option value="รุ่งเช้า">รุ่งเช้า</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">สภาพอากาศ:</label>
                  <input
                    type="text"
                    placeholder="ฝนตก, หมอกลง, แดดจ้า"
                    value={editingLocation.weather || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, weather: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">รายละเอียดสถานที่และแสง:</label>
                <textarea
                  rows={3}
                  placeholder="ห้องสี่เหลี่ยม แสงโคมไฟสีส้มสลัว ตกแต่งเรียบง่าย..."
                  value={editingLocation.description}
                  onChange={(e) => setEditingLocation({ ...editingLocation, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleSaveLocation(editingLocation)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold shadow-sm"
              >
                บันทึกสถานที่
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import 989 JSON */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              📂 นำเข้าข้อมูลไฟล์ 989 Ai Prompt JSON
            </h3>
            <p className="text-xs text-slate-500">
              วางข้อความ JSON ที่ส่งออกจาก 989 Ai Prompt v8 เพื่ออัปเดตฉาก Props และสถานที่ในโปรเจกต์นี้
            </p>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="วางข้อมูล JSON ที่นี่..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleImportJson}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-extrabold disabled:opacity-50"
              >
                นำเข้าข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Export / Send Back to JSON */}
      {isExportJsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileJson className="w-5 h-5 text-amber-500" />
                <span>{exportJsonTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsExportJsonModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 shrink-0">
              ข้อมูล JSON โครงสร้างมาตรฐาน 989 Ai Prompt v8 (VIP Mode) พร้อม Production Prompt และข้อมูลกำกับครบถ้วน สามารถคัดลอกส่งต่อไปยัง AI หรือบันทึกเก็บไว้ได้ทันที
            </p>

            <div className="flex-1 overflow-hidden min-h-[300px]">
              <textarea
                readOnly
                rows={16}
                value={exportJsonPreview}
                className="w-full h-full p-3 bg-slate-900 text-cyan-300 border border-slate-800 rounded-2xl text-xs font-mono resize-none focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 shrink-0">
              <div className="text-[11px] text-slate-400">
                ขนาดข้อมูล: {exportJsonPreview.length.toLocaleString()} ตัวอักษร
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExportJsonModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadJson(exportJsonPreview, 'exported')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>ดาวน์โหลด .json</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(exportJsonPreview);
                    handleCopy(exportJsonPreview, 'modal_json');
                    alert('📋 คัดลอก JSON ลงคลิปบอร์ดเรียบร้อยแล้ว!');
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm"
                >
                  <Copy className="w-4 h-4 text-slate-950" />
                  <span>คัดลอก JSON ทั้งหมด</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
