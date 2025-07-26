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
import Loader from "@/components/loader/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { getGroups } from "@/services/group/GroupService";

export type Group = {
  _id: string;
  group_code: string;
  group_name: string;
  contact_details: {
    mobile: string[];
  };
  address: {
    district: string;
    village: string;
    state: string;
  };
  createdAt: Date;
  project_details: {
    capacity: string;
    scheme: string;
  };
  createdBy: {
    _id: string;
    name: string;
  };
  current_status: {
    status: string;
  };
  left_capacity: {
    type: string;
  };
};

export function GroupTable({
  search,
  onSelectionChange,
}: {
  search: string;
  onSelectionChange: (ids: string[]) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFromUrl = searchParams.get("stage") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "100");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [data, setData] = React.useState<Group[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [total, setTotal] = React.useState(0);
  const [users, setUsers] = React.useState([]);
  const department = "BD";
  const [isLoading, setIsLoading] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  

  const navigate = useNavigate();
  const columns: ColumnDef<Group>[] = [
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
  accessorKey: "group_code",
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Group Id <ArrowUpDown />
    </Button>
  ),
  cell: ({ row }) => (
    <Badge style={{ backgroundColor: "#214b7b", color: "white" }}>
      {row.getValue("group_code")}
    </Badge>
  ),
},
    {
  id: "client_info",
  accessorFn: (row) => row?.group_name,
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Group Name <ArrowUpDown />
    </Button>
  ),
  cell: ({ row }) => {
    const navigateToLeadProfile = () => {
      navigate(`/groupDetail?id=${row.original._id}`);
    };

    const fullName = row?.original?.group_name || "";
    const displayedName =
      fullName.length > 15 ? fullName.slice(0, 15) + "..." : fullName;

    const mobile = row.original?.contact_details?.mobile;
    const mobiles = Array.isArray(mobile) ? mobile : mobile ? [mobile] : [];
    const first = mobiles[0];
    const remaining = mobiles.slice(1);
    const remainingCount = remaining?.length;
    const tooltipContent = remaining.join(", ");

    return (
      <div
        onClick={navigateToLeadProfile}
        className="cursor-pointer hover:text-[#214b7b]"
      >
        <div className="font-medium">{displayedName}</div>

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
}
,
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
      header: "Total Capacity (MW AC)",
      cell: ({ row }) => {
        const capacity = parseFloat(row.original.project_details?.capacity);
        return <div>{isNaN(capacity) ? "N/A" : capacity.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "left_capacity",
      header: "Left Capacity (MW AC)",
      cell: ({ row }) => {
        const capacity = parseFloat(row.original?.left_capacity);
        return <div>{isNaN(capacity) ? "N/A" : capacity.toFixed(2)}</div>;
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
      accessorKey: "createdBy?.name",
      header: "Created By",
      cell: ({ row }) => <div>{row.original.createdBy?.name}</div>,
    },
    {
  accessorKey: "createdBy?.name",
  header: "Status",
  cell: ({ row }) => {
    const status = row.original.current_status?.status || "unknown";
    const capitalized = status.charAt(0).toUpperCase() + status.slice(1);
    const isOpen = status.toLowerCase() === "open";

    return (
      <Badge
        style={{
          backgroundColor: isOpen ? "#d1fae5" : "#fee2e2", 
          color: isOpen ? "#065f46" : "#991b1b", 
        }}
      >
        {capitalized}
      </Badge>
    );
  },
},
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const group = row.original;
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
                  navigator.clipboard.writeText(group.group_code);
                  toast.success(
                    `group ID ${group.group_code} copied successfully`
                  );
                }}
              >
                Copy group ID
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/groupDetail?id=${row.original._id}`);
                }}
              >
                View Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  React.useEffect(() => {
    setIsLoading(true);
  }, [stageFromUrl]);

  React.useEffect(() => {
    const fetchGroups = async () => {
      try {
        const params = {
          page,
          limit: pageSize,
          search,
        };

        const res = await getGroups(params);
        setTotal(res?.totalCount || 0);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [page, pageSize, search]);

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

  React.useEffect(() => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original._id);

    onSelectionChange(selectedIds);
  }, [table.getSelectedRowModel().rows, onSelectionChange]);

  if (isLoading) return <Loader />;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-4 px-2">
        {/* Right side: Rows per page and Columns */}
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
                if (column.id === "group_code") label = "Group Id";
                else if (column.id === "client_info") label = "Group Name";
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

      <div className="rounded-md border max-h-[calc(100vh-290px)] overflow-y-auto">
        <Table>
          <TableHeader className="bg-gray-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
                  {row.getVisibleCells().map((cell) => (
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
                  colSpan={columns?.length}
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
