import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { store, useDB, today, type LeaveApp } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/user/leave")({ component: Page });

function Page() {
  const db = useDB();
  const { session } = useAuth();
  const empId = session!.id;
  const [type, setType] = useState<LeaveApp["type"]>("casual");
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [reason, setReason] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    store.addLeave({ employeeId: empId, type, from, to, reason });
    setReason("");
  }

  const history = db.leaves.filter((l) => l.employeeId === empId);

  return (
    <>
      <div className="row-2">
        <div className="card">
          <div className="card-header"><h2>Apply for leave</h2></div>
          <form onSubmit={submit}>
            <div className="field"><label>Type</label>
              <select className="select" value={type} onChange={(e) => setType(e.target.value as LeaveApp["type"])}>
                <option value="casual">Casual</option><option value="sick">Sick</option><option value="earned">Earned</option>
              </select>
            </div>
            <div className="row-2">
              <div className="field"><label>From</label><input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
              <div className="field"><label>To</label><input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            </div>
            <div className="field"><label>Reason</label><textarea className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} required /></div>
            <button className="btn" type="submit">Submit application</button>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><h2>My leave history</h2></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Type</th><th>From</th><th>To</th><th>Status</th></tr></thead>
              <tbody>
                {history.map((l) => (
                  <tr key={l.id}>
                    <td><span className="badge purple">{l.type}</span></td>
                    <td>{l.from}</td><td>{l.to}</td>
                    <td><span className={"badge " + (l.status === "approved" ? "success" : l.status === "rejected" ? "danger" : "warn")}>{l.status}</span></td>
                  </tr>
                ))}
                {history.length === 0 && <tr><td colSpan={4} className="empty">No leaves yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
