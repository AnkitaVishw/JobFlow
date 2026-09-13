import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Analytics from "./pages/Analytics";
import Applications from "./pages/Applications";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Interviews from "./pages/Interviews";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Resumes from "./pages/Resumes";
import Settings from "./pages/Settings";
import "./App.css";

function ProtectedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/resumes" element={<Resumes />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function GuestOnly({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestOnly>
            <ForgotPassword />
          </GuestOnly>
        }
      />
      <Route
        path="/reset-password/:uid/:token"
        element={
          <GuestOnly>
            <ResetPassword />
          </GuestOnly>
        }
      />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
