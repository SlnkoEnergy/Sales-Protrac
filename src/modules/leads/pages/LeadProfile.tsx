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
import { ChevronLeft, Lock, Mail, MapPin, Phone } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getLeadbyId, deleteLead } from "@/services/leads/LeadService";
import { Badge } from "@/components/ui/badge";
import NotesCard from "../components/NotesCard";
import TasksCard from "../components/TaskCard";
import { getTaskByLeadId } from "@/services/task/Task";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LeadDocuments from "../components/LeadDocument";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HandoverForm from "../components/Handover";
import Leads from "./Leads";

export type Lead = {
  _id: string;
  id: string;
  current_status: {
    name: string;
    stage: string;
    remarks: string;
  };
  comments: string;
  name: string;
  contact_details: {
    mobile: string[];
    email: string;
  };
  address: {
    district: string;
    village: string;
    state: string;
  };
  company_name: string;
  createdAt: Date;
  current_assigned: {
    user_id: {
      name: string;
    };
    status: {
      string;
    };
  };
  project_details: {
    capacity: string;
    land_type: string;
    scheme: string;
    tarrif: string;
    available_land: {
      unit: string;
      value: string;
    };
    distance_from_substation: {
      unit: string;
      value: string;
    };
  };
  assigned_to: {
    id: string;
    name: string;
  };
  source: {
    from: string;
    sub_source: string;
  };
};

export default function LeadProfile() {
  const navigate = useNavigate();
  const [data, setData] = React.useState<Lead | null>(null);
  const [taskData, setTaskData] = React.useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "info";
  const [activeTab, setActiveTab] = React.useState(tabParam);
  const [isLocked, setIsLocked] = React.useState(false);
  const [update, setUpdate] = React.useState(false);

  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const formRef = React.useRef<{
    submit: () => void;
    resetForm: () => void;
    getStatus: () => string;
    updated: () => string;
    update: () => void;
  }>(null);
  React.useEffect(() => {
    const fetchLeads = async () => {
      try {
        const params = {
          id: id,
        };
        const res = await getLeadbyId(params);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    fetchLeads();
  }, [id]);

  React.useEffect(() => {
    const fetchTask = async () => {
      try {
        const params = {
          leadId: id,
        };
        const res = await getTaskByLeadId(params);
        setTaskData(res.data);
      } catch (error) {
        console.error("Error fetching Tasks:", error);
      }
    };
    fetchTask();
  }, [id]);

  const handleDelete = async () => {
    try {
      if (!id || !status) {
        toast.error("Missing lead ID or model");
        return;
      }

      await deleteLead(id, status);
      toast.success("Lead deleted successfully!");
      navigate("/leads");
    } catch (error) {
      toast.error("Failed to delete lead");
    }
  };

  const handleDiscard = () => {
    formRef.current?.resetForm();
  };


  React.useEffect(() => {
    const locked = formRef.current?.getStatus?.();
    const status = formRef.current?.updated?.();

    if (locked) {
      setIsLocked(locked === "locked");
    }
    if (status) {
      setUpdate(status === "Rejected");
    }
  }, [formRef.current]);

  const handleTabChange = (newTab: string) => {
  setActiveTab(newTab);
  setSearchParams((prev) => {
    const updated = new URLSearchParams(prev);
    updated.set("tab", newTab);
    return updated;
  });
};

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft />
          </Button>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger className="cursor-pointer" value="info">
                Lead Info
              </TabsTrigger>

              {data?.current_status?.name === "won" && (
                <TabsTrigger className="cursor-pointer" value="handover">
                  Handover
                </TabsTrigger>
              )}

              <TabsTrigger className="cursor-pointer" value="timeline">
                Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeTab === "info" && (
          <div className="flex gap-2">
            <Button
              className="cursor-pointer"
              size="sm"
              variant="outline"
              onClick={() => {
                navigate(`/editlead?id=${id}&lead_model=${status}`);
              }}
            >
              Edit Details
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Remove Lead
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the lead from our system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={handleDelete}>
                    Yes, delete
                  </AlertDialogAction>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        {activeTab === "handover" && (
          <div className="flex gap-2">
            {isLocked && !update ? (
              <span className="flex gap-2 items-center">
                Status:{" "}
                <Badge
                  variant="destructive"
                  className="flex gap-1 items-center text-xs"
                >
                  <Lock size={12} />
                  Locked
                </Badge>
              </span>
            ) : (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      size="sm"
                    >
                      Discard
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will discard all the
                        changes you made in the handover.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction
                        className="cursor-pointer"
                        onClick={handleDiscard}
                      >
                        Yes, Submit
                      </AlertDialogAction>
                      <AlertDialogCancel className="cursor-pointer">
                        Cancel
                      </AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  className="bg-[#214b7b] cursor-pointer"
                  size="sm"
                  onClick={() =>
                    update
                      ? formRef.current?.update()
                      : formRef.current?.submit()
                  }
                >
                  {update ? "Update Handover" : "Create Handover"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tab contents */}
      <Tabs value={activeTab} className="w-full">
        {/* Lead Info Tab */}
        <TabsContent value="info">
          <div className="flex gap-4 h-[calc(100vh-200px)]">
            <Card className="min-w-[450px] max-h-full overflow-hidden">
              <CardHeader className="flex justify-center flex-col items-center">
                <Avatar className="h-14 w-14">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>KR</AvatarFallback>
                </Avatar>
                <CardTitle className="mb-2 capitalize">{data?.name}</CardTitle>
                <CardDescription className="flex items-center gap-3">
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
                <CardTitle>
                  Status:{" "}
                  <Badge
                    className={`capitalize ${
                      status === "won"
                        ? "bg-green-500"
                        : status === "followUp"
                        ? "bg-yellow-400"
                        : status === "initial"
                        ? "bg-blue-500"
                        : status === "dead"
                        ? "bg-red-500"
                        : status === "warm"
                        ? "bg-orange-400"
                        : ""
                    }`}
                  >
                    {data?.current_status?.name}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-black capitalize flex gap-1 items-center">
                  <MapPin size={16} />{" "}
                  <span>
                    {data?.address?.village}
                    {data?.address?.village && data?.address?.district
                      ? ", "
                      : ""}
                    {data?.address?.district}
                    {data?.address?.district && data?.address?.state
                      ? ", "
                      : ""}
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
                  <strong>Capacity:</strong> {data?.project_details?.capacity}
                </p>
                <p>
                  <strong>Scheme:</strong> {data?.project_details?.scheme}
                </p>
                <p>
                  <strong>Company:</strong> {data?.company_name}
                </p>
                <p>
                  <strong>Description:</strong> {data?.comments}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 items-start">
                <Separator />
                Owner: {data?.current_assigned?.user_id?.name}
              </CardFooter>
            </Card>

            <div className="w-full overflow-y-auto pr-2 flex flex-col gap-4">
              <NotesCard />
              <TasksCard
                leadId={data?.id}
                name={data?.name}
                id={id}
                taskData={taskData}
              />
              <LeadDocuments data={data} />
            </div>
          </div>
        </TabsContent>

        {/* Handover Tab */}
        <TabsContent value="handover">
          <HandoverForm ref={formRef} />
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card className="p-4">
            <CardTitle>Lead Timeline</CardTitle>
            <CardContent>
              <p>Coming Soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
