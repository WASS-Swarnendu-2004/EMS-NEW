import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
// import { store, useDB, today, type LeaveApp } from "@/lib/store";
import { today } from "@/lib/store";
import { getMyLeaves, applyLeave, type Leave } from "@/api/leave";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/user/leave")({ component: Page });

function Page() {
  // const db = useDB();
  const [history, setHistory] = useState<Leave[]>([]);
  const [type, setType] = useState<"casual" | "sick" | "normal">("casual");
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!from) {
      toast.warning("Please select a From date");
      return;
    }

    if (!to) {
      toast.warning("Please select a To date");
      return;
    }

    if (from < today()) {
      toast.warning("From date cannot be in the past");
      return;
    }

    if (to < from) {
      toast.warning("To date cannot be before From date");
      return;
    }

    if (!reason.trim()) {
      toast.warning("Please enter a reason");
      return;
    }

    try {
      setSubmitting(true);

      await applyLeave({
        leaveType: type === "casual" ? "Casual" : type === "sick" ? "Sick" : "Normal",

        fromDate: from,
        toDate: to,
        reason,
      });

      toast.success("Leave application submitted successfully");

      await fetchLeaves();

      setType("casual");
      setFrom(today());
      setTo(today());
      setReason("");
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to apply for leave");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    fetchLeaves();
  }, []);
  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const data = await getMyLeaves();

      setHistory(data);
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to load leave history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">Loading leave history...</p>
      </div>
    );
  }

  return (
    <>
      <div className="row-2">
        <div className="card">
          <div className="card-header">
            <h2>Apply for leave</h2>
          </div>
          <form onSubmit={submit}>
            <div className="field">
              <label>Type</label>
              <select
                className="select"
                value={type}
                onChange={(e) => setType(e.target.value as "casual" | "sick" | "normal")}
              >
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            <div className="row-2">
              <div className="field">
                <label>From</label>
                <input
                  className="input"
                  type="date"
                  value={from}
                  min={today()}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="field">
                <label>To</label>
                <input
                  className="input"
                  type="date"
                  value={to}
                  min={from}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label>Reason</label>
              <textarea
                className="textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>My leave history</h2>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <span className="badge purple">{l.leaveType}</span>
                    </td>
                    <td>{new Date(l.fromDate).toLocaleDateString()}</td>
                    <td>{new Date(l.toDate).toLocaleDateString()}</td>
                    <td>
                      <div className="flex flex-col items-start gap-1">
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

                        {l.status === "Rejected" && l.rejectionRemark && (
                          <span className="text-xs text-red-600">{l.rejectionRemark}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">
                      No leaves yet
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
