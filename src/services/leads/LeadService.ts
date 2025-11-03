import Axios from "@/utils/axios/Axios";

export const getLeads = async (
  params: Record<
    string,
    string | number | boolean | Array<string | number | boolean>
  > = {}
) => {
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

export const getLeadbyId = async (
  params: Record<
    string,
    string | number | boolean | Array<string | number | boolean>
  > = {}
) => {
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
    const message =
      error.response?.data?.error || error.message || "Something went wrong";
    throw new Error(message);
  }
};

export const editBdLead = async (
  params: Record<
    string,
    string | number | boolean | Array<string | number | boolean>
  > = {},
  body: Record<string, any> = {}
) => {
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

export const transferLead = async (leadIds: string[], assigned: string) => {
  const url = `/bddashboard/assign-to`;
  const response = await Axios.put(url, { leadIds, assigned });
  return response.data;
};

export const exportToCsv = async (selectedIds: string[]) => {
  console.log(selectedIds);
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
  name: string,
  stage: string,
  remarks: string,
  expected_closing_date: string,
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
  remarks: string,
  pendingDate: string
) => {
  try {
    const response = await Axios.put(
      `/bddashboard/${leadId}/updateLeadStatus`,
      {
        name: name,
        stage: stage,
        remarks: remarks,
        expected_closing_date: pendingDate,
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update lead status"
    );
  }
};

export const updateLeadStatusBulk = async (
  ids: string[],
  name: string,
  stage: string,
  remarks: string
) => {
  try {
    const response = await Axios.put(`/bddashboard/updateLeadStatusBulk`, {
      ids,
      name,
      stage,
      remarks,
    });
    return response.data;
  } catch (error: any) {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Failed to bulk update lead statuses";
    throw new Error(msg);
  }
};

export const updateLeadPriorityBulk = async (
  leadIds: string[],
  priority: string
) => {
  try {
    const response = await Axios.put(`/bddashboard/updatePriority`, {
      leadIds,
      priority,
    });
    return response.data;
  } catch (error: any) {
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Failed to bulk update priority";
    throw new Error(msg);
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
  is_locked: string = "locked",
  documents: Array<
    | File
    | { file: File; name?: string }
    | { url: string; baseName?: string; ext?: string }
  > = []
) => {
  const fd = new FormData();

  const urlDocs: { url: string; baseName?: string; ext?: string }[] = [];

  for (const doc of documents) {
    if (doc instanceof File) {
      fd.append("files", doc, doc.name);
    } else if ("file" in doc) {
      fd.append("files", doc.file, doc.name || doc.file.name);
    } else if ("url" in doc) {
      urlDocs.push({
        url: doc.url,
        baseName: doc.baseName,
        ext: doc.ext,
      });
    }
  }

  // payload JSON
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
    documents: urlDocs,
  };

  fd.append("data", JSON.stringify(payload));

  const response = await Axios.post("/handover/create-hand-over-sheet", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const getHandoverByLeadId = async (
  params: Record<
    string,
    string | number | boolean | Array<string | number | boolean>
  > = {}
) => {
  let url = "/handover/get-handoversheet";

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

export const editHandover = async (
  _id: string,
  updatedData: any,
  isMultipart = false
) => {
  try {
    const url = `/handover/edit-hand-over-sheet/${_id}`;
    const config = isMultipart
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined;

    const response = await Axios.put(url, updatedData, config);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update handover"
    );
  }
};

export const getAllHandover = async (
  params: Record<
    string,
    string | number | boolean | Array<string | number | boolean>
  > = {}
) => {
  let url = "/handover/get-all-handover-sheet";

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
      "/handover/handover-export",
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

export const states = async () => {
  try {
    const { data } = await Axios.get("/bddashboard/states");
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch states");
  }
};

export const getLeadsCount = async (
  params: Record<
    string,
    string | number | boolean | Array<string | number | boolean>
  > = {}
) => {
  let url = "/bddashboard/lead-count";

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

export const getDocuments = async (
  params: Record<
    string,
    string | number | boolean | Array<string | number | boolean>
  > = {}
) => {
  let url = `/bddashboard/lead-documents`;

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
