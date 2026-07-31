import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearVideos } from '@/services/videoStore';
import * as api from '@/services/projectService';
import { getActivity, logActivity, clearActivity } from '@/services/activityService';
import { createId } from '@/utils/helpers';

const ProjectContext = createContext(null);

/**
 * Owns the project collection and every mutation on it.
 * All writes go through `@/services/projectService`, so swapping localStorage
 * for a real API later is a one-file change.
 */
export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- initial load -------------------------------------------------------
  // The vault starts empty; everything here comes from what you add.
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchProjects();
      setProjects(data);
      setActivity(getActivity());
      setError(null);
    } catch (caught) {
      // In API mode the server may be down or the database unreachable.
      // Surface it instead of leaving the UI stuck on skeletons forever.
      console.error('[ProjectVault] could not load projects:', caught);
      setError(caught?.message || 'Could not reach the server.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const record = useCallback((type, message, projectId) => {
    setActivity(logActivity(type, message, projectId));
  }, []);

  // ---- mutations ---------------------------------------------------------

  const addProject = useCallback(
    async (data) => {
      const created = await api.createProject(data);
      setProjects((current) => [created, ...current]);
      record('created', `Added "${created.title}"`, created.id);
      return created;
    },
    [record]
  );

  const editProject = useCallback(
    async (id, patch, { silent = false } = {}) => {
      const updated = await api.updateProject(id, patch);
      if (updated) {
        setProjects((current) => current.map((p) => (p.id === id ? updated : p)));
        if (!silent) record('updated', `Updated "${updated.title}"`, id);
      }
      return updated;
    },
    [record]
  );

  const removeProject = useCallback(
    async (id) => {
      const target = projects.find((p) => p.id === id);
      await api.deleteProject(id);
      setProjects((current) => current.filter((p) => p.id !== id));
      if (target) record('deleted', `Deleted "${target.title}"`);
      return id;
    },
    [projects, record]
  );

  /** Generic boolean flip used by favourite / watch-later / pin. */
  const toggleFlag = useCallback(
    async (id, field) => {
      const target = projects.find((p) => p.id === id);
      if (!target) return null;
      const next = !target[field];
      const updated = await editProject(id, { [field]: next }, { silent: true });

      const labels = {
        favorite: next ? 'Added to favourites' : 'Removed from favourites',
        watchLater: next ? 'Saved to watch later' : 'Removed from watch later',
        pinned: next ? 'Pinned to dashboard' : 'Unpinned',
      };
      record(field, `${labels[field]}: "${target.title}"`, id);
      return updated;
    },
    [projects, editProject, record]
  );

  /**
   * Called by the details page — bumps the view counter once per visit.
   * Uses the public view endpoint so it works for locked (visitor) devices,
   * and never throws: a failed view count must not break the page.
   */
  const registerView = useCallback(async (id) => {
    try {
      const views = await api.registerProjectView(id);
      if (views === null || views === undefined) return;
      setProjects((current) => current.map((p) => (p.id === id ? { ...p, views } : p)));
    } catch (caught) {
      console.warn('[ProjectVault] could not record a view:', caught?.message);
    }
  }, []);

  const toggleLike = useCallback(
    async (id, liked) => {
      const target = projects.find((p) => p.id === id);
      if (!target) return;
      const likes = Math.max(0, (target.likes || 0) + (liked ? 1 : -1));
      await editProject(id, { likes }, { silent: true });
      if (liked) record('liked', `Liked "${target.title}"`, id);
    },
    [projects, editProject, record]
  );

  const addComment = useCallback(
    async (id, { author, text }) => {
      const target = projects.find((p) => p.id === id);
      if (!target) return null;
      const comment = {
        id: createId('cmt'),
        author: author?.trim() || 'Anonymous',
        text: text.trim(),
        at: new Date().toISOString(),
      };
      const updated = await editProject(
        id,
        { comments: [comment, ...(target.comments || [])] },
        { silent: true }
      );
      record('commented', `Commented on "${target.title}"`, id);
      return updated;
    },
    [projects, editProject, record]
  );

  const deleteComment = useCallback(
    async (id, commentId) => {
      const target = projects.find((p) => p.id === id);
      if (!target) return;
      await editProject(
        id,
        { comments: (target.comments || []).filter((c) => c.id !== commentId) },
        { silent: true }
      );
    },
    [projects, editProject]
  );

  /** Replace everything — used by JSON import. */
  const importProjects = useCallback(
    async (incoming) => {
      const next = await api.replaceAllProjects(incoming);
      setProjects(next);
      record('imported', `Imported ${next.length} project${next.length === 1 ? '' : 's'}`);
      return next;
    },
    [record]
  );

  const resetEverything = useCallback(async () => {
    await clearVideos();
    await api.replaceAllProjects([]);
    setProjects([]);
    setActivity(clearActivity());
  }, []);

  const getProject = useCallback((id) => projects.find((p) => p.id === id) || null, [projects]);

  // ---- derived collections ----------------------------------------------

  const stats = useMemo(() => {
    const categories = new Set(projects.map((p) => p.category).filter(Boolean));
    const technologies = new Set(projects.flatMap((p) => p.technologies || []));
    return {
      totalProjects: projects.length,
      totalVideos: projects.filter((p) => p.videoKey || p.videoUrl).length,
      totalCategories: categories.size,
      totalTechnologies: technologies.size,
      totalFavorites: projects.filter((p) => p.favorite).length,
      totalWatchLater: projects.filter((p) => p.watchLater).length,
      totalViews: projects.reduce((sum, p) => sum + (p.views || 0), 0),
      totalLikes: projects.reduce((sum, p) => sum + (p.likes || 0), 0),
      totalWatchSeconds: projects.reduce((sum, p) => sum + (p.duration || 0), 0),
      latestUpload: [...projects].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0] || null,
      completed: projects.filter((p) => p.status === 'Completed').length,
    };
  }, [projects]);

  const value = useMemo(
    () => ({
      projects,
      activity,
      loading,
      error,
      reload: load,
      stats,
      getProject,
      addProject,
      editProject,
      removeProject,
      toggleFlag,
      registerView,
      toggleLike,
      addComment,
      deleteComment,
      importProjects,
      resetEverything,
    }),
    [
      projects,
      activity,
      loading,
      error,
      load,
      stats,
      getProject,
      addProject,
      editProject,
      removeProject,
      toggleFlag,
      registerView,
      toggleLike,
      addComment,
      deleteComment,
      importProjects,
      resetEverything,
    ]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used inside <ProjectProvider>.');
  return context;
}
