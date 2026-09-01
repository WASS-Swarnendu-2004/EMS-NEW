import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  CalendarDays,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import api from "@/api/axios";

type SalaryEmployee = {
  employeeId: string;
  employeeIdMongo: string;
  fullName: string;
  department: string;
  role: string;
  grossSalary: number;
  generated: boolean;
  salarySlipId: string | null;
  netSalary: number | null;
  professionalTax: number | null;
  employeePF: number | null;
  employerPF: number | null;
};

type MonthlySalaryResponse = {
  success: boolean;
  total: number;
  employees: SalaryEmployee[];
};

type SalaryEarning = {
  label: string;
  amount: number;
  _id: string;
};

type SalaryDeduction = {
  label: string;
  amount: number;
  _id: string;
};

type SalaryDetailsResponse = {
  success: boolean;
  salary: {
    _id: string;

    employee: {
      _id: string;
      employeeId: string;
      fullName: string;
      email: string;
      phone: string;
      department: string;
      bankAccount: string;
      designation: string;
    };

    month: number;
    year: number;

    grossSalary: number;

    earnedGrossSalary: number;
    totalEarnings: number;
    totalDeductions: number;
    netSalary: number;

    employeePF: number;
    employerPF: number;
    professionalTax: number;

    earnings: SalaryEarning[];
    deductions: SalaryDeduction[];

    workingDays: number;
    absentDays: number;
    absentDeduction: number;

    paidCasualLeaveDays: number;
    paidSickLeaveDays: number;
    unpaidLeaveDays: number;

    leaveDeduction: number;
    earlyCheckoutDeduction: number;
  };
};

type SalaryRow = {
  employeeId: string;
  fullName: string;
  designation: string;
  monthlyGrossSalary: number;

  basic: number | null;
  hra: number | null;
  specialAllowance: number | null;

  paidLeaves: number | null;
  unpaidLeaves: number | null;

  absentDeduction: number | null;
  pf: number | null;
  professionalTax: number | null;
  netSalary: number | null;

  generated: boolean;
};

const MONTH_OPTIONS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const CURRENT_YEAR = new Date().getFullYear();

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) {
    return "—";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

function getEarningAmount(
  earnings: SalaryEarning[],
  label: string,
): number | null {
  const earning = earnings.find(
    (item) =>
      item.label.toLowerCase() === label.toLowerCase(),
  );

  return earning ? earning.amount : null;
}

function getDeductionAmount(
  deductions: SalaryDeduction[],
  label: string,
): number | null {
  const deduction = deductions.find(
    (item) =>
      item.label.toLowerCase() === label.toLowerCase(),
  );

  return deduction ? deduction.amount : null;
}

export const Route = createFileRoute("/admin/salary-details")({
  component: AdminSalaryDetails,
});

function AdminSalaryDetails() {
  const [employees, setEmployees] = useState<SalaryRow[]>([]);

  const [search, setSearch] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1,
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadSalaryData();
  }, [selectedMonth]);

  async function loadSalaryData() {
    try {
      setLoading(true);
      setError("");

      console.log(
        `Loading salary data for ${selectedMonth}/${CURRENT_YEAR}`,
      );

      const monthlyResponse =
        await api.get<MonthlySalaryResponse>(
          "/admin/salary",
          {
            params: {
              month: selectedMonth,
              year: CURRENT_YEAR,
            },
          },
        );

      console.log(
        "MONTHLY SALARY RESPONSE:",
        monthlyResponse.data,
      );

      const monthlyEmployees =
        monthlyResponse.data.employees || [];

      const generatedEmployees =
        monthlyEmployees.filter(
          (employee) =>
            employee.generated === true &&
            employee.salarySlipId,
        );

      const detailResults = await Promise.all(
        generatedEmployees.map(async (employee) => {
          try {
            const detailResponse =
              await api.get<SalaryDetailsResponse>(
                `/admin/salary/${employee.salarySlipId}`,
              );

            return {
              employeeId: employee.employeeId,
              details: detailResponse.data.salary,
            };
          } catch (detailError) {
            console.error(
              `Failed to get salary details for ${employee.fullName}:`,
              detailError,
            );

            return {
              employeeId: employee.employeeId,
              details: null,
            };
          }
        }),
      );

      const detailsMap = new Map<
        string,
        SalaryDetailsResponse["salary"]
      >();

      detailResults.forEach((result) => {
        if (result.details) {
          detailsMap.set(
            result.employeeId,
            result.details,
          );
        }
      });

      const rows: SalaryRow[] =
        monthlyEmployees.map((employee) => {
          const details = detailsMap.get(
            employee.employeeId,
          );

          /*
           * Salary not generated.
           */
          if (!details) {
            return {
              employeeId: employee.employeeId,
              fullName: employee.fullName,
              designation: employee.role || "—",
              monthlyGrossSalary:
                employee.grossSalary,

              basic: null,
              hra: null,
              specialAllowance: null,

              paidLeaves: null,
              unpaidLeaves: null,

              absentDeduction: null,
              pf: null,
              professionalTax: null,
              netSalary: null,

              generated: employee.generated,
            };
          }

          /*
           * Paid leaves =
           * Casual Leave + Sick Leave
           */
          const paidLeaves =
            (details.paidCasualLeaveDays || 0) +
            (details.paidSickLeaveDays || 0);

          /*
           * Unpaid leaves come directly
           * from backend.
           */
          const unpaidLeaves =
            details.unpaidLeaveDays || 0;

          return {
            employeeId: employee.employeeId,

            fullName: employee.fullName,

            designation:
              employee.role ||
              details.employee?.designation ||
              "—",

            monthlyGrossSalary:
              details.grossSalary,

            basic: getEarningAmount(
              details.earnings,
              "Basic",
            ),

            hra: getEarningAmount(
              details.earnings,
              "HRA",
            ),

            specialAllowance: getEarningAmount(
              details.earnings,
              "Special Allowance",
            ),

            paidLeaves,

            unpaidLeaves,

            absentDeduction: getDeductionAmount(
              details.deductions,
              "Absent Deduction",
            ),

            pf: details.employeePF,

            professionalTax:
              details.professionalTax,

            netSalary: details.netSalary,

            generated: true,
          };
        });

      setEmployees(rows);
    } catch (err) {
      console.error(
        "Salary Details Error:",
        err,
      );

      setError(
        "Failed to load salary details. Please try again.",
      );

      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * SEARCH FILTER
   */
  const filteredData = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.fullName
          .toLowerCase()
          .includes(normalizedSearch) ||
        employee.employeeId
          .toLowerCase()
          .includes(normalizedSearch) ||
        employee.designation
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [employees, search]);

  /*
   * SELECTED MONTH NAME
   */
  const selectedMonthLabel =
    MONTH_OPTIONS.find(
      (month) => month.value === selectedMonth,
    )?.label || "";

  /*
   * EXPORT EXCEL
   */
  const handleExportExcel = () => {
    try {
      if (filteredData.length === 0) {
        setError(
          "There is no salary data available to export.",
        );
        return;
      }

      setExporting(true);
      setError("");

      const excelData = filteredData.map(
        (employee) => ({
          "Employee Name":
            employee.fullName,

          "Employee ID":
            employee.employeeId,

          "Employee Designation":
            employee.designation,

          "Monthly Gross Salary":
            employee.monthlyGrossSalary,

          Basic:
            employee.basic ?? "",

          HRA:
            employee.hra ?? "",

          "Special Allowance":
            employee.specialAllowance ?? "",

          "Paid Leaves":
            employee.paidLeaves ?? "",

          "Unpaid Leaves":
            employee.unpaidLeaves ?? "",

          "Absent Deductions":
            employee.absentDeduction ?? "",

          PF:
            employee.pf ?? "",

          PTAX:
            employee.professionalTax ?? "",

          "Net Pay":
            employee.netSalary ?? "",
        }),
      );

      const worksheet =
        XLSX.utils.json_to_sheet(
          excelData,
        );

      worksheet["!cols"] = [
        { wch: 25 },
        { wch: 16 },
        { wch: 25 },
        { wch: 22 },
        { wch: 16 },
        { wch: 16 },
        { wch: 23 },
        { wch: 16 },
        { wch: 17 },
        { wch: 22 },
        { wch: 16 },
        { wch: 16 },
        { wch: 18 },
      ];

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Salary Details",
      );

      const fileName =
        `Salary_Details_${selectedMonthLabel}_${CURRENT_YEAR}.xlsx`;

      XLSX.writeFile(
        workbook,
        fileName,
      );
    } catch (exportError) {
      console.error(
        "Excel Export Error:",
        exportError,
      );

      setError(
        "Failed to export salary details to Excel.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-full w-full bg-[#f8f7fb] p-3 sm:p-4 lg:p-5">

      {/* HEADER */}
      <div className="mb-4 sm:mb-5">
        <h1 className="text-xl font-bold text-[#171b2d] sm:text-2xl">
          Salary Details
        </h1>

        <p className="mt-1 text-xs text-[#737b91] sm:text-sm">
          View salary details of all employees
        </p>
      </div>

      {/* FILTERS + EXPORT */}
      <div className="mb-4 rounded-xl border border-[#ebe8f1] bg-white p-3 shadow-sm sm:p-4">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          {/* LEFT SIDE */}
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

            {/* MONTH */}
            <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-[#dedbe7] bg-white px-3 sm:w-[190px]">

              <CalendarDays
                size={18}
                className="shrink-0 text-[#737b91]"
              />

              <select
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(
                    Number(e.target.value),
                  )
                }
                className="w-full cursor-pointer bg-transparent text-sm text-[#272b3d] outline-none"
              >
                {MONTH_OPTIONS.map(
                  (month) => (
                    <option
                      key={month.value}
                      value={month.value}
                    >
                      {month.label}
                    </option>
                  ),
                )}
              </select>

            </div>

            {/* SEARCH */}
            <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-[#dedbe7] bg-white px-3 sm:w-[260px]">

              <Search
                size={18}
                className="shrink-0 text-[#737b91]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search employee..."
                className="w-full bg-transparent text-sm text-[#171b2d] outline-none placeholder:text-[#9ca2b1]"
              />

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-end">

            <span className="whitespace-nowrap text-sm text-[#737b91]">
              {filteredData.length}{" "}
              {filteredData.length === 1
                ? "record"
                : "records"}
            </span>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={
                loading ||
                exporting ||
                filteredData.length === 0
              }
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#e2d7ec] bg-white px-4 text-sm font-semibold text-[#520087] transition-all duration-200 hover:border-[#cdb5dc] hover:bg-[#faf7fc] active:bg-[#f5eff8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Exporting...
                </>
              ) : (
                <>
                  <ArrowDown
                    size={17}
                    strokeWidth={2.5}
                  />

                  Export Excel
                </>
              )}
            </button>

          </div>

        </div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-[#e7e2ee] bg-white shadow-sm">

        <div className="w-full overflow-x-auto">

          <table className="w-full min-w-[1750px] border-collapse">

            {/* HEADER */}
            <thead>
              <tr className="bg-[#dca8f5]">

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  EMPLOYEE NAME
                </th>

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  EMPLOYEE DESIGNATION
                </th>

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  MONTHLY GROSS SALARY
                </th>

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  BASIC
                </th>

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  HRA
                </th>

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  SPECIAL ALLOWANCE
                </th>

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  PAID LEAVES
                </th>

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  UNPAID LEAVES
                </th>

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  ABSENT DEDUCTIONS
                </th>

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  PF
                </th>

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  PTAX
                </th>

                <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-bold tracking-wide text-[#240051]">
                  NET PAY
                </th>

              </tr>
            </thead>

            {/* BODY */}
            <tbody>

              {loading ? (
                <tr>
                  <td colSpan={12}>

                    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">

                      <Loader2
                        size={32}
                        className="animate-spin text-[#8b3fbf]"
                      />

                      <p className="text-sm text-[#737b91]">
                        Loading salary details...
                      </p>

                    </div>

                  </td>
                </tr>

              ) : filteredData.length > 0 ? (

                filteredData.map(
                  (employee) => (
                    <tr
                      key={
                        employee.employeeId
                      }
                      className="border-b border-[#e5e1ea] transition-colors last:border-b-0 hover:bg-[#faf8fc]"
                    >

                      {/* EMPLOYEE */}
                      <td className="px-4 py-3.5 text-center">

                        <div className="flex min-w-[210px] items-center justify-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f2f5] text-sm font-medium text-[#70798d] sm:h-11 sm:w-11">
                            {employee.fullName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="text-left">

                            <p className="text-sm font-semibold text-[#182033]">
                              {
                                employee.fullName
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-[#7b8497]">
                              {
                                employee.employeeId
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* DESIGNATION */}
                      <td className="px-4 py-3.5 text-center">

                        <span className="inline-flex whitespace-nowrap rounded-full bg-[#eadff2] px-3 py-1.5 text-xs font-semibold text-[#520087]">
                          {
                            employee.designation
                          }
                        </span>

                      </td>

                      {/* GROSS */}
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-[#1a2140]">
                        {formatCurrency(
                          employee.monthlyGrossSalary,
                        )}
                      </td>

                      {/* BASIC */}
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-[#1a2140]">
                        {formatCurrency(
                          employee.basic,
                        )}
                      </td>

                      {/* HRA */}
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-[#1a2140]">
                        {formatCurrency(
                          employee.hra,
                        )}
                      </td>

                      {/* SPECIAL ALLOWANCE */}
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-[#1a2140]">
                        {formatCurrency(
                          employee.specialAllowance,
                        )}
                      </td>

                      {/* PAID LEAVES */}
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-[#1a2140]">
                        {employee.paidLeaves ??
                          "—"}
                      </td>

                      {/* UNPAID LEAVES */}
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-[#1a2140]">
                        {employee.unpaidLeaves ??
                          "—"}
                      </td>

                      {/* ABSENT DEDUCTION */}
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-[#1a2140]">
                        {formatCurrency(
                          employee.absentDeduction,
                        )}
                      </td>

                      {/* PF */}
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-[#1a2140]">
                        {formatCurrency(
                          employee.pf,
                        )}
                      </td>

                      {/* PTAX */}
                      <td className="px-4 py-3.5 text-center text-sm font-medium text-[#1a2140]">
                        {formatCurrency(
                          employee.professionalTax,
                        )}
                      </td>

                      {/* NET PAY */}
                      <td className="px-4 py-3.5 text-center text-sm font-bold text-[#182033]">
                        {formatCurrency(
                          employee.netSalary,
                        )}
                      </td>

                    </tr>
                  ),
                )

              ) : (

                <tr>
                  <td colSpan={12}>

                    <div className="flex min-h-[240px] flex-col items-center justify-center px-4 text-center">

                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f2f5]">

                        <Search
                          size={22}
                          className="text-[#8a91a2]"
                        />

                      </div>

                      <h3 className="text-base font-semibold text-[#363b4d]">
                        No salary records found
                      </h3>

                      <p className="mt-1 text-xs text-[#8a91a2] sm:text-sm">
                        No salary records found
                        for{" "}
                        {
                          selectedMonthLabel
                        }{" "}
                        {CURRENT_YEAR}.
                      </p>

                    </div>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* RESULT COUNT */}
      <div className="px-1 py-3 text-xs text-[#7b8292] sm:text-sm">

        Showing{" "}

        <span className="font-semibold text-[#30364a]">
          {filteredData.length}
        </span>{" "}

        employee
        {filteredData.length !== 1
          ? "s"
          : ""}

        {" "}for{" "}

        <span className="font-semibold text-[#30364a]">
          {selectedMonthLabel}{" "}
          {CURRENT_YEAR}
        </span>

      </div>

    </div>
  );
}

