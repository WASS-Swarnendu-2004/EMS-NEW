import { createFileRoute, Link } from "@tanstack/react-router";
// import { useDB } from "@/lib/store";
import { useEffect, useState } from "react";
import {
  getAdminDashboard,
  type DashboardCards,
  type RecentWorkStatus,
} from "@/api/adminDashboard";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  // const db = useDB();
  // const today = new Date().toISOString().slice(0, 10);
  // const pendingLeaves = db.leaves.filter((l) => l.status === "pending").length;
  // const pendingWfh = db.wfh.filter((l) => l.status === "pending").length;
  // const presentToday = db.attendance.filter((a) => a.date === today).length;
  // const activeProjects = db.projects.filter((p) => p.status === "in_progress").length;

  const [cards, setCards] = useState<DashboardCards | null>(null);
  const [recentWorkStatus, setRecentWorkStatus] = useState<RecentWorkStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const data = await getAdminDashboard();

        setCards(data.cards);
        setRecentWorkStatus(data.recentWorkStatus);
      } catch (err: any) {
        console.error(err);

        toast.error(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="kpi">
          <div className="kpi-label">Employees</div>
          <div className="kpi-value">{cards?.totalEmployees ?? 0}</div>
          <div className="kpi-foot">Active workforce</div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Active Projects</div>
          <div className="kpi-value">{cards?.activeProjects ?? 0}</div>
          <div className="kpi-foot">{cards?.activeProjects ?? 0} Active</div>
        </div>

        <div className="kpi gold">
          <div className="kpi-label">Present Today</div>
          <div className="kpi-value">{cards?.presentToday ?? 0}</div>
          <div className="kpi-foot">Of {cards?.totalEmployees ?? 0}</div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Pending Approvals</div>
          <div className="kpi-value">{cards?.pendingApprovals ?? 0}</div>
          <div className="kpi-foot">
            {cards?.pendingLeave ?? 0} leave · {cards?.pendingWFH ?? 0} WFH
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-6">
        <div className="card-header">
          <h2>Quick actions</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Link to="/admin/employees" className="btn w-full">
            Manage employees
          </Link>

          <Link to="/admin/projects" className="btn btn-ghost w-full">
            Manage projects
          </Link>

          <Link to="/admin/leaves" className="btn btn-ghost w-full">
            Leave requests ({cards?.pendingLeave ?? 0})
          </Link>

          <Link to="/admin/wfh" className="btn btn-ghost w-full">
            WFH requests ({cards?.pendingWFH ?? 0})
          </Link>

          <Link to="/admin/salary" className="btn btn-gold w-full">
            Generate salary
          </Link>
        </div>
      </div>

      {/* Recent Work Status */}
      <div className="card mt-6">
        <div className="card-header">
          <h2>Recent daily work status</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table min-w-[700px]">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Plan</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentWorkStatus.map((w) => (
                <tr key={w._id}>
                  <td>{new Date(w.workDate).toLocaleDateString()}</td>
                  <td>{w.employee.fullName}</td>
                  <td>{w.plan}</td>
                  <td>{w.endOfDayStatus}</td>
                </tr>
              ))}

              {recentWorkStatus.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    No reports yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
