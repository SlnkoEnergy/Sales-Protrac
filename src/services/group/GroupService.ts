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

export const getAllGroupName = async () => {
  try {
    const response = await Axios.get("/bddashboard/group-drop");
    return response;
  } catch (error) {
    console.log(error);
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
export const updateGroupStatus = async ({ id, status, remarks }) => {
  try {
    const response = await Axios.put(`/bddashboard/${id}/updateGroupStatus`, {
      status,
      remarks,
    });
    return response.data;
  } catch (error) {
    const errMsg = error?.response?.data?.message || "Failed to update status";
    error.message = errMsg;
    throw error;
  }
};
export const exportToCsvGroup = async (Ids) => {
  try {
    const response = await Axios.post(
      "/bddashboard/group-export",
      { Ids },
      { responseType: "blob" }
    );
    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "group.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to exprot CSV");
  }
};
export const attachToGroup = async (groupId: string, leadIds: string[]) => {
  try {
    const response = await Axios.put("/bddashboard/attach-group", {
      groupId,
      leadIds,
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    throw new Error(message);
  }
};
