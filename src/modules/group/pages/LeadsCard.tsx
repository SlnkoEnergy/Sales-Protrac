"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import {
  createNotes,
  getNotesByLeadId,
  editNotes,
  deleteNotes,
} from "@/services/leads/Notes";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/modules/leads/components/LeadTable";

export default function LeadsCard() {
  const [searchParams] = useSearchParams();
  const lead_id = searchParams.get("id");
  const user_id = localStorage.getItem("userId");
   const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [data, setData] = useState([]);
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchNotes = async () => {
    try {
      const params = { lead_id };
      const res = await getNotesByLeadId(params);
      setData(res.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-lg font-medium">Total Leads</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100vh-305px)] overflow-hidden">
        <ScrollArea className="h-[calc(100vh-305px)] pr-2">
           <DataTable search={searchQuery} onSelectionChange={setSelectedIds}/>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
