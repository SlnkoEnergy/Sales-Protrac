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
  Check,
  ChevronDown,
  ChevronLeft,
  MoreHorizontal,
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getLeads, transferLead} from "@/services/leads/LeadService";
import { getAllUser } from "@/services/task/Task";
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@radix-ui/react-dropdown-menu";
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
} from "@/components/ui/alert-dialog";
export type Lead = {
  _id: string;
  id: string;
  status: "initial" | "followUp" | "warm" | "won" | "dead";
  leadId: string;
  c_name: string;
  mobile: string;
  state: string;
  scheme: string;
  capacity: string;
  distance: string;
  entry_date: string;
  submitted_by: string;
  email: string;
  assigned_to: {
    id: string;
    name: string;
  };
};

export function DataTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFromUrl = searchParams.get("stage");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [data, setData] = React.useState<Lead[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [total, setTotal] = React.useState(0);
  const [users, setUsers] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null);
  const [selectedAssignTo, setSelectedAssignTo] = React.useState<string | null>(null);
  const [leadModel, setLeadModel] = React.useState<string | null>(null);
  const department = "BD";
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const navigate = useNavigate();
  const [selectedStages, setSelectedStages] = React.useState<string>(
    stageFromUrl || ""
  );
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
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
      accessorKey: "c_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("c_name")}</div>,
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
      cell: ({ row }) => <div>{row.getValue("mobile")}</div>,
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => <div>{row.getValue("state")}</div>,
    },
    {
      accessorKey: "scheme",
      header: "Scheme",
      cell: ({ row }) => <div>{row.getValue("scheme")}</div>,
    },
    {
      accessorKey: "capacity",
      header: "Capacity (MW)",
      cell: ({ row }) => <div>{row.getValue("capacity")}</div>,
    },
    {
      accessorKey: "distance",
      header: "Distance (KM)",
      cell: ({ row }) => <div>{row.getValue("distance")}</div>,
    },
    {
      accessorKey: "entry_date",
      header: "Date",
      cell: ({ row }) => <div>{row.getValue("entry_date")}</div>,
    },
    {
      accessorKey: "assigned_to.name",
      header: "Lead Owner",
      cell: ({ row }) => <div>{row.original.assigned_to?.name}</div>,
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
                  setLeadModel(row.original.status);
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

  React.useEffect(() => {
    const fetchLeads = async () => {
      try {
        const params = {
          stage: selectedStages,
          page,
          limit: pageSize,
          search: search,
        };
        const res = await getLeads(params);
        setTotal(res?.total || 0);
        setData(res.leads);
      } catch (err) {
        console.error("Error fetching leads:", err);
      }
    };

    fetchLeads();
  }, [selectedStages, page, pageSize, search]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  React.useEffect(() => {
    table.getColumn("name")?.setFilterValue(debouncedSearch);
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

const handleTransferLead = async () => {
  if (!selectedLeadId || !selectedUser) return;

  try {
    const payload = { assigned_to: selectedUser };
    await transferLead(selectedLeadId, leadModel, payload);
    toast.success("Lead transferred successfully");
    setOpen(false);
   setTimeout(() => {
  location.reload();
}, 300);

  } catch (error) {
    console.error(error);
    toast.error("Failed to transfer lead");
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

  return (
    <div className="w-full">
      <div className="flex flex-cols-2 justify-between">
        <Button
          variant="default"
          size="sm"
          onClick={() => (window.location.href = "/")}
          className="cursor-pointer"
        >
          <ChevronLeft />
        </Button>

        <Button variant="destructive" className="cursor-pointer">
          Export to CSV
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Filter name, LeadId, Mobile, State, Scheme, Lead Owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center px-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-4">
                Filter Status <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* Clear Filter Option */}
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStages("");
                  setSearchParams((prev) => {
                    const updated = new URLSearchParams(prev);
                    updated.delete("stage");
                    return updated;
                  });
                  table.getColumn("status")?.setFilterValue(undefined);
                }}
                className="flex items-center justify-between text-red-500"
              >
                Clear Filter
              </DropdownMenuItem>

              <DropdownMenuRadioGroup
                value={selectedStages}
                onValueChange={(value) => {
                  setSelectedStages(value);
                  setSearchParams({ stage: value });
                  table.getColumn("status")?.setFilterValue([value]);
                }}
              >
                {["initial", "followup", "warm", "won", "dead"].map(
                  (status) => (
                    <DropdownMenuRadioItem
                      key={status}
                      value={status}
                      className="flex items-center justify-between"
                    >
                      {status}
                      {selectedStages === status && (
                        <Check className="h-4 w-4" />
                      )}
                    </DropdownMenuRadioItem>
                  )
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 mx-4">
            <label htmlFor="limit">Rows per page:</label>
            <Input
              id="limit"
              type="number"
              min="1"
              value={pageSize}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="w-20"
            />
          </div>
        </div>
        <Button
          variant="default"
          className="cursor-pointer"
          onClick={() => {
            navigate("/addLead");
          }}
        >
          + Add Lead
        </Button>
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
      <div className="rounded-md border max-h-180 overflow-y-auto">
        <Table>
          <TableHeader>
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
                  className="cursor-pointer"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() =>
                    navigate(
                      `/leadProfile?id=${row.original._id}&status=${row.original.status}`
                    )
                  }
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
        setConfirmOpen(true); // assuming you're opening the AlertDialog here
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
            <AlertDialogAction onClick={handleTransferLead} className="cursor-pointer">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
