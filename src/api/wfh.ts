import api from "./axios";

export interface WFHApplication {
  _id: string;
  employee: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyWFHPayload {
  fromDate: string;
  toDate: string;
  reason: string;
}

// Get all WFH applications
// export const getWFHApplications = async (): Promise<WFHApplication[]> => {
//   try {
//     const response = await api.get<WFHApplication[]>(
//       "" // <-- Add Get WFH Applications API Endpoint Here
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Get WFH Applications Error:", error);
//     throw error;
//   }
// };

// Apply for WFH
export const applyWFH = async (
  data: ApplyWFHPayload
): Promise<WFHApplication> => {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      request: WFHApplication;
    }>("/wfh", data);

    return response.data.request;
  } catch (error) {
    console.error("Apply WFH Error:", error);
    throw error;
  }
};

export const getMyWFHRequests = async (): Promise<WFHApplication[]> => {
  const response = await api.get<{
    success: boolean;
    requests: WFHApplication[];
  }>("/wfh");

  return response.data.requests;
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