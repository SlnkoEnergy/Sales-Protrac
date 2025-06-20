import Axios from "../../utils/axios/axios";

export const AuthLogin = async ({payload}) => {
  const response = await Axios.post("/logiN-IT", payload);
  return response.data ?? {};
};