"use client";

import { Check, Trash2, Edit2, AlertTriangle, GripVertical } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TodoItem {
  id: string;
  title: string;
  date: string;
  by: string;
  status: "pending" | "finished";
}

const todos: TodoItem[] = [
  { id: "1", title: "Compete this projects Monday", date: "2023-12-26 07:15:00", by: "Ankush", status: "pending" },
  { id: "2", title: "Compete this projects Monday", date: "2023-12-26 07:15:00", by: "Ankush", status: "finished" },
  { id: "3", title: "Compete this projects Monday", date: "2023-12-26 07:15:00", by: "Ankush", status: "normal" },
  { id: "4", title: "Compete this projects Monday", date: "2023-12-26 07:15:00", by: "Ankush", status: "normal" },
];

export default function TodoList() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold">My To Do Items</h3>
        <div className="text-sm text-blue-600 cursor-pointer hover:underline">
          View All + Add To Do
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Latest pending */}
        <div>
          <div className="flex items-center text-yellow-500 font-medium mb-2">
            <AlertTriangle size={16} className="mr-2" />
            Latest to do's
          </div>
          {todos.filter(t => t.status === "pending").map(todo => (
            <TodoRow key={todo.id} todo={todo} />
          ))}
        </div>

        {/* Latest finished */}
        <div>
          <div className="flex items-center text-green-500 font-medium mb-2">
            <Check size={16} className="mr-2" />
            Latest finished to do's
          </div>
          {todos.filter(t => t.status === "finished").map(todo => (
            <TodoRow key={todo.id} todo={todo} />
          ))}
        </div>

        {/* Other todos */}
        {todos.filter(t => t.status === "normal").map(todo => (
          <TodoRow key={todo.id} todo={todo} showActions />
        ))}
      </CardContent>
    </Card>
  );
}

interface TodoRowProps {
  todo: TodoItem;
  showActions?: boolean;
}

function TodoRow({ todo, showActions = false }: TodoRowProps) {
  return (
    <div className="flex items-start justify-between border-t pt-2">
      <div className="flex items-start gap-2">
        <GripVertical size={16} className="mt-1 text-gray-400" />
        <input type="checkbox" className="mt-1" />
        <div>
          <div className="text-base">{todo.title}</div>
          <div className="text-xs text-gray-500 mt-1">
            {todo.date} by <span className="italic underline">{todo.by}</span>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
            <Trash2 size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700">
            <Edit2 size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
