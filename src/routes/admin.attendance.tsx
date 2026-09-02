import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getAttendance, overrideAttendance, type Attendance } from "@/api/attendance";
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

  const [period, setPeriod] = useState<"today" | "week" | "month" | "custom">("today");

  const [empId, setEmpId] = useState<string>("all");

  const [department, setDepartment] = useState<string>("all");

  // ADMIN OVERRIDE STATE


  const [overrideAttendanceRecord, setOverrideAttendanceRecord] = useState<Attendance | null>(null);

  const [adminRemark, setAdminRemark] = useState("");

  const [overrideLoading, setOverrideLoading] = useState(false);

  // FETCH ATTENDANCE


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

  // FETCH EMPLOYEES


  async function fetchEmployees() {
    try {
      const firstPage = await getEmployees(1);

      let allEmployees = [...firstPage.employees];

      for (let page = 2; page <= firstPage.totalPages; page++) {
        const data = await getEmployees(page);

        allEmployees = [...allEmployees, ...data.employees];
      }

      setEmployees(allEmployees);
    } catch (err: any) {
      console.error(err);

      toast.error(err.response?.data?.message || "Failed to load employees");
    }
  }


  // INITIAL LOAD


  useEffect(() => {
    Promise.all([fetchAttendance(), fetchEmployees()]);
  }, []);


  // DEPARTMENTS


  const departments = useMemo(() => {
    return Array.from(
      new Set(employees.map((employee) => employee.department).filter(Boolean)),
    ).sort();
  }, [employees]);


  // DATE FILTER


  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const filtered = attendance
    .filter((a) => {
      if (!a.employee) return false;

      const attendanceDate = new Date(a.date);

      attendanceDate.setHours(0, 0, 0, 0);

      // Employee filter
  

      const employeeMatch = empId === "all" || a.employee._id === empId;

      if (!employeeMatch) return false;

      // Department filter
      const departmentMatch = department === "all" || a.employee.department === department;

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
          if (!fromDate || !toDate) {
            return true;
          }

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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // FORMAT TIME

  function formatTime(date: string | null) {
    if (!date) return "—";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }
// APPROVE FULL DAY

  const handleOverrideAttendance = async () => {
    if (!overrideAttendanceRecord) {
      return;
    }

    if (!adminRemark.trim()) {
      toast.warning("Please enter an admin remark.");

      return;
    }

    setOverrideLoading(true);

    try {
      await overrideAttendance(overrideAttendanceRecord._id, {
        // 540 minutes = 9 hours
        adminApprovedMinutes: 540,

        adminRemark: adminRemark.trim(),
      });

      toast.success("Full day attendance approved successfully.");

      // Close modal
      setOverrideAttendanceRecord(null);

      setAdminRemark("");

      // Refresh attendance
      await fetchAttendance();
    } catch (error: any) {
      console.error("Attendance override error:", error);

      toast.error(error?.response?.data?.message || "Failed to approve full day attendance.");
    } finally {
      setOverrideLoading(false);
    }
  };

  // OPEN OVERRIDE MODAL

  const openOverrideModal = (record: Attendance) => {
    setOverrideAttendanceRecord(record);

    setAdminRemark("");
  };

  // CLOSE OVERRIDE MODAL
  
  const closeOverrideModal = () => {
    if (overrideLoading) return;

    setOverrideAttendanceRecord(null);

    setAdminRemark("");
  };

 
  // EXPORT
  

  function exportXlsx() {
    if (filtered.length === 0) {
      toast.warning("No attendance records to export");

      return;
    }

    exportToExcel(
      filtered.map((a) => ({
        Date: new Date(a.date).toLocaleDateString(),

        Employee: a.employee?.fullName ?? "Deleted Employee",

        EmployeeId: a.employee?.employeeId ?? "-",

        Department: a.employee?.department ?? "-",

        Designation: a.employee?.designation ?? "-",

        Status: a.status,

        Mode: a.mode,

        CheckIn: a.checkIn ? formatTime(a.checkIn) : "—",

        CheckInRemark: a.isLateCheckIn ? a.checkInRemark || "—" : "—",

        CheckOut: a.checkOut ? formatTime(a.checkOut) : "—",

        CheckOutRemark: a.isEarlyCheckOut ? a.checkOutRemark || "—" : "—",

        WorkingMinutes: a.workingMinutes ?? 0,

        PaidMinutes: a.paidMinutes ?? 0,

        AdminApproved: a.adminApproved ? "Yes" : "No",

        AdminApprovedMinutes: a.adminApprovedMinutes ?? 0,

        AdminRemark: a.adminRemark ?? "—",
      })),

      `attendance-${period}.xlsx`,
      "Attendance",
    );

    toast.success("Attendance exported successfully");
  }

 
  // LOADING
  

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />

        <p className="text-gray-500 text-lg font-medium">Loading attendance...</p>
      </div>
    );
  }


  // UI

  return (
    <>
      
      {/* FILTER TOOLBAR */}
      

      <div className="toolbar">
        {/* Period */}
        <select
          className="select"
          value={period}
          onChange={(e) => setPeriod(e.target.value as "today" | "week" | "month" | "custom")}
          style={{ width: 160 }}
        >
          <option value="today">Today</option>

          <option value="week">This Week</option>

          <option value="month">This Month</option>

          <option value="custom">Custom Date Range</option>
        </select>

        {/* Custom dates */}
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

        {/* Employee */}
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

        {/* Department */}
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

        <span className="muted">{filtered.length} records</span>

        <button className="btn btn-ghost" onClick={exportXlsx}>
          ⬇ Export Excel
        </button>
      </div>

    
      {/* TABLE */}
      

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

              <th>Working Minutes</th>

              <th>Admin Approval</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((a) => (
              <tr
                key={a._id}
                className={a.status?.trim().toLowerCase() === "leave" ? "leave-row" : ""}
              >
                
                {/* Date */}
               

                <td>{new Date(a.date).toLocaleDateString()}</td>

                
                {/* Employee */}
                

                <td>
                  {a.employee ? (
                    <>
                      <strong>{a.employee.fullName}</strong>

                      <br />

                      <small>{a.employee.employeeId}</small>
                    </>
                  ) : (
                    <span className="muted">Deleted Employee</span>
                  )}
                </td>

                
                {/* Department */}
                

                <td>{a.employee?.department || <span className="muted">—</span>}</td>

              
                {/* Status */}
               

                <td>
                  <span className="badge purple">{a.status}</span>
                </td>

                {/* Check In */}
                

                <td>
                  {a.checkIn ? (
                    <div>
                      <div>{formatTime(a.checkIn)}</div>

                      {a.isLateCheckIn && a.checkInRemark && (
                        <small
                          style={{
                            display: "block",
                            marginTop: "4px",
                            color: "#dc2626",
                          }}
                        >
                          Late: {a.checkInRemark}
                        </small>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>

               
                {/* Check Out */}
                

                <td>
                  {a.checkOut ? (
                    <div>
                      <div>{formatTime(a.checkOut)}</div>

                      {a.isEarlyCheckOut && a.checkOutRemark && (
                        <small
                          style={{
                            display: "block",
                            marginTop: "4px",
                            color: "#dc2626",
                          }}
                        >
                          Early: {a.checkOutRemark}
                        </small>
                      )}
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>

                {/* Working Minutes */}

                <td>{a.workingMinutes ?? 0} min</td>

                {/* Admin Approval */}

                <td>
                  {a.adminApproved ? (
                    <div>
                      <span className="badge green">Full Day Approved</span>

                      {a.adminApprovedMinutes && (
                        <small
                          style={{
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          {a.adminApprovedMinutes} min
                        </small>
                      )}
                    </div>
                  ) : a.workingMinutes < 540 ? (
                    <button className="btn btn-ghost" onClick={() => openOverrideModal(a)}>
                      Approve Full Day
                    </button>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  No attendance for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FULL DAY APPROVAL MODAL */}
      {overrideAttendanceRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeOverrideModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}

            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-900">Approve Full Day Attendance</h2>

              <p className="mt-1 text-sm text-gray-500">
                Approve 9 hours of paid attendance for this employee as an emergency exception.
              </p>
            </div>

            {/* Employee Information */}

            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Employee</p>

              <p className="font-semibold text-gray-900">
                {overrideAttendanceRecord.employee?.fullName || "Deleted Employee"}
              </p>

              <p className="mt-2 text-sm text-gray-500">Employee ID</p>

              <p className="font-medium text-gray-900">
                {overrideAttendanceRecord.employee?.employeeId || "—"}
              </p>

              <p className="mt-2 text-sm text-gray-500">Date</p>

              <p className="font-medium text-gray-900">
                {new Date(overrideAttendanceRecord.date).toLocaleDateString()}
              </p>

              <p className="mt-2 text-sm text-gray-500">Actual Working Time</p>

              <p className="font-medium text-gray-900">
                {overrideAttendanceRecord.workingMinutes} minutes
              </p>

              <p className="mt-2 text-sm text-gray-500">Approved Paid Time</p>

              <p className="font-semibold text-green-600">540 minutes (9 hours)</p>
            </div>

            {/* Admin Remark */}

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">Admin Remark</label>

              <textarea
                value={adminRemark}
                onChange={(e) => setAdminRemark(e.target.value)}
                placeholder="Enter reason for approving full day attendance..."
                rows={4}
                disabled={overrideLoading}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={overrideLoading}
                onClick={closeOverrideModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn"
                disabled={overrideLoading || !adminRemark.trim()}
                onClick={handleOverrideAttendance}
              >
                {overrideLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  "Approve Full Day"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}