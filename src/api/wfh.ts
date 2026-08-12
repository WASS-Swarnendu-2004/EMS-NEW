import api from "./axios";

export interface WFHEmployee {
  _id: string;
  employeeId: string;
  fullName: string;
  profileImage?: string;
  role?: string;
  department?: string;
}

export interface WFHApplication {
  _id: string;

  employee:
    | string
    | WFHEmployee
    | null;

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

// --------------------------------------------------
// GET ALL WFH APPLICATIONS - ADMIN
// --------------------------------------------------

export const getWFHApplications = async (): Promise<
  WFHApplication[]
> => {
  const response = await api.get<{
    success: boolean;
    requests: WFHApplication[];
  }>("/admin/wfh");

  return response.data.requests;
};

// --------------------------------------------------
// APPLY WFH - EMPLOYEE
// --------------------------------------------------

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

// --------------------------------------------------
// GET MY WFH REQUESTS
// --------------------------------------------------

export const getMyWFHRequests = async (): Promise<
  WFHApplication[]
> => {
  const response = await api.get<{
    success: boolean;
    requests: WFHApplication[];
  }>("/wfh");

  return response.data.requests;
};

// --------------------------------------------------
// APPROVE / REJECT WFH - ADMIN
// --------------------------------------------------

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