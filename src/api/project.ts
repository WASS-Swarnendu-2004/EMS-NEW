import api from "./axios";

export interface Project {
  _id: string;
  projectName: string;
  consumerName: string;
  consumerDetails: string;
  startDate: string;
  endDate: string;
  duration: number;
  valuation: number;
  status:
  | "planning"
  | "in-progress"
  | "hold"
  | "completed"
  | "cancelled";
  description: string;
  assignedEmployees: string[];
}

export interface CreateProjectPayload {
  projectName: string;
  consumerName: string;
  startDate: string;
  endDate: string;
  valuation: number;
  description: string;
  assignedEmployees: string[];
}

export interface UpdateProjectPayload {
  projectName?: string;
  consumerName?: string;
  startDate?: string;
  endDate?: string;
  valuation?: number;
  status?: Project["status"];
  consumerDetails?: string;
  description?: string;
  assignedEmployees?: string[];
}
interface UpdateProjectResponse {
  success: boolean;
  message: string;
  project: Project;
}

interface GetProjectResponse {
  success: boolean;
  project: Project;
}

interface CreateProjectResponse {
  success: boolean;
  message: string;
  project: Project;
}

interface GetMyProjectsResponse {
  success: boolean;
  total: number;
  projects: Project[];
}

export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get<GetProjectsResponse>(
      "/admin/projects"
    );

    return response.data.projects;
  } catch (error) {
    console.error("Get Projects Error:", error);
    throw error;
  }
};
interface AssignEmployeesResponse {
  success: boolean;
  message: string;
  project: Project;
}

export const createProject = async (
  data: CreateProjectPayload
): Promise<Project> => {
  try {
    const response = await api.post<CreateProjectResponse>(
      "/admin/projects",
      data
    );

    return response.data.project;
  } catch (error) {
    console.error("Create Project Error:", error);
    throw error;
  }
};

// Pending APIs

export const updateProject = async (
  id: string,
  data: UpdateProjectPayload
): Promise<Project> => {
  const response = await api.put<UpdateProjectResponse>(
    `/admin/projects/${id}`,
    data
  );

  return response.data.project;
};

export const deleteProject = async (id: string) => {
  await api.delete(`/admin/projects/${id}`);
};

export const assignEmployeesToProject = async (
  id: string,
  employeeIds: string[]
): Promise<Project> => {
  const response = await api.put<AssignEmployeesResponse>(
    `/admin/projects/${id}/assign`,
    {
      employeeIds,
    }
  );

  return response.data.project;
};

export const getMyProjects = async (): Promise<Project[]> => {
  const response = await api.get<GetMyProjectsResponse>(
    "/employee/projects/my-projects"
  );

  return response.data.projects;
};

