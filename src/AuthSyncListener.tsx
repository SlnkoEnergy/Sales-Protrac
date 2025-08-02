import { useEffect, useState } from "react";
import { useAuth } from "../src/services/context/AuthContext";
import Loader from "./components/loader/Loader";

const AuthSyncListener = ({ children }) => {
  const { setAuthData } = useAuth();
  const [authSynced, setAuthSynced] = useState(false); 

  useEffect(() => {
    // Notify parent that iframe is ready
    window.parent.postMessage({ type: "IFRAME_READY" }, "*");

    const handleMessage = (event) => {
      console.log("[Iframe] Received message:", event.data);
      const { type, token, userDetails } = event.data || {};

      if (type === "AUTH_SYNC" && token && userDetails) {
        const user =
          typeof userDetails === "string" ? JSON.parse(userDetails) : userDetails;
        setAuthData({ token, user }); 
        localStorage.setItem("authToken", token);
        setAuthSynced(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setAuthData]);

  if (!authSynced) {
    return <div><Loader /></div>;
  }

  return <>{children}</>;
};

export default AuthSyncListener;
