import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { store, useDB, type Employee, type EmployeeRole } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/admin/employees")({ component: Page });

const ROLES: EmployeeRole[] = ["Developer", "Designer", "Manager", "HR", "QA", "DevOps", "Analyst"];

const blank: Omit<Employee, "id"> = {
  name: "", email: "", password: "user", phone: "", role: "Developer",
  idProof: "", salary: 50000, address: "", joinDate: new Date().toISOString().slice(0, 10),
  department: "", bankAccount: "", pan: "", emergencyContact: "", status: "active",
};

function Page() {
  const db = useDB();
  const [editing, setEditing] = useState<Employee | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Employee, "id">>(blank);
  const [q, setQ] = useState("");

  function openNew() { setEditing(null); setForm(blank); setOpen(true); }
  function openEdit(e: Employee) { setEditing(e); setForm(e); setOpen(true); }
  function save() {
    if (!form.name || !form.email) return;
    if (editing) store.updateEmployee(editing.id, form);
    else store.addEmployee(form);
    setOpen(false);
  }
  function remove(id: string) { if (confirm("Delete this employee?")) store.deleteEmployee(id); }

  const filtered = db.employees.filter((e) =>
    [e.name, e.email, e.role, e.department].some((x) => x.toLowerCase().includes(q.toLowerCase()))
  );

  function exportXlsx() {
    exportToExcel(
      filtered.map((e) => ({
        ID: e.id, Name: e.name, Email: e.email, Phone: e.phone, Role: e.role,
        Department: e.department, Salary: e.salary, JoinDate: e.joinDate, Address: e.address,
        IDProof: e.idProof, PAN: e.pan, Bank: e.bankAccount, Emergency: e.emergencyContact, Status: e.status,
      })),
      "employees.xlsx", "Employees"
    );
  }

  return (
    <>
      <div className="toolbar">
        <input className="input" placeholder="Search employees…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 280 }} />
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export Excel</button>
        <button className="btn" onClick={openNew}>+ Add employee</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Dept</th><th>Salary</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td><strong>{e.name}</strong><div className="muted" style={{ fontSize: ".75rem" }}>Joined {e.joinDate}</div></td>
                <td>{e.email}</td>
                <td>{e.phone}</td>
                <td><span className="badge purple">{e.role}</span></td>
                <td>{e.department}</td>
                <td>₹{e.salary.toLocaleString()}</td>
                <td><span className={"badge " + (e.status === "active" ? "success" : "danger")}>{e.status}</span></td>
                <td className="actions">
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(e)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="empty">No employees found</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>{editing ? "Edit employee" : "Add employee"}</h2><button className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>✕</button></div>
            <div className="row-2">
              <div className="field"><label>Full name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Email *</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="field"><label>Password</label><input className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="field"><label>Role</label>
                <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as EmployeeRole })}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="field"><label>Department</label><input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              <div className="field"><label>Monthly salary (₹)</label><input className="input" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: +e.target.value })} /></div>
              <div className="field"><label>Join date</label><input className="input" type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} /></div>
              <div className="field"><label>ID proof</label><input className="input" value={form.idProof} onChange={(e) => setForm({ ...form, idProof: e.target.value })} /></div>
              <div className="field"><label>PAN</label><input className="input" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} /></div>
              <div className="field"><label>Bank account</label><input className="input" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} /></div>
              <div className="field"><label>Emergency contact</label><input className="input" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} /></div>
              <div className="field"><label>Status</label>
                <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Address</label><textarea className="textarea" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn" onClick={save}>{editing ? "Save changes" : "Create employee"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
