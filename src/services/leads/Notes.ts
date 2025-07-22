import Axios from "@/utils/axios/Axios";

export const createNotes = async (noteData) => {
  try {
    const response = await Axios.post("/bddashboard/bd-notes", noteData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create note");
  }
};

export const getNotesByLeadId = async (params = {}) => {
  let url = "/bddashboard/bd-notes";

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

export const editNotes = async (_id, updatedData) => {
  try {
    const response = await Axios.put(
      `/bddashboard/bd-notes/${_id}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update note");
  }
};

export const deleteNotes = async (_id) => {
  try {
    const response = await Axios.delete(`/bddashboard/bd-notes/${_id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete note");
  }
};
