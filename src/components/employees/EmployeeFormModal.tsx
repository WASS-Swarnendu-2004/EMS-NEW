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
  onOpenRoleModal: () => void;
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
  onOpenRoleModal,
  onNewFieldChange,
  onFieldChange,
}: EmployeeFormModalProps) {
  if (!open) {
    return null;
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
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4">
          <h2 className="text-lg font-semibold">
            {editing ? "Edit Employee" : "Add Employee"}
          </h2>

          <button
            className="btn btn-sm btn-ghost"
            onClick={onClose}
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

          <EmployeeFormFields
            fields={fields}
            form={form}
            roles={roles}
            onRemoveField={onRemoveField}
            onOpenRoleModal={onOpenRoleModal}
            onChange={onFieldChange}
          />

          {/* Footer */}
          <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <button
              className="btn btn-ghost w-full sm:w-auto"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="btn w-full sm:w-auto"
              onClick={onSave}
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
  );
}