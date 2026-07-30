import api from "./axios";

export interface DashboardResponse {
  success: boolean;
  cards: {
    myProjects: number;
    pendingLeaves: number;
    pendingWFH: number;
    salarySlips: number;
  };

  attendance: {
    checkedIn: boolean;
    checkIn?: string;
    checkOut?: string;
    mode?: "office" | "wfh";
  } | null;

  todayPlan: {
    projectId?: string;
    plan: string;
    status: string;
  } | null;
}

export const getDashboard = async (): Promise<DashboardResponse> => {
  const { data } = await api.get<DashboardResponse>("/dashboard");
  return data;
};

// Check In
export const checkIn = async (mode: "office" | "wfh") => {
  try {
    const response = await api.post("/attendance/check-in", {
      mode: mode === "office" ? "Office" : "WFH",
    });

    return response.data;
  } catch (error) {
    console.error("Check In Error:", error);
    throw error;
  }
};

// Check Out
export const checkOut = async () => {
  try {
    const response = await api.post("/attendance/check-out");

    return response.data;
  } catch (error) {
    console.error("Check Out Error:", error);
    throw error;
  }
};