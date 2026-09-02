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
  CalendarDays,
  CheckCircle2,
  Info,
  Loader2,
  Sparkles,
  X,
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
  const [projectId, setProjectId] = useState("");

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

      // ------------------------------------------------
      // HOLIDAY
      // ------------------------------------------------

      if (
        holidayData.success &&
        holidayData.isHoliday &&
        holidayData.holiday
      ) {
        setIsHoliday(true);
        setTodayHoliday(
          holidayData.holiday,
        );

        // Automatically show popup
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
  // IST TIME
  // --------------------------------------------------

  function getCurrentISTMinutes() {
    const now = new Date();

    const istTime =
      new Intl.DateTimeFormat(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        },
      ).formatToParts(now);

    const hour = Number(
      istTime.find(
        (part) =>
          part.type === "hour",
      )?.value ?? 0,
    );

    const minute = Number(
      istTime.find(
        (part) =>
          part.type === "minute",
      )?.value ?? 0,
    );

    return hour * 60 + minute;
  }

  const LATE_CHECKIN_TIME =
    10 * 60 + 15;

  const EARLY_CHECKOUT_TIME =
    18 * 60 + 45;

  // --------------------------------------------------
  // CHECK IN
  // --------------------------------------------------

  const handleCheckIn = async () => {
    // Do not allow check-in on holiday
    if (isHoliday) {
      setHolidayPopupOpen(true);
      return;
    }

    const currentISTMinutes =
      getCurrentISTMinutes();

    if (
      currentISTMinutes >=
      LATE_CHECKIN_TIME
    ) {
      setRemark("");

      setRemarkType(
        "late-checkin",
      );

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
      console.error(err);

      toast.error(
        err.response?.data?.message ||
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
    // Do not allow check-out on holiday
    if (isHoliday) {
      setHolidayPopupOpen(true);
      return;
    }

    const currentISTMinutes =
      getCurrentISTMinutes();

    if (
      currentISTMinutes <
      EARLY_CHECKOUT_TIME
    ) {
      setRemark("");

      setRemarkType(
        "early-checkout",
      );

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
      console.error(err);

      toast.error(
        err.response?.data?.message ||
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

  const handleRemarkSubmit =
    async () => {
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
      }

      if (
        remarkType ===
        "early-checkout"
      ) {
        await performCheckOut();
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
    date: string,
  ) {
    return new Date(
      date,
    ).toLocaleDateString(
      "en-IN",
      {
        timeZone:
          "Asia/Kolkata",
        weekday: "long",
        day: "numeric",
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
          flexDirection: "column",
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
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <CalendarDays
                      className="h-6 w-6 text-amber-600"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Today is a Holiday
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-gray-600">
                      {todayHoliday?.reason ||
                        "Today has been declared a company holiday."}
                    </p>
                  </div>
                </div>
              </div>

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
                  unavailable on company
                  holidays.
                </p>
              </div>
            </div>
          ) : dashboard?.onLeave ||
            dashboard?.attendance
              ?.status === "Leave" ? (
            <p className="badge">
              You are on approved
              leave today.
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
                      e.target
                        .value as
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
                disabled={checkingIn}
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
                disabled={checkingOut}
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
                    key={
                      project._id
                    }
                    value={
                      project._id
                    }
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
            disabled={savingWork}
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
          ATTRACTIVE HORIZONTAL HOLIDAY POPUP
      ================================================== */}

      {holidayPopupOpen &&
        isHoliday &&
        todayHoliday && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
            onClick={() =>
              setHolidayPopupOpen(false)
            }
          >
            <div
              className="relative w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)]"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* ==================================================
                  DECORATIVE TOP LINE
              ================================================== */}

              <div className="h-1.5 w-full bg-gradient-to-r from-yellow-300 via-amber-500 to-orange-500" />

              <div className="flex flex-col md:flex-row">
                {/* ==================================================
                    LEFT HERO SECTION
                ================================================== */}

                <div className="relative flex min-h-[310px] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 px-8 py-10 text-center md:w-[38%]">
                  {/* Background decorations */}

                  <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full border-[20px] border-white/10" />

                  <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full border-[24px] border-white/10" />

                  <div className="absolute left-10 top-10 h-3 w-3 rounded-full bg-white/30" />

                  <div className="absolute right-16 top-24 h-2 w-2 rounded-full bg-white/40" />

                  <div className="absolute bottom-20 right-10 h-4 w-4 rounded-full bg-white/20" />

                  {/* Small badge */}

                  <div className="relative mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
                    <Sparkles
                      size={13}
                    />
                    Holiday
                  </div>

                  {/* Icon */}

                  <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/50 bg-white/95 shadow-[0_15px_35px_rgba(0,0,0,0.15)]">
                    <div className="absolute inset-2 rounded-[21px] bg-gradient-to-br from-amber-50 to-yellow-100" />

                    <CalendarDays
                      className="relative h-12 w-12 text-amber-500"
                      strokeWidth={1.8}
                    />
                  </div>

                  <h2 className="relative mt-6 text-[26px] font-bold tracking-tight text-white">
                    Today is a Holiday
                  </h2>

                  <p className="relative mt-2 text-sm font-medium text-white/85">
                    Take a break & enjoy your day
                  </p>
                </div>

                {/* ==================================================
                    RIGHT CONTENT SECTION
                ================================================== */}

                <div className="flex w-full flex-col justify-center px-6 py-7 sm:px-8 md:w-[62%] md:px-10 md:py-8">
                  {/* Close */}

                  <button
                    type="button"
                    onClick={() =>
                      setHolidayPopupOpen(
                        false,
                      )
                    }
                    className="absolute right-4 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                    aria-label="Close holiday announcement"
                  >
                    <X size={18} />
                  </button>

                  {/* Header */}

                  <div className="pr-10">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />

                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-600">
                        Company Announcement
                      </p>
                    </div>

                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                      Enjoy your day off!
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      There is no attendance requirement
                      for today.
                    </p>
                  </div>

                  {/* Information cards */}

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Date */}

                    <div className="group rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-amber-200 hover:bg-amber-50/40">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                          <CalendarDays
                            className="h-5 w-5 text-amber-500"
                            strokeWidth={2}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-semibold leading-5 text-gray-800">
                            {formatHolidayDate(
                              todayHoliday.date,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-emerald-100">
                          <CheckCircle2
                            className="h-5 w-5 text-emerald-500"
                            strokeWidth={2}
                          />
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                            Attendance
                          </p>

                          <p className="mt-1 text-sm font-semibold text-emerald-700">
                            Not Required
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}

                  <div className="mt-3 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-600">
                      Holiday Reason
                    </p>

                    <p className="mt-1.5 text-sm font-semibold leading-6 text-gray-800">
                      {todayHoliday.reason ||
                        "Company Holiday"}
                    </p>
                  </div>

                  {/* Important Note */}

                  <div className="mt-3 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Info
                        className="h-4.5 w-4.5 text-blue-500"
                        size={18}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-700">
                        Important Note
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-700/80">
                        Check-in and check-out are
                        unavailable today. No attendance
                        is required, so you can enjoy
                        your holiday without worrying
                        about marking attendance.
                      </p>
                    </div>
                  </div>

                  {/* Bottom */}

                  <div className="mt-6 flex flex-col-reverse items-center justify-between gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                    <p className="text-xs text-gray-400">
                      Have a wonderful holiday! ✨
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setHolidayPopupOpen(
                          false,
                        )
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/10 transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-xl sm:w-auto"
                    >
                      <CheckCircle2
                        size={17}
                      />
                      Got it
                    </button>
                  </div>
                </div>
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
                ? "You are checking in at or after 10:15 AM. Please provide a reason for your late check-in."
                : "You are checking out before 6:45 PM. Please provide a reason for your early check-out."}
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
                  marginTop: "4px",
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