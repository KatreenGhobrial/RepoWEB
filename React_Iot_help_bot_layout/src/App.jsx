import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./UIcomponents/Layout";
import Login from "./UserManagement/Login";
import Register from "./UserManagement/Register";
import Dashboard from "./UIcomponents/Dashboard";
import ProjectSetup from "./ProjectManagement/ProjectSetup";
import TasksTeam from "./ProjectManagement/TasksTeam";
import ManagerUsers from "./UserManagement/ManagerUsers";
import DetectConflict from "./IoTManagement/DetectConflict";
import MonitorPanel from "./IoTManagement/MonitorPanel";
import SocraticBot from "./BotEngine/SocraticBot";
import Home from "./UIcomponents/Home";
import About from "./UIcomponents/About";
import Profile from "./UserManagement/Profile";

//Including all routes in the app
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/login"
          element={<Login setCurrentUser={setCurrentUser} />}
        />
        <Route
          path="/register"
          element={<Register setCurrentUser={setCurrentUser} />}
        />
        <Route
          element={
            currentUser ? (
              <Layout
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/profile"
            element={
              <Profile user={currentUser} setCurrentUser={setCurrentUser} />
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project-setup" element={<ProjectSetup />} />
          <Route path="/tasks-team" element={<TasksTeam />} />
          <Route path="/manage-users" element={<ManagerUsers />} />
          <Route path="/detect-conflict" element={<DetectConflict />} />
          <Route path="/monitor-panel" element={<MonitorPanel />} />
          <Route path="/socratic-bot" element={<SocraticBot />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

//

//         <Route
//           path="/register"
//           element={<Register setCurrentUser={setCurrentUser} />}
//         />

//         <Route
//           element={
//             currentUser ?
//             <Layout currentUser={currentUser} setCurrentUser={setCurrentUser} />
//             : <Navigate to="/login" />
//           }
//         >
//           <Route path="/home" element={<Home />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/profile" element={<Profile user={currentUser} setCurrentUser={setCurrentUser} />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/project-setup" element={<ProjectSetup />} />
//           <Route path="/tasks-team" element={<TasksTeam />} />
//           <Route path="/detect-conflict" element={<DetectConflict />} />
//           <Route path="/monitor-panel" element={<MonitorPanel />} />
//           <Route path="/socratic-bot" element={<SocraticBot />} />
//         </Route>
//       </Routes>
//     </Router>
//   );
// }

// export default App;
