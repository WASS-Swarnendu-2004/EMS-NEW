import api from "./axios";

export interface AssignedEmployee {
  _id: string;
  employeeId: string;
  fullName: string;
}

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

  // API returns employee objects here
  assignedEmployees: AssignedEmployee[];
}

// =====================================================
// CREATE PROJECT
// =====================================================

export interface CreateProjectPayload {
  projectName: string;
  consumerName: string;
  startDate: string;
  endDate: string;
  valuation: number;
  description: string;

  // When creating, backend expects employee IDs
  assignedEmployees: string[];
}

// =====================================================
// UPDATE PROJECT
// =====================================================

export interface UpdateProjectPayload {
  projectName?: string;
  consumerName?: string;
  startDate?: string;
  endDate?: string;
  valuation?: number;
  status?: Project["status"];
  consumerDetails?: string;
  description?: string;

  // Backend expects employee IDs
  assignedEmployees?: string[];
}

// =====================================================
// API RESPONSES
// =====================================================

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

interface GetProjectsResponse {
  success: boolean;
  projects: Project[];
}

interface GetMyProjectsResponse {
  success: boolean;
  total: number;
  projects: Project[];
}

interface AssignEmployeesResponse {
  success: boolean;
  message: string;
  project: Project;
}

// =====================================================
// GET ALL PROJECTS - ADMIN
// =====================================================

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

// =====================================================
// CREATE PROJECT
// =====================================================

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

// =====================================================
// UPDATE PROJECT
// =====================================================

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

// =====================================================
// DELETE PROJECT
// =====================================================

export const deleteProject = async (id: string) => {
  await api.delete(`/admin/projects/${id}`);
};

// =====================================================
// ASSIGN EMPLOYEES
// =====================================================

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

// =====================================================
// GET MY PROJECTS - EMPLOYEE
// =====================================================

export const getMyProjects = async (): Promise<Project[]> => {
  const response = await api.get<GetMyProjectsResponse>(
    "/employee/projects/my-projects"
  );

  return response.data.projects;
};

