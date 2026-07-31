import { createFileRoute } from "@tanstack/react-router";
import { useDB } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/user/projects")({ component: Page });

function Page() {
  const db = useDB();
  const { session } = useAuth();
  const mine = db.projects.filter((p) => p.assigned.includes(session!.id));
  

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: "1rem" }}>
      {mine.map((p) => (
        <div className="card" key={p.id}>
          <div className="flex-between mb-1"><h3 style={{ margin: 0 }}>{p.name}</h3><span className="badge purple">{p.status.replace("_", " ")}</span></div>
          <p className="muted" style={{ fontSize: ".82rem" }}>{p.consumerName}</p>
          <p style={{ fontSize: ".88rem" }}>{p.description}</p>
          <div className="muted" style={{ fontSize: ".8rem" }}>
            <div>📅 {p.startDate} → {p.endDate} ({p.durationDays} days)</div>
            <div>👥 {p.assigned.length} assigned</div>
          </div>
        </div>
      ))}
      {mine.length === 0 && <div className="empty">No projects assigned to you yet.</div>}
    </div>
  );
}
