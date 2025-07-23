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
  Calendar,
  CalendarDays,
  ChevronDown,
  EyeIcon,
  MoreHorizontal,
  Pencil,
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
  leadAgeing: string;
  expected_closing_date: Date;
  handover: boolean;
};

export type stageCounts = {
  lead_without_task: number;
  initial: number;
  "follow up": number;
  warm: number;
  dead: number;
  all: number;
};
export function DataTable({ search }: { search: string }) {
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
  const [stageCounts, setStageCounts] = React.useState("");
  const [tab, setTab] = React.useState(stageFromUrl || "lead_without_task");
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

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const isValidDate = (d: any) => {
    const parsed = new Date(d);
    return d && !isNaN(parsed.getTime());
  };
  const navigate = useNavigate();
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
          status={row.original.current_status?.name}
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

        const mobile = row.original?.contact_details?.mobile;
        const mobiles = Array.isArray(mobile) ? mobile : mobile ? [mobile] : [];
        const first = mobiles[0];
        const remaining = mobiles.slice(1);
        const remainingContent = mobile.slice(0);
        const remainingCount = remaining.length;
        const tooltipContent = remainingContent.join(", ");

        return (
          <div
            onClick={navigateToLeadProfile}
            className="cursor-pointer hover:text-[#214b7b]"
          >
            <div className="font-medium">{row?.original?.name}</div>

            {mobiles.length > 0 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex gap-1 text-sm text-gray-500 items-center">
                      <div>{first}</div>
                      {remainingCount > 0 && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5 cursor-default"
                        >
                          <Phone size={14} />+{remainingCount}
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  {remainingCount > 0 && (
                    <TooltipContent side="bottom" align="start">
                      {tooltipContent}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="text-sm text-gray-500">-</div>
            )}
          </div>
        );
      },
    },
    {
      id: "location_info",
      header: "Location Info",
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
      header: "Capacity (MW)",
      cell: ({ row }) => {
        const capacity = row.original.project_details?.capacity;
        return <div>{capacity ?? "N/A"}</div>;
      },
    },
    {
      accessorKey: "project_details.distance_from_substation.value",
      header: "Distance (Km)",
      cell: ({ row }) => {
        const distance =
          row.original.project_details?.distance_from_substation?.value;
        return <div>{distance ?? "N/A"}</div>;
      },
    },
    {
      accessorKey: "lastModifiedTask",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Inactive (Days) <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      sortingFn: (rowA, rowB) => {
        const a = isValidDate(rowA.original.lastModifiedTask)
          ? new Date(rowA.original.lastModifiedTask)
          : new Date(rowA.original.createdAt);

        const b = isValidDate(rowB.original.lastModifiedTask)
          ? new Date(rowB.original.lastModifiedTask)
          : new Date(rowB.original.createdAt);

        return a.getTime() - b.getTime();
      },
      cell: ({ row }) => {
        const modified = row.getValue("lastModifiedTask");
        const created = row.original.createdAt;

        const usedDate = isValidDate(modified)
          ? new Date(modified)
          : new Date(created);

        const now = new Date();
        let relativeRaw = formatDistanceToNow(usedDate, { addSuffix: true });
        if (!relativeRaw.toLowerCase().includes("ago")) {
          relativeRaw += " ago";
        }

        const relative =
          relativeRaw.charAt(0).toUpperCase() + relativeRaw.slice(1);
        const formatted = format(usedDate, "MMM d, yyyy");

        return (
          <div>
            {relative}{" "}
            <span className="text-gray-500 text-xs">({formatted})</span>
          </div>
        );
      },
    },
    {
      accessorKey: "leadAging",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Lead Aging <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      sortingFn: (rowA, rowB) => {
        const a = new Date(rowA.original.createdAt).getTime();
        const b = new Date(rowB.original.createdAt).getTime();
        return a - b;
      },
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        const expectedClosing = row.original.expected_closing_date;
        const leadId = row.original._id;

        const [pendingDate, setPendingDate] = React.useState<string | null>(
          null
        );
        const [open, setOpen] = React.useState(false);

        const createdDate = new Date(createdAt);
        let relativeRaw = formatDistanceToNow(createdDate, { addSuffix: true });
        if (!relativeRaw.toLowerCase().includes("ago")) {
          relativeRaw += " ago";
        }
        const relative =
          relativeRaw.charAt(0).toUpperCase() + relativeRaw.slice(1);

        const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const selected = e.target.value;
          if (selected) {
            setPendingDate(selected);
            setOpen(true);
          }
        };

        const handleConfirm = async () => {
          if (!pendingDate) return;
          try {
            await updateExpectedClosingDate(leadId, pendingDate);
            toast.success("Expected closing date updated");

            setTimeout(() => {
              location.reload();
            }, 300); // 300ms delay
          } catch (error: any) {
            toast.error(error.message || "Failed to update date");
          } finally {
            setOpen(false);
          }
        };

        return (
          <div>
            <div>{relative}</div>
            <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {expectedClosing && expectedClosing !== "-" ? (
                <span>{format(new Date(expectedClosing), "MMM d, yyyy")}</span>
              ) : (
                <>
                  <input
                    type="date"
                  
                    className="border rounded text-xs px-1 py-0.5"
                    onChange={handleDateChange}
                  />

                  <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to set the expected closing
                          date?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction
                          className="cursor-pointer"
                          onClick={handleConfirm}
                        >
                          Yes, Confirm
                        </AlertDialogAction>
                        <AlertDialogCancel className="cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
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
        const date = dateValue ? new Date(dateValue) : null;
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
                  navigate(`/leadProfile?id=${lead._id}&status=${lead.status}`);
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
          lead_without_task:
            stageFromUrl === "lead_without_task" ? "true" : undefined,
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
  }, [page, pageSize, search, fromDate, toDate, stageFromUrl]);

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

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-4 px-2">
        <div>
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="gap-2">
              <TabsTrigger className="cursor-pointer" value="lead_without_task">
                Lead W/O Task ({stageCounts?.lead_without_task || "0"})
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
              <TabsTrigger className="cursor-pointer" value="">
                All ({stageCounts?.all || "0"})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Right side: Rows per page and Columns */}
        <div className="flex items-center gap-4">
          {/* Rows per page */}
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
