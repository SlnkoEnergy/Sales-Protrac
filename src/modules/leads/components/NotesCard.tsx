"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, } from "@/components/ui/avatar";
import { Pencil, Trash, Plus, Notebook } from "lucide-react";
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

export default function NotesCard({ showNotesModal, setShowNotesModal}) {
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
      const params = { lead_id };
      const res = await getNotesByLeadId(params);
      setData(res.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleEdit = (note) => {
    setEditId(note._id);
    setEditText(note.description);
  };

  const handleDelete = async () => {
    try {
      await deleteNotes(deleteId);
      toast.success("Note deleted");
      setData((prev) => prev.filter((n) => n._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleEditSave = async (noteId) => {
    try {
      await editNotes(noteId, { description: editText });
      toast.success("Note updated");
      setData((prev) =>
        prev.map((n) =>
          n?._id === noteId
            ? {
              ...n,
              description: editText,
              updatedAt: new Date().toISOString(),
            }
            : n
        )
      );
      setEditId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update note");
    }
  };

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [lead_id]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.warning("Note cannot be empty");
      return;
    }

    try {
      const newNote = await createNotes({ lead_id, user_id, description });
      const localNote = {
        _id: newNote?.data?._id,
        description: description,
        user_id: {
          name: user?.name || "You",
        },
        updatedAt: new Date().toISOString(),
      };
      toast.success("Note created");
      setData((prev) => [localNote, ...prev]);
      setDescription("");
      setShowNotesModal(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to create note");
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-lg font-medium">Internal Notes History</CardTitle>
        <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
          
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
              <Button
                variant="ghost"
                className="cursor-pointer"
                onClick={() => setShowNotesModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="cursor-pointer">
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto">
        <ScrollArea className="max-h-[400px] pr-2">
          {data.length > 0 ? (
            data.map((note) => (
              <div key={note._id} className="flex items-center gap-3 mt-2">
                <div>
                  <Avatar className="h-8 w-8">
                  <Notebook />
                </Avatar>
                </div>
                
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
                      <div className="rounded-md border p-2 bg-muted/30">
                        <p className="text-sm break-all whitespace-pre-wrap pr-2">
                          {note.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.updatedAt).toLocaleString()} by{" "}
                          {note.user_id?.name || "Unknown"}
                        </p>
                      </div>

                    </>
                  )}
                </div>
                <div className="ml-auto flex gap-1">
                  {(getCurrentUser().name === "admin" ||
                    getCurrentUser().name === "superadmin" ||
                    getCurrentUser().name === "Deepak Manodi") && (
                      <Pencil
                        className="h-4 w-4 text-muted-foreground cursor-pointer"
                        onClick={() => handleEdit(note)}
                      />
                    )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      {(getCurrentUser().name === "admin" ||
                        getCurrentUser().name === "superadmin" ||
                        getCurrentUser().name === "Deepak Manodi") && (
                          <Trash
                            className="h-4 w-4 text-muted-foreground cursor-pointer"
                            onClick={() => setDeleteId(note._id)}
                          />
                        )}
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. It will permanently
                          delete this note.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction
                          className="cursor-pointer"
                          onClick={() => {
                            setDeleteId(note._id)
                            handleDelete();
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                        <AlertDialogCancel
                          className="cursor-pointer"
                          onClick={() => setDeleteId(null)}
                        >
                          Cancel
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              No Available Internal Notes
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
