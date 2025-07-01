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
  ChevronLeft,
  Clock,
  MoreHorizontal,
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { getAllTask } from "@/services/task/Task";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

export type Team = {
  _id: string;
  lead_id: string;
  leadname: string;
  priority: "high" | "medium" | "low";
  title: string;
  assigned_to: string;
  type: "todo" | "meeting" | "call" | "sms" | "email";
  current_status: "draft" | "pending" | "completed" | "in progress";
  deadline: Date;
};

export function TeamTable() {
  const navigate = useNavigate();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [data, setData] = React.useState<Team[]>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<Team>[] = [
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
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        const color =
          {
            low: "text-green-600",
            medium: "text-orange-500",
            high: "text-red-600",
          }[priority] || "text-gray-600";

        return (
          <div className={`lowercase font-medium ${color}`}>{priority}</div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "lead_id",
      header: "Lead ID",
      cell: ({ row }) => {
        const lead = row.getValue("lead_id") as any;
        return <div>{lead?.id}</div>;
      },
    },
    {
      accessorKey: "leadname",
      header: "Lead Name",
      cell: ({ row }) => {
        const lead = row.getValue("lead_id") as any;
        return <div>{lead?.c_name}</div>;
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
        const names = assignees?.map((a) => a.name).join(", ");
        return <div className="capitalize">{names}</div>;
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
            draft: "text-blue-600",
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
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const team = row.original;
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
                onClick={() => navigator.clipboard.writeText(team.lead_id)}
              >
                Copy Member ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Member Detail</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await getAllTask();
        setData(res.data);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    fetchTasks();
  }, []);

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <Button className="cursor-pointer" onClick={() => navigate(-1)}>
        <ChevronLeft />
      </Button>
      <div className="flex items-center py-4">
        <div className="flex gap-4">
          <Input
            placeholder="Filter Priority..."
            value={
              (table.getColumn("priority")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("priority")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => navigate("/addtask")}
          >
            + Add Task
          </Button>
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
                  className="cursor-pointer"
                  onClick={() => navigate(`/viewtask?id=${row.original._id}`)}
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
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
