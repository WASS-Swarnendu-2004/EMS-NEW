import api from "./axios";

export interface AdvanceRequest {
  _id: string;
  employee: string;
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