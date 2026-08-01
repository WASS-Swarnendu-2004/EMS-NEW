import api from "./axios";

export interface EmployeeInfo {
  _id: string;
  employeeId: string;
  fullName: string;
  role: string;
  department: string;
}

export interface Attendance {
  _id: string;
  employee: EmployeeInfo | null;
  date: string;
  checkIn: string;
  checkOut: string | null;
  workingHours: number;
  status: string;
  mode: string;
}

interface GetAttendanceResponse {
    success: boolean;
    total: number;
    attendance: Attendance[];
}

export const getAttendance = async (): Promise<Attendance[]> => {
  try {

    const response =
    await api.get<GetAttendanceResponse>(
        "/admin/attendance"
    );

    return response.data.attendance;

  } catch (error) {

    console.error("Get Attendance Error:", error);
    throw error;

  }
};


// USER
export const getMyAttendance = async (): Promise<Attendance[]> => {
  try {
    const response = await api.get("/attendance/history");

    return response.data.history;

  } catch (error) {
    console.error("Get My Attendance Error:", error);
    throw error;
  }
};