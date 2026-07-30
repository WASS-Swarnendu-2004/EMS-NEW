import { createFileRoute } from "@tanstack/react-router";
import { store, useDB, today, nowTime } from "@/lib/store";
import { checkIn, checkOut, getDashboard, type DashboardResponse } from "@/api/dashboard";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { log } from "console";

export const Route = createFileRoute("/user/")({ component: Page });

function Page() {
  const { session } = useAuth();
  const empId = session!.id;
  const [mode, setMode] = useState<"office" | "wfh">("office");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");

  const t = today();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetchDashboard();
}, []);

const fetchDashboard = async () => {
  try {
    setLoading(true);

    const res = await getDashboard();

    setDashboard(res);

    setPlan(res.todayPlan?.plan ?? "");
    setStatus(res.todayPlan?.status ?? "");
    setProjectId(res.todayPlan?.projectId ?? "");
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};


  function saveWorkStatus() {
    store.upsertWorkStatus({ employeeId: empId, date: t, plan, status, projectId: projectId || undefined });
  }
  const handleCheckIn = async () => {
  try {
    const res = await checkIn(mode);

    console.log(res.message);

    await fetchDashboard();
  } catch (err: any) {
    console.log(err.response?.data?.message);
  }
};
  
  const handleCheckOut = async () => {
  try {
    const res = await checkOut();

    console.log(res.message || "Checked out successfully");

    window.location.reload();
  } catch (err: any) {
    console.log(
      err.response?.data?.message || "Failed to check out"
    );
  }
  };
  

  return (
    <>
      <div className="kpis">
        <div className="kpi"><div className="kpi-label">My projects</div><div className="kpi-value">{dashboard?.cards.myProjects ?? 0}</div></div>
        <div className="kpi"><div className="kpi-label">Pending leaves</div><div className="kpi-value">{dashboard?.cards.pendingLeaves ?? 0}</div></div>
        <div className="kpi"><div className="kpi-label">Pending WFH</div><div className="kpi-value">{dashboard?.cards.pendingWFH ?? 0}</div></div>
        <div className="kpi gold"><div className="kpi-label">Salary slips</div><div className="kpi-value">{dashboard?.cards.salarySlips ?? 0}</div></div>
      </div>

      <div className="row-2">
        <div className="card">
          <div className="card-header"><h2>Attendance — {t}</h2></div>
          {!dashboard?.attendance && (
            <div>
              <div className="field"><label>Mode</label>
                <select className="select" value={mode} onChange={(e) => setMode(e.target.value as "office" | "wfh")}>
                  <option value="office">Office</option><option value="wfh">Work from home</option>
                </select>
              </div>
              <button className="btn btn-gold" onClick={handleCheckIn}>🕒 Check in</button>
            </div>
          )}
          {dashboard?.attendance && (
            <div>
              <p>Checked in at <strong>{dashboard.attendance.checkIn}</strong> ({dashboard.attendance.mode})</p>
              {!dashboard.attendance.checkOut && <button className="btn" onClick={handleCheckOut}>Check out ({nowTime()})</button>}
              {dashboard.attendance.checkOut && <p className="badge success">Day complete — {dashboard.attendance.checkIn} → {dashboard.attendance.checkOut}</p>}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><h2>Today's work plan</h2></div>
          <div className="field"><label>Project</label>
            <select className="select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">— No project —</option>
            </select>
          </div>
          <div className="field"><label>Morning plan</label><textarea className="textarea" value={plan} onChange={(e) => setPlan(e.target.value)} /></div>
          <div className="field"><label>End-of-day status</label><textarea className="textarea" value={status} onChange={(e) => setStatus(e.target.value)} /></div>
          <button className="btn" onClick={saveWorkStatus}>Save</button>
        </div>
      </div>
    </>
  );
}
