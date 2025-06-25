import EditLead from "@/modules/leads/components/EditLead";


export default function Leads() {
  return (
    <div className="w-screen h-screen">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> 
        <EditLead />
      </div>
    </div>
  );
}


