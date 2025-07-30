import { HandoverTable } from "../components/Handover";
import SearchBarHandover from "../components/searchBar";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Handover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleClickFilter = () => {
    setSelectedStatus("");
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.delete("stage");
      return updated;
    });
  };

  const handleValueChange = (value: string) => {
    setSelectedStatus(value);
    setSearchParams({ stage: value });
  };

  useEffect(() => {
    const statusFromUrl = searchParams.get("status") || "";
    setSelectedStatus(statusFromUrl);
  }, [searchParams]);

  return (
    <div className="w-full h-full">
      <SearchBarHandover
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onValueChange={handleValueChange}
        clearFilters={handleClickFilter}
        selectedIds={selectedIds}
      />
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto">
        <HandoverTable
          search={searchQuery}
          onSelectionChange={setSelectedIds}
        />
      </div>
    </div>
  );
}
