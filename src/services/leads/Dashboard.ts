import Axios from "@/utils/axios/Axios";

// services/leads/dashboard.ts
export const getTopLeadSources = async (params = {}) => {
  const response = await Axios.get("/bddashboard/lead-source", {
    params,
  });
  return response.data?.lead_sources ?? [];
};

export const getTeamAvailability = async (params = {}) => {
  const response = await Axios.get("/bddashboard/taskdashboard", {
    params,
  });
  return response.data?.per_member_task_summary ?? [];
};

export const getLeadSummary = async (params = {}) => {
  const response = await Axios.get("/bddashboard/lead-summary", {
    params,
  });
  return response.data?.lead_status_summary ?? {};
};

export const getLeadConversion = async (params = {}) => {
  const response = await Axios.get("/bddashboard/lead-conversation", {
    params,
  });
  return response.data ?? {};
};

export const getSummary = async (params = {}) => {
  const response = await Axios.get("/bddashboard/summary", {
    params,
  });
  return response.data ?? {};
};

export const getLeadFunnel = async (params = {}) => {
  try {
    const response = await Axios.get("/bddashboard/lead-funnel", {
      params,
    });
    return response.data ?? {};
  } catch (err) {
    console.error("❌ getLeadFunnel error:", err);
    throw err;
  }
};

export const getWonAndLost = async (params = {}) => {
  const response = await Axios.get("/bddashboard/wonandlost", {
    params,
  });
  return response.data ?? {};
};

export const getToDoList = async () => {
  const response = await Axios.get("/bddashboard/task-assign");
  return response.data ?? {};
};
