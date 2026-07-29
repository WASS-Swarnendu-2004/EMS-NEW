import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAttendance, type Attendance } from "@/api/attendance";
import { exportToExcel } from "@/lib/excel";

export const Route = createFileRoute("/admin/attendance")({ component: Page });


function startOf(period: "week" | "month" | "year") {
  const d = new Date();

  if (period === "week") {
    d.setDate(d.getDate() - 7);
  } 
  else if (period === "month") {
    d.setMonth(d.getMonth() - 1);
  } 
  else {
    d.setFullYear(d.getFullYear() - 1);
  }

  return d.toISOString().slice(0, 10);
}


function Page() {

  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<
    "week" | "month" | "year"
  >("week");

  const [empId, setEmpId] = useState<string>("all");


  const fetchAttendance = async () => {

    try {

      const data = await getAttendance();

      setAttendance(data);

    } catch (error) {

      console.error("Attendance fetch error:", error);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchAttendance();

  }, []);



  const from = startOf(period);


  const filtered = attendance
    .filter((a) => {

      const employeeMatch =
        empId === "all" ||
        a.employee._id === empId;


      return (
        new Date(a.date) >= new Date(from) &&
        employeeMatch
      );

    })
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );



  const employees = Array.from(
    new Map(
      attendance.map((a) => [
        a.employee._id,
        a.employee
      ])
    ).values()
  );



  function exportXlsx() {

    exportToExcel(
      filtered.map((a) => ({

        Date: new Date(a.date).toLocaleDateString(),

        Employee:
          `${a.employee.firstName} ${a.employee.lastName}`,

        EmployeeId:
          a.employee.employeeId,

        Department:
          a.employee.department,

        Status:
          a.status,

        CheckIn:
          new Date(a.checkIn).toLocaleTimeString(),

        CheckOut:
          a.checkOut
            ? new Date(a.checkOut).toLocaleTimeString()
            : "—",

        WorkingHours:
          a.workingHours

      })),

      `attendance-${period}.xlsx`,
      "Attendance"
    );

  }



  return (
    <>

      <div className="toolbar">

        <select
          className="select"
          value={period}
          onChange={(e) =>
            setPeriod(
              e.target.value as "week" | "month" | "year"
            )
          }
          style={{ width: 160 }}
        >

          <option value="week">
            Last 7 days
          </option>

          <option value="month">
            Last 30 days
          </option>

          <option value="year">
            Last 12 months
          </option>

        </select>



        <select
          className="select"
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
          style={{ width: 220 }}
        >

          <option value="all">
            All employees
          </option>


          {
            employees.map((e) => (

              <option
                key={e._id}
                value={e._id}
              >
                {e.firstName} {e.lastName}
              </option>

            ))
          }

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

              <th>Status</th>

              <th>Check-in</th>

              <th>Check-out</th>

              <th>Working Hours</th>

            </tr>

          </thead>



          <tbody>


          {
            loading && (

              <tr>

                <td
                  colSpan={6}
                  className="empty"
                >
                  Loading attendance...
                </td>

              </tr>

            )
          }



          {
            !loading &&
            filtered.map((a) => (

              <tr key={a._id}>


                <td>
                  {new Date(a.date).toLocaleDateString()}
                </td>



                <td>

                  {a.employee.firstName}{" "}
                  {a.employee.lastName}

                  <br />

                  <small>
                    {a.employee.employeeId}
                  </small>

                </td>



                <td>

                  <span className="badge purple">

                    {a.status}

                  </span>

                </td>



                <td>

                  {new Date(a.checkIn)
                    .toLocaleTimeString()}

                </td>



                <td>

                  {
                    a.checkOut
                    ?
                    new Date(a.checkOut)
                    .toLocaleTimeString()
                    :
                    <span className="muted">
                      —
                    </span>
                  }

                </td>



                <td>

                  {a.workingHours.toFixed(2)} hrs

                </td>



              </tr>

            ))
          }



          {
            !loading &&
            filtered.length === 0 && (

              <tr>

                <td
                  colSpan={6}
                  className="empty"
                >
                  No attendance for this period
                </td>

              </tr>

            )
          }



          </tbody>


        </table>

      </div>

    </>
  );
}