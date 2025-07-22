import { HandoverTable } from "../components/Handover";


export default function Handover() {
  return (
    <div className="w-full h-full">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> 
        <HandoverTable />
      </div>
    </div>
  );
}


