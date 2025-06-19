import { Bell, Mail, Settings, Home, ClipboardList } from "lucide-react";
import avatar from "@/assets/avatar.png"; 
import slnkoLogo from "../../assets/slnko_white_logo.png";

export default function Header() {
  return (
    <div className="bg-[#1F487C] w-screen h-16 flex items-center justify-between px-6 shadow-md fixed top-0 left-0 z-50">
      {/* Left section: Logo & Title */}
      <div className="flex items-center gap-4">
        <img src={slnkoLogo} alt="Slnko Logo" className="h-15" />
        <div className="h-10 border-l border-white/30 mx-2"></div>
        <span className="text-white text-xl font-medium">CRM</span>
      </div>

      {/* Center section: Menu Items */}
      <div className="flex gap-8 items-center text-white">
        <div className="flex items-center gap-1">
          <Home size={18} />
          <span>Dashboard</span>
        </div>
        <div className="flex items-center gap-1">
          <Home size={18} />
          <span>Leads</span>
        </div>
        <div className="flex items-center gap-1">
          <ClipboardList size={18} />
          <span>Tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <Home size={18} />
          <span>Meetings</span>
        </div>
      </div>

      {/* Right section: Icons, Logout & Profile */}
      <div className="flex items-center gap-6 text-white">
        <Settings size={18} />
        <Bell size={18} />
        <Mail size={18} />
        <button className="bg-blue-500 text-white px-4 py-1 rounded-md font-medium">
          Logout
        </button>
        <div className="h-10 border-l border-white/30 mx-2"></div>
        <div className="flex items-center gap-2">
          <img src={avatar} alt="Profile" className="w-8 h-8 rounded-full" />
          <div className="text-sm leading-tight">
            <div className="font-semibold">Deepak</div>
            <div className="text-gray-200 text-xs">deepak@gmail.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
