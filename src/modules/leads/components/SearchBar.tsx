"use client";

import { ChevronLeft, File, Group, Search, User2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { exportToCsv, transferLead } from "@/services/leads/LeadService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { getAllUser } from "@/services/task/Task";
import { attachToGroup, getAllGroupName } from "@/services/group/GroupService";

interface SearchBarLeadsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedStage: string;
  onValueChange: (value: string) => void;
  clearFilters: () => void;
  selectedIds: string[];
}

export default function SearchBarLeads({
  searchValue,
  onSearchChange,
  selectedIds,
}: SearchBarLeadsProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOpenGroup, setConfirmOpenGroup] = useState(false);
  const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);
  const department = "BD";
  const handleExportToCsv = async (selectedIds: string[]) => {
    if (!selectedIds?.length) {
      toast.error("No tasks selected for export.");
      return;
    }

    try {
      await exportToCsv(selectedIds);
      toast.success("CSV exported successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to export CSV");
    }
  };

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const handleTransferLead = async () => {
    if (!selectedIds || !selectedUser) {
      toast.error("Missing lead or user selection");
      return;
    }

    try {
      await transferLead(selectedIds, selectedUser._id);
      toast.success("Lead transferred successfully");

      setOpen(false);

      setTimeout(() => {
        location.reload();
      }, 300);
    } catch (error: any) {
      console.error("Transfer lead failed:", error);
      const message =
        error?.response?.data?.message || "Failed to transfer lead";
      toast.error(message);
    }
  };

  const handleAttachToGroup = async () => {
    if (!selectedIds || !selectedGroup) {
      toast.error("Missing lead or group selection");
      return;
    }

    try {
      await attachToGroup(selectedGroup._id, selectedIds);
      toast.success("Leads attached to group successfully");

      setOpenGroup(false);

      setTimeout(() => {
        location.reload();
      }, 300);
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Something went wrong";
      toast.info(message);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const params = {
          department: department,
        };
        const res = await getAllUser(params);
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllGroupName();
      setData(res.data.data);
    };
    fetchData();
  }, []);

  console.log("Data:", data);

  return (
    <div className="bg-[#e5e5e5] w-full px-4 py-3 flex justify-between items-center shadow-sm relative z-30">
      <div className="flex items-center gap-2 w-full max-w-md">
        <div className="flex flex-cols-2 justify-between">
          <Button
            variant="default"
            size="sm"
            onClick={() => (window.location.href = "/")}
            className="cursor-pointer"
          >
            <ChevronLeft />
          </Button>
        </div>
        <div className="relative bg-white w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search Leads"
            className="pl-8"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-800 font-medium relative">
        <span
          className="cursor-pointer text-black hover:underline"
          onClick={() => navigate("/addLead")}
        >
          + Add Lead
        </span>
        <span
          className="cursor-pointer text-black hover:underline"
          onClick={() => navigate("/addgroup")}
        >
          + Add Group
        </span>
        {selectedIds.length > 0 &&
          (getCurrentUser().name === "admin" ||
            getCurrentUser().name === "IT Team" ||
            getCurrentUser().name === "Deepak Manodi") && (
            <div className="flex items-center gap-1">
             <File size={14}/>
              <span
                className="cursor-pointer text-black hover:underline"
                onClick={() => handleExportToCsv(selectedIds)}
              >
                Export Leads
              </span>
            </div>
          )}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-1">
            <User2 size={14} />
            <span
              className="cursor-pointer text-black hover:underline"
              onClick={() => setOpen(true)}
            >
              Transfer Leads
            </span>
          </div>
        )}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-1">
            <Group size={14} />
            <span
              className="cursor-pointer text-black hover:underline"
              onClick={() => setOpenGroup(true)}
            >
              Attach to Group
            </span>
          </div>
        )}
      </div>
      <Dialog open={openGroup} onOpenChange={setOpenGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Group to Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.map((group) => (
              <div
                key={group._id}
                className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSelectedGroup(group);
                  setConfirmOpenGroup(true);
                }}
              >
                {group.company_name}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpenGroup} onOpenChange={setConfirmOpenGroup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to Attach to{" "}
              <strong>{selectedGroup?.company_name} Group</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAttachToGroup}
              className="cursor-pointer"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select BD Member to Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user._id}
                className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSelectedUser(user);
                  setConfirmOpen(true);
                }}
              >
                {user.name}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to transfer to <strong>{selectedUser?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferLead}
              className="cursor-pointer"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
