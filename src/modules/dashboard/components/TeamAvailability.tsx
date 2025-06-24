import  { useEffect, useState } from "react";
import { getTeamAvailability } from "@/services/leads/Dashboard"; // Adjust the import path as needed
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TeamMember {
  name: string;
  email?: string; // Optional, since API doesn't provide it
  avatar: string;
  assigned: number;
  completed: number;
}

export default function TeamAvailability() {
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await getTeamAvailability();
        const formatted = data.map((member: any) => ({
          name: member.name,
          email: "", // API doesn't return email
          avatar: '/assets/avatar.png',
          assigned: member.assigned_tasks,
          completed: member.task_completed,
        }));
        setTeamData(formatted);
      } catch (error) {
        console.error("Failed to fetch team availability:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
    <Card className="bg-white rounded-2xl border p-8 w-full max-w-full mx-auto">
      <CardHeader>
        <CardTitle>
          Team Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Assigned Tasks</TableHead>
              <TableHead>Completed Tasks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamData?.map((item, index) => {
              return (
                <TableRow></TableRow>
              )
            })}
          </TableBody>
        </Table>
        // <table className="w-full text-left text-base">
        //   <thead>
        //     <tr className="border-b text-gray-700">
        //       <th className="pb-3">Name</th>
        //       <th className="pb-3">Assigned Tasks</th>
        //       <th className="pb-3">Completed Tasks</th>
        //     </tr>
        //   </thead>
        //   <tbody>
        //     {teamData.map((member, index) => (
        //       <tr key={index} className="border-b last:border-none">
        //         <td className="py-5 flex items-center gap-5">
        //           <img
        //             src={member.avatar}
        //             alt={member.name}
        //             className="w-14 h-14 rounded-full object-cover"
        //           />
        //           <div>
        //             <p className="font-semibold text-lg">{member.name}</p>
        //             {member.email && (
        //               <p className="text-sm text-gray-500">{member.email}</p>
        //             )}
        //           </div>
        //         </td>
        //         <td className="py-5 text-gray-800 text-lg">{member.assigned}</td>
        //         <td className="py-5 text-gray-800 text-lg">{member.completed}</td>
        //       </tr>
        //     ))}
        //   </tbody>
        // </table>
      )}
      </CardContent>
    </Card>
  );
}
