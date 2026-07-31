import { createFileRoute } from "@tanstack/react-router";
// import { store, useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";
import { useEffect, useState } from "react";
import { getWFHApplications, updateWFHStatus, type WFHApplication } from "@/api/wfh";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/admin/wfh")({ component: Page });

function Page() {
  // const db = useDB();
  const [requests, setRequests] = useState<WFHApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const data = await getWFHApplications();

      // Remove requests whose employee has been deleted
      setRequests(data.filter((req) => req.employee !== null));
    } catch (err: any) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to load WFH requests");
    } finally {
      setLoading(false);
    }
  };

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

  function exportXlsx() {
    if (requests.length === 0) {
      toast.warning("No WFH requests to export");
      return;
    }

    exportToExcel(
      requests.map((l) => ({
        Employee: typeof l.employee === "string" ? l.employee : l.employee.employeeId,
        From: l.fromDate.slice(0, 10),
        To: l.toDate.slice(0, 10),
        Reason: l.reason,
        Status: l.status,
        Applied: l.appliedAt.slice(0, 10),
      })),
      "wfh-applications.xlsx",
      "WFH",
    );

    toast.success("WFH requests exported successfully");
  }
  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">Loading WFH requests...</p>
      </div>
    );
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
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Applied</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((l) => {
              return (
                <tr key={l._id}>
                  <td>{typeof l.employee === "string" ? l.employee : l.employee.employeeId}</td>
                  <td>{l.fromDate.slice(0, 10)}</td>
                  <td>{l.toDate.slice(0, 10)}</td>
                  <td style={{ maxWidth: 280 }}>{l.reason}</td>
                  <td>{l.appliedAt.slice(0, 10)}</td>
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
                          onClick={() => handleStatusUpdate(l._id, "Approved")}
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
                          onClick={() => handleStatusUpdate(l._id, "Rejected")}
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
    </>
  );
}
