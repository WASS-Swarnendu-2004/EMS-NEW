import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {useDB, today } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { getMyWorkStatus, saveWorkStatus, type WorkStatus } from "@/api/workStatus";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { getMyProjects, type Project } from "@/api/project";

export const Route = createFileRoute("/user/tasks")({ component: Page });

function Page() {
  const db = useDB();
  const { session } = useAuth();
  const empId = session!.id;
  const [date, setDate] = useState(today());
  const [history, setHistory] = useState<WorkStatus[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
  useEffect(() => {
    loadHistory();
    loadData();
  }, []);

  async function loadData() {
  try {
    setLoading(true);

    const [historyData, projectData] = await Promise.all([
      getMyWorkStatus(),
      getMyProjects(),
    ]);

    setHistory(historyData);
    setProjects(projectData);
  } catch (err: any) {
    console.error(err);

    toast.error(
      err.response?.data?.message || "Failed to load data"
    );
  } finally {
    setLoading(false);
  }
  }
  
  async function loadHistory() {
  try {
    setLoading(true);

    const data = await getMyWorkStatus();

    setHistory(data);
  } catch (err: any) {
    console.error(err);

    toast.error(
      err.response?.data?.message || "Failed to load work reports"
    );
  } finally {
    setLoading(false);
  }
}
  

  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");

  // when date changes, reset
    function changeDate(d: string) {
  setDate(d);

  const report = history.find(
    (item) => item.workDate.slice(0, 10) === d
  );

  setPlan(report?.plan ?? "");
  setStatus(report?.endOfDayStatus ?? "");
  setProjectId(report?.project?._id ?? "");
}

  // const history = db.workStatus.filter((w) => w.employeeId === empId).sort((a, b) => b.date.localeCompare(a.date));

  if (loading) {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
      <p className="text-gray-500 text-lg font-medium">
        Loading work reports...
      </p>
    </div>
  );
}

  return (
    <>
      <div className="card">
        <div className="card-header"><h2>Daily task plan</h2>
          <input className="input" type="date" value={date} onChange={(e) => changeDate(e.target.value)} style={{ width: 180 }} />
        </div>
        <div className="field">
          <label>Project</label>
          <select
  className="select"
  value={projectId}
  onChange={(e) => setProjectId(e.target.value)}
>
  <option value="">— Select project —</option>

  {projects.map((p) => (
    <option key={p._id} value={p._id}>
      {p.projectName}
    </option>
  ))}
</select>
        </div>
        <div className="field"><label>Plan for the day</label><textarea className="textarea" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="What do you plan to accomplish today?" /></div>
        <div className="field"><label>End-of-day status / blockers</label><textarea className="textarea" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Report what's done and any blockers." /></div>
        <button
  className="btn"
  disabled={saving}
  onClick={async () => {
    try {
      setSaving(true);

      await saveWorkStatus({
        project: projectId,
        workDate: date,
        plan,
        endOfDayStatus: status,
      });

      toast.success("Work report saved successfully");

      await loadData();
    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message || "Failed to save work report"
      );
    } finally {
      setSaving(false);
    }
  }}
>
  {saving ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    "Save"
  )}
</button>

      </div>

      <div className="card">
        <div className="card-header"><h2>My recent reports</h2></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Date</th>
              {/* <th>Project</th> */}
              <th>Plan</th><th>Status</th></tr></thead>
            <tbody>
              {history.slice(0, 20).map((w) => {
                const projectName = w.project?.projectName ?? "—";
                return <tr key={w._id}><td>{new Date(w.workDate).toLocaleDateString()}</td>
                  {/* <td>{projectName}</td> */}
                  <td>{w.plan}</td><td>{w.endOfDayStatus}</td></tr>;
              })}
              {history.length === 0 && <tr><td colSpan={4} className="empty">No reports yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
