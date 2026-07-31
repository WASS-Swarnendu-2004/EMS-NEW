import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";
import { getWorkStatus, type WorkStatus } from "@/api/workStatus";
import { getEmployees, type Employee } from "@/api/employee";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/admin/work-status")({ component: Page });

function Page() {
  const db = useDB();
  // const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [date, setDate] = useState("");
  const [empId, setEmpId] = useState("all");
  const [rows, setRows] = useState<WorkStatus[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
    loadEmployees();
 }, []);

async function loadReports() {
  try {
    setLoading(true);

    const data = await getWorkStatus();

    setRows(data);
  } catch (err: any) {
    console.error(err);

    toast.error(
      err.response?.data?.message || "Failed to load work reports"
    );
  } finally {
    setLoading(false);
  }
}
  
  async function loadEmployees() {
  try {
    const data = await getEmployees();
    setEmployees(data);
  } catch (err: any) {
    console.error(err);

    toast.error(
      err.response?.data?.message || "Failed to load employees"
    );
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
  if (filteredRows.length === 0) {
    toast.warning("No work reports to export");
    return;
  }

  exportToExcel(
    filteredRows.map((w) => ({
      Date: w.workDate.slice(0, 10),
      Employee:
        employees.find(
          (e) =>
            e._id ===
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

  toast.success("Work reports exported successfully");
}
  
 if (loading) {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
      <p className="text-gray-500 text-lg font-medium">
        Loading work reports...
      </p>
    </div>
  );
}

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
