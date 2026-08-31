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
  /* -------------------------------------------------
     EARNINGS
     Order:
     1. Basic
     2. HRA
     3. Special Allowance
     4. Other earnings
  ------------------------------------------------- */

  const earnings = slip.items
    .filter((i) => i.type === "earning")
    .sort((a, b) => {
      const order = [
        "basic",
        "hra",
        "special allowance",
      ];

      const aLabel = a.label.trim().toLowerCase();
      const bLabel = b.label.trim().toLowerCase();

      const aIndex = order.findIndex((item) =>
        aLabel.includes(item),
      );

      const bIndex = order.findIndex((item) =>
        bLabel.includes(item),
      );

      // Known earnings first
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      return 0;
    });

  /* -------------------------------------------------
     DEDUCTIONS
  ------------------------------------------------- */

  const deductions = slip.items.filter(
    (i) => i.type === "deduction",
  );

  /* -------------------------------------------------
     EMPLOYEE INFORMATION
  ------------------------------------------------- */

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
      {/* =================================================
          COMPANY LOGO WATERMARK
      ================================================== */}

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

      {/* =================================================
          ALL CONTENT
      ================================================== */}

      <div className="relative z-10">

        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            slip-head
            flex
            flex-row
            items-center
            justify-between
            gap-4
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

              <div className="muted text-xs sm:text-sm">
                Salary Slip
              </div>
            </div>
          </div>

          {/* Issue date */}

          <div className="shrink-0 text-right">
            <div className="muted text-xs sm:text-sm">
              Issued
            </div>

            <div className="text-sm sm:text-base">
              {slip.generatedAt
                ? slip.generatedAt.slice(0, 10)
                : "-"}
            </div>
          </div>
        </div>

        {/* =================================================
            EMPLOYEE INFORMATION
        ================================================== */}

        <div
          className="
            mt-5
            mb-5
            grid
            grid-cols-2
            gap-x-8
            gap-y-3
            border-y
            py-4
            sm:grid-cols-3
          "
        >
          {/* Employee Name */}

          <div className="min-w-0">
            <div className="muted text-xs">
              Employee Name
            </div>

            <strong className="block break-words text-sm">
              {employeeName}
            </strong>
          </div>

          {/* Employee ID */}

          <div className="min-w-0">
            <div className="muted text-xs">
              Employee ID
            </div>

            <strong className="block break-all text-sm">
              {employeeId}
            </strong>
          </div>

          {/* Department */}

          <div className="min-w-0">
            <div className="muted text-xs">
              Department
            </div>

            <strong className="block break-words text-sm">
              {employeeDepartment}
            </strong>
          </div>

          {/* Designation */}

          <div className="min-w-0">
            <div className="muted text-xs">
              Designation
            </div>

            <strong className="block break-words text-sm">
              {designation}
            </strong>
          </div>

          {/* Phone */}

          <div className="min-w-0">
            <div className="muted text-xs">
              Phone
            </div>

            <strong className="block break-words text-sm">
              {phone}
            </strong>
          </div>

          {/* Bank Account */}

          <div className="min-w-0">
            <div className="muted text-xs">
              Bank Account
            </div>

            <strong className="block break-all text-sm">
              {bankAccount}
            </strong>
          </div>

          {/* Email */}

          {email !== "-" && (
            <div className="min-w-0 sm:col-span-3">
              <div className="muted text-xs">
                Email
              </div>

              <strong className="block break-all text-sm">
                {email}
              </strong>
            </div>
          )}
        </div>

        {/* =================================================
            SALARY SUMMARY
        ================================================== */}

        <div
          className="
            mb-5
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-4
          "
        >
          {/* Working Days */}

          {slip.workingDays !== undefined && (
            <div
              className="
                rounded-md
                border
                px-3
                py-2
              "
            >
              <div className="muted text-xs">
                Working Days
              </div>

              <strong className="text-sm">
                {slip.workingDays}
              </strong>
            </div>
          )}

          {/* Absent Days */}

          {slip.absentDays !== undefined && (
            <div
              className="
                rounded-md
                border
                px-3
                py-2
              "
            >
              <div className="muted text-xs">
                Absent Days
              </div>

              <strong className="text-sm">
                {slip.absentDays}
              </strong>
            </div>
          )}

          {/* Leave Deduction */}

          {slip.leaveDeduction !== undefined &&
            slip.leaveDeduction > 0 && (
              <div
                className="
                  rounded-md
                  border
                  px-3
                  py-2
                "
              >
                <div className="muted text-xs">
                  Leave Deduction
                </div>

                <strong className="text-sm">
                  ₹{" "}
                  {slip.leaveDeduction.toLocaleString()}
                </strong>
              </div>
            )}

          {/* PF */}

          {slip.pfApplicable && (
            <div
              className="
                rounded-md
                border
                px-3
                py-2
              "
            >
              <div className="muted text-xs">
                PF
              </div>

              <strong className="text-sm">
                {slip.pfPercentage !== undefined
                  ? `${slip.pfPercentage}%`
                  : "Applicable"}
              </strong>
            </div>
          )}
        </div>

        {/* =================================================
            EARNINGS + DEDUCTIONS
            SIDE BY SIDE
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            lg:grid-cols-2
          "
        >

          {/* =================================================
              EARNINGS
          ================================================== */}

          <div className="w-full overflow-x-auto">
            <table
              className="
                slip-table
                w-full
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

                {/* Gross Salary */}

                <tr>
                  <td>
                    <strong>
                      Gross Salary
                    </strong>
                  </td>

                  <td
                    className="
                      whitespace-nowrap
                      text-right
                    "
                  >
                    <strong>
                      ₹{" "}
                      {slip.totalEarnings.toLocaleString()}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* =================================================
              DEDUCTIONS
          ================================================== */}

          <div className="w-full overflow-x-auto">
            <table
              className="
                slip-table
                w-full
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

              {/* =================================================
                  NET PAY
              ================================================== */}

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
        </div>

        {/* =================================================
            NET PAY SUMMARY
        ================================================== */}

        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-3
          "
        >
          {/* Gross */}

          <div
            className="
              rounded-md
              border
              px-4
              py-3
            "
          >
            <div className="muted text-xs">
              Gross Salary
            </div>

            <strong className="text-base">
              ₹{" "}
              {slip.totalEarnings.toLocaleString()}
            </strong>
          </div>

          {/* Total Deduction */}

          <div
            className="
              rounded-md
              border
              px-4
              py-3
            "
          >
            <div className="muted text-xs">
              Total Deductions
            </div>

            <strong className="text-base">
              ₹{" "}
              {slip.totalDeductions.toLocaleString()}
            </strong>
          </div>

          {/* Net Pay */}

          <div
            className="
              rounded-md
              border
              px-4
              py-3
            "
          >
            <div className="muted text-xs">
              Net Pay
            </div>

            <strong className="text-lg">
              ₹ {slip.net.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================== */}

        <div
          className="
            mt-5
            flex
            flex-col
            gap-2
            border-t
            pt-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              muted
              text-xs
              leading-relaxed
            "
          >
            This is a system-generated salary slip
            and does not require a signature.
          </p>

          <div className="min-w-0 text-xs">
            <span className="muted">
              Slip ID:
            </span>{" "}
            <strong className="break-all">
              {slip.id}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}