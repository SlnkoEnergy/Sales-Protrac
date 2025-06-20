import avatar from "@/assets/avatar.png";

interface TeamMember {
  name: string;
  email: string;
  avatar: string;
  assigned: number;
  completed: number;
}

const teamData: TeamMember[] = [
  {
    name: "Amitabh Bachchan",
    email: "amitabh@kbc.com",
    avatar: avatar,
    assigned: 50,
    completed: 20,
  },
  {
    name: "Ram Kapoor",
    email: "ram@kapoor.com",
    avatar: avatar,
    assigned: 10,
    completed: 7,
  },
  {
    name: "Jaya Bachchan",
    email: "jaya@amitabh.com",
    avatar: avatar,
    assigned: 20,
    completed: 11,
  },
];

export default function TeamAvailability() {
  return (
    <div className="bg-white rounded-2xl shadow-md border p-8 w-full max-w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6">Team Availability</h2>
      <table className="w-full text-left text-base">
        <thead>
          <tr className="border-b text-gray-700">
            <th className="pb-3">Name</th>
            <th className="pb-3">Assigned Tasks</th>
            <th className="pb-3">Completed Tasks</th>
          </tr>
        </thead>
        <tbody>
          {teamData.map((member, index) => (
            <tr key={index} className="border-b last:border-none">
              <td className="py-5 flex items-center gap-5">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-lg">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </td>
              <td className="py-5 text-gray-800 text-lg">{member.assigned}</td>
              <td className="py-5 text-gray-800 text-lg">{member.completed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
