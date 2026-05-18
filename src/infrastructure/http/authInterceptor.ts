import type { AxiosInstance } from "axios";
import { useAuthStore } from "../store/auth.store";
import { API_ENDPOINTS } from "./types/endpoints";

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  pendingQueue = [];
}

export function setupAuthInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const is401 = error.response?.status === 401;
      const isRefreshEndpoint = originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REFRESH);
      const alreadyRetried = originalRequest?._retry;

      if (is401 && !isRefreshEndpoint && !alreadyRetried) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            pendingQueue.push({
              resolve: (token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(axiosInstance(originalRequest));
              },
              reject,
            });
          });
        }

        isRefreshing = true;
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          isRefreshing = false;
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        try {
          const { data } = await axiosInstance.post<{ token: string; refresh_token: string }>(
            API_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken }
          );

          useAuthStore.getState().setTokens(data.token, data.refresh_token);

          console.log('Token refrescado correctamente');


          processQueue(null, data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return axiosInstance(originalRequest);

        } catch (refreshError) {
          processQueue(refreshError, null);
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);

        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}
