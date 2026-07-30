import api from "./axios";

export interface SalaryComponent {
  id?: string;
  label: string;
  type: "Earning" | "Deduction";
  mode: "% of gross" | "Fixed";
  value: number;
}

export interface SalaryItem {
  label: string;
  type: "earning" | "deduction";
  amount: number;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  month: string;

  gross: number;
  net: number;

  totalEarnings: number;
  totalDeductions: number;

  generatedAt: string;

  items: SalaryItem[];
}

export interface SalaryListItem {
  employeeId: string;
  employeeIdMongo: string;
  fullName: string;
  department: string;
  role: string;
  grossSalary: number;
  generated: boolean;
  salarySlipId?: string;
  netSalary?: number;
}

export const getSalaryList = async (month: string): Promise<SalaryListItem[]> => {
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

// export const generateSalaryForAll = async (
//   month: string
// ) => {
//   try {
//     const response = await api.post(
//       "", // <-- Add Generate Salary For All API Endpoint Here
//       {
//         month,
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Generate Salary For All Error:", error);
//     throw error;
//   }
// };

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
  data: SalaryComponent[]
) => {
  const response = await api.post(
    "/admin/salary/config",
    data
  );

  return response.data;
};

export const generateSalaryForEmployee = async (
  employeeId: string,
  month: string
) => {
  const [year, mon] = month.split("-");

  const response = await api.post(
    `/admin/salary/generate/${employeeId}`,
    {
      month: Number(mon),
      year: Number(year),
    }
  );

  return response.data;
};

export const getSalarySlip = async (salarySlipId: string) => {
  const response = await api.get(`/admin/salary/${salarySlipId}`);

  const s = response.data.salary;

  return {
    id: s._id,
    employeeId: s.employee._id,
    month: `${s.year}-${String(s.month).padStart(2, "0")}`,
    gross: s.grossSalary,
    net: s.netSalary,
    totalEarnings: s.totalEarnings,
    totalDeductions: s.totalDeductions,
    generatedAt: s.generatedAt,
    items: [
      ...s.earnings.map((e: any) => ({
        label: e.label,
        amount: e.amount,
        type: "earning" as const,
      })),
      ...s.deductions.map((d: any) => ({
        label: d.label,
        amount: d.amount,
        type: "deduction" as const,
      })),
    ],
  };
};

// export const resetSalaryConfig = async () => {
//   try {
//     const response = await api.post(
//       "" // <-- Add Reset Salary Configuration API Endpoint Here
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Reset Salary Configuration Error:", error);
//     throw error;
//   }
// };