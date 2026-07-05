import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { list as listProjects } from '../ProjectManagement/projectService';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = () => {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }
    catch { return null; }
  };

  // Core fetch function — always gets fresh data from server
  const fetchProjects = useCallback(async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setAllProjects([]);
      setSelectedProjectId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const projs = await listProjects();
      const list = Array.isArray(projs) ? projs : [];
      setAllProjects(list);
      // Auto-select first project if none selected or selected one no longer exists
      setSelectedProjectId(prev => {
        if (prev && list.some(p => p._id === prev)) return prev;
        return list.length > 0 ? list[0]._id : null;
      });
    } catch (err) {
      console.error('ProjectContext: failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Re-fetch when user logs in or out (storage event from other tabs/components)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        fetchProjects();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchProjects]);

  const selectedProject = allProjects.find(p => p._id === selectedProjectId) || null;

  // Helper to refresh the projects list from backend
  const refreshProjects = async () => {
    await fetchProjects();
    return allProjects;
  };

  // Helper to update a single project in the local cache without a full refetch
  const updateProjectInCache = (id, data) => {
    setAllProjects(prev => prev.map(p => p._id === id ? { ...p, ...data } : p));
  };

  // Helper to add a new project to the cache and select it
  const addProjectToCache = (project) => {
    setAllProjects(prev => [...prev, project]);
    setSelectedProjectId(project._id);
  };

  return (
    <ProjectContext.Provider value={{
      allProjects,
      setAllProjects,
      selectedProjectId,
      setSelectedProjectId,
      selectedProject,
      loading,
      refreshProjects,
      fetchProjects,
      updateProjectInCache,
      addProjectToCache
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
