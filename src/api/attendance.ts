import api from "./axios";

export interface EmployeeInfo {
  _id: string;
  employeeId: string;
  fullName: string;
  email?: string;
  department: string;
  designation: string;
}

export interface Attendance {
  _id: string;

  employee: EmployeeInfo | null;

  date: string;

  checkIn: string | null;
  checkOut: string | null;

  workingMinutes: number;
  paidMinutes: number;
  workingHours: number;

  status: string;
  mode: "Office" | "WFH" | string;

  isLateCheckIn: boolean;
  checkInRemark: string;

  isEarlyCheckOut: boolean;
  checkOutRemark: string;

  // Admin override
  adminApproved?: boolean;
  adminApprovedMinutes?: number;
  adminRemark?: string;
  adminApprovedAt?: string;
  adminApprovedBy?: string;

  createdAt?: string;
  updatedAt?: string;
}

interface GetAttendanceResponse {
  success: boolean;
  total: number;
  attendance: Attendance[];
}

// --------------------------------------------------
// ADMIN - GET ATTENDANCE
// --------------------------------------------------

export const getAttendance = async (): Promise<Attendance[]> => {
  try {
    const response =
      await api.get<GetAttendanceResponse>(
        "/admin/attendance"
      );

    return response.data.attendance;
  } catch (error) {
    console.error(
      "Get Attendance Error:",
      error
    );

    throw error;
  }
};

// --------------------------------------------------
// ADMIN - OVERRIDE / APPROVE FULL DAY ATTENDANCE
// --------------------------------------------------

export const overrideAttendance = async (
  attendanceId: string,
  data: {
    adminApprovedMinutes: number;
    adminRemark: string;
  }
): Promise<Attendance> => {
  try {
    const response =
      await api.put<{
        success: boolean;
        message: string;
        attendance: Attendance;
      }>(
        `/admin/attendance/${attendanceId}/override`,
        data
      );

    return response.data.attendance;
  } catch (error) {
    console.error(
      "Attendance Override Error:",
      error
    );

    throw error;
  }
};

// --------------------------------------------------
// USER - MY ATTENDANCE
// --------------------------------------------------

export const getMyAttendance =
  async (): Promise<Attendance[]> => {
    try {
      const response =
        await api.get<{
          success: boolean;
          total: number;
          history: Attendance[];
        }>("/attendance/history");

      return response.data.history;
    } catch (error) {
      console.error(
        "Get My Attendance Error:",
        error
      );

      throw error;
    }
  };