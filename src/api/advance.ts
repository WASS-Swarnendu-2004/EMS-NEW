import api from "./axios";

// =========================
// TYPES
// =========================

export interface AdvanceEmployee {
  _id: string;
  employeeId: string;
  fullName: string;
  role?: string;
  department?: string;
  profileImage?: string;
}

export interface AdvanceRequest {
  _id: string;
  employee: string | AdvanceEmployee;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  adminRemark: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdvancePayload {
  amount: number;
}

export interface AdvanceHistoryResponse {
  success: boolean;
  total: number;
  advances: AdvanceRequest[];
}

export interface CreateAdvanceResponse {
  success: boolean;
  message: string;
  advance: AdvanceRequest;
}

// =========================
// EMPLOYEE APIs
// =========================

/**
 * Employee - Request Advance
 * POST /employee/advance
 */
export const requestAdvance = async (
  data: CreateAdvancePayload
): Promise<CreateAdvanceResponse> => {
  try {
    const response = await api.post("/employee/advance", data);

    return response.data;
  } catch (error) {
    console.error("Request Advance Error:", error);
    throw error;
  }
};

/**
 * Employee - Get My Advance History
 * GET /employee/advance
 */
export const getAdvanceHistory =
  async (): Promise<AdvanceHistoryResponse> => {
    try {
      const response = await api.get("/employee/advance");

      return response.data;
    } catch (error) {
      console.error("Get Advance History Error:", error);
      throw error;
    }
  };

// =========================
// ADMIN APIs
// =========================

/**
 * Admin - Get All Advance Requests
 * GET /admin/advance
 */
export const getAdminAdvanceRequests =
  async (): Promise<AdvanceHistoryResponse> => {
    try {
      const response = await api.get("/admin/advance");

      return response.data;
    } catch (error) {
      console.error("Get Admin Advance Requests Error:", error);
      throw error;
    }
  };

/**
 * Admin - Approve Advance Request
 * PUT /admin/advance/:id/approve
 */
export const approveAdvance = async (
  id: string
): Promise<CreateAdvanceResponse> => {
  try {
    const response = await api.put(
      `/admin/advance/${id}/approve`
    );

    return response.data;
  } catch (error) {
    console.error("Approve Advance Error:", error);
    throw error;
  }
};

/**
 * Admin - Reject Advance Request
 * PUT /admin/advance/:id/reject
 */
export const rejectAdvance = async (
  id: string,
  remark: string
): Promise<CreateAdvanceResponse> => {
  try {
    const response = await api.put(
      `/admin/advance/${id}/reject`,
      {
        remark,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Reject Advance Error:", error);
    throw error;
  }
};