import AddLead from "@/components/lead/AddLead";


export default function Leads() {
  return (
    <div className="w-screen h-screen">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> 
        <AddLead />
      </div>
    </div>
  );
}


