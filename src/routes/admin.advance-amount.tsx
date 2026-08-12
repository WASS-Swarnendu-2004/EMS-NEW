import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { exportToExcel } from "@/lib/excel";
import { toast } from "react-toastify";

export const Route = createFileRoute("/admin/advance-amount")({
  component: Page,
});

interface AdvanceRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  appliedAt: string;
}

function Page() {
  const [requests, setRequests] = useState<AdvanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);

    // Dummy data
    const data: AdvanceRequest[] = [
      {
        _id: "1",
        employeeId: "EMP0001",
        employeeName: "Raj Layek",
        amount: 10000,
        status: "Pending",
        appliedAt: "2026-08-04",
      },
      {
        _id: "2",
        employeeId: "EMP0002",
        employeeName: "Amit Kumar",
        amount: 7000,
        status: "Approved",
        appliedAt: "2026-08-02",
      },
      {
        _id: "3",
        employeeId: "EMP0003",
        employeeName: "Rahul Das",
        amount: 5000,
        status: "Rejected",
        appliedAt: "2026-08-01",
      },
    ];

    setTimeout(() => {
      setRequests(data);
      setLoading(false);
    }, 500);
  }

  async function handleApprove(id: string) {
    setProcessingId(id);

    setTimeout(() => {
      setRequests((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: "Approved" } : item)),
      );

      toast.success("Advance request approved");

      setProcessingId(null);
    }, 700);
  }

  async function handleReject(id: string) {
    setProcessingId(id);

    setTimeout(() => {
      setRequests((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: "Rejected" } : item)),
      );

      toast.success("Advance request rejected");

      setProcessingId(null);
    }, 700);
  }

  function exportXlsx() {
    if (requests.length === 0) {
      toast.warning("No advance requests to export");
      return;
    }

    exportToExcel(
      requests.map((r) => ({
        EmployeeID: r.employeeId,
        EmployeeName: r.employeeName,
        Amount: r.amount,
        Status: r.status,
        Applied: r.appliedAt,
      })),
      "advance-amount-requests.xlsx",
      "Advance Amount",
    );

    toast.success("Advance requests exported successfully");
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">Loading advance amount requests...</p>
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
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Amount</th>
              <th>Applied On</th>
              <th>Status</th>
              <th style={{ width: "170px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item) => (
              <tr key={item._id}>
                <td>{item.employeeId}</td>

                <td>{item.employeeName}</td>

                <td>₹ {item.amount.toLocaleString()}</td>

                <td>{new Date(item.appliedAt).toLocaleDateString()}</td>

                <td>
                  <span
                    className={
                      "badge " +
                      (item.status === "Approved"
                        ? "success"
                        : item.status === "Rejected"
                          ? "danger"
                          : "warn")
                    }
                  >
                    {item.status}
                  </span>
                </td>

                <td
                  style={{
                    minWidth: "170px",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  {item.status === "Pending" && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleApprove(item._id)}
                          disabled={processingId === item._id}
                        >
                          {processingId === item._id ? (
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
                          onClick={() => handleReject(item._id)}
                          disabled={processingId === item._id}
                        >
                          {processingId === item._id ? (
                            <>
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Reject"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  No advance amount requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
