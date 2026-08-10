import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { exportToExcel } from "@/lib/excel";
import { toast } from "react-toastify";

import TaskHistory from "@/components/TaskHistory";
import TaskDetailsDialog from "@/components/TaskDetailsDialog";
import TaskStatusBadge from "@/components/TaskStatusBadge";
import { getTaskEmployees, type TaskEmployee } from "@/api/employee";

import { getMyProjects, type Project } from "@/api/project";

import TaskAssignmentForm, { type TaskFormData } from "@/components/TaskAssignmentForm";
import { createTask, getMyCreatedTasks, type CreatedTask } from "@/api/task";

type TaskStatus = "Pending" | "In Progress" | "Completed";

export const Route = createFileRoute("/user/task-management")({
  component: Page,
});

function Page() {
  const [tasks, setTasks] = useState<CreatedTask[]>([]);

  const [employees, setEmployees] = useState<TaskEmployee[]>([]);

  const [projects, setProjects] = useState<Project[]>([]);

  const [dataLoading, setDataLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<"All" | TaskStatus>("All");

  const [selectedTask, setSelectedTask] = useState<CreatedTask | null>(null);

  const [editingTask, setEditingTask] = useState<CreatedTask | null>(null);

  const [status, setStatus] = useState<TaskStatus>("Pending");

  const [progress, setProgress] = useState(0);

  const [remarks, setRemarks] = useState("");

  const storedUser = localStorage.getItem("user");

  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const currentEmployeeId =
    currentUser?.employeeId || currentUser?.userId || currentUser?._id || currentUser?.id;

  const availableEmployees = employees;

  useEffect(() => {
    loadTasks();
    loadEmployeesAndProjects();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);

      const taskResponse = await getMyCreatedTasks();

      console.log("MY CREATED TASKS:", taskResponse);

      setTasks(taskResponse);
    } catch (error) {
      console.error("Get My Created Tasks Error:", error);

      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployeesAndProjects() {
    try {
      setDataLoading(true);

      const [employeeResponse, projectResponse] = await Promise.all([
        getTaskEmployees(),
        getMyProjects(),
      ]);

      console.log("TASK EMPLOYEES:", employeeResponse);
      console.log("MY PROJECTS:", projectResponse);

      setEmployees(employeeResponse);
      setProjects(projectResponse);
    } catch (error) {
      console.error("Employee/Project API Error:", error);

      toast.error("Failed to load employees or projects");
    } finally {
      setDataLoading(false);
    }
  }

  const filteredTasks = useMemo(() => {
    if (selectedStatus === "All") {
      return tasks;
    }

    return tasks.filter((task) => {
      // New multi-assignee task
      if (task.assignees?.length > 0) {
        return task.assignees.some((assignee) => assignee.status === selectedStatus);
      }

      // Old single-assignee task
      return task.status === selectedStatus;
    });
  }, [tasks, selectedStatus]);

  async function handleAssign(data: TaskFormData) {
    try {
      const payload = {
        ...(data.projectId ? { projectId: data.projectId } : {}),
        assignedTo: data.assignedTo,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
      };

      console.log("CREATE TASK PAYLOAD:", payload);

      const response = await createTask(payload);

      console.log("CREATE TASK RESPONSE:", response);

      toast.success("Task assigned successfully");

      await loadTasks();
    } catch (error) {
      console.error("Create Task Error:", error);

      toast.error("Failed to assign task");
    }
  }

  function exportXlsx() {
    if (filteredTasks.length === 0) {
      toast.warning("No tasks to export");
      return;
    }

    exportToExcel(
      filteredTasks.map((task) => ({
        Title: task.title,

        Project: task.project?.projectName || "",

        AssignedTo: task.assignees?.map((assignee) => assignee.employee.fullName).join(", ") || "",

        Status:
          task.assignees
            ?.map((assignee) => `${assignee.employee.fullName}: ${assignee.status}`)
            .join(", ") ||
          task.status ||
          "",

        Progress:
          task.assignees
            ?.map((assignee) => `${assignee.employee.fullName}: ${assignee.progress}%`)
            .join(", ") || `${task.progress ?? 0}%`,

        DueDate: task.dueDate,
      })),
      "my-tasks.xlsx",
      "Tasks",
    );

    toast.success("Tasks exported");
  }

  function openUpdate(task: CreatedTask) {
    setEditingTask(task);

    const firstAssignee = task.assignees?.[0];

    setStatus(firstAssignee?.status || task.status || "Pending");

    setProgress(firstAssignee?.progress ?? task.progress ?? 0);

    setRemarks("");
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-lg font-medium text-gray-500">Loading tasks...</p>
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT CARD */}

        <div className="card p-6">
          <TaskAssignmentForm
            employees={availableEmployees}
            projects={projects}
            onAssign={handleAssign}
            loading={dataLoading}
          />
        </div>

        {/* RIGHT CARD */}

        <div className="card p-6">
          <div className="toolbar mb-4">
            <select
              className="select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as "All" | TaskStatus)}
              style={{ width: 180 }}
            >
              <option value="All">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <span className="spacer" />

            <button className="btn btn-ghost" onClick={exportXlsx}>
              ⬇ Export
            </button>
          </div>

          <TaskHistory
            tasks={filteredTasks}
            employees={employees}
            onView={(task) => setSelectedTask(task)}
            onUpdate={(task) => openUpdate(task)}
          />
        </div>
      </div>

      {/* UPDATE DIALOG */}

      {editingTask && (
        <div className="modal-backdrop" onClick={() => setEditingTask(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Update Task</h2>

              <button className="btn btn-sm btn-ghost" onClick={() => setEditingTask(null)}>
                ✕
              </button>
            </div>

            <div className="field">
              <label>Status</label>

              <select
                className="select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
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
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label>Remarks</label>

              <textarea
                className="textarea"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setEditingTask(null)}>
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
                      : task,
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

      <TaskDetailsDialog task={selectedTask} onClose={() => setSelectedTask(null)} />
    </>
  );
}
