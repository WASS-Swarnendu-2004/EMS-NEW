import api from "./axios";

export interface WFHApplication {
  id: string;
  employeeId: string;
  from: string;
  to: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface ApplyWFHPayload {
  from: string;
  to: string;
  reason: string;
}

// Get all WFH applications
export const getWFHApplications = async (): Promise<WFHApplication[]> => {
  try {
    const response = await api.get<WFHApplication[]>(
      "" // <-- Add Get WFH Applications API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get WFH Applications Error:", error);
    throw error;
  }
};

// Apply for WFH
export const applyWFH = async (
  data: ApplyWFHPayload
): Promise<WFHApplication> => {
  try {
    const response = await api.post<WFHApplication>(
      "", // <-- Add Apply WFH API Endpoint Here
      data
    );

    return response.data;
  } catch (error) {
    console.error("Apply WFH Error:", error);
    throw error;
  }
};

// Approve/Reject WFH (Admin)
export const updateWFHStatus = async (
  id: string,
  status: "approved" | "rejected"
) => {
  try {
    const response = await api.patch(
      "", // <-- Add Update WFH Status API Endpoint Here
      {
        status,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Update WFH Status Error:", error);
    throw error;
  }
};