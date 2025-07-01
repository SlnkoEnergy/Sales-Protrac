import Loader from "@/components/loader/Loader";
import { DataTable } from "@/modules/leads/components/LeadTable";
import { useEffect, useState } from "react";
import SearchBarLeads from "../components/SearchBar";

export default function Leads() {
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;
  return (
    <div className="w-full h-full">
      <SearchBarLeads  />
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto">
        
        <DataTable />
      </div>
    </div>
  );
}
