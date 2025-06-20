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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Mail, MapPin, Pencil, Phone, Trash } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getLeadbyId } from "@/services/leads/leadService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export type Lead = {
  id: string;
  status: "initial" | "followUp" | "warm" | "won" | "dead";
  leadId: string;
  c_name: string;
  mobile: string;
  state: string;
  scheme: string;
  capacity: string;
  distance: string;
  entry_date: string;
  submitted_by: string;
  email: string;
  village: string;
  district: string;
  source: string;
  company: string;
  other_remarks: string;
};
export default function LeadProfile() {
  const navigate = useNavigate();
  const [data, setData] = React.useState<Lead | null>(null);

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const status = searchParams.get("status");

  React.useEffect(() => {
    const fetchLeads = async () => {
      try {
        const params = {
          id: id,
          status: status,
        };
        console.log("params:", params);
        const res = await getLeadbyId(params);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    fetchLeads();
  }, [id]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft />
          </Button>
          <CardTitle className="text-xl font-semibold">
            {data?.c_name}
          </CardTitle>
        </div>

        <div className="flex gap-2">
          <Button className="bg-blue-500" size="sm">
            Edit Details
          </Button>
          <Button variant="destructive" size="sm">
            Remove Lead
          </Button>
        </div>
      </div>
      <div className="flex gap-4">
        <Card className="min-w-[350px]">
          <CardHeader className="flex justify-center flex-col items-center">
            <Avatar className="h-14 w-14">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>KR</AvatarFallback>
            </Avatar>
            <CardTitle className="mb-2">{data?.c_name}</CardTitle>
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
                    {status}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-black capitalize flex gap-1 items-center">
                  <MapPin size={16} />{" "}
                  <span>
                    {data?.village}, {data?.district}, {data?.state}
                  </span>{" "}
                </CardDescription>
                <p>
                  <strong>Source:</strong> {data?.source}
                </p>
                <p>
                  <strong>Capacity:</strong> {data?.capacity}
                </p>
                <p>
                  <strong>Scheme:</strong> {data?.scheme}
                </p>
                <p>
                  <strong>Company:</strong> {data?.company}
                </p>
                <p>
                  <strong>Description:</strong> {data?.other_remarks}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 items-start">
            <Separator />
            Owner: {data?.submitted_by}
          </CardFooter>
        </Card>
        <Tabs defaultValue="notes" className="w-full">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="notes">
            <Card>
              <CardHeader className="flex flex-row w-full items-center justify-between">
                <CardTitle className="text-lg font-medium">
                  Internal Notes
                </CardTitle>
                <Button variant="outline" size="sm">
                  + Add Notes
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Input placeholder="Add Note" />
                <ScrollArea className="h-24">
                  <div className="flex items-start gap-3 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://github.com/vercel.png" />
                      <AvatarFallback>AS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        Failure to setup admin accounts in the system
                      </p>
                      <p className="text-xs text-muted-foreground">
                        5 mins ago by Adam Sebatta
                      </p>
                    </div>
                    <div className="ml-auto flex gap-1">
                      <Pencil className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      <Trash className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tasks">
            <Card>
              <CardHeader className="flex flex-row w-full items-center justify-between">
                <CardTitle className="text-lg font-medium">Tasks</CardTitle>
                <Button variant="outline" size="sm">
                  + Add task
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Input placeholder="Add Note" />
                <ScrollArea className="h-24">
                  <div className="flex items-start gap-3 mt-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://github.com/vercel.png" />
                      <AvatarFallback>AS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        Failure to setup admin accounts in the system
                      </p>
                      <p className="text-xs text-muted-foreground">
                        5 mins ago by Adam Sebatta
                      </p>
                    </div>
                    <div className="ml-auto flex gap-1">
                      <Pencil className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      <Trash className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </div>
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
