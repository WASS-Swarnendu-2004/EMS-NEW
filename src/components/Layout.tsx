import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/logo.jpeg.asset.json";
import { useAuth } from "@/lib/auth";

interface NavItem { to: string; label: string; icon?: string }

export function Shell({ items, title, children }: { items: NavItem[]; title: string; children: ReactNode }) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Prefer the most specific (longest) matching nav item so /admin doesn't shadow /admin/employees.
  const current = [...items]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => pathname === i.to || pathname.startsWith(i.to + "/"))?.label ?? "Dashboard";

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img src={logo.url} alt="WebApps" />
          <div>
            <div className="brand-text">WebApps</div>
            <div className="brand-sub">Employee Management</div>
          </div>
        </div>
        <nav>
          {items.map((i) => (
            <Link key={i.to} to={i.to} activeOptions={{ exact: i.to.endsWith("/admin") || i.to.endsWith("/user") }}>
              <span style={{ width: 16, display: "inline-block" }}>{i.icon ?? "•"}</span>
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-name">{session?.name}</div>
          <div className="user-role">{session?.kind}</div>
          <button className="btn btn-gold btn-sm" onClick={() => { logout(); navigate({ to: "/login" }); }}>Sign out</button>
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
  { to: "/admin", label: "Dashboard", icon: "▣" },
  { to: "/admin/employees", label: "Employees", icon: "👤" },
  { to: "/admin/projects", label: "Projects", icon: "📁" },
  { to: "/admin/leaves", label: "Leave Requests", icon: "✈" },
  { to: "/admin/wfh", label: "WFH Requests", icon: "🏠" },
  { to: "/admin/attendance", label: "Attendance", icon: "🕒" },
  { to: "/admin/work-status", label: "Daily Work Status", icon: "📝" },
  { to: "/admin/salary", label: "Salary Slips", icon: "💰" },
  { to: "/admin/mail", label: "Mailing", icon: "✉" },
];

export const userNav: NavItem[] = [
  { to: "/user", label: "Dashboard", icon: "▣" },
  { to: "/user/projects", label: "My Projects", icon: "📁" },
  { to: "/user/tasks", label: "Daily Task Plan", icon: "📝" },
  { to: "/user/leave", label: "Leave", icon: "✈" },
  { to: "/user/wfh", label: "Work From Home", icon: "🏠" },
  { to: "/user/attendance", label: "My Attendance", icon: "🕒" },
  { to: "/user/salary", label: "Salary Slips", icon: "💰" },
];
