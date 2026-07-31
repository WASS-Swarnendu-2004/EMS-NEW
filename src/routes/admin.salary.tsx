import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Zap, Download, Printer, X, Plus, RotateCcw, Settings2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
// import { store, useDB, type SalarySlip, type SalaryComponent } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";
import { SalarySlipView } from "@/components/SalarySlipView";
import { useDB } from "@/lib/store";

import {
  getSalaryList,
  generateSalary,
  generateSalaryForEmployee,
  getSalarySlip,
  getSalaryConfig,
  updateSalaryConfig,
  type SalaryListItem,
  type SalarySlip,
  type SalaryComponent,
} from "@/api/salary";

export const Route = createFileRoute("/admin/salary")({ component: Page });

function currentMonth() { return new Date().toISOString().slice(0, 7); }

function Page() {
  const db = useDB();
  const [month, setMonth] = useState(currentMonth());
  const [view, setView] = useState<SalarySlip | null>(null);
  const [showCfg, setShowCfg] = useState(false);

  const [employees, setEmployees] = useState<SalaryListItem[]>([]);
    const [loading, setLoading] = useState(true);
const [generating, setGenerating] = useState(false);
const [viewLoading, setViewLoading] = useState(false);

 async function loadSalarySlips() {
  try {
    setLoading(true);

    const data = await getSalaryList(month);

    setEmployees(data);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load salary list");
  } finally {
    setLoading(false);
  }
}
  

 useEffect(() => {
  loadSalarySlips();
}, [month]);
  

async function genAll() {
  try {
    setGenerating(true);

    await generateSalary(month);

    toast.success("Salary generated successfully");

    await loadSalarySlips();
  } catch (err) {
    console.error(err);

    toast.error("Failed to generate salary");
  } finally {
    setGenerating(false);
  }
}

  function exportXlsx() {
    exportToExcel(
  employees.map((e) => ({
    Employee: e.fullName,
    Department: e.department,
    Role: e.role,
    Gross: e.grossSalary,
    Net: e.netSalary ?? "",
    Generated: e.generated ? "Yes" : "No",
  })),
  "salary-slips.xlsx",
  "Salaries"
);
  }

 if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">Loading...</p>
      </div>
    );
  }
  return (
    <>
      <div className="toolbar">
        <label className="flex"><span className="muted">Month:</span>
          <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: 180 }} />
        </label>
        <button className="btn btn-gold" onClick={genAll}><Zap size={16} />Generate salary for all </button>
        <button className="btn btn-ghost" onClick={() => setShowCfg(true)}><Settings2 size={16} /> Configure breakdown</button>
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={exportXlsx}><Download size={16} /> Export Excel</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Employee</th><th>Role</th><th>Gross</th><th>Generated for {month}</th><th></th></tr></thead>
          <tbody>
            {employees.map((e) => {
            return (
                <tr key={e.employeeIdMongo}>
                  <td>{e.fullName}</td>
                  <td><span className="badge purple">{e.role}</span></td>
                  <td>₹{e.grossSalary.toLocaleString()}</td>
                  <td>
  {e.generated ? (
    <span className="badge success">
      Net ₹{e.netSalary?.toLocaleString()}
    </span>
  ) : (
    <span className="badge warn">
      Not generated
    </span>
  )}
</td>
                  <td className="actions">
  {e.generated ? (
    <button
      className="btn btn-sm btn-ghost"
      onClick={async () => {
        const slip = await getSalarySlip(e.salarySlipId!);
        setView(slip);
      }}
    >
      View Slip
    </button>
  ) : (
    <button
      className="btn btn-sm"
      onClick={async () => {
        await generateSalaryForEmployee(
          e.employeeIdMongo,
          month
        );

        await loadSalarySlips();
      }}
    >
      Generate
    </button>
  )}
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
            <SalarySlipView slip={view} empName={
  employees.find((e) => e.employeeIdMongo === view.employeeId)?.fullName ?? ""
}
role={
  employees.find((e) => e.employeeIdMongo === view.employeeId)?.role ?? ""
}/>
          </div>
        </div>
      )}

      {showCfg && (
  <BreakdownConfig
  onClose={() => setShowCfg(false)}
/>
)}
    </>
  );
}

function BreakdownConfig({
  onClose,
}: {
  onClose: () => void;
})  {
  const [items, setItems] = useState<SalaryComponent[]>([]);
  useEffect(() => {
  loadConfig();
}, []);

async function loadConfig() {
  try {
    const data = await getSalaryConfig();
    setItems(data);
  } catch (err) {
    console.error(err);
  }
}

  function update(index: number, patch: Partial<SalaryComponent>) {
  setItems((xs) =>
    xs.map((x, i) =>
      i === index ? { ...x, ...patch } : x
    )
  );
}
  function add(type: "Earning" | "Deduction") {
  setItems((xs) => [
    ...xs,
    {
      label: type === "Earning" ? "New Earning" : "New Deduction",
      type,
      mode: "% of gross",
      value: 0,
    },
  ]);
}
  function remove(id: string) { setItems((xs) => xs.filter((x) => x.id !== id)); }
async function save() {
  try {
    await updateSalaryConfig(items);

    onClose();
  } catch (err) {
    console.error(err);
  }
}
  async function reset() {
  try {
    await loadConfig();
  } catch (err) {
    console.error(err);
  }
}

const earnPct = items
  .filter(
    (i) =>
      i.type === "Earning" &&
      i.mode === "% of gross"
  )
  .reduce((s, i) => s + i.value, 0);

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
              {items.map((it,index) => (
                <tr key={it.id}>
                  <td><input className="input" value={it.label} onChange={(e) =>
    update(index, {
        label: e.target.value
    })
} /></td>
                  <td>
                    <select className="input" value={it.type} onChange={(e) => update(index, { type: e.target.value as SalaryComponent["type"] })}>
                      <option value="Earning">Earning</option>
                      <option value="Deduction">Deduction</option>
                    </select>
                  </td>
                  <td>
                    <select className="input" value={it.mode} onChange={(e) => update(index, { mode: e.target.value as SalaryComponent["mode"] })}>
                      <option value="% of gross">% of gross</option>
                      <option value="Fixed">Fixed ₹</option>
                    </select>
                  </td>
                  <td><input className="input" type="number" value={it.value} onChange={(e) => update(index, { value: Number(e.target.value) })} style={{ width: 110 }} /></td>
                  {/* <td><button className="btn btn-sm btn-ghost" onClick={() => remove(it.id)} aria-label="Remove"><Trash2 size={14} /></button></td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex" style={{ marginTop: 12, flexWrap: "wrap", gap: 8 }}>
          <button className="btn btn-sm" onClick={() => add("Earning")}><Plus size={14} /> Add Earning</button>
          <button className="btn btn-sm" onClick={() => add("Deduction")}><Plus size={14} /> Add Deduction</button>
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
