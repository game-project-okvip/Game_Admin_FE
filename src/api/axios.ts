import axios from "axios";

const api = axios.create({
  //baseURL: "https://api-webmanagment.781243555.com", 
  baseURL: "http://128.10.102.8:3003", 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
