import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
// import { store, useDB } from "@/lib/store";
import { useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";
import { sendMail, getMailHistory, type MailHistory } from "@/api/mail";
import { getEmployees, type Employee } from "@/api/employee";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/admin/mail")({ component: Page });

function Page() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [mailHistory, setMailHistory] = useState<MailHistory[]>([]);
  const [to, setTo] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState("");
  const [sentMsg, setSentMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
const [sending, setSending] = useState(false);

  async function loadMailHistory() {
  try {
    setLoading(true);

    const data = await getMailHistory();
    setMailHistory(data);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load mail history");
  } finally {
    setLoading(false);
  }
  }
  
async function loadEmployees() {
  try {
    const data = await getEmployees();
    setEmployees(data);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load employees");
  }
}

  useEffect(() => {
    loadMailHistory();
    loadEmployees();
  }, []);

 async function send(e: React.FormEvent) {
  e.preventDefault();

  if (!to || !subject || !body) return;

  try {
    setSending(true);

    await sendMail({
      employee: to,
      subject,
      message: body,
    });

    await loadMailHistory();

    toast.success("Mail sent successfully");

    setSubject("");
    setBody("");
    setAttachment("");
    setTo("");
  } catch (err) {
    console.error(err);
    toast.error("Failed to send mail");
  } finally {
    setSending(false);
  }
}

  function exportXlsx() {
    exportToExcel(
      mailHistory.map((m) => {
        return {
          To: m.employeeName,
          Email: m.employeeEmail,
          Subject: m.subject,
          Message: m.message,
          Attachment: m.attachment,
          Sent: m.sentAt,
        };
      }),
      "mail-history.xlsx",
      "Mail",
    );
  }

    if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="row-2">
        <div className="card">
          <div className="card-header">
            <h2>Compose message</h2>
          </div>
          <form onSubmit={send}>
            <div className="field">
              <label>To (employee)</label>
              <select
                className="select"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              >
                <option value="">Select an employee…</option>
                {employees.map((e) => (
  <option key={e._id} value={e._id}>
    {e.fullName} — {e.email}
  </option>
))}
              </select>
            </div>
            <div className="field">
              <label>Subject</label>
              <input
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Message</label>
              <textarea
                className="textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                style={{ minHeight: 140 }}
              />
            </div>
            <div className="field">
              <label>Attachment (file name)</label>
              <input
                className="input"
                type="file"
                onChange={(e) => setAttachment(e.target.files?.[0]?.name ?? "")}
              />
              {attachment && (
                <div className="muted" style={{ fontSize: ".75rem" }}>
                  📎 {attachment}
                </div>
              )}
            </div>
            {sentMsg && (
              <div
                className="badge success"
                style={{ display: "block", padding: ".5rem .75rem", marginBottom: ".75rem" }}
              >
                {sentMsg}
              </div>
            )}
            <button
  className="btn"
  type="submit"
  disabled={sending}
>
  {sending ? (
    <>
      <Loader2 size={16} className="animate-spin" />
      Sending...
    </>
  ) : (
    "Send"
  )}
</button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Sent history</h2>
            <button className="btn btn-sm btn-ghost" onClick={exportXlsx}>
              ⬇ Export
            </button>
          </div>
          {mailHistory.length === 0 && <div className="empty">No mails sent yet</div>}
          <div style={{ maxHeight: 480, overflow: "auto" }}>
            {mailHistory.map((m) => {
              return (
                <div
                  key={m.id}
                  style={{ padding: ".75rem 0", borderBottom: "1px solid var(--border, #eee)" }}
                >
                  <div className="flex-between">
                    <strong>{m.subject}</strong>
                    <span className="muted" style={{ fontSize: ".75rem" }}>
                      {m.sentAt.slice(0, 16).replace("T", " ")}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: ".8rem" }}>
                    To: {m.employeeName} ({m.employeeEmail})
                  </div>
                  <div style={{ marginTop: ".4rem", fontSize: ".88rem" }}>{m.message}</div>
                  {m.attachment && (
                    <div className="muted mt-1" style={{ fontSize: ".75rem" }}>
                      📎 {m.attachment}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
