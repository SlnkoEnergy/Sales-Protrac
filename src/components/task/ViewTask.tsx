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
import { CalendarIcon, CameraIcon, ChevronLeft, Clock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTaskById } from "@/services/task/task";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { updateStatus } from "@/services/task/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
export type Task = {
  _id: string;
  title: string;
  type: "meeting" | "call" | "sms" | "email" | "todo";
  current_status: "draft" | "completed" | "in progress" | "pending";
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
  status_history:{
    _id: string,
    status:string,
    user_id: string,
    remarks:string
  }[];
  lead_id?: {
    _id: string;
    id: string;
    c_name: string;
  };
};
export default function ViewTask() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<Task | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRemarks, setSelectedRemarks] = useState("");
  const allStatuses = ["draft", "pending", "in progress", "completed"];
  const currentStatus = data?.current_status;
  const otherStatuses = allStatuses.filter(
    (status) => status !== currentStatus
  );

  const handleStatusChange = (value: string) => {
    if (value === "Change Status") {
      setSelectedStatus("");
    } else {
      setSelectedStatus(value);
    }
  };

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

  const userId = getUserIdFromToken();

  const handleChangeStatus = async (newStatus: string, newRemarks: string) => {
    if (!data?._id || !userId || !newStatus) return;

    try {
      const res = await updateStatus({
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
    <div>
      <div>
        <div className="p-6">
          <Button
            variant="default"
            className="mb-2 cursor-pointer"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
        </div>
        <div className="p-6 max-w-4xl mx-auto">
          <Tabs defaultValue="taskdetails" className="mb-4">
            <TabsList className="grid grid-cols-2 gap-1">
              <TabsTrigger className="cursor-pointer" value="taskdetails">
                Task Details
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="taskhistory">
                Task History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="taskdetails">
              <Card>
                <CardHeader className="flex justify-between items-center">
                  <CardTitle className="text-xl">{data?.title}</CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-shadow-white capitalize"
                  >
                    By {data?.type}
                  </Badge>
                  <Badge
                    variant="outline"
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
                </CardHeader>
                <CardDescription className="grid grid-cols-2 sm:grid-cols-2 px-6 text-md gap-y-2 gap-x-4 mb-4">
                  <div>
                    <strong>Lead Id:</strong> {data?.lead_id?.id}
                  </div>
                  <div>
                    <strong>Lead Name:</strong> {data?.lead_id?.c_name}
                  </div>

                  <div>
                    <strong>Deadline:</strong>{" "}
                    {data?.deadline &&
                      new Date(data?.deadline).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                  </div>

                  <div className="flex items-center gap-2 mb-2 capitalize">
                    <strong>Priority:</strong>
                    <span
                      className={`font-semibold ${
                        data?.priority === "high"
                          ? "text-red-600"
                          : data?.priority === "medium"
                          ? "text-orange-500"
                          : "text-green-600"
                      }`}
                    >
                      {data?.priority}
                    </span>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <strong>Description:</strong> {data?.description}
                  </div>

                  <div className="flex  gap-2">
                    <strong>Assignees:</strong>
                    <span>
                      {data?.assigned_to?.map((user) => user.name).join(", ")}
                    </span>
                  </div>
                </CardDescription>
                <Separator />
                <CardFooter>
                  <strong>Lead Owner:</strong>{" "}
                  <Badge className="ml-1 bg-amber-600">
                    {data?.user_id?.name}
                  </Badge>
                </CardFooter>
              </Card>

              {data?.current_status !== "completed" && (
                <div>
                  <Textarea
                    placeholder="Add Note"
                    className="max-w-full mt-4 mb-4 h-[100px] resize-none"
                    value={selectedRemarks}
                    onChange={(e) => setSelectedRemarks(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={selectedStatus}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Change Status">
                          Clear Status Filter
                        </SelectItem>
                        {otherStatuses.map((status) => (
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
                      className="w-[100px]"
                      variant="outline"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="taskhistory">
              <div className=" mx-auto py-10 px-4 overflow-y-auto max-h-150">
                <div className="border-l-2 border-gray-300 pl-6 relative">
                  {data?.status_history.map((event, idx) => (
                    <div key={idx} className="mb-10 relative">
                      <p className="text-sm text-gray-500 mb-1">{event.status}</p>
                      <Card className="shadow-md">
                        <CardHeader>
                          <CardTitle>{event.user_id}</CardTitle>
                        </CardHeader>
                        <CardContent className="py-3">
                          {event.status && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" /> {event.status}
                            </div>
                          )}
                          {event.status && (
                            <div className="text-sm text-gray-600 mt-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src="https://github.com/shadcn.png" />
                                  <AvatarFallback>
                                    {event.status}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{event.status}</span>
                                {event.status && (
                                  <span className="text-xs text-gray-500">
                                    @ {event.status}
                                  </span>
                                )}
                                {event.remarks && (
                                  <span className="text-xs text-gray-500">
                                    · {event.remarks}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                    
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
