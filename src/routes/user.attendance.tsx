import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useDB } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/user/attendance")({ component: Page });

function startOf(period: "week" | "month" | "year") {
  const d = new Date();
  if (period === "week") d.setDate(d.getDate() - 7);
  else if (period === "month") d.setMonth(d.getMonth() - 1);
  else d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

function Page() {
  const db = useDB();
  const { session } = useAuth();
  const empId = session!.id;
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const from = startOf(period);
  const rows = useMemo(() => db.attendance.filter((a) => a.employeeId === empId && a.date >= from).sort((a, b) => b.date.localeCompare(a.date)), [db.attendance, empId, from]);

  function exportXlsx() {
    exportToExcel(rows.map((a) => ({ Date: a.date, Mode: a.mode, CheckIn: a.checkIn, CheckOut: a.checkOut ?? "—" })), `my-attendance-${period}.xlsx`, "Attendance");
  }

  return (
    <>
      <div className="toolbar">
        <select className="select" value={period} onChange={(e) => setPeriod(e.target.value as "week" | "month" | "year")} style={{ width: 180 }}>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="year">Last 12 months</option>
        </select>
        <span className="spacer" /><span className="muted">{rows.length} days</span>
        <button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Date</th><th>Mode</th><th>Check-in</th><th>Check-out</th></tr></thead>
          <tbody>
            {rows.map((a) => <tr key={a.id}><td>{a.date}</td><td><span className={"badge " + (a.mode === "wfh" ? "info" : "purple")}>{a.mode}</span></td><td>{a.checkIn}</td><td>{a.checkOut ?? "—"}</td></tr>)}
            {rows.length === 0 && <tr><td colSpan={4} className="empty">No attendance records</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
