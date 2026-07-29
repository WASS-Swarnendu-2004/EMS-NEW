import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getMyAttendance, type Attendance } from "@/api/attendance";
import { useAuth } from "@/lib/auth";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/user/attendance")({ component: Page });

function startOf(period: "week" | "month" | "year") {
  const d = new Date();
  if (period === "week") d.setDate(d.getDate() - 7);
  else if (period === "month") d.setMonth(d.getMonth() - 1);
  else d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().slice(0, 10);
}

function Page() {
  
  const { session } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
  fetchAttendance();
}, []);


const fetchAttendance = async () => {
  try {

    const data = await getMyAttendance();

    setAttendance(data);

  } catch (error) {
    console.error(error);

  } finally {
    setLoading(false);
  }
};

  const from = startOf(period);
const rows = attendance
.filter((a)=> a.date >= from)
.sort(
(a,b)=> 
new Date(b.date).getTime() - new Date(a.date).getTime()
);

  function exportXlsx() {
    exportToExcel(rows.map((a) => ({ Date: a.date, Status:a.status, CheckIn: a.checkIn, CheckOut: a.checkOut ?? "—" })), `my-attendance-${period}.xlsx`, "Attendance");
  }

  return (
    <>
      <div className="toolbar">
        <select className="select" value={period} onChange={(e) => setPeriod(e.target.value as "week" | "month" | "year")} style={{ width: 180 }}>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="year">Last 12 months</option>
        </select>
        <span className="spacer" /><span className="muted">{rows.length} days</span>
        <button className="btn btn-ghost" onClick={exportXlsx}>⬇ Export</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Date</th><th>status</th><th>Check-in</th><th>Check-out</th>
          <th>Working Hours</th></tr></thead>
          <tbody>
            {rows.map((a)=>(
<tr key={a._id}>

<td>
{new Date(a.date).toLocaleDateString()}
</td>

<td>
<span className="badge purple">
{a.status}
</span>
</td>

<td>
{new Date(a.checkIn).toLocaleTimeString()}
</td>

<td>
{
a.checkOut 
? new Date(a.checkOut).toLocaleTimeString()
: "—"
}
</td>

<td>
{a.workingHours} hrs
</td>

</tr>
))}
            {rows.length === 0 && <tr><td colSpan={4} className="empty">No attendance records</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
