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
import { logout } from "@/services/auth/Auth";
import { NovuProvider, PopoverNotificationCenter, useNotifications } from "@novu/notification-center";
import { useAuth } from "@/services/context/AuthContext";

export default function Header() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchParams] = useSearchParams();
  const [notifications, setNotifications] = useState([]);
  const [subscribeId, setSubscribeId] = useState("");
  const [user, setUser] = useState<{ name: string; emp_id: string } | null>(
    null
  );
  const location = useLocation();
  const navigate = useNavigate();
  
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
      );
      
      const payload = JSON.parse(jsonPayload);
      return payload.userId || null;
    } catch (err) {
      console.error("Token decode error:", err);
      return null;
    }
  };
  const ID = getUserIdFromToken();
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

  useEffect(() => {
    const fetchData = async () => {
      const data = await getNotification();
      setNotifications(data);
      setSubscribeId(ID)
    };
    fetchData();
  }, []);

  useEffect(() => {
    setSubscribeId(ID);
  }, [])

  const handleLogout = async () => {
    try {
      localStorage.clear();
      toast.success("You have been Logged Out");
      navigate("/login");
    } catch (error) {
      toast.error('Logout Failed')
    }
  };

  const userData = useAuth();
  console.log({userData})
  useEffect(() => {
    if (userData.user) {
      setUser({
        name: userData.user?.name,
        emp_id: userData.user?.emp_id,
      });
    }
  }, [userData.user]);



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
          className="h-24 w-24 mt-3"
        />
        <div className="hidden sm:block h-16 border-1 border-white/30 mx-2"></div>
        <span className="text-white text-xl font-medium hidden sm:block">
          SALES
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
        <NovuProvider
          subscriberId={subscribeId}
          applicationIdentifier={import.meta.env.VITE_NOVU_IDENTIFIER}
        >
          <div className="flex justify-end p-4">
            <PopoverNotificationCenter colorScheme="light" position="bottom-end"

              onNotificationClick={(notification) => {
                const link = notification?.payload?.link;
                if (link) {
                  console.log("hello", notification.payload.link);
                  navigate(notification.payload.link);
                }

              }}

            >
              {({ unseenCount }) => (
                <Button variant="ghost" className="relative">
                  <Bell className="h-5 w-5" />
                  {(unseenCount ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1 text-xs">
                      {unseenCount ?? 0}
                    </span>
                  )}
                </Button>
              )}
            </PopoverNotificationCenter>
          </div>
        </NovuProvider>

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
