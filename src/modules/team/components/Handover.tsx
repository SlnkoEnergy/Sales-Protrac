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
import { ArrowUpDown, ChevronDown, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { format } from "date-fns";
import { getAllHandover } from "@/services/leads/LeadService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type Handover = {
  _id: string;
  id: string;
  is_locked: string;
  customer_details: {
    customer: string;
    p_group: string;
    state: string;
  };
  leadDetails: {
    _id: string;
    id: string;
  };
  createdAt: Date;
  project_kwp: string;
  proposed_dc_capacity: string;
  status_of_handoversheet: string;
};

export function HandoverTable({
  search,
  onSelectionChange,
}: {
  search: string;
  onSelectionChange: (ids: string[]) => void;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [data, setData] = React.useState<Handover[]>([]);
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const statusFromUrl = searchParams.get("statusFilter") || "";
  const [tab, setTab] = React.useState(statusFromUrl || "Rejected");
  const [total, setTotal] = React.useState(0);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "100");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<Handover>[] = [
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
      accessorKey: "leadDetails.id",
      header: "Lead Id",
      cell: ({ row }) => (
        <div
          className="capitalize cursor-pointer text-black hover:text-[#214b7b]"
          onClick={() =>
            navigate(
              `/leadProfile?id=${row.original?.leadDetails?._id}&tab=handover`
            )
          }
        >
          {row.original.leadDetails?.id || "-"}
        </div>
      ),
    },
    {
      accessorKey: "customer_details.customer",
      header: "Name",
      cell: ({ row }) => (
        <div
          className="capitalize cursor-pointer text-black hover:text-[#214b7b]"
          onClick={() =>
            navigate(
              `/leadProfile?id=${row.original?.leadDetails?._id}&tab=handover`
            )
          }
        >
          {row.original.customer_details?.customer || "-"}
        </div>
      ),
    },
    {
      accessorKey: "customer_details.p_group",
      header: "Group",
      cell: ({ row }) => {
        const pGroup = row.original.customer_details?.p_group;
        return <div>{pGroup?.id || pGroup || "-"}</div>;
      },
    },
    {
      accessorKey: "customer_details.state",
      header: "State",
      cell: ({ row }) => {
        const state = row.original.customer_details?.state;
        return <div>{state || "-"}</div>;
      },
    },
    {
      accessorKey: "project_kwp",
      header: "Capacity (kWp)",
      cell: ({ row }) => {
        const kwp = row.getValue("project_kwp");
        const proposed = row.original?.proposed_dc_capacity;

        if (!kwp && !proposed) {
          return <div className="capitalize">NA</div>;
        }

        return (
          <div className="capitalize">
            {kwp || "-"} / {proposed || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <button
          className="flex items-center gap-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Clock className="h-4 w-4" />
          Created At
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const value = row.getValue("createdAt");
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
      accessorKey: "status_of_handoversheet",
      header: "Status",
      cell: ({ row }) => {
        const rawStatus = row.getValue("status_of_handoversheet") as string;
        const comment = row.original?.comment;
        const status = rawStatus === "draft" ? "Submitted" : rawStatus;

        const statusColor =
          {
            Rejected: "text-red-600",
            Approved: "text-green-600",
            Submitted: "text-blue-500",
          }[status] || "text-gray-600";

        const statusText = (
          <div
            className={`capitalize cursor-pointer font-medium ${statusColor}`}
          >
            {status}
          </div>
        );

        if (status === "Rejected" && comment) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>{statusText}</TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="start"
                  className="max-w-xs whitespace-pre-line"
                >
                  {comment}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return statusText;
      },
    },
  ];

  const [pagination, setPagination] = React.useState({
    pageIndex: page - 1,
    pageSize: pageSize,
  });
  const totalPages = Math.ceil(total / pageSize);
  React.useEffect(() => {
    const fetchHandover = async () => {
      try {
        const params = {
          status: statusFromUrl,
          search,
          page,
          limit: pageSize,
        };
        const res = await getAllHandover(params);
        setData(res.data);
        setTotal(res?.meta?.total || 0);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    fetchHandover();
  }, [search, pageSize, statusFromUrl]);

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

  const handleTabChange = (value: string) => {
    setTab(value);
    React.startTransition(() => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("statusFilter", value);
        return newParams;
      });
    });
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-4 px-2">
        <div>
          <Tabs value={tab} onValueChange={handleTabChange}>
            <TabsList className="gap-2">
              <TabsTrigger className="cursor-pointer" value="Rejected">
                Rejected
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="draft">
                Submitted
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-wrap items-center gap-4 justify-between py-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
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
