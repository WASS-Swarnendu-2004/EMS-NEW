import api from "./axios";

export interface Employee {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  idProof: string;
  salary: number;
  address: string;
  joinDate: string;
  department: string;
  bankAccount: string;
  pan: string;
  emergencyContact: string;
  status: "active" | "inactive";
}

export interface CreateEmployeePayload
  extends Omit<Employee, "id"> {}

export interface UpdateEmployeePayload
  extends Omit<Employee, "id"> {}

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await api.get<Employee[]>(
      "" // <-- Add Get Employees API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get Employees Error:", error);
    throw error;
  }
};

export const createEmployee = async (
  data: CreateEmployeePayload
): Promise<Employee> => {
  try {
    const response = await api.post<Employee>(
      "", // <-- Add Create Employee API Endpoint Here
      data
    );

    return response.data;
  } catch (error) {
    console.error("Create Employee Error:", error);
    throw error;
  }
};

export const updateEmployee = async (
  id: string,
  data: UpdateEmployeePayload
): Promise<Employee> => {
  try {
    const response = await api.put<Employee>(
      "", // <-- Add Update Employee API Endpoint Here
      data
    );

    return response.data;
  } catch (error) {
    console.error("Update Employee Error:", error);
    throw error;
  }
};

export const deleteEmployee = async (
  id: string
) => {
  try {
    const response = await api.delete(
      "" // <-- Add Delete Employee API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Delete Employee Error:", error);
    throw error;
  }
};