import {
  Bell,
  Settings,
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Menu,
  X,
  Trash,
  LogOut,
  User2,
  File,
  Group,
  WorkflowIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { getNotification, toggleViewTask } from "@/services/task/Task";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Header() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchParams] = useSearchParams();
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState<{ name: string; emp_id: string } | null>(
    null
  );
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveHandover = location.pathname === "/handover";
  const isActiveTask = location.pathname === "/tasks";
  const isActiveLead =
    location.pathname === "/leads" &&
    searchParams.get("stage") !== "lead_without_task";
  const isActiveLeadWithoutTask =
    location.pathname === "/leads" &&
    searchParams.get("stage") === "lead_without_task";
  const isActiveDashboard = location.pathname === "/";
  const isActiveGroup = location.pathname === "/group";

  const toggleDrawer = () => setShowDrawer(!showDrawer);
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getNotification();
      setNotifications(data);
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("You have been logged out.");
    navigate("/login");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  const handleDelete = async (_id: string) => {
    try {
      await toggleViewTask(_id);
      setNotifications((prev) => prev.filter((note) => note._id !== _id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const PickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        PickerRef.current &&
        !PickerRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-[#1F487C] w-full h-16 flex items-center justify-between px-4 sm:px-6 shadow-md  top-0 z-50 relative">
      <div className="flex items-center gap-2 sm:gap-4">
        <img
          src="/assets/slnko_white_logo.png"
          alt="Slnko Logo"
          className="h-14 w-14"
        />
        <div className="hidden sm:block h-10 border-l border-white/30 mx-2"></div>
        <span className="text-white text-xl font-medium hidden sm:block">
          CRM
        </span>
      </div>

      <div className="sm:hidden text-white">
        <Menu size={24} onClick={toggleDrawer} />
      </div>

      <div className="hidden sm:flex gap-8 items-center text-white">
        <div
          className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md transition ${isActiveDashboard ? "bg-white text-[#214b7b] font-medium" : ""
            }`}
          onClick={() => navigate("/")}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </div>
        <div
          className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md transition ${isActiveGroup ? "bg-white text-[#214b7b] font-medium" : ""
            }`}
          onClick={() => navigate("/group")}
        >
          <Group size={18} />
          <span>Groups</span>
        </div>
        <div
          className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md transition ${isActiveLead ? "bg-white text-[#214b7b] font-medium" : ""
            }`}
          onClick={() => navigate("/leads")}
        >
          <Users size={18} />
          <span>Leads</span>
        </div>
        <div
          className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md transition ${isActiveLeadWithoutTask ? "bg-white text-[#214b7b] font-medium" : ""
            }`}
          onClick={() => navigate("/leads?stage=lead_without_task")}
        >
          <WorkflowIcon size={18} />
          <span>Leads W/O Task</span>
        </div>
        <div
          className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md transition ${isActiveTask ? "bg-white text-[#214b7b] font-medium" : ""
            }`}
          onClick={() => navigate("/tasks?status=pending")}
        >
          <ClipboardList size={18} />
          <span>Tasks</span>
        </div>
        <div
          className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded-md transition ${isActiveHandover ? "bg-white text-[#214b7b] font-medium" : ""
            }`}
          onClick={() => navigate("/handover?statusFilter=Rejected")}
        >
          <File size={18} />
          <span>Handover</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-6 text-white relative">
        <div className="relative" ref={PickerRef}>
          <div className="relative">
            <Bell
              size={18}
              onClick={() => {
                toggleNotifications;
                setShowNotifications((prev) => !prev);
              }}
              className="cursor-pointer"
            />
            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[13px] px-1.5 rounded-full leading-none">
                {notifications.length}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="absolute top-8 right-0 w-80 bg-white text-black rounded-lg shadow-xl z-50">
              <div className="px-4 py-2 border-b font-semibold text-gray-700 flex justify-between">
                <span>Notifications</span>
                <Button
                  onClick={toggleNotifications}
                  className="cursor-pointer"
                  variant="ghost"
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((note, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between px-4 py-3 hover:bg-gray-100 border-b border-gray-200"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/viewtask?id=${note._id}`)}
                      >
                        <div className="text-sm font-medium">{note.title}</div>
                        <div className="text-xs text-gray-500">
                          {note.description}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {note.time}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 mt-1"
                        onClick={() => handleDelete(note._id)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src="/assets/avatar.png"
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64 shadow-md">
            <DropdownMenuLabel className="py-2 gap-2">
              <div className="font-medium flex justify-between items-center gap-2 text-sm leading-tight">
                <div className="flex items-center gap-2">
                  <User2 className="w-4 h-4" />
                  {user?.name || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.emp_id || "user@example.com"}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 flex items-center gap-2 font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Drawer */}
      {showDrawer && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 sm:hidden"
          onClick={toggleDrawer}
        >
          <div
            className="absolute top-0 left-0 w-64 h-full bg-white text-black shadow-md p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 font-semibold text-lg">Menu</div>
            <div className="space-y-4">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/")}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </div>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/leads")}
              >
                <Users size={18} />
                <span>Leads</span>
              </div>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/tasks")}
              >
                <ClipboardList size={18} />
                <span>Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>Meetings</span>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-[#1F487C] text-white px-4 py-2 mt-6 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
