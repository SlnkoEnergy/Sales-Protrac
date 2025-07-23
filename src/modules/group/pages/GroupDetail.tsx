"use client";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Mail, MapPin, Phone, RotateCcw } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteLead } from "@/services/leads/LeadService";
import { Badge } from "@/components/ui/badge";
import NotesCard from "../../leads/components/NotesCard";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getGroupById, updateGroupStatus } from "@/services/group/GroupService";
import LeadsCard from "./LeadsCard";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export type Group = {
  _id: string;
  group_code: string;
  group_name: string;
  company_name: string;
  contact_details: {
    email: string;
    mobile: string[];
  };
  address: {
    district: string;
    village: string;
    state: string;
  };
  createdAt: Date;
  project_details: {
    capacity: string;
    scheme: string;
  };
  createdBy: {
    _id: string;
    name: string;
  };
  current_status: {
    status: string;
  };
  source: {
    from: string;
    sub_source: string;
  };
  comments: {
    type: string;
  };
};

export default function GroupDetail() {
  const navigate = useNavigate();
  const [data, setData] = React.useState<Group | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const group_id = searchParams.get("group_id");

  React.useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await getGroupById(id);
        setData(res.data);
      } catch (error) {
        console.error("Error fetching Tasks:", error);
      }
    };
    fetchGroup();
  }, [id]);

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
  const nextStatus =
    data?.current_status?.status === "open" ? "closed" : "open";

  const fullComment = data?.comments || "";
  const charLimit = 15;
  const isTruncated = fullComment?.length > charLimit;
  const displayedComment = isTruncated
    ? fullComment?.slice(0, charLimit) + "..."
    : fullComment;

  const handleChange = async (nextStatus) => {
    try {
      await updateGroupStatus({
        id: data._id,
        status: nextStatus,
        remarks: `Status changed to ${nextStatus}`,
      });

      // ✅ Update local status inside `data`
      setData((prev) =>
        prev
          ? {
              ...prev,
              current_status: {
                ...prev.current_status,
                status: nextStatus,
                remarks: `Status changed to ${nextStatus}`,
                // optionally update `user_id` if needed
              },
            }
          : null
      );

      toast.success(`Status updated to ${nextStatus}`);
    } catch (error) {
      console.error("Status update error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update status";

      toast.error(message);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>
          <p className="text-2xl font-semibold text-[#214b7b]">Group Detail</p>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        <Card className="min-w-[calc(24vw)] max-h-full overflow-hidden">
          <CardHeader className="flex justify-center flex-col items-center">
            <Avatar className="h-14 w-14">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>KR</AvatarFallback>
            </Avatar>
            <CardTitle className="mb-2 capitalize">
              {data?.group_name}
            </CardTitle>
            <CardDescription className="flex items-center gap-3 lg:flex-col">
              <span className="flex items-center gap-2">
                <Mail size={18} /> {data?.contact_details?.email || "NA"}
              </span>
              <span className="flex items-center gap-2">
                <Phone size={18} />{" "}
                {data?.contact_details?.mobile?.join(", ") || "N/A"}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <CardTitle className="flex gap-2">
              Status:
              <ContextMenu>
                <ContextMenuTrigger>
                  <Badge
                    variant="default"
                    className={`capitalize cursor-pointer ${
                      data?.current_status?.status === "open"
                        ? "bg-green-500 hover:bg-green-600"
                        : data?.current_status?.status === "closed"
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-gray-400"
                    }`}
                  >
                    {data?.current_status?.status ?? "N/A"}
                  </Badge>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-40">
                  <ContextMenuItem
                    onClick={() => handleChange(nextStatus)}
                    className="flex items-center gap-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    Set to <span className="capitalize">{nextStatus}</span>
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </CardTitle>
            <CardDescription className="text-black capitalize flex gap-1 items-center">
              <MapPin size={16} />{" "}
              <span>
                {data?.address?.village}
                {data?.address?.village && data?.address?.district ? ", " : ""}
                {data?.address?.district}
                {data?.address?.district && data?.address?.state ? ", " : ""}
                {data?.address?.state}
              </span>
            </CardDescription>
            <p>
              <strong>Source:</strong> {data?.source?.from}
              {data?.source?.from && data?.source?.sub_source !== " "
                ? " - "
                : ""}{" "}
              {data?.source?.sub_source}
            </p>
            <p>
              <strong>Total Capacity:</strong> {data?.project_details?.capacity}
            </p>
             <p>
              <strong>Left Capacity:</strong> {data?.project_details?.capacity}
            </p>
            <p>
              <strong>Scheme:</strong> {data?.project_details?.scheme}
            </p>
            <p>
              <strong>Company:</strong> {data?.company_name}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-sm text-gray-700 cursor-default max-w-[300px]">
                    <strong>Description:</strong> {displayedComment}
                  </p>
                </TooltipTrigger>
                {isTruncated && (
                  <TooltipContent side="bottom" align="start">
                    <div className="whitespace-pre-wrap text-sm max-w-[300px]">
                      {fullComment.split("\n").map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 items-start">
            <Separator />
            Owner: {data?.createdBy?.name}
          </CardFooter>
        </Card>

        <div className="min-w-[calc(72vw)] overflow-y-auto">
          <LeadsCard group_id={group_id} />
        </div>
      </div>
    </div>
  );
}
