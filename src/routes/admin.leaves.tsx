import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {getLeaves,approveLeave,rejectLeave,type Leave,
} from "@/api/leave";
import { useDB } from "@/lib/store";
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
  
  const handleApprove = async (id: string) => {
  try {
    await approveLeave(id);
    fetchLeaves();
  } catch (error) {
    console.error(error);
  }
};

const handleReject = async (id: string) => {
  try {
    await rejectLeave(id);
    fetchLeaves();
  } catch (error) {
    console.error(error);
  }
};

  function exportXlsx() {
  exportToExcel(
    leaves.map((l) => ({
      EmployeeID: l.employee.employeeId,
      Type: l.leaveType,
      From: l.fromDate,
      To: l.toDate,
      Reason: l.reason,
      Status: l.status,
      Applied: l.appliedAt,
    })),
    "leave-applications.xlsx",
    "Leaves"
  );
}

  return (
    <>
      <div className="toolbar"><span className="spacer" /><button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export Excel</button></div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Applied</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {leaves.map((l) => {
              return (
                <tr key={l._id}>
                  <td>{l.employee.employeeId}</td>
                  <td><span className="badge purple">{l.leaveType}</span></td>
                  <td>{new Date(l.fromDate).toLocaleDateString()}</td>
                  <td>{new Date(l.toDate).toLocaleDateString()}</td>
                  <td style={{ maxWidth: 240 }}>{l.reason}</td>
                  <td>{new Date(l.appliedAt).toLocaleDateString()}</td>
                  <td><span className={"badge " + (l.status === "Approved" ? "success" : l.status === "Rejected" ? "danger" : "warn")}>{l.status}</span></td>
                  <td className="actions">
                    {l.status === "Pending" && <>
                      <button className="btn btn-sm btn-success" onClick={() => handleApprove(l._id)}>Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleReject(l._id)}>Reject</button>
                    </>}
                  </td>
                </tr>
              );
            })}
            {leaves.length === 0 && <tr><td colSpan={8} className="empty">No leave applications</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
