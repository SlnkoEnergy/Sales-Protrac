// src/components/layout/Header.tsx
import {
  Bell,
  Mail,
  Settings,
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Menu,
  X,
  Trash,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { getNotification, toggleViewTask } from "@/services/task/Task";

export default function Header() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const navigate = useNavigate();

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

  return (
    <div className="bg-[#1F487C] w-full h-16 flex items-center justify-between px-4 sm:px-6 shadow-md sticky top-0 z-50 relative">
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
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </div>
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => navigate(`/leads?pageSize=20&page=1`)}
        >
          <Users size={18} />
          <span>Leads</span>
        </div>
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => navigate("/tasks")}
        >
          <ClipboardList size={18} />
          <span>Tasks</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer">
          <Calendar size={18} />
          <span className="cursor-pointer" onClick={() => navigate("/meeting")}>
            Meetings
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserRound size={18} />
          <span className="cursor-pointer" onClick={() => navigate("/team")}>Team</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-6 text-white relative">
        <Settings size={18} />

        <div className="relative">
          {/* Bell Icon with Notification Count Badge */}
          <div className="relative">
            <Bell
              size={18}
              onClick={toggleNotifications}
              className="cursor-pointer"
            />
            {notifications.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[13px] px-1.5 rounded-full leading-none">
                {notifications.length}
              </span>
            )}
          </div>

          {/* Notification Dropdown */}
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

        <Mail size={18} />

        <button
          onClick={handleLogout}
          className="bg-blue-500 text-white px-4 py-1 rounded-md font-medium cursor-pointer"
        >
          Logout
        </button>

        <div className="h-10 border-l border-white/30 mx-2"></div>

        <div className="flex items-center gap-2">
          <img
            src="/assets/avatar.png"
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <div className="text-sm leading-tight">
            <div className="font-semibold">{user?.name || "User"}</div>
            <div className="text-gray-200 text-xs">{user?.email || ""}</div>
          </div>
        </div>
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
