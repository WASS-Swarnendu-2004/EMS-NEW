import type { SalarySlip } from "@/api/salary";
import logo from "@/assets/logo.jpeg.asset.json";

export function SalarySlipView({ slip, empName, role }: { slip: SalarySlip; empName: string; role: string }) {
  const earnings = slip.items.filter((i) => i.type === "earning");
  const deductions = slip.items.filter((i) => i.type === "deduction");

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
          {earnings.map((it, i) => (
            <tr key={i}><td>{it.label}</td><td className="text-right">{it.amount.toLocaleString()}</td></tr>
          ))}
          <tr><td><strong>Total Earnings</strong></td><td className="text-right"><strong>{slip.totalEarnings.toLocaleString()}</strong></td></tr>
        </tbody>
      </table>
      <table className="slip-table" style={{ marginTop: 12 }}>
        <thead><tr><th>Deductions</th><th className="text-right">Amount (₹)</th></tr></thead>
        <tbody>
          {deductions.map((it, i) => (
            <tr key={i}><td>{it.label}</td><td className="text-right">- {it.amount.toLocaleString()}</td></tr>
          ))}
          {deductions.length === 0 && <tr><td className="muted">No deductions</td><td className="text-right">0</td></tr>}
          <tr><td><strong>Total Deductions</strong></td><td className="text-right"><strong>- {slip.totalDeductions.toLocaleString()}</strong></td></tr>
        </tbody>
        <tfoot><tr><td>Net Pay</td><td className="text-right">₹ {slip.net.toLocaleString()}</td></tr></tfoot>
      </table>
      <p className="muted mt-2" style={{ fontSize: ".75rem" }}>This is a system-generated salary slip and does not require a signature.</p>
    </div>
  );
}