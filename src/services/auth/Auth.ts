import Axios from "@/utils/axios/Axios";

export const AuthLogin = async ({payload}) => {
  const response = await Axios.post("/logiN-IT", payload);
  return response.data ?? {};
};

export const getUserById = async (userId) => {
  const response = await Axios.get(`/get-single-useR-IT/${userId}`); 
  return response.data ?? {};
};

export const verifyOtp = async ({ email, otp }: { email: string; otp: string }) => {
  const response = await Axios.post("/verifyOtp", {
    email,
    otp,
  });
  return response.data ?? {};
};

export const finalizeBDlogin = async({email, latitude, longitude, fullAddress}: {email: string; latitude: string; longitude: string; fullAddress: string})=> {
  const response = await Axios.post('/session-verify', {
    email,
    latitude,
    longitude,
    fullAddress
  });
  return response.data ?? {};
}

export const logout = async()=> {
  const response = await Axios.put('/logout');
  return response.data ?? {};
}