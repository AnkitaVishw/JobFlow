import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">JobFlow</div>

      <NavLink to="/">
        <LayoutDashboard size={20} />
        Dashboard
      </NavLink>

      <NavLink to="/applications">
        <Briefcase size={20} />
        Applications
      </NavLink>

      <NavLink to="/interviews">
        <CalendarDays size={20} />
        Interviews
      </NavLink>

      <NavLink to="/resumes">
        <FileText size={20} />
        Resumes
      </NavLink>

      <NavLink to="/analytics">
        <BarChart3 size={20} />
        Analytics
      </NavLink>

      <NavLink to="/settings">
        <Settings size={20} />
        Settings
      </NavLink>
    </aside>
  );
}

export default Sidebar;
