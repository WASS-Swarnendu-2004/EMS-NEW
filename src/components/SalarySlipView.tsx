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
   * COMMON FALLBACK
   * ============================================================
   */

  const NOT_APPLICABLE = "Not Applicable";

  /*
   * ============================================================
   * COMPANY INFORMATION
   *
   * MOCK DATA FOR NOW
   *
   * Replace these values with the real company data later.
   * ============================================================
   */

  const COMPANY_EMAIL = "✉  account@webappsoft.com";

  const COMPANY_MOBILE = "📞 +91 03379647522";

  const COMPANY_ADDRESS = "128, Jodhpur Gardens Lake Gardens, kolkata,700045, India";

  /*
   * ============================================================
   * PRINT STYLES
   * ============================================================
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

      body * {
        visibility: hidden;
      }

      .salary-slip-print,
      .salary-slip-print * {
        visibility: visible;
      }

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

      .salary-slip-print .overflow-x-auto {
        overflow: visible !important;
      }

      .salary-slip-print table {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        table-layout: fixed !important;
      }

      .salary-slip-print table .salary-label-column {
        width: 58% !important;
      }

      .salary-slip-print table .salary-amount-column {
        width: 42% !important;
      }

      .salary-slip-print tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }

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
   */

  const earnings = slip.items
    .filter((item) => item.type === "earning")
    .sort((a, b) => {
      const getPriority = (label: string) => {
        const normalized = label.trim().toLowerCase();

        if (normalized === "basic") {
          return 1;
        }

        if (normalized === "hra") {
          return 2;
        }

        return 3;
      };

      return getPriority(a.label) - getPriority(b.label);
    });

  /*
   * ============================================================
   * DEDUCTIONS
   * ============================================================
   */

  const deductions = slip.items.filter((item) => item.type === "deduction");

  /*
   * ============================================================
   * EMPLOYEE
   * ============================================================
   */

  const employee = slip.employee;

  const employeeName = employee?.fullName || empName || NOT_APPLICABLE;

  const employeeDepartment = employee?.department || department || NOT_APPLICABLE;

  const employeeId = employee?.employeeId || NOT_APPLICABLE;

  const designation = employee?.designation || NOT_APPLICABLE;

  const phone = employee?.phone || NOT_APPLICABLE;

  /*
   * ============================================================
   * BANK ACCOUNT
   * ============================================================
   */

  const bankAccount = employee?.bankAccount || slip.employeeInfo?.bankAccount || NOT_APPLICABLE;

  /*
   * ============================================================
   * CUSTOM FIELD HELPER
   * ============================================================
   */

  const getCustomField = (label: string): string | undefined => {
    const fields = employee?.customFields;

    if (!Array.isArray(fields)) {
      return undefined;
    }

    const normalizedLabel = label.trim().toLowerCase();

    const field = fields.find((item) => {
      const itemLabel = String(item?.label ?? "")
        .trim()
        .toLowerCase();

      return itemLabel === normalizedLabel;
    });

    if (field?.value === undefined || field?.value === null) {
      return undefined;
    }

    const value = String(field.value).trim();

    return value !== "" ? value : undefined;
  };

  /*
   * ============================================================
   * PAN NUMBER
   * ============================================================
   */

  const panNumber = slip.employeeInfo?.panNumber || employee?.pan || NOT_APPLICABLE;

  /*
   * ============================================================
   * UAN NUMBER
   * ============================================================
   */

  const uanNumber = slip.employeeInfo?.uanNumber || getCustomField("UAN No") || NOT_APPLICABLE;

  /*
   * ============================================================
   * BANK NAME
   *
   * Supports:
   *
   * "Bank Name"
   * "Name Bank"
   * ============================================================
   */

  const bankName =
    slip.employeeInfo?.bankName ||
    getCustomField("Bank Name") ||
    getCustomField("Name Bank") ||
    NOT_APPLICABLE;

  /*
   * ============================================================
   * ESI NUMBER
   * ============================================================
   */

  const esiNumber = slip.employeeInfo?.esiNumber || getCustomField("ESI No") || NOT_APPLICABLE;

  /*
   * ============================================================
   * DATE FORMAT
   * ============================================================
   */

  const formatISTDate = (dateString?: string) => {
    if (!dateString || dateString === "-") {
      return NOT_APPLICABLE;
    }

    try {
      const date = new Date(dateString);

      if (Number.isNaN(date.getTime())) {
        return NOT_APPLICABLE;
      }

      return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch {
      return NOT_APPLICABLE;
    }
  };

  /*
   * ============================================================
   * JOINING DATE
   * ============================================================
   */

  const joiningDate = slip.employeeInfo?.joiningDate || employee?.joiningDate;

  const formattedJoiningDate = formatISTDate(joiningDate);

  /*
   * ============================================================
   * PAY PERIOD
   * ============================================================
   */

  const getPayPeriod = () => {
    if (!slip.month) {
      return NOT_APPLICABLE;
    }

    try {
      const [year, month] = slip.month.split("-").map(Number);

      if (!year || !month || month < 1 || month > 12) {
        return NOT_APPLICABLE;
      }

      const firstDay = new Date(year, month - 1, 1);

      const lastDay = new Date(year, month, 0);

      const formatPeriodDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date);
      };

      return `${formatPeriodDate(firstDay)} - ${formatPeriodDate(lastDay)}`;
    } catch {
      return NOT_APPLICABLE;
    }
  };

  const payPeriod = getPayPeriod();

  /*
   * ============================================================
   * ISSUED DATE
   * ============================================================
   */

  const issuedDate = formatISTDate(slip.generatedAt);

  /*
   * ============================================================
   * PAID LEAVES
   * ============================================================
   */

  const paidLeaveDays =
    slip.paidLeaveDays !== undefined
      ? slip.paidLeaveDays
      : (slip.paidCasualLeaveDays || 0) + (slip.paidSickLeaveDays || 0);

  /*
   * ============================================================
   * UNPAID LEAVES
   * ============================================================
   */

  const unpaidLeaveDays = slip.unpaidLeaveDays ?? 0;

  /*
   * ============================================================
   * PAYABLE DAYS
   * ============================================================
   */

  const payableDays = slip.payableDays;

  /*
   * ============================================================
   * DEDUCTION LABEL FORMATTER
   * ============================================================
   */

  const formatDeductionLabel = (label: string) => {
    if (!label) {
      return NOT_APPLICABLE;
    }

    return label.replace(/\s*\(\s*\d+(?:\.\d+)?%\s*\)/g, "").trim();
  };

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
    gap-3
    sm:flex-row
    sm:items-center
    sm:justify-between
  "
          >
            {/* ================================================
      COMPANY INFORMATION
      ================================================ */}

            <div
              className="
      flex
      min-w-0
      items-center
      gap-2.5
    "
            >
              <img
                src={logo1}
                alt="Webapps Software Solution"
                className="
        h-10
        w-10
        shrink-0
        object-contain
        sm:h-12
        sm:w-12
      "
              />

              <div className="min-w-0">
                <h2
                  className="
          break-words
          text-base
          font-semibold
          leading-tight
          sm:text-lg
        "
                >
                  Webapps Software Solution
                </h2>

                {/* Company Contact Details */}

                <div
                  className="
          mt-0.5
          flex
          flex-wrap
          items-center
          gap-x-2
          text-[10px]
          leading-tight
          text-gray-600
          sm:text-xs
        "
                >
                  <span>{COMPANY_EMAIL}</span>

                  <span className="text-gray-400">|</span>

                  <span>{COMPANY_MOBILE}</span>
                </div>

                {/* Company Address */}

                <div
                  className="
          mt-0.5
          max-w-[420px]
          truncate
          text-[10px]
          leading-tight
          text-gray-600
          sm:text-xs
        "
                >
                  {COMPANY_ADDRESS}
                </div>
              </div>
            </div>

            {/* ================================================
      PAY PERIOD
      ================================================ */}

            <div
              className="
      text-left
      sm:text-right
    "
            >
              <div className="muted text-xs">Pay Period</div>

              <div className="text-xs sm:text-sm">{payPeriod}</div>
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
            <div className="min-w-0">
              <span className="muted">Employee Name:</span>{" "}
              <strong className="break-words">{employeeName}</strong>
            </div>

            <div className="min-w-0">
              <span className="muted">Employee ID:</span>{" "}
              <strong className="break-all">{employeeId}</strong>
            </div>

            <div className="min-w-0">
              <span className="muted">Department:</span>{" "}
              <strong className="break-words">{employeeDepartment}</strong>
            </div>

            <div className="min-w-0">
              <span className="muted">Designation:</span>{" "}
              <strong className="break-words">{designation}</strong>
            </div>

            <div className="min-w-0">
              <span className="muted">Phone:</span> <strong className="break-words">{phone}</strong>
            </div>

            <div className="min-w-0">
              <span className="muted">Bank Account:</span>{" "}
              <strong className="break-all">{bankAccount}</strong>
            </div>

            <div className="min-w-0">
              <span className="muted">Bank Name:</span>{" "}
              <strong className="break-words">{bankName}</strong>
            </div>

            <div className="min-w-0">
              <span className="muted">PAN No:</span>{" "}
              <strong className="break-all">{panNumber}</strong>
            </div>

            <div className="min-w-0">
              <span className="muted">UAN No:</span>{" "}
              <strong className="break-all">{uanNumber}</strong>
            </div>

            <div className="min-w-0">
              <span className="muted">ESI No:</span>{" "}
              <strong className="break-all">{esiNumber}</strong>
            </div>

            <div className="min-w-0">
              <span className="muted">Joining Date:</span> <strong>{formattedJoiningDate}</strong>
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
            {slip.workingDays !== undefined && (
              <div className="min-w-0">
                <span className="muted">Working Days:</span> <strong>{slip.workingDays}</strong>
              </div>
            )}

            {slip.absentDays !== undefined && (
              <div className="min-w-0">
                <span className="muted">Absent Days:</span> <strong>{slip.absentDays}</strong>
              </div>
            )}

            <div className="min-w-0">
              <span className="muted">Paid Leaves:</span> <strong>{paidLeaveDays}</strong>
            </div>

            <div className="min-w-0">
              <span className="muted">Unpaid Leaves:</span> <strong>{unpaidLeaveDays}</strong>
            </div>

            {payableDays !== undefined && (
              <div className="min-w-0">
                <span className="muted">Payable Days:</span> <strong>{payableDays}</strong>
              </div>
            )}

            {slip.leaveDeduction !== undefined && slip.leaveDeduction > 0 && (
              <div className="min-w-0">
                <span className="muted">Leave Deduction:</span>{" "}
                <strong>₹{slip.leaveDeduction.toLocaleString()}</strong>
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
                table-fixed
              "
            >
              <colgroup>
                <col className="w-[58%]" />
                <col className="w-[42%]" />
              </colgroup>

              <thead>
                <tr>
                  <th
                    className="
                      salary-label-column
                      text-left
                    "
                  >
                    Earnings
                  </th>

                  <th
                    className="
                      salary-amount-column
                      whitespace-nowrap
                      text-right
                    "
                  >
                    Amount (₹)
                  </th>
                </tr>
              </thead>

              <tbody>
                {earnings.map((item, index) => (
                  <tr key={index}>
                    <td className="break-words">{item.label || NOT_APPLICABLE}</td>

                    <td
                      className="
                          whitespace-nowrap
                          text-right
                        "
                    >
                      {item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}

                <tr>
                  <td>
                    <strong>Gross Salary</strong>
                  </td>

                  <td
                    className="
                      whitespace-nowrap
                      text-right
                    "
                  >
                    <strong>{slip.totalEarnings.toLocaleString()}</strong>
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
                table-fixed
              "
            >
              <colgroup>
                <col className="w-[58%]" />
                <col className="w-[42%]" />
              </colgroup>

              <thead>
                <tr>
                  <th
                    className="
                      salary-label-column
                      text-left
                    "
                  >
                    Deductions
                  </th>

                  <th
                    className="
                      salary-amount-column
                      whitespace-nowrap
                      text-right
                    "
                  >
                    Amount (₹)
                  </th>
                </tr>
              </thead>

              <tbody>
                {deductions.map((item, index) => (
                  <tr key={index}>
                    <td className="break-words">{formatDeductionLabel(item.label)}</td>

                    <td
                      className="
                          whitespace-nowrap
                          text-right
                        "
                    >
                      - {item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}

                {deductions.length === 0 && (
                  <tr>
                    <td className="muted">No deductions</td>

                    <td className="text-right">0</td>
                  </tr>
                )}

                <tr>
                  <td>
                    <strong>Total Deductions</strong>
                  </td>

                  <td
                    className="
                      whitespace-nowrap
                      text-right
                    "
                  >
                    <strong>- {slip.totalDeductions.toLocaleString()}</strong>
                  </td>
                </tr>
              </tbody>

              {/* ==================================================
                  NET PAY
                  ================================================== */}

              <tfoot>
                <tr>
                  <td>
                    <strong>Net Pay</strong>
                  </td>

                  <td
                    className="
                      whitespace-nowrap
                      text-right
                    "
                  >
                    <strong>₹ {slip.net.toLocaleString()}</strong>
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
                <span className="muted">PF Applicable:</span> <strong>Yes</strong>
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
            This is a system-generated salary slip and does not require a signature.
          </p>

          {/* ==================================================
              SLIP ID
              ================================================== */}

          <div className="min-w-0">
            <strong className="break-all">{slip.id || NOT_APPLICABLE}</strong>
          </div>

          {/* ==================================================
              ISSUED DATE
              ================================================== */}

          <div className="mt-2 min-w-0">
            <span className="muted">Issued Date:</span> <strong>{issuedDate}</strong>
          </div>
        </div>
      </div>
    </>
  );
}
