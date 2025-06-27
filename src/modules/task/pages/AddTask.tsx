import AddTask from "@/components/task/AddTask";


export default function AddTasks() {
  return (
    <div className="w-full h-full">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> 
        <AddTask />
      </div>
    </div>
  );
}


