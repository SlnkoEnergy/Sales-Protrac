import Axios from "@/utils/axios/axios";

export const createTask = async (noteData) => {
  try {
    const response = await Axios.post("/bddashboard/bd-tasks", noteData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create note");
  }
};

export const getAllLeadDropdown = async () => {
  try {
    const response = await Axios.get("/bddashboard/all-lead-dropdown"); 
    return response.data.leads; 
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
};

export const  getAllUser = async (params = {}) => {
  let url = "/all-user";

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

export const getAllTask = async () => {
  try {
    const response = await Axios.get("/bddashboard/all-tasks"); 
    return response.data; 
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
};

export const getTaskById = async (_id) => {
  try {
    const response = await Axios.get(`/bddashboard/bd-tasks/${_id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch task");
  }
};

export const updateStatus = async ({ _id, status, user_id, remarks }) => {
  try {
    const response = await Axios.put(`/bddashboard/${_id}/updateStatus`, {
      status: status,
      remarks: remarks,
      user_id: user_id
    });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || "Failed to update status");
  }
};