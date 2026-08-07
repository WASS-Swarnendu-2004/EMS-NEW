import { useState } from "react";

type Employee = {
  _id: string;
  fullName: string;
};

type Project = {
  _id: string;
  projectName: string;
};

export type TaskFormData = {
  assignedTo: string;
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
    assignedTo: "",
    projectId: "",
    title: "",
    description: "",
    dueDate: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.assignedTo ||
      !form.title ||
      !form.description ||
      !form.dueDate
    ) {
      return;
    }

    onAssign(form);

    setForm({
      assignedTo: "",
      projectId: "",
      title: "",
      description: "",
      dueDate: "",
    });
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Assign New Task</h2>
      </div>

      <form onSubmit={submit}>
        <div className="field">
          <label>Assign To</label>

          <select
            className="select"
            value={form.assignedTo}
            onChange={(e) =>
              setForm({
                ...form,
                assignedTo: e.target.value,
              })
            }
          >
            <option value="">Select Employee</option>

            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.fullName}
              </option>
            ))}
          </select>
        </div>

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
          disabled={loading}
        >
          {loading ? "Assigning..." : "Assign Task"}
        </button>
      </form>
    </div>
  );
}