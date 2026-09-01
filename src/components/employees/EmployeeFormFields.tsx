import { useState } from "react";
import type { EmployeeField } from "@/config/employeeForm";
import type { CreateEmployeePayload } from "@/api/employee";
import type { Role } from "@/api/role";
import { GripVertical } from "lucide-react";

type EmployeeFormFieldsProps = {
  fields: EmployeeField[];
  form: CreateEmployeePayload;
  roles: Role[];

  onRemoveField: (id: string) => void;

  onOpenDesignationModal: () => void;

  onChange: (
    fieldName: string,
    value: string | number | boolean,
  ) => void;

  onReorder: (
    draggedId: string,
    targetId: string,
  ) => void;
};

export function EmployeeFormFields({
  fields,
  form,
  roles,
  onRemoveField,
  onOpenDesignationModal,
  onChange,
  onReorder,
}: EmployeeFormFieldsProps) {
  const [draggedId, setDraggedId] =
    useState<string | null>(null);

  const [dragOverId, setDragOverId] =
    useState<string | null>(null);

  function handleDragStart(
    e: React.DragEvent<HTMLDivElement>,
    id: string,
  ) {
    setDraggedId(id);

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "text/plain",
      id,
    );
  }

  function handleDragOver(
    e: React.DragEvent<HTMLDivElement>,
    id: string,
  ) {
    e.preventDefault();

    if (id !== draggedId) {
      setDragOverId(id);
    }

    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(
    e: React.DragEvent<HTMLDivElement>,
    targetId: string,
  ) {
    e.preventDefault();

    const sourceId =
      e.dataTransfer.getData(
        "text/plain",
      );

    if (
      !sourceId ||
      sourceId === targetId
    ) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    onReorder(
      sourceId,
      targetId,
    );

    setDraggedId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverId(null);
  }

  const pfApplicable =
    form.pfApplicable ?? false;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

      {/* ================================================= */}
      {/* PF APPLICABLE - BUILT-IN FIELD                    */}
      {/* ================================================= */}

      <div className="field rounded-lg">
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 transition hover:bg-gray-100">
          <input
            type="checkbox"
            className="checkbox checkbox-primary"
            checked={pfApplicable}
            onChange={(e) =>
              onChange(
                "pfApplicable",
                e.target.checked,
              )
            }
          />

          <span className="text-sm font-medium text-gray-700">
            PF Applicable
          </span>
        </label>
      </div>

      {/* ================================================= */}
      {/* NORMAL EMPLOYEE FIELDS                            */}
      {/* ================================================= */}

      {fields
        .filter(
          (field) =>
            field.name !==
            "pfApplicable",
        )
        .map((field) => {
          const value =
            (
              form as Record<
                string,
                unknown
              >
            )[field.name] ?? "";

          return (
            <div
              key={field.id}
              draggable
              onDragStart={(e) =>
                handleDragStart(
                  e,
                  field.id,
                )
              }
              onDragOver={(e) =>
                handleDragOver(
                  e,
                  field.id,
                )
              }
              onDrop={(e) =>
                handleDrop(
                  e,
                  field.id,
                )
              }
              onDragEnd={
                handleDragEnd
              }
              className={`
                ${
                  field.type ===
                  "textarea"
                    ? "field lg:col-span-2"
                    : "field"
                }
                cursor-default rounded-lg
                transition-all
                ${
                  draggedId ===
                  field.id
                    ? "opacity-40"
                    : ""
                }
                ${
                  dragOverId ===
                  field.id
                    ? "ring-2 ring-blue-400"
                    : ""
                }
              `}
            >
              {/* Field Header */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>

                  <label>
                    {field.label}

                    {field.required &&
                      " *"}
                  </label>
                </div>

                <div className="flex items-center gap-2">

                  {/* Manage Designations */}
                  {field.name ===
                    "designation" && (
                    <button
                      type="button"
                      className="text-sm font-medium text-blue-600 hover:underline"
                      onClick={
                        onOpenDesignationModal
                      }
                    >
                      + Manage
                      Designations
                    </button>
                  )}

                  {/* Remove Custom Field */}
                  {field.removable && (
                    <button
                      type="button"
                      className="text-sm text-red-500 hover:text-red-700"
                      onClick={() =>
                        onRemoveField(
                          field.id,
                        )
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Textarea */}
              {field.type ===
              "textarea" ? (
                <textarea
                  rows={4}
                  className="textarea w-full"
                  value={String(
                    value,
                  )}
                  onChange={(e) =>
                    onChange(
                      field.name,
                      e.target.value,
                    )
                  }
                />
              ) : field.type ===
                "select" ? (
                <select
                  className="select w-full"
                  value={String(
                    value,
                  )}
                  onChange={(e) =>
                    onChange(
                      field.name,
                      e.target.value,
                    )
                  }
                >
                  {field.name ===
                  "designation"
                    ? roles.map(
                        (role) => (
                          <option
                            key={
                              role._id
                            }
                            value={
                              role.roleName
                            }
                          >
                            {
                              role.roleName
                            }
                          </option>
                        ),
                      )
                    : field.options?.map(
                        (
                          option,
                        ) => (
                          <option
                            key={
                              option
                            }
                            value={
                              option
                            }
                          >
                            {
                              option
                            }
                          </option>
                        ),
                      )}
                </select>
              ) : (
                <input
                  className="input w-full"
                  type={field.type}
                  min={
                    field.name ===
                    "joiningDate"
                      ? "2010-01-01"
                      : undefined
                  }
                  max={
                    field.name ===
                    "joiningDate"
                      ? new Date()
                          .toISOString()
                          .split(
                            "T",
                          )[0]
                      : undefined
                  }
                  value={String(
                    value,
                  )}
                  onChange={(e) =>
                    onChange(
                      field.name,
                      field.type ===
                        "number" &&
                        e.target
                          .value !==
                          ""
                        ? Number(
                            e.target
                              .value,
                          )
                        : e.target
                            .value,
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

