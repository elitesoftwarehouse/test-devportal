import axios, { AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "/api",
  withCredentials: true
});

export interface ActivationResponse {
  success: boolean;
  code:
    | "ACTIVATION_SUCCESS"
    | "TOKEN_INVALID"
    | "TOKEN_EXPIRED"
    | "TOKEN_USED"
    | "USER_NOT_FOUND"
    | "ACCOUNT_ALREADY_ACTIVE"
    | "ACTIVATION_ERROR";
  message: string;
}

export const activateAccount = async (token: string): Promise<ActivationResponse> => {
  const response = await apiClient.get<ActivationResponse>(`/auth/activate/${token}`);
  return response.data;
};

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    status: string;
  };
  code?: string;
  message?: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", { email, password });
  return response.data;
};
