import type { EmployeeField } from "@/config/employeeForm";
import type { CreateEmployeePayload } from "@/api/employee";
import type { Role } from "@/api/role";

type EmployeeFormFieldsProps = {
  fields: EmployeeField[];
  form: CreateEmployeePayload;
  roles: Role[];
  onRemoveField: (id: string) => void;
  onOpenRoleModal: () => void;
  onChange: (fieldName: string, value: string | number) => void;
};

export function EmployeeFormFields({
  fields,
  form,
  roles,
  onRemoveField,
  onOpenRoleModal,
  onChange,
}: EmployeeFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {fields.map((field) => {
        const value = (form as Record<string, unknown>)[field.name] ?? "";

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
                    onClick={onOpenRoleModal}
                  >
                    + Manage Roles
                  </button>
                )}

                {field.removable && (
                  <button
                    type="button"
                    className="text-sm text-red-500 hover:text-red-700"
                    onClick={() => onRemoveField(field.id)}
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
                value={String(value)}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            ) : field.type === "select" ? (
              <select
                className="select w-full"
                value={String(value)}
                onChange={(e) => onChange(field.name, e.target.value)}
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
            ) : (
              <input
                className="input w-full"
                type={field.type}
                min={
                  field.name === "joiningDate" ? new Date().toISOString().split("T")[0] : undefined
                }
                value={String(value)}
                onChange={(e) =>
                  onChange(
                    field.name,
                    field.type === "number" && e.target.value !== ""
                      ? Number(e.target.value)
                      : e.target.value,
                  )
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
