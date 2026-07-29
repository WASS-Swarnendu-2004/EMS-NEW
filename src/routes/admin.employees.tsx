import { createFileRoute } from "@tanstack/react-router";
// import { store, useDB, type Employee, type EmployeeRole } from "@/lib/store";
import { useEffect, useState } from "react";

import {getEmployees,createEmployee,updateEmployee,deleteEmployee,type Employee,type CreateEmployeePayload,type UpdateEmployeePayload,
} from "@/api/employee";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/admin/employees")({ component: Page });

const ROLES = ["Developer", "Designer", "Manager", "HR", "QA", "DevOps", "Analyst"];

const blank: CreateEmployeePayload = {
  fullName: "", email: "", password: "user", phone: "", role: "Developer",
  idProof: "", salary: 50000, address: "", joiningDate: new Date().toISOString().slice(0, 10),
  department: "", bankAccount: "", pan: "", emergencyContact: "", status: "Active",
};

function Page() {
  // const db = useDB();
  const [editing, setEditing] = useState<Employee | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] =useState<CreateEmployeePayload>(blank);
  const [q, setQ] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
  try {
    setLoading(true);

    const data = await getEmployees();

    setEmployees(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchEmployees();
}, []);

  function openNew() { setEditing(null); setForm(blank); setOpen(true); }
  function openEdit(e: Employee) {
  setEditing(e);

  setForm({
    fullName: e.fullName,
    email: e.email,
    password: "",
    phone: e.phone,
    role: e.role,
    department: e.department,
    salary: e.salary,
    joiningDate: e.joiningDate.slice(0, 10),
    idProof: e.idProof,
    pan: e.pan,
    bankAccount: e.bankAccount,
    emergencyContact: e.emergencyContact,
    address: e.address,
    status: e.status,
  });

  setOpen(true);
}
 async function save() {
  try {
    if (!form.fullName || !form.email) return;

    if (editing) {
      await updateEmployee(editing._id, form);
    } else {
      console.log(form);
      await createEmployee(form);
    }

    await fetchEmployees();

    setOpen(false);
  } catch (err) {
    console.error(err);
  }
}
 async function remove(id: string) {
  if (!confirm("Delete this employee?")) return;

  try {
    await deleteEmployee(id);

    await fetchEmployees();
  } catch (err) {
    console.error(err);
  }
}
  const filtered = employees.filter((e) =>
    [e.fullName, e.email, e.role, e.department].some((x) => x.toLowerCase().includes(q.toLowerCase()))
  );

  function exportXlsx() {
    exportToExcel(
      filtered.map((e) => ({
        ID: e._id, Name: e.fullName, Email: e.email, Phone: e.phone, Role: e.role,
        Department: e.department, Salary: e.salary, JoinDate: e.joiningDate.slice(0,10), Address: e.address,
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
              <tr key={e._id}>
                <td><strong>{e.fullName}</strong><div className="muted" style={{ fontSize: ".75rem" }}>Joined {e.joiningDate}</div></td>
                <td>{e.email}</td>
                <td>{e.phone}</td>
                <td><span className="badge purple">{e.role}</span></td>
                <td>{e.department}</td>
                <td>₹{e.salary.toLocaleString()}</td>
                <td><span className={"badge " + (e.status === "Active" ? "success" : "danger")}>{e.status}</span></td>
                <td className="actions">
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(e)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(e._id)}>Delete</button>
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
              <div className="field"><label>Full name *</label><input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
              <div className="field"><label>Email *</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="field"><label>Password</label><input className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="field"><label>Role</label>
                <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="field"><label>Department</label><input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
              <div className="field"><label>Monthly salary (₹)</label><input className="input" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: +e.target.value })} /></div>
              <div className="field"><label>Join date</label><input className="input" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></div>
              <div className="field"><label>ID proof</label><input className="input" value={form.idProof} onChange={(e) => setForm({ ...form, idProof: e.target.value })} /></div>
              <div className="field"><label>PAN</label><input className="input" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} /></div>
              <div className="field"><label>Bank account</label><input className="input" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} /></div>
              <div className="field"><label>Emergency contact</label><input className="input" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} /></div>
              <div className="field"><label>Status</label>
                <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "Active" | "Inactive" })}>
                  <option value="Active">Active</option><option value="Inactive">Inactive</option>
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
