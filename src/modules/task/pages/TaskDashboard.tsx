import Loader from "@/components/loader/Loader";
import { TaskTable } from "@/modules/task/components/TaskTable";
import { useEffect, useState } from "react";
import SearchBarTasks from "../components/SearchBar";
import { useSearchParams } from "react-router-dom";

export default function Tasks() {
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
      <SearchBarTasks
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onValueChange={handleValueChange}
        clearFilters={handleClickFilter}
        selectedIds={selectedIds}
      />
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto">
        <TaskTable search={searchQuery} onSelectionChange={setSelectedIds}/>
      </div>
    </div>
  );
}
