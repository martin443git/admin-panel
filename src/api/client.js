import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const refresh = localStorage.getItem("refresh");

    if (error.response?.status === 401 && refresh && !original._retried) {
      original._retried = true;
      try {
        refreshing =
          refreshing || axios.post(`${API_URL}/auth/refresh/`, { refresh });
        const { data } = await refreshing;
        refreshing = null;
        localStorage.setItem("access", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        refreshing = null;
        localStorage.clear();
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;