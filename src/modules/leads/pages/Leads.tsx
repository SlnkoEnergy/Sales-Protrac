import Loader from "@/components/loader/Loader";
import { DataTable } from "@/modules/leads/components/LeadTable";
import { useEffect, useState } from "react";
import SearchBarLeads from "../components/SearchBar";
import { useSearchParams } from "react-router-dom";

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStages, setSelectedStages] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStage, setSelectedStage] = useState<string | null>(
    searchParams.get("stage") || ""
  );
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleClickFilter = () => {
    setSelectedStages("");
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.delete("stage");
      return updated;
    });
  };

  const handleValueChange = (value: string) => {
    setSelectedStages(value);
    setSearchParams({ stage: value });
  };

  useEffect(() => {
  const stageFromURL = searchParams.get("stage") || "";
  setSelectedStages(stageFromURL);
}, [searchParams]);

  if (loading) return <Loader />;

  return (
    <div className="w-full h-full">
     <SearchBarLeads
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  selectedStage={selectedStages}
  onValueChange={handleValueChange}
  clearFilters={handleClickFilter}
/>

      <div className="h-[calc(100%-4rem)] p-4 overflow-auto">
        <DataTable search={searchQuery} stage={selectedStages} />
      </div>
    </div>
  );
}
