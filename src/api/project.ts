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

export interface CreateProjectPayload
  extends Omit<Project, "id"> {}

export interface UpdateProjectPayload
  extends Partial<Omit<Project, "id">> {}

export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get<Project[]>(
      "" // <-- Add Get Projects API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get Projects Error:", error);
    throw error;
  }
};

export const createProject = async (
  data: CreateProjectPayload
): Promise<Project> => {
  try {
    const response = await api.post<Project>(
      "", // <-- Add Create Project API Endpoint Here
      data
    );

    return response.data;
  } catch (error) {
    console.error("Create Project Error:", error);
    throw error;
  }
};

export const updateProject = async (
  id: string,
  data: UpdateProjectPayload
): Promise<Project> => {
  try {
    const response = await api.put<Project>(
      "", // <-- Add Update Project API Endpoint Here
      data
    );

    return response.data;
  } catch (error) {
    console.error("Update Project Error:", error);
    throw error;
  }
};

export const deleteProject = async (
  id: string
) => {
  try {
    const response = await api.delete(
      "" // <-- Add Delete Project API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Delete Project Error:", error);
    throw error;
  }
};

export const updateProjectStatus = async (
  id: string,
  status: Project["status"]
) => {
  try {
    const response = await api.patch(
      "", // <-- Add Update Project Status API Endpoint Here
      {
        status,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Update Project Status Error:", error);
    throw error;
  }
};

export const assignEmployeesToProject = async (
  id: string,
  assigned: string[]
) => {
  try {
    const response = await api.patch(
      "", // <-- Add Assign Employees API Endpoint Here
      {
        assigned,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Assign Employees To Project Error:", error);
    throw error;
  }
};