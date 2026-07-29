import api from "./axios";

export interface Employee {
  _id: string;
  employeeId?: string;
  userId?: string;

  fullName: string;
  email: string;
  password?: string;
  phone: string;
  role: string;
  department: string;
  salary: number;
  joiningDate: string;
  idProof: string;
  pan: string;
  bankAccount: string;
  emergencyContact: string;
  address: string;
  status: "Active" | "Inactive";
}

export interface CreateEmployeePayload
  extends Omit<Employee, "_id" | "employeeId" | "userId"> {}

export interface UpdateEmployeePayload
  extends Omit<Employee, "_id" | "employeeId" | "userId" | "password"> { }
  
export const getEmployees = async (): Promise<Employee[]> => {
  try {
   const response = await api.get("/admin/employees");

return response.data.employees;
  } catch (error) {
    console.error("Get Employees Error:", error);
    throw error;
  }
};

export const createEmployee = async (
  data: CreateEmployeePayload
): Promise<Employee> => {
  try {
  const response = await api.post(
  "/admin/employees",
  data
);

return response.data.employee;
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
   const response = await api.put(
    `/admin/employees/${id}`,
    data
);

return response.data.employee;
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
    `/admin/employees/${id}`
);

return response.data;
  } catch (error) {
    console.error("Delete Employee Error:", error);
    throw error;
  }
};