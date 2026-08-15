import axios from "axios";

// Создаем инстанс с базовым URL NestJS бэкенда
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Перехватчик запросов: автоматически добавляем JWT-токен
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Перехватчик ответов: при 401 сбрасываем авторизацию
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export default api;
