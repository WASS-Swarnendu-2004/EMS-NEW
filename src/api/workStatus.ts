import api from "./axios";

export interface WorkStatus {
  _id: string;

  employee:
    | string
    | {
        _id: string;
        employeeId?: string;
      };

  project?: {
    _id: string;
    projectName: string;
  };

  workDate: string;
  plan: string;
  endOfDayStatus: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface SaveWorkStatusPayload {
  project: string;
  workDate: string;
  plan: string;
  endOfDayStatus: string;
}

export const getWorkStatus = async (): Promise<WorkStatus[]> => {
  try {
    const response = await api.get<WorkStatus[]>(
      "/admin/daily-work" // <-- Add Get Work Status API Endpoint Here
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
      "/daily-work" // <-- Add Get My Work Status API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get My Work Status Error:", error);
    throw error;
  }
};



export const saveWorkStatus = async (
  data: SaveWorkStatusPayload
): Promise<WorkStatus> => {
  try {
    const response = await api.post<WorkStatus>(
      "/daily-work", // <-- Add Save Work Status API Endpoint Here
      data
    );

    return response.data ?? response.data;
  } catch (error) {
    console.error("Save Work Status Error:", error);
    throw error;
  }
};

// export const updateWorkStatus = async (
//   id: string,
//   data: Partial<SaveWorkStatusPayload>
// ): Promise<WorkStatus> => {
//   try {
//     const response = await api.put<WorkStatus>(
//       "", // <-- Add Update Work Status API Endpoint Here
//       data
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Update Work Status Error:", error);
//     throw error;
//   }
// };

// export const deleteWorkStatus = async (
//   id: string
// ) => {
//   try {
//     const response = await api.delete(
//       "" // <-- Add Delete Work Status API Endpoint Here
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Delete Work Status Error:", error);
//     throw error;
//   }
// };