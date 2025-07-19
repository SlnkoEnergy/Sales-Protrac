"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Trash, Plus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogCancel, AlertDialogAction, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const documentOptions = ["LOA", "PPA", "LOI", "Aadhar", "PAN"];

export default function LeadDocuments() {
  const [searchParams] = useSearchParams();
  const lead_id = searchParams.get("id");

  const [selectedDoc, setSelectedDoc] = useState<string>("");
  const [files, setFiles] = useState<{ type: string; file: File | null }[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleAddFile = () => {
    if (!selectedDoc) return toast.warning("Select document type first");
    if (files.find((item) => item.type === selectedDoc)) {
      return toast.warning("Document already added");
    }
    setFiles([...files, { type: selectedDoc, file: null }]);
    setSelectedDoc("");
  };

  const handleFileChange = (file: File, index: number) => {
    const updated = [...files];
    updated[index].file = file;
    setFiles(updated);
  };

  const handleDelete = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };

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
              {documentOptions.map((doc) => (
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
        <ScrollArea className="h-60 pr-2">
          {files.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-3 mt-3">
              <div className="text-sm w-1/3 font-medium">{item.type}</div>
              <div className="w-2/3 flex gap-2 items-center">
                <Input
                  type="file"
                  className="cursor-pointer"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0], index)}
                />
                <Pencil
                  className="h-4 w-4 text-muted-foreground cursor-pointer"
                  onClick={() => document.querySelectorAll("input[type='file']")[index]?.click()}
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
                      <AlertDialogAction onClick={() => handleDelete(index)}>Delete</AlertDialogAction>
                      <AlertDialogCancel onClick={() => setEditIndex(null)}>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
