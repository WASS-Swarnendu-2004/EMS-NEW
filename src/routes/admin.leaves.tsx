import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLeaves, approveLeave, rejectLeave, type Leave, type LeaveEmployee } from "@/api/leave";
import { exportToExcel } from "@/lib/excel";
import { Loader2, X } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/admin/leaves")({
  component: Page,
});

type HoverPosition = {
  top: number;
  left: number;
};

function Page() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Employee hover popup
  const [hoveredEmployee, setHoveredEmployee] = useState<LeaveEmployee | null>(null);

  const [hoverPosition, setHoverPosition] = useState<HoverPosition | null>(null);

  // Reject modal
  const [rejectingLeave, setRejectingLeave] = useState<Leave | null>(null);

  const [rejectionRemark, setRejectionRemark] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const data = await getLeaves();

      // Ignore leave requests whose employee no longer exists
      setLeaves(data.filter((leave) => leave.employee !== null));
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // EMPLOYEE IMAGE URL
  // --------------------------------------------------

  const getEmployeeImageUrl = (profileImage?: string) => {
    if (!profileImage) {
      return null;
    }

    return `https://fresh-01.onrender.com/${profileImage.replace(/^src\//, "")}`;
  };

  // --------------------------------------------------
  // EMPLOYEE HOVER
  // --------------------------------------------------

  const handleEmployeeMouseEnter = (
    employee: LeaveEmployee,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const popupWidth = 280;
    const gap = 12;

    let left = rect.right + gap;

    // If popup doesn't fit on right
    if (left + popupWidth > window.innerWidth - 10) {
      left = rect.left - popupWidth - gap;
    }

    // Prevent going outside left
    if (left < 10) {
      left = 10;
    }

    setHoveredEmployee(employee);

    setHoverPosition({
      top: rect.top,
      left,
    });
  };

  const handleEmployeeMouseLeave = () => {
    setHoveredEmployee(null);
    setHoverPosition(null);
  };

  // --------------------------------------------------
  // APPROVE
  // --------------------------------------------------

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);

      await approveLeave(id);

      toast.success("Leave approved successfully");

      await fetchLeaves();
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to approve leave");
    } finally {
      setProcessingId(null);
    }
  };

  // --------------------------------------------------
  // OPEN REJECT MODAL
  // --------------------------------------------------

  const openRejectModal = (leave: Leave) => {
    setRejectingLeave(leave);

    // Clear previous remark
    setRejectionRemark("");

    // Hide employee popup
    setHoveredEmployee(null);
    setHoverPosition(null);
  };

  // --------------------------------------------------
  // CLOSE REJECT MODAL
  // --------------------------------------------------

  const closeRejectModal = () => {
    if (processingId) return;

    setRejectingLeave(null);
    setRejectionRemark("");
  };

  // --------------------------------------------------
  // REJECT
  // --------------------------------------------------

  const handleReject = async () => {
    if (!rejectingLeave) return;

    const remark = rejectionRemark.trim();

    if (!remark) {
      toast.warning("Please enter a rejection remark");
      return;
    }

    try {
      setProcessingId(rejectingLeave._id);

      await rejectLeave(rejectingLeave._id, remark);

      toast.success("Leave rejected successfully");

      setRejectingLeave(null);
      setRejectionRemark("");

      await fetchLeaves();
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to reject leave");
    } finally {
      setProcessingId(null);
    }
  };

  // --------------------------------------------------
  // EXPORT
  // --------------------------------------------------

  function exportXlsx() {
    if (leaves.length === 0) {
      toast.warning("No leave requests to export");
      return;
    }

    exportToExcel(
      leaves.map((l) => ({
        EmployeeID: l.employee?.employeeId ?? "Unknown",

        Employee: l.employee?.fullName ?? "Unknown Employee",

        Type: l.leaveType,

        From: l.fromDate,

        To: l.toDate,

        Reason: l.reason,

        Status: l.status,

        RejectionRemark: l.rejectionRemark ?? "",

        Applied: l.appliedAt,
      })),
      "leave-applications.xlsx",
      "Leaves",
    );

    toast.success("Leave requests exported successfully");
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-lg font-medium text-gray-500">Loading leave requests...</p>
      </div>
    );
  }

  return (
    <>
      {/* ========================================= */}
      {/* TOOLBAR */}
      {/* ========================================= */}

      <div className="toolbar">
        <span className="spacer" />

        <button className="btn btn-ghost" onClick={exportXlsx}>
          ⬇ Export Excel
        </button>
      </div>

      {/* ========================================= */}
      {/* TABLE */}
      {/* ========================================= */}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Applied</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => {
              const employee = leave.employee;

              return (
                <tr key={leave._id}>
                  {/* ================================= */}
                  {/* EMPLOYEE */}
                  {/* ================================= */}

                  <td>
                    {employee ? (
                      <div
                        className="relative inline-flex cursor-pointer items-center gap-3"
                        onMouseEnter={(event) => handleEmployeeMouseEnter(employee, event)}
                        onMouseLeave={handleEmployeeMouseLeave}
                      >
                        {/* Profile image */}

                        {getEmployeeImageUrl(employee.profileImage) ? (
                          <img
                            src={getEmployeeImageUrl(employee.profileImage)!}
                            alt={employee.fullName}
                            className="h-9 w-9 rounded-full border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                            {employee.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Name + ID */}

                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">{employee.fullName}</p>

                          <p className="text-xs text-gray-500">{employee.employeeId}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unknown Employee</span>
                    )}
                  </td>

                  {/* ================================= */}
                  {/* TYPE */}
                  {/* ================================= */}

                  <td>
                    <span className="badge purple">{leave.leaveType}</span>
                  </td>

                  {/* ================================= */}
                  {/* FROM */}
                  {/* ================================= */}

                  <td>{new Date(leave.fromDate).toLocaleDateString()}</td>

                  {/* ================================= */}
                  {/* TO */}
                  {/* ================================= */}

                  <td>{new Date(leave.toDate).toLocaleDateString()}</td>

                  {/* ================================= */}
                  {/* REASON */}
                  {/* ================================= */}

                  <td
                    style={{
                      maxWidth: 240,
                    }}
                  >
                    {leave.reason}
                  </td>

                  {/* ================================= */}
                  {/* APPLIED */}
                  {/* ================================= */}

                  <td>{new Date(leave.appliedAt).toLocaleDateString()}</td>

                  {/* ================================= */}
                  {/* STATUS */}
                  {/* ================================= */}

                  <td>
                    <span
                      className={
                        "badge " +
                        (leave.status === "Approved"
                          ? "success"
                          : leave.status === "Rejected"
                            ? "danger"
                            : "warn")
                      }
                    >
                      {leave.status}
                    </span>

                    {/* Rejection remark */}

                    {leave.status === "Rejected" && leave.rejectionRemark && (
                      <p className="mt-1 max-w-[220px] text-xs text-gray-500">
                        {leave.rejectionRemark}
                      </p>
                    )}
                  </td>

                  {/* ================================= */}
                  {/* ACTIONS */}
                  {/* ================================= */}

                  <td>
                    <div className="actions">
                      {leave.status === "Pending" && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApprove(leave._id)}
                            disabled={processingId === leave._id}
                          >
                            {processingId === leave._id ? (
                              <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Approve"
                            )}
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => openRejectModal(leave)}
                            disabled={processingId !== null}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {leaves.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  No leave applications
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================= */}
      {/* EMPLOYEE HOVER POPUP */}
      {/* ========================================= */}

      {hoveredEmployee && hoverPosition && (
        <div
          className="fixed z-[9999] w-[280px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
          style={{
            top: hoverPosition.top,
            left: hoverPosition.left,
            pointerEvents: "none",
          }}
        >
          {/* Header */}

          <div className="mb-4 flex items-center gap-3">
            {getEmployeeImageUrl(hoveredEmployee.profileImage) ? (
              <img
                src={getEmployeeImageUrl(hoveredEmployee.profileImage)!}
                alt={hoveredEmployee.fullName}
                className="h-12 w-12 shrink-0 rounded-full border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-500">
                {hoveredEmployee.fullName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {hoveredEmployee.fullName}
              </p>

              <p className="mt-0.5 text-xs text-gray-500">{hoveredEmployee.employeeId}</p>
            </div>
          </div>

          {/* Details */}

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Employee ID</span>

              <span className="font-medium text-gray-900">{hoveredEmployee.employeeId}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Role</span>

              <span className="font-medium text-gray-900">{hoveredEmployee.role || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Department</span>

              <span className="font-medium text-gray-900">
                {hoveredEmployee.department || "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* REJECT MODAL */}
      {/* ========================================= */}

      {rejectingLeave && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            {/* Modal header */}

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Reject Leave</h2>

                <p className="mt-1 text-sm text-gray-500">
                  {rejectingLeave.employee?.fullName ?? "Employee"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRejectModal}
                disabled={processingId !== null}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Leave information */}

            <div className="mb-5 rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Leave Type</span>

                <span className="font-medium text-gray-900">{rejectingLeave.leaveType}</span>
              </div>

              <div className="mt-2 flex justify-between">
                <span className="text-gray-500">Date</span>

                <span className="font-medium text-gray-900">
                  {new Date(rejectingLeave.fromDate).toLocaleDateString()} -{" "}
                  {new Date(rejectingLeave.toDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Remark */}

            <div>
              <label
                htmlFor="rejectionRemark"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Rejection Remark
              </label>

              <textarea
                id="rejectionRemark"
                value={rejectionRemark}
                onChange={(e) => setRejectionRemark(e.target.value)}
                rows={4}
                placeholder="Enter reason for rejecting this leave..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                disabled={processingId !== null}
              />
            </div>

            {/* Buttons */}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={processingId !== null}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={processingId !== null || !rejectionRemark.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingId !== null ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rejecting...
                  </span>
                ) : (
                  "Reject Leave"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
