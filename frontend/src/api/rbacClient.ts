import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

let client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (!client) {
    client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // necessario se si usano cookie di sessione
    });
  }
  return client;
}

export interface RbacTestResponse {
  success: boolean;
  error?: string;
  data?: {
    message: string;
    user?: {
      id: string;
      email: string;
      roles: string[];
    };
  };
}

async function callEndpoint(path: string): Promise<RbacTestResponse> {
  try {
    const res = await getClient().get<RbacTestResponse>(path);
    return res.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data as RbacTestResponse;
    }
    return {
      success: false,
      error: 'Errore di comunicazione con il server',
    };
  }
}

export const RbacApi = {
  testSysAdminOnly: () => callEndpoint('/rbac/sys-admin-only'),
  testItOperatorOnly: () => callEndpoint('/rbac/it-operator-only'),
  testExternalOnly: () => callEndpoint('/rbac/external-only'),
  testAuthenticatedGeneric: () => callEndpoint('/rbac/authenticated-generic'),
};
