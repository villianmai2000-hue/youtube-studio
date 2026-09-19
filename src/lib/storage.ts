import { getDb, isMongoConfigured } from './mongodb';
import { Project, ScriptScene, CharacterBible } from './types';
import fs from 'fs';
import path from 'path';

const LOCAL_FALLBACK_FILE = path.join(process.cwd(), '.studio_local_data.json');

// Helper to read local fallback
function getLocalData(): { projects: Project[] } {
  try {
    if (fs.existsSync(LOCAL_FALLBACK_FILE)) {
      const content = fs.readFileSync(LOCAL_FALLBACK_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local fallback file:', err);
  }
  return { projects: [] };
}

// Helper to write local fallback
function saveLocalData(data: { projects: Project[] }) {
  try {
    fs.writeFileSync(LOCAL_FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local fallback file:', err);
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      const docs = await db.collection<Project>('projects').find({}).sort({ updatedAt: -1 }).toArray();
      return docs.map((doc) => ({
        ...doc,
        id: doc.id || doc._id?.toString() || '',
      }));
    } catch (error) {
      console.warn('MongoDB Atlas query failed, falling back to local store:', error);
    }
  }

  // Fallback to local storage
  const local = getLocalData();
  return local.projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      const doc = await db.collection<Project>('projects').findOne({ id });
      if (doc) {
        return {
          ...doc,
          id: doc.id || doc._id?.toString() || '',
        };
      }
    } catch (error) {
      console.warn('MongoDB Atlas query failed, falling back to local store:', error);
    }
  }

  const local = getLocalData();
  return local.projects.find((p) => p.id === id) || null;
}

export async function saveProject(project: Project): Promise<Project> {
  project.updatedAt = new Date().toISOString();

  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      await db.collection<Project>('projects').updateOne(
        { id: project.id },
        { $set: project },
        { upsert: true }
      );
      return project;
    } catch (error) {
      console.warn('MongoDB Atlas save failed, saving to local store:', error);
    }
  }

  // Local fallback
  const local = getLocalData();
  const index = local.projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    local.projects[index] = project;
  } else {
    local.projects.push(project);
  }
  saveLocalData(local);
  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      await db.collection('projects').deleteOne({ id });
      return true;
    } catch (error) {
      console.warn('MongoDB Atlas delete failed, deleting from local store:', error);
    }
  }

  const local = getLocalData();
  local.projects = local.projects.filter((p) => p.id !== id);
  saveLocalData(local);
  return true;
}
