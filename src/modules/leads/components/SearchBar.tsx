"use client";

import {
  File,
  Group,
  Info,
  Search,
  User2,
  AlarmClock,
  Skull,
  Trophy,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  exportToCsv,
  transferLead,
  updateLeadStatusBulk,
  updateLeadPriorityBulk,
} from "@/services/leads/LeadService";
const PRIORITY_OPTIONS = [
  { key: "highest", label: "Highest" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
];

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useEffect, useMemo, useState } from "react";
import { getAllUser } from "@/services/task/Task";
import { attachToGroup, getAllGroupName } from "@/services/group/GroupService";
import { useAuth } from "@/services/context/AuthContext";

interface SearchBarLeadsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedStage: string;
  onValueChange: (value: string) => void;
  clearFilters: () => void;
  selectedIds: string[];
  onTransferComplete: (value: string) => void;
}

type BDUser = {
  _id: string;
  name: string;
};

type GroupItem = {
  _id: string;
  group_name: string;
  company_name?: string;
  createdBy?: { name?: string };
};

const STATUS_OPTIONS = [
  { key: "initial", label: "Initial", icon: Info },
  { key: "follow up", label: "Follow Up", icon: AlarmClock },
  { key: "won", label: "Won", icon: Trophy },
  { key: "dead", label: "Dead", icon: Skull },
] as const;

export default function SearchBarLeads({
  searchValue,
  onSearchChange,
  selectedIds,
  onTransferComplete,
}: SearchBarLeadsProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  // below other useState hooks
  const [isExporting, setIsExporting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [isApplyingStatus, setIsApplyingStatus] = useState(false);
  const [selectedStage, setSelectedStage] = useState("as per choice");
  const [remarks, setRemarks] = useState(" ");
  const [selectedUser, setSelectedUser] = useState<BDUser | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOpenGroup, setConfirmOpenGroup] = useState(false);

  const [users, setUsers] = useState<BDUser[]>([]);
  const [data, setData] = useState<GroupItem[]>([]);

  const [openPriority, setOpenPriority] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [isApplyingPriority, setIsApplyingPriority] = useState(false);
  // --------- Change Priority Bulk ----------
  const handleApplyPriorityBulk = async () => {
    if (!selectedIds?.length) {
      toast.error("Select at least one lead");
      return;
    }
    if (!selectedPriority) {
      toast.error("Please select a priority");
      return;
    }
    if (isApplyingPriority) return;

    setIsApplyingPriority(true);
    try {
      await updateLeadPriorityBulk(selectedIds, selectedPriority);
      toast.success("Priority updated successfully");
      setOpenPriority(false);
      setSelectedPriority("");
      onTransferComplete(selectedPriority);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to update priority";
      toast.error(message);
    } finally {
      setIsApplyingPriority(false);
    }
  };
  const department = "BD";

  const { user } = useAuth();

  const canExport = useMemo(() => {
    if (!(selectedIds.length > 0)) return false;
    const u = user?.name || "";
    return (
      u === "admin" ||
      u === "Admin" ||
      u === "IT Team" ||
      u === "Deepak Manodi" ||
      u === "Prachi Singh"
    );
  }, [selectedIds.length, user?.name]);

  // --------- Export ----------
  const handleExportToCsv = async (ids: string[]) => {
    if (!ids?.length) {
      toast.error("No tasks selected for export.");
      return;
    }
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportToCsv(ids);
      toast.success("CSV exported successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  // --------- Transfer ----------
  const handleTransferLead = async () => {
    if (!selectedIds || !selectedUser) {
      toast.error("Missing lead or user selection");
      return;
    }
    if (isTransferring) return;
    setIsTransferring(true);
    try {
      await transferLead(selectedIds, selectedUser._id);
      toast.success("Lead transferred successfully");
      setOpen(false);
      onTransferComplete(selectedUser._id);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to transfer lead";
      toast.error(message);
    } finally {
      setIsTransferring(false);
    }
  };

  // --------- Attach to Group ----------
  const handleAttachToGroup = async () => {
    if (!selectedIds || !selectedGroup) {
      toast.error("Missing lead or group selection");
      return;
    }
    if (isAttaching) return;
    setIsAttaching(true);
    try {
      await attachToGroup(selectedGroup._id, selectedIds);
      toast.success("Leads attached to group successfully");
      setOpenGroup(false);
      onTransferComplete(selectedGroup._id);
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Something went wrong";
      toast.info(message);
    } finally {
      setIsAttaching(false);
    }
  };

  const handleApplyStatusBulk = async () => {
    if (!selectedIds?.length) {
      toast.error("Select at least one lead");
      return;
    }
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }
    if (isApplyingStatus) return;

    setIsApplyingStatus(true);
    try {
      await updateLeadStatusBulk(
        selectedIds,
        selectedStatus,
        selectedStage,
        remarks
      );
      toast.success("Status updated successfully");
      setOpenStatus(false);
      setSelectedStatus("");
      setRemarks("");
      onTransferComplete(selectedStatus);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to update status";
      toast.error(message);
    } finally {
      setIsApplyingStatus(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const params = { department };
        const res = await getAllUser(params);
        setUsers(res.data || []);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllGroupName();
        setData(res.data?.data || []);
      } catch (e) {
        console.error("Error fetching groups", e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-[#e5e5e5] w-full px-4 py-3 flex justify-between items-center shadow-sm relative z-30">
      {/* Search */}
      <div className="flex items-center gap-2 w-full max-w-md">
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

      {/* Actions */}
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

        {canExport && (
          <div className="flex items-center gap-1">
            <File size={14} />
            <span
              className={`cursor-pointer text-black hover:underline ${
                isExporting ? "pointer-events-none opacity-60" : ""
              }`}
              onClick={() => !isExporting && handleExportToCsv(selectedIds)}
            >
              {isExporting ? "Exporting..." : "Export Leads"}
            </span>
          </div>
        )}

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-1">
            <User2 size={14} />
            <span
              className={`cursor-pointer text-black hover:underline ${
                isTransferring ? "pointer-events-none opacity-60" : ""
              }`}
              onClick={() => !isTransferring && setOpen(true)}
            >
              Transfer Leads
            </span>
          </div>
        )}

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-1">
            <Group size={14} />
            <span
              className={`cursor-pointer text-black hover:underline ${
                isAttaching ? "pointer-events-none opacity-60" : ""
              }`}
              onClick={() => !isAttaching && setOpenGroup(true)}
            >
              Attach to Group
            </span>
          </div>
        )}

        {selectedIds.length > 0 && (
          <>
            <div className="flex items-center gap-1">
              <Info size={14} />
              <span
                className={`cursor-pointer text-black hover:underline ${
                  isApplyingStatus ? "pointer-events-none opacity-60" : ""
                }`}
                onClick={() => !isApplyingStatus && setOpenStatus(true)}
              >
                Change Status
              </span>
            </div>
            <div className="flex items-center gap-1">
              <AlarmClock size={14} />
              <span
                className={`cursor-pointer text-black hover:underline ${
                  isApplyingPriority ? "pointer-events-none opacity-60" : ""
                }`}
                onClick={() => !isApplyingPriority && setOpenPriority(true)}
              >
                Change Priority
              </span>
            </div>
          </>
        )}
        {/* Change Priority Dialog */}
        <Dialog open={openPriority} onOpenChange={setOpenPriority}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Priority</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {PRIORITY_OPTIONS.map(({ key, label }) => (
                <label
                  key={key}
                  className={
                    "flex items-center gap-3 p-2 border rounded cursor-pointer hover:bg-gray-100"
                  }
                  onClick={() => setSelectedPriority(key)}
                >
                  <input
                    type="radio"
                    name="lead-priority"
                    checked={selectedPriority === key}
                    onChange={() => setSelectedPriority(key)}
                    className="cursor-pointer"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <DialogFooter className="mt-4">
              <Button
                onClick={handleApplyPriorityBulk}
                className="cursor-pointer"
                disabled={isApplyingPriority}
              >
                {isApplyingPriority ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Applying...
                  </span>
                ) : (
                  "Apply"
                )}
              </Button>

              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => setOpenPriority(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Attach to Group */}
      <Dialog open={openGroup} onOpenChange={setOpenGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Group to Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data
              .filter((group) => {
                const userName = user?.name;
                const isAdmin =
                  userName === "Admin" ||
                  userName === "admin" ||
                  userName === "IT Team" ||
                  userName === "Deepak Manodi";
                if (isAdmin) return true;
                return group?.createdBy?.name === userName;
              })
              .map((group) => (
                <div
                  key={group._id}
                  className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedGroup(group);
                    setConfirmOpenGroup(true);
                  }}
                >
                  {group.group_name}
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
              Do you want to attach to{" "}
              <strong>
                {selectedGroup?.company_name || selectedGroup?.group_name} Group
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAttachToGroup}
              className="cursor-pointer"
              disabled={isAttaching}
            >
              {isAttaching ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Attaching...
                </span>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Leads */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select BD Member to Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.map((u) => (
              <div
                key={u._id}
                className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSelectedUser(u);
                  setConfirmOpen(true);
                }}
              >
                {u?.name}
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
              disabled={isTransferring}
            >
              {isTransferring ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Transferring...
                </span>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openStatus} onOpenChange={setOpenStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {STATUS_OPTIONS.map(({ key, label, icon: Icon }) => (
              <label
                key={key}
                className={
                  "flex items-center gap-3 p-2 border rounded cursor-pointer hover:bg-gray-100"
                }
                onClick={() => setSelectedStatus(key)}
              >
                <input
                  type="radio"
                  name="lead-status"
                  checked={selectedStatus === key}
                  onChange={() => setSelectedStatus(key)}
                  className="cursor-pointer"
                />
                <Icon size={16} />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <DialogFooter className="mt-4">
            <Button
              onClick={handleApplyStatusBulk}
              className="cursor-pointer"
              disabled={isApplyingStatus}
            >
              {isApplyingStatus ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Applying...
                </span>
              ) : (
                "Apply"
              )}
            </Button>

            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setOpenStatus(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
