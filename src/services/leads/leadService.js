import Axios from "../axios/axios";

export const getLeads = async () => {
  const response = await Axios.get("/bddashboard/all-lead");
  return response.data;
};

