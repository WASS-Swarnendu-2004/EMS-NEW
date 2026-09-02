import { createFileRoute } from "@tanstack/react-router";
import { today, nowTime } from "@/lib/store";
import {
  checkIn,
  checkOut,
  getDashboard,
  type DashboardResponse,
} from "@/api/dashboard";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  Loader2,
  X,
  CalendarDays,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getMyProjects,
  type Project,
} from "@/api/project";
import { saveWorkStatus } from "@/api/workStatus";
import {
  getTodayHoliday,
  type Holiday,
} from "@/api/holiday";

export const Route = createFileRoute("/user/")({
  component: Page,
});

type RemarkType =
  | "late-checkin"
  | "early-checkout"
  | null;

const MAX_REMARK_LENGTH = 40;

function Page() {
  const { session } = useAuth();

  const empId = session!.id;

  const [mode, setMode] =
    useState<"office" | "wfh">("office");

  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] =
    useState("");

  const t = today();

  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [checkingIn, setCheckingIn] =
    useState(false);

  const [checkingOut, setCheckingOut] =
    useState(false);

  const [savingWork, setSavingWork] =
    useState(false);

  // --------------------------------------------------
  // HOLIDAY STATE
  // --------------------------------------------------

  const [isHoliday, setIsHoliday] =
    useState(false);

  const [todayHoliday, setTodayHoliday] =
    useState<Holiday | null>(null);

  const [holidayPopupOpen, setHolidayPopupOpen] =
    useState(false);

  const [holidayLoading, setHolidayLoading] =
    useState(false);

  // --------------------------------------------------
  // REMARK STATE
  // --------------------------------------------------

  const [remarkType, setRemarkType] =
    useState<RemarkType>(null);

  const [remark, setRemark] =
    useState("");

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        dashboardData,
        projectData,
        holidayData,
      ] = await Promise.all([
        getDashboard(),
        getMyProjects(),
        getTodayHoliday(),
      ]);

      setDashboard(dashboardData);

      setProjects(projectData);

      setPlan(
        dashboardData.todayPlan?.plan ?? "",
      );

      setStatus(
        dashboardData.todayPlan?.status ?? "",
      );

      setProjectId(
        dashboardData.todayPlan?.projectId ?? "",
      );

      // --------------------------------------------------
      // HOLIDAY DATA
      // --------------------------------------------------

      if (
        holidayData.success &&
        holidayData.isHoliday &&
        holidayData.holiday
      ) {
        setIsHoliday(true);

        setTodayHoliday(
          holidayData.holiday,
        );

        // Automatically open popup
        setHolidayPopupOpen(true);
      } else {
        setIsHoliday(false);
        setTodayHoliday(null);
      }
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // REFRESH DASHBOARD
  // --------------------------------------------------

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();

      setDashboard(res);

      setPlan(
        res.todayPlan?.plan ?? "",
      );

      setStatus(
        res.todayPlan?.status ?? "",
      );

      setProjectId(
        res.todayPlan?.projectId ?? "",
      );
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to load dashboard",
      );
    }
  };

  // --------------------------------------------------
  // SAVE WORK STATUS
  // --------------------------------------------------

  async function handleSaveWorkStatus() {
    try {
      setSavingWork(true);

      await saveWorkStatus({
        plan,
        endOfDayStatus: status,
        project: projectId,
        workDate: t,
      });

      toast.success(
        "Work status saved",
      );

      await fetchDashboard();
    } catch (err) {
      console.error(err);

      toast.error(
        "Unable to save work status",
      );
    } finally {
      setSavingWork(false);
    }
  }

  // --------------------------------------------------
  // CHECK IN
  // --------------------------------------------------

  const handleCheckIn = async () => {
    /*
     * Frontend protection.
     *
     * Backend should also reject check-in
     * on holidays.
     */
    if (isHoliday) {
      setHolidayPopupOpen(true);

      return;
    }

    await performCheckIn();
  };

  const performCheckIn = async () => {
    try {
      setCheckingIn(true);

      const res = await checkIn(
        mode,
        remark.trim() || undefined,
      );

      toast.success(
        res.message ||
          "Checked in successfully",
      );

      closeRemarkModal();

      await fetchDashboard();
    } catch (err: any) {
      console.error(
        "Check-in error:",
        err,
      );

      const message =
        err.response?.data?.message ||
        "";

      /*
       * The backend decides whether the employee
       * is late and requires a remark.
       *
       * We do NOT check the time in the frontend.
       */

      if (
        err.response?.status === 400 &&
        message
          .toLowerCase()
          .includes("late") &&
        message
          .toLowerCase()
          .includes("remark")
      ) {
        setRemark("");

        setRemarkType(
          "late-checkin",
        );

        return;
      }

      toast.error(
        message ||
          "Check in failed",
      );
    } finally {
      setCheckingIn(false);
    }
  };

  // --------------------------------------------------
  // CHECK OUT
  // --------------------------------------------------

  const handleCheckOut = async () => {
    /*
     * Do not allow checkout on holiday.
     * Backend should also enforce this.
     */
    if (isHoliday) {
      setHolidayPopupOpen(true);

      return;
    }

    await performCheckOut();
  };

  const performCheckOut = async () => {
    try {
      setCheckingOut(true);

      const res = await checkOut(
        remark.trim() || undefined,
      );

      toast.success(
        res.message ||
          "Checked out successfully",
      );

      closeRemarkModal();

      await fetchDashboard();
    } catch (err: any) {
      console.error(
        "Check-out error:",
        err,
      );

      const message =
        err.response?.data?.message ||
        "";

      /*
       * The backend decides whether the employee
       * is checking out too early and requires a remark.
       *
       * We do NOT check the time in the frontend.
       */

      if (
        err.response?.status === 400 &&
        message
          .toLowerCase()
          .includes("early") &&
        message
          .toLowerCase()
          .includes("remark")
      ) {
        setRemark("");

        setRemarkType(
          "early-checkout",
        );

        return;
      }

      toast.error(
        message ||
          "Failed to check out",
      );
    } finally {
      setCheckingOut(false);
    }
  };

  // --------------------------------------------------
  // REMARK MODAL
  // --------------------------------------------------

  const closeRemarkModal = () => {
    setRemarkType(null);
    setRemark("");
  };

  const handleRemarkChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = e.target.value;

    setRemark(
      value.slice(
        0,
        MAX_REMARK_LENGTH,
      ),
    );
  };

  const handleRemarkSubmit = async () => {
    const trimmedRemark =
      remark.trim();

    if (!trimmedRemark) {
      toast.error(
        "Please provide a reason",
      );

      return;
    }

    if (
      trimmedRemark.length >
      MAX_REMARK_LENGTH
    ) {
      toast.error(
        `Reason cannot exceed ${MAX_REMARK_LENGTH} characters`,
      );

      return;
    }

    if (
      remarkType ===
      "late-checkin"
    ) {
      await performCheckIn();

      return;
    }

    if (
      remarkType ===
      "early-checkout"
    ) {
      await performCheckOut();

      return;
    }
  };

  // --------------------------------------------------
  // FORMAT IST TIME
  // --------------------------------------------------

  function formatISTTime(
    date: string,
  ) {
    return new Date(
      date,
    ).toLocaleTimeString(
      "en-IN",
      {
        timeZone:
          "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      },
    );
  }

  // --------------------------------------------------
  // FORMAT HOLIDAY DATE
  // --------------------------------------------------

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
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    );
  }

  // --------------------------------------------------
  // ATTENDANCE STATE
  // --------------------------------------------------

  const hasCheckedIn =
    Boolean(
      dashboard?.attendance
        ?.checkIn,
    );

  const hasCheckedOut =
    Boolean(
      dashboard?.attendance
        ?.checkOut,
    );

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection:
            "column",
          justifyContent:
            "center",
          alignItems: "center",
          height: "70vh",
          gap: "12px",
        }}
      >
        <Loader2
          className="animate-spin"
          size={40}
        />

        <p
          style={{
            fontSize: "16px",
            fontWeight: 500,
            color: "#666",
          }}
        >
          Loading...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ==================================================
          KPI CARDS
      ================================================== */}

      <div className="kpis">
        <div className="kpi">
          <div className="kpi-label">
            My projects
          </div>

          <div className="kpi-value">
            {dashboard?.cards
              .myProjects ?? 0}
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-label">
            Pending leaves
          </div>

          <div className="kpi-value">
            {dashboard?.cards
              .pendingLeaves ?? 0}
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-label">
            Pending WFH
          </div>

          <div className="kpi-value">
            {dashboard?.cards
              .pendingWFH ?? 0}
          </div>
        </div>

        <div className="kpi gold">
          <div className="kpi-label">
            Salary slips
          </div>

          <div className="kpi-value">
            {dashboard?.cards
              .salarySlips ?? 0}
          </div>
        </div>
      </div>

      {/* ==================================================
          MAIN ROW
      ================================================== */}

      <div className="row-2">
        {/* ==================================================
            ATTENDANCE
        ================================================== */}

        <div className="card">
          <div className="card-header">
            <h2>
              Attendance — {t}
            </h2>
          </div>

          {/* ==================================================
              HOLIDAY
          ================================================== */}

          {isHoliday ? (
            <div className="space-y-4">
              {/* Holiday Banner */}

              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                    <CalendarDays className="h-6 w-6 text-yellow-600" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-yellow-900">
                      Today is a Holiday
                    </h3>

                    <p className="mt-1 text-sm text-yellow-800">
                      {todayHoliday?.reason ||
                        "Today has been declared a company holiday."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disabled Check In */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <button
                  type="button"
                  disabled
                  className="btn btn-gold w-full cursor-not-allowed opacity-50"
                >
                  🕒 Check In
                </button>

                <p className="mt-3 text-center text-xs text-gray-500">
                  Check-in and check-out are
                  unavailable on company holidays.
                </p>
              </div>
            </div>
          ) : dashboard?.onLeave ||
            dashboard?.attendance
              ?.status ===
              "Leave" ? (
            /* ==================================================
                ON LEAVE
            ================================================== */

            <p className="badge">
              You are on approved leave today.
            </p>
          ) : !hasCheckedIn ? (
            /* ==================================================
                NOT CHECKED IN
            ================================================== */

            <div>
              <div className="field">
                <label>
                  Mode
                </label>

                <select
                  className="select"
                  value={mode}
                  onChange={(e) =>
                    setMode(
                      e.target.value as
                        | "office"
                        | "wfh",
                    )
                  }
                >
                  <option value="office">
                    Office
                  </option>

                  <option value="wfh">
                    Work from home
                  </option>
                </select>
              </div>

              <button
                className="btn btn-gold"
                onClick={
                  handleCheckIn
                }
                disabled={
                  checkingIn ||
                  isHoliday
                }
              >
                {checkingIn ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />

                    &nbsp;
                    Checking In...
                  </>
                ) : (
                  "🕒 Check In"
                )}
              </button>
            </div>
          ) : hasCheckedOut ? (
            /* ==================================================
                DAY COMPLETE
            ================================================== */

            <div>
              <p>
                Checked in at{" "}
                <strong>
                  {dashboard
                    ?.attendance
                    ?.checkIn
                    ? formatISTTime(
                        dashboard
                          .attendance
                          .checkIn,
                      )
                    : "--"}
                </strong>
              </p>

              <p className="badge success">
                Day complete —{" "}
                {dashboard
                  ?.attendance
                  ?.checkIn
                  ? formatISTTime(
                      dashboard
                        .attendance
                        .checkIn,
                    )
                  : "--"}{" "}
                →{" "}
                {dashboard
                  ?.attendance
                  ?.checkOut
                  ? formatISTTime(
                      dashboard
                        .attendance
                        .checkOut,
                    )
                  : "--"}
              </p>
            </div>
          ) : (
            /* ==================================================
                CHECKED IN → SHOW CHECK OUT
            ================================================== */

            <div>
              <p>
                Checked in at{" "}
                <strong>
                  {dashboard
                    ?.attendance
                    ?.checkIn
                    ? formatISTTime(
                        dashboard
                          .attendance
                          .checkIn,
                      )
                    : "--"}
                </strong>{" "}
                (
                {dashboard
                  ?.attendance
                  ?.mode ??
                  "Office"}
                )
              </p>

              <button
                className="btn"
                onClick={
                  handleCheckOut
                }
                disabled={
                  checkingOut ||
                  isHoliday
                }
              >
                {checkingOut ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />

                    &nbsp;
                    Checking Out...
                  </>
                ) : (
                  `Check Out (${nowTime()})`
                )}
              </button>
            </div>
          )}
        </div>

        {/* ==================================================
            WORK PLAN
        ================================================== */}

        <div className="card">
          <div className="card-header">
            <h2>
              Today's work plan
            </h2>
          </div>

          <div className="field">
            <label>
              Project
            </label>

            <select
              className="select"
              value={projectId}
              onChange={(e) =>
                setProjectId(
                  e.target.value,
                )
              }
            >
              <option value="">
                — No project —
              </option>

              {projects.map(
                (project) => (
                  <option
                    key={project._id}
                    value={project._id}
                  >
                    {
                      project.projectName
                    }
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="field">
            <label>
              Morning plan
            </label>

            <textarea
              className="textarea"
              value={plan}
              onChange={(e) =>
                setPlan(
                  e.target.value,
                )
              }
            />
          </div>

          <div className="field">
            <label>
              End-of-day status
            </label>

            <textarea
              className="textarea"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value,
                )
              }
            />
          </div>

          <button
            className="btn"
            onClick={
              handleSaveWorkStatus
            }
            disabled={
              savingWork
            }
          >
            {savingWork ? (
              <>
                <Loader2
                  className="animate-spin"
                  size={18}
                />

                &nbsp;
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

      {/* ==================================================
          HOLIDAY POPUP
      ================================================== */}

      {holidayPopupOpen &&
        isHoliday &&
        todayHoliday && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() =>
              setHolidayPopupOpen(false)
            }
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* ==========================================
                  POPUP TOP
              =========================================== */}

              <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 px-6 pb-8 pt-7">
                {/* Decorative circles */}

                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />

                <div className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-white/10" />

                {/* Close */}

                <button
                  type="button"
                  onClick={() =>
                    setHolidayPopupOpen(
                      false,
                    )
                  }
                  className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Icon */}

                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                  <CalendarDays className="h-10 w-10 text-yellow-500" />
                </div>

                {/* Title */}

                <div className="relative mt-4 text-center">
                  <h2 className="text-2xl font-bold text-white">
                    Today is a Holiday
                  </h2>

                  <p className="mt-1 text-sm text-yellow-50">
                    Company Holiday
                  </p>
                </div>
              </div>

              {/* ==========================================
                  POPUP BODY
              =========================================== */}

              <div className="space-y-5 px-6 py-6">
                {/* Date */}

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                      <CalendarDays className="h-5 w-5 text-yellow-600" />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Holiday Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatHolidayDate(
                          todayHoliday.date,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason */}

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Holiday Reason
                  </p>

                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm font-medium leading-6 text-yellow-900">
                      {todayHoliday.reason}
                    </p>
                  </div>
                </div>

                {/* Important Note */}

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Important Note
                      </p>

                      <p className="mt-1 text-sm leading-5 text-blue-800">
                        Today is a company holiday.
                        Check-in and check-out are
                        not available today, and no
                        attendance is required.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==========================================
                  POPUP FOOTER
              =========================================== */}

              <div className="border-t bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() =>
                    setHolidayPopupOpen(
                      false,
                    )
                  }
                  className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ==================================================
          REMARK MODAL
      ================================================== */}

      {remarkType && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            {/* HEADER */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              >
                {remarkType ===
                "late-checkin"
                  ? "Late Check-In"
                  : "Early Check-Out"}
              </h2>

              <button
                type="button"
                onClick={
                  closeRemarkModal
                }
                disabled={
                  checkingIn ||
                  checkingOut
                }
                style={{
                  border: "none",
                  background:
                    "transparent",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* MESSAGE */}

            <p
              style={{
                marginBottom:
                  "16px",
                color: "#555",
                lineHeight: 1.5,
              }}
            >
              {remarkType ===
              "late-checkin"
                ? "You are checking in late. Please provide a reason for your late check-in."
                : "You are checking out early. Please provide a reason for your early check-out."}
            </p>

            {/* REMARK */}

            <div className="field">
              <label>
                Reason{" "}
                <span
                  style={{
                    color: "red",
                  }}
                >
                  *
                </span>
              </label>

              <textarea
                className="textarea"
                value={remark}
                onChange={
                  handleRemarkChange
                }
                placeholder="Enter your reason..."
                rows={4}
                maxLength={
                  MAX_REMARK_LENGTH
                }
                autoFocus
              />

              <div
                style={{
                  textAlign:
                    "right",
                  fontSize: "12px",
                  color:
                    remark.length >=
                    MAX_REMARK_LENGTH
                      ? "#dc2626"
                      : "#666",
                  marginTop:
                    "4px",
                }}
              >
                {remark.length}/
                {MAX_REMARK_LENGTH}
              </div>
            </div>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "10px",
                marginTop:
                  "20px",
              }}
            >
              <button
                type="button"
                className="btn"
                onClick={
                  closeRemarkModal
                }
                disabled={
                  checkingIn ||
                  checkingOut
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-gold"
                onClick={
                  handleRemarkSubmit
                }
                disabled={
                  checkingIn ||
                  checkingOut
                }
              >
                {checkingIn ||
                checkingOut ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />

                    &nbsp;
                    Submitting...
                  </>
                ) : remarkType ===
                  "late-checkin" ? (
                  "Submit Check In"
                ) : (
                  "Submit Check Out"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}