import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/admin/attendance")({ component: Page });

function startOf(period: "week" | "month" | "year") {
  const d = new Date();
  if (period === "week") { d.setDate(d.getDate() - 7); }
  else if (period === "month") { d.setMonth(d.getMonth() - 1); }
  else { d.setFullYear(d.getFullYear() - 1); }
  return d.toISOString().slice(0, 10);
}

function Page() {
  const db = useDB();
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [empId, setEmpId] = useState<string>("all");

  const from = startOf(period);
  const filtered = useMemo(() => db.attendance
    .filter((a) => a.date >= from && (empId === "all" || a.employeeId === empId))
    .sort((a, b) => b.date.localeCompare(a.date)),
    [db.attendance, from, empId]);

  function exportXlsx() {
    exportToExcel(filtered.map((a) => {
      const e = db.employees.find((x) => x.id === a.employeeId);
      return { Date: a.date, Employee: e?.name, Mode: a.mode, CheckIn: a.checkIn, CheckOut: a.checkOut ?? "—" };
    }), `attendance-${period}.xlsx`, "Attendance");
  }

  return (
    <>
      <div className="toolbar">
        <select className="select" value={period} onChange={(e) => setPeriod(e.target.value as "week" | "month" | "year")} style={{ width: 160 }}>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="year">Last 12 months</option>
        </select>
        <select className="select" value={empId} onChange={(e) => setEmpId(e.target.value)} style={{ width: 220 }}>
          <option value="all">All employees</option>
          {db.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <span className="spacer" />
        <span className="muted">{filtered.length} records</span>
        <button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export Excel</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Date</th><th>Employee</th><th>Mode</th><th>Check-in</th><th>Check-out</th></tr></thead>
          <tbody>
            {filtered.map((a) => {
              const e = db.employees.find((x) => x.id === a.employeeId);
              return <tr key={a.id}>
                <td>{a.date}</td>
                <td>{e?.name}</td>
                <td><span className={"badge " + (a.mode === "wfh" ? "info" : "purple")}>{a.mode}</span></td>
                <td>{a.checkIn}</td>
                <td>{a.checkOut ?? <span className="muted">—</span>}</td>
              </tr>;
            })}
            {filtered.length === 0 && <tr><td colSpan={5} className="empty">No attendance for this period</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
