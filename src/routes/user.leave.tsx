import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
// import { store, useDB, today, type LeaveApp } from "@/lib/store";
import { today } from "@/lib/store";
import { getMyLeaves, applyLeave, type Leave } from "@/api/leave";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/user/leave")({ component: Page });

function Page() {
  // const db = useDB();
  const [history, setHistory] = useState<Leave[]>([]);
  const [type, setType] = useState<
  "casual" | "sick" | "earned"
>("casual");
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [reason, setReason] = useState("");

 async function submit(e: React.FormEvent) {
  e.preventDefault();

  try {

    await applyLeave({

      leaveType:
        type === "casual"
          ? "Casual"
          : type === "sick"
          ? "Sick"
          : "Earned",

      fromDate: from,
      toDate: to,
      reason,

    });


    await fetchLeaves();


    setType("casual");
    setFrom(today());
    setTo(today());
    setReason("");


  } catch (error) {

    console.error("Apply leave failed:", error);

  }
}

  // const history = db.leaves.filter((l) => l.employeeId === empId);

  useEffect(() => {
    fetchLeaves();
  }, [])
  
  const fetchLeaves = async () => {
  try {
    const data = await getMyLeaves();
    setHistory(data);
  } catch (error) {
    console.error(error);
  }
};

  return (
    <>
      <div className="row-2">
        <div className="card">
          <div className="card-header"><h2>Apply for leave</h2></div>
          <form onSubmit={submit}>
            <div className="field"><label>Type</label>
              <select
className="select"
value={type}
onChange={(e)=>
setType(
 e.target.value as "casual" | "sick" | "earned"
)
}
>
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
                  <tr key={l._id}>
                    <td><span className="badge purple">{l.leaveType}</span></td>
                    <td>{new Date(l.fromDate).toLocaleDateString()}</td><td>{new Date(l.toDate).toLocaleDateString()}</td>
                    <td><span className={"badge " + (l.status === "Approved" ? "success" : l.status === "Rejected" ? "danger" : "warn")}>{l.status}</span></td>
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
