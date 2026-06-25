import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { store, useDB, today } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/user/tasks")({ component: Page });

function Page() {
  const db = useDB();
  const { session } = useAuth();
  const empId = session!.id;
  const [date, setDate] = useState(today());

  const ws = db.workStatus.find((w) => w.employeeId === empId && w.date === date);
  const myProjects = db.projects.filter((p) => p.assigned.includes(empId));

  const [plan, setPlan] = useState(ws?.plan ?? "");
  const [status, setStatus] = useState(ws?.status ?? "");
  const [projectId, setProjectId] = useState(ws?.projectId ?? "");

  // when date changes, reset
  function changeDate(d: string) {
    setDate(d);
    const w = db.workStatus.find((x) => x.employeeId === empId && x.date === d);
    setPlan(w?.plan ?? ""); setStatus(w?.status ?? ""); setProjectId(w?.projectId ?? "");
  }

  const history = db.workStatus.filter((w) => w.employeeId === empId).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <div className="card">
        <div className="card-header"><h2>Daily task plan</h2>
          <input className="input" type="date" value={date} onChange={(e) => changeDate(e.target.value)} style={{ width: 180 }} />
        </div>
        <div className="field"><label>Project</label>
          <select className="select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">— Select project —</option>
            {myProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field"><label>Plan for the day</label><textarea className="textarea" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="What do you plan to accomplish today?" /></div>
        <div className="field"><label>End-of-day status / blockers</label><textarea className="textarea" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Report what's done and any blockers." /></div>
        <button className="btn" onClick={() => store.upsertWorkStatus({ employeeId: empId, date, plan, status, projectId: projectId || undefined })}>Save</button>
      </div>

      <div className="card">
        <div className="card-header"><h2>My recent reports</h2></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Date</th><th>Project</th><th>Plan</th><th>Status</th></tr></thead>
            <tbody>
              {history.slice(0, 20).map((w) => {
                const p = db.projects.find((x) => x.id === w.projectId);
                return <tr key={w.id}><td>{w.date}</td><td>{p?.name ?? "—"}</td><td>{w.plan}</td><td>{w.status}</td></tr>;
              })}
              {history.length === 0 && <tr><td colSpan={4} className="empty">No reports yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
