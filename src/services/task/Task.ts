import Axios from "@/utils/axios/Axios";

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

export const getAllTask = async (params = {}) => {
  try {
    const response = await Axios.get("/bddashboard/all-tasks", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, data: [], total: 0 };
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

export const  getTaskByLeadId = async (params = {}) => {
  let url = "/bddashboard/bd-tasks";

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

export const getNotification = async() => {
  try {
    const response = await Axios.get("/bddashboard/notification"); 
    return response.data; 
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

export const toggleViewTask = async (_id: string) => {
  try {
    const url = `/bddashboard/notification/${_id}`;
  const response = await Axios.put(url);
  return response.data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
};



export const exportToCsvTask = async (selectedIds: string[]) => {
  try {
    const response = await Axios.post(
      "/bddashboard/task-export",
      { Ids: selectedIds },
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tasks.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to export CSV");
  }
};