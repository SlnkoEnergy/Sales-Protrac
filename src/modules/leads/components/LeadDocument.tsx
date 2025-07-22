import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Trash, Plus, Download, Upload, View } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { uploadDocuments } from "@/services/leads/LeadService";
import DocumentViewerModal from "@/components/lead/DocumentViewer";
import { Input } from "@/components/ui/input";

const documentOptions = ["LOI", "LOA", "PPA", "Aadhaar", "Other"];

export default function LeadDocuments({ data }) {
  const [selectedDoc, setSelectedDoc] = useState<string>("");
  const [files, setFiles] = useState<{ type: string; file: File | null }[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedViewDoc, setSelectedViewDoc] = useState<string>("");
  const [customDocName, setCustomDocName] = useState("");
  const [expectedDate, setExpectedDate] = useState<Date | null>(null);
  const uploadedDocTypes =
    data?.documents?.map((d) => d?.name?.toLowerCase()) || [];

  const filteredOptions = documentOptions.filter(
    (doc) => doc === "Other" || !uploadedDocTypes.includes(doc.toLowerCase())
  );

  const handleAddFile = () => {
    if (!selectedDoc) return toast.warning("Select document type first");
    if (files.find((item) => item.type === selectedDoc)) {
      return toast.warning("Document already added");
    }
    setFiles([...files, { type: selectedDoc, file: null }]);
    setSelectedDoc("");
  };

  const handleDelete = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
    if (selectedFile && index === editIndex) {
      setSelectedFile(null);
    }
    setEditIndex(null);
  };

  const handleFileUpload = async (itemType: string) => {
    if (!selectedFile || !itemType || !data._id) return;

    const stage = itemType.toLowerCase() === "loi" ? "follow up" : "warm";
    const docType = itemType.toLowerCase();
    if (
      !data.expected_closing_date &&
      (docType === "loa" || docType === "ppa") &&
      !expectedDate
    ) {
      toast.error("Expected Closing Date is required for LOA and PPA.");
      return;
    }

    try {
      setUploading(true);
      await uploadDocuments(
        data._id,
        stage,
        docType as "loi" | "loa" | "ppa",
        customDocName,
        !data.expected_closing_date ? expectedDate : undefined,
        selectedFile
      );

      console.log({ customDocName });
      toast.success("✅ File Uploaded Successfully");
      setSelectedFile(null);
    } catch (error) {
      toast.error("❌ Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  console.log(data?.documents?.length);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-lg font-medium">Lead Documents</CardTitle>
        <div className="flex gap-2 items-center">
          <Select value={selectedDoc} onValueChange={setSelectedDoc}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              {filteredOptions.map((doc) => (
                <SelectItem key={doc} value={doc}>
                  {doc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleAddFile}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="max-h-64 overflow-hidden">
        <ScrollArea className=" pr-2">
          {files.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 mt-3"
            >
              <div className="text-sm w-1/3 font-medium">{item.type}</div>
              <div className="w-2/3 flex gap-2 items-center flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedFile(e.target.files[0]);
                        setEditIndex(index);
                      }
                    }}
                  />

                  {selectedFile === null && (
                    <div className="flex gap-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Choose file
                      </span>
                    </div>
                  )}
                </label>

                {selectedFile !== null && editIndex === index && (
                  <div className="text-sm text-gray-700 truncate max-w-[200px]">
                    {selectedFile.name}
                  </div>
                )}

                {item.type === "Other" && (
                  <Input
                    placeholder="Enter document name"
                    value={customDocName}
                    onChange={(e) => setCustomDocName(e.target.value)}
                    className="w-[180px]"
                  />
                )}

                {/* Expected Closing Date input if missing and required */}
                {!data?.expected_closing_date &&
                  ["loa", "ppa", "loi"].includes(item.type.toLowerCase()) && (
                    <Input
                      type="date"
                      required={["loa", "ppa"].includes(
                        item.type.toLowerCase()
                      )}
                      className="w-[160px]"
                      value={
                        expectedDate instanceof Date &&
                        !isNaN(expectedDate.getTime())
                          ? expectedDate.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setExpectedDate(new Date(e.target.value))
                      }
                    />
                  )}

                <Button
                  onClick={() => handleFileUpload(item.type)}
                  disabled={
                    !selectedFile ||
                    editIndex !== index ||
                    uploading ||
                    (["loa", "ppa"].includes(item.type.toLowerCase()) &&
                      !data?.expected_closing_date &&
                      !expectedDate)
                  }
                  size="sm"
                  variant="outline"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>

                <Pencil
                  className="h-4 w-4 text-muted-foreground cursor-pointer"
                  onClick={() =>
                    document
                      .querySelectorAll("input[type='file']")
                      [index]?.click()
                  }
                />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Trash
                      className="h-4 w-4 text-muted-foreground cursor-pointer"
                      onClick={() => setEditIndex(index)}
                    />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the document entry.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction onClick={() => handleDelete(index)}>
                        Delete
                      </AlertDialogAction>
                      <AlertDialogCancel onClick={() => setEditIndex(null)}>
                        Cancel
                      </AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>

      {data?.documents?.length > 0 && (
        <CardContent className="pt-0 mt-4 border-t">
          <p className="text-sm font-semibold mt-3 mb-3">Uploaded Documents</p>
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
            {data.documents.map((doc, i) => (
              <div
                key={i}
                className="flex justify-between items-center border rounded-md p-3 text-sm bg-gray-50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {doc?.name?.toUpperCase()}
                  </span>
                  {doc?.name === "other" && (
                    <span className="capitalize font-medium">
                      {doc?.remarks}
                    </span>
                  )}
                  <span className="text-gray-600 capitalize">
                    {doc?.user_id?.name}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(doc?.updatedAt).toLocaleDateString()}{" "}
                    {new Date(doc?.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex gap-2 ">
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => setSelectedViewDoc(doc.attachment_url)}
                  >
                    <View className="w-4 h-4 mr-1 text-muted-foreground" />
                    View
                  </Button>
                  {selectedViewDoc && (
                    <DocumentViewerModal
                      open={!!selectedViewDoc}
                      onOpenChange={() => setSelectedViewDoc(null)}
                      url={selectedViewDoc}
                    />
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#214b7b] text-white hover:bg-[#1b3f66] cursor-pointer"
                    onClick={() => window.open(doc.attachment_url, "_blank")}
                  >
                    <Download className="text-shadow-white w-4 h-4 mr-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
