"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, AlertTriangle, GripVertical, PlusCircle, Eye } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { getToDoList } from "@/services/leads/Dashboard";
import { updateStatus } from "@/services/task/Task";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface TodoItem {
  id: string;
  title: string;
  date: string;
  by: string;
  status: string;
}

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRemarksDialog, setShowRemarksDialog] = useState(false);
  const [remarks, setRemarks] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getToDoList();
      const mappedData: TodoItem[] = (res.data ?? []).map((item: any) => ({
        id: item._id,
        title: item.title,
        date: item.updatedAt,
        by: item.user_id?.name ?? "N/A",
        status: item.current_status,
      }));
      setTodos(mappedData);
    } catch (error) {
      console.error("Failed to fetch To Do List:", error);
    }
  };

  const handleCheckboxClick = (todo: TodoItem) => {
    setSelectedTodo(todo);
    setShowConfirm(true);
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    setShowRemarksDialog(true);
  };

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const handleSubmitRemarks = async () => {
    try {
      await updateStatus({
        _id: selectedTodo?.id,
        status: "completed",
        user_id: getCurrentUser()._id,
        remarks: remarks,
      });

      toast.success("Task Completed Successfully!!");
      setShowRemarksDialog(false);
      setRemarks("");
      setSelectedTodo(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update task.");
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">My To Do Items</h3>
          <div className="flex gap-4">
            <div
              className="flex items-center gap-1 text-sm text-blue-600 cursor-pointer hover:underline hover:text-blue-800 font-medium"
              onClick={() => navigate("/tasks")}
            >
              <Eye size={16} />
              View All Task
            </div>
            <div
              className="flex items-center gap-1 text-sm text-green-600 cursor-pointer hover:underline hover:text-green-800 font-medium"
              onClick={() => navigate("/addtask")}
            >
              <PlusCircle size={16} />
               Add Task
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
         
          <div>
            <div className="flex items-center text-yellow-500 font-medium mb-2">
              <AlertTriangle size={16} className="mr-2" />
              Latest pending to do's
            </div>
            {todos.filter(t => t.status !== "completed").map(todo => (
              <TodoRow key={todo.id} todo={todo} onCheckboxClick={handleCheckboxClick} />
            ))}
          </div>

          
          <div>
            <div className="flex items-center text-green-500 font-medium mb-2">
              <Check size={16} className="mr-2" />
              Latest completed to do's
            </div>
            {todos.filter(t => t.status === "completed").map(todo => (
              <TodoRow key={todo.id} todo={todo} />
            ))}
          </div>
        </CardContent>
      </Card>

     
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark task as completed?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you have completed the task "{selectedTodo?.title}"?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleConfirmYes} className="cursor-pointer">
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     
      <Dialog open={showRemarksDialog} onOpenChange={setShowRemarksDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Remarks</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemarksDialog(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleSubmitRemarks} disabled={!remarks.trim()} className="cursor-pointer">
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface TodoRowProps {
  todo: TodoItem;
  onCheckboxClick?: (todo: TodoItem) => void;
}

function TodoRow({ todo, onCheckboxClick }: TodoRowProps) {
  return (
    <div className="flex items-start justify-between border-t pt-2">
      <div className="flex items-start gap-2">
        <GripVertical size={16} className="mt-1 text-gray-400" />

       
        {todo.status !== "completed" && onCheckboxClick ? (
          <input
            type="checkbox"
            className="mt-1 cursor-pointer"
            onChange={() => onCheckboxClick(todo)}
          />
        ) : (
          <div className="w-4" />
        )}

        <div>
          <div className="text-base">{todo.title}</div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(todo.date).toLocaleString()} by{" "}
            <span className="italic underline">{todo.by}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
