import { useState } from "react";
import type { EmployeeField } from "@/config/employeeForm";
import { EmployeePhotoUpload } from "./EmployeePhotoUpload";
import type {
  Employee,
  CreateEmployeePayload,
} from "@/api/employee";
import type { Role } from "@/api/role";

import { Loader2 } from "lucide-react";

import { CustomizeEmployeeForm } from "./CustomizeEmployeeForm";
import { EmployeeFormFields } from "./EmployeeFormFields";

type NewField = {
  label: string;
  name: string;
  type: string;
};

type EmployeeFormModalProps = {
  open: boolean;
  editing: Employee | null;
  form: CreateEmployeePayload;
  fields: EmployeeField[];
  roles: Role[];
  newField: NewField;
  saving: boolean;

  photoFile: File | null;
  photoPreview: string | null;
  onPhotoChange: (file: File | null) => void;

  onClose: () => void;
  onSave: () => void;
  onAddField: () => void;
  onRemoveField: (id: string) => void;

  onOpenDesignationModal: () => void;

  onNewFieldChange: (value: NewField) => void;
  onFieldChange: (
    fieldName: string,
    value: string | number,
  ) => void;
};

export function EmployeeFormModal({
  open,
  editing,
  form,
  fields,
  roles,
  newField,
  saving,

  photoFile,
  photoPreview,
  onPhotoChange,

  onClose,
  onSave,
  onAddField,
  onRemoveField,
  onOpenDesignationModal,
  onNewFieldChange,
  onFieldChange,
}: EmployeeFormModalProps) {
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  function handleChange(
    fieldName: string,
    value: string | number,
  ) {
    let newValue = value;

    // Full name - alphabets and spaces only
    if (
      fieldName === "fullName" &&
      typeof value === "string"
    ) {
      newValue = value.replace(/[^A-Za-z ]/g, "");
    }

    // Phone - numbers only and maximum 10 digits
    if (
      fieldName === "phone" &&
      typeof value === "string"
    ) {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // Emergency contact - numbers only and maximum 10 digits
    if (
      fieldName === "emergencyContact" &&
      typeof value === "string"
    ) {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // Bank account - numbers only
    if (
      fieldName === "bankAccount" &&
      typeof value === "string"
    ) {
      newValue = value.replace(/\D/g, "").slice(0, 18);
    }

    // PAN - uppercase
    if (
      fieldName === "pan" &&
      typeof value === "string"
    ) {
      newValue = value.toUpperCase().slice(0, 10);
    }

    // Salary - allow empty value
    if (fieldName === "salary") {
      if (value === "") {
        newValue = "";
      } else {
        newValue = value;
      }
    }

    onFieldChange(fieldName, newValue);

    if (error) {
      setError("");
    }
  }

  function validate(): boolean {
    const fullName = String(
      form.fullName || "",
    ).trim();

    const email = String(
      form.email || "",
    ).trim();

    const phone = String(
      form.phone || "",
    ).trim();

    const password = String(
      form.password || "",
    ).trim();

    const designation = String(
      form.designation || "",
    ).trim();

    const department = String(
      form.department || "",
    ).trim();

    const salary = Number(form.salary);

    const joiningDate = String(
      form.joiningDate || "",
    ).trim();

    const bankAccount = String(
      form.bankAccount || "",
    ).trim();

    // Full name
    if (!fullName) {
      setError("Full name is required");
      return false;
    }

    if (!/^[A-Za-z ]+$/.test(fullName)) {
      setError(
        "Full name should contain alphabets only",
      );
      return false;
    }

    // Email
    if (!email) {
      setError("Email is required");
      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setError(
        "Please enter a valid email address",
      );
      return false;
    }

    // Phone
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(
        "Phone number must be exactly 10 digits and start with 6-9",
      );
      return false;
    }

    // Password - required only while creating
    if (!editing && !password) {
      setError("Password is required");
      return false;
    }

    if (password && password.length < 6) {
      setError(
        "Password must contain at least 6 characters",
      );
      return false;
    }

    // Designation
    if (!designation) {
      setError("Designation is required");
      return false;
    }

    // Department
    if (!department) {
      setError("Department is required");
      return false;
    }

    if (!/^[A-Za-z ]+$/.test(department)) {
      setError(
        "Department should contain alphabets only",
      );
      return false;
    }

    // Salary
    if (!Number.isFinite(salary) || salary <= 0) {
      setError("Salary must be greater than 0");
      return false;
    }

    // Joining date
    if (!joiningDate) {
      setError("Joining date is required");
      return false;
    }

    // Bank account
    if (!/^\d{9,18}$/.test(bankAccount)) {
      setError(
        "Bank account must contain 9 to 18 digits",
      );
      return false;
    }

    setError("");
    return true;
  }

  function handleSave() {
    if (!validate()) {
      return;
    }

    onSave();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {editing
              ? "Edit Employee"
              : "Add Employee"}
          </h2>

          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onClose}
            disabled={saving}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <EmployeePhotoUpload
            file={photoFile}
            preview={photoPreview}
            onChange={onPhotoChange}
          />

          <CustomizeEmployeeForm
            newField={newField}
            setNewField={onNewFieldChange}
            onAddField={onAddField}
          />

          {/* Validation Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <EmployeeFormFields
            fields={fields}
            form={form}
            roles={roles}
            onRemoveField={onRemoveField}
            onOpenDesignationModal={
              onOpenDesignationModal
            }
            onChange={handleChange}
          />

          {/* Footer */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn btn-ghost w-full sm:w-auto"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn w-full sm:w-auto"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editing
                    ? "Saving..."
                    : "Creating..."}
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
  );
}