import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { store, useDB, today, nowTime } from "@/lib/store";
import { checkIn, checkOut } from "@/api/dashboard";
import { useAuth } from "@/lib/auth";
import { log } from "console";

export const Route = createFileRoute("/user/")({ component: Page });

function Page() {
  const db = useDB();
  const { session } = useAuth();
  const empId = session!.id;
  const t = today();
  const todayAtt = db.attendance.find((a) => a.employeeId === empId && a.date === t);
  const todayWS = db.workStatus.find((w) => w.employeeId === empId && w.date === t);

  const [mode, setMode] = useState<"office" | "wfh">("office");
  const [plan, setPlan] = useState(todayWS?.plan ?? "");
  const [status, setStatus] = useState(todayWS?.status ?? "");
  const [projectId, setProjectId] = useState(todayWS?.projectId ?? "");

  const myProjects = db.projects.filter((p) => p.assigned.includes(empId));
  const myLeaves = db.leaves.filter((l) => l.employeeId === empId);
  const myWfh = db.wfh.filter((l) => l.employeeId === empId);
  const slips = db.salarySlips.filter((s) => s.employeeId === empId);

  function saveWorkStatus() {
    store.upsertWorkStatus({ employeeId: empId, date: t, plan, status, projectId: projectId || undefined });
  }
  const handleCheckIn = async () => {
  try {
    const res = await checkIn(mode);

    console.log(res.message || "Checked in successfully");

    // Refresh page
    window.location.reload();
  } catch (err: any) {
    console.log(
      err.response?.data?.message || "Failed to check in"
    );
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
        <div className="kpi"><div className="kpi-label">My projects</div><div className="kpi-value">{myProjects.length}</div></div>
        <div className="kpi"><div className="kpi-label">Pending leaves</div><div className="kpi-value">{myLeaves.filter((l) => l.status === "pending").length}</div></div>
        <div className="kpi"><div className="kpi-label">Pending WFH</div><div className="kpi-value">{myWfh.filter((l) => l.status === "pending").length}</div></div>
        <div className="kpi gold"><div className="kpi-label">Salary slips</div><div className="kpi-value">{slips.length}</div></div>
      </div>

      <div className="row-2">
        <div className="card">
          <div className="card-header"><h2>Attendance — {t}</h2></div>
          {!todayAtt && (
            <div>
              <div className="field"><label>Mode</label>
                <select className="select" value={mode} onChange={(e) => setMode(e.target.value as "office" | "wfh")}>
                  <option value="office">Office</option><option value="wfh">Work from home</option>
                </select>
              </div>
              <button className="btn btn-gold" onClick={handleCheckIn}>🕒 Check in</button>
            </div>
          )}
          {todayAtt && (
            <div>
              <p>Checked in at <strong>{todayAtt.checkIn}</strong> ({todayAtt.mode})</p>
              {!todayAtt.checkOut && <button className="btn" onClick={handleCheckOut}>Check out ({nowTime()})</button>}
              {todayAtt.checkOut && <p className="badge success">Day complete — {todayAtt.checkIn} → {todayAtt.checkOut}</p>}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><h2>Today's work plan</h2></div>
          <div className="field"><label>Project</label>
            <select className="select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">— No project —</option>
              {myProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
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
