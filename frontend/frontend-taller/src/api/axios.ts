import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8080"),
  timeout: 20000,
  withCredentials: true,
});
api.interceptors.request.use(async (config) => {
  if (!["get", "head", "options"].includes(config.method ?? "get")) {
    const { data } = await api.get<{ token: string; headerName: string }>("/api/auth/csrf");
    config.headers.set(data.headerName, data.token);
  }
  return config;
});
api.interceptors.response.use((respuesta) => respuesta, (error) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && !error.config?.url?.endsWith("/auth/login")) {
    window.dispatchEvent(new Event("sesion-expirada"));
  }
  return Promise.reject(error);
});
export default api;
