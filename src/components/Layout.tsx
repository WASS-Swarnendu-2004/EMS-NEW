import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode, ComponentType } from "react";
import {
  LayoutDashboard, Users, FolderKanban, PlaneTakeoff, Home, Clock,
  ClipboardList, Wallet, Mail, LogOut,
} from "lucide-react";
import logo from "@/assets/logo.jpeg.asset.json";
import logo1 from "@/assets/logo1.jpg"
import { useAuth } from "@/lib/auth";

type IconType = ComponentType<{ size?: number; className?: string }>;
interface NavItem { to: string; label: string; icon: IconType }

export function Shell({ items, title, children }: { items: NavItem[]; title: string; children: ReactNode }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = [...items]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => pathname === i.to || pathname.startsWith(i.to + "/"))?.label ?? "Dashboard";

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img src={logo1} alt="WebApps" />
          <div>
            <div className="brand-text">WebApps</div>
            <div className="brand-sub">Employee Management</div>
          </div>
        </div>
        <nav>
          {items.map((i) => {
            const Icon = i.icon;
            return (
              <Link key={i.to} to={i.to} activeOptions={{ exact: i.to.endsWith("/admin") || i.to.endsWith("/user") }}>
                <Icon size={16} className="nav-icon" />
                <span>{i.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="user-name">{session?.name}</div>
          <div className="user-role">{session?.kind}</div>
          <button className="btn btn-gold btn-sm" onClick={() => { logout(); navigate({ to: "/login" }); }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="page-title">{title === "auto" ? current : title}</div>
          <div className="muted" style={{ fontSize: ".8rem" }}>{new Date().toDateString()}</div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/employees", label: "Employees", icon: Users },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/leaves", label: "Leave Requests", icon: PlaneTakeoff },
  { to: "/admin/wfh", label: "WFH Requests", icon: Home },
  { to: "/admin/attendance", label: "Attendance", icon: Clock },
  { to: "/admin/work-status", label: "Daily Work Status", icon: ClipboardList },
  { to: "/admin/salary", label: "Salary Slips", icon: Wallet },
  { to: "/admin/mail", label: "Mailing", icon: Mail },
];

export const userNav: NavItem[] = [
  { to: "/user", label: "Dashboard", icon: LayoutDashboard },
  { to: "/user/projects", label: "My Projects", icon: FolderKanban },
  { to: "/user/tasks", label: "Daily Task Plan", icon: ClipboardList },
  { to: "/user/leave", label: "Leave", icon: PlaneTakeoff },
  { to: "/user/wfh", label: "Work From Home", icon: Home },
  { to: "/user/attendance", label: "My Attendance", icon: Clock },
  { to: "/user/salary", label: "Salary Slips", icon: Wallet },
]; 
