export interface PropItem {
  id: string;
  code: string; // e.g. "PROP-01", "VEH-01", "WEAP-01"
  name: string;
  description: string;
  promptKeyword: string;
  imageUrl?: string;
}

export interface LocationItem {
  id: string;
  code: string; // e.g. "ROOM-01", "LAB-01", "STREET-01"
  name: string;
  description: string;
  atmosphere: string; // Lighting, mood, weather
  promptKeyword: string;
  imageUrl?: string;
}

export interface CharacterItem {
  id: string;
  code: string; // e.g. "CHAR-01", "CHAR-02"
  name: string;
  role: string;
  visualDescription: string;
  voiceTone: string;
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  startTimeSec: number;
  endTimeSec: number;
  durationSec: number;
  speaker: string;
  listener: string;
  dialogue: string;
  action: string;
  locationId?: string;
  locationName?: string;
  focusType: string;
  focusDetail: string;
  compositionType: string;
  compositionDetail: string;
  shotType: string;
  cameraAngle: string;
  cameraMovement: string;
  propIds: string[];
  notes?: string;
}

export interface TenBeatItem {
  beatNumber: number; // 1 - 10
  title: string;
  timeRange: string;
  goal: string;
  scenesCount: number;
}

export interface ProjectData {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  visualStyle: string;
  directorStyle: string;
  props: PropItem[];
  locations: LocationItem[];
  characters: CharacterItem[];
  scenes: ScriptScene[];
  tenBeats: TenBeatItem[];
  aiRules: string[];
  updatedAt: string;
}

export interface ProductionPromptSections {
  cameraLens: string;
  subjectsStaging: string;
  lightingStyle: string;
  negativeConstraints: string;
  fullCombinedPrompt: string;
}
