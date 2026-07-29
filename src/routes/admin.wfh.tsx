import { createFileRoute } from "@tanstack/react-router";
// import { store, useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";
import { useEffect, useState } from "react";
import {getWFHApplications,updateWFHStatus,type WFHApplication,} from "@/api/wfh";

export const Route = createFileRoute("/admin/wfh")({ component: Page });


function Page() {
  // const db = useDB();
  const [requests, setRequests] = useState<WFHApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getWFHApplications();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusUpdate = async (
    id: string,
    status: "Approved" | "Rejected"
  ) => {
    try {
      await updateWFHStatus(id, status);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  }

  function exportXlsx() {
    exportToExcel(
      requests.map((l) => ({
        Employee:
          typeof l.employee === "string"
            ? l.employee
            : l.employee.employeeId,
        From: l.fromDate.slice(0, 10),
        To: l.toDate.slice(0, 10),
        Reason: l.reason,
        Status: l.status,
        Applied: l.appliedAt.slice(0, 10),
      })),
      "wfh-applications.xlsx",
      "WFH"
    );

    return (
      <>
        <div className="toolbar"><span className="spacer" /><button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export Excel</button></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Employee</th><th>From</th><th>To</th><th>Reason</th><th>Applied</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {requests.map((l) => {
                return (
                  <tr key={l._id}>
                    <td>{typeof l.employee === "string" ? l.employee : l.employee.employeeId}</td><td>{l.fromDate.slice(0, 10)}</td><td>{l.toDate.slice(0, 10)}</td>
                    <td style={{ maxWidth: 280 }}>{l.reason}</td><td>{l.appliedAt.slice(0, 10)}</td>
                    <td><span className={"badge " + (l.status === "Approved" ? "success" : l.status === "Rejected" ? "danger" : "warn")}>{l.status}</span></td>
                    <td className="actions">
                      {l.status === "Pending" && <>
                        <button className="btn btn-sm btn-success" onClick={() => handleStatusUpdate(l._id, "Approved")}>Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleStatusUpdate(l._id, "Rejected")}>Reject</button>
                      </>}
                    </td>
                  </tr>
                );
              })}
              {requests.length === 0 && <tr><td colSpan={7} className="empty">No WFH applications</td></tr>}
            </tbody>
          </table>
        </div>
      </>
    );
  }
}
