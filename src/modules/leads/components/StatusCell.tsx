import React, { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  updateExpectedClosingDate,
  updateLeadStatus,
  uploadDocuments,
} from "@/services/leads/LeadService";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  leadId: string;
  status: string;
  currentStatus: string;
}

const StatusCell: React.FC<Props> = ({
  leadId,
  status,
  currentStatus,
  expected_closing_date,
}) => {
  const [openModal, setOpenModal] = React.useState<
    "LOI" | "LOA" | "PPA" | null
  >(null);
  const [confirmLabel, setConfirmLabel] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const normalizedStatus = currentStatus?.toLowerCase();
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [pendingDate, setPendingDate] = useState("");
  const statusColors: Record<string, string> = {
    initial: "text-gray-500",
    "follow up": "text-blue-600",
    warm: "text-orange-500",
    won: "text-green-600",
    dead: "text-red-600",
  };

  const colorClass = statusColors[normalizedStatus] || "text-gray-700";

  const handleFileUpload = async () => {
    if (!selectedFile || !leadId || !openModal) return;

    const stage = openModal.toLowerCase() === "loi" ? "follow up" : "warm";

    // use pendingDate if expected_closing_date is undefined
    const dateToSend = expected_closing_date ?? pendingDate;

    if (stage === "warm" && !dateToSend) {
      toast.error("Expected Closing Date is required");
      return;
    }

    setUploading(true);
    try {
      await uploadDocuments(
        leadId,
        stage,
        openModal.toLowerCase() as "loi" | "loa" | "ppa",
        remarks,
        dateToSend,
        selectedFile
      );
      toast.success(`File uploaded & status updated to ${stage}`);
      setOpenModal(null);
    } catch (error: any) {
      toast.error(error.message || "❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!pendingDate) return;
    try {
      await updateExpectedClosingDate(leadId, pendingDate);
      toast.success("Expected closing date updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update date");
    } finally {
      setOpenDateDialog(false);
    }
  };

  const submitStatusUpdate = async () => {
    if (!leadId || !selectedStatus) return;
    try {
      await updateLeadStatus(
        leadId,
        selectedStatus,
        selectedLabel,
        remarks || ""
      );
      toast.success(`Status updated to ${selectedStatus}`);
      setStatusDialogOpen(false);
      setRemarks("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleStatusUpdate = (status: string, label: string) => {
    setSelectedStatus(status);
    setSelectedLabel(label);
    setStatusDialogOpen(true);
  };

  const expected_status = "";

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={`capitalize font-medium ${colorClass} cursor-pointer underline decoration-dotted`}
          >
            {currentStatus || "N/A"}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {normalizedStatus !== "follow up" &&
            normalizedStatus !== "dead" &&
            normalizedStatus !== "warm" && (
              <ContextMenuItem onClick={() => setOpenModal("LOI")}>
                LOI
              </ContextMenuItem>
            )}

          {normalizedStatus !== "warm" && normalizedStatus !== "dead" && (
            <>
              <ContextMenuItem onClick={() => setOpenModal("LOA")}>
                LOA
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setOpenModal("PPA")}>
                PPA
              </ContextMenuItem>
            </>
          )}

          {/* Always show these */}
          {/* Static options that trigger remarks dialog */}
          {normalizedStatus !== "dead" && (
            <>
              <ContextMenuItem
                onClick={() => handleStatusUpdate("won", "token money")}
              >
                Token Money
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleStatusUpdate("dead", "others")}
              >
                Others
              </ContextMenuItem>
            </>
          )}
          <ContextMenuSub>
            <ContextMenuSubTrigger>As Per Choice</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {["initial", "follow up", "warm", "won"]
                .filter((status) => {
                  const order = ["initial", "follow up", "warm", "won"];
                  const currentIndex = order.indexOf(
                    currentStatus?.toLowerCase() || ""
                  );
                  const targetIndex = order.indexOf(status);
                  return targetIndex > currentIndex;
                })
                .map((status) => (
                  <ContextMenuItem
                    key={status}
                    onClick={() => handleStatusUpdate(status, "as per choice")}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </ContextMenuItem>
                ))}

              {/* Always include Dead */}
              {currentStatus?.toLowerCase() !== "dead" && (
                <ContextMenuItem
                  onClick={() => handleStatusUpdate("dead", "as per choice")}
                >
                  Dead
                </ContextMenuItem>
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>

      {/* Dialog for remarks */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status: {selectedLabel}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter your remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          {expected_closing_date === undefined &&
            ((selectedStatus === "warm" &&
              !["as per choice", "won"].includes(
                selectedLabel?.toLowerCase()
              ) &&
              selectedLabel !== "token money") ||
              (selectedStatus === "follow up" &&
                selectedLabel?.toLowerCase() === "as per choice") ||
              (selectedStatus === "warm" &&
                selectedLabel?.toLowerCase() === "as per choice")) && (
              <Input
                type="date"
                placeholder="Expected Closing Date"
                value={
                  pendingDate instanceof Date && !isNaN(pendingDate.getTime())
                    ? pendingDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => setPendingDate(new Date(e.target.value))}
              />
            )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitStatusUpdate}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={!!openModal} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="sm:max-w-md mt-10">
          <DialogHeader>
            <DialogTitle>Upload {openModal} Document</DialogTitle>
            <DialogDescription>
              Select and upload your document.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            {expected_closing_date === undefined && (
              <Input
                type="date"
                placeholder="Expected Closing Date"
                value={
                  pendingDate instanceof Date && !isNaN(pendingDate.getTime())
                    ? pendingDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => setPendingDate(new Date(e.target.value))}
              />
            )}

            <Button
              disabled={uploading || !selectedFile}
              onClick={handleFileUpload}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StatusCell;
