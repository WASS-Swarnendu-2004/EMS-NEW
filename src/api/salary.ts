import api from "./axios";

export interface SalaryComponent {
  id: string;
  label: string;
  type: "earning" | "deduction";
  mode: "percent" | "fixed";
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

  items: SalaryItem[];
}

export const getSalarySlips = async (): Promise<SalarySlip[]> => {
  try {
    const response = await api.get<SalarySlip[]>(
      "" // <-- Add Get Salary Slips API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get Salary Slips Error:", error);
    throw error;
  }
};

export const generateSalary = async (
  employeeId: string,
  month: string
): Promise<SalarySlip> => {
  try {
    const response = await api.post<SalarySlip>(
      "", // <-- Add Generate Salary API Endpoint Here
      {
        employeeId,
        month,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Generate Salary Error:", error);
    throw error;
  }
};

export const generateSalaryForAll = async (
  month: string
) => {
  try {
    const response = await api.post(
      "", // <-- Add Generate Salary For All API Endpoint Here
      {
        month,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Generate Salary For All Error:", error);
    throw error;
  }
};

export const getSalaryConfig = async (): Promise<SalaryComponent[]> => {
  try {
    const response = await api.get<SalaryComponent[]>(
      "" // <-- Add Get Salary Configuration API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get Salary Configuration Error:", error);
    throw error;
  }
};

export const updateSalaryConfig = async (
  data: SalaryComponent[]
): Promise<SalaryComponent[]> => {
  try {
    const response = await api.put<SalaryComponent[]>(
      "", // <-- Add Update Salary Configuration API Endpoint Here
      data
    );

    return response.data;
  } catch (error) {
    console.error("Update Salary Configuration Error:", error);
    throw error;
  }
};

export const resetSalaryConfig = async () => {
  try {
    const response = await api.post(
      "" // <-- Add Reset Salary Configuration API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Reset Salary Configuration Error:", error);
    throw error;
  }
};