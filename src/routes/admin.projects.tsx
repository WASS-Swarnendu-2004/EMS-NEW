import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
// import { store, useDB, type Project } from "@/lib/store";
import { useDB } from "@/lib/store";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  assignEmployeesToProject,
  type Project,
} from "@/api/project";
import { getEmployees, type Employee } from "@/api/employee";

import { useEffect } from "react";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/admin/projects")({ component: Page });

const STATUSES: Project["status"][] = ["planning", "in-progress", "hold", "completed", "cancelled"];

function diffDays(a: string, b: string) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

function formatISTDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  valuation: 0,
  description: "",
  assignedEmployees: [],
};

function Page() {
  const db = useDB();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(blank);
  const [view, setView] = useState<Project | null>(null);
  const [assignOpen, setAssignOpen] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

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

      const [projectData, employeeData] = await Promise.all([getProjects(), getEmployees()]);

      setProjects(projectData);
      setEmployees(employeeData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const duration = useMemo(
    () => diffDays(form.startDate, form.endDate),
    [form.startDate, form.endDate],
  );

  function openNew() {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  }
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
      assignedEmployees: project.assignedEmployees,
    });

    setOpen(true);
  }
  async function save() {
    try {
      if (editing) {
        await updateProject(editing._id, {
          projectName: form.projectName,
          consumerName: form.consumerName,
          consumerDetails: form.consumerDetails,
          startDate: form.startDate,
          endDate: form.endDate,
          valuation: form.valuation,
          description: form.description,
          assignedEmployees: form.assignedEmployees,
        });

        toast.success("Project updated successfully");
      } else {
        await createProject({
          projectName: form.projectName,
          consumerName: form.consumerName,
          startDate: form.startDate,
          endDate: form.endDate,
          valuation: form.valuation,
          description: form.description,
          assignedEmployees: form.assignedEmployees,
        });

        toast.success("Project created successfully");
      }

      setOpen(false);
      setEditing(null);

      await loadProjects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save project");
    }
  }

 async function remove(id: string) {
  // if (!confirm("Delete project?")) return;

  try {
    await deleteProject(id);

    setProjects((prev) => prev.filter((project) => project._id !== id));

    toast.success("Project deleted successfully");
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete project");
  }
}

  // async function toggleAssign(project: Project, empId: string) {
  //   try {
  //     const ids = project.assignedEmployees.includes(empId)
  //       ? project.assignedEmployees.filter((id) => id !== empId)
  //       : [...project.assignedEmployees, empId];

  //     const updatedProject = await assignEmployeesToProject(project._id, ids);

  //     setAssignOpen(updatedProject);

  //     setProjects((prev) => prev.map((p) => (p._id === updatedProject._id ? updatedProject : p)));

  //     // toast.success("Project updated");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to assign employee");
  //   }
  // }

  async function saveAssignments() {
    if (!assignOpen) return;

    try {
      const updatedProject = await assignEmployeesToProject(assignOpen._id, selectedEmployees);

      setProjects((prev) => prev.map((p) => (p._id === updatedProject._id ? updatedProject : p)));

      toast.success("Employees assigned successfully");

      setAssignOpen(null);
      setSelectedEmployees([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign employees");
    }
  }

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
        AssignedCount: p.assignedEmployees.length,
      })),
      "projects.xlsx",
      "Projects",
    );
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">Loading project details...</p>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={exportXlsx}>
          ⬇ Export Excel
        </button>
        <button className="btn" onClick={openNew}>
          + Add project
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Consumer</th>
              <th>Duration</th>
              <th>Valuation</th>
              <th>Status</th>
              <th>Assigned</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p._id}>
                <td>
                  <strong>{p.projectName}</strong>
                </td>
                <td>{p.consumerName}</td>
                <td>
                  {formatISTDate(p.startDate)} → {formatISTDate(p.endDate)}
                  <div className="muted" style={{ fontSize: ".75rem" }}>
                    {p.duration} days
                  </div>
                </td>
                <td>₹{p.valuation.toLocaleString()}</td>
                <td>
                  <select
                    className="select"
                    style={{ padding: ".25rem .4rem", fontSize: ".8rem" }}
                    value={p.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value as Project["status"];

                      try {
                        const updatedProject = await updateProject(p._id, {
                          status: newStatus,
                        });

                        setProjects((prev) =>
                          prev.map((project) =>
                            project._id === updatedProject._id ? updatedProject : project,
                          ),
                        );

                        toast.success("Project status updated");
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to update status");
                      }
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("-", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{p.assignedEmployees.length}</td>
                <td className="actions">
                  {/* <button className="btn btn-sm btn-ghost" onClick={() => setView(p)}>
                    View
                  </button> */}
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={async () => {
                      setAssignOpen(p);
                      setSelectedEmployees(p.assignedEmployees);
                    }}
                  >
                    Assign
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(p._id)}>
                    Del
                  </button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  No projects yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editing ? "Edit" : "Add"} project</h2>
              <button className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            <div className="row-2">
              <div className="field">
                <label>Project name *</label>
                <input
                  className="input"
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Consumer name *</label>
                <input
                  className="input"
                  value={form.consumerName}
                  onChange={(e) => setForm({ ...form, consumerName: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Start date</label>
                <input
                  className="input"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="field">
                <label>End date</label>
                <input
                  className="input"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Duration (auto)</label>
                <input className="input" value={duration + " days"} readOnly />
              </div>
              <div className="field">
                <label>Valuation (₹)</label>
                <input
                  className="input"
                  type="number"
                  value={form.valuation}
                  onChange={(e) => setForm({ ...form, valuation: +e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label>Consumer details</label>
              <textarea
                className="textarea"
                value={form.consumerDetails}
                onChange={(e) => setForm({ ...form, consumerDetails: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                className="textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="btn" onClick={save}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {view && (
        <div className="modal-backdrop" onClick={() => setView(null)}>
          <div className="modal lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{view.projectName}</h2>
              <button className="btn btn-sm btn-ghost" onClick={() => setView(null)}>
                ✕
              </button>
            </div>
            <div className="row-2">
              <div>
                <strong>Consumer:</strong> {view.consumerName}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span className="badge purple">{view.status.replace("_", " ")}</span>
              </div>
              <div>
                <strong>Start:</strong> {view.startDate}
              </div>
              <div>
                <strong>End:</strong> {view.endDate}
              </div>
              <div>
                <strong>Duration:</strong> {view.duration} days
              </div>
              <div>
                <strong>Valuation:</strong> ₹{view.valuation.toLocaleString()}
              </div>
            </div>
            <p className="mt-2">
              <strong>Details:</strong> {view.consumerDetails}
            </p>
            <p>
              <strong>Description:</strong> {view.description}
            </p>
            <div className="mt-2">
              <strong>Assigned:</strong>{" "}
              {view.assignedEmployees
                .map((id) => db.employees.find((e) => e.id === id)?.name)
                .filter(Boolean)
                .join(", ") || "Nobody"}
            </div>
          </div>
        </div>
      )}

      {assignOpen && (
        <div className="modal-backdrop" onClick={() => setAssignOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Assign — {assignOpen.projectName}</h2>
              <button className="btn btn-sm btn-ghost" onClick={() => setAssignOpen(null)}>
                ✕
              </button>
            </div>
            <p className="muted">Toggle employees to assign / unassign this project.</p>
            {employees.map((emp) => (
              <label
                key={emp._id}
                className="flex"
                style={{
                  padding: ".5rem .25rem",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp._id)}
                  onChange={() => {
                    setSelectedEmployees((prev) =>
                      prev.includes(emp._id)
                        ? prev.filter((id) => id !== emp._id)
                        : [...prev, emp._id],
                    );
                  }}
                />
                <span>{emp.fullName}</span>
                <span className="muted" style={{ marginLeft: "auto", fontSize: ".8rem" }}>
                  {emp.role}
                </span>
              </label>
            ))}
            <div className="modal-foot">
              <button className="btn" onClick={saveAssignments}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
