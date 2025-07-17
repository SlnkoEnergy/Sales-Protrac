"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
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
  const [description, setDescription] = useState("");
  const user_id = localStorage.getItem("userId");
  const lead_id = searchParams.get("id");
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState(null);

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
    } catch (err: any) {
      toast.error(err.message || "Failed to create note");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row w-full items-center justify-between">
        <CardTitle className="text-lg font-medium">Internal Notes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Textarea
          placeholder="Add Note"
          className="max-w-full h-[100px] resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button className="w-[100px] cursor-pointer" variant="outline" onClick={handleSubmit}>
          Submit
        </Button>

        <ScrollArea className="h-48">
          {data.map((note) => (
            <div key={note?._id} className="flex items-start gap-3 mt-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/vercel.png" />
                <AvatarFallback>
                  {note?.user_id?.name?.slice(0, 2).toUpperCase() || "NA"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {editId === note?._id ? (
                  <>
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="resize-none max-w-310"
                    />
                    <Button
                      size="sm"
                      className="mt-1 cursor-pointer"
                      onClick={() => handleEditSave(note?._id)}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm">{note?.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {note?.updatedAt
                        ? new Date(note?.updatedAt).toLocaleString()
                        : "Unknown time"}{" "}
                      by {note?.user_id?.name || "Unknown"}
                    </p>
                  </>
                )}
              </div>
              <div className="ml-auto flex gap-1 mr-4">
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
                      <AlertDialogCancel className="cursor-pointer" onClick={() => setDeleteId(null)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction className="cursor-pointer" onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
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
