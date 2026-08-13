import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  ListTodo,
  Loader2,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getAdminTasks,
  type AdminTask,
  type TaskAssignee,
} from "@/api/adminTask";

import {
  getTaskEmployees,
  type TaskEmployee,
} from "@/api/employee";

export const Route = createFileRoute("/admin/tasks")({
  component: AdminTasks,
});

function AdminTasks() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");

  const [selectedTask, setSelectedTask] = useState<AdminTask | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await getAdminTasks();

      if (response.success) {
        setTasks(response.tasks || []);
      } else {
        toast.error("Failed to load task history");
      }
    } catch (error) {
      console.error("Fetch Admin Tasks Error:", error);
      toast.error("Failed to load task history");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Get all assignees.
   *
   * New API:
   * task.assignees contains employee information.
   *
   * Old API:
   * task.assignees is empty and only assignedTo exists.
   */
  const getAssignees = (task: AdminTask): TaskAssignee[] => {
    return task.assignees || [];
  };

  /*
   * Get status.
   *
   * New API:
   * status comes from assignees.
   *
   * Old API:
   * status exists directly on task.
   */
  const getTaskStatus = (task: AdminTask): string => {
    if (task.assignees && task.assignees.length > 0) {
      const statuses = task.assignees.map((assignee) => assignee.status);

      if (statuses.includes("In Progress")) {
        return "In Progress";
      }

      if (statuses.includes("Pending")) {
        return "Pending";
      }

      if (statuses.every((status) => status === "Completed")) {
        return "Completed";
      }

      return statuses[0] || "Pending";
    }

    return task.status || "Pending";
  };

  /*
   * Get progress.
   *
   * For multiple assignees we calculate average progress.
   */
  const getTaskProgress = (task: AdminTask): number => {
    if (task.assignees && task.assignees.length > 0) {
      const totalProgress = task.assignees.reduce(
        (sum, assignee) => sum + (assignee.progress || 0),
        0
      );

      return Math.round(totalProgress / task.assignees.length);
    }

    return task.progress || 0;
  };

  const projects = useMemo(() => {
    const projectNames = tasks
      .map((task) => task.project?.projectName)
      .filter(Boolean) as string[];

    return Array.from(new Set(projectNames));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const status = getTaskStatus(task);

      const assigneeNames =
        task.assignees
          ?.map((assignee) => assignee.employee?.fullName)
          .join(" ") || "";

      const assigneeIds =
        task.assignees
          ?.map((assignee) => assignee.employee?.employeeId)
          .join(" ") || "";

      const searchableText = [
        task.title,
        task.description,
        task.project?.projectName,
        task.assignedBy?.fullName,
        task.assignedBy?.employeeId,
        assigneeNames,
        assigneeIds,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      const matchesProject =
        projectFilter === "All" ||
        task.project?.projectName === projectFilter;

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [tasks, search, statusFilter, projectFilter]);

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => getTaskStatus(task) === "Pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => getTaskStatus(task) === "In Progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => getTaskStatus(task) === "Completed"
  ).length;

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";

      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getProgressClass = (progress: number) => {
    if (progress === 100) {
      return "bg-green-500";
    }

    if (progress > 0) {
      return "bg-blue-500";
    }

    return "bg-gray-300";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Task History
            </h1>

            <p className="text-sm text-gray-500">
              View all tasks assigned from one employee to another
            </p>
          </div>

          <button
            onClick={fetchTasks}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ListTodo className="h-4 w-4" />
            )}

            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Tasks"
          value={totalTasks}
          icon={<ListTodo className="h-5 w-5" />}
        />

        <SummaryCard
          title="Pending"
          value={pendingTasks}
          icon={<Clock className="h-5 w-5" />}
        />

        <SummaryCard
          title="In Progress"
          value={inProgressTasks}
          icon={<Loader2 className="h-5 w-5" />}
        />

        <SummaryCard
          title="Completed"
          value={completedTasks}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search task, employee, project..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Project */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Projects</option>

            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                All Task Assignments
              </h2>

              <p className="text-sm text-gray-500">
                {filteredTasks.length} task
                {filteredTasks.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading task history...
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">
            <ListTodo className="mb-3 h-10 w-10 text-gray-300" />

            <h3 className="font-medium text-gray-900">
              No tasks found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Task
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Project
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Assigned By
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Assigned To
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Due Date
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Progress
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => {
                  const status = getTaskStatus(task);
                  const progress = getTaskProgress(task);
                  const assignees = getAssignees(task);

                  return (
                    <tr
                      key={task._id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      {/* Task */}
                      <td className="px-5 py-4">
                        <div className="max-w-[220px]">
                          <p
                            className="truncate font-medium text-gray-900"
                            title={task.title}
                          >
                            {task.title}
                          </p>

                          <p
                            className="mt-1 truncate text-xs text-gray-500"
                            title={task.description}
                          >
                            {task.description || "No description"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Created {formatDate(task.createdAt)}
                          </p>
                        </div>
                      </td>

                      {/* Project */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700">
                          {task.project?.projectName || "No Project"}
                        </span>
                      </td>

                      {/* Assigned By */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {task.assignedBy?.profileImage ? (
                            <img
                              src={task.assignedBy.profileImage}
                              alt={task.assignedBy.fullName}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {task.assignedBy?.fullName || "Unknown"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {task.assignedBy?.employeeId || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="px-5 py-4">
                        {assignees.length > 0 ? (
                          <div className="space-y-2">
                            {assignees.map((assignee) => (
                              <div
                                key={assignee._id}
                                className="flex items-center gap-2"
                              >
                                {assignee.employee?.profileImage ? (
                                  <img
                                    src={assignee.employee.profileImage}
                                    alt={assignee.employee.fullName}
                                    className="h-7 w-7 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                                    <User className="h-3.5 w-3.5 text-gray-500" />
                                  </div>
                                )}

                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {assignee.employee?.fullName || "Unknown"}
                                  </p>

                                  <p className="text-xs text-gray-500">
                                    {assignee.employee?.employeeId || "-"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users className="h-4 w-4" />
                            Employee ID: {task.assignedTo || "-"}
                          </div>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          {formatDate(task.dueDate)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-4">
                        <div className="w-[130px]">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Progress
                            </span>

                            <span className="text-xs font-medium text-gray-700">
                              {progress}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full transition-all ${getProgressClass(
                                progress
                              )}`}
                              style={{
                                width: `${Math.min(
                                  Math.max(progress, 0),
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          getTaskStatus={getTaskStatus}
          getTaskProgress={getTaskProgress}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary Card                                                               */
/* -------------------------------------------------------------------------- */

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function SummaryCard({
  title,
  value,
  icon,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Task Details Modal                                                         */
/* -------------------------------------------------------------------------- */

interface TaskDetailsModalProps {
  task: AdminTask;
  onClose: () => void;
  getTaskStatus: (task: AdminTask) => string;
  getTaskProgress: (task: AdminTask) => number;
  formatDate: (date: string) => string;
}

function TaskDetailsModal({
  task,
  onClose,
  getTaskStatus,
  getTaskProgress,
  formatDate,
}: TaskDetailsModalProps) {
  const status = getTaskStatus(task);
  const progress = getTaskProgress(task);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Task Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-6 p-6">
          {/* Description */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Description
            </p>

            <div className="rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-600">
              {task.description || "No description provided."}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem
              label="Project"
              value={task.project?.projectName || "No Project"}
            />

            <DetailItem
              label="Due Date"
              value={formatDate(task.dueDate)}
            />

            <DetailItem
              label="Created Date"
              value={formatDate(task.createdAt)}
            />

            <DetailItem
              label="Last Updated"
              value={formatDate(task.updatedAt)}
            />

            <DetailItem
              label="Assigned By"
              value={`${task.assignedBy?.fullName || "Unknown"} (${
                task.assignedBy?.employeeId || "-"
              })`}
            />

            <DetailItem
              label="Overall Status"
              value={status}
            />
          </div>

          {/* Progress */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                Overall Progress
              </p>

              <span className="text-sm font-semibold text-gray-900">
                {progress}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${Math.min(Math.max(progress, 0), 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Assignees */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />

              <p className="text-sm font-semibold text-gray-700">
                Assigned Employees
              </p>
            </div>

            {task.assignees && task.assignees.length > 0 ? (
              <div className="space-y-3">
                {task.assignees.map((assignee) => (
                  <div
                    key={assignee._id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      {assignee.employee?.profileImage ? (
                        <img
                          src={assignee.employee.profileImage}
                          alt={assignee.employee.fullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      )}

                      <div>
                        <p className="font-medium text-gray-900">
                          {assignee.employee?.fullName || "Unknown"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {assignee.employee?.employeeId || "-"} •{" "}
                          {assignee.employee?.department || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          assignee.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : assignee.status === "In Progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {assignee.status}
                      </span>

                      <p className="mt-1 text-xs text-gray-500">
                        {assignee.progress}% complete
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                Legacy task. Assigned employee ID:{" "}
                {task.assignedTo || "-"}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Detail Item                                                                */
/* -------------------------------------------------------------------------- */

interface DetailItemProps {
  label: string;
  value: string;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}
