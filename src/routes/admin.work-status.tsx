import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/admin/work-status")({ component: Page });

function Page() {
  const db = useDB();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [empId, setEmpId] = useState("all");

  const rows = db.workStatus
    .filter((w) => (!date || w.date === date) && (empId === "all" || w.employeeId === empId))
    .sort((a, b) => b.date.localeCompare(a.date));

  function exportXlsx() {
    exportToExcel(rows.map((w) => {
      const e = db.employees.find((x) => x.id === w.employeeId);
      const p = db.projects.find((x) => x.id === w.projectId);
      return { Date: w.date, Employee: e?.name, Project: p?.name ?? "—", Plan: w.plan, EndOfDayStatus: w.status };
    }), "work-status.xlsx", "WorkStatus");
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
            {rows.map((w) => {
              const e = db.employees.find((x) => x.id === w.employeeId);
              const p = db.projects.find((x) => x.id === w.projectId);
              return <tr key={w.id}><td>{w.date}</td><td>{e?.name}</td><td>{p?.name ?? "—"}</td><td>{w.plan}</td><td>{w.status}</td></tr>;
            })}
            {rows.length === 0 && <tr><td colSpan={5} className="empty">No reports for filters</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
