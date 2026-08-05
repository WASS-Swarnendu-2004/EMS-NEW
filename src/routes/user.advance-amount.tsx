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

function Page() {
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState<AdvanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);

    // Dummy data
    const data: AdvanceRequest[] = [
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
    ];

    setTimeout(() => {
      setHistory(data);
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

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">
          Loading advance history...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="row-2">
        {/* Left Card */}
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

        {/* Right Card */}
        <div className="card">
          <div className="card-header">
            <h2>Advance Amount History</h2>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
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
      </div>
    </>
  );
}