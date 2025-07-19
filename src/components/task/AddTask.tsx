import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarClock,
  CheckSquare,
  ChevronLeft,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";
import { TabsContent } from "@radix-ui/react-tabs";
import TaskForm from "./TaskForm";
import { Button } from "../ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AddTask({idModal, leadIdModal, nameModal, onClose}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || null;
  const name = searchParams.get("name") || null;
  const leadId = searchParams.get("leadId") || null;

  const location = window.location.pathname;

  const isFromModal = location === "/leadProfile";

  return (
    <div className="w-full p-4">
      {!isFromModal && (
      <Button
        className="cursor-pointer"
        variant="default"
        size="sm"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft />
      </Button>
      )}
      <Card className="w-full max-w-xl mx-auto mt-10">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add Task</h2>

          <Tabs defaultValue="email" className="mb-4">
            <TabsList className="grid grid-cols-4 w-full gap-1">
              <TabsTrigger className="cursor-pointer" value="email">
                <Mail className="w-5 h-5 text-muted-foreground" /> Email
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="call">
                <Phone className="w-5 h-5 text-muted-foreground" /> Call
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="meeting">
                <CalendarClock className="w-5 h-5 text-muted-foreground" />{" "}
                Meeting
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="todo">
                <CheckSquare className="w-5 h-5 text-muted-foreground" /> To-Do
              </TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <TaskForm id = {isFromModal ? idModal: id} name={isFromModal? nameModal: name} leadId={isFromModal? leadIdModal: leadId} onClose={onClose} type="email" />
            </TabsContent>
            <TabsContent value="call">
              <TaskForm id = {isFromModal ? idModal: id} name={isFromModal? nameModal: name} leadId={isFromModal? leadIdModal: leadId} onClose={onClose} type="call" />
            </TabsContent>
            <TabsContent value="meeting">
              <TaskForm id = {isFromModal ? idModal: id} name={isFromModal? nameModal: name} leadId={isFromModal? leadIdModal: leadId} onClose={onClose} type="meeting" />
            </TabsContent>
            <TabsContent value="todo">
              <TaskForm id = {isFromModal ? idModal: id} name={isFromModal? nameModal: name} leadId={isFromModal? leadIdModal: leadId} onClose={onClose} type="todo" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
