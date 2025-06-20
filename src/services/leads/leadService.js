import Axios from "../axios/axios";

export const getLeads = async () => {
  const response = await Axios.get("/leads");
  return response.data;
};