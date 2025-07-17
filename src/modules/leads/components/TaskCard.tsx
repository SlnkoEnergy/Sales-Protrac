"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AddTask from "@/components/task/AddTask";

export default function TasksCard({id, taskData, name, leadId }) {
  const navigate = useNavigate();
  const [openTaskModal, setOpenTaskModal] = React.useState(false);
const [taskProps, setTaskProps] = React.useState({ id: "", name: "", leadId: "" });
  return (
    <>
    <Card>
      <CardHeader className="flex flex-row w-full items-center justify-between">
        <CardTitle className="text-lg font-medium">Tasks</CardTitle>
      <Button
  variant="outline"
  size="sm"
  className="cursor-pointer"
  onClick={() => {
    setTaskProps({ id, name, leadId });
    setOpenTaskModal(true);
  }}
>
  + Add Task
</Button>

      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <ScrollArea className="h-80">
          <div className="flex flex-col gap-3 mt-2">
            {taskData?.length > 0 ? (
              taskData.map((task, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckSquare className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <p
                      className="text-md cursor-pointer"
                      onClick={() => navigate(`/viewtask?id=${task._id}`)}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(task.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}{" "}
                      by {task?.user_id?.name}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <Badge
                      className={`p-1 capitalize ${
                        task.current_status === "completed"
                          ? "bg-green-400"
                          : task.current_status === "pending"
                          ? "bg-red-400"
                          : task.current_status === "in progress"
                          ? "bg-orange-400"
                          : "bg-blue-400"
                      }`}
                    >
                      {task.current_status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-md text-muted-foreground">
                No Available Tasks
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
    </Card>
<Dialog open={openTaskModal} onOpenChange={setOpenTaskModal}>
  <DialogContent className="p-4">
    <AddTask
      id={taskProps.id}
      name={taskProps.name}
      leadId={taskProps.leadId}
      onClose={() => setOpenTaskModal(false)}
    />
  </DialogContent>
</Dialog>

    </>
  );
}
