import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getAdminDashboard,
  type DashboardCards,
  type RecentWorkStatus,
} from "@/api/adminDashboard";
import {
  createHolidays,
  deleteHoliday,
  getHolidays,
  type Holiday,
} from "@/api/holiday";
import {
  CalendarDays,
  Loader2,
  Plus,
  Trash2,
  X,
  ClipboardList,
} from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

type DashboardTab = "work-status" | "holidays";

function Dashboard() {
  const [cards, setCards] =
    useState<DashboardCards | null>(null);

  const [recentWorkStatus, setRecentWorkStatus] =
    useState<RecentWorkStatus[]>([]);

  const [holidays, setHolidays] =
    useState<Holiday[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* =========================================================
     ACTIVE TAB
  ========================================================= */

  const [activeTab, setActiveTab] =
    useState<DashboardTab>("work-status");

  /* =========================================================
     HOLIDAY MODAL
  ========================================================= */

  const [holidayModalOpen, setHolidayModalOpen] =
    useState(false);

  const [holidayType, setHolidayType] =
    useState<"single" | "range">("single");

  const [holidayDate, setHolidayDate] =
    useState("");

  const [holidayStartDate, setHolidayStartDate] =
    useState("");

  const [holidayEndDate, setHolidayEndDate] =
    useState("");

  const [holidayReason, setHolidayReason] =
    useState("");

  const [publishingHoliday, setPublishingHoliday] =
    useState(false);

  /* =========================================================
     DELETE HOLIDAY
  ========================================================= */

  const [deletingHolidayId, setDeletingHolidayId] =
    useState<string | null>(null);

  const [holidayToDelete, setHolidayToDelete] =
    useState<Holiday | null>(null);

  /* =========================================================
     GET TODAY'S DATE
     Returns YYYY-MM-DD using local browser date
  ========================================================= */

  function getTodayDate() {
    const today = new Date();

    const year =
      today.getFullYear();

    const month = String(
      today.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
      today.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [
          dashboardData,
          holidayData,
        ] = await Promise.all([
          getAdminDashboard(),
          getHolidays(),
        ]);

        setCards(dashboardData.cards);

        setRecentWorkStatus(
          dashboardData.recentWorkStatus || [],
        );

        setHolidays(
          holidayData.holidays || [],
        );
      } catch (err: any) {
        console.error(err);

        toast.error(
          err.response?.data?.message ||
            "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  /* =========================================================
     FORMAT HOLIDAY DATE
  ========================================================= */

  function formatHolidayDate(
    dateString: string,
  ) {
    const datePart =
      dateString.split("T")[0];

    const [
      year,
      month,
      day,
    ] = datePart
      .split("-")
      .map(Number);

    const date = new Date(
      year,
      month - 1,
      day,
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  }

  /* =========================================================
     GENERATE DATE RANGE
  ========================================================= */

  function generateDateRange(
    startDate: string,
    endDate: string,
  ): string[] {
    const dates: string[] = [];

    const start = new Date(
      `${startDate}T00:00:00`,
    );

    const end = new Date(
      `${endDate}T00:00:00`,
    );

    const current =
      new Date(start);

    while (current <= end) {
      const year =
        current.getFullYear();

      const month = String(
        current.getMonth() + 1,
      ).padStart(2, "0");

      const day = String(
        current.getDate(),
      ).padStart(2, "0");

      dates.push(
        `${year}-${month}-${day}`,
      );

      current.setDate(
        current.getDate() + 1,
      );
    }

    return dates;
  }

  /* =========================================================
     OPEN HOLIDAY MODAL
  ========================================================= */

  function openHolidayModal() {
    setHolidayType("single");

    setHolidayDate("");

    setHolidayStartDate("");

    setHolidayEndDate("");

    setHolidayReason("");

    setHolidayModalOpen(true);
  }

  /* =========================================================
     CLOSE HOLIDAY MODAL
  ========================================================= */

  function closeHolidayModal() {
    if (publishingHoliday) {
      return;
    }

    setHolidayModalOpen(false);

    setHolidayType("single");

    setHolidayDate("");

    setHolidayStartDate("");

    setHolidayEndDate("");

    setHolidayReason("");
  }

  /* =========================================================
     PUBLISH HOLIDAY
  ========================================================= */

  async function handlePublishHoliday() {
    const trimmedReason =
      holidayReason.trim();

    if (!trimmedReason) {
      toast.error(
        "Please enter a holiday reason.",
      );

      return;
    }

    const today =
      getTodayDate();

    let dates: string[] = [];

    /* =====================================================
       SINGLE DATE
    ===================================================== */

    if (
      holidayType === "single"
    ) {
      if (!holidayDate) {
        toast.error(
          "Please select a holiday date.",
        );

        return;
      }

      if (holidayDate < today) {
        toast.error(
          "Previous dates cannot be selected as holidays.",
        );

        return;
      }

      dates = [holidayDate];
    }

    /* =====================================================
       DATE RANGE
    ===================================================== */

    if (
      holidayType === "range"
    ) {
      if (
        !holidayStartDate ||
        !holidayEndDate
      ) {
        toast.error(
          "Please select both start date and end date.",
        );

        return;
      }

      if (
        holidayStartDate < today
      ) {
        toast.error(
          "Start date cannot be a previous date.",
        );

        return;
      }

      if (
        holidayEndDate < today
      ) {
        toast.error(
          "End date cannot be a previous date.",
        );

        return;
      }

      if (
        holidayStartDate >
        holidayEndDate
      ) {
        toast.error(
          "End date cannot be before start date.",
        );

        return;
      }

      dates =
        generateDateRange(
          holidayStartDate,
          holidayEndDate,
        );
    }

    if (dates.length === 0) {
      toast.error(
        "Please select at least one date.",
      );

      return;
    }

    try {
      setPublishingHoliday(true);

      const response =
        await createHolidays(
          dates,
          trimmedReason,
        );

      toast.success(
        response.message ||
          "Holiday announced successfully",
      );

      /* Refresh holiday list */

      const holidayData =
        await getHolidays();

      setHolidays(
        holidayData.holidays || [],
      );

      closeHolidayModal();

      /* Automatically show holiday tab */

      setActiveTab("holidays");
    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to announce holiday",
      );
    } finally {
      setPublishingHoliday(false);
    }
  }

  /* =========================================================
     OPEN DELETE CONFIRMATION
  ========================================================= */

  function openDeleteHolidayModal(
    holiday: Holiday,
  ) {
    if (deletingHolidayId) {
      return;
    }

    setHolidayToDelete(holiday);
  }

  /* =========================================================
     CLOSE DELETE CONFIRMATION
  ========================================================= */

  function closeDeleteHolidayModal() {
    if (deletingHolidayId) {
      return;
    }

    setHolidayToDelete(null);
  }

  /* =========================================================
     DELETE HOLIDAY
  ========================================================= */

  async function handleDeleteHoliday() {
    if (!holidayToDelete) {
      return;
    }

    const id =
      holidayToDelete._id;

    try {
      setDeletingHolidayId(id);

      const response =
        await deleteHoliday(id);

      toast.success(
        response.message ||
          "Holiday deleted successfully",
      );

      setHolidays((current) =>
        current.filter(
          (holiday) =>
            holiday._id !== id,
        ),
      );

      setHolidayToDelete(null);
    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to delete holiday",
      );
    } finally {
      setDeletingHolidayId(null);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-lg font-medium text-gray-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  /* =========================================================
     DASHBOARD
  ========================================================= */

  return (
    <>
      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="kpi min-w-0">
          <div className="kpi-label">
            Employees
          </div>

          <div className="kpi-value">
            {cards?.totalEmployees ?? 0}
          </div>

          <div className="kpi-foot">
            Active workforce
          </div>
        </div>

        <div className="kpi min-w-0">
          <div className="kpi-label">
            Active Projects
          </div>

          <div className="kpi-value">
            {cards?.activeProjects ?? 0}
          </div>

          <div className="kpi-foot">
            {cards?.activeProjects ?? 0} Active
          </div>
        </div>

        <div className="kpi gold min-w-0">
          <div className="kpi-label">
            Present Today
          </div>

          <div className="kpi-value">
            {cards?.presentToday ?? 0}
          </div>

          <div className="kpi-foot">
            Of {cards?.totalEmployees ?? 0}
          </div>
        </div>

        <div className="kpi min-w-0">
          <div className="kpi-label">
            Pending Approvals
          </div>

          <div className="kpi-value">
            {cards?.pendingApprovals ?? 0}
          </div>

          <div className="kpi-foot">
            {cards?.pendingLeave ?? 0} leave ·{" "}
            {cards?.pendingWFH ?? 0} WFH
          </div>
        </div>
      </div>

      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}

      <div className="card mt-6 overflow-hidden">
        <div className="card-header">
          <h2>Quick actions</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Link
            to="/admin/employees"
            className="btn w-full"
          >
            Manage employees
          </Link>

          <Link
            to="/admin/projects"
            className="btn btn-ghost w-full"
          >
            Manage projects
          </Link>

          <Link
            to="/admin/leaves"
            className="btn btn-ghost w-full"
          >
            Leave requests (
            {cards?.pendingLeave ?? 0})
          </Link>

          <Link
            to="/admin/wfh"
            className="btn btn-ghost w-full"
          >
            WFH requests (
            {cards?.pendingWFH ?? 0})
          </Link>

          <Link
            to="/admin/salary"
            className="btn btn-gold w-full"
          >
            Generate salary
          </Link>

          <button
            type="button"
            onClick={
              openHolidayModal
            }
            className="btn btn-ghost flex w-full items-center justify-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />

            Holiday Announcement
          </button>
        </div>
      </div>

      {/* =====================================================
          TABLE SECTION
      ====================================================== */}

      <div className="card mt-6 min-w-0 overflow-hidden">
        {/* TAB HEADER */}

        <div className="border-b border-gray-200">
          <div className="flex w-full flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex w-full overflow-x-auto sm:w-auto">
              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "work-status",
                  )
                }
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  activeTab ===
                  "work-status"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <ClipboardList className="h-4 w-4" />

                Daily Work Status
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "holidays",
                  )
                }
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  activeTab ===
                  "holidays"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <CalendarDays className="h-4 w-4" />

                Holiday List

                {holidays.length >
                  0 && (
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                    {holidays.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab ===
              "holidays" && (
              <button
                type="button"
                onClick={
                  openHolidayModal
                }
                className="btn btn-gold mb-3 flex shrink-0 items-center justify-center gap-2 sm:mb-0"
              >
                <Plus className="h-4 w-4" />

                Add Holiday
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            DAILY WORK STATUS TAB
        ==================================================== */}

        {activeTab ===
          "work-status" && (
          <div className="min-w-0 p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent daily work status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Recent employee daily work reports
              </p>
            </div>

            <div className="relative h-[420px] w-full max-w-full overflow-auto rounded-xl border border-gray-200">
              <table className="min-w-[850px] w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-white shadow-sm">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Employee
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Plan
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentWorkStatus.map(
                    (w) => (
                      <tr
                        key={w._id}
                        className="border-t border-gray-100"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {new Date(
                            w.workDate,
                          ).toLocaleDateString()}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800">
                          {w.employee
                            .fullName}
                        </td>

                        <td className="max-w-[350px] px-4 py-3 text-sm text-gray-600">
                          <div className="truncate">
                            {w.plan}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {w.endOfDayStatus}
                        </td>
                      </tr>
                    ),
                  )}

                  {recentWorkStatus.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-16 text-center text-sm text-gray-500"
                      >
                        No reports yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================
            HOLIDAY TAB
        ==================================================== */}

        {activeTab ===
          "holidays" && (
          <div className="min-w-0 p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Holiday List
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Company holidays announced to employees
              </p>
            </div>

            <div className="relative h-[420px] w-full max-w-full overflow-auto rounded-xl border border-gray-200">
              <table className="min-w-[700px] w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-white shadow-sm">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>

                    <th className="min-w-[350px] px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Reason
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {holidays.map(
                    (holiday) => (
                      <tr
                        key={
                          holiday._id
                        }
                        className="border-t border-gray-100"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {formatHolidayDate(
                            holiday.date,
                          )}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="max-w-[500px]">
                            {holiday.reason}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              openDeleteHolidayModal(
                                holiday,
                              )
                            }
                            disabled={
                              deletingHolidayId ===
                              holiday._id
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete holiday"
                          >
                            {deletingHolidayId ===
                            holiday._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ),
                  )}

                  {holidays.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-16 text-center"
                      >
                        <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                        <p className="text-sm font-medium text-gray-500">
                          No holidays announced
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Click "Add Holiday" to announce one.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          HOLIDAY ANNOUNCEMENT MODAL
      ====================================================== */}

      {holidayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}

            <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                  <CalendarDays className="h-5 w-5 text-yellow-600" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-gray-900">
                    Holiday Announcement
                  </h2>

                  <p className="text-sm text-gray-500">
                    Announce a company holiday
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  closeHolidayModal
                }
                disabled={
                  publishingHoliday
                }
                className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}

            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
              {/* Holiday Type */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Holiday Type
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setHolidayType(
                        "single",
                      )
                    }
                    disabled={
                      publishingHoliday
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      holidayType ===
                      "single"
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Single Date
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setHolidayType(
                        "range",
                      )
                    }
                    disabled={
                      publishingHoliday
                    }
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      holidayType ===
                      "range"
                        ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Date Range
                  </button>
                </div>
              </div>

              {/* Single Date */}

              {holidayType ===
                "single" && (
                <div>
                  <label
                    htmlFor="holiday-date"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Holiday Date
                  </label>

                  <input
                    id="holiday-date"
                    type="date"
                    min={getTodayDate()}
                    value={
                      holidayDate
                    }
                    onChange={(e) =>
                      setHolidayDate(
                        e.target.value,
                      )
                    }
                    disabled={
                      publishingHoliday
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 disabled:bg-gray-100"
                  />
                </div>
              )}

              {/* Date Range */}

              {holidayType ===
                "range" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Start Date */}

                  <div>
                    <label
                      htmlFor="holiday-start-date"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Start Date
                    </label>

                    <input
                      id="holiday-start-date"
                      type="date"
                      min={getTodayDate()}
                      value={
                        holidayStartDate
                      }
                      onChange={(e) =>
                        setHolidayStartDate(
                          e.target.value,
                        )
                      }
                      disabled={
                        publishingHoliday
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 disabled:bg-gray-100"
                    />
                  </div>

                  {/* End Date */}

                  <div>
                    <label
                      htmlFor="holiday-end-date"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      End Date
                    </label>

                    <input
                      id="holiday-end-date"
                      type="date"
                      min={
                        holidayStartDate ||
                        getTodayDate()
                      }
                      value={
                        holidayEndDate
                      }
                      onChange={(e) =>
                        setHolidayEndDate(
                          e.target.value,
                        )
                      }
                      disabled={
                        publishingHoliday
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Reason */}

              <div>
                <label
                  htmlFor="holiday-reason"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Holiday Reason
                </label>

                <textarea
                  id="holiday-reason"
                  value={
                    holidayReason
                  }
                  onChange={(e) =>
                    setHolidayReason(
                      e.target.value,
                    )
                  }
                  placeholder="e.g. Durga Puja Holiday"
                  rows={3}
                  disabled={
                    publishingHoliday
                  }
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 disabled:bg-gray-100"
                />
              </div>

              {/* Information */}

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />

                  <div className="min-w-0 text-sm text-yellow-800">
                    {holidayType ===
                    "single" ? (
                      <p>
                        Employees will see
                        this holiday
                        announcement for
                        the selected date.
                      </p>
                    ) : (
                      <p>
                        Every date between
                        the start and end
                        date will be announced
                        as a holiday.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="flex flex-col-reverse gap-3 border-t bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={
                  closeHolidayModal
                }
                disabled={
                  publishingHoliday
                }
                className="btn btn-ghost w-full sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handlePublishHoliday
                }
                disabled={
                  publishingHoliday
                }
                className="btn btn-gold flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                {publishingHoliday && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {publishingHoliday
                  ? "Publishing..."
                  : "Publish Holiday"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE HOLIDAY CONFIRMATION MODAL
      ====================================================== */}

      {holidayToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!deletingHolidayId) {
              setHolidayToDelete(null);
            }
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Modal Header */}

            <div className="flex items-start gap-4 px-6 pt-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Delete Holiday
                </h2>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Are you sure you want to
                  delete this holiday
                  announcement?
                </p>
              </div>
            </div>

            {/* Holiday Information */}

            <div className="mx-6 mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {formatHolidayDate(
                      holidayToDelete.date,
                    )}
                  </p>
                </div>

                <CalendarDays className="h-5 w-5 shrink-0 text-gray-400" />
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Reason
                </p>

                <p className="mt-1 break-words text-sm font-medium text-gray-800">
                  {
                    holidayToDelete.reason
                  }
                </p>
              </div>
            </div>

            {/* Warning */}

            <div className="mx-6 mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm leading-5 text-red-700">
                This action cannot be undone.
                The holiday will be removed
                from the company holiday
                list.
              </p>
            </div>

            {/* Footer */}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  closeDeleteHolidayModal
                }
                disabled={
                  !!deletingHolidayId
                }
                className="btn btn-ghost w-full sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteHoliday
                }
                disabled={
                  !!deletingHolidayId
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {deletingHolidayId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Holiday
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}