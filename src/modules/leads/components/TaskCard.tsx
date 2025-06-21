
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash } from "lucide-react";

export default function TasksCard(){
  return (
    <Card>
      <CardHeader className="flex flex-row w-full items-center justify-between">
        <CardTitle className="text-lg font-medium">Tasks</CardTitle>
        <Button variant="outline" size="sm">
          + Add Task
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Input placeholder="Add Task" />
        <ScrollArea className="h-24">
          <div className="flex items-start gap-3 mt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/vercel.png" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm">Follow up with lead tomorrow</p>
              <p className="text-xs text-muted-foreground">
                10 mins ago by Adam Sebatta
              </p>
            </div>
            <div className="ml-auto flex gap-1">
              <Pencil className="h-4 w-4 text-muted-foreground cursor-pointer" />
              <Trash className="h-4 w-4 text-muted-foreground cursor-pointer" />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

