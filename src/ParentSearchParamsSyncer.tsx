import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SearchParamSyncer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener("message", (event) => {
      const { type, search } = event.data || {};
      if (type === "PARENT_PUSH_SEARCH_PARAMS" && search !== location.search) {
        navigate(`${location.pathname}${search}`);
      }
    });
  }, [location]);

  return null;
};

export default SearchParamSyncer;
