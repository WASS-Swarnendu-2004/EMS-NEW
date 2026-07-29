import api from "./axios";

export interface LoginPayload {
  email: string;
  password: string;
  kind: "admin" | "employee"
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

export async function loginUser(data: LoginRequest) {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    data
  );

  return response.data;
}

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

export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post(
      "", // <-- Add Forgot Password API Endpoint Here
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

export const resetPassword = async (
  token: string,
  password: string
) => {
  try {
    const response = await api.post(
      "", // <-- Add Reset Password API Endpoint Here
      {
        token,
        password,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Reset Password Error:", error);
    throw error;
  }
};