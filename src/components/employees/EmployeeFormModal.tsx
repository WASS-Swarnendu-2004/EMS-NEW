import { useState } from "react";
import type { EmployeeField } from "@/config/employeeForm";
import { EmployeePhotoUpload } from "./EmployeePhotoUpload";
import type {
  Employee,
  CreateEmployeePayload,
} from "@/api/employee";
import type { Role } from "@/api/role";

import {
  Info,
  Loader2,
} from "lucide-react";

import { CustomizeEmployeeForm } from "./CustomizeEmployeeForm";
import { EmployeeFormFields } from "./EmployeeFormFields";

type NewField = {
  label: string;
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

  onPhotoChange: (
    file: File | null,
  ) => void;

  onClose: () => void;

  onSave: () => void;

  onAddField: () => void;

  onRemoveField: (
    id: string,
  ) => void;

  onOpenDesignationModal: () => void;

  onNewFieldChange: (
    value: NewField,
  ) => void;

  onFieldChange: (
    fieldName: string,
    value:
      | string
      | number
      | boolean,
  ) => void;

  onReorder: (
    draggedId: string,
    targetId: string,
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
  onReorder,
}: EmployeeFormModalProps) {
  const [error, setError] =
    useState("");

  if (!open) {
    return null;
  }

  function handleChange(
    fieldName: string,
    value:
      | string
      | number
      | boolean,
  ) {
    let newValue = value;

    // PF Applicable
    if (
      fieldName ===
        "pfApplicable" &&
      typeof value === "boolean"
    ) {
      newValue = value;
    }

    // Full name
    if (
      fieldName === "fullName" &&
      typeof value === "string"
    ) {
      newValue =
        value.replace(
          /[^A-Za-z ]/g,
          "",
        );
    }

    // Phone
    if (
      fieldName === "phone" &&
      typeof value === "string"
    ) {
      newValue =
        value
          .replace(/\D/g, "")
          .slice(0, 10);
    }

    // Emergency contact
    if (
      fieldName ===
        "emergencyContact" &&
      typeof value === "string"
    ) {
      newValue =
        value
          .replace(/\D/g, "")
          .slice(0, 10);
    }

    // Bank account
    if (
      fieldName ===
        "bankAccount" &&
      typeof value === "string"
    ) {
      newValue =
        value
          .replace(/\D/g, "")
          .slice(0, 18);
    }

    // PAN
    if (
      fieldName === "pan" &&
      typeof value === "string"
    ) {
      newValue =
        value
          .toUpperCase()
          .slice(0, 10);
    }

    // Salary
    if (fieldName === "salary") {
      if (value === "") {
        newValue = "";
      } else {
        newValue = value;
      }
    }

    onFieldChange(
      fieldName,
      newValue,
    );

    if (error) {
      setError("");
    }
  }

  function validate(): boolean {
    const fullName =
      String(
        form.fullName || "",
      ).trim();

    const email =
      String(
        form.email || "",
      ).trim();

    const phone =
      String(
        form.phone || "",
      ).trim();

    const password =
      String(
        form.password || "",
      ).trim();

    const designation =
      String(
        form.designation || "",
      ).trim();

    const department =
      String(
        form.department || "",
      ).trim();

    const salary =
      Number(form.salary);

    const joiningDate =
      String(
        form.joiningDate || "",
      ).trim();

    const bankAccount =
      String(
        form.bankAccount || "",
      ).trim();

    // Full name
    if (!fullName) {
      setError(
        "Full name is required",
      );
      return false;
    }

    if (
      !/^[A-Za-z ]+$/.test(
        fullName,
      )
    ) {
      setError(
        "Full name should contain alphabets only",
      );
      return false;
    }

    // Email
    if (!email) {
      setError(
        "Email is required",
      );
      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email,
      )
    ) {
      setError(
        "Please enter a valid email address",
      );
      return false;
    }

    // Phone
    if (
      !/^[6-9]\d{9}$/.test(
        phone,
      )
    ) {
      setError(
        "Phone number must be exactly 10 digits and start with 6-9",
      );
      return false;
    }

    // Password
    if (!editing && !password) {
      setError(
        "Password is required",
      );
      return false;
    }

    if (
      password &&
      password.length < 6
    ) {
      setError(
        "Password must contain at least 6 characters",
      );
      return false;
    }

    // Designation
    if (!designation) {
      setError(
        "Designation is required",
      );
      return false;
    }

    // Department
    if (!department) {
      setError(
        "Department is required",
      );
      return false;
    }

    if (
      !/^[A-Za-z ]+$/.test(
        department,
      )
    ) {
      setError(
        "Department should contain alphabets only",
      );
      return false;
    }

    // Salary
    if (
      !Number.isFinite(
        salary,
      ) ||
      salary <= 0
    ) {
      setError(
        "Salary must be greater than 0",
      );
      return false;
    }

    // Joining date
    if (!joiningDate) {
      setError(
        "Joining date is required",
      );
      return false;
    }

    // Bank account
    if (
      !/^\d{9,18}$/.test(
        bankAccount,
      )
    ) {
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
        className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        {/* ================================================= */}
        {/* HEADER                                            */}
        {/* ================================================= */}

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

        {/* ================================================= */}
        {/* BODY                                              */}
        {/* ================================================= */}

        <div className="p-5">

          {/* ================================================= */}
          {/* 1. EMPLOYEE PHOTO                                 */}
          {/* ================================================= */}

          <EmployeePhotoUpload
            file={photoFile}
            preview={photoPreview}
            onChange={onPhotoChange}
          />

          {/* ================================================= */}
          {/* 2. NORMAL EMPLOYEE FIELDS                         */}
          {/* ================================================= */}

          <EmployeeFormFields
            fields={fields}
            form={form}
            roles={roles}
            onRemoveField={
              onRemoveField
            }
            onOpenDesignationModal={
              onOpenDesignationModal
            }
            onChange={handleChange}
            onReorder={onReorder}
          />

          {/* ================================================= */}
          {/* 3. CUSTOMIZE EMPLOYEE FORM                         */}
          {/* ================================================= */}

          <div className="mt-6 border-t border-gray-200 pt-5">
            <CustomizeEmployeeForm
              newField={newField}
              setNewField={
                onNewFieldChange
              }
              onAddField={
                onAddField
              }
            />
          </div>

          {/* ================================================= */}
          {/* 4. IMPORTANT NOTE                                  */}
          {/* ================================================= */}

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-3">

              <Info
                size={19}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div className="min-w-0">

                <p className="text-sm font-semibold text-amber-800">
                  Important Note
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  When adding custom fields, please use
                  the following field labels exactly as
                  shown below:
                </p>

                <div className="mt-2 flex flex-wrap gap-2">

                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-sm ring-1 ring-amber-200">
                    Bank Name
                  </span>

                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-sm ring-1 ring-amber-200">
                    UAN No
                  </span>

                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-sm ring-1 ring-amber-200">
                    DOB
                  </span>

                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-sm ring-1 ring-amber-200">
                    ESI No
                  </span>

                </div>

                <p className="mt-2 text-xs leading-5 text-amber-700">
                  Please keep the spelling, spacing, and
                  capitalization exactly the same so these
                  fields can be correctly identified in
                  salary slips and other salary-related
                  documents.
                </p>

              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* VALIDATION ERROR                                   */}
          {/* ================================================= */}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ================================================= */}
          {/* 5. FOOTER - CANCEL / SAVE                         */}
          {/* ================================================= */}

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

