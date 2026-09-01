import api from "./axios";

export interface SalaryComponent {
  id?: string;
  label: string;
  type: "Earning" | "Deduction";
  mode: "% of gross" | "Fixed";
  value: number | "";
}

export interface SalaryItem {
  label: string;
  type: "earning" | "deduction";
  amount: number;
}

export interface SalaryCustomField {
  label: string;
  value: string;
}

export interface SalaryEmployee {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  bankAccount: string;

  joiningDate?: string;

  customFields?: SalaryCustomField[];
}

export interface SalaryEmployeeInfo {
  uanNumber?: string;
  joiningDate?: string;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  month: string;

  // Employee information
  employee?: SalaryEmployee;

  // Additional employee information returned
  // by GET /admin/salary/:salarySlipId
  employeeInfo?: SalaryEmployeeInfo;

  // Salary information
  gross: number;
  net: number;

  totalEarnings: number;
  totalDeductions: number;

  // Attendance / salary calculation information
  workingDays?: number;
  absentDays?: number;
  totalAvailableMinutes?: number;
  paidCasualLeaveDays?: number;
  paidSickLeaveDays?: number;
  unpaidLeaveDays?: number;
  actualWorkingMinutes?: number;
  finalPaidMinutes?: number;
  earlyCheckoutMinutes?: number;
  leaveDeduction?: number;
  earlyCheckoutDeduction?: number;

  // PF information
  pfApplicable?: boolean;
  pfPercentage?: number;
  pfWage?: number;
  employeePF?: number;
  employerPF?: number;
  professionalTax?: number;

  generatedAt: string;

  items: SalaryItem[];
}

export interface SalaryListItem {
  employeeId: string;
  employeeIdMongo: string;
  fullName: string;
  department: string;
  grossSalary: number;
  generated: boolean;
  salarySlipId?: string;
  netSalary?: number;
}

/*
 * Get logged-in employee salary slips
 */
export const getMySalarySlips = async (): Promise<
  SalarySlip[]
> => {
  const response = await api.get("/salary");

  return response.data.salaries.map((s: any) => ({
    id: s._id,

    employeeId:
      typeof s.employee === "object"
        ? s.employee._id
        : s.employee,

    month: `${s.year}-${String(s.month).padStart(
      2,
      "0",
    )}`,

    employee:
      typeof s.employee === "object"
        ? {
            _id: s.employee._id,
            employeeId: s.employee.employeeId,
            fullName: s.employee.fullName,
            email: s.employee.email,
            phone: s.employee.phone,
            department: s.employee.department,
            designation: s.employee.designation,
            bankAccount:
              s.employee.bankAccount || "",
            joiningDate:
              s.employee.joiningDate,
            customFields:
              s.employee.customFields || [],
          }
        : undefined,

    employeeInfo: s.employeeInfo
      ? {
          uanNumber:
            s.employeeInfo.uanNumber,
          joiningDate:
            s.employeeInfo.joiningDate,
        }
      : undefined,

    gross:
      s.grossSalary,

    net:
      s.netSalary,

    totalEarnings:
      s.totalEarnings,

    totalDeductions:
      s.totalDeductions,

    workingDays:
      s.workingDays,

    absentDays:
      s.absentDays,

    totalAvailableMinutes:
      s.totalAvailableMinutes,

    paidCasualLeaveDays:
      s.paidCasualLeaveDays,

    paidSickLeaveDays:
      s.paidSickLeaveDays,

    unpaidLeaveDays:
      s.unpaidLeaveDays,

    actualWorkingMinutes:
      s.actualWorkingMinutes,

    finalPaidMinutes:
      s.finalPaidMinutes,

    earlyCheckoutMinutes:
      s.earlyCheckoutMinutes,

    leaveDeduction:
      s.leaveDeduction,

    earlyCheckoutDeduction:
      s.earlyCheckoutDeduction,

    pfApplicable:
      s.pfApplicable,

    pfPercentage:
      s.pfPercentage,

    pfWage:
      s.pfWage,

    employeePF:
      s.employeePF,

    employerPF:
      s.employerPF,

    professionalTax:
      s.professionalTax,

    generatedAt:
      s.generatedAt,

    items: [
      ...(s.earnings || []).map(
        (e: any) => ({
          label: e.label,
          amount: e.amount,
          type: "earning" as const,
        }),
      ),

      ...(s.deductions || []).map(
        (d: any) => ({
          label: d.label,
          amount: d.amount,
          type: "deduction" as const,
        }),
      ),
    ],
  }));
};

/*
 * Get salary list for a particular month
 */
export const getSalaryList = async (
  month: string,
): Promise<SalaryListItem[]> => {
  const [year, mon] = month.split("-");

  const response = await api.get(
    "/admin/salary",
    {
      params: {
        month: Number(mon),
        year: Number(year),
      },
    },
  );

  return response.data.employees;
};

/*
 * Generate salary for all employees
 */
export const generateSalary = async (
  month: string,
) => {
  const [year, mon] = month.split("-");

  try {
    const response = await api.post(
      "/admin/salary/generate",
      {
        month: Number(mon),
        year: Number(year),
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Generate Salary Error:",
      error,
    );

    throw error;
  }
};

/*
 * Get salary configuration
 */
export const getSalaryConfig = async (): Promise<
  SalaryComponent[]
> => {
  try {
    const response = await api.get(
      "/admin/salary/config",
    );

    return response.data.configs.map(
      (c: any) => ({
        id: c._id,
        label: c.label,
        type: c.type,
        mode: c.mode,
        value: c.value,
      }),
    );
  } catch (error) {
    console.error(
      "Get Salary Configuration Error:",
      error,
    );

    throw error;
  }
};

/*
 * Update salary configuration
 */
export const updateSalaryConfig = async (
  data: SalaryComponent[],
) => {
  const response = await api.post(
    "/admin/salary/config",
    data,
  );

  return response.data;
};

/*
 * Generate salary for one employee
 */
export const generateSalaryForEmployee = async (
  employeeId: string,
  month: string,
) => {
  const [year, mon] = month.split("-");

  const response = await api.post(
    `/admin/salary/generate/${employeeId}`,
    {
      month: Number(mon),
      year: Number(year),
    },
  );

  return response.data;
};

/*
 * Get one salary slip
 *
 * GET:
 * /admin/salary/:salarySlipId
 *
 * This endpoint returns the complete salary slip,
 * including:
 *
 * employee.customFields:
 * - Name Bank
 * - UAN No
 * - DOB
 * - ESI No
 */
export const getSalarySlip = async (
  salarySlipId: string,
): Promise<SalarySlip> => {
  const response = await api.get(
    `/admin/salary/${salarySlipId}`,
  );

  const s = response.data.salary;
  const employeeInfo =
    response.data.employeeInfo;

  return {
    id: s._id,

    employeeId:
      typeof s.employee === "object"
        ? s.employee._id
        : s.employee,

    month: `${s.year}-${String(s.month).padStart(
      2,
      "0",
    )}`,

    employee:
      typeof s.employee === "object"
        ? {
            _id: s.employee._id,

            employeeId:
              s.employee.employeeId,

            fullName:
              s.employee.fullName,

            email:
              s.employee.email,

            phone:
              s.employee.phone,

            department:
              s.employee.department,

            designation:
              s.employee.designation,

            bankAccount:
              s.employee.bankAccount || "",

            joiningDate:
              s.employee.joiningDate,

            /*
             * Keep all custom fields.
             *
             * Example:
             * [
             *   { label: "Name Bank", value: "HDFC Bank" },
             *   { label: "UAN No", value: "101525794635" },
             *   { label: "DOB", value: "1999-01-01" },
             *   { label: "ESI No", value: "5555557878" }
             * ]
             */
            customFields:
              s.employee.customFields || [],
          }
        : undefined,

    /*
     * UAN + Joining Date
     */
    employeeInfo: employeeInfo
      ? {
          uanNumber:
            employeeInfo.uanNumber,

          joiningDate:
            employeeInfo.joiningDate,
        }
      : undefined,

    gross:
      s.grossSalary,

    net:
      s.netSalary,

    totalEarnings:
      s.totalEarnings,

    totalDeductions:
      s.totalDeductions,

    workingDays:
      s.workingDays,

    absentDays:
      s.absentDays,

    totalAvailableMinutes:
      s.totalAvailableMinutes,

    paidCasualLeaveDays:
      s.paidCasualLeaveDays,

    paidSickLeaveDays:
      s.paidSickLeaveDays,

    unpaidLeaveDays:
      s.unpaidLeaveDays,

    actualWorkingMinutes:
      s.actualWorkingMinutes,

    finalPaidMinutes:
      s.finalPaidMinutes,

    earlyCheckoutMinutes:
      s.earlyCheckoutMinutes,

    leaveDeduction:
      s.leaveDeduction,

    earlyCheckoutDeduction:
      s.earlyCheckoutDeduction,

    pfApplicable:
      s.pfApplicable,

    pfPercentage:
      s.pfPercentage,

    pfWage:
      s.pfWage,

    employeePF:
      s.employeePF,

    employerPF:
      s.employerPF,

    professionalTax:
      s.professionalTax,

    generatedAt:
      s.generatedAt,

    items: [
      ...(s.earnings || []).map(
        (e: any) => ({
          label: e.label,
          amount: e.amount,
          type: "earning" as const,
        }),
      ),

      ...(s.deductions || []).map(
        (d: any) => ({
          label: d.label,
          amount: d.amount,
          type: "deduction" as const,
        }),
      ),
    ],
  };
};

