import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SearchParamSyncer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event) => {
      const { type, path, search } = event.data || {};
      if (type === "PARENT_PUSH_SEARCH_PARAMS") {
        const fullPath = `${path || "/"}${search || ""}`;
        const currentPath = `${location.pathname}${location.search}`;

        if (fullPath !== currentPath) {
          navigate(fullPath);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [location, navigate]);

  return null;
};

export default SearchParamSyncer;
