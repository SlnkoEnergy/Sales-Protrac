import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  ChevronLeft,
  Circle,
  ClockFading,
  Mail,
  Phone,
  UserIcon,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTaskById } from "@/services/task/Task";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { updateStatus } from "@/services/task/Task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useAuth } from "@/services/context/AuthContext";
export type Task = {
  _id: string;
  title: string;
  type: "meeting" | "call" | "sms" | "email" | "todo";
  current_status: "completed" | "in progress" | "pending";
  priority: "high" | "medium" | "low";
  description: string;
  deadline: string;
  user_id: {
    _id: string;
    name: string;
  };
  assigned_to: {
    _id: string;
    name: string;
    avatar?: string;
  }[];
  status_history: {
    _id: string;
    status: string;
    user_id: {
      _id: string;
      name: string;
    };
    remarks: string;
    updatedAt: string;
  }[];

  lead_id?: {
    _id: string;
    id: string;
    name: string;
  };
};
export default function ViewTask() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<Task | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRemarks, setSelectedRemarks] = useState("");
  const allStatuses = ["in progress", "completed"];

  const handleStatusChange = (value: string) => {
    if (value === "Change Status") {
      setSelectedStatus("");
    } else {
      setSelectedStatus(value);
    }
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("authToken");
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

  const userId = getUserIdFromToken();

  const handleChangeStatus = async (newStatus: string, newRemarks: string) => {
    if (!data?._id || !userId || !newStatus) return;

    try {
      await updateStatus({
        _id: data._id,
        status: newStatus,
        remarks: newRemarks,
        user_id: userId,
      });

      toast.success("Status updated");
      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await getTaskById(id);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching task:", err.message);
      }
    };

    if (id) fetchTasks();
  }, [id]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <Button
            variant="outline"
            className="cursor-pointer"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
          <CardTitle className="text-xl font-semibold">Task Details</CardTitle>
        </div>
      </div>
      <div className="flex gap-4 p-10">
        <Card className="min-w-[450px]">
          <CardHeader className="flex justify-center flex-col items-center">
            <Avatar className="h-14 w-14">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>KR</AvatarFallback>
            </Avatar>
            <CardTitle className="mb-2">{data?.lead_id?.name}</CardTitle>
            <CardDescription className="flex items-center gap-3">
              <span className="flex items-center gap-2">
                <Mail size={18} /> abc@gmail.com
              </span>
              <span className="flex items-center gap-2">
                <Phone size={18} /> abc@gmail.com
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            <div className="space-y-1 flex flex-col">
              <div className="space-y-2">
                <CardTitle>
                  Status:{" "}
                  <Badge
                    variant="default"
                    className={`capitalize text-shadow-white ${
                      data?.current_status === "completed"
                        ? "bg-green-400"
                        : data?.current_status === "pending"
                        ? "bg-red-400"
                        : data?.current_status === "in progress"
                        ? "bg-orange-400"
                        : "bg-blue-400"
                    }`}
                  >
                    {data?.current_status}
                  </Badge>
                </CardTitle>

                <p>
                  <strong>Task Type:</strong>{" "}
                  <span className="capitalize">{data?.type}</span>
                </p>

                <p>
                  <strong>Priority:</strong>{" "}
                  <span
                    className={`font-semibold capitalize ${
                      data?.priority === "high"
                        ? "text-red-600"
                        : data?.priority === "medium"
                        ? "text-orange-500"
                        : "text-green-600"
                    }`}
                  >
                    {data?.priority}
                  </span>
                </p>
                <p>
                  <strong>Deadline:</strong>{" "}
                  {data?.deadline &&
                    new Date(data?.deadline).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                </p>
                <p>
                  <strong>Description:</strong> {data?.description}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Assignees:</strong>

                  {data?.assigned_to?.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1 cursor-pointer">
                          <UserIcon size={16} />
                          <span>{data.assigned_to[0]?.name}</span>
                          {data.assigned_to.length > 1 && (
                            <span className="text-xs bg-gray-200 rounded-full px-2">
                              +{data.assigned_to.length - 1}
                            </span>
                          )}
                        </span>
                      </TooltipTrigger>

                      <TooltipContent side="bottom" className="p-2">
                        <div className="flex flex-col gap-1">
                          {data.assigned_to.map((user, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <UserIcon size={14} className="text-gray-500" />
                              <span className="text-sm">{user?.name}</span>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 items-start">
            <Separator />
            Owner:{" "}
            <Badge className="ml-1 bg-amber-600">{data?.user_id?.name}</Badge>
          </CardFooter>
        </Card>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList>
            <TabsTrigger className="cursor-pointer" value="notes">
              Task Activities
            </TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            <Card className=" h-full">
              <CardHeader className="flex flex-row w-full items-center justify-between">
                <CardTitle className="text-lg font-medium">
                  Task Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Textarea
                  placeholder="Add Task Note"
                  className="max-w-full h-[100px] resize-none"
                  value={selectedRemarks}
                  onChange={(e) => setSelectedRemarks(e.target.value)}
                />
                <div className="grid items-center grid-cols-2 gap-2 w-100">
                  <Select
                    value={selectedStatus}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue
                        className="capitalize"
                        placeholder={`${data?.current_status}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Change Status">
                        Clear Status Filter
                      </SelectItem>
                      {allStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() =>
                      handleChangeStatus(selectedStatus, selectedRemarks)
                    }
                    className="w-[100px] cursor-pointer"
                    variant="default"
                    disabled={
                      data?.current_status === "completed" ||
                      !data?.assigned_to?.some(
                        (assignee: any) => assignee._id === getUserIdFromToken()
                      )
                    }
                  >
                    Submit
                  </Button>
                </div>
                <ScrollArea className="h-48 w-full overflow-auto">
                  <div className="flex flex-col gap-3 p-2">
                    {data?.status_history?.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {entry.status === "in progress" ? (
                          <ClockFading size={18} />
                        ) : entry.status === "completed" ? (
                          <CheckCircle2 size={18} className="text-green-600" />
                        ) : (
                          <Circle size={18} className="text-gray-400" />
                        )}

                        <div className="flex flex-col">
                          <span
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
                          </span>
                          <span className="text-sm text-gray-500">
                            by {entry.user_id?.name} on{" "}
                            {new Date(entry.updatedAt).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                            })}
                          </span>
                          <span className="text-sm">{entry.remarks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
