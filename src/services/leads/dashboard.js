import Axios from "../../utils/axios/axios";

export const getTopLeadSources = async () => {
  const response = await Axios.get("/bddashboard/lead-source");
  return response.data?.lead_sources ?? [];
};


export const getTeamAvailability = async () => {
  const response = await Axios.get("/bddashboard/taskdashboard");
  return response.data?.task_dashboard ?? [];
};

export const getLeadSummary = async () => {
  const response = await Axios.get("/bddashboard/lead-summary");
  return response.data?.lead_status_summary ?? {};
};

export const getLeadConversion = async (startDate, endDate) => {
  const response = await Axios.get(`/bddashboard/lead-conversation`, {
    params: { startDate, endDate },
  });
  return response.data ?? {};
};

export const getSummary = async () => {
  const response = await Axios.get("/bddashboard/summary");
  return response.data ?? {};
};