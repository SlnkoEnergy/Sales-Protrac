import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import AddTask from "@/components/task/AddTask";

export default function TasksCard({ id, taskData, name, leadId }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row w-full items-center justify-between">
          <CardTitle className="text-lg font-medium">Tasks</CardTitle>
          <Button
            variant="outline"
            className="cursor-pointer"
            size="sm"
            onClick={() => setShowModal(true)}
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
                      <p className="text-md cursor-pointer">
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
                <p className="text-md text-muted-foreground">No Available Tasks</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[95vh] overflow-y-auto relative shadow-lg">
            <Button
              className="absolute top-4 right-4 z-50"
              variant="ghost"
              size="icon"
              onClick={() => setShowModal(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <AddTask
              idModal={id}
              nameModal={name}
              leadIdModal={leadId}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
