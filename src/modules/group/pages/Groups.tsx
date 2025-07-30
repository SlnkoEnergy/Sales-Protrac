import Loader from "@/components/loader/Loader";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GroupTable } from "../components/GroupTable";
import SearchBarGroups from "../components/SearchBar";

export default function Groups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStages, setSelectedStages] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

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

  return (
    <div className="w-full h-full">
      <SearchBarGroups
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStage={selectedStages}
        onValueChange={handleValueChange}
        clearFilters={handleClickFilter}
        selectedIds={selectedIds}
      />
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto">
        <GroupTable search={searchQuery} onSelectionChange={setSelectedIds} />
      </div>
    </div>
  );
}
