import api from "./axios";

export interface WorkStatus {
  id: string;
  employeeId: string;
  projectId?: string;
  date: string;
  plan: string;
  status: string;
}

export interface SaveWorkStatusPayload {
  projectId?: string;
  date: string;
  plan: string;
  status: string;
}

export const getWorkStatus = async (): Promise<WorkStatus[]> => {
  try {
    const response = await api.get<WorkStatus[]>(
      "" // <-- Add Get Work Status API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get Work Status Error:", error);
    throw error;
  }
};

export const getMyWorkStatus = async (): Promise<WorkStatus[]> => {
  try {
    const response = await api.get<WorkStatus[]>(
      "" // <-- Add Get My Work Status API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get My Work Status Error:", error);
    throw error;
  }
};

export const getWorkStatusByDate = async (
  date: string
): Promise<WorkStatus[]> => {
  try {
    const response = await api.get<WorkStatus[]>(
      "" // <-- Add Get Work Status By Date API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get Work Status By Date Error:", error);
    throw error;
  }
};

export const saveWorkStatus = async (
  data: SaveWorkStatusPayload
): Promise<WorkStatus> => {
  try {
    const response = await api.post<WorkStatus>(
      "", // <-- Add Save Work Status API Endpoint Here
      data
    );

    return response.data;
  } catch (error) {
    console.error("Save Work Status Error:", error);
    throw error;
  }
};

export const updateWorkStatus = async (
  id: string,
  data: Partial<SaveWorkStatusPayload>
): Promise<WorkStatus> => {
  try {
    const response = await api.put<WorkStatus>(
      "", // <-- Add Update Work Status API Endpoint Here
      data
    );

    return response.data;
  } catch (error) {
    console.error("Update Work Status Error:", error);
    throw error;
  }
};

export const deleteWorkStatus = async (
  id: string
) => {
  try {
    const response = await api.delete(
      "" // <-- Add Delete Work Status API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Delete Work Status Error:", error);
    throw error;
  }
};