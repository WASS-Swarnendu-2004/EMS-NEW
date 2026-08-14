import api from "./axios";

// =========================
// TYPES
// =========================

export interface ReimbursementEmployee {
  _id: string;
  employeeId: string;
  fullName: string;
  role?: string;
  department?: string;
  profileImage?: string;
}

export interface ReimbursementRequest {
  _id: string;
  employee: string | ReimbursementEmployee;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  adminRemark: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReimbursementPayload {
  amount: number;
  reason: string;
}

export interface ReimbursementHistoryResponse {
  success: boolean;
  total: number;
  reimbursements: ReimbursementRequest[];
}

export interface CreateReimbursementResponse {
  success: boolean;
  message: string;
  reimbursement?: ReimbursementRequest;
}

// =========================
// EMPLOYEE APIs
// =========================

/**
 * Employee - Request Reimbursement
 * POST /employee/reimbursement
 */
export const requestReimbursement = async (
  data: CreateReimbursementPayload
): Promise<CreateReimbursementResponse> => {
  try {
    const response = await api.post(
      "/employee/reimbursement",
      data
    );

    return response.data;
  } catch (error) {
    console.error("Request Reimbursement Error:", error);
    throw error;
  }
};

/**
 * Employee - Get My Reimbursement History
 * GET /employee/reimbursement
 */
export const getReimbursementHistory =
  async (): Promise<ReimbursementHistoryResponse> => {
    try {
      const response = await api.get(
        "/employee/reimbursement"
      );

      return response.data;
    } catch (error) {
      console.error("Get Reimbursement History Error:", error);
      throw error;
    }
  };

// =========================
// ADMIN APIs
// =========================

/**
 * Admin - Get All Reimbursement Requests
 * GET /admin/reimbursement
 */
export const getAdminReimbursementRequests =
  async (): Promise<ReimbursementHistoryResponse> => {
    try {
      const response = await api.get(
        "/admin/reimbursement"
      );

      return response.data;
    } catch (error) {
      console.error(
        "Get Admin Reimbursement Requests Error:",
        error
      );
      throw error;
    }
  };

/**
 * Admin - Approve Reimbursement Request
 * PUT /admin/reimbursement/:id/approve
 */
export const approveReimbursement = async (
  id: string
): Promise<CreateReimbursementResponse> => {
  try {
    const response = await api.put(
      `/admin/reimbursement/${id}/approve`
    );

    return response.data;
  } catch (error) {
    console.error("Approve Reimbursement Error:", error);
    throw error;
  }
};

/**
 * Admin - Reject Reimbursement Request
 * PUT /admin/reimbursement/:id/reject
 */
export const rejectReimbursement = async (
  id: string,
  remark: string
): Promise<CreateReimbursementResponse> => {
  try {
    const response = await api.put(
      `/admin/reimbursement/${id}/reject`,
      {
        remark,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Reject Reimbursement Error:", error);
    throw error;
  }
};