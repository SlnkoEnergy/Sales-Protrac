import Axios from "@/utils/axios/Axios";

export const getLeads = async (params = {}) => {
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

export const getLeadbyId = async (params = {}) => {
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
};

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
  const url = `/bddashboard/lead/${_id}?lead_model=${encodeURIComponent(
    lead_model
  )}`;
  const response = await Axios.delete(url);
  return response.data;
};

export const transferLead = async (
  _id: string,
  lead_model: string,
  assigned_to
) => {
  const url = `/bddashboard/assign-to/${_id}?lead_model=${encodeURIComponent(
    lead_model
  )}`;
  const response = await Axios.put(url, assigned_to);
  return response.data;
};

export const exportToCsv = async () => {
  try {
    const response = await Axios.get(`/bddashboard/export-lead`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to export CSV");
  }
};

export const uploadDocuments = async (
  lead_id: string,
  name: "loi" | "loa" | "ppa",
  stage: string,
  remarks: string,
  expected_closing_date: Date,
  file: File,
  token?: string
) => {
  try {
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        lead_id,
        name,
        stage,
        remarks: remarks || "",
        expected_closing_date,
      })
    );

    formData.append("file_0", file);

    const response = await Axios.put(`/bddashboard/uploadDocuments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to upload document"
    );
  }
};

export const updateLeadStatus = async (
  leadId: string,
  name: string,
  stage: string,
  remarks: string
) => {
  try {
    const response = await Axios.put(
      `/bddashboard/${leadId}/updateLeadStatus`,
      {
        name: name,
        stage: stage,
        remarks: remarks,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update lead status"
    );
  }
};

export const updateExpectedClosingDate = async (
  leadId: string,
  date: string
) => {
  try {
    const response = await Axios.put(
      `/bddashboard/${leadId}/updateClosingDate`,
      {
        date: date,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update lead status"
    );
  }
};
