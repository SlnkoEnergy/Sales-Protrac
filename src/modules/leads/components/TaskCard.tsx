import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import AddTask from "@/components/task/AddTask";
import { getTaskById, updateStatus } from "@/services/task/Task";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Clock, Loader2, CircleDashed } from "lucide-react";
import { createElement } from "react";
import { useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function TasksCard({ id, taskData, name, leadId }) {
  const [showModal, setShowModal] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [taskDetails, setTaskDetails] = useState({});
  const [tasks, setTasks] = useState(taskData || []);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRemarks, setNewRemarks] = useState("");

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      return payload.userId || null;
    } catch (err) {
      console.error("Token decode error:", err);
      return null;
    }
  };

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const userId = getUserIdFromToken();

  const handleChangeStatus = async () => {
    if (!editingTaskId || !userId || !newStatus) return;

    const now = new Date();

    const newStatusEntry = {
      status: newStatus,
      remarks: newRemarks,
      updatedAt: now.toISOString(),
      user_id: {
        _id: userId,
        name: getCurrentUser().name || "Unknown",
      },
    };

    try {
      await updateStatus({
        _id: editingTaskId,
        status: newStatus,
        remarks: newRemarks,
        user_id: userId,
      });

      // Update tasks list
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === editingTaskId
            ? {
                ...task,
                current_status: newStatus,
                remarks: [
                  ...(task.remarks || []),
                  { text: newRemarks, date: now, user_id: userId },
                ],
              }
            : task
        )
      );

      // Update taskDetails[task._id]
      setTaskDetails((prev) => ({
        ...prev,
        [editingTaskId]: {
          ...prev[editingTaskId],
          status_history: [
            ...(prev[editingTaskId]?.status_history || []),
            newStatusEntry,
          ],
        },
      }));

      toast.success("Status updated");
      setEditModalOpen(false);
      toggleTask(editingTaskId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

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

  const handleNewTask = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  useEffect(() => {
    if (taskData && taskData.length > 0) {
      setTasks(taskData);
    }
  }, [taskData]);

  const location = useLocation().pathname;

  const isFromModal = location === "/leadProfile";

  const getTruncatedDescription = (desc: string) => {
    if (!desc) return "";
    const words = desc.split(" ");
    if (words.length > 1) {
      return words.slice(0, 15).join(" ") + (words.length > 15 ? "..." : "");
    } else {
      return desc.length > 15 ? desc.slice(0, 15) + "..." : desc;
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
              {tasks?.length > 0 ? (
                [...tasks].reverse().map((task) => {
                  const details = taskDetails[task._id];
                  const isExpanded = expandedTasks[task._id];

                  // Icon component based on status
                  const statusIcon =
                    task.current_status === "completed"
                      ? CheckCircle
                      : task.current_status === "in progress"
                      ? Loader2
                      : task.current_status === "pending"
                      ? Clock
                      : CircleDashed;

                  return (
                    <div key={task._id} className="space-y-2">
                      <div className="flex items-start gap-3">
                        {createElement(statusIcon, {
                          className: "h-4 w-4 mt-1 text-muted-foreground",
                        })}

                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <p className="text-sm truncate" title={task.title}>
                              {task.title}
                            </p>
                            <button
                              className="cursor-pointer"
                              onClick={() => toggleTask(task._id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </div>

                          <p className="text-xs text-muted-foreground truncate">
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
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`p-1 capitalize text-xs ${
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
                          <div>
                            <div
                              onClick={() => {
                                setEditingTaskId(task._id);
                                setNewStatus(details?.current_status || "");
                                setNewRemarks("");
                                setEditModalOpen(true);
                              }}
                            >
                          {task?.current_status !== "completed" &&
  task?.assigned_to?.some((assignee: any) => assignee._id === getUserIdFromToken()) && (
    <Pencil className="cursor-pointer" size={18} />
)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && details && (
                        <div className="ml-12 mt-2 space-y-2 text-sm max-h-[200px] overflow-auto">
                          {!isFromModal && (
                            <div>
                              <strong>Status:</strong> {details.current_status}
                            </div>
                          )}

                          <div className="flex gap-1">
                            <strong>Type:</strong>{" "}
                            <p className="capitalize">{details.type}</p>
                          </div>

                          <div className="flex gap-1">
                            <strong>Priority:</strong>
                            <p className="capitalize"> {details.priority}</p>
                          </div>

                          <div className="flex gap-1">
                            <strong>Deadline:</strong>{" "}
                            {new Date(details.deadline).toLocaleDateString(
                              "en-GB"
                            )}
                          </div>

                          {/* Tooltip for Description */}
                          <TooltipProvider>
                            <div className="flex gap-1 items-start">
                              <strong>Description:</strong>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-pointer underline text-muted-foreground max-w-xs break-all">
                                    {getTruncatedDescription(
                                      details.description
                                    )}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  align="start"
                                  className="w-72 max-h-60 overflow-y-auto whitespace-pre-wrap break-words text-left"
                                >
                                  {details.description}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>

                          {!isFromModal && (
                            <div className="flex gap-1">
                              <strong>Lead:</strong>
                              <p className="capitalize">
                                {details.lead_id?.name}
                              </p>
                            </div>
                          )}

                          {!isFromModal && (
                            <div className="flex gap-1">
                              <strong>Created By:</strong>{" "}
                              <p className="capitalize">
                                {details.user_id?.name}
                              </p>
                            </div>
                          )}

                          <div>
                            <strong>Status History:</strong>
                            <ScrollArea className="max-h-40 mt-1">
                              <div className="flex flex-col gap-3 mt-1">
                                {details.status_history?.map((entry, idx) => (
                                  <div key={idx} className="flex items-start">
                                    {!isFromModal && (
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src="https://github.com/vercel.png" />
                                        <AvatarFallback>
                                          {entry.user_id?.name?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    <div>
                                      <div
                                        className={`font-semibold capitalize ${
                                          entry.status === "pending"
                                            ? "text-red-500"
                                            : entry.status === "in progress"
                                            ? "text-orange-500"
                                            : entry.status === "completed"
                                            ? "text-green-600"
                                            : ""
                                        }`}
                                      >
                                        {entry.status}
                                      </div>

                                      <div className="text-sm text-gray-500">
                                        by {entry.user_id?.name} on{" "}
                                        {new Date(
                                          entry.updatedAt
                                        ).toLocaleString("en-IN", {
                                          timeZone: "Asia/Kolkata",
                                        })}
                                      </div>
                                      <div className="text-sm">
                                        {entry.remarks}
                                      </div>
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
                <p className="text-md text-muted-foreground">
                  No Available Tasks
                </p>
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
              onTaskCreated={handleNewTask}
            />
          </div>
        </div>
      )}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative shadow-xl space-y-4">
            <Button
              className="absolute top-4 right-4 z-50"
              variant="ghost"
              size="icon"
              onClick={() => setEditModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            <h2 className="text-lg font-semibold">Update Task Status</h2>

            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Enter remarks..."
              value={newRemarks}
              onChange={(e) => setNewRemarks(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button className="cursor-pointer" onClick={handleChangeStatus}>
                Save
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
