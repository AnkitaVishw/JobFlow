import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">JobFlow</div>

      <nav>
        <a href="#">
          <LayoutDashboard size={20} />
          Dashboard
        </a>

        <a href="#">
          <Briefcase size={20} />
          Applications
        </a>

        <a href="#">
          <CalendarDays size={20} />
          Interviews
        </a>

        <a href="#">
          <FileText size={20} />
          Resumes
        </a>

        <a href="#">
          <BarChart3 size={20} />
          Analytics
        </a>

        <a href="#">
          <Settings size={20} />
          Settings
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;
