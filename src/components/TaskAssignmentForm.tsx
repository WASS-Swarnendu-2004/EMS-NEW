import { useState } from "react";

type Employee = {
  _id: string;
  employeeId?: string;
  fullName: string;
};

type Project = {
  _id: string;
  projectName: string;
};

export type TaskFormData = {
  assignedTo: string[];
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
};

type Props = {
  employees: Employee[];
  projects: Project[];
  onAssign: (data: TaskFormData) => void;
  loading?: boolean;
};

export default function TaskAssignmentForm({
  employees,
  projects,
  onAssign,
  loading = false,
}: Props) {
  const [form, setForm] = useState<TaskFormData>({
    assignedTo: [],
    projectId: "",
    title: "",
    description: "",
    dueDate: "",
  });

  const [employeeDropdownOpen, setEmployeeDropdownOpen] =
    useState(false);

  function toggleEmployee(employeeId: string) {
    setForm((prev) => {
      const alreadySelected =
        prev.assignedTo.includes(employeeId);

      return {
        ...prev,
        assignedTo: alreadySelected
          ? prev.assignedTo.filter(
              (id) => id !== employeeId
            )
          : [...prev.assignedTo, employeeId],
      };
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (
      form.assignedTo.length === 0 ||
      !form.title ||
      !form.description ||
      !form.dueDate
    ) {
      return;
    }

    onAssign(form);

    setForm({
      assignedTo: [],
      projectId: "",
      title: "",
      description: "",
      dueDate: "",
    });
  }

  const selectedEmployees = employees.filter((employee) =>
    form.assignedTo.includes(employee._id)
  );

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">
        Assign New Task
      </h2>

      <form onSubmit={submit}>
        {/* EMPLOYEE */}
        <div className="field">
          <label>Assign To</label>

          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="select"
              style={{
                width: "100%",
                textAlign: "left",
                background: "white",
                cursor: "pointer",
              }}
              onClick={() =>
                setEmployeeDropdownOpen(
                  !employeeDropdownOpen
                )
              }
            >
              {selectedEmployees.length === 0
                ? "Select Employee"
                : `${selectedEmployees.length} employee${
                    selectedEmployees.length > 1
                      ? "s"
                      : ""
                  } selected`}
            </button>

            {employeeDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  maxHeight: "250px",
                  overflowY: "auto",
                  marginTop: "4px",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                {employees.length === 0 ? (
                  <div style={{ padding: "12px" }}>
                    No employees available
                  </div>
                ) : (
                  employees.map((employee) => {
                    const checked =
                      form.assignedTo.includes(
                        employee._id
                      );

                    return (
                      <label
                        key={employee._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 12px",
                          cursor: "pointer",
                          borderBottom:
                            "1px solid #f0f0f0",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleEmployee(
                              employee._id
                            )
                          }
                        />

                        <span>
                          {employee.fullName}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* SELECTED EMPLOYEES */}
          {selectedEmployees.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "8px",
              }}
            >
              {selectedEmployees.map((employee) => (
                <span
                  key={employee._id}
                  style={{
                    padding: "4px 8px",
                    background: "#f3f4f6",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                >
                  {employee.fullName}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* PROJECT */}
        <div className="field">
          <label>Project</label>

          <select
            className="select"
            value={form.projectId}
            onChange={(e) =>
              setForm({
                ...form,
                projectId: e.target.value,
              })
            }
          >
            <option value="">No Project</option>

            {projects.map((project) => (
              <option
                key={project._id}
                value={project._id}
              >
                {project.projectName}
              </option>
            ))}
          </select>
        </div>

        {/* DUE DATE */}
        <div className="field">
          <label>Due Date</label>

          <input
            type="date"
            className="input"
            value={form.dueDate}
            onChange={(e) =>
              setForm({
                ...form,
                dueDate: e.target.value,
              })
            }
          />
        </div>

        {/* TITLE */}
        <div className="field">
          <label>Task Title</label>

          <input
            className="input"
            placeholder="Enter task title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />
        </div>

        {/* DESCRIPTION */}
        <div className="field">
          <label>Description</label>

          <textarea
            className="textarea"
            rows={5}
            placeholder="Describe the task..."
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>

        <button
          className="btn btn-gold"
          type="submit"
          disabled={
            loading ||
            form.assignedTo.length === 0
          }
        >
          {loading
            ? "Assigning..."
            : "Assign Task"}
        </button>
      </form>
    </div>
  );
}