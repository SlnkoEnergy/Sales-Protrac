"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
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
  transferLead,
  updateExpectedClosingDate,
} from "@/services/leads/LeadService";
import { getAllUser } from "@/services/task/Task";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, formatDistanceToNow } from "date-fns";
import Loader from "@/components/loader/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import StatusCell from "./StatusCell";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

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
  createdAt: Date;
  current_assigned: {
    user_id: {
      name: string;
    };
    status: {
      string;
    };
  };
  project_details: {
    capacity: string;
    land_type: string;
    scheme: string;
    tarrif: string;
    available_land: {
      unit: string;
      value: string;
    };
    distance_from_substation: {
      unit: string;
      value: string;
    };
  };
  assigned_to: {
    id: string;
    name: string;
  };
  lastModifiedTask: Date;
  leadAging: string;
  inactiveDays: string;
  expected_closing_date: Date;
  handover: boolean;
  group_code: string;
  group_name: string;
  group_id: string;
  fromDate?: string;
  toDate?: string;
};

const allStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

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
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "100");
  const [open, setOpen] = React.useState(false);
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [data, setData] = React.useState<Lead[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [total, setTotal] = React.useState(0);
  const [users, setUsers] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [stageCounts, setStageCounts] = React.useState<{
    initial?: number;
    "follow up"?: number;
    warm?: number;
    won?: number;
    dead?: number;
    all?: number;
  }>({});
  const [tab, setTab] = React.useState(stageFromUrl || "");
  const [handoverStatus, setHandoverStatus] = React.useState("");
  const [leadAging, setLeadAging] = React.useState("");
  const [inactiveDays, setInactiveDays] = React.useState("");
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(
    null
  );
  const [selectedAssignTo, setSelectedAssignTo] = React.useState<string | null>(
    null
  );
  const [leadModel, setLeadModel] = React.useState<string | null>(null);
  const department = "BD";
  const [isLoading, setIsLoading] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [selectedStates, setSelectedStates] = React.useState<string[]>([]);
  const [leadOwner, setLeadOwner] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const navigate = useNavigate();
  const isFromGroup = location.pathname === "/groupDetail";

  const groupInfoColumn = {
    id: "group_info",
    accessorFn: (row) => row?.name,
    header: "Group Name",
    cell: ({ row }) => {
      const navigateToGroupProfile = () => {
        navigate(`/groupDetail?id=${row.original.group_id}`);
      };

      const code = row?.original?.group_code || "";
      const name = row?.original?.group_name;

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
    ,
    {
      accessorKey: "project_details.capacity",
      header: "Capacity (MW AC)",
      cell: ({ row }) => {
        const capacity = row.original.project_details?.capacity;
        return <div>{capacity ?? "N/A"}</div>;
      },
    },
    {
      accessorKey: "inactiveDays",
      header: "Inactive (Days)",
      cell: ({ row }) => {
        const days = row.original.inactiveDays;
        let display = "";

        const numDays = Number(days);

        if (numDays < 7) {
          const rounded = Math.floor(numDays);
          display = `${rounded} ${rounded <= 1 ? "day" : "days"}`;
        } else if (numDays >= 7 && numDays < 30) {
          const weeks = Math.floor(numDays / 7);
          display = `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
        } else if (numDays >= 30 && numDays < 365) {
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
      accessorKey: "handover",
      header: "Handover",
      cell: ({ row }) => {
        const isHandoverDone = row.original?.handover;
        const leadId = row.original?._id;
        const status = row.original?.current_status?.name;

        if (status !== "won") return null;

        const handleClick = () => {
          navigate(`/leadProfile?id=${leadId}&tab=handover`);
        };

        return (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={handleClick}
            title={isHandoverDone ? "View Handover" : "Add Handover"}
          >
            {isHandoverDone === true ? (
              <EyeIcon className="w-4 h-4 text-green-600" />
            ) : isHandoverDone === false ? (
              <PencilIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <span className="text-xs text-gray-400">NA</span>
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

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAssignTo(row.original?.assigned_to.id);
                  setLeadModel(row.original?.current_status?.name);
                  setSelectedLeadId(row.original._id);
                  setOpen(true);
                }}
                className="cursor-pointer"
              >
                Transfer Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const state = searchParams.get("stateFilter");
  const Handoverfilter = searchParams.get("handover");
  const LeadAgingFilter = searchParams.get("aging") || "";
  const InActiveDays = searchParams.get("inActiveDays");
  const NameFilter = searchParams.get("name");

  React.useEffect(() => {
    setIsLoading(true);
  }, [stageFromUrl]);

  React.useEffect(() => {
    const fetchLeads = async () => {
      try {
        const params = {
          stage: stageFromUrl,
          page,
          limit: pageSize,
          search,
          group_id: isFromGroup ? group_id : "",
          stateFilter: state || "",
          lead_without_task:
            stageFromUrl === "lead_without_task"
              ? "true"
              : isFromGroup
              ? ""
              : undefined,
          handover_statusFilter: Handoverfilter || "",
          leadAgingFilter: LeadAgingFilter || "",
          inactiveFilter: InActiveDays || "",
          name: NameFilter || "",
        };

        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;

        const res = await getLeads(params);
        setTotal(res?.total || 0);
        setData(res.leads);
        setStageCounts(res.stageCounts);
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
    search,
    fromDate,
    toDate,
    stageFromUrl,
    state,
    Handoverfilter,
    LeadAgingFilter,
    InActiveDays,
    NameFilter
  ]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  React.useEffect(() => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (debouncedSearch) {
        updated.set("search", debouncedSearch);
      } else {
        updated.delete("search");
      }
      return updated;
    });
  }, [debouncedSearch]);

  const handlePageChange = (direction: "prev" | "next") => {
    const newPage = direction === "next" ? page + 1 : page - 1;
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", newPage.toString());
      return params;
    });
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newLimit.toString());
    params.set("page", "1");
    setSearchParams(params);
  };

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const params = {
          department: department,
        };
        const res = await getAllUser(params);
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    fetchUser();
  }, []);

  const handleTabChange = (value: string) => {
    setTab(value);
    React.startTransition(() => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("stage", value);
        return newParams;
      });
    });
  };

  React.useEffect(() => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);

      // Lead Aging Filter
      if (leadAging) {
        updated.set("aging", leadAging);
      } else {
        updated.delete("aging");
      }

      // Handover Status Filter
      if (handoverStatus) {
        updated.set("handover", handoverStatus);
      } else {
        updated.delete("handover");
      }

      // State Filter
      if (selectedStates.length > 0) {
        updated.set("stateFilter", selectedStates.join(","));
      } else {
        updated.delete("stateFilter");
      }

      // Inactive Days Filter
      if (inactiveDays) {
        updated.set("inActiveDays", inactiveDays);
      } else {
        updated.delete("inActiveDays");
      }

      if (leadOwner) updated.set("name", leadOwner);
      else updated.delete("name");

      return updated;
    });
  }, [selectedStates, handoverStatus, leadAging, inactiveDays, leadOwner]);

  const handleTransferLead = async () => {
    if (!selectedLeadId || !selectedUser) {
      toast.error("Missing lead or user selection");
      return;
    }

    try {
      await transferLead(selectedLeadId, selectedUser._id);
      toast.success("Lead transferred successfully");

      setOpen(false);

      setTimeout(() => {
        location.reload();
      }, 300);
    } catch (error: any) {
      console.error("Transfer lead failed:", error);
      const message =
        error?.response?.data?.message || "Failed to transfer lead";
      toast.error(message);
    }
  };

  const [pagination, setPagination] = React.useState({
    pageIndex: page - 1,
    pageSize: pageSize,
  });

  const totalPages = Math.ceil(total / pageSize);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) return <Loader />;
  const isActiveLeadWithoutTask =
    location.pathname === "/leads" &&
    searchParams.get("stage") === "lead_without_task";
  const toggleState = (state: string) => {
    let updatedStates = [...selectedStates];

    if (updatedStates.includes(state)) {
      updatedStates = updatedStates.filter((s) => s !== state);
    } else {
      updatedStates.push(state);
    }

    setSelectedStates(updatedStates);

    // Update URL
    const newParams = new URLSearchParams(searchParams.toString());
    if (updatedStates.length > 0) {
      newParams.set("stateFilter", updatedStates.join(","));
    } else {
      newParams.delete("stateFilter");
    }
    setSearchParams(newParams);
  };

  const totalFilters =
    selectedStates.length + (handoverStatus ? 1 : 0) + (leadAging ? 1 : 0);

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
                  All ({stageCounts?.all || "0"})
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="initial">
                  Initial ({stageCounts?.initial || "0"})
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="follow up">
                  Follow Up ({stageCounts?.["follow up"] || "0"})
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="warm">
                  Warm ({stageCounts?.warm || "0"})
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="won">
                  Won ({stageCounts?.won || "0"})
                </TabsTrigger>
                <TabsTrigger className="cursor-pointer" value="dead">
                  Dead ({stageCounts?.dead || "0"})
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
              {/* State Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Filter by State</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                  {allStates.map((state) => (
                    <DropdownMenuCheckboxItem
                      key={state}
                      checked={selectedStates.includes(state)}
                      onCheckedChange={() => toggleState(state)}
                    >
                      {state}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Handover Filter */}
              {(tab === "" || tab === "won") && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Handover Filter
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={handoverStatus}
                      onValueChange={(value) => {
                        setHandoverStatus(value);

                        const newParams = new URLSearchParams(
                          searchParams.toString()
                        );
                        if (value) {
                          newParams.set("handover", value);
                        } else {
                          newParams.delete("handover");
                        }
                        setSearchParams(newParams);
                      }}
                    >
                      <DropdownMenuRadioItem value="pending">
                        Pending
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="in process">
                        In-Procress
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="completed">
                        Completed
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}

              {/* Lead Aging Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Lead Aging Filter
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={leadAging}
                    onValueChange={setLeadAging}
                  >
                    <DropdownMenuRadioItem value="1">
                      1 day
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="3">
                      3 days
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="5">
                      5 days
                    </DropdownMenuRadioItem>

                    <DropdownMenuRadioItem value="7">
                      1 week
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="14">
                      2 weeks
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="21">
                      3 weeks
                    </DropdownMenuRadioItem>

                    <DropdownMenuRadioItem value="30">
                      1 month
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="90">
                      3 months
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="180">
                      6 months
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="270">
                      9 months
                    </DropdownMenuRadioItem>

                    <DropdownMenuRadioItem value="365">
                      1 year
                    </DropdownMenuRadioItem>

                    <DropdownMenuRadioItem value="730">
                      2 years
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="1095">
                      3 years
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {/* Inactive Days Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Inactive Days Filter
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={inactiveDays}
                    onValueChange={setInactiveDays}
                  >
                    <DropdownMenuRadioItem value="1">
                      1 day
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="3">
                      3 days
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="5">
                      5 days
                    </DropdownMenuRadioItem>

                    <DropdownMenuRadioItem value="7">
                      1 week
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="14">
                      2 weeks
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="21">
                      3 weeks
                    </DropdownMenuRadioItem>

                    <DropdownMenuRadioItem value="30">
                      1 month
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="90">
                      3 months
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="180">
                      6 months
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="270">
                      9 months
                    </DropdownMenuRadioItem>

                    <DropdownMenuRadioItem value="365">
                      1 year
                    </DropdownMenuRadioItem>

                    <DropdownMenuRadioItem value="730">
                      2 years
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="1095">
                      3 years
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Lead Owner Filter
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                  <DropdownMenuRadioGroup
                    value={leadOwner}
                    onValueChange={(value) => {
                      setLeadOwner(value);

                      const newParams = new URLSearchParams(
                        searchParams.toString()
                      );
                      if (value) {
                        newParams.set("name", value);
                      } else {
                        newParams.delete("name");
                      }
                      setSearchParams(newParams);
                    }}
                  >
                    <DropdownMenuRadioItem value="">All</DropdownMenuRadioItem>
                    {users.map((user) => (
                      <DropdownMenuRadioItem key={user._id} value={user.name}>
                        {user.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
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
                    label = column.columnDef.header;

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
              onValueChange={(value) => handleLimitChange(Number(value))}
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
                    // Hide the column if it's "handover" and no won leads exist
                    if (header.column.id === "handover") {
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
                      if (cell.column.id === "handover") {
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
        <span>
          Page {page} of page {totalPages}
        </span>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select BD Member to Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users
              .filter((user) => user._id !== selectedAssignTo)
              .map((user) => (
                <div
                  key={user._id}
                  className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedUser(user);
                    setConfirmOpen(true);
                  }}
                >
                  {user.name}
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to transfer to <strong>{selectedUser?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransferLead}
              className="cursor-pointer"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
