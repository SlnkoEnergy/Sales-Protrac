"use client";

import { ChevronLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import exportImg from "../../../../public/assets/export.png";
import { exportToCsv } from "@/services/leads/LeadService";
import { toast } from "sonner";

interface SearchBarLeadsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedStage: string;
  onValueChange: (value: string) => void;
  clearFilters: () => void;
  selectedIds: string[];
}

export default function SearchBarLeads({
  searchValue,
  onSearchChange,
  selectedIds
}: SearchBarLeadsProps) {
  const navigate = useNavigate();

 const handleExportToCsv = async (selectedIds: string[]) => {
   if (!selectedIds?.length) {
     toast.error("No tasks selected for export.");
     return;
   }
 
   try {
     await exportToCsv(selectedIds);
     toast.success("CSV exported successfully");
   } catch (error: any) {
     toast.error(error.message || "Failed to export CSV");
   }
 };

  return (
    <div className="bg-[#e5e5e5] w-full px-4 py-3 flex justify-between items-center shadow-sm relative z-30">
      <div className="flex items-center gap-2 w-full max-w-md">
        <div className="flex flex-cols-2 justify-between">
          <Button
            variant="default"
            size="sm"
            onClick={() => (window.location.href = "/")}
            className="cursor-pointer"
          >
            <ChevronLeft />
          </Button>
        </div>
        <div className="relative bg-white w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search Leads"
            className="pl-8"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-800 font-medium relative">
        <span
          className="cursor-pointer text-black hover:underline"
          onClick={() => navigate("/addLead")}
        >
          + Add Lead
        </span>
        <span
          className="cursor-pointer text-black hover:underline"
          onClick={() => navigate("/addgroup")}
        >
          + Add Group
        </span>
        <div>
          <img
            src={exportImg}
            alt="Export"
            className="inline-block w-3 h-3 mr-1"
          />
          <span
            className="cursor-pointer text-black hover:underline"
            onClick={()=> handleExportToCsv(selectedIds)}
          >
            Export Leads
          </span>
        </div>
      </div>
    </div>
  );
}
