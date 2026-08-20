import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { exportToExcel } from "@/lib/excel";
import { toast } from "react-toastify";

import {
  getAdminAdvanceRequests,
  approveAdvance,
  rejectAdvance,
  type AdvanceRequest,
} from "@/api/advance";

import {
  getAdminReimbursementRequests,
  approveReimbursement,
  rejectReimbursement,
  type ReimbursementRequest,
} from "@/api/reimbursement";

export const Route = createFileRoute("/admin/advance-amount")({
  component: Page,
});

// REJECT TYPE

type RejectType = "advance" | "reimbursement";

// PAGE

function Page() {
  const [requests, setRequests] = useState<AdvanceRequest[]>([]);

  const [reimbursementRequests, setReimbursementRequests] = useState<ReimbursementRequest[]>([]);

  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"advance" | "reimbursement">("advance");

  // REJECT MODAL

  const [rejectingRequest, setRejectingRequest] = useState<
    AdvanceRequest | ReimbursementRequest | null
  >(null);

  const [rejectType, setRejectType] = useState<RejectType | null>(null);

  const [rejectionRemark, setRejectionRemark] = useState("");

  // PENDING COUNTS

  const pendingAdvanceCount = requests.filter((item) => item.status === "Pending").length;

  const pendingReimbursementCount = reimbursementRequests.filter(
    (item) => item.status === "Pending",
  ).length;

  // FETCH DATA

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);

      const [advanceResponse, reimbursementResponse] = await Promise.all([
        getAdminAdvanceRequests(),
        getAdminReimbursementRequests(),
      ]);

      setRequests(advanceResponse.advances);

      setReimbursementRequests(reimbursementResponse.reimbursements);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load advance and reimbursement requests",
      );
    } finally {
      setLoading(false);
    }
  }

  // APPROVE ADVANCE

  async function handleApproveAdvance(id: string) {
    try {
      setProcessingId(id);

      const response = await approveAdvance(id);

      toast.success(response.message || "Advance request approved successfully");

      await fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve advance request");
    } finally {
      setProcessingId(null);
    }
  }

  // APPROVE REIMBURSEMENT

  async function handleApproveReimbursement(id: string) {
    try {
      setProcessingId(id);

      const response = await approveReimbursement(id);

      toast.success(response.message || "Reimbursement request approved successfully");

      await fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve reimbursement request");
    } finally {
      setProcessingId(null);
    }
  }

  // OPEN REJECT MODAL

  const openRejectModal = (request: AdvanceRequest | ReimbursementRequest, type: RejectType) => {
    setRejectingRequest(request);
    setRejectType(type);

    // Clear previous remark
    setRejectionRemark("");
  };

  // CLOSE REJECT MODAL

  const closeRejectModal = () => {
    if (processingId) return;

    setRejectingRequest(null);
    setRejectType(null);
    setRejectionRemark("");
  };

  // REJECT REQUEST

  const handleReject = async () => {
    if (!rejectingRequest || !rejectType) {
      return;
    }

    const remark = rejectionRemark.trim();

    if (!remark) {
      toast.warning("Please enter a rejection remark");
      return;
    }

    try {
      setProcessingId(rejectingRequest._id);

      if (rejectType === "advance") {
        const response = await rejectAdvance(rejectingRequest._id, remark);

        toast.success(response.message || "Advance request rejected successfully");
      } else {
        const response = await rejectReimbursement(rejectingRequest._id, remark);

        toast.success(response.message || "Reimbursement request rejected successfully");
      }

      // Close modal
      setRejectingRequest(null);
      setRejectType(null);
      setRejectionRemark("");

      // Reload latest data from backend
      await fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  // EXPORT ADVANCE

  function exportAdvanceXlsx() {
    if (requests.length === 0) {
      toast.warning("No advance requests to export");
      return;
    }

    exportToExcel(
      requests.map((r) => ({
        EmployeeID: typeof r.employee === "object" ? r.employee.employeeId : "-",

        EmployeeName: typeof r.employee === "object" ? r.employee.fullName : "-",

        Amount: r.amount,

        Status: r.status,

        RejectionRemark: r.status === "Rejected" ? r.adminRemark || "" : "",

        Applied: r.createdAt,
      })),
      "advance-amount-requests.xlsx",
      "Advance Amount",
    );

    toast.success("Advance requests exported successfully");
  }

  // EXPORT REIMBURSEMENT

  function exportReimbursementXlsx() {
    if (reimbursementRequests.length === 0) {
      toast.warning("No reimbursement requests to export");
      return;
    }

    exportToExcel(
      reimbursementRequests.map((r) => ({
        EmployeeID: typeof r.employee === "object" ? r.employee.employeeId : "-",

        EmployeeName: typeof r.employee === "object" ? r.employee.fullName : "-",

        Amount: r.amount,

        Reason: r.reason,

        Status: r.status,

        RejectionRemark: r.status === "Rejected" ? r.adminRemark || "" : "",

        Applied: r.createdAt,
      })),
      "reimbursement-requests.xlsx",
      "Reimbursement",
    );

    toast.success("Reimbursement requests exported successfully");
  }

  // LOADING

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

  // PAGE

  return (
    <>
      {/* TABS */}

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

      {/* ACTIVE TABLE CARD */}

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

        {/* ADVANCE TABLE */}

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
                {requests.map((item) => {
                  const employee = typeof item.employee === "object" ? item.employee : null;

                  const isProcessing = processingId === item._id;

                  return (
                    <tr key={item._id}>
                      {/* Employee ID */}

                      <td>{employee?.employeeId || "-"}</td>

                      {/* Employee Name */}

                      <td>{employee?.fullName || "-"}</td>

                      {/* Amount */}

                      <td>₹ {item.amount.toLocaleString()}</td>

                      {/* Applied On */}

                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>

                      {/* Status */}

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

                        {/* Rejection Remark */}

                        {item.status === "Rejected" && item.adminRemark && (
                          <p className="mt-1 max-w-[240px] text-xs text-gray-500">
                            {item.adminRemark}
                          </p>
                        )}
                      </td>

                      {/* Actions */}

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
                              disabled={processingId !== null}
                            >
                              {isProcessing ? (
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
                              onClick={() => openRejectModal(item, "advance")}
                              disabled={processingId !== null}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

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

        {/* REIMBURSEMENT TABLE */}

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
                {reimbursementRequests.map((item) => {
                  const employee = typeof item.employee === "object" ? item.employee : null;

                  const isProcessing = processingId === item._id;

                  return (
                    <tr key={item._id}>
                      {/* Employee ID */}

                      <td>{employee?.employeeId || "-"}</td>

                      {/* Employee Name */}

                      <td>{employee?.fullName || "-"}</td>

                      {/* Amount */}

                      <td>₹ {item.amount.toLocaleString()}</td>

                      {/* Reason */}

                      <td>{item.reason}</td>

                      {/* Applied On */}

                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>

                      {/* Status */}

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

                        {/* Rejection Remark */}

                        {item.status === "Rejected" && item.adminRemark && (
                          <p className="mt-1 max-w-[240px] text-xs text-gray-500">
                            {item.adminRemark}
                          </p>
                        )}
                      </td>

                      {/* Actions */}

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
                              disabled={processingId !== null}
                            >
                              {isProcessing ? (
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
                              onClick={() => openRejectModal(item, "reimbursement")}
                              disabled={processingId !== null}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

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

      {/* REJECT MODAL */}

      {rejectingRequest && rejectType && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            {/* Modal Header */}

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {rejectType === "advance"
                    ? "Reject Advance Request"
                    : "Reject Reimbursement Request"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {typeof rejectingRequest.employee === "object"
                    ? rejectingRequest.employee.fullName
                    : "Employee"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeRejectModal}
                disabled={processingId !== null}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Request Information */}

            <div className="mb-5 rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Employee ID</span>

                <span className="font-medium text-gray-900">
                  {typeof rejectingRequest.employee === "object"
                    ? rejectingRequest.employee.employeeId
                    : "-"}
                </span>
              </div>

              <div className="mt-2 flex justify-between">
                <span className="text-gray-500">Amount</span>

                <span className="font-medium text-gray-900">
                  ₹ {rejectingRequest.amount.toLocaleString()}
                </span>
              </div>

              {/* Reimbursement Reason */}

              {rejectType === "reimbursement" && (
                <div className="mt-2 flex items-start justify-between gap-4">
                  <span className="text-gray-500">Reason</span>

                  <span className="text-right font-medium text-gray-900">
                    {(rejectingRequest as ReimbursementRequest).reason}
                  </span>
                </div>
              )}
            </div>

            {/* Rejection Remark */}

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
                placeholder={
                  rejectType === "advance"
                    ? "Enter reason for rejecting this advance request..."
                    : "Enter reason for rejecting this reimbursement request..."
                }
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                disabled={processingId !== null}
              />
            </div>

            {/* Modal Buttons */}

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
                  "Reject Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
