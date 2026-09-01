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
  /*
   * ============================================================
   * PRINT STYLES
   * ============================================================
   *
   * Salary slip will be printed as:
   * A4 Portrait
   * 210mm × 297mm
   *
   * Only .salary-slip-print and its contents
   * will be visible while printing.
   */
  const printStyles = `
    @page {
      size: A4 portrait;
      margin: 0;
    }

    @media print {
      html,
      body {
        width: 210mm !important;
        min-width: 210mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }

      /*
       * Hide everything on the page.
       */
      body * {
        visibility: hidden;
      }

      /*
       * Show only the salary slip.
       */
      .salary-slip-print,
      .salary-slip-print * {
        visibility: visible;
      }

      /*
       * Make salary slip exactly A4 size.
       */
      .salary-slip-print {
        position: absolute !important;

        left: 0 !important;
        top: 0 !important;

        width: 210mm !important;
        min-width: 210mm !important;
        max-width: 210mm !important;

        height: 297mm !important;
        min-height: 297mm !important;
        max-height: 297mm !important;

        box-sizing: border-box !important;

        margin: 0 !important;
        padding: 15mm !important;

        background: white !important;

        overflow: hidden !important;

        page-break-after: always;
      }

      /*
       * Remove horizontal scrolling while printing.
       */
      .salary-slip-print .overflow-x-auto {
        overflow: visible !important;
      }

      /*
       * Make tables fit inside A4.
       */
      .salary-slip-print table {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
      }

      /*
       * Prevent table rows from being split
       * between pages.
       */
      .salary-slip-print tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      /*
       * Keep the salary slip itself together.
       */
      .salary-slip-print {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  `;

  /*
   * ============================================================
   * EARNINGS
   * ============================================================
   *
   * Order:
   *
   * 1. Basic
   * 2. HRA
   * 3. All other earnings / allowances
   *
   * Other earnings keep their original API order.
   */
  const earnings = slip.items
    .filter((i) => i.type === "earning")
    .sort((a, b) => {
      const getPriority = (label: string) => {
        const normalized =
          label.trim().toLowerCase();

        if (normalized === "basic") {
          return 1;
        }

        if (normalized === "hra") {
          return 2;
        }

        return 3;
      };

      return (
        getPriority(a.label) -
        getPriority(b.label)
      );
    });

  /*
   * ============================================================
   * DEDUCTIONS
   * ============================================================
   */
  const deductions = slip.items.filter(
    (i) => i.type === "deduction",
  );

  /*
   * ============================================================
   * EMPLOYEE
   * ============================================================
   */
  const employee = slip.employee;

  const employeeName =
    employee?.fullName || empName || "-";

  const employeeDepartment =
    employee?.department ||
    department ||
    "-";

  const employeeId =
    employee?.employeeId || "-";

  const designation =
    employee?.designation || "-";

  const phone =
    employee?.phone || "-";

  const bankAccount =
    employee?.bankAccount || "-";

  /*
   * ============================================================
   * CUSTOM FIELDS
   * ============================================================
   *
   * API example:
   *
   * {
   *   label: "Name Bank",
   *   value: "HDFC Bank"
   * }
   *
   * {
   *   label: "UAN No",
   *   value: "101525794635"
   * }
   *
   * {
   *   label: "DOB",
   *   value: "1999-01-01"
   * }
   *
   * {
   *   label: "ESI No",
   *   value: "5555557878"
   * }
   */
  const getCustomField = (
    label: string,
  ): string => {
    const field =
      employee?.customFields?.find(
        (item) =>
          item.label?.trim().toLowerCase() ===
          label.trim().toLowerCase(),
      );

    return field?.value || "-";
  };

  /*
   * UAN
   */
  const uanNumber =
  slip.employeeInfo?.uanNumber ||
  getCustomField("UAN No") ||
  "-";

  /*
   * Bank Name
   */
  const bankName =
  slip.employeeInfo?.bankName ||
  getCustomField("Bank Name") ||
  getCustomField("Name Bank") ||
  "-";

  /*
   * DOB
   */
  const dateOfBirth =
  slip.employeeInfo?.dob ||
  getCustomField("DOB") ||
  "-";

  /*
   * ESI Number
   */
  const esiNumber =
  slip.employeeInfo?.esiNumber ||
  getCustomField("ESI No") ||
  "-";

  /*
   * ============================================================
   * DATE FORMAT
   * ============================================================
   */
  const formatISTDate = (
    dateString?: string,
  ) => {
    if (!dateString || dateString === "-") {
      return "-";
    }

    try {
      return new Intl.DateTimeFormat(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        },
      ).format(new Date(dateString));
    } catch {
      return "-";
    }
  };

  /*
   * DOB
   */
  const formattedDateOfBirth =
    formatISTDate(dateOfBirth);

  /*
   * Joining Date
   */
  const joiningDate =
    slip.employeeInfo?.joiningDate ||
    employee?.joiningDate;

  const formattedJoiningDate =
    formatISTDate(joiningDate);

  return (
    <>
      {/* ======================================================
          A4 PRINT CSS
          ====================================================== */}
      <style>{printStyles}</style>

      {/* ======================================================
          A4 SALARY SLIP
          ====================================================== */}
      <div
        className="
          salary-slip-print
          slip
          relative
          w-full
          max-w-full
          overflow-hidden
          bg-white
        "
      >
        {/* ====================================================
            COMPANY LOGO WATERMARK
            ==================================================== */}
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

        {/* ====================================================
            ALL SALARY SLIP CONTENT
            ==================================================== */}
        <div className="relative z-10">

          {/* ==================================================
              HEADER
              ================================================== */}
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
                    break-words
                    text-lg
                    font-semibold
                    sm:text-xl
                  "
                >
                  Webapps Software Solution
                </h2>
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

          {/* ==================================================
              EMPLOYEE INFORMATION
              ================================================== */}
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

            {/* Bank Name */}
            <div className="min-w-0">
              <span className="muted">
                Bank Name:
              </span>{" "}
              <strong className="break-words">
                {bankName}
              </strong>
            </div>

            {/* UAN */}
            <div className="min-w-0">
              <span className="muted">
                UAN No:
              </span>{" "}
              <strong className="break-all">
                {uanNumber}
              </strong>
            </div>

            {/* DOB */}
            <div className="min-w-0">
              <span className="muted">
                DOB:
              </span>{" "}
              <strong>
                {formattedDateOfBirth}
              </strong>
            </div>

            {/* ESI */}
            <div className="min-w-0">
              <span className="muted">
                ESI No:
              </span>{" "}
              <strong className="break-all">
                {esiNumber}
              </strong>
            </div>

            {/* Joining Date */}
            <div className="min-w-0">
              <span className="muted">
                Joining Date:
              </span>{" "}
              <strong>
                {formattedJoiningDate}
              </strong>
            </div>
          </div>

          {/* ==================================================
              SALARY SUMMARY
              ================================================== */}
          <div
            className="
              mb-5
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
            "
          >
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

            {/* Absent Days */}
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
          </div>

          {/* ==================================================
              EARNINGS
              ================================================== */}
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

                {/* GROSS SALARY */}
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
                      {slip.totalEarnings.toLocaleString()}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ==================================================
              DEDUCTIONS
              ================================================== */}
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

              {/* ==================================================
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

          {/* ==================================================
              PF INFORMATION
              ================================================== */}
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
              <div>
                <span className="muted">
                  PF Applicable:
                </span>{" "}
                <strong>
                  Yes
                </strong>
              </div>
            </div>
          )}

          {/* ==================================================
              FOOTER
              ================================================== */}
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

          {/* ==================================================
              SLIP ID
              ================================================== */}
          <div className="min-w-0">
            <strong className="break-all">
              {slip.id}
            </strong>
          </div>
        </div>
      </div>
    </>
  );
}

