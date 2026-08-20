import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  useEffect,
  useState,
  type ReactNode,
  type ComponentType,
} from "react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  PlaneTakeoff,
  Home,
  Clock,
  ClipboardList,
  Wallet,
  Mail,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import logo1 from "@/assets/logo1.jpg";
import { useAuth } from "@/lib/auth";

type IconType = ComponentType<{
  size?: number;
  className?: string;
}>;

interface NavItem {
  to: string;
  label: string;
  icon: IconType;
}

export function Shell({
  items,
  title,
  children,
}: {
  items: NavItem[];
  title: string;
  children: ReactNode;
}) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Close mobile sidebar whenever route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const current =
    [...items]
      .sort((a, b) => b.to.length - a.to.length)
      .find(
        (i) =>
          pathname === i.to ||
          pathname.startsWith(i.to + "/")
      )?.label ?? "Dashboard";

  const handleLogout = () => {
    setSidebarOpen(false);
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="app">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="brand">
          <img src={logo1} alt="WebApps" />

          <div className="brand-info">
            <div className="brand-text">WASS</div>
            <div className="brand-sub">
              Employee Management
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav>
          {items.map((i) => {
            const Icon = i.icon;

            return (
              <Link
                key={i.to}
                to={i.to}
                activeOptions={{
                  exact:
                    i.to.endsWith("/admin") ||
                    i.to.endsWith("/user"),
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon
                  size={16}
                  className="nav-icon"
                />

                <span>{i.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="user-name">
            {session?.name}
          </div>

          <div className="user-role">
            {session?.kind}
          </div>

          <button
            className="btn btn-gold btn-sm"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
            >
              <Menu size={22} />
            </button>

            <div className="page-title">
              {title === "auto" ? current : title}
            </div>
          </div>

          <div
            className="muted topbar-time"
            style={{
              fontSize: ".85rem",
              textAlign: "right",
            }}
          >
            <div>
              {currentTime.toLocaleDateString()}
            </div>

            <div>
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </header>

        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}

export const adminNav: NavItem[] = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/employees",
    label: "Employees",
    icon: Users,
  },
  {
    to: "/admin/projects",
    label: "Projects",
    icon: FolderKanban,
  },
  {
    to: "/admin/leaves",
    label: "Leave Requests",
    icon: PlaneTakeoff,
  },
  {
    to: "/admin/wfh",
    label: "WFH Requests",
    icon: Home,
  },
  {
    to: "/admin/attendance",
    label: "Attendance",
    icon: Clock,
  },
  {
    to: "/admin/work-status",
    label: "Daily Work Status",
    icon: ClipboardList,
  },
  {
    to: "/admin/tasks",
    label: "Tasks",
    icon: ClipboardList,
  },
  {
    to: "/admin/advance-amount",
    label: "Advance & Claim",
    icon: Wallet,
  },
  {
    to: "/admin/salary",
    label: "Salary Slips",
    icon: Wallet,
  },
  {
    to: "/admin/mail",
    label: "Mailing",
    icon: Mail,
  },
];

export const userNav: NavItem[] = [
  {
    to: "/user",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/user/projects",
    label: "Projects & Tasks",
    icon: FolderKanban,
  },
  {
    to: "/user/tasks",
    label: "Daily Task Plan",
    icon: ClipboardList,
  },
  {
    to: "/user/leave",
    label: "Leave",
    icon: PlaneTakeoff,
  },
  {
    to: "/user/wfh",
    label: "Work From Home",
    icon: Home,
  },
  {
    to: "/user/attendance",
    label: "My Attendance",
    icon: Clock,
  },
  {
    to: "/user/advance-amount",
    label: "Advance & Claim",
    icon: Wallet,
  },
  {
    label: "Task Management",
    icon: ClipboardList,
    to: "/user/task-management",
  },
  {
    to: "/user/salary",
    label: "Salary Slips",
    icon: Wallet,
  },
];