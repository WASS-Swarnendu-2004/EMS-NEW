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

export interface SalaryEmployee {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  bankAccount: string;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  month: string;

  // Employee information
  employee?: SalaryEmployee;

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

export const getMySalarySlips = async (): Promise<SalarySlip[]> => {
  const response = await api.get("/salary");

  return response.data.salaries.map((s: any) => ({
    id: s._id,
    employeeId:
      typeof s.employee === "object" ? s.employee._id : s.employee,

    month: `${s.year}-${String(s.month).padStart(2, "0")}`,

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
            bankAccount: s.employee.bankAccount || "",
          }
        : undefined,

    gross: s.grossSalary,
    net: s.netSalary,

    totalEarnings: s.totalEarnings,
    totalDeductions: s.totalDeductions,

    workingDays: s.workingDays,
    absentDays: s.absentDays,
    totalAvailableMinutes: s.totalAvailableMinutes,
    paidCasualLeaveDays: s.paidCasualLeaveDays,
    paidSickLeaveDays: s.paidSickLeaveDays,
    unpaidLeaveDays: s.unpaidLeaveDays,
    actualWorkingMinutes: s.actualWorkingMinutes,
    finalPaidMinutes: s.finalPaidMinutes,
    earlyCheckoutMinutes: s.earlyCheckoutMinutes,
    leaveDeduction: s.leaveDeduction,
    earlyCheckoutDeduction: s.earlyCheckoutDeduction,

    pfApplicable: s.pfApplicable,
    pfPercentage: s.pfPercentage,
    pfWage: s.pfWage,
    employeePF: s.employeePF,
    employerPF: s.employerPF,
    professionalTax: s.professionalTax,

    generatedAt: s.generatedAt,

    items: [
      ...(s.earnings || []).map((e: any) => ({
        label: e.label,
        amount: e.amount,
        type: "earning" as const,
      })),

      ...(s.deductions || []).map((d: any) => ({
        label: d.label,
        amount: d.amount,
        type: "deduction" as const,
      })),
    ],
  }));
};

export const getSalaryList = async (
  month: string,
): Promise<SalaryListItem[]> => {
  const [year, mon] = month.split("-");

  const response = await api.get("/admin/salary", {
    params: {
      month: Number(mon),
      year: Number(year),
    },
  });

  return response.data.employees;
};

export const generateSalary = async (month: string) => {
  const [year, mon] = month.split("-");

  try {
    const response = await api.post("/admin/salary/generate", {
      month: Number(mon),
      year: Number(year),
    });

    return response.data;
  } catch (error) {
    console.error("Generate Salary Error:", error);
    throw error;
  }
};

export const getSalaryConfig = async (): Promise<SalaryComponent[]> => {
  try {
    const response = await api.get("/admin/salary/config");

    return response.data.configs.map((c: any) => ({
      id: c._id,
      label: c.label,
      type: c.type,
      mode: c.mode,
      value: c.value,
    }));
  } catch (error) {
    console.error("Get Salary Configuration Error:", error);
    throw error;
  }
};

export const updateSalaryConfig = async (
  data: SalaryComponent[],
) => {
  const response = await api.post(
    "/admin/salary/config",
    data,
  );

  return response.data;
};

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

export const getSalarySlip = async (
  salarySlipId: string,
): Promise<SalarySlip> => {
  const response = await api.get(
    `/admin/salary/${salarySlipId}`,
  );

  const s = response.data.salary;

  return {
    id: s._id,

    employeeId:
      typeof s.employee === "object"
        ? s.employee._id
        : s.employee,

    month: `${s.year}-${String(s.month).padStart(2, "0")}`,

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
            bankAccount: s.employee.bankAccount || "",
          }
        : undefined,

    gross: s.grossSalary,
    net: s.netSalary,

    totalEarnings: s.totalEarnings,
    totalDeductions: s.totalDeductions,

    workingDays: s.workingDays,
    absentDays: s.absentDays,
    totalAvailableMinutes: s.totalAvailableMinutes,
    paidCasualLeaveDays: s.paidCasualLeaveDays,
    paidSickLeaveDays: s.paidSickLeaveDays,
    unpaidLeaveDays: s.unpaidLeaveDays,
    actualWorkingMinutes: s.actualWorkingMinutes,
    finalPaidMinutes: s.finalPaidMinutes,
    earlyCheckoutMinutes: s.earlyCheckoutMinutes,
    leaveDeduction: s.leaveDeduction,
    earlyCheckoutDeduction: s.earlyCheckoutDeduction,

    pfApplicable: s.pfApplicable,
    pfPercentage: s.pfPercentage,
    pfWage: s.pfWage,
    employeePF: s.employeePF,
    employerPF: s.employerPF,
    professionalTax: s.professionalTax,

    generatedAt: s.generatedAt,

    items: [
      ...(s.earnings || []).map((e: any) => ({
        label: e.label,
        amount: e.amount,
        type: "earning" as const,
      })),

      ...(s.deductions || []).map((d: any) => ({
        label: d.label,
        amount: d.amount,
        type: "deduction" as const,
      })),
    ],
  };
};

