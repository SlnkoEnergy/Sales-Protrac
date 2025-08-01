import { useEffect } from "react";
import { useAuth } from "../src/services/context/AuthContext";

const AuthSyncListener = () => {
  const { setAuthData } = useAuth();

  useEffect(() => {
  // Notify parent that iframe is ready to receive auth data
  window.parent.postMessage({ type: "IFRAME_READY" }, "*");

  const handleMessage = (event: MessageEvent) => {
    const { type, token, userDetails } = event.data || {};
    if (type === "AUTH_SYNC" && token && userDetails) {
      const user =
        typeof userDetails === "string" ? JSON.parse(userDetails) : userDetails;
      setAuthData({ token, user });
      console.log({token, user});
    }
  };
   
  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, [setAuthData]);
  return null;
};

export default AuthSyncListener;
