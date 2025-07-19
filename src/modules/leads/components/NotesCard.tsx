"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function NotesCard() {
  const [searchParams] = useSearchParams();
  const lead_id = searchParams.get("id");
  const user_id = localStorage.getItem("userId");

  const [data, setData] = useState([]);
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await getNotesByLeadId({ lead_id });
      setData(res.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [lead_id]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.warning("Note cannot be empty");
      return;
    }
    try {
      await createNotes({ lead_id, user_id, description });
      toast.success("Note created");
      setDescription("");
      setOpenDialog(false);
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to create note");
    }
  };

  const handleEdit = (note) => {
    setEditId(note._id);
    setEditText(note.description);
  };

  const handleEditSave = async (noteId) => {
    try {
      await editNotes(noteId, { description: editText });
      toast.success("Note updated");
      setEditId(null);
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to update note");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotes(deleteId);
      toast.success("Note deleted");
      setDeleteId(null);
      fetchNotes();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-lg font-medium">Internal Notes</CardTitle>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note</DialogTitle>
            </DialogHeader>
            <Textarea
              placeholder="Write your note here..."
              className="resize-none"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="max-h-64 overflow-hidden">
        <ScrollArea className="h-60 pr-2">
          {data.map((note) => (
            <div key={note._id} className="flex items-start gap-3 mt-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/vercel.png" />
                <AvatarFallback>
                  {note.user_id?.name?.slice(0, 2).toUpperCase() || "NA"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {editId === note._id ? (
                  <>
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="resize-none"
                    />
                    <Button
                      size="sm"
                      className="mt-1"
                      onClick={() => handleEditSave(note._id)}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm">{note.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.updatedAt).toLocaleString()} by{" "}
                      {note.user_id?.name || "Unknown"}
                    </p>
                  </>
                )}
              </div>
              <div className="ml-auto flex gap-1">
                <Pencil
                  className="h-4 w-4 text-muted-foreground cursor-pointer"
                  onClick={() => handleEdit(note)}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Trash
                      className="h-4 w-4 text-muted-foreground cursor-pointer"
                      onClick={() => setDeleteId(note._id)}
                    />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. It will permanently delete
                        this note.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction className="cursor-pointer" onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                      <AlertDialogCancel className="cursor-pointer" onClick={() => setDeleteId(null)}>
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
    </Card>
  );
}
