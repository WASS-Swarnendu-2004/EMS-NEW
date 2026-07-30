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
    | "in_progress"
    | "on_hold"
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

export interface UpdateProjectPayload
  extends Partial<CreateProjectPayload> {}

interface GetProjectsResponse {
  success: boolean;
  projects: Project[];
}

interface CreateProjectResponse {
  success: boolean;
  message: string;
  project: Project;
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
) => {
  throw new Error("Update Project API not available yet");
};

export const deleteProject = async (id: string) => {
  throw new Error("Delete Project API not available yet");
};

export const updateProjectStatus = async (
  id: string,
  status: Project["status"]
) => {
  throw new Error("Update Status API not available yet");
};

export const assignEmployeesToProject = async (
  id: string,
  assigned: string[]
) => {
  throw new Error("Assign Employee API not available yet");
};