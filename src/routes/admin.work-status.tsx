import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";
import { getWorkStatus, type WorkStatus } from "@/api/workStatus";

export const Route = createFileRoute("/admin/work-status")({ component: Page });

function Page() {
  const db = useDB();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [empId, setEmpId] = useState("all");
  const [rows, setRows] = useState<WorkStatus[]>([]);

  useEffect(() => {
  loadReports();
 }, []);

async function loadReports() {
  try {
    const data = await getWorkStatus();
    setRows(data);
  } catch (err) {
    console.error(err);
  }
  }
  const filteredRows = rows
  .filter(
    (w) =>
      (!date || w.workDate.slice(0, 10) === date) &&
      (empId === "all" ||
        (typeof w.employee !== "string" && w.employee._id === empId))
  )
  .sort((a, b) => b.workDate.localeCompare(a.workDate));

  // const rows = db.workStatus
  //   .filter((w) => (!date || w.date === date) && (empId === "all" || w.employeeId === empId))
  //   .sort((a, b) => b.date.localeCompare(a.date));

  function exportXlsx() {
  exportToExcel(
    filteredRows.map((w) => ({
      Date: w.workDate.slice(0, 10),
      Employee:
        typeof w.employee === "string"
          ? w.employee
          : w.employee.employeeId,
      Project: w.project?.projectName ?? "—",
      Plan: w.plan,
      EndOfDayStatus: w.endOfDayStatus,
    })),
    "work-status.xlsx",
    "WorkStatus"
  );
}

  return (
    <>
      <div className="toolbar">
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 180 }} />
        <select className="select" value={empId} onChange={(e) => setEmpId(e.target.value)} style={{ width: 220 }}>
          <option value="all">All employees</option>
          {db.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <button className="btn btn-sm btn-ghost" onClick={() => setDate("")}>Clear date</button>
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export Excel</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Date</th><th>Employee</th><th>Project</th><th>Plan</th><th>End-of-day status</th></tr></thead>
          <tbody>
            {filteredRows.map((w) => (<tr key={w._id}><td>{w.workDate.slice(0, 10)}</td><td>{typeof w.employee === "string"
            ? w.employee
            : w.employee.employeeId}</td>
            <td>{w.project?.projectName ?? "—"}</td>
            <td>{w.plan}</td>
            <td>{w.endOfDayStatus}</td>
          </tr>
    ))}
            {filteredRows.length === 0 && <tr><td colSpan={5} className="empty">No reports for filters</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
