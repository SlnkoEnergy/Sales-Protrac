import { TeamTable } from "../components/TeamTable";

export default function Team() {
  return (
    <div className="w-full h-full">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> 
        <TeamTable />
      </div>
    </div>
  );
}


