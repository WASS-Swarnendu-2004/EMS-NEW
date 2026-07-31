import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLeaves, approveLeave, rejectLeave, type Leave } from "@/api/leave";
import { useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/admin/leaves")({ component: Page });

function Page() {
  const db = useDB();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleReject = async (id: string) => {
    try {
      setProcessingId(id);

      await rejectLeave(id);

      toast.success("Leave rejected successfully");

      await fetchLeaves();
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to reject leave");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">Loading leave requests...</p>
      </div>
    );
  }

  function exportXlsx() {
    if (leaves.length === 0) {
      toast.warning("No leave requests to export");
      return;
    }

    exportToExcel(
      leaves.map((l) => ({
        EmployeeID: l.employee?.employeeId ?? "Unknown",
        Type: l.leaveType,
        From: l.fromDate,
        To: l.toDate,
        Reason: l.reason,
        Status: l.status,
        Applied: l.appliedAt,
      })),
      "leave-applications.xlsx",
      "Leaves",
    );

    toast.success("Leave requests exported successfully");
  }

  return (
    <>
      <div className="toolbar">
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={exportXlsx}>
          ⬇ Export Excel
        </button>
      </div>
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
            {leaves.map((l) => {
              return (
                <tr key={l._id}>
                  <td>{l.employee?.employeeId ?? "Unknown Employee"}</td>
                  <td>
                    <span className="badge purple">{l.leaveType}</span>
                  </td>
                  <td>{new Date(l.fromDate).toLocaleDateString()}</td>
                  <td>{new Date(l.toDate).toLocaleDateString()}</td>
                  <td style={{ maxWidth: 240 }}>{l.reason}</td>
                  <td>{new Date(l.appliedAt).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={
                        "badge " +
                        (l.status === "Approved"
                          ? "success"
                          : l.status === "Rejected"
                            ? "danger"
                            : "warn")
                      }
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="actions">
                    {l.status === "Pending" && (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleApprove(l._id)}
                          disabled={processingId === l._id}
                        >
                          {processingId === l._id ? (
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
                          onClick={() => handleReject(l._id)}
                          disabled={processingId === l._id}
                        >
                          {processingId === l._id ? (
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
    </>
  );
}
