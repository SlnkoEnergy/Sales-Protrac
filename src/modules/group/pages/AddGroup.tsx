import GroupDetailForm from "@/components/group/AddGroup";

export default function Group() {
  return (
    <div className="w-screen h-screen">
      <div className="h-[calc(100%-4rem)] p-4 overflow-auto"> 
        <GroupDetailForm />
      </div>
    </div>
  );
}


