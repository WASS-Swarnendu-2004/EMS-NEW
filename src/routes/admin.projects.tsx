import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  assignEmployeesToProject,
  type Project,
} from "@/api/project";

import { getEmployees, type Employee } from "@/api/employee";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/admin/projects")({
  component: Page,
});

const STATUSES: Project["status"][] = [
  "planning",
  "in-progress",
  "hold",
  "completed",
  "cancelled",
];

// DATE HELPERS

function diffDays(a: string, b: string) {
  if (!a || !b) return 0;

  return Math.max(
    0,
    Math.round(
      (new Date(b).getTime() - new Date(a).getTime()) /
        86400000,
    ),
  );
}

function formatISTDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const today = new Date().toISOString().slice(0, 10);

// BLANK FORM

const blank: {
  projectName: string;
  consumerName: string;
  consumerDetails: string;
  startDate: string;
  endDate: string;
  valuation: number;
  description: string;
  assignedEmployees: string[];
} = {
  projectName: "",
  consumerName: "",
  consumerDetails: "",
  startDate: today,
  endDate: today,
  valuation: 0,
  description: "",
  assignedEmployees: [],
};

// PAGE

function Page() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] =
    useState<Project | null>(null);

  const [form, setForm] = useState(blank);

  const [view, setView] =
    useState<Project | null>(null);

  const [assignOpen, setAssignOpen] =
    useState<Project | null>(null);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [selectedEmployees, setSelectedEmployees] =
    useState<string[]>([]);

  // LOAD DATA

  useEffect(() => {
    loadData();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);

      const data = await getProjects();

      setProjects(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function loadData() {
    try {
      setLoading(true);

      const [
        projectData,
        employeeData,
      ] = await Promise.all([
        getProjects(),
        getEmployees(),
      ]);

      setProjects(projectData);
      setEmployees(employeeData.employees);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // DURATION

  const duration = useMemo(
    () =>
      diffDays(
        form.startDate,
        form.endDate,
      ),
    [form.startDate, form.endDate],
  );

  // ADD PROJECT

  function openNew() {
    setEditing(null);
    setForm({
      ...blank,
      assignedEmployees: [],
    });

    setOpen(true);
  }

  // EDIT PROJECT

  function openEdit(project: Project) {
    setEditing(project);

    setForm({
      projectName: project.projectName,
      consumerName: project.consumerName,
      consumerDetails: project.consumerDetails,
      startDate: project.startDate.slice(0, 10),
      endDate: project.endDate.slice(0, 10),
      valuation: project.valuation,
      description: project.description,

      // API returns employee objects.
      // Form needs only employee IDs.
      assignedEmployees:
        project.assignedEmployees.map(
          (emp) => emp._id,
        ),
    });

    setOpen(true);
  }

  // SAVE PROJECT

  async function save() {
    if (!form.projectName.trim()) {
      toast.warning("Project name is required");
      return;
    }

    if (
      !/^[A-Za-z ]+$/.test(
        form.projectName.trim(),
      )
    ) {
      toast.warning(
        "Project name should contain alphabets only",
      );
      return;
    }

    if (!form.consumerName.trim()) {
      toast.warning("Company name is required");
      return;
    }

    if (
      !/^[A-Za-z ]+$/.test(
        form.consumerName.trim(),
      )
    ) {
      toast.warning(
        "Company name should contain alphabets only",
      );
      return;
    }

    try {
      if (editing) {
        await updateProject(editing._id, {
          projectName: form.projectName,
          consumerName: form.consumerName,
          consumerDetails:
            form.consumerDetails,
          startDate: form.startDate,
          endDate: form.endDate,
          valuation: form.valuation,
          description: form.description,

          // Send IDs to backend
          assignedEmployees:
            form.assignedEmployees,
        });

        toast.success(
          "Project updated successfully",
        );
      } else {
        await createProject({
          projectName: form.projectName,
          consumerName: form.consumerName,
          startDate: form.startDate,
          endDate: form.endDate,
          valuation: form.valuation,
          description: form.description,

          // Send IDs to backend
          assignedEmployees:
            form.assignedEmployees,
        });

        toast.success(
          "Project created successfully",
        );
      }

      setOpen(false);
      setEditing(null);

      await loadProjects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save project");
    }
  }

  // DELETE PROJECT

  async function remove(id: string) {
    try {
      await deleteProject(id);

      setProjects((prev) =>
        prev.filter(
          (project) =>
            project._id !== id,
        ),
      );

      toast.success(
        "Project deleted successfully",
      );
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to delete project",
      );
    }
  }

  
  // OPEN ASSIGN MODAL

  function openAssign(project: Project) {
    setAssignOpen(project);

    // IMPORTANT:
    // assignedEmployees contains objects from API.
    // selectedEmployees contains only IDs.
    setSelectedEmployees(
      project.assignedEmployees.map(
        (emp) => emp._id,
      ),
    );
  }

  // SAVE ASSIGNMENTS

  async function saveAssignments() {
    if (!assignOpen) return;

    try {
      const updatedProject =
        await assignEmployeesToProject(
          assignOpen._id,
          selectedEmployees,
        );

      setProjects((prev) =>
        prev.map((p) =>
          p._id === updatedProject._id
            ? updatedProject
            : p,
        ),
      );

      toast.success(
        "Employees assigned successfully",
      );

      setAssignOpen(null);
      setSelectedEmployees([]);
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to assign employees",
      );
    }
  }

  // EXPORT EXCEL

  function exportXlsx() {
    exportToExcel(
      projects.map((p) => ({
        Name: p.projectName,
        Consumer: p.consumerName,
        Start: p.startDate,
        End: p.endDate,
        Duration: p.duration,
        Valuation: p.valuation,
        Status: p.status,

        // Show names in Excel too
        AssignedEmployees:
          p.assignedEmployees
            .map(
              (emp) => emp.fullName,
            )
            .join(", "),
      })),
      "projects.xlsx",
      "Projects",
    );
  }

  // LOADING

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-gray-500 text-lg font-medium">
          Loading project details...
        </p>
      </div>
    );
  }

  // UI

  return (
    <>
      {/* TOOLBAR */}

      <div className="toolbar">
        <span className="spacer" />

        <button
          className="btn btn-ghost"
          onClick={exportXlsx}
        >
          ⬇ Export Excel
        </button>

        <button
          className="btn"
          onClick={openNew}
        >
          + Add project
        </button>
      </div>

      {/* PROJECT TABLE */}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Company</th>
              <th>Duration</th>
              <th>Valuation</th>
              <th>Status</th>
              <th>Assigned Employees</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {projects.map((p) => (
              <tr key={p._id}>
                {/* PROJECT */}
                <td>
                  <strong>
                    {p.projectName}
                  </strong>
                </td>

                {/* COMPANY */}
                <td>
                  {p.consumerName}
                </td>

                {/* DURATION */}
                <td>
                  {formatISTDate(
                    p.startDate,
                  )}{" "}
                  →{" "}
                  {formatISTDate(
                    p.endDate,
                  )}

                  <div
                    className="muted"
                    style={{
                      fontSize: ".75rem",
                    }}
                  >
                    {p.duration} days
                  </div>
                </td>

                {/* VALUATION */}
                <td>
                  ₹
                  {p.valuation.toLocaleString()}
                </td>

                {/* STATUS */}
                <td>
                  <select
                    className="select"
                    style={{
                      padding:
                        ".25rem .4rem",
                      fontSize: ".8rem",
                    }}
                    value={p.status}
                    onChange={async (
                      e,
                    ) => {
                      const newStatus =
                        e.target
                          .value as Project["status"];

                      try {
                        const updatedProject =
                          await updateProject(
                            p._id,
                            {
                              status:
                                newStatus,
                            },
                          );

                        setProjects(
                          (prev) =>
                            prev.map(
                              (
                                project,
                              ) =>
                                project._id ===
                                updatedProject._id
                                  ? updatedProject
                                  : project,
                            ),
                        );

                        toast.success(
                          "Project status updated",
                        );
                      } catch (err) {
                        console.error(
                          err,
                        );

                        toast.error(
                          "Failed to update status",
                        );
                      }
                    }}
                  >
                    {STATUSES.map(
                      (s) => (
                        <option
                          key={s}
                          value={s}
                        >
                          {s.replace(
                            "-",
                            " ",
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </td>

                {/* ASSIGNED EMPLOYEE NAMES */}
                <td>
                  {p.assignedEmployees
                    .length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {p.assignedEmployees.map(
                        (emp) => (
                          <span
                            key={emp._id}
                          >
                            {emp.fullName}
                          </span>
                        ),
                      )}
                    </div>
                  ) : (
                    <span className="muted">
                      Nobody
                    </span>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="actions">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() =>
                      openAssign(p)
                    }
                  >
                    Assign
                  </button>

                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() =>
                      openEdit(p)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      remove(p._id)
                    }
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}

            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="empty"
                >
                  No projects yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL*/}

      {open && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setOpen(false)
          }
        >
          <div
            className="modal lg"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-head">
              <h2>
                {editing
                  ? "Edit"
                  : "Add"}{" "}
                project
              </h2>

              <button
                className="btn btn-sm btn-ghost"
                onClick={() =>
                  setOpen(false)
                }
              >
                ✕
              </button>
            </div>

            <div className="row-2">
              {/* PROJECT NAME */}
              <div className="field">
                <label>
                  Project name *
                </label>

                <input
                  className="input"
                  value={
                    form.projectName
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      projectName:
                        e.target.value.replace(
                          /[^A-Za-z ]/g,
                          "",
                        ),
                    })
                  }
                />
              </div>

              {/* COMPANY */}
              <div className="field">
                <label>
                  Company name *
                </label>

                <input
                  className="input"
                  value={
                    form.consumerName
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      consumerName:
                        e.target.value.replace(
                          /[^A-Za-z ]/g,
                          "",
                        ),
                    })
                  }
                />
              </div>

              {/* START DATE */}
              <div className="field">
                <label>
                  Start date
                </label>

                <input
                  className="input"
                  type="date"
                  min={today}
                  value={
                    form.startDate
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      startDate:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* END DATE */}
              <div className="field">
                <label>
                  End date
                </label>

                <input
                  className="input"
                  type="date"
                  min={today}
                  value={
                    form.endDate
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endDate:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* DURATION */}
              <div className="field">
                <label>
                  Duration (auto)
                </label>

                <input
                  className="input"
                  value={
                    duration +
                    " days"
                  }
                  readOnly
                />
              </div>

              {/* VALUATION */}
              <div className="field">
                <label>
                  Valuation (₹)
                </label>

                <input
                  className="input"
                  type="number"
                  min="0"
                  value={
                    form.valuation
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      valuation:
                        Number(
                          e.target.value,
                        ) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* COMPANY DETAILS */}
            <div className="field">
              <label>
                Company details
              </label>

              <textarea
                className="textarea"
                value={
                  form.consumerDetails
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    consumerDetails:
                      e.target.value,
                  })
                }
              />
            </div>

            {/* DESCRIPTION */}
            <div className="field">
              <label>
                Description
              </label>

              <textarea
                className="textarea"
                value={
                  form.description
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
              />
            </div>

            {/* MODAL FOOTER */}
            <div className="modal-foot">
              <button
                className="btn btn-ghost"
                onClick={() =>
                  setOpen(false)
                }
              >
                Cancel
              </button>

              <button
                className="btn"
                onClick={save}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PROJECT MODAL*/}

      {view && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setView(null)
          }
        >
          <div
            className="modal lg"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-head">
              <h2>
                {view.projectName}
              </h2>

              <button
                className="btn btn-sm btn-ghost"
                onClick={() =>
                  setView(null)
                }
              >
                ✕
              </button>
            </div>

            <div className="row-2">
              <div>
                <strong>
                  Company:
                </strong>{" "}
                {view.consumerName}
              </div>

              <div>
                <strong>
                  Status:
                </strong>{" "}
                <span className="badge purple">
                  {view.status.replace(
                    "_",
                    " ",
                  )}
                </span>
              </div>

              <div>
                <strong>
                  Start:
                </strong>{" "}
                {formatISTDate(
                  view.startDate,
                )}
              </div>

              <div>
                <strong>
                  End:
                </strong>{" "}
                {formatISTDate(
                  view.endDate,
                )}
              </div>

              <div>
                <strong>
                  Duration:
                </strong>{" "}
                {view.duration} days
              </div>

              <div>
                <strong>
                  Valuation:
                </strong>{" "}
                ₹
                {view.valuation.toLocaleString()}
              </div>
            </div>

            <p className="mt-2">
              <strong>
                Details:
              </strong>{" "}
              {view.consumerDetails ||
                "-"}
            </p>

            <p>
              <strong>
                Description:
              </strong>{" "}
              {view.description ||
                "-"}
            </p>

            {/* ASSIGNED EMPLOYEES */}
            <div className="mt-2">
              <strong>
                Assigned:
              </strong>{" "}

              {view.assignedEmployees
                .length > 0 ? (
                <span>
                  {view.assignedEmployees
                    .map(
                      (emp) =>
                        emp.fullName,
                    )
                    .join(", ")}
                </span>
              ) : (
                <span>
                  Nobody
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/*ASSIGN EMPLOYEES MODAL*/}

      {assignOpen && (
        <div
          className="modal-backdrop"
          onClick={() =>
            setAssignOpen(null)
          }
        >
          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-head">
              <h2>
                Assign —{" "}
                {
                  assignOpen.projectName
                }
              </h2>

              <button
                className="btn btn-sm btn-ghost"
                onClick={() =>
                  setAssignOpen(null)
                }
              >
                ✕
              </button>
            </div>

            <p className="muted">
              Toggle employees to
              assign / unassign this
              project.
            </p>

            {/* EMPLOYEE LIST */}
            {employees.map(
              (emp) => (
                <label
                  key={emp._id}
                  className="flex"
                  style={{
                    padding:
                      ".5rem .25rem",
                    borderBottom:
                      "1px solid #eee",
                    cursor:
                      "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(
                      emp._id,
                    )}
                    onChange={() => {
                      setSelectedEmployees(
                        (prev) =>
                          prev.includes(
                            emp._id,
                          )
                            ? prev.filter(
                                (id) =>
                                  id !==
                                  emp._id,
                              )
                            : [
                                ...prev,
                                emp._id,
                              ],
                      );
                    }}
                  />

                  <span>
                    {emp.fullName}
                  </span>

                  <span
                    className="muted"
                    style={{
                      marginLeft:
                        "auto",
                      fontSize:
                        ".8rem",
                    }}
                  >
                    {emp.designation}
                  </span>
                </label>
              ),
            )}

            {/* MODAL FOOTER */}
            <div className="modal-foot">
              <button
                className="btn"
                onClick={
                  saveAssignments
                }
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

