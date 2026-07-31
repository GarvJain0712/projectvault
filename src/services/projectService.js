/**
 * The single source of truth for project data.
 *
 * Each function has two implementations behind one signature:
 *   API mode   (VITE_API_URL set)   → talks to Express + MongoDB
 *   local mode (VITE_API_URL empty) → reads and writes localStorage
 *
 * Nothing outside this file knows or cares which one is active. That is why
 * adding the backend did not require touching a single page or component.
 */

import { STORAGE_KEYS } from '@/data/constants';
import { createId } from '@/utils/helpers';
import { readValue, writeValue } from './storage';
import { deleteVideo } from './videoStore';
import { http, USE_API } from './apiClient';

/** Shape every project is normalised to, so the UI never sees `undefined`. */
export function createEmptyProject(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: createId('prj'),
    title: '',
    shortDescription: '',
    longDescription: '',
    overview: '',
    features: [],
    category: 'Web Development',
    technologies: [],
    tags: [],
    difficulty: 'Beginner',
    status: 'Completed',
    progress: 100,
    githubUrl: '',
    demoUrl: '',
    date: now.slice(0, 10),
    notes: '',
    thumbnail: '',
    images: [],
    resources: [],
    videoKey: '',
    videoUrl: '',
    videoName: '',
    duration: 0,
    favorite: false,
    watchLater: false,
    pinned: false,
    views: 0,
    likes: 0,
    comments: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/** Guards against older/partial records after a schema change. */
function normalise(project) {
  return { ...createEmptyProject(), ...project };
}

/* -------------------------------------------------------------------------- */
/* local mode helpers                                                          */
/* -------------------------------------------------------------------------- */

function readAll() {
  const stored = readValue(STORAGE_KEYS.projects, []);
  return Array.isArray(stored) ? stored.map(normalise) : [];
}

function persist(projects) {
  writeValue(STORAGE_KEYS.projects, projects);
  return projects;
}

/* -------------------------------------------------------------------------- */
/* Public API — identical signatures in both modes                             */
/* -------------------------------------------------------------------------- */

export async function fetchProjects() {
  if (USE_API) {
    const data = await http('/projects');
    return (data || []).map(normalise);
  }
  return readAll();
}

export async function fetchProjectById(id) {
  if (USE_API) {
    try {
      return normalise(await http(`/projects/${id}`));
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }
  return readAll().find((project) => project.id === id) || null;
}

export async function createProject(data) {
  const project = normalise({ ...createEmptyProject(), ...data });

  if (USE_API) {
    return normalise(await http('/projects', { method: 'POST', body: project }));
  }

  persist([project, ...readAll()]);
  return project;
}

export async function updateProject(id, patch) {
  if (USE_API) {
    return normalise(await http(`/projects/${id}`, { method: 'PATCH', body: patch }));
  }

  let updated = null;
  const next = readAll().map((project) => {
    if (project.id !== id) return project;
    updated = normalise({ ...project, ...patch, updatedAt: new Date().toISOString() });
    return updated;
  });
  persist(next);
  return updated;
}

export async function deleteProject(id) {
  if (USE_API) {
    await http(`/projects/${id}`, { method: 'DELETE' });
    return id;
  }

  // Local mode owns the video blob too, so clean it up.
  const project = await fetchProjectById(id);
  if (project?.videoKey) await deleteVideo(project.videoKey);
  persist(readAll().filter((item) => item.id !== id));
  return id;
}

/**
 * Bump the view counter. Public on purpose — a visitor browsing your portfolio
 * should count as a view without needing the admin password.
 */
export async function registerProjectView(id) {
  if (USE_API) {
    const result = await http(`/projects/${id}/view`, { method: 'POST' });
    return result?.views ?? null;
  }

  const project = readAll().find((item) => item.id === id);
  if (!project) return null;
  const views = (project.views || 0) + 1;
  await updateProject(id, { views });
  return views;
}

/** Replace the whole collection — used by JSON import and by Reset. */
export async function replaceAllProjects(projects) {
  const next = (Array.isArray(projects) ? projects : []).map(normalise);

  if (USE_API) {
    const saved = await http('/projects', { method: 'PUT', body: next });
    return (saved || []).map(normalise);
  }

  persist(next);
  return next;
}
