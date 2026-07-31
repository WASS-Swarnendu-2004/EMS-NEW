import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { getMyProjects, type Project } from "@/api/project";

export const Route = createFileRoute("/user/projects")({ component: Page });

function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadProjects();
}, []);

async function loadProjects() {
  try {
    setLoading(true);

    const data = await getMyProjects();

    setProjects(data);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load projects");
  } finally {
    setLoading(false);
  }
  }
  if (loading) {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
      <p className="text-gray-500 text-lg font-medium">
        Loading projects...
      </p>
    </div>
  );
}

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: "1rem" }}>
      {projects.map((p) => (
        <div className="card" key={p._id}>
          <div className="flex-between mb-1"><h3 style={{ margin: 0 }}>{p.projectName}</h3><span className="badge purple">{p.status.replace("-", " ")}</span></div>
          <p className="muted" style={{ fontSize: ".82rem" }}>{p.consumerName}</p>
          <p style={{ fontSize: ".88rem" }}>{p.description}</p>
          <div className="muted" style={{ fontSize: ".8rem" }}>
            <div>📅 {p.startDate} → {p.endDate} (({p.duration} days) days)</div>
            <div>👥 {p.assignedEmployees.length} assigned</div>
          </div>
        </div>
      ))}
      {projects.length === 0 &&  <div className="empty">No projects assigned to you yet.</div>}
    </div>
  );
}
