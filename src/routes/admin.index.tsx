import { createFileRoute, Link } from "@tanstack/react-router";
import { useDB } from "@/lib/store";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const db = useDB();
  const today = new Date().toISOString().slice(0, 10);
  const pendingLeaves = db.leaves.filter((l) => l.status === "pending").length;
  const pendingWfh = db.wfh.filter((l) => l.status === "pending").length;
  const presentToday = db.attendance.filter((a) => a.date === today).length;
  const activeProjects = db.projects.filter((p) => p.status === "in_progress").length;

  return (
    <>
      <div className="kpis">
        <div className="kpi"><div className="kpi-label">Employees</div><div className="kpi-value">{db.employees.length}</div><div className="kpi-foot">Active workforce</div></div>
        <div className="kpi"><div className="kpi-label">Active Projects</div><div className="kpi-value">{activeProjects}</div><div className="kpi-foot">{db.projects.length} total</div></div>
        <div className="kpi gold"><div className="kpi-label">Present Today</div><div className="kpi-value">{presentToday}</div><div className="kpi-foot">Of {db.employees.length}</div></div>
        <div className="kpi"><div className="kpi-label">Pending Approvals</div><div className="kpi-value">{pendingLeaves + pendingWfh}</div><div className="kpi-foot">{pendingLeaves} leave · {pendingWfh} WFH</div></div>
      </div>

      <div className="card">
        <div className="card-header"><h2>Quick actions</h2></div>
        <div className="flex" style={{ flexWrap: "wrap" }}>
          <Link to="/admin/employees" className="btn">Manage employees</Link>
          <Link to="/admin/projects" className="btn btn-ghost">Manage projects</Link>
          <Link to="/admin/leaves" className="btn btn-ghost">Leave requests ({pendingLeaves})</Link>
          <Link to="/admin/wfh" className="btn btn-ghost">WFH requests ({pendingWfh})</Link>
          <Link to="/admin/salary" className="btn btn-gold">Generate salary</Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2>Recent daily work status</h2></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Date</th><th>Employee</th><th>Plan</th><th>Status</th></tr></thead>
            <tbody>
              {db.workStatus.slice(0, 8).map((w) => {
                const emp = db.employees.find((e) => e.id === w.employeeId);
                return <tr key={w.id}><td>{w.date}</td><td>{emp?.name ?? "—"}</td><td>{w.plan}</td><td>{w.status}</td></tr>;
              })}
              {db.workStatus.length === 0 && <tr><td colSpan={4} className="empty">No reports yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
