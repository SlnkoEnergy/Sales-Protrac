import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare, X, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import AddTask from "@/components/task/AddTask";
import { getTaskById } from "@/services/task/Task";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TasksCard({ id, taskData, name, leadId }) {
  const [showModal, setShowModal] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [taskDetails, setTaskDetails] = useState({});

  const toggleTask = async (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));

    if (!taskDetails[taskId]) {
      try {
        const res = await getTaskById(taskId);
        setTaskDetails((prev) => ({
          ...prev,
          [taskId]: res.data,
        }));
      } catch (err) {
        console.error("Failed to fetch task details:", err);
      }
    }
  };

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
                taskData.map((task) => {
                  const details = taskDetails[task._id];
                  const isExpanded = expandedTasks[task._id];
                  return (
                    <div key={task._id} className="space-y-2">
                      <div
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => toggleTask(task._id)}
                      >
                        <CheckSquare className="h-10 w-10 text-muted-foreground" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-md truncate" title={task.title}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {new Date(task.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })} by {task?.user_id?.name}
                          </p>
                        </div>
                        <div className="ml-auto flex gap-1 items-center">
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
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {isExpanded && details && (
                        <div className="ml-12 mt-2 space-y-2 text-sm">
                          <div><strong>Status:</strong> {details.current_status}</div>
                          <div><strong>Type:</strong> {details.type}</div>
                          <div><strong>Priority:</strong> {details.priority}</div>
                          <div><strong>Deadline:</strong> {new Date(details.deadline).toLocaleDateString("en-GB")}</div>
                          <div><strong>Description:</strong> {details.description}</div>
                          <div><strong>Lead:</strong> {details.lead_id?.c_name} ({details.lead_id?.capacity})</div>
                          <div><strong>Owner:</strong> {details.user_id?.name}</div>

                          {/* Status History */}
                          <div>
                            <strong>Status History:</strong>
                            <ScrollArea className="max-h-40 mt-1">
                              <div className="flex flex-col gap-3 mt-1">
                                {details.status_history?.map((entry, idx) => (
                                  <div key={idx} className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src="https://github.com/vercel.png" />
                                      <AvatarFallback>{entry.user_id?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div
                                        className={`font-semibold capitalize ${
                                          entry.status === "pending"
                                            ? "text-red-500"
                                            : entry.status === "in progress"
                                            ? "text-orange-500"
                                            : entry.status === "draft"
                                            ? "text-blue-500"
                                            : entry.status === "completed"
                                            ? "text-green-600"
                                            : ""
                                        }`}
                                      >
                                        {entry.status}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        by {entry.user_id?.name} on {new Date(entry.updatedAt).toLocaleString("en-IN", {
                                          timeZone: "Asia/Kolkata",
                                        })}
                                      </div>
                                      <div className="text-sm">{entry.remarks}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
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
