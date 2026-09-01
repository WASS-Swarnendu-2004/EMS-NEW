import api from "./axios";

export interface CustomField {
  label: string;
  value: string;
}

export interface Employee {
  _id: string;
  employeeId?: string;
  userId?: string;

  fullName: string;
  email: string;
  password?: string;
  phone: string;
  designation: string;
  department: string;
  salary: number;
  joiningDate: string;
  idProof: string;
  pan: string;
  bankAccount: string;
  emergencyContact: string;
  address: string;
  status: "Active" | "Inactive";

  profileImage?: string;

  customFields?: CustomField[];

  // PF
  pfApplicable: boolean;
}

export interface CreateEmployeePayload
  extends Omit<
    Employee,
    "_id" | "employeeId" | "userId"
  > {}

export interface UpdateEmployeePayload
  extends Omit<
    Employee,
    "_id" | "employeeId" | "userId" | "password"
  > {}

export interface EmployeePagination {
  employees: Employee[];
  totalEmployees: number;
  currentPage: number;
  totalPages: number;
}

export const getEmployees = async (
  page: number = 1,
): Promise<EmployeePagination> => {
  try {
    const response = await api.get(
      "/admin/employees",
      {
        params: {
          page,
        },
      },
    );

    return {
      employees: response.data.employees,
      totalEmployees:
        response.data.totalEmployees,
      currentPage:
        response.data.currentPage,
      totalPages:
        response.data.totalPages,
    };
  } catch (error) {
    console.error(
      "Get Employees Error:",
      error,
    );
    throw error;
  }
};

export const createEmployee = async (
  data: CreateEmployeePayload,
): Promise<Employee> => {
  try {
    const response = await api.post(
      "/admin/employees",
      data,
    );

    return response.data.employee;
  } catch (error) {
    console.error(
      "Create Employee Error:",
      error,
    );
    throw error;
  }
};

export const updateEmployee = async (
  id: string,
  data: UpdateEmployeePayload,
): Promise<Employee> => {
  try {
    const response = await api.put(
      `/admin/employees/${id}`,
      data,
    );

    return response.data.employee;
  } catch (error) {
    console.error(
      "Update Employee Error:",
      error,
    );
    throw error;
  }
};

export const deleteEmployee = async (
  id: string,
) => {
  try {
    const response = await api.delete(
      `/admin/employees/${id}`,
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete Employee Error:",
      error,
    );
    throw error;
  }
};

export const createEmployeeWithPhoto = async (
  data: CreateEmployeePayload,
  photo: File,
): Promise<Employee> => {
  try {
    const formData = new FormData();

    Object.entries(data).forEach(
      ([key, value]) => {
        formData.append(
          key,
          String(value ?? ""),
        );
      },
    );

    formData.append(
      "profileImage",
      photo,
      photo.name,
    );

    const response = await api.post(
      "/admin/employees/with-photo",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      },
    );

    return response.data.employee;
  } catch (error) {
    console.error(
      "Create Employee With Photo Error:",
      error,
    );
    throw error;
  }
};

export const updateEmployeeWithPhoto = async (
  id: string,
  data: UpdateEmployeePayload,
  photo: File,
): Promise<Employee> => {
  try {
    const formData = new FormData();

    Object.entries(data).forEach(
      ([key, value]) => {
        formData.append(
          key,
          String(value ?? ""),
        );
      },
    );

    formData.append(
      "profileImage",
      photo,
      photo.name,
    );

    const response = await api.put(
      `/admin/employees/${id}`,
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      },
    );

    return response.data.employee;
  } catch (error) {
    console.error(
      "Update Employee With Photo Error:",
      error,
    );
    throw error;
  }
};

export interface TaskEmployee {
  _id: string;
  employeeId: string;
  fullName: string;
  role: string;
  department: string;
  profileImage?: string;
}

export interface TaskEmployeesResponse {
  success: boolean;
  total: number;
  employees: TaskEmployee[];
}

export const getTaskEmployees =
  async (): Promise<TaskEmployee[]> => {
    try {
      const response =
        await api.get<TaskEmployeesResponse>(
          "/tasks/employees",
        );

      return response.data.employees;
    } catch (error) {
      console.error(
        "Get Task Employees Error:",
        error,
      );
      throw error;
    }
  };

