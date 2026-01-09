import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Http client centralizzato per mantenere coerenza con il backend e gestire
// automaticamente cookie, errori 401/403 e reindirizzamenti al login.

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export interface ApiError {
  status: number;
  message: string;
}

export const createHttpClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true // fondamentale per inviare i cookie di sessione
  });

  // Intercettore di risposta per gestire gli errori 401/403
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Opzionalmente emettere un evento globale o usare una callback
        // Per semplicità: reindirizziamo direttamente al login se non ci si trova già lì
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/login')) {
            window.location.href = '/login?reason=session_expired';
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const httpClient = createHttpClient();

export default httpClient;
