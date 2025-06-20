import { Search, Filter } from "lucide-react";

export default function SearchBar() {
  return (
    <div className=" bg-[#e5e5e5] w-screen px-4 py-3 flex justify-between items-center shadow-sm">
      {/* Search Input */}
      <div className="flex items-center bg-white rounded-md px-4 py-2 w-1/3 shadow-sm">
        <Search className="text-gray-400 mr-2" size={18} />
        <input
          type="text"
          placeholder="Search Leads"
          className="w-full bg-transparent focus:outline-none text-sm text-gray-700"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 text-sm text-gray-800 font-medium">
        {/* Filter with red dot */}
        <div className="relative flex items-center gap-1 cursor-pointer">
          <Filter size={18} />
          <span>Filter</span>
          <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
            1
          </span>
        </div>

        {/* Dropdown (Last 2 weeks) */}
        <div className="flex items-center gap-1 cursor-pointer">
          <span>Last 2 weeks</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Action buttons */}
        <span className="cursor-pointer text-black hover:underline">+ Add Lead</span>
        <span className="cursor-pointer text-black hover:underline">+ Add Task</span>
      </div>
    </div>
  );
}
