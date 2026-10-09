"use client";

import React, { useState, useEffect } from "react";
import { ProjectData, ScriptScene, PropItem, LocationItem, CharacterItem, TenBeatItem } from "@/lib/types";
import {
  generateVip3000SecondsMovie,
  saveProjectToStorage,
  loadProjectFromStorage,
  autoReTimeScenes,
  FOCUS_OPTIONS,
  COMPOSITION_OPTIONS,
  SHOT_TYPES,
  CAMERA_ANGLES,
  CAMERA_MOVEMENTS,
} from "@/lib/cineprompt-engine";
import { HeaderNav } from "@/components/HeaderNav";
import { AssetSidebar } from "@/components/AssetSidebar";
import { MainCenterTabs } from "@/components/MainCenterTabs";
import { OutputExportSidebar } from "@/components/OutputExportSidebar";
import { AiPlotModal } from "@/components/AiPlotModal";
import { TenBeatsModal } from "@/components/TenBeatsModal";
import { GeminiSettingsModal } from "@/components/GeminiSettingsModal";
import { ImportModal } from "@/components/ImportModal";

export default function CinePromptStudioPage() {
  const [project, setProject] = useState<ProjectData>(() => {
    return generateVip3000SecondsMovie(
      "มหาพายุโลกาวินาศ 3,000 วินาที (The Last Horizon)",
      "Sci-Fi Survival Action Thriller"
    );
  });

  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [lastSaved, setLastSaved] = useState<string>("เพิ่งบันทึก");

  // Modals state
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [is10BeatsModalOpen, setIs10BeatsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = loadProjectFromStorage();
    if (saved && saved.scenes && saved.scenes.length > 0) {
      setProject(saved);
      setLastSaved(new Date().toLocaleTimeString("th-TH"));
    }
  }, []);

  // Save to local storage whenever project changes
  const updateProject = (updated: ProjectData) => {
    const withTimestamp = { ...updated, updatedAt: new Date().toISOString() };
    setProject(withTimestamp);
    saveProjectToStorage(withTimestamp);
    setLastSaved(new Date().toLocaleTimeString("th-TH"));
  };

  // 1-Click VIP 3,000s / 308 Scenes Generator
  const handleGenerateVipMovie = () => {
    if (
      project.scenes.length > 0 &&
      !confirm("ต้องการสร้างภาพยนตร์ 3,000 วินาที รวม 308 ฉากใหม่ทั้งหมดหรือไม่? (ฉากเดิมจะถูกแทนที่)")
    ) {
      return;
    }
    const fresh = generateVip3000SecondsMovie(project.title, project.genre);
    updateProject(fresh);
    setSelectedSceneIndex(0);
  };

  // Auto Re-Time
  const handleAutoReTime = () => {
    const retimed = autoReTimeScenes(project.scenes, 10);
    updateProject({ ...project, scenes: retimed });
  };

  // Add New Scene
  const handleAddNewScene = () => {
    const newIndex = project.scenes.length + 1;
    const lastScene = project.scenes[project.scenes.length - 1];
    const startTime = lastScene ? lastScene.endTimeSec : 0;
    const endTime = startTime + 10;

    const newScene: ScriptScene = {
      id: `scene-${Date.now()}`,
      sceneNumber: newIndex,
      startTimeSec: startTime,
      endTimeSec: endTime,
      durationSec: 10,
      speaker: project.characters[0]?.name || "ตัวละครเอก",
      listener: project.characters[1]?.name || "",
      dialogue: "บทพูดฉากใหม่...",
      action: "การกระทำและบรรยากาศในฉาก...",
      locationId: project.locations[0]?.id || "",
      locationName: project.locations[0]?.name || "ห้องบัญชาการ",
      focusType: FOCUS_OPTIONS[0],
      focusDetail: "ชัดลึกเห็นทั้งตัวละครและสภาพแวดล้อม",
      compositionType: COMPOSITION_OPTIONS[0],
      compositionDetail: "จัดวางกึ่งกลางภาพเพื่อความโดดเด่น",
      shotType: SHOT_TYPES[3], // Medium Shot
      cameraAngle: CAMERA_ANGLES[0], // Eye Level
      cameraMovement: CAMERA_MOVEMENTS[0], // Static
      propIds: project.props[0] ? [project.props[0].id] : [],
      notes: "ฉากสร้างใหม่",
    };

    updateProject({
      ...project,
      scenes: [...project.scenes, newScene],
    });
    setSelectedSceneIndex(project.scenes.length);
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, "_")}_989_VIP_project.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Apply AI Plot
  const handleApplyPlot = (data: { title: string; synopsis: string; visualStyle: string; genre: string }) => {
    updateProject({
      ...project,
      title: data.title,
      synopsis: data.synopsis,
      visualStyle: data.visualStyle,
      genre: data.genre,
    });
  };

  // Asset handlers
  const handleAddProp = (prop: PropItem) => {
    updateProject({ ...project, props: [...project.props, prop] });
  };
  const handleEditProp = (prop: PropItem) => {
    updateProject({
      ...project,
      props: project.props.map((p) => (p.id === prop.id ? prop : p)),
    });
  };
  const handleDeleteProp = (id: string) => {
    updateProject({
      ...project,
      props: project.props.filter((p) => p.id !== id),
    });
  };

  const handleAddLocation = (loc: LocationItem) => {
    updateProject({ ...project, locations: [...project.locations, loc] });
  };
  const handleEditLocation = (loc: LocationItem) => {
    updateProject({
      ...project,
      locations: project.locations.map((l) => (l.id === loc.id ? loc : l)),
    });
  };
  const handleDeleteLocation = (id: string) => {
    updateProject({
      ...project,
      locations: project.locations.filter((l) => l.id !== id),
    });
  };

  const handleAddCharacter = (char: CharacterItem) => {
    updateProject({ ...project, characters: [...project.characters, char] });
  };
  const handleEditCharacter = (char: CharacterItem) => {
    updateProject({
      ...project,
      characters: project.characters.map((c) => (c.id === char.id ? char : c)),
    });
  };
  const handleDeleteCharacter = (id: string) => {
    updateProject({
      ...project,
      characters: project.characters.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col font-sans select-none">
      {/* 1. Header Navigation */}
      <HeaderNav
        project={project}
        onUpdateProject={updateProject}
        onOpenPlotModal={() => setIsPlotModalOpen(true)}
        onOpen10BeatsModal={() => setIs10BeatsModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportJson={handleExportJson}
        lastSaved={lastSaved}
      />

      {/* 2. Main 3-Column Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Assets Management */}
        <AssetSidebar
          propsList={project.props}
          locationsList={project.locations}
          charactersList={project.characters}
          onAddProp={handleAddProp}
          onEditProp={handleEditProp}
          onDeleteProp={handleDeleteProp}
          onAddLocation={handleAddLocation}
          onEditLocation={handleEditLocation}
          onDeleteLocation={handleDeleteLocation}
          onAddCharacter={handleAddCharacter}
          onEditCharacter={handleEditCharacter}
          onDeleteCharacter={handleDeleteCharacter}
        />

        {/* Center Column: 5 Tabs & Workspace */}
        <MainCenterTabs
          project={project}
          selectedSceneIndex={selectedSceneIndex}
          onSelectSceneIndex={setSelectedSceneIndex}
          onUpdateProject={updateProject}
          onAutoReTime={handleAutoReTime}
          onGenerateVipMovie={handleGenerateVipMovie}
          onAddNewScene={handleAddNewScene}
        />

        {/* Right Column: 4-Section Production Prompts & Export */}
        <OutputExportSidebar
          project={project}
          selectedSceneIndex={selectedSceneIndex}
          onSelectSceneIndex={setSelectedSceneIndex}
          onExportJson={handleExportJson}
        />
      </div>

      {/* Modals */}
      <AiPlotModal
        isOpen={isPlotModalOpen}
        onClose={() => setIsPlotModalOpen(false)}
        onApplyPlot={handleApplyPlot}
      />

      <TenBeatsModal
        isOpen={is10BeatsModalOpen}
        onClose={() => setIs10BeatsModalOpen(false)}
        beats={project.tenBeats}
        title={project.title}
        synopsis={project.synopsis}
        onUpdateBeats={(updated) => updateProject({ ...project, tenBeats: updated })}
      />

      <GeminiSettingsModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentProject={project}
        onImportComplete={updateProject}
      />
    </div>
  );
}
