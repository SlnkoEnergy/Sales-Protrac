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
import { getLeads, states } from "@/services/leads/LeadService";
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
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [data, setData] = React.useState<Lead[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [total, setTotal] = React.useState(0);
  const [users, setUsers] = React.useState([]);
  const [uniqueState, setUniqueState] = React.useState<string[]>([]);
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

  console.log("the data " ,data);

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

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  const user = getCurrentUser().name;

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
    NameFilter,
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

  React.useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await states();
        setUniqueState(res.data);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    };

    fetchStates();
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

  const [pagination, setPagination] = React.useState({
    pageIndex: page - 1,
    pageSize: pageSize,
  });

  React.useEffect(() => {
    setPagination({
      pageIndex: page - 1,
      pageSize: pageSize,
    });
  }, [page, pageSize]);

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

  React.useEffect(() => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original._id);

    onSelectionChange(selectedIds);
  }, [table.getSelectedRowModel().rows, onSelectionChange]);

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
    selectedStates.length +
    (handoverStatus ? 1 : 0) +
    (leadAging ? 1 : 0) +
    (inactiveDays ? 1 : 0);

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
    { value: "custom", label: "Custom" },
  ];

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
                <DropdownMenuSubTrigger className="cursor-pointer">
                  Filter by State
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                  {Array.isArray(uniqueState) &&
                    uniqueState.map((state) => (
                      <DropdownMenuCheckboxItem
                        className="cursor-pointer capitalize"
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
                  <DropdownMenuSubTrigger className="cursor-pointer">
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
                      <DropdownMenuRadioItem
                        className="cursor-pointer"
                        value="pending"
                      >
                        Pending
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        className="cursor-pointer"
                        value="in process"
                      >
                        In-Procress
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        className="cursor-pointer"
                        value="completed"
                      >
                        Completed
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem
                        value=""
                        className="text-red-500 hover:bg-red-100 cursor-pointer"
                        onClick={() => {
                          const updated = new URLSearchParams(searchParams);
                          updated.delete("handover");
                          updated.set("page", "1");
                          setSearchParams(updated);
                        }}
                      >
                        Clear Filter
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}

              {/* Lead Aging Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  Lead Aging Filter
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={leadAging}
                    onValueChange={setLeadAging}
                  >
                    {daysOptions.map((opt) => (
                      <DropdownMenuRadioItem
                        className="cursor-pointer"
                        key={opt.value}
                        value={opt.value}
                      >
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}

                    <DropdownMenuRadioItem
                      value=""
                      className="text-red-500 hover:bg-red-100 cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        const updated = new URLSearchParams(searchParams);
                        updated.delete("aging");
                        updated.set("page", "1");
                        setSearchParams(updated);
                        setLeadAging("");
                      }}
                    >
                      Clear Filter
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Inactive Days Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  Inactive Days Filter
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={inactiveDays}
                    onValueChange={setInactiveDays}
                  >
                    {daysOptions.map((opt) => (
                      <DropdownMenuRadioItem
                        className="cursor-pointer"
                        key={opt.value}
                        value={opt.value}
                      >
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}

                    <DropdownMenuRadioItem
                      value=""
                      className="text-red-500 hover:bg-red-100 cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        const updated = new URLSearchParams(searchParams);
                        updated.delete("inActiveDays");
                        updated.set("page", "1");
                        setSearchParams(updated);
                        setInactiveDays("");
                      }}
                    >
                      Clear Filter
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {(getCurrentUser().name === "admin" ||
                getCurrentUser().name === "IT Team" ||
                getCurrentUser().name === "Deepak Manodi") && (
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
                      <DropdownMenuRadioItem value="">
                        All
                      </DropdownMenuRadioItem>
                      {users.map((user) => (
                        <DropdownMenuRadioItem key={user._id} value={user.name}>
                          {user.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
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
    </div>
  );
}
