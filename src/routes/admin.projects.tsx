import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
// import { store, useDB, type Project } from "@/lib/store";
import { useDB } from "@/lib/store";
import {getProjects,createProject,type Project,
} from "@/api/project";

import { useEffect } from "react";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/admin/projects")({ component: Page });

const STATUSES: Project["status"][] = ["planning", "in_progress", "on_hold", "completed", "cancelled"];

function diffDays(a: string, b: string) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

const blank = {
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

  useEffect(() => {
  loadProjects();
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

  const duration = useMemo(() => diffDays(form.startDate, form.endDate), [form.startDate, form.endDate]);

  function openNew() { setEditing(null); setForm(blank); setOpen(true); }
  function openEdit() {
  alert("Edit Project API is not available yet.");
}
  async function save() {
  try {
    await createProject({
      projectName: form.projectName,
      consumerName: form.consumerName,
      startDate: form.startDate,
      endDate: form.endDate,
      valuation: form.valuation,
      description: form.description,
      assignedEmployees: form.assignedEmployees,
    });

    setOpen(false);
    loadProjects();
  } catch (err) {
    console.error(err);
  }
}
  function remove() {
  alert("Delete Project API is not available yet.");
}

  function toggleAssign() {
  alert("Assign Employee API is not available yet.");
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
    "Projects"
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
        <button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export Excel</button>
        <button className="btn" onClick={openNew}>+ Add project</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Project</th><th>Consumer</th><th>Duration</th><th>Valuation</th><th>Status</th><th>Assigned</th><th></th></tr></thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p._id}>
                <td><strong>{p.projectName}</strong></td>
                <td>{p.consumerName}</td>
                <td>{p.startDate} → {p.endDate}<div className="muted" style={{ fontSize: ".75rem" }}>{p.duration} days</div></td>
                <td>₹{p.valuation.toLocaleString()}</td>
                <td>
                  <select className="select"style={{ padding: ".25rem .4rem", fontSize: ".8rem" }}value={p.status} disabled>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                </td>
                <td>{p.assignedEmployees.length}</td>
                <td className="actions">
                  <button className="btn btn-sm btn-ghost" onClick={() => setView(p)}>View</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => setAssignOpen(p)}>Assign</button>
                  <button className="btn btn-sm btn-ghost" onClick={openEdit}>Edit</button>
                  <button className="btn btn-sm btn-danger"onClick={remove}>Del</button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && <tr><td colSpan={7} className="empty">No projects yet</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>{editing ? "Edit" : "Add"} project</h2><button className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>✕</button></div>
            <div className="row-2">
              <div className="field"><label>Project name *</label><input className="input" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} /></div>
              <div className="field"><label>Consumer name *</label><input className="input" value={form.consumerName} onChange={(e) => setForm({ ...form, consumerName: e.target.value })} /></div>
              <div className="field"><label>Start date</label><input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="field"><label>End date</label><input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
              <div className="field"><label>Duration (auto)</label><input className="input" value={duration + " days"} readOnly /></div>
              <div className="field"><label>Valuation (₹)</label><input className="input" type="number" value={form.valuation} onChange={(e) => setForm({ ...form, valuation: +e.target.value })} /></div>
            </div>
            <div className="field"><label>Consumer details</label><textarea className="textarea" value={form.consumerDetails} onChange={(e) => setForm({ ...form, consumerDetails: e.target.value })} /></div>
            <div className="field"><label>Description</label><textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}

      {view && (
        <div className="modal-backdrop" onClick={() => setView(null)}>
          <div className="modal lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>{view.projectName}</h2><button className="btn btn-sm btn-ghost" onClick={() => setView(null)}>✕</button></div>
            <div className="row-2">
              <div><strong>Consumer:</strong> {view.consumerName}</div>
              <div><strong>Status:</strong> <span className="badge purple">{view.status.replace("_", " ")}</span></div>
              <div><strong>Start:</strong> {view.startDate}</div>
              <div><strong>End:</strong> {view.endDate}</div>
              <div><strong>Duration:</strong> {view.duration} days</div>
              <div><strong>Valuation:</strong> ₹{view.valuation.toLocaleString()}</div>
            </div>
            <p className="mt-2"><strong>Details:</strong> {view.consumerDetails}</p>
            <p><strong>Description:</strong> {view.description}</p>
            <div className="mt-2"><strong>Assigned:</strong> {view.assignedEmployees.map((id) => db.employees.find((e) => e.id === id)?.name).filter(Boolean).join(", ") || "Nobody"}</div>
          </div>
        </div>
      )}

      {assignOpen && (
        <div className="modal-backdrop" onClick={() => setAssignOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head"><h2>Assign — {assignOpen.projectName}</h2><button className="btn btn-sm btn-ghost" onClick={() => setAssignOpen(null)}>✕</button></div>
            <p className="muted">Toggle employees to assign / unassign this project.</p>
            {db.employees.map((emp) => (
              <label key={emp.id} className="flex" style={{ padding: ".5rem .25rem", borderBottom: "1px solid #eee", cursor: "pointer" }}>
                <input type="checkbox" checked={assignOpen.assignedEmployees.includes(emp.id)} onChange={ toggleAssign} />
                <span>{emp.name}</span>
                <span className="muted" style={{ marginLeft: "auto", fontSize: ".8rem" }}>{emp.role}</span>
              </label>
            ))}
            <div className="modal-foot"><button className="btn" onClick={() => setAssignOpen(null)}>Done</button></div>
          </div>
        </div>
      )}
    </>
  );
}
