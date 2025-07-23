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
