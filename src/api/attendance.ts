import api from "./axios";

export interface EmployeeInfo {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
}

export interface Attendance {
  _id: string;
  employee: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  workingHours: number;
  status: string;
}

export const getAttendance = async (): Promise<Attendance[]> => {
  try {

    const response = await api.get(
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
    const response = await api.get(
      "/attendance/history"
    );

    return response.data.attendance;

  } catch (error) {
    console.error("Get My Attendance Error:", error);
    throw error;
  }
};