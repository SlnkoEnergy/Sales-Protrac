import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound(){
  return (
    <div className="h-[90vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-20 w-20 text-[#214b7b]" />
      <h1 className="text-2xl font-semibold">Page Not Found</h1>
      <Button className="bg-[#214b7b]" asChild>
        <Link to="/">Go to Dashboard</Link>
      </Button>
    </div>
  );
};


