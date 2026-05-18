import axios, { type AxiosRequestConfig } from "axios"
import type { HttpRequestOptions } from "./interface/HttpRequestOption";
import { useAuthStore } from "../store/auth.store";
import { setupAuthInterceptor } from "./authInterceptor";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
})

setupAuthInterceptor(axiosInstance);

export async function httpClient<TResponse, TBody = undefined>(options: HttpRequestOptions<TBody>): Promise<TResponse> {

  const { method, path, body } = options;
  const token = useAuthStore.getState().token;

  const axiosConfig: AxiosRequestConfig = {
    method: method,
    url: path,
    data: body,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  try {
    const response = await axiosInstance.request<TResponse>(axiosConfig);
    return response.data;

  } catch (error: any) {
    const backDetail = error.response?.data?.detail;
    const backMessage = error.response?.data?.message;

    if (backDetail) throw new Error(backDetail);
    if (backMessage) throw new Error(backMessage);

    const status = error.response?.status;
    const message = error.response?.data ?? error.message ?? "Unknown error";

    throw new Error(`HTTP ${status}: ${JSON.stringify(message)}`);
  }
}
