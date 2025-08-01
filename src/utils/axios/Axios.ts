import axios from "axios";
import { getRuntimeToken } from "./AuthSetter";

const Axios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers["x-auth-token"] = token;
  } 
  return config;
});


export default Axios;
