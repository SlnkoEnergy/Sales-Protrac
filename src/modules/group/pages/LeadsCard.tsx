"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {  useState } from "react";
import { DataTable } from "@/modules/leads/components/LeadTable";

export default function LeadsCard({group_id}) {
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedIds, setSelectedIds] = useState<string[]>([]);
   
   console.log(group_id);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-lg font-medium">Total Leads</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100vh-305px)] overflow-hidden">
        <ScrollArea className="h-[calc(100vh-305px)] pr-2">
           <DataTable group_id={group_id} search={searchQuery} onSelectionChange={setSelectedIds}/>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
