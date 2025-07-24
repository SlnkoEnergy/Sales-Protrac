"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTask,
  getAllLeadDropdown,
  getAllUser,
} from "@/services/task/Task";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export default function TaskForm({
  type,
  id,
  name,
  leadId,
  onClose,
  onTaskCreated,
}: {
  type: "email" | "call" | "meeting" | "todo";
  id: string;
  name: string;
  leadId: string;
  onClose?: () => void;
  onTaskCreated?: (newTask: any) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState("");
  const [user, setUser] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const department = "BD";
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    lead_id: "",
    lead_name: "",
    priority: "",
    due_date: "",
    assigned_to: [] as string[],
    description: "",
  });

  console.log(id, name, leadId);
  const location = window.location.pathname;

  const isFromModal = location === "/leadProfile";

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  useEffect(() => {
    const fetchLeads = async () => {
      const result = await getAllLeadDropdown();
      setLeads(result);
    };
    fetchLeads();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const params = {
          department: department,
        };
        const res = await getAllUser(params);
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    fetchUser();
  }, [department]);
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
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
const currentUser = getCurrentUser();
const currentUserId = getUserIdFromToken();

const handleSave = async () => {
  try {
    const currentUser = getCurrentUser(); 
    const userId = currentUser._id;
      if (type !== "todo" && selected.length === 0) {
      toast.error("Please select at least one user to assign the task.");
      return;
    }

    const payload = {
      title: formData.title,
      lead_id: formData.lead_id,
      user_id: getUserIdFromToken(),
      type,
      assigned_to:  selected,
      deadline: formData.due_date,
      priority: formData.priority,
      description: formData.description,
    };

    const res = await createTask(payload);
    const createdTask = res.task;

    createdTask.user_id = {
      _id: userId,
      name: currentUser.name,
    };

    toast.success("Task Created Successfully");

    // Clear form
    setFormData({
      title: "",
      lead_id: "",
      lead_name: "",
      priority: "",
      due_date: "",
      assigned_to: [],
      description: "",
    });
    setSelected([]);

    onTaskCreated?.(createdTask);

    if (isFromModal) {
      onClose?.();
    } else {
      navigate("/tasks");
      }
    } catch (err) {
      toast.error("Failed to create Task. Please fill all the fields");
    }
  };
  

  const isDisabled = !!(id && name && leadId);

  useEffect(() => {
    if (id && name && leadId && leads.length > 0) {
      const matchedLead = leads.find(
        (lead) => lead._id === id || lead.id === leadId
      );

      if (matchedLead) {
        setSelectedLead(matchedLead.id);
        setFormData({
          ...formData,
          lead_id: matchedLead._id,
          lead_name: matchedLead.name,
        });
      }
    }
  }, [id, name, leadId, leads]);
  useEffect(() => {
  if (type === "todo" && currentUserId) {
    setSelected((prev) =>
      prev.includes(currentUserId) ? prev : [...prev, currentUserId]
    );
  }
}, [type, currentUserId]);


  const handleMarkDone = async () => {
    try {
      const payload = {
        title: formData.title,
        lead_id: formData.lead_id,
        user_id: getUserIdFromToken(),
        type,
        status: "completed",
        assigned_to: selected,
        deadline: formData.due_date,
        priority: formData.priority,
        description: formData.description,
      };
      await createTask(payload);
      toast.success("Task Created Successfully with completed status");
      setFormData({
        title: "",
        lead_id: "",
        lead_name: "",
        priority: "",
        due_date: "",
        assigned_to: [],
        description: "",
      });
      setSelected([]);
      navigate("/tasks");
    } catch (err) {
      toast.error("Failed to create Task. Please fill all the fields");
    }
  };
  const handleSelectChange = (id: string) => setSelected([id]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2">Title</Label>
          <Input
            required
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter Title of task..."
          />
        </div>
        <div>
          <Label className="mb-2">Lead Id</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={isDisabled}
              >
                {selectedLead ? selectedLead : "Choose one"}
              </Button>
            </PopoverTrigger>
            {!isDisabled && (
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search lead..." />
                  <CommandEmpty>No lead found.</CommandEmpty>
                  <CommandGroup className="max-h-[150px] overflow-y-auto">
                    {leads.map((lead) => (
                      <CommandItem
                        key={lead._id}
                        onSelect={() => {
                          setSelectedLead(lead.id);
                          setFormData({
                            ...formData,
                            lead_id: lead._id,
                            lead_name: lead.name,
                          });

                          setOpen(false);
                        }}
                      >
                        {lead.id}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            )}
          </Popover>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2">Priority</Label>
          <Select
            onValueChange={(value) =>
              setFormData({ ...formData, priority: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2">Lead Name</Label>
          <Input value={formData.lead_name ?? ""} disabled={!!isDisabled} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2">Due Date</Label>
          <Input
            required
            type="date"
            value={formData.due_date}
            onChange={(e) =>
              setFormData({ ...formData, due_date: e.target.value })
            }
          />
        </div>
        <div>
          <Label className="mb-2">Type</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
  <Label className="mb-2">Assigned to</Label>
  <Popover>
    <PopoverTrigger asChild>
      <div className="w-full min-h-[48px] max-h-[150px] overflow-y-auto border rounded-md px-2 py-2 flex flex-wrap gap-1 bg-white cursor-pointer">
        {/* Show logged in user always for 'todo' */}
        {type === "todo" && (
          <span
            key={currentUserId}
            className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full"
          >
            {currentUser?.name || "You"}
          </span>
        )}

        {/* Show other selected users */}
        {selected
          .filter((id) => id !== currentUserId)
          .map((id) => {
            const userName = user?.find((u) => u._id === id)?.name;
            return (
              <span
                key={id}
                className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
              >
                {userName}
              </span>
            );
          })}

        {type !== "todo" && selected.length === 0 && (
          <span className="text-gray-400 text-sm">Select users</span>
        )}
      </div>
    </PopoverTrigger>

    <PopoverContent className="w-full p-2 max-h-[300px] overflow-auto">
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      <div className="grid gap-2">
        {user
          ?.filter(
            (u) =>
              u._id !== currentUserId &&
              u.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((u) => (
            <label
              key={u._id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(u._id)}
                onCheckedChange={() => toggle(u._id)}
              />
              <span>{u.name}</span>
            </label>
          ))}
      </div>
    </PopoverContent>
  </Popover>
</div>


      <Textarea
        placeholder="Log a note..."
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      <div className="flex justify-end space-x-2 mt-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="cursor-pointer">
              Discard
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to discard the changes?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setFormData({
                    title: "",
                    lead_id: "",
                    lead_name: "",
                    priority: "",
                    due_date: "",
                    assigned_to: [],
                    description: "",
                  });
                  setSelectedLead("");
                }}
                className="cursor-pointer"
              >
                Discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to mark the task as Done?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleMarkDone}
                className="cursor-pointer"
              >
                Mark Done
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={handleSave} className="cursor-pointer">
          Save
        </Button>
      </div>
    </div>
  );
}
