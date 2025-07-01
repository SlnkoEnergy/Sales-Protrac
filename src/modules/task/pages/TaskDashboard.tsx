import Loader from "@/components/loader/Loader";
import {TaskTable} from "@/modules/task/components/TaskTable"
import { useEffect, useState } from "react";


export default function Tasks() {

   const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }, []);
  
    if (loading) return <Loader />;

  return (
    <div className="w-full h-full">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> 
        <TaskTable />
      </div>
    </div>
  );
}


