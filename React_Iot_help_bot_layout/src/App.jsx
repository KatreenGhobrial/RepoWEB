import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './UIComponents/Layout';
import Login from './UserManagement/Login';
import Register from './UserManagement/Register';
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
import MentorDashboard from './IoTManagement/MentorDashboard';
import KnowledgeSharing from './Community/KnowledgeSharing';
import ManageUsers from './UserManagement/ManageUsers';
//Including all routes in the app
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project-setup" element={<ProjectSetup />} />
          <Route path="/tasks-team" element={<TasksTeam />} />
          <Route path="/detect-conflict" element={<DetectConflict />} />
          <Route path="/monitor-panel" element={<MonitorPanel />} />
          <Route path="/socratic-bot" element={<SocraticBot />} />
          <Route path="/solution-library" element={<IoTSolutionLibrary />} />
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
          <Route path="/knowledge-sharing" element={<KnowledgeSharing />} />
          <Route path="/manage-users" element={<ManageUsers />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
