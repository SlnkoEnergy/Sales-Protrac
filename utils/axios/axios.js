import axios from "axios";

const Axios = axios.create({
  baseURL: "https://dev.api.slnkoprotrac.com/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default Axios;
