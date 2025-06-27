import ViewTask from "@/components/task/ViewTask";

export default function ViewTasks() {
  return (
    <div className="w-full h-full">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> 
        <ViewTask />
      </div>
    </div>
  );
}


