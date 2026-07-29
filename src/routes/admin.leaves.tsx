import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {getLeaves,approveLeave,rejectLeave,type Leave,
} from "@/api/leave";
import { store, useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/admin/leaves")({ component: Page });

function Page() {
  const db = useDB();
  const [leaves, setLeaves] = useState<Leave[]>([]);

  useEffect(() => {
    fetchLeaves();
}, []);

const fetchLeaves = async () => {
    const data = await getLeaves();
    setLeaves(data);
};

  function exportXlsx() {
    exportToExcel(leaves.map((l) => {
      const e = db.employees.find((x) => x.id === l.employeeId);
      return { Employee: e?.name, Email: e?.email, Type: l.type, From: l.from, To: l.to, Reason: l.reason, Status: l.status, Applied: l.createdAt };
    }), "leave-applications.xlsx", "Leaves");
  }

  return (
    <>
      <div className="toolbar"><span className="spacer" /><button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export Excel</button></div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Applied</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {leaves.map((l) => {
              const e = db.employees.find((x) => x.id === l.employeeId);
              return (
                <tr key={l.id}>
                  <td>{e?.name ?? "—"}</td>
                  <td><span className="badge purple">{l.type}</span></td>
                  <td>{l.from}</td>
                  <td>{l.to}</td>
                  <td style={{ maxWidth: 240 }}>{l.reason}</td>
                  <td>{l.createdAt.slice(0, 10)}</td>
                  <td><span className={"badge " + (l.status === "approved" ? "success" : l.status === "rejected" ? "danger" : "warn")}>{l.status}</span></td>
                  <td className="actions">
                    {l.status === "pending" && <>
                      <button className="btn btn-sm btn-success" onClick={() => store.setLeaveStatus(l.id, "approved")}>Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => store.setLeaveStatus(l.id, "rejected")}>Reject</button>
                    </>}
                  </td>
                </tr>
              );
            })}
            {db.leaves.length === 0 && <tr><td colSpan={8} className="empty">No leave applications</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
