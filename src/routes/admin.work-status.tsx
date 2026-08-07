import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useDB } from "@/lib/store";
import { exportToExcel } from "@/lib/excel";
import { getWorkStatus, type WorkStatus } from "@/api/workStatus";
import { getEmployees, type Employee } from "@/api/employee";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Route = createFileRoute("/admin/work-status")({ component: Page });

function Page() {
  const db = useDB();
  // const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<"today" | "week" | "month" | "custom">("today");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [empId, setEmpId] = useState("all");
  const [rows, setRows] = useState<WorkStatus[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
    loadEmployees();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);

      const data = await getWorkStatus();

      setRows(data);
    } catch (err: any) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to load work reports");
    } finally {
      setLoading(false);
    }
  }

async function loadEmployees() {
  try {
    const firstPage = await getEmployees(1);

    console.log("TOTAL EMPLOYEES:", firstPage.totalEmployees);
    console.log("TOTAL PAGES:", firstPage.totalPages);

    let allEmployees = [...firstPage.employees];

    // Fetch remaining pages
    for (let page = 2; page <= firstPage.totalPages; page++) {
      const data = await getEmployees(page);

      allEmployees = [...allEmployees, ...data.employees];
    }

    console.log("ALL EMPLOYEES:", allEmployees.length);

    setEmployees(allEmployees);
  } catch (err: any) {
    console.error(err);

    toast.error(
      err.response?.data?.message || "Failed to load employees"
    );
  }
}

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredRows = rows
    .filter((w) => {
      const workDate = new Date(w.workDate);
      workDate.setHours(0, 0, 0, 0);

      const employeeMatch =
        empId === "all" || (typeof w.employee !== "string" && w.employee._id === empId);

      if (!employeeMatch) return false;

      switch (period) {
        case "today":
          return workDate.getTime() === today.getTime();

        case "week": {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());

          return workDate >= weekStart;
        }

        case "month":
          return (
            workDate.getMonth() === today.getMonth() &&
            workDate.getFullYear() === today.getFullYear()
          );

        case "custom": {
          if (!fromDate || !toDate) return true;

          const from = new Date(fromDate);
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);

          return workDate >= from && workDate <= to;
        }

        default:
          return true;
      }
    })
    .sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime());

  // const rows = db.workStatus
  //   .filter((w) => (!date || w.date === date) && (empId === "all" || w.employeeId === empId))
  //   .sort((a, b) => b.date.localeCompare(a.date));

  function exportXlsx() {
    if (filteredRows.length === 0) {
      toast.warning("No work reports to export");
      return;
    }

    exportToExcel(
      filteredRows.map((w) => ({
        Date: w.workDate.slice(0, 10),
        Employee:
          employees.find(
            (e) => e._id === (typeof w.employee === "string" ? w.employee : w.employee._id),
          )?.fullName ?? "Unknown Employee",
        Project: w.project?.projectName ?? "—",
        Plan: w.plan,
        EndOfDayStatus: w.endOfDayStatus,
      })),
      "work-status.xlsx",
      "WorkStatus",
    );

    toast.success("Work reports exported successfully");
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        <p className="text-gray-500 text-lg font-medium">Loading work reports...</p>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        <select
          className="select"
          value={period}
          onChange={(e) => setPeriod(e.target.value as "today" | "week" | "month" | "custom")}
          style={{ width: 180 }}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Date</option>
        </select>
        {period === "custom" && (
          <>
            <input
              className="input"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              className="input"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </>
        )}
        <select
          className="select"
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
          style={{ width: 220 }}
        >
          <option value="all">All employees</option>
          {employees.map((e) => (
            <option key={e._id} value={e._id}>
              {e.fullName}
            </option>
          ))}
        </select>

        <span className="spacer" />
        <button className="btn btn-ghost" onClick={exportXlsx}>
          ⬇ Export Excel
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              {/* <th>Project</th> */}
              <th>Plan</th>
              <th>End-of-day status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((w) => (
              <tr key={w._id}>
                <td>{w.workDate.slice(0, 10)}</td>
                <td>
                  {(() => {
                    const emp =
                      typeof w.employee === "string"
                        ? employees.find((e) => e._id === w.employee)
                        : employees.find((e) => e._id === w.employee._id);
                    return emp?.fullName ?? "Unknown Employee";
                  })()}
                </td>
                {/* <td>{w.project?.projectName ?? "—"}</td> */}
                <td>{w.plan}</td>
                <td>{w.endOfDayStatus}</td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  No reports for filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
