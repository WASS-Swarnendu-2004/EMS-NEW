import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getAttendance, type Attendance } from "@/api/attendance";
import { exportToExcel } from "@/lib/excel";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { getEmployees, type Employee } from "@/api/employee";

export const Route = createFileRoute("/admin/attendance")({
  component: Page,
});

function Page() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [period, setPeriod] = useState<
    "today" | "week" | "month" | "custom"
  >("today");

  const [empId, setEmpId] = useState<string>("all");

  // Department filter
  const [department, setDepartment] = useState<string>("all");

  const fetchAttendance = async () => {
    setLoading(true);

    try {
      const data = await getAttendance();
      setAttendance(data);
    } catch (error) {
      console.error("Attendance fetch error:", error);
      toast.error("Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  async function fetchEmployees() {
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

  useEffect(() => {
    Promise.all([fetchAttendance(), fetchEmployees()]);
  }, []);

  // Get unique departments from employees
  const departments = useMemo(() => {
    return Array.from(
      new Set(
        employees
          .map((employee) => employee.department)
          .filter(Boolean)
      )
    ).sort();
  }, [employees]);

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const filtered = attendance
    .filter((a) => {
      if (!a.employee) return false;

      const attendanceDate = new Date(a.date);
      attendanceDate.setHours(0, 0, 0, 0);

      // Employee filter
      const employeeMatch =
        empId === "all" || a.employee._id === empId;

      if (!employeeMatch) return false;

      // Department filter
      const departmentMatch =
        department === "all" ||
        a.employee.department === department;

      if (!departmentMatch) return false;

      // Date filter
      switch (period) {
        case "today":
          return attendanceDate.getTime() === today.getTime();

        case "week": {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());

          return attendanceDate >= weekStart;
        }

        case "month":
          return (
            attendanceDate.getMonth() === today.getMonth() &&
            attendanceDate.getFullYear() === today.getFullYear()
          );

        case "custom": {
          if (!fromDate || !toDate) return true;

          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);

          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);

          return attendanceDate >= from && attendanceDate <= to;
        }

        default:
          return true;
      }
    })
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

  function exportXlsx() {
    exportToExcel(
      filtered.map((a) => ({
        Date: new Date(a.date).toLocaleDateString(),

        Employee: a.employee?.fullName ?? "Deleted Employee",

        EmployeeId: a.employee?.employeeId ?? "-",

        Department: a.employee?.department ?? "-",

        Status: a.status,

        CheckIn: a.checkIn
          ? new Date(a.checkIn).toLocaleTimeString()
          : "—",

        CheckOut: a.checkOut
          ? new Date(a.checkOut).toLocaleTimeString()
          : "—",

        WorkingHours: a.workingHours,
      })),

      `attendance-${period}.xlsx`,
      "Attendance"
    );
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-gray-500 text-lg font-medium">
          Loading attendance...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        {/* Period Filter */}
        <select
          className="select"
          value={period}
          onChange={(e) =>
            setPeriod(
              e.target.value as
                | "today"
                | "week"
                | "month"
                | "custom"
            )
          }
          style={{ width: 160 }}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This month</option>
          <option value="custom">Custom Date Range</option>
        </select>

        {/* Custom Date Range */}
        {period === "custom" && (
          <>
            <input
              type="date"
              className="input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              type="date"
              className="input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </>
        )}

        {/* Employee Filter */}
        <select
          className="select"
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
          style={{ width: 220 }}
        >
          <option value="all">All Employees</option>

          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.fullName}
            </option>
          ))}
        </select>

        {/* Department Filter */}
        <select
          className="select"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          style={{ width: 200 }}
        >
          <option value="all">All Departments</option>

          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <span className="spacer" />

        <span className="muted">
          {filtered.length} records
        </span>

        <button
          className="btn btn-ghost"
          onClick={exportXlsx}
        >
          ⬇ Export Excel
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Status</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Working Hours</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((a) => (
              <tr
                key={a._id}
                className={
                  a.status?.trim().toLowerCase() === "leave"
                    ? "leave-row"
                    : ""
                }
              >
                {/* Date */}
                <td>
                  {new Date(a.date).toLocaleDateString()}
                </td>

                {/* Employee */}
                <td>
                  {a.employee ? (
                    <>
                      {a.employee.fullName}

                      <br />

                      <small>{a.employee.employeeId}</small>
                    </>
                  ) : (
                    <span className="muted">
                      Deleted Employee
                    </span>
                  )}
                </td>

                {/* Department */}
                <td>
                  {a.employee?.department || (
                    <span className="muted">—</span>
                  )}
                </td>

                {/* Status */}
                <td>
                  <span className="badge purple">
                    {a.status}
                  </span>
                </td>

                {/* Check-in */}
                <td>
                  {a.checkIn
                    ? new Date(
                        a.checkIn
                      ).toLocaleTimeString()
                    : "—"}
                </td>

                {/* Check-out */}
                <td>
                  {a.checkOut ? (
                    new Date(
                      a.checkOut
                    ).toLocaleTimeString()
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>

                {/* Working Hours */}
                <td>
                  {a.workingHours.toFixed(2)} hrs
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  No attendance for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}