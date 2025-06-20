import axios from "axios";

const Axios = axios.create({
  baseURL: "https://dev.api.slnkoprotrac.com/v1",
  headers: {
    "Content-Type": "application/json",
  },
});
// Set token in `x-auth-token` header
Axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["x-auth-token"] = token;
  }
  return config;
});
export default Axios;
