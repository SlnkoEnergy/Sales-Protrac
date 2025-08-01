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
  const token = getRuntimeToken();
  if (token) {
    config.headers["x-auth-token"] = token;
  } else {
    console.warn("No auth token found for this request.");
  }
  return config;
});


export default Axios;
