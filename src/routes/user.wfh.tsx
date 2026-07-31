import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { today } from "@/lib/store";
import { applyWFH, getMyWFHRequests } from "@/api/wfh";
import type { WFHApplication } from "@/api/wfh";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/user/wfh")({ component: Page });

function Page() {
  // const db = useDB();
  const { session } = useAuth();
  const empId = session!.id;
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState<WFHApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const data = await getMyWFHRequests();

      setHistory(data);
    } catch (err: any) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to load WFH history");
    } finally {
      setLoading(false);
    }
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);

      await applyWFH({
        fromDate: from,
        toDate: to,
        reason,
      });

      toast.success("WFH application submitted successfully");

      setFrom(today());
      setTo(today());
      setReason("");

      await fetchHistory();
    } catch (err: any) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to apply for WFH");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">Loading ...</p>
      </div>
    );
  }

  return (
    <div className="row-2">
      <div className="card">
        <div className="card-header">
          <h2>Apply for Work From Home</h2>
        </div>
        <form onSubmit={submit}>
          <div className="row-2">
            <div className="field">
              <label>From</label>
              <input
                className="input"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="field">
              <label>To</label>
              <input
                className="input"
                type="date"
                value={to}
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
              "Submit"
            )}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>My WFH history</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((l) => (
                <tr key={l._id}>
                  <td>{l.fromDate.slice(0, 10)}</td>
                  <td>{l.toDate.slice(0, 10)}</td>
                  <td style={{ maxWidth: 220 }}>{l.reason}</td>
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
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    No WFH applications
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
