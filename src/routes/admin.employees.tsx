import { createFileRoute } from "@tanstack/react-router";
// import { store, useDB, type Employee, type EmployeeRole } from "@/lib/store";
import { useEffect, useState } from "react";
import { defaultEmployeeFields, type EmployeeField } from "@/config/employeeForm";

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
import { getRoles, createRole, deleteRole, type Role } from "@/api/role";

export const Route = createFileRoute("/admin/employees")({ component: Page });

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
  const [editing, setEditing] = useState<Employee | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateEmployeePayload>(blank);
  const [fields, setFields] = useState<EmployeeField[]>(defaultEmployeeFields);
  const [q, setQ] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newField, setNewField] = useState({
    label: "",
    name: "",
    type: "text",
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [newRole, setNewRole] = useState({
    roleName: "",
    description: "",
    status: "Active",
  });

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

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);

      const data = await getRoles();

      setRoles(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function openNew() {
    setEditing(null);
    setForm(blank);

    await fetchRoles();

    setOpen(true);
  }

  async function openEdit(e: Employee) {
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

    await fetchRoles();
    setOpen(true);
  }

  async function addRole() {
    if (!newRole.roleName.trim()) {
      toast.warning("Role name required");
      return;
    }

    try {
      await createRole(newRole);

      toast.success("Role added");

      setNewRole({
        roleName: "",
        description: "",
        status: "Active",
      });

      fetchRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create role");
    }
  }

  async function removeRole(id: string) {
    if (!confirm("Delete role?")) return;

    try {
      await deleteRole(id);

      toast.success("Role deleted");

      fetchRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete role");
    }
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

  function addField() {
    if (!newField.label.trim() || !newField.name.trim()) return;

    setFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: newField.label,
        name: newField.name,
        type: newField.type as EmployeeField["type"],
        removable: true,
      },
    ]);

    setForm(
      (prev) =>
        ({
          ...prev,
          [newField.name]: "",
        }) as CreateEmployeePayload,
    );

    setNewField({
      label: "",
      name: "",
      type: "text",
    });
  }

  const openRoleModal = async () => {
    await fetchRoles();
    setRoleModalOpen(true);
  };

  function removeField(id: string) {
    const field = fields.find((f) => f.id === id);

    if (!field || !field.removable) return;

    setFields((prev) => prev.filter((f) => f.id !== id));

    const updated = { ...form } as any;

    delete updated[field.name];

    setForm(updated);
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
          <button className="btn btn-ghost w-full sm:w-auto" onClick={exportXlsx}>
            ⬇ Export Excel
          </button>

          <button className="btn w-full sm:w-auto" onClick={openNew}>
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
                  <span className="badge purple">{e.role}</span>
                </td>

                <td>{e.department}</td>

                <td>₹{e.salary.toLocaleString()}</td>

                <td>
                  <span className={"badge " + (e.status === "Active" ? "success" : "danger")}>
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
                <td colSpan={8} className="py-8 text-center text-gray-500">
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

              <button className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <div className="mb-6 rounded-lg border bg-gray-50 p-4">
                <h3 className="mb-4 text-lg font-semibold">Customize Employee Form</h3>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <input
                    className="input"
                    placeholder="Field Label"
                    value={newField.label}
                    onChange={(e) =>
                      setNewField({
                        ...newField,
                        label: e.target.value,
                      })
                    }
                  />

                  <input
                    className="input"
                    placeholder="Field Name"
                    value={newField.name}
                    onChange={(e) =>
                      setNewField({
                        ...newField,
                        name: e.target.value,
                      })
                    }
                  />

                  <select
                    className="select"
                    value={newField.type}
                    onChange={(e) =>
                      setNewField({
                        ...newField,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="textarea">Textarea</option>
                  </select>

                  <button type="button" className="btn" onClick={addField}>
                    + Add Field
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {fields.map((field) => {
                  const value = (form as any)[field.name] ?? "";

                  return (
                    <div
                      key={field.id}
                      className={field.type === "textarea" ? "field lg:col-span-2" : "field"}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <label>
                          {field.label}
                          {field.required && " *"}
                        </label>

                        <div className="flex items-center gap-2">
                          {field.name === "role" && (
                            <button
                              type="button"
                              className="text-sm font-medium text-blue-600 hover:underline"
                              onClick={openRoleModal}
                            >
                              + Manage Roles
                            </button>
                          )}

                          {field.removable && (
                            <button
                              type="button"
                              className="text-sm text-red-500 hover:text-red-700"
                              onClick={() => removeField(field.id)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      {field.type === "textarea" ? (
                        <textarea
                          rows={4}
                          className="textarea w-full"
                          value={value}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              [field.name]: e.target.value,
                            } as CreateEmployeePayload)
                          }
                        />
                      ) : field.type === "select" ? (
                        <>
                          <select
                            className="select w-full"
                            value={value}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                [field.name]: e.target.value,
                              } as CreateEmployeePayload)
                            }
                          >
                            {field.name === "role"
                              ? roles.map((role) => (
                                  <option key={role._id} value={role.roleName}>
                                    {role.roleName}
                                  </option>
                                ))
                              : field.options?.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                          </select>
                        </>
                      ) : (
                        <input
                          className="input w-full"
                          type={field.type}
                          value={value}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              [field.name]:
                                field.type === "number" ? Number(e.target.value) : e.target.value,
                            } as CreateEmployeePayload)
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <button className="btn btn-ghost w-full sm:w-auto" onClick={() => setOpen(false)}>
                  Cancel
                </button>

                <button className="btn w-full sm:w-auto" onClick={save} disabled={saving}>
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

      {roleModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
          onClick={() => setRoleModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-lg font-semibold">Manage Roles</h2>

              <button className="btn btn-sm btn-ghost" onClick={() => setRoleModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <input
                className="input w-full"
                placeholder="Role Name"
                value={newRole.roleName}
                onChange={(e) =>
                  setNewRole({
                    ...newRole,
                    roleName: e.target.value,
                  })
                }
              />

              {/* <input
                className="input w-full"
                placeholder="Description"
                value={newRole.description}
                onChange={(e) =>
                  setNewRole({
                    ...newRole,
                    description: e.target.value,
                  })
                }
              /> */}

              {/* <select
                className="select w-full"
                value={newRole.status}
                onChange={(e) =>
                  setNewRole({
                    ...newRole,
                    status: e.target.value,
                  })
                }
              >
                <option>Active</option>
                <option>Inactive</option>
              </select> */}

              <button className="btn w-full" onClick={addRole}>
                + Add Role
              </button>
            </div>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {roles.map((role) => (
                <div
                  key={role._id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{role.roleName}</div>

                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>

                  <button className="btn btn-danger btn-sm" onClick={() => removeRole(role._id)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t p-5 text-right">
              <button className="btn" onClick={() => setRoleModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
