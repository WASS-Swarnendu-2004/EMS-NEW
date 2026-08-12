// src/routes/user/advance-amount.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/user/advance-amount")({
  component: Page,
});

interface AdvanceRequest {
  _id: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

interface ReimbursementRequest {
  _id: string;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

function Page() {
  // Advance
  const [amount, setAmount] = useState("");

  // Reimbursement
  const [reimbursementAmount, setReimbursementAmount] = useState("");
  const [reimbursementReason, setReimbursementReason] = useState("");

  // History
  const [history, setHistory] = useState<AdvanceRequest[]>([]);
  const [reimbursementHistory, setReimbursementHistory] = useState<
    ReimbursementRequest[]
  >([]);

  // Loading / submitting
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reimbursementSubmitting, setReimbursementSubmitting] =
    useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);

    // Dummy advance data
    const advanceData: AdvanceRequest[] = [
      {
        _id: "1",
        amount: 5000,
        status: "Approved",
        createdAt: "2026-07-31",
      },
      {
        _id: "2",
        amount: 12000,
        status: "Pending",
        createdAt: "2026-08-01",
      },
      {
        _id: "3",
        amount: 8000,
        status: "Rejected",
        createdAt: "2026-08-02",
      },
      {
        _id: "4",
        amount: 15000,
        status: "Approved",
        createdAt: "2026-08-03",
      },
      {
        _id: "5",
        amount: 7000,
        status: "Pending",
        createdAt: "2026-08-04",
      },
      {
        _id: "6",
        amount: 9500,
        status: "Rejected",
        createdAt: "2026-08-05",
      },
    ];

    // Dummy reimbursement data
    const reimbursementData: ReimbursementRequest[] = [
      {
        _id: "r1",
        amount: 2500,
        reason: "Travel expenses",
        status: "Approved",
        createdAt: "2026-07-29",
      },
      {
        _id: "r2",
        amount: 1800,
        reason: "Client meeting expenses",
        status: "Pending",
        createdAt: "2026-08-01",
      },
      {
        _id: "r3",
        amount: 3200,
        reason: "Office related expenses",
        status: "Rejected",
        createdAt: "2026-08-03",
      },
      {
        _id: "r4",
        amount: 4500,
        reason: "Local transportation",
        status: "Approved",
        createdAt: "2026-08-05",
      },
      {
        _id: "r5",
        amount: 2100,
        reason: "Business meeting expenses",
        status: "Pending",
        createdAt: "2026-08-06",
      },
      {
        _id: "r6",
        amount: 3800,
        reason: "Travel and food expenses",
        status: "Approved",
        createdAt: "2026-08-07",
      },
    ];

    setTimeout(() => {
      setHistory(advanceData);
      setReimbursementHistory(reimbursementData);
      setLoading(false);
    }, 500);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!amount) {
      toast.error("Please enter amount");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const newRequest: AdvanceRequest = {
        _id: Date.now().toString(),
        amount: Number(amount),
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      setHistory((prev) => [newRequest, ...prev]);

      toast.success("Advance request submitted");

      setAmount("");
      setSubmitting(false);
    }, 700);
  }

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

    setReimbursementSubmitting(true);

    setTimeout(() => {
      const newRequest: ReimbursementRequest = {
        _id: `reimbursement-${Date.now()}`,
        amount: Number(reimbursementAmount),
        reason: reimbursementReason.trim(),
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      setReimbursementHistory((prev) => [newRequest, ...prev]);

      toast.success("Reimbursement request submitted");

      setReimbursementAmount("");
      setReimbursementReason("");
      setReimbursementSubmitting(false);
    }, 700);
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-lg font-medium text-gray-500">
          Loading advance history...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* =========================
          REQUEST FORMS
      ========================== */}
      <div className="row-2">
        {/* Advance Amount Form */}
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

            <button className="btn" disabled={submitting}>
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

        {/* Reimbursement Form */}
        <div className="card">
          <div className="card-header">
            <h2>Request Reimbursement</h2>
          </div>

          <form onSubmit={submitReimbursement}>
            {/* Reimbursement Amount */}
            <div className="field">
              <label>Amount</label>

              <input
                className="input"
                type="number"
                placeholder="Enter reimbursement amount"
                min={1}
                value={reimbursementAmount}
                onChange={(e) => setReimbursementAmount(e.target.value)}
                required
              />
            </div>

            {/* Reimbursement Reason */}
            <div className="field">
              <label>Reason</label>

              <textarea
                className="textarea"
                placeholder="Enter reimbursement reason..."
                value={reimbursementReason}
                onChange={(e) => setReimbursementReason(e.target.value)}
                required
              />
            </div>

            <button
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
      </div>

      {/* =========================
          HISTORY SECTIONS
      ========================== */}
      <div className="row-2 mt-6">
        {/* Advance History */}
        <div className="card">
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
                    <td>₹ {item.amount.toLocaleString()}</td>

                    <td>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

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
                  </tr>
                ))}

                {history.length === 0 && (
                  <tr>
                    <td colSpan={3} className="empty">
                      No advance requests yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reimbursement History */}
        <div className="card">
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
                    <td>₹ {item.amount.toLocaleString()}</td>

                    <td>{item.reason}</td>

                    <td>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

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
                  </tr>
                ))}

                {reimbursementHistory.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">
                      No reimbursement requests yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}