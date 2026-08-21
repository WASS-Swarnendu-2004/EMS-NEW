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
import { Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import { getMyProjects, type Project } from "@/api/project";
import { saveWorkStatus } from "@/api/workStatus";

export const Route = createFileRoute("/user/")({ component: Page });

type RemarkType = "late-checkin" | "early-checkout" | null;

function Page() {
  const { session } = useAuth();
  const empId = session!.id;

  const [mode, setMode] = useState<"office" | "wfh">("office");

  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");

  const t = today();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [savingWork, setSavingWork] = useState(false);

  // Remark modal state
  const [remarkType, setRemarkType] = useState<RemarkType>(null);
  const [remark, setRemark] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [dashboardData, projectData] = await Promise.all([
        getDashboard(),
        getMyProjects(),
      ]);

      setDashboard(dashboardData);
      setProjects(projectData);

      setPlan(dashboardData.todayPlan?.plan ?? "");
      setStatus(dashboardData.todayPlan?.status ?? "");
      setProjectId(dashboardData.todayPlan?.projectId ?? "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await getDashboard();

      setDashboard(res);

      setPlan(res.todayPlan?.plan ?? "");
      setStatus(res.todayPlan?.status ?? "");
      setProjectId(res.todayPlan?.projectId ?? "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  async function handleSaveWorkStatus() {
    try {
      setSavingWork(true);

      await saveWorkStatus({
  project: projectId,
  workDate: t,
  plan,
  endOfDayStatus: status,
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
  // IST TIME HELPERS
  // --------------------------------------------------

  function getCurrentISTMinutes() {
    const now = new Date();

    const istTime = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const hour = Number(
      istTime.find((part) => part.type === "hour")?.value ?? 0
    );

    const minute = Number(
      istTime.find((part) => part.type === "minute")?.value ?? 0
    );

    return hour * 60 + minute;
  }

  const LATE_CHECKIN_TIME = 10 * 60 + 15; // 10:15 AM
  const EARLY_CHECKOUT_TIME = 18 * 60 + 45; // 6:45 PM

  // --------------------------------------------------
  // CHECK IN
  // --------------------------------------------------

  const handleCheckIn = async () => {
    const currentISTMinutes = getCurrentISTMinutes();

    // If after or equal to 10:15 AM,
    // ask for a remark first.
    if (currentISTMinutes >= LATE_CHECKIN_TIME) {
      setRemark("");
      setRemarkType("late-checkin");
      return;
    }

    await performCheckIn();
  };

  const performCheckIn = async () => {
    try {
      setCheckingIn(true);

      const res = await checkIn(
        mode,
        remark.trim() || undefined
      );

      toast.success(res.message || "Checked in successfully");

      closeRemarkModal();

      await fetchDashboard();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Check in failed"
      );
    } finally {
      setCheckingIn(false);
    }
  };

  // --------------------------------------------------
  // CHECK OUT
  // --------------------------------------------------

  const handleCheckOut = async () => {
    const currentISTMinutes = getCurrentISTMinutes();

    // If before 6:45 PM,
    // ask for a remark first.
    if (currentISTMinutes < EARLY_CHECKOUT_TIME) {
      setRemark("");
      setRemarkType("early-checkout");
      return;
    }

    await performCheckOut();
  };

  const performCheckOut = async () => {
    try {
      setCheckingOut(true);

      const res = await checkOut(
        remark.trim() || undefined
      );

      toast.success(res.message || "Checked out successfully");

      closeRemarkModal();

      await fetchDashboard();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to check out"
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

  const handleRemarkSubmit = async () => {
    if (!remark.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    if (remarkType === "late-checkin") {
      await performCheckIn();
    }

    if (remarkType === "early-checkout") {
      await performCheckOut();
    }
  };

  function formatISTTime(date: string) {
    return new Date(date).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

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
      {/* ----------------------------------------------- */}
      {/* KPI CARDS */}
      {/* ----------------------------------------------- */}

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

      {/* ----------------------------------------------- */}
      {/* MAIN ROW */}
      {/* ----------------------------------------------- */}

      <div className="row-2">

        {/* ATTENDANCE CARD */}

        <div className="card">
          <div className="card-header">
            <h2>Attendance — {t}</h2>
          </div>

          {dashboard?.onLeave ? (
            <p className="badge">
              You are on approved leave today.
            </p>
          ) : !dashboard?.attendance ? (
            <div>
              <div className="field">
                <label>Mode</label>

                <select
                  className="select"
                  value={mode}
                  onChange={(e) =>
                    setMode(
                      e.target.value as "office" | "wfh"
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
                onClick={handleCheckIn}
                disabled={checkingIn}
              >
                {checkingIn ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />

                    &nbsp;Checking In...
                  </>
                ) : (
                  "🕒 Check In"
                )}
              </button>
            </div>
          ) : (
            <div>
              <p>
                Checked in at{" "}
                <strong>
                  {formatISTTime(
                    dashboard.attendance.checkIn!
                  )}
                </strong>{" "}
                ({dashboard.attendance.mode})
              </p>

              {!dashboard.attendance.checkOut && (
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

                      &nbsp;Checking Out...
                    </>
                  ) : (
                    `Check out (${nowTime()})`
                  )}
                </button>
              )}

              {dashboard.attendance.checkOut && (
                <p className="badge success">
                  Day complete —{" "}
                  {formatISTTime(
                    dashboard.attendance.checkIn!
                  )}{" "}
                  →{" "}
                  {formatISTTime(
                    dashboard.attendance.checkOut
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* WORK PLAN CARD */}

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
              <option value="">
                — No project —
              </option>

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

                &nbsp;Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

      {/* ----------------------------------------------- */}
      {/* REMARK MODAL */}
      {/* ----------------------------------------------- */}

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
            {/* Modal Header */}

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

            {/* Message */}

            <p
              style={{
                marginBottom: "16px",
                color: "#555",
                lineHeight: 1.5,
              }}
            >
              {remarkType === "late-checkin"
                ? "You are checking in at or after 10:15 AM. Please provide a reason for your late check-in."
                : "You are checking out before 6:45 PM. Please provide a reason for your early check-out."}
            </p>

            {/* Remark */}

            <div className="field">
              <label>
                Reason <span style={{ color: "red" }}>*</span>
              </label>

              <textarea
                className="textarea"
                value={remark}
                onChange={(e) =>
                  setRemark(e.target.value)
                }
                placeholder="Enter your reason..."
                rows={4}
                autoFocus
              />
            </div>

            {/* Buttons */}

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
                  checkingIn || checkingOut
                }
              >
                {checkingIn || checkingOut ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />

                    &nbsp;Submitting...
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