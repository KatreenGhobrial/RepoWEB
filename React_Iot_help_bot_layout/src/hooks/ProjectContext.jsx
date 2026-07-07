import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { list as listProjects } from '../ProjectManagement/projectService';

// Create the context that will hold global project state
const ProjectContext = createContext(null);

// Provider component that fetches and shares project data with the whole app
export function ProjectProvider({ children }) {
  // list of all projects fetched from the server
  const [allProjects, setAllProjects] = useState([]);
  // ID of the currently active/selected project
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  // true while waiting for the server response
  const [loading, setLoading] = useState(true);

  // Read the logged-in user from localStorage
  const getCurrentUser = () => {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); }
    catch { return null; }
  };

  // Core fetch function — always gets fresh data from server
  const fetchProjects = useCallback(async () => {
    const currentUser = getCurrentUser();
    // If no user is logged in, clear project state and stop loading
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

  // Fetch projects when the component first mounts
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

  // Derive the full selected project object from the selected ID
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
    // Expose all project state and helpers to any child component via context
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

// Custom hook for consuming project context — throws if used outside the provider
export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
