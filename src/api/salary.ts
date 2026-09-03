import api from "./axios";

/* =========================================================
 * Salary Configuration
 * ======================================================= */

export interface SalaryComponent {
  id?: string;
  label: string;
  type: "Earning" | "Deduction";
  mode: "% of gross" | "Fixed";
  value: number | "";
}

/* =========================================================
 * Salary Items
 * ======================================================= */

export interface SalaryItem {
  label: string;
  type: "earning" | "deduction";
  amount: number;
}

/* =========================================================
 * Employee Custom Fields
 * ======================================================= */

export interface SalaryCustomField {
  label: string;
  value: string;
}

/* =========================================================
 * Employee Information
 * ======================================================= */

export interface SalaryEmployee {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  bankAccount: string;

  joiningDate?: string;

  /*
   * PAN Number
   */
  pan?: string;

  customFields?: SalaryCustomField[];
}

/* =========================================================
 * Additional Employee Information
 * ======================================================= */

export interface SalaryEmployeeInfo {
  panNumber?: string;
  uanNumber?: string;
  esiNumber?: string;
  bankName?: string;
  joiningDate?: string;
  bankAccount?: string;
}

/* =========================================================
 * Salary Slip
 * ======================================================= */

export interface SalarySlip {
  id: string;

  employeeId: string;

  /*
   * Stored in frontend as:
   * YYYY-MM
   *
   * Example:
   * 2026-08
   */
  month: string;

  /*
   * Raw year/month information.
   */
  year?: number;
  monthNumber?: number;

  /* Employee information */
  employee?: SalaryEmployee;

  /* Additional employee information */
  employeeInfo?: SalaryEmployeeInfo;

  /* Salary information */
  gross: number;
  net: number;

  totalEarnings: number;
  totalDeductions: number;

  /* Attendance / salary calculation information */
  workingDays?: number;
  absentDays?: number;

  /*
   * Paid Days
   *
   * Comes directly from API:
   * "paidDays": 9
   */
  paidDays?: number;

  /* Leave information */
  paidLeaveDays?: number;
  paidCasualLeaveDays?: number;
  paidSickLeaveDays?: number;
  unpaidLeaveDays?: number;

  /* Payable days */
  payableDays?: number;

  totalAvailableMinutes?: number;

  actualWorkingMinutes?: number;
  finalPaidMinutes?: number;

  earlyCheckoutMinutes?: number;

  leaveDeduction?: number;
  earlyCheckoutDeduction?: number;

  /* PF information */
  pfApplicable?: boolean;
  pfPercentage?: number;
  pfWage?: number;

  employeePF?: number;
  employerPF?: number;

  professionalTax?: number;

  /* Salary generation information */
  generatedAt: string;

  /* Combined earnings + deductions */
  items: SalaryItem[];
}

/* =========================================================
 * Salary List Item
 * ======================================================= */

export interface SalaryListItem {
  employeeId: string;
  employeeIdMongo: string;
  fullName: string;
  department: string;
  grossSalary: number;
  generated: boolean;
  salarySlipId?: string;
  netSalary?: number;
}

/* =========================================================
 * Custom Field Helper
 * ======================================================= */

const getEmployeeCustomField = (
  employee: any,
  label: string,
): string | undefined => {
  const fields = employee?.customFields;

  if (!Array.isArray(fields)) {
    return undefined;
  }

  const normalizedLabel = label.trim().toLowerCase();

  const field = fields.find(
    (item: any) =>
      String(item?.label ?? "")
        .trim()
        .toLowerCase() === normalizedLabel,
  );

  if (
    field?.value === undefined ||
    field?.value === null
  ) {
    return undefined;
  }

  const value = String(field.value).trim();

  return value !== "" ? value : undefined;
};

/* =========================================================
 * Map Salary Slip
 * ======================================================= */

const mapSalarySlip = (
  s: any,
  employeeInfo?: any,
): SalarySlip => {
  const year = Number(s.year);
  const monthNumber = Number(s.month);

  /* -------------------------------------------------------
   * Employee
   * ----------------------------------------------------- */

  const employee =
    typeof s.employee === "object" &&
    s.employee !== null
      ? s.employee
      : undefined;

  /* -------------------------------------------------------
   * Paid Leaves
   * ----------------------------------------------------- */

  const paidLeaveDays =
    s.paidLeaveDays !== undefined &&
    s.paidLeaveDays !== null
      ? Number(s.paidLeaveDays)
      : (Number(s.paidCasualLeaveDays) || 0) +
        (Number(s.paidSickLeaveDays) || 0);

  /* -------------------------------------------------------
   * Paid Days
   *
   * API response example:
   *
   * "paidDays": 9
   *
   * This is different from paidLeaveDays.
   * ----------------------------------------------------- */

  const paidDays =
    s.paidDays !== undefined &&
    s.paidDays !== null
      ? Number(s.paidDays)
      : undefined;

  /* -------------------------------------------------------
   * Payable Days
   * ----------------------------------------------------- */

  const payableDays =
    s.payableDays !== undefined &&
    s.payableDays !== null
      ? Number(s.payableDays)
      : undefined;

  /* -------------------------------------------------------
   * Employee Custom Fields
   *
   * Supports:
   *
   * Bank Name
   * Name Bank
   * UAN No
   * ESI No
   * ----------------------------------------------------- */

  const uanNumber =
    employeeInfo?.uanNumber ||
    getEmployeeCustomField(
      employee,
      "UAN No",
    );

  const esiNumber =
    employeeInfo?.esiNumber ||
    getEmployeeCustomField(
      employee,
      "ESI No",
    );

  const bankName =
    employeeInfo?.bankName ||
    getEmployeeCustomField(
      employee,
      "Bank Name",
    ) ||
    getEmployeeCustomField(
      employee,
      "Name Bank",
    );

  /* -------------------------------------------------------
   * PAN NUMBER
   *
   * Supports:
   *
   * employeeInfo.panNumber
   * employee.pan
   * ----------------------------------------------------- */

  const panNumber =
    employeeInfo?.panNumber ||
    employee?.pan ||
    undefined;

  /* -------------------------------------------------------
   * Employee Information
   *
   * Important:
   * Even if response.employeeInfo is not present,
   * values are extracted from employee.
   * ----------------------------------------------------- */

  const mappedEmployeeInfo: SalaryEmployeeInfo = {
    panNumber,

    uanNumber,

    esiNumber,

    bankName,

    joiningDate:
      employeeInfo?.joiningDate ||
      employee?.joiningDate,

    bankAccount:
      employeeInfo?.bankAccount ||
      employee?.bankAccount,
  };

  /* -------------------------------------------------------
   * Return mapped salary slip
   * ----------------------------------------------------- */

  return {
    id: s._id,

    employeeId:
      typeof s.employee === "object"
        ? s.employee?._id
        : s.employee,

    /* -----------------------------------------------------
     * Month
     * --------------------------------------------------- */

    month:
      year && monthNumber
        ? `${year}-${String(monthNumber).padStart(2, "0")}`
        : "",

    year,

    monthNumber,

    /* -----------------------------------------------------
     * Employee
     * --------------------------------------------------- */

    employee: employee
      ? {
          _id: employee._id,

          employeeId:
            employee.employeeId,

          fullName:
            employee.fullName,

          email:
            employee.email,

          phone:
            employee.phone,

          department:
            employee.department,

          designation:
            employee.designation,

          bankAccount:
            employee.bankAccount ||
            "",

          joiningDate:
            employee.joiningDate,

          pan:
            employee.pan ||
            "",

          customFields:
            Array.isArray(
              employee.customFields,
            )
              ? employee.customFields
              : [],
        }
      : undefined,

    /* -----------------------------------------------------
     * Additional Employee Information
     * --------------------------------------------------- */

    employeeInfo:
      mappedEmployeeInfo,

    /* -----------------------------------------------------
     * Salary
     * --------------------------------------------------- */

    gross:
      Number(s.grossSalary) || 0,

    net:
      Number(s.netSalary) || 0,

    totalEarnings:
      Number(s.totalEarnings) || 0,

    totalDeductions:
      Number(s.totalDeductions) || 0,

    /* -----------------------------------------------------
     * Attendance
     * --------------------------------------------------- */

    workingDays:
      Number(s.workingDays) || 0,

    absentDays:
      Number(s.absentDays) || 0,

    /*
     * IMPORTANT:
     * API returns:
     *
     * "paidDays": 9
     *
     * Now this value is available as:
     *
     * slip.paidDays
     */
    paidDays,

    totalAvailableMinutes:
      Number(s.totalAvailableMinutes) || 0,

    /* -----------------------------------------------------
     * Leaves
     * --------------------------------------------------- */

    paidLeaveDays,

    paidCasualLeaveDays:
      Number(s.paidCasualLeaveDays) || 0,

    paidSickLeaveDays:
      Number(s.paidSickLeaveDays) || 0,

    unpaidLeaveDays:
      Number(s.unpaidLeaveDays) || 0,

    /* -----------------------------------------------------
     * Payable Days
     * --------------------------------------------------- */

    payableDays,

    /* -----------------------------------------------------
     * Working Time
     * --------------------------------------------------- */

    actualWorkingMinutes:
      Number(s.actualWorkingMinutes) || 0,

    finalPaidMinutes:
      Number(s.finalPaidMinutes) || 0,

    earlyCheckoutMinutes:
      Number(s.earlyCheckoutMinutes) || 0,

    /* -----------------------------------------------------
     * Deductions
     * --------------------------------------------------- */

    leaveDeduction:
      Number(s.leaveDeduction) || 0,

    earlyCheckoutDeduction:
      Number(s.earlyCheckoutDeduction) || 0,

    /* -----------------------------------------------------
     * PF
     * --------------------------------------------------- */

    pfApplicable:
      Boolean(s.pfApplicable),

    pfPercentage:
      Number(s.pfPercentage) || 0,

    pfWage:
      Number(s.pfWage) || 0,

    employeePF:
      Number(s.employeePF) || 0,

    employerPF:
      Number(s.employerPF) || 0,

    professionalTax:
      Number(s.professionalTax) || 0,

    /* -----------------------------------------------------
     * Metadata
     * --------------------------------------------------- */

    generatedAt:
      s.generatedAt,

    /* -----------------------------------------------------
     * Earnings + Deductions
     * --------------------------------------------------- */

    items: [
      ...(Array.isArray(s.earnings)
        ? s.earnings
        : []
      ).map(
        (e: any): SalaryItem => ({
          label:
            e.label || "Not Applicable",

          amount:
            Number(e.amount) || 0,

          type: "earning",
        }),
      ),

      ...(Array.isArray(s.deductions)
        ? s.deductions
        : []
      ).map(
        (d: any): SalaryItem => ({
          label:
            d.label || "Not Applicable",

          amount:
            Number(d.amount) || 0,

          type: "deduction",
        }),
      ),
    ],
  };
};

/* =========================================================
 * Get logged-in employee salary slips
 * ======================================================= */

export const getMySalarySlips = async (): Promise<
  SalarySlip[]
> => {
  const response = await api.get("/salary");

  return (
    response.data.salaries || []
  ).map((s: any) =>
    mapSalarySlip(
      s,
      s.employeeInfo,
    ),
  );
};

/* =========================================================
 * Get salary list for a particular month
 * ======================================================= */

export const getSalaryList = async (
  month: string,
): Promise<SalaryListItem[]> => {
  const [year, mon] =
    month.split("-");

  const response = await api.get(
    "/admin/salary",
    {
      params: {
        month: Number(mon),
        year: Number(year),
      },
    },
  );

  return response.data.employees;
};

/* =========================================================
 * Generate salary for all employees
 * ======================================================= */

export const generateSalary = async (
  month: string,
) => {
  const [year, mon] =
    month.split("-");

  try {
    const response = await api.post(
      "/admin/salary/generate",
      {
        month: Number(mon),
        year: Number(year),
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Generate Salary Error:",
      error,
    );

    throw error;
  }
};

/* =========================================================
 * Get salary configuration
 * ======================================================= */

export const getSalaryConfig = async (): Promise<
  SalaryComponent[]
> => {
  try {
    const response = await api.get(
      "/admin/salary/config",
    );

    return (
      response.data.configs || []
    ).map(
      (c: any): SalaryComponent => ({
        id: c._id,
        label: c.label,
        type: c.type,
        mode: c.mode,
        value: c.value,
      }),
    );
  } catch (error) {
    console.error(
      "Get Salary Configuration Error:",
      error,
    );

    throw error;
  }
};

/* =========================================================
 * Update salary configuration
 * ======================================================= */

export const updateSalaryConfig = async (
  data: SalaryComponent[],
) => {
  const response = await api.post(
    "/admin/salary/config",
    data,
  );

  return response.data;
};

/* =========================================================
 * Generate salary for one employee
 * ======================================================= */

export const generateSalaryForEmployee = async (
  employeeId: string,
  month: string,
) => {
  const [year, mon] =
    month.split("-");

  const response = await api.post(
    `/admin/salary/generate/${employeeId}`,
    {
      month: Number(mon),
      year: Number(year),
    },
  );

  return response.data;
};

/* =========================================================
 * Get one salary slip
 * ======================================================= */

export const getSalarySlip = async (
  salarySlipId: string,
): Promise<SalarySlip> => {
  const response = await api.get(
    `/admin/salary/${salarySlipId}`,
  );

  const s =
    response.data.salary;

  const employeeInfo =
    response.data.employeeInfo;

  return mapSalarySlip(
    s,
    employeeInfo,
  );
};