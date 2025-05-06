import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import FilterSection from "@/components/FilterSection";
import AppointmentTable from "@/components/AppointmentTable";
import AppointmentDetailsModal from "@/components/AppointmentDetailsModal";
import { AppointmentFilters, Appointment } from "@/types/appointment";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [filters, setFilters] = useState<AppointmentFilters>({});
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // We don't need filter options anymore since we only filter by phone number
  
  // Fetch appointments with filters
  const { 
    data: appointments = [], // Default to empty array if undefined
    isLoading, 
    isError, 
    error, 
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['/api/appointments', filters],
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Data is immediately stale
    cacheTime: 0, // Don't cache data
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: AppointmentFilters) => {
    setFilters(newFilters);
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Data refreshed",
        description: "Appointment data has been updated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle view details button click
  const handleViewDetails = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setSelectedAppointmentId(null);
  };

  const isLoaderShown = isLoading || isRefetching;
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Appointment Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Last updated: {format(new Date(), "PPp")}
            </span>
            <Button 
              onClick={handleRefresh} 
              disabled={isLoaderShown}
              className="flex items-center gap-2"
            >
              {isLoaderShown ? (
                <div className="loading-spinner w-4 h-4 mr-2" />
              ) : (
                <RefreshCcw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <FilterSection 
        onFilterChange={handleFilterChange} 
        filters={filters}
        isLoading={isLoading}
      />

      {/* Table */}
      {isLoading ? (
        <div className="bg-[hsl(var(--surface))] rounded-lg shadow-md p-4">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold">Appointments</h2>
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="overflow-x-auto">
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="loading-spinner mb-4" />
              <p className="text-muted-foreground">Loading appointment data...</p>
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="bg-[hsl(var(--surface))] rounded-lg shadow-md p-8 text-center">
          <p className="text-[hsl(var(--error))] mb-2">
            Error loading appointments
          </p>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      ) : (
        <AppointmentTable 
          appointments={Array.isArray(appointments) ? appointments : []}
          onViewDetails={handleViewDetails}
          isRefetching={isRefetching}
        />
      )}

      {/* Details Modal */}
      {selectedAppointmentId && (
        <AppointmentDetailsModal
          appointmentId={selectedAppointmentId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
