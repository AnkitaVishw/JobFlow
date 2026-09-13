import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { logout, username } = useAuth();

  return (
    <aside className="sidebar">
      <div className="logo">JobFlow</div>

      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/applications"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <Briefcase size={20} />
          Applications
        </NavLink>

        <NavLink
          to="/interviews"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <CalendarDays size={20} />
          Interviews
        </NavLink>

        <NavLink
          to="/resumes"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <FileText size={20} />
          Resumes
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <BarChart3 size={20} />
          Analytics
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <Settings size={20} />
          Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {username ? <p className="sidebar-user">{username}</p> : null}
        <button type="button" className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
