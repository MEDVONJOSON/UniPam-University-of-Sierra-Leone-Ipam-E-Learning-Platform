import { NavLink, Outlet } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import {
  LayoutDashboard, BookOpen, User,
  ClipboardList, MessageCircle, Radio, GraduationCap, Library
} from "lucide-react";

const STUDENT_NAV_ITEMS = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/course-catalog", label: "My Courses", icon: BookOpen },
  { to: "/app/repository", label: "Repository", icon: Library },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/messages", label: "Messages", icon: MessageCircle }
];

const LECTURER_NAV_ITEMS = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/teach", label: "Manage Learning Materials", icon: GraduationCap },
  { to: "/app/repository", label: "Repository", icon: Library },
  { to: "/app/messages", label: "Messages", icon: MessageCircle },
  { to: "/app/profile", label: "Profile", icon: User }
];

const UPCOMING_ITEMS = [
  { label: "Assignments", icon: ClipboardList },
  { label: "Live Sessions", icon: Radio }
];

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${isActive
    ? "bg-white text-[#0B5E3C] shadow-sm"
    : "text-white/80 hover:bg-white/10 hover:text-white"
  }`;

function LmsShell() {
  const user = getCurrentUser();
  const isLecturer = user?.role === "lecturer" || user?.role === "admin";
  const navItems = isLecturer ? LECTURER_NAV_ITEMS : STUDENT_NAV_ITEMS;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      <aside className="w-full lg:w-64 lg:shrink-0 lg:sticky lg:top-28">
        <nav className="bg-[#0B5E3C] rounded-[1.75rem] p-3 shadow-card flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible border border-emerald-800/40">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon className="w-4 h-4 shrink-0 text-amber-400" />
              {label}
            </NavLink>
          ))}

          <div className="hidden lg:block h-px bg-white/10 my-2" />

          {UPCOMING_ITEMS.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-white/90 whitespace-nowrap cursor-not-allowed"
              title="Coming soon"
            >
              <Icon className="w-4 h-4 shrink-0 text-amber-400" />
              {label}
              <span className="ml-auto text-[9px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-sm">
                Soon
              </span>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0 w-full">
        <Outlet />
      </div>
    </div>
  );
}

export default LmsShell;
