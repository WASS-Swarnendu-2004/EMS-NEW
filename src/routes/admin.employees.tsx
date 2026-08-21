import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  defaultEmployeeFields,
  type EmployeeField,
} from "@/config/employeeForm";

import {
  getEmployees,
  createEmployee,
  createEmployeeWithPhoto,
  updateEmployee,
  updateEmployeeWithPhoto,
  deleteEmployee,
  type Employee,
  type CreateEmployeePayload,
} from "@/api/employee";

import { exportToExcel } from "@/lib/excel";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import {
  getRoles,
  createRole,
  deleteRole,
  type Role,
} from "@/api/role";

import { EmployeeToolbar } from "@/components/employees/EmployeeToolbar";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeFormModal } from "@/components/employees/EmployeeFormModal";
import { RoleManagementModal } from "@/components/employees/RoleManagementModal";
import { EmployeeDetailsModal } from "@/components/employees/EmployeeDetailsModal";

export const Route = createFileRoute("/admin/employees")({
  component: Page,
});

const blank: CreateEmployeePayload = {
  fullName: "",
  email: "",
  password: "user",
  phone: "",
  designation: "",
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
  const [editing, setEditing] =
    useState<Employee | null>(null);

  const [open, setOpen] = useState(false);

  const [form, setForm] =
    useState<CreateEmployeePayload>(blank);

  const [fields, setFields] =
    useState<EmployeeField[]>(defaultEmployeeFields);

  const [q, setQ] = useState("");

  const [selectedDepartment, setSelectedDepartment] =
  useState("");

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalEmployees, setTotalEmployees] =
    useState(0);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [newField, setNewField] = useState({
    label: "",
    type: "text",
  });

  /*
   * We keep "roles" internally because the existing
   * designation API still returns roles.
   */
  const [roles, setRoles] = useState<Role[]>([]);

  const [designationModalOpen, setDesignationModalOpen] =
    useState(false);

  const [photoFile, setPhotoFile] =
    useState<File | null>(null);

  const [photoPreview, setPhotoPreview] =
    useState<string | null>(null);

  /*
   * Keep roleName because the existing API expects
   * roleName.
   */
  const [newRole, setNewRole] = useState({
    roleName: "",
    description: "",
    status: "Active",
  });

  const fetchEmployees = async (
    page: number = currentPage,
  ) => {
    try {
      setLoading(true);

      const data = await getEmployees(page);

      setEmployees(data.employees);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalEmployees(data.totalEmployees);
    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to load employees",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getRoles();

      setRoles(data);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to load designations",
      );
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  async function openNew() {
    setEditing(null);

    setForm({
      ...blank,
      designation: "",
    });

    setPhotoFile(null);
    setPhotoPreview(null);

    await fetchRoles();

    setOpen(true);
  }

  async function openEdit(e: Employee) {
    setEditing(e);

    setPhotoFile(null);

    if (e.profileImage) {
      setPhotoPreview(
        `https://fresh-01.onrender.com/${e.profileImage.replace(
          /^src\//,
          "",
        )}`,
      );
    } else {
      setPhotoPreview(null);
    }

    setForm({
      fullName: e.fullName,
      email: e.email,
      password: "",
      phone: e.phone,
      designation: e.designation,
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

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file);

    if (file) {
      const previewUrl =
        URL.createObjectURL(file);

      setPhotoPreview(previewUrl);
    } else {
      setPhotoPreview(null);
    }
  }

  async function addDesignation() {
    if (!newRole.roleName.trim()) {
      toast.warning("Designation name required");
      return;
    }

    try {
      await createRole(newRole);

      toast.success("Designation added");

      setNewRole({
        roleName: "",
        description: "",
        status: "Active",
      });

      await fetchRoles();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to create designation",
      );
    }
  }

  async function removeDesignation(id: string) {
    if (!confirm("Delete this designation?")) {
      return;
    }

    try {
      await deleteRole(id);

      toast.success("Designation deleted");

      await fetchRoles();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to delete designation",
      );
    }
  }

  function handleFieldChange(
    fieldName: string,
    value: string | number,
  ) {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }

function handleNewFieldChange(value: {
  label: string;
  type: string;
}) {
  setNewField(value);
}

  async function save() {
    try {
      if (
        !form.fullName.trim() ||
        !form.email.trim() ||
        !form.phone.trim() ||
        !form.designation.trim() ||
        !form.department.trim() ||
        !form.salary ||
        !form.joiningDate
      ) {
        toast.warning(
          "Please fill all required fields",
        );
        return;
      }

      if (
        !editing &&
        !form.password?.trim()
      ) {
        toast.warning("Password is required");
        return;
      }

      setSaving(true);

      if (editing) {
        if (photoFile) {
          await updateEmployeeWithPhoto(
            editing._id,
            form,
            photoFile,
          );
        } else {
          await updateEmployee(
            editing._id,
            form,
          );
        }

        toast.success(
          "Employee updated successfully",
        );
      } else {
        if (photoFile) {
          await createEmployeeWithPhoto(
            form,
            photoFile,
          );
        } else {
          await createEmployee(form);
        }

        toast.success(
          "Employee created successfully",
        );
      }

      await fetchEmployees();

      setPhotoFile(null);
      setPhotoPreview(null);
      setOpen(false);
    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          (editing
            ? "Failed to update employee"
            : "Failed to create employee"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this employee?")) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteEmployee(id);

      toast.success(
        "Employee deleted successfully",
      );

      await fetchEmployees();
    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to delete employee",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function addField() {
  if (!newField.label.trim()) {
    toast.warning("Field label is required");
    return;
  }

  const fieldName = newField.label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  if (!fieldName) {
    toast.warning("Please enter a valid field label");
    return;
  }

  if (
    fields.some(
      (field) => field.name === fieldName,
    )
  ) {
    toast.warning(
      "A field with this label already exists",
    );
    return;
  }

  setFields((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      label: newField.label.trim(),
      name: fieldName,
      type: newField.type as EmployeeField["type"],
      removable: true,
    },
  ]);

  setForm(
    (prev) =>
      ({
        ...prev,
        [fieldName]: "",
      }) as CreateEmployeePayload,
  );

  setNewField({
    label: "",
    type: "text",
  });
}

  const openDesignationModal = async () => {
    await fetchRoles();

    setDesignationModalOpen(true);
  };

  function removeField(id: string) {
    const field = fields.find(
      (f) => f.id === id,
    );

    if (!field || !field.removable) {
      return;
    }

    setFields((prev) =>
      prev.filter((f) => f.id !== id),
    );

    const updated = {
      ...form,
    } as any;

    delete updated[field.name];

    setForm(updated);
  }

  function reorderFields(
  draggedId: string,
  targetId: string,
) {
  setFields((prev) => {
    const draggedIndex = prev.findIndex(
      (field) => field.id === draggedId,
    );

    const targetIndex = prev.findIndex(
      (field) => field.id === targetId,
    );

    if (
      draggedIndex === -1 ||
      targetIndex === -1
    ) {
      return prev;
    }

    const updated = [...prev];

    const [draggedField] =
      updated.splice(draggedIndex, 1);

    updated.splice(
      targetIndex,
      0,
      draggedField,
    );

    return updated;
  });
  }
  
  const departments = Array.from(
  new Set(
    employees
      .map((employee) => employee.department)
      .filter(Boolean),
  ),
).sort();

  const filtered = employees.filter((e) => {
    const searchText = q.toLowerCase();

    const matchesSearch = [
      e.fullName,
      e.email,
      e.designation,
      e.department,
    ].some((x) =>
      x.toLowerCase().includes(searchText),
    );

   const matchesDepartment =
  selectedDepartment === "" ||
  e.department === selectedDepartment;

return (
  matchesSearch &&
  matchesDepartment
);
  });

  function exportXlsx() {
    if (filtered.length === 0) {
      toast.warning(
        "No employees to export",
      );
      return;
    }

    exportToExcel(
      filtered.map((e) => ({
        ID: e._id,
        Name: e.fullName,
        Email: e.email,
        Phone: e.phone,
        Designation: e.designation,
        Department: e.department,
        Salary: e.salary,
        JoinDate:
          e.joiningDate.slice(0, 10),
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

    toast.success(
      "Employees exported successfully",
    );
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-gray-500 text-lg font-medium">
          Loading employees...
        </p>
      </div>
    );
  }

  return (
    <>
      <EmployeeToolbar
  q={q}
  setQ={setQ}
  selectedDepartment={selectedDepartment}
  departments={departments}
  onDepartmentChange={setSelectedDepartment}
  onExport={exportXlsx}
  onAdd={openNew}
/>

      <EmployeeTable
        employees={filtered}
        deletingId={deletingId}
        onEdit={openEdit}
        onDelete={remove}
        onView={(employee) =>
          setSelectedEmployee(employee)
        }
      />

      {totalPages > 1 && (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {(currentPage - 1) * 10 + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-gray-700">
              {Math.min(
                currentPage * 10,
                totalEmployees,
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-700">
              {totalEmployees}
            </span>{" "}
            employees
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              className="btn btn-sm btn-ghost"
              disabled={
                currentPage === 1 ||
                loading
              }
              onClick={() =>
                fetchEmployees(
                  currentPage - 1,
                )
              }
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    className={`btn btn-sm ${
                      currentPage === page
                        ? ""
                        : "btn-ghost"
                    }`}
                    disabled={loading}
                    onClick={() =>
                      fetchEmployees(page)
                    }
                  >
                    {page}
                  </button>
                );
              },
            )}

            <button
              className="btn btn-sm btn-ghost"
              disabled={
                currentPage === totalPages ||
                loading
              }
              onClick={() =>
                fetchEmployees(
                  currentPage + 1,
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      )}

      <EmployeeFormModal
  open={open}
  editing={editing}
  form={form}
  fields={fields}
  roles={roles}
  newField={newField}
  saving={saving}
  photoFile={photoFile}
  photoPreview={photoPreview}
  onPhotoChange={handlePhotoChange}
  onClose={() => setOpen(false)}
  onSave={save}
  onAddField={addField}
  onRemoveField={removeField}
  onOpenDesignationModal={
    openDesignationModal
  }
  onNewFieldChange={
    handleNewFieldChange
  }
  onFieldChange={
    handleFieldChange
  }
  onReorder={reorderFields}
/>

      <RoleManagementModal
        open={designationModalOpen}
        roles={roles}
        newRole={newRole}
        onClose={() =>
          setDesignationModalOpen(false)
        }
        onAddRole={addDesignation}
        onDeleteRole={
          removeDesignation
        }
        onNewRoleChange={setNewRole}
      />

      <EmployeeDetailsModal
        employee={selectedEmployee}
        onClose={() =>
          setSelectedEmployee(null)
        }
      />
    </>
  );
}