// src/components/layout/Header.tsx
import { Bell, Mail, Settings, Home, ClipboardList, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Header() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const navigate = useNavigate();

  const toggleDrawer = () => setShowDrawer(!showDrawer);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("You have been logged out.");
    navigate("/login");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Loaded user from localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    } else {
      console.warn("No user data found in localStorage");
    }
  }, []);

  return (
    <div className="bg-[#1F487C] w-full h-16 flex items-center justify-between px-4 sm:px-6 shadow-md sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-4">
        <img src="/assets/slnko_white_logo.png" alt="Slnko Logo" className="h-14 w-14" />
        <div className="hidden sm:block h-10 border-l border-white/30 mx-2"></div>
        <span className="text-white text-xl font-medium hidden sm:block">CRM</span>
      </div>

      <div className="sm:hidden text-white">
        <Menu size={24} onClick={toggleDrawer} />
      </div>

      <div className="hidden sm:flex gap-8 items-center text-white">
        <div className="flex items-center gap-1"><Home size={18} /><span>Dashboard</span></div>
        <div className="flex items-center gap-1"><Home size={18} /><span>Leads</span></div>
        <div className="flex items-center gap-1"><ClipboardList size={18} /><span>Tasks</span></div>
        <div className="flex items-center gap-1"><Home size={18} /><span>Meetings</span></div>
      </div>

      <div className="hidden sm:flex items-center gap-6 text-white">
        <Settings size={18} />
        <Bell size={18} />
        <Mail size={18} />
        <button
          onClick={handleLogout}
          className="bg-blue-500 text-white px-4 py-1 rounded-md font-medium"
        >
          Logout
        </button>
        <div className="h-10 border-l border-white/30 mx-2"></div>
        <div className="flex items-center gap-2">
          <img src="/assets/avatar.png" alt="Profile" className="w-8 h-8 rounded-full" />
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
              <div className="flex items-center gap-2"><Home size={18} /><span>Dashboard</span></div>
              <div className="flex items-center gap-2"><Home size={18} /><span>Leads</span></div>
              <div className="flex items-center gap-2"><ClipboardList size={18} /><span>Tasks</span></div>
              <div className="flex items-center gap-2"><Home size={18} /><span>Meetings</span></div>
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
