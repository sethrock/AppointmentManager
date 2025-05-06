import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, AlertCircle, Calendar, Clock, Ban, CheckSquare, FileX } from "lucide-react";
import { Appointment } from "@/types/appointment";
import { formatCurrency } from "@/lib/utils";

interface AppointmentTableProps {
  appointments: Appointment[];
  onViewDetails: (id: string) => void;
  isRefetching?: boolean;
}

type SortField = "id" | "clientName" | "startDate" | "grossRevenue" | "dueToProvider";
type SortDirection = "asc" | "desc";

export default function AppointmentTable({ 
  appointments, 
  onViewDetails,
  isRefetching = false
}: AppointmentTableProps) {
  const [, navigate] = useLocation();
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort appointments
  const sortedAppointments = [...appointments].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    switch (sortField) {
      case "id":
        valueA = a.id;
        valueB = b.id;
        break;
      case "clientName":
        valueA = a.clientName || "";
        valueB = b.clientName || "";
        break;
      case "startDate":
        valueA = a.startDate ? new Date(a.startDate) : new Date(0);
        valueB = b.startDate ? new Date(b.startDate) : new Date(0);
        break;
      case "grossRevenue":
        valueA = a.grossRevenue || 0;
        valueB = b.grossRevenue || 0;
        break;
      case "dueToProvider":
        valueA = a.dueToProvider || 0;
        valueB = b.dueToProvider || 0;
        break;
      default:
        return 0;
    }

    const comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const handleViewDetailsClick = (id: string) => {
    onViewDetails(id);
  };
  
  // Helper function to determine appointment status and return appropriate badge
  const getAppointmentStatusBadge = (appointment: Appointment) => {
    // Check for disposition status as the source of truth
    if (appointment.dispositionStatus) {
      if (appointment.dispositionStatus === 'Complete') {
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200">
            <CheckSquare className="h-3 w-3" />
            Completed
          </Badge>
        );
      }
      if (appointment.dispositionStatus === 'Canceled') {
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Ban className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      }
      if (appointment.dispositionStatus === 'Reschedule' || appointment.dispositionStatus === 'Rescheduled') {
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200">
            <Clock className="h-3 w-3" />
            Rescheduled
          </Badge>
        );
      }
    }
    
    // Default to scheduled
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        Scheduled
      </Badge>
    );
  };

  return (
    <div className="bg-[hsl(var(--surface))] rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold">Appointments</h2>
        <div className="flex items-center">
          {isRefetching ? (
            <div className="flex items-center">
              <div className="loading-spinner mr-2" />
              <span className="text-sm text-[hsl(var(--warning))]">
                <AlertCircle className="inline w-4 h-4 mr-1" /> Refreshing data...
              </span>
            </div>
          ) : (
            <span className="text-sm text-[hsl(var(--success))]">
              <CheckCircle className="inline w-4 h-4 mr-1" /> Connected to API
            </span>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[hsl(var(--surface2))]">
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:text-[hsl(var(--primary))]"
                onClick={() => handleSort("id")}
              >
                ID {sortField === "id" && (
                  <span className="text-[hsl(var(--primary))]">
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-[hsl(var(--primary))]"
                onClick={() => handleSort("clientName")}
              >
                Client Name {sortField === "clientName" && (
                  <span className="text-[hsl(var(--primary))]">
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </TableHead>
              <TableHead>Client Phone</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-[hsl(var(--primary))]"
                onClick={() => handleSort("startDate")}
              >
                Start Date {sortField === "startDate" && (
                  <span className="text-[hsl(var(--primary))]">
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-[hsl(var(--primary))]"
                onClick={() => handleSort("grossRevenue")}
              >
                Gross Revenue {sortField === "grossRevenue" && (
                  <span className="text-[hsl(var(--primary))]">
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </TableHead>
              <TableHead>Deposit</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-[hsl(var(--primary))]"
                onClick={() => handleSort("dueToProvider")}
              >
                DTP {sortField === "dueToProvider" && (
                  <span className="text-[hsl(var(--primary))]">
                    {sortDirection === "asc" ? " ↑" : " ↓"}
                  </span>
                )}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <p className="text-muted-foreground">No appointments found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try changing your filters or refreshing the data.</p>
                </TableCell>
              </TableRow>
            ) : (
              sortedAppointments.map((appointment) => (
                <TableRow 
                  key={appointment.id}
                  className="hover:bg-[hsl(var(--surface2))] transition-colors"
                >
                  <TableCell className="font-mono text-muted-foreground">
                    {appointment.id}
                  </TableCell>
                  <TableCell>
                    {getAppointmentStatusBadge(appointment)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {appointment.clientName}
                  </TableCell>
                  <TableCell className="font-mono">
                    {appointment.clientPhone}
                  </TableCell>
                  <TableCell>{appointment.startDate}</TableCell>
                  <TableCell>{appointment.startTime}</TableCell>
                  <TableCell>{appointment.duration}</TableCell>
                  <TableCell className="font-mono text-[hsl(var(--secondary))]">
                    {formatCurrency(appointment.grossRevenue || 0)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(appointment.depositAmount || 0)}
                  </TableCell>
                  <TableCell className="font-mono text-[hsl(var(--secondary))] font-medium">
                    {formatCurrency(appointment.dueToProvider || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="link"
                      className="text-[hsl(var(--primary))] hover:text-[hsl(var(--accent))] transition-colors px-0"
                      onClick={() => handleViewDetailsClick(appointment.id)}
                    >
                      <span className="flex items-center">
                        View Details
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{sortedAppointments.length}</span> of <span className="font-medium">{appointments.length}</span> appointments
        </div>
        {/* Pagination will be added here if needed */}
      </div>
    </div>
  );
}
