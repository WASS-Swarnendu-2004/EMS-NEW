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
   * FALLBACK
   * ============================================================
   */

  const NOT_APPLICABLE = "Not Applicable";

  /*
   * ============================================================
   * COMPANY INFORMATION
   * ============================================================
   */

  const COMPANY_EMAIL = "account@webappsoft.com";
  const COMPANY_MOBILE = "+91 03379647522";
  const COMPANY_ADDRESS =
    "128, Jodhpur Gardens, Lake Gardens, Kolkata, 700045, India";

  /*
   * ============================================================
   * PRINT STYLES
   *
   * Screen design remains unchanged.
   *
   * PRINT:
   * - A4 portrait
   * - 8mm safe margin on all four sides
   * - Complete salary slip stays inside printable area
   * - Prevents clipping at top / bottom / left / right
   * - Keeps everything on ONE A4 page
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
        height: 297mm !important;

        min-width: 210mm !important;
        min-height: 297mm !important;

        margin: 0 !important;
        padding: 0 !important;

        background: white !important;
        overflow: hidden !important;
      }

      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /*
       * Hide everything except salary slip
       */

      body * {
        visibility: hidden;
      }

      .salary-slip-print,
      .salary-slip-print * {
        visibility: visible;
      }

      /*
       * ========================================================
       * A4 OUTER PAGE
       *
       * 210mm x 297mm
       *
       * 8mm safe area on all sides
       *
       * Actual content area:
       *
       * Width  = 194mm
       * Height = 281mm
       * ========================================================
       */

      .salary-slip-print {
        position: absolute !important;

        left: 0 !important;
        top: 0 !important;

        width: 210mm !important;
        height: 297mm !important;

        min-width: 210mm !important;
        min-height: 297mm !important;

        max-width: 210mm !important;
        max-height: 297mm !important;

        margin: 0 !important;

        padding: 8mm !important;

        box-sizing: border-box !important;

        overflow: hidden !important;

        background: white !important;

        page-break-after: always !important;
        break-after: page !important;
      }

      /*
       * ========================================================
       * INNER CONTENT
       *
       * The inner design is scaled down very slightly.
       *
       * 111.112% x 0.9 = approximately 100%
       *
       * This allows the original design to retain almost all
       * of its proportions while fitting inside the 194mm
       * printable width.
       * ========================================================
       */

      .salary-slip-inner {
        position: relative !important;

        width: 111.112% !important;
        height: 111.112% !important;

        min-height: 111.112% !important;

        transform: scale(0.9) !important;
        transform-origin: top left !important;

        box-sizing: border-box !important;

        overflow: hidden !important;
      }

      /*
       * ========================================================
       * CONTENT WIDTH
       * ========================================================
       */

      .salary-slip-content {
        padding-left: 10mm !important;
        padding-right: 10mm !important;

        box-sizing: border-box !important;
      }

      /*
       * ========================================================
       * HEADER
       * ========================================================
       */

      .salary-slip-header {
        height: 48mm !important;

        min-height: 48mm !important;
        max-height: 48mm !important;

        overflow: hidden !important;
      }

      .salary-slip-header-content {
        padding-top: 7mm !important;
      }

      /*
       * ========================================================
       * NET PAY CARD
       * ========================================================
       */

      .salary-slip-net-card {
        margin-top: -14px !important;

        padding-top: 11px !important;
        padding-bottom: 11px !important;

        box-sizing: border-box !important;
      }

      /*
       * ========================================================
       * EMPLOYEE INFORMATION
       * ========================================================
       */

      .salary-slip-employee-card {
        margin-top: 17px !important;

        padding-top: 12px !important;
        padding-bottom: 12px !important;

        box-sizing: border-box !important;
      }

      .salary-slip-employee-card .info-row {
        padding-top: 3px !important;
        padding-bottom: 3px !important;

        line-height: 1.25 !important;
      }

      /*
       * ========================================================
       * SUMMARY CARDS
       * ========================================================
       */

      .salary-slip-summary {
        margin-top: 13px !important;
      }

      .salary-slip-summary-box {
        padding-top: 8px !important;
        padding-bottom: 8px !important;

        box-sizing: border-box !important;
      }

      /*
       * ========================================================
       * TABLES
       * ========================================================
       */

      .salary-slip-earnings,
      .salary-slip-deductions {
        margin-top: 14px !important;
      }

      .salary-slip-print table {
        width: 100% !important;

        min-width: 0 !important;
        max-width: 100% !important;

        table-layout: fixed !important;

        border-collapse: collapse !important;
      }

      .salary-slip-print th {
        padding-top: 7px !important;
        padding-bottom: 7px !important;

        line-height: 1.15 !important;
      }

      .salary-slip-print td {
        padding-top: 5px !important;
        padding-bottom: 5px !important;

        line-height: 1.2 !important;
      }

      .salary-slip-print tr {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /*
       * ========================================================
       * FINAL SUMMARY
       * ========================================================
       */

      .salary-slip-final-summary {
        margin-top: 13px !important;

        padding-top: 10px !important;
        padding-bottom: 10px !important;

        box-sizing: border-box !important;
      }

      /*
       * ========================================================
       * PF BADGE
       * ========================================================
       */

      .salary-slip-pf {
        margin-top: 12px !important;
      }

      /*
       * ========================================================
       * FOOTER
       * ========================================================
       */

      .salary-slip-footer {
        margin-top: 12px !important;

        padding-top: 9px !important;
        padding-bottom: 0 !important;
      }

      /*
       * ========================================================
       * HIDE NON-PRINT ELEMENTS
       * ========================================================
       */

      .salary-slip-print .no-print {
        display: none !important;
      }
    }
  `;

  /*
   * ============================================================
   * EARNINGS
   * ============================================================
   */

  const earnings = (slip.items || [])
    .filter((item) => item.type === "earning")
    .sort((a, b) => {
      const getPriority = (label: string) => {
        const normalized = label.trim().toLowerCase();

        if (normalized === "basic") return 1;
        if (normalized === "hra") return 2;

        return 3;
      };

      return getPriority(a.label) - getPriority(b.label);
    });

  /*
   * ============================================================
   * DEDUCTIONS
   * ============================================================
   */

  const deductions = (slip.items || []).filter(
    (item) => item.type === "deduction",
  );

  /*
   * ============================================================
   * EMPLOYEE
   * ============================================================
   */

  const employee = slip.employee;

  const employeeName =
    employee?.fullName || empName || NOT_APPLICABLE;

  const employeeDepartment =
    employee?.department || department || NOT_APPLICABLE;

  const employeeId =
    employee?.employeeId || NOT_APPLICABLE;

  const designation =
    employee?.designation || NOT_APPLICABLE;

  const phone =
    employee?.phone || NOT_APPLICABLE;

  /*
   * ============================================================
   * BANK ACCOUNT
   * ============================================================
   */

  const bankAccount =
    employee?.bankAccount ||
    slip.employeeInfo?.bankAccount ||
    NOT_APPLICABLE;

  /*
   * ============================================================
   * CUSTOM FIELD HELPER
   * ============================================================
   */

  const getCustomField = (
    label: string,
  ): string | undefined => {
    const fields = employee?.customFields;

    if (!Array.isArray(fields)) {
      return undefined;
    }

    const normalizedLabel =
      label.trim().toLowerCase();

    const field = fields.find((item) => {
      const itemLabel = String(
        item?.label ?? "",
      )
        .trim()
        .toLowerCase();

      return itemLabel === normalizedLabel;
    });

    if (
      field?.value === undefined ||
      field?.value === null
    ) {
      return undefined;
    }

    const value = String(field.value).trim();

    return value !== "" ? value : undefined;
  };

  /*
   * ============================================================
   * PAN
   * ============================================================
   */

  const panNumber =
    slip.employeeInfo?.panNumber ||
    employee?.pan ||
    NOT_APPLICABLE;

  /*
   * ============================================================
   * UAN
   * ============================================================
   */

  const uanNumber =
    slip.employeeInfo?.uanNumber ||
    getCustomField("UAN No") ||
    NOT_APPLICABLE;

  /*
   * ============================================================
   * BANK NAME
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

  const esiNumber =
    slip.employeeInfo?.esiNumber ||
    getCustomField("ESI No") ||
    NOT_APPLICABLE;

  /*
   * ============================================================
   * DATE FORMAT
   * ============================================================
   */

  const formatISTDate = (
    dateString?: string,
  ) => {
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

  const joiningDate =
    slip.employeeInfo?.joiningDate ||
    employee?.joiningDate;

  const formattedJoiningDate =
    formatISTDate(joiningDate);

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
      const [year, month] =
        slip.month.split("-").map(Number);

      if (
        !year ||
        !month ||
        month < 1 ||
        month > 12
      ) {
        return NOT_APPLICABLE;
      }

      const firstDay = new Date(
        year,
        month - 1,
        1,
      );

      const lastDay = new Date(
        year,
        month,
        0,
      );

      const formatPeriodDate = (
        date: Date,
      ) => {
        return new Intl.DateTimeFormat(
          "en-IN",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          },
        ).format(date);
      };

      return `${formatPeriodDate(
        firstDay,
      )} - ${formatPeriodDate(lastDay)}`;
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

  const issuedDate =
    formatISTDate(slip.generatedAt);

  /*
   * ============================================================
   * PAID LEAVES
   * ============================================================
   */

  const paidLeaveDays =
    slip.paidLeaveDays !== undefined
      ? slip.paidLeaveDays
      : (slip.paidCasualLeaveDays || 0) +
        (slip.paidSickLeaveDays || 0);

  /*
   * ============================================================
   * PAYABLE DAYS
   * ============================================================
   */

  const payableDays =
    slip.payableDays;

  /*
   * ============================================================
   * PAID DAYS
   * ============================================================
   */

  const paidDays =
    slip.paidDays ?? 0;

  /*
   * ============================================================
   * DEDUCTION LABEL
   * ============================================================
   */

  const formatDeductionLabel = (
    label: string,
  ) => {
    if (!label) {
      return NOT_APPLICABLE;
    }

    return label
      .replace(
        /\s*\(\s*\d+(?:\.\d+)?%\s*\)/g,
        "",
      )
      .trim();
  };

  /*
   * ============================================================
   * NUMBER FORMAT
   * ============================================================
   */

  const formatAmount = (
    value: number | undefined | null,
  ) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    );
  };

  /*
   * ============================================================
   * RETURN
   * ============================================================
   */

  return (
    <>
      <style>{printStyles}</style>

      <div
        className="
          salary-slip-print
          w-full
          overflow-hidden
          bg-white
        "
        style={{
          fontFamily:
            "Arial, Helvetica, sans-serif",
          color: "#29213d",
        }}
      >
        <div className="salary-slip-inner relative">
          {/* ==================================================
              PURPLE HEADER
              ================================================== */}

          <div
            className="
              salary-slip-header
              relative
              h-[193px]
              overflow-hidden
              bg-gradient-to-br
              from-[#55218a]
              via-[#7131a7]
              to-[#9a55d2]
              text-white
            "
          >
            {/* Decorative circles */}

            <div
              className="
                absolute
                -right-12
                -top-16
                h-48
                w-48
                rounded-full
                bg-white/5
              "
            />

            <div
              className="
                absolute
                right-12
                top-20
                h-28
                w-28
                rounded-full
                bg-white/5
              "
            />

            <div
              className="
                absolute
                -bottom-16
                right-20
                h-44
                w-44
                rounded-full
                bg-white/5
              "
            />

            <div
              className="
                salary-slip-header-content
                salary-slip-content
                relative
                z-10
                px-10
                pt-8
              "
            >
              {/* HEADER TOP */}

              <div className="flex items-start justify-between">
                {/* Company */}

                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-xl
                      border
                      border-white/30
                      bg-white/10
                      shadow-sm
                    "
                  >
                    <img
                      src={logo1}
                      alt="Webapps Software Solution"
                      className="
                        h-full
                        w-full
                        object-contain
                      "
                    />
                  </div>

                  <div>
                    <h1
                      className="
                        text-[25px]
                        font-bold
                        leading-none
                        tracking-tight
                        text-white
                      "
                    >
                      Webapps Software Solution
                    </h1>

                    <div
                      className="
                        mt-1
                        text-[10px]
                        text-white/75
                      "
                    >
                      {COMPANY_EMAIL}

                      <span className="mx-2">
                        |
                      </span>

                      {COMPANY_MOBILE}
                    </div>

                    <div
                      className="
                        mt-0.5
                        text-[10px]
                        text-white/75
                      "
                    >
                      {COMPANY_ADDRESS}
                    </div>
                  </div>
                </div>

                {/* Pay Period */}

                <div
                  className="
                    rounded-xl
                    border
                    border-white/20
                    bg-white/10
                    px-5
                    py-2.5
                    text-right
                    shadow-sm
                    backdrop-blur-sm
                  "
                >
                  <div
                    className="
                      text-[9px]
                      font-medium
                      uppercase
                      tracking-[2px]
                      text-white/65
                    "
                  >
                    Pay Period
                  </div>

                  <div
                    className="
                      mt-1
                      whitespace-nowrap
                      text-[14px]
                      font-bold
                    "
                  >
                    {payPeriod}
                  </div>
                </div>
              </div>

              {/* TITLE */}

              <div className="mt-6">
                <div
                  className="
                    text-[28px]
                    font-bold
                    leading-none
                  "
                >
                  Salary Slip
                </div>

                <div
                  className="
                    mt-1
                    text-[12px]
                    text-white/65
                  "
                >
                  Employee Payment Summary
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              MAIN CONTENT
              ================================================== */}

          <div
            className="
              salary-slip-content
              relative
              px-10
            "
          >
            {/* NET PAY CARD */}

            <div
              className="
                salary-slip-net-card
                relative
                z-20
                -mt-[18px]
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-purple-100
                bg-white
                px-6
                py-4
                shadow-[0_8px_22px_rgba(76,34,110,0.13)]
              "
            >
              <div>
                <div
                  className="
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[1.5px]
                    text-gray-500
                  "
                >
                  Net Pay
                </div>

                <div
                  className="
                    mt-0.5
                    text-[30px]
                    font-bold
                    leading-none
                    text-[#4d2277]
                  "
                >
                  ₹ {formatAmount(slip.net)}
                </div>
              </div>

              <div
                className="
                  text-right
                  text-[11px]
                  leading-5
                  text-gray-500
                "
              >
                {payableDays !== undefined && (
                  <div>
                    Payable Days:{" "}
                    <strong className="text-gray-700">
                      {payableDays}
                    </strong>
                  </div>
                )}

                {slip.workingDays !== undefined && (
                  <div>
                    Working Days:{" "}
                    <strong className="text-gray-700">
                      {slip.workingDays}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* EMPLOYEE INFORMATION CARD */}

            <div
              className="
                salary-slip-employee-card
                mt-7
                rounded-xl
                border
                border-purple-100
                bg-[#fcf8ff]
                px-6
                py-5
              "
            >
              <div className="grid grid-cols-2 gap-x-10">
                <InfoRow
                  label="Employee Name"
                  value={employeeName}
                />

                <InfoRow
                  label="Employee ID"
                  value={employeeId}
                />

                <InfoRow
                  label="Department"
                  value={employeeDepartment}
                />

                <InfoRow
                  label="Designation"
                  value={designation}
                />

                <InfoRow
                  label="Phone"
                  value={phone}
                />

                <InfoRow
                  label="Bank Account"
                  value={bankAccount}
                />

                <InfoRow
                  label="Bank Name"
                  value={bankName}
                />

                <InfoRow
                  label="PAN No."
                  value={panNumber}
                />

                <InfoRow
                  label="UAN No."
                  value={uanNumber}
                />

                <InfoRow
                  label="ESI No."
                  value={esiNumber}
                />

                <InfoRow
                  label="Joining Date"
                  value={formattedJoiningDate}
                />

                <InfoRow
                  label="PF Applicable"
                  value={
                    slip.pfApplicable
                      ? "Yes"
                      : "No"
                  }
                  last
                />
              </div>
            </div>

            {/* SUMMARY CARDS */}

            <div
              className="
                salary-slip-summary
                mt-5
                grid
                grid-cols-5
                gap-1
              "
            >
              <SummaryBox
                value={
                  payableDays ??
                  slip.workingDays ??
                  0
                }
                label="PAYABLE DAYS"
              />

              <SummaryBox
                value={slip.workingDays ?? 0}
                label="WORKING DAYS"
              />

              <SummaryBox
                value={slip.absentDays ?? 0}
                label="ABSENT DAYS"
              />

              <SummaryBox
                value={paidLeaveDays}
                label="PAID LEAVES"
              />

              <SummaryBox
                value={paidDays}
                label="PAID DAYS"
              />
            </div>

            {/* EARNINGS TABLE */}

            <div className="salary-slip-earnings mt-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#572285] text-white">
                    <th
                      className="
                        rounded-tl-lg
                        px-5
                        py-2.5
                        text-left
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[1px]
                      "
                    >
                      Earning
                    </th>

                    <th
                      className="
                        rounded-tr-lg
                        px-5
                        py-2.5
                        text-right
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[1px]
                      "
                    >
                      Amount (₹)
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {earnings.map(
                    (item, index) => (
                      <tr
                        key={`${item.label}-${index}`}
                        className="border-b border-gray-100"
                      >
                        <td
                          className="
                            px-5
                            py-2
                            text-[12px]
                            text-gray-700
                          "
                        >
                          {item.label ||
                            NOT_APPLICABLE}
                        </td>

                        <td
                          className="
                            px-5
                            py-2
                            text-right
                            text-[12px]
                            text-gray-700
                          "
                        >
                          {formatAmount(
                            item.amount,
                          )}
                        </td>
                      </tr>
                    ),
                  )}

                  <tr className="bg-[#fcf5ff]">
                    <td
                      className="
                        px-5
                        py-2.5
                        text-[12px]
                        font-bold
                        text-[#54257b]
                      "
                    >
                      Gross Salary
                    </td>

                    <td
                      className="
                        px-5
                        py-2.5
                        text-right
                        text-[12px]
                        font-bold
                        text-[#54257b]
                      "
                    >
                      {formatAmount(
                        slip.totalEarnings,
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DEDUCTIONS TABLE */}

            <div className="salary-slip-deductions mt-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#572285] text-white">
                    <th
                      className="
                        rounded-tl-lg
                        px-5
                        py-2.5
                        text-left
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[1px]
                      "
                    >
                      Deduction
                    </th>

                    <th
                      className="
                        rounded-tr-lg
                        px-5
                        py-2.5
                        text-right
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[1px]
                      "
                    >
                      Amount (₹)
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {deductions.map(
                    (item, index) => (
                      <tr
                        key={`${item.label}-${index}`}
                        className="border-b border-gray-100"
                      >
                        <td
                          className="
                            px-5
                            py-2
                            text-[12px]
                            text-gray-700
                          "
                        >
                          {formatDeductionLabel(
                            item.label,
                          )}
                        </td>

                        <td
                          className="
                            px-5
                            py-2
                            text-right
                            text-[12px]
                            text-[#92566d]
                          "
                        >
                          -{" "}
                          {formatAmount(
                            item.amount,
                          )}
                        </td>
                      </tr>
                    ),
                  )}

                  {deductions.length === 0 && (
                    <tr>
                      <td
                        className="
                          px-5
                          py-2
                          text-[12px]
                          text-gray-500
                        "
                      >
                        No deductions
                      </td>

                      <td
                        className="
                          px-5
                          py-2
                          text-right
                          text-[12px]
                        "
                      >
                        0.00
                      </td>
                    </tr>
                  )}

                  <tr className="bg-[#fcf5ff]">
                    <td
                      className="
                        px-5
                        py-2.5
                        text-[12px]
                        font-bold
                        text-[#54257b]
                      "
                    >
                      Total Deductions
                    </td>

                    <td
                      className="
                        px-5
                        py-2.5
                        text-right
                        text-[12px]
                        font-bold
                        text-[#92566d]
                      "
                    >
                      -{" "}
                      {formatAmount(
                        slip.totalDeductions,
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FINAL SALARY SUMMARY */}

            <div
              className="
                salary-slip-final-summary
                mt-5
                grid
                grid-cols-3
                overflow-hidden
                rounded-xl
                bg-gradient-to-r
                from-[#572285]
                via-[#7130a2]
                to-[#8f4bc0]
                px-6
                py-4
                text-white
              "
            >
              {/* Gross */}

              <div>
                <div
                  className="
                    text-[9px]
                    uppercase
                    tracking-[1.5px]
                    text-white/65
                  "
                >
                  Gross Salary
                </div>

                <div
                  className="
                    mt-1
                    text-[18px]
                    font-bold
                  "
                >
                  ₹{" "}
                  {formatAmount(
                    slip.totalEarnings,
                  )}
                </div>
              </div>

              {/* Deductions */}

              <div className="text-center">
                <div
                  className="
                    text-[9px]
                    uppercase
                    tracking-[1.5px]
                    text-white/65
                  "
                >
                  Total Deductions
                </div>

                <div
                  className="
                    mt-1
                    text-[18px]
                    font-bold
                  "
                >
                  ₹{" "}
                  {formatAmount(
                    slip.totalDeductions,
                  )}
                </div>
              </div>

              {/* Net Pay */}

              <div className="text-right">
                <div
                  className="
                    text-[9px]
                    uppercase
                    tracking-[1.5px]
                    text-white/65
                  "
                >
                  Net Pay
                </div>

                <div
                  className="
                    mt-1
                    text-[18px]
                    font-bold
                  "
                >
                  ₹{" "}
                  {formatAmount(slip.net)}
                </div>
              </div>
            </div>

            {/* PF BADGE */}

            {slip.pfApplicable && (
              <div className="salary-slip-pf mt-5">
                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    bg-[#eefaf0]
                    px-2.5
                    py-1
                    text-[10px]
                    font-semibold
                    text-[#438b58]
                  "
                >
                  ✓ PF Applicable
                </span>
              </div>
            )}

            {/* FOOTER */}

            <div
              className="
                salary-slip-footer
                mt-5
                border-t
                border-gray-200
                pt-4
              "
            >
              <div className="flex items-end justify-between">
                <div>
                  <p
                    className="
                      text-[10px]
                      text-gray-400
                    "
                  >
                    This is a system-generated
                    salary slip and does not
                    require a signature.
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[8px]
                      text-gray-400
                    "
                  >
                    {slip.id ||
                      NOT_APPLICABLE}
                  </p>
                </div>

                <div
                  className="
                    text-right
                    text-[10px]
                    text-gray-400
                  "
                >
                  Issued Date:{" "}
                  <strong className="text-gray-500">
                    {issuedDate}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/*
 * ============================================================
 * INFO ROW
 * ============================================================
 */

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string | number;
  last?: boolean;
}) {
  return (
    <div
      className={`
        info-row
        flex
        min-w-0
        items-center
        justify-between
        gap-4
        border-b
        border-dashed
        border-gray-200
        py-[5px]
        text-[11px]
        ${last ? "border-b-0" : ""}
      `}
    >
      <span className="shrink-0 text-gray-500">
        {label}
      </span>

      <strong
        className="
          min-w-0
          truncate
          text-right
          font-semibold
          text-gray-800
        "
        title={String(value)}
      >
        {value}
      </strong>
    </div>
  );
}

/*
 * ============================================================
 * SUMMARY BOX
 * ============================================================
 */

function SummaryBox({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <div
      className="
        salary-slip-summary-box
        rounded-lg
        border
        border-gray-200
        bg-white
        px-2
        py-3
        text-center
      "
    >
      <div
        className="
          text-[20px]
          font-bold
          leading-none
          text-[#54257b]
        "
      >
        {value}
      </div>

      <div
        className="
          mt-1.5
          whitespace-nowrap
          text-[7px]
          font-medium
          uppercase
          tracking-[1px]
          text-gray-400
        "
      >
        {label}
      </div>
    </div>
  );
}