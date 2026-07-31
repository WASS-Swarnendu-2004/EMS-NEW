import { createFileRoute } from "@tanstack/react-router";
// import { store, useDB, type Employee, type EmployeeRole } from "@/lib/store";
import { useEffect, useState } from "react";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
  type CreateEmployeePayload,
  type UpdateEmployeePayload,
} from "@/api/employee";
import { exportToExcel } from "@/lib/excel";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/admin/employees")({ component: Page });

const ROLES = ["Developer", "Designer", "Manager", "HR", "QA", "DevOps", "Analyst"];

const blank: CreateEmployeePayload = {
  fullName: "",
  email: "",
  password: "user",
  phone: "",
  role: "Developer",
  idProof: "",
  salary: 50000,
  address: "",
  joiningDate: new Date().toISOString().slice(0, 10),
  department: "",
  bankAccount: "",
  pan: "",
  emergencyContact: "",
  status: "Active",
};

function Page() {
  // const db = useDB();
  const [editing, setEditing] = useState<Employee | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateEmployeePayload>(blank);
  const [q, setQ] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const data = await getEmployees();

      setEmployees(data);
    } catch (err: any) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  function openNew() {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  }
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
      if (!form.fullName || !form.email) {
        toast.warning("Name and email are required");
        return;
      }

      setSaving(true);

      if (editing) {
        await updateEmployee(editing._id, form);
        toast.success("Employee updated successfully");
      } else {
        await createEmployee(form);
        toast.success("Employee created successfully");
      }

      await fetchEmployees();

      setOpen(false);
    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          (editing ? "Failed to update employee" : "Failed to create employee"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this employee?")) return;

    try {
      setDeletingId(id);

      await deleteEmployee(id);

      toast.success("Employee deleted successfully");

      await fetchEmployees();
    } catch (err: any) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to delete employee");
    } finally {
      setDeletingId(null);
    }
  }
  const filtered = employees.filter((e) =>
    [e.fullName, e.email, e.role, e.department].some((x) =>
      x.toLowerCase().includes(q.toLowerCase()),
    ),
  );

  function exportXlsx() {
    if (filtered.length === 0) {
      toast.warning("No employees to export");
      return;
    }

    exportToExcel(
      filtered.map((e) => ({
        ID: e._id,
        Name: e.fullName,
        Email: e.email,
        Phone: e.phone,
        Role: e.role,
        Department: e.department,
        Salary: e.salary,
        JoinDate: e.joiningDate.slice(0, 10),
        Address: e.address,
        IDProof: e.idProof,
        PAN: e.pan,
        Bank: e.bankAccount,
        Emergency: e.emergencyContact,
        Status: e.status,
      })),
      "employees.xlsx",
      "Employees",
    );

    toast.success("Employees exported successfully");
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">Loading employees...</p>
      </div>
    );
  }

  return (
    <>
  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <input
      className="input w-full lg:max-w-sm"
      placeholder="Search employees..."
      value={q}
      onChange={(e) => setQ(e.target.value)}
    />

    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        className="btn btn-ghost w-full sm:w-auto"
        onClick={exportXlsx}
      >
        ⬇ Export Excel
      </button>

      <button
        className="btn w-full sm:w-auto"
        onClick={openNew}
      >
        + Add Employee
      </button>
    </div>
  </div>

  <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
    <table className="table w-full min-w-[950px]">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Role</th>
          <th>Department</th>
          <th>Salary</th>
          <th>Status</th>
          <th className="text-center">Actions</th>
        </tr>
      </thead>

      <tbody>
        {filtered.map((e) => (
          <tr key={e._id}>
            <td>
              <div className="font-semibold">{e.fullName}</div>

              <div className="mt-1 text-xs text-gray-500">
                Joined {e.joiningDate.slice(0, 10)}
              </div>
            </td>

            <td>{e.email}</td>

            <td>{e.phone}</td>

            <td>
              <span className="badge purple">
                {e.role}
              </span>
            </td>

            <td>{e.department}</td>

            <td>
              ₹{e.salary.toLocaleString()}
            </td>

            <td>
              <span
                className={
                  "badge " +
                  (e.status === "Active"
                    ? "success"
                    : "danger")
                }
              >
                {e.status}
              </span>
            </td>

            <td>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  className="btn btn-sm btn-ghost w-full sm:w-auto"
                  onClick={() => openEdit(e)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-sm btn-danger w-full sm:w-auto"
                  onClick={() => remove(e._id)}
                  disabled={deletingId === e._id}
                >
                  {deletingId === e._id ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </td>
          </tr>
        ))}

        {filtered.length === 0 && (
          <tr>
            <td
              colSpan={8}
              className="py-8 text-center text-gray-500"
            >
              No employees found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {open && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    onClick={() => setOpen(false)}
  >
    <div
      className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4">
        <h2 className="text-lg font-semibold">
          {editing ? "Edit Employee" : "Add Employee"}
        </h2>

        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-5">

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Full Name */}
          <div className="field">
            <label>Full name *</label>
            <input
              className="input w-full"
              value={form.fullName}
              onChange={(e) =>
                setForm({
                  ...form,
                  fullName: e.target.value,
                })
              }
            />
          </div>

          {/* Email */}
          <div className="field">
            <label>Email *</label>
            <input
              className="input w-full"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </div>

          {/* Password */}
          <div className="field">
            <label>Password</label>
            <input
              className="input w-full"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </div>

          {/* Phone */}
          <div className="field">
            <label>Phone</label>
            <input
              className="input w-full"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />
          </div>

          {/* Role */}
          <div className="field">
            <label>Role</label>

            <select
              className="select w-full"
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value,
                })
              }
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="field">
            <label>Department</label>

            <input
              className="input w-full"
              value={form.department}
              onChange={(e) =>
                setForm({
                  ...form,
                  department: e.target.value,
                })
              }
            />
          </div>

          {/* Salary */}
          <div className="field">
            <label>Monthly Salary (₹)</label>

            <input
              className="input w-full"
              type="number"
              value={form.salary}
              onChange={(e) =>
                setForm({
                  ...form,
                  salary: +e.target.value,
                })
              }
            />
          </div>

          {/* Joining Date */}
          <div className="field">
            <label>Joining Date</label>

            <input
              className="input w-full"
              type="date"
              value={form.joiningDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  joiningDate: e.target.value,
                })
              }
            />
          </div>

          {/* ID Proof */}
          <div className="field">
            <label>ID Proof</label>

            <input
              className="input w-full"
              value={form.idProof}
              onChange={(e) =>
                setForm({
                  ...form,
                  idProof: e.target.value,
                })
              }
            />
          </div>

          {/* PAN */}
          <div className="field">
            <label>PAN</label>

            <input
              className="input w-full"
              value={form.pan}
              onChange={(e) =>
                setForm({
                  ...form,
                  pan: e.target.value,
                })
              }
            />
          </div>

          {/* Bank */}
          <div className="field">
            <label>Bank Account</label>

            <input
              className="input w-full"
              value={form.bankAccount}
              onChange={(e) =>
                setForm({
                  ...form,
                  bankAccount: e.target.value,
                })
              }
            />
          </div>

          {/* Emergency */}
          <div className="field">
            <label>Emergency Contact</label>

            <input
              className="input w-full"
              value={form.emergencyContact}
              onChange={(e) =>
                setForm({
                  ...form,
                  emergencyContact: e.target.value,
                })
              }
            />
          </div>

          {/* Status */}
          <div className="field lg:col-span-2">
            <label>Status</label>

            <select
              className="select w-full"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as
                    | "Active"
                    | "Inactive",
                })
              }
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

          {/* Address */}
          <div className="field lg:col-span-2">
            <label>Address</label>

            <textarea
              className="textarea w-full"
              rows={4}
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
            />
          </div>

        </div>
                    {/* Footer */}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
          <button
            className="btn btn-ghost w-full sm:w-auto"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>

          <button
            className="btn w-full sm:w-auto"
            onClick={save}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editing ? "Saving..." : "Creating..."}
              </>
            ) : editing ? (
              "Save Changes"
            ) : (
              "Create Employee"
            )}
          </button>
        </div>

      </div>
    </div>
  </div>
)}
    </>
  );
}