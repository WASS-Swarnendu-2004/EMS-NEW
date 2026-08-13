import api from "./axios";

export interface ReimbursementRequest {
  _id: string;
  employee: string;
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

export const requestReimbursement = async (
  data: CreateReimbursementPayload
): Promise<CreateReimbursementResponse> => {
  try {
    const response = await api.post("/employee/reimbursement", data);

    return response.data;
  } catch (error) {
    console.error("Request Reimbursement Error:", error);
    throw error;
  }
};

export const getReimbursementHistory =
  async (): Promise<ReimbursementHistoryResponse> => {
    try {
      const response = await api.get("/employee/reimbursement");

      return response.data;
    } catch (error) {
      console.error("Get Reimbursement History Error:", error);
      throw error;
    }
  };