// src/routes/admin/advance-amount.tsx

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

interface ReimbursementRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedAt: string;
}

function Page() {
  const [requests, setRequests] = useState<AdvanceRequest[]>([]);
  const [reimbursementRequests, setReimbursementRequests] = useState<ReimbursementRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"advance" | "reimbursement">("advance");

  const pendingAdvanceCount = requests.filter((item) => item.status === "Pending").length;

  const pendingReimbursementCount = reimbursementRequests.filter(
    (item) => item.status === "Pending",
  ).length;

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);

    // Dummy Advance Data
    const advanceData: AdvanceRequest[] = [
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
      {
        _id: "4",
        employeeId: "EMP0004",
        employeeName: "Sourav Ghosh",
        amount: 15000,
        status: "Pending",
        appliedAt: "2026-08-05",
      },
      {
        _id: "5",
        employeeId: "EMP0005",
        employeeName: "Arindam Roy",
        amount: 8000,
        status: "Approved",
        appliedAt: "2026-08-06",
      },
      {
        _id: "6",
        employeeId: "EMP0006",
        employeeName: "Subhajit Das",
        amount: 12000,
        status: "Pending",
        appliedAt: "2026-08-07",
      },
      {
        _id: "7",
        employeeId: "EMP0007",
        employeeName: "Abhishek Sen",
        amount: 6000,
        status: "Rejected",
        appliedAt: "2026-08-08",
      },
      {
        _id: "8",
        employeeId: "EMP0008",
        employeeName: "Rohit Sharma",
        amount: 9000,
        status: "Approved",
        appliedAt: "2026-08-09",
      },
    ];

    // Dummy Reimbursement Data
    const reimbursementData: ReimbursementRequest[] = [
      {
        _id: "r1",
        employeeId: "EMP0001",
        employeeName: "Raj Layek",
        amount: 2500,
        reason: "Travel expenses",
        status: "Approved",
        appliedAt: "2026-07-29",
      },
      {
        _id: "r2",
        employeeId: "EMP0002",
        employeeName: "Amit Kumar",
        amount: 1800,
        reason: "Client meeting expenses",
        status: "Pending",
        appliedAt: "2026-08-01",
      },
      {
        _id: "r3",
        employeeId: "EMP0003",
        employeeName: "Rahul Das",
        amount: 3200,
        reason: "Office related expenses",
        status: "Rejected",
        appliedAt: "2026-08-03",
      },
      {
        _id: "r4",
        employeeId: "EMP0004",
        employeeName: "Sourav Ghosh",
        amount: 4500,
        reason: "Local transportation",
        status: "Approved",
        appliedAt: "2026-08-05",
      },
      {
        _id: "r5",
        employeeId: "EMP0005",
        employeeName: "Arindam Roy",
        amount: 2100,
        reason: "Business meeting expenses",
        status: "Pending",
        appliedAt: "2026-08-06",
      },
      {
        _id: "r6",
        employeeId: "EMP0006",
        employeeName: "Subhajit Das",
        amount: 3800,
        reason: "Travel and food expenses",
        status: "Approved",
        appliedAt: "2026-08-07",
      },
      {
        _id: "r7",
        employeeId: "EMP0007",
        employeeName: "Abhishek Sen",
        amount: 1500,
        reason: "Transportation expenses",
        status: "Pending",
        appliedAt: "2026-08-08",
      },
      {
        _id: "r8",
        employeeId: "EMP0008",
        employeeName: "Rohit Sharma",
        amount: 2900,
        reason: "Client visit expenses",
        status: "Rejected",
        appliedAt: "2026-08-09",
      },
    ];

    setTimeout(() => {
      setRequests(advanceData);
      setReimbursementRequests(reimbursementData);
      setLoading(false);
    }, 500);
  }

  // =========================
  // ADVANCE ACTIONS
  // =========================

  async function handleApproveAdvance(id: string) {
    setProcessingId(id);

    setTimeout(() => {
      setRequests((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: "Approved" } : item)),
      );

      toast.success("Advance request approved");

      setProcessingId(null);
    }, 700);
  }

  async function handleRejectAdvance(id: string) {
    setProcessingId(id);

    setTimeout(() => {
      setRequests((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: "Rejected" } : item)),
      );

      toast.success("Advance request rejected");

      setProcessingId(null);
    }, 700);
  }

  // =========================
  // REIMBURSEMENT ACTIONS
  // =========================

  async function handleApproveReimbursement(id: string) {
    setProcessingId(id);

    setTimeout(() => {
      setReimbursementRequests((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: "Approved" } : item)),
      );

      toast.success("Reimbursement request approved");

      setProcessingId(null);
    }, 700);
  }

  async function handleRejectReimbursement(id: string) {
    setProcessingId(id);

    setTimeout(() => {
      setReimbursementRequests((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: "Rejected" } : item)),
      );

      toast.success("Reimbursement request rejected");

      setProcessingId(null);
    }, 700);
  }

  // =========================
  // EXPORT ADVANCE
  // =========================

  function exportAdvanceXlsx() {
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

  // =========================
  // EXPORT REIMBURSEMENT
  // =========================

  function exportReimbursementXlsx() {
    if (reimbursementRequests.length === 0) {
      toast.warning("No reimbursement requests to export");
      return;
    }

    exportToExcel(
      reimbursementRequests.map((r) => ({
        EmployeeID: r.employeeId,
        EmployeeName: r.employeeName,
        Amount: r.amount,
        Reason: r.reason,
        Status: r.status,
        Applied: r.appliedAt,
      })),
      "reimbursement-requests.xlsx",
      "Reimbursement",
    );

    toast.success("Reimbursement requests exported successfully");
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-lg font-medium text-gray-500">
          Loading advance and reimbursement requests...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* =========================
          TABS
      ========================== */}

      <div className="mb-4 flex gap-2">
        <button
          className={`btn ${activeTab === "advance" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setActiveTab("advance")}
        >
          <span>Advance Amount</span>

          {pendingAdvanceCount > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
              {pendingAdvanceCount}
            </span>
          )}
        </button>

        <button
          className={`btn ${activeTab === "reimbursement" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setActiveTab("reimbursement")}
        >
          <span>Reimbursement</span>

          {pendingReimbursementCount > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
              {pendingReimbursementCount}
            </span>
          )}
        </button>
      </div>

      {/* =========================
          ACTIVE TABLE CARD
      ========================== */}

      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between gap-4">
            <h2>{activeTab === "advance" ? "Advance Amount History" : "Reimbursement History"}</h2>

            <button
              className="btn btn-ghost"
              onClick={activeTab === "advance" ? exportAdvanceXlsx : exportReimbursementXlsx}
            >
              ⬇ Export Excel
            </button>
          </div>
        </div>

        {/* =========================
            ADVANCE TABLE
        ========================== */}

        {activeTab === "advance" && (
          <div className="history-table-wrap">
            <table className="table">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Amount</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th
                    style={{
                      width: "170px",
                      textAlign: "center",
                    }}
                  >
                    Action
                  </th>
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
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApproveAdvance(item._id)}
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
                            onClick={() => handleRejectAdvance(item._id)}
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
        )}

        {/* =========================
            REIMBURSEMENT TABLE
        ========================== */}

        {activeTab === "reimbursement" && (
          <div className="history-table-wrap">
            <table className="table">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th
                    style={{
                      width: "170px",
                      textAlign: "center",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {reimbursementRequests.map((item) => (
                  <tr key={item._id}>
                    <td>{item.employeeId}</td>

                    <td>{item.employeeName}</td>

                    <td>₹ {item.amount.toLocaleString()}</td>

                    <td>{item.reason}</td>

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
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApproveReimbursement(item._id)}
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
                            onClick={() => handleRejectReimbursement(item._id)}
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
                      )}
                    </td>
                  </tr>
                ))}

                {reimbursementRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty">
                      No reimbursement requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
