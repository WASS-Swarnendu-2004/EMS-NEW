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
import { getMyProjects, type Project } from "@/api/project";
import { saveWorkStatus } from "@/api/workStatus";
import { getTodayHoliday, type Holiday } from "@/api/holiday";

export const Route = createFileRoute("/user/")({
  component: Page,
});

type RemarkType = "late-checkin" | "early-checkout" | null;

const MAX_REMARK_LENGTH = 40;

function Page() {
  const { session } = useAuth();

  const empId = session!.id;

  const [mode, setMode] = useState<"office" | "wfh">("office");

  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");

  const t = today();

  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);

  const [checkingIn, setCheckingIn] = useState(false);

  const [checkingOut, setCheckingOut] = useState(false);

  const [savingWork, setSavingWork] = useState(false);

  // --------------------------------------------------
  // HOLIDAY STATE
  // --------------------------------------------------

  const [isHoliday, setIsHoliday] = useState(false);

  const [todayHoliday, setTodayHoliday] = useState<Holiday | null>(null);

  const [holidayPopupOpen, setHolidayPopupOpen] = useState(false);

  // --------------------------------------------------
  // REMARK STATE
  // --------------------------------------------------

  const [remarkType, setRemarkType] = useState<RemarkType>(null);

  const [remark, setRemark] = useState("");

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [dashboardData, projectData, holidayData] =
        await Promise.all([
          getDashboard(),
          getMyProjects(),
          getTodayHoliday(),
        ]);

      setDashboard(dashboardData);

      setProjects(projectData);

      setPlan(dashboardData.todayPlan?.plan ?? "");

      setStatus(dashboardData.todayPlan?.status ?? "");

      setProjectId(dashboardData.todayPlan?.projectId ?? "");

      // ------------------------------------------------
      // HOLIDAY
      // ------------------------------------------------

      if (
        holidayData.success &&
        holidayData.isHoliday &&
        holidayData.holiday
      ) {
        setIsHoliday(true);
        setTodayHoliday(holidayData.holiday);

        // Automatically show popup
        setHolidayPopupOpen(true);
      } else {
        setIsHoliday(false);
        setTodayHoliday(null);
      }
    } catch (err) {
      console.error(err);

      toast.error("Failed to load dashboard");
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

      setPlan(res.todayPlan?.plan ?? "");

      setStatus(res.todayPlan?.status ?? "");

      setProjectId(res.todayPlan?.projectId ?? "");
    } catch (err) {
      console.error(err);

      toast.error("Failed to load dashboard");
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

      toast.success("Work status saved");

      await fetchDashboard();
    } catch (err) {
      console.error(err);

      toast.error("Unable to save work status");
    } finally {
      setSavingWork(false);
    }
  }

  // --------------------------------------------------
  // CHECK IN
  // --------------------------------------------------

  const handleCheckIn = async () => {
    // Do not allow check-in on holiday
    if (isHoliday) {
      setHolidayPopupOpen(true);
      return;
    }

    /*
     * IMPORTANT:
     * Late check-in timing is handled by the BACKEND API.
     *
     * Frontend does NOT check 10:20 AM anymore.
     */
    await performCheckIn();
  };

  const performCheckIn = async () => {
    try {
      setCheckingIn(true);

      const res = await checkIn(
        mode,
        remark.trim() || undefined,
      );

      toast.success(res.message || "Checked in successfully");

      closeRemarkModal();

      await fetchDashboard();
    } catch (err: any) {
      console.error(err);

      /*
       * Backend is responsible for deciding whether
       * late check-in requires a remark.
       *
       * If the backend returns an error saying that a
       * remark is required, show the remark popup.
       */
      const message =
        err.response?.data?.message || "";

      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes("remark") ||
        lowerMessage.includes("reason") ||
        lowerMessage.includes("late")
      ) {
        setRemark("");
        setRemarkType("late-checkin");

        return;
      }

      toast.error(message || "Check in failed");
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

    /*
     * IMPORTANT:
     * Early check-out timing is handled by the BACKEND API.
     *
     * Frontend does NOT check 6:45 PM anymore.
     */
    await performCheckOut();
  };

  const performCheckOut = async () => {
    try {
      setCheckingOut(true);

      const res = await checkOut(
        remark.trim() || undefined,
      );

      toast.success(res.message || "Checked out successfully");

      closeRemarkModal();

      await fetchDashboard();
    } catch (err: any) {
      console.error(err);

      /*
       * Backend is responsible for deciding whether
       * early checkout requires a remark.
       *
       * If the backend returns an error saying that a
       * remark is required, show the remark popup.
       */
      const message =
        err.response?.data?.message || "";

      const lowerMessage = message.toLowerCase();

      if (
        lowerMessage.includes("remark") ||
        lowerMessage.includes("reason") ||
        lowerMessage.includes("early")
      ) {
        setRemark("");
        setRemarkType("early-checkout");

        return;
      }

      toast.error(message || "Failed to check out");
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

    setRemark(value.slice(0, MAX_REMARK_LENGTH));
  };

  const handleRemarkSubmit = async () => {
    const trimmedRemark = remark.trim();

    if (!trimmedRemark) {
      toast.error("Please provide a reason");

      return;
    }

    if (trimmedRemark.length > MAX_REMARK_LENGTH) {
      toast.error(
        `Reason cannot exceed ${MAX_REMARK_LENGTH} characters`,
      );

      return;
    }

    if (remarkType === "late-checkin") {
      await performCheckIn();
    }

    if (remarkType === "early-checkout") {
      await performCheckOut();
    }
  };

  // --------------------------------------------------
  // FORMAT IST TIME
  // --------------------------------------------------

  function formatISTTime(date: string) {
    return new Date(date).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  // --------------------------------------------------
  // FORMAT HOLIDAY DATE
  // --------------------------------------------------

  function formatHolidayDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // --------------------------------------------------
  // ATTENDANCE STATE
  // --------------------------------------------------

  const hasCheckedIn = Boolean(
    dashboard?.attendance?.checkIn,
  );

  const hasCheckedOut = Boolean(
    dashboard?.attendance?.checkOut,
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
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          gap: "12px",
        }}
      >
        <Loader2 className="animate-spin" size={40} />

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
          <div className="kpi-label">My projects</div>

          <div className="kpi-value">
            {dashboard?.cards.myProjects ?? 0}
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Pending leaves</div>

          <div className="kpi-value">
            {dashboard?.cards.pendingLeaves ?? 0}
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Pending WFH</div>

          <div className="kpi-value">
            {dashboard?.cards.pendingWFH ?? 0}
          </div>
        </div>

        <div className="kpi gold">
          <div className="kpi-label">Salary slips</div>

          <div className="kpi-value">
            {dashboard?.cards.salarySlips ?? 0}
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
            <h2>Attendance — {t}</h2>
          </div>

          {/* ==================================================
              HOLIDAY
          ================================================== */}

          {isHoliday ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <CalendarDays className="h-6 w-6 text-amber-600" />
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
                  Check-in and check-out are unavailable on
                  company holidays.
                </p>
              </div>
            </div>
          ) : dashboard?.onLeave ||
            dashboard?.attendance?.status === "Leave" ? (
            <p className="badge">
              You are on approved leave today.
            </p>
          ) : !hasCheckedIn ? (
            /* ==================================================
                NOT CHECKED IN
            ================================================== */

            <div>
              <div className="field">
                <label>Mode</label>

                <select
                  className="select"
                  value={mode}
                  onChange={(e) =>
                    setMode(
                      e.target.value as "office" | "wfh",
                    )
                  }
                >
                  <option value="office">Office</option>

                  <option value="wfh">
                    Work from home
                  </option>
                </select>
              </div>

              <button
                className="btn btn-gold"
                onClick={handleCheckIn}
                disabled={checkingIn}
              >
                {checkingIn ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />
                    &nbsp; Checking In...
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
                  {dashboard?.attendance?.checkIn
                    ? formatISTTime(
                        dashboard.attendance.checkIn,
                      )
                    : "--"}
                </strong>
              </p>

              <p className="badge success">
                Day complete —{" "}
                {dashboard?.attendance?.checkIn
                  ? formatISTTime(
                      dashboard.attendance.checkIn,
                    )
                  : "--"}{" "}
                →{" "}
                {dashboard?.attendance?.checkOut
                  ? formatISTTime(
                      dashboard.attendance.checkOut,
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
                  {dashboard?.attendance?.checkIn
                    ? formatISTTime(
                        dashboard.attendance.checkIn,
                      )
                    : "--"}
                </strong>{" "}
                ({dashboard?.attendance?.mode ?? "Office"})
              </p>

              <button
                className="btn"
                onClick={handleCheckOut}
                disabled={checkingOut}
              >
                {checkingOut ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />
                    &nbsp; Checking Out...
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
            <h2>Today's work plan</h2>
          </div>

          <div className="field">
            <label>Project</label>

            <select
              className="select"
              value={projectId}
              onChange={(e) =>
                setProjectId(e.target.value)
              }
            >
              <option value="">— No project —</option>

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
            <label>Morning plan</label>

            <textarea
              className="textarea"
              value={plan}
              onChange={(e) =>
                setPlan(e.target.value)
              }
            />
          </div>

          <div className="field">
            <label>End-of-day status</label>

            <textarea
              className="textarea"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            />
          </div>

          <button
            className="btn"
            onClick={handleSaveWorkStatus}
            disabled={savingWork}
          >
            {savingWork ? (
              <>
                <Loader2
                  className="animate-spin"
                  size={18}
                />
                &nbsp; Saving...
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
            className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-md sm:p-4"
            onClick={() =>
              setHolidayPopupOpen(false)
            }
          >
            <div
              className="relative my-auto w-full max-w-3xl overflow-hidden rounded-[22px] border border-white/20 bg-white shadow-[0_25px_70px_rgba(0,0,0,0.25)] sm:rounded-[26px]"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-yellow-300 via-amber-500 to-orange-500" />

              <div className="flex flex-col md:flex-row">
                <div className="relative flex min-h-[210px] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 px-5 py-6 text-center sm:min-h-[235px] sm:px-6 sm:py-7 md:min-h-[285px] md:w-[36%]">
                  <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full border-[18px] border-white/10" />

                  <div className="absolute -bottom-16 -left-14 h-40 w-40 rounded-full border-[20px] border-white/10" />

                  <div className="absolute left-7 top-7 h-2.5 w-2.5 rounded-full bg-white/30" />

                  <div className="absolute right-10 top-16 h-2 w-2 rounded-full bg-white/40" />

                  <div className="absolute bottom-12 right-7 h-3 w-3 rounded-full bg-white/20" />

                  <div className="relative mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm sm:mb-4 sm:text-[10px]">
                    <Sparkles size={12} />
                    Holiday
                  </div>

                  <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-[20px] border border-white/50 bg-white/95 shadow-[0_12px_28px_rgba(0,0,0,0.15)] sm:h-20 sm:w-20 sm:rounded-[23px]">
                    <div className="absolute inset-1.5 rounded-[15px] bg-gradient-to-br from-amber-50 to-yellow-100 sm:rounded-[18px]" />

                    <CalendarDays
                      className="relative h-8 w-8 text-amber-500 sm:h-10 sm:w-10"
                      strokeWidth={1.8}
                    />
                  </div>

                  <h2 className="relative mt-3 text-[19px] font-bold tracking-tight text-white sm:mt-4 sm:text-[22px]">
                    Today is a Holiday
                  </h2>

                  <p className="relative mt-1 text-[11px] font-medium text-white/85 sm:text-xs">
                    Take a break & enjoy your day
                  </p>
                </div>

                <div className="relative max-h-[calc(100vh-24px)] w-full overflow-y-auto px-5 py-5 sm:max-h-[calc(100vh-40px)] sm:px-6 sm:py-6 md:w-[64%] md:px-7 md:py-7">
                  <button
                    type="button"
                    onClick={() =>
                      setHolidayPopupOpen(false)
                    }
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:right-4 sm:top-4"
                    aria-label="Close holiday announcement"
                  >
                    <X size={16} />
                  </button>

                  <div className="pr-9">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-600 sm:text-[10px]">
                        Company Announcement
                      </p>
                    </div>

                    <h3 className="mt-1.5 text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
                      Enjoy your day off!
                    </h3>

                    <p className="mt-1 text-[11px] text-gray-500 sm:text-xs">
                      There is no attendance requirement for
                      today.
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-5 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 transition hover:border-amber-200 hover:bg-amber-50/40">
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-100">
                          <CalendarDays
                            className="h-4 w-4 text-amber-500"
                            strokeWidth={2}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                            Date
                          </p>

                          <p className="mt-0.5 text-[11px] font-semibold leading-4 text-gray-800 sm:text-xs">
                            {formatHolidayDate(
                              todayHoliday.date,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-emerald-100">
                          <CheckCircle2
                            className="h-4 w-4 text-emerald-500"
                            strokeWidth={2}
                          />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                            Attendance
                          </p>

                          <p className="mt-0.5 text-[11px] font-semibold text-emerald-700 sm:text-xs">
                            Not Required
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 p-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-amber-600">
                      Holiday Reason
                    </p>

                    <p className="mt-1 text-[11px] font-semibold leading-4 text-gray-800 sm:text-xs sm:leading-5">
                      {todayHoliday.reason ||
                        "Company Holiday"}
                    </p>
                  </div>

                  <div className="mt-2.5 flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                      <Info
                        className="text-blue-500"
                        size={16}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-blue-700">
                        Important Note
                      </p>

                      <p className="mt-0.5 text-[10px] leading-4 text-blue-700/80 sm:text-[11px]">
                        Check-in and check-out are unavailable
                        today. No attendance is required, so
                        you can enjoy your holiday without
                        worrying about marking attendance.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2.5 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-center text-[10px] text-gray-400 sm:text-left sm:text-[11px]">
                      Have a wonderful holiday! ✨
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setHolidayPopupOpen(false)
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-gray-900/10 transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg sm:w-auto sm:text-sm"
                    >
                      <CheckCircle2 size={15} />
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
            background: "rgba(0, 0, 0, 0.45)",
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
                {remarkType === "late-checkin"
                  ? "Late Check-In"
                  : "Early Check-Out"}
              </h2>

              <button
                type="button"
                onClick={closeRemarkModal}
                disabled={
                  checkingIn || checkingOut
                }
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p
              style={{
                marginBottom: "16px",
                color: "#555",
                lineHeight: 1.5,
              }}
            >
              {remarkType === "late-checkin"
                ? "Your check-in has been identified as late(after 10.20 am). Please provide a reason for your late check-in."
                : "Your check-out has been identified as early(before 6.45 pm). Please provide a reason for your early check-out."}
            </p>

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
                onChange={handleRemarkChange}
                placeholder="Enter your reason..."
                rows={4}
                maxLength={MAX_REMARK_LENGTH}
                autoFocus
              />

              <div
                style={{
                  textAlign: "right",
                  fontSize: "12px",
                  color:
                    remark.length >=
                    MAX_REMARK_LENGTH
                      ? "#dc2626"
                      : "#666",
                  marginTop: "4px",
                }}
              >
                {remark.length}/{MAX_REMARK_LENGTH}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                className="btn"
                onClick={closeRemarkModal}
                disabled={
                  checkingIn || checkingOut
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-gold"
                onClick={handleRemarkSubmit}
                disabled={
                  checkingIn ||
                  checkingOut ||
                  !remark.trim()
                }
              >
                {checkingIn || checkingOut ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />
                    &nbsp; Submitting...
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