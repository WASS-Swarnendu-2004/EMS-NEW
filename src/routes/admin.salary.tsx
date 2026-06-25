import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { store, useDB, type SalarySlip } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";
import logo from "@/assets/logo.jpeg.asset.json";

export const Route = createFileRoute("/admin/salary")({ component: Page });

function currentMonth() { return new Date().toISOString().slice(0, 7); }

function Page() {
  const db = useDB();
  const [month, setMonth] = useState(currentMonth());
  const [view, setView] = useState<SalarySlip | null>(null);

  const slipsForMonth = db.salarySlips.filter((s) => s.month === month);

  function genAll() { store.generateSalaryForAll(month); }
  function genOne(id: string) { store.generateSalary(id, month); }

  function exportXlsx() {
    exportToExcel(db.salarySlips.map((s) => {
      const e = db.employees.find((x) => x.id === s.employeeId);
      return { Month: s.month, Employee: e?.name, Basic: s.basic, HRA: s.hra, Allowances: s.allowances, Deductions: s.deductions, Net: s.net };
    }), "salary-slips.xlsx", "Salaries");
  }

  return (
    <>
      <div className="toolbar">
        <label className="flex"><span className="muted">Month:</span>
          <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: 180 }} />
        </label>
        <button className="btn btn-gold" onClick={genAll}>⚡ Auto-generate for all</button>
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export Excel</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Employee</th><th>Role</th><th>Gross</th><th>Generated for {month}</th><th></th></tr></thead>
          <tbody>
            {db.employees.map((e) => {
              const slip = slipsForMonth.find((s) => s.employeeId === e.id);
              return (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td><span className="badge purple">{e.role}</span></td>
                  <td>₹{e.salary.toLocaleString()}</td>
                  <td>{slip ? <span className="badge success">Net ₹{slip.net.toLocaleString()}</span> : <span className="badge warn">Not generated</span>}</td>
                  <td className="actions">
                    {slip
                      ? <button className="btn btn-sm btn-ghost" onClick={() => setView(slip)}>View slip</button>
                      : <button className="btn btn-sm" onClick={() => genOne(e.id)}>Generate</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {view && (
        <div className="modal-backdrop" onClick={() => setView(null)}>
          <div className="modal lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head no-print"><h2>Salary Slip</h2>
              <div className="flex">
                <button className="btn btn-ghost" onClick={() => window.print()}>🖨 Print</button>
                <button className="btn btn-ghost" onClick={() => setView(null)}>✕</button>
              </div>
            </div>
            <SalarySlipView slip={view} empName={db.employees.find((e) => e.id === view.employeeId)?.name ?? ""} role={db.employees.find((e) => e.id === view.employeeId)?.role ?? ""} />
          </div>
        </div>
      )}
    </>
  );
}

export function SalarySlipView({ slip, empName, role }: { slip: SalarySlip; empName: string; role: string }) {
  return (
    <div className="slip">
      <div className="slip-head">
        <div className="flex"><img src={logo.url} alt="logo" /><div><h2>WebApps Softwares</h2><div className="muted">Salary Slip · {slip.month}</div></div></div>
        <div className="text-right"><div className="muted">Issued</div><div>{slip.generatedAt.slice(0, 10)}</div></div>
      </div>
      <div className="slip-grid">
        <div><span>Employee:</span> <strong>{empName}</strong></div>
        <div><span>Role:</span> <strong>{role}</strong></div>
        <div><span>Slip ID:</span> {slip.id}</div>
        <div><span>Pay period:</span> {slip.month}</div>
      </div>
      <table className="slip-table">
        <thead><tr><th>Earnings</th><th className="text-right">Amount (₹)</th></tr></thead>
        <tbody>
          <tr><td>Basic</td><td className="text-right">{slip.basic.toLocaleString()}</td></tr>
          <tr><td>HRA</td><td className="text-right">{slip.hra.toLocaleString()}</td></tr>
          <tr><td>Allowances</td><td className="text-right">{slip.allowances.toLocaleString()}</td></tr>
          <tr><td>Deductions (PF, Tax)</td><td className="text-right">- {slip.deductions.toLocaleString()}</td></tr>
        </tbody>
        <tfoot><tr><td>Net Pay</td><td className="text-right">₹ {slip.net.toLocaleString()}</td></tr></tfoot>
      </table>
      <p className="muted mt-2" style={{ fontSize: ".75rem" }}>This is a system-generated salary slip and does not require a signature.</p>
    </div>
  );
}
