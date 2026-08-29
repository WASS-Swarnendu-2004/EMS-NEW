import { useState } from "react";

type Employee = {
  _id: string;
  employeeId: string;
  fullName: string;
  role?: string;
  designation?: string;
  department?: string;
  profileImage?: string;
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

type HoverPosition = {
  top: number;
  left: number;
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

  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

  const [hoveredEmployee, setHoveredEmployee] = useState<Employee | null>(null);

  const [hoverPosition, setHoverPosition] = useState<HoverPosition | null>(null);

  function toggleEmployee(employeeId: string) {
    setForm((prev) => {
      const alreadySelected = prev.assignedTo.includes(employeeId);

      return {
        ...prev,
        assignedTo: alreadySelected
          ? prev.assignedTo.filter((id) => id !== employeeId)
          : [...prev.assignedTo, employeeId],
      };
    });
  }

  function handleEmployeeMouseEnter(employee: Employee, event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    const popupWidth = 280;
    const gap = 12;

    let left = rect.right + gap;

    // If there is not enough space on the right,
    // show the popup on the left.
    if (left + popupWidth > window.innerWidth - 10) {
      left = rect.left - popupWidth - gap;
    }

    // Prevent popup from going outside the left edge.
    if (left < 10) {
      left = 10;
    }

    setHoveredEmployee(employee);

    setHoverPosition({
      top: rect.top,
      left,
    });
  }

  function handleEmployeeMouseLeave() {
    setHoveredEmployee(null);
    setHoverPosition(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (form.assignedTo.length === 0 || !form.title || !form.description || !form.dueDate) {
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

    setEmployeeDropdownOpen(false);
    setHoveredEmployee(null);
    setHoverPosition(null);
  }

  const selectedEmployees = employees.filter((employee) => form.assignedTo.includes(employee._id));

  const getEmployeeImageUrl = (profileImage?: string) => {
    if (!profileImage) {
      return null;
    }

    return `https://fresh-01.onrender.com/${profileImage.replace(/^src\//, "")}`;
  };

  return (
    <div>
      <h2 className="mb-5 text-lg font-semibold">Assign New Task</h2>

      <form onSubmit={submit}>
        {/* EMPLOYEE */}
        <div className="field">
          <label>Assign To</label>

          <div className="relative">
            {/* SELECT EMPLOYEE BUTTON */}
            <button
              type="button"
              className="select w-full cursor-pointer bg-white text-left"
              onClick={() => {
                setEmployeeDropdownOpen(!employeeDropdownOpen);

                setHoveredEmployee(null);
                setHoverPosition(null);
              }}
            >
              {selectedEmployees.length === 0
                ? "Select Employee"
                : `${selectedEmployees.length} employee${
                    selectedEmployees.length > 1 ? "s" : ""
                  } selected`}
            </button>

            {/* EMPLOYEE DROPDOWN */}
            {employeeDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[250px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {employees.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">No employees available</div>
                ) : (
                  employees.map((employee) => {
                    const checked = form.assignedTo.includes(employee._id);

                    return (
                      <div
                        key={employee._id}
                        onMouseEnter={(event) => handleEmployeeMouseEnter(employee, event)}
                        onMouseLeave={handleEmployeeMouseLeave}
                        className="flex min-h-[42px] cursor-pointer items-center border-b border-gray-100 transition-colors hover:bg-gray-50"
                      >
                        <label className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5">
                          {/* CHECKBOX */}
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleEmployee(employee._id)}
                            className="h-4 w-4 rounded border-gray-300 accent-yellow-500"
                          />

                          {/* NAME */}
                          <span className="flex-1 truncate text-sm text-gray-800">
                            {employee.fullName}
                          </span>

                          {/* EMPLOYEE ID */}
                          <span className="whitespace-nowrap text-xs text-gray-400">
                            {employee.employeeId}
                          </span>
                        </label>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* EMPLOYEE DETAILS HOVER POPUP */}
            {hoveredEmployee && hoverPosition && (
              <div
                className="fixed z-[9999] w-[280px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
                style={{
                  top: hoverPosition.top,
                  left: hoverPosition.left,
                  pointerEvents: "none",
                }}
              >
                {/* PROFILE HEADER */}
                <div className="mb-4 flex items-center gap-3">
                  {/* PROFILE IMAGE */}
                  {getEmployeeImageUrl(hoveredEmployee.profileImage) ? (
                    <img
                      src={getEmployeeImageUrl(hoveredEmployee.profileImage)!}
                      alt={hoveredEmployee.fullName}
                      className="h-12 w-12 shrink-0 rounded-full border border-gray-200 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-500">
                      {hoveredEmployee.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* NAME + ID */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {hoveredEmployee.fullName}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">{hoveredEmployee.employeeId}</p>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="space-y-2.5 text-sm">
                  {/* EMPLOYEE ID */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Employee ID</span>

                    <span className="font-medium text-gray-900">{hoveredEmployee.employeeId}</span>
                  </div>
                  {/* DEPARTMENT */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Department</span>

                    <span className="font-medium text-gray-900">
                      {hoveredEmployee.department || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SELECTED EMPLOYEES */}
          {selectedEmployees.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedEmployees.map((employee) => (
                <span
                  key={employee._id}
                  className="rounded-md bg-gray-100 px-2 py-1 text-[13px] text-gray-700"
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
              <option key={project._id} value={project._id}>
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

        {/* SUBMIT */}
        <button
          className="btn btn-gold"
          type="submit"
          disabled={loading || form.assignedTo.length === 0}
        >
          {loading ? "Assigning..." : "Assign Task"}
        </button>
      </form>
    </div>
  );
}
