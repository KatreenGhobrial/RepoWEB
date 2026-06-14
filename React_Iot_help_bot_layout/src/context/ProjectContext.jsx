"use strict";
import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
import { projectService } from "../ProjectManagement/projectService";
import { useAuth } from "./AuthContext";
const ProjectContext = createContext(void 0);
export function ProjectProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      const data = await projectService.list();
      setProjects(data);
      if (!currentProject && data.length > 0) {
        setCurrentProject(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const selectProject = async (id) => {
    setLoading(true);
    try {
      const project = await projectService.get(id);
      setCurrentProject(project);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const createProject = async (data) => {
    const project = await projectService.create(data);
    setProjects((prev) => [project, ...prev]);
    setCurrentProject(project);
    return project;
  };
  const updateProject = async (id, data) => {
    const updated = await projectAPI.update(id, data);
    setProjects((prev) => prev.map((p) => p._id === id ? updated : p));
    if (currentProject?._id === id) {
      setCurrentProject(updated);
    }
  };
  const deleteProject = async (id) => {
    await projectAPI.delete(id);
    setProjects((prev) => prev.filter((p) => p._id !== id));
    if (currentProject?._id === id) {
      setCurrentProject(null);
    }
  };
  return /* @__PURE__ */ jsx(
    ProjectContext.Provider,
    {
      value: {
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
        deleteProject
      },
      children
    }
  );
}
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
