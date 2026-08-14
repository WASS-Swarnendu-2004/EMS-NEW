import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { getMyProjects, type Project } from "@/api/project";
import { getMyTasks, updateTaskProgress, type MyTask } from "@/api/task";

export const Route = createFileRoute("/user/projects")({
  component: Page,
});

function formatISTDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<MyTask[]>([]);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const [progressValues, setProgressValues] = useState<
    Record<string, number>
  >({});

  // =========================================
  // ACTIVE TAB
  // =========================================

  const [activeTab, setActiveTab] = useState<"projects" | "tasks">("projects");

  // =========================================
  // LOAD DATA
  // =========================================

  useEffect(() => {
    loadProjects();
    loadTasks();
  }, []);

  async function loadProjects() {
    try {
      setLoadingProjects(true);

      const data = await getMyProjects();

      setProjects(data);
    } catch (err) {
      console.error(err);

      toast.error("Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  }

  async function loadTasks() {
    try {
      setLoadingTasks(true);

      const data = await getMyTasks();

      setTasks(data);

      const initialProgress: Record<string, number> = {};

      data.forEach((task) => {
        initialProgress[task._id] = task.progress;
      });

      setProgressValues(initialProgress);
    } catch (err) {
      console.error(err);

      toast.error("Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  }

  // =========================================
  // TASK PROGRESS
  // =========================================

  function handleProgressChange(taskId: string, value: string) {
    const progress = Number(value);

    if (Number.isNaN(progress)) {
      return;
    }

    const limitedProgress = Math.min(100, Math.max(0, progress));

    setProgressValues((prev) => ({
      ...prev,
      [taskId]: limitedProgress,
    }));
  }

  async function handleUpdateProgress(taskId: string) {
    const progress = progressValues[taskId];

    if (progress === undefined) {
      return;
    }

    try {
      setUpdatingTaskId(taskId);

      const updatedTask = await updateTaskProgress(taskId, progress);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                progress: updatedTask.progress,
                status: updatedTask.status,
              }
            : task,
        ),
      );

      setProgressValues((prev) => ({
        ...prev,
        [taskId]: updatedTask.progress,
      }));

      toast.success("Task progress updated successfully");
    } catch (err) {
      console.error(err);

      toast.error("Failed to update task progress");
    } finally {
      setUpdatingTaskId(null);
    }
  }

  const loading = loadingProjects || loadingTasks;

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
          gap: "0.5rem",
        }}
      >
        <Loader2 size={20} className="animate-spin" />

        <span>Loading projects and tasks...</span>
      </div>
    );
  }

  return (
    <>
      {/* =========================================
          TABS
      ========================================= */}

      <div className="mb-5 flex gap-2">
        <button
          type="button"
          className={`btn ${
            activeTab === "projects" ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => setActiveTab("projects")}
        >
          <span>Assigned Projects</span>

          {projects.length > 0 && (
            <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
              {projects.length}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`btn ${
            activeTab === "tasks" ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => setActiveTab("tasks")}
        >
          <span>My Assigned Tasks</span>

          {tasks.length > 0 && (
            <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
              {tasks.length}
            </span>
          )}
        </button>
      </div>

      {/* =========================================
          PROJECTS TAB
      ========================================= */}

      {activeTab === "projects" && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2>Assigned Projects</h2>
          </div>

          {projects.length === 0 ? (
            <div className="muted">No projects assigned to you yet.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "1rem",
              }}
            >
              {projects.map((p) => (
                <div
                  key={p._id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "1rem",
                  }}
                >
                  {/* Project Header */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "1rem",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>{p.projectName}</h3>
                  </div>

                  {/* Consumer */}

                  <p
                    className="muted"
                    style={{
                      fontSize: ".82rem",
                      marginTop: ".5rem",
                    }}
                  >
                    {p.consumerName}
                  </p>

                  {/* Description */}

                  <p
                    style={{
                      fontSize: ".88rem",
                    }}
                  >
                    {p.description}
                  </p>

                  {/* Project Information */}

                  <div
                    className="muted"
                    style={{
                      fontSize: ".8rem",
                      lineHeight: 1.8,
                    }}
                  >
                    <div>
                      {formatISTDate(p.startDate)} →{" "}
                      {formatISTDate(p.endDate)}
                    </div>

                    <div>{p.duration} days</div>

                    <div>{p.assignedEmployees.length} assigned</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =========================================
          TASKS TAB
      ========================================= */}

      {activeTab === "tasks" && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2>My Assigned Tasks</h2>
          </div>

          {tasks.length === 0 ? (
            <div className="muted">No tasks assigned to you yet.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "1rem",
              }}
            >
              {tasks.map((task) => {
                const currentProgress =
                  progressValues[task._id] ?? task.progress;

                const isUpdating = updatingTaskId === task._id;

                return (
                  <div
                    key={task._id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      padding: "1rem",
                    }}
                  >
                    {/* Task Header */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                          }}
                        >
                          {task.title}
                        </h3>

                        {task.project && (
                          <p
                            className="muted"
                            style={{
                              margin: ".35rem 0 0",
                              fontSize: ".82rem",
                            }}
                          >
                            Project: {task.project.projectName}
                          </p>
                        )}
                      </div>

                      <span
                        style={{
                          fontSize: ".75rem",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "6px",
                          background: "#f1f1f1",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.status.replace("-", " ")}
                      </span>
                    </div>

                    {/* Description */}

                    <p
                      style={{
                        fontSize: ".88rem",
                        marginTop: ".75rem",
                      }}
                    >
                      {task.description}
                    </p>

                    {/* Task Information */}

                    <div
                      className="muted"
                      style={{
                        fontSize: ".8rem",
                        lineHeight: 1.8,
                      }}
                    >
                      <div>
                        Assigned by: {task.assignedBy.fullName}
                      </div>

                      <div>
                        Employee ID: {task.assignedBy.employeeId}
                      </div>

                      <div>
                        Due date:{" "}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Progress */}

                    <div
                      style={{
                        marginTop: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: ".4rem",
                          fontSize: ".82rem",
                        }}
                      >
                        <span>Progress</span>

                        <strong>{currentProgress}%</strong>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: "8px",
                          background: "#e5e5e5",
                          borderRadius: "999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${currentProgress}%`,
                            height: "100%",
                            background: "#2563eb",
                            transition: "width 0.2s ease",
                          }}
                        />
                      </div>
                    </div>

                    {/* Progress Input + Update */}

                    <div
                      style={{
                        display: "flex",
                        gap: ".75rem",
                        alignItems: "center",
                        marginTop: "1rem",
                      }}
                    >
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={currentProgress}
                        onChange={(e) =>
                          handleProgressChange(
                            task._id,
                            e.target.value,
                          )
                        }
                        disabled={isUpdating}
                        style={{
                          width: "90px",
                          padding: ".5rem",
                          border: "1px solid #ccc",
                          borderRadius: "6px",
                        }}
                      />

                      <span>%</span>

                      <button
                        type="button"
                        className="btn"
                        onClick={() =>
                          handleUpdateProgress(task._id)
                        }
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                            Updating...
                          </>
                        ) : (
                          "Update Progress"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </>
  );
}