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
    const response = await Axios.post(`/bddashboard/lead`, data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || "Something went wrong";
    throw new Error(message);
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

export const deleteLead = async (_id: string) => {
  const url = `/bddashboard/lead/${_id}`;
  const response = await Axios.delete(url);
  return response.data;
};

export const transferLead = async (_id: string, assigned_to: string) => {
  const url = `/bddashboard/assign-to/${_id}`;
  const response = await Axios.put(url, { assigned_to });
  return response.data;
};


export const exportToCsv = async (selectedIds: string[]) => {
  try {
    const response = await Axios.post(
      "/bddashboard/export-lead",
      { Ids: selectedIds },
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
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

    // Append JSON metadata
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

    // Make PUT request
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

export const createHandover = async (
  id: string,
  customer_details: any,
  order_details: any,
  project_detail: any,
  commercial_details: any,
  other_details: any,
  invoice_detail: any,
  submitted_by: string,
  status_of_handoversheet: string = "draft",
  is_locked: string = "locked"
) => {
  try {
    const payload = {
      id,
      customer_details,
      order_details,
      project_detail,
      commercial_details,
      other_details,
      invoice_detail,
      submitted_by,
      status_of_handoversheet,
      is_locked,
    };

    const response = await Axios.post("/create-hand-over-sheet", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create handover sheet");
  }
};

export const getHandoverByLeadId = async (params = {}) => {
  let url = "/get-handoversheet";

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

export const editHandover = async(_id, updatedData) => {
  try {
    const response = await Axios.put(`/edit-hand-over-sheet/${_id}`, updatedData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update handover");
  }
}


export const getAllHandover = async (params = {}) => {
  let url = "/get-all-handover-sheet";

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

export const exportToCsvHandover = async (selectedIds: string[]) => {
  try {
    const response = await Axios.post(
      "/handover-export",
      { Ids: selectedIds },
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "handover.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to export CSV");
  }
};