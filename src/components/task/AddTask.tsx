import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckSquare,
  ChevronLeft,
  Mail,
} from "lucide-react";
import { TabsContent } from "@radix-ui/react-tabs";
import TaskForm from "./TaskForm";
import { Button } from "../ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AddTask({idModal, leadIdModal, nameModal, onClose, onTaskCreated}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || null;
  const name = searchParams.get("name") || null;
  const leadId = searchParams.get("leadId") || null;

  const location = window.location.pathname;
  const isFromModal = location === "/leadProfile";

  console.log({onTaskCreated});

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

          <Tabs defaultValue="assign" className="mb-4">
            <TabsList className="grid grid-cols-2 w-full gap-1">
              <TabsTrigger className="cursor-pointer" value="assign">
                <Mail className="w-5 h-5 text-muted-foreground" /> Assign
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="todo">
                <CheckSquare className="w-5 h-5 text-muted-foreground" /> To-Do
              </TabsTrigger>
            </TabsList>
            <TabsContent value="assign">
              <TaskForm id = {isFromModal ? idModal: id} name={isFromModal? nameModal: name} leadId={isFromModal? leadIdModal: leadId} onClose={onClose} onTaskCreated={onTaskCreated} type="email" />
            </TabsContent>
            <TabsContent value="todo">
              <TaskForm id = {isFromModal ? idModal: id} name={isFromModal? nameModal: name} leadId={isFromModal? leadIdModal: leadId} onClose={onClose} onTaskCreated={onTaskCreated} type="todo" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
