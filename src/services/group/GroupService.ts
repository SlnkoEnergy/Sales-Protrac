import Axios from "@/utils/axios/Axios";

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
