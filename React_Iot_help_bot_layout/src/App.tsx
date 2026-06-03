import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './UserManagement/Login';
import Register from './UserManagement/Register';
import Dashboard from './pages/Dashboard';
import ProjectSetup from './pages/ProjectSetup';
import TasksTeam from './pages/TasksTeam';
import DetectConflict from './BotEngine/DetectConflict';
import MonitorPanel from './BotEngine/MonitorPanel';
import SocraticBot from './BotEngine/SocraticBot';
import Home from './pages/Home';
import About from './pages/About';
import Profile from './pages/Profile';
import MentorDashboard from './pages/MentorDashboard';
import IoTSolutionLibrary from './pages/IoTSolutionLibrary';
import KnowledgeSharing from './pages/KnowledgeSharing';

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes (any authenticated user) */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/project-setup" element={<ProjectSetup />} />
                <Route path="/tasks-team" element={<TasksTeam />} />
                <Route path="/socratic-bot" element={<SocraticBot />} />
                <Route path="/detect-conflict" element={<DetectConflict />} />
                <Route path="/monitor-panel" element={<MonitorPanel />} />
                <Route path="/library" element={<IoTSolutionLibrary />} />
                <Route path="/forum" element={<KnowledgeSharing />} />
                {/* Mentor-only route (role check done inside component) */}
                <Route path="/mentor" element={<MentorDashboard />} />
              </Route>
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
