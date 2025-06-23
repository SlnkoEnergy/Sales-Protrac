import {TaskTable} from "@/modules/task/components/TaskTable"


export default function Tasks() {
  return (
    <div className="w-screen h-screen">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> 
        <TaskTable />
      </div>
    </div>
  );
}


