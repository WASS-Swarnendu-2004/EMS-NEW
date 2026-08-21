import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getMyAttendance,
  type Attendance,
} from "@/api/attendance";
import { exportToExcel } from "@/lib/excel";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute(
  "/user/attendance"
)({
  component: Page,
});

function startOf(
  period: "week" | "month" | "year"
) {
  const d = new Date();

  if (period === "week") {
    d.setDate(d.getDate() - 7);
  } else if (period === "month") {
    d.setMonth(d.getMonth() - 1);
  } else {
    d.setFullYear(d.getFullYear() - 1);
  }

  return d.toISOString().slice(0, 10);
}

function Page() {
  const [attendance, setAttendance] =
    useState<Attendance[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [period, setPeriod] =
    useState<
      "week" | "month" | "year"
    >("month");

  useEffect(() => {
    fetchAttendance();
  }, []);

  // --------------------------------------------------
  // FETCH ATTENDANCE
  // --------------------------------------------------

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const data =
        await getMyAttendance();

      setAttendance(data);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const from = startOf(period);

  const rows = attendance
    .filter((a) => a.date >= from)
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // --------------------------------------------------
  // FORMAT TIME
  // --------------------------------------------------

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  }

  // --------------------------------------------------
  // EXPORT
  // --------------------------------------------------

  function exportXlsx() {
    if (rows.length === 0) {
      toast.warning(
        "No attendance records to export"
      );

      return;
    }

    exportToExcel(
      rows.map((a) => ({
        Date: formatDate(a.date),

        Status: a.status,

        CheckIn: a.checkIn
          ? formatTime(a.checkIn)
          : "—",

        CheckInRemark:
          a.isLateCheckIn &&
          a.checkInRemark
            ? a.checkInRemark
            : "—",

        CheckOut: a.checkOut
          ? formatTime(a.checkOut)
          : "—",

        CheckOutRemark:
          a.isEarlyCheckOut &&
          a.checkOutRemark
            ? a.checkOutRemark
            : "—",

        WorkingMinutes:
          a.workingMinutes,

        PaidMinutes:
          a.paidMinutes,
      })),
      `my-attendance-${period}.xlsx`,
      "Attendance"
    );

    toast.success(
      "Attendance exported successfully"
    );
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-gray-500 text-lg font-medium">
          Loading attendance...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      {/* TOOLBAR */}

      <div className="toolbar">
        <select
          className="select"
          value={period}
          onChange={(e) =>
            setPeriod(
              e.target.value as
                | "week"
                | "month"
                | "year"
            )
          }
          style={{ width: 180 }}
        >
          <option value="week">
            Last 7 days
          </option>

          <option value="month">
            Last 30 days
          </option>

          <option value="year">
            Last 12 months
          </option>
        </select>

        <span className="spacer" />

        <span className="muted">
          {rows.length} days
        </span>

        <button
          className="btn btn-ghost"
          onClick={exportXlsx}
        >
          ⬇ Export
        </button>
      </div>

      {/* TABLE */}

      <div className="table-wrap">
        <table className="table">

          <thead>
            <tr>
              <th>Date</th>

              <th>Status</th>

              <th>Check-in</th>

              <th>Check-out</th>

              <th>Working Minutes</th>

              <th>Paid Minutes</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((a) => (
              <tr
                key={a._id}
                className={
                  a.status
                    ?.trim()
                    .toLowerCase() ===
                  "leave"
                    ? "leave-row"
                    : ""
                }
              >

                {/* DATE */}

                <td>
                  {formatDate(a.date)}
                </td>

                {/* STATUS */}

                <td>
                  <span className="badge purple">
                    {a.status}
                  </span>
                </td>

                {/* CHECK IN */}

                <td>
                  {a.status === "Leave" ||
                  !a.checkIn ? (
                    "—"
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        {formatTime(
                          a.checkIn
                        )}
                      </span>

                      {a.isLateCheckIn &&
                        a.checkInRemark && (
                          <span
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#b45309",
                              fontWeight:
                                500,
                            }}
                          >
                            Late:{" "}
                            {
                              a.checkInRemark
                            }
                          </span>
                        )}
                    </div>
                  )}
                </td>

                {/* CHECK OUT */}

                <td>
                  {a.status === "Leave" ||
                  !a.checkOut ? (
                    "—"
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        {formatTime(
                          a.checkOut
                        )}
                      </span>

                      {a.isEarlyCheckOut &&
                        a.checkOutRemark && (
                          <span
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#dc2626",
                              fontWeight:
                                500,
                            }}
                          >
                            Early:{" "}
                            {
                              a.checkOutRemark
                            }
                          </span>
                        )}
                    </div>
                  )}
                </td>

                {/* WORKING MINUTES */}

                <td>
                  {a.workingMinutes} mins
                </td>

                {/* PAID MINUTES */}

                <td>
                  {a.paidMinutes} mins
                </td>
              </tr>
            ))}

            {/* EMPTY */}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="empty"
                >
                  No attendance records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}