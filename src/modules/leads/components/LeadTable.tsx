import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
("use client");

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  CalendarDays,
  ChevronDown,
  EyeIcon,
  MoreHorizontal,
  PencilIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getLeads,
  getLeadsCount,
  states,
  updateLeadPriorityBulk,
} from "@/services/leads/LeadService";
import { getAllUser } from "@/services/task/Task";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import Loader from "@/components/loader/Loader";
import { Badge } from "@/components/ui/badge";
import StatusCell from "./StatusCell";
import { useAuth } from "@/services/context/AuthContext";
import { Input } from "@/components/ui/input";

// Date range picker imports
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { addDays } from "date-fns";
// DateRangePickerComponent for Created Date filter
function DateRangePickerComponent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fromDateParam = searchParams.get("fromDate");
  const toDateParam = searchParams.get("toDate");

  // Parse initial values from URL params
  const initialRange = {
    startDate: fromDateParam
      ? new Date(fromDateParam)
      : addDays(new Date(), -30),
    endDate: toDateParam ? new Date(toDateParam) : new Date(),
    key: "selection",
  };

  const [state, setState] = React.useState([initialRange]);

  // Update URL params when range changes
  const handleChange = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setState([ranges.selection]);
    const updated = new URLSearchParams(searchParams);
    updated.set("fromDate", format(startDate, "yyyy-MM-dd"));
    updated.set("toDate", format(endDate, "yyyy-MM-dd"));
    updated.set("page", "1");
    setSearchParams(updated);
  };

  return (
    <DateRange
      ranges={state}
      onChange={handleChange}
      moveRangeOnFirstSelection={false}
      maxDate={new Date()}
      showMonthAndYearPickers={true}
      rangeColors={["#214b7b"]}
      direction="vertical"
    />
  );
}

export type Lead = {
  _id: string;
  id: string;
  current_status: {
    name: string;
    stage: string;
  };
  name: string;
  contact_details: {
    mobile: string[];
  };
  address: {
    district: string;
    village: string;
    state: string;
  };
  createdAt: Date | string;
  current_assigned: {
    user_id: {
      name: string;
    };
    status?: string;
  };
  project_details: {
    capacity?: string;
    land_type?: string;
    scheme?: string;
    tarrif?: string;
    available_land?: {
      unit: string;
      value: string;
    };
    distance_from_substation?: {
      unit: string;
      value: string;
    };
  };
  assigned_to?: {
    id: string;
    name: string;
  };
  leadAging?: string | number;
  inactivedate?: Date | string;
  expected_closing_date?: Date | string;
  status_of_handoversheet?: string;
  group_id?: {
    _id: string;
    group_code: string;
    group_name: string;
  };
  fromDate?: string;
  toDate?: string;
};

export function DataTable({
  search,
  onSelectionChange,
  group_id,
}: {
  search: string;
  onSelectionChange: (ids: string[]) => void;
  group_id: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFromUrl = searchParams.get("stage") || "";

  // const page = parseInt(searchParams.get("page") || "1");
  const [page, setPage] = React.useState(
    parseInt(searchParams.get("page") || "1")
  );
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const [tempPage, setTempPage] = React.useState(page);

  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<Lead[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [total, setTotal] = React.useState(0);
  const [users, setUsers] = React.useState<any[]>([]);
  const [uniqueState, setUniqueState] = React.useState<string[]>([]);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [refreshPriority, setRefreshPriority] = React.useState(0);
  const [stageCounts, setStageCounts] = React.useState<{
    initial?: number;
    "follow up"?: number;
    warm?: number;
    won?: number;
    dead?: number;
    all?: number;
  }>({});
  const [tab, setTab] = React.useState(stageFromUrl || "");
  const department = "BD";
  const [isLoading, setIsLoading] = React.useState(false);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({});
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  const navigate = useNavigate();
  const isFromGroup = React.useMemo(
    () => window.location.pathname === "/groupDetail",
    []
  );

  const groupInfoColumn = {
    id: "group_info",
    accessorFn: (row) => row?.name,
    header: "Group Name",
    cell: ({ row }) => {
      const navigateToGroupProfile = () => {
        navigate(`/groupDetail?id=${row.original.group_id?._id}`);
      };

      const code = row?.original?.group_id?.group_code || "";
      const name = row?.original?.group_id?.group_name;

      if (!code) return <div className="text-gray-500">-</div>;

      return (
        <div
          onClick={navigateToGroupProfile}
          className="cursor-pointer hover:text-[#214b7b]"
        >
          <div className="font-medium">{code}</div>
          <div className="text-sm text-gray-500">{name}</div>
        </div>
      );
    },
  };

  const MonthOptions = React.useMemo(
    () => [
      { value: "1", label: "Jan" },
      { value: "2", label: "Feb" },
      { value: "3", label: "Mar" },
      { value: "4", label: "Apr" },
      { value: "5", label: "May" },
      { value: "6", label: "Jun" },
      { value: "7", label: "Jul" },
      { value: "8", label: "Aug" },
      { value: "9", label: "Sep" },
      { value: "10", label: "Oct" },
      { value: "11", label: "Nov" },
      { value: "12", label: "Dec" },
    ],
    []
  );
  const Filters = {
    ClosingMonth: searchParams.get("ClosingMonth")?.split(",") || [],
    States: searchParams.get("State")?.split(",") || [],
    Handover: searchParams.get("handover") || "",
    inActiveDays: searchParams.get("inActiveDays") || "",
    LeadAging: searchParams.get("aging") || "",
    leadOwner: searchParams.get("name") || "",
    Priority: searchParams.get("priority") || "",
  };

  const updatefilter = (key: string, value: string | string[]) => {
    const newParams = new URLSearchParams(searchParams);
    if (Array.isArray(value)) {
      if (value.length > 0) {
        newParams.set(key, value.join(","));
      } else {
        newParams.delete(key);
      }
    } else {
      value ? newParams.set(key, value) : newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const Monthtoggle = (st: string) => {
    const newmonth = Filters.ClosingMonth.includes(st)
      ? Filters.ClosingMonth.filter((s) => s !== st)
      : [...Filters.ClosingMonth, st];

    updatefilter("ClosingMonth", newmonth);
  };

  const Statetoggle = (st: string) => {
    const newState = Filters.States.includes(st)
      ? Filters.States.filter((s) => s !== st)
      : [...Filters.States, st];

    updatefilter("State", newState);
  };
  // URL params
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  const StatesString = React.useMemo(() => {
    const labels = Filters.States;
    if (labels.length === 0) return "";
    return labels.join(",");
  }, [Filters.States, uniqueState]);

  const ClosingMonthString = React.useMemo(() => {
    const labels = Filters.ClosingMonth;
    if (labels.length === 0) return "";
    const map = new Map(MonthOptions.map((m) => [m.label, m.value] as const));
    return labels
      .map((lbl) => map.get(lbl))
      .filter(Boolean)
      .join(",");
  }, [Filters.ClosingMonth, MonthOptions]);

  const { user } = useAuth();

  const handleTransferComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handlePriorityChange = () => {
    setRefreshPriority((prev) => prev + 1);
  };

  const columns: ColumnDef<Lead>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "current_status.name",
      header: "Status",
      cell: ({ row }) => (
        <StatusCell
          leadId={row.original._id}
          currentStatus={row.original.current_status?.name}
          expected_closing_date={row.original?.expected_closing_date}
          onTransferCompleteStatus={handleTransferComplete}
        />
      ),
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Lead Id <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      id: "client_info",
      accessorFn: (row) => row?.name,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Client Info <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => {
        const navigateToLeadProfile = () => {
          navigate(`/leadProfile?id=${row.original._id}`);
        };

        const name = row?.original?.name || "";
        const truncatedName =
          name.length > 15 ? `${name.slice(0, 15)}...` : name;

        return (
          <div
            onClick={navigateToLeadProfile}
            className="cursor-pointer hover:text-[#214b7b]"
          >
            <div className="font-medium">{truncatedName}</div>
          </div>
        );
      },
    },
    ...(isFromGroup ? [] : [groupInfoColumn]),
    // Priority column only for 'follow up' tab
    ...(stageFromUrl === "follow up"
      ? [
          {
            accessorKey: "priority",
            header: "Priority",
            cell: function PriorityCell({ row }) {
              const PRIORITIES = ["highest", "high", "medium", "low"];
              const priority = row.original.priority;
              const leadId = row.original._id;
              let color = "bg-gray-300 text-gray-800";
              let label = "N/A";
              if (priority) {
                switch (priority) {
                  case "highest":
                    color = "bg-red-600 text-white";
                    label = "Highest";
                    break;
                  case "high":
                    color = "bg-red-300 text-red-900";
                    label = "High";
                    break;
                  case "medium":
                    color = "bg-orange-400 text-white";
                    label = "Medium";
                    break;
                  case "low":
                    color = "bg-green-500 text-white";
                    label = "Low";
                    break;
                  default:
                    color = "bg-gray-300 text-gray-800";
                    label =
                      priority.charAt(0).toUpperCase() + priority.slice(1);
                }
              }
              const [open, setOpen] = React.useState(false);
              const [loading, setLoading] = React.useState(false);
              const options = PRIORITIES.filter((p) => p !== priority);

              const handleChange = async (newPriority) => {
                setLoading(true);
                try {
                  await updateLeadPriorityBulk([leadId], newPriority);
                  setOpen(false);
                  handlePriorityChange();
                } catch (e) {
                  toast.error("Failed to update priority");
                } finally {
                  setLoading(false);
                }
              };

              return (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${color}`}
                      onClick={() => setOpen(true)}
                    >
                      {label}
                    </span>
                  </DialogTrigger>
                  <DialogContent>
                    <div className="font-semibold mb-2">Change Priority</div>
                    <div className="space-y-2">
                      {options.map((opt) => (
                        <Button
                          key={opt}
                          disabled={loading}
                          onClick={() => handleChange(opt)}
                          className="w-full #214b7b text-white cursor-pointer"
                        >
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            },
          },
        ]
      : []),
    {
      id: "location_info",
      header: "State",
      cell: ({ row }) => {
        const state = row.original?.address?.state || "";
        const scheme = row.original?.project_details?.scheme || "";

        const capitalizedState =
          state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();

        const capitalizedScheme = scheme
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return (
          <div>
            <div className="font-medium">{capitalizedState}</div>
            <div className="text-sm text-gray-500">{capitalizedScheme}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "project_details.capacity",
      header: "Capacity (MW AC)",
      cell: ({ row }) => {
        const capacity = row.original.project_details?.capacity;
        return <div>{capacity ?? "N/A"}</div>;
      },
    },
    {
      accessorKey: "inactivedate",
      header: "Inactive (Days)",
      cell: ({ row }) => {
        const dateStr = row.original.inactivedate;
        let display = "";

        if (!dateStr) return <div>-</div>;

        const inactiveDate = new Date(dateStr);
        const now = new Date();

        const diffTime = now - inactiveDate;
        const numDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (numDays < 7) {
          display = `${numDays} ${numDays <= 1 ? "day" : "days"}`;
        } else if (numDays < 30) {
          const weeks = Math.floor(numDays / 7);
          display = `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
        } else if (numDays < 365) {
          const months = Math.floor(numDays / 30);
          display = `${months} ${months === 1 ? "month" : "months"}`;
        } else {
          const years = Math.floor(numDays / 365);
          display = `${years} ${years === 1 ? "year" : "years"}`;
        }

        return <div>{display}</div>;
      },
    },
    {
      accessorKey: "leadAging",
      header: "Lead Aging",
      cell: ({ row }) => {
        const agingRaw = row.original.leadAging;
        const aging = Number(agingRaw);

        let display = "";

        if (aging < 7) {
          display = `${aging} ${aging === 1 ? "day" : "days"}`;
        } else if (aging >= 7 && aging < 30) {
          const weeks = Math.floor(aging / 7);
          display = `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
        } else {
          const months = Math.floor(aging / 30);
          display = `${months} ${months === 1 ? "month" : "months"}`;
        }

        return <div>{display}</div>;
      },
    },
    {
      accessorKey: "expectedClosing",
      header: "Exp Closing Date",
      cell: ({ row }) => {
        const expectedClosing = row.original.expected_closing_date;

        const isValidDate =
          expectedClosing &&
          typeof expectedClosing === "string" &&
          expectedClosing !== "-";

        return (
          <div className="flex items-center text-sm gap-1">
            {isValidDate ? (
              <>
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{format(new Date(expectedClosing), "MMM d, yyyy")}</span>
              </>
            ) : (
              <Badge variant="secondary">Yet to come</Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created Date <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue("createdAt");
        const date = dateValue
          ? new Date(dateValue as string | number | Date)
          : null;
        return <div>{date ? date.toLocaleDateString() : "-"}</div>;
      },
    },
    {
      accessorKey: "status_of_handoversheet",
      header: "Handover",
      cell: ({ row }) => {
        const leadId = row.original?._id;
        const status = row.original?.current_status?.name;
        const handoverStatus = row.original?.status_of_handoversheet;

        const handleClick = () => {
          navigate(`/leadProfile?id=${leadId}&tab=handover`);
        };

        if (status !== "won") {
          return <div className="text-gray-400 text-sm ">Waiting for won</div>;
        }

        return (
          <div
            className="flex cursor-pointer"
            onClick={handleClick}
            title={
              handoverStatus === "false" || handoverStatus === "Rejected"
                ? "Add Handover"
                : "View Handover"
            }
          >
            {handoverStatus === "false" || handoverStatus === "Rejected" ? (
              <PencilIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <EyeIcon className="w-4 h-4 text-green-600" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "current_assigned?.user_id?.name",
      header: "Lead Owner",
      cell: ({ row }) => (
        <div>{row.original.current_assigned?.user_id?.name}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                onClick={(e) => e.stopPropagation()}
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(lead.id);
                  toast.success(`Lead ID ${lead.id} copied successfully`);
                }}
              >
                Copy Lead ID
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/leadProfile?id=${lead._id}`);
                }}
              >
                View Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Debounce search input for API & URL sync
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search || ""), 300);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (debouncedSearch) updated.set("search", debouncedSearch);
      else updated.delete("search");
      return updated;
    });
  }, [debouncedSearch, setSearchParams]);

  // Data fetchers
  React.useEffect(() => {
    setIsLoading(true);
  }, [stageFromUrl]);

  React.useEffect(() => {
    const fetchLeads = async () => {
      try {
        const params: any = {
          stage: stageFromUrl,
          page,
          limit: pageSize,
          search: debouncedSearch,
          group_id: isFromGroup ? group_id : "",
          stateFilter: StatesString || "",
          lead_without_task:
            stageFromUrl === "lead_without_task"
              ? "true"
              : isFromGroup
              ? ""
              : undefined,
          handover_statusFilter: Filters.Handover || "",
          ClosingDateFilter: ClosingMonthString || "",
          leadAgingFilter: Filters.LeadAging || "",
          inactiveFilter: Filters.inActiveDays || "",
          priorityFilter: Filters.Priority || "",
          name: Filters.leadOwner || "",
        };
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        const res = await getLeads(params);
        setTotal(res?.total || 0);
        setData(res.leads || []);
      } catch (err) {
        console.error("Error fetching leads:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, [
    page,
    pageSize,
    debouncedSearch,
    fromDate,
    toDate,
    stageFromUrl,
    StatesString,
    Filters.Handover,
    Filters.LeadAging,
    Filters.inActiveDays,
    Filters.leadOwner,
    Filters.Priority,
    ClosingMonthString,
    refreshKey,
    isFromGroup,
    refreshPriority,
    group_id,
  ]);

  React.useEffect(() => {
    const fetchLeadCounts = async () => {
      try {
        const params: any = {
          search: debouncedSearch,
          group_id: isFromGroup ? group_id : "",
          stateFilter: StatesString || "",
          ClosingDateFilter: ClosingMonthString || "",
          lead_without_task:
            stageFromUrl === "lead_without_task"
              ? "true"
              : isFromGroup
              ? ""
              : undefined,
          handover_statusFilter: Filters.Handover || "",
          leadAgingFilter: Filters.LeadAging || "",
          inactiveFilter: Filters.inActiveDays || "",
          priorityFilter: Filters.Priority || "",
          name: Filters.leadOwner || "",
        };
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        const res = await getLeadsCount(params);
        setStageCounts(res.stageCounts || {});
      } catch (err) {
        console.error("Error fetching lead counts:", err);
      }
    };
    fetchLeadCounts();
  }, [
    debouncedSearch,
    fromDate,
    toDate,
    StatesString,
    stageFromUrl,
    Filters.Handover,
    Filters.LeadAging,
    Filters.inActiveDays,
    Filters.leadOwner,
    Filters.Priority,
    ClosingMonthString,
    isFromGroup,
    group_id,
  ]);

  // Pagination state driven by URL
  const [pagination, setPagination] = React.useState({
    pageIndex: page - 1,
    pageSize,
  });
  React.useEffect(() => {
    setPagination({ pageIndex: page - 1, pageSize });
  }, [page, pageSize]);

  const totalPages = React.useMemo(
    () => Math.ceil((total || 0) / pageSize) || 0,
    [total, pageSize]
  );

  // Table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Emit selected ids when selection changes
  React.useEffect(() => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((r) => r.original._id);
    onSelectionChange(selectedIds);
  }, [rowSelection, data, onSelectionChange, table]);

  const isActiveLeadWithoutTask =
    window.location.pathname === "/leads" &&
    searchParams.get("stage") === "lead_without_task";

  const daysOptions = [
    { value: "7", label: "1 week" },
    { value: "14", label: "2 weeks" },
    { value: "21", label: "3 weeks" },
    { value: "30", label: "1 month" },
    { value: "90", label: "3 months" },
    { value: "180", label: "6 months" },
    { value: "270", label: "9 months" },
    { value: "365", label: "1 year" },
    { value: "730", label: "2 years" },
    { value: "1095", label: "3 years" },
  ];

  const totalFilters =
    Filters.States.length +
    Filters.ClosingMonth.length +
    (Filters.Handover ? 1 : 0) +
    (Filters.LeadAging ? 1 : 0) +
    (Filters.inActiveDays ? 1 : 0) +
    (Filters.leadOwner ? 1 : 0) +
    (fromDate || toDate ? 1 : 0) +
    (Filters.Priority ? 1 : 0);

  const handleTabChange = (value: string) => {
    setTab(value);
    React.startTransition(() => {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set("stage", value);
        p.set("page", "1");
        return p;
      });
    });
  };

  const handlePageChange = (direction: "prev" | "next") => {
    const newPage = direction === "next" ? page + 1 : page - 1;
    setPage(newPage);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", newPage.toString());
      return params;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      let newPage = Number(tempPage);

      if (newPage < 1) newPage = 1;
      if (newPage > totalPages) newPage = totalPages;

      setPage(newPage);
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", newPage.toString());
        return params;
      });
      setOpen(false);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newLimit.toString());
    params.set("page", "1");
    setSearchParams(params);
  };

  // bootstrap dropdown data
  React.useEffect(() => {
    (async () => {
      try {
        const res = await getAllUser({ department });
        setUsers(res.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await states();
        setUniqueState(res.data || []);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    })();
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div
      className={`${isFromGroup ? "w-[calc(69vw)] overflow-y-auto" : "w-full"}`}
    >
      <div className="flex justify-between items-center py-4 px-2">
        {!isFromGroup && !isActiveLeadWithoutTask && (
          <div>
            <Tabs value={tab} onValueChange={handleTabChange}>
              <TabsList className="gap-2">
                <TabsTrigger className="cursor-pointer" value="">
                  All ({stageCounts?.all ?? 0})
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="initial">
                  Initial ({stageCounts?.initial ?? 0})
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="follow up">
                  Follow Up ({stageCounts?.["follow up"] ?? 0})
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="warm">
                  Warm ({stageCounts?.warm ?? 0})
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="won">
                  Won ({stageCounts?.won ?? 0})
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="dead">
                  Dead ({stageCounts?.dead ?? 0})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative inline-block">
                <Button variant="outline" className="cursor-pointer pr-8">
                  Filters
                </Button>
                {totalFilters > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                    {totalFilters}
                  </span>
                )}
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-60">
              {/* Created Date Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span>Filter by Created Date</span>
                  {(fromDate || toDate) && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                      1
                    </span>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <div className="flex flex-col gap-2 p-2">
                    {/* Date Range Picker */}
                    <DateRangePickerComponent />
                    <Button
                      variant="outline"
                      className="mt-2 cursor-pointer"
                      onClick={() => {
                        const updated = new URLSearchParams(searchParams);
                        updated.delete("fromDate");
                        updated.delete("toDate");
                        updated.set("page", "1");
                        setSearchParams(updated);
                      }}
                    >
                      Clear Filter
                    </Button>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {/* State Filter */}
              {/* Priority Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span>Priority Filter</span>
                  {Filters.Priority && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">1</span>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {["highest", "high", "medium", "low"].map((priority) => (
                    <DropdownMenuCheckboxItem
                      key={priority}
                      className="cursor-pointer capitalize"
                      checked={Filters.Priority === priority}
                      onCheckedChange={(checked) => {
                        if (checked) updatefilter("priority", priority);
                        else updatefilter("priority", "");
                      }}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuCheckboxItem
                    checked={false}
                    className="text-red-500 hover:bg-red-100 cursor-pointer"
                    onCheckedChange={() => {
                      const updated = new URLSearchParams(searchParams);
                      updated.delete("priority");
                      updated.set("page", "1");
                      setSearchParams(updated);
                    }}
                  >
                    Clear Filter
                  </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span>Filter by State</span>
                  {Filters.States.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                      {Filters.States.length}
                    </span>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                  {Array.isArray(uniqueState) &&
                    uniqueState.map((opt) => (
                      <DropdownMenuCheckboxItem
                        className="cursor-pointer capitalize"
                        key={opt}
                        onCheckedChange={() => {
                          Statetoggle(opt);
                        }}
                        checked={Filters.States.includes(opt)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {opt}
                      </DropdownMenuCheckboxItem>
                    ))}
                  <DropdownMenuRadioItem
                    value=""
                    className="text-red-500 hover:bg-red-100 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      const updated = new URLSearchParams(searchParams);
                      updated.delete("State");
                      updated.set("page", "1");
                      setSearchParams(updated);
                    }}
                  >
                    Clear Filter
                  </DropdownMenuRadioItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Handover Filter */}
              {(tab === "" || tab === "won") && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <span>Handover Filter</span>
                    {Filters.Handover && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                        1
                      </span>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {["pending", "inprocess", "completed"].map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        className="cursor-pointer capitalize"
                        checked={Filters.Handover === status}
                        onCheckedChange={(checked) => {
                          if (checked) updatefilter("handover", status);
                          else updatefilter("handover", "");
                        }}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuCheckboxItem
                      checked={false}
                      className="text-red-500 hover:bg-red-100 cursor-pointer"
                      onCheckedChange={() => {
                        const updated = new URLSearchParams(searchParams);
                        updated.delete("handover");
                        updated.set("page", "1");
                        setSearchParams(updated);
                      }}
                    >
                      Clear Filter
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}

              {/* Lead Aging Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span>Lead Aging Filter</span>
                  {Filters.LeadAging && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                      1
                    </span>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {daysOptions.map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      className="cursor-pointer"
                      checked={Filters.LeadAging === opt.value}
                      onCheckedChange={(checked) => {
                        if (checked) updatefilter("aging", opt.value);
                        else updatefilter("aging", "");
                      }}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {opt.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuCheckboxItem
                    checked={false}
                    className="text-red-500 hover:bg-red-100 cursor-pointer"
                    onCheckedChange={() => {
                      const updated = new URLSearchParams(searchParams);
                      updated.delete("aging");
                      updated.set("page", "1");
                      setSearchParams(updated);
                    }}
                  >
                    Clear Filter
                  </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Inactive Days Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span>Inactive Days Filter</span>
                  {Filters.inActiveDays && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                      1
                    </span>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {daysOptions.map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      className="cursor-pointer"
                      checked={Filters.inActiveDays === opt.value}
                      onCheckedChange={(checked) => {
                        if (checked) updatefilter("inActiveDays", opt.value);
                        else updatefilter("inActiveDays", "");
                      }}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {opt.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuCheckboxItem
                    checked={false}
                    className="text-red-500 hover:bg-red-100 cursor-pointer"
                    onCheckedChange={() => {
                      const updated = new URLSearchParams(searchParams);
                      updated.delete("inActiveDays");
                      updated.set("page", "1");
                      setSearchParams(updated);
                    }}
                  >
                    Clear Filter
                  </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Closing month filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span>Filter By Closing Date</span>
                  {Filters.ClosingMonth.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                      {Filters.ClosingMonth.length}
                    </span>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {MonthOptions.map((opt) => (
                    <DropdownMenuCheckboxItem
                      className="cursor-pointer capitalize"
                      key={opt.value}
                      onCheckedChange={() => {
                        Monthtoggle(opt.label);
                      }}
                      checked={Filters.ClosingMonth.includes(opt.label)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {opt.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuRadioItem
                    value=""
                    className="text-red-500 hover:bg-red-100 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      const updated = new URLSearchParams(searchParams);
                      updated.delete("ClosingMonth");
                      updated.set("page", "1");
                      setSearchParams(updated);
                    }}
                  >
                    Clear Filter
                  </DropdownMenuRadioItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {(user?.name === "admin" ||
                user?.name === "IT Team" ||
                user?.department === "BD" ||
                user?.name === "Deepak Manodi") && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <span>Lead Owner Filter</span>
                    {Filters.leadOwner && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                        1
                      </span>
                    )}
                  </DropdownMenuSubTrigger>

                  <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                    {/* All */}
                    <DropdownMenuCheckboxItem
                      checked={!Filters.leadOwner}
                      onCheckedChange={(checked) => {
                        if (checked) updatefilter("name", ""); // clear to 'All'
                      }}
                      onSelect={(e) => e.preventDefault()}
                    >
                      All
                    </DropdownMenuCheckboxItem>

                    {/* Owners */}
                    {users.map((usr) => {
                      const id = String(usr?._id);
                      const isSelected = String(Filters.leadOwner) === id;
                      return (
                        <DropdownMenuCheckboxItem
                          key={id}
                          className="cursor-pointer"
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              // select this owner
                              updatefilter("name", id);
                            } else if (isSelected) {
                              // unselect only if this was selected
                              updatefilter("name", "");
                            }
                          }}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {usr.name}
                        </DropdownMenuCheckboxItem>
                      );
                    })}

                    {/* Clear */}
                    <DropdownMenuCheckboxItem
                      checked={false}
                      className="text-red-500 hover:bg-red-100 cursor-pointer"
                      onCheckedChange={() => {
                        const updated = new URLSearchParams(searchParams);
                        updated.delete("name"); // same key!
                        updated.set("page", "1");
                        setSearchParams(updated);
                      }}
                    >
                      Clear Filter
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Columns Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="cursor-pointer" variant="outline">
                Columns <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  let label = column.id;
                  if (column.id === "id") label = "Lead Id";
                  else if (column.id === "name") label = "Name";
                  else if (typeof column.columnDef.header === "string")
                    label = column.columnDef.header as string;

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize cursor-pointer"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <label htmlFor="limit">Rows per page:</label>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => handleLimitChange(Number(v))}
            >
              <SelectTrigger className="w-24 h-9 cursor-pointer">
                <SelectValue placeholder="Select limit" />
              </SelectTrigger>
              <SelectContent>
                {[1, 5, 10, 20, 50, 100].map((limit) => (
                  <SelectItem
                    className="cursor-pointer"
                    key={limit}
                    value={limit.toString()}
                  >
                    {limit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-md border max-h-[calc(100vh-290px)] overflow-y-auto">
        <Table>
          <TableHeader className="bg-gray-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers
                  .filter((header) => {
                    // Only show handover column when at least one row is in 'won'
                    if (header.column.id === "status_of_handoversheet") {
                      return data.some(
                        (lead) => lead.current_status?.name === "won"
                      );
                    }
                    return true;
                  })
                  .map((header) => (
                    <TableHead className="text-left" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getPaginationRowModel().rows?.length ? (
              table.getPaginationRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row
                    .getVisibleCells()
                    .filter((cell) => {
                      if (cell.column.id === "status_of_handoversheet") {
                        return data.some(
                          (lead) => lead.current_status?.name === "won"
                        );
                      }
                      return true;
                    })
                    .map((cell) => (
                      <TableCell className="text-left" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange("prev")}
          disabled={page === 1}
          className="cursor-pointer"
        >
          Previous
        </Button>
        <span>Page</span>
        <span
          className="cursor-pointer"
          onClick={() => {
            setTempPage(page);
            setOpen(true);
          }}
        >
          {open ? (
            <Input
              type="number"
              value={tempPage}
              autoFocus
              onChange={(e) => setTempPage(Number(e.target.value))}
              onKeyDown={handleKeyDown}
              onBlur={() => setOpen(false)}
              className="w-16 h-6 text-center"
            />
          ) : (
            page
          )}
        </span>
        <span>of page {totalPages}</span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange("next")}
          disabled={page === totalPages || totalPages === 0}
          className="cursor-pointer"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
