import type { SalarySlip } from "@/api/salary";
import logo1 from "@/assets/logo1.jpg";

export function SalarySlipView({
  slip,
  empName,
  department,
}: {
  slip: SalarySlip;
  empName?: string;
  department?: string;
}) {
  const earnings = slip.items.filter(
    (i) => i.type === "earning",
  );

  const deductions = slip.items.filter(
    (i) => i.type === "deduction",
  );

  const employee = slip.employee;

  const employeeName =
    employee?.fullName || empName || "-";

  const employeeDepartment =
    employee?.department || department || "-";

  const employeeId =
    employee?.employeeId || "-";

  const designation =
    employee?.designation || "-";

  const email =
    employee?.email || "-";

  const phone =
    employee?.phone || "-";

  const bankAccount =
    employee?.bankAccount || "-";

  return (
    <div
      className="
        slip
        relative
        w-full
        max-w-full
        overflow-hidden
      "
    >
      {/* =====================================================
          COMPANY LOGO WATERMARK
          ===================================================== */}
      <img
        src={logo1}
        alt=""
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          z-0
          h-[380px]
          w-[380px]
          -translate-x-1/2
          -translate-y-1/2
          object-contain
          opacity-10
          print:opacity-10
        "
      />

      {/* =====================================================
          ALL SALARY SLIP CONTENT
          ===================================================== */}
      <div className="relative z-10">
        {/* ===================================================
            HEADER
            =================================================== */}
        <div
          className="
            slip-head
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          {/* Company information */}
          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            <img
              src={logo1}
              alt="Webapps Software Solution"
              className="
                h-12
                w-12
                shrink-0
                object-contain
                sm:h-14
                sm:w-14
              "
            />

            <div className="min-w-0">
              <h2
                className="
                  text-lg
                  font-semibold
                  sm:text-xl
                  break-words
                "
              >
                Webapps Software Solution
              </h2>

              <div className="muted text-sm">
                Salary Slip · {slip.month}
              </div>
            </div>
          </div>

          {/* Issue date */}
          <div
            className="
              text-left
              sm:text-right
            "
          >
            <div className="muted text-sm">
              Issued
            </div>

            <div className="text-sm sm:text-base">
              {slip.generatedAt
                ? slip.generatedAt.slice(0, 10)
                : "-"}
            </div>
          </div>
        </div>

        {/* EMPLOYEE INFORMATION*/}
        <div
          className="
            mt-5
            mb-5
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
          "
        >
          {/* Employee Name */}
          <div className="min-w-0">
            <span className="muted">
              Employee Name:
            </span>{" "}
            <strong className="break-words">
              {employeeName}
            </strong>
          </div>

          {/* Employee ID */}
          <div className="min-w-0">
            <span className="muted">
              Employee ID:
            </span>{" "}
            <strong className="break-all">
              {employeeId}
            </strong>
          </div>

          {/* Department */}
          <div className="min-w-0">
            <span className="muted">
              Department:
            </span>{" "}
            <strong className="break-words">
              {employeeDepartment}
            </strong>
          </div>

          {/* Designation */}
          <div className="min-w-0">
            <span className="muted">
              Designation:
            </span>{" "}
            <strong className="break-words">
              {designation}
            </strong>
          </div>

          {/* Email */}
          <div className="min-w-0">
            <span className="muted">
              Email:
            </span>{" "}
            <strong className="break-all">
              {email}
            </strong>
          </div>

          {/* Phone */}
          <div className="min-w-0">
            <span className="muted">
              Phone:
            </span>{" "}
            <strong className="break-words">
              {phone}
            </strong>
          </div>

          {/* Bank Account */}
          <div className="min-w-0">
            <span className="muted">
              Bank Account:
            </span>{" "}
            <strong className="break-all">
              {bankAccount}
            </strong>
          </div>

          {/* Pay Period */}
          <div className="min-w-0">
            <span className="muted">
              Pay Period:
            </span>{" "}
            <strong>
              {slip.month}
            </strong>
          </div>

          {/* Slip ID */}
          <div className="min-w-0 sm:col-span-2">
            <span className="muted">
              Slip ID:
            </span>{" "}
            <strong className="break-all">
              {slip.id}
            </strong>
          </div>
        </div>

        {/*SALARY SUMMARY*/}
        <div
          className="
            mb-5
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
          "
        >
          {/* Gross Salary */}
          <div className="min-w-0">
            <span className="muted">
              Gross Salary:
            </span>{" "}
            <strong>
              ₹{slip.gross.toLocaleString()}
            </strong>
          </div>

          {/* Working Days */}
          {slip.workingDays !== undefined && (
            <div className="min-w-0">
              <span className="muted">
                Working Days:
              </span>{" "}
              <strong>
                {slip.workingDays}
              </strong>
            </div>
          )}
          {slip.absentDays !== undefined && (
            <div className="min-w-0">
              <span className="muted">
                Absent Days:
              </span>{" "}
              <strong>
                {slip.absentDays}
              </strong>
            </div>
          )}

          {/* Leave Deduction */}
          {slip.leaveDeduction !== undefined &&
            slip.leaveDeduction > 0 && (
              <div className="min-w-0">
                <span className="muted">
                  Leave Deduction:
                </span>{" "}
                <strong>
                  ₹
                  {slip.leaveDeduction.toLocaleString()}
                </strong>
              </div>
            )}

          {/* Early Checkout Deduction */}
          {slip.earlyCheckoutDeduction !==
            undefined &&
            slip.earlyCheckoutDeduction > 0 && (
              <div className="min-w-0">
                <span className="muted">
                  Early Checkout Deduction:
                </span>{" "}
                <strong>
                  ₹
                  {slip.earlyCheckoutDeduction.toLocaleString()}
                </strong>
              </div>
            )}
        </div>

        {/*EARNINGS*/}
        <div className="w-full overflow-x-auto">
          <table
            className="
              slip-table
              w-full
              min-w-[420px]
            "
          >
            <thead>
              <tr>
                <th className="text-left">
                  Earnings
                </th>

                <th
                  className="
                    whitespace-nowrap
                    text-right
                  "
                >
                  Amount (₹)
                </th>
              </tr>
            </thead>

            <tbody>
              {earnings.map((it, i) => (
                <tr key={i}>
                  <td className="break-words">
                    {it.label}
                  </td>

                  <td
                    className="
                      whitespace-nowrap
                      text-right
                    "
                  >
                    {it.amount.toLocaleString()}
                  </td>
                </tr>
              ))}

              <tr>
                <td>
                  <strong>
                    Total Earnings
                  </strong>
                </td>

                <td
                  className="
                    whitespace-nowrap
                    text-right
                  "
                >
                  <strong>
                    {slip.totalEarnings.toLocaleString()}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* DEDUCTIONS*/}
        <div
          className="
            mt-3
            w-full
            overflow-x-auto
          "
        >
          <table
            className="
              slip-table
              w-full
              min-w-[420px]
            "
          >
            <thead>
              <tr>
                <th className="text-left">
                  Deductions
                </th>

                <th
                  className="
                    whitespace-nowrap
                    text-right
                  "
                >
                  Amount (₹)
                </th>
              </tr>
            </thead>

            <tbody>
              {deductions.map((it, i) => (
                <tr key={i}>
                  <td className="break-words">
                    {it.label}
                  </td>

                  <td
                    className="
                      whitespace-nowrap
                      text-right
                    "
                  >
                    -{" "}
                    {it.amount.toLocaleString()}
                  </td>
                </tr>
              ))}

              {/* No deductions */}
              {deductions.length === 0 && (
                <tr>
                  <td className="muted">
                    No deductions
                  </td>

                  <td className="text-right">
                    0
                  </td>
                </tr>
              )}

              {/* Total deductions */}
              <tr>
                <td>
                  <strong>
                    Total Deductions
                  </strong>
                </td>

                <td
                  className="
                    whitespace-nowrap
                    text-right
                  "
                >
                  <strong>
                    -{" "}
                    {slip.totalDeductions.toLocaleString()}
                  </strong>
                </td>
              </tr>
            </tbody>

            {/*  NET PAY */}
            <tfoot>
              <tr>
                <td>
                  <strong>
                    Net Pay
                  </strong>
                </td>

                <td
                  className="
                    whitespace-nowrap
                    text-right
                  "
                >
                  <strong>
                    ₹ {slip.net.toLocaleString()}
                  </strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* PF INFORMATION */}
        {slip.pfApplicable && (
          <div
            className="
              mt-5
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
            "
          >
            {/* PF Applicable */}
            <div>
              <span className="muted">
                PF Applicable:
              </span>{" "}
              <strong>
                Yes
              </strong>
            </div>

            {/* PF Percentage */}
            {slip.pfPercentage !==
              undefined && (
              <div>
                <span className="muted">
                  PF Percentage:
                </span>{" "}
                <strong>
                  {slip.pfPercentage}%
                </strong>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <p
          className="
            muted
            mt-4
            text-xs
            leading-relaxed
          "
        >
          This is a system-generated salary slip
          and does not require a signature.
        </p>
      </div>
    </div>
  );
}