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
}: {
  type: "email" | "call" | "meeting" | "todo";
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState("");
  const [user, setUser] = useState([]);
  const department = "BD";
  const [formData, setFormData] = useState({
    title: "",
    lead_id: "",
    lead_name: "",
    contact_info: "",
    priority: "",
    due_date: "",
    assigned_to: [] as string[],
    description: "",
  });

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

  const handleSave = async () => {
    try {
      const payload = {
        title: formData.title,
        lead_id: formData.lead_id,
        user_id: getUserIdFromToken(),
        type,
         assigned_to: type === "todo" ? [getUserIdFromToken()] : selected,
        deadline: formData.due_date,
        contact_info: formData.contact_info,
        priority: formData.priority,
        description: formData.description,
      };

      await createTask(payload);
      toast.success("Task Created Successfully");
      setFormData({
        title: "",
        lead_id: "",
        lead_name: "",
        contact_info: "",
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
        contact_info: formData.contact_info,
        priority: formData.priority,
        description: formData.description,
      };
      await createTask(payload);
      toast.success("Task Created Successfully with completed status");
      setFormData({
        title: "",
        lead_id: "",
        lead_name: "",
        contact_info: "",
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
      <div>
        <Label className="mb-2">Title</Label>
        <Input
          required
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter Title of task..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2">Lead Id</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {selectedLead ? selectedLead : "Choose one"}
              </Button>
            </PopoverTrigger>
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
                          lead_name: lead.c_name,
                          contact_info:
                            type === "email"
                              ? lead.email || ""
                              : type === "call" 
                              ? lead.mobile || ""
                              : "",
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
          </Popover>
        </div>
        <div>
          <Label className="mb-2">Lead Name</Label>
          <Input value={formData.lead_name ?? ""} disabled />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(type === "email" || type === "call") && (
          <div>
            <Label className="mb-2">
              {type === "email" ? "Email" : "Phone Number"}
            </Label>
            <Input value={formData.contact_info ?? ""} disabled />
          </div>
        )}
        {type === "meeting" && (
          <div>
            <Label className="mb-2">Location</Label>
            <Input placeholder="Enter Location" />
          </div>
        )}

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

        {type === "todo" && (
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
        )}
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

        {type === "todo" ? (
          <div className="space-y-2">
            <Label className="mb-2">Assigned to</Label>
            <Input disabled value={getCurrentUser()?.name || ""} />
          </div>
        ) : type === "meeting" ? (
          <div className="space-y-2">
            <Label className="mb-2">Assigned to</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  {selected.length > 0
                    ? selected
                        .map((id) => user?.find((u) => u._id === id)?.name)
                        .filter(Boolean)
                        .join(", ")
                    : "Select users"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2 max-h-[300px] overflow-auto">
                <div className="grid gap-2">
                  {user?.map((u) => (
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
        ) : (
          <div className="space-y-2">
            <Label className="mb-2">Assigned to</Label>
            <Select
              value={selected[0] || ""}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>

              <SelectContent>
                <div className="max-h-60 overflow-y-auto">
                  {user?.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>
        )}
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
                    contact_info: "",
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
          <AlertDialogTrigger asChild>
            <Button variant="secondary" className="cursor-pointer">
              Mark Done
            </Button>
          </AlertDialogTrigger>
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
