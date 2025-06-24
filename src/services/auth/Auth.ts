import Axios from "@/utils/axios/axios";

export const AuthLogin = async ({payload}) => {
  const response = await Axios.post("/logiN-IT", payload);
  return response.data ?? {};
};

export const getUserById = async (userId) => {
  const response = await Axios.get(`/get-single-useR-IT/${userId}`); 
  return response.data ?? {};
};