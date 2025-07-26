import { useState, FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  updateLeadStatus,
  uploadDocuments,
} from "@/services/leads/LeadService";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Props {
  leadId: string;
  currentStatus: string;
  expected_closing_date?: Date;
}

const StatusCell: FC<Props> = ({
  leadId,
  currentStatus,
  expected_closing_date,
}) => {
  const [openModal, setOpenModal] = useState<"LOI" | "LOA" | "PPA" | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const normalizedStatus = currentStatus?.toLowerCase();
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  const statusColors: Record<string, string> = {
    initial: "bg-gray-600",
    "follow up": "bg-blue-600",
    warm: "bg-orange-600",
    won: "bg-green-600",
    dead: "bg-red-600",
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !leadId || !openModal) return;

    const stage = openModal.toLowerCase() === "loi" ? "follow up" : "warm";

    let dateToSend = "";

    if (
      expected_closing_date instanceof Date &&
      !isNaN(expected_closing_date.getTime())
    ) {
      dateToSend = expected_closing_date.toISOString();
    } else if (pendingDate instanceof Date && !isNaN(pendingDate.getTime())) {
      dateToSend = pendingDate.toISOString();
    }

    if (
      stage === "warm" &&
      !dateToSend &&
      (expected_closing_date === undefined || expected_closing_date === null)
    ) {
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
      setTimeout(() => {
        location.reload();
      }, 300);
    } catch (error: any) {
      toast.error(error.message || "❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submitStatusUpdate = async () => {
    if (!leadId || !selectedStatus) return;

    let dateToSend = "";

    if (
      expected_closing_date instanceof Date &&
      !isNaN(expected_closing_date.getTime())
    ) {
      dateToSend = expected_closing_date.toISOString();
    } else if (pendingDate instanceof Date && !isNaN(pendingDate.getTime())) {
      dateToSend = pendingDate.toISOString();
    }

    if (
      selectedStatus === "warm" &&
      !dateToSend &&
      (expected_closing_date === undefined || expected_closing_date === null)
    ) {
      toast.error("Expected Closing Date is required");
      return;
    }
    try {
      await updateLeadStatus(
        leadId,
        selectedStatus,
        selectedLabel,
        remarks || "",
        pendingDate
      );
      toast.success(`Status updated to ${selectedStatus}`);
      setStatusDialogOpen(false);
      setRemarks("");
      setTimeout(() => {
        location.reload();
      }, 300);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleStatusUpdate = (status: string, label: string) => {
    setSelectedStatus(status);
    setSelectedLabel(label);
    setStatusDialogOpen(true);
  };

  return (
    <>
      <Badge
        className={`capitalize font-medium ${
          statusColors[currentStatus] || "bg-gray-300"
        } cursor-pointer`}
        onClick={() => setStatusSelectOpen(true)}
      >
        {currentStatus || "N/A"}
      </Badge>

      {/* Status Option Dialog */}
      <Dialog open={statusSelectOpen} onOpenChange={setStatusSelectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>Select status update action.</DialogDescription>
          </DialogHeader>

          {normalizedStatus !== "follow up" &&
            normalizedStatus !== "dead" &&
            normalizedStatus !== "warm" &&
            normalizedStatus !== "won" && (
              <Button
                className="bg-[#214b7b] cursor-pointer"
                onClick={() => setOpenModal("LOI")}
              >
                Upload LOI
              </Button>
            )}

          {normalizedStatus !== "warm" &&
            normalizedStatus !== "dead" &&
            normalizedStatus !== "won" && (
              <>
                <Button
                  className="bg-[#214b7b] cursor-pointer"
                  onClick={() => setOpenModal("LOA")}
                >
                  Upload LOA
                </Button>
                <Button
                  className="bg-[#214b7b] cursor-pointer"
                  onClick={() => setOpenModal("PPA")}
                >
                  Upload PPA
                </Button>
              </>
            )}

          <div className="mt-4">
            <p className="font-semibold">Manual Update (As Per Choice)</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {["initial", "follow up", "warm", "won"].map((status) => {
                const order = ["initial", "follow up", "warm", "won"];
                const currentIndex = order.indexOf(normalizedStatus || "");
                const targetIndex = order.indexOf(status);
                if (targetIndex <= currentIndex) return null;
                return (
                  <Button
                    key={status}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => handleStatusUpdate(status, "as per choice")}
                  >
                    {status}
                  </Button>
                );
              })}
              {normalizedStatus !== "dead" && (
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => handleStatusUpdate("dead", "as per choice")}
                >
                  Dead
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remarks Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update Status: {selectedLabel}, {selectedStatus}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter your remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          {(expected_closing_date === undefined ||
            expected_closing_date === null) &&
            selectedStatus !== "won" &&
            selectedStatus !== "dead" &&
            (selectedStatus === "warm" ||
              selectedLabel?.toLowerCase() === "as per choice") && (
              <>
                <label className="text-sm font-medium text-gray-700">
                  Expected Closing Date
                </label>
                <Input
                  type="date"
                  placeholder="Expected Closing Date"
                  value={
                    pendingDate instanceof Date && !isNaN(pendingDate.getTime())
                      ? pendingDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setPendingDate(val ? new Date(val) : null);
                  }}
                />
              </>
            )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitStatusUpdate} className="bg-[#214b7b] cursor-pointer">
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
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
            {(expected_closing_date === undefined ||
              expected_closing_date === null) && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Expected Closing Date
                </label>
                <Input
                  type="date"
                  value={
                    pendingDate instanceof Date && !isNaN(pendingDate.getTime())
                      ? pendingDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => setPendingDate(new Date(e.target.value))}
                />
              </div>
            )}
            <Button
              disabled={uploading || !selectedFile}
              onClick={handleFileUpload}
              className="bg-[#214b7b] cursor-pointer"

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
