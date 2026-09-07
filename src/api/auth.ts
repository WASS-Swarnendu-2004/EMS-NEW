import api from "./axios";

export interface LoginPayload {
  email: string;
  password: string;
  kind: "admin" | "employee";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "employee";
  };
}

/* ============================================================
 * LOGIN
 * ============================================================ */

export async function loginUser(data: LoginRequest) {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
}

/* ============================================================
 * LOGOUT
 * ============================================================ */

export const logoutUser = async () => {
  try {
    const response = await api.post(
      "" // <-- Add Logout API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

/* ============================================================
 * CURRENT USER
 * ============================================================ */

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<User>(
      "" // <-- Add Current User API Endpoint Here
    );

    return response.data;
  } catch (error) {
    console.error("Get Current User Error:", error);
    throw error;
  }
};

/* ============================================================
 * FORGOT PASSWORD
 * POST /api/auth/forgot-password
 * ============================================================ */

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  remainingRequests?: number;
}

export const forgotPassword = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      {
        email,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Forgot Password Error:", error);
    throw error;
  }
};

/* ============================================================
 * VERIFY RESET OTP
 * POST /api/auth/verify-reset-otp
 * ============================================================ */

export interface VerifyResetOtpResponse {
  success: boolean;
  message: string;
}

export const verifyResetOtp = async (
  email: string,
  otp: string
): Promise<VerifyResetOtpResponse> => {
  try {
    const response = await api.post<VerifyResetOtpResponse>(
      "/auth/verify-reset-otp",
      {
        email,
        otp,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Verify Reset OTP Error:", error);
    throw error;
  }
};

/* ============================================================
 * RESET PASSWORD
 * POST /api/auth/reset-password
 * ============================================================ */

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<ResetPasswordResponse> => {
  try {
    const response = await api.post<ResetPasswordResponse>(
      "/auth/reset-password",
      {
        email,
        otp,
        newPassword,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Reset Password Error:", error);
    throw error;
  }
};