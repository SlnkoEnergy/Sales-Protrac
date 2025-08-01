import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ParentSearchSyncer = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage(
        {
          type: "UPDATE_SEARCH_PARAMS",
          fullPath: location.pathname + location.search,
        },
        "*"
      );
    }
  }, [location]);

  return null;
};

export default ParentSearchSyncer;
