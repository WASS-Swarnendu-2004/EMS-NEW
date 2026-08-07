import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { exportToExcel } from "@/lib/excel";
import { toast } from "react-toastify";

import TaskAssignmentForm from "@/components/TaskAssignmentForm";
import TaskHistory from "@/components/TaskHistory";
import TaskDetailsDialog from "@/components/TaskDetailsDialog";
import TaskStatusBadge from "@/components/TaskStatusBadge";

export const Route = createFileRoute("/user/task-management")({
  component: Page,
});

type TaskStatus = "Pending" | "In Progress" | "Completed";


type Task = {
  _id: string;
  title: string;
  description: string;
  assignedByName: string;
  assignedToName: string;
  projectName?: string;
  status: TaskStatus;
  progress: number;
  remarks: string;
  dueDate: string;
  createdAt: string;
};

const mockTasks: Task[] = [
  {
    _id: "1",
    title: "Build Login API",
    description: "Implement authentication APIs",
    assignedByName: "Admin",
    assignedToName: "John Doe",
    projectName: "EMS",
    status: "In Progress",
    progress: 45,
    remarks: "JWT authentication completed.",
    dueDate: "2026-08-20",
    createdAt: "2026-08-01",
  },
  {
    _id: "2",
    title: "Employee Dashboard",
    description: "Create employee dashboard UI",
    assignedByName: "Admin",
    assignedToName: "John Doe",
    projectName: "EMS",
    status: "Pending",
    progress: 0,
    remarks: "",
    dueDate: "2026-08-25",
    createdAt: "2026-08-05",
  },
  {
    _id: "3",
    title: "Salary Module",
    description: "Connect salary APIs",
    assignedByName: "Manager",
    assignedToName: "John Doe",
    projectName: "Payroll",
    status: "Completed",
    progress: 100,
    remarks: "Completed and tested.",
    dueDate: "2026-08-10",
    createdAt: "2026-07-25",
  },
];

const mockEmployees = [
  {
    _id: "1",
    fullName: "John Doe",
  },
  {
    _id: "2",
    fullName: "Jane Smith",
  },
  {
    _id: "3",
    fullName: "Robert Brown",
  },
];
const mockProjects = [
  {
    _id: "1",
    projectName: "EMS",
  },
  {
    _id: "2",
    projectName: "Payroll",
  },
];

function Page() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<
    "All" | TaskStatus
  >("All");

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [status, setStatus] =
    useState<TaskStatus>("Pending");

  const [progress, setProgress] =
    useState(0);

  const [remarks, setRemarks] =
    useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);

      // Replace this with backend API later
      await new Promise((resolve) =>
        setTimeout(resolve, 600)
      );

      setTasks(mockTasks);
    } catch (err) {
      console.error(err);

      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = useMemo(() => {
    if (selectedStatus === "All")
      return tasks;

    return tasks.filter(
      (task) => task.status === selectedStatus
    );
  }, [tasks, selectedStatus]);

  function handleAssign(data: any) {
  const employee = mockEmployees.find(
    (e) => e._id === data.assignedTo
  );

  const project = mockProjects.find(
    (p) => p._id === data.projectId
  );

  const newTask: Task = {
    _id: Date.now().toString(),

    title: data.title,

    description: data.description,

    assignedByName: "Current Employee",

    assignedToName: employee?.fullName || "",

    projectName: project?.projectName,


    status: "Pending",

    progress: 0,

    remarks: "",

    dueDate: data.dueDate,

    createdAt: new Date().toISOString(),
  };

  setTasks((prev) => [newTask, ...prev]);

  toast.success("Task assigned");
}

  function exportXlsx() {
    if (filteredTasks.length === 0) {
      toast.warning("No tasks to export");
      return;
    }

    exportToExcel(
      filteredTasks.map((task) => ({
        Title: task.title,
        AssignedBy: task.assignedByName,
        Project: task.projectName,
        Status: task.status,
        Progress: task.progress + "%",
        DueDate: task.dueDate,
      })),
      "my-tasks.xlsx",
      "Tasks"
    );

    toast.success("Tasks exported");
  }

  function openUpdate(task: Task) {
    setEditingTask(task);

    setStatus(task.status);

    setProgress(task.progress);

    setRemarks(task.remarks);
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-lg font-medium text-gray-500">
          Loading tasks...
        </p>
      </div>
    );
  }
  return (
  <>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      {/* LEFT CARD */}

      <div className="card p-6">
        <TaskAssignmentForm
  employees={mockEmployees}
  projects={mockProjects}
  onAssign={handleAssign}
/>
      </div>

      {/* RIGHT CARD */}

      <div className="card p-6">

        <div className="toolbar mb-4">
          <select
            className="select"
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(
                e.target.value as "All" | TaskStatus
              )
            }
            style={{ width: 180 }}
          >
            <option value="All">All Tasks</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <span className="spacer" />

          <button
            className="btn btn-ghost"
            onClick={exportXlsx}
          >
            ⬇ Export
          </button>
        </div>

        <TaskHistory
          tasks={filteredTasks}
          onView={(task) => setSelectedTask(task)}
          onUpdate={(task) => openUpdate(task)}
        />

      </div>

    </div>

    {/* UPDATE DIALOG */}

    {editingTask && (
      <div
        className="modal-backdrop"
        onClick={() => setEditingTask(null)}
      >
        <div
          className="modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-head">
            <h2>Update Task</h2>

            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setEditingTask(null)}
            >
              ✕
            </button>
          </div>

          <div className="field">
            <label>Status</label>

            <select
              className="select"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as TaskStatus)
              }
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="field">
            <label>Progress (%)</label>

            <input
              className="input"
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) =>
                setProgress(Number(e.target.value))
              }
            />
          </div>

          <div className="field">
            <label>Remarks</label>

            <textarea
              className="textarea"
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
            />
          </div>

          <div className="modal-foot">
            <button
              className="btn btn-ghost"
              onClick={() => setEditingTask(null)}
            >
              Cancel
            </button>

            <button
              className="btn"
              onClick={() => {
                const updated = tasks.map((task) =>
                  task._id === editingTask._id
                    ? {
                        ...task,
                        status,
                        progress,
                        remarks,
                      }
                    : task
                );

                setTasks(updated);

                toast.success("Task updated");

                setEditingTask(null);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}

    <TaskDetailsDialog
      task={selectedTask}
      onClose={() => setSelectedTask(null)}
    />
  </>
);
}