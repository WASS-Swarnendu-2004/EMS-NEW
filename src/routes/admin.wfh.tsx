import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getWFHApplications,
  updateWFHStatus,
  type WFHApplication,
  type WFHEmployee,
} from "@/api/wfh";
import { exportToExcel } from "@/lib/excel";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/admin/wfh")({
  component: Page,
});

type HoverPosition = {
  top: number;
  left: number;
};

function Page() {
  const [requests, setRequests] = useState<WFHApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingWFHCount = requests.filter((request) => request.status === "Pending").length;

  // --------------------------------------------------
  // EMPLOYEE HOVER POPUP
  // --------------------------------------------------

  const [hoveredEmployee, setHoveredEmployee] = useState<WFHEmployee | null>(null);

  const [hoverPosition, setHoverPosition] = useState<HoverPosition | null>(null);

  // --------------------------------------------------
  // FETCH WFH REQUESTS
  // --------------------------------------------------

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const data = await getWFHApplications();

      // Ignore requests whose employee no longer exists
      setRequests(data.filter((request) => request.employee !== null));
    } catch (err: any) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to load WFH requests");
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
    employee: WFHEmployee,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const popupWidth = 280;
    const gap = 12;

    let left = rect.right + gap;

    // If popup does not fit on right
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
  // APPROVE / REJECT
  // --------------------------------------------------

  const handleStatusUpdate = async (id: string, status: "Approved" | "Rejected") => {
    try {
      setProcessingId(id);

      await updateWFHStatus(id, status);

      toast.success(
        status === "Approved"
          ? "WFH request approved successfully"
          : "WFH request rejected successfully",
      );

      await fetchRequests();
    } catch (err: any) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to update WFH request");
    } finally {
      setProcessingId(null);
    }
  };

  // --------------------------------------------------
  // EXPORT
  // --------------------------------------------------

  function exportXlsx() {
    if (requests.length === 0) {
      toast.warning("No WFH requests to export");
      return;
    }

    exportToExcel(
      requests.map((request) => {
        const employee = request.employee;

        return {
          Employee:
            typeof employee === "string" ? employee : (employee?.fullName ?? "Unknown Employee"),

          EmployeeID: typeof employee === "string" ? employee : (employee?.employeeId ?? "Unknown"),

          From: request.fromDate.slice(0, 10),

          To: request.toDate.slice(0, 10),

          Reason: request.reason,

          Status: request.status,

          Applied: request.appliedAt.slice(0, 10),
        };
      }),
      "wfh-applications.xlsx",
      "WFH",
    );

    toast.success("WFH requests exported successfully");
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-lg font-medium text-gray-500">Loading WFH requests...</p>
      </div>
    );
  }

  return (
    <>
      {/* TOOLBAR */}

      <div className="toolbar">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">WFH Applications</h2>

          {pendingWFHCount > 0 && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
              {pendingWFHCount} Pending
            </span>
          )}
        </div>

        <span className="spacer" />

        <button className="btn btn-ghost" onClick={exportXlsx}>
          ⬇ Export Excel
        </button>
      </div>

      {/* TABLE */}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Applied</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {requests.map((request) => {
              const employee = request.employee;

              return (
                <tr key={request._id}>
                  {/* EMPLOYEE */}

                  <td>
                    {employee && typeof employee !== "string" ? (
                      <div
                        className="relative inline-flex cursor-pointer items-center gap-3"
                        onMouseEnter={(event) => handleEmployeeMouseEnter(employee, event)}
                        onMouseLeave={handleEmployeeMouseLeave}
                      >
                        {/* Profile Image */}

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

                        {/* Name + Employee ID */}

                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">{employee.fullName}</p>

                          <p className="text-xs text-gray-500">{employee.employeeId}</p>
                        </div>
                      </div>
                    ) : typeof employee === "string" ? (
                      <span className="text-gray-700">{employee}</span>
                    ) : (
                      <span className="text-gray-400">Unknown Employee</span>
                    )}
                  </td>

                  {/* FROM */}

                  <td>{request.fromDate.slice(0, 10)}</td>

                  {/* TO */}

                  <td>{request.toDate.slice(0, 10)}</td>

                  {/* REASON */}

                  <td
                    style={{
                      maxWidth: 280,
                    }}
                  >
                    {request.reason}
                  </td>

                  {/* APPLIED */}

                  <td>{request.appliedAt.slice(0, 10)}</td>

                  {/* STATUS */}

                  <td>
                    <span
                      className={
                        "badge " +
                        (request.status === "Approved"
                          ? "success"
                          : request.status === "Rejected"
                            ? "danger"
                            : "warn")
                      }
                    >
                      {request.status}
                    </span>
                  </td>

                  {/* ================================= */}
                  {/* ACTIONS */}
                  {/* ================================= */}

                  <td>
                    {/* IMPORTANT:
                        Do NOT put className="actions"
                        on the <td>.
                        
                        The flex container is INSIDE
                        the table cell so the table
                        border remains intact.
                    */}

                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {request.status === "Pending" && (
                        <>
                          {/* APPROVE */}

                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusUpdate(request._id, "Approved")}
                            disabled={processingId === request._id}
                          >
                            {processingId === request._id ? (
                              <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Approve"
                            )}
                          </button>

                          {/* REJECT */}

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleStatusUpdate(request._id, "Rejected")}
                            disabled={processingId === request._id}
                          >
                            {processingId === request._id ? (
                              <>
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Reject"
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* EMPTY */}

            {requests.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  No WFH applications
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EMPLOYEE HOVER POPUP */}

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
    </>
  );
}
