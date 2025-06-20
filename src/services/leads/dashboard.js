import Axios from "axios";

export const getTopLeadSources = async () => {
  const response = await Axios.get("/bddashboard/lead-source");
  return response.data?.lead_sources ?? [];
};
