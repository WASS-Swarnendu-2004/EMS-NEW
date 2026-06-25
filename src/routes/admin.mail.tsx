import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { store, useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/admin/mail")({ component: Page });

function Page() {
  const db = useDB();
  const [to, setTo] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState("");
  const [sentMsg, setSentMsg] = useState<string | null>(null);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!to || !subject || !body) return;
    store.sendMail({ toEmployeeId: to, subject, body, attachmentName: attachment || undefined });
    setSentMsg("Message queued (mock — no actual email sent).");
    setSubject(""); setBody(""); setAttachment("");
    setTimeout(() => setSentMsg(null), 3500);
  }

  function exportXlsx() {
    exportToExcel(db.mail.map((m) => {
      const e = db.employees.find((x) => x.id === m.toEmployeeId);
      return { To: e?.name, Email: e?.email, Subject: m.subject, Body: m.body, Attachment: m.attachmentName ?? "", Sent: m.sentAt };
    }), "mail-history.xlsx", "Mail");
  }

  return (
    <>
      <div className="row-2">
        <div className="card">
          <div className="card-header"><h2>Compose message</h2></div>
          <form onSubmit={send}>
            <div className="field"><label>To (employee)</label>
              <select className="select" value={to} onChange={(e) => setTo(e.target.value)} required>
                <option value="">Select an employee…</option>
                {db.employees.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.email}</option>)}
              </select>
            </div>
            <div className="field"><label>Subject</label><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} required /></div>
            <div className="field"><label>Message</label><textarea className="textarea" value={body} onChange={(e) => setBody(e.target.value)} required style={{ minHeight: 140 }} /></div>
            <div className="field"><label>Attachment (file name)</label>
              <input className="input" type="file" onChange={(e) => setAttachment(e.target.files?.[0]?.name ?? "")} />
              {attachment && <div className="muted" style={{ fontSize: ".75rem" }}>📎 {attachment}</div>}
            </div>
            {sentMsg && <div className="badge success" style={{ display: "block", padding: ".5rem .75rem", marginBottom: ".75rem" }}>{sentMsg}</div>}
            <button className="btn" type="submit">Send</button>
          </form>
        </div>

        <div className="card">
          <div className="card-header"><h2>Sent history</h2><button className="btn btn-sm btn-ghost" onClick={exportXlsx}>⬇ Export</button></div>
          {db.mail.length === 0 && <div className="empty">No mails sent yet</div>}
          <div style={{ maxHeight: 480, overflow: "auto" }}>
            {db.mail.map((m) => {
              const e = db.employees.find((x) => x.id === m.toEmployeeId);
              return (
                <div key={m.id} style={{ padding: ".75rem 0", borderBottom: "1px solid var(--border, #eee)" }}>
                  <div className="flex-between"><strong>{m.subject}</strong><span className="muted" style={{ fontSize: ".75rem" }}>{m.sentAt.slice(0, 16).replace("T", " ")}</span></div>
                  <div className="muted" style={{ fontSize: ".8rem" }}>To: {e?.name} ({e?.email})</div>
                  <div style={{ marginTop: ".4rem", fontSize: ".88rem" }}>{m.body}</div>
                  {m.attachmentName && <div className="muted mt-1" style={{ fontSize: ".75rem" }}>📎 {m.attachmentName}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
