import { DataTable } from "@/modules/leads/components/LeadTable";

export default function Leads() {
  return (
    <div className="w-full h-full">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> {/* adjust if Header height ≠ 4rem */}
        <DataTable />
      </div>
    </div>
  );
}
