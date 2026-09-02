import api from "./axios";

export interface Holiday {
  _id: string;
  date: string;
  reason: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetHolidaysResponse {
  success: boolean;
  total: number;
  holidays: Holiday[];
}

export interface CreateHolidayResponse {
  success: boolean;
  message: string;
  total: number;
  holidays: Holiday[];
}

export interface DeleteHolidayResponse {
  success: boolean;
  message: string;
}

/**
 * Get all holidays
 */
export async function getHolidays() {
  const { data } = await api.get<GetHolidaysResponse>("/admin/holidays");

  return data;
}

/**
 * Create one or multiple holidays
 */
export async function createHolidays(
  dates: string[],
  reason: string,
) {
  const { data } = await api.post<CreateHolidayResponse>(
    "/admin/holidays",
    {
      dates,
      reason,
    },
  );

  return data;
}

/**
 * Delete a holiday
 */
export async function deleteHoliday(id: string) {
  const { data } = await api.delete<DeleteHolidayResponse>(
    `/admin/holidays/${id}`,
  );

  return data;
}