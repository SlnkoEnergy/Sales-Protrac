import Axios from "@/utils/axios/Axios";

export const  getLeads = async (params = {}) => {
  let url = "/bddashboard/all-lead";

  const query = Object.entries(params)
    .map(([key, val]) => {
      if (Array.isArray(val)) {
        return val.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
      }
      return `${key}=${encodeURIComponent(val)}`;
    })
    .join("&");

  if (query) {
    url += `?${query}`;
  }

  const response = await Axios.get(url);
  return response.data;
};

export const getLeadbyId = async(params = {}) => {
  let url = "/bddashboard/lead-details";

  const query = Object.entries(params)
    .map(([key, val]) => {
      if (Array.isArray(val)) {
        return val.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
      }
      return `${key}=${encodeURIComponent(val)}`;
    })
    .join("&");

  if (query) {
    url += `?${query}`;
  }
  const response = await Axios.get(url);
  return response.data;
}

export const createBdLead = async ({ data }: { data: any }) => {
  try {
    const response = await Axios.post(`/create-bd-lead`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

export const editBdLead = async (params = {}, body = {}) => {
  const { _id, ...queryParams } = params;

  let url = `/bddashboard/lead/${_id || ""}`; 

  const query = Object.entries(queryParams)
    .map(([key, val]) => {
      if (Array.isArray(val)) {
        return val.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
      }
      return `${key}=${encodeURIComponent(val)}`;
    })
    .join("&");

  if (query) {
    url += `?${query}`;
  }

  const response = await Axios.put(url, body);
  return response.data;
};

export const deleteLead = async (_id: string, lead_model: string) => {
  const url = `/bddashboard/lead/${_id}?lead_model=${encodeURIComponent(lead_model)}`;
  const response = await Axios.delete(url);
  return response.data;
};

export const transferLead = async(_id: string, lead_model: string, assigned_to)=> {
  const url = `/bddashboard/assign-to/${_id}?lead_model=${encodeURIComponent(lead_model)}`;
  const response = await Axios.put(url, assigned_to);
  return response.data;
}