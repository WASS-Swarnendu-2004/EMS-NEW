import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Download, Printer, X, Plus, Trash2, RotateCcw, Settings2 } from "lucide-react";
import { store, useDB, type SalarySlip, type SalaryComponent } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";
import { SalarySlipView } from "@/components/SalarySlipView";

export const Route = createFileRoute("/admin/salary")({ component: Page });

function currentMonth() { return new Date().toISOString().slice(0, 7); }

function Page() {
  const db = useDB();
  const [month, setMonth] = useState(currentMonth());
  const [view, setView] = useState<SalarySlip | null>(null);
  const [showCfg, setShowCfg] = useState(false);

  const slipsForMonth = db.salarySlips.filter((s) => s.month === month);

  function genAll() { store.generateSalaryForAll(month); }
  function genOne(id: string) { store.generateSalary(id, month); }

  function exportXlsx() {
    exportToExcel(db.salarySlips.map((s) => {
      const e = db.employees.find((x) => x.id === s.employeeId);
      const row: Record<string, string | number> = { Month: s.month, Employee: e?.name ?? "" };
      s.items.forEach((it) => { row[it.label] = (it.type === "deduction" ? -1 : 1) * it.amount; });
      row["Net"] = s.net;
      return row;
    }), "salary-slips.xlsx", "Salaries");
  }

  return (
    <>
      <div className="toolbar">
        <label className="flex"><span className="muted">Month:</span>
          <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: 180 }} />
        </label>
        <button className="btn btn-gold" onClick={genAll}><Zap size={16} /> Auto-generate for all</button>
        <button className="btn btn-ghost" onClick={() => setShowCfg(true)}><Settings2 size={16} /> Configure breakdown</button>
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={exportXlsx}><Download size={16} /> Export Excel</button>
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
                <button className="btn btn-ghost" onClick={() => window.print()}><Printer size={16} /> Print</button>
                <button className="btn btn-ghost" onClick={() => setView(null)}><X size={16} /></button>
              </div>
            </div>
            <SalarySlipView slip={view} empName={db.employees.find((e) => e.id === view.employeeId)?.name ?? ""} role={db.employees.find((e) => e.id === view.employeeId)?.role ?? ""} />
          </div>
        </div>
      )}

      {showCfg && <BreakdownConfig onClose={() => setShowCfg(false)} config={db.salaryConfig} />}
    </>
  );
}

function BreakdownConfig({ config, onClose }: { config: SalaryComponent[]; onClose: () => void }) {
  const [items, setItems] = useState<SalaryComponent[]>(config);

  function update(id: string, patch: Partial<SalaryComponent>) {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function add(type: "earning" | "deduction") {
    setItems((xs) => [...xs, { id: "c" + Math.random().toString(36).slice(2, 8), label: type === "earning" ? "New Earning" : "New Deduction", type, mode: "percent", value: 0 }]);
  }
  function remove(id: string) { setItems((xs) => xs.filter((x) => x.id !== id)); }
  function save() { store.setSalaryConfig(items); onClose(); }
  function reset() { store.resetSalaryConfig(); onClose(); }

  const earnPct = items.filter((i) => i.type === "earning" && i.mode === "percent").reduce((s, i) => s + i.value, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2><Settings2 size={18} /> Salary Breakdown Configuration</h2>
          <button className="btn btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>
        <p className="muted" style={{ fontSize: ".85rem", marginTop: 0 }}>
          Define the earning and deduction components. Percent values are calculated from the employee's gross monthly salary.
        </p>

        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Label</th><th>Type</th><th>Mode</th><th>Value</th><th></th></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td><input className="input" value={it.label} onChange={(e) => update(it.id, { label: e.target.value })} /></td>
                  <td>
                    <select className="input" value={it.type} onChange={(e) => update(it.id, { type: e.target.value as SalaryComponent["type"] })}>
                      <option value="earning">Earning</option>
                      <option value="deduction">Deduction</option>
                    </select>
                  </td>
                  <td>
                    <select className="input" value={it.mode} onChange={(e) => update(it.id, { mode: e.target.value as SalaryComponent["mode"] })}>
                      <option value="percent">% of gross</option>
                      <option value="fixed">Fixed ₹</option>
                    </select>
                  </td>
                  <td><input className="input" type="number" value={it.value} onChange={(e) => update(it.id, { value: Number(e.target.value) })} style={{ width: 110 }} /></td>
                  <td><button className="btn btn-sm btn-ghost" onClick={() => remove(it.id)} aria-label="Remove"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex" style={{ marginTop: 12, flexWrap: "wrap", gap: 8 }}>
          <button className="btn btn-sm" onClick={() => add("earning")}><Plus size={14} /> Add Earning</button>
          <button className="btn btn-sm" onClick={() => add("deduction")}><Plus size={14} /> Add Deduction</button>
          <span className="muted" style={{ fontSize: ".8rem", marginLeft: 8 }}>
            Earnings (%): <strong>{earnPct}%</strong> {earnPct !== 100 && earnPct > 0 && <em>(typically 100%)</em>}
          </span>
          <span className="spacer" />
          <button className="btn btn-ghost" onClick={reset}><RotateCcw size={14} /> Reset to default</button>
          <button className="btn btn-gold" onClick={save}>Save configuration</button>
        </div>
      </div>
    </div>
  );
}
