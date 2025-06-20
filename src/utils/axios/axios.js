import axios from "axios";

// ✅ Log the env variable before using it
console.log("✅ ENV Loaded URL:", import.meta.env.VITE_API_URL);

const Axios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default Axios;
