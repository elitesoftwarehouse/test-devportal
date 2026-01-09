import axios from "axios";

export interface RegistrationRequest {
  email: string;
  firstName: string;
  lastName: string;
  requestedRole: string;
  locale?: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
}

export async function registerExternalUser(payload: RegistrationRequest): Promise<RegistrationResponse> {
  const response = await axios.post<RegistrationResponse>("/api/auth/register", payload);
  return response.data;
}

export async function activateUser(token: string): Promise<RegistrationResponse> {
  const response = await axios.get<RegistrationResponse>(`/api/auth/activate/${token}`);
  return response.data;
}
