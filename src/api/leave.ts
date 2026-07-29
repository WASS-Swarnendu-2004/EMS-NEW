import api from "./axios";

export interface Leave {
  _id: string;
  employee: string;
  leaveType: "Casual" | "Sick" | "Earned";
  fromDate: string;
  toDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedAt: string;
  adminRemark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyLeavePayload {
  leaveType: "Casual" | "Sick" | "Earned";
  fromDate: string;
  toDate: string;
  reason: string;
}

export const getLeaves = async (): Promise<Leave[]> => {
  try {
    const response = await api.get<Leave[]>(
      "" // <-- Add Get Leaves API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get Leaves Error:", error);
    throw error;
  }
};

export const approveLeave = async (
  id: string
) => {
  try {
    const response = await api.put(
      "" // <-- Add Approve Leave API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Approve Leave Error:", error);
    throw error;
  }
};

export const rejectLeave = async (
  id: string
) => {
  try {
    const response = await api.put(
      "" // <-- Add Reject Leave API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Reject Leave Error:", error);
    throw error;
  }
};


//USER
export const applyLeave = async (
  data: ApplyLeavePayload
): Promise<Leave> => {

  const response = await api.post<{
    success: boolean;
    message: string;
    leave: Leave;
  }>(
    "/leaves",
    data
  );

  return response.data.leave;
};

export const getMyLeaves = async (): Promise<Leave[]> => {

  const response = await api.get<{
    success: boolean;
    leaves: Leave[];
  }>(
    "/leaves"
  );

  return response.data.leaves;
};