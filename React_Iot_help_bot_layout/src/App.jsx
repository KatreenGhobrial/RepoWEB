import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './UIComponents/Layout';
import Dashboard from './UIComponents/Dashboard';
import ProjectSetup from './ProjectManagement/ProjectSetup';
import TasksTeam from './ProjectManagement/TasksTeam';
import DetectConflict from './IoTManagement/DetectConflict';
import MonitorPanel from './IoTManagement/MonitorPanel';
import SocraticBot from './BotEngine/SocraticBot';
import Home from './UIComponents/Home';
import About from './UIComponents/About';
import Profile from './UserManagement/Profile';
import IoTSolutionLibrary from './IoTManagement/IoTSolutionLibrary';
import MentorDashboard from './ProjectManagement/MentorDashboard';
import CommunityBoard from "./Community/CommunityBoard";
import ManageUsers from './UserManagement/ManageUsers';
import Login from './UserManagement/Login';
import Register from './UserManagement/Register';
import DevicePlayground from './IoTManagement/DevicePlayground';
import TechDocs from './Documentation/TechDocs';
import ProtectedRoute from './UIComponents/ProtectedRoute';
import { ProjectProvider } from './hooks/ProjectContext';
//Including all routes in the app
function App() {
  return (
    <Router>
      <ProjectProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />

        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/project-setup" element={<ProtectedRoute><ProjectSetup /></ProtectedRoute>} />
          <Route path="/tasks-team" element={<ProtectedRoute><TasksTeam /></ProtectedRoute>} />
          <Route path="/detect-conflict" element={<ProtectedRoute><DetectConflict /></ProtectedRoute>} />
          <Route path="/monitor-panel" element={<ProtectedRoute allowedRoles={['student']}><MonitorPanel /></ProtectedRoute>} />
          <Route path="/socratic-bot" element={<ProtectedRoute><SocraticBot /></ProtectedRoute>} />
          <Route path="/device-playground" element={<ProtectedRoute allowedRoles={['student']}><DevicePlayground /></ProtectedRoute>} />
          <Route path="/solution-library" element={<ProtectedRoute><IoTSolutionLibrary /></ProtectedRoute>} />
          <Route path="/mentor-dashboard" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><CommunityBoard /></ProtectedRoute>} />
          <Route path="/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
          <Route path="/tech-docs" element={<ProtectedRoute><TechDocs /></ProtectedRoute>} />
        </Route>
      </Routes>
      </ProjectProvider>
    </Router>
  );
}

export default App;
