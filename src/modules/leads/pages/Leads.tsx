import { DataTable } from "@/modules/leads/components/LeadTable";
import { useEffect, useState } from "react";
import SearchBarLeads from "../components/SearchBar";
import { useSearchParams } from "react-router-dom";

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
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

  const handleTransferComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="w-full h-full">
      <SearchBarLeads
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStage={selectedStages}
        onValueChange={handleValueChange}
        clearFilters={handleClickFilter}
        selectedIds={selectedIds}
        onTransferComplete={handleTransferComplete}
      />

      <div className="h-[calc(100%-4rem)] p-4 overflow-auto">
        <DataTable
          key={refreshKey}
          group_id=""
          search={searchQuery}
          onSelectionChange={setSelectedIds}
        />
      </div>
    </div>
  );
}
