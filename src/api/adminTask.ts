import api from "./axios";

export interface TaskEmployee {
  _id: string;
  employeeId: string;
  fullName: string;
  role?: string;
  designation?: string;
  department?: string;
  profileImage?: string;
}

export interface TaskProject {
  _id: string;
  projectName: string;
}

export interface TaskAssignee {
  employee: TaskEmployee;
  status: "Pending" | "In Progress" | "Completed";
  progress: number;
  _id: string;
}

export interface AdminTask {
  _id: string;
  project?: TaskProject;
  title: string;
  description: string;

  assignedBy: TaskEmployee;

  // New task structure
  assignees: TaskAssignee[];

  // Old task structure returned by some records
  assignedTo?: string;
  dueDate: string;

  status?: "Pending" | "In Progress" | "Completed";
  progress?: number;

  createdAt: string;
  updatedAt: string;
}

export interface AdminTasksResponse {
  success: boolean;
  total: number;
  tasks: AdminTask[];
}

export const getAdminTasks = async (): Promise<AdminTasksResponse> => {
  try {
    const response = await api.get<AdminTasksResponse>("/admin/tasks");

    return response.data;
  } catch (error) {
    console.error("Get Admin Tasks Error:", error);
    throw error;
  }
};