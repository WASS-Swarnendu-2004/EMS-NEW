import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import {
  getAdvanceHistory,
  requestAdvance,
  type AdvanceRequest,
} from "@/api/advance";

import {
  getReimbursementHistory,
  requestReimbursement,
  type ReimbursementRequest,
} from "@/api/reimbursement";

export const Route = createFileRoute("/user/advance-amount")({
  component: Page,
});

type ActiveTab = "advance" | "reimbursement";

function Page() {
  // =========================================================
  // ACTIVE TAB
  // =========================================================

  const [activeTab, setActiveTab] = useState<ActiveTab>("advance");

  // =========================================================
  // ADVANCE FORM
  // =========================================================

  const [amount, setAmount] = useState("");

  // =========================================================
  // REIMBURSEMENT FORM
  // =========================================================

  const [reimbursementAmount, setReimbursementAmount] = useState("");
  const [reimbursementReason, setReimbursementReason] = useState("");

  // =========================================================
  // HISTORY
  // =========================================================

  const [history, setHistory] = useState<AdvanceRequest[]>([]);

  const [reimbursementHistory, setReimbursementHistory] = useState<
    ReimbursementRequest[]
  >([]);

  // =========================================================
  // LOADING / SUBMITTING
  // =========================================================

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [reimbursementSubmitting, setReimbursementSubmitting] =
    useState(false);

  // =========================================================
  // COUNTS
  // =========================================================

  const pendingAdvanceCount = history.filter(
    (item) => item.status === "Pending",
  ).length;

  const pendingReimbursementCount = reimbursementHistory.filter(
    (item) => item.status === "Pending",
  ).length;

  // =========================================================
  // FETCH HISTORY
  // =========================================================

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      setLoading(true);

      const [advanceResponse, reimbursementResponse] = await Promise.all([
        getAdvanceHistory(),
        getReimbursementHistory(),
      ]);

      setHistory(advanceResponse.advances || []);

      setReimbursementHistory(
        reimbursementResponse.reimbursements || [],
      );
    } catch (error: any) {
      console.error(
        "Fetch Advance/Reimbursement History Error:",
        error,
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to load advance and reimbursement history",
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // SUBMIT ADVANCE
  // =========================================================

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!amount) {
      toast.error("Please enter amount");
      return;
    }

    const numericAmount = Number(amount);

    if (numericAmount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      setSubmitting(true);

      const response = await requestAdvance({
        amount: numericAmount,
      });

      toast.success(
        response.message ||
          "Advance request submitted successfully",
      );

      setAmount("");

      await fetchHistory();
    } catch (error: any) {
      console.error("Submit Advance Error:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to submit advance request";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  // =========================================================
  // SUBMIT REIMBURSEMENT
  // =========================================================

  async function submitReimbursement(e: React.FormEvent) {
    e.preventDefault();

    if (!reimbursementAmount) {
      toast.error("Please enter reimbursement amount");
      return;
    }

    if (!reimbursementReason.trim()) {
      toast.error("Please enter reimbursement reason");
      return;
    }

    const numericAmount = Number(reimbursementAmount);

    if (numericAmount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      setReimbursementSubmitting(true);

      const response = await requestReimbursement({
        amount: numericAmount,
        reason: reimbursementReason.trim(),
      });

      toast.success(
        response.message ||
          "Reimbursement request submitted successfully",
      );

      setReimbursementAmount("");
      setReimbursementReason("");

      await fetchHistory();
    } catch (error: any) {
      console.error("Submit Reimbursement Error:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to submit reimbursement request";

      toast.error(message);
    } finally {
      setReimbursementSubmitting(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-lg font-medium text-gray-500">
          Loading advance and reimbursement history...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* =====================================================
          TABS
      ====================================================== */}

      <div className="mb-4 flex gap-2">
        {/* Advance Tab */}

        <button
          type="button"
          className={`btn ${
            activeTab === "advance" ? "btn-primary" : "btn-ghost"
          }`}
          onClick={() => setActiveTab("advance")}
        >
          <span>Advance Amount</span>

          {pendingAdvanceCount > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
              {pendingAdvanceCount}
            </span>
          )}
        </button>

        {/* Reimbursement Tab */}

        <button
          type="button"
          className={`btn ${
            activeTab === "reimbursement"
              ? "btn-primary"
              : "btn-ghost"
          }`}
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

      {/* =====================================================
          ADVANCE TAB
      ====================================================== */}

      {activeTab === "advance" && (
        <>
          {/* =================================================
              ADVANCE REQUEST FORM
          ================================================== */}

          <div className="card">
            <div className="card-header">
              <h2>Request Advance Amount</h2>
            </div>

            <form onSubmit={submit}>
              <div className="field">
                <label>Amount</label>

                <input
                  className="input"
                  type="number"
                  placeholder="Enter advance amount"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </form>
          </div>

          {/* =================================================
              ADVANCE HISTORY
          ================================================== */}

          <div className="card mt-6">
            <div className="card-header">
              <h2>Advance Amount History</h2>
            </div>

            <div className="history-table-wrap">
              <table className="table">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th>Amount</th>
                    <th>Request Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr key={item._id}>
                      {/* Amount */}

                      <td>
                        ₹ {item.amount.toLocaleString()}
                      </td>

                      {/* Request Date */}

                      <td>
                        {new Date(
                          item.createdAt,
                        ).toLocaleDateString()}
                      </td>

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

                        {item.status === "Rejected" &&
                          item.adminRemark && (
                            <p className="mt-1 max-w-[300px] text-xs text-gray-500">
                              {item.adminRemark}
                            </p>
                          )}
                      </td>
                    </tr>
                  ))}

                  {history.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="empty"
                      >
                        No advance requests yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =====================================================
          REIMBURSEMENT TAB
      ====================================================== */}

      {activeTab === "reimbursement" && (
        <>
          {/* =================================================
              REIMBURSEMENT REQUEST FORM
          ================================================== */}

          <div className="card">
            <div className="card-header">
              <h2>Request Reimbursement</h2>
            </div>

            <form onSubmit={submitReimbursement}>
              {/* Amount */}

              <div className="field">
                <label>Amount</label>

                <input
                  className="input"
                  type="number"
                  placeholder="Enter reimbursement amount"
                  min={1}
                  value={reimbursementAmount}
                  onChange={(e) =>
                    setReimbursementAmount(e.target.value)
                  }
                  required
                />
              </div>

              {/* Reason */}

              <div className="field">
                <label>Reason</label>

                <textarea
                  className="textarea"
                  placeholder="Enter reimbursement reason..."
                  value={reimbursementReason}
                  onChange={(e) =>
                    setReimbursementReason(e.target.value)
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="btn"
                disabled={reimbursementSubmitting}
              >
                {reimbursementSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Reimbursement"
                )}
              </button>
            </form>
          </div>

          {/* =================================================
              REIMBURSEMENT HISTORY
          ================================================== */}

          <div className="card mt-6">
            <div className="card-header">
              <h2>Reimbursement History</h2>
            </div>

            <div className="history-table-wrap">
              <table className="table">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Request Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {reimbursementHistory.map((item) => (
                    <tr key={item._id}>
                      {/* Amount */}

                      <td>
                        ₹ {item.amount.toLocaleString()}
                      </td>

                      {/* Reason */}

                      <td>{item.reason}</td>

                      {/* Request Date */}

                      <td>
                        {new Date(
                          item.createdAt,
                        ).toLocaleDateString()}
                      </td>

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

                        {item.status === "Rejected" &&
                          item.adminRemark && (
                            <p className="mt-1 max-w-[300px] text-xs text-gray-500">
                              {item.adminRemark}
                            </p>
                          )}
                      </td>
                    </tr>
                  ))}

                  {reimbursementHistory.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="empty"
                      >
                        No reimbursement requests yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}