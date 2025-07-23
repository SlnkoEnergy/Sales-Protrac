import Axios from "@/utils/axios/Axios";


// Create a new group
export const createGroup = async ({ data }: { data: any }) => {
  try {
    const response = await Axios.post("/bddashboard/group", { data });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error || error.message || "Something went wrong";
    throw new Error(message);
  }
};
export const getGroups = async (params = {}) => {
  try {
    const response = await Axios.get("/bddashboard/group", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, data: [], total: 0 };
  }
};

export const getGroupById = async (id) => {
  try {
    const response = await Axios.get(`/bddashboard/group/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, data: [], total: 0 };
  }
};

export const updateGroup = async ({ id, data }: { id: string; data: any }) => {
  try {
    const response = await Axios.put(`/bddashboard/group/${id}`, { data });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error || error.message || "Something went wrong";
    throw new Error(message);
  }
};