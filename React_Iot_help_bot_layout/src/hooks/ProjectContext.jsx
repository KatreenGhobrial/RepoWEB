import { createContext, useContext, useState, useEffect } from 'react';
import { list as listProjects } from '../ProjectManagement/projectService';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all projects on mount (only if user is logged in)
  useEffect(() => {
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (e) {
      currentUser = null;
    }

    if (!currentUser) {
      setLoading(false);
      return;
    }

    listProjects()
      .then(projs => {
        const list = Array.isArray(projs) ? projs : [];
        setAllProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0]._id);
        }
      })
      .catch(err => {
        console.error('ProjectContext: failed to fetch projects', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedProject = allProjects.find(p => p._id === selectedProjectId) || null;

  // Helper to refresh the projects list from backend
  const refreshProjects = async () => {
    try {
      const projs = await listProjects();
      const list = Array.isArray(projs) ? projs : [];
      setAllProjects(list);
      return list;
    } catch (err) {
      console.error(err);
      return allProjects;
    }
  };

  // Helper to update a project in the local cache
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
