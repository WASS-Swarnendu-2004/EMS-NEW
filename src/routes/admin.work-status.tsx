import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";
import { getWorkStatus, type WorkStatus } from "@/api/workStatus";
import { getEmployees, type Employee } from "@/api/employee";

export const Route = createFileRoute("/admin/work-status")({ component: Page });

function Page() {
  const db = useDB();
  // const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [date, setDate] = useState("");
  const [empId, setEmpId] = useState("all");
  const [rows, setRows] = useState<WorkStatus[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    loadReports();
    loadEmployees();
 }, []);

async function loadReports() {
  try {
    const data = await getWorkStatus();

    console.log("API Data:", data);
    console.log("Is Array:", Array.isArray(data));

    setRows(data);
  } catch (err) {
    console.error(err);
  }
  }
  
  async function loadEmployees() {
  try {
    const data = await getEmployees();
    setEmployees(data);
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
      Employee:employees.find((e) =>e._id ===
      (typeof w.employee === "string"
        ? w.employee
        : w.employee._id)
  )?.fullName ?? "Unknown Employee",
      Project: w.project?.projectName ?? "—",
      Plan: w.plan,
      EndOfDayStatus: w.endOfDayStatus,
    })),
    "work-status.xlsx",
    "WorkStatus"
  );
  }
  
  // console.log("Rows:", rows);
  // console.log("Filtered Rows:", filteredRows);
  // console.log("Selected Date:", date);

  return (
    <>
      <div className="toolbar">
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 180 }} />
        <select className="select" value={empId} onChange={(e) => setEmpId(e.target.value)} style={{ width: 220 }}>
          <option value="all">All employees</option>
          {employees.map((e) => <option key={e._id} value={e._id}>{e.fullName}</option>)}
        </select>
        <button className="btn btn-sm btn-ghost" onClick={() => setDate("")}>Clear date</button>
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export Excel</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Date</th><th>Employee</th><th>Project</th><th>Plan</th><th>End-of-day status</th></tr></thead>
          <tbody>
            {filteredRows.map((w) => (<tr key={w._id}><td>{w.workDate.slice(0, 10)}</td><td>{(() => {const emp =typeof w.employee === "string"? employees.find((e) => e._id === w.employee): employees.find((e) => e._id === w.employee._id);return emp?.fullName ?? "Unknown Employee";})()}</td>
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
