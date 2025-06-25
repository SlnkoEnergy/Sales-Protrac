import { useEffect, useState } from "react";
import { getTeamAvailability } from "@/services/leads/Dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TeamMember {
  name: string;
  email?: string;
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
          email: "",
          avatar: "/assets/avatar.png",
          assigned: member.assigned_tasks,
          completed: member.completed_tasks,
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
        <CardTitle>Team Availability</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <Table className="min-w-full">
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="bg-white">Name</TableHead>
                  <TableHead className="bg-white">Assigned Tasks</TableHead>
                  <TableHead className="bg-white">Completed Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamData.map((member, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{member.name}</p>
                          {member.email && (
                            <p className="text-xs text-gray-500">
                              {member.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.assigned}</TableCell>
                    <TableCell>{member.completed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
