// components/FilterDropdown.tsx
import { Check, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface FilterDropdownProps {
  hasActiveFilters?: boolean;
  selectedStage: string | null;
  filters: { label: string; onClick: () => void }[];
  clearFilters: () => void;
}

export function FilterDropdown({
  hasActiveFilters = false,
  selectedStage,
  filters,
  clearFilters,
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="cursor-pointer relative flex items-center space-x-2 text-lg"
        >
          {hasActiveFilters && (
            <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              1
            </span>
          )}

          <SlidersHorizontal className="w-6 h-6" />
          <span>Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {filters.map((filter, idx) => (
          <DropdownMenuItem
            key={idx}
            onClick={filter.onClick}
            className={`cursor-pointer flex justify-between ${
              selectedStage === filter.label.toLowerCase()
                ? "font-semibold"
                : ""
            }`}
          >
            {filter.label}
            {selectedStage === filter.label.toLowerCase() && (
              <Check className="w-4 h-4" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuItem
          className="cursor-pointer text-red-600"
          onClick={clearFilters}
        >
          Clear Filters
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
