import api from "./axios";

export interface WFHApplication {
  _id: string;
  employee:
  | string
  | {
      _id: string;
      employeeId: string;
    };
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
export const getWFHApplications = async (): Promise<WFHApplication[]> => {
  const response = await api.get<{
    success: boolean;
    requests: WFHApplication[];
  }>("/admin/wfh");

  return response.data.requests;
};

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
  status: "Approved" | "Rejected"
) => {
  const endpoint =
    status === "Approved"
      ? `/admin/wfh/${id}/approve`
      : `/admin/wfh/${id}/reject`;

  const response = await api.put(endpoint, {
    status,
  });

  return response.data;
};