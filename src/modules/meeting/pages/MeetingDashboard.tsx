import { useEffect, useState } from "react";
import { MeetingTable } from "../components/MeetingTable";
import Loader from "@/components/loader/loader";


export default function Meetings() {

     const [loading, setLoading] = useState(true);
    
      useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 400);
        return () => clearTimeout(timer);
      }, []);
    
      if (loading) return <Loader />;

  return (
    <div className="w-full h-full">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> 
        <MeetingTable />
      </div>
    </div>
  );
}


