import Header from "@/components/layout/Header";
import { DataTable } from "@/modules/leads/components/leadTable";


export default function Leads() {
  return (
    <div className="w-screen h-screen">
      <Header />
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> {/* adjust if Header height ≠ 4rem */}
        <DataTable />
      </div>
    </div>
  );
}


