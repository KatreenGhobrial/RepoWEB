import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Project } from '../types';
import { projectAPI } from '../services/api';
import { useAuth } from './AuthContext';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  loadProjects: () => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects when user changes
  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectAPI.list();
      setProjects(data);
      // Auto-select first project if none selected
      if (!currentProject && data.length > 0) {
        setCurrentProject(data[0]);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const selectProject = async (id: string) => {
    setLoading(true);
    try {
      const project = await projectAPI.get(id);
      setCurrentProject(project);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: Partial<Project>): Promise<Project> => {
    const project = await projectAPI.create(data);
    setProjects((prev) => [project, ...prev]);
    setCurrentProject(project);
    return project;
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const updated = await projectAPI.update(id, data);
    setProjects((prev) => prev.map((p) => (p._id === id ? updated : p)));
    if (currentProject?._id === id) {
      setCurrentProject(updated);
    }
  };

  const deleteProject = async (id: string) => {
    await projectAPI.delete(id);
    setProjects((prev) => prev.filter((p) => p._id !== id));
    if (currentProject?._id === id) {
      setCurrentProject(null);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        loading,
        error,
        fetchProjects,
        loadProjects: fetchProjects,
        selectProject,
        setCurrentProject,
        createProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
