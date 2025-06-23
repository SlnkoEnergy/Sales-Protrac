import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ViewTask() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="p-6">
        <Button
          variant="default"
          className="mb-2 cursor-pointer"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
      </div>
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-xl">
              Sort Company List name wise (A-Z)
            </CardTitle>
            <Badge variant="outline" className="bg-blue-100 text-shadow-white">
              By Call
            </Badge>
            <Badge variant="outline" className="bg-blue-400 text-shadow-white">
              In Progress
            </Badge>
          </CardHeader>
          <CardDescription className="grid grid-cols-1 sm:grid-cols-2 px-6 text-md gap-y-2 gap-x-4 mb-4">
            <div>
              <strong>Lead Id:</strong> BD/Lead/1
            </div>
            <div>
              <strong>Lead Name:</strong> ASIMA Directory Mobile Application
              Development
            </div>
            <div>
              <strong>Customer:</strong> —
            </div>
            <div className="flex items-center gap-2">
              <strong>Assignees:</strong>
              <Avatar className="h-6 w-6">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>MG</AvatarFallback>
              </Avatar>
              Mohit Goyal
            </div>
            <div>
              <strong>Deadline:</strong> —
            </div>

            <div className="flex items-center gap-2 mb-2">
              <strong>Priority:</strong> High
            </div>

            <div className="flex items-center gap-2 mb-2">
              <strong>Description:</strong> High
            </div>
          </CardDescription>
          <Separator />
          <CardFooter>Lead Owner : Siddharth Singh</CardFooter>
        </Card>
      </div>
    </div>
  );
}
