import api from "./axios";

export interface AssignedProject {
  id: string;
  name: string;
}

export interface TodayAttendance {
  checkedIn: boolean;
  checkIn?: string;
  checkOut?: string;
  mode?: "office" | "wfh";
}

export interface WorkStatus {
  projectId?: string;
  plan: string;
  status: string;
}

export interface DashboardData {
  projectsCount: number;
  pendingLeaves: number;
  pendingWFH: number;
  salarySlips: number;

  todayAttendance: TodayAttendance;
  workStatus: WorkStatus;

  assignedProjects: AssignedProject[];
}

// Get User Dashboard
export const getDashboard = async (): Promise<DashboardData> => {
  try {
    const response = await api.get<DashboardData>(
      "" // <-- Add User Dashboard API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get Dashboard Error:", error);
    throw error;
  }
};

// Check In
export const checkIn = async (
  mode: "office" | "wfh"
) => {
  try {
    const response = await api.post(
      "", // <-- Add Check In API Endpoint Here
      {
        mode,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Check In Error:", error);
    throw error;
  }
};

// Check Out
export const checkOut = async () => {
  try {
    const response = await api.post(
      "" // <-- Add Check Out API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Check Out Error:", error);
    throw error;
  }
};