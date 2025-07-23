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
  ChevronDown,
  Clock,
  MoreHorizontal,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllTask } from "@/services/task/Task";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DateRange } from "react-date-range";
import { format, parseISO } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export type Task = {
  _id: string;
  lead: {
    _id: string;
    name: string;
    id: string;
  };
  leadname: string;
  priority: "high" | "medium" | "low";
  title: string;
  assigned_user: {
    name: string;
  };
  type: "todo" | "meeting" | "call" | "sms" | "email";
  current_status: "pending" | "completed" | "in progress";
  deadline: Date;
  user_id: {
    name: string;
    _id: string;
  };
};

export function TaskTable({
  search,
  onSelectionChange,
}: {
  search: string;
  onSelectionChange: (ids: string[]) => void;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const statusFromUrl = searchParams.get("status") || "";
  const [total, setTotal] = React.useState(0);

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "100");
  const [tab, setTab] = React.useState(statusFromUrl || "pending");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [data, setData] = React.useState<Task[]>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [showPicker, setShowPicker] = React.useState(false);
  const [fromDeadline, setFromDeadline] = React.useState<string | null>(null);
  const [toDeadline, setToDeadline] = React.useState<string | null>(null);
  const fromDeadlineParam = searchParams.get("fromDeadline");
  const toDeadlineParam = searchParams.get("toDeadline");
  const [range, setRange] = React.useState([
    {
      startDate: fromDeadlineParam ? parseISO(fromDeadlineParam) : null,
      endDate: toDeadlineParam ? parseISO(toDeadlineParam) : null,
      key: "selection",
    },
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const columns: ColumnDef<Task>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
      accessorKey: "priority",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const order = { low: 0, high: 2, medium: 1 };

        const a = rowA.getValue(columnId) || "";
        const b = rowB.getValue(columnId) || "";

        const aIndex =
          order[(a as string).toLowerCase()] ?? Number.MAX_SAFE_INTEGER;
        const bIndex =
          order[(b as string).toLowerCase()] ?? Number.MAX_SAFE_INTEGER;

        return aIndex - bIndex;
      },
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        const color =
          {
            low: "text-green-600",
            medium: "text-orange-500",
            high: "text-red-600",
          }[priority] || "text-gray-600";

        return (
          <div className={`capitalize font-medium ${color}`}>{priority}</div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div
          onClick={() => navigate(`/viewtask?id=${row.original._id}`)}
          className="capitalize cursor-pointer hover:text-[#214b7b]"
        >
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "lead",
      header: "Lead ID",
      cell: ({ row }) => {
        const lead = row.getValue("lead") as any;
        return <div>{lead?.id}</div>;
      },
    },
    {
      accessorKey: "lead",
      header: "Lead Name",
      cell: ({ row }) => {
        const lead = row.getValue("lead") as any;
        const navigate = useNavigate();

        const navigateToLeadProfile = () => {
          navigate(`/leadProfile?id=${row.original.lead._id}`);
        };

        return (
          <div
            onClick={navigateToLeadProfile}
            className="cursor-pointer hover:text-[#214b7b]"
          >
            {lead?.name}
          </div>
        );
      },
    },

    {
      accessorKey: "assigned_to",
      header: () => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>
              <Users className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span>Assignees</span>
        </div>
      ),
      cell: ({ row }) => {
        const assignees = row.getValue("assigned_to") as { name: string }[];
        if (!assignees || assignees.length === 0) return "-";

        const first = assignees[0]?.name;
        const remainingCount = assignees.length - 1;

        const tooltipContent = (
          <div className="flex flex-col gap-1">
            {assignees.map((a, i) => (
              <div className="flex gap-2">
                <User size={14} /> <span key={i}>{a.name}</span>
              </div>
            ))}
          </div>
        );

        return (
          <div className="capitalize">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex gap-1">
                    <div>{first}</div>
                    <div className="cursor-default">
                      {remainingCount > 0 && (
                        <Badge
                          variant="outline"
                          className="cursor-default text-xs px-2 py-0.5"
                        >
                          +{remainingCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                {remainingCount > 0 && (
                  <TooltipContent side="bottom" align="start">
                    {tooltipContent}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
    {
      accessorKey: "deadline",
      header: ({ column }) => (
        <button
          className="flex items-center gap-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Clock className="h-4 w-4" />
          Deadline
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("deadline");
        const formatted =
          value && typeof value === "string"
            ? format(new Date(value), "dd MMMM yyyy")
            : "";
        return <div>{formatted}</div>;
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId)).getTime();
        const dateB = new Date(rowB.getValue(columnId)).getTime();
        return dateA - dateB;
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("type")}</div>
      ),
    },
    {
      accessorKey: "current_status",
      header: "Stage",
      cell: ({ row }) => {
        const status = row.getValue("current_status") as string;

        const statusColor =
          {
            pending: "text-red-600",
            "in progress": "text-orange-500",
            completed: "text-green-600",
          }[status] || "text-gray-600";

        return (
          <div className={`capitalize font-medium ${statusColor}`}>
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("type")}</div>
      ),
    },
    {
      accessorKey: "user_id",
      header: "Created By",
      cell: ({ row }) => {
        const lead = row.getValue("user_id") as any;
        return <div>{lead?.name}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const task = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(task.lead.id)}
              >
                Copy Lead ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate(`/viewtask?id=${row.original._id}`)}
              >
                View Task Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigate(`/leadProfile?id=${row.original.lead._id}`);
                }}
              >
                View Lead Detail
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const handleDateChange = (from: string, to: string) => {
    setFromDeadline(from);
    setToDeadline(to);

    const updatedParams = new URLSearchParams(searchParams.toString());

    updatedParams.set("fromDeadline", from);
    updatedParams.set("toDeadline", to);

    setSearchParams(updatedParams);
  };
  const handleSelect = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    setRange([ranges.selection]);

    if (startDate && endDate) {
      const from = new Date(startDate).toISOString();
      const to = new Date(endDate).toISOString();
      handleDateChange(from, to);
    }
  };

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const params = {
          status: statusFromUrl,
          page,
          limit: pageSize,
          search,
          fromDeadline: fromDeadline,
          toDeadline: toDeadline,
        };
        const res = await getAllTask(params);
        setTotal(res?.total || 0);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    fetchTasks();
  }, [statusFromUrl, page, pageSize, search, fromDeadline, toDeadline]);

  const handlePageChange = (direction: "prev" | "next") => {
    const newPage = direction === "next" ? page + 1 : page - 1;
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set("page", newPage.toString());
      return params;
    });
  };

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

  const handleTabChange = (value: string) => {
    setTab(value);
    React.startTransition(() => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("status", value);
        return newParams;
      });
    });
  };

  const [pagination, setPagination] = React.useState({
    pageIndex: page - 1,
    pageSize: pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  React.useEffect(() => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original._id);

    onSelectionChange(selectedIds);
  }, [table.getSelectedRowModel().rows, onSelectionChange]);

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newLimit.toString());
    params.set("page", "1");
    setSearchParams(params);
  };

  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-4 px-2">
        <div>
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="gap-2">
              <TabsTrigger className="cursor-pointer" value="pending">
                Pending
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="in progress">
                In Progress
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="completed">
                Completed
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-wrap items-center gap-4 justify-between py-2">
          {/* Deadline Date Range Picker */}
          <div className="relative inline-block text-left" ref={pickerRef}>
            <button
              onClick={() => setShowPicker((prev) => !prev)}
              className="border px-3 py-1.5 rounded-md text-sm flex items-center gap-2 bg-white shadow-sm"
            >
              <span>
                {range[0].startDate && range[0].endDate
                  ? `${format(range[0].startDate, "MMM d")} - ${format(
                      range[0].endDate,
                      "MMM d"
                    )}`
                  : "Select Deadline"}
              </span>
            </button>

            {showPicker && (
              <div className="absolute z-50 mt-2 bg-white rounded-md shadow-lg">
                <DateRange
                  editableDateInputs={true}
                  onChange={handleSelect}
                  moveRangeOnFirstSelection={false}
                  ranges={range}
                  className="border rounded-md"
                />
              </div>
            )}
          </div>

          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <label htmlFor="limit" className="text-sm font-medium">
              Rows per page:
            </label>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => handleLimitChange(Number(value))}
            >
              <SelectTrigger className="w-24 h-9 text-sm">
                <SelectValue placeholder="Select limit" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((limit) => (
                  <SelectItem
                    key={limit}
                    value={limit.toString()}
                    className="text-sm"
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
              <Button
                variant="outline"
                className="text-sm flex items-center gap-1"
              >
                Columns <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const colHeader = column.columnDef.header;
                  const label =
                    column.id === "id"
                      ? "Lead ID"
                      : column.id === "name"
                      ? "Name"
                      : typeof colHeader === "string"
                      ? colHeader
                      : column.id;

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      className="capitalize text-sm"
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
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="bg-gray-400" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
        <div className="space-x-2">
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
    </div>
  );
}
