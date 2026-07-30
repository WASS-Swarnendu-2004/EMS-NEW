import api from "./axios";

export interface DashboardCards {
  totalEmployees: number;
  activeProjects: number;
  presentToday: number;
  pendingApprovals: number;
  pendingLeave: number;
  pendingWFH: number;
}

export interface RecentWorkStatus {
  _id: string;

  employee: {
    _id: string;
    employeeId: string;
    fullName: string;
  };

  project: {
    _id: string;
    projectName: string;
  };

  workDate: string;
  plan: string;
  endOfDayStatus: string;
}

export interface AdminDashboardResponse {
  success: boolean;
  cards: DashboardCards;
  recentWorkStatus: RecentWorkStatus[];
}

export async function getAdminDashboard() {
  const { data } = await api.get<AdminDashboardResponse>(
    "/admin/dashboard"
  );

  return data;
}