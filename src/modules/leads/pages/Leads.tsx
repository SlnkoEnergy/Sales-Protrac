import Loader from "@/components/loader/loader";
import { DataTable } from "@/modules/leads/components/LeadTable";
import { useEffect, useState } from "react";

export default function Leads() {
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;
  return (
    <div className="w-full h-full">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> {/* adjust if Header height ≠ 4rem */}
        <DataTable />
      </div>
    </div>
  );
}
