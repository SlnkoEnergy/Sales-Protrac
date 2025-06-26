import { MeetingTable } from "../components/MeetingTable";


export default function Meetings() {
  return (
    <div className="w-full h-full">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> 
        <MeetingTable />
      </div>
    </div>
  );
}


