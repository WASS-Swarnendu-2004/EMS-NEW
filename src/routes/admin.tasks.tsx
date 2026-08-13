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

  const getAssignees = (task: AdminTask): TaskAssignee[] => {
    return task.assignees || [];
  };

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
        return "bg-[#e1f0e3] text-[#25803a]";

      case "In Progress":
        return "bg-[#e4ddf2] text-[#68419a]";

      case "Pending":
      default:
        return "bg-[#ffe8d5] text-[#d97706]";
    }
  };

  const getProgressClass = (progress: number) => {
    if (progress === 100) {
      return "bg-[#43894d]";
    }

    if (progress > 0) {
      return "bg-[#8b5fbf]";
    }

    return "bg-[#d8d1df]";
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#211735]">
              Task History
            </h1>

            <p className="mt-1 text-sm text-[#777184]">
              View all tasks assigned from one employee to another
            </p>
          </div>

          <button
            onClick={fetchTasks}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#8b3fc7] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7735ad] disabled:cursor-not-allowed disabled:opacity-50"
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
      <div className="mb-6 rounded-xl border border-[#e6deec] bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#958aa0]" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search task, employee, project..."
              className="h-10 w-full rounded-lg border border-[#ddd5e4] bg-white pl-10 pr-4 text-sm text-[#33253e] outline-none transition placeholder:text-[#9a91a0] focus:border-[#b66bdd] focus:ring-2 focus:ring-[#ead7f7]"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-[#ddd5e4] bg-white px-3 text-sm text-[#33253e] outline-none focus:border-[#b66bdd] focus:ring-2 focus:ring-[#ead7f7]"
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
            className="h-10 rounded-lg border border-[#ddd5e4] bg-white px-3 text-sm text-[#33253e] outline-none focus:border-[#b66bdd] focus:ring-2 focus:ring-[#ead7f7]"
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

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-[#e5deea] bg-white shadow-sm">
        {/* Table Header */}
        <div className="border-b border-[#e5deea] bg-white px-5 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-[#211735]">
                All Task Assignments
              </h2>

              <p className="text-sm text-[#817889]">
                {filteredTasks.length} task
                {filteredTasks.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="rounded-full bg-[#eee4f4] px-3 py-1 text-xs font-semibold text-[#7137a0]">
              {filteredTasks.length} Records
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-[#786b82]">
              <Loader2 className="h-5 w-5 animate-spin text-[#914bc5]" />
              Loading task history...
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0e6f5]">
              <ListTodo className="h-6 w-6 text-[#9a5fc4]" />
            </div>

            <h3 className="font-medium text-[#2b2035]">
              No tasks found
            </h3>

            <p className="mt-1 text-sm text-[#817889]">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead>
                <tr className="bg-[#e0b5ff]">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-[#24103e]">
                    Task
                  </th>

                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-[#24103e]">
                    Project
                  </th>

                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-[#24103e]">
                    Assigned By
                  </th>

                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-[#24103e]">
                    Assigned To
                  </th>

                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-[#24103e]">
                    Due Date
                  </th>

                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-[#24103e]">
                    Status
                  </th>

                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-[#24103e]">
                    Progress
                  </th>

                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-[#24103e]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task, index) => {
                  const status = getTaskStatus(task);
                  const progress = getTaskProgress(task);
                  const assignees = getAssignees(task);

                  return (
                    <tr
                      key={task._id}
                      className={`border-b border-[#e7deeb] transition last:border-0 hover:bg-[#fbf7fd] ${
                        index % 2 === 0 ? "bg-white" : "bg-[#fcfafd]"
                      }`}
                    >
                      {/* Task */}
                      <td className="px-5 py-4 align-top">
                        <div className="max-w-[220px]">
                          <p
                            className="truncate text-sm font-semibold text-[#272033]"
                            title={task.title}
                          >
                            {task.title}
                          </p>

                          <p
                            className="mt-1 truncate text-xs text-[#817889]"
                            title={task.description}
                          >
                            {task.description || "No description"}
                          </p>

                          <p className="mt-1.5 text-xs text-[#a097a8]">
                            Created {formatDate(task.createdAt)}
                          </p>
                        </div>
                      </td>

                      {/* Project */}
                      <td className="px-5 py-4 align-top">
                        <span className="inline-flex rounded-full bg-[#eee2f5] px-3 py-1 text-xs font-semibold text-[#70359d]">
                          {task.project?.projectName || "No Project"}
                        </span>
                      </td>

                      {/* Assigned By */}
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center gap-2.5">
                          {task.assignedBy?.profileImage ? (
                            <img
                              src={task.assignedBy.profileImage}
                              alt={task.assignedBy.fullName}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0ebf4] text-[#725b80]">
                              <User className="h-4 w-4" />
                            </div>
                          )}

                          <div>
                            <p className="whitespace-nowrap text-sm font-semibold text-[#272033]">
                              {task.assignedBy?.fullName || "Unknown"}
                            </p>

                            <p className="text-xs text-[#817889]">
                              {task.assignedBy?.employeeId || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="px-5 py-4 align-top">
                        {assignees.length > 0 ? (
                          <div className="space-y-2">
                            {assignees.map((assignee) => (
                              <div
                                key={assignee._id}
                                className="flex items-center gap-2.5"
                              >
                                {assignee.employee?.profileImage ? (
                                  <img
                                    src={assignee.employee.profileImage}
                                    alt={assignee.employee.fullName}
                                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0ebf4] text-[#725b80]">
                                    <User className="h-3.5 w-3.5" />
                                  </div>
                                )}

                                <div>
                                  <p className="whitespace-nowrap text-sm font-semibold text-[#272033]">
                                    {assignee.employee?.fullName || "Unknown"}
                                  </p>

                                  <p className="text-xs text-[#817889]">
                                    {assignee.employee?.employeeId || "-"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-[#968c9d]">
                            <Users className="h-4 w-4" />
                            Employee ID: {task.assignedTo || "-"}
                          </div>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center gap-2 text-sm text-[#43384a]">
                          <CalendarDays className="h-4 w-4 text-[#967da4]" />
                          {formatDate(task.dueDate)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-4 align-top">
                        <div className="w-[130px]">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-[#8a7f91]">
                              Progress
                            </span>

                            <span className="text-xs font-semibold text-[#51465a]">
                              {progress}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-[#eee9f1]">
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
                      <td className="px-5 py-4 text-right align-top">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#eee1f5] px-3 py-2 text-sm font-semibold text-[#71379c] transition hover:bg-[#e4d3ee]"
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
    <div className="rounded-xl border border-[#e6deec] bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#817889]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#281b32]">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eee2f5] text-[#7b43a2]">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#21152a]/45 p-4 backdrop-blur-[2px]">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between bg-[#e0b5ff] px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#5d2c7e]">
              Task Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#281735]">
              {task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#654474] transition hover:bg-white/40 hover:text-[#351743]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-6 p-6">
          {/* Description */}
          <div>
            <p className="mb-2 text-sm font-semibold text-[#45374c]">
              Description
            </p>

            <div className="rounded-lg bg-[#faf7fc] p-4 text-sm leading-6 text-[#685d6d]">
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
              <p className="text-sm font-semibold text-[#45374c]">
                Overall Progress
              </p>

              <span className="text-sm font-semibold text-[#302538]">
                {progress}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-[#eee9f1]">
              <div
                className="h-full rounded-full bg-[#8b5fbf] transition-all"
                style={{
                  width: `${Math.min(Math.max(progress, 0), 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Assignees */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#826d8c]" />

              <p className="text-sm font-semibold text-[#45374c]">
                Assigned Employees
              </p>
            </div>

            {task.assignees && task.assignees.length > 0 ? (
              <div className="space-y-3">
                {task.assignees.map((assignee) => (
                  <div
                    key={assignee._id}
                    className="flex items-center justify-between rounded-xl border border-[#e7deeb] bg-[#fdfbfe] p-4"
                  >
                    <div className="flex items-center gap-3">
                      {assignee.employee?.profileImage ? (
                        <img
                          src={assignee.employee.profileImage}
                          alt={assignee.employee.fullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee6f2] text-[#765f80]">
                          <User className="h-5 w-5" />
                        </div>
                      )}

                      <div>
                        <p className="font-medium text-[#2b2033]">
                          {assignee.employee?.fullName || "Unknown"}
                        </p>

                        <p className="text-xs text-[#827686]">
                          {assignee.employee?.employeeId || "-"} •{" "}
                          {assignee.employee?.department || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          assignee.status === "Completed"
                            ? "bg-[#e1f0e3] text-[#25803a]"
                            : assignee.status === "In Progress"
                            ? "bg-[#e4ddf2] text-[#68419a]"
                            : "bg-[#ffe8d5] text-[#d97706]"
                        }`}
                      >
                        {assignee.status}
                      </span>

                      <p className="mt-1 text-xs text-[#85798a]">
                        {assignee.progress}% complete
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-[#faf7fc] p-4 text-sm text-[#75697b]">
                Legacy task. Assigned employee ID:{" "}
                {task.assignedTo || "-"}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-[#e8e0eb] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#8b3fc7] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7735ad]"
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
    <div className="rounded-lg border border-[#e7deeb] bg-[#fdfbfe] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[#9a8da0]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#322638]">
        {value}
      </p>
    </div>
  );
}