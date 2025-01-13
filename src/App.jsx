import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Unauthorized from "./components/Unauthorized";
import Home from "./components/Home";
import RequireAuth from "./components/RequireAuth";
import Register from "./components/Register";
import "./styles/Global.css";
import AdminSchedule from "./components/AdminSchedule";
import UserSchedule from "./components/UserSchedule";
import History from "./components/History";
import Layout from "./components/Layout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route
                path="/user/dashboard"
                element={
                  <RequireAuth allowedRoles={["User"]}>
                    <UserDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/user/schedule"
                element={
                  <RequireAuth allowedRoles={["User"]}>
                    <UserSchedule />
                  </RequireAuth>
                }
              />
              <Route
                path="/user/history"
                element={
                  <RequireAuth allowedRoles={["User"]}>
                    <History />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <AdminDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/schedule"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <AdminSchedule />
                  </RequireAuth>
                }
              />
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
