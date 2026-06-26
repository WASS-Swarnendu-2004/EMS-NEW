import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Printer, X } from "lucide-react";
import { useDB, type SalarySlip } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { SalarySlipView } from "@/components/SalarySlipView";

export const Route = createFileRoute("/user/salary")({ component: Page });

function Page() {
  const db = useDB();
  const { session } = useAuth();
  const empId = session!.id;
  const me = db.employees.find((e) => e.id === empId);
  const slips = db.salarySlips.filter((s) => s.employeeId === empId).sort((a, b) => b.month.localeCompare(a.month));
  const [view, setView] = useState<SalarySlip | null>(null);

  return (
    <>
      <div className="card">
        <div className="card-header"><h2>Auto-generated salary slips</h2></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Month</th><th>Gross</th><th>Earnings</th><th>Deductions</th><th>Net</th><th></th></tr></thead>
            <tbody>
              {slips.map((s) => (
                <tr key={s.id}>
                  <td>{s.month}</td>
                  <td>₹{s.gross.toLocaleString()}</td>
                  <td>₹{s.totalEarnings.toLocaleString()}</td>
                  <td>- ₹{s.totalDeductions.toLocaleString()}</td>
                  <td><strong>₹{s.net.toLocaleString()}</strong></td>
                  <td><button className="btn btn-sm btn-ghost" onClick={() => setView(s)}>View</button></td>
                </tr>
              ))}
              {slips.length === 0 && <tr><td colSpan={6} className="empty">No salary slips yet. Ask admin to generate.</td></tr>}
            </tbody>
          </table>
        </div>
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
            <SalarySlipView slip={view} empName={me?.name ?? ""} role={me?.role ?? ""} />
          </div>
        </div>
      )}
    </>
  );
}
