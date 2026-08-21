import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Search } from "lucide-react";
import { useMemo, useState } from "react";

type SalaryDetails = {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  month: string;
  monthlyGrossSalary: number;
  attendanceSalary: number;
  pf: number;
  esi: number;
  professionalTax: number;
};

const MOCK_SALARY_DATA: SalaryDetails[] = [
  {
    id: "1",
    employeeId: "EMP0014",
    name: "Jatin Sarkar",
    designation: "Software Developer",
    month: "August 2026",
    monthlyGrossSalary: 45000,
    attendanceSalary: 45000,
    pf: 1800,
    esi: 338,
    professionalTax: 200,
  },
  {
    id: "2",
    employeeId: "EMP0015",
    name: "Test Employee",
    designation: "HR Executive",
    month: "August 2026",
    monthlyGrossSalary: 38000,
    attendanceSalary: 35000,
    pf: 1520,
    esi: 263,
    professionalTax: 200,
  },
  {
    id: "3",
    employeeId: "EMP0021",
    name: "Rahul Gandhi",
    designation: "Project Manager",
    month: "August 2026",
    monthlyGrossSalary: 65000,
    attendanceSalary: 62000,
    pf: 1800,
    esi: 120,
    professionalTax: 200,
  },
  {
    id: "4",
    employeeId: "EMP0008",
    name: "Kajol Das",
    designation: "UI/UX Designer",
    month: "August 2026",
    monthlyGrossSalary: 42000,
    attendanceSalary: 42000,
    pf: 1680,
    esi: 315,
    professionalTax: 200,
  },
  {
    id: "5",
    employeeId: "EMP0009",
    name: "Kobita Das",
    designation: "Frontend Developer",
    month: "August 2026",
    monthlyGrossSalary: 50000,
    attendanceSalary: 48000,
    pf: 1800,
    esi: 360,
    professionalTax: 200,
  },
  {
    id: "6",
    employeeId: "EMP0020",
    name: "Test1",
    designation: "Backend Developer",
    month: "August 2026",
    monthlyGrossSalary: 47000,
    attendanceSalary: 44000,
    pf: 1800,
    esi: 330,
    professionalTax: 200,
  },

  // July 2026
  {
    id: "7",
    employeeId: "EMP0014",
    name: "Jatin Sarkar",
    designation: "Software Developer",
    month: "July 2026",
    monthlyGrossSalary: 45000,
    attendanceSalary: 43000,
    pf: 1800,
    esi: 323,
    professionalTax: 200,
  },
  {
    id: "8",
    employeeId: "EMP0015",
    name: "Test Employee",
    designation: "HR Executive",
    month: "July 2026",
    monthlyGrossSalary: 38000,
    attendanceSalary: 38000,
    pf: 1520,
    esi: 285,
    professionalTax: 200,
  },
  {
    id: "9",
    employeeId: "EMP0021",
    name: "Rahul Gandhi",
    designation: "Project Manager",
    month: "July 2026",
    monthlyGrossSalary: 65000,
    attendanceSalary: 60000,
    pf: 1800,
    esi: 0,
    professionalTax: 200,
  },
  {
    id: "10",
    employeeId: "EMP0008",
    name: "Kajol Das",
    designation: "UI/UX Designer",
    month: "July 2026",
    monthlyGrossSalary: 42000,
    attendanceSalary: 40000,
    pf: 1680,
    esi: 300,
    professionalTax: 200,
  },
];

const MONTH_OPTIONS = [
  "All Months",
  "August 2026",
  "July 2026",
  "June 2026",
  "May 2026",
];

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

export const Route = createFileRoute("/admin/salary-details")({
  component: AdminSalaryDetails,
});

function AdminSalaryDetails() {
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("August 2026");

  const filteredData = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return MOCK_SALARY_DATA.filter((employee) => {
      const matchesSearch =
        !normalizedSearch ||
        employee.name.toLowerCase().includes(normalizedSearch);

      const matchesMonth =
        selectedMonth === "All Months" ||
        employee.month === selectedMonth;

      return matchesSearch && matchesMonth;
    });
  }, [search, selectedMonth]);

  return (
    <div className="min-h-full w-full bg-[#f8f7fb] p-3 sm:p-4 lg:p-5">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <h1 className="text-xl font-bold text-[#171b2d] sm:text-2xl">
          Salary Details
        </h1>

        <p className="mt-1 text-xs text-[#737b91] sm:text-sm">
          View salary details of all employees
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-[#ebe8f1] bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          
          {/* Search */}
          <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-[#dedbe7] bg-white px-3 md:max-w-md">
            <Search
              size={18}
              className="shrink-0 text-[#737b91]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee by name..."
              className="w-full bg-transparent text-sm text-[#171b2d] outline-none placeholder:text-[#9ca2b1]"
            />
          </div>

          {/* Month Filter */}
          <div className="flex h-11 w-full items-center gap-2 rounded-lg border border-[#dedbe7] bg-white px-3 md:w-[210px]">
            <CalendarDays
              size={18}
              className="shrink-0 text-[#737b91]"
            />

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full cursor-pointer bg-transparent text-sm text-[#272b3d] outline-none"
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Salary Table */}
      <div className="overflow-hidden rounded-xl border border-[#e7e2ee] bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-[#dca8f5]">
                <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-[#240051] sm:px-4">
                  EMPLOYEE
                </th>

                <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-[#240051] sm:px-4">
                  DESIGNATION
                </th>

                <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-[#240051] sm:px-4">
                  MONTHLY GROSS SALARY
                </th>

                <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-[#240051] sm:px-4">
                  ATTENDANCE SALARY
                </th>

                <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-[#240051] sm:px-4">
                  PF
                </th>

                <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-[#240051] sm:px-4">
                  ESI
                </th>

                <th className="px-3 py-4 text-left text-xs font-bold tracking-wide text-[#240051] sm:px-4">
                  PROFESSIONAL TAX
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-[#e5e1ea] transition-colors last:border-b-0 hover:bg-[#faf8fc]"
                  >
                    {/* Employee */}
                    <td className="px-3 py-3.5 sm:px-4">
                      <div className="flex min-w-[210px] items-center gap-3">
                        
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f2f5] text-sm font-medium text-[#70798d] sm:h-11 sm:w-11">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#182033]">
                            {employee.name}
                          </p>

                          <p className="mt-0.5 text-xs text-[#7b8497]">
                            {employee.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="px-3 py-3.5 sm:px-4">
                      <span className="inline-flex whitespace-nowrap rounded-full bg-[#eadff2] px-3 py-1.5 text-xs font-semibold text-[#520087]">
                        {employee.designation}
                      </span>
                    </td>

                    {/* Monthly Gross Salary */}
                    <td className="px-3 py-3.5 text-sm font-medium text-[#1a2140] sm:px-4">
                      {formatCurrency(employee.monthlyGrossSalary)}
                    </td>

                    {/* Attendance Salary */}
                    <td className="px-3 py-3.5 text-sm font-medium text-[#1a2140] sm:px-4">
                      {formatCurrency(employee.attendanceSalary)}
                    </td>

                    {/* PF */}
                    <td className="px-3 py-3.5 text-sm font-medium text-[#1a2140] sm:px-4">
                      {formatCurrency(employee.pf)}
                    </td>

                    {/* ESI */}
                    <td className="px-3 py-3.5 text-sm font-medium text-[#1a2140] sm:px-4">
                      {employee.esi > 0
                        ? formatCurrency(employee.esi)
                        : "—"}
                    </td>

                    {/* Professional Tax */}
                    <td className="px-3 py-3.5 text-sm font-medium text-[#1a2140] sm:px-4">
                      {formatCurrency(employee.professionalTax)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
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
                        Try changing the month or searching for another
                        employee.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Count */}
      <div className="px-1 py-3 text-xs text-[#7b8292] sm:text-sm">
        Showing{" "}
        <span className="font-semibold text-[#30364a]">
          {filteredData.length}
        </span>{" "}
        employee{filteredData.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}