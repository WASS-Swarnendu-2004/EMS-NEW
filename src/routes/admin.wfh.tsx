import { createFileRoute } from "@tanstack/react-router";
import { store, useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/admin/wfh")({ component: Page });

function Page() {
  const db = useDB();
  function exportXlsx() {
    exportToExcel(db.wfh.map((l) => {
      const e = db.employees.find((x) => x.id === l.employeeId);
      return { Employee: e?.name, From: l.from, To: l.to, Reason: l.reason, Status: l.status, Applied: l.createdAt };
    }), "wfh-applications.xlsx", "WFH");
  }
  return (
    <>
      <div className="toolbar"><span className="spacer" /><button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export Excel</button></div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Employee</th><th>From</th><th>To</th><th>Reason</th><th>Applied</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {db.wfh.map((l) => {
              const e = db.employees.find((x) => x.id === l.employeeId);
              return (
                <tr key={l.id}>
                  <td>{e?.name}</td><td>{l.from}</td><td>{l.to}</td>
                  <td style={{ maxWidth: 280 }}>{l.reason}</td><td>{l.createdAt.slice(0,10)}</td>
                  <td><span className={"badge " + (l.status === "approved" ? "success" : l.status === "rejected" ? "danger" : "warn")}>{l.status}</span></td>
                  <td className="actions">
                    {l.status === "pending" && <>
                      <button className="btn btn-sm btn-success" onClick={() => store.setWfhStatus(l.id, "approved")}>Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => store.setWfhStatus(l.id, "rejected")}>Reject</button>
                    </>}
                  </td>
                </tr>
              );
            })}
            {db.wfh.length === 0 && <tr><td colSpan={7} className="empty">No WFH applications</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
